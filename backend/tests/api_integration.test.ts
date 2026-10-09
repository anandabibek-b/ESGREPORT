import request from 'supertest';
import app from '../src/index';
import prisma from '../src/config/database';

describe('End-to-End BRSR Workflow Integration Test (Phase 33 & 34)', () => {
  let adminToken: string;
  let reviewerToken: string;
  let approverToken: string;
  let tenantId: string;
  let companyId: string;
  let reportingPeriodId: string;
  let projectOrgUnitId: string;
  let submissionId: string;

  beforeAll(async () => {
    // Login as Admin
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'admin@meil.in',
      password: 'Admin@12345',
    });
    expect(loginRes.status).toBe(200);
    adminToken = loginRes.body.data.accessToken;
    tenantId = loginRes.body.data.tenant.id;

    // Login as Reviewer
    const revLogin = await request(app).post('/api/auth/login').send({
      email: 'reviewer@meil.in',
      password: 'Reviewer@12345',
    });
    expect(revLogin.status).toBe(200);
    reviewerToken = revLogin.body.data.accessToken;

    // Login as Approver
    const appLogin = await request(app).post('/api/auth/login').send({
      email: 'approver@meil.in',
      password: 'Approver@12345',
    });
    expect(appLogin.status).toBe(200);
    approverToken = appLogin.body.data.accessToken;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('Step 1: Admin fetches company profile & organization hierarchy', async () => {
    const compRes = await request(app)
      .get('/api/company')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(compRes.status).toBe(200);
    expect(compRes.body.data.legalName).toContain('Megha Engineering');
    companyId = compRes.body.data.id;

    const orgRes = await request(app)
      .get('/api/organizations')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(orgRes.status).toBe(200);
    expect(orgRes.body.data.length).toBeGreaterThan(0);

    const projectUnit = orgRes.body.data.find((o: any) => o.code === 'PRJ-KLIP' || o.code === 'PRJ-ZOJILA');
    projectOrgUnitId = projectUnit ? projectUnit.id : orgRes.body.data[0].id;
  });

  test('Step 2: Admin fetches active reporting period & framework structure', async () => {
    const periodRes = await request(app)
      .get('/api/reporting-periods')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(periodRes.status).toBe(200);
    expect(periodRes.body.data.length).toBeGreaterThan(0);
    const activePeriod = periodRes.body.data.find((p: any) => p.name === 'FY 2024-25');
    reportingPeriodId = activePeriod.id;

    const fwRes = await request(app)
      .get('/api/frameworks')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(fwRes.status).toBe(200);
    expect(fwRes.body.data[0].code).toBe('brsr');
  });

  test('Step 3: Create ESG Submission & Enter Metric Values', async () => {
    const createSubRes = await request(app)
      .post('/api/submissions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        reportingPeriodId,
        orgUnitId: projectOrgUnitId,
        category: 'environmental',
        sectionCode: 'C',
        principleCode: 'P6',
        indicatorCode: 'P6-E1',
        notes: 'Integration test automated environmental disclosure',
      });
    expect(createSubRes.status).toBe(201);
    submissionId = createSubRes.body.data.id;

    // Get metric
    const metric = await prisma.metric.findFirst({ where: { code: 'ENV_ENERGY_RENEWABLE' } });

    // Save metric value
    const saveValRes = await request(app)
      .put(`/api/submissions/${submissionId}/values`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        values: [
          {
            metricId: metric!.id,
            numericValue: 12500,
            unit: 'MWh',
            dataSource: 'On-site solar telemetry',
          },
        ],
      });
    expect(saveValRes.status).toBe(200);
  });

  test('Step 4: Run Validation Engine on the submission', async () => {
    const valRes = await request(app)
      .post(`/api/validations/run/${submissionId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(valRes.status).toBe(200);
    expect(valRes.body.data.hasBlockingErrors).toBe(false);
  });

  test('Step 5: Submit for technical review', async () => {
    const submitRes = await request(app)
      .post(`/api/submissions/${submissionId}/submit`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ comment: 'Ready for auditor review' });
    expect(submitRes.status).toBe(200);

    const sub = await prisma.submission.findUnique({ where: { id: submissionId } });
    expect(sub!.status).toBe('submitted');
  });

  test('Step 6: Reviewer reviews and approves the submission', async () => {
    const reviewRes = await request(app)
      .post(`/api/submissions/${submissionId}/review`)
      .set('Authorization', `Bearer ${reviewerToken}`)
      .send({
        status: 'approved',
        comments: 'Technical EHS audit completed. Data approved for executive sign-off.',
      });
    expect(reviewRes.status).toBe(200);

    const sub = await prisma.submission.findUnique({ where: { id: submissionId } });
    expect(sub!.status).toBe('approved');
  });

  test('Step 7: Executive Approver signs off for consolidation', async () => {
    const approveRes = await request(app)
      .post(`/api/submissions/${submissionId}/approve`)
      .set('Authorization', `Bearer ${approverToken}`)
      .send({ comments: 'Final executive approval granted for group consolidation.' });
    expect(approveRes.status).toBe(200);

    const sub = await prisma.submission.findUnique({ where: { id: submissionId } });
    expect(sub!.status).toBe('consolidated');
  });

  test('Step 8: Generate PDF & Excel Reports', async () => {
    const pdfRes = await request(app)
      .post('/api/reports/generate/pdf')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ reportingPeriodId });
    expect(pdfRes.status).toBe(201);
    expect(pdfRes.body.data.fileName).toContain('.pdf');

    const excelRes = await request(app)
      .post('/api/reports/generate/excel')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ reportingPeriodId });
    expect(excelRes.status).toBe(201);
    expect(excelRes.body.data.fileName).toContain('.xlsx');
  });

  test('Step 9: AI Assistant answers query with grounded citations', async () => {
    const aiRes = await request(app)
      .post('/api/ai/query')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ query: 'Why did Scope 2 emissions increase?' });

    expect(aiRes.status).toBe(200);
    expect(aiRes.body.data.answer).toContain('Scope 2');
    expect(aiRes.body.data.citations.length).toBeGreaterThan(0);
  });
});
