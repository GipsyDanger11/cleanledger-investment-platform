import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

const TYPE_CONFIG = {
  capital_release:    { label: 'Capital Release',     icon: 'call_made',      color: 'var(--color-on-tertiary-container)', bg: 'rgba(107,255,143,0.12)' },
  funding_allocation: { label: 'Funding Allocation',  icon: 'account_balance', color: 'var(--color-primary-container)',     bg: 'rgba(30,41,59,0.1)' },
  inter_account:      { label: 'Inter-Account Transfer', icon: 'swap_horiz',   color: '#F59E0B',                           bg: 'rgba(245,158,11,0.1)' },
};

export default function AuditEntry({ entry, isOdd }) {
  const cfg = TYPE_CONFIG[entry.type] || TYPE_CONFIG.funding_allocation;

  return (
    <tr style={{ background: isOdd ? 'var(--color-surface-container-lowest)' : 'var(--color-surface-container-low)' }}>
      {/* Block index */}
      <td className="num" style={{ color: 'var(--color-outline)', width: '80px' }}>
        #{entry.blockNumber}
      </td>

      {/* Type chip */}
      <td>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          padding: '3px 8px', borderRadius: '9999px',
          background: cfg.bg, color: cfg.color,
          fontSize: 'var(--font-size-label-sm)', fontWeight: 500,
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

      {/* Amount */}
      <td className="num text-body-sm" style={{ fontWeight: 600 }}>
        {formatCurrency(entry.amount)}
      </td>

      {/* Hash */}
      <td>
        <span style={{
          fontFamily: 'Courier New, monospace',
          fontSize: '0.65rem',
          color: 'var(--color-outline)',
          letterSpacing: '0.02em',
        }}>
          {entry.hash}
        </span>
      </td>

      {/* Timestamp */}
      <td className="text-label-sm" style={{ color: 'var(--color-outline)', whiteSpace: 'nowrap' }}>
        {formatDate(entry.createdAt)}
      </td>

      {/* Status */}
      <td>
        <span className="chip chip--success" style={{ fontSize: '0.6rem', padding: '2px 6px' }}>
          confirmed
        </span>
      </td>
    </tr>
  );
}
