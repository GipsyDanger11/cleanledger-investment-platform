import { createContext, useContext, useState } from 'react';

const InvestmentContext = createContext(null);

// ─── Sample Data ─────────────────────────────────────────────

export const STARTUPS = [
  {
    id: 'startup_001',
    name: 'Aura Wind Energy',
    sector: 'Clean Energy',
    geography: 'Northern Europe',
    trustScore: 87,
    esgScore: 92,
    totalRaised: 4200000,
    fundingTarget: 5000000,
    backers: 124,
    verificationStatus: 'verified',
    verificationBadge: 'Verified',
    profileCompletionScore: 94,
    description: 'Offshore wind infrastructure developer targeting the North Sea with proprietary blade technology.',
    tags: ['ESG', 'Wind', 'CleanTech'],
    kybDocument: 'KYB Clear',
    esgDocument: "ESG Audit '23",
    teamSize: 28,
    foundedYear: 2021,
    pitchQualityScore: 8.4,
    credibilityIndex: 91,
    riskLevel: 'LOW',
    fundAllocation: {
      tech:       { planned: 45, actual: 43 },
      marketing:  { planned: 20, actual: 18 },
      operations: { planned: 25, actual: 27 },
      legal:      { planned: 10, actual: 12 },
    },
    expenses: [
      { category: 'tech',       amount: 120000, description: 'Blade prototype R&D lab costs', uploadedAt: '2026-01-15T09:00:00Z' },
      { category: 'operations', amount:  85000, description: 'Site survey & marine logistics',  uploadedAt: '2026-02-10T11:00:00Z' },
      { category: 'legal',      amount:  32000, description: 'IP registration — EU & UK patents', uploadedAt: '2026-03-05T14:00:00Z' },
    ],
    milestones: [
      {
        id: 'ms_001_1',
        phase: 1,
        title: 'Site Acquisition',
        status: 'verified',
        tranchePct: 20,
        description: 'Land rights secured (50 acres, coastal). Environmental assessments done.',
        successCriteria: 'Signed lease agreements + environmental clearance',
        targetDate: '2025-09-01',
        releasedAt: '2025-09-12T10:00:00Z',
        proofUrl: 'https://example.com/proof/aura-site',
        votes: [
          { investor: 'inv_001', approved: true },
          { investor: 'inv_002', approved: true },
          { investor: 'inv_003', approved: true },
        ],
        comments: [
          { author: 'James Whitfield', text: 'Land deed documentation looks solid. Approved.', date: '2025-09-10T09:00:00Z', avatar: 'JW' },
          { author: 'Anonymous Investor', text: 'Environmental report confirms no red flags.', date: '2025-09-10T11:00:00Z', avatar: '?', isAnonymous: true },
        ],
      },
      {
        id: 'ms_001_2',
        phase: 2,
        title: 'Turbine Procurement',
        status: 'submitted',
        tranchePct: 40,
        description: 'Contracts with Vesta for 5× V162-6.2 MW turbines. Pending board approval.',
        successCriteria: 'Signed supply agreement + delivery schedule',
        targetDate: '2026-03-01',
        voteDeadline: new Date(Date.now() + 18 * 3600000).toISOString(),
        proofUrl: 'https://example.com/proof/aura-turbine',
        votes: [
          { investor: 'inv_001', approved: true },
          { investor: 'inv_002', approved: false },
        ],
        comments: [
          { author: 'James Whitfield', text: 'Supply agreement terms look fair. Will approve after reviewing delivery schedule.', date: '2026-04-17T08:00:00Z', avatar: 'JW' },
        ],
      },
      {
        id: 'ms_001_3',
        phase: 3,
        title: 'Grid Connection',
        status: 'pending',
        tranchePct: 40,
        description: 'Substation installation + national grid tie-in.',
        successCriteria: 'Grid connection certificate from TSO',
        targetDate: '2026-09-30',
        votes: [],
        comments: [],
      },
    ],
    qa: [
      {
        id: 'qa_001_1',
        question: 'What is the expected capacity factor for the turbines in your chosen site?',
        isAnonymous: false,
        author: 'James Whitfield',
        createdAt: '2026-04-10T08:00:00Z',
        isAnswered: true,
        answer: 'Based on our wind resource assessment, we project a capacity factor of 42–48%, which is exceptionally high for North Sea installations.',
        answeredAt: '2026-04-11T09:00:00Z',
      },
      {
        id: 'qa_001_2',
        question: 'Have you secured an offtake agreement with any utility company?',
        isAnonymous: true,
        author: 'Anonymous Investor',
        createdAt: '2026-04-14T10:00:00Z',
        isAnswered: true,
        answer: 'Yes, we are in the final stages of a 15-year PPA with Ørsted. Formal announcement coming in Q2 2026.',
        answeredAt: '2026-04-15T11:00:00Z',
      },
      {
        id: 'qa_001_3',
        question: 'What happens to my investment if the grid connection faces regulatory delays?',
        isAnonymous: true,
        author: 'Anonymous Investor',
        createdAt: '2026-04-17T15:00:00Z',
        isAnswered: false,
        answer: null,
        answeredAt: null,
      },
    ],
    announcements: [
      {
        id: 'ann_001_1',
        content: '🎉 Phase 1 milestone (Site Acquisition) has been officially verified by all investors. $800,000 tranche has been released to our operations account. Thank you for your trust!',
        pinned: true,
        createdAt: '2025-09-12T12:00:00Z',
        likeCount: 47,
      },
      {
        id: 'ann_001_2',
        content: '📋 Turbine procurement contracts with Vesta are now submitted for investor review. The 48-hour voting window is open. Please review the supply agreement in the proof link above.',
        pinned: false,
        createdAt: '2026-04-16T09:00:00Z',
        likeCount: 12,
      },
    ],
  },
  {
    id: 'startup_002',
    name: 'Solaris Grid Systems',
    sector: 'Solar Tech',
    geography: 'Sub-Saharan Africa',
    trustScore: 79,
    esgScore: 88,
    totalRaised: 2800000,
    fundingTarget: 6000000,
    backers: 89,
    verificationStatus: 'verified',
    verificationBadge: 'Verified',
    profileCompletionScore: 81,
    description: 'Modular solar micro-grid solutions for off-grid communities across East Africa.',
    tags: ['ESG', 'Solar', 'Impact'],
    teamSize: 19,
    foundedYear: 2022,
    pitchQualityScore: 7.8,
    credibilityIndex: 82,
    riskLevel: 'MEDIUM',
    fundAllocation: {
      tech:       { planned: 50, actual: 52 },
      marketing:  { planned: 15, actual: 11 },
      operations: { planned: 25, actual: 28 },
      legal:      { planned: 10, actual: 9 },
    },
    expenses: [
      { category: 'tech',       amount: 95000, description: 'LONGi Solar module procurement for pilot', uploadedAt: '2026-02-20T10:00:00Z' },
      { category: 'operations', amount: 42000, description: 'Kenya field deployment logistics', uploadedAt: '2026-03-12T14:00:00Z' },
    ],
    milestones: [
      {
        id: 'ms_002_1',
        phase: 1,
        title: 'Pilot Deployment',
        status: 'verified',
        tranchePct: 25,
        description: '12 villages in Kenya connected.',
        successCriteria: '12 villages operational with 99.5% uptime for 30 days',
        targetDate: '2025-12-01',
        releasedAt: '2025-12-10T10:00:00Z',
        proofUrl: 'https://example.com/proof/solaris-pilot',
        votes: [{ investor: 'inv_001', approved: true }, { investor: 'inv_002', approved: true }],
        comments: [
          { author: 'James Whitfield', text: 'Village photos and telemetry data confirm successful deployment.', date: '2025-12-08T10:00:00Z', avatar: 'JW' },
        ],
      },
      {
        id: 'ms_002_2',
        phase: 2,
        title: 'Scale Production',
        status: 'in_progress',
        tranchePct: 40,
        description: 'Manufacturing partnership with LONGi Solar. Targeting 50 additional villages.',
        successCriteria: 'Signed manufacturing agreement + 50 village rollout plan',
        targetDate: '2026-06-30',
        votes: [],
        comments: [],
      },
      {
        id: 'ms_002_3',
        phase: 3,
        title: 'Grid Integration',
        status: 'pending',
        tranchePct: 35,
        description: 'National utility partnerships in Tanzania and Uganda.',
        successCriteria: 'MOUs signed with 2 national utilities',
        targetDate: '2026-12-31',
        votes: [],
        comments: [],
      },
    ],
    qa: [
      {
        id: 'qa_002_1',
        question: 'What is your revenue model for the off-grid communities?',
        isAnonymous: false,
        author: 'James Whitfield',
        createdAt: '2026-03-15T10:00:00Z',
        isAnswered: true,
        answer: 'We use a pay-as-you-go model via M-Pesa. Communities pay $0.20/kWh, 30% below diesel generator cost. This funds ongoing maintenance and expansion.',
        answeredAt: '2026-03-16T09:00:00Z',
      },
    ],
    announcements: [
      {
        id: 'ann_002_1',
        content: '🌍 We have successfully powered 12 villages across Kenya. Over 8,500 people now have reliable electricity. Manufacturing partnership with LONGi Solar formally signed — scaling to 50+ villages starts Q2 2026.',
        pinned: true,
        createdAt: '2026-01-05T10:00:00Z',
        likeCount: 34,
      },
    ],
  },
  {
    id: 'startup_003',
    name: 'HydroClear Technologies',
    sector: 'Water Tech',
    geography: 'Southeast Asia',
    trustScore: 93,
    esgScore: 95,
    totalRaised: 5800000,
    fundingTarget: 8000000,
    backers: 201,
    verificationStatus: 'verified',
    verificationBadge: 'Verified',
    profileCompletionScore: 98,
    description: 'Zero-discharge industrial water recycling systems for semiconductor fabs.',
    tags: ['ESG', 'Water', 'DeepTech'],
    teamSize: 45,
    foundedYear: 2020,
    pitchQualityScore: 9.2,
    credibilityIndex: 95,
    riskLevel: 'LOW',
    fundAllocation: {
      tech:       { planned: 60, actual: 58 },
      marketing:  { planned: 10, actual: 12 },
      operations: { planned: 20, actual: 20 },
      legal:      { planned: 10, actual: 10 },
    },
    expenses: [
      { category: 'tech',       amount: 320000, description: 'Nano-filtration membrane production line', uploadedAt: '2025-10-01T09:00:00Z' },
      { category: 'operations', amount: 110000, description: 'TSMC fab installation & commissioning',    uploadedAt: '2025-11-15T10:00:00Z' },
      { category: 'legal',      amount:  58000, description: 'US & PCT patent prosecution fees',        uploadedAt: '2025-12-01T11:00:00Z' },
    ],
    milestones: [
      {
        id: 'ms_003_1',
        phase: 1,
        title: 'R&D Completion',
        status: 'verified',
        tranchePct: 20,
        description: 'Patent granted for nano-filtration membrane.',
        successCriteria: 'Patent grant + 99%+ recovery rate in lab',
        targetDate: '2025-06-01',
        releasedAt: '2025-06-15T10:00:00Z',
        votes: [{ investor: 'inv_001', approved: true }, { investor: 'inv_002', approved: true }],
        comments: [],
      },
      {
        id: 'ms_003_2',
        phase: 2,
        title: 'Pilot Factory',
        status: 'verified',
        tranchePct: 30,
        description: 'TSMC pilot installation — 99.7% recovery rate.',
        successCriteria: '≥99% recovery rate for 90-day trial',
        targetDate: '2025-12-01',
        releasedAt: '2025-12-20T10:00:00Z',
        votes: [{ investor: 'inv_001', approved: true }, { investor: 'inv_002', approved: true }],
        comments: [],
      },
      {
        id: 'ms_003_3',
        phase: 3,
        title: 'Commercial Scale',
        status: 'in_progress',
        tranchePct: 50,
        description: 'Expansion to 10 additional fabs in Malaysia.',
        successCriteria: '10 fab contracts signed with ≥$5M ARR',
        targetDate: '2026-09-30',
        votes: [],
        comments: [],
      },
    ],
    qa: [],
    announcements: [
      {
        id: 'ann_003_1',
        content: '🏆 ISO 14001 certification renewed for 2026. Our TSMC pilot has now processed over 2 billion litres of water at 99.7% recovery, a world record for semiconductor fab recycling.',
        pinned: true,
        createdAt: '2026-02-01T10:00:00Z',
        likeCount: 89,
      },
    ],
  },
  {
    id: 'startup_004',
    name: 'Verdant Carbon Labs',
    sector: 'Carbon Markets',
    geography: 'Global',
    trustScore: 71,
    esgScore: 84,
    totalRaised: 1600000,
    fundingTarget: 4000000,
    backers: 67,
    verificationStatus: 'verified',
    verificationBadge: 'Verified',
    profileCompletionScore: 74,
    description: 'Blockchain-verified carbon credit marketplace for regenerative agriculture and forestry.',
    tags: ['ESG', 'Carbon', 'Blockchain'],
    teamSize: 12,
    foundedYear: 2023,
    pitchQualityScore: 7.2,
    credibilityIndex: 73,
    riskLevel: 'MEDIUM',
    fundAllocation: {
      tech:       { planned: 55, actual: 62 },
      marketing:  { planned: 25, actual: 18 },
      operations: { planned: 12, actual: 10 },
      legal:      { planned: 8,  actual: 10 },
    },
    expenses: [],
    milestones: [
      {
        id: 'ms_004_1',
        phase: 1,
        title: 'Registry Build',
        status: 'verified',
        tranchePct: 30,
        description: 'Carbon credit tokenization platform live.',
        successCriteria: 'Platform live with 10 verified project listings',
        targetDate: '2025-10-01',
        releasedAt: '2025-10-15T10:00:00Z',
        votes: [{ investor: 'inv_001', approved: true }],
        comments: [],
      },
      {
        id: 'ms_004_2',
        phase: 2,
        title: 'Partner Onboard',
        status: 'in_progress',
        tranchePct: 35,
        description: 'Onboarding 50 certified forest projects.',
        successCriteria: '50 certified projects onboarded with Verra/Gold Standard approval',
        targetDate: '2026-06-01',
        votes: [],
        comments: [],
      },
      {
        id: 'ms_004_3',
        phase: 3,
        title: 'Market Launch',
        status: 'pending',
        tranchePct: 35,
        description: 'Public marketplace open for corporate buyers.',
        successCriteria: '$1M+ in credits transacted in first 60 days',
        targetDate: '2026-12-01',
        votes: [],
        comments: [],
      },
    ],
    qa: [],
    announcements: [],
  },
  {
    id: 'startup_005',
    name: 'ThermaVault Energy',
    sector: 'Thermal Storage',
    geography: 'Central Europe',
    trustScore: 85,
    esgScore: 90,
    totalRaised: 3750000,
    fundingTarget: 7500000,
    backers: 143,
    verificationStatus: 'verified',
    verificationBadge: 'Verified',
    profileCompletionScore: 89,
    description: 'Long-duration molten-salt thermal energy storage for industrial facilities.',
    tags: ['ESG', 'Storage', 'CleanTech'],
    teamSize: 31,
    foundedYear: 2021,
    pitchQualityScore: 8.1,
    credibilityIndex: 87,
    riskLevel: 'LOW',
    fundAllocation: {
      tech:       { planned: 50, actual: 48 },
      marketing:  { planned: 15, actual: 14 },
      operations: { planned: 25, actual: 28 },
      legal:      { planned: 10, actual: 10 },
    },
    expenses: [
      { category: 'tech',       amount: 180000, description: '500 kWh prototype — Munich pilot',  uploadedAt: '2025-08-10T09:00:00Z' },
      { category: 'operations', amount:  60000, description: 'Munich test site rental & permits', uploadedAt: '2025-09-01T10:00:00Z' },
    ],
    milestones: [
      {
        id: 'ms_005_1',
        phase: 1,
        title: 'Prototype',
        status: 'verified',
        tranchePct: 20,
        description: '500 kWh pilot system operational in Munich.',
        successCriteria: '500 kWh system running continuously for 60 days',
        targetDate: '2025-08-01',
        releasedAt: '2025-08-18T10:00:00Z',
        votes: [{ investor: 'inv_001', approved: true }, { investor: 'inv_002', approved: true }],
        comments: [],
      },
      {
        id: 'ms_005_2',
        phase: 2,
        title: 'Scale-Up',
        status: 'in_progress',
        tranchePct: 40,
        description: '5 MWh commercial system manufacturing. Target: 2 industrial parks.',
        successCriteria: 'Manufacturing contract + 1 signed customer LoI',
        targetDate: '2026-07-01',
        votes: [],
        comments: [],
      },
      {
        id: 'ms_005_3',
        phase: 3,
        title: 'Distribution',
        status: 'pending',
        tranchePct: 40,
        description: 'EU industrial park deployments.',
        successCriteria: '5 industrial parks contracted',
        targetDate: '2027-01-01',
        votes: [],
        comments: [],
      },
    ],
    qa: [],
    announcements: [],
  },
  {
    id: 'startup_006',
    name: 'AquaTrace Monitoring',
    sector: 'Environmental IoT',
    geography: 'Scandinavia',
    trustScore: 76,
    esgScore: 87,
    totalRaised: 2100000,
    fundingTarget: 3000000,
    backers: 78,
    verificationStatus: 'verified',
    verificationBadge: 'Verified',
    profileCompletionScore: 78,
    description: 'AI-driven water quality monitoring network for municipal water utilities.',
    tags: ['ESG', 'IoT', 'Water', 'AI'],
    teamSize: 16,
    foundedYear: 2022,
    pitchQualityScore: 7.6,
    credibilityIndex: 77,
    riskLevel: 'MEDIUM',
    fundAllocation: {
      tech:       { planned: 60, actual: 65 },
      marketing:  { planned: 15, actual: 10 },
      operations: { planned: 20, actual: 20 },
      legal:      { planned: 5,  actual: 5 },
    },
    expenses: [
      { category: 'tech', amount: 72000, description: 'IoT sensor production batch (Oslo pilot)', uploadedAt: '2026-01-20T10:00:00Z' },
    ],
    milestones: [
      {
        id: 'ms_006_1',
        phase: 1,
        title: 'Sensor Network',
        status: 'verified',
        tranchePct: 30,
        description: '400 sensors deployed across Oslo water system.',
        successCriteria: '400 sensors deployed, <0.1% false-alert rate for 60 days',
        targetDate: '2025-11-01',
        releasedAt: '2025-11-12T10:00:00Z',
        votes: [{ investor: 'inv_001', approved: true }],
        comments: [],
      },
      {
        id: 'ms_006_2',
        phase: 2,
        title: 'ML Analytics',
        status: 'in_progress',
        tranchePct: 40,
        description: 'Predictive contamination detection model.',
        successCriteria: '≥95% contamination detection accuracy on test dataset',
        targetDate: '2026-05-01',
        votes: [],
        comments: [],
      },
      {
        id: 'ms_006_3',
        phase: 3,
        title: 'Commercial Scale',
        status: 'pending',
        tranchePct: 30,
        description: 'Scale to 3 Nordic municipalities.',
        successCriteria: '3 signed municipal contracts',
        targetDate: '2026-10-01',
        votes: [],
        comments: [],
      },
    ],
    qa: [],
    announcements: [],
  },
];

export const AUDIT_ENTRIES = [
  { id: 'ae_001', blockIndex: 1042, type: 'capital_release',    amount: 800000,  currency: 'USD', from: 'CleanLedger Escrow',    to: 'Aura Wind Energy',       startupId: 'startup_001', hash: 'a3f8c2e1d904b7...', prevHash: '9b2e4a0c8f31d6...', timestamp: '2026-04-15T09:14:22Z', status: 'confirmed' },
  { id: 'ae_002', blockIndex: 1041, type: 'funding_allocation', amount: 500000,  currency: 'USD', from: 'Whitfield Capital',     to: 'CleanLedger Escrow',    startupId: 'startup_001', hash: '9b2e4a0c8f31d6...', prevHash: '7d1c3b09e5a2f8...', timestamp: '2026-04-14T16:40:08Z', status: 'confirmed' },
  { id: 'ae_003', blockIndex: 1040, type: 'inter_account',      amount: 250000,  currency: 'USD', from: 'Portfolio A',           to: 'Portfolio B',           startupId: null,          hash: '7d1c3b09e5a2f8...', prevHash: '4e8f0a7c2b59d3...', timestamp: '2026-04-13T11:22:45Z', status: 'confirmed' },
  { id: 'ae_004', blockIndex: 1039, type: 'capital_release',    amount: 2000000, currency: 'USD', from: 'CleanLedger Escrow',    to: 'HydroClear Technologies', startupId: 'startup_003', hash: '4e8f0a7c2b59d3...', prevHash: '2c6a1e4d8b70f5...', timestamp: '2026-04-12T08:55:12Z', status: 'confirmed' },
  { id: 'ae_005', blockIndex: 1038, type: 'funding_allocation', amount: 750000,  currency: 'USD', from: 'Nordic ESG Fund',       to: 'CleanLedger Escrow',    startupId: 'startup_005', hash: '2c6a1e4d8b70f5...', prevHash: '1a5c9b3e7f40d2...', timestamp: '2026-04-11T14:30:00Z', status: 'confirmed' },
  { id: 'ae_006', blockIndex: 1037, type: 'capital_release',    amount: 1000000, currency: 'USD', from: 'CleanLedger Escrow',    to: 'Verdant Carbon Labs',   startupId: 'startup_004', hash: '1a5c9b3e7f40d2...', prevHash: '8b3d0f2c6e91a7...', timestamp: '2026-04-10T10:10:10Z', status: 'confirmed' },
  { id: 'ae_007', blockIndex: 1036, type: 'funding_allocation', amount: 300000,  currency: 'USD', from: 'Impact Capital Ltd',   to: 'CleanLedger Escrow',    startupId: 'startup_006', hash: '8b3d0f2c6e91a7...', prevHash: '6f2a8e4c1d50b9...', timestamp: '2026-04-09T17:05:33Z', status: 'confirmed' },
  { id: 'ae_008', blockIndex: 1035, type: 'capital_release',    amount: 1000000, currency: 'USD', from: 'CleanLedger Escrow',    to: 'ThermaVault Energy',    startupId: 'startup_005', hash: '6f2a8e4c1d50b9...', prevHash: '5e1b7d3c9a42f0...', timestamp: '2026-04-08T09:00:00Z', status: 'confirmed' },
  { id: 'ae_009', blockIndex: 1034, type: 'milestone_complete', amount: 0,       currency: 'USD', from: 'Aura Wind Energy',      to: 'CleanLedger Audit',     startupId: 'startup_001', hash: '5e1b7d3c9a42f0...', prevHash: '3a9c5e2f1b08d7...', timestamp: '2026-04-07T16:00:00Z', status: 'confirmed' },
  { id: 'ae_010', blockIndex: 1033, type: 'kyb_verified',       amount: 0,       currency: 'USD', from: 'CleanLedger Admin',     to: 'Solaris Grid Systems',  startupId: 'startup_002', hash: '3a9c5e2f1b08d7...', prevHash: '0000000000000000...', timestamp: '2026-04-06T10:00:00Z', status: 'confirmed' },
];

// Investor portfolio
export const INVESTMENTS = [
  { id: 'inv_001', startupId: 'startup_001', startupName: 'Aura Wind Energy',       sector: 'Clean Energy',    amount: 500000, trancheStatus: 'Phase 2 — Voting Open',  trustScore: 87, date: '2026-01-10' },
  { id: 'inv_002', startupId: 'startup_003', startupName: 'HydroClear Technologies', sector: 'Water Tech',      amount: 350000, trancheStatus: 'Phase 3 — In Progress',  trustScore: 93, date: '2025-11-22' },
  { id: 'inv_003', startupId: 'startup_005', startupName: 'ThermaVault Energy',      sector: 'Thermal Storage', amount: 250000, trancheStatus: 'Phase 2 — In Progress',  trustScore: 85, date: '2026-02-14' },
  { id: 'inv_004', startupId: 'startup_002', startupName: 'Solaris Grid Systems',    sector: 'Solar Tech',      amount: 200000, trancheStatus: 'Phase 2 — In Progress',  trustScore: 79, date: '2026-03-01' },
];

// Investor notifications
export const INVESTOR_NOTIFICATIONS = [
  { id: 'n_001', type: 'vote',      icon: 'how_to_vote',   message: 'Aura Wind Energy — Phase 2 voting window is open (18h remaining). Cast your vote now!', time: '1 hour ago',  read: false },
  { id: 'n_002', type: 'milestone', icon: 'flag',          message: 'Aura Wind Energy submitted proof for Phase 2: Turbine Procurement.', time: '3 hours ago', read: false },
  { id: 'n_003', type: 'qa',        icon: 'forum',         message: 'Aura Wind Energy answered your question about offtake agreements.', time: '1 day ago',   read: false },
  { id: 'n_004', type: 'ledger',    icon: 'receipt_long',  message: 'Capital release of $800,000 recorded on the immutable ledger.',       time: 'Yesterday',  read: true  },
  { id: 'n_005', type: 'kyb',       icon: 'verified_user', message: 'HydroClear Technologies KYB status updated: Verified.',             time: '2 days ago',  read: true  },
  { id: 'n_006', type: 'esg',       icon: 'eco',           message: 'ESG Audit report available for ThermaVault Energy.',                time: '3 days ago',  read: true  },
  { id: 'n_007', type: 'announce',  icon: 'campaign',      message: 'Solaris Grid Systems posted a new announcement: Manufacturing partnership signed.', time: '4 days ago', read: true },
];

// Founder (startup_001) notifications
export const FOUNDER_NOTIFICATIONS = [
  { id: 'fn_001', type: 'vote',      icon: 'how_to_vote',   message: '2 votes received for Phase 2 milestone. 18h remaining. Currently: 1 approved, 1 rejected.', time: '2 hours ago', read: false },
  { id: 'fn_002', type: 'qa',        icon: 'forum',         message: 'New question from an anonymous investor: "What happens if grid connection faces delays?"', time: '4 hours ago', read: false },
  { id: 'fn_003', type: 'ledger',    icon: 'account_balance', message: '$800,000 Phase 1 tranche released to your account (Block #1042).', time: '3 days ago', read: true },
  { id: 'fn_004', type: 'announce',  icon: 'campaign',      message: 'Your announcement was seen by 47 investors. 12 found it helpful.', time: '4 days ago', read: true },
  { id: 'fn_005', type: 'profile',   icon: 'person',        message: 'Profile completeness reached 94%. Add pitch deck to hit 100%.', time: '1 week ago', read: true },
];

// ─── Trust Score Breakdown ──────────────────────────────────

export function getTrustScoreBreakdown(startup) {
  const profileScore      = Math.round((startup.profileCompletionScore / 100) * 25);
  const milestonesDone    = (startup.milestones || []).filter(m => ['verified','released'].includes(m.status)).length;
  const milestoneTotal    = (startup.milestones || []).length || 1;
  const milestoneScore    = Math.round((milestonesDone / milestoneTotal) * 30);
  const fundScore         = 25; // placeholder
  const sentimentScore    = Math.round((startup.esgScore / 100) * 20);
  const total             = profileScore + milestoneScore + fundScore + sentimentScore;
  return { profileScore, milestoneScore, fundScore, sentimentScore, total };
}

export function InvestmentProvider({ children }) {
  const [investments]          = useState(INVESTMENTS);
  const [startups, setStartups] = useState(STARTUPS);
  const [auditEntries]         = useState(AUDIT_ENTRIES);
  const [investorNotifications, setInvestorNotifications] = useState(INVESTOR_NOTIFICATIONS);
  const [founderNotifications,  setFounderNotifications]  = useState(FOUNDER_NOTIFICATIONS);

  const portfolioValue   = investments.reduce((s, i) => s + i.amount, 0);
  const avgTrustScore    = Math.round(investments.reduce((s, i) => s + i.trustScore, 0) / investments.length);
  const tranchesReleased = 4;

  // Add a Q&A question to a startup
  const addQuestion = (startupId, { question, isAnonymous, authorName }) => {
    setStartups(prev => prev.map(s => {
      if (s.id !== startupId) return s;
      const newQ = {
        id: `qa_${Date.now()}`,
        question,
        isAnonymous,
        author: isAnonymous ? 'Anonymous Investor' : authorName,
        createdAt: new Date().toISOString(),
        isAnswered: false,
        answer: null,
        answeredAt: null,
      };
      return { ...s, qa: [...(s.qa || []), newQ] };
    }));
  };

  // Answer a Q&A question (founder only)
  const answerQuestion = (startupId, questionId, answer) => {
    setStartups(prev => prev.map(s => {
      if (s.id !== startupId) return s;
      return {
        ...s,
        qa: (s.qa || []).map(q =>
          q.id === questionId
            ? { ...q, isAnswered: true, answer, answeredAt: new Date().toISOString() }
            : q
        ),
      };
    }));
    // Notify investors
    setInvestorNotifications(prev => [{
      id: `n_${Date.now()}`,
      type: 'qa',
      icon: 'forum',
      message: `Your question has been answered by the startup.`,
      time: 'Just now',
      read: false,
    }, ...prev]);
  };

  // Post announcement (founder only)
  const postAnnouncement = (startupId, { content, pinned }) => {
    setStartups(prev => prev.map(s => {
      if (s.id !== startupId) return s;
      const ann = {
        id: `ann_${Date.now()}`,
        content,
        pinned: !!pinned,
        createdAt: new Date().toISOString(),
        likeCount: 0,
      };
      return { ...s, announcements: [ann, ...(s.announcements || [])] };
    }));
    setInvestorNotifications(prev => [{
      id: `n_${Date.now()}`,
      type: 'announce',
      icon: 'campaign',
      message: `New announcement from startup. Check the Communication Hub.`,
      time: 'Just now',
      read: false,
    }, ...prev]);
  };

  // Cast milestone vote (investor only)
  const castVote = (startupId, milestoneId, investorId, approved) => {
    setStartups(prev => prev.map(s => {
      if (s.id !== startupId) return s;
      return {
        ...s,
        milestones: (s.milestones || []).map(m => {
          if (m.id !== milestoneId) return m;
          const existingVote = (m.votes || []).find(v => v.investor === investorId);
          const updatedVotes = existingVote
            ? (m.votes || []).map(v => v.investor === investorId ? { ...v, approved } : v)
            : [...(m.votes || []), { investor: investorId, approved }];
          const approvedCount = updatedVotes.filter(v => v.approved).length;
          const newStatus = (approvedCount / updatedVotes.length) >= 0.6 && updatedVotes.length >= 2
            ? 'verified' : m.status;
          return { ...m, votes: updatedVotes, status: newStatus };
        }),
      };
    }));
    setFounderNotifications(prev => [{
      id: `fn_${Date.now()}`,
      type: 'vote',
      icon: 'how_to_vote',
      message: `An investor ${approved ? 'approved' : 'rejected'} your milestone submission.`,
      time: 'Just now',
      read: false,
    }, ...prev]);
  };

  // Add milestone comment
  const addMilestoneComment = (startupId, milestoneId, { author, text, isAnonymous, avatar }) => {
    setStartups(prev => prev.map(s => {
      if (s.id !== startupId) return s;
      return {
        ...s,
        milestones: (s.milestones || []).map(m => {
          if (m.id !== milestoneId) return m;
          return {
            ...m,
            comments: [...(m.comments || []), {
              author: isAnonymous ? 'Anonymous Investor' : author,
              text,
              date: new Date().toISOString(),
              avatar: isAnonymous ? '?' : avatar,
              isAnonymous: !!isAnonymous,
            }],
          };
        }),
      };
    }));
  };

  return (
    <InvestmentContext.Provider value={{
      investments, startups, auditEntries,
      investorNotifications, founderNotifications,
      // backward compat — default to investor notifications
      notifications: investorNotifications,
      portfolioValue, avgTrustScore, tranchesReleased,
      addQuestion, answerQuestion, postAnnouncement,
      castVote, addMilestoneComment,
    }}>
      {children}
    </InvestmentContext.Provider>
  );
}

export function useInvestment() {
  const ctx = useContext(InvestmentContext);
  if (!ctx) throw new Error('useInvestment must be used within InvestmentProvider');
  return ctx;
}
