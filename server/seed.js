/**
 * CleanLedger — MongoDB Seed Script (Full Data)
 * Usage: node seed.js
 * Run from the server/ directory with MONGO_URI set in .env
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const crypto   = require('crypto');

const User        = require('./models/User');
const Startup     = require('./models/Startup');
const Investment  = require('./models/Investment');
const AuditEntry  = require('./models/AuditEntry');
const Message     = require('./models/Message');
const Notification= require('./models/Notification');

const GENESIS_HASH = '0'.repeat(64);

function sha256(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // ── Clear all collections ──────────────────────────────────
  await Promise.all([
    User.deleteMany({}),
    Startup.deleteMany({}),
    Investment.deleteMany({}),
    AuditEntry.deleteMany({}),
    Message.deleteMany({}),
    Notification.deleteMany({}),
  ]);
  console.log('🗑️  Cleared existing data');

  // ── Users ─────────────────────────────────────────────────
  const admin = await User.create({
    name: 'CleanLedger Admin',
    email: 'admin@cleanledger.io',
    password: 'Admin1234!',
    role: 'admin',
    organization: 'CleanLedger',
    kyc: { status: 'verified', verifiedAt: new Date() },
  });

  const investor = await User.create({
    name: 'James Whitfield',
    email: 'james.whitfield@capital.com',
    password: 'Investor1234!',
    role: 'investor',
    organization: 'Whitfield Capital Partners',
    entityType: 'individual',
    kyc: { status: 'verified', verifiedAt: new Date() },
  });

  const founder = await User.create({
    name: 'Priya Mehta',
    email: 'priya.mehta@aurawind.com',
    password: 'Founder1234!',
    role: 'startup',
    organization: 'Aura Wind Energy',
    entityType: 'company',
    kyc: { status: 'verified', verifiedAt: new Date() },
  });

  console.log('👤 Users created');

  // ── Startups ──────────────────────────────────────────────
  const NOW = new Date();
  const daysAgo = d => new Date(NOW - d * 86400000);
  const daysAhead = d => new Date(NOW.getTime() + d * 86400000);

  // ─ 1. Aura Wind Energy (Priya is the founder) ─
  const aura = await Startup.create({
    name: 'Aura Wind Energy',
    sector: 'Clean Energy',
    category: 'CleanTech',
    geography: 'Northern Europe',
    description: 'Offshore wind infrastructure developer targeting the North Sea with proprietary blade technology and AI-driven energy routing.',
    tags: ['ESG', 'Wind', 'CleanTech'],
    website: 'https://aurawindenergy.com',
    fundingTarget: 5_000_000,
    totalRaised: 4_200_000,
    backers: 124,
    esgScore: 92,
    verificationStatus: 'verified',
    profileCompletionScore: 94,
    pitchQualityScore: 8.4,
    trustScore: 87,
    riskLevel: 'LOW',
    credibilityIndex: 91,
    scoreComponents: { profileScore: 94, milestoneScore: 80, fundAccuracy: 95, sentimentScore: 85 },
    createdBy: founder._id,
    fundingTimeline: '18 months',
    documents: [
      { name: 'KYB Clear', status: 'verified' },
      { name: "ESG Audit '23", status: 'verified' },
      { name: 'ISO 14001', status: 'verified' },
    ],
    teamMembers: [
      { name: 'Priya Mehta',    role: 'CEO & Founder',    linkedIn: 'linkedin.com/in/priyamehta',    idVerified: true, verificationStatus: 'verified' },
      { name: 'Lars Eriksson',  role: 'CTO',              linkedIn: 'linkedin.com/in/larseriksson',   idVerified: true, verificationStatus: 'verified' },
      { name: 'Sophie Müller',  role: 'CFO',              linkedIn: 'linkedin.com/in/sophiemuller',   idVerified: false, verificationStatus: 'pending' },
    ],
    fundAllocation: {
      tech:       { planned: 45, actual: 43 },
      marketing:  { planned: 20, actual: 18 },
      operations: { planned: 25, actual: 27 },
      legal:      { planned: 10, actual: 12 },
    },
    expenses: [
      { category: 'tech',       amount: 120000, description: 'Blade prototype R&D lab costs',          uploadedAt: daysAgo(90) },
      { category: 'tech',       amount:  80000, description: 'AI energy-routing software licences',    uploadedAt: daysAgo(60) },
      { category: 'operations', amount:  85000, description: 'Site survey & marine logistics',          uploadedAt: daysAgo(45) },
      { category: 'operations', amount:  60000, description: 'Turbine assembly facility rental',        uploadedAt: daysAgo(20) },
      { category: 'legal',      amount:  32000, description: 'IP registration — EU & UK patents',       uploadedAt: daysAgo(30) },
      { category: 'marketing',  amount:  25000, description: 'ESG investor roadshow — London & Oslo',   uploadedAt: daysAgo(15) },
    ],
    varianceAlerts: [
      { category: 'operations', plannedPct: 25, actualPct: 27, resolved: false },
      { category: 'legal',      plannedPct: 10, actualPct: 12, resolved: false },
    ],
    milestones: [
      {
        title: 'Site Acquisition',
        description: 'Land rights secured (50 acres, coastal). Environmental assessments completed.',
        successCriteria: 'Signed lease agreements + environmental clearance certificate.',
        targetDate: daysAgo(200),
        tranchePct: 20,
        status: 'released',
        proofUrl: 'https://docs.aurawind.com/phase1-proof',
        proofNote: 'Lease agreement signed with North Sea Authority. Environmental clearance attached.',
        submittedAt: daysAgo(205),
        voteDeadline: daysAgo(203),
        voteResult: 'passed',
        releasedAt: daysAgo(202),
        votes: [
          { investor: investor._id, approved: true, votedAt: daysAgo(204) },
        ],
        commentCount: 2,
      },
      {
        title: 'Turbine Procurement',
        description: 'Contracts with Vestas for 5× V162-6.2 MW turbines. First delivery scheduled.',
        successCriteria: 'Signed procurement contracts + first turbine delivery confirmation.',
        targetDate: daysAhead(5),
        tranchePct: 30,
        status: 'submitted',
        proofUrl: 'https://docs.aurawind.com/phase2-proof',
        proofNote: 'Vestas contract signed 2026-04-10. Invoice attached. First turbine delivery: April 25.',
        submittedAt: daysAgo(3),
        voteDeadline: daysAhead(1),
        voteResult: 'pending',
        votes: [
          { investor: investor._id, approved: true, votedAt: daysAgo(2) },
        ],
        commentCount: 1,
      },
      {
        title: 'Grid Connection',
        description: 'Substation installation + national grid tie-in approval from regulatory body.',
        successCriteria: 'Grid connection licence issued by National Grid Authority.',
        targetDate: daysAhead(90),
        tranchePct: 30,
        status: 'pending',
        votes: [],
        commentCount: 0,
      },
      {
        title: 'Commercial Operations',
        description: 'First power generation — 12 MW capacity online feeding national grid.',
        successCriteria: 'First month electricity generation report + grid billing receipt.',
        targetDate: daysAhead(180),
        tranchePct: 20,
        status: 'pending',
        votes: [],
        commentCount: 0,
      },
    ],
  });

  // ─ 2. Solaris Grid Systems ─
  const solaris = await Startup.create({
    name: 'Solaris Grid Systems',
    sector: 'Solar Tech',
    category: 'CleanTech',
    geography: 'Sub-Saharan Africa',
    description: 'Modular solar micro-grid solutions for off-grid communities across East Africa. 12 villages already connected.',
    tags: ['ESG', 'Solar', 'Impact'],
    website: 'https://solarisgrid.io',
    fundingTarget: 6_000_000,
    totalRaised: 2_800_000,
    backers: 89,
    esgScore: 88,
    verificationStatus: 'verified',
    profileCompletionScore: 82,
    pitchQualityScore: 7.6,
    trustScore: 78,
    riskLevel: 'LOW',
    credibilityIndex: 83,
    scoreComponents: { profileScore: 82, milestoneScore: 65, fundAccuracy: 90, sentimentScore: 75 },
    createdBy: admin._id,
    fundingTimeline: '24 months',
    documents: [{ name: 'KYB Clear', status: 'verified' }],
    teamMembers: [
      { name: 'Amara Diallo',  role: 'CEO', linkedIn: 'linkedin.com/in/amaradiallo', idVerified: true, verificationStatus: 'verified' },
      { name: 'Kwame Asante',  role: 'CTO', linkedIn: 'linkedin.com/in/kwameasante', idVerified: true, verificationStatus: 'verified' },
    ],
    fundAllocation: {
      tech:       { planned: 50, actual: 52 },
      marketing:  { planned: 15, actual: 13 },
      operations: { planned: 25, actual: 25 },
      legal:      { planned: 10, actual: 10 },
    },
    expenses: [
      { category: 'tech',       amount: 200000, description: 'Solar panel procurement — LONGi 400W', uploadedAt: daysAgo(120) },
      { category: 'tech',       amount:  95000, description: 'Battery storage systems (LiFePO4)',    uploadedAt: daysAgo(80) },
      { category: 'operations', amount:  70000, description: 'Installation teams — Kenya & Tanzania', uploadedAt: daysAgo(50) },
      { category: 'legal',      amount:  28000, description: 'Regulatory filings — 3 countries',     uploadedAt: daysAgo(100) },
    ],
    milestones: [
      {
        title: 'Pilot Deployment — Kenya',
        description: '12 villages in Kenya connected with 5 kW micro-grid each.',
        successCriteria: 'Energy access certificates from Kenya Rural Electrification Authority.',
        targetDate: daysAgo(180),
        tranchePct: 25,
        status: 'released',
        proofUrl: 'https://docs.solarisgrid.io/pilot-proof',
        voteResult: 'passed',
        releasedAt: daysAgo(175),
        votes: [
          { investor: investor._id, approved: true, votedAt: daysAgo(177) },
        ],
        commentCount: 0,
      },
      {
        title: 'Scale Production Partnership',
        description: 'Manufacturing partnership with LONGi Solar for 500 units/quarter.',
        successCriteria: 'Signed MoU with LONGi + first batch delivery confirmation.',
        targetDate: daysAhead(30),
        tranchePct: 35,
        status: 'in_progress',
        votes: [],
        commentCount: 0,
      },
      {
        title: 'Tanzania & Uganda Expansion',
        description: 'National utility partnerships in Tanzania and Uganda. 50 additional villages.',
        successCriteria: 'Signed partnership agreements + 10 villages live.',
        targetDate: daysAhead(150),
        tranchePct: 40,
        status: 'pending',
        votes: [],
        commentCount: 0,
      },
    ],
  });

  // ─ 3. HydroClear Technologies ─
  const hydro = await Startup.create({
    name: 'HydroClear Technologies',
    sector: 'Water Tech',
    category: 'CleanTech',
    geography: 'Southeast Asia',
    description: 'Zero-discharge industrial water recycling systems for semiconductor fabs. Patent-granted nano-filtration technology.',
    tags: ['ESG', 'Water', 'DeepTech'],
    website: 'https://hydroclear.tech',
    fundingTarget: 8_000_000,
    totalRaised: 5_800_000,
    backers: 201,
    esgScore: 95,
    verificationStatus: 'verified',
    profileCompletionScore: 96,
    pitchQualityScore: 9.1,
    trustScore: 92,
    riskLevel: 'LOW',
    credibilityIndex: 95,
    scoreComponents: { profileScore: 96, milestoneScore: 90, fundAccuracy: 95, sentimentScore: 88 },
    createdBy: admin._id,
    fundingTimeline: '18 months',
    documents: [
      { name: 'KYB Clear',      status: 'verified' },
      { name: 'ISO 14001 Cert', status: 'verified' },
      { name: 'Patent Grant',   status: 'verified' },
    ],
    teamMembers: [
      { name: 'Dr. Wei Zhang',   role: 'CEO & Inventor', linkedIn: 'linkedin.com/in/weizhang',  idVerified: true, verificationStatus: 'verified' },
      { name: 'Siti Rahmaniah', role: 'COO',            linkedIn: 'linkedin.com/in/sitirahman', idVerified: true, verificationStatus: 'verified' },
    ],
    fundAllocation: {
      tech:       { planned: 60, actual: 60 },
      marketing:  { planned: 10, actual:  9 },
      operations: { planned: 20, actual: 21 },
      legal:      { planned: 10, actual: 10 },
    },
    expenses: [
      { category: 'tech',       amount: 400000, description: 'Nano-filtration membrane R&D',          uploadedAt: daysAgo(300) },
      { category: 'tech',       amount: 250000, description: 'TSMC pilot installation equipment',      uploadedAt: daysAgo(200) },
      { category: 'operations', amount: 120000, description: 'Malaysia fab site preparation',          uploadedAt: daysAgo(60) },
      { category: 'legal',      amount:  58000, description: 'Patent filing — 8 jurisdictions',       uploadedAt: daysAgo(250) },
    ],
    milestones: [
      {
        title: 'R&D Completion & Patent Grant',
        description: 'Patent granted for nano-filtration membrane. Lab validation complete.',
        successCriteria: 'USPTO patent grant certificate + validation test report.',
        targetDate: daysAgo(300),
        tranchePct: 20,
        status: 'released',
        proofUrl: 'https://docs.hydroclear.tech/patent',
        voteResult: 'passed',
        releasedAt: daysAgo(295),
        votes: [
          { investor: investor._id, approved: true, votedAt: daysAgo(297) },
        ],
        commentCount: 0,
      },
      {
        title: 'TSMC Pilot Installation',
        description: 'Pilot system at TSMC fab — 99.7% water recovery rate achieved.',
        successCriteria: 'TSMC validation report showing ≥99% recovery + zero discharge.',
        targetDate: daysAgo(100),
        tranchePct: 30,
        status: 'released',
        proofUrl: 'https://docs.hydroclear.tech/tsmc-pilot',
        voteResult: 'passed',
        releasedAt: daysAgo(95),
        votes: [
          { investor: investor._id, approved: true, votedAt: daysAgo(97) },
        ],
        commentCount: 0,
      },
      {
        title: 'Malaysia Commercial Scale',
        description: 'Expansion to 10 additional semiconductor fabs in Malaysia.',
        successCriteria: '5 signed contracts + first installation running.',
        targetDate: daysAhead(45),
        tranchePct: 50,
        status: 'in_progress',
        votes: [],
        commentCount: 0,
      },
    ],
  });

  // ─ 4. Verdant Carbon Labs ─
  const verdant = await Startup.create({
    name: 'Verdant Carbon Labs',
    sector: 'Carbon Markets',
    category: 'CleanTech',
    geography: 'Global',
    description: 'Blockchain-verified carbon credit marketplace for regenerative agriculture and forestry projects.',
    tags: ['Carbon', 'Blockchain', 'ESG'],
    website: 'https://verdantcarbon.io',
    fundingTarget: 4_000_000,
    totalRaised: 1_600_000,
    backers: 67,
    esgScore: 86,
    verificationStatus: 'verified',
    profileCompletionScore: 75,
    pitchQualityScore: 7.2,
    trustScore: 72,
    riskLevel: 'MEDIUM',
    credibilityIndex: 76,
    scoreComponents: { profileScore: 75, milestoneScore: 60, fundAccuracy: 85, sentimentScore: 70 },
    createdBy: admin._id,
    fundingTimeline: '12 months',
    documents: [{ name: 'KYB Clear', status: 'verified' }],
    teamMembers: [
      { name: 'Elena Vasquez', role: 'CEO', linkedIn: 'linkedin.com/in/elenavasquez', idVerified: true,  verificationStatus: 'verified' },
      { name: 'Tom Bakker',    role: 'CTO', linkedIn: 'linkedin.com/in/tombakker',    idVerified: false, verificationStatus: 'pending' },
    ],
    fundAllocation: {
      tech:       { planned: 40, actual: 38 },
      marketing:  { planned: 25, actual: 28 },
      operations: { planned: 25, actual: 24 },
      legal:      { planned: 10, actual: 10 },
    },
    expenses: [
      { category: 'tech',       amount: 80000, description: 'Smart contract development & audit',  uploadedAt: daysAgo(150) },
      { category: 'marketing',  amount: 45000, description: 'Carbon market conference circuit',    uploadedAt: daysAgo(90) },
      { category: 'operations', amount: 38000, description: 'Registry operations & compliance',   uploadedAt: daysAgo(60) },
    ],
    milestones: [
      {
        title: 'Carbon Registry Platform Launch',
        description: 'Carbon credit tokenization platform live with first 10 registered projects.',
        successCriteria: 'Platform live + 10 projects registered + 1st credit transaction.',
        targetDate: daysAgo(150),
        tranchePct: 30,
        status: 'released',
        proofUrl: 'https://docs.verdantcarbon.io/platform-launch',
        voteResult: 'passed',
        releasedAt: daysAgo(145),
        votes: [
          { investor: investor._id, approved: true, votedAt: daysAgo(147) },
        ],
        commentCount: 0,
      },
      {
        title: 'Forest Projects Onboarding',
        description: 'Onboarding 50 certified forest projects from 8 countries.',
        successCriteria: '50 projects onboarded + Verra certification for each.',
        targetDate: daysAhead(60),
        tranchePct: 40,
        status: 'in_progress',
        votes: [],
        commentCount: 0,
      },
      {
        title: 'Exchange Partnership',
        description: 'Integration with major voluntary carbon exchange for liquidity.',
        successCriteria: 'Signed exchange API integration + first credit traded.',
        targetDate: daysAhead(120),
        tranchePct: 30,
        status: 'pending',
        votes: [],
        commentCount: 0,
      },
    ],
  });

  // ─ 5. ThermaVault Energy ─
  const therma = await Startup.create({
    name: 'ThermaVault Energy',
    sector: 'Thermal Storage',
    category: 'CleanTech',
    geography: 'Central Europe',
    description: 'Molten-salt thermal energy storage systems for industrial heat applications. 500 kWh pilot operational in Munich.',
    tags: ['Storage', 'Industrial', 'CleanTech'],
    website: 'https://thermavault.eu',
    fundingTarget: 7_500_000,
    totalRaised: 3_750_000,
    backers: 113,
    esgScore: 82,
    verificationStatus: 'verified',
    profileCompletionScore: 80,
    pitchQualityScore: 7.8,
    trustScore: 79,
    riskLevel: 'LOW',
    credibilityIndex: 82,
    scoreComponents: { profileScore: 80, milestoneScore: 70, fundAccuracy: 88, sentimentScore: 78 },
    createdBy: admin._id,
    fundingTimeline: '24 months',
    documents: [{ name: 'KYB Clear', status: 'verified' }],
    teamMembers: [
      { name: 'Franz Huber',    role: 'CEO', linkedIn: 'linkedin.com/in/franzhuber',  idVerified: true, verificationStatus: 'verified' },
      { name: 'Ingrid Becker',  role: 'CTO', linkedIn: 'linkedin.com/in/ingridbecker', idVerified: true, verificationStatus: 'verified' },
    ],
    fundAllocation: {
      tech:       { planned: 55, actual: 54 },
      marketing:  { planned: 15, actual: 14 },
      operations: { planned: 20, actual: 22 },
      legal:      { planned: 10, actual:  9 },
    },
    expenses: [
      { category: 'tech',       amount: 250000, description: 'Molten salt containment vessel construction',  uploadedAt: daysAgo(200) },
      { category: 'tech',       amount: 120000, description: 'Heat exchanger system — industrial grade',      uploadedAt: daysAgo(150) },
      { category: 'operations', amount:  80000, description: 'Munich pilot site operational costs',           uploadedAt: daysAgo(60) },
      { category: 'legal',      amount:  35000, description: 'EU industrial certification filings',           uploadedAt: daysAgo(100) },
    ],
    milestones: [
      {
        title: '500 kWh Prototype Operational',
        description: 'Molten-salt 500 kWh pilot system operational in Munich industrial park.',
        successCriteria: '30-day operational data + efficiency report > 85%.',
        targetDate: daysAgo(240),
        tranchePct: 25,
        status: 'released',
        voteResult: 'passed',
        releasedAt: daysAgo(235),
        votes: [
          { investor: investor._id, approved: true, votedAt: daysAgo(237) },
        ],
        commentCount: 0,
      },
      {
        title: '5 MWh Commercial System',
        description: 'Scale to 5 MWh commercial system for industrial park supply.',
        successCriteria: 'Commission certificate + 14-day performance report.',
        targetDate: daysAhead(20),
        tranchePct: 40,
        status: 'in_progress',
        votes: [],
        commentCount: 0,
      },
      {
        title: 'EU Industrial Park Distribution',
        description: 'Deployments across 5 EU industrial parks in Germany, Austria, Poland.',
        successCriteria: '3 signed contracts + first installation complete.',
        targetDate: daysAhead(180),
        tranchePct: 35,
        status: 'pending',
        votes: [],
        commentCount: 0,
      },
    ],
  });

  // ─ 6. AquaTrace Monitoring ─
  const aqua = await Startup.create({
    name: 'AquaTrace Monitoring',
    sector: 'Environmental IoT',
    category: 'CleanTech',
    geography: 'Scandinavia',
    description: 'AI-driven water quality monitoring network for municipal water utilities. 400 sensors deployed across Oslo.',
    tags: ['IoT', 'AI', 'Water', 'ESG'],
    website: 'https://aquatrace.no',
    fundingTarget: 3_000_000,
    totalRaised: 2_100_000,
    backers: 78,
    esgScore: 90,
    verificationStatus: 'verified',
    profileCompletionScore: 85,
    pitchQualityScore: 8.0,
    trustScore: 83,
    riskLevel: 'LOW',
    credibilityIndex: 86,
    scoreComponents: { profileScore: 85, milestoneScore: 75, fundAccuracy: 92, sentimentScore: 82 },
    createdBy: admin._id,
    fundingTimeline: '12 months',
    documents: [{ name: 'KYB Clear', status: 'verified' }],
    teamMembers: [
      { name: 'Astrid Larsen', role: 'CEO', linkedIn: 'linkedin.com/in/astridlarsen', idVerified: true, verificationStatus: 'verified' },
      { name: 'Bjorn Olsen',   role: 'CTO', linkedIn: 'linkedin.com/in/bjornolsen',   idVerified: true, verificationStatus: 'verified' },
    ],
    fundAllocation: {
      tech:       { planned: 50, actual: 49 },
      marketing:  { planned: 15, actual: 16 },
      operations: { planned: 25, actual: 25 },
      legal:      { planned: 10, actual: 10 },
    },
    expenses: [
      { category: 'tech',       amount: 150000, description: 'IoT sensor hardware — 400 units',        uploadedAt: daysAgo(180) },
      { category: 'tech',       amount:  80000, description: 'ML contamination detection model',        uploadedAt: daysAgo(90) },
      { category: 'operations', amount:  70000, description: 'Oslo deployment & maintenance contracts', uploadedAt: daysAgo(60) },
    ],
    milestones: [
      {
        title: 'Oslo Sensor Network (400 sensors)',
        description: '400 sensors deployed across Oslo municipal water system.',
        successCriteria: 'All sensors online + Oslo Vann confirmation letter.',
        targetDate: daysAgo(150),
        tranchePct: 35,
        status: 'released',
        voteResult: 'passed',
        releasedAt: daysAgo(145),
        votes: [
          { investor: investor._id, approved: true, votedAt: daysAgo(147) },
        ],
        commentCount: 0,
      },
      {
        title: 'ML Analytics Platform',
        description: 'Predictive contamination detection model — <2h alert time.',
        successCriteria: '90-day model accuracy report ≥ 95% precision.',
        targetDate: daysAhead(15),
        tranchePct: 40,
        status: 'in_progress',
        votes: [],
        commentCount: 0,
      },
      {
        title: 'Nordic Utility Expansion',
        description: 'Expansion to Stockholm, Copenhagen, Helsinki utilities.',
        successCriteria: '3 utility MoUs signed + pilot sensors installed.',
        targetDate: daysAhead(120),
        tranchePct: 25,
        status: 'pending',
        votes: [],
        commentCount: 0,
      },
    ],
  });

  console.log('🏢 6 startups created');

  // ── Investments ───────────────────────────────────────────
  const inv1 = await Investment.create({
    investor: investor._id, startup: aura._id,
    startupName: 'Aura Wind Energy', sector: 'Clean Energy',
    amount: 500_000, trustScore: 87,
    trancheStatus: 'Phase 2 — Voting Open',
    trancheTag: 'Turbine Procurement', status: 'active',
    date: new Date('2026-01-10'),
  });
  const inv2 = await Investment.create({
    investor: investor._id, startup: hydro._id,
    startupName: 'HydroClear Technologies', sector: 'Water Tech',
    amount: 350_000, trustScore: 92,
    trancheStatus: 'Phase 3 — In Progress',
    trancheTag: 'Malaysia Commercial Scale', status: 'active',
    date: new Date('2025-11-22'),
  });
  const inv3 = await Investment.create({
    investor: investor._id, startup: therma._id,
    startupName: 'ThermaVault Energy', sector: 'Thermal Storage',
    amount: 250_000, trustScore: 79,
    trancheStatus: 'Phase 2 — In Progress',
    trancheTag: '5 MWh Commercial System', status: 'active',
    date: new Date('2026-02-14'),
  });
  const inv4 = await Investment.create({
    investor: investor._id, startup: solaris._id,
    startupName: 'Solaris Grid Systems', sector: 'Solar Tech',
    amount: 200_000, trustScore: 78,
    trancheStatus: 'Phase 2 — In Progress',
    trancheTag: 'Scale Production Partnership', status: 'active',
    date: new Date('2026-03-01'),
  });

  console.log('💰 Investments created');

  // ── Q&A Messages ─────────────────────────────────────────
  // Aura Wind Q&A
  const qa1 = await Message.create({
    type: 'qa', startup: aura._id, author: investor._id,
    question: 'What is your contingency plan if the Vestas turbine delivery is delayed beyond April 25?',
    isAnonymous: false,
    answer: 'We have a 3-week buffer in our project plan. Additionally, we have a standby agreement with Siemens Gamesa for 2 units at a 5% premium. The grid connection phase cannot begin before May anyway.',
    answeredAt: daysAgo(1), isAnswered: true,
  });
  const qa2 = await Message.create({
    type: 'qa', startup: aura._id, author: investor._id,
    question: 'How does the AI energy routing system differentiate Aura from competitors?',
    isAnonymous: true,
    answer: 'Our patented adaptive routing reduces energy transmission loss by 18% vs. conventional SCADA systems. We have a 2-year head start on training data from our pilot arrays.',
    answeredAt: daysAgo(5), isAnswered: true,
  });
  const qa3 = await Message.create({
    type: 'qa', startup: aura._id, author: investor._id,
    question: 'Can you clarify the legal cost overrun shown in the fund dashboard?',
    isAnonymous: true,
    answer: '',
    isAnswered: false,
  });

  // HydroClear Q&A
  await Message.create({
    type: 'qa', startup: hydro._id, author: investor._id,
    question: 'What is the payback period for a semiconductor fab adopting your system?',
    isAnonymous: false,
    answer: 'Based on our TSMC pilot, fabs recover capital cost in 14–18 months through water bill savings (averaging $2.1M/year for a 12-inch fab).',
    answeredAt: daysAgo(10), isAnswered: true,
  });

  // Solaris Q&A
  await Message.create({
    type: 'qa', startup: solaris._id, author: investor._id,
    question: 'Is the LONGi partnership exclusive or can competitors access the same pricing?',
    isAnonymous: true,
    answer: 'We have a preferred pricing MoU giving us a 12% discount on bulk orders above 500 units/quarter. The exclusivity window is 18 months from signing.',
    answeredAt: daysAgo(7), isAnswered: true,
  });

  console.log('💬 Q&A messages created');

  // ── Announcements ─────────────────────────────────────────
  await Message.create({
    type: 'announcement', startup: aura._id, author: founder._id,
    content: '🎉 Phase 2 Milestone Proof Submitted! We have submitted official documentation for the Turbine Procurement milestone. The 48-hour DAO voting window is now open. Investor vote required by midnight April 20.',
    pinned: true,
  });
  await Message.create({
    type: 'announcement', startup: aura._id, author: founder._id,
    content: 'ESG Audit 2025 completed by Bureau Veritas — score improved from 88 to 92. Full report available to verified investors on the documents page.',
    pinned: false,
  });
  await Message.create({
    type: 'announcement', startup: hydro._id, author: admin._id,
    content: 'HydroClear has signed agreements with 3 additional semiconductor fabs in Malaysia. Commercial scale operations expected Q3 2026.',
    pinned: true,
  });
  await Message.create({
    type: 'announcement', startup: solaris._id, author: admin._id,
    content: 'LONGi Solar partnership MoU signed. First batch of 500 panels arrives in Nairobi port on May 8. Installation teams already deployed.',
    pinned: false,
  });

  console.log('📢 Announcements created');

  // ── Milestone Comments ────────────────────────────────────
  // Aura Phase 1 comments
  const auraMs0Id = aura.milestones[0]._id;
  await Message.create({
    type: 'milestone_comment', startup: aura._id,
    milestoneId: auraMs0Id.toString(), author: investor._id,
    content: 'Land deed documentation looks solid. Lease term of 25 years gives enough runway for full ROI. Approving.',
  });
  await Message.create({
    type: 'milestone_comment', startup: aura._id,
    milestoneId: auraMs0Id.toString(), author: investor._id,
    content: 'Environmental clearance report confirms no protected species impact. Good to proceed.',
  });

  // Aura Phase 2 comments (currently submitted/voting)
  const auraMs1Id = aura.milestones[1]._id;
  await Message.create({
    type: 'milestone_comment', startup: aura._id,
    milestoneId: auraMs1Id.toString(), author: investor._id,
    content: 'Vestas contract terms look competitive. V162-6.2 MW is top spec. Supporting approval.',
  });

  console.log('💭 Milestone comments created');

  // ── Notifications ─────────────────────────────────────────
  // Investor notifications
  await Notification.insertMany([
    {
      recipient: investor._id, startup: aura._id,
      type: 'vote_request',
      title: 'Vote Required — Aura Wind Energy Phase 2',
      body: 'Turbine Procurement milestone is awaiting your DAO vote. Window closes in 24 hours.',
      link: '/milestones',
      read: false,
    },
    {
      recipient: investor._id, startup: aura._id,
      type: 'milestone_update',
      title: 'Aura Wind: Phase 2 proof submitted',
      body: 'Priya Mehta submitted Phase 2 proof: Vestas contract + first delivery confirmation.',
      link: '/milestones',
      read: false,
    },
    {
      recipient: investor._id, startup: hydro._id,
      type: 'milestone_update',
      title: 'HydroClear: Malaysia expansion update',
      body: '3 new semiconductor fab contracts signed. Phase 3 milestone in progress.',
      link: '/milestones',
      read: true,
    },
    {
      recipient: investor._id, startup: aura._id,
      type: 'fund_release',
      title: 'Fund Release — $800,000 to Aura Wind Energy',
      body: 'Phase 1 Site Acquisition passed DAO vote (100%). Tranche released to escrow.',
      link: '/ledger',
      read: true,
    },
    {
      recipient: investor._id, startup: aura._id,
      type: 'announcement',
      title: 'Aura Wind: ESG Score improved to 92',
      body: 'Bureau Veritas ESG Audit 2025 complete. Score upgraded from 88 → 92.',
      link: '/communicate',
      read: true,
    },
    {
      recipient: investor._id, startup: solaris._id,
      type: 'announcement',
      title: 'Solaris Grid: LONGi MoU Signed',
      body: 'Manufacturing partnership confirmed. 500 panels/quarter production pipeline active.',
      link: '/communicate',
      read: true,
    },
  ]);

  // Founder (Priya) notifications
  await Notification.insertMany([
    {
      recipient: founder._id, startup: aura._id,
      type: 'vote_request',
      title: '1 new vote on Phase 2 milestone',
      body: 'James Whitfield voted APPROVE on Turbine Procurement. Current: 1/1 approved.',
      link: '/milestones',
      read: false,
    },
    {
      recipient: founder._id, startup: aura._id,
      type: 'qa_answer',
      title: 'New investor question',
      body: 'An anonymous investor asked about the legal cost overrun shown in the fund dashboard.',
      link: '/communicate',
      read: false,
    },
    {
      recipient: founder._id, startup: aura._id,
      type: 'fund_release',
      title: '$800,000 tranche released to your account',
      body: 'Phase 1 Site Acquisition verified. Funds released from escrow. Block #1042.',
      link: '/ledger',
      read: true,
    },
    {
      recipient: founder._id, startup: aura._id,
      type: 'milestone_comment',
      title: 'New comment on Phase 2 milestone',
      body: 'James Whitfield commented on Turbine Procurement voting window.',
      link: '/milestones',
      read: true,
    },
    {
      recipient: founder._id, startup: aura._id,
      type: 'variance_alert',
      title: 'Variance alert: Operations spending',
      body: 'Operations actual spend (27%) exceeds planned (25%) by >2pp. Review recommended.',
      link: '/funds',
      read: true,
    },
  ]);

  console.log('🔔 Notifications created');

  // ── Audit Chain ───────────────────────────────────────────
  let previousHash = GENESIS_HASH;
  let blockNumber  = 1001;

  const AUDIT_EVENTS = [
    { type: 'kyb_verified',       fromEntity: 'CleanLedger Admin',        toEntity: 'Aura Wind Energy',           amount: 0,         startup: aura._id },
    { type: 'kyb_verified',       fromEntity: 'CleanLedger Admin',        toEntity: 'HydroClear Technologies',    amount: 0,         startup: hydro._id },
    { type: 'kyb_verified',       fromEntity: 'CleanLedger Admin',        toEntity: 'Solaris Grid Systems',       amount: 0,         startup: solaris._id },
    { type: 'funding_allocation', fromEntity: 'James Whitfield',          toEntity: 'Aura Wind Energy',           amount: 500_000,   startup: aura._id },
    { type: 'funding_allocation', fromEntity: 'James Whitfield',          toEntity: 'HydroClear Technologies',    amount: 350_000,   startup: hydro._id },
    { type: 'funding_allocation', fromEntity: 'James Whitfield',          toEntity: 'ThermaVault Energy',         amount: 250_000,   startup: therma._id },
    { type: 'funding_allocation', fromEntity: 'James Whitfield',          toEntity: 'Solaris Grid Systems',       amount: 200_000,   startup: solaris._id },
    { type: 'dao_vote',           fromEntity: 'DAO Members',              toEntity: 'Aura Wind — Site Acquisition', amount: 0,       startup: aura._id },
    { type: 'milestone_complete', fromEntity: 'Aura Wind Energy',         toEntity: 'CleanLedger Escrow',         amount: 0,         startup: aura._id },
    { type: 'capital_release',    fromEntity: 'CleanLedger Escrow',       toEntity: 'Aura Wind Energy',           amount: 800_000,   startup: aura._id },
    { type: 'dao_vote',           fromEntity: 'DAO Members',              toEntity: 'HydroClear — R&D Milestone', amount: 0,         startup: hydro._id },
    { type: 'capital_release',    fromEntity: 'CleanLedger Escrow',       toEntity: 'HydroClear Technologies',    amount: 1_600_000, startup: hydro._id },
    { type: 'dao_vote',           fromEntity: 'DAO Members',              toEntity: 'Solaris — Pilot Deployment', amount: 0,         startup: solaris._id },
    { type: 'capital_release',    fromEntity: 'CleanLedger Escrow',       toEntity: 'Solaris Grid Systems',       amount: 700_000,   startup: solaris._id },
    { type: 'inter_account',      fromEntity: 'Whitfield Capital Partners', toEntity: 'CleanLedger Escrow',       amount: 1_300_000, startup: null },
    { type: 'milestone_complete', fromEntity: 'HydroClear Technologies',  toEntity: 'CleanLedger Escrow',         amount: 0,         startup: hydro._id },
    { type: 'capital_release',    fromEntity: 'CleanLedger Escrow',       toEntity: 'HydroClear Technologies',    amount: 2_400_000, startup: hydro._id },
    { type: 'dao_vote',           fromEntity: 'DAO Members',              toEntity: 'Aura Wind — Turbine Vote',   amount: 0,         startup: aura._id },
  ];

  for (const evt of AUDIT_EVENTS) {
    const entryData = {
      ...evt,
      blockNumber,
      initiatedBy: admin._id,
    };
    const payload = `${blockNumber}${evt.type}${evt.fromEntity}${evt.toEntity}${evt.amount}`;
    const hash = sha256(payload + previousHash);
    await AuditEntry.create({ ...entryData, hash, previousHash, status: 'confirmed' });
    previousHash = hash;
    blockNumber++;
  }

  console.log(`📒 ${AUDIT_EVENTS.length} audit entries created (chain verified)`);

  // ── Done ──────────────────────────────────────────────────
  console.log('\n🎉 Full seed complete!');
  console.log('═══════════════════════════════════════════════');
  console.log('Admin:    admin@cleanledger.io         / Admin1234!');
  console.log('Investor: james.whitfield@capital.com  / Investor1234!');
  console.log('Founder:  priya.mehta@aurawind.com     / Founder1234!');
  console.log('───────────────────────────────────────────────');
  console.log('Startups: 6  |  Investments: 4  |  Audit blocks: 18');
  console.log('Messages: Q&A + Announcements + Milestone Comments');
  console.log('Notifications: Investor (6) + Founder (5)');
  console.log('═══════════════════════════════════════════════\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  console.error(err.stack);
  process.exit(1);
});
