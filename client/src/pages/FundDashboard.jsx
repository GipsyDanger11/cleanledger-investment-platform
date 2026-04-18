import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../utils/apiClient';
import './FundDashboard.css';

const CATEGORY_META = {
  tech:       { label: 'Technology',         color: '#1976D2', icon: 'memory' },
  marketing:  { label: 'Marketing',          color: '#7B1FA2', icon: 'campaign' },
  operations: { label: 'Operations',         color: '#E65100', icon: 'settings' },
  legal:      { label: 'Legal & Compliance', color: '#2E7D32', icon: 'gavel' },
};

export default function FundDashboard() {
  const { id: startupIdParam } = useParams();
  const [startup, setStartup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [expenseForm, setExpenseForm] = useState({ category:'tech', amount:'', description:'', receiptUrl:'' });
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState('');

  // Fetch startup fund data
  const fetchData = async (sid) => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/startups/${sid}/funds`);
      setStartup(res.data.data);
    } catch {
      setError('Failed to load fund data.');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const load = async () => {
      try {
        let sid = startupIdParam;
        if (!sid) {
          const me = await apiClient.get('/startups/me/profile');
          sid = me.data.data._id;
        }
        fetchData(sid);
      } catch { setLoading(false); setError('No startup profile found.'); }
    };
    load();
  }, [startupIdParam]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!startup) return;
    setSubmitting(true); setSubmitMsg('');
    try {
      await apiClient.post(`/startups/${startup._id}/funds/expense`, {
        ...expenseForm, amount: Number(expenseForm.amount)
      });
      setSubmitMsg('Expense recorded and audit entry created!');
      setExpenseForm({ category:'tech', amount:'', description:'', receiptUrl:'' });
      fetchData(startup._id);
    } catch (err) {
      setSubmitMsg(err.response?.data?.message || 'Failed to add expense.');
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="fund-loading"><span className="material-symbols-outlined fd-spin">refresh</span> Loading...</div>;
  if (error) return <div className="fund-error">{error}</div>;
  if (!startup) return null;

  const alloc = startup.fundAllocation || {};
  const categories = Object.keys(CATEGORY_META);
  const totalRaised = startup.totalRaised || 0;
  const fundingTarget = startup.fundingTarget || 1;
  const raisedPct = Math.min((totalRaised / fundingTarget) * 100, 100);

  // Build pie segments
  const pieSegments = [];
  let cumAngle = 0;
  for (const cat of categories) {
    const pct = alloc[cat]?.planned || 0;
    const angle = (pct / 100) * 360;
    pieSegments.push({ cat, pct, angle, start: cumAngle });
    cumAngle += angle;
  }

  const unresolvedAlerts = (startup.varianceAlerts || []).filter(a => !a.resolved);

  return (
    <div className="fund-dashboard">
      {/* ── Header ── */}
      <div className="fund-header">
        <div>
          <h1 className="fund-header__title">Fund Dashboard</h1>
          <p className="fund-header__sub">{startup.name} — Transparent Fund Tracking (R2)</p>
        </div>
        <div className="fund-header__badge" style={{
          background: startup.verificationStatus === 'verified' ? '#E8F5E9' : '#FFF8E1',
          color: startup.verificationStatus === 'verified' ? '#2E7D32' : '#F57F17',
          border: `1px solid ${startup.verificationStatus === 'verified' ? '#C8E6C9' : '#FFE082'}`,
        }}>
          <span className="material-symbols-outlined" style={{fontSize:'16px'}}>
            {startup.verificationStatus === 'verified' ? 'verified' : 'pending'}
          </span>
          {startup.verificationStatus === 'verified' ? 'Verified' : startup.verificationStatus || 'Unverified'}
        </div>
      </div>

      {/* ── Variance Alerts ── */}
      {unresolvedAlerts.length > 0 && (
        <div className="fund-alerts">
          <div className="fund-alerts__title">
            <span className="material-symbols-outlined" style={{fontSize:'18px'}}>warning</span>
            {unresolvedAlerts.length} Variance Alert{unresolvedAlerts.length > 1 ? 's' : ''} — Spending deviation &gt;20%
          </div>
          {unresolvedAlerts.map((alert, i) => (
            <div key={i} className="fund-alert-item">
              <strong>{CATEGORY_META[alert.category]?.label || alert.category}</strong>:
              Planned {alert.plannedPct?.toFixed(1)}% → Actual {alert.actualPct?.toFixed(1)}%
              <span style={{marginLeft:'8px', color:'#D32F2F', fontWeight:700}}>
                ({Math.abs(alert.actualPct - alert.plannedPct).toFixed(1)}% deviation)
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── KPI Row ── */}
      <div className="fund-kpi-grid">
        <div className="fund-kpi-card">
          <span className="material-symbols-outlined fund-kpi-card__icon" style={{color:'#1976D2'}}>savings</span>
          <div className="fund-kpi-card__value">${totalRaised.toLocaleString()}</div>
          <div className="fund-kpi-card__label">Total Raised</div>
          <div className="fund-kpi-card__bar">
            <div style={{width:`${raisedPct}%`, background:'#1976D2'}}/>
          </div>
          <div className="fund-kpi-card__sub">{raisedPct.toFixed(1)}% of ${fundingTarget.toLocaleString()} goal</div>
        </div>
        <div className="fund-kpi-card">
          <span className="material-symbols-outlined fund-kpi-card__icon" style={{color:'#7B1FA2'}}>receipt_long</span>
          <div className="fund-kpi-card__value">${(startup.expenses||[]).reduce((s,e) => s+e.amount,0).toLocaleString()}</div>
          <div className="fund-kpi-card__label">Total Expenses</div>
          <div className="fund-kpi-card__sub">{(startup.expenses||[]).length} receipts uploaded</div>
        </div>
        <div className="fund-kpi-card">
          <span className="material-symbols-outlined fund-kpi-card__icon" style={{color:'#E65100'}}>shield</span>
          <div className="fund-kpi-card__value">{startup.trustScore || 50}</div>
          <div className="fund-kpi-card__label">Trust Score</div>
          <div className="fund-kpi-card__bar">
            <div style={{width:`${startup.trustScore||50}%`, background:'#E65100'}}/>
          </div>
          <div className="fund-kpi-card__sub">Out of 100</div>
        </div>
        <div className="fund-kpi-card">
          <span className="material-symbols-outlined fund-kpi-card__icon" style={{color: unresolvedAlerts.length > 0 ? '#D32F2F' : '#2E7D32'}}>
            {unresolvedAlerts.length > 0 ? 'error' : 'check_circle'}
          </span>
          <div className="fund-kpi-card__value" style={{color: unresolvedAlerts.length > 0 ? '#D32F2F' : '#2E7D32'}}>
            {unresolvedAlerts.length > 0 ? unresolvedAlerts.length : '✓'}
          </div>
          <div className="fund-kpi-card__label">Variance Alerts</div>
          <div className="fund-kpi-card__sub">{unresolvedAlerts.length === 0 ? 'All within plan' : 'Needs attention'}</div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="fund-tabs">
        {['overview','expenses','add-expense'].map(tab => (
          <button key={tab} className={`fund-tab ${activeTab === tab ? 'fund-tab--active' : ''}`}
            onClick={() => setActiveTab(tab)}>
            {tab === 'overview' ? 'Allocation Overview' : tab === 'expenses' ? 'Expense Log' : '+ Add Expense'}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ── */}
      {activeTab === 'overview' && (
        <div className="fund-overview">
          {/* Pie Chart representation using CSS */}
          <div className="fund-pie-section">
            <h3 className="fund-section-title">Planned Allocation</h3>
            <div className="fund-pie-chart">
              {categories.map(cat => {
                const meta = CATEGORY_META[cat];
                const pct = alloc[cat]?.planned || 0;
                return (
                  <div key={cat} className="fund-pie-bar">
                    <div className="fund-pie-bar__label">
                      <span className="material-symbols-outlined" style={{fontSize:'16px', color:meta.color}}>{meta.icon}</span>
                      {meta.label}
                    </div>
                    <div className="fund-pie-bar__track">
                      <div className="fund-pie-bar__fill" style={{width:`${pct}%`, background:meta.color}}/>
                    </div>
                    <div className="fund-pie-bar__pct" style={{color:meta.color}}>{pct}%</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Planned vs Actual table */}
          <div className="fund-compare-section">
            <h3 className="fund-section-title">Planned vs Actual Spend</h3>
            <div className="fund-compare-table">
              <div className="fund-compare-row fund-compare-row--header">
                <span>Category</span><span>Planned</span><span>Actual</span><span>Status</span>
              </div>
              {categories.map(cat => {
                const meta = CATEGORY_META[cat];
                const planned = alloc[cat]?.planned || 0;
                const actual  = alloc[cat]?.actual  || 0;
                const dev = planned > 0 ? Math.abs(actual - planned) : 0;
                const flagged = dev > 20;
                return (
                  <div key={cat} className="fund-compare-row">
                    <span style={{display:'flex', alignItems:'center', gap:'6px'}}>
                      <span className="material-symbols-outlined" style={{fontSize:'16px', color:meta.color}}>{meta.icon}</span>
                      {meta.label}
                    </span>
                    <span style={{color:'#555'}}>{planned}%</span>
                    <span style={{color: flagged ? '#D32F2F' : '#333', fontWeight: flagged ? 700 : 400}}>{actual.toFixed(1)}%</span>
                    <span>
                      {flagged
                        ? <span className="fund-badge fund-badge--red">⚠ {dev.toFixed(1)}% over</span>
                        : <span className="fund-badge fund-badge--green">✓ On track</span>}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Expenses Tab ── */}
      {activeTab === 'expenses' && (
        <div className="fund-expenses">
          <h3 className="fund-section-title">
            Immutable Expense Log
            <span className="fund-badge fund-badge--blue" style={{marginLeft:'10px'}}>🔒 Append-only</span>
          </h3>
          {(startup.expenses || []).length === 0 ? (
            <div className="fund-empty">
              <span className="material-symbols-outlined" style={{fontSize:'48px', color:'#BDBDBD'}}>receipt_long</span>
              <p>No expenses recorded yet. Upload receipts to maintain transparency.</p>
            </div>
          ) : (
            <div className="fund-expense-list">
              {[...(startup.expenses || [])].reverse().map((exp, i) => (
                <div key={i} className="fund-expense-item">
                  <div className="fund-expense-item__left">
                    <span className="material-symbols-outlined" style={{fontSize:'20px', color:CATEGORY_META[exp.category]?.color}}>
                      {CATEGORY_META[exp.category]?.icon || 'receipt'}
                    </span>
                    <div>
                      <div style={{fontWeight:600, fontSize:'14px', color:'#111'}}>{exp.description || 'Expense'}</div>
                      <div style={{fontSize:'12px', color:'#757575'}}>
                        {CATEGORY_META[exp.category]?.label} · {new Date(exp.uploadedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="fund-expense-item__right">
                    <div style={{fontWeight:700, fontSize:'16px', color:'#111'}}>${exp.amount.toLocaleString()}</div>
                    {exp.receiptUrl && (
                      <a href={exp.receiptUrl} target="_blank" rel="noreferrer"
                        style={{fontSize:'11px', color:'#1976D2', textDecoration:'none'}}>
                        View Receipt ↗
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Add Expense Tab ── */}
      {activeTab === 'add-expense' && (
        <div className="fund-add-expense">
          <h3 className="fund-section-title">Record New Expense</h3>
          <p style={{fontSize:'13px', color:'#757575', marginBottom:'24px'}}>
            Each expense is permanently recorded as a blockchain audit entry. This cannot be deleted.
          </p>
          <form className="fund-expense-form" onSubmit={handleAddExpense}>
            <div className="profile-row">
              <div className="profile-field">
                <label className="profile-field__label">Category *</label>
                <select className="profile-field__select" value={expenseForm.category}
                  onChange={e => setExpenseForm(f => ({...f, category: e.target.value}))}>
                  {Object.entries(CATEGORY_META).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
              <div className="profile-field">
                <label className="profile-field__label">Amount (USD) *</label>
                <input className="profile-field__input" type="number" min="1"
                  placeholder="e.g. 5000" required
                  value={expenseForm.amount}
                  onChange={e => setExpenseForm(f => ({...f, amount: e.target.value}))}/>
              </div>
            </div>
            <div className="profile-field">
              <label className="profile-field__label">Description</label>
              <input className="profile-field__input" placeholder="e.g. AWS hosting costs for Q1"
                value={expenseForm.description}
                onChange={e => setExpenseForm(f => ({...f, description: e.target.value}))}/>
            </div>
            <div className="profile-field">
              <label className="profile-field__label">Receipt / Invoice URL</label>
              <input className="profile-field__input" placeholder="Link to invoice or receipt"
                value={expenseForm.receiptUrl}
                onChange={e => setExpenseForm(f => ({...f, receiptUrl: e.target.value}))}/>
            </div>
            {submitMsg && (
              <div style={{
                padding:'12px 16px', borderRadius:'10px', fontSize:'13px',
                background: submitMsg.includes('!') ? '#E8F5E9' : '#FFEBEE',
                color: submitMsg.includes('!') ? '#2E7D32' : '#D32F2F',
                border: `1px solid ${submitMsg.includes('!') ? '#C8E6C9' : '#FFCDD2'}`,
              }}>{submitMsg}</div>
            )}
            <button type="submit" className="auth-submit" disabled={submitting}>
              {submitting ? 'Recording...' : '🔒 Record Expense (Immutable)'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
