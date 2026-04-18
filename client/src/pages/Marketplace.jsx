import { useState } from 'react';
import StartupCard from '../components/ui/StartupCard';
import { useInvestment } from '../context/InvestmentContext';
import './Marketplace.css';

const SECTORS = ['All', 'Clean Energy', 'Water Tech', 'Solar Tech', 'Thermal Storage', 'Carbon Markets', 'Environmental IoT'];
const RISK_PROFILES = ['All Risk', 'Low Risk (80+)', 'Medium Risk (65–79)', 'High Risk (<65)'];
const ESG_FILTERS = ['All ESG', 'ESG 90+', 'ESG 80+', 'ESG 70+'];

export default function Marketplace() {
  const { startups } = useInvestment();
  const [sector, setSector] = useState('All');
  const [risk, setRisk] = useState('All Risk');
  const [esg, setEsg] = useState('All ESG');
  const [search, setSearch] = useState('');

  const filtered = startups.filter((s) => {
    const sectorOk = sector === 'All' || s.sector === sector;
    const riskOk = risk === 'All Risk'
      || (risk === 'Low Risk (80+)' && s.trustScore >= 80)
      || (risk === 'Medium Risk (65–79)' && s.trustScore >= 65 && s.trustScore < 80)
      || (risk === 'High Risk (<65)' && s.trustScore < 65);
    const esgOk = esg === 'All ESG'
      || (esg === 'ESG 90+' && s.esgScore >= 90)
      || (esg === 'ESG 80+' && s.esgScore >= 80)
      || (esg === 'ESG 70+' && s.esgScore >= 70);
    const searchOk = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.sector.toLowerCase().includes(search.toLowerCase());
    return sectorOk && riskOk && esgOk && searchOk;
  });

  return (
    <div className="marketplace">
      {/* Header */}
      <div className="page-header">
        <h1>Startup Registry</h1>
        <p>Discover and evaluate high-potential startups verified through the CleanLedger framework. Filter by ESG criteria and risk profiles.</p>
      </div>

      {/* Filters */}
      <div className="marketplace__filters card-section">
        {/* Search */}
        <div className="marketplace__search">
          <span className="material-symbols-outlined marketplace__search-icon">search</span>
          <input
            className="input marketplace__search-input"
            placeholder="Search startups, sectors…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search startups"
            id="marketplace-search"
          />
        </div>

        {/* Sector chips */}
        <div className="marketplace__filter-row">
          <span className="text-label-sm text-meta" style={{ flexShrink: 0 }}>Sector</span>
          <div className="marketplace__chips">
            {SECTORS.map((s) => (
              <button
                key={s}
                className={`chip chip--filter ${sector === s ? 'active' : ''}`}
                onClick={() => setSector(s)}
                aria-pressed={sector === s}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Risk chips */}
        <div className="marketplace__filter-row">
          <span className="text-label-sm text-meta" style={{ flexShrink: 0 }}>Risk</span>
          <div className="marketplace__chips">
            {RISK_PROFILES.map((r) => (
              <button
                key={r}
                className={`chip chip--filter ${risk === r ? 'active' : ''}`}
                onClick={() => setRisk(r)}
                aria-pressed={risk === r}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* ESG chips */}
        <div className="marketplace__filter-row">
          <span className="text-label-sm text-meta" style={{ flexShrink: 0 }}>ESG</span>
          <div className="marketplace__chips">
            {ESG_FILTERS.map((e) => (
              <button
                key={e}
                className={`chip chip--filter ${esg === e ? 'active' : ''}`}
                onClick={() => setEsg(e)}
                aria-pressed={esg === e}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="marketplace__results-meta">
        <span className="text-label-md text-secondary">
          {filtered.length} verified {filtered.length === 1 ? 'startup' : 'startups'} found
        </span>
        <span className="chip chip--success" style={{ fontSize: '0.6rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>verified</span>
          All KYB Verified
        </span>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <section
          className="marketplace__grid card-section"
          aria-label="Startup registry"
        >
          {filtered.map((startup) => (
            <StartupCard key={startup.id} startup={startup} />
          ))}
        </section>
      ) : (
        <div className="marketplace__empty card">
          <span className="material-symbols-outlined" style={{ fontSize: '40px', color: 'var(--color-outline)' }}>
            search_off
          </span>
          <p className="text-body-md text-secondary">No startups match your current filters.</p>
          <button className="btn btn-secondary" onClick={() => { setSector('All'); setRisk('All Risk'); setEsg('All ESG'); setSearch(''); }}>
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
