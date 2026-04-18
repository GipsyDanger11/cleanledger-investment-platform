import { Link } from 'react-router-dom';
import './Header.css';

export default function Header() {
  return (
    <header className="public-header">
      <div className="public-header__inner">
        {/* Logo */}
        <Link to="/" className="public-header__logo">
          <span className="public-header__logo-mark">CL</span>
          <span className="public-header__brand">CleanLedger</span>
        </Link>

        {/* Nav */}
        <nav className="public-header__nav" aria-label="Public navigation">
          <a href="#portfolio" className="public-header__link">Portfolio</a>
          <a href="#insights" className="public-header__link">Insights</a>
        </nav>

        {/* CTA */}
        <Link to="/onboarding" className="btn btn-primary public-header__cta">
          Get Started
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
        </Link>
      </div>
    </header>
  );
}
