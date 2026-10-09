import prisma from '../config/database';
import logger from '../config/logger';

export interface CalculationResult {
  id: string;
  name: string;
  code: string;
  category: string;
  formula: string;
  methodology: string;
  resultValue: number;
  resultUnit: string;
  inputs: Array<{
    name: string;
    inputCode: string;
    inputValue: number;
    inputUnit: string;
    source?: string;
  }>;
}

export class CalculationEngine {
  /**
   * Calculate Scope 1 GHG emissions from fuel combustion
   * Formula: Activity Data (Litres) × Emission Factor (kg CO2e/L) / 1000 = tCO2e
   */
  async calculateScope1Emissions(params: {
    tenantId: string;
    submissionId?: string;
    metricValueId?: string;
    fuelLitres: number;
    emissionFactor?: number; // default IPCC diesel: 2.68 kg CO2/L
    fuelType?: string;
    calculatedById?: string;
  }): Promise<CalculationResult> {
    const factor = params.emissionFactor ?? 2.68;
    const resultValue = parseFloat(((params.fuelLitres * factor) / 1000).toFixed(2));

    const calculation = await prisma.calculation.create({
      data: {
        tenantId: params.tenantId,
        submissionId: params.submissionId,
        metricValueId: params.metricValueId,
        name: `Scope 1 GHG Emissions (${params.fuelType || 'Diesel Fuel Combustion'})`,
        code: 'CALC_SCOPE1_FUEL',
        category: 'scope1',
        formula: 'fuel_litres * emission_factor_kg_per_l / 1000',
        methodology: 'IPCC Guidelines for National Greenhouse Gas Inventories & GHG Protocol Corporate Standard',
        resultValue,
        resultUnit: 'tCO2e',
        calculatedBy: params.calculatedById,
        version: 1,
        status: 'active',
        inputs: {
          create: [
            {
              name: 'Fuel Volume Consumed',
              inputCode: 'fuel_litres',
              inputValue: params.fuelLitres,
              inputUnit: 'Litres',
              source: 'Fuel Meter Records & Dispenser Logs',
            },
            {
              name: 'Fuel Emission Factor',
              inputCode: 'emission_factor_kg_per_l',
              inputValue: factor,
              inputUnit: 'kg CO2/L',
              source: 'IPCC Table 3.2.1 / India GHG Program',
            },
          ],
        },
      },
      include: { inputs: true },
    });

    return {
      id: calculation.id,
      name: calculation.name,
      code: calculation.code,
      category: calculation.category,
      formula: calculation.formula,
      methodology: calculation.methodology || '',
      resultValue: calculation.resultValue,
      resultUnit: calculation.resultUnit,
      inputs: calculation.inputs.map((i) => ({
        name: i.name,
        inputCode: i.inputCode,
        inputValue: i.inputValue,
        inputUnit: i.inputUnit,
        source: i.source || undefined,
      })),
    };
  }

  /**
   * Calculate Scope 2 GHG emissions from purchased grid electricity
   * Formula: Purchased Electricity (MWh) × CEA Grid Factor (tCO2/MWh) = tCO2e
   */
  async calculateScope2Emissions(params: {
    tenantId: string;
    submissionId?: string;
    metricValueId?: string;
    electricityMWh: number;
    gridFactor?: number; // default CEA National Grid Baseline: 0.716 tCO2/MWh
    calculatedById?: string;
  }): Promise<CalculationResult> {
    const factor = params.gridFactor ?? 0.716;
    const resultValue = parseFloat((params.electricityMWh * factor).toFixed(2));

    const calculation = await prisma.calculation.create({
      data: {
        tenantId: params.tenantId,
        submissionId: params.submissionId,
        metricValueId: params.metricValueId,
        name: 'Scope 2 Location-Based Electricity Emissions',
        code: 'CALC_SCOPE2_GRID',
        category: 'scope2',
        formula: 'electricity_mwh * grid_factor_tco2_per_mwh',
        methodology: 'Central Electricity Authority (CEA) CO2 Baseline Database for the Indian Power Sector v19',
        resultValue,
        resultUnit: 'tCO2e',
        calculatedBy: params.calculatedById,
        version: 1,
        status: 'active',
        inputs: {
          create: [
            {
              name: 'Purchased Grid Electricity',
              inputCode: 'electricity_mwh',
              inputValue: params.electricityMWh,
              inputUnit: 'MWh',
              source: 'Utility Substation Meters & Invoices',
            },
            {
              name: 'National Grid Emission Factor',
              inputCode: 'grid_factor_tco2_per_mwh',
              inputValue: factor,
              inputUnit: 'tCO2/MWh',
              source: 'Central Electricity Authority (CEA) Government of India',
            },
          ],
        },
      },
      include: { inputs: true },
    });

    return {
      id: calculation.id,
      name: calculation.name,
      code: calculation.code,
      category: calculation.category,
      formula: calculation.formula,
      methodology: calculation.methodology || '',
      resultValue: calculation.resultValue,
      resultUnit: calculation.resultUnit,
      inputs: calculation.inputs.map((i) => ({
        name: i.name,
        inputCode: i.inputCode,
        inputValue: i.inputValue,
        inputUnit: i.inputUnit,
        source: i.source || undefined,
      })),
    };
  }

  /**
   * Calculate Renewable Energy Share
   * Formula: (Renewable MWh / Total Energy MWh) * 100 = %
   */
  async calculateRenewableShare(params: {
    tenantId: string;
    submissionId?: string;
    metricValueId?: string;
    renewableMWh: number;
    nonRenewableMWh: number;
    calculatedById?: string;
  }): Promise<CalculationResult> {
    const total = params.renewableMWh + params.nonRenewableMWh;
    const resultValue = total > 0 ? parseFloat(((params.renewableMWh / total) * 100).toFixed(2)) : 0;

    const calculation = await prisma.calculation.create({
      data: {
        tenantId: params.tenantId,
        submissionId: params.submissionId,
        metricValueId: params.metricValueId,
        name: 'Renewable Electricity Consumption Percentage',
        code: 'CALC_RENEWABLE_SHARE',
        category: 'energy',
        formula: '(renewable_mwh / (renewable_mwh + non_renewable_mwh)) * 100',
        methodology: 'BRSR Principle 6 Indicator E1 Guidance',
        resultValue,
        resultUnit: '%',
        calculatedBy: params.calculatedById,
        version: 1,
        status: 'active',
        inputs: {
          create: [
            {
              name: 'Renewable Electricity',
              inputCode: 'renewable_mwh',
              inputValue: params.renewableMWh,
              inputUnit: 'MWh',
              source: 'On-site Solar & Green Power Purchase',
            },
            {
              name: 'Non-Renewable Electricity',
              inputCode: 'non_renewable_mwh',
              inputValue: params.nonRenewableMWh,
              inputUnit: 'MWh',
              source: 'Grid / Thermal Electricity Invoices',
            },
          ],
        },
      },
      include: { inputs: true },
    });

    return {
      id: calculation.id,
      name: calculation.name,
      code: calculation.code,
      category: calculation.category,
      formula: calculation.formula,
      methodology: calculation.methodology || '',
      resultValue: calculation.resultValue,
      resultUnit: calculation.resultUnit,
      inputs: calculation.inputs.map((i) => ({
        name: i.name,
        inputCode: i.inputCode,
        inputValue: i.inputValue,
        inputUnit: i.inputUnit,
        source: i.source || undefined,
      })),
    };
  }

  /**
   * Calculate Lost Time Injury Frequency Rate (LTIFR)
   * Formula: (Lost Time Injuries × 1,000,000) / Total Person-Hours Worked
   */
  async calculateLTIFR(params: {
    tenantId: string;
    submissionId?: string;
    metricValueId?: string;
    lostTimeInjuries: number;
    totalPersonHours: number;
    calculatedById?: string;
  }): Promise<CalculationResult> {
    const resultValue =
      params.totalPersonHours > 0
        ? parseFloat(((params.lostTimeInjuries * 1000000) / params.totalPersonHours).toFixed(3))
        : 0;

    const calculation = await prisma.calculation.create({
      data: {
        tenantId: params.tenantId,
        submissionId: params.submissionId,
        metricValueId: params.metricValueId,
        name: 'Lost Time Injury Frequency Rate (LTIFR)',
        code: 'CALC_SAFETY_LTIFR',
        category: 'safety',
        formula: '(lost_time_injuries * 1000000) / total_person_hours',
        methodology: 'OSHA / IS 3786 Method for Computation of Frequency and Severity Rates for Industrial Injuries',
        resultValue,
        resultUnit: 'per million hours',
        calculatedBy: params.calculatedById,
        version: 1,
        status: 'active',
        inputs: {
          create: [
            {
              name: 'Lost Time Injuries Count',
              inputCode: 'lost_time_injuries',
              inputValue: params.lostTimeInjuries,
              inputUnit: 'count',
              source: 'EHS Incident Reporting Register',
            },
            {
              name: 'Total Person-Hours Worked',
              inputCode: 'total_person_hours',
              inputValue: params.totalPersonHours,
              inputUnit: 'hours',
              source: 'Biometric Attendance & Contractor Timesheets',
            },
          ],
        },
      },
      include: { inputs: true },
    });

    return {
      id: calculation.id,
      name: calculation.name,
      code: calculation.code,
      category: calculation.category,
      formula: calculation.formula,
      methodology: calculation.methodology || '',
      resultValue: calculation.resultValue,
      resultUnit: calculation.resultUnit,
      inputs: calculation.inputs.map((i) => ({
        name: i.name,
        inputCode: i.inputCode,
        inputValue: i.inputValue,
        inputUnit: i.inputUnit,
        source: i.source || undefined,
      })),
    };
  }

  /**
   * Get calculations for a tenant, submission or metric
   */
  async getCalculations(tenantId: string, submissionId?: string) {
    const where: any = { tenantId };
    if (submissionId) where.submissionId = submissionId;

    return prisma.calculation.findMany({
      where,
      include: { inputs: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const calculationEngine = new CalculationEngine();
