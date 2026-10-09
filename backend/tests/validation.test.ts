import { validationEngine } from '../src/services/validationService';
import prisma from '../src/config/database';

describe('Validation Engine Suite (Phase 10)', () => {
  let tenantId: string;
  let testSubmissionId: string;

  beforeAll(async () => {
    const tenant = await prisma.tenant.findFirst({ where: { slug: 'meil-group' } });
    tenantId = tenant!.id;

    const sub = await prisma.submission.findFirst({
      where: { tenantId, category: 'environmental' },
    });
    testSubmissionId = sub!.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('Validates existing seeded environmental submission without fatal errors', async () => {
    const summary = await validationEngine.validateSubmission(tenantId, testSubmissionId);

    expect(summary.total).toBeGreaterThan(0);
    expect(summary.pass).toBeGreaterThan(0);
    expect(summary.hasBlockingErrors).toBe(false);
  });

  test('Detects negative value as a blocking validation error', async () => {
    // Temporarily create a metric value with negative quantity
    const mv = await prisma.metricValue.create({
      data: {
        tenantId,
        submissionId: testSubmissionId,
        numericValue: -500,
        unit: 'MWh',
      },
    });

    const summary = await validationEngine.validateSubmission(tenantId, testSubmissionId);
    expect(summary.error).toBeGreaterThan(0);
    expect(summary.hasBlockingErrors).toBe(true);

    // Clean up
    await prisma.metricValue.delete({ where: { id: mv.id } });
    await prisma.validationResult.deleteMany({
      where: { submissionId: testSubmissionId, severity: 'error' },
    });
  });

  test('Resolving a validation warning succeeds with audit notes', async () => {
    const warningResult = await prisma.validationResult.findFirst({
      where: { tenantId, severity: 'warning' },
    });

    if (warningResult) {
      const user = await prisma.user.findFirst({ where: { tenantId } });
      const resolved = await validationEngine.resolveIssue({
        tenantId,
        resultId: warningResult.id,
        userId: user!.id,
        resolutionNotes: 'Audited and verified against operational telemetry.',
      });

      expect(resolved.isResolved).toBe(true);
      expect(resolved.resolutionNotes).toContain('verified');
    }
  });
});
