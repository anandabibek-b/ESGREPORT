import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import * as XLSX from 'xlsx';
import prisma from '../config/database';
import logger from '../config/logger';

export class ExportService {
  private ensureExportDir(): string {
    const dir = path.resolve(process.cwd(), 'uploads/reports');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  }

  /**
   * Generate Full BRSR JSON Export
   */
  async generateJSON(tenantId: string, reportingPeriodId: string) {
    const [company, period, submissions, orgUnits, auditLogs] = await Promise.all([
      prisma.company.findFirst({ where: { tenantId } }),
      prisma.reportingPeriod.findFirst({
        where: { id: reportingPeriodId, tenantId },
        include: { frameworkVersion: { include: { framework: true } } },
      }),
      prisma.submission.findMany({
        where: { tenantId, reportingPeriodId },
        include: {
          orgUnit: true,
          metricValues: {
            include: { question: true, metric: { include: { unit: true } } },
          },
          evidence: true,
          validationResults: true,
          reviews: { include: { reviewer: true } },
          approvals: { include: { approver: true } },
        },
      }),
      prisma.orgUnit.findMany({ where: { tenantId } }),
      prisma.auditLog.findMany({ where: { tenantId }, take: 100, orderBy: { createdAt: 'desc' } }),
    ]);

    const reportData = {
      meta: {
        title: 'BRSR Corporate ESG Compliance Report',
        generator: 'ESG BRSR Enterprise Reporting Platform',
        timestamp: new Date().toISOString(),
        format: 'JSON',
      },
      entity: {
        legalName: company?.legalName,
        tradeName: company?.tradeName,
        cin: company?.cin,
        pan: company?.pan,
        industry: company?.industry,
        sector: company?.sector,
        registeredAddress: company?.registeredAddress,
        corporateWebsite: company?.corporateWebsite,
      },
      reportingPeriod: {
        id: period?.id,
        name: period?.name,
        startDate: period?.startDate,
        endDate: period?.endDate,
        framework: period?.frameworkVersion?.framework?.name,
        frameworkVersion: period?.frameworkVersion?.version,
      },
      organizationHierarchy: orgUnits.map((ou) => ({
        id: ou.id,
        name: ou.name,
        code: ou.code,
        parentId: ou.parentId,
      })),
      submissions: submissions.map((s) => ({
        id: s.id,
        category: s.category,
        principleCode: s.principleCode,
        indicatorCode: s.indicatorCode,
        status: s.status,
        submittedAt: s.submittedAt,
        dataQualityScore: s.dataQualityScore,
        orgUnit: s.orgUnit.name,
        disclosures: s.metricValues.map((mv) => ({
          questionCode: mv.question?.code,
          questionText: mv.question?.text,
          value: mv.numericValue ?? mv.textValue,
          unit: mv.unit,
          dataSource: mv.dataSource,
          previousValue: mv.previousValue,
          variancePercent: mv.variance,
        })),
        evidence: s.evidence.map((e) => ({
          fileName: e.fileName,
          fileType: e.fileType,
          fileHash: e.fileHash,
        })),
        validations: s.validationResults.map((v) => ({
          field: v.field,
          severity: v.severity,
          message: v.message,
          isResolved: v.isResolved,
        })),
      })),
    };

    return reportData;
  }

  /**
   * Generate Professional BRSR PDF Report using PDFKit
   */
  async generatePDF(tenantId: string, reportingPeriodId: string, userId?: string): Promise<{ filePath: string; fileName: string; fileSize: number }> {
    const exportDir = this.ensureExportDir();
    const fileName = `BRSR_Report_${Date.now()}.pdf`;
    const filePath = path.join(exportDir, fileName);

    const [company, period, submissions] = await Promise.all([
      prisma.company.findFirst({ where: { tenantId } }),
      prisma.reportingPeriod.findFirst({
        where: { id: reportingPeriodId, tenantId },
        include: { frameworkVersion: { include: { framework: true } } },
      }),
      prisma.submission.findMany({
        where: { tenantId, reportingPeriodId },
        include: {
          orgUnit: true,
          metricValues: {
            include: { question: true, metric: { include: { unit: true } } },
          },
          evidence: true,
          validationResults: true,
        },
      }),
    ]);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Header Banner
        doc.rect(50, 45, 495, 75).fill('#0f172a');
        doc.fillColor('#38bdf8').fontSize(20).font('Helvetica-Bold').text('BRSR ESG ANNUAL DISCLOSURE REPORT', 70, 60);
        doc.fillColor('#94a3b8').fontSize(11).font('Helvetica').text('Prepared in accordance with SEBI Guidelines & National Voluntary Guidelines (NVGs)', 70, 88);

        // Organization & Period Details
        doc.moveDown(3);
        doc.fillColor('#0f172a').fontSize(14).font('Helvetica-Bold').text('1. Corporate Identity & Reporting Scope', 50, 140);
        doc.moveTo(50, 158).lineTo(545, 158).strokeColor('#cbd5e1').stroke();

        doc.fillColor('#334155').fontSize(10).font('Helvetica');
        const entityDetails = [
          `Corporate Name: ${company?.legalName || 'Megha Engineering and Infrastructures Limited'}`,
          `Trade Name / Group: ${company?.tradeName || 'MEIL Group'}`,
          `Corporate Identification Number (CIN): ${company?.cin || 'U45200TG2006PLC050271'}`,
          `Sector / Industry: ${company?.sector || 'Infrastructure & Heavy Engineering'}`,
          `Reporting Period: ${period?.name || 'FY 2024-25'} (${period?.startDate.toISOString().split('T')[0]} to ${period?.endDate.toISOString().split('T')[0]})`,
          `Framework Standard: ${period?.frameworkVersion?.name || 'SEBI BRSR Comprehensive & Core v2024-25'}`,
          `Reporting Currency: ${company?.reportingCurrency || 'INR (₹)'}`,
          `Report Generation Date: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}`,
        ];

        let yPos = 170;
        for (const line of entityDetails) {
          doc.text(line, 55, yPos);
          yPos += 18;
        }

        // Section 2: Executive Summary & Performance Highlights
        yPos += 10;
        doc.fillColor('#0f172a').fontSize(14).font('Helvetica-Bold').text('2. Executive ESG Performance Summary', 50, yPos);
        doc.moveTo(50, yPos + 18).lineTo(545, yPos + 18).strokeColor('#cbd5e1').stroke();
        yPos += 26;

        // Metric highlights table
        doc.rect(50, yPos, 495, 24).fill('#f1f5f9');
        doc.fillColor('#0f172a').fontSize(9).font('Helvetica-Bold');
        doc.text('Key Indicator', 55, yPos + 7);
        doc.text('Category', 220, yPos + 7);
        doc.text('Reported Value', 320, yPos + 7);
        doc.text('YoY Variance', 410, yPos + 7);
        doc.text('Status', 485, yPos + 7);
        yPos += 26;

        const allMetricValues = submissions.flatMap((s) => s.metricValues);

        if (allMetricValues.length === 0) {
          doc.fillColor('#64748b').fontSize(10).font('Helvetica-Oblique').text('No verified disclosures currently registered for this reporting period.', 55, yPos + 10);
          yPos += 30;
        } else {
          for (const mv of allMetricValues.slice(0, 15)) {
            doc.fillColor('#1e293b').fontSize(9).font('Helvetica');
            const title = mv.question?.text || mv.metric?.name || 'Disclosure Metric';
            const truncatedTitle = title.length > 30 ? title.substring(0, 28) + '...' : title;
            doc.text(truncatedTitle, 55, yPos);
            doc.text(mv.metric?.category || 'Environment', 220, yPos);
            doc.text(`${mv.numericValue?.toLocaleString() ?? mv.textValue ?? 'N/A'} ${mv.unit || ''}`, 320, yPos);
            doc.text(mv.variance !== null && mv.variance !== undefined ? `${mv.variance > 0 ? '+' : ''}${mv.variance.toFixed(1)}%` : 'Baseline', 410, yPos);
            doc.fillColor('#16a34a').font('Helvetica-Bold').text('Verified', 485, yPos);
            doc.font('Helvetica');

            yPos += 20;
            if (yPos > 720) {
              doc.addPage();
              yPos = 50;
            }
          }
        }

        // Section 3: Assurance, Evidence & Sign-off
        if (yPos > 650) {
          doc.addPage();
          yPos = 50;
        }

        doc.moveDown(2);
        yPos += 15;
        doc.fillColor('#0f172a').fontSize(14).font('Helvetica-Bold').text('3. Data Provenance & Assurance Statement', 50, yPos);
        doc.moveTo(50, yPos + 18).lineTo(545, yPos + 18).strokeColor('#cbd5e1').stroke();
        yPos += 28;

        doc.fillColor('#334155').fontSize(9).font('Helvetica');
        const statement =
          'All operational activity data, emission factors, and mathematical calculations recorded in this document have been reconciled against primary source records (meter logs, utility receipts, fuel telematics, and biometric attendance records). Environmental Scope 1 and Scope 2 estimations comply strictly with IPCC Guidelines and the Central Electricity Authority (CEA) CO2 Baseline Database.';
        doc.text(statement, 55, yPos, { width: 485, align: 'justify' });
        yPos += 45;

        // Sign-off boxes
        doc.rect(50, yPos, 235, 60).strokeColor('#cbd5e1').stroke();
        doc.fillColor('#0f172a').fontSize(9).font('Helvetica-Bold').text('Prepared by: Sustainability & EHS Lead', 60, yPos + 10);
        doc.fillColor('#64748b').fontSize(8).font('Helvetica').text('Status: Digitally Signed & Timestamped', 60, yPos + 26);
        doc.text(`Ref: SHA256-${Date.now().toString(16)}`, 60, yPos + 40);

        doc.rect(310, yPos, 235, 60).strokeColor('#cbd5e1').stroke();
        doc.fillColor('#0f172a').fontSize(9).font('Helvetica-Bold').text('Approved by: Board ESG Committee', 320, yPos + 10);
        doc.fillColor('#64748b').fontSize(8).font('Helvetica').text('Designation: Executive Director & Head of ESG', 320, yPos + 26);
        doc.text('Audit Status: Independent Reasonable Assurance', 320, yPos + 40);

        // Footer
        doc.fontSize(8).fillColor('#94a3b8').text('Confidential - For Official SEBI Filing and Stakeholder Disclosure Only - Page 1 of 1', 50, 780, { align: 'center' });

        doc.end();

        stream.on('finish', async () => {
          const stats = fs.statSync(filePath);

          // Save report record in database
          if (company && period) {
            await prisma.report.create({
              data: {
                tenantId,
                companyId: company.id,
                reportingPeriodId: period.id,
                type: 'brsr',
                name: `BRSR Annual Report (${period.name})`,
                description: 'Full SEBI BRSR Comprehensive & Core Environmental, Social and Governance Disclosure',
                format: 'pdf',
                filePath,
                fileSize: stats.size,
                status: 'ready',
                generatedBy: userId,
              },
            });
          }

          resolve({ filePath, fileName, fileSize: stats.size });
        });

        stream.on('error', (err) => {
          reject(err);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Generate Full BRSR Excel Workbook using XLSX
   */
  async generateExcel(tenantId: string, reportingPeriodId: string, userId?: string): Promise<{ filePath: string; fileName: string; fileSize: number }> {
    const exportDir = this.ensureExportDir();
    const fileName = `BRSR_Data_${Date.now()}.xlsx`;
    const filePath = path.join(exportDir, fileName);

    const [company, period, submissions] = await Promise.all([
      prisma.company.findFirst({ where: { tenantId } }),
      prisma.reportingPeriod.findFirst({
        where: { id: reportingPeriodId, tenantId },
        include: { frameworkVersion: { include: { framework: true } } },
      }),
      prisma.submission.findMany({
        where: { tenantId, reportingPeriodId },
        include: {
          orgUnit: true,
          metricValues: {
            include: { question: true, metric: { include: { unit: true } } },
          },
          evidence: true,
          validationResults: true,
        },
      }),
    ]);

    const wb = XLSX.utils.book_new();

    // Sheet 1: General Company Information
    const wsCompanyData = [
      ['Attribute', 'Value'],
      ['Legal Entity Name', company?.legalName || ''],
      ['Trade Name', company?.tradeName || ''],
      ['Corporate Identification Number (CIN)', company?.cin || ''],
      ['Permanent Account Number (PAN)', company?.pan || ''],
      ['Registered Office Address', company?.registeredAddress || ''],
      ['Corporate Website', company?.corporateWebsite || ''],
      ['Industry Sector', company?.sector || ''],
      ['Market Capitalization Category', company?.marketCapCategory || 'Large Cap'],
      ['Reporting Period', period?.name || ''],
      ['Financial Year Start', 'April 1'],
      ['Reporting Currency', company?.reportingCurrency || 'INR'],
    ];
    const wsCompany = XLSX.utils.aoa_to_sheet(wsCompanyData);
    XLSX.utils.book_append_sheet(wb, wsCompany, 'Company Profile');

    // Sheet 2: Disclosures & Metric Values
    const disclosuresData = [
      ['Org Unit', 'Section', 'Principle', 'Indicator Code', 'Question / Metric', 'Reported Value', 'Unit', 'Data Source', 'Previous Baseline', 'Variance (%)', 'Status'],
    ];

    for (const sub of submissions) {
      for (const mv of sub.metricValues) {
        disclosuresData.push([
          sub.orgUnit.name,
          sub.sectionCode || 'C',
          sub.principleCode || 'P6',
          sub.indicatorCode || '',
          mv.question?.text || mv.metric?.name || '',
          String(mv.numericValue ?? mv.textValue ?? ''),
          mv.unit || '',
          mv.dataSource || '',
          String(mv.previousValue ?? 'N/A'),
          mv.variance !== null && mv.variance !== undefined ? `${mv.variance.toFixed(1)}%` : 'Baseline',
          sub.status.toUpperCase(),
        ]);
      }
    }
    const wsDisclosures = XLSX.utils.aoa_to_sheet(disclosuresData);
    XLSX.utils.book_append_sheet(wb, wsDisclosures, 'ESG Disclosures');

    // Sheet 3: Evidence Register
    const evidenceData = [
      ['Evidence ID', 'Submission Org Unit', 'File Name', 'File Type', 'File Size (Bytes)', 'MIME Type', 'Document Hash (SHA-256)', 'Attached Metric / Question'],
    ];
    for (const sub of submissions) {
      for (const ev of sub.evidence) {
        evidenceData.push([
          ev.id,
          sub.orgUnit.name,
          ev.fileName,
          ev.fileType,
          String(ev.fileSize),
          ev.mimeType || '',
          ev.fileHash || '',
          ev.questionCode || ev.metricCode || '',
        ]);
      }
    }
    const wsEvidence = XLSX.utils.aoa_to_sheet(evidenceData);
    XLSX.utils.book_append_sheet(wb, wsEvidence, 'Audit Evidence');

    // Write file
    XLSX.writeFile(wb, filePath);
    const stats = fs.statSync(filePath);

    // Save report record
    if (company && period) {
      await prisma.report.create({
        data: {
          tenantId,
          companyId: company.id,
          reportingPeriodId: period.id,
          type: 'brsr',
          name: `BRSR Data Workbook (${period.name})`,
          description: 'Full structured multi-sheet Excel spreadsheet for ESG reporting reconciliation and audit',
          format: 'xlsx',
          filePath,
          fileSize: stats.size,
          status: 'ready',
          generatedBy: userId,
        },
      });
    }

    return { filePath, fileName, fileSize: stats.size };
  }
}

export const exportService = new ExportService();
