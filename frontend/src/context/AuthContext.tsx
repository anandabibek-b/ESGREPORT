'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  api,
  setStoredToken,
  getStoredToken,
  removeStoredToken,
  setStoredRefreshToken,
  removeStoredRefreshToken,
  User,
} from '../lib/api';

export type UserRoleType = 'PROJECT_MANAGER' | 'ESG_TEAM' | string;

interface AuthContextType {
  user: User | null;
  token: string | null;
  activeRole: UserRoleType;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<User>;
  logout: () => void;
  switchRole: (role: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  activeRole: '',
  isLoading: true,
  login: async () => { throw new Error('Not implemented'); },
  logout: () => {},
  switchRole: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activeRole, setActiveRole] = useState<UserRoleType>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize session from stored token
  useEffect(() => {
    async function initAuth() {
      try {
        const stored = getStoredToken();
        if (stored) {
          setToken(stored);
          try {
            const me = await api.getCurrentUser();
            if (me.success && me.data) {
              const primaryRole =
                me.data.userRoles?.[0]?.role?.name ||
                (Array.isArray(me.data.roles) && me.data.roles[0]?.name) ||
                (Array.isArray(me.data.roles) && typeof me.data.roles[0] === 'string' && me.data.roles[0]) ||
                'PROJECT_MANAGER';

              const assignedOrg =
                me.data.userRoles?.find((ur: any) => ur.orgUnit)?.orgUnit ||
                me.data.userRoles?.find((ur: any) => ur.orgUnitId)?.orgUnit ||
                null;

              const userData: User = {
                id: me.data.id,
                email: me.data.email,
                firstName: me.data.firstName,
                lastName: me.data.lastName,
                designation: me.data.designation,
                department: me.data.department,
                role: primaryRole,
                roles: me.data.userRoles?.map((ur: any) => ur.role?.name || ur.role) || [primaryRole],
                tenantId: me.data.tenant?.id || me.data.tenantId || '',
                assignedOrgUnit: assignedOrg,
                userRoles: me.data.userRoles,
              };

              setUser(userData);
              setActiveRole(primaryRole);
              setIsLoading(false);
              return;
            }
          } catch (err) {
            console.warn('Session verification failed, clearing tokens:', err);
            removeStoredToken();
            removeStoredRefreshToken();
            setToken(null);
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Error during initAuth:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (email: string, password: string, rememberMe = true): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.login(email.trim().toLowerCase(), password);
      if (res.success && res.data) {
        const receivedToken = res.data.accessToken;
        setToken(receivedToken);
        setStoredToken(receivedToken);

        if (res.data.refreshToken) {
          setStoredRefreshToken(res.data.refreshToken);
        }

        if (typeof window !== 'undefined') {
          if (rememberMe) {
            localStorage.setItem('esg_remember_email', email.trim().toLowerCase());
          } else {
            localStorage.removeItem('esg_remember_email');
          }
        }

        const rawRoles = res.data.user.roles || [];
        const primaryRole: string =
          rawRoles.find((r: string) => r.toUpperCase() === 'PROJECT_MANAGER') ||
          rawRoles.find((r: string) => r.toUpperCase() === 'ESG_TEAM') ||
          rawRoles[0] ||
          'PROJECT_MANAGER';

        const assignedOrg = res.data.user.assignedOrgUnit || null;

        const authenticatedUser: User = {
          id: res.data.user.id,
          email: res.data.user.email,
          firstName: res.data.user.firstName,
          lastName: res.data.user.lastName,
          designation: res.data.user.designation,
          department: res.data.user.department,
          role: primaryRole,
          roles: rawRoles,
          tenantId: res.data.tenant?.id || res.data.tenantId || '',
          assignedOrgUnit: assignedOrg,
        };

        setUser(authenticatedUser);
        setActiveRole(primaryRole);
        return authenticatedUser;
      } else {
        throw new Error(res.error || 'Invalid email or password.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      // Clean enterprise error message
      const msg = err.message || '';
      if (msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('failed') || msg.toLowerCase().includes('401')) {
        throw new Error('Invalid email or password.');
      }
      throw new Error(msg || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    removeStoredToken();
    removeStoredRefreshToken();
    setToken(null);
    setUser(null);
    setActiveRole('');

    if (typeof window !== 'undefined') {
      // Clear session navigation state
      sessionStorage.removeItem('esg_last_tab');
      // Direct redirect to login page
      window.location.href = '/login';
    }
  };

  const switchRole = async (targetRole: string) => {
    const creds: Record<string, { email: string; pass: string }> = {
      PROJECT_MANAGER: { email: 'project.manager@meil.demo', pass: 'Project@123' },
      ESG_TEAM: { email: 'esg.team@meil.demo', pass: 'ESG@123' },
      company_admin: { email: 'admin@meil.in', pass: 'Admin@12345' },
      esg_manager: { email: 'esg.manager@meil.in', pass: 'Manager@12345' },
      data_owner: { email: 'project.manager@meil.demo', pass: 'Project@123' },
      reviewer: { email: 'reviewer@meil.in', pass: 'Reviewer@12345' },
      approver: { email: 'approver@meil.in', pass: 'Approver@12345' },
      auditor: { email: 'auditor@meil.in', pass: 'Auditor@12345' },
    };
    const c = creds[targetRole] || creds[targetRole.toUpperCase()];
    if (c) {
      await login(c.email, c.pass);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        activeRole,
        isLoading,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
