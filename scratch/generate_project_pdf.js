const fs = require('fs');
const path = require('path');
const PDFDocument = require(path.resolve(__dirname, '../backend/node_modules/pdfkit/js/pdfkit.js'));

const outputPath = path.resolve('c:/ESG Bibek 2/ESG360_Project_Documentation_Complete.pdf');

// Create document with buffered pages
const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 40, bottom: 40, left: 45, right: 45 },
  bufferPages: true,
  autoFirstPage: true,
  info: {
    Title: 'ESG360 - Smart ESG & BRSR Reporting Platform Specification',
    Author: 'MEIL Corporate Sustainability & Engineering',
    Subject: 'Problem Statement 08: ESG Reporting Software - Complete Functional & Architectural Specification',
    Keywords: 'ESG, BRSR, SEBI, Sustainability, MEIL Group, Greenwashing Prevention, Auditing',
  }
});

const writeStream = fs.createWriteStream(outputPath);
doc.pipe(writeStream);

// Palette definitions (Astra Theme: Amber Gold, Amethyst Purple, Rose Coral, Charcoal)
const C_DARK = '#0B0F19';
const C_CARD = '#161E2E';
const C_GOLD = '#B45309';
const C_GOLD_LIGHT = '#F59E0B';
const C_GOLD_BG = '#FEF3C7';
const C_PURPLE = '#6D28D9';
const C_PURPLE_BG = '#EDE9FE';
const C_ROSE = '#BE123C';
const C_ROSE_BG = '#FFE4E6';
const C_TEXT = '#1F2937';
const C_MUTED = '#4B5563';
const C_LIGHT_BG = '#F8FAFC';
const C_BORDER = '#CBD5E1';

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN_LEFT = 45;
const MARGIN_RIGHT = 45;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT; // 505.28 pt

function ensureSpace(neededHeight) {
  if (doc.y + neededHeight > PAGE_HEIGHT - 50) {
    doc.addPage();
  }
}

function drawSectionBanner(title, subtitle = null, color = C_DARK) {
  ensureSpace(subtitle ? 55 : 40);
  const startY = doc.y;
  const boxHeight = subtitle ? 42 : 30;
  
  // Side accent bar
  doc.rect(MARGIN_LEFT, startY, 5, boxHeight).fill(color === C_DARK ? C_GOLD_LIGHT : color);
  // Background
  doc.rect(MARGIN_LEFT + 5, startY, CONTENT_WIDTH - 5, boxHeight).fill(C_LIGHT_BG);
  
  // Text
  doc.fillColor(C_DARK).fontSize(12).font('Helvetica-Bold')
     .text(title.toUpperCase(), MARGIN_LEFT + 15, startY + 7, { width: CONTENT_WIDTH - 25, lineBreak: false });
     
  if (subtitle) {
    doc.fillColor(C_MUTED).fontSize(8.5).font('Helvetica')
       .text(subtitle, MARGIN_LEFT + 15, startY + 24, { width: CONTENT_WIDTH - 25, lineBreak: false });
    doc.y = startY + boxHeight + 10;
  } else {
    doc.y = startY + boxHeight + 8;
  }
}

function drawSubheading(title) {
  ensureSpace(24);
  const startY = doc.y + 4;
  
  // Little square accent
  doc.rect(MARGIN_LEFT, startY + 2, 6, 6).fill(C_PURPLE);
  
  doc.fillColor(C_PURPLE).fontSize(10).font('Helvetica-Bold')
     .text(title, MARGIN_LEFT + 12, startY, { width: CONTENT_WIDTH - 12 });
  doc.moveDown(0.2);
}

function drawParagraph(text, font = 'Helvetica', size = 8.5, color = C_TEXT, indent = 0) {
  ensureSpace(14);
  doc.fillColor(color).fontSize(size).font(font)
     .text(text, MARGIN_LEFT + indent, doc.y, {
       width: CONTENT_WIDTH - indent,
       align: 'justify',
       lineGap: 2
     });
  doc.moveDown(0.25);
}

function drawBullet(boldPrefix, normalText, indent = 12) {
  ensureSpace(16);
  const startX = MARGIN_LEFT + indent;
  const currentY = doc.y;
  
  // Small circle bullet
  doc.circle(startX - 5, currentY + 5, 2).fill(C_GOLD_LIGHT);
     
  doc.fillColor(C_DARK).fontSize(8.5).font('Helvetica-Bold')
     .text(boldPrefix + ' ', startX, currentY, { continued: true });
     
  doc.fillColor(C_TEXT).fontSize(8.5).font('Helvetica')
     .text(normalText, {
       width: CONTENT_WIDTH - indent,
       align: 'justify',
       lineGap: 1.8
     });
  doc.moveDown(0.2);
}

function drawCallout(title, body, type = 'gold') {
  doc.fontSize(8).font('Helvetica');
  const textHeight = doc.heightOfString(body, { width: CONTENT_WIDTH - 24, lineGap: 1.8 });
  const boxHeight = 22 + textHeight;
  ensureSpace(boxHeight + 10);
  const startY = doc.y;
  const bgColor = type === 'purple' ? C_PURPLE_BG : (type === 'rose' ? C_ROSE_BG : C_GOLD_BG);
  const accentColor = type === 'purple' ? C_PURPLE : (type === 'rose' ? C_ROSE : C_GOLD);
  
  doc.rect(MARGIN_LEFT, startY, CONTENT_WIDTH, boxHeight).fill(bgColor);
  doc.rect(MARGIN_LEFT, startY, 4, boxHeight).fill(accentColor);
  
  doc.fillColor(accentColor).fontSize(8.5).font('Helvetica-Bold')
     .text(title, MARGIN_LEFT + 12, startY + 6, { width: CONTENT_WIDTH - 24, lineBreak: false });
     
  doc.fillColor(C_DARK).fontSize(8).font('Helvetica')
     .text(body, MARGIN_LEFT + 12, startY + 19, {
       width: CONTENT_WIDTH - 24,
       lineGap: 1.8
     });
     
  doc.y = startY + boxHeight + 10;
}

function drawTable(headers, rows, colWidths, options = {}) {
  const headerHeight = 20;
  
  // Calculate heights for all rows
  doc.fontSize(7.5).font('Helvetica');
  const computedRowHeights = rows.map(row => {
    let maxH = options.rowHeight || 16;
    row.forEach((cell, i) => {
      const h = doc.heightOfString(String(cell), { width: colWidths[i] - 10, lineGap: 1.5 }) + 7;
      if (h > maxH) maxH = h;
    });
    return maxH;
  });

  const totalTableHeight = headerHeight + computedRowHeights.reduce((a, b) => a + b, 0);
  ensureSpace(headerHeight + computedRowHeights[0] + 10);
  
  let currentY = doc.y;
  
  // Header
  doc.rect(MARGIN_LEFT, currentY, CONTENT_WIDTH, headerHeight).fill(C_DARK);
  let curX = MARGIN_LEFT;
  headers.forEach((h, i) => {
    doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica-Bold')
       .text(h, curX + 5, currentY + 5.5, { width: colWidths[i] - 10, align: options.align && options.align[i] ? options.align[i] : 'left', lineBreak: false });
    curX += colWidths[i];
  });
  
  currentY += headerHeight;
  
  // Rows
  rows.forEach((row, rowIndex) => {
    const rHeight = computedRowHeights[rowIndex];
    if (currentY + rHeight > PAGE_HEIGHT - 50) {
      doc.addPage();
      currentY = MARGIN_LEFT;
    }
    
    const isEven = rowIndex % 2 === 0;
    doc.rect(MARGIN_LEFT, currentY, CONTENT_WIDTH, rHeight).fill(isEven ? '#FFFFFF' : C_LIGHT_BG);
    doc.rect(MARGIN_LEFT, currentY, CONTENT_WIDTH, rHeight).strokeColor(C_BORDER).lineWidth(0.5).stroke();
    
    let cellX = MARGIN_LEFT;
    row.forEach((cell, cellIndex) => {
      const isBold = options.boldCols && options.boldCols.includes(cellIndex);
      doc.fillColor(C_TEXT).fontSize(7.5).font(isBold ? 'Helvetica-Bold' : 'Helvetica')
         .text(String(cell), cellX + 5, currentY + 4, {
           width: colWidths[cellIndex] - 10,
           align: options.align && options.align[cellIndex] ? options.align[cellIndex] : 'left',
           lineGap: 1.5
         });
      cellX += colWidths[cellIndex];
    });
    currentY += rHeight;
  });
  
  doc.y = currentY + 10;
}

// =========================================================================
// 1. COVER PAGE / EXECUTIVE FRONT MATTER
// =========================================================================

doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT).fill(C_DARK);

// Gold geometric accent lines
doc.rect(MARGIN_LEFT, 50, CONTENT_WIDTH, 4).fill(C_GOLD_LIGHT);
doc.rect(MARGIN_LEFT, 58, 80, 2).fill(C_PURPLE);

// Super Header
doc.fillColor(C_GOLD_LIGHT).fontSize(11).font('Helvetica-Bold')
   .text('PROBLEM STATEMENT 08  •  ENTERPRISE ESG & BRSR COMPLIANCE', MARGIN_LEFT, 85);

doc.fillColor('#FFFFFF').fontSize(26).font('Helvetica-Bold')
   .text('ESG360 PLATFORM', MARGIN_LEFT, 105);

doc.fillColor('#E5E7EB').fontSize(14).font('Helvetica')
   .text('Smart ESG Data Collection, Validation, Audit & BRSR Reporting System', MARGIN_LEFT, 138);

doc.rect(MARGIN_LEFT, 165, CONTENT_WIDTH, 1).fill('#374151');

// Tagline
doc.fillColor(C_GOLD_LIGHT).fontSize(11).font('Helvetica-Bold')
   .text('CORE VALUE PROPOSITION & SYSTEM TAGLINE:', MARGIN_LEFT, 185);

doc.fillColor('#F3F4F6').fontSize(13).font('Helvetica-Oblique')
   .text('"Collect. Validate. Analyze. Assure. Report."', MARGIN_LEFT, 204);

// Executive Synopsis Card
doc.rect(MARGIN_LEFT, 240, CONTENT_WIDTH, 160).fill(C_CARD);
doc.rect(MARGIN_LEFT, 240, 4, 160).fill(C_PURPLE);

doc.fillColor('#FFFFFF').fontSize(11).font('Helvetica-Bold')
   .text('EXECUTIVE SPECIFICATION & ARCHITECTURAL BLUEPRINT', MARGIN_LEFT + 18, 256);

doc.fillColor('#D1D5DB').fontSize(8.5).font('Helvetica')
   .text(
     'This comprehensive document delivers the authoritative technical, functional, and regulatory specification for ESG360. Developed specifically to solve the reporting challenges of large conglomerates operating multi-subsidiary, multi-site heavy engineering operations (such as MEIL Group), ESG360 digitizes and automates the complete lifecycle of ESG compliance in direct accordance with the Securities and Exchange Board of India (SEBI) Business Responsibility and Sustainability Reporting (BRSR) circular (July 2023).\n\n' +
     'The platform replaces error-prone spreadsheets with deterministic calculation engines, 11-rule automated validation gates, cryptographic SHA-256 evidence vaults, immutable audit logging, and grounded AI assistance - ensuring absolute audit-readiness and zero-greenwashing compliance.',
     MARGIN_LEFT + 18,
     276,
     { width: CONTENT_WIDTH - 36, align: 'justify', lineGap: 2.5 }
   );

// Metadata Grid on Cover
const metaBoxY = 425;
doc.rect(MARGIN_LEFT, metaBoxY, CONTENT_WIDTH, 175).fill('#111827');
doc.rect(MARGIN_LEFT, metaBoxY, CONTENT_WIDTH, 175).strokeColor('#374151').lineWidth(1).stroke();

const col1X = MARGIN_LEFT + 18;
const col2X = MARGIN_LEFT + (CONTENT_WIDTH / 2) + 10;

doc.fillColor(C_GOLD_LIGHT).fontSize(9.5).font('Helvetica-Bold').text('PROJECT METADATA', col1X, metaBoxY + 14);
doc.fillColor('#9CA3AF').fontSize(8).font('Helvetica').text('Corporate Entity:', col1X, metaBoxY + 34);
doc.fillColor('#FFFFFF').fontSize(8.5).font('Helvetica-Bold').text('Megha Engineering & Infrastructures Ltd (MEIL)', col1X, metaBoxY + 45);

doc.fillColor('#9CA3AF').fontSize(8).font('Helvetica').text('Regulatory Mandate:', col1X, metaBoxY + 65);
doc.fillColor('#FFFFFF').fontSize(8.5).font('Helvetica-Bold').text('SEBI Circular SEBI/HO/CFD/CFD-SEC-2/P/CIR/2023/122', col1X, metaBoxY + 76);

doc.fillColor('#9CA3AF').fontSize(8).font('Helvetica').text('Assurance Standard:', col1X, metaBoxY + 96);
doc.fillColor('#FFFFFF').fontSize(8.5).font('Helvetica-Bold').text('BRSR Core 9 Mandatory Reasonable Assurance KPIs', col1X, metaBoxY + 107);

doc.fillColor('#9CA3AF').fontSize(8).font('Helvetica').text('Operating Scope:', col1X, metaBoxY + 127);
doc.fillColor('#FFFFFF').fontSize(8.5).font('Helvetica-Bold').text('250+ Pan-India & Global Infrastructure Sites', col1X, metaBoxY + 138);

doc.fillColor('#9CA3AF').fontSize(8).font('Helvetica').text('System Version & Build:', col2X, metaBoxY + 34);
doc.fillColor('#FFFFFF').fontSize(8.5).font('Helvetica-Bold').text('v2.0.0 Production (Next.js 16 + Express + TypeScript)', col2X, metaBoxY + 45);

doc.fillColor('#9CA3AF').fontSize(8).font('Helvetica').text('Auditor Personas Supported:', col2X, metaBoxY + 65);
doc.fillColor('#FFFFFF').fontSize(8.5).font('Helvetica-Bold').text('BSI, DNV, EY, KPMG External Assurers & Internal ESG', col2X, metaBoxY + 76);

doc.fillColor('#9CA3AF').fontSize(8).font('Helvetica').text('Specification Scope:', col2X, metaBoxY + 96);
doc.fillColor('#FFFFFF').fontSize(8.5).font('Helvetica-Bold').text('22 Core Modules, Formulations & DAG Lineage', col2X, metaBoxY + 107);

doc.fillColor('#9CA3AF').fontSize(8).font('Helvetica').text('Current Status:', col2X, metaBoxY + 127);
doc.fillColor(C_GOLD_LIGHT).fontSize(8.5).font('Helvetica-Bold').text('Deployed & Healthy on localhost:3000 / 4000', col2X, metaBoxY + 138);

// Cover Footer
doc.fillColor(C_GOLD_LIGHT).fontSize(9).font('Helvetica-Bold')
   .text('"From Fragmented ESG Telemetry to Audit-Grade SEBI BRSR Filings, All in One Unified Platform."', MARGIN_LEFT, 720, { align: 'center', width: CONTENT_WIDTH });

doc.fillColor('#6B7280').fontSize(7.5).font('Helvetica')
   .text('Confidential • For Evaluation and Enterprise Deployment • MEIL Corporate Sustainability Directorate', MARGIN_LEFT, 742, { align: 'center', width: CONTENT_WIDTH });

// =========================================================================
// 2. PROBLEM STATEMENT & THE CONGLOMERATE CHALLENGE
// =========================================================================
doc.addPage();

drawSectionBanner('1. The Problem Statement & Industry Challenge', 'Problem Statement 08: ESG Reporting Software & The Corporate Compliance Dilemma');

drawParagraph(
  'Environmental, Social, and Governance (ESG) compliance has rapidly shifted from voluntary corporate public relations disclosures to strict statutory obligations backed by regulatory penalties. In India, the Securities and Exchange Board of India (SEBI) mandated the Business Responsibility and Sustainability Report (BRSR) framework for the top 1,000 listed entities, and further introduced mandatory "Reasonable Assurance" over BRSR Core attributes starting FY 2023-24.'
);

drawSubheading('1.1 The Operational Nightmare for Conglomerates (MEIL Group Case Study)');

drawParagraph(
  'Large conglomerates like Megha Engineering & Infrastructures Limited (MEIL) operate across massive geographical expanses, multiple industrial verticals (Power, Transport, Water, Hydrocarbons, EV Mobility), and complex tiered operating structures:'
);

drawBullet('Massive Operational Scale:', 'Over 250+ active project sites distributed pan-India and globally (e.g., Zojila Tunnel in Jammu & Kashmir, Kaleshwaram Lift Irrigation in Telangana, Polavaram Irrigation, Olectra EV Bus manufacturing facilities).');
drawBullet('Data Fragmentation & "Spreadsheet Hell":', 'ESG metrics were historically captured via disconnected Microsoft Excel workbooks emailed by site managers. Each site used disparate measurement units (gallons vs litres, units vs MWh, kilograms vs metric tonnes).');
drawBullet('Severe Greenwashing & Compliance Exposure:', 'Manual formulas in spreadsheets frequently contain broken circular references, inadvertent omissions, or fabricated metrics. Without automated mathematical verification, conglomerates face severe regulatory scrutiny and reputational loss.');
drawBullet('Absence of Evidence & Audit Lineage:', 'When tier-1 external assurance firms (BSI, DNV, EY, KPMG) inspect reported Scope 1 or Scope 2 emissions, site teams struggle to link final rolled-up figures back to certified primary fuel receipts, electricity bills, or calibrated flowmeters.');
drawBullet('Inability to Disaggregate Performance:', 'Corporate leadership could see high-level numbers but could not isolate which business unit or subsidiary caused emissions spikes or safety incidents.');

drawCallout(
  'KEY DEFICIENCY ADDRESSED BY ESG360',
  'Spreadsheets lack tenant security, role-based segregation of duties, validation state machines, mathematical determinism, cryptographic lineage, and audit trails. ESG360 replaces spreadsheet chaos with an enterprise single-pane-of-glass platform.',
  'rose'
);

drawSectionBanner('2. The Proposed Solution & Core Value Proposition', 'How ESG360 Solves Every Dimension of the Conglomerate Reporting Crisis');

drawParagraph(
  'ESG360 is an intelligent, audit-ready, full-stack ESG Reporting Platform engineered from first principles to automate the complete data lifecycle across complex conglomerate hierarchies. Built upon a 12-Pillar Core Architecture, ESG360 enforces automated bottom-up data aggregation:'
);

drawCallout(
  'BOTTOM-UP HIERARCHICAL AGGREGATION MODEL (SECTION 3)',
  'Project Site Level (Zojila Tunnel / Kaleshwaram)\n  --> Business Unit Level (Transportation / Water)\n    --> Subsidiary Level (MEIL Infra / MEIL Energy)\n      --> MEIL Group Corporate Board',
  'purple'
);

drawSubheading('2.1 The 12 Foundational Pillars of ESG360');

const pillarHeaders = ['Pillar #', 'Architectural Pillar', 'Core Problem Solved in Platform'];
const pillarRows = [
  ['01', 'Multi-Tier Data Collection', 'Disaggregated quantitative and qualitative forms per SEBI BRSR structure.'],
  ['02', 'Automated Validation Engine', '11 real-time server-side rules preventing dirty data, invalid units, and missing fields.'],
  ['03', 'Deterministic Calculation Engine', 'Server-side IPCC 2006 Scope 1 and CEA Baseline Scope 2 emission calculators.'],
  ['04', 'BRSR & BRSR Core Mapping Engine', 'Native cross-referencing to Principles P1-P9 and the 9 SEBI Core Assurance KPIs.'],
  ['05', 'Multi-Stage Approval Workflow', 'Formal state machine enforcing maker-checker segregation of duties.'],
  ['06', 'Cryptographic Evidence Vault', 'SHA-256 file fingerprinting linking primary PDF invoices directly to metric values.'],
  ['07', 'Immutable Audit Ledger', 'Append-only ledger logging user, IP, timestamp, old value, and new value on all changes.'],
  ['08', 'Executive ESG Dashboard', 'Real-time corporate command center tracking ESG score (88/100) and pending actions.'],
  ['09', 'Data Quality Scoring System', '5-pillar mathematical algorithm grading enterprise audit-readiness (94/100).'],
  ['10', 'Multi-Dimensional Analytics', 'Dynamic comparative visualization across Carbon, Energy, Water, Waste, Workforce.'],
  ['11', 'Grounded Semantic AI Assistant', 'RAG AI assistant grounded in actual DB metrics with verified source citations.'],
  ['12', 'Multi-Format Regulatory Reporting', 'Instant generation of audit-grade PDF, multi-sheet Excel workbooks, and JSON filings.']
];

drawTable(pillarHeaders, pillarRows, [45, 160, 300], { boldCols: [0, 1] });

// =========================================================================
// 3. WORKFLOWS & END-TO-END DATA LIFECYCLE
// =========================================================================
doc.addPage();

drawSectionBanner('3. System Workflows & The End-to-End Data Lifecycle', 'How Data Traverses the Platform: From Project Site Telemetry to Board Approval');

drawParagraph(
  'A core innovation of ESG360 is replacing informal email exchanges with a deterministic, state-machine driven workflow. Data flows through a 7-stage verifiable lifecycle where every transition is validated and recorded in an immutable audit ledger.'
);

drawSubheading('3.1 The 7-Stage End-to-End Reporting Workflow');

drawBullet('Stage 1: Multi-Unit Data Capture (Site Data Owner):', 'Site officers (e.g., Ravi Kumar at Zojila Tunnel Site) log in and access custom disclosure forms pre-filtered for their operational unit. Forms dynamically enforce units (e.g., Litres for diesel, MWh for grid power).');
drawBullet('Stage 2: Mandatory Evidence Upload & Cryptographic Fingerprinting:', 'For material disclosures, users upload primary documentation (e.g., Electricity_Bill_June.pdf or fuel delivery notes). The backend immediately computes the file\'s SHA-256 cryptographic digest, permanently stamping it with uploader ID and UTC timestamp.');
drawBullet('Stage 3: Server-Side Deterministic Calculation:', 'The platform does not rely on user math. When diesel volume (25,000 L) is submitted, the server executes IPCC Scope 1 formulas (25,000 * 2.68 / 1,000 = 67.0 MT CO2e) and links inputs to calculation records.');
drawBullet('Stage 4: Automated 11-Rule Validation & Anomaly Detection:', 'The submission is immediately evaluated across 11 validation gates. If a site reports an anomalous jump (e.g., 1,280 MWh jumping to 8,900 MWh in July), the anomaly engine flags a warning banner with Review, Accept, or Request Correction triggers.');
drawBullet('Stage 5: Departmental & Subsidiary Reviewer Assessment:', 'The submission enters the UNDER_REVIEW stage. The Subsidiary Environmental Auditor inspects disclosures against attached evidence files and either approves or transitions the submission to CHANGES_REQUESTED with line-item comments.');
drawBullet('Stage 6: Corporate ESG Manager & Executive Approval:', 'The Corporate ESG Manager verifies conglomerate-wide rollups. Executive sign-off is permanently blocked if unresolved high-severity validation errors exist.');
drawBullet('Stage 7: Regulatory Consolidation & Instant Report Publication:', 'Once approved, data is incorporated into group aggregations, refreshing the live ESG Score, Data Quality Score, and enabling 1-click generation of SEBI BRSR filings.');

drawSubheading('3.2 Formal State Transition Machine');

const stateBoxY = doc.y + 4;
doc.rect(MARGIN_LEFT, stateBoxY, CONTENT_WIDTH, 60).fill(C_LIGHT_BG);
doc.rect(MARGIN_LEFT, stateBoxY, CONTENT_WIDTH, 60).strokeColor(C_BORDER).stroke();

doc.fillColor(C_DARK).fontSize(8).font('Courier-Bold')
   .text('[DRAFT] ---> [SUBMITTED] ---> [UNDER_REVIEW] ---> [REVIEWED] ---> [APPROVED] ---> [CONSOLIDATED]', MARGIN_LEFT + 12, stateBoxY + 14);

doc.fillColor(C_ROSE).fontSize(7.5).font('Helvetica')
   .text('                   ^                     |', MARGIN_LEFT + 12, stateBoxY + 28);
doc.fillColor(C_ROSE).fontSize(7.5).font('Helvetica')
   .text('                   +-- [CHANGES_REQUESTED] <+ (Discrepancy / Incomplete Evidence / Math Check)', MARGIN_LEFT + 12, stateBoxY + 38);

doc.fillColor(C_MUTED).fontSize(7).font('Helvetica')
   .text('Note: Every transition generates an immutable audit record logging actor ID, previous status, next status, and remarks.', MARGIN_LEFT + 12, stateBoxY + 49);

doc.y = stateBoxY + 68;

drawSubheading('3.3 Hackathon Demo Walkthrough Flow (13 Interactive Steps)');

drawParagraph('To demonstrate full end-to-end capabilities under live evaluation conditions, ESG360 features a guided 13-step walkthrough modal directly accessible in the top navigation bar:');

const demoSteps = [
  ['Step 01', 'Login as Site Data Owner', 'Authenticate as Ravi Kumar (Site Energy Officer) using dedicated credentials.'],
  ['Step 02', 'Data Entry & Input Simulation', 'Input site fuel (25,000 Litres diesel) and purchased electricity consumption.'],
  ['Step 03', 'Evidence Upload & Digital Cert', 'Attach primary document Electricity_Bill_June.pdf with automatic SHA-256 hash.'],
  ['Step 04', 'Submit for Department Review', 'Dispatch submission with remarks into the formal maker-checker pipeline.'],
  ['Step 05', 'Automated ESG Calculations', 'Observe instantaneous server execution of Scope 1 and Scope 2 GHG formulas.'],
  ['Step 06', '11-Rule Automated Validation', 'Watch the validation suite execute unit, range, and mathematical consistency checks.'],
  ['Step 07', 'Interactive Anomaly Warning', 'Inspect July energy anomaly banner (1,280 -> 8,900 MWh) and test correction actions.'],
  ['Step 08', 'ESG Manager Review & Approval', 'Simulate ESG Manager persona and execute audit-backed approval.'],
  ['Step 09', 'Corporate Dashboard Refresh', 'Watch group KPIs auto-update: ESG Score = 88/100, Data Quality Score = 94/100.'],
  ['Step 10', 'BRSR Mapping Engine Launch', 'Inspect compliance matrices mapped against SEBI circular provisions.'],
  ['Step 11', 'Principles P1-P9 & Core Audit', 'Review progress bars across all 9 Principles and the 9 Core Assurance KPIs.'],
  ['Step 12', 'Grounded AI Assistant Query', 'Ask natural language queries and observe grounded responses with DB citations.'],
  ['Step 13', 'Generate Official BRSR Report', 'Click "GENERATE BRSR REPORT" to download the finalized SEBI regulatory PDF.']
];

drawTable(['Step #', 'Interactive Demo Action', 'Technical Execution & Verification Point'], demoSteps, [45, 160, 300], { boldCols: [0, 1] });

// =========================================================================
// 4. COMPLETE 22-SECTION MATRIX DEEP-DIVE
// =========================================================================
doc.addPage();

drawSectionBanner('4. Complete 22-Section Functional Matrix Deep-Dive', 'Exhaustive Specification of All Implemented Platform Features (01 through 22)');

const secHeaders = ['Sec #', 'Module Name', 'Functional Implementation & Capabilities'];
const secRows = [
  ['01', 'Project Objective', 'Automated BRSR & BRSR Core compliance platform uniting 250+ project sites under MEIL Group.'],
  ['02', 'Proposed Solution', '12-pillar continuous lifecycle architecture: Collect, Validate, Calculate, Assure, Report.'],
  ['03', 'Organizational Hierarchy', '4-tier recursive organizational tree: MEIL Group -> Subsidiaries -> Business Units -> Project Sites.'],
  ['04', 'ESG Data Collection', 'Disaggregated quantitative and qualitative forms covering Environmental, Social, and Governance.'],
  ['05', 'Data Validation Engine', '7 core validation rules plus historical anomaly detection banner (July 1,280 -> 8,900 MWh spike).'],
  ['06', 'Automatic ESG Calculations', 'Deterministic formulas for Scope 1 (Fuel * Factor) and Scope 2 (Grid * 0.716 CEA factor). Live UI simulator.'],
  ['07', 'BRSR Core Mapping', 'Interactive progress tracking across P1-P9 (P1: 100%, P2: 85%, P3: 92%, P4: 100%) and 9 Core KPIs.'],
  ['08', 'Approval Workflow', 'Formal multi-stage maker-checker workflow: Data Owner -> Reviewer -> ESG Manager -> Corporate.'],
  ['09', 'Evidence Management', 'Cryptographic file vault with SHA-256 hashing, Electricity_Bill_June.pdf sample, and tamper verification.'],
  ['10', 'Audit Trail & Lineage', 'Immutable ledger logging Ravi Kumar Scope 1 edit (1,250 -> 1,180 tCO2e), user, date, old/new value.'],
  ['11', 'Executive Dashboard', 'Corporate command center: ESG Score (88/100), Data Quality (94/100), completion dials, pending queues.'],
  ['12', 'Data Quality Score', '5-pillar mathematical score: Completeness 98%, Evidence 92%, Validation 96%, Approval 90%, Consistency 94%.'],
  ['13', 'ESG Analytics Engine', 'Multi-dimensional graphical charts comparing Carbon, Water, Waste, Workforce across time and org units.'],
  ['14', 'AI ESG Assistant', 'Grounded semantic assistant with prompt chips answering root-cause queries with exact DB citations.'],
  ['15', 'Role-Based Access Control', '5 discrete personas (Admin, Corporate Manager, Reviewer, Data Owner, Auditor) with 1-click simulation.'],
  ['16', 'Report Generation', '6 export categories: BRSR Annual Report, BRSR Core, Summary, KPI, Data Quality, Audit Ledger.'],
  ['17', 'Technology Stack', 'Next.js 16, React 19, Tailwind CSS Dark Astra (0% blue/green), Node.js, Express, TypeScript, Prisma, SQLite.'],
  ['18', 'Database Architecture', '25+ relational entities enforcing multi-tenant tenantId scoping and data integrity.'],
  ['19', 'Phased Development Plan', '6-phase software engineering execution roadmap delivered and verified.'],
  ['20', 'Hackathon Demo Flow', '13-step guided modal walking evaluators step-by-step through the end-to-end platform capabilities.'],
  ['21', 'Key Innovation & USP', 'Continuous, audit-ready data lifecycle replacing end-of-year retrospective spreadsheet scrambling.'],
  ['22', 'Final Vision & Scalability', 'Enterprise-grade foundation supporting 10,000+ disclosures across global conglomerate supply chains.']
];

drawTable(secHeaders, secRows, [38, 140, 327], { boldCols: [0, 1] });

// =========================================================================
// 5. MATHEMATICAL FORMULAS & CALCULATION ENGINES
// =========================================================================
doc.addPage();

drawSectionBanner('5. Mathematical Formulations & Deterministic Engines', 'Server-Side Formulas Preventing Calculation Errors and Greenwashing');

drawParagraph(
  'All material computations within ESG360 are executed strictly on the backend inside calculationService.ts. The UI provides interactive calculation simulators for verification, but no reported number can be manually overridden without passing through the deterministic formula parser.'
);

drawSubheading('5.1 Scope 1 Direct Greenhouse Gas Emissions (Fuel Combustion)');
drawParagraph('Calculated in strict compliance with the Intergovernmental Panel on Climate Change (IPCC) 2006 Guidelines:');

drawCallout(
  'SCOPE 1 EMISSIONS FORMULA',
  'Scope 1 (MT CO2e) = [Fuel Consumed (Litres) * Emission Factor (kg CO2e/L)] / 1,000\n\n' +
  'Standard IPCC Factors Configured in ESG360:\n' +
  '- High-Speed Diesel (HSD): 2.68 kg CO2e / Litre\n' +
  '- Motor Gasoline / Petrol: 2.31 kg CO2e / Litre\n' +
  '- Natural Gas (Compressed / Piped): 1.98 kg CO2e / m3\n' +
  '- Heavy Fuel Oil (Furnace Oil): 3.11 kg CO2e / Litre',
  'gold'
);

drawSubheading('5.2 Scope 2 Indirect Greenhouse Gas Emissions (Purchased Grid Electricity)');
drawParagraph('Calculated using the Location-Based Method per the Central Electricity Authority (CEA) of India Baseline Database:');

drawCallout(
  'SCOPE 2 EMISSIONS FORMULA',
  'Scope 2 (MT CO2e) = Purchased Grid Electricity (MWh) * CEA Grid Emission Factor\n\n' +
  'Calibrated National Baseline Factor (CEA CO2 Database v20.0):\n' +
  '- National Grid Average Factor: 0.716 MT CO2e / MWh\n' +
  'Example: Zojila Tunnel purchased 450 MWh in June 2026:\n' +
  'Scope 2 = 450 MWh * 0.716 MT CO2e/MWh = 322.20 MT CO2e',
  'purple'
);

drawSubheading('5.3 Clean Energy Mix & Workforce Safety Formulas');
drawCallout(
  'RENEWABLE RATIO & SAFETY FORMULAS',
  '1. Renewable Electricity Share (%) = [Renewable MWh / (Renewable MWh + Non-Renewable MWh)] * 100\n' +
  '   Measures progress toward RE100 and SEBI BRSR Core decarbonization milestones.\n\n' +
  '2. Lost Time Injury Frequency Rate (LTIFR - ISO 45001 / OHSAS standard):\n' +
  '   LTIFR = [Number of Lost Time Injuries (LTI) * 1,000,000] / Total Person-Hours Worked\n' +
  '   Normalizes occupational safety performance per million work hours across 250+ project sites.',
  'rose'
);

drawSubheading('5.4 The 5-Pillar Mathematical Data Quality Score (Section 12)');
drawParagraph(
  'A standout algorithmic contribution of ESG360 is the composite Data Quality Score (94/100). Rather than assigning an arbitrary grade, the engine evaluates five weighted audit pillars:'
);

const dqHeaders = ['Pillar', 'Audit Evaluation Criterion', 'Weight', 'MEIL Benchmark'];
const dqRows = [
  ['Completeness', 'Ratio of populated mandatory SEBI indicators against required disclosures', '25%', '98% (Audit Ready)'],
  ['Evidence Backing', 'Percentage of material physical disclosures supported by SHA-256 certified documents', '25%', '92% (Certified)'],
  ['Validation Health', 'Absence of validation warnings, range violations, and cross-field math errors', '20%', '96% (Verified)'],
  ['Approval Maturity', 'Proportion of operational unit submissions possessing verified multi-tier sign-offs', '15%', '90% (Approved)'],
  ['Historical Consistency', 'Absence of unverified period-over-period variance anomalies (>15% YoY shift)', '15%', '94% (Calibrated)']
];

drawTable(dqHeaders, dqRows, [85, 230, 65, 125], { boldCols: [0] });

// =========================================================================
// 6. SEBI BRSR REGULATORY FRAMEWORK MAPPING
// =========================================================================
doc.addPage();

drawSectionBanner('6. SEBI BRSR Regulatory Mapping & Assurance Attributes', 'Full Alignment with SEBI Circular SEBI/HO/CFD/CFD-SEC-2/P/CIR/2023/122');

drawParagraph(
  'ESG360 maps directly to the three official sections of the SEBI BRSR filing standard and provides specialized audit workflows for the 9 mandatory BRSR Core KPIs requiring reasonable assurance.'
);

drawSubheading('6.1 Top-Level BRSR Disclosures Structure');
drawBullet('Section A: General Disclosures:', 'Corporate identity, CIN (U45200TG2006PLC050277), capital structure, operational sites (250+ sites), workforce gender breakdown (permanent vs contract), subsidiary structure, and 2% CSR expenditures.');
drawBullet('Section B: Management and Process Disclosures:', 'Governance policies, board-level sustainability committee oversight, climate risk frameworks, stakeholder grievance mechanisms, and adherence to National Voluntary Guidelines (NVGs).');
drawBullet('Section C: Principle-Wise Performance Disclosures:', 'Granular quantitative indicators spanning all 9 Business Responsibility Principles (P1: Ethics & Integrity, P2: Product Sustainability, P3: Employee Well-being, P4: Stakeholder Engagement, P5: Human Rights, P6: Environmental Stewardship, P7: Responsible Policy Advocacy, P8: Inclusive Growth, P9: Consumer Value).');

drawSubheading('6.2 The 9 Mandatory SEBI BRSR Core Assurance Attributes');

const coreHeaders = ['#', 'SEBI BRSR Core Attribute', 'Principle', 'Platform Measurement Parameter', 'Primary Evidence'];
const coreRows = [
  ['01', 'Greenhouse Gas (GHG) Footprint', 'P6', 'Scope 1 (Direct Fuel) & Scope 2 (Grid Electricity)', 'IPCC Factor Logs & CEA Grid Bills'],
  ['02', 'Water Footprint & Intensity', 'P6', 'Water Withdrawal, Consumption & Recycling (KL)', 'Flowmeter Telemetry & Water Invoices'],
  ['03', 'Energy Footprint & Intensity', 'P6', 'Total Energy (MWh) & Renewable Electricity Share %', 'DISCOM Invoices & Solar Wheeling Logs'],
  ['04', 'Waste Management & Circularity', 'P6', 'Waste Generated, Recycled & Disposed (MT)', 'Hazardous Waste Manifests & Recycler Slips'],
  ['05', 'Employee Well-being & Safety', 'P3', 'Lost Time Injury Frequency Rate (LTIFR)', 'Biometric Registers & OHSAS Incident Logs'],
  ['06', 'Gender Diversity in Workforce', 'P3', 'Female Representation in Engineering & Management', 'HR Payroll Systems & PF Returns'],
  ['07', 'Fair Pay & Median Wage Ratios', 'P3', 'Minimum Wage Adherence & Median Wage Multipliers', 'Statutory Payroll Compliance Audits'],
  ['08', 'Value Chain ESG Engagement', 'P2 / P8', 'Tier-1 Vendor ESG Audits & SME Spend Percentage', 'SAP Vendor Portal & Procurement Ledgers'],
  ['09', 'Openness & Anti-Corruption', 'P1', 'Anti-Bribery Training & Whistleblower Resolution Rate', 'Compliance Committee Board Minutes']
];

drawTable(coreHeaders, coreRows, [24, 130, 48, 160, 143], { boldCols: [0, 1] });

drawSectionBanner('7. Evidence Vault, Immutable Audit Trail & Lineage', 'Zero-Trust Data Provenance Eliminating Audit Discrepancies');

drawParagraph(
  'To withstand the rigorous scrutiny of tier-1 statutory auditors, ESG360 eliminates ephemeral or unprovable disclosures by combining cryptographic file fingerprinting, append-only audit ledgers, and 5-node directed acyclic graph (DAG) data lineage.'
);

drawSubheading('7.1 Cryptographic Evidence Vault (Section 09)');
drawParagraph(
  'Every document uploaded to the platform (e.g., Electricity_Bill_June.pdf, 450,000 kWh consumption) is immediately hashed via the SHA-256 cryptographic algorithm upon receipt. The resulting 64-character hexadecimal digest is permanently coupled to the disclosure. Any subsequent file tampering or substitution immediately invalidates the document verification status.'
);

drawSubheading('7.2 Immutable Audit Trail (Section 10)');
drawParagraph(
  'Every creation, modification, status transition, and role switch is committed to an immutable audit ledger (auditLog table). The ledger captures the responsible user, IP address, exact UTC timestamp, affected entity, previous value, and new value. As demonstrated in Section 10, when Ravi Kumar updates Scope 1 emissions from 1,250 to 1,180 tCO2e, the complete history and sign-off remain permanently accessible for assurance review.'
);

drawSubheading('7.3 The 5-Node Provenance & Data Lineage DAG');

const dagBoxY = doc.y + 4;
doc.rect(MARGIN_LEFT, dagBoxY, CONTENT_WIDTH, 42).fill(C_PURPLE_BG);
doc.rect(MARGIN_LEFT, dagBoxY, CONTENT_WIDTH, 42).strokeColor(C_PURPLE).stroke();

doc.fillColor(C_PURPLE).fontSize(8).font('Helvetica-Bold')
   .text('5-STAGE VERIFIABLE TRANSFORMATION GRAPH (DAG):', MARGIN_LEFT + 10, dagBoxY + 6);

doc.fillColor(C_DARK).fontSize(7.5).font('Helvetica-Bold')
   .text('[1. Source Invoice]  --->  [2. Deterministic Math]  --->  [3. Metric Value]  --->  [4. Site Submission]  --->  [5. SEBI BRSR Filing]', MARGIN_LEFT + 10, dagBoxY + 18, { lineBreak: false });

doc.fillColor(C_MUTED).fontSize(7).font('Helvetica')
   .text('An auditor clicking any metric in the final report can traverse backward to the exact invoice that justified the number.', MARGIN_LEFT + 10, dagBoxY + 28);

doc.y = dagBoxY + 48;

// =========================================================================
// 7. GROUNDED AI ASSISTANT & RBAC SECURITY
// =========================================================================
doc.addPage();

drawSectionBanner('8. Grounded AI Assistant & Security Architecture', 'Context-Aware Intelligence & Role-Based Access Control');

drawParagraph(
  'Unlike generic chatbots that hallucinate figures, the ESG360 AI Assistant is an enterprise semantic retrieval engine grounded strictly in active database records, mathematical formulas, and historical telemetry.'
);

drawSubheading('8.1 Grounded Semantic AI Assistant (Section 14)');
drawParagraph(
  'The AI Assistant operates with instant prompt chips engineered for executive decision-makers. It extracts live telemetry across all reporting units and presents natural language explanations with verifiable data citations:'
);

drawBullet('Query: "Why did our carbon emissions increase this year?"', 'Assistant Response: Identifies that Scope 1 emissions rose by 14.2% primarily driven by heavy earthmoving operations at the Zojila Tunnel site (consuming 25,000 L of diesel during winter acceleration), while Olectra EV mobility prevented 1,420 MT CO2e.');
drawBullet('Query: "Which business unit has incomplete ESG data?"', 'Assistant Response: Flags that the Transportation & Highways BU is missing contractual workforce water consumption telemetry for Q3, directly lowering their data quality score to 84%.');
drawBullet('Query: "Summarize our overall ESG performance."', 'Assistant Response: Delivers a board-level synthesis highlighting MEIL\'s 88/100 ESG score, 94/100 Data Quality Score, 100% completion in Ethics (P1), and progress on BRSR Core KPIs.');

drawSubheading('8.2 Role-Based Access Control (RBAC) & Segregation of Duties (Section 15)');
drawParagraph(
  'To maintain statutory integrity, the system implements 5 distinct personas with strict segregation of duties. The UI includes a 1-click persona simulation switcher for evaluation:'
);

const rbacHeaders = ['Persona / Role', 'Default User', 'Designation', 'Access Scope & Authorizations'];
const rbacRows = [
  ['Admin', 'admin@meil.in', 'Head of Corporate Sustainability', 'Superuser: Tenant setup, framework configuration, user role provisioning.'],
  ['Corporate ESG Manager', 'esg.manager@meil.in', 'Senior Manager - Compliance', 'Full conglomerate oversight: Final approvals, BRSR generation, analytics.'],
  ['Subsidiary Reviewer', 'reviewer@meil.in', 'Lead Environmental Auditor', 'Maker-checker reviewer: Validates submissions, requests revisions, flags errors.'],
  ['Business Unit Data Owner', 'ravi@meil.in', 'Site Energy & Fuel Officer', 'Operational contributor: Disclosures entry, fuel volume logging, evidence upload.'],
  ['External Auditor / Assurance', 'auditor@meil.in', 'Partner - ESG Assurance (BSI/DNV)', 'Read-only assurance: Unfettered access to audit ledger, SHA-256 vaults, DAG lineage.']
];

drawTable(rbacHeaders, rbacRows, [90, 95, 120, 200], { boldCols: [0] });

drawSectionBanner('9. Technical Architecture & Technology Stack', 'Modern, Scalable Full-Stack Engineering Built for Speed and Resilience');

drawParagraph(
  'ESG360 is engineered as a decoupled, multi-tenant enterprise architecture. The platform adheres strictly to modern web standards, container-readiness, and maximum visual elegance.'
);

drawSubheading('9.1 Technology Stack (Section 17)');

drawBullet('Frontend Portal:', 'Next.js 16 (App Router with Turbopack), React 19, Lucide React iconography, dynamic responsive CSS grids, and SVG charting.');
drawBullet('Design Aesthetics (Dark Astra):', 'Pitch black background (#000000 / #0B0F19) paired with an ultra-luxurious, zero-blue/zero-green palette: Solar Amber Gold (#F59E0B), Amethyst Purple (#A855F7), Sunset Rose (#F43F5E), and Titanium Zinc.');
drawBullet('Backend REST API:', 'Node.js, Express, TypeScript, Zod schema validation, Helmet security headers, Winston structured logging, Express Rate Limiting.');
drawBullet('Database & ORM:', 'Prisma ORM with SQLite (development) and PostgreSQL (production). 25+ relational entities with strict tenantId row-level isolation.');
drawBullet('Security & Identity:', 'JSON Web Tokens (JWT) with HTTP-only refresh tokens, bcrypt password hashing (10 salt rounds), IDOR prevention middleware.');
drawBullet('Export Engines:', 'PDFKit for regulatory documents and SheetJS (xlsx) for multi-tab audit workbooks.');

drawSubheading('9.2 Relational Database Schema Overview (Section 18)');

drawParagraph(
  'The database model covers the entire enterprise sustainability graph:\n' +
  '• Tenancy & Company: Tenant, Company, OrgUnitType, OrgUnit (recursive parent-child tree).\n' +
  '• Identity & RBAC: User, Role, UserRole, Permission, RolePermission.\n' +
  '• Framework Taxonomy: Framework, FrameworkVersion, Section, Principle (P1-P9), Indicator, Question, Metric, Unit.\n' +
  '• Reporting & Data: ReportingPeriod, Submission, MetricValue, MetricValueVersion, Evidence, ValidationRule, ValidationResult.\n' +
  '• Assurance & Math: Calculation, CalculationInput, DataLineage, WorkflowStep, WorkflowTransition, Review, Approval, AuditLog, Report.'
);

// =========================================================================
// 8. IMPACT, INNOVATION & FINAL VISION
// =========================================================================
doc.addPage();

drawSectionBanner('10. Impact, Innovation & Final Project Vision', 'Transforming Sustainability Reporting from Burden to Strategic Advantage');

drawParagraph(
  'ESG360 accomplishes what legacy software and spreadsheets could never achieve: transforming ESG compliance from an arduous, retrospective year-end scramble into a continuous, audit-ready operational advantage.'
);

drawSubheading('10.1 Key Innovations & Unique Selling Propositions (Section 21)');

drawBullet('Continuous vs Retrospective Compliance:', 'Instead of spending 4 months at fiscal year-end piecing together old spreadsheets, ESG360 captures and validates telemetry month-by-month as fuel and electricity are consumed.');
drawBullet('Cryptographic Proof Over Verbal Claims:', 'By anchoring every critical metric to SHA-256 evidence digests and mathematical formulas, ESG360 provides statutory auditors with absolute confidence, virtually eliminating audit friction.');
drawBullet('Actionable Root-Cause Transparency:', 'Executive leadership no longer looks at aggregated carbon footprints in the dark. In three clicks, they can pinpoint the exact project generator or machinery causing emission spikes.');
drawBullet('Zero-Hallucination AI Intelligence:', 'Rather than relying on public LLMs that invent numbers, the embedded AI Assistant references exact SQL records to deliver audit-grade executive summaries.');

drawCallout(
  'FINAL PROJECT VISION (SECTION 22)',
  '"ESG360 - From ESG Data to BRSR Report, All in One Platform."\n\n' +
  'By automating collection, enforcing validation, calculating deterministic emissions, and generating compliant SEBI filings, ESG360 empowers Indian conglomerates to lead the global clean energy transition with transparency, integrity, and pride.',
  'gold'
);

// Sign-off signature block
const signY = doc.y + 15;
doc.rect(MARGIN_LEFT, signY, CONTENT_WIDTH, 100).fill(C_LIGHT_BG);
doc.rect(MARGIN_LEFT, signY, CONTENT_WIDTH, 100).strokeColor(C_BORDER).stroke();

doc.fillColor(C_DARK).fontSize(9.5).font('Helvetica-Bold')
   .text('OFFICIAL VERIFICATION & SPECIFICATION APPROVAL', MARGIN_LEFT + 15, signY + 12);

doc.fillColor(C_TEXT).fontSize(8).font('Helvetica')
   .text('Prepared By: Sustainable Engineering & Architecture Directorate', MARGIN_LEFT + 15, signY + 30)
   .text('Target Entity: Megha Engineering & Infrastructures Limited (MEIL Group)', MARGIN_LEFT + 15, signY + 43)
   .text('Framework: SEBI BRSR Comprehensive & BRSR Core Reasonable Assurance Standards', MARGIN_LEFT + 15, signY + 56)
   .text('Execution Environment: Node.js 20+ • Express TypeScript • Next.js 16 • Prisma ORM', MARGIN_LEFT + 15, signY + 69)
   .text('Document Status: Final Production Architecture Blueprint • Certified 100% Audit-Ready', MARGIN_LEFT + 15, signY + 82);

// =========================================================================
// RUNNING HEADER AND FOOTER ON ALL PAGES WITHOUT TRIGGERING EXTRA PAGES
// =========================================================================
const range = doc.bufferedPageRange();
const totalPages = range.count;

for (let i = 0; i < totalPages; i++) {
  doc.switchToPage(i);
  
  // Skip running header/footer on cover page (page 0)
  if (i === 0) continue;
  
  // Set bottom margin to 0 temporarily so text near bottom doesn't trigger auto-add-page
  const savedBottom = doc.page.margins.bottom;
  doc.page.margins.bottom = 0;
  
  // Running Header
  doc.rect(MARGIN_LEFT, 20, CONTENT_WIDTH, 0.75).fill(C_BORDER);
  doc.fillColor(C_MUTED).fontSize(7).font('Helvetica')
     .text('ESG360: SMART ESG & SEBI BRSR REPORTING PLATFORM', MARGIN_LEFT, 10, { width: CONTENT_WIDTH / 2, align: 'left', lineBreak: false });
  doc.fillColor(C_GOLD).fontSize(7).font('Helvetica-Bold')
     .text('TECHNICAL & FUNCTIONAL SPECIFICATION', MARGIN_LEFT + (CONTENT_WIDTH / 2), 10, { width: CONTENT_WIDTH / 2, align: 'right', lineBreak: false });
     
  // Running Footer
  doc.rect(MARGIN_LEFT, PAGE_HEIGHT - 28, CONTENT_WIDTH, 0.75).fill(C_BORDER);
  doc.fillColor(C_MUTED).fontSize(7).font('Helvetica')
     .text('MEIL Corporate Sustainability Directorate • Confidential', MARGIN_LEFT, PAGE_HEIGHT - 20, { width: CONTENT_WIDTH / 2, align: 'left', lineBreak: false });
  doc.fillColor(C_DARK).fontSize(7).font('Helvetica-Bold')
     .text(`Page ${i + 1} of ${totalPages}`, MARGIN_LEFT + (CONTENT_WIDTH / 2), PAGE_HEIGHT - 20, { width: CONTENT_WIDTH / 2, align: 'right', lineBreak: false });
     
  doc.page.margins.bottom = savedBottom;
}

doc.end();

writeStream.on('finish', () => {
  const stats = fs.statSync(outputPath);
  console.log(`✅ PDF Generated Successfully at: ${outputPath}`);
  console.log(`📄 Page Count: ${totalPages} pages | File Size: ${(stats.size / 1024).toFixed(1)} KB`);
});
