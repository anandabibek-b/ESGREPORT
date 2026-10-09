import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { authenticate } from '../middleware/auth';
import { tenantResolver } from '../middleware/tenant';
import prisma from '../config/database';
import logger from '../config/logger';

const router = Router();
router.use(authenticate, tenantResolver);
router.use((req: any, res: any, next: any) => {
  if (req.user?.roles?.some((r: string) => r.toUpperCase() === 'PROJECT_MANAGER')) {
    res.status(403).json({ success: false, error: 'You do not have permission to access user administration.' });
    return;
  }
  next();
});

/**
 * List all users in tenant
 */
router.get('/', async (req: any, res) => {
  try {
    const tenantId = req.user!.tenantId;

    const users = await prisma.user.findMany({
      where: { tenantId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        designation: true,
        department: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
        userRoles: {
          include: {
            role: { select: { id: true, name: true, displayName: true } },
            orgUnit: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: users });
  } catch (error: any) {
    logger.error('Get users error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch users.' });
  }
});

/**
 * Get all available roles
 */
router.get('/roles', async (req: any, res) => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        rolePermissions: {
          include: { permission: true },
        },
      },
      orderBy: { level: 'asc' },
    });

    res.json({ success: true, data: roles });
  } catch (error: any) {
    logger.error('Get roles error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch roles.' });
  }
});

/**
 * Create a new user in tenant
 */
router.post('/', async (req: any, res) => {
  try {
    const { email, password, firstName, lastName, designation, department, roleName, orgUnitId } = req.body;

    if (!email || !password || !firstName || !lastName) {
      res.status(400).json({ success: false, error: 'Email, password, firstName and lastName are required.' });
      return;
    }

    const existing = await prisma.user.findFirst({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      res.status(400).json({ success: false, error: 'User with this email already exists.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        tenantId: req.user!.tenantId,
        email: email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        designation: designation || null,
        department: department || null,
        status: 'active',
        emailVerified: true,
      },
    });

    // Assign role if specified
    if (roleName) {
      const role = await prisma.role.findFirst({ where: { name: roleName } });
      if (role) {
        await prisma.userRole.create({
          data: {
            userId: user.id,
            roleId: role.id,
            orgUnitId: orgUnitId || null,
          },
        });
      }
    }

    await prisma.auditLog.create({
      data: {
        tenantId: req.user!.tenantId,
        userId: req.user!.userId,
        action: 'create',
        entityType: 'user',
        entityId: user.id,
        newValue: JSON.stringify({ email, roleName }),
      },
    });

    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        designation: user.designation,
      },
    });
  } catch (error: any) {
    logger.error('Create user error:', error);
    res.status(500).json({ success: false, error: 'Failed to create user.' });
  }
});

export default router;
