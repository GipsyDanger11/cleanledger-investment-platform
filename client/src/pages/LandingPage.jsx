import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import { useAuth } from '../context/AuthContext';
import './LandingPage.css';

const PROBLEM_POINTS = [
  { icon: 'visibility_off',   text: 'Opaque fund flows — investors have no real-time visibility into where capital goes after disbursement.' },
  { icon: 'assignment_late',  text: 'Manual milestone verification — progress is tracked via PDFs and email threads, with no cryptographic audit trail.' },
  { icon: 'group_off',        text: 'Fractured governance — single GPs exercise discretionary release authority with no DAO accountability.' },
  { icon: 'policy',           text: 'Compliance friction — regulatory reporting requires bespoke reconciliations across disconnected spreadsheets.' },
  { icon: 'trending_down',    text: 'Trust deficit — LPs lack verifiable assurance that ESG claims and KYB documents are authentic.' },
];

const MANDATORY_FEATURES = [
  { icon: 'account_balance',  title: 'Multi-Party Investment Workflow',    desc: 'Startup registration, LP onboarding, DAO formation, and milestone-gated fund release.' },
  { icon: 'lock',             title: 'Immutable Audit Trail',              desc: 'Every transaction hash-chained (SHA-256) and tamper-evident on an append-only ledger.' },
  { icon: 'how_to_vote',      title: 'DAO Consensus Voting',               desc: 'Fund tranches disburse only after quorum-based member approval — no single point of control.' },
  { icon: 'verified_user',    title: 'KYB / ESG Verification Gate',        desc: 'Startups must pass identity, incorporation, and ESG framework checks before funding access.' },
  { icon: 'trending_up',      title: 'Trust Score Engine',                 desc: 'Composite risk scoring across KYB status, milestone velocity, and LP sentiment data.' },
  { icon: 'shield',           title: 'Role-Based Access Control',          desc: 'Granular permissions for Founders, LPs, GPs, Auditors, and Regulators.' },
];

const NICE_TO_HAVE = [
  { icon: 'auto_graph',       title: 'Predictive Risk Analytics',  desc: 'ML-powered models that forecast startup default probability from ledger patterns.' },
  { icon: 'receipt_long',     title: 'Regulatory Export Suite',    desc: 'One-click SEBI/SEC-ready PDF and CSV reports with cryptographic attestation.' },
  { icon: 'token',            title: 'Tokenised LP Shares',        desc: 'ERC-20 fractional ownership enabling secondary-market liquidity for LP positions.' },
  { icon: 'translate',        title: 'Multi-Jurisdiction Support', desc: 'Configurable compliance rulesets for different regulatory frameworks globally.' },
];

const HOW_IT_WORKS_STEPS = [
  { step: '01', icon: 'how_to_reg',      title: 'Startup & LP Onboarding',   desc: 'Founders submit KYB docs; LPs complete identity verification. Both receive cryptographic credentials.' },
  { step: '02', icon: 'gavel',           title: 'DAO Formation & Governance', desc: 'A DAO is formed per fund. Voting weights are set; governance rules are anchored on-chain.' },
  { step: '03', icon: 'task_alt',        title: 'Milestone Submission',       desc: 'Startups upload milestone evidence. Auditors verify; hashes are written to the immutable ledger.' },
  { step: '04', icon: 'how_to_vote',     title: 'DAO Vote & Fund Release',    desc: 'On milestone approval, DAO members vote. Quorum met → escrow releases the next capital tranche.' },
  { step: '05', icon: 'analytics',       title: 'Live Portfolio Monitoring',  desc: 'LPs track trust scores, allocation breakdowns, and audit history from their real-time dashboard.' },
];

const LEDGER_EVENTS = [
  { type: 'Capital Release',     amount: '$800,000',   entity: 'Aura Wind Energy',        time: '2s ago'  },
  { type: 'Funding Allocation',  amount: '$500,000',   entity: 'Whitfield Capital',        time: '14s ago' },
  { type: 'KYB Verified',        amount: '—',          entity: 'HydroClear Technologies',  time: '1m ago'  },
  { type: 'DAO Vote Passed',     amount: '$2.1M',      entity: 'ThermaVault Phase 3',      time: '3m ago'  },
  { type: 'Capital Release',     amount: '$1,000,000', entity: 'Verdant Carbon Labs',      time: '7m ago'  },
  { type: 'Inter-Account',       amount: '$250,000',   entity: 'Portfolio Rebalance',      time: '11m ago' },
];

const STATS = [
  { label: 'Total Managed Value',    value: '$284.7M' },
  { label: 'Verified Startups',      value: '142'     },
  { label: 'DAO Votes Resolved',     value: '1,089'   },
  { label: 'Avg Trust Score',        value: '84.3'    },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const tickerRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  // SEO meta tags
  useEffect(() => {
    document.title = 'CleanLedger — Transparent Investment Platform for Private Markets';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta); }
    meta.content = 'CleanLedger is a blockchain-anchored, DAO-governed investment platform offering immutable audit trails, KYB verification, milestone-gated fund release, and zero-knowledge proofs for private market capital.';
    return () => { document.title = 'CleanLedger'; };
  }, []);

  // Animate ticker
  useEffect(() => {
    const el = tickerRef.current;
    if (!el) return;
    let pos = 0;
    const width = el.scrollWidth / 2;
    const tick = () => {
      pos -= 0.4;
      if (Math.abs(pos) >= width) pos = 0;
      el.style.transform = `translateX(${pos}px)`;
      rafId = requestAnimationFrame(tick);
    };
    let rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div className="landing">
      <Header />

      {/* ── HERO ──────────────────────────────────────── */}
      <section className="landing__hero" aria-labelledby="hero-heading">
        <div className="landing__hero-inner">
          <div className="landing__hero-content">
            <div className="chip chip--success landing__badge" style={{ marginBottom: 'var(--space-6)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '12px', fontVariationSettings: "'FILL' 1" }}>verified</span>
              Blockchain-Anchored · Zero-Knowledge Verified
            </div>
            <h1 id="hero-heading" className="text-display landing__hero-title">
              Precision-Grade Infrastructure<br />
              <span className="landing__hero-accent">for Private Markets.</span>
            </h1>
            <p className="text-body-md landing__hero-sub">
              A digital ledger engineered like a premium timepiece — every capital event cryptographically recorded, every startup KYB-verified, every tranche DAO-governed.
            </p>
            <div className="landing__hero-ctas">
              <Link to="/auth?mode=signup&role=startup" className="btn landing__cta-primary">
                Launch as Startup
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>rocket_launch</span>
              </Link>
              <Link to="/auth?mode=signup&role=investor" className="btn btn-secondary landing__cta-secondary">
                Join as Investor
              </Link>
            </div>
          </div>

          {/* 3D Ledger Card */}
          <div className="landing__hero-visual animate-float" aria-hidden="true">
            <div className="ledger-card">
              <div className="ledger-card__header">
                <span className="ledger-card__dot" style={{ background: '#22C55E' }} />
                <span className="text-label-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>LIVE · Immutable Ledger</span>
                <span className="ledger-card__dot animate-pulse-green" />
              </div>
              <div className="ledger-card__entries">
                {LEDGER_EVENTS.slice(0, 4).map((evt, i) => (
                  <div key={i} className="ledger-card__entry">
                    <div>
                      <div className="text-label-md" style={{ color: 'rgba(255,255,255,0.9)' }}>{evt.type}</div>
                      <div className="text-label-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>{evt.entity}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="text-label-md tabular" style={{ color: 'var(--color-tertiary-fixed)', fontWeight: 600 }}>{evt.amount}</div>
                      <div className="text-label-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>{evt.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="ledger-card__hash text-label-sm">
                BLOCK #1042 · SHA-256: a3f8c2e1d904b7...
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LIVE TICKER ───────────────────────────────── */}
      <div className="landing__ticker" aria-hidden="true">
        <div className="landing__ticker-track" ref={tickerRef}>
          {[...LEDGER_EVENTS, ...LEDGER_EVENTS].map((evt, i) => (
            <span key={i} className="landing__ticker-item">
              <span className="text-label-sm text-success" style={{ fontWeight: 600 }}>{evt.type}</span>
              <span className="text-label-sm text-meta">{evt.entity}</span>
              <span className="text-label-sm tabular" style={{ color: 'var(--color-on-surface)', fontWeight: 600 }}>{evt.amount}</span>
              <span className="landing__ticker-sep">·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── STATS STRIP ───────────────────────────────── */}
      <section className="landing__stats" id="insights" aria-label="Platform statistics">
        <div className="landing__stats-inner">
          {STATS.map((s) => (
            <div key={s.label} className="landing__stat">
              <div className="text-headline tabular landing__stat-value">{s.value}</div>
              <div className="text-label-md text-secondary">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ARCHITECTURE SECTION ──────────────────────── */}
      <section className="landing__arch" id="architecture" aria-labelledby="arch-heading">
        <div className="landing__section-inner">
          <div className="landing__section-label chip chip--filter" style={{ marginBottom: 'var(--space-4)' }}>
            Platform Architecture
          </div>
          <h2 id="arch-heading" className="text-headline landing__section-title">
            Intentional hierarchy guiding the eye<br />through complex datasets.
          </h2>
          <p className="text-body-md text-secondary" style={{ maxWidth: '52ch', marginTop: 'var(--space-4)' }}>
            Every pixel is a deliberate structural decision. No decorative borders — depth is achieved through background tonal shifts across five surface tiers.
          </p>
          <div className="landing__arch-grid">
            {[
              { icon: 'lock', title: 'Cryptographic Audit Trail', desc: 'SHA-256 hash chaining ensures every entry is permanently anchored and tamper-evident.' },
              { icon: 'how_to_vote', title: 'DAO Consensus Governance', desc: 'Capital tranches are released only upon decentralized member consensus — no single point of control.' },
              { icon: 'verified_user', title: 'KYB/ESG Verification', desc: 'All startups are framework-verified with incorporation documents and ESG audit reports.' },
              { icon: 'insights', title: 'Trust Score Engine', desc: 'Proprietary composite risk scoring across KYB status, milestone velocity, and LP sentiment.' },
              { icon: 'account_balance', title: 'Milestone-Gated Tranches', desc: 'Funds held in escrow and released phase-by-phase upon verified milestone completion.' },
              { icon: 'shield', title: 'Zero-Knowledge Proofs', desc: 'Verify transaction integrity without exposing confidential deal terms to third parties.' },
            ].map((feat) => (
              <div key={feat.title} className="landing__arch-card card">
                <div className="landing__arch-icon">
                  <span className="material-symbols-outlined">{feat.icon}</span>
                </div>
                <h3 className="text-title">{feat.title}</h3>
                <p className="text-body-sm text-secondary">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CRYPTO VERIFICATION ───────────────────────── */}
      <section className="landing__crypto" aria-labelledby="crypto-heading">
        <div className="landing__section-inner">
          <div className="landing__crypto-grid">
            <div>
              <div className="chip chip--success" style={{ marginBottom: 'var(--space-4)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>security</span>
                Bank-Grade Security
              </div>
              <h2 id="crypto-heading" className="text-headline">
                Every transaction is anchored to an immutable ledger utilizing zero-knowledge proofs.
              </h2>
              <p className="text-body-md text-secondary" style={{ marginTop: 'var(--space-4)', maxWidth: '48ch' }}>
                Our cryptographic chain ensures that no entry can be modified or deleted once recorded — providing LP-grade auditability for institutional capital.
              </p>
              <div className="landing__crypto-features">
                {['SHA-256 Hash Chaining', 'ZK-Proof Verification', 'Immutable Ledger Entries', 'Export for Regulatory Reporting'].map((f) => (
                  <div key={f} className="landing__crypto-feature">
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--color-tertiary-fixed)' }}>check</span>
                    <span className="text-body-sm">{f}</span>
                  </div>
                ))}
              </div>
              <Link to="/auth" className="btn btn-primary" style={{ marginTop: 'var(--space-8)' }}>
                Start Verification
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
              </Link>
            </div>
            <div className="landing__crypto-visual glass-panel">
              <div className="landing__hash-chain">
                {[1042, 1041, 1040, 1039].map((block, i) => (
                  <div key={block} className="landing__hash-block">
                    <div className="landing__hash-block-header">
                      <span className="text-label-sm text-meta">Block #{block}</span>
                      <span className="chip chip--success" style={{ fontSize: '0.55rem', padding: '1px 6px' }}>✓ Verified</span>
                    </div>
                    <div className="landing__hash-value text-label-sm">
                      {['a3f8c2e1d904b7...', '9b2e4a0c8f31d6...', '7d1c3b09e5a2f8...', '4e8f0a7c2b59d3...'][i]}
                    </div>
                    {i < 3 && <div className="landing__hash-arrow">↓</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CAPITAL ALLOCATION ────────────────────────── */}
      <section className="landing__alloc" id="portfolio" aria-labelledby="alloc-heading">
        <div className="landing__section-inner">
          <h2 id="alloc-heading" className="text-headline">Capital Allocation by Sector</h2>
          <p className="text-body-md text-secondary" style={{ marginTop: 'var(--space-2)', marginBottom: 'var(--space-8)' }}>Live breakdown of capital deployed across verified sectors.</p>
          <div className="landing__alloc-bars">
            {[
              { sector: 'Clean Energy',     pct: 38, amount: '$108.2M' },
              { sector: 'Water Tech',       pct: 22, amount: '$62.6M'  },
              { sector: 'Thermal Storage',  pct: 18, amount: '$51.2M'  },
              { sector: 'Solar Tech',       pct: 12, amount: '$34.2M'  },
              { sector: 'Carbon Markets',   pct: 7,  amount: '$19.9M'  },
              { sector: 'Environmental IoT',pct: 3,  amount: '$8.5M'   },
            ].map((row) => (
              <div key={row.sector} className="landing__alloc-row">
                <span className="text-label-md" style={{ width: '170px', color: 'var(--color-on-surface)' }}>{row.sector}</span>
                <div style={{ flex: 1 }}>
                  <div className="progress-bar">
                    <div className="progress-bar__fill" style={{ width: `${row.pct}%` }} />
                  </div>
                </div>
                <span className="text-label-md tabular text-secondary" style={{ width: '70px', textAlign: 'right' }}>{row.pct}%</span>
                <span className="text-label-md tabular" style={{ width: '80px', textAlign: 'right', color: 'var(--color-on-surface)', fontWeight: 600 }}>{row.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEM STATEMENT ─────────────────────────── */}
      <section className="landing__problem" id="problem" aria-labelledby="problem-heading">
        <div className="landing__section-inner">
          <div className="chip chip--filter landing__section-chip">Problem Statement</div>
          <h2 id="problem-heading" className="text-headline landing__section-title" style={{ marginTop: 'var(--space-4)' }}>
            Private market investment suffers from<br />
            <span className="landing__hero-accent">opacity, fragmentation, and unverifiable claims.</span>
          </h2>
          <p className="text-body-md text-secondary" style={{ maxWidth: '60ch', marginTop: 'var(--space-4)', marginBottom: 'var(--space-10)' }}>
            Today's institutional investment workflows rely on trust in intermediaries, manual reporting,
            and disconnected data silos. CleanLedger replaces this with cryptographic guarantees.
          </p>
          <div className="landing__problem-list">
            {PROBLEM_POINTS.map((p, i) => (
              <div key={i} className="landing__problem-item">
                <div className="landing__problem-icon">
                  <span className="material-symbols-outlined">{p.icon}</span>
                </div>
                <p className="text-body-md" style={{ lineHeight: '1.65' }}>{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REQUIREMENTS ──────────────────────────────── */}
      <section className="landing__requirements" id="requirements" aria-labelledby="req-heading">
        <div className="landing__section-inner">
          <div className="chip chip--success landing__section-chip">
            <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>checklist</span>
            Platform Requirements
          </div>
          <h2 id="req-heading" className="text-headline landing__section-title" style={{ marginTop: 'var(--space-4)' }}>
            What CleanLedger delivers — mandated and beyond.
          </h2>

          <div className="landing__req-group" style={{ marginTop: 'var(--space-10)' }}>
            <div className="landing__req-group-label">
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--color-tertiary-fixed)' }}>verified</span>
              Mandatory Features
            </div>
            <div className="landing__req-grid">
              {MANDATORY_FEATURES.map((f) => (
                <div key={f.title} className="landing__req-card card">
                  <div className="landing__req-icon landing__req-icon--mandatory">
                    <span className="material-symbols-outlined">{f.icon}</span>
                  </div>
                  <h3 className="text-title" style={{ marginTop: 'var(--space-3)' }}>{f.title}</h3>
                  <p className="text-body-sm text-secondary" style={{ marginTop: 'var(--space-2)' }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="landing__req-group" style={{ marginTop: 'var(--space-10)' }}>
            <div className="landing__req-group-label">
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#A8C7FA' }}>star</span>
              Nice-to-Have Features
            </div>
            <div className="landing__req-grid landing__req-grid--nice">
              {NICE_TO_HAVE.map((f) => (
                <div key={f.title} className="landing__req-card landing__req-card--nice card">
                  <div className="landing__req-icon landing__req-icon--nice">
                    <span className="material-symbols-outlined">{f.icon}</span>
                  </div>
                  <h3 className="text-title" style={{ marginTop: 'var(--space-3)' }}>{f.title}</h3>
                  <p className="text-body-sm text-secondary" style={{ marginTop: 'var(--space-2)' }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────── */}
      <section className="landing__hiw" id="how-it-works" aria-labelledby="hiw-heading">
        <div className="landing__section-inner">
          <div className="landing__hiw-layout">
            {/* Left: Steps */}
            <div className="landing__hiw-steps">
              <div className="chip chip--filter landing__section-chip">How It Works</div>
              <h2 id="hiw-heading" className="text-headline landing__section-title" style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
                Five steps from onboarding<br />to transparent capital release.
              </h2>
              {HOW_IT_WORKS_STEPS.map((s, i) => (
                <div key={s.step} className="landing__hiw-step">
                  <div className="landing__hiw-step-left">
                    <div className="landing__hiw-step-num">{s.step}</div>
                    {i < HOW_IT_WORKS_STEPS.length - 1 && <div className="landing__hiw-step-line" />}
                  </div>
                  <div className="landing__hiw-step-content">
                    <div className="landing__hiw-step-header">
                      <span className="material-symbols-outlined landing__hiw-step-icon">{s.icon}</span>
                      <h3 className="text-title">{s.title}</h3>
                    </div>
                    <p className="text-body-sm text-secondary" style={{ marginTop: 'var(--space-2)', lineHeight: '1.65' }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Right: Illustration */}
            <div className="landing__hiw-visual">
              <div className="landing__hiw-img-wrap animate-float">
                <img
                  src="/hero-platform.png"
                  alt="CleanLedger platform architecture — blockchain nodes, audit trail and DAO governance visualization"
                  className="landing__hiw-img"
                  loading="lazy"
                  width="600"
                  height="500"
                />
                <div className="landing__hiw-img-glow" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────── */}
      <footer className="landing__footer">
        <div className="landing__footer-inner">
          <div className="landing__footer-brand">
            <span className="landing__footer-logo-mark">CL</span>
            <span className="text-label-md" style={{ color: '#8590A6', fontWeight: 600 }}>CleanLedger</span>
          </div>
          <div className="landing__footer-links">
            <a href="#" className="text-label-sm" style={{ color: '#8590A6' }}>Terms of Service</a>
            <a href="#" className="text-label-sm" style={{ color: '#8590A6' }}>Privacy Policy</a>
            <a href="#" className="text-label-sm" style={{ color: '#8590A6' }}>Contact Support</a>
          </div>
          <p className="text-label-sm" style={{ color: '#8590A6' }}>
            © 2026 CleanLedger · All capital events immutably recorded.
          </p>
        </div>
      </footer>
    </div>
  );
}
