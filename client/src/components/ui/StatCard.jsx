import './StatCard.css';

export default function StatCard({ label, value, icon, delta, deltaPositive, prefix = '', suffix = '' }) {
  return (
    <div className="stat-card">
      <div className="stat-card__header">
        <span className="stat-card__label text-label-md text-secondary">{label}</span>
        {icon && (
          <span className="stat-card__icon material-symbols-outlined">{icon}</span>
        )}
      </div>
      <div className="stat-card__value tabular text-headline">
        {prefix}{value}{suffix}
      </div>
      {delta && (
        <div className={`stat-card__delta ${deltaPositive ? 'stat-card__delta--up' : 'stat-card__delta--down'}`}>
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
            {deltaPositive ? 'trending_up' : 'trending_down'}
          </span>
          {delta}
        </div>
      )}
    </div>
  );
}
