import { calculationEngine } from '../src/services/calculationService';
import prisma from '../src/config/database';

describe('Deterministic Calculation Engine (Phase 11)', () => {
  let tenantId: string;

  beforeAll(async () => {
    const tenant = await prisma.tenant.findFirst({ where: { slug: 'meil-group' } });
    tenantId = tenant ? tenant.id : 'test-tenant';
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('Scope 1 direct emissions calculation is mathematically exact and stores inputs', async () => {
    // 50,000 litres of diesel × 2.68 kg CO2/L / 1000 = 134 tCO2e
    const result = await calculationEngine.calculateScope1Emissions({
      tenantId,
      fuelLitres: 50000,
      emissionFactor: 2.68,
      fuelType: 'Diesel',
    });

    expect(result.resultValue).toBe(134);
    expect(result.resultUnit).toBe('tCO2e');
    expect(result.inputs).toHaveLength(2);
    expect(result.inputs.find((i) => i.inputCode === 'fuel_litres')?.inputValue).toBe(50000);
    expect(result.inputs.find((i) => i.inputCode === 'emission_factor_kg_per_l')?.inputValue).toBe(2.68);
  });

  test('Scope 2 grid electricity emissions uses CEA grid baseline emission factor', async () => {
    // 10,000 MWh × 0.716 tCO2/MWh = 7,160 tCO2e
    const result = await calculationEngine.calculateScope2Emissions({
      tenantId,
      electricityMWh: 10000,
      gridFactor: 0.716,
    });

    expect(result.resultValue).toBe(7160);
    expect(result.resultUnit).toBe('tCO2e');
    expect(result.formula).toBe('electricity_mwh * grid_factor_tco2_per_mwh');
  });

  test('Renewable electricity share calculation computes accurate percentage', async () => {
    // 25,000 MWh renewable + 75,000 MWh non-renewable = 100,000 total MWh -> 25%
    const result = await calculationEngine.calculateRenewableShare({
      tenantId,
      renewableMWh: 25000,
      nonRenewableMWh: 75000,
    });

    expect(result.resultValue).toBe(25);
    expect(result.resultUnit).toBe('%');
  });

  test('Lost Time Injury Frequency Rate (LTIFR) per million person-hours', async () => {
    // (2 lost time injuries × 1,000,000) / 4,000,000 hours = 0.500
    const result = await calculationEngine.calculateLTIFR({
      tenantId,
      lostTimeInjuries: 2,
      totalPersonHours: 4000000,
    });

    expect(result.resultValue).toBe(0.5);
    expect(result.resultUnit).toBe('per million hours');
  });
});
