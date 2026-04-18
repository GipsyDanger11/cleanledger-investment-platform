import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 'var(--space-6)',
      background: 'var(--color-background)',
      textAlign: 'center',
      padding: 'var(--space-8)',
    }}>
      <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--color-outline)' }}>
        search_off
      </span>
      <div>
        <h1 className="text-headline" style={{ margin: '0 0 var(--space-2)' }}>404 — Page Not Found</h1>
        <p className="text-body-md text-secondary">The page you're looking for doesn't exist on the ledger.</p>
      </div>
      <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
        <Link to="/" className="btn btn-secondary">← Back to Home</Link>
        <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
      </div>
    </div>
  );
}
