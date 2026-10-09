import path from 'path';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Guarantee robust absolute path resolution for SQLite regardless of CWD or test runner
const dbPath = path.resolve(__dirname, '../../../database/prisma/dev.db');
const dbUrl = `file:${dbPath.replace(/\\/g, '/')}`;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL?.startsWith('postgresql')
          ? process.env.DATABASE_URL
          : dbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
