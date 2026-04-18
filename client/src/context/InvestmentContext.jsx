import { createContext, useContext, useState } from 'react';

const InvestmentContext = createContext(null);

// ─── Sample Data (Appendix C + extensions) ────────────────

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
    description: 'Offshore wind infrastructure developer targeting the North Sea with proprietary blade technology.',
    tags: ['ESG', 'Wind', 'CleanTech'],
    kybDocument: 'KYB Clear',
    esgDocument: "ESG Audit '23",
    milestones: [
      { phase: 1, title: 'Site Acquisition', status: 'complete', notes: 'Land rights secured (50 acres, coastal). Environmental assessments done.', trancheAmount: 800000 },
      { phase: 2, title: 'Turbine Procurement', status: 'in_progress', notes: 'Contracts with Vesta for 5× V162-6.2 MW turbines. Pending board approval.', trancheAmount: 2100000, daoVoteRequired: true },
      { phase: 3, title: 'Grid Connection', status: 'pending', notes: 'Substation installation + national grid tie-in.', trancheAmount: 2100000 },
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
    description: 'Modular solar micro-grid solutions for off-grid communities across East Africa.',
    tags: ['ESG', 'Solar', 'Impact'],
    milestones: [
      { phase: 1, title: 'Pilot Deployment', status: 'complete', trancheAmount: 500000 },
      { phase: 2, title: 'Scale Rollout', status: 'in_progress', trancheAmount: 2300000, daoVoteRequired: false },
      { phase: 3, title: 'Revenue Ops', status: 'pending', trancheAmount: 3200000 },
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
    description: 'Zero-discharge industrial water recycling systems for semiconductor fabs.',
    tags: ['ESG', 'Water', 'DeepTech'],
    milestones: [
      { phase: 1, title: 'IP Filing', status: 'complete', trancheAmount: 1000000 },
      { phase: 2, title: 'Pilot Manufacturing', status: 'complete', trancheAmount: 2000000 },
      { phase: 3, title: 'Commercial Rollout', status: 'in_progress', trancheAmount: 5000000, daoVoteRequired: true },
    ],
  },
  {
    id: 'startup_004',
    name: 'Verdant Carbon Labs',
    sector: 'Carbon Markets',
    geography: 'Global',
    trustScore: 71,
    esgScore: 84,
    totalRaised: 1200000,
    fundingTarget: 4500000,
    backers: 54,
    verificationStatus: 'verified',
    description: 'On-chain carbon credit issuance and retirement platform with satellite verification.',
    tags: ['ESG', 'Carbon', 'Blockchain'],
    milestones: [
      { phase: 1, title: 'Platform Build', status: 'in_progress', trancheAmount: 1200000, daoVoteRequired: false },
      { phase: 2, title: 'Regulatory Approval', status: 'pending', trancheAmount: 1800000 },
      { phase: 3, title: 'Market Launch', status: 'pending', trancheAmount: 1500000 },
    ],
  },
  {
    id: 'startup_005',
    name: 'ThermaVault Energy',
    sector: 'Thermal Storage',
    geography: 'Central Europe',
    trustScore: 85,
    esgScore: 90,
    totalRaised: 3500000,
    fundingTarget: 7000000,
    backers: 143,
    verificationStatus: 'verified',
    description: 'Long-duration molten-salt thermal energy storage for industrial facilities.',
    tags: ['ESG', 'Storage', 'CleanTech'],
    milestones: [
      { phase: 1, title: 'Prototype Build', status: 'complete', trancheAmount: 1000000 },
      { phase: 2, title: 'Efficiency Validation', status: 'complete', trancheAmount: 1000000 },
      { phase: 3, title: 'Scale Deployment', status: 'in_progress', trancheAmount: 5000000, daoVoteRequired: true },
    ],
  },
  {
    id: 'startup_006',
    name: 'AquaTrace Monitoring',
    sector: 'Environmental IoT',
    geography: 'Scandinavia',
    trustScore: 76,
    esgScore: 87,
    totalRaised: 900000,
    fundingTarget: 2500000,
    backers: 38,
    verificationStatus: 'verified',
    description: 'Real-time river and aquifer contamination monitoring using IoT sensor networks.',
    tags: ['ESG', 'IoT', 'Water'],
    milestones: [
      { phase: 1, title: 'Sensor Prototyping', status: 'complete', trancheAmount: 400000 },
      { phase: 2, title: 'Pilot Deployment', status: 'in_progress', trancheAmount: 900000 },
      { phase: 3, title: 'Commercial Scale', status: 'pending', trancheAmount: 1200000 },
    ],
  },
];

export const AUDIT_ENTRIES = [
  { id: 'ae_001', blockIndex: 1042, type: 'capital_release',      amount: 800000,  currency: 'USD', from: 'CleanLedger Escrow', to: 'Aura Wind Energy',     startupId: 'startup_001', hash: 'a3f8c2e1d904b7...', prevHash: '9b2e4a0c8f31d6...', timestamp: '2026-04-15T09:14:22Z', status: 'confirmed' },
  { id: 'ae_002', blockIndex: 1041, type: 'funding_allocation',   amount: 500000,  currency: 'USD', from: 'Whitfield Capital',  to: 'CleanLedger Escrow',  startupId: 'startup_002', hash: '9b2e4a0c8f31d6...', prevHash: '7d1c3b09e5a2f8...', timestamp: '2026-04-14T16:40:08Z', status: 'confirmed' },
  { id: 'ae_003', blockIndex: 1040, type: 'inter_account',        amount: 250000,  currency: 'USD', from: 'Portfolio A',        to: 'Portfolio B',          startupId: null,          hash: '7d1c3b09e5a2f8...', prevHash: '4e8f0a7c2b59d3...', timestamp: '2026-04-13T11:22:45Z', status: 'confirmed' },
  { id: 'ae_004', blockIndex: 1039, type: 'capital_release',      amount: 2000000, currency: 'USD', from: 'CleanLedger Escrow', to: 'HydroClear Technologies', startupId: 'startup_003', hash: '4e8f0a7c2b59d3...', prevHash: '2c6a1e4d8b70f5...', timestamp: '2026-04-12T08:55:12Z', status: 'confirmed' },
  { id: 'ae_005', blockIndex: 1038, type: 'funding_allocation',   amount: 750000,  currency: 'USD', from: 'Nordic ESG Fund',    to: 'CleanLedger Escrow',  startupId: 'startup_005', hash: '2c6a1e4d8b70f5...', prevHash: '1a5c9b3e7f40d2...', timestamp: '2026-04-11T14:30:00Z', status: 'confirmed' },
  { id: 'ae_006', blockIndex: 1037, type: 'capital_release',      amount: 1000000, currency: 'USD', from: 'CleanLedger Escrow', to: 'Verdant Carbon Labs',  startupId: 'startup_004', hash: '1a5c9b3e7f40d2...', prevHash: '8b3d0f2c6e91a7...', timestamp: '2026-04-10T10:10:10Z', status: 'confirmed' },
  { id: 'ae_007', blockIndex: 1036, type: 'funding_allocation',   amount: 300000,  currency: 'USD', from: 'Impact Capital Ltd', to: 'CleanLedger Escrow',  startupId: 'startup_006', hash: '8b3d0f2c6e91a7...', prevHash: '6f2a8e4c1d50b9...', timestamp: '2026-04-09T17:05:33Z', status: 'confirmed' },
  { id: 'ae_008', blockIndex: 1035, type: 'capital_release',      amount: 1000000, currency: 'USD', from: 'CleanLedger Escrow', to: 'ThermaVault Energy',   startupId: 'startup_005', hash: '6f2a8e4c1d50b9...', prevHash: '5e1b7d3c9a42f0...', timestamp: '2026-04-08T09:00:00Z', status: 'confirmed' },
];

export const INVESTMENTS = [
  { id: 'inv_001', startupId: 'startup_001', startupName: 'Aura Wind Energy',      sector: 'Clean Energy',     amount: 500000, trancheStatus: 'Phase 2 — In Progress', trustScore: 87, date: '2026-01-10' },
  { id: 'inv_002', startupId: 'startup_003', startupName: 'HydroClear Technologies', sector: 'Water Tech',      amount: 350000, trancheStatus: 'Phase 3 — In Progress', trustScore: 93, date: '2025-11-22' },
  { id: 'inv_003', startupId: 'startup_005', startupName: 'ThermaVault Energy',     sector: 'Thermal Storage',  amount: 250000, trancheStatus: 'Phase 3 — In Progress', trustScore: 85, date: '2026-02-14' },
  { id: 'inv_004', startupId: 'startup_002', startupName: 'Solaris Grid Systems',   sector: 'Solar Tech',       amount: 200000, trancheStatus: 'Phase 2 — In Progress', trustScore: 79, date: '2026-03-01' },
];

export const NOTIFICATIONS = [
  { id: 'n_001', type: 'milestone', icon: 'flag',         message: 'Aura Wind Energy — Phase 1 milestone verified and closed.', time: '2 hours ago', read: false },
  { id: 'n_002', type: 'kyb',      icon: 'verified_user', message: 'HydroClear Technologies KYB status updated: Verified.',      time: '5 hours ago', read: false },
  { id: 'n_003', type: 'ledger',   icon: 'receipt_long',  message: 'Capital release of $800,000 recorded on the immutable ledger.', time: 'Yesterday',  read: true  },
  { id: 'n_004', type: 'dao',      icon: 'how_to_vote',   message: 'DAO vote for Aura Wind Energy Phase 2 is now open.',          time: '2 days ago',  read: true  },
  { id: 'n_005', type: 'esg',      icon: 'eco',           message: 'ESG Audit report available for ThermaVault Energy.',          time: '3 days ago',  read: true  },
];

export function InvestmentProvider({ children }) {
  const [investments] = useState(INVESTMENTS);
  const [startups] = useState(STARTUPS);
  const [auditEntries] = useState(AUDIT_ENTRIES);
  const [notifications] = useState(NOTIFICATIONS);

  const portfolioValue = investments.reduce((s, i) => s + i.amount, 0);
  const avgTrustScore  = Math.round(investments.reduce((s, i) => s + i.trustScore, 0) / investments.length);
  const tranchesReleased = 4;

  return (
    <InvestmentContext.Provider value={{
      investments, startups, auditEntries, notifications,
      portfolioValue, avgTrustScore, tranchesReleased,
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
