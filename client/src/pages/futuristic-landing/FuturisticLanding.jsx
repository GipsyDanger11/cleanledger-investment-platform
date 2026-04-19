import { useCallback, useEffect, useRef, useState } from 'react'; // useRef kept for nav scroll detector
import { Link } from 'react-router-dom';
import './styles.css';

/* ─── Static Data ─────────────────────────────────── */
const NAV_LINKS = [
  { label: 'Product',   href: '#product' },
  { label: 'How it works', href: '#how' },
  { label: 'Trust',     href: '#trust' },
];

const PILLARS = [
  {
    icon: 'account_balance',
    title: 'Immutable Ledger',
    body: 'Every capital movement is hash-chained on-chain. No edits, no deletions — only truth.',
    accent: '#2563eb',
  },
  {
    icon: 'how_to_vote',
    title: 'DAO Governance',
    body: 'Tranche releases are gated behind quorum-based investor votes with a live countdown.',
    accent: '#7c3aed',
  },
  {
    icon: 'shield',
    title: 'KYB & ESG Verification',
    body: 'Structured risk signals, document vaults, and ESMA-aligned ESG scoring per startup.',
    accent: '#0369a1',
  },
  {
    icon: 'analytics',
    title: 'Trust Score Engine',
    body: 'Composite trust signals from milestones, documents, and investor sentiment — in one number.',
    accent: '#059669',
  },
];

const STEPS = [
  {
    n: '01',
    title: 'Founders onboard & get verified',
    body: 'KYB/KYC document vaults, ESG audit, and a startup profile reviewed before any capital is deployed.',
  },
  {
    n: '02',
    title: 'Investors commit to milestone tranches',
    body: 'Funds are held in escrow and released only when investors vote to approve milestone proof.',
  },
  {
    n: '03',
    title: 'Every event is ledgered immutably',
    body: 'Hash-chained audit entries mean no capital movement can ever be quietly amended or reversed.',
  },
];

const METRICS = [
  { value: '₹1,920Cr+', label: 'Capital tracked' },
  { value: '3,800+', label: 'Audit events logged' },
  { value: '98%',    label: 'On-time milestone rate' },
  { value: '62',     label: 'Verified startups' },
];

/* ─── Helpers ──────────────────────────────────────── */
function Icon({ name, className = '' }) {
  return (
    <span className={`material-symbols-outlined ${className}`} aria-hidden>
      {name}
    </span>
  );
}

function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('fl-revealed');
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function Section({ id, className = '', children }) {
  const ref = useReveal();
  return (
    <section id={id} ref={ref} className={`fl-reveal ${className}`}>
      {children}
    </section>
  );
}

/* ─── Component ────────────────────────────────────── */
export default function FuturisticLanding() {
  const [navOpen,  setNavOpen]  = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /* nav scroll */
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);



  /* ── 3-D card tilt ── */
  const onCardMove = useCallback((e) => {
    const card = e.currentTarget;
    const r = card.getBoundingClientRect();
    const x = ((e.clientX - r.left)  / r.width  - 0.5) * 14;
    const y = ((e.clientY - r.top)   / r.height - 0.5) * -14;
    card.style.setProperty('--tx', `${y}deg`);
    card.style.setProperty('--ty', `${x}deg`);
  }, []);

  const onCardLeave = useCallback((e) => {
    e.currentTarget.style.setProperty('--tx', '0deg');
    e.currentTarget.style.setProperty('--ty', '0deg');
  }, []);

  return (
    <div className="fl">
      {/* ── NAV ───────────────────────────────────────── */}
      <header className={`fl-nav ${scrolled ? 'fl-nav--solid' : ''}`}>
        <Link to="/" className="fl-nav__brand" onClick={() => setNavOpen(false)}>
          <span className="fl-nav__logo" aria-hidden>CL</span>
          CleanLedger
        </Link>

        <nav
          className={`fl-nav__menu ${navOpen ? 'fl-nav__menu--open' : ''}`}
          aria-label="Primary navigation"
        >
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="fl-nav__link"
              onClick={() => setNavOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <Link
            to="/auth"
            className="fl-nav__signin"
            onClick={() => setNavOpen(false)}
          >
            Sign in
          </Link>
          <Link
            to="/auth?mode=register"
            className="fl-btn fl-btn--sm"
            onClick={() => setNavOpen(false)}
          >
            Get started
          </Link>
        </nav>

        <button
          type="button"
          className="fl-nav__burger"
          aria-label="Toggle menu"
          aria-expanded={navOpen}
          onClick={() => setNavOpen((o) => !o)}
        >
          <Icon name={navOpen ? 'close' : 'menu'} />
        </button>
      </header>

      {/* ── HERO ──────────────────────────────────────── */}
      <section className="fl-hero" id="top">
        {/* background mesh */}
        <div className="fl-hero__mesh" aria-hidden />

        <div className="fl-hero__inner">
          {/* left — copy */}
          <div className="fl-hero__copy">
            <span className="fl-eyebrow">
              <Icon name="verified" className="fl-eyebrow__icon" />
              Private markets infrastructure
            </span>

            <h1 className="fl-hero__h1">
              Capital flows with<br />
              <span className="fl-hero__accent">full transparency</span>
            </h1>

            <p className="fl-hero__sub">
              CleanLedger is the operating layer for private investment funds —
              combining cryptographic audit trails, DAO governance, and milestone-gated
              tranches into one unified workspace.
            </p>

            <div className="fl-hero__cta">
              <Link to="/auth?mode=register" className="fl-btn fl-btn--lg" id="hero-cta-main">
                Start free
                <Icon name="arrow_forward" className="fl-btn__icon" />
              </Link>
              <a href="#how" className="fl-ghost-btn">
                See how it works
              </a>
            </div>

            <div className="fl-hero__proof">
              <span className="fl-proof-badge">
                <Icon name="lock" />
                End-to-end encrypted
              </span>
              <span className="fl-proof-badge">
                <Icon name="gavel" />
                SOC 2 compliant
              </span>
              <span className="fl-proof-badge">
                <Icon name="diversity_3" />
                DAO governed
              </span>
            </div>
          </div>

          {/* right — dashboard mockup */}
          <div className="fl-hero__visual" aria-hidden>
            <div className="fl-dash-mock">
              <div className="fl-dash-mock__bar">
                <span className="fl-dash-mock__dot fl-dash-mock__dot--red" />
                <span className="fl-dash-mock__dot fl-dash-mock__dot--amber" />
                <span className="fl-dash-mock__dot fl-dash-mock__dot--green" />
                <span className="fl-dash-mock__title">CleanLedger — Fund Overview</span>
              </div>
              <div className="fl-dash-mock__body">
                <div className="fl-dash-kpi-row">
                  {[
                    { label: 'Total Raised',    value: '₹33.6Cr', delta: '+12%',  up: true  },
                    { label: 'Trust Score',     value: '87/100', delta: '+3pts', up: true  },
                    { label: 'Variance Alerts', value: '0',      delta: 'Clean', up: true  },
                  ].map((k) => (
                    <div key={k.label} className="fl-kpi">
                      <div className="fl-kpi__label">{k.label}</div>
                      <div className="fl-kpi__value">{k.value}</div>
                      <div className={`fl-kpi__delta ${k.up ? 'fl-kpi__delta--up' : ''}`}>
                        <Icon name={k.up ? 'trending_up' : 'trending_down'} />
                        {k.delta}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="fl-dash-label">Fund Allocation</div>
                {[
                  { cat: 'Technology',         pct: 42, color: '#2563eb' },
                  { cat: 'Marketing',          pct: 25, color: '#7c3aed' },
                  { cat: 'Operations',         pct: 20, color: '#0369a1' },
                  { cat: 'Legal & Compliance', pct: 13, color: '#059669' },
                ].map((row) => (
                  <div key={row.cat} className="fl-alloc-row">
                    <span className="fl-alloc-row__cat">{row.cat}</span>
                    <div className="fl-alloc-row__track">
                      <div
                        className="fl-alloc-row__fill"
                        style={{ width: `${row.pct}%`, background: row.color }}
                      />
                    </div>
                    <span className="fl-alloc-row__pct" style={{ color: row.color }}>
                      {row.pct}%
                    </span>
                  </div>
                ))}

                <div className="fl-dash-label" style={{ marginTop: '16px' }}>
                  Recent Audit Events
                </div>
                {[
                  { txt: 'Capital release — ₹6.4Cr → Aura Wind Energy',   time: '2h ago' },
                  { txt: 'Milestone 2 approved — 78% DAO vote',           time: '1d ago' },
                  { txt: 'KYB verified — HydroClear Technologies',        time: '2d ago' },
                ].map((e, i) => (
                  <div key={i} className="fl-audit-row">
                    <span className="fl-audit-row__dot" />
                    <span className="fl-audit-row__txt">{e.txt}</span>
                    <span className="fl-audit-row__time">{e.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── METRICS STRIP ─────────────────────────────── */}
      <Section id="metrics" className="fl-metrics-strip">
        <div className="fl-metrics-strip__inner">
          {METRICS.map((m) => (
            <div key={m.label} className="fl-metric">
              <div className="fl-metric__value">{m.value}</div>
              <div className="fl-metric__label">{m.label}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── PRODUCT PILLARS ───────────────────────────── */}
      <Section id="product" className="fl-section">
        <div className="fl-section__head">
          <p className="fl-label">Core capabilities</p>
          <h2 className="fl-h2">Infrastructure built for accountability</h2>
          <p className="fl-section__sub">
            Every surface is optimised for signal. Minimal chrome, maximum trust.
          </p>
        </div>

        <div className="fl-pillars">
          {PILLARS.map((p, i) => (
            <article
              key={p.title}
              className="fl-pillar"
              style={{ '--p-accent': p.accent, '--p-delay': `${i * 0.08}s` }}
              onMouseMove={onCardMove}
              onMouseLeave={onCardLeave}
            >
              <div className="fl-pillar__icon">
                <Icon name={p.icon} />
              </div>
              <h3 className="fl-pillar__h3">{p.title}</h3>
              <p className="fl-pillar__body">{p.body}</p>
              <div className="fl-pillar__line" aria-hidden />
            </article>
          ))}
        </div>
      </Section>

      {/* ── HOW IT WORKS ──────────────────────────────── */}
      <Section id="how" className="fl-section fl-how">
        <div className="fl-section__head">
          <p className="fl-label">Process</p>
          <h2 className="fl-h2">From onboarding to outcome in three steps</h2>
        </div>

        <div className="fl-steps">
          {STEPS.map((s, i) => (
            <div key={s.n} className="fl-step" style={{ '--step-delay': `${i * 0.1}s` }}>
              <div className="fl-step__number">{s.n}</div>
              <div className="fl-step__content">
                <h3 className="fl-step__h3">{s.title}</h3>
                <p className="fl-step__body">{s.body}</p>
              </div>
              {i < STEPS.length - 1 && <div className="fl-step__connector" aria-hidden />}
            </div>
          ))}
        </div>
      </Section>

      {/* ── TRUST SECTION ─────────────────────────────── */}
      <Section id="trust" className="fl-trust-section">
        <div className="fl-trust__inner">
          <div className="fl-trust__copy">
            <p className="fl-label">Why it matters</p>
            <h2 className="fl-h2">Built on trust,<br />backed by cryptography</h2>
            <p className="fl-trust__sub">
              Every capital movement on CleanLedger is hash-chained and
              permanently logged. No silent amendments, no off-ledger surprises —
              just a shared view of ground truth for founders and investors alike.
            </p>
            <Link to="/auth" className="fl-btn" id="trust-cta">
              Open the platform
              <Icon name="arrow_forward" className="fl-btn__icon" />
            </Link>
          </div>

          <div className="fl-trust__stats">
            {[
              { icon: 'lock',          label: 'Hash-chained ledger',     desc: 'Every event is cryptographically linked — no entry can be silently altered.' },
              { icon: 'how_to_vote',   label: 'Quorum-gated tranches',   desc: '60%+ investor approval required before any fund release is triggered.' },
              { icon: 'shield',        label: 'KYB & ESG verified',       desc: 'Startups pass structured verification before capital is deployed.' },
              { icon: 'bar_chart',     label: 'Live fund telemetry',     desc: 'Allocation vs. actual spend tracked in real time with variance alerts.' },
            ].map((item) => (
              <div key={item.label} className="fl-trust-item">
                <div className="fl-trust-item__icon">
                  <Icon name={item.icon} />
                </div>
                <div>
                  <div className="fl-trust-item__label">{item.label}</div>
                  <div className="fl-trust-item__desc">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── CTA BAND ──────────────────────────────────── */}
      <Section className="fl-cta">
        <div className="fl-cta__inner">
          <p className="fl-label fl-label--light">Ready?</p>
          <h2 className="fl-cta__h2">Bring clarity to your capital.</h2>
          <p className="fl-cta__sub">
            Join founders and investors who run on CleanLedger.
          </p>
          <Link to="/auth?mode=register" className="fl-btn fl-btn--lg fl-btn--inverted" id="cta-band-btn">
            Get started free
            <Icon name="arrow_forward" className="fl-btn__icon" />
          </Link>
        </div>
      </Section>

      {/* ── FOOTER ────────────────────────────────────── */}
      <footer className="fl-footer">
        <div className="fl-footer__inner">
          <Link to="/" className="fl-footer__brand">
            <span className="fl-nav__logo" aria-hidden>CL</span>
            CleanLedger
          </Link>
          <p className="fl-footer__tagline">
            Precision-grade infrastructure for private markets.
          </p>
          <nav className="fl-footer__links" aria-label="Footer">
            <a href="#product">Product</a>
            <a href="#how">How it works</a>
            <a href="#trust">Trust</a>
            <Link to="/auth">Sign in</Link>
            <a href="#top">↑ Top</a>
          </nav>
          <p className="fl-footer__copy">
            © {new Date().getFullYear()} CleanLedger. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
