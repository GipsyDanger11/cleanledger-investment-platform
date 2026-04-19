import { useState } from 'react';
import { useInvestment } from '../../context/InvestmentContext';
import './WalletWidget.css';

/**
 * WalletWidget — displays the investor's or founder's virtual wallet balance.
 * Accepts `balance` as a number (₹ amount).
 */
export default function WalletWidget({ balance, compact = false }) {
  const { topUpWallet } = useInvestment();
  const [showTopUp, setShowTopUp] = useState(false);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatted = balance !== null && balance !== undefined
    ? `₹${Number(balance).toLocaleString('en-IN')}`
    : '—';

  const isLow = balance !== null && balance < 10000;

  const handleTopUp = async () => {
    const num = Number(amount);
    if (!num || num <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await topUpWallet(num);
      setShowTopUp(false);
      setAmount('');
    } catch (err) {
      setError(err.message || 'Top-up failed.');
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <div className={`wallet-badge ${isLow ? 'wallet-badge--low' : ''}`} id="wallet-badge-compact">
        <span className="wallet-badge__icon">💰</span>
        <span className="wallet-badge__amount">{formatted}</span>
      </div>
    );
  }

  return (
    <div className={`wallet-widget ${isLow ? 'wallet-widget--low' : ''}`} id="wallet-widget">
      <div className="wallet-widget__header">
        <span className="wallet-widget__icon">💰</span>
        <div style={{ flex: 1 }}>
          <p className="wallet-widget__label">Virtual Wallet</p>
          <p className="wallet-widget__disclaimer">Demo funds only — no real money</p>
        </div>
        {!compact && (
          <button 
            className="btn btn-secondary" 
            style={{ padding: '4px 8px', fontSize: '0.65rem' }}
            onClick={() => setShowTopUp(true)}
          >
            + Top Up
          </button>
        )}
      </div>
      <p className="wallet-widget__balance">{formatted}</p>
      <div className="wallet-widget__bar">
        <div
          className="wallet-widget__bar-fill"
          style={{ width: `${Math.min(100, ((balance ?? 0) / 100000) * 100)}%` }}
        />
      </div>
      <div className="flex justify-between items-center">
        <p className="wallet-widget__sub">of ₹1,00,000 initial allocation</p>
        {isLow && (
          <span className="wallet-widget__low-badge">Low Balance</span>
        )}
      </div>

      {showTopUp && (
        <div className="modal-overlay" onClick={() => setShowTopUp(false)}>
          <div className="modal-content" style={{ maxWidth: '360px' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3" style={{ marginBottom: 'var(--space-4)' }}>
              <span className="material-symbols-outlined" style={{ color: '#10b981', fontSize: '24px' }}>payments</span>
              <h2 className="text-title" style={{ margin: 0 }}>Top Up Wallet</h2>
            </div>
            
            <p className="text-body-sm text-secondary" style={{ marginBottom: 'var(--space-4)' }}>
              Add virtual funds to your developer wallet. No real money will be charged.
            </p>

            <label className="text-label-sm" style={{ display: 'block', marginBottom: '8px' }}>Amount (₹)</label>
            <input 
              type="number"
              className="input w-full"
              placeholder="e.g., 50000"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              style={{ marginBottom: 'var(--space-4)' }}
              onKeyDown={e => e.key === 'Enter' && handleTopUp()}
            />

            <div className="flex gap-2" style={{ flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
              {[10000, 50000, 100000].map(val => (
                <button
                  key={val}
                  className="chip chip--filter"
                  style={{ cursor: 'pointer', fontSize: '0.65rem' }}
                  onClick={() => setAmount(String(val))}
                >
                  +₹{val.toLocaleString('en-IN')}
                </button>
              ))}
            </div>

            {error && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginBottom: 'var(--space-4)' }}>{error}</p>}

            <div className="flex gap-3">
              <button 
                className="btn btn-primary w-full" 
                style={{ justifyContent: 'center' }}
                onClick={handleTopUp}
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Confirm Top Up'}
              </button>
              <button className="btn btn-secondary" onClick={() => setShowTopUp(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
