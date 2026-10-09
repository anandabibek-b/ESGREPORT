import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one digit')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  companyName: z.string().min(1, 'Company name is required').max(255),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().min(1, 'Email or Phone Number is required'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Company onboarding schemas
export const companyInfoSchema = z.object({
  legalName: z.string().min(1, 'Legal name is required'),
  tradeName: z.string().optional(),
  cin: z.string().optional(),
  pan: z.string().optional(),
  registeredAddress: z.string().optional(),
  corporateWebsite: z.string().url().optional().or(z.literal('')),
  industry: z.string().optional(),
  sector: z.string().optional(),
  companyType: z.string().optional(),
  listedStatus: z.enum(['listed', 'unlisted']).optional(),
  stockExchanges: z.string().optional(),
  marketCapCategory: z.enum(['large', 'mid', 'small']).optional().nullable(),
  financialYearStart: z.number().min(1).max(12).optional(),
  reportingCurrency: z.string().default('INR'),
});

export const orgUnitSchema = z.object({
  companyId: z.string().uuid(),
  parentId: z.string().uuid().optional().nullable(),
  typeId: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  code: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default('India'),
  pincode: z.string().optional(),
  metadata: z.any().optional(),
});

export const reportingPeriodSchema = z.object({
  companyId: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  startDate: z.string().datetime().or(z.string()),
  endDate: z.string().datetime().or(z.string()),
  frameworkVersionId: z.string().uuid().optional(),
  brsr: z.boolean().default(true),
  brsrCore: z.boolean().default(false),
  valueChain: z.boolean().default(false),
  assuranceTracking: z.boolean().default(false),
  voluntaryDisclosures: z.boolean().default(false),
  deadline: z.string().datetime().optional().nullable(),
});

export const submissionSchema = z.object({
  reportingPeriodId: z.string().uuid(),
  orgUnitId: z.string().uuid(),
  category: z.enum(['environmental', 'social', 'governance', 'general']),
  sectionCode: z.string().optional(),
  principleCode: z.string().optional(),
  indicatorCode: z.string().optional(),
  notes: z.string().optional(),
});

export const metricValueSchema = z.object({
  submissionId: z.string().uuid(),
  questionId: z.string().uuid().optional(),
  metricId: z.string().uuid().optional(),
  numericValue: z.number().optional().nullable(),
  textValue: z.string().optional().nullable(),
  booleanValue: z.boolean().optional().nullable(),
  dateValue: z.string().optional().nullable(),
  jsonValue: z.any().optional().nullable(),
  unit: z.string().optional(),
  notes: z.string().optional(),
  isEstimated: z.boolean().default(false),
  dataSource: z.string().optional(),
});

export const reviewSchema = z.object({
  submissionId: z.string().uuid(),
  status: z.enum(['approved', 'changes_requested', 'rejected']),
  comments: z.string().optional(),
});

export const valueChainPartnerSchema = z.object({
  companyId: z.string().uuid(),
  name: z.string().min(1, 'Partner name is required'),
  type: z.enum(['upstream', 'downstream']),
  category: z.string().optional(),
  relationship: z.string().optional(),
  purchaseValue: z.number().optional(),
  salesValue: z.number().optional(),
  purchasePercentage: z.number().min(0).max(100).optional(),
  salesPercentage: z.number().min(0).max(100).optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
});
