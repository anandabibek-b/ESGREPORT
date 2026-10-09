import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting BRSR ESG Platform Database Seeding for MEIL Group...');

  // 1. Clean existing data in reverse dependency order
  console.log('Cleaning existing data...');
  await prisma.notification.deleteMany();
  await prisma.notificationTemplate.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.dataLineage.deleteMany();
  await prisma.calculationInput.deleteMany();
  await prisma.calculation.deleteMany();
  await prisma.metricValueVersion.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.approval.deleteMany();
  await prisma.review.deleteMany();
  await prisma.workflowTransition.deleteMany();
  await prisma.workflowStep.deleteMany();
  await prisma.validationResult.deleteMany();
  await prisma.evidence.deleteMany();
  await prisma.metricValue.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.questionValidationRule.deleteMany();
  await prisma.validationRule.deleteMany();
  await prisma.metric.deleteMany();
  await prisma.question.deleteMany();
  await prisma.indicator.deleteMany();
  await prisma.principle.deleteMany();
  await prisma.section.deleteMany();
  await prisma.reportingPeriod.deleteMany();
  await prisma.frameworkVersion.deleteMany();
  await prisma.framework.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.user.deleteMany();
  await prisma.orgUnit.deleteMany();
  await prisma.orgUnitType.deleteMany();
  await prisma.company.deleteMany();
  await prisma.tenant.deleteMany();

  // 2. Create Tenant & Company
  console.log('Creating Tenant & MEIL Company...');
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Megha Engineering and Infrastructures Limited',
      slug: 'meil-group',
      status: 'active',
      plan: 'enterprise',
    },
  });

  const company = await prisma.company.create({
    data: {
      tenantId: tenant.id,
      legalName: 'Megha Engineering and Infrastructures Limited',
      tradeName: 'MEIL Group',
      cin: 'U45200TG2006PLC050271',
      pan: 'AABCM1234F',
      registeredAddress: 'S-2, Technocrat Industrial Estate, Balanagar, Hyderabad, Telangana 500037',
      corporateWebsite: 'https://meil.in',
      industry: 'Infrastructure & Engineering',
      sector: 'Construction & Engineering Services',
      companyType: 'public',
      listedStatus: 'listed',
      stockExchanges: JSON.stringify(['NSE', 'BSE']),
      marketCapCategory: 'large',
      financialYearStart: 4, // April
      reportingCurrency: 'INR',
      onboardingCompleted: true,
      status: 'active',
    },
  });

  // 3. Org Unit Types
  console.log('Creating Org Unit Types...');
  const types = await Promise.all([
    prisma.orgUnitType.create({ data: { tenantId: tenant.id, name: 'company', displayName: 'Group Headquarters', level: 0 } }),
    prisma.orgUnitType.create({ data: { tenantId: tenant.id, name: 'subsidiary', displayName: 'Subsidiary Entity', level: 1 } }),
    prisma.orgUnitType.create({ data: { tenantId: tenant.id, name: 'business_unit', displayName: 'Business Unit', level: 2 } }),
    prisma.orgUnitType.create({ data: { tenantId: tenant.id, name: 'division', displayName: 'Division / Region', level: 3 } }),
    prisma.orgUnitType.create({ data: { tenantId: tenant.id, name: 'project', displayName: 'Infrastructure Project', level: 4 } }),
    prisma.orgUnitType.create({ data: { tenantId: tenant.id, name: 'plant', displayName: 'Manufacturing Plant', level: 4 } }),
  ]);
  const typeMap = Object.fromEntries(types.map((t) => [t.name, t.id]));

  // 4. Org Units Hierarchy for MEIL
  console.log('Creating MEIL Organization Hierarchy...');
  const hq = await prisma.orgUnit.create({
    data: {
      tenantId: tenant.id,
      companyId: company.id,
      typeId: typeMap['company'],
      name: 'MEIL Corporate Headquarters',
      code: 'MEIL-HQ',
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
    },
  });

  const subEnergy = await prisma.orgUnit.create({
    data: {
      tenantId: tenant.id,
      companyId: company.id,
      parentId: hq.id,
      typeId: typeMap['subsidiary'],
      name: 'MEIL Energy & Hydrocarbon Ltd',
      code: 'MEIL-ENG',
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
    },
  });

  const subInfra = await prisma.orgUnit.create({
    data: {
      tenantId: tenant.id,
      companyId: company.id,
      parentId: hq.id,
      typeId: typeMap['subsidiary'],
      name: 'MEIL Infrastructure Ltd',
      code: 'MEIL-INF',
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
    },
  });

  const subMobility = await prisma.orgUnit.create({
    data: {
      tenantId: tenant.id,
      companyId: company.id,
      parentId: hq.id,
      typeId: typeMap['subsidiary'],
      name: 'Olectra Greentech Ltd (EV Division)',
      code: 'OLECTRA-EV',
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
    },
  });

  const buHydro = await prisma.orgUnit.create({
    data: {
      tenantId: tenant.id,
      companyId: company.id,
      parentId: subInfra.id,
      typeId: typeMap['business_unit'],
      name: 'Irrigation & Water Management BU',
      code: 'BU-WATER',
      city: 'Hyderabad',
      state: 'Telangana',
    },
  });

  const buTunnel = await prisma.orgUnit.create({
    data: {
      tenantId: tenant.id,
      companyId: company.id,
      parentId: subInfra.id,
      typeId: typeMap['business_unit'],
      name: 'Transportation & Tunnels BU',
      code: 'BU-TRANS',
      city: 'New Delhi',
      state: 'Delhi',
    },
  });

  const projZojila = await prisma.orgUnit.create({
    data: {
      tenantId: tenant.id,
      companyId: company.id,
      parentId: buTunnel.id,
      typeId: typeMap['project'],
      name: 'Zojila Tunnel Project Site',
      code: 'PRJ-ZOJILA',
      city: 'Baltal',
      state: 'Jammu & Kashmir',
    },
  });

  const projKaleshwaram = await prisma.orgUnit.create({
    data: {
      tenantId: tenant.id,
      companyId: company.id,
      parentId: buHydro.id,
      typeId: typeMap['project'],
      name: 'Kaleshwaram Lift Irrigation Site',
      code: 'PRJ-KLIP',
      city: 'Bhupalpally',
      state: 'Telangana',
    },
  });

  // 5. Roles & Permissions
  console.log('Creating Roles & Permissions...');
  const permissionsList = [
    { name: 'organization.read', module: 'organization', displayName: 'View Organization Hierarchy' },
    { name: 'organization.update', module: 'organization', displayName: 'Manage Organization Hierarchy' },
    { name: 'users.read', module: 'users', displayName: 'View Users' },
    { name: 'users.manage', module: 'users', displayName: 'Manage Users' },
    { name: 'roles.manage', module: 'roles', displayName: 'Manage Roles' },
    { name: 'reporting.create', module: 'reporting', displayName: 'Create Reporting Period & Reports' },
    { name: 'reporting.read', module: 'reporting', displayName: 'View Reports' },
    { name: 'reporting.update', module: 'reporting', displayName: 'Edit Reporting Configuration' },
    { name: 'reporting.submit', module: 'reporting', displayName: 'Submit Reports' },
    { name: 'reporting.approve', module: 'reporting', displayName: 'Approve Reports' },
    { name: 'evidence.upload', module: 'evidence', displayName: 'Upload Evidence' },
    { name: 'evidence.read', module: 'evidence', displayName: 'View & Download Evidence' },
    { name: 'validation.run', module: 'validation', displayName: 'Run Validation' },
    { name: 'validation.resolve', module: 'validation', displayName: 'Resolve Validation Errors' },
    { name: 'audit.read', module: 'audit', displayName: 'View Audit Logs' },
    { name: 'analytics.read', module: 'analytics', displayName: 'View Dashboards & Analytics' },
    { name: 'export.generate', module: 'export', displayName: 'Generate PDF/Excel/JSON Exports' },
  ];

  const permissions = await Promise.all(
    permissionsList.map((p) =>
      prisma.permission.create({
        data: p,
      })
    )
  );

  const roles = await Promise.all([
    prisma.role.create({
      data: {
        name: 'platform_super_admin',
        displayName: 'Platform Super Admin',
        description: 'Global administrator across system',
        isSystem: true,
        level: 0,
      },
    }),
    prisma.role.create({
      data: {
        name: 'company_admin',
        displayName: 'Company Admin',
        description: 'Tenant administrator with full company access',
        isSystem: true,
        level: 1,
      },
    }),
    prisma.role.create({
      data: {
        name: 'esg_manager',
        displayName: 'ESG Manager',
        description: 'Coordinates ESG reporting, assigns disclosures, runs validation',
        isSystem: true,
        level: 2,
      },
    }),
    prisma.role.create({
      data: {
        name: 'data_owner',
        displayName: 'Data Owner / Submitter',
        description: 'Enters operational ESG metrics and attaches evidence',
        isSystem: true,
        level: 3,
      },
    }),
    prisma.role.create({
      data: {
        name: 'reviewer',
        displayName: 'ESG Reviewer',
        description: 'Reviews entered data, requests changes or approves first stage',
        isSystem: true,
        level: 4,
      },
    }),
    prisma.role.create({
      data: {
        name: 'approver',
        displayName: 'Executive Approver',
        description: 'Final signatory and approval authority before publication',
        isSystem: true,
        level: 5,
      },
    }),
    prisma.role.create({
      data: {
        name: 'auditor',
        displayName: 'External ESG Auditor',
        description: 'Read-only independent assurance, evidence verification and lineage inspection',
        isSystem: true,
        level: 6,
      },
    }),
  ]);

  const roleMap = Object.fromEntries(roles.map((r) => [r.name, r]));

  // Assign permissions to company_admin, esg_manager, etc.
  for (const perm of permissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: roleMap['company_admin'].id,
        permissionId: perm.id,
      },
    });
    if (!['roles.manage', 'users.manage'].includes(perm.name)) {
      await prisma.rolePermission.create({
        data: {
          roleId: roleMap['esg_manager'].id,
          permissionId: perm.id,
        },
      });
    }
  }

  // 6. Users
  console.log('Creating Users...');
  const passwordHash = await bcrypt.hash('Admin@12345', 10);
  const managerHash = await bcrypt.hash('Manager@12345', 10);
  const ownerHash = await bcrypt.hash('Owner@12345', 10);
  const reviewerHash = await bcrypt.hash('Reviewer@12345', 10);
  const approverHash = await bcrypt.hash('Approver@12345', 10);
  const auditorHash = await bcrypt.hash('Auditor@12345', 10);

  const usersData = [
    {
      email: 'admin@meil.in',
      passwordHash,
      firstName: 'Rajesh',
      lastName: 'Reddy',
      designation: 'Head of Corporate Sustainability',
      department: 'Executive Office',
      role: 'company_admin',
      orgUnitId: hq.id,
    },
    {
      email: 'esg.manager@meil.in',
      passwordHash: managerHash,
      firstName: 'Priya',
      lastName: 'Sharma',
      designation: 'Senior Manager - ESG & Compliance',
      department: 'Sustainability Dept',
      role: 'esg_manager',
      orgUnitId: hq.id,
    },
    {
      email: 'data.owner@meil.in',
      passwordHash: ownerHash,
      firstName: 'Vikram',
      lastName: 'Patil',
      designation: 'Project Lead - Energy & Operations',
      department: 'Site Engineering',
      role: 'data_owner',
      orgUnitId: projZojila.id,
    },
    {
      email: 'reviewer@meil.in',
      passwordHash: reviewerHash,
      firstName: 'Ananya',
      lastName: 'Iyer',
      designation: 'Lead Environmental Auditor',
      department: 'Quality & Assurance',
      role: 'reviewer',
      orgUnitId: hq.id,
    },
    {
      email: 'approver@meil.in',
      passwordHash: approverHash,
      firstName: 'Suresh',
      lastName: 'Babu',
      designation: 'Executive Director & Board Member',
      department: 'Board of Directors',
      role: 'approver',
      orgUnitId: hq.id,
    },
    {
      email: 'auditor@meil.in',
      passwordHash: auditorHash,
      firstName: 'Deepak',
      lastName: 'Verma',
      designation: 'Partner - ESG Assurance (BSI/DNV)',
      department: 'External Assurance',
      role: 'auditor',
      orgUnitId: hq.id,
    },
  ];

  const createdUsers: Record<string, any> = {};
  for (const u of usersData) {
    const user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: u.email,
        passwordHash: u.passwordHash,
        firstName: u.firstName,
        lastName: u.lastName,
        designation: u.designation,
        department: u.department,
        status: 'active',
        emailVerified: true,
      },
    });
    createdUsers[u.email] = user;

    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: roleMap[u.role].id,
        orgUnitId: u.orgUnitId,
      },
    });
  }

  // 7. Standard Measurement Units
  console.log('Creating Measurement Units...');
  const unitsData = [
    { code: 'MWh', name: 'Megawatt-hours', symbol: 'MWh', category: 'energy' },
    { code: 'kWh', name: 'Kilowatt-hours', symbol: 'kWh', category: 'energy' },
    { code: 'GJ', name: 'Gigajoules', symbol: 'GJ', category: 'energy' },
    { code: 'KL', name: 'Kilolitres', symbol: 'KL', category: 'water' },
    { code: 'tonnes', name: 'Metric Tonnes', symbol: 'MT', category: 'waste' },
    { code: 'tCO2e', name: 'Tonnes of CO2 equivalent', symbol: 'tCO₂e', category: 'emissions' },
    { code: 'INR_CR', name: 'INR Crores', symbol: '₹ Cr', category: 'currency' },
    { code: 'percent', name: 'Percentage', symbol: '%', category: 'general' },
    { code: 'count', name: 'Count / Number', symbol: '#', category: 'general' },
    { code: 'hours', name: 'Person-Hours', symbol: 'hrs', category: 'workforce' },
  ];
  const units = await Promise.all(unitsData.map((u) => prisma.unit.create({ data: u })));
  const unitMap = Object.fromEntries(units.map((u) => [u.code, u.id]));

  // 8. BRSR Framework Definition
  console.log('Creating SEBI BRSR Framework Structure...');
  const brsr = await prisma.framework.create({
    data: {
      name: 'Business Responsibility and Sustainability Reporting (BRSR)',
      code: 'brsr',
      description: 'SEBI mandated framework for top 1,000 listed entities in India covering ESG disclosures.',
      authority: 'Securities and Exchange Board of India (SEBI)',
      country: 'India',
      status: 'active',
    },
  });

  const version = await prisma.frameworkVersion.create({
    data: {
      frameworkId: brsr.id,
      version: '2024-25',
      name: 'BRSR Comprehensive & Core v2024-25',
      effectiveFrom: new Date('2024-04-01'),
      status: 'published',
      publishedAt: new Date('2024-04-01'),
      changelog: 'Full SEBI circular updates including 9 BRSR Core attributes and value chain assurance guidelines.',
    },
  });

  // Framework Sections
  const secA = await prisma.section.create({
    data: {
      frameworkVersionId: version.id,
      code: 'A',
      name: 'General Disclosures',
      description: 'Details of the listed entity, products/services, operations, employees, holding/subsidiary companies, CSR, and transparency.',
      sortOrder: 1,
    },
  });

  const secB = await prisma.section.create({
    data: {
      frameworkVersionId: version.id,
      code: 'B',
      name: 'Management and Process Disclosures',
      description: 'Policy and management processes, governance, leadership, and stakeholder engagement oversight.',
      sortOrder: 2,
    },
  });

  const secC = await prisma.section.create({
    data: {
      frameworkVersionId: version.id,
      code: 'C',
      name: 'Principle-wise Performance Indicators',
      description: 'Essential (mandatory) and Leadership (voluntary) indicators for Principles 1 through 9.',
      sortOrder: 3,
    },
  });

  // Principles 1 through 9 under Section C
  const principlesData = [
    { code: 'P1', number: 1, name: 'Ethics, Transparency and Accountability', desc: 'Businesses should conduct and govern themselves with integrity, and in a manner that is Ethical, Transparent and Accountable.' },
    { code: 'P2', number: 2, name: 'Product Life Cycle Sustainability', desc: 'Businesses should provide goods and services in a manner that is sustainable and safe.' },
    { code: 'P3', number: 3, name: 'Employee Well-being and Development', desc: 'Businesses should respect and promote the well-being of all employees, including those in their value chains.' },
    { code: 'P4', number: 4, name: 'Stakeholder Responsiveness', desc: 'Businesses should respect the interests of and be responsive to all its stakeholders.' },
    { code: 'P5', number: 5, name: 'Human Rights', desc: 'Businesses should respect and promote human rights.' },
    { code: 'P6', number: 6, name: 'Environmental Protection & Restoration', desc: 'Businesses should respect and make efforts to protect and restore the environment.' },
    { code: 'P7', number: 7, name: 'Policy Advocacy', desc: 'Businesses, when engaging in influencing public and regulatory policy, should do so in a manner that is responsible and transparent.' },
    { code: 'P8', number: 8, name: 'Inclusive Growth & Community Impact', desc: 'Businesses should promote inclusive growth and equitable development.' },
    { code: 'P9', number: 9, name: 'Consumer Value & Responsibility', desc: 'Businesses should engage with and provide value to their consumers in a responsible manner.' },
  ];

  const createdPrinciples: Record<string, any> = {};
  for (const p of principlesData) {
    const principle = await prisma.principle.create({
      data: {
        sectionId: secC.id,
        code: p.code,
        number: p.number,
        name: p.name,
        description: p.desc,
        sortOrder: p.number,
      },
    });
    createdPrinciples[p.code] = principle;
  }

  // Also create a General Principle for Section A
  const genPrinciple = await prisma.principle.create({
    data: {
      sectionId: secA.id,
      code: 'GEN',
      number: 0,
      name: 'General Information & Operations',
      description: 'Corporate profile, operational locations, employees and holding/subsidiary entities.',
      sortOrder: 1,
    },
  });

  // 9. Indicators & Questions (Covering Environmental P6, Social P3, Governance P1, and BRSR Core)
  console.log('Creating Indicators, Questions and Metrics...');

  // --- Principle 6: Environment ---
  // Indicator 1: Energy Consumption (Essential)
  const indP6Energy = await prisma.indicator.create({
    data: {
      principleId: createdPrinciples['P6'].id,
      code: 'P6-E1',
      name: 'Total Energy Consumption and Renewable Share',
      description: 'Details of total electricity, fuel and renewable energy consumed from renewable and non-renewable sources.',
      type: 'essential',
      isMandatory: true,
      sortOrder: 1,
    },
  });

  const qEnergyRenewable = await prisma.question.create({
    data: {
      indicatorId: indP6Energy.id,
      code: 'P6-E1-Q1',
      text: 'Total electricity consumption from renewable sources',
      description: 'Solar, wind, hydro and other renewable electricity consumed during the reporting period.',
      dataType: 'number',
      unit: 'MWh',
      isRequired: true,
      isBrsrCore: true,
      evidenceRequired: true,
      calculationMethod: 'Sum of on-site solar generation and certified green power purchase.',
      reportingLevel: 'subsidiary',
      sortOrder: 1,
    },
  });

  const qEnergyNonRenewable = await prisma.question.create({
    data: {
      indicatorId: indP6Energy.id,
      code: 'P6-E1-Q2',
      text: 'Total electricity consumption from non-renewable sources (Grid / DG sets)',
      description: 'Grid electricity and thermal/fuel electricity generation.',
      dataType: 'number',
      unit: 'MWh',
      isRequired: true,
      isBrsrCore: true,
      evidenceRequired: true,
      reportingLevel: 'subsidiary',
      sortOrder: 2,
    },
  });

  const qEnergyIntensity = await prisma.question.create({
    data: {
      indicatorId: indP6Energy.id,
      code: 'P6-E1-Q3',
      text: 'Energy intensity per rupee of turnover',
      description: 'Total energy consumed (GJ) divided by total turnover in INR Crores.',
      dataType: 'formula',
      unit: 'GJ/INR Cr',
      isRequired: true,
      isBrsrCore: true,
      calculationMethod: 'Total Energy (GJ) / Revenue from Operations (₹ Cr)',
      sortOrder: 3,
    },
  });

  // Indicator 2: GHG Emissions (Scope 1 & Scope 2)
  const indP6GHG = await prisma.indicator.create({
    data: {
      principleId: createdPrinciples['P6'].id,
      code: 'P6-E2',
      name: 'Greenhouse Gas (GHG) Emissions (Scope 1 & Scope 2)',
      description: 'Gross Scope 1 and Scope 2 GHG emissions in metric tonnes of CO2 equivalent.',
      type: 'essential',
      isMandatory: true,
      sortOrder: 2,
    },
  });

  const qScope1 = await prisma.question.create({
    data: {
      indicatorId: indP6GHG.id,
      code: 'P6-E2-Q1',
      text: 'Gross Scope 1 emissions (Direct emissions from fuels, DG sets, heavy equipment)',
      description: 'Emissions from stationary and mobile combustion of diesel, natural gas, etc.',
      dataType: 'number',
      unit: 'tCO2e',
      isRequired: true,
      isBrsrCore: true,
      evidenceRequired: true,
      calculationMethod: 'Activity Data (Litres of Diesel) × IPCC Emission Factor (2.68 kg CO2/L)',
      sortOrder: 1,
    },
  });

  const qScope2 = await prisma.question.create({
    data: {
      indicatorId: indP6GHG.id,
      code: 'P6-E2-Q2',
      text: 'Gross Scope 2 emissions (Indirect emissions from purchased electricity)',
      description: 'Emissions from electricity purchased from regional grids.',
      dataType: 'number',
      unit: 'tCO2e',
      isRequired: true,
      isBrsrCore: true,
      evidenceRequired: true,
      calculationMethod: 'Purchased Grid Electricity (MWh) × CEA Grid Emission Factor (0.716 tCO2/MWh)',
      sortOrder: 2,
    },
  });

  // Indicator 3: Water Withdrawal & Consumption
  const indP6Water = await prisma.indicator.create({
    data: {
      principleId: createdPrinciples['P6'].id,
      code: 'P6-E3',
      name: 'Water Withdrawal and Consumption',
      description: 'Total water withdrawn from surface water, groundwater, third-party sources and rainwater.',
      type: 'essential',
      isMandatory: true,
      sortOrder: 3,
    },
  });

  const qWaterWithdrawal = await prisma.question.create({
    data: {
      indicatorId: indP6Water.id,
      code: 'P6-E3-Q1',
      text: 'Total volume of water withdrawn (KL)',
      description: 'Includes surface water, groundwater, municipal supply, and tanker water.',
      dataType: 'number',
      unit: 'KL',
      isRequired: true,
      isBrsrCore: true,
      evidenceRequired: true,
      sortOrder: 1,
    },
  });

  const qWaterRecycled = await prisma.question.create({
    data: {
      indicatorId: indP6Water.id,
      code: 'P6-E3-Q2',
      text: 'Total volume of water recycled and reused (KL)',
      description: 'Treated wastewater reused on site or in curing/construction operations.',
      dataType: 'number',
      unit: 'KL',
      isRequired: true,
      isBrsrCore: true,
      evidenceRequired: true,
      sortOrder: 2,
    },
  });

  // --- Principle 3: Employee Well-being & Safety ---
  const indP3Workforce = await prisma.indicator.create({
    data: {
      principleId: createdPrinciples['P3'].id,
      code: 'P3-E1',
      name: 'Workforce Diversity and Employment',
      description: 'Total permanent and non-permanent workforce broken down by gender.',
      type: 'essential',
      isMandatory: true,
      sortOrder: 1,
    },
  });

  const qMaleEmployees = await prisma.question.create({
    data: {
      indicatorId: indP3Workforce.id,
      code: 'P3-E1-Q1',
      text: 'Total number of male employees and workers',
      dataType: 'number',
      unit: 'count',
      isRequired: true,
      isBrsrCore: true,
      sortOrder: 1,
    },
  });

  const qFemaleEmployees = await prisma.question.create({
    data: {
      indicatorId: indP3Workforce.id,
      code: 'P3-E1-Q2',
      text: 'Total number of female employees and workers',
      dataType: 'number',
      unit: 'count',
      isRequired: true,
      isBrsrCore: true,
      sortOrder: 2,
    },
  });

  const indP3Safety = await prisma.indicator.create({
    data: {
      principleId: createdPrinciples['P3'].id,
      code: 'P3-E2',
      name: 'Occupational Health and Safety Incidents',
      description: 'Lost Time Injury Frequency Rate (LTIFR) and workplace fatalities.',
      type: 'essential',
      isMandatory: true,
      sortOrder: 2,
    },
  });

  const qLTIFR = await prisma.question.create({
    data: {
      indicatorId: indP3Safety.id,
      code: 'P3-E2-Q1',
      text: 'Lost Time Injury Frequency Rate (LTIFR) per million person-hours worked',
      dataType: 'decimal',
      unit: 'count',
      isRequired: true,
      isBrsrCore: true,
      evidenceRequired: true,
      calculationMethod: '(Lost Time Injuries × 1,000,000) / Total Person-Hours Worked',
      sortOrder: 1,
    },
  });

  // --- Principle 1: Governance & Ethics ---
  const indP1Ethics = await prisma.indicator.create({
    data: {
      principleId: createdPrinciples['P1'].id,
      code: 'P1-E1',
      name: 'Anti-Corruption and Anti-Bribery Compliance',
      description: 'Training coverage and complaints received regarding ethics and bribery.',
      type: 'essential',
      isMandatory: true,
      sortOrder: 1,
    },
  });

  const qBriberyComplaints = await prisma.question.create({
    data: {
      indicatorId: indP1Ethics.id,
      code: 'P1-E1-Q1',
      text: 'Number of complaints received on conflict of interest, bribery or corruption',
      dataType: 'number',
      unit: 'count',
      isRequired: true,
      isBrsrCore: true,
      sortOrder: 1,
    },
  });

  // 10. Link Metrics for Analytics & Consolidation
  console.log('Linking System Metrics...');
  const mRenewableEnergy = await prisma.metric.create({
    data: {
      questionId: qEnergyRenewable.id,
      code: 'ENV_ENERGY_RENEWABLE',
      name: 'Renewable Electricity Consumption',
      category: 'environmental',
      subcategory: 'energy',
      dataType: 'number',
      unitId: unitMap['MWh'],
      consolidationMethod: 'sum',
      isBrsrCore: true,
    },
  });

  const mGridEnergy = await prisma.metric.create({
    data: {
      questionId: qEnergyNonRenewable.id,
      code: 'ENV_ENERGY_NON_RENEWABLE',
      name: 'Non-Renewable Electricity Consumption',
      category: 'environmental',
      subcategory: 'energy',
      dataType: 'number',
      unitId: unitMap['MWh'],
      consolidationMethod: 'sum',
      isBrsrCore: true,
    },
  });

  const mScope1 = await prisma.metric.create({
    data: {
      questionId: qScope1.id,
      code: 'ENV_GHG_SCOPE1',
      name: 'Gross Scope 1 GHG Emissions',
      category: 'environmental',
      subcategory: 'emissions',
      dataType: 'number',
      unitId: unitMap['tCO2e'],
      consolidationMethod: 'sum',
      isBrsrCore: true,
    },
  });

  const mScope2 = await prisma.metric.create({
    data: {
      questionId: qScope2.id,
      code: 'ENV_GHG_SCOPE2',
      name: 'Gross Scope 2 GHG Emissions',
      category: 'environmental',
      subcategory: 'emissions',
      dataType: 'number',
      unitId: unitMap['tCO2e'],
      consolidationMethod: 'sum',
      isBrsrCore: true,
    },
  });

  const mWater = await prisma.metric.create({
    data: {
      questionId: qWaterWithdrawal.id,
      code: 'ENV_WATER_WITHDRAWAL',
      name: 'Total Water Withdrawn',
      category: 'environmental',
      subcategory: 'water',
      dataType: 'number',
      unitId: unitMap['KL'],
      consolidationMethod: 'sum',
      isBrsrCore: true,
    },
  });

  const mMaleEmp = await prisma.metric.create({
    data: {
      questionId: qMaleEmployees.id,
      code: 'SOC_WORKFORCE_MALE',
      name: 'Male Employees',
      category: 'social',
      subcategory: 'workforce',
      dataType: 'number',
      unitId: unitMap['count'],
      consolidationMethod: 'sum',
      isBrsrCore: true,
    },
  });

  const mFemaleEmp = await prisma.metric.create({
    data: {
      questionId: qFemaleEmployees.id,
      code: 'SOC_WORKFORCE_FEMALE',
      name: 'Female Employees',
      category: 'social',
      subcategory: 'workforce',
      dataType: 'number',
      unitId: unitMap['count'],
      consolidationMethod: 'sum',
      isBrsrCore: true,
    },
  });

  const mLTIFR = await prisma.metric.create({
    data: {
      questionId: qLTIFR.id,
      code: 'SOC_SAFETY_LTIFR',
      name: 'Lost Time Injury Frequency Rate',
      category: 'social',
      subcategory: 'safety',
      dataType: 'decimal',
      unitId: unitMap['count'],
      consolidationMethod: 'average',
      isBrsrCore: true,
    },
  });

  const mBribery = await prisma.metric.create({
    data: {
      questionId: qBriberyComplaints.id,
      code: 'GOV_ETHICS_BRIBERY_COMPLAINTS',
      name: 'Anti-Corruption Complaints',
      category: 'governance',
      subcategory: 'ethics',
      dataType: 'number',
      unitId: unitMap['count'],
      consolidationMethod: 'sum',
      isBrsrCore: true,
    },
  });

  // 11. Validation Rules
  console.log('Creating Validation Rules...');
  const ruleRequired = await prisma.validationRule.create({
    data: {
      tenantId: tenant.id,
      name: 'Mandatory BRSR Core Value',
      description: 'Field is mandatory under SEBI BRSR Core guidelines.',
      ruleType: 'required',
      ruleConfig: JSON.stringify({ minLength: 1 }),
      severity: 'error',
      message: 'This disclosure is mandatory under SEBI BRSR Core regulations.',
    },
  });

  const rulePositiveNumber = await prisma.validationRule.create({
    data: {
      tenantId: tenant.id,
      name: 'Positive Numeric Value',
      description: 'Operational metrics cannot be negative numbers.',
      ruleType: 'range',
      ruleConfig: JSON.stringify({ min: 0 }),
      severity: 'error',
      message: 'Value cannot be negative.',
    },
  });

  const ruleYoYVariance = await prisma.validationRule.create({
    data: {
      tenantId: tenant.id,
      name: 'Period-over-Period Variance Check (>30%)',
      description: 'Flags significant spikes or drops (>30%) compared to previous period.',
      ruleType: 'comparison',
      ruleConfig: JSON.stringify({ maxVariancePercent: 30 }),
      severity: 'warning',
      message: 'Reported value deviates by more than 30% compared to previous financial year.',
    },
  });

  const ruleEvidenceCheck = await prisma.validationRule.create({
    data: {
      tenantId: tenant.id,
      name: 'Audit Evidence Required',
      description: 'Evidence document must be attached for external assurance.',
      ruleType: 'custom',
      ruleConfig: JSON.stringify({ requireEvidence: true }),
      severity: 'warning',
      message: 'Supporting documentary evidence (invoices, meter logs, test certificates) is recommended.',
    },
  });

  // Attach rules to questions
  await prisma.questionValidationRule.create({
    data: { questionId: qScope1.id, validationRuleId: ruleRequired.id },
  });
  await prisma.questionValidationRule.create({
    data: { questionId: qScope1.id, validationRuleId: rulePositiveNumber.id },
  });
  await prisma.questionValidationRule.create({
    data: { questionId: qScope1.id, validationRuleId: ruleYoYVariance.id },
  });
  await prisma.questionValidationRule.create({
    data: { questionId: qScope2.id, validationRuleId: ruleRequired.id },
  });
  await prisma.questionValidationRule.create({
    data: { questionId: qEnergyRenewable.id, validationRuleId: ruleEvidenceCheck.id },
  });

  // 12. Configurable Workflow Steps
  console.log('Configuring Workflow Steps...');
  await prisma.workflowStep.createMany({
    data: [
      { tenantId: tenant.id, name: 'Data Collection & Entry', stepOrder: 1, roleRequired: 'data_owner', status: 'active' },
      { tenantId: tenant.id, name: 'Internal Audit & Review', stepOrder: 2, roleRequired: 'reviewer', status: 'active' },
      { tenantId: tenant.id, name: 'Executive & Board Approval', stepOrder: 3, roleRequired: 'approver', status: 'active' },
    ],
  });

  // 13. Reporting Periods (Current Active FY 2024-25 and Prior FY 2023-24)
  console.log('Creating Reporting Periods...');
  const periodFY2324 = await prisma.reportingPeriod.create({
    data: {
      tenantId: tenant.id,
      companyId: company.id,
      name: 'FY 2023-24',
      startDate: new Date('2023-04-01'),
      endDate: new Date('2024-03-31'),
      frameworkVersionId: version.id,
      status: 'closed',
      brsr: true,
      brsrCore: true,
      valueChain: false,
      assuranceTracking: true,
      deadline: new Date('2024-09-30'),
      createdBy: createdUsers['admin@meil.in'].id,
    },
  });

  const periodFY2425 = await prisma.reportingPeriod.create({
    data: {
      tenantId: tenant.id,
      companyId: company.id,
      name: 'FY 2024-25',
      startDate: new Date('2024-04-01'),
      endDate: new Date('2025-03-31'),
      frameworkVersionId: version.id,
      status: 'data_collection',
      brsr: true,
      brsrCore: true,
      valueChain: true,
      assuranceTracking: true,
      deadline: new Date('2025-09-30'),
      createdBy: createdUsers['admin@meil.in'].id,
    },
  });

  // 14. Seed Prior Year (FY 2023-24) Historical Submissions for Comparison
  console.log('Creating Historical Data for FY 2023-24 (Comparison Baseline)...');
  const subHistorical = await prisma.submission.create({
    data: {
      tenantId: tenant.id,
      reportingPeriodId: periodFY2324.id,
      orgUnitId: hq.id,
      submittedById: createdUsers['data.owner@meil.in'].id,
      category: 'environmental',
      sectionCode: 'C',
      principleCode: 'P6',
      indicatorCode: 'P6-E1',
      status: 'approved',
      submittedAt: new Date('2024-05-15'),
      dataQualityScore: 98,
      notes: 'Final approved baseline environmental submission for MEIL Group FY 2023-24.',
    },
  });

  await prisma.metricValue.createMany({
    data: [
      {
        tenantId: tenant.id,
        submissionId: subHistorical.id,
        questionId: qEnergyRenewable.id,
        metricId: mRenewableEnergy.id,
        numericValue: 48500, // 48,500 MWh
        unit: 'MWh',
        dataSource: 'Solar generation meter logs & CEA Green Tariffs',
        createdBy: createdUsers['data.owner@meil.in'].id,
      },
      {
        tenantId: tenant.id,
        submissionId: subHistorical.id,
        questionId: qEnergyNonRenewable.id,
        metricId: mGridEnergy.id,
        numericValue: 245000, // 245,000 MWh
        unit: 'MWh',
        dataSource: 'State electricity utility DISCOM invoices',
        createdBy: createdUsers['data.owner@meil.in'].id,
      },
      {
        tenantId: tenant.id,
        submissionId: subHistorical.id,
        questionId: qScope1.id,
        metricId: mScope1.id,
        numericValue: 125000, // 125,000 tCO2e
        unit: 'tCO2e',
        dataSource: 'Diesel consumption records from construction fleet',
        createdBy: createdUsers['data.owner@meil.in'].id,
      },
      {
        tenantId: tenant.id,
        submissionId: subHistorical.id,
        questionId: qScope2.id,
        metricId: mScope2.id,
        numericValue: 175420, // 175,420 tCO2e
        unit: 'tCO2e',
        dataSource: 'Purchased grid power × 0.716 CEA factor',
        createdBy: createdUsers['data.owner@meil.in'].id,
      },
      {
        tenantId: tenant.id,
        submissionId: subHistorical.id,
        questionId: qWaterWithdrawal.id,
        metricId: mWater.id,
        numericValue: 890000, // 890,000 KL
        unit: 'KL',
        dataSource: 'Water extraction flowmeters at projects',
        createdBy: createdUsers['data.owner@meil.in'].id,
      },
    ],
  });

  // 15. Current Year (FY 2024-25) Submissions
  console.log('Creating Current Year (FY 2024-25) Submissions & Real Data...');

  // Submission 1: Environmental P6 at Zojila Tunnel Project
  const subEnvZojila = await prisma.submission.create({
    data: {
      tenantId: tenant.id,
      reportingPeriodId: periodFY2425.id,
      orgUnitId: projZojila.id,
      submittedById: createdUsers['data.owner@meil.in'].id,
      category: 'environmental',
      sectionCode: 'C',
      principleCode: 'P6',
      indicatorCode: 'P6-E1',
      status: 'under_review',
      submittedAt: new Date('2025-05-10'),
      dataQualityScore: 92,
      notes: 'Zojila Tunnel Site environmental energy & carbon report.',
    },
  });

  // Metric Values with YoY variance calculation
  const mvRenewable = await prisma.metricValue.create({
    data: {
      tenantId: tenant.id,
      submissionId: subEnvZojila.id,
      questionId: qEnergyRenewable.id,
      metricId: mRenewableEnergy.id,
      numericValue: 62400, // 62,400 MWh (+28.6% increase)
      unit: 'MWh',
      isEstimated: false,
      dataSource: 'Dedicated captive solar plant + rooftop panels at tunnel base camp',
      previousValue: 48500,
      variance: 28.66,
      createdBy: createdUsers['data.owner@meil.in'].id,
    },
  });

  const mvScope1 = await prisma.metricValue.create({
    data: {
      tenantId: tenant.id,
      submissionId: subEnvZojila.id,
      questionId: qScope1.id,
      metricId: mScope1.id,
      numericValue: 142000, // 142,000 tCO2e (+13.6%)
      unit: 'tCO2e',
      isEstimated: false,
      dataSource: 'Fuel consumption logs from 350+ heavy earthmovers and tunneling rigs',
      previousValue: 125000,
      variance: 13.6,
      createdBy: createdUsers['data.owner@meil.in'].id,
    },
  });

  const mvScope2 = await prisma.metricValue.create({
    data: {
      tenantId: tenant.id,
      submissionId: subEnvZojila.id,
      questionId: qScope2.id,
      metricId: mScope2.id,
      numericValue: 189500, // 189,500 tCO2e (+8.0%)
      unit: 'tCO2e',
      isEstimated: false,
      dataSource: 'Grid electricity invoices verified against substations',
      previousValue: 175420,
      variance: 8.03,
      createdBy: createdUsers['data.owner@meil.in'].id,
    },
  });

  const mvWater = await prisma.metricValue.create({
    data: {
      tenantId: tenant.id,
      submissionId: subEnvZojila.id,
      questionId: qWaterWithdrawal.id,
      metricId: mWater.id,
      numericValue: 940000, // 940,000 KL
      unit: 'KL',
      isEstimated: false,
      dataSource: 'Groundwater abstraction meters',
      previousValue: 890000,
      variance: 5.62,
      createdBy: createdUsers['data.owner@meil.in'].id,
    },
  });

  // Response Version History (Phase 16)
  await prisma.metricValueVersion.create({
    data: {
      tenantId: tenant.id,
      metricValueId: mvScope1.id,
      versionNumber: 1,
      numericValue: 138500,
      unit: 'tCO2e',
      reason: 'Initial preliminary estimate from diesel purchase orders',
      changedById: createdUsers['data.owner@meil.in'].id,
      createdAt: new Date('2025-05-02'),
    },
  });

  await prisma.metricValueVersion.create({
    data: {
      tenantId: tenant.id,
      metricValueId: mvScope1.id,
      versionNumber: 2,
      numericValue: 142000,
      unit: 'tCO2e',
      reason: 'Reconciliation with final vendor diesel receipts and telematics audit',
      changedById: createdUsers['data.owner@meil.in'].id,
      createdAt: new Date('2025-05-09'),
    },
  });

  // 16. Evidence File Attachment (Phase 9)
  console.log('Attaching Evidence Records...');
  const evSolar = await prisma.evidence.create({
    data: {
      tenantId: tenant.id,
      submissionId: subEnvZojila.id,
      fileName: 'Zojila_Solar_Generation_Certificate_FY24-25.pdf',
      fileType: 'pdf',
      fileSize: 2450800,
      filePath: '/uploads/evidence/Zojila_Solar_Certificate_FY24-25.pdf',
      fileHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      mimeType: 'application/pdf',
      evidenceType: 'certificate',
      description: 'Third-party certified solar generation certificate and green energy credits for Zojila Site.',
      questionCode: 'P6-E1-Q1',
      metricCode: 'ENV_ENERGY_RENEWABLE',
      version: 1,
      uploadedById: createdUsers['data.owner@meil.in'].id,
    },
  });

  const evDiesel = await prisma.evidence.create({
    data: {
      tenantId: tenant.id,
      submissionId: subEnvZojila.id,
      fileName: 'MEIL_Fleet_Diesel_Consumption_Audit_FY24-25.xlsx',
      fileType: 'xlsx',
      fileSize: 4120500,
      filePath: '/uploads/evidence/MEIL_Fleet_Diesel_Audit_FY24-25.xlsx',
      fileHash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      evidenceType: 'calculation_sheet',
      description: 'Detailed monthly fuel log by machine VIN, fuel dispensing meters, and fuel receipts.',
      questionCode: 'P6-E2-Q1',
      metricCode: 'ENV_GHG_SCOPE1',
      version: 1,
      uploadedById: createdUsers['data.owner@meil.in'].id,
    },
  });

  // 17. Deterministic Calculations (Phase 11)
  console.log('Storing Deterministic Calculation Models...');
  const calcScope1 = await prisma.calculation.create({
    data: {
      tenantId: tenant.id,
      submissionId: subEnvZojila.id,
      metricValueId: mvScope1.id,
      name: 'Scope 1 Mobile Combustion Diesel Emission Calculation',
      code: 'CALC_SCOPE1_DIESEL',
      category: 'scope1',
      formula: 'fuel_volume_litres * emission_factor_kg_per_litre / 1000',
      methodology: 'IPCC 2006 Guidelines for National Greenhouse Gas Inventories & GHG Protocol Corporate Standard',
      resultValue: 142000,
      resultUnit: 'tCO2e',
      calculatedBy: createdUsers['data.owner@meil.in'].id,
      version: 1,
      status: 'active',
    },
  });

  await prisma.calculationInput.createMany({
    data: [
      {
        calculationId: calcScope1.id,
        name: 'Total Diesel Consumed (Fleet & Machinery)',
        inputCode: 'fuel_volume_litres',
        inputValue: 52985074.6,
        inputUnit: 'Litres',
        source: 'SAP Fuel Issue Records & Fuel Dispenser Meters',
        sourceFileId: evDiesel.id,
      },
      {
        calculationId: calcScope1.id,
        name: 'Diesel CO2 Emission Factor',
        inputCode: 'emission_factor_kg_per_litre',
        inputValue: 2.68,
        inputUnit: 'kg CO2/L',
        source: 'India GHG Program / IPCC Chapter 3 Mobile Combustion',
      },
    ],
  });

  // 18. Data Lineage (Phase 19)
  console.log('Creating Data Lineage Provenance Records...');
  await prisma.dataLineage.create({
    data: {
      tenantId: tenant.id,
      metricValueId: mvScope1.id,
      sourceType: 'calculated',
      sourceEntity: 'Zojila Tunnel Project Site (Fleet Dispensing)',
      reportingPeriod: 'FY 2024-25',
      metricCode: 'ENV_GHG_SCOPE1',
      calculationMethod: 'CALC_SCOPE1_DIESEL',
      submittedBy: 'Vikram Patil (data.owner@meil.in)',
      reviewedBy: 'Ananya Iyer (reviewer@meil.in)',
      evidenceIds: JSON.stringify([evDiesel.id]),
      consolidationPath: JSON.stringify([
        'MEIL Corporate Headquarters',
        'MEIL Infrastructure Ltd',
        'Transportation & Tunnels BU',
        'Zojila Tunnel Project Site',
      ]),
    },
  });

  // 19. Validation Results (Phase 10)
  console.log('Generating Validation Results...');
  await prisma.validationResult.createMany({
    data: [
      {
        tenantId: tenant.id,
        submissionId: subEnvZojila.id,
        validationRuleId: ruleRequired.id,
        field: 'P6-E2-Q1',
        severity: 'pass',
        message: 'Gross Scope 1 direct emissions is complete and valid.',
        isResolved: true,
      },
      {
        tenantId: tenant.id,
        submissionId: subEnvZojila.id,
        validationRuleId: rulePositiveNumber.id,
        field: 'P6-E2-Q1',
        severity: 'pass',
        message: 'Reported value is non-negative and strictly positive.',
        isResolved: true,
      },
      {
        tenantId: tenant.id,
        submissionId: subEnvZojila.id,
        validationRuleId: ruleYoYVariance.id,
        field: 'P6-E1-Q1',
        severity: 'warning',
        message: 'Renewable electricity increased by +28.66% YoY. Reviewer justification verified.',
        isResolved: true,
        resolvedById: createdUsers['reviewer@meil.in'].id,
        resolvedAt: new Date('2025-05-12'),
        resolutionNotes: 'Verified new 15 MW captive solar park commissioned at Zojila base camp in November 2024.',
      },
    ],
  });

  // 20. Workflow Transitions, Reviews & Comments (Phase 13, 26)
  console.log('Creating Workflow Transitions, Reviews & Comments...');
  await prisma.workflowTransition.createMany({
    data: [
      {
        tenantId: tenant.id,
        submissionId: subEnvZojila.id,
        fromStatus: 'draft',
        toStatus: 'submitted',
        userId: createdUsers['data.owner@meil.in'].id,
        comment: 'Submitted Zojila FY 2024-25 energy and emission records for technical ESG review.',
      },
      {
        tenantId: tenant.id,
        submissionId: subEnvZojila.id,
        fromStatus: 'submitted',
        toStatus: 'under_review',
        userId: createdUsers['reviewer@meil.in'].id,
        comment: 'Initiated audit of fuel consumption logs and CEA electricity factors.',
      },
    ],
  });

  await prisma.review.create({
    data: {
      tenantId: tenant.id,
      submissionId: subEnvZojila.id,
      reviewerId: createdUsers['reviewer@meil.in'].id,
      status: 'under_review',
      comments: 'Data verified against telematics. Awaiting third-party calibration certificate for batching plant flowmeter.',
    },
  });

  await prisma.comment.create({
    data: {
      tenantId: tenant.id,
      submissionId: subEnvZojila.id,
      userId: createdUsers['esg.manager@meil.in'].id,
      text: 'Excellent work on increasing renewable electricity share to over 24% of overall consumption!',
      type: 'review_note',
    },
  });

  // 21. Notifications (Phase 22)
  console.log('Creating Notifications...');
  await prisma.notification.createMany({
    data: [
      {
        tenantId: tenant.id,
        userId: createdUsers['reviewer@meil.in'].id,
        type: 'review_requested',
        title: 'Review Requested: Environmental P6 (Zojila Site)',
        message: 'Vikram Patil has submitted the Environmental P6 disclosures for FY 2024-25. Please review.',
        link: `/submissions/${subEnvZojila.id}`,
        isRead: false,
      },
      {
        tenantId: tenant.id,
        userId: createdUsers['esg.manager@meil.in'].id,
        type: 'deadline_approaching',
        title: 'BRSR Filing Milestone: Q1 Data Submissions',
        message: 'Subsidiaries and project units have submitted 85% of required BRSR Core disclosures.',
        link: '/dashboard',
        isRead: true,
        readAt: new Date(),
      },
    ],
  });

  // 22. Audit Logs (Phase 15)
  console.log('Creating Initial Audit Trail...');
  await prisma.auditLog.createMany({
    data: [
      {
        tenantId: tenant.id,
        userId: createdUsers['admin@meil.in'].id,
        action: 'create',
        entityType: 'reporting_period',
        entityId: periodFY2425.id,
        newValue: JSON.stringify({ name: 'FY 2024-25', status: 'data_collection' }),
      },
      {
        tenantId: tenant.id,
        userId: createdUsers['data.owner@meil.in'].id,
        action: 'submit',
        entityType: 'submission',
        entityId: subEnvZojila.id,
        newValue: JSON.stringify({ status: 'submitted', metricCount: 4 }),
      },
      {
        tenantId: tenant.id,
        userId: createdUsers['data.owner@meil.in'].id,
        action: 'upload',
        entityType: 'evidence',
        entityId: evDiesel.id,
        newValue: JSON.stringify({ fileName: 'MEIL_Fleet_Diesel_Consumption_Audit_FY24-25.xlsx' }),
      },
    ],
  });

  console.log('✅ MEIL Group BRSR Platform Seeding Completed Successfully!');
  console.log('--------------------------------------------------');
  console.log('Demo Credentials for Testing & Review:');
  console.log('  Company Admin:  admin@meil.in       / Admin@12345');
  console.log('  ESG Manager:    esg.manager@meil.in / Manager@12345');
  console.log('  Data Owner:     data.owner@meil.in  / Owner@12345');
  console.log('  Reviewer:       reviewer@meil.in    / Reviewer@12345');
  console.log('  Approver:       approver@meil.in    / Approver@12345');
  console.log('  Auditor:        auditor@meil.in     / Auditor@12345');
  console.log('--------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed with error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
