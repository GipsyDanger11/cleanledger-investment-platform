import { useEffect, useState, useMemo } from 'react';
import { useInvestment } from '../context/InvestmentContext';
import { useAuth } from '../context/AuthContext';
import './FundDashboard.css';

const CATEGORY_META = {
  tech:       { label: 'Technology',          color: '#4F46E5', icon: 'memory' },
  marketing:  { label: 'Marketing',           color: '#7C3AED', icon: 'campaign' },
  operations: { label: 'Operations',          color: '#D97706', icon: 'settings' },
  legal:      { label: 'Legal & Compliance',  color: '#059669', icon: 'gavel' },
};

function ExpenseCategoryBar({ cat, planned, actual }) {
  const meta = CATEGORY_META[cat];
  const dev = Math.abs(actual - planned);
  const flagged = planned > 0 && dev > 20;
  const maxPct = Math.max(planned, actual, 1);

  return (
    <div className="fd-cat-bar">
      <div className="fd-cat-bar__header">
        <div className="fd-cat-bar__meta">
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: meta.color }}>{meta.icon}</span>
          <span className="fd-cat-bar__label">{meta.label}</span>
        </div>
        <div className="fd-cat-bar__nums">
          <span style={{ color: '#9CA3AF' }}>Plan {planned}%</span>
          <span style={{ color: flagged ? '#DC2626' : meta.color, fontWeight: 700 }}>
            Actual {actual.toFixed(1)}%
          </span>
          {flagged && (
            <span className="fd-alert-chip">⚠ {dev.toFixed(1)}% over</span>
          )}
          {!flagged && (
            <span className="fd-ok-chip">✓ On track</span>
          )}
        </div>
      </div>
      <div className="fd-cat-bar__tracks">
        <div className="fd-cat-bar__track">
          <div className="fd-cat-bar__fill fd-cat-bar__fill--plan" style={{ width: `${(planned / maxPct) * 100}%`, background: meta.color + '50' }} />
        </div>
        <div className="fd-cat-bar__track" style={{ marginTop: 4 }}>
          <div className="fd-cat-bar__fill" style={{ width: `${(actual / maxPct) * 100}%`, background: flagged ? '#EF4444' : meta.color }} />
        </div>
      </div>
    </div>
  );
}

export default function FundDashboard() {
  const { user } = useAuth();
  const { startups, fetchStartups, addExpense, myStartup, fetchMyStartup } = useInvestment();
  const isFounder = user?.role === 'startup';
  const hubStartups = useMemo(() => {
    if (!isFounder) return startups;
    if (myStartup) return [myStartup];
    const owned = (startups || []).filter((s) => String(s.createdBy) === String(user?._id));
    return owned.length ? owned : [];
  }, [isFounder, myStartup, startups, user?._id]);

  const [selectedStartupId, setSelectedStartupId] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [expenseForm, setExpenseForm] = useState({ category: 'tech', amount: '', description: '', receiptUrl: '' });
  const [submitMsg, setSubmitMsg] = useState('');

  useEffect(() => {
    fetchStartups();
  }, [fetchStartups]);

  useEffect(() => {
    if (isFounder) fetchMyStartup();
  }, [isFounder, fetchMyStartup]);

  useEffect(() => {
    if (!hubStartups.length) return;
    const ok = selectedStartupId && hubStartups.some((s) => String(s._id) === String(selectedStartupId));
    if (!ok) setSelectedStartupId(hubStartups[0]._id);
  }, [selectedStartupId, hubStartups]);

  const startup = hubStartups.find((s) => String(s._id) === String(selectedStartupId)) || hubStartups[0];
  if (!startup) {
    return (
      <div className="fund-dashboard" style={{ padding: 24 }}>
        <p className="text-body-md text-secondary">
          {isFounder ? 'No startup profile found. Complete registration to manage funds.' : 'No startups available.'}
        </p>
      </div>
    );
  }

  const alloc = startup.fundAllocation || {};
  const categories = Object.keys(CATEGORY_META);
  const totalRaised    = startup.totalRaised || 0;
  const fundingTarget  = startup.fundingTarget || 1;
  const raisedPct      = Math.min((totalRaised / fundingTarget) * 100, 100);
  const totalExpenses  = (startup.expenses || []).reduce((s, e) => s + e.amount, 0);

  const varianceAlerts = categories.filter(cat => {
    const planned = alloc[cat]?.planned || 0;
    const actual  = alloc[cat]?.actual  || 0;
    return planned > 0 && Math.abs(actual - planned) > 20;
  });

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      await addExpense(startup._id, {
        category: expenseForm.category,
        amount: Number(expenseForm.amount),
        description: expenseForm.description,
        receiptUrl: expenseForm.receiptUrl,
      });
      await fetchStartups();
      if (isFounder) await fetchMyStartup();
      setSubmitMsg('Expense recorded and immutable audit entry created! ✓');
      setExpenseForm({ category: 'tech', amount: '', description: '', receiptUrl: '' });
      setTimeout(() => setSubmitMsg(''), 4000);
    } catch (err) {
      setSubmitMsg(err.message || 'Failed to record expense');
      setTimeout(() => setSubmitMsg(''), 4000);
    }
  };

  return (
    <div className="fund-dashboard">
      {/* ── Header ── */}
      <div className="fd-header">
        <div>
          <h1 className="fd-header__title">Fund Dashboard</h1>
          <p className="fd-header__sub">Transparent Fund Tracking (R2)</p>
        </div>
        <div className="fd-header__controls">
          <select
            className="fd-startup-select"
            value={selectedStartupId}
            onChange={e => setSelectedStartupId(e.target.value)}
          >
            {hubStartups.map(s => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
          <span className="fd-verify-badge" style={{
            background: startup.verificationStatus === 'verified' ? '#D1FAE5' : '#FEF9C3',
            color: startup.verificationStatus === 'verified' ? '#065F46' : '#92400E',
            border: `1px solid ${startup.verificationStatus === 'verified' ? '#A7F3D0' : '#FDE68A'}`,
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
              {startup.verificationStatus === 'verified' ? 'verified' : 'pending'}
            </span>
            {startup.verificationStatus === 'verified' ? 'Verified' : startup.verificationStatus || 'Unverified'}
          </span>
        </div>
      </div>

      {/* ── Variance Alerts ── */}
      {varianceAlerts.length > 0 && (
        <div className="fd-alert-banner">
          <div className="fd-alert-banner__title">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>warning</span>
            AI Variance Alert — {varianceAlerts.length} categor{varianceAlerts.length > 1 ? 'ies' : 'y'} deviate &gt;20% from plan
          </div>
          <div className="fd-alert-banner__items">
            {varianceAlerts.map(cat => {
              const planned = alloc[cat]?.planned || 0;
              const actual  = alloc[cat]?.actual  || 0;
              return (
                <div key={cat} className="fd-alert-banner__item">
                  <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#DC2626' }}>{CATEGORY_META[cat].icon}</span>
                  <strong>{CATEGORY_META[cat].label}</strong>: Planned {planned}% → Actual {actual.toFixed(1)}%
                  <span className="fd-alert-chip">
                    {Math.abs(actual - planned).toFixed(1)}% deviation
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── KPI Cards ── */}
      <div className="fd-kpi-grid">
        {/* Total Raised */}
        <div className="fd-kpi-card">
          <div className="fd-kpi-card__icon-wrap" style={{ background: '#EEF2FF' }}>
            <span className="material-symbols-outlined" style={{ color: '#4F46E5', fontSize: 22 }}>savings</span>
          </div>
          <div className="fd-kpi-card__value">${totalRaised.toLocaleString()}</div>
          <div className="fd-kpi-card__label">Total Raised</div>
          <div className="fd-kpi-card__bar-track">
            <div className="fd-kpi-card__bar-fill" style={{ width: `${raisedPct}%`, background: '#4F46E5' }} />
          </div>
          <div className="fd-kpi-card__sub">{raisedPct.toFixed(1)}% of ${fundingTarget.toLocaleString()} goal</div>
        </div>

        {/* Total Expenses */}
        <div className="fd-kpi-card">
          <div className="fd-kpi-card__icon-wrap" style={{ background: '#EDE9FE' }}>
            <span className="material-symbols-outlined" style={{ color: '#7C3AED', fontSize: 22 }}>receipt_long</span>
          </div>
          <div className="fd-kpi-card__value">${totalExpenses.toLocaleString()}</div>
          <div className="fd-kpi-card__label">Total Expenses</div>
          <div className="fd-kpi-card__bar-track">
            <div className="fd-kpi-card__bar-fill" style={{ width: `${Math.min((totalExpenses / totalRaised) * 100, 100)}%`, background: '#7C3AED' }} />
          </div>
          <div className="fd-kpi-card__sub">{(startup.expenses || []).length} receipts uploaded</div>
        </div>

        {/* Trust Score */}
        <div className="fd-kpi-card">
          <div className="fd-kpi-card__icon-wrap" style={{ background: '#FEF3C7' }}>
            <span className="material-symbols-outlined" style={{ color: '#D97706', fontSize: 22 }}>shield</span>
          </div>
          <div className="fd-kpi-card__value">{startup.trustScore || 50}</div>
          <div className="fd-kpi-card__label">Trust Score</div>
          <div className="fd-kpi-card__bar-track">
            <div className="fd-kpi-card__bar-fill" style={{ width: `${startup.trustScore || 50}%`, background: '#D97706' }} />
          </div>
          <div className="fd-kpi-card__sub">Out of 100</div>
        </div>

        {/* AI Variance Status */}
        <div className="fd-kpi-card">
          <div className="fd-kpi-card__icon-wrap"
            style={{ background: varianceAlerts.length > 0 ? '#FEE2E2' : '#D1FAE5' }}>
            <span className="material-symbols-outlined"
              style={{ color: varianceAlerts.length > 0 ? '#DC2626' : '#059669', fontSize: 22 }}>
              {varianceAlerts.length > 0 ? 'error' : 'check_circle'}
            </span>
          </div>
          <div className="fd-kpi-card__value"
            style={{ color: varianceAlerts.length > 0 ? '#DC2626' : '#059669' }}>
            {varianceAlerts.length > 0 ? varianceAlerts.length : '✓'}
          </div>
          <div className="fd-kpi-card__label">Variance Alerts</div>
          <div className="fd-kpi-card__sub">
            {varianceAlerts.length === 0 ? 'All within plan' : 'AI flagged deviation >20%'}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="fd-tabs">
        {[
          { id: 'overview',     label: 'Allocation Overview', icon: 'pie_chart' },
          { id: 'expenses',     label: 'Expense Log',         icon: 'receipt_long' },
          { id: 'add-expense',  label: '+ Add Expense',       icon: 'add_circle' },
        ].map(t => (
          <button
            key={t.id}
            className={`fd-tab ${activeTab === t.id ? 'fd-tab--active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* ══ Overview Tab ══ */}
      {activeTab === 'overview' && (
        <div className="fd-overview">
          <div className="fd-section-card">
            <h3 className="fd-section-title">
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#4F46E5' }}>pie_chart</span>
              Planned Allocation
            </h3>
            <div className="fd-alloc-list">
              {categories.map(cat => (
                <div key={cat} className="fd-alloc-row">
                  <div className="fd-alloc-row__meta">
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: CATEGORY_META[cat].color }}>
                      {CATEGORY_META[cat].icon}
                    </span>
                    <span className="fd-alloc-label">{CATEGORY_META[cat].label}</span>
                  </div>
                  <div className="fd-alloc-bar-track">
                    <div
                      className="fd-alloc-bar-fill"
                      style={{ width: `${alloc[cat]?.planned || 0}%`, background: CATEGORY_META[cat].color }}
                    />
                  </div>
                  <span className="fd-alloc-pct" style={{ color: CATEGORY_META[cat].color }}>
                    {alloc[cat]?.planned || 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="fd-section-card">
            <h3 className="fd-section-title">
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#4F46E5' }}>compare_arrows</span>
              Planned vs Actual Spend
            </h3>
            <div className="fd-compare-list">
              {categories.map(cat => (
                <ExpenseCategoryBar
                  key={cat}
                  cat={cat}
                  planned={alloc[cat]?.planned || 0}
                  actual={alloc[cat]?.actual || 0}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ Expenses Tab ══ */}
      {activeTab === 'expenses' && (
        <div className="fd-section-card">
          <h3 className="fd-section-title">
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#4F46E5' }}>receipt_long</span>
            Immutable Expense Log
            <span className="fd-chain-badge">
              <span className="material-symbols-outlined" style={{ fontSize: 12 }}>lock</span>
              Append-only
            </span>
          </h3>

          {(startup.expenses || []).length === 0 ? (
            <div className="fd-empty">
              <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#D1D5DB' }}>receipt_long</span>
              <p>No expenses recorded yet. Upload receipts to maintain transparency.</p>
            </div>
          ) : (
            <div className="fd-expense-list">
              {[...(startup.expenses || [])].reverse().map((exp, i) => (
                <div key={i} className="fd-expense-item">
                  <div className="fd-expense-item__icon" style={{ background: CATEGORY_META[exp.category]?.color + '15' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20, color: CATEGORY_META[exp.category]?.color }}>
                      {CATEGORY_META[exp.category]?.icon || 'receipt'}
                    </span>
                  </div>
                  <div className="fd-expense-item__info">
                    <div className="fd-expense-item__desc">{exp.description || 'Expense'}</div>
                    <div className="fd-expense-item__meta">
                      {CATEGORY_META[exp.category]?.label} · {new Date(exp.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <div className="fd-expense-item__right">
                    <div className="fd-expense-item__amount">${exp.amount.toLocaleString()}</div>
                    {exp.receiptUrl && (
                      <a href={exp.receiptUrl} target="_blank" rel="noreferrer" className="fd-expense-item__link">
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

      {/* ══ Add Expense Tab ══ */}
      {activeTab === 'add-expense' && (
        <div className="fd-section-card">
          <h3 className="fd-section-title">
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#4F46E5' }}>add_circle</span>
            Record New Expense
          </h3>
          <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 24, marginTop: 0 }}>
            Each expense is permanently recorded as a blockchain audit entry. This cannot be deleted or edited.
          </p>
          <form className="fd-expense-form" onSubmit={handleAddExpense}>
            <div className="fd-form-row">
              <div className="fd-form-field">
                <label className="fd-form-label">Category *</label>
                <select
                  className="fd-form-select"
                  value={expenseForm.category}
                  onChange={e => setExpenseForm(f => ({ ...f, category: e.target.value }))}
                >
                  {Object.entries(CATEGORY_META).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
              <div className="fd-form-field">
                <label className="fd-form-label">Amount (USD) *</label>
                <input
                  className="fd-form-input"
                  type="number"
                  min="1"
                  placeholder="e.g. 5000"
                  required
                  value={expenseForm.amount}
                  onChange={e => setExpenseForm(f => ({ ...f, amount: e.target.value }))}
                />
              </div>
            </div>
            <div className="fd-form-field">
              <label className="fd-form-label">Description</label>
              <input
                className="fd-form-input"
                placeholder="e.g. AWS hosting costs for Q1"
                value={expenseForm.description}
                onChange={e => setExpenseForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="fd-form-field">
              <label className="fd-form-label">Receipt / Invoice URL</label>
              <input
                className="fd-form-input"
                placeholder="Link to invoice or receipt document"
                value={expenseForm.receiptUrl}
                onChange={e => setExpenseForm(f => ({ ...f, receiptUrl: e.target.value }))}
              />
            </div>

            {submitMsg && (
              <div className="fd-submit-msg" style={{
                background: '#D1FAE5',
                color: '#065F46',
                border: '1px solid #A7F3D0',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check_circle</span>
                {submitMsg}
              </div>
            )}

            <button type="submit" className="fd-submit-btn">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>lock</span>
              Record Expense (Immutable Blockchain Entry)
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
