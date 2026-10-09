const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:C:/ESG Bibek 2/database/prisma/dev.db"
    }
  }
});

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, firstName: true, lastName: true, phone: true }
  });
  console.log('Users found:', users.length);
  users.forEach(u => console.log(`- ${u.email} (${u.firstName} ${u.lastName}): phone = ${u.phone}`));
  await prisma.$disconnect();
}

main().catch(console.error);
