import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import { useAuth } from '../context/AuthContext';
import './LandingPage.css';

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
              <Link to="/onboarding" className="btn btn-primary landing__cta-primary">
                Get Started
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
              </Link>
              <a href="#architecture" className="btn btn-secondary">
                Explore Platform
              </a>
            </div>
          </div>

          {/* 3D Ledger Card */}
          <div className="landing__hero-visual animate-float" aria-hidden="true">
            <div className="ledger-card glass-panel">
              <div className="ledger-card__header">
                <span className="ledger-card__dot" style={{ background: '#22C55E' }} />
                <span className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>LIVE · Immutable Ledger</span>
                <span className="ledger-card__dot animate-pulse-green" />
              </div>
              <div className="ledger-card__entries">
                {LEDGER_EVENTS.slice(0, 4).map((evt, i) => (
                  <div key={i} className="ledger-card__entry">
                    <div>
                      <div className="text-label-md" style={{ color: 'var(--color-on-surface)' }}>{evt.type}</div>
                      <div className="text-label-sm text-meta">{evt.entity}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="text-label-md tabular" style={{ color: 'var(--color-on-surface)', fontWeight: 600 }}>{evt.amount}</div>
                      <div className="text-label-sm text-meta">{evt.time}</div>
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
              <Link to="/onboarding" className="btn btn-primary" style={{ marginTop: 'var(--space-8)' }}>
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
