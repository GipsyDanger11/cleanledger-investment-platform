import { useState, useEffect } from 'react';
import apiClient from '../utils/apiClient';
import './TrustScorePanel.css';

const RISK_META = {
  LOW:    { label: 'LOW RISK',    color: '#2E7D32', bg: '#E8F5E9', border: '#C8E6C9', dot: '#4CAF50' },
  MEDIUM: { label: 'MEDIUM RISK', color: '#E65100', bg: '#FFF3E0', border: '#FFCC80', dot: '#FF9800' },
  HIGH:   { label: 'HIGH RISK',   color: '#C62828', bg: '#FFEBEE', border: '#FFCDD2', dot: '#F44336' },
};

const SCORE_BARS = [
  { key: 'profileScore',   label: 'Profile Completeness', weight: '25%', color: '#1976D2' },
  { key: 'milestoneScore', label: 'Milestone Performance', weight: '30%', color: '#7B1FA2' },
  { key: 'fundAccuracy',   label: 'Fund Usage Accuracy',   weight: '25%', color: '#2E7D32' },
  { key: 'sentimentScore', label: 'Investor Sentiment',    weight: '20%', color: '#E65100' },
];

// SVG sparkline from score history
function Sparkline({ history }) {
  if (!history || history.length < 2) return null;
  const pts = history.slice(-12);
  const scores = pts.map(p => p.score);
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const range = max - min || 1;
  const W = 200, H = 48, PAD = 4;

  const points = pts.map((p, i) => {
    const x = PAD + (i / (pts.length - 1)) * (W - PAD * 2);
    const y = H - PAD - ((p.score - min) / range) * (H - PAD * 2);
    return `${x},${y}`;
  }).join(' ');

  const last = scores[scores.length - 1];
  const prev = scores[scores.length - 2];
  const trend = last >= prev ? '#4CAF50' : '#F44336';
  const arrow = last >= prev ? '▲' : '▼';

  return (
    <div className="tsp-sparkline">
      <div className="tsp-sparkline__header">
        <span style={{ fontSize: '11px', color: '#757575', fontWeight: 600 }}>30-DAY TREND</span>
        <span style={{ fontSize: '12px', color: trend, fontWeight: 700 }}>{arrow} {last}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="tsp-sparkline__svg">
        <defs>
          <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={trend} stopOpacity="0.2" />
            <stop offset="100%" stopColor={trend} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline points={points} fill="none" stroke={trend} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => {
          const x = PAD + (i / (pts.length - 1)) * (W - PAD * 2);
          const y = H - PAD - ((p.score - min) / range) * (H - PAD * 2);
          return i === pts.length - 1
            ? <circle key={i} cx={x} cy={y} r="3" fill={trend} />
            : null;
        })}
      </svg>
    </div>
  );
}

export default function TrustScorePanel({ startupId, compact = false }) {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [computing, setComputing] = useState(false);

  const fetchData = async () => {
    if (!startupId) return;
    try {
      const [scoreRes, histRes] = await Promise.all([
        apiClient.get(`/trust/${startupId}/trust-score`),
        apiClient.get(`/trust/${startupId}/trust-history`),
      ]);
      setData(scoreRes.data.data);
      setHistory(histRes.data.data?.history || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [startupId]);

  const recompute = async () => {
    setComputing(true);
    try {
      await apiClient.post(`/trust/${startupId}/compute-trust-score`, { reason: 'manual refresh' });
      await fetchData();
    } catch { /* silent */ }
    finally { setComputing(false); }
  };

  if (loading) return <div className="tsp-loading">Loading trust score...</div>;
  if (!data)   return null;

  const risk = RISK_META[data.riskLevel] || RISK_META.MEDIUM;
  const sc   = data.scoreComponents || {};

  // SVG gauge params
  const R = 54, circ = 2 * Math.PI * R;
  const offset = circ - (data.trustScore / 100) * circ;
  const gaugeColor = data.riskLevel === 'LOW' ? '#4CAF50' : data.riskLevel === 'MEDIUM' ? '#FF9800' : '#F44336';

  if (compact) {
    return (
      <div className="tsp-compact" style={{ borderColor: risk.border, background: risk.bg }}>
        <div className="tsp-compact__score" style={{ color: gaugeColor }}>{data.trustScore}</div>
        <div className="tsp-compact__label">Trust Score</div>
        <div className="tsp-compact__badge" style={{ background: risk.bg, color: risk.color, border: `1px solid ${risk.border}` }}>
          <span className="tsp-dot" style={{ background: risk.dot }} />
          {risk.label}
        </div>
      </div>
    );
  }

  return (
    <div className="tsp-panel">
      {/* ── Header ── */}
      <div className="tsp-header">
        <div className="tsp-header__left">
          <h3 className="tsp-title">Trust & Credibility Score</h3>
          <span className="tsp-subtitle">R4 — Real-time Risk Assessment</span>
        </div>
        <button className="tsp-refresh" onClick={recompute} disabled={computing} title="Recompute score">
          <span className="material-symbols-outlined" style={{ fontSize: '16px', animation: computing ? 'spin 1s linear infinite' : 'none' }}>refresh</span>
          {computing ? 'Computing...' : 'Recompute'}
        </button>
      </div>

      {/* ── Score + Risk Level ── */}
      <div className="tsp-top">
        {/* Gauge */}
        <div className="tsp-gauge">
          <svg viewBox="0 0 128 128">
            <circle className="tsp-gauge__bg"   cx="64" cy="64" r={R} />
            <circle className="tsp-gauge__fill" cx="64" cy="64" r={R}
              strokeDasharray={circ} strokeDashoffset={offset}
              stroke={gaugeColor} />
          </svg>
          <div className="tsp-gauge__value">
            <span className="tsp-gauge__number" style={{ color: gaugeColor }}>{data.trustScore}</span>
            <span className="tsp-gauge__label">/ 100</span>
          </div>
        </div>

        {/* Badges */}
        <div className="tsp-badges">
          <div className="tsp-risk-badge" style={{ background: risk.bg, color: risk.color, border: `1px solid ${risk.border}` }}>
            <span className="tsp-dot" style={{ background: risk.dot }} />
            {risk.label}
          </div>

          <div className="tsp-kpi-row">
            <div className="tsp-kpi">
              <div className="tsp-kpi__value">{data.credibilityIndex}</div>
              <div className="tsp-kpi__label">Credibility Index</div>
            </div>
            <div className="tsp-kpi">
              <div className="tsp-kpi__value">{data.pitchQualityScore?.toFixed(1) || '—'}<span style={{fontSize:'12px'}}>/10</span></div>
              <div className="tsp-kpi__label">Pitch Quality</div>
            </div>
            <div className="tsp-kpi">
              <div className="tsp-kpi__value" style={{ textTransform: 'capitalize', fontSize: '13px' }}>
                {data.verificationStatus?.replace('_', ' ') || 'unverified'}
              </div>
              <div className="tsp-kpi__label">Verification</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Score Component Bars ── */}
      <div className="tsp-components">
        <div className="tsp-components__title">Score Breakdown</div>
        {SCORE_BARS.map(bar => (
          <div key={bar.key} className="tsp-bar-row">
            <div className="tsp-bar-row__info">
              <span className="tsp-bar-row__label">{bar.label}</span>
              <span className="tsp-bar-row__weight">{bar.weight}</span>
            </div>
            <div className="tsp-bar-row__track">
              <div className="tsp-bar-row__fill" style={{ width: `${sc[bar.key] || 0}%`, background: bar.color }} />
            </div>
            <span className="tsp-bar-row__val" style={{ color: bar.color }}>{sc[bar.key] || 0}%</span>
          </div>
        ))}
      </div>

      {/* ── Sparkline ── */}
      {history.length >= 2 && <Sparkline history={history} />}
    </div>
  );
}
