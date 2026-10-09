import dotenv from 'dotenv';
import path from 'path';

// Robust dotenv resolution from current or parent directories
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-me',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-me',
    expiry: process.env.JWT_EXPIRY || '24h',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '30d',
  },

  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/esg_brsr_platform',
  },

  upload: {
    dir: process.env.UPLOAD_DIR || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
    allowedTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg', 'image/jpg'],
  },

  logging: {
    level: process.env.LOG_LEVEL || 'debug',
  },

  ai: {
    openaiApiKey: process.env.OPENAI_API_KEY || '',
  },
};
