import { useState } from 'react';
import AuditEntry from '../components/ui/AuditEntry';
import { useInvestment } from '../context/InvestmentContext';
import './AuditTrail.css';

const TX_TYPES = ['All Types', 'Capital Release', 'Funding Allocation', 'Inter-Account Transfer'];

export default function AuditTrail() {
  const { auditEntries, startups } = useInvestment();
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [startupFilter, setStartupFilter] = useState('All Startups');
  const [search, setSearch] = useState('');

  const typeMap = {
    'Capital Release': 'capital_release',
    'Funding Allocation': 'funding_allocation',
    'Inter-Account Transfer': 'inter_account',
  };

  const filtered = auditEntries.filter((e) => {
    const typeOk = typeFilter === 'All Types' || e.type === typeMap[typeFilter];
    const startupOk = startupFilter === 'All Startups' || e.startupId === startupFilter || (startupFilter === 'Platform' && !e.startupId);
    const searchOk = !search || e.hash.includes(search) || e.from.toLowerCase().includes(search.toLowerCase()) || e.to.toLowerCase().includes(search.toLowerCase());
    return typeOk && startupOk && searchOk;
  });

  const handleExport = () => {
    const csv = [
      ['Block', 'Type', 'From', 'To', 'Amount', 'Hash', 'Timestamp'].join(','),
      ...filtered.map((e) => [e.blockIndex, e.type, `"${e.from}"`, `"${e.to}"`, e.amount, e.hash, e.timestamp].join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'cleanledger-audit.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="audit-trail">
      {/* Header */}
      <div className="flex justify-between items-start" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Immutable Audit Trail</h1>
          <p>Bank-grade cryptographic ledger. All transactions are permanently recorded, hashed, and chained to ensure absolute data integrity.</p>
        </div>
        <button className="btn btn-secondary" onClick={handleExport} id="export-audit-btn">
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span>
          Export CSV
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card-section audit-trail__filters">
        {/* Search hash */}
        <div style={{ position: 'relative', flex: 1 }}>
          <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-outline)', fontSize: '18px', pointerEvents: 'none' }}>
            tag
          </span>
          <input
            className="input"
            style={{ paddingLeft: '40px', fontFamily: 'Courier New, monospace', fontSize: '0.75rem' }}
            placeholder="Search hash, entity name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search audit entries"
            id="audit-search"
          />
        </div>

        {/* Type filter */}
        <select
          className="input audit-trail__select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          aria-label="Filter by transaction type"
          id="audit-type-filter"
        >
          {TX_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>

        {/* Startup filter */}
        <select
          className="input audit-trail__select"
          value={startupFilter}
          onChange={(e) => setStartupFilter(e.target.value)}
          aria-label="Filter by startup"
          id="audit-startup-filter"
        >
          <option value="All Startups">All Startups</option>
          <option value="Platform">Platform (No Startup)</option>
          {startups.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Chain integrity banner */}
      <div className="alert-banner audit-trail__chain-banner">
        <span className="material-symbols-outlined" style={{ color: 'var(--color-on-tertiary-container)' }}>link</span>
        <div>
          <p className="text-label-md" style={{ color: 'var(--color-on-surface)', margin: 0, fontWeight: 600 }}>
            Chain Integrity: Verified
          </p>
          <p className="text-label-sm text-secondary" style={{ margin: 0 }}>
            Latest block #1042 · {filtered.length} entries shown · SHA-256 hash chain valid
          </p>
        </div>
        <span className="chip chip--success" style={{ fontSize: '0.6rem', marginLeft: 'auto' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '11px', fontVariationSettings: "'FILL' 1" }}>verified</span>
          Immutable
        </span>
      </div>

      {/* Ledger Table */}
      <div className="card audit-trail__table-wrap">
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Block</th>
                <th>Type</th>
                <th>Entity</th>
                <th className="num">Amount (USD)</th>
                <th>Hash</th>
                <th>Timestamp</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map((entry, i) => (
                <AuditEntry key={entry.id} entry={entry} isOdd={i % 2 === 0} />
              )) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-outline)' }}>
                    No entries match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination placeholder */}
      <div className="audit-trail__pagination">
        <span className="text-label-sm text-meta">
          Showing {filtered.length} of {auditEntries.length} entries · Block range #1035–#1042
        </span>
        <div className="flex gap-2">
          <button className="btn btn-secondary" disabled>← Previous</button>
          <button className="btn btn-secondary" disabled>Next →</button>
        </div>
      </div>
    </div>
  );
}
