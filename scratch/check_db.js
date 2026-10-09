const { PrismaClient } = require('../backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: {
      userRoles: {
        include: { role: true, orgUnit: true }
      }
    }
  });
  console.log('--- USERS ---');
  users.forEach(u => {
    console.log(u.email, 'Roles:', u.userRoles.map(r => `${r.role.name} (${r.orgUnit?.name || 'All'})`));
  });

  const orgUnits = await prisma.orgUnit.findMany({
    include: { type: true }
  });
  console.log('\n--- ORG UNITS ---');
  orgUnits.forEach(o => {
    console.log(o.id, o.code, o.name, o.type.name);
  });

  const submissions = await prisma.submission.findMany({
    include: { orgUnit: true }
  });
  console.log('\n--- SUBMISSIONS ---');
  submissions.forEach(s => {
    console.log(s.id, s.category, s.status, s.orgUnit?.name, s.orgUnitId);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
