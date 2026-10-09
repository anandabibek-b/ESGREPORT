const bcrypt = require('C:/ESG Bibek 2/backend/node_modules/bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: 'file:C:/ESG Bibek 2/database/prisma/dev.db' } } });

async function main() {
  const hash = await bcrypt.hash('Owner@12345', 10);
  await prisma.user.updateMany({
    where: { email: 'ravi@meil.in' },
    data: { passwordHash: hash, phone: '+91 98765 43210' }
  });
  console.log('Restored ravi@meil.in password to Owner@12345 and phone to +91 98765 43210');
  await prisma.$disconnect();
}
main().catch(console.error);
