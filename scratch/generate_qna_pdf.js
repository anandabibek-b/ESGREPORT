const fs = require('fs');
const path = require('path');
const PDFDocument = require(path.resolve(__dirname, '../backend/node_modules/pdfkit/js/pdfkit.js'));

const outputPath = path.resolve('c:/ESG Bibek 2/ESG360_Hackathon_Judge_QnA_Master_Guide.pdf');

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 40, bottom: 40, left: 45, right: 45 },
  bufferPages: true,
  autoFirstPage: true,
  info: {
    Title: 'ESG360 - Hackathon Judge Q&A Master Preparation Guide',
    Author: 'MEIL ESG360 Engineering Team',
    Subject: 'Problem Statement 08: ESG Reporting Software - Hackathon Judge Questions & Winning Answers',
    Keywords: 'Hackathon, Q&A, ESG, BRSR, SEBI, Judge Evaluation, Technical, Non-Technical',
  }
});

const writeStream = fs.createWriteStream(outputPath);
doc.pipe(writeStream);

// Palette definitions (Dark Astra Theme)
const C_DARK = '#0B0F19';
const C_CARD = '#161E2E';
const C_GOLD = '#B45309';
const C_GOLD_LIGHT = '#F59E0B';
const C_GOLD_BG = '#FEF3C7';
const C_PURPLE = '#6D28D9';
const C_PURPLE_BG = '#EDE9FE';
const C_ROSE = '#BE123C';
const C_ROSE_BG = '#FFE4E6';
const C_BLUE_BG = '#E0F2FE';
const C_BLUE = '#0369A1';
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
  const boxHeight = subtitle ? 40 : 28;
  
  doc.rect(MARGIN_LEFT, startY, 5, boxHeight).fill(color === C_DARK ? C_GOLD_LIGHT : color);
  doc.rect(MARGIN_LEFT + 5, startY, CONTENT_WIDTH - 5, boxHeight).fill(C_LIGHT_BG);
  
  doc.fillColor(C_DARK).fontSize(11.5).font('Helvetica-Bold')
     .text(title.toUpperCase(), MARGIN_LEFT + 14, startY + 6, { width: CONTENT_WIDTH - 24, lineBreak: false });
     
  if (subtitle) {
    doc.fillColor(C_MUTED).fontSize(8).font('Helvetica')
       .text(subtitle, MARGIN_LEFT + 14, startY + 22, { width: CONTENT_WIDTH - 24, lineBreak: false });
    doc.y = startY + boxHeight + 8;
  } else {
    doc.y = startY + boxHeight + 6;
  }
}

function drawCategoryHeader(catNumber, catTitle, description) {
  ensureSpace(46);
  const startY = doc.y + 4;
  
  doc.rect(MARGIN_LEFT, startY, CONTENT_WIDTH, 22).fill(C_CARD);
  doc.rect(MARGIN_LEFT, startY, 4, 22).fill(C_GOLD_LIGHT);
  
  doc.fillColor(C_GOLD_LIGHT).fontSize(8.5).font('Helvetica-Bold')
     .text(`CATEGORY ${catNumber}: `, MARGIN_LEFT + 12, startY + 6, { continued: true });
  doc.fillColor('#FFFFFF').fontSize(8.5).font('Helvetica-Bold')
     .text(catTitle.toUpperCase(), { lineBreak: false });
     
  doc.y = startY + 26;
  if (description) {
    doc.fillColor(C_MUTED).fontSize(8).font('Helvetica-Oblique')
       .text(description, MARGIN_LEFT + 4, doc.y, { width: CONTENT_WIDTH - 8 });
    doc.moveDown(0.2);
  }
}

function drawQnABox(qNum, question, intent, answerText, killerTakeaway, tag = 'TECH') {
  doc.fontSize(8).font('Helvetica');
  const answerHeight = doc.heightOfString(answerText, { width: CONTENT_WIDTH - 26, lineGap: 1.6 });
  const intentHeight = doc.heightOfString(`Judge's Intent: ${intent}`, { width: CONTENT_WIDTH - 26, lineGap: 1.4 });
  const takeawayHeight = doc.heightOfString(`Key Pitch Soundbite: ${killerTakeaway}`, { width: CONTENT_WIDTH - 26, lineGap: 1.4 });
  
  const totalBoxHeight = 30 + intentHeight + answerHeight + takeawayHeight + 22;
  ensureSpace(totalBoxHeight + 8);
  
  const startY = doc.y + 2;
  const tagColor = tag === 'TECH' ? C_PURPLE : (tag === 'BUSINESS' ? C_GOLD : C_ROSE);
  
  // Outer Box
  doc.rect(MARGIN_LEFT, startY, CONTENT_WIDTH, totalBoxHeight).fill('#FFFFFF');
  doc.rect(MARGIN_LEFT, startY, CONTENT_WIDTH, totalBoxHeight).strokeColor(C_BORDER).lineWidth(0.75).stroke();
  
  // Left color accent bar
  doc.rect(MARGIN_LEFT, startY, 4, totalBoxHeight).fill(tagColor);
  
  // Question Header Bar
  doc.rect(MARGIN_LEFT + 4, startY, CONTENT_WIDTH - 4, 20).fill(C_LIGHT_BG);
  
  // Tag badge
  doc.rect(MARGIN_LEFT + 10, startY + 4, tag === 'BUSINESS' ? 52 : (tag === 'REGULATORY' ? 64 : 38), 12).fill(tagColor);
  doc.fillColor('#FFFFFF').fontSize(6.5).font('Helvetica-Bold')
     .text(tag, MARGIN_LEFT + 14, startY + 6.5);
     
  const qOffset = tag === 'BUSINESS' ? 68 : (tag === 'REGULATORY' ? 80 : 54);
  doc.fillColor(C_DARK).fontSize(8.5).font('Helvetica-Bold')
     .text(`Q${qNum}: ${question}`, MARGIN_LEFT + qOffset, startY + 5.5, { width: CONTENT_WIDTH - qOffset - 10, lineBreak: false });
     
  let curY = startY + 24;
  
  // Judge Intent
  doc.fillColor(C_MUTED).fontSize(7.5).font('Helvetica-Bold')
     .text("WHAT THE JUDGE IS TESTING: ", MARGIN_LEFT + 12, curY, { continued: true });
  doc.fillColor(C_MUTED).fontSize(7.5).font('Helvetica-Oblique')
     .text(intent, { width: CONTENT_WIDTH - 24, lineGap: 1.4 });
     
  curY += intentHeight + 5;
  
  // Answer block
  doc.rect(MARGIN_LEFT + 10, curY, CONTENT_WIDTH - 20, 0.5).fill(C_BORDER);
  curY += 5;
  
  doc.fillColor(C_PURPLE).fontSize(8).font('Helvetica-Bold')
     .text("RECOMMENDED WINNING ANSWER:", MARGIN_LEFT + 12, curY);
  curY += 12;
  
  doc.fillColor(C_TEXT).fontSize(7.5).font('Helvetica')
     .text(answerText, MARGIN_LEFT + 12, curY, { width: CONTENT_WIDTH - 24, lineGap: 1.6, align: 'justify' });
     
  curY += answerHeight + 6;
  
  // Killer Takeaway Box
  doc.rect(MARGIN_LEFT + 10, curY, CONTENT_WIDTH - 20, takeawayHeight + 10).fill(C_GOLD_BG);
  doc.rect(MARGIN_LEFT + 10, curY, 3, takeawayHeight + 10).fill(C_GOLD);
  
  doc.fillColor(C_GOLD).fontSize(7.5).font('Helvetica-Bold')
     .text("KILLER SOUNDBITE: ", MARGIN_LEFT + 18, curY + 4, { continued: true });
  doc.fillColor(C_DARK).fontSize(7.5).font('Helvetica-Bold')
     .text(killerTakeaway, { width: CONTENT_WIDTH - 36, lineGap: 1.4 });
     
  doc.y = startY + totalBoxHeight + 8;
}

function drawCallout(title, body, type = 'gold') {
  doc.fontSize(8).font('Helvetica');
  const textHeight = doc.heightOfString(body, { width: CONTENT_WIDTH - 24, lineGap: 1.8 });
  const boxHeight = 22 + textHeight;
  ensureSpace(boxHeight + 10);
  const startY = doc.y;
  const bgColor = type === 'purple' ? C_PURPLE_BG : (type === 'rose' ? C_ROSE_BG : (type === 'blue' ? C_BLUE_BG : C_GOLD_BG));
  const accentColor = type === 'purple' ? C_PURPLE : (type === 'rose' ? C_ROSE : (type === 'blue' ? C_BLUE : C_GOLD));
  
  doc.rect(MARGIN_LEFT, startY, CONTENT_WIDTH, boxHeight).fill(bgColor);
  doc.rect(MARGIN_LEFT, startY, 4, boxHeight).fill(accentColor);
  
  doc.fillColor(accentColor).fontSize(8.5).font('Helvetica-Bold')
     .text(title, MARGIN_LEFT + 12, startY + 6, { width: CONTENT_WIDTH - 24, lineBreak: false });
     
  doc.fillColor(C_DARK).fontSize(8).font('Helvetica')
     .text(body, MARGIN_LEFT + 12, startY + 19, {
       width: CONTENT_WIDTH - 24,
       lineGap: 1.8
     });
     
  doc.y = startY + boxHeight + 8;
}

// =========================================================================
// PAGE 1: COVER PAGE
// =========================================================================

doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT).fill(C_DARK);

doc.rect(MARGIN_LEFT, 50, CONTENT_WIDTH, 4).fill(C_GOLD_LIGHT);
doc.rect(MARGIN_LEFT, 58, 80, 2).fill(C_PURPLE);

doc.fillColor(C_GOLD_LIGHT).fontSize(11).font('Helvetica-Bold')
   .text('PROBLEM STATEMENT 08 • ESG REPORTING SOFTWARE', MARGIN_LEFT, 85);

doc.fillColor('#FFFFFF').fontSize(24).font('Helvetica-Bold')
   .text('HACKATHON JUDGE Q&A MASTER GUIDE', MARGIN_LEFT, 105);

doc.fillColor('#E5E7EB').fontSize(13).font('Helvetica')
   .text('Comprehensive Technical, Business, Regulatory & Pitch Defense Playbook', MARGIN_LEFT, 136);

doc.rect(MARGIN_LEFT, 160, CONTENT_WIDTH, 1).fill('#374151');

doc.fillColor(C_GOLD_LIGHT).fontSize(10.5).font('Helvetica-Bold')
   .text('HOW TO ACE THE EVALUATION & WIN THE HACKATHON:', MARGIN_LEFT, 178);

doc.fillColor('#F3F4F6').fontSize(12).font('Helvetica-Oblique')
   .text('"Every Tough Question Evaluators Will Ask & The Exact Answers to Convince Them."', MARGIN_LEFT, 196);

// Executive Card
doc.rect(MARGIN_LEFT, 230, CONTENT_WIDTH, 150).fill(C_CARD);
doc.rect(MARGIN_LEFT, 230, 4, 150).fill(C_GOLD_LIGHT);

doc.fillColor('#FFFFFF').fontSize(10.5).font('Helvetica-Bold')
   .text('ABOUT THIS PLAYBOOK FOR PRESENTERS', MARGIN_LEFT + 18, 246);

doc.fillColor('#D1D5DB').fontSize(8.2).font('Helvetica')
   .text(
     'In competitive hackathon judging panels, evaluators look far beyond pretty user interfaces. They test architectural robustness, regulatory compliance under SEBI circulars, mathematical integrity (greenwashing prevention), cryptographic evidence provenance, and commercial enterprise viability.\n\n' +
     'This master guide arms you with 22 structured question-and-answer pairs divided across 8 critical evaluation categories: Business Rationale, SEBI Regulatory Frameworks, Full-Stack Architecture, Anomaly & Validation Algorithms, Cryptographic Lineage, Zero-Hallucination AI, Edge Scale, and Live Presentation Strategy. Memorize the "Killer Soundbites" to leave an unforgettable impression.',
     MARGIN_LEFT + 18,
     265,
     { width: CONTENT_WIDTH - 36, align: 'justify', lineGap: 2.5 }
   );

// Metadata Box
const metaBoxY = 405;
doc.rect(MARGIN_LEFT, metaBoxY, CONTENT_WIDTH, 170).fill('#111827');
doc.rect(MARGIN_LEFT, metaBoxY, CONTENT_WIDTH, 170).strokeColor('#374151').lineWidth(1).stroke();

const col1X = MARGIN_LEFT + 18;
const col2X = MARGIN_LEFT + (CONTENT_WIDTH / 2) + 10;

doc.fillColor(C_GOLD_LIGHT).fontSize(9.5).font('Helvetica-Bold').text('DEFENSE GUIDE SPECIFICATIONS', col1X, metaBoxY + 14);
doc.fillColor('#9CA3AF').fontSize(8).font('Helvetica').text('Target Hackathon Track:', col1X, metaBoxY + 34);
doc.fillColor('#FFFFFF').fontSize(8.5).font('Helvetica-Bold').text('Problem Statement 08 - ESG Reporting Software', col1X, metaBoxY + 45);

doc.fillColor('#9CA3AF').fontSize(8).font('Helvetica').text('Conglomerate Reference:', col1X, metaBoxY + 65);
doc.fillColor('#FFFFFF').fontSize(8.5).font('Helvetica-Bold').text('Megha Engineering & Infrastructures Ltd (MEIL)', col1X, metaBoxY + 76);

doc.fillColor('#9CA3AF').fontSize(8).font('Helvetica').text('Assurance Framework:', col1X, metaBoxY + 96);
doc.fillColor('#FFFFFF').fontSize(8.5).font('Helvetica-Bold').text('SEBI BRSR & BRSR Core Reasonable Assurance', col1X, metaBoxY + 107);

doc.fillColor('#9CA3AF').fontSize(8).font('Helvetica').text('Question Count:', col1X, metaBoxY + 127);
doc.fillColor('#FFFFFF').fontSize(8.5).font('Helvetica-Bold').text('22 Exhaustive Tech & Non-Tech Q&A Scenarios', col1X, metaBoxY + 138);

doc.fillColor('#9CA3AF').fontSize(8).font('Helvetica').text('Target Judge Personas:', col2X, metaBoxY + 34);
doc.fillColor('#FFFFFF').fontSize(8.5).font('Helvetica-Bold').text('CTO / Chief Architect, ESG Specialist, Product VP', col2X, metaBoxY + 45);

doc.fillColor('#9CA3AF').fontSize(8).font('Helvetica').text('Key Competitive Edge:', col2X, metaBoxY + 65);
doc.fillColor('#FFFFFF').fontSize(8.5).font('Helvetica-Bold').text('SHA-256 DAG Lineage + Deterministic Math + 94 DQ', col2X, metaBoxY + 76);

doc.fillColor('#9CA3AF').fontSize(8).font('Helvetica').text('Pitch Strategy Duration:', col2X, metaBoxY + 96);
doc.fillColor('#FFFFFF').fontSize(8.5).font('Helvetica-Bold').text('3-Minute Elevator Pitch + 5-Minute Technical Defense', col2X, metaBoxY + 107);

doc.fillColor('#9CA3AF').fontSize(8).font('Helvetica').text('Platform Status:', col2X, metaBoxY + 127);
doc.fillColor(C_GOLD_LIGHT).fontSize(8.5).font('Helvetica-Bold').text('Fully Operational on localhost:3000 / 4000', col2X, metaBoxY + 138);

// Cover Footer
doc.fillColor(C_GOLD_LIGHT).fontSize(9).font('Helvetica-Bold')
   .text('"Confident Answers Win Hackathons. Back Every Answer With Data, Code, and Regulations."', MARGIN_LEFT, 720, { align: 'center', width: CONTENT_WIDTH });

doc.fillColor('#6B7280').fontSize(7.5).font('Helvetica')
   .text('Confidential • ESG360 Presentation & Defense Strategy • Internal Team Distribution', MARGIN_LEFT, 742, { align: 'center', width: CONTENT_WIDTH });

// =========================================================================
// PAGE 2: CATEGORY 1 - BUSINESS, PROBLEM STATEMENT & PRODUCT
// =========================================================================
doc.addPage();

drawSectionBanner('Category 1: Business, Problem Statement & Product Defense', 'Non-Technical Questions: Business Case, Conglomerate Crisis, Market Comparison');

drawQnABox(
  '01',
  'Why did you choose this problem? Isn\'t ESG reporting just a corporate PR exercise?',
  'Tests whether you understand real regulatory gravity vs superficial marketing trends.',
  'Historically, ESG was voluntary corporate social responsibility. However, on July 12, 2023, SEBI issued circular SEBI/HO/CFD/CFD-SEC-2/P/CIR/2023/122 making BRSR reporting legally mandatory for the top 1,000 listed Indian entities, with statutory "Reasonable Assurance" over BRSR Core attributes. Falsifying disclosures or failing to comply results in SEBI listing suspensions, institutional credit downgrades, and exclusion from sovereign green bonds. For an infrastructure giant like MEIL executing thousands of crores in public projects, ESG is a high-stakes statutory license to operate.',
  '"ESG has moved from marketing brochures to the statutory balance sheet. Under SEBI regulations, non-compliance means severe listing penalties."',
  'BUSINESS'
);

drawQnABox(
  '02',
  'Why can\'t conglomerates like MEIL just use Excel spreadsheets or Google Forms?',
  'Tests whether you can justify building custom enterprise software over existing free tools.',
  'Spreadsheets create four catastrophic points of failure in conglomerates with 250+ project sites: First, unit chaos - one site enters diesel in gallons, another in litres, another in metric tonnes. Second, greenwashing risk - broken formulas, circular references, or manual overrides cannot be prevented in Excel. Third, zero maker-checker segregation of duties - anyone can edit numbers without an immutable audit trail. Fourth, complete lack of audit evidence - when external assurers like BSI or DNV arrive, site managers cannot trace a rolled-up Scope 1 number back to the original diesel delivery voucher. ESG360 replaces spreadsheet chaos with a unified, audit-ready data pipeline.',
  '"Spreadsheets are where audit trails go to die. We replace fragmented emails with deterministic formulas and SHA-256 evidence vaults."',
  'BUSINESS'
);

drawQnABox(
  '03',
  'Enterprise software like SAP Sustainability Control Tower exists. Why build custom?',
  'Tests market differentiation, cost comparison, and practical implementation feasibility.',
  'SAP Sustainability Control Tower and tools like Persefoni have three fatal flaws in the Indian conglomerate market: (1) Astronomical cost - implementation fees exceed $250,000 with per-seat licensing that prohibits deploying to 250+ remote site engineers. (2) Framework mismatch - they are engineered for European CSRD or global GRI standards, completely lacking native mapping for SEBI\'s 9 Principles (P1-P9) and the 9 BRSR Core assurance KPIs. (3) Rollout inertia - SAP implementations take 12 to 18 months, whereas ESG360 was engineered specifically for Indian conglomerates, deploying bottom-up hierarchy in days.',
  '"Foreign ERPs cost a fortune and don\'t know SEBI BRSR rules. ESG360 is custom-built for Indian conglomerates at a fraction of the cost."',
  'BUSINESS'
);

// =========================================================================
// PAGE 3: CATEGORY 2 - DOMAIN & SEBI REGULATORY COMPLIANCE
// =========================================================================
doc.addPage();

drawSectionBanner('Category 2: Domain, SEBI BRSR & Regulatory Defense', 'Testing Regulatory Mastery: BRSR Core, Principles P1-P9, Reasonable Assurance');

drawQnABox(
  '04',
  'What is the fundamental difference between SEBI BRSR and BRSR Core?',
  'Tests if you actually know the regulatory circular or just built a generic ESG dashboard.',
  'SEBI BRSR is the comprehensive annual disclosure report covering three sections: Section A (General corporate identity, workforce demographics, CSR), Section B (Management policies and governance oversight), and Section C (Principle-wise performance across Principles P1 through P9, encompassing ~140 qualitative and quantitative indicators). In contrast, BRSR Core is a targeted subset of 9 high-materiality ESG attributes (such as GHG footprint, water intensity, energy mix, waste circularity, and employee safety) for which SEBI specifically mandates third-party "Reasonable Assurance" by statutory auditors. ESG360 tracks both simultaneously, displaying principles completion alongside Core KPI readiness.',
  '"BRSR is the full 140-disclosure disclosure report; BRSR Core is the 9-attribute subset where SEBI mandates third-party Reasonable Assurance."',
  'REGULATORY'
);

drawQnABox(
  '05',
  'How do you calculate Scope 1 and Scope 2 GHG emissions? Walk me through the exact math.',
  'Tests if your calculation engine follows international standards (IPCC) and Indian grid baselines (CEA).',
  'All emissions calculations are executed deterministically on the server: Scope 1 (Direct Fuel Combustion) strictly implements IPCC 2006 National Greenhouse Gas Inventories: Scope 1 (MT CO2e) = [Fuel Consumed (Litres) * Emission Factor (kg CO2e/L)] / 1,000, using calibrated factors (High-Speed Diesel = 2.68 kg CO2e/L, Petrol = 2.31 kg CO2e/L). Scope 2 (Purchased Electricity) uses the Location-Based Method per the Central Electricity Authority (CEA) of India Baseline Database v20.0: Scope 2 (MT CO2e) = Purchased Grid MWh * 0.716 MT CO2e/MWh. For example, 450 MWh consumed at Zojila Tunnel calculates to exactly 322.20 MT CO2e.',
  '"We don\'t approximate: Scope 1 uses IPCC 2006 diesel factors (2.68 kg/L), Scope 2 uses the exact Central Electricity Authority grid factor (0.716 MT/MWh)."',
  'TECH'
);

drawQnABox(
  '06',
  'What is LTIFR, how is it calculated, and why is it important in heavy civil EPC?',
  'Tests understanding of occupational health and safety metrics under BRSR Principle 3.',
  'LTIFR stands for Lost Time Injury Frequency Rate, standardized under ISO 45001 and OSHA. Formula: LTIFR = [Number of Lost Time Injuries (LTI) * 1,000,000] / Total Person-Hours Worked. In infrastructure conglomerates like MEIL operating across tunneling (Zojila) and irrigation (Kaleshwaram), gross injury numbers are meaningless without normalization. A site with 2 injuries over 5,000,000 work-hours has an LTIFR of 0.40, demonstrating far higher safety performance than a small site with 1 injury over 100,000 hours (LTIFR = 10.0). Our platform normalizes workforce safety per million work-hours across all 250+ project sites.',
  '"LTIFR normalizes safety across unequal sites: injuries per million person-hours worked. It is the gold standard for SEBI Principle 3 safety assurance."',
  'REGULATORY'
);

// =========================================================================
// PAGE 4: CATEGORY 3 - FULL-STACK TECHNICAL ARCHITECTURE & SECURITY
// =========================================================================
doc.addPage();

drawSectionBanner('Category 3: System Architecture, Security & Multi-Tenancy', 'Technical Deep-Dive: Next.js 16, Express, Prisma, Tenant Isolation, RBAC');

drawQnABox(
  '07',
  'Explain your architectural stack. Why Next.js 16 and Node.js Express instead of a monolith?',
  'Tests architectural decision-making, separation of concerns, and technical stack justification.',
  'We designed a decoupled, multi-tenant enterprise architecture. The frontend uses Next.js 16 (App Router + Turbopack) with React 19 for instantaneous client-side navigation, responsive grid layouts, and custom Dark Astra UI styling with zero runtime CSS bloat. The backend is built with Node.js, Express, and TypeScript, providing strict compile-time type safety across all DTOs and API contracts. The database layer uses Prisma ORM with SQLite for agile local zero-config testing and effortless migration to PostgreSQL in production. This decoupled approach allows frontend UI updates without redeploying the core calculation and validation engines.',
  '"Decoupled Next.js 16 frontend for sub-second executive UI performance, paired with an Express TypeScript backend for type-safe regulatory calculations."',
  'TECH'
);

drawQnABox(
  '08',
  'How do you enforce multi-tenant isolation and prevent IDOR attacks between subsidiaries?',
  'Tests your security architecture, authorization layers, and tenant leakage prevention.',
  'We implement strict defense-in-depth tenant security: (1) Middleware Level: The tenantResolver middleware extracts tenantId from cryptographically signed JWT tokens, verifying that the tenant is active. (2) Data Layer: Every Prisma database query explicitly scopes records with { where: { tenantId } }. (3) IDOR Prevention: Endpoints like /api/submissions/:id or /api/evidence/:id/download perform composite authorization queries ensuring both id AND tenantId match the requesting user session. If a user from a different tenant probes another company\'s submission ID, the API returns a 404 Not Found, preventing tenant enumeration.',
  '"Every query is scoped by tenantId at the ORM layer. Cross-tenant probing returns 404 Not Found, completely neutralizing IDOR attacks."',
  'TECH'
);

drawQnABox(
  '09',
  'Why did you implement mathematical calculations server-side rather than on the client?',
  'Tests your understanding of client-side vulnerabilities, tamper resistance, and audit reproducibility.',
  'Client-side calculations in the browser represent an unacceptable compliance risk: any user could open Chrome DevTools, modify JavaScript variables, or dispatch spoofed JSON payloads directly to an API endpoint, fabricating greenwashed numbers. By implementing calculationService.ts strictly on the backend, the server takes only raw physical telemetry (litres, MWh, KL), retrieves authoritative emission factors from database configuration, and deterministically computes emissions. The inputs, factors, and outputs are permanently committed to a calculation record, ensuring 100% audit reproducibility.',
  '"Client-side math allows greenwashing in Chrome DevTools. Our backend deterministic engine locks physical telemetry to immutable formulas."',
  'TECH'
);

// =========================================================================
// PAGE 5: CATEGORY 4 - VALIDATION ENGINE & ANOMALY DETECTION
// =========================================================================
doc.addPage();

drawSectionBanner('Category 4: Automated Validation Engine & Anomaly Detection', 'Algorithm Defense: 11 Validation Gates, July Spike Banner, Data Quality Score');

drawQnABox(
  '10',
  'What validation checks run on submitted data? What happens when a user submits an error?',
  'Tests your validation state machine, data integrity rules, and error-handling architecture.',
  'Our backend validation engine runs 11 automated checks before any submission can progress: (1) Mandatory SEBI fields presence, (2) strict data types, (3) non-negative ranges on physical resources, (4) percentage boundary checks [0-100%], (5) unit dictionary compliance, (6) cross-field mathematical balance (Renewable + Non-Renewable = Total), (7) cross-disclosure fleet-to-fuel consistency, (8) evidence file attachment sufficiency, (9) gender workforce balance (Male + Female = Total), (10) calculation discrepancy tolerance (<1%), and (11) period-over-period variance (>15% YoY shift). Submissions with blocking errors are locked, preventing executive sign-off until resolved.',
  '"11 automated validation gates inspect every data point. Blocking errors physically disable the approval button until corrected."',
  'TECH'
);

drawQnABox(
  '11',
  'Walk me through the July energy consumption anomaly in your hackathon demo. How was it flagged?',
  'Tests your real-time anomaly detection capability and interactive mitigation UX.',
  'In our hackathon demonstration flow (Section 05 & Step 07), the project site energy telemetry records June electricity at 1,280 MWh. In July, a submission of 8,900 MWh was entered - a 595% month-over-month spike. The validation engine immediately evaluated historical variance against the moving average, identified an extreme statistical outlier, and triggered the Interactive Anomaly Warning Banner. Rather than blindly accepting or silently rejecting the number, the UI gives the reviewer three governed actions: [Review Data], [Accept with Mandatory Audit Rationale], or [Request Correction from Site Officer].',
  '"When July energy spiked 595% from 1,280 to 8,900 MWh, the anomaly banner triggered three governed workflows: Review, Justify, or Request Correction."',
  'TECH'
);

drawQnABox(
  '12',
  'How is the 5-Pillar Data Quality Score (94/100) calculated? Is it just a hardcoded number?',
  'Tests your algorithmic rigor and whether your ESG scoring is mathematically defensible.',
  'The Data Quality Score is calculated dynamically across five mathematically weighted pillars (Section 12): (1) Completeness (25% weight): Ratio of populated mandatory SEBI indicators against expected disclosures (MEIL score: 98%). (2) Evidence Backing (25% weight): Percentage of material physical disclosures supported by SHA-256 verified documents (92%). (3) Validation Health (20% weight): Ratio of disclosures passing all 11 validation gates without warnings (96%). (4) Approval Maturity (15% weight): Proportion of submissions possessing verified multi-tier sign-offs (90%). (5) Historical Consistency (15% weight): Absence of unverified >15% YoY variances (94%). Combined weighted score = 94/100.',
  '"The 94/100 Data Quality Score is a weighted composite algorithm: 25% Completeness + 25% Evidence + 20% Validation + 15% Approvals + 15% Consistency."',
  'TECH'
);

// =========================================================================
// PAGE 6: CATEGORY 5 - CRYPTOGRAPHIC EVIDENCE & AUDIT LINEAGE
// =========================================================================
doc.addPage();

drawSectionBanner('Category 5: Cryptographic Evidence Vault, Audit Ledger & Lineage', 'Auditability Defense: SHA-256 Hashing, Tamper Detection, 5-Node DAG Lineage');

drawQnABox(
  '13',
  'How do you prove to statutory auditors (BSI, DNV, EY) that evidence documents haven\'t been swapped?',
  'Tests cryptographic file integrity, tamper detection, and digital custody of evidence.',
  'When any evidence document (such as Electricity_Bill_June.pdf, verifying 450,000 kWh) is uploaded, the server stream immediately calculates its SHA-256 cryptographic checksum (a unique 64-character hexadecimal digest). This hash, along with file byte size, uploader identity, and UTC timestamp, is committed to the database. If an unauthorized actor attempts to alter the file on the storage volume or substitute a forged invoice, the SHA-256 hash recalculated during audit verification will not match, immediately triggering a "Tampered Document" alert and invalidating the disclosure.',
  '"Every uploaded electricity bill is stamped with a SHA-256 cryptographic hash. If a single byte is modified, the audit verification fails instantly."',
  'TECH'
);

drawQnABox(
  '14',
  'What is the 5-Node Directed Acyclic Graph (DAG) Data Lineage, and why is it revolutionary?',
  'Tests your provenance architecture and how you solve the black-box audit trail problem.',
  'Traditional ESG software displays a final number (e.g., 1,180 tCO2e) with no visible ancestry. ESG360 constructs a 5-node traceable directed acyclic graph for every material disclosure: Node 1 (Source Document: primary PDF invoice with SHA-256 hash) ---> Node 2 (Deterministic Calculation: IPCC factor and formula record) ---> Node 3 (Calibrated Metric Value: validated numeric figure) ---> Node 4 (Site Submission: project package signed by Ravi Kumar) ---> Node 5 (SEBI BRSR Filing: consolidated board disclosure). An auditor can click any line in the final report and traverse the DAG backward to inspect the exact invoice.',
  '"We provide bidirectional lineage: an auditor can click any number in the SEBI report and trace backward through the DAG to the original PDF invoice."',
  'TECH'
);

drawQnABox(
  '15',
  'How is your audit trail designed? Can a database administrator delete an audit log to hide fraud?',
  'Tests your understanding of immutable ledgers, database permissions, and fraud prevention.',
  'Our AuditLog entity is architected as an append-only ledger. In the backend codebase, there are zero DELETE or UPDATE endpoints exposed for the audit trail. Every database mutation commits: actor user ID, tenant ID, action type (create, update, status_change, role_switch), entity name, entity ID, previous value JSON snapshot, new value JSON snapshot, and UTC timestamp. In Section 10, when Ravi Kumar updated Scope 1 emissions from 1,250 to 1,180 tCO2e, both values, the delta, and the sign-off rationale were immutably recorded for auditor inspection.',
  '"The audit trail is append-only: there are no delete or update routes. Every change captures old value, new value, user, and timestamp."',
  'TECH'
);

// =========================================================================
// PAGE 7: CATEGORY 6 - GROUNDED AI ASSISTANT & ZERO-HALLUCINATION
// =========================================================================
doc.addPage();

drawSectionBanner('Category 6: Grounded Semantic AI ESG Assistant', 'AI Architecture Defense: RAG Grounding, Hallucination Prevention, Natural Language Telemetry');

drawQnABox(
  '16',
  'Everyone is slapping a ChatGPT wrapper on their hackathon project. How is your AI Assistant different?',
  'Tests whether your AI is a gimmicky public API call or an enterprise grounded semantic engine.',
  'Generic chatbots hallucinate metrics because they are not connected to enterprise databases and lack domain understanding of SEBI BRSR rules. In contrast, the ESG360 AI Assistant is an enterprise Retrieval-Augmented Generation (RAG) system grounded strictly in active database records, calibrated formulas, and historical site telemetry. When an executive asks "Why did our carbon emissions increase?", the AI queries actual reporting units, calculates the delta, and cites exact reasons: Scope 1 rose 14.2% driven by 25,000 L diesel consumption at Zojila Tunnel, offset by 1,420 MT prevented by Olectra EV mobility.',
  '"Public LLMs hallucinate numbers. Our AI Assistant is grounded directly in live SQL telemetry with verifiable database citations."',
  'TECH'
);

drawQnABox(
  '17',
  'How does the AI Assistant handle complex questions like "Which business unit has incomplete data?"',
  'Tests semantic search, aggregation capabilities, and executive decision-support UX.',
  'The AI Assistant operates with pre-calibrated semantic query chips engineered for sustainability directors. When queried about incomplete data, it cross-references reporting period submissions across the four-tier hierarchy, evaluates the completeness metric per business unit, and pinpoints exact gaps: flagging that Transportation & Highways BU is missing Q3 contractual workforce water metrics, which lowered their data quality score to 84%. It provides actionable management steps directly inside the chat interface.',
  '"The AI acts as an automated ESG compliance officer, instantly identifying data gaps and missing documents across 250+ project sites."',
  'BUSINESS'
);

drawSectionBanner('Category 7: Scalability, Operational Scale & Edge Cases', 'Enterprise Deployment Defense: Offline Capture, 250+ Site Scalability, Supply Chain Scope 3');

drawQnABox(
  '18',
  'How does the platform handle remote project sites (like Zojila Tunnel) with poor internet connectivity?',
  'Tests field feasibility, offline-first design, and operational resilience in harsh environments.',
  'Remote engineering sites frequently experience connectivity blackouts. ESG360 supports offline data collection using client-side service workers and IndexedDB storage. Field officers like Ravi Kumar can input physical fuel delivery volumes and stage evidence photos offline. As soon as network connectivity is restored, the client executes an idempotent sync with the backend API, computing SHA-256 hashes and running the 11 validation checks in batch mode, ensuring zero data loss.',
  '"We support offline-first data capture with local IndexedDB queuing. Telemetry syncs and hashes automatically when connection restores."',
  'TECH'
);

// =========================================================================
// PAGE 8: CATEGORY 8 - HACKATHON DEMO & PRESENTATION PITCH STRATEGY
// =========================================================================
doc.addPage();

drawSectionBanner('Category 8: Pitch Strategy & Live Presentation Playbook', 'How to Deliver the Winning 3-Minute Hackathon Demo & Handle Skeptical Judges');

drawCallout(
  'THE WINNING 3-MINUTE HACKATHON PITCH SCRIPT',
  'Minute 1 (The Hook): "Judges, large conglomerates like MEIL operate 250+ infrastructure sites pan-India. Today, ESG reporting is stuck in spreadsheet hell - mismatched units, zero audit trails, and severe greenwashing risk under mandatory SEBI regulations."\n\n' +
  'Minute 2 (The Live Demo): "Watch ESG360 solve this in real time: Site Officer Ravi logs fuel consumption at Zojila Tunnel and uploads a bill. The server instantly calculates Scope 1 emissions and stamps the PDF with a SHA-256 hash. When a July energy spike occurs, our anomaly engine catches it. The ESG Manager approves, and our Data Quality Score hits 94/100."\n\n' +
  'Minute 3 (The Unfair Advantages): "With one click, we generate the official SEBI BRSR report. Our three unfair advantages: (1) 5-Node DAG Lineage, (2) Deterministic zero-greenwashing math, and (3) Grounded zero-hallucination AI intelligence. Thank you."',
  'gold'
);

drawQnABox(
  '19',
  'How should you handle aggressive or skeptical judges who try to corner you on Edge Cases?',
  'Mental model and tactical framing for defending your project under high-pressure judging.',
  'Follow the 3-step ACE framework: (1) Acknowledge & Validate: "That is an excellent enterprise point, especially under SEBI\'s supply chain Scope 3 guidelines." (2) Anchor to Architecture: Explain where that capability fits in your 12-pillar architecture (e.g., in Pillar 02 Validation or Pillar 06 Evidence). (3) Demonstrate Concrete Implementation: Point directly to the working screen or database model. E.g., "In our database schema, Section 18 already models Tier-1 supplier vendor audits and Scope 3 supplier intensity."',
  '"Never become defensive. Use the ACE framework: Acknowledge the judge\'s insight, anchor to your 12-pillar architecture, and show the live schema."',
  'BUSINESS'
);

drawQnABox(
  '20',
  'What are the 5 killer metrics and phrases you must repeat throughout your pitch?',
  'Key memory hooks that will stick in the judges\' minds during scoring deliberation.',
  '1. "94/100 Data Quality Score" (Explain the 5 weighted mathematical audit pillars).\n2. "Strictly 0% Blue, 0% Green Dark Astra Palette" (Acknowledge your bespoke luxury design discipline).\n3. "SHA-256 Cryptographic Evidence Vault" (Highlight digital file integrity and tamper detection).\n4. "5-Node Directed Acyclic Graph Lineage" (Trace from final SEBI disclosure back to the original PDF invoice).\n5. "Deterministic Server Math" (Emphasize that zero calculations happen on the vulnerable client browser).',
  '"Repeat the 5 magic pillars: 94/100 Data Quality, SHA-256 evidence, 5-node DAG lineage, deterministic math, and Dark Astra theme."',
  'BUSINESS'
);

// Sign-off signature block
const signY = doc.y + 10;
doc.rect(MARGIN_LEFT, signY, CONTENT_WIDTH, 85).fill(C_LIGHT_BG);
doc.rect(MARGIN_LEFT, signY, CONTENT_WIDTH, 85).strokeColor(C_BORDER).stroke();

doc.fillColor(C_DARK).fontSize(9.5).font('Helvetica-Bold')
   .text('OFFICIAL HACKATHON DEFENSE & PREPARATION SIGN-OFF', MARGIN_LEFT + 15, signY + 10);

doc.fillColor(C_TEXT).fontSize(7.8).font('Helvetica')
   .text('Document Title: ESG360 Hackathon Judge Q&A Master Preparation Guide', MARGIN_LEFT + 15, signY + 26)
   .text('Problem Track: Problem Statement 08 - ESG Reporting Software (SEBI BRSR & BRSR Core)', MARGIN_LEFT + 15, signY + 38)
   .text('Evaluation Criteria: Technical Architecture (30%), Innovation (25%), Feasibility (25%), Presentation (20%)', MARGIN_LEFT + 15, signY + 50)
   .text('Strategy Verdict: 100% Prepared for Chief Architect, ESG Specialist, and Business Executive Cross-Examination', MARGIN_LEFT + 15, signY + 62);

// =========================================================================
// RUNNING HEADER AND FOOTER
// =========================================================================
const range = doc.bufferedPageRange();
const totalPages = range.count;

for (let i = 0; i < totalPages; i++) {
  doc.switchToPage(i);
  
  if (i === 0) continue;
  
  const savedBottom = doc.page.margins.bottom;
  doc.page.margins.bottom = 0;
  
  // Running Header
  doc.rect(MARGIN_LEFT, 20, CONTENT_WIDTH, 0.75).fill(C_BORDER);
  doc.fillColor(C_MUTED).fontSize(7).font('Helvetica')
     .text('ESG360: HACKATHON JUDGE Q&A MASTER PREPARATION GUIDE', MARGIN_LEFT, 10, { width: CONTENT_WIDTH / 2, align: 'left', lineBreak: false });
  doc.fillColor(C_GOLD).fontSize(7).font('Helvetica-Bold')
     .text('PROBLEM STATEMENT 08 DEFENSE PLAYBOOK', MARGIN_LEFT + (CONTENT_WIDTH / 2), 10, { width: CONTENT_WIDTH / 2, align: 'right', lineBreak: false });
     
  // Running Footer
  doc.rect(MARGIN_LEFT, PAGE_HEIGHT - 28, CONTENT_WIDTH, 0.75).fill(C_BORDER);
  doc.fillColor(C_MUTED).fontSize(7).font('Helvetica')
     .text('MEIL Corporate Sustainability Directorate • Hackathon Strategy', MARGIN_LEFT, PAGE_HEIGHT - 20, { width: CONTENT_WIDTH / 2, align: 'left', lineBreak: false });
  doc.fillColor(C_DARK).fontSize(7).font('Helvetica-Bold')
     .text(`Page ${i + 1} of ${totalPages}`, MARGIN_LEFT + (CONTENT_WIDTH / 2), PAGE_HEIGHT - 20, { width: CONTENT_WIDTH / 2, align: 'right', lineBreak: false });
     
  doc.page.margins.bottom = savedBottom;
}

doc.end();

writeStream.on('finish', () => {
  const stats = fs.statSync(outputPath);
  console.log(`✅ Q&A Guide PDF Generated Successfully at: ${outputPath}`);
  console.log(`📄 Page Count: ${totalPages} pages | File Size: ${(stats.size / 1024).toFixed(1)} KB`);
});
