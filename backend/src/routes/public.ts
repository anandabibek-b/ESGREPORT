import { Router } from 'express';
import prisma from '../config/database';
import logger from '../config/logger';

const router = Router();

// In-memory citizen stakeholder submissions store with sample initial records
const citizenGrievances: Array<{
  id: string;
  trackingId: string;
  name: string;
  email: string;
  phone?: string;
  stakeholderType: string;
  category: string;
  subject: string;
  message: string;
  status: string;
  submittedAt: string;
  responseETA: string;
}> = [
  {
    id: 'cg-01',
    trackingId: 'MEIL-PUB-2026-8912',
    name: 'Kavita Deshmukh',
    email: 'kavita.deshmukh@gmail.com',
    phone: '+91 98230 44120',
    stakeholderType: 'Local Community / Villager',
    category: 'Water Conservation & Borewell Recharge',
    subject: 'Request for clean drinking water tanker schedule in Marathwada pipeline zone',
    message: 'We appreciate MEIL water canal project. Please share the monsoon water filtration schedule for local village school.',
    status: 'Addressed & Closed',
    submittedAt: '2026-09-15T10:30:00Z',
    responseETA: 'Completed by CSR Unit Hyderabad',
  },
  {
    id: 'cg-02',
    trackingId: 'MEIL-PUB-2026-9043',
    name: 'Dr. Anand Raman',
    email: 'anand.raman@greenenergytrust.org',
    phone: '+91 97110 58219',
    stakeholderType: 'NGO / Environmental Researcher',
    category: 'Biodiversity & Tree Plantation',
    subject: 'Inquiry regarding afforestation species mix along Zojila bypass',
    message: 'Kindly share the native flora species count planted under compensatory afforestation at Zojila Tunnel approach road.',
    status: 'In Progress (Verified by Site Team)',
    submittedAt: '2026-09-28T14:15:00Z',
    responseETA: 'Response dispatched via Public Disclosure Desk',
  },
];

/**
 * 1. Public ESG & BRSR Transparency Summary
 * Accessible to common citizens, investors, NGOs, students, and media
 */
router.get('/summary', async (req, res) => {
  try {
    const summary = {
      portalName: 'MEIL Group Public ESG & BRSR Transparency Portal',
      mandate: 'SEBI Circular SEBI/HO/CFD/CFD-SEC-2/P/CIR/2023/122 & Ministry of Corporate Affairs',
      company: {
        legalName: 'Megha Engineering & Infrastructures Limited',
        tradeName: 'MEIL Group',
        cin: 'U45200TG2006PLC050271',
        industry: 'Infrastructure, Clean Energy & Engineering Services',
        headquarters: 'Hyderabad, Telangana, India',
        listedStatus: 'SEBI Top 1000 Listed Infrastructure Conglomerate',
        transparencyRating: 'Tier-1 Sustainability Leader',
      },
      ratings: {
        esgScore: 88,
        maxScore: 100,
        grade: 'A+ (Leadership Band)',
        dataQualityScore: 94,
        assuranceStatus: 'Reasonable Assurance Certified (BSI / DNV)',
        reportingYear: 'FY 2024-25 (Current Disclosure Cycle)',
      },
      environmentalHighlights: {
        renewableEnergyShare: '38.4%',
        renewableEnergyTarget: '50% by 2030',
        waterRecycledLitres: '4,200,000 Litres (Zero Liquid Discharge)',
        afforestationTreesPlanted: '125,000+ Native Saplings',
        ghgScope1And2IntensityReduction: '-18.2% since FY 2021-22 baseline',
        netZeroTargetYear: '2045 (Aligned with India Panchamrit Goals)',
        circularWasteDiverted: '86.4% Construction Waste Reused / Recycled',
      },
      socialHighlights: {
        safeWorkHours: '14,850,000 LTI-Free Hours',
        fatalAccidents: '0 (Zero Tolerance Safety Shield)',
        csrSpendINR: '₹48.60 Crores in FY 2024-25',
        ruralBeneficiaries: '45,200+ Citizens across 12 States',
        drinkingWaterProjects: '180+ Village RO Water Treatment Centers',
        poshComplianceRate: '100% Redressal within 14 Days',
        femaleTechnicalEngineers: '18.4% (Growing at 3.2% YoY)',
      },
      governanceHighlights: {
        boardIndependence: '50% Independent Directors on MEIL Board',
        esgCommitteeLevel: 'Apex Board-Level ESG & CSR Oversight',
        antiCorruptionCompliance: '100% Mandatory Training for All Personnel',
        whistleblowerChannel: 'Active 24/7 (Toll-Free 1800-6345-374)',
        regulatoryPenalties: '₹0 (Zero Material Non-Compliances)',
        dataTraceability: 'Cryptographic SHA-256 Audit Trail',
      },
      flagshipProjects: [
        {
          name: 'Zojila Himalayan Tunnel (NH-1)',
          focus: 'All-Weather Green Connectivity & Low-Emission Cold-Climate Engineering',
          impact: 'Reduces travel time by 75%, cutting vehicle idling emissions in fragile Himalayan ecosystem by 32,000 tCO2e annually.',
          badge: 'Green Engineering Landmark',
        },
        {
          name: 'Kaleshwaram Lift Irrigation Mega-Project',
          focus: 'Water Security, Groundwater Recharging & Farmer Empowerment',
          impact: 'Provides perennial irrigation water to over 4.5 million acres, turning arid regions into lush green agricultural belts.',
          badge: 'National Water Stewardship',
        },
        {
          name: 'Olectra Greentech Electric Mobility',
          focus: '100% Pure Electric Public Bus Transport across Indian Metro Cities',
          impact: 'Displaces over 22 million litres of diesel annually across Mumbai, Pune, Hyderabad, and Delhi NCR.',
          badge: 'Clean Urban Air Initiative',
        },
        {
          name: 'Decentralized Solar Agricultural Microgrids',
          focus: 'Solarization of Farmland Feeders & Renewable Pumping',
          impact: 'Offsets 45 MW of conventional thermal power with clean solar energy for agrarian communities.',
          badge: 'Clean Energy Transition',
        },
      ],
    };

    res.json({ success: true, data: summary });
  } catch (error: any) {
    logger.error('Public summary error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch public summary.' });
  }
});

/**
 * 2. SEBI BRSR 9 Principles with Public-Friendly Explanations
 */
router.get('/principles', async (req, res) => {
  try {
    const principles = [
      {
        id: 'P1',
        title: 'Principle 1: Ethics, Transparency & Accountability',
        citizenExplanation: 'We operate with absolute honesty, zero corruption, and open public transparency in all business and governmental dealings.',
        progressPercent: 100,
        status: 'Fully Disclosed & Compliant',
        keyMetric: '100% Anti-Bribery training & zero corruption penalties',
      },
      {
        id: 'P2',
        title: 'Principle 2: Sustainable & Safe Products / Services',
        citizenExplanation: 'Our infrastructure, bridges, and tunnels are built using eco-friendly materials designed to safeguard lives and minimize environmental strain.',
        progressPercent: 85,
        status: 'High Compliance',
        keyMetric: '86.4% Recycled fly-ash & slag in structural concrete',
      },
      {
        id: 'P3',
        title: 'Principle 3: Employee Well-being & Worker Rights',
        citizenExplanation: 'We ensure safe, fair, and respectful working conditions, fair wages, medical insurance, and safety training for all permanent and contractual site workers.',
        progressPercent: 92,
        status: 'Assurance Ready',
        keyMetric: '14.8M Safe work hours without Lost Time Injury',
      },
      {
        id: 'P4',
        title: 'Principle 4: Stakeholder & Community Engagement',
        citizenExplanation: 'We actively listen to local villagers, farmers, citizens, and shareholders, responding swiftly to their needs and public grievances.',
        progressPercent: 100,
        status: 'Fully Disclosed & Active',
        keyMetric: 'Public Grievance Desk with 48h response guarantee',
      },
      {
        id: 'P5',
        title: 'Principle 5: Respect & Protection of Human Rights',
        citizenExplanation: 'Strict zero-tolerance policy against child labour, forced labour, gender discrimination, and workplace harassment across all supplier sites.',
        progressPercent: 100,
        status: 'Zero Violations',
        keyMetric: '100% Human rights compliance across 250+ project sites',
      },
      {
        id: 'P6',
        title: 'Principle 6: Environmental Protection & Climate Action',
        citizenExplanation: 'Aggressively reducing carbon emissions, conserving clean water, switching to solar/wind electricity, and planting native trees.',
        progressPercent: 94,
        status: 'Assurance Certified',
        keyMetric: '38.4% Renewable electricity & 4.2M Litres water recycled',
      },
      {
        id: 'P7',
        title: 'Principle 7: Responsible Public Policy Advocacy',
        citizenExplanation: 'Collaborating transparently with government bodies (SEBI, MoEFCC, NHAI) to champion cleaner national infrastructure guidelines.',
        progressPercent: 100,
        status: 'Fully Compliant',
        keyMetric: 'Active trade association participation in green mobility standards',
      },
      {
        id: 'P8',
        title: 'Principle 8: Inclusive Growth & Social Development (CSR)',
        citizenExplanation: 'Investing company profits back into rural schools, clean drinking water, mobile hospitals, and vocational training for local youth.',
        progressPercent: 96,
        status: 'Impact Audited',
        keyMetric: '₹48.60 Crores CSR invested across 12 Indian states',
      },
      {
        id: 'P9',
        title: 'Principle 9: Customer Value & Public Safety',
        citizenExplanation: 'Delivering infrastructure projects built to the highest seismic, structural, and quality standards for the Indian public.',
        progressPercent: 91,
        status: 'Certified Quality',
        keyMetric: 'ISO 9001, ISO 14001 & ISO 45001 triple certification',
      },
    ];

    res.json({ success: true, data: principles });
  } catch (error: any) {
    logger.error('Public principles error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch public principles.' });
  }
});

/**
 * 3. Public Downloadable Reports & Disclosures
 */
router.get('/reports', async (req, res) => {
  try {
    const reports = [
      {
        id: 'rep-brsr-fy25',
        title: 'MEIL Group SEBI BRSR Annual Report FY 2024-25',
        description: 'Complete statutory disclosures covering General Information, Management Processes, and Principles P1–P9.',
        format: 'PDF',
        fileSize: '4.8 MB',
        publishedDate: '15 September 2026',
        sha256Hash: '9e8c3b4a2f1e6d7c8b9a0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b',
        assuranceAgency: 'Independent Third-Party Assurance by BSI & DNV',
        isPublic: true,
      },
      {
        id: 'rep-core-assurance',
        title: 'SEBI BRSR Core Reasonable Assurance Statement',
        description: 'External auditor verification on the mandatory 9 BRSR Core Key Performance Indicators (GHG Scope 1 & 2, Water, Energy, Waste, Diversity).',
        format: 'PDF',
        fileSize: '1.9 MB',
        publishedDate: '20 September 2026',
        sha256Hash: '4f7e2a9c1b3d5e8f0a2c4e6b8d0a2f4c6e8b0d2a4f6c8e0b2d4a6f8c0e2b4d6',
        assuranceAgency: 'DNV Business Assurance India Pvt Ltd',
        isPublic: true,
      },
      {
        id: 'rep-citizen-factsheet',
        title: 'Citizen & Stakeholder Sustainability Factsheet FY 2024-25',
        description: 'Executive visual summary crafted in plain language for citizens, students, and community members.',
        format: 'PDF',
        fileSize: '2.4 MB',
        publishedDate: '25 September 2026',
        sha256Hash: '2b4d6f8a0c2e4b6d8a0c2e4b6d8a0c2e4b6d8a0c2e4b6d8a0c2e4b6d8a0c2e4',
        assuranceAgency: 'MEIL Corporate Sustainability Directorate',
        isPublic: true,
      },
    ];

    res.json({ success: true, data: reports });
  } catch (error: any) {
    logger.error('Public reports error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch public reports.' });
  }
});

/**
 * 4. Submit Citizen Grievance / Stakeholder Inquiry (SEBI Principle 4 & Principle 8)
 */
router.post('/grievance', async (req, res) => {
  try {
    const { name, email, phone, stakeholderType, category, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      res.status(400).json({
        success: false,
        error: 'Please provide your Name, Email, Subject, and Details of your inquiry.',
      });
      return;
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const trackingId = `MEIL-PUB-2026-${randomSuffix}`;

    const newRecord = {
      id: `cg-${Date.now()}`,
      trackingId,
      name: name.trim(),
      email: email.trim(),
      phone: phone ? phone.trim() : undefined,
      stakeholderType: stakeholderType || 'Citizen / Public',
      category: category || 'General Sustainability Inquiry',
      subject: subject.trim(),
      message: message.trim(),
      status: 'Received & Logged (Corporate Sustainability Desk)',
      submittedAt: new Date().toISOString(),
      responseETA: 'Acknowledgement within 24 hours; Official review within 48-72 hours',
    };

    citizenGrievances.unshift(newRecord);

    // Also record into prisma AuditLog if possible
    try {
      const firstTenant = await prisma.tenant.findFirst();
      if (firstTenant) {
        await prisma.auditLog.create({
          data: {
            tenantId: firstTenant.id,
            action: 'public_citizen_grievance',
            entityType: 'stakeholder_inquiry',
            entityId: trackingId,
            newValue: JSON.stringify({
              trackingId,
              name: newRecord.name,
              category: newRecord.category,
              stakeholderType: newRecord.stakeholderType,
              subject: newRecord.subject,
            }),
          },
        });
      }
    } catch (dbErr) {
      // Non-blocking for audit log
    }

    logger.info(`Citizen grievance registered with tracking ID ${trackingId} from ${email}`);

    res.status(201).json({
      success: true,
      message: 'Your inquiry has been successfully received by the MEIL Sustainability Directorate.',
      data: newRecord,
    });
  } catch (error: any) {
    logger.error('Grievance submission error:', error);
    res.status(500).json({ success: false, error: 'Failed to submit grievance.' });
  }
});

/**
 * 5. Track Citizen Inquiry / Grievance by Tracking ID
 */
router.get('/grievance/:trackingId', (req, res) => {
  const { trackingId } = req.params;
  const match = citizenGrievances.find((g) => g.trackingId.toUpperCase() === trackingId.trim().toUpperCase());

  if (!match) {
    res.status(404).json({
      success: false,
      error: `No grievance or inquiry found with tracking ID "${trackingId}". Please check the ID and try again.`,
    });
    return;
  }

  res.json({ success: true, data: match });
});

/**
 * 6. Public Frequently Asked Questions for Common Citizens
 */
router.get('/faq', (req, res) => {
  const faqs = [
    {
      q: 'How does MEIL ensure safe drinking water in areas where construction takes place?',
      a: 'MEIL implements strict Zero Liquid Discharge (ZLD) protocols. Every drop of industrial wash water is treated via closed-loop sedimentation and RO plants before reuse. Furthermore, through our CSR initiative, MEIL has established 180+ clean drinking water filtration plants serving over 45,000 rural citizens.',
    },
    {
      q: 'What safeguards are used to protect wildlife and air quality in the Zojila Himalayan Tunnel?',
      a: 'At Zojila Tunnel, MEIL deploys electric mucking loaders, wet-drilling suppression to eliminate silica dust, and noise dampers to safeguard Himalayan fauna. We also conduct real-time particulate matter (PM2.5/PM10) monitoring and carry out compensatory high-altitude tree plantations.',
    },
    {
      q: 'How can local youth apply for free CSR vocational training programs?',
      a: 'MEIL Skill Centers provide certified technical training in heavy machinery operation, electrical infrastructure, and solar panel installation. Citizens can apply via our CSR desk or contact our toll-free helpdesk at 1800-6345-374.',
    },
    {
      q: 'Can ordinary investors or researchers inspect MEIL’s verified carbon emission numbers?',
      a: 'Yes. Under SEBI BRSR guidelines, all quantitative Scope 1, Scope 2, and Scope 3 emissions, verified by external assurance agencies (BSI/DNV), are published openly in our annual reports downloadable directly on this portal without requiring any login.',
    },
  ];

  res.json({ success: true, data: faqs });
});

export default router;
