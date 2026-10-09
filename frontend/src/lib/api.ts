/**
 * ESG BRSR Platform API Client
 * Connects to Next.js API rewrites (/api/...) targeting backend Express service
 */

const API_BASE = '/api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  designation?: string;
  department?: string;
  role: string;
  roles?: string[];
  tenantId: string;
  assignedOrgUnit?: {
    id: string;
    name: string;
    code?: string;
  } | null;
  userRoles?: any[];
}

// Storage helpers
export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('esg_token');
};

export const setStoredToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('esg_token', token);
  }
};

export const removeStoredToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('esg_token');
  }
};

export const getStoredRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('esg_refresh_token');
};

export const setStoredRefreshToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('esg_refresh_token', token);
  }
};

export const removeStoredRefreshToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('esg_refresh_token');
  }
};

let refreshPromise: Promise<string | null> | null = null;

async function executeTokenRefresh(): Promise<string | null> {
  const refreshToken = getStoredRefreshToken();
  if (refreshToken) {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data?.accessToken) {
          setStoredToken(data.data.accessToken);
          if (data.data.refreshToken) {
            setStoredRefreshToken(data.data.refreshToken);
          }
          return data.data.accessToken;
        }
      }
    } catch (e) {
      console.warn('Failed to refresh token via refresh endpoint:', e);
    }
  }

  return null;
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}, retryCount = 0): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ error: 'Network request failed' }));
    const errorMessage = typeof errorBody.error === 'string' ? errorBody.error : '';

    const isExpiredToken =
      response.status === 401 ||
      errorMessage.toLowerCase().includes('token expired') ||
      errorMessage.toLowerCase().includes('jwt expired') ||
      errorMessage.toLowerCase().includes('authentication required');

    // Auto-refresh token and retry transparently (if not calling auth endpoints)
    if (isExpiredToken && retryCount === 0 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
      if (!refreshPromise) {
        refreshPromise = executeTokenRefresh().finally(() => {
          refreshPromise = null;
        });
      }

      const newToken = await refreshPromise;
      if (newToken) {
        return apiRequest<T>(endpoint, options, retryCount + 1);
      }
    }

    throw new Error(errorMessage || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    return apiRequest<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  getCurrentUser: async () => {
    return apiRequest<any>('/auth/me');
  },

  // Company & Org Units
  getCompany: async () => {
    return apiRequest<any>('/company');
  },

  getOrgUnits: async () => {
    return apiRequest<any>('/organizations');
  },

  // Reporting Periods
  getReportingPeriods: async () => {
    return apiRequest<any>('/reporting-periods');
  },

  // Frameworks & Questions
  getFrameworks: async () => {
    return apiRequest<any>('/frameworks');
  },

  getQuestions: async (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiRequest<any>(`/frameworks/questions${query}`);
  },

  getMetrics: async () => {
    return apiRequest<any>('/frameworks/metrics');
  },

  getBrsrCore: async (periodId?: string) => {
    const query = periodId ? `?reportingPeriodId=${periodId}` : '';
    return apiRequest<any>(`/frameworks/brsr-core${query}`);
  },

  // Submissions & Data Entry
  getSubmissions: async (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiRequest<any>(`/submissions${query}`);
  },

  getSubmission: async (id: string) => {
    return apiRequest<any>(`/submissions/${id}`);
  },

  saveMetricValues: async (submissionId: string, values: any[]) => {
    return apiRequest<any>(`/submissions/${submissionId}/values`, {
      method: 'PUT',
      body: JSON.stringify({ values }),
    });
  },

  submitForReview: async (submissionId: string, comment?: string) => {
    return apiRequest<any>(`/submissions/${submissionId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    });
  },

  reviewSubmission: async (submissionId: string, status: 'approved' | 'changes_requested' | 'rejected', comments?: string) => {
    return apiRequest<any>(`/submissions/${submissionId}/review`, {
      method: 'POST',
      body: JSON.stringify({ status, comments }),
    });
  },

  approveSubmission: async (submissionId: string, comments?: string) => {
    return apiRequest<any>(`/submissions/${submissionId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ comments }),
    });
  },

  // Validation
  runValidation: async (submissionId: string) => {
    return apiRequest<any>(`/validations/run/${submissionId}`, { method: 'POST' });
  },

  getValidations: async (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiRequest<any>(`/validations${query}`);
  },

  resolveValidation: async (resultId: string, resolutionNotes: string) => {
    return apiRequest<any>(`/validations/resolve/${resultId}`, {
      method: 'POST',
      body: JSON.stringify({ resolutionNotes }),
    });
  },

  // Calculations
  getCalculations: async () => {
    return apiRequest<any>('/calculations');
  },

  calculateScope1: async (data: { fuelLitres: number; emissionFactor?: number; fuelType?: string }) => {
    return apiRequest<any>('/calculations/scope1', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  calculateScope2: async (data: { electricityMWh: number; gridFactor?: number }) => {
    return apiRequest<any>('/calculations/scope2', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  calculateRenewableShare: async (data: { renewableMWh: number; nonRenewableMWh: number }) => {
    return apiRequest<any>('/calculations/renewable-share', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  calculateLTIFR: async (data: { lostTimeInjuries: number; totalPersonHours: number }) => {
    return apiRequest<any>('/calculations/ltifr', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Evidence
  getEvidence: async (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiRequest<any>(`/evidence${query}`);
  },

  uploadEvidence: async (formData: FormData) => {
    const token = getStoredToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE}/evidence/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(errorBody.error || 'Failed to upload evidence');
    }
    return response.json();
  },

  // Reports & Exports
  getReports: async () => {
    return apiRequest<any>('/reports');
  },

  generatePDF: async (reportingPeriodId: string) => {
    return apiRequest<any>('/reports/generate/pdf', {
      method: 'POST',
      body: JSON.stringify({ reportingPeriodId }),
    });
  },

  generateExcel: async (reportingPeriodId: string) => {
    return apiRequest<any>('/reports/generate/excel', {
      method: 'POST',
      body: JSON.stringify({ reportingPeriodId }),
    });
  },

  generateJSON: async (reportingPeriodId: string) => {
    return apiRequest<any>(`/reports/generate/json?reportingPeriodId=${reportingPeriodId}`);
  },

  // Lineage
  getLineageList: async () => {
    return apiRequest<any>('/lineage');
  },

  getLineage: async (metricValueId: string) => {
    return apiRequest<any>(`/lineage/${metricValueId}`);
  },

  // Period Comparison
  comparePeriods: async (currId?: string, prevId?: string) => {
    const params = new URLSearchParams();
    if (currId) params.append('currentPeriodId', currId);
    if (prevId) params.append('previousPeriodId', prevId);
    return apiRequest<any>(`/comparisons?${params.toString()}`);
  },

  // Notifications
  getNotifications: async (status = 'all') => {
    return apiRequest<any>(`/notifications?status=${status}`);
  },

  markNotificationRead: async (id: string) => {
    return apiRequest<any>(`/notifications/${id}/read`, { method: 'PUT' });
  },

  markAllNotificationsRead: async () => {
    return apiRequest<any>('/notifications/read-all', { method: 'PUT' });
  },

  // Comments
  getComments: async (submissionId: string) => {
    return apiRequest<any>(`/comments?submissionId=${submissionId}`);
  },

  createComment: async (submissionId: string, text: string, type = 'comment') => {
    return apiRequest<any>('/comments', {
      method: 'POST',
      body: JSON.stringify({ submissionId, text, type }),
    });
  },

  // Global Search
  search: async (q: string) => {
    return apiRequest<any>(`/search?q=${encodeURIComponent(q)}`);
  },

  // AI Assistant
  queryAI: async (query: string) => {
    return apiRequest<any>('/ai/query', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  },

  // Users & Roles
  getUsers: async () => {
    return apiRequest<any>('/users');
  },

  getRoles: async () => {
    return apiRequest<any>('/users/roles');
  },

  // Audit Logs
  getAuditLogs: async (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiRequest<any>(`/audit-logs${query}`);
  },

  // Executive Dashboard
  getExecutiveDashboard: async (periodId?: string) => {
    const query = periodId ? `?reportingPeriodId=${periodId}` : '';
    return apiRequest<any>(`/dashboard/executive${query}`);
  },

  // Password Reset & Phone Connect
  requestPasswordReset: async (identifier: string, method: 'phone' | 'email' = 'phone', phoneToConnect?: string) => {
    return apiRequest<any>('/auth/forgot-password/request', {
      method: 'POST',
      body: JSON.stringify({ identifier, method, phoneToConnect }),
    });
  },

  verifyResetOtp: async (identifier: string, otpCode: string) => {
    return apiRequest<any>('/auth/forgot-password/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ identifier, otpCode }),
    });
  },

  resetPassword: async (payload: { identifier: string; otpCode: string; newPassword: string; phoneToConnect?: string }) => {
    return apiRequest<any>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  connectPhone: async (phone: string) => {
    return apiRequest<any>('/auth/connect-phone', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  },

  // Public ESG Transparency Portal (No Auth Required)
  getPublicSummary: async () => {
    return apiRequest<any>('/public/summary');
  },

  getPublicPrinciples: async () => {
    return apiRequest<any>('/public/principles');
  },

  getPublicReports: async () => {
    return apiRequest<any>('/public/reports');
  },

  submitCitizenGrievance: async (data: {
    name: string;
    email: string;
    phone?: string;
    stakeholderType?: string;
    category?: string;
    subject: string;
    message: string;
  }) => {
    return apiRequest<any>('/public/grievance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getPublicGrievance: async (trackingId: string) => {
    return apiRequest<any>(`/public/grievance/${encodeURIComponent(trackingId)}`);
  },

  getPublicFaq: async () => {
    return apiRequest<any>('/public/faq');
  },
};
