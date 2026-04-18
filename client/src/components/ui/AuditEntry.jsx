import { formatDate } from '../../utils/formatDate';

const TYPE_CONFIG = {
  capital_release:    { label: 'Capital Release',          icon: 'call_made',           color: 'var(--color-on-tertiary-container)', bg: 'rgba(107,255,143,0.12)' },
  funding_allocation: { label: 'Funding Allocation',       icon: 'account_balance',     color: 'var(--color-primary-container)',     bg: 'rgba(30,41,59,0.1)' },
  inter_account:      { label: 'Inter-Account Transfer',   icon: 'swap_horiz',          color: '#F59E0B',                            bg: 'rgba(245,158,11,0.1)' },
  investment:         { label: 'Investment',               icon: 'trending_up',         color: '#10b981',                            bg: 'rgba(16,185,129,0.12)' },
  milestone_complete: { label: 'Milestone',                icon: 'flag',                color: '#a78bfa',                            bg: 'rgba(167,139,250,0.12)' },
  kyb_verified:       { label: 'KYB Verified',             icon: 'verified_user',       color: '#34d399',                            bg: 'rgba(52,211,153,0.12)' },
  dao_vote:           { label: 'DAO Vote',                 icon: 'how_to_vote',         color: '#f87171',                            bg: 'rgba(248,113,113,0.12)' },
};

const formatINR = (amount) => {
  if (!amount && amount !== 0) return '—';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
};

export default function AuditEntry({ entry, isOdd }) {
  const cfg = TYPE_CONFIG[entry.type] || TYPE_CONFIG.funding_allocation;
  const shortHash = (h) => h ? `${h.slice(0, 8)}…${h.slice(-4)}` : '—';

  return (
    <tr style={{ background: isOdd ? 'var(--color-surface-container-lowest)' : 'var(--color-surface-container-low)' }}>
      {/* Block index */}
      <td className="num" style={{ color: 'var(--color-outline)', width: '70px' }}>
        #{entry.blockNumber}
      </td>

      {/* Type chip */}
      <td>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          padding: '3px 8px', borderRadius: '9999px',
          background: cfg.bg, color: cfg.color,
          fontSize: 'var(--font-size-label-sm)', fontWeight: 500,
          whiteSpace: 'nowrap',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>{cfg.icon}</span>
          {cfg.label}
        </span>
      </td>

      {/* From / To */}
      <td className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
        <div>{entry.fromEntity}</div>
        <div style={{ fontSize: '0.6rem', color: 'var(--color-outline)' }}>→ {entry.toEntity}</div>
      </td>

      {/* Amount in ₹ — FHE-masked for investment rows */}
      <td className="num text-body-sm" style={{ fontWeight: 600 }}>
        {entry.type === 'investment' ? (
          <span title="FHE-encrypted: amount hidden from public audit. Homomorphic sum available." style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            fontFamily: 'Courier New, monospace',
            fontSize: '0.6rem',
            color: '#7c3aed',
            background: 'rgba(124,58,237,0.1)',
            border: '1px solid rgba(124,58,237,0.25)',
            borderRadius: '6px',
            padding: '2px 6px',
            cursor: 'help',
            letterSpacing: '0.03em',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '10px', fontVariationSettings: "'FILL' 1" }}>lock</span>
            FHE
          </span>
        ) : (
          entry.amount > 0 ? formatINR(entry.amount) : <span style={{ color: 'var(--color-outline)' }}>—</span>
        )}
      </td>

      {/* Hash (own) */}
      <td>
        <span title={entry.hash} style={{
          fontFamily: 'Courier New, monospace',
          fontSize: '0.62rem',
          color: 'var(--color-outline)',
          letterSpacing: '0.02em',
          cursor: 'default',
        }}>
          {shortHash(entry.hash)}
        </span>
      </td>

      {/* Prev Hash — the chain link */}
      <td>
        <span title={entry.previousHash} style={{
          fontFamily: 'Courier New, monospace',
          fontSize: '0.6rem',
          color: 'rgba(107,114,128,0.6)',
          letterSpacing: '0.02em',
          cursor: 'default',
        }}>
          {entry.previousHash?.startsWith('0000')
            ? <span style={{ color: '#4ade80', fontSize: '0.6rem' }}>GENESIS</span>
            : shortHash(entry.previousHash)
          }
        </span>
      </td>

      {/* Timestamp */}
      <td className="text-label-sm" style={{ color: 'var(--color-outline)', whiteSpace: 'nowrap' }}>
        {formatDate(entry.createdAt)}
      </td>

      {/* Status */}
      <td>
        <span className={`chip chip--${entry.status === 'confirmed' ? 'success' : 'warn'}`} style={{ fontSize: '0.6rem', padding: '2px 6px' }}>
          {entry.status || 'confirmed'}
        </span>
      </td>
    </tr>
  );
}
