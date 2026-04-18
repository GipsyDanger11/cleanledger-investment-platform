import { useEffect, useState } from 'react';
import AuditEntry from '../components/ui/AuditEntry';
import { useInvestment } from '../context/InvestmentContext';
import './AuditTrail.css';

const TX_TYPES = ['All Types', 'Capital Release', 'Funding Allocation', 'Inter-Account Transfer', 'Investment', 'Milestone Complete'];

export default function AuditTrail() {
  const { auditEntries, startups, fetchAuditEntries, verifyChainIntegrity, simulateTamper, loading } = useInvestment();
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [startupFilter, setStartupFilter] = useState('All Startups');
  const [search, setSearch] = useState('');
  const [chainStatus, setChainStatus] = useState(null);   // null | { valid, brokenAt, total, checkedAt, ... }
  const [verifying, setVerifying] = useState(false);
  const [tampering, setTampering] = useState(false);

  const typeMap = {
    'Capital Release':          'capital_release',
    'Funding Allocation':       'funding_allocation',
    'Inter-Account Transfer':   'inter_account',
    'Investment':               'investment',
    'Milestone Complete':       'milestone_complete',
  };

  useEffect(() => {
    fetchAuditEntries();
  }, [fetchAuditEntries]);

  const filtered = auditEntries.filter((e) => {
    const typeOk = typeFilter === 'All Types' || e.type === typeMap[typeFilter];
    const startupId = e.startup?._id || e.startup;
    const startupOk = startupFilter === 'All Startups' || startupId === startupFilter || (startupFilter === 'Platform' && !startupId);
    const fromEntity = e.fromEntity || '';
    const toEntity = e.toEntity || '';
    const searchOk = !search || e.hash.includes(search) || fromEntity.toLowerCase().includes(search.toLowerCase()) || toEntity.toLowerCase().includes(search.toLowerCase());
    return typeOk && startupOk && searchOk;
  });

  const handleExport = () => {
    const csv = [
      ['Block', 'Type', 'From', 'To', 'Amount', 'Hash', 'PrevHash', 'Timestamp'].join(','),
      ...filtered.map((e) => [e.blockNumber, e.type, `"${e.fromEntity}"`, `"${e.toEntity}"`, e.amount, e.hash, e.previousHash, e.createdAt].join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'cleanledger-audit.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleVerify = async () => {
    setVerifying(true);
    setChainStatus(null);
    try {
      const result = await verifyChainIntegrity();
      setChainStatus(result);
    } catch (e) {
      setChainStatus({ valid: false, message: e.message || 'Verification failed.', total: 0, checkedAt: new Date().toISOString() });
    } finally {
      setVerifying(false);
    }
  };

  const handleTamper = async () => {
    if (!window.confirm('⚠️ This will tamper with the most recent transaction block directly in the database (bypassing Mongoose safeguards) to demonstrate how the blockchain detects modifications. Continue?')) {
      return;
    }
    setTampering(true);
    try {
      const res = await simulateTamper();
      if (res?.message) {
        alert(res.message);
      }
      setTimeout(() => {
        handleVerify(); // auto-verify to show the failure!
        fetchAuditEntries(); // refresh UI to show the new tampered data
      }, 500);
    } catch (e) {
      alert('Tampering failed: ' + e.message);
    } finally {
      setTampering(false);
    }
  };

  return (
    <div className="audit-trail">
      {/* Header */}
      <div className="flex justify-between items-start" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Immutable Audit Trail</h1>
          <p>Bank-grade cryptographic ledger. All transactions are permanently recorded, hashed, and chained to ensure absolute data integrity.</p>
        </div>
        <div className="flex gap-3 flex-wrap justify-end">
          <button
            className="btn btn-secondary"
            onClick={handleTamper}
            disabled={tampering}
            title="Injects a modification via pure MongoDB driver to bypass app safeguards."
            style={{ borderColor: 'rgba(239,68,68,0.4)', color: '#ef4444' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              {tampering ? 'progress_activity' : 'warning'}
            </span>
            {tampering ? 'Tampering…' : 'Simulate Tamper (Demo)'}
          </button>
          <button
            id="btn-verify-chain"
            className="btn btn-secondary"
            onClick={handleVerify}
            disabled={verifying}
            style={{ borderColor: 'rgba(16,185,129,0.4)', color: '#10b981' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              {verifying ? 'progress_activity' : 'verified_user'}
            </span>
            {verifying ? 'Verifying…' : 'Verify Chain'}
          </button>
          <button className="btn btn-secondary" onClick={handleExport} id="export-audit-btn">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span>
            Export CSV
          </button>
        </div>
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
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Chain integrity result banner */}
      {chainStatus ? (
        <div
          id="chain-verify-result"
          className="alert-banner audit-trail__chain-banner"
          style={{
            borderColor: chainStatus.valid ? 'rgba(16,185,129,0.35)' : 'rgba(239,68,68,0.35)',
            background:  chainStatus.valid ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)',
          }}
        >
          <span className="material-symbols-outlined" style={{ color: chainStatus.valid ? '#10b981' : '#ef4444', fontVariationSettings: "'FILL' 1" }}>
            {chainStatus.valid ? 'verified_user' : 'gpp_bad'}
          </span>
          <div>
            <p className="text-label-md" style={{ color: chainStatus.valid ? '#10b981' : '#ef4444', margin: 0, fontWeight: 700 }}>
              {chainStatus.valid ? `✅ Chain Valid — ${chainStatus.total} block${chainStatus.total !== 1 ? 's' : ''} verified` : `❌ Chain Tampered — Break at Block #${chainStatus.brokenAt}`}
            </p>
            <p className="text-label-sm text-secondary" style={{ margin: '2px 0 0' }}>
              {chainStatus.valid
                ? `SHA-256 hash chain intact · Checked at ${new Date(chainStatus.checkedAt).toLocaleTimeString()}`
                : `${chainStatus.message || 'Hash mismatch detected.'} · ${chainStatus.brokenType || ''}`
              }
            </p>
          </div>
          <span className={`chip ${chainStatus.valid ? 'chip--success' : 'chip--error'}`} style={{ fontSize: '0.6rem', marginLeft: 'auto' }}>
            {chainStatus.valid ? 'Immutable' : 'TAMPERED'}
          </span>
        </div>
      ) : (
        <div className="alert-banner audit-trail__chain-banner">
          <span className="material-symbols-outlined" style={{ color: 'var(--color-on-tertiary-container)' }}>link</span>
          <div>
            <p className="text-label-md" style={{ color: 'var(--color-on-surface)', margin: 0, fontWeight: 600 }}>
              SHA-256 Hash Chain
            </p>
            <p className="text-label-sm text-secondary" style={{ margin: 0 }}>
              Latest block #{auditEntries[0]?.blockNumber ?? '—'} · {filtered.length} entries shown · Click "Verify Chain" to run integrity check
            </p>
          </div>
          <span className="chip chip--success" style={{ fontSize: '0.6rem', marginLeft: 'auto' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '11px', fontVariationSettings: "'FILL' 1" }}>verified</span>
            Tamper-Evident
          </span>
        </div>
      )}

      {/* Ledger Table */}
      <div className="card audit-trail__table-wrap">
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Block</th>
                <th>Type</th>
                <th>Entity</th>
                <th className="num">Amount (₹)</th>
                <th>Hash</th>
                <th>Prev Hash</th>
                <th>Timestamp</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-outline)' }}>
                    Loading audit entries...
                  </td>
                </tr>
              ) : filtered.length > 0 ? filtered.map((entry, i) => (
                <AuditEntry key={entry._id} entry={entry} isOdd={i % 2 === 0} />
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
