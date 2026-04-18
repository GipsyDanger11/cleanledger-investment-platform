export default function TrustScoreBadge({ score }) {
  const color = score >= 85 ? '#00A64A' : score >= 70 ? '#F59E0B' : '#BA1A1A';
  const bg    = score >= 85 ? 'rgba(107,255,143,0.15)' : score >= 70 ? 'rgba(245,158,11,0.12)' : 'rgba(186,26,26,0.1)';

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '3px 8px',
      borderRadius: '9999px',
      background: bg,
      color,
      fontSize: 'var(--font-size-label-md)',
      fontWeight: 600,
      fontVariantNumeric: 'tabular-nums',
    }}>
      <span className="material-symbols-outlined" style={{ fontSize: '12px', fontVariationSettings: "'FILL' 1" }}>
        shield
      </span>
      {score}
    </span>
  );
}
