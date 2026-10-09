import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { config } from './config';
import logger from './config/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Route imports
import authRoutes from './routes/auth';
import companyRoutes from './routes/company';
import organizationRoutes from './routes/organizations';
import reportingPeriodRoutes from './routes/reportingPeriods';
import frameworkRoutes from './routes/frameworks';
import submissionRoutes from './routes/submissions';
import dashboardRoutes from './routes/dashboard';
import auditLogRoutes from './routes/auditLogs';
import evidenceRoutes from './routes/evidence';
import validationRoutes from './routes/validations';
import calculationRoutes from './routes/calculations';
import reportRoutes from './routes/reports';
import lineageRoutes from './routes/lineage';
import comparisonRoutes from './routes/comparisons';
import notificationRoutes from './routes/notifications';
import commentRoutes from './routes/comments';
import searchRoutes from './routes/search';
import aiRoutes from './routes/ai';
import userRoutes from './routes/users';
import workflowRoutes from './routes/workflow';
import publicRoutes from './routes/public';

const app = express();

// Security & Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static uploads directory
app.use('/uploads', express.static(path.resolve(process.cwd(), config.upload.dir || './uploads')));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ESG BRSR Reporting Platform API',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/reporting-periods', reportingPeriodRoutes);
app.use('/api/frameworks', frameworkRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/validations', validationRoutes);
app.use('/api/calculations', calculationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/lineage', lineageRoutes);
app.use('/api/comparisons', comparisonRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workflow', workflowRoutes);
app.use('/api/public', publicRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    logger.info(`🚀 ESG BRSR Backend API running on http://localhost:${config.port}`);
    logger.info(`📋 Environment: ${config.nodeEnv}`);
  });
}

export default app;
