import request from 'supertest';
import app from '../src/index';
import prisma from '../src/config/database';
import jwt from 'jsonwebtoken';
import { config } from '../src/config';

describe('Security & Tenant Isolation Suite (Phase 2, 14, 28)', () => {
  let meilTenantId: string;
  let otherTenantId: string;
  let meilToken: string;
  let otherTenantToken: string;

  beforeAll(async () => {
    // 1. Get MEIL Tenant
    const meilTenant = await prisma.tenant.findFirst({ where: { slug: 'meil-group' } });
    meilTenantId = meilTenant!.id;

    const meilUser = await prisma.user.findFirst({ where: { email: 'admin@meil.in' } });

    meilToken = jwt.sign(
      {
        userId: meilUser!.id,
        tenantId: meilTenantId,
        email: meilUser!.email,
        roles: ['company_admin'],
      },
      config.jwt.secret,
      { expiresIn: '1h' }
    );

    // 2. Create an isolated second tenant to test boundary isolation
    const otherTenant = await prisma.tenant.create({
      data: {
        name: 'Competitor Infrastructure Ltd',
        slug: `competitor-${Date.now()}`,
        status: 'active',
      },
    });
    otherTenantId = otherTenant.id;

    const otherUser = await prisma.user.create({
      data: {
        tenantId: otherTenantId,
        email: `intruder-${Date.now()}@competitor.com`,
        passwordHash: 'dummy-hash',
        firstName: 'External',
        lastName: 'User',
      },
    });

    otherTenantToken = jwt.sign(
      {
        userId: otherUser.id,
        tenantId: otherTenantId,
        email: otherUser.email,
        roles: ['company_admin'],
      },
      config.jwt.secret,
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    // Clean up second tenant
    await prisma.userRole.deleteMany({ where: { user: { tenantId: otherTenantId } } });
    await prisma.user.deleteMany({ where: { tenantId: otherTenantId } });
    await prisma.tenant.deleteMany({ where: { id: otherTenantId } });
    await prisma.$disconnect();
  });

  test('Rejects unauthenticated requests with 401 Unauthorized', async () => {
    const res = await request(app).get('/api/submissions');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('Rejects invalid or forged JWT token with 401', async () => {
    const res = await request(app)
      .get('/api/submissions')
      .set('Authorization', 'Bearer invalid-forged-token-abc');
    expect(res.status).toBe(401);
  });

  test('Tenant isolation: User from Tenant B cannot view Tenant A submissions', async () => {
    const res = await request(app)
      .get('/api/submissions')
      .set('Authorization', `Bearer ${otherTenantToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // Should return 0 submissions for Tenant B, completely isolated from MEIL submissions
    expect(res.body.data).toHaveLength(0);
  });

  test('Tenant isolation: IDOR prevention - Tenant B cannot access Tenant A submission by ID', async () => {
    // Get MEIL submission ID
    const meilSub = await prisma.submission.findFirst({ where: { tenantId: meilTenantId } });
    expect(meilSub).toBeDefined();

    const res = await request(app)
      .get(`/api/submissions/${meilSub!.id}`)
      .set('Authorization', `Bearer ${otherTenantToken}`);

    // Must be 404 Not Found to prevent data leakage across tenants
    expect(res.status).toBe(404);
  });

  test('Tenant isolation: Tenant B cannot download Tenant A evidence file', async () => {
    const meilEvidence = await prisma.evidence.findFirst({ where: { tenantId: meilTenantId } });
    expect(meilEvidence).toBeDefined();

    const res = await request(app)
      .get(`/api/evidence/${meilEvidence!.id}/download`)
      .set('Authorization', `Bearer ${otherTenantToken}`);

    expect(res.status).toBe(404);
  });
});
