import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './styles.css';

/* ─── Data ───────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: 'account_balance',
    title: 'Immutable Ledger',
    desc: 'Cryptographic audit trails with hash-chained events for every capital movement.',
    color: '#2563eb',
  },
  {
    icon: 'how_to_vote',
    title: 'DAO Governance',
    desc: 'Milestone releases gated by transparent, quorum-based investor voting.',
    color: '#7c3aed',
  },
  {
    icon: 'shield',
    title: 'KYB & ESG',
    desc: 'Verified startups and structured risk signals before capital is deployed.',
    color: '#0284c7',
  },
  {
    icon: 'hub',
    title: 'Unified Workspace',
    desc: 'One glass-clear surface for founders and LPs — no spreadsheet sprawl.',
    color: '#059669',
  },
];

const SHOWCASE = [
  {
    tag: 'Transparency',
    title: 'Live Fund Telemetry',
    body: 'See allocation, burn, and variance against plan — updated as the ledger moves.',
    accent: '#2563eb',
  },
  {
    tag: 'Trust',
    title: 'Trust Score Engine',
    body: 'Composite signals from milestones, documents, and investor sentiment in one score.',
    accent: '#7c3aed',
  },
  {
    tag: 'Workflow',
    title: 'Milestone Rails',
    body: 'Submit proof, collect votes, release tranches — all with immutable receipts.',
    accent: '#0284c7',
  },
  {
    tag: 'Scale',
    title: 'Multi-Fund Ready',
    body: 'Role-aware views for GPs, auditors, and portfolio teams across jurisdictions.',
    accent: '#059669',
  },
];

/* ─── Icon helper ────────────────────────────────────────────── */
function Icon({ name, className = '' }) {
  return (
    <span className={`material-symbols-outlined ${className}`} aria-hidden>
      {name}
    </span>
  );
}

/* ─── Scroll-aware section wrapper ──────────────────────────── */
function RevealSection({ children, className = '', id }) {
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
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <section ref={ref} id={id} className={`fl-reveal ${className}`}>
      {children}
    </section>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function FuturisticLanding() {
  const [navOpen, setNavOpen] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);

  /* refs for parallax */
  const parallaxSectionRef = useRef(null);
  const rafId = useRef(0);

  /* ── Nav scroll ── */
  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Parallax: scroll-driven depth layers ── */
  useEffect(() => {
    const section = parallaxSectionRef.current;
    if (!section) return;

    const layers = section.querySelectorAll('[data-depth]');
    if (!layers.length) return;

    const applyParallax = () => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const sectionH = rect.height;

      // How far through the section we've scrolled (0→1)
      // 0 = section bottom just reached viewport bottom
      // 1 = section top just left viewport top
      const progress = 1 - (rect.bottom / (vh + sectionH));
      const p = Math.max(0, Math.min(1, progress));
      const u = (p - 0.5) * 2; // normalise to [-1, 1]

      layers.forEach((el) => {
        const d = parseFloat(el.dataset.depth) || 1;
        const ty  = u * 80 * d;           // vertical shift
        const rX  = u * 12 * d;           // X rotation
        const rY  = u * -8 * d;           // Y rotation
        const sc  = 1 + u * 0.06 * d;     // scale
        el.style.transform =
          `translateY(${ty}px) rotateX(${rX}deg) rotateY(${rY}deg) scale(${sc})`;
      });
    };

    // Run on every scroll frame directly — no throttle needed for this
    const onScroll = () => requestAnimationFrame(applyParallax);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    // Initial run
    applyParallax();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  /* ── 3D card tilt ── */
  const onCardMove = useCallback((e) => {
    const card = e.currentTarget;
    const r = card.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 18;
    const y = ((e.clientY - r.top) / r.height - 0.5) * -18;
    card.style.setProperty('--tilt-x', `${y}deg`);
    card.style.setProperty('--tilt-y', `${x}deg`);
    card.style.setProperty('--card-glow', '1');
  }, []);

  const onCardLeave = useCallback((e) => {
    const card = e.currentTarget;
    card.style.setProperty('--tilt-x', '0deg');
    card.style.setProperty('--tilt-y', '0deg');
    card.style.setProperty('--card-glow', '0');
  }, []);

  return (
    <div className="fl-page">
      {/* ── Google Material Symbols ── */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
      />

      {/* ═══ NAV ═══════════════════════════════════════════════ */}
      <header className={`fl-nav${navScrolled ? ' fl-nav--scrolled' : ''}`}>
        <Link to="/" className="fl-nav__brand" onClick={() => setNavOpen(false)}>
          <span className="fl-nav__mark">CL</span>
          CleanLedger
        </Link>

        <nav
          className={`fl-nav__links${navOpen ? ' fl-nav__links--open' : ''}`}
          aria-label="Primary"
        >
          <a className="fl-nav__link" href="#features" onClick={() => setNavOpen(false)}>Features</a>
          <a className="fl-nav__link" href="#depth"    onClick={() => setNavOpen(false)}>Depth</a>
          <a className="fl-nav__link" href="#showcase" onClick={() => setNavOpen(false)}>Showcase</a>
          <Link className="fl-nav__cta" to="/auth"     onClick={() => setNavOpen(false)}>
            Sign in
          </Link>
        </nav>

        <button
          type="button"
          className="fl-nav__toggle"
          aria-expanded={navOpen}
          aria-label="Toggle menu"
          onClick={() => setNavOpen((o) => !o)}
        >
          <Icon name={navOpen ? 'close' : 'menu'} />
        </button>
      </header>

      {/* ═══ HERO ═══════════════════════════════════════════════ */}
      <section className="fl-hero" id="top">
        <div className="fl-hero__bg" aria-hidden />
        <div className="fl-hero__grid" aria-hidden />
        <div className="fl-hero__orb fl-hero__orb--1" aria-hidden />
        <div className="fl-hero__orb fl-hero__orb--2" aria-hidden />

        {/* 3D floating shapes */}
        <div className="fl-hero__shapes" aria-hidden>
          <div className="fl-shape fl-shape--ring" />
          <div className="fl-shape fl-shape--1" />
          <div className="fl-shape fl-shape--2" />
          <div className="fl-shape fl-shape--3" />
          <div className="fl-shape fl-shape--dot fl-shape--dot-a" />
          <div className="fl-shape fl-shape--dot fl-shape--dot-b" />
          <div className="fl-shape fl-shape--dot fl-shape--dot-c" />
        </div>

        <div className="fl-hero__content">
          <span className="fl-hero__eyebrow">
            <Icon name="auto_awesome" className="fl-eyebrow-icon" />
            Private markets infrastructure
          </span>
          <h1 className="fl-hero__title">
            Precision-grade{' '}
            <span className="fl-hero__title-gradient">capital rails</span>{' '}
            for the next decade.
          </h1>
          <p className="fl-hero__sub">
            CleanLedger unifies onboarding, milestone governance, and cryptographic audit —
            so investors see truth, and founders ship with clarity.
          </p>
          <div className="fl-hero__actions">
            <Link to="/auth" className="fl-btn-primary" id="hero-cta-primary">
              Get started
              <Icon name="arrow_forward" className="fl-btn-icon" />
            </Link>
            <a className="fl-btn-ghost" href="#features" id="hero-cta-ghost">
              Explore platform
            </a>
          </div>

          {/* Trust badges */}
          <div className="fl-hero__badges">
            <span className="fl-badge"><Icon name="verified" />SOC 2 compliant</span>
            <span className="fl-badge"><Icon name="lock" />End-to-end encrypted</span>
            <span className="fl-badge"><Icon name="diversity_3" />DAO governed</span>
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ══════════════════════════════════════════ */}
      <RevealSection className="fl-section" id="features">
        <div className="fl-section__head">
          <p className="fl-section__label">Capabilities</p>
          <h2 className="fl-section__title">Built for depth, delivered with restraint</h2>
          <p className="fl-section__desc">
            Every surface is optimized for signal — minimal chrome, maximum trust.
            Hover cards to feel the 3D tilt.
          </p>
        </div>

        <div className="fl-features__grid">
          {FEATURES.map((f, i) => (
            <article
              key={f.title}
              className="fl-feature-card"
              style={{ '--card-color': f.color, '--card-delay': `${i * 0.1}s` }}
              onMouseMove={onCardMove}
              onMouseLeave={onCardLeave}
            >
              <div className="fl-feature-card__shine" aria-hidden />
              <div className="fl-feature-card__icon">
                <Icon name={f.icon} />
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </article>
          ))}
        </div>
      </RevealSection>

      {/* ═══ PARALLAX / DEPTH ══════════════════════════════════ */}
      <section className="fl-parallax" id="depth" ref={parallaxSectionRef}>
        <div className="fl-parallax__bg" aria-hidden />

        <div className="fl-parallax__stack">
          {/* Back layer – slowest */}
          <div className="fl-parallax__layer fl-parallax__layer--back" data-depth="0.5">
            <p className="fl-parallax__hint">
              Scroll-driven perspective — layers scale and rotate as you move through the page.
            </p>
          </div>

          {/* Mid layer */}
          <div className="fl-parallax__layer fl-parallax__layer--mid" data-depth="1">
            <p className="fl-parallax__mid-label">Depth without noise.</p>
            <p className="fl-parallax__mid-body">
              Hierarchy in motion mirrors hierarchy in data.
            </p>
          </div>

          {/* Front layer – fastest */}
          <div className="fl-parallax__layer fl-parallax__layer--front" data-depth="1.6">
            <h2>Parallax intelligence</h2>
            <p>
              Perspective and motion cue hierarchy — the same discipline we apply to
              ledger events and fund state.
            </p>
            <div className="fl-parallax__front-badge">
              <Icon name="auto_awesome" />
              Scroll-reactive 3D
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SHOWCASE ══════════════════════════════════════════ */}
      <RevealSection className="fl-section fl-showcase" id="showcase">
        <div className="fl-section__head">
          <p className="fl-section__label">Showcase</p>
          <h2 className="fl-section__title">Horizontal discovery rail</h2>
          <p className="fl-section__desc">
            Snap-scroll carousel — swipe on mobile, drag on desktop. Cards lift on hover.
          </p>
        </div>

        <div className="fl-showcase__track-wrap">
          <div className="fl-showcase__track" role="list">
            {SHOWCASE.map((s, i) => (
              <article
                key={s.title}
                className="fl-showcase-card"
                role="listitem"
                style={{ '--showcase-accent': s.accent, '--showcase-delay': `${i * 0.08}s` }}
              >
                <div className="fl-showcase-card__accent-bar" aria-hidden />
                <p className="fl-showcase-card__tag">{s.tag}</p>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
                <span className="fl-showcase-card__arrow">
                  <Icon name="arrow_forward" />
                </span>
              </article>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* ═══ CTA BANNER ════════════════════════════════════════ */}
      <RevealSection className="fl-cta-band">
        <div className="fl-cta-band__inner">
          <h2>Ready to bring clarity to your capital?</h2>
          <p>Join the founders and investors building on CleanLedger today.</p>
          <Link to="/auth" className="fl-btn-primary fl-btn-primary--lg" id="band-cta">
            Start free
            <Icon name="arrow_forward" className="fl-btn-icon" />
          </Link>
        </div>
        <div className="fl-cta-band__glow" aria-hidden />
      </RevealSection>

      {/* ═══ FOOTER ════════════════════════════════════════════ */}
      <footer className="fl-footer">
        <div className="fl-footer__inner">
          <Link to="/" className="fl-footer__brand">
            <span className="fl-nav__mark">CL</span>
            CleanLedger
          </Link>
          <p className="fl-footer__tagline">
            <span style={{ color: '#2563eb' }}>Precision-grade infrastructure</span> for private
            markets.
          </p>
          <nav className="fl-footer__links" aria-label="Footer">
            <Link to="/auth">Sign in</Link>
            <a href="#features">Features</a>
            <a href="#showcase">Showcase</a>
            <a href="#top">Back to top ↑</a>
          </nav>
          <p className="fl-footer__copy">
            © {new Date().getFullYear()} CleanLedger. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
