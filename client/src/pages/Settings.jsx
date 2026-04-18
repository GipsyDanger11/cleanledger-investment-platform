import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user } = useAuth();

  return (
    <div>
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your account profile, notification preferences, and linked wallets.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', alignItems: 'start' }}>

        {/* Profile Section */}
        <div className="card-section">
          <h2 className="text-title" style={{ marginBottom: 'var(--space-6)' }}>Profile</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div>
              <label className="input-label" htmlFor="settings-name">Full Name</label>
              <input id="settings-name" className="input" defaultValue={user?.name} />
            </div>
            <div>
              <label className="input-label" htmlFor="settings-email">Email</label>
              <input id="settings-email" className="input" type="email" defaultValue={user?.email} />
            </div>
            <div>
              <label className="input-label" htmlFor="settings-org">Organization</label>
              <input id="settings-org" className="input" defaultValue={user?.organization} />
            </div>
            <div>
              <label className="input-label">KYC Status</label>
              <div style={{ paddingTop: 'var(--space-2)' }}>
                <span className="chip chip--success">
                  <span className="material-symbols-outlined" style={{ fontSize: '12px', fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                  Verified
                </span>
              </div>
            </div>
            <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Save Changes</button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Notification Preferences */}
          <div className="card-section">
            <h2 className="text-title" style={{ marginBottom: 'var(--space-6)' }}>Notification Preferences</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {[
                { id: 'n-milestone', label: 'Milestone Updates',    checked: true  },
                { id: 'n-kyb',      label: 'KYB Status Changes',   checked: true  },
                { id: 'n-ledger',   label: 'Ledger Entries',        checked: false },
                { id: 'n-dao',      label: 'DAO Vote Alerts',       checked: true  },
                { id: 'n-esg',      label: 'ESG Report Releases',   checked: false },
              ].map((n) => (
                <label key={n.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked={n.checked} id={n.id} style={{ accentColor: 'var(--color-primary-container)', width: '16px', height: '16px' }} />
                  <span className="text-body-sm">{n.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Linked Wallets */}
          <div className="card-section">
            <h2 className="text-title" style={{ marginBottom: 'var(--space-4)' }}>Linked Wallets</h2>
            <div className="card" style={{ padding: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-outline)' }}>account_balance_wallet</span>
              <div style={{ flex: 1 }}>
                <p className="text-label-md" style={{ margin: 0, color: 'var(--color-on-surface)' }}>No wallet linked</p>
                <p className="text-label-sm text-meta" style={{ margin: 0 }}>Connect a wallet for DAO participation</p>
              </div>
              <button className="btn btn-secondary">Connect</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
