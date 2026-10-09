const bcrypt = require('../backend/node_modules/bcryptjs');
const { PrismaClient } = require('../backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding demo accounts for hackathon demonstration...');

  const tenant = await prisma.tenant.findFirst({
    where: { slug: 'meil-group' }
  });

  if (!tenant) {
    console.error('MEIL Group tenant not found.');
    return;
  }

  // 1. Ensure Roles exist
  let pmRole = await prisma.role.findUnique({ where: { name: 'PROJECT_MANAGER' } });
  if (!pmRole) {
    pmRole = await prisma.role.create({
      data: {
        name: 'PROJECT_MANAGER',
        displayName: 'Project Manager',
        description: 'Enters and submits ESG/BRSR data for assigned project',
        isSystem: true,
        level: 3,
      }
    });
    console.log('Created PROJECT_MANAGER role.');
  }

  let esgRole = await prisma.role.findUnique({ where: { name: 'ESG_TEAM' } });
  if (!esgRole) {
    esgRole = await prisma.role.create({
      data: {
        name: 'ESG_TEAM',
        displayName: 'ESG Team',
        description: 'Reviews, validates, approves ESG submissions and manages BRSR reports',
        isSystem: true,
        level: 2,
      }
    });
    console.log('Created ESG_TEAM role.');
  }

  // Find org units
  const projZojila = await prisma.orgUnit.findFirst({ where: { code: 'PRJ-ZOJILA' } });
  const hq = await prisma.orgUnit.findFirst({ where: { code: 'MEIL-HQ' } });

  if (!projZojila || !hq) {
    console.error('Required org units (PRJ-ZOJILA or MEIL-HQ) not found.');
    return;
  }

  // 2. Hash passwords
  const pmPasswordHash = await bcrypt.hash('Project@123', 10);
  const esgPasswordHash = await bcrypt.hash('ESG@123', 10);

  // 3. Create or update Project Manager user
  let pmUser = await prisma.user.findFirst({
    where: { tenantId: tenant.id, email: 'project.manager@meil.demo' }
  });

  if (!pmUser) {
    pmUser = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: 'project.manager@meil.demo',
        passwordHash: pmPasswordHash,
        firstName: 'Project',
        lastName: 'Manager',
        designation: 'Senior Project Lead - Site Operations',
        department: 'Site Engineering',
        status: 'active',
        emailVerified: true,
      }
    });
    console.log('Created user project.manager@meil.demo');
  } else {
    pmUser = await prisma.user.update({
      where: { id: pmUser.id },
      data: {
        passwordHash: pmPasswordHash,
        status: 'active',
      }
    });
    console.log('Updated user project.manager@meil.demo password');
  }

  // Ensure UserRole for PM
  await prisma.userRole.deleteMany({
    where: { userId: pmUser.id }
  });
  await prisma.userRole.create({
    data: {
      userId: pmUser.id,
      roleId: pmRole.id,
      orgUnitId: projZojila.id,
    }
  });

  // 4. Create or update ESG Team user
  let esgUser = await prisma.user.findFirst({
    where: { tenantId: tenant.id, email: 'esg.team@meil.demo' }
  });

  if (!esgUser) {
    esgUser = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: 'esg.team@meil.demo',
        passwordHash: esgPasswordHash,
        firstName: 'ESG',
        lastName: 'Review Team',
        designation: 'Senior ESG Analyst & Reviewer',
        department: 'Sustainability Directorate',
        status: 'active',
        emailVerified: true,
      }
    });
    console.log('Created user esg.team@meil.demo');
  } else {
    esgUser = await prisma.user.update({
      where: { id: esgUser.id },
      data: {
        passwordHash: esgPasswordHash,
        status: 'active',
      }
    });
    console.log('Updated user esg.team@meil.demo password');
  }

  // Ensure UserRole for ESG Team
  await prisma.userRole.deleteMany({
    where: { userId: esgUser.id }
  });
  await prisma.userRole.create({
    data: {
      userId: esgUser.id,
      roleId: esgRole.id,
      orgUnitId: hq.id,
    }
  });

  // Ensure PRJ-ZOJILA has a draft or editable submission as well as a submitted one for testing
  let zojilaSubmissions = await prisma.submission.findMany({
    where: { orgUnitId: projZojila.id }
  });
  console.log(`Found ${zojilaSubmissions.length} submissions for PRJ-ZOJILA.`);

  console.log('✓ Demo accounts seeded successfully.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
