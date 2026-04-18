/**
 * CleanLedger — MongoDB Seed Script
 * Usage: node seed.js
 * Run from the server/ directory with MONGO_URI set in .env
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User       = require('./models/User');
const Startup    = require('./models/Startup');
const Investment = require('./models/Investment');
const AuditEntry = require('./models/AuditEntry');
const { computeHash, nextBlockNumber } = require('./services/hashService');
const { computeTrustScore }            = require('./services/trustScoreService');

const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

const STARTUPS_DATA = [
  {
    name: 'Aura Wind Energy',
    sector: 'Clean Energy',
    geography: 'Northern Europe',
    description: 'Offshore wind infrastructure developer targeting the North Sea with proprietary blade technology.',
    tags: ['ESG', 'Wind', 'CleanTech'],
    fundingTarget: 5_000_000,
    totalRaised:   4_200_000,
    backers: 124,
    esgScore: 92,
    verificationStatus: 'verified',
    documents: [
      { name: 'KYB Clear',     status: 'verified' },
      { name: "ESG Audit '23", status: 'verified' },
    ],
    milestones: [
      { phase: 'Phase 1', title: 'Site Acquisition',      status: 'complete',     description: 'Land rights secured (50 acres, coastal).' },
      { phase: 'Phase 2', title: 'Turbine Procurement',   status: 'in_progress',  description: 'Contracts with Vesta for 5× V162-6.2 MW turbines.', daoVoteRequired: true },
      { phase: 'Phase 3', title: 'Grid Connection',       status: 'pending',      description: 'Substation installation + national grid tie-in.' },
    ],
  },
  {
    name: 'Solaris Grid Systems',
    sector: 'Solar Tech',
    geography: 'Sub-Saharan Africa',
    description: 'Modular solar micro-grid solutions for off-grid communities across East Africa.',
    tags: ['ESG', 'Solar', 'Impact'],
    fundingTarget: 6_000_000,
    totalRaised:   2_800_000,
    backers: 89,
    esgScore: 88,
    verificationStatus: 'verified',
    documents: [{ name: 'KYB Clear', status: 'verified' }],
    milestones: [
      { phase: 'Phase 1', title: 'Pilot Deployment',  status: 'complete',    description: '12 villages in Kenya connected.' },
      { phase: 'Phase 2', title: 'Scale Production',  status: 'in_progress', description: 'Manufacturing partnership with LONGi Solar.' },
      { phase: 'Phase 3', title: 'Grid Integration',  status: 'pending',     description: 'National utility partnerships in Tanzania and Uganda.' },
    ],
  },
  {
    name: 'HydroClear Technologies',
    sector: 'Water Tech',
    geography: 'Southeast Asia',
    description: 'Zero-discharge industrial water recycling systems for semiconductor fabs.',
    tags: ['ESG', 'Water', 'DeepTech'],
    fundingTarget: 8_000_000,
    totalRaised:   5_800_000,
    backers: 201,
    esgScore: 95,
    verificationStatus: 'verified',
    documents: [
      { name: 'KYB Clear',       status: 'verified' },
      { name: 'ISO 14001 Cert',  status: 'verified' },
    ],
    milestones: [
      { phase: 'Phase 1', title: 'R&D Completion',    status: 'complete',    description: 'Patent granted for nano-filtration membrane.' },
      { phase: 'Phase 2', title: 'Pilot Factory',     status: 'complete',    description: 'TSMC pilot installation — 99.7% recovery rate.' },
      { phase: 'Phase 3', title: 'Commercial Scale',  status: 'in_progress', description: 'Expansion to 10 additional fabs in Malaysia.' },
    ],
  },
  {
    name: 'Verdant Carbon Labs',
    sector: 'Carbon Markets',
    geography: 'Global',
    description: 'Blockchain-verified carbon credit marketplace for regenerative agriculture and forestry.',
    tags: ['Carbon', 'Blockchain', 'ESG'],
    fundingTarget: 4_000_000,
    totalRaised:   1_600_000,
    backers: 67,
    esgScore: 86,
    verificationStatus: 'verified',
    documents: [{ name: 'KYB Clear', status: 'verified' }],
    milestones: [
      { phase: 'Phase 1', title: 'Registry Build',   status: 'complete',    description: 'Carbon credit tokenization platform live.' },
      { phase: 'Phase 2', title: 'Partner Onboard',  status: 'in_progress', description: 'Onboarding 50 certified forest projects.' },
    ],
  },
  {
    name: 'ThermaVault Energy',
    sector: 'Thermal Storage',
    geography: 'Central Europe',
    description: 'Molten-salt thermal energy storage systems for industrial heat applications.',
    tags: ['Storage', 'Industrial', 'CleanTech'],
    fundingTarget: 7_500_000,
    totalRaised:   3_750_000,
    backers: 113,
    esgScore: 82,
    verificationStatus: 'verified',
    documents: [{ name: 'KYB Clear', status: 'verified' }],
    milestones: [
      { phase: 'Phase 1', title: 'Prototype',        status: 'complete',    description: '500 kWh pilot system operational in Munich.' },
      { phase: 'Phase 2', title: 'Scale-Up',         status: 'in_progress', description: '5 MWh commercial system manufacturing.' },
      { phase: 'Phase 3', title: 'Distribution',     status: 'pending',     description: 'EU industrial park deployments.' },
    ],
  },
  {
    name: 'AquaTrace Monitoring',
    sector: 'Environmental IoT',
    geography: 'Scandinavia',
    description: 'AI-driven water quality monitoring network for municipal water utilities.',
    tags: ['IoT', 'AI', 'Water', 'ESG'],
    fundingTarget: 3_000_000,
    totalRaised:   2_100_000,
    backers: 78,
    esgScore: 90,
    verificationStatus: 'verified',
    documents: [{ name: 'KYB Clear', status: 'verified' }],
    milestones: [
      { phase: 'Phase 1', title: 'Sensor Network',   status: 'complete',    description: '400 sensors deployed across Oslo water system.' },
      { phase: 'Phase 2', title: 'ML Analytics',     status: 'in_progress', description: 'Predictive contamination detection model.' },
    ],
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Startup.deleteMany({}),
    Investment.deleteMany({}),
    AuditEntry.deleteMany({}),
  ]);
  console.log('🗑️  Cleared existing data');

  // Create admin user
  const admin = await User.create({
    name: 'CleanLedger Admin',
    email: 'admin@cleanledger.io',
    password: 'Admin1234!',
    role: 'admin',
    organization: 'CleanLedger',
    kyc: { status: 'verified', verifiedAt: new Date() },
  });

  // Create demo investor
  const investor = await User.create({
    name: 'James Whitfield',
    email: 'james.whitfield@capital.com',
    password: 'Investor1234!',
    role: 'investor',
    organization: 'Whitfield Capital Partners',
    entityType: 'individual',
    kyc: { status: 'verified', verifiedAt: new Date() },
    notifications: [
      { message: 'Aura Wind Energy — Phase 1 milestone verified and closed.', icon: 'verified', read: false },
      { message: 'HydroClear Technologies KYB status updated: Verified.',     icon: 'shield',   read: false },
      { message: 'Capital release of $800,000 recorded on the immutable ledger.', icon: 'account_balance', read: true },
      { message: 'DAO vote for Aura Wind Energy Phase 2 is now open.',        icon: 'how_to_vote', read: true },
      { message: 'ESG Audit report available for HydroClear Technologies.',   icon: 'eco',      read: true },
    ],
  });

  console.log('👤 Users created');

  // Create startups + compute trust scores
  const startups = [];
  for (const s of STARTUPS_DATA) {
    const startup = await Startup.create({ ...s, createdBy: admin._id });
    startup.trustScore = computeTrustScore(startup);
    await startup.save();
    startups.push(startup);
  }
  console.log(`🏢 ${startups.length} startups created`);

  // Create investments for the demo investor
  const INVESTMENT_DATA = [
    { startup: startups[0], amount: 500_000, trancheStatus: 'Phase 2 — In Progress', date: new Date('2026-01-10') },
    { startup: startups[2], amount: 350_000, trancheStatus: 'Phase 3 — In Progress', date: new Date('2025-11-22') },
    { startup: startups[4], amount: 250_000, trancheStatus: 'Phase 3 — In Progress', date: new Date('2026-02-14') },
    { startup: startups[1], amount: 200_000, trancheStatus: 'Phase 2 — In Progress', date: new Date('2026-03-01') },
  ];

  for (const inv of INVESTMENT_DATA) {
    await Investment.create({
      investor:      investor._id,
      startup:       inv.startup._id,
      startupName:   inv.startup.name,
      sector:        inv.startup.sector,
      amount:        inv.amount,
      trancheStatus: inv.trancheStatus,
      trustScore:    inv.startup.trustScore,
      status:        'active',
      date:          inv.date,
    });
  }
  console.log('💰 Investments created');

  // Create audit chain entries
  let previousHash = GENESIS_HASH;
  let blockNumber = 1001;

  const AUDIT_EVENTS = [
    { type: 'kyb_verified',       fromEntity: 'CleanLedger Admin',       toEntity: 'Aura Wind Energy',       amount: 0 },
    { type: 'funding_allocation', fromEntity: 'James Whitfield',          toEntity: 'Aura Wind Energy',       amount: 500_000 },
    { type: 'kyb_verified',       fromEntity: 'CleanLedger Admin',        toEntity: 'HydroClear Technologies', amount: 0 },
    { type: 'funding_allocation', fromEntity: 'James Whitfield',          toEntity: 'HydroClear Technologies', amount: 350_000 },
    { type: 'milestone_complete', fromEntity: 'Aura Wind Energy',         toEntity: 'CleanLedger Escrow',      amount: 0 },
    { type: 'capital_release',    fromEntity: 'CleanLedger Escrow',       toEntity: 'Aura Wind Energy',        amount: 800_000 },
    { type: 'dao_vote',           fromEntity: 'DAO Members',              toEntity: 'Aura Wind Energy Phase 2', amount: 0 },
    { type: 'funding_allocation', fromEntity: 'James Whitfield',          toEntity: 'ThermaVault Energy',      amount: 250_000 },
    { type: 'funding_allocation', fromEntity: 'James Whitfield',          toEntity: 'Solaris Grid Systems',    amount: 200_000 },
    { type: 'inter_account',      fromEntity: 'Whitfield Capital Partners', toEntity: 'CleanLedger Escrow',    amount: 1_300_000 },
  ];

  for (const evt of AUDIT_EVENTS) {
    const entryData = { ...evt, blockNumber, initiatedBy: admin._id };
    const hash = computeHash(entryData, previousHash);
    await AuditEntry.create({ ...entryData, hash, previousHash, status: 'confirmed' });
    previousHash = hash;
    blockNumber++;
  }
  console.log(`📒 ${AUDIT_EVENTS.length} audit entries created (chain verified)`);

  console.log('\n🎉 Seed complete!');
  console.log('─────────────────────────────────────');
  console.log('Admin:    admin@cleanledger.io      / Admin1234!');
  console.log('Investor: james.whitfield@capital.com / Investor1234!');
  console.log('─────────────────────────────────────');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
