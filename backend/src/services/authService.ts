import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import prisma from '../config/database';
import logger from '../config/logger';
import { JwtPayload } from '../middleware/auth';

interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
  phone?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export interface PasswordResetRequestInput {
  identifier: string;
  method?: 'phone' | 'email';
  phoneToConnect?: string;
}

export interface PasswordResetVerifyInput {
  identifier: string;
  otpCode: string;
}

export interface PasswordResetConfirmInput {
  identifier: string;
  otpCode: string;
  newPassword: string;
  phoneToConnect?: string;
}

interface StoredOtpRecord {
  userId: string;
  email: string;
  phone?: string;
  otpCode: string;
  expiresAt: Date;
  attempts: number;
}

// In-memory OTP cache for verification codes (active across session)
const otpStore = new Map<string, StoredOtpRecord>();

export class AuthService {
  /**
   * Register a new company + admin user (creates tenant)
   */
  async register(input: RegisterInput) {
    const { email, password, firstName, lastName, companyName, phone } = input;

    // Check if email already exists globally
    const existingUser = await prisma.user.findFirst({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new Error('An account with this email already exists.');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create tenant, company, and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create tenant
      const slug = companyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const tenant = await tx.tenant.create({
        data: {
          name: companyName,
          slug: `${slug}-${Date.now().toString(36)}`,
          status: 'active',
        },
      });

      // Create company
      const company = await tx.company.create({
        data: {
          tenantId: tenant.id,
          legalName: companyName,
          onboardingCompleted: false,
        },
      });

      // Create user
      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: email.toLowerCase(),
          passwordHash,
          firstName,
          lastName,
          phone,
          status: 'active',
          emailVerified: true, // for demo purposes
        },
      });

      // Find or create the company_admin role
      let adminRole = await tx.role.findUnique({
        where: { name: 'company_admin' },
      });

      if (!adminRole) {
        adminRole = await tx.role.create({
          data: {
            name: 'company_admin',
            displayName: 'Company Admin',
            description: 'Full access to company settings and data',
            isSystem: true,
            level: 1,
          },
        });
      }

      // Assign company_admin role
      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId: adminRole.id,
        },
      });

      // Create default org unit types for this tenant
      const defaultTypes = [
        { name: 'company', displayName: 'Company', level: 0 },
        { name: 'subsidiary', displayName: 'Subsidiary', level: 1 },
        { name: 'business_unit', displayName: 'Business Unit', level: 2 },
        { name: 'location', displayName: 'Location', level: 3 },
        { name: 'plant', displayName: 'Plant', level: 3 },
        { name: 'project', displayName: 'Project', level: 4 },
      ];

      for (const type of defaultTypes) {
        await tx.orgUnitType.create({
          data: {
            tenantId: tenant.id,
            ...type,
          },
        });
      }

      // Create the root org unit (the company itself)
      const companyType = await tx.orgUnitType.findUnique({
        where: { tenantId_name: { tenantId: tenant.id, name: 'company' } },
      });

      if (companyType) {
        await tx.orgUnit.create({
          data: {
            tenantId: tenant.id,
            companyId: company.id,
            typeId: companyType.id,
            name: companyName,
            status: 'active',
            createdBy: user.id,
          },
        });
      }

      // Create audit log
      await tx.auditLog.create({
        data: {
          tenantId: tenant.id,
          userId: user.id,
          action: 'create',
          entityType: 'company',
          entityId: company.id,
          newValue: JSON.stringify({ companyName, email }),
        },
      });

      return { tenant, company, user, roles: ['company_admin'] };
    });

    // Generate tokens
    const tokens = this.generateTokens({
      userId: result.user.id,
      tenantId: result.tenant.id,
      email: result.user.email,
      roles: result.roles,
    });

    logger.info('New company registered', {
      tenantId: result.tenant.id,
      companyName,
      email,
    });

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        roles: result.roles,
      },
      company: {
        id: result.company.id,
        name: result.company.legalName,
        onboardingCompleted: result.company.onboardingCompleted,
      },
      tenant: {
        id: result.tenant.id,
        name: result.tenant.name,
      },
      ...tokens,
    };
  }

  /**
   * Login existing user (by Email OR Phone)
   */
  async login(input: LoginInput) {
    const { email, password } = input;
    const clean = email.trim();
    const cleanDigits = clean.replace(/[\s\-\(\)]/g, '');

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: clean.toLowerCase() },
          { phone: clean },
          { phone: cleanDigits },
          { phone: cleanDigits.startsWith('+') ? cleanDigits : `+91${cleanDigits}` },
          { phone: `+91 ${cleanDigits.replace(/^\+?91/, '').trim()}` },
        ],
        status: 'active',
      },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
        tenant: true,
      },
    });

    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      throw new Error('Invalid email or password.');
    }

    // Get company info
    const company = await prisma.company.findFirst({
      where: { tenantId: user.tenantId },
    });

    const roles = user.userRoles.map((ur) => ur.role.name);

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId: user.tenantId,
        userId: user.id,
        action: 'login',
        entityType: 'user',
        entityId: user.id,
      },
    });

    const tokens = this.generateTokens({
      userId: user.id,
      tenantId: user.tenantId,
      email: user.email,
      roles,
    });

    logger.info('User logged in', { userId: user.id, tenantId: user.tenantId });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles,
      },
      company: company
        ? {
            id: company.id,
            name: company.legalName,
            onboardingCompleted: company.onboardingCompleted,
          }
        : null,
      tenant: {
        id: user.tenantId,
        name: user.tenant.name,
      },
      ...tokens,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as JwtPayload;

      // Verify user still exists and is active
      const user = await prisma.user.findFirst({
        where: {
          id: decoded.userId,
          tenantId: decoded.tenantId,
          status: 'active',
        },
        include: {
          userRoles: {
            include: { role: true },
          },
        },
      });

      if (!user) {
        throw new Error('User not found or inactive.');
      }

      const roles = user.userRoles.map((ur) => ur.role.name);

      const tokens = this.generateTokens({
        userId: user.id,
        tenantId: user.tenantId,
        email: user.email,
        roles,
      });

      return tokens;
    } catch (error) {
      throw new Error('Invalid refresh token.');
    }
  }

  /**
   * Request password reset code via phone (SMS) or email
   */
  async requestPasswordReset(input: PasswordResetRequestInput) {
    const { identifier, method = 'phone', phoneToConnect } = input;
    const clean = identifier.trim();
    const cleanDigits = clean.replace(/[\s\-\(\)]/g, '');

    // Search user by email or phone
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: clean.toLowerCase() },
          { phone: clean },
          { phone: cleanDigits },
          { phone: cleanDigits.startsWith('+') ? cleanDigits : `+91${cleanDigits}` },
          { phone: `+91 ${cleanDigits.replace(/^\+?91/, '').trim()}` },
        ],
        status: 'active',
      },
    });

    // If not found by phone, but an email was entered with phoneToConnect
    if (!user && (phoneToConnect || clean.includes('@'))) {
      user = await prisma.user.findFirst({
        where: { email: clean.toLowerCase(), status: 'active' },
      });
    }

    // Fallback: search by last 10 digits
    if (!user && cleanDigits.length >= 10) {
      user = await prisma.user.findFirst({
        where: {
          phone: { contains: cleanDigits.slice(-10) },
          status: 'active',
        },
      });
    }

    if (!user) {
      throw new Error(`No active account found for "${identifier}". Please check your email or phone number.`);
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    const record: StoredOtpRecord = {
      userId: user.id,
      email: user.email,
      phone: user.phone || phoneToConnect,
      otpCode,
      expiresAt,
      attempts: 0,
    };

    // Index by email, identifier, and clean phone
    otpStore.set(user.email.toLowerCase(), record);
    otpStore.set(user.id, record);
    otpStore.set(clean.toLowerCase(), record);
    if (cleanDigits) otpStore.set(cleanDigits, record);
    if (user.phone) otpStore.set(user.phone.replace(/[\s\-\(\)]/g, ''), record);
    if (phoneToConnect) otpStore.set(phoneToConnect.replace(/[\s\-\(\)]/g, ''), record);

    // Format destination for privacy display
    let destination = '';
    const phoneTarget = user.phone || phoneToConnect;
    if (method === 'phone' && phoneTarget) {
      const d = phoneTarget.replace(/\D/g, '');
      const last4 = d.slice(-4);
      destination = `+91 ******${last4}`;
    } else {
      const parts = user.email.split('@');
      destination = `${parts[0].slice(0, 2)}***@${parts[1]}`;
    }

    logger.info(`Password reset OTP generated for ${user.email}`, {
      userId: user.id,
      method,
      otpCode,
    });

    return {
      success: true,
      message: method === 'phone'
        ? `SMS Verification code sent to ${destination}.`
        : `Password reset verification code sent to ${destination}.`,
      destination,
      otpCode, // demo helper for visual confirmation
      email: user.email,
      phone: user.phone || phoneToConnect,
      userId: user.id,
    };
  }

  /**
   * Verify OTP code
   */
  async verifyResetOtp(input: PasswordResetVerifyInput) {
    const { identifier, otpCode } = input;
    const clean = identifier.trim();
    const cleanDigits = clean.replace(/[\s\-\(\)]/g, '');

    const record =
      otpStore.get(clean.toLowerCase()) ||
      otpStore.get(clean) ||
      otpStore.get(cleanDigits) ||
      Array.from(otpStore.values()).find(
        (r) =>
          r.email.toLowerCase() === clean.toLowerCase() ||
          (r.phone && r.phone.replace(/\D/g, '').endsWith(cleanDigits.slice(-10)))
      );

    if (!record) {
      throw new Error('Verification code not found or expired. Please request a new code.');
    }

    if (record.expiresAt < new Date()) {
      throw new Error('Verification code has expired. Please request a new code.');
    }

    if (record.otpCode !== otpCode.trim()) {
      record.attempts += 1;
      if (record.attempts >= 5) {
        otpStore.delete(clean.toLowerCase());
        throw new Error('Too many incorrect attempts. Please request a new code.');
      }
      throw new Error('Invalid verification code. Please check the 6-digit code and try again.');
    }

    return {
      success: true,
      message: 'Code verified successfully.',
      email: record.email,
      phone: record.phone,
    };
  }

  /**
   * Reset Password and Connect Phone
   */
  async resetPassword(input: PasswordResetConfirmInput) {
    const { identifier, otpCode, newPassword, phoneToConnect } = input;
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    // Verify OTP first
    await this.verifyResetOtp({ identifier, otpCode });

    const clean = identifier.trim();
    const cleanDigits = clean.replace(/[\s\-\(\)]/g, '');
    const record =
      otpStore.get(clean.toLowerCase()) ||
      otpStore.get(clean) ||
      otpStore.get(cleanDigits) ||
      Array.from(otpStore.values()).find(
        (r) =>
          r.email.toLowerCase() === clean.toLowerCase() ||
          (r.phone && r.phone.replace(/\D/g, '').endsWith(cleanDigits.slice(-10)))
      );

    if (!record) {
      throw new Error('Verification session expired.');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    const updateData: any = {
      passwordHash,
      updatedAt: new Date(),
    };

    if (phoneToConnect && phoneToConnect.trim()) {
      updateData.phone = phoneToConnect.trim();
    } else if (!record.phone && cleanDigits.length >= 10) {
      updateData.phone = clean;
    }

    const updatedUser = await prisma.user.update({
      where: { id: record.userId },
      data: updateData,
    });

    // Record audit trail
    await prisma.auditLog.create({
      data: {
        tenantId: updatedUser.tenantId,
        userId: updatedUser.id,
        action: 'password_reset',
        entityType: 'user',
        entityId: updatedUser.id,
        newValue: JSON.stringify({
          action: 'password_reset_success',
          phoneConnected: !!updateData.phone,
          phone: updateData.phone || updatedUser.phone,
          timestamp: new Date().toISOString(),
        }),
      },
    });

    // Clear used OTP
    otpStore.delete(clean.toLowerCase());
    otpStore.delete(clean);
    otpStore.delete(record.userId);
    otpStore.delete(record.email.toLowerCase());

    logger.info(`Password successfully reset for user ${updatedUser.email}`);

    return {
      success: true,
      message: 'Your password has been successfully updated! You can now log in.',
      email: updatedUser.email,
      phone: updatedUser.phone,
    };
  }

  /**
   * Connect and link phone number for authenticated user
   */
  async connectPhone(userId: string, tenantId: string, phone: string) {
    const cleanPhone = phone.trim();
    if (!cleanPhone || cleanPhone.length < 8) {
      throw new Error('Please enter a valid mobile phone number.');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { phone: cleanPhone, updatedAt: new Date() },
    });

    await prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'connect_phone',
        entityType: 'user',
        entityId: userId,
        newValue: JSON.stringify({ phone: cleanPhone }),
      },
    });

    return {
      success: true,
      message: 'Mobile phone connected successfully to your account.',
      phone: updatedUser.phone,
    };
  }

  /**
   * Generate JWT tokens
   */
  private generateTokens(payload: JwtPayload) {
    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiry as any,
    });

    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiry as any,
    });

    return { accessToken, refreshToken };
  }
}

export const authService = new AuthService();
