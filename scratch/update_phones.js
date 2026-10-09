const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:C:/ESG Bibek 2/database/prisma/dev.db"
    }
  }
});

const defaultPhones = {
  'admin@meil.in': '+91 98765 00001',
  'esg.manager@meil.in': '+91 98765 00002',
  'data.owner@meil.in': '+91 98765 00003',
  'reviewer@meil.in': '+91 98765 00004',
  'approver@meil.in': '+91 98765 00005',
  'auditor@meil.in': '+91 98765 00006',
  'ravi@meil.in': '+91 98765 43210',
  'project.manager@meil.demo': '+91 98765 00007',
  'esg.team@meil.demo': '+91 98765 00008',
};

async function main() {
  for (const [email, phone] of Object.entries(defaultPhones)) {
    await prisma.user.updateMany({
      where: { email },
      data: { phone }
    });
    console.log(`Updated ${email} with phone: ${phone}`);
  }
  await prisma.$disconnect();
}

main().catch(console.error);
