import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../utils/apiClient';
import './ProfileCompletion.css';

const STEPS = [
  { id: 1, title: 'Basic Info',      desc: 'Company details',       icon: 'business' },
  { id: 2, title: 'Team',            desc: 'Members & verification', icon: 'group' },
  { id: 3, title: 'Business Plan',   desc: 'Pitch & AI summary',     icon: 'description' },
  { id: 4, title: 'Fund Allocation', desc: 'Budget breakdown',       icon: 'pie_chart' },
  { id: 5, title: 'Milestones',      desc: '3-5 key milestones',     icon: 'flag' },
];

const CATEGORIES = ['FinTech','HealthTech','EdTech','AgriTech','CleanTech','SaaS','E-Commerce','Other'];
const SECTORS    = ['Technology','Healthcare','Education','Agriculture','Finance','Real Estate','Retail','Other'];
const TIMELINES  = ['6 months','12 months','18 months','24 months'];

export default function ProfileCompletion() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [score, setScore] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [startupId, setStartupId] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  // Form state per step
  const [basic, setBasic] = useState({
    name: '', category: 'FinTech', sector: 'Technology', geography: '',
    description: '', website: '', incorporationProofUrl: '',
  });

  const [team, setTeam] = useState([
    { name: '', role: '', linkedIn: '' },
  ]);

  const [plan, setPlan] = useState({ businessPlanUrl: '', pitchText: '', pitchDeckUrl: '' });

  const [funds, setFunds] = useState({
    fundingTarget: '', fundingTimeline: '12 months',
    tech: 25, marketing: 25, operations: 25, legal: 25,
  });

  const [milestones, setMilestones] = useState([
    { title: '', description: '', targetDate: '', successCriteria: '', tranchePct: 0 },
  ]);

  // Check existing startup profile
  useEffect(() => {
    apiClient.get('/startups/me/profile').then(res => {
      const s = res.data.data;
      setStartupId(s._id);
      setScore(s.profileCompletionScore || 0);
      setBasic(prev => ({ ...prev, name: s.name || '', category: s.category || 'FinTech',
        sector: s.sector || '', geography: s.geography || '', description: s.description || '',
        website: s.website || '', incorporationProofUrl: s.incorporationProofUrl || '' }));
      if (s.teamMembers?.length) setTeam(s.teamMembers);
      if (s.milestones?.length) setMilestones(s.milestones.map(m => ({
        title: m.title, description: m.description || '', targetDate: m.targetDate?.split('T')[0] || '',
        successCriteria: m.successCriteria || '', tranchePct: m.tranchePct || 0,
      })));
      if (s.fundAllocation) {
        setFunds(prev => ({ ...prev,
          fundingTarget: s.fundingTarget || '',
          fundingTimeline: s.fundingTimeline || '12 months',
          tech: s.fundAllocation.tech?.planned || 25,
          marketing: s.fundAllocation.marketing?.planned || 25,
          operations: s.fundAllocation.operations?.planned || 25,
          legal: s.fundAllocation.legal?.planned || 25,
        }));
      }
    }).catch(() => {});
  }, []);

  const totalFundPct = Number(funds.tech) + Number(funds.marketing) +
                       Number(funds.operations) + Number(funds.legal);

  const totalTranchePct = milestones.reduce((s, m) => s + Number(m.tranchePct || 0), 0);

  // ── Save current step ────────────────────────────────────
  const saveStep = async () => {
    setSaving(true); setError('');
    try {
      let payload = {};

      if (step === 1) {
        payload = { ...basic };
      } else if (step === 2) {
        payload = { teamMembers: team.filter(t => t.name.trim()) };
      } else if (step === 3) {
        payload = { businessPlanUrl: plan.businessPlanUrl, pitchDeckUrl: plan.pitchDeckUrl };
        if (aiAnalysis) payload.businessPlanSummary = aiAnalysis.summary;
      } else if (step === 4) {
        payload = {
          fundingTarget: Number(funds.fundingTarget),
          fundingTimeline: funds.fundingTimeline,
          fundAllocation: {
            tech:       { planned: Number(funds.tech) },
            marketing:  { planned: Number(funds.marketing) },
            operations: { planned: Number(funds.operations) },
            legal:      { planned: Number(funds.legal) },
          },
        };
      } else if (step === 5) {
        // Milestones saved individually
        for (const m of milestones.filter(m => m.title.trim())) {
          await apiClient.post(`/startups/${startupId}/milestones`, {
            title: m.title, description: m.description,
            targetDate: m.targetDate, successCriteria: m.successCriteria,
            tranchePct: Number(m.tranchePct),
          }).catch(() => {}); // May already exist
        }
        setSaving(false);
        navigate('/dashboard');
        return;
      }

      let res;
      if (!startupId) {
        payload.fundingTarget = payload.fundingTarget || 100000;
        res = await apiClient.post('/startups', payload);
        setStartupId(res.data.data._id);
      } else {
        res = await apiClient.patch(`/startups/${startupId}`, payload);
      }
      setScore(res.data.data.profileCompletionScore || score);
      setStep(s => s + 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save. Please try again.');
    } finally { setSaving(false); }
  };

  // ── AI Pitch Analyzer ────────────────────────────────────
  const analyzePitch = async () => {
    if (!plan.pitchText.trim()) return;
    setAiLoading(true); setAiAnalysis(null);
    try {
      const res = await fetch('http://localhost:5001/summarize-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: plan.pitchText }),
      });
      const data = await res.json();
      if (data.success) setAiAnalysis(data.analysis);
    } catch { setError('AI service unavailable. You can continue without analysis.'); }
    finally { setAiLoading(false); }
  };

  // ── Team helpers ─────────────────────────────────────────
  const addTeamMember = () => setTeam(t => [...t, { name: '', role: '', linkedIn: '' }]);
  const removeTeamMember = i => setTeam(t => t.filter((_, idx) => idx !== i));
  const updateTeam = (i, field, val) => setTeam(t => t.map((m, idx) => idx === i ? { ...m, [field]: val } : m));

  // ── Milestone helpers ────────────────────────────────────
  const addMilestone = () => {
    if (milestones.length >= 5) return;
    setMilestones(m => [...m, { title:'', description:'', targetDate:'', successCriteria:'', tranchePct:0 }]);
  };
  const removeMilestone = i => setMilestones(m => m.filter((_, idx) => idx !== i));
  const updateMilestone = (i, field, val) =>
    setMilestones(m => m.map((ms, idx) => idx === i ? { ...ms, [field]: val } : ms));

  // ── Score circle ─────────────────────────────────────────
  const r = 52; const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <div className="profile-page">
      {/* ── Blue Sidebar ── */}
      <aside className="profile-sidebar">
        <div className="profile-sidebar__logo">
          <div className="profile-sidebar__logo-mark">CL</div>
          <span className="profile-sidebar__logo-text">CleanLedger</span>
        </div>

        <div className="profile-score">
          <div className="profile-score__circle">
            <svg viewBox="0 0 120 120">
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#BBDEFB"/>
                  <stop offset="100%" stopColor="#FFFFFF"/>
                </linearGradient>
              </defs>
              <circle className="profile-score__bg" cx="60" cy="60" r={r}/>
              <circle className="profile-score__fill" cx="60" cy="60" r={r}
                strokeDasharray={circ} strokeDashoffset={offset}/>
            </svg>
            <div className="profile-score__value">
              <span className="profile-score__number">{score}</span>
              <span className="profile-score__label">Score</span>
            </div>
          </div>
          <p className="profile-score__text">
            {score >= 80 ? 'Excellent profile!' : score >= 50 ? 'Good progress, keep going!' : 'Keep adding details to build trust'}
          </p>
        </div>

        <div className="profile-steps">
          {STEPS.map(s => (
            <div key={s.id} className={`profile-step ${step === s.id ? 'profile-step--active' : ''} ${step > s.id ? 'profile-step--completed' : ''}`}
              onClick={() => step > s.id && setStep(s.id)}>
              <div className={`profile-step__indicator ${
                step === s.id ? 'profile-step__indicator--active' :
                step > s.id  ? 'profile-step__indicator--done' :
                                'profile-step__indicator--pending'}`}>
                {step > s.id
                  ? <span className="material-symbols-outlined" style={{fontSize:'16px'}}>check</span>
                  : s.id}
              </div>
              <div className="profile-step__info">
                <div className="profile-step__title">{s.title}</div>
                <div className="profile-step__desc">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <button className="profile-skip" onClick={() => navigate('/dashboard')}>
          <span className="material-symbols-outlined" style={{fontSize:'16px'}}>skip_next</span>
          Skip for now
        </button>
      </aside>

      {/* ── Main Content ── */}
      <main className="profile-main">
        <div className="profile-form-card">
          {error && (
            <div className="auth-error" style={{marginBottom:'16px'}}>
              <span className="material-symbols-outlined" style={{fontSize:'18px'}}>error</span>
              {error}
            </div>
          )}

          {/* ══ Step 1: Basic Info ══ */}
          {step === 1 && (
            <>
              <h2 className="profile-form__title">Company Information</h2>
              <p className="profile-form__subtitle">Tell investors about your startup. This is your public-facing profile.</p>
              <div className="profile-form">
                <div className="profile-row">
                  <div className="profile-field">
                    <label className="profile-field__label">Company Name *</label>
                    <input className="profile-field__input" placeholder="e.g. AgroTech Solutions"
                      value={basic.name} onChange={e => setBasic(b => ({...b, name: e.target.value}))}/>
                  </div>
                  <div className="profile-field">
                    <label className="profile-field__label">Category *</label>
                    <select className="profile-field__select" value={basic.category}
                      onChange={e => setBasic(b => ({...b, category: e.target.value}))}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="profile-row">
                  <div className="profile-field">
                    <label className="profile-field__label">Sector *</label>
                    <select className="profile-field__select" value={basic.sector}
                      onChange={e => setBasic(b => ({...b, sector: e.target.value}))}>
                      {SECTORS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="profile-field">
                    <label className="profile-field__label">Geography *</label>
                    <input className="profile-field__input" placeholder="e.g. India, SEA"
                      value={basic.geography} onChange={e => setBasic(b => ({...b, geography: e.target.value}))}/>
                  </div>
                </div>
                <div className="profile-field">
                  <label className="profile-field__label">Description *</label>
                  <textarea className="profile-field__textarea" rows={3}
                    placeholder="What problem do you solve? Who is your customer?"
                    value={basic.description} onChange={e => setBasic(b => ({...b, description: e.target.value}))}/>
                </div>
                <div className="profile-row">
                  <div className="profile-field">
                    <label className="profile-field__label">Website</label>
                    <input className="profile-field__input" placeholder="https://yourstartup.com"
                      value={basic.website} onChange={e => setBasic(b => ({...b, website: e.target.value}))}/>
                  </div>
                  <div className="profile-field">
                    <label className="profile-field__label">Incorporation Proof URL</label>
                    <input className="profile-field__input" placeholder="Link to incorporation doc"
                      value={basic.incorporationProofUrl} onChange={e => setBasic(b => ({...b, incorporationProofUrl: e.target.value}))}/>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ══ Step 2: Team ══ */}
          {step === 2 && (
            <>
              <h2 className="profile-form__title">Team Members</h2>
              <p className="profile-form__subtitle">Add your core team. LinkedIn profiles boost investor trust and your Profile Score.</p>
              <div className="profile-form">
                <div className="profile-team-list">
                  {team.map((member, i) => (
                    <div key={i} style={{border:'1px solid #E0E0E0', borderRadius:'12px', padding:'16px', marginBottom:'8px'}}>
                      <div className="profile-row" style={{marginBottom:'8px'}}>
                        <div className="profile-field">
                          <label className="profile-field__label">Name *</label>
                          <input className="profile-field__input" placeholder="Full name"
                            value={member.name} onChange={e => updateTeam(i,'name',e.target.value)}/>
                        </div>
                        <div className="profile-field">
                          <label className="profile-field__label">Role</label>
                          <input className="profile-field__input" placeholder="e.g. CTO, Co-Founder"
                            value={member.role} onChange={e => updateTeam(i,'role',e.target.value)}/>
                        </div>
                      </div>
                      <div style={{display:'flex', gap:'10px', alignItems:'flex-end'}}>
                        <div className="profile-field" style={{flex:1}}>
                          <label className="profile-field__label">LinkedIn URL</label>
                          <input className="profile-field__input" placeholder="https://linkedin.com/in/..."
                            value={member.linkedIn} onChange={e => updateTeam(i,'linkedIn',e.target.value)}/>
                        </div>
                        {team.length > 1 && (
                          <button className="profile-team-remove" onClick={() => removeTeamMember(i)}>
                            <span className="material-symbols-outlined" style={{fontSize:'16px'}}>close</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {team.length < 6 && (
                  <button className="profile-team-add" onClick={addTeamMember}>
                    <span className="material-symbols-outlined" style={{fontSize:'16px'}}>add</span>
                    Add Team Member
                  </button>
                )}
                <div className="alert-banner">
                  <span className="material-symbols-outlined" style={{fontSize:'18px',color:'#1976D2'}}>info</span>
                  <span style={{fontSize:'13px',color:'#333'}}>Adding 2+ team members with LinkedIn profiles earns +10 Profile Score points and builds investor confidence.</span>
                </div>
              </div>
            </>
          )}

          {/* ══ Step 3: Business Plan ══ */}
          {step === 3 && (
            <>
              <h2 className="profile-form__title">Business Plan & Pitch</h2>
              <p className="profile-form__subtitle">Paste your pitch or upload a link. Our AI will generate a summary for investors.</p>
              <div className="profile-form">
                <div className="profile-field">
                  <label className="profile-field__label">Pitch / Business Plan Text</label>
                  <textarea className="profile-field__textarea" rows={6}
                    placeholder="Paste your business plan, executive summary, or pitch text here. Our AI will analyze it for investors..."
                    value={plan.pitchText} onChange={e => setPlan(p => ({...p, pitchText: e.target.value}))}/>
                </div>
                <button className="auth-voice-btn" onClick={analyzePitch} disabled={aiLoading || !plan.pitchText.trim()}>
                  {aiLoading
                    ? <><span className="material-symbols-outlined" style={{fontSize:'18px',animation:'spin 1s linear infinite'}}>refresh</span> Analyzing...</>
                    : <><span className="material-symbols-outlined" style={{fontSize:'18px'}}>smart_toy</span> Analyze with AI</>}
                </button>

                {aiAnalysis && (
                  <div style={{background:'#F0F7FF', border:'1px solid #BBDEFB', borderRadius:'12px', padding:'16px'}}>
                    <div style={{fontWeight:700, color:'#1565C0', marginBottom:'8px', fontSize:'14px'}}>AI Analysis Complete</div>
                    <p style={{fontSize:'13px', color:'#333', lineHeight:1.6, marginBottom:'12px'}}>{aiAnalysis.summary}</p>
                    {aiAnalysis.keyPoints?.length > 0 && (
                      <div style={{marginBottom:'8px'}}>
                        <div style={{fontSize:'11px', fontWeight:700, color:'#555', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'6px'}}>Key Points</div>
                        {aiAnalysis.keyPoints.map((p, i) => (
                          <div key={i} style={{display:'flex', gap:'6px', fontSize:'12px', color:'#333', marginBottom:'4px'}}>
                            <span className="material-symbols-outlined" style={{fontSize:'14px',color:'#4CAF50'}}>check_circle</span>{p}
                          </div>
                        ))}
                      </div>
                    )}
                    {aiAnalysis.riskFlags?.length > 0 && (
                      <div>
                        <div style={{fontSize:'11px', fontWeight:700, color:'#555', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'6px'}}>Risk Flags</div>
                        {aiAnalysis.riskFlags.map((r, i) => (
                          <div key={i} style={{display:'flex', gap:'6px', fontSize:'12px', color:'#D32F2F', marginBottom:'4px'}}>
                            <span className="material-symbols-outlined" style={{fontSize:'14px',color:'#D32F2F'}}>warning</span>{r}
                          </div>
                        ))}
                      </div>
                    )}
                    <div style={{display:'flex', gap:'8px', marginTop:'12px', flexWrap:'wrap'}}>
                      <span style={{background:'#E3F2FD', color:'#1565C0', padding:'4px 10px', borderRadius:'999px', fontSize:'11px', fontWeight:600}}>
                        Viability: {aiAnalysis.viabilityScore}/100
                      </span>
                      <span style={{background:'#E8F5E9', color:'#2E7D32', padding:'4px 10px', borderRadius:'999px', fontSize:'11px', fontWeight:600}}>
                        {aiAnalysis.recommendedCategory}
                      </span>
                    </div>
                  </div>
                )}

                <div className="profile-row">
                  <div className="profile-field">
                    <label className="profile-field__label">Business Plan URL</label>
                    <input className="profile-field__input" placeholder="Google Drive / Notion link"
                      value={plan.businessPlanUrl} onChange={e => setPlan(p => ({...p, businessPlanUrl: e.target.value}))}/>
                  </div>
                  <div className="profile-field">
                    <label className="profile-field__label">Pitch Deck URL</label>
                    <input className="profile-field__input" placeholder="Slides link"
                      value={plan.pitchDeckUrl} onChange={e => setPlan(p => ({...p, pitchDeckUrl: e.target.value}))}/>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ══ Step 4: Fund Allocation ══ */}
          {step === 4 && (
            <>
              <h2 className="profile-form__title">Funding & Allocation Plan</h2>
              <p className="profile-form__subtitle">Set your funding goal and how you plan to allocate it. Total must equal 100%.</p>
              <div className="profile-form">
                <div className="profile-row">
                  <div className="profile-field">
                    <label className="profile-field__label">Funding Target (USD) *</label>
                    <input className="profile-field__input" type="number" placeholder="e.g. 500000"
                      value={funds.fundingTarget} onChange={e => setFunds(f => ({...f, fundingTarget: e.target.value}))}/>
                  </div>
                  <div className="profile-field">
                    <label className="profile-field__label">Timeline</label>
                    <select className="profile-field__select" value={funds.fundingTimeline}
                      onChange={e => setFunds(f => ({...f, fundingTimeline: e.target.value}))}>
                      {TIMELINES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{background:'#F5F7FA', borderRadius:'12px', padding:'16px'}}>
                  <div style={{fontWeight:700, fontSize:'13px', color:'#333', marginBottom:'12px'}}>
                    Budget Allocation — Total: <span style={{color: totalFundPct === 100 ? '#2E7D32' : '#D32F2F'}}>{totalFundPct}%</span>
                    {totalFundPct === 100 && <span className="material-symbols-outlined" style={{fontSize:'16px',color:'#4CAF50',marginLeft:'6px',verticalAlign:'middle'}}>check_circle</span>}
                  </div>
                  {[
                    { key:'tech', label:'Technology', color:'#1976D2' },
                    { key:'marketing', label:'Marketing', color:'#7B1FA2' },
                    { key:'operations', label:'Operations', color:'#E65100' },
                    { key:'legal', label:'Legal & Compliance', color:'#2E7D32' },
                  ].map(({ key, label, color }) => (
                    <div key={key} style={{marginBottom:'16px'}}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px'}}>
                        <label style={{fontSize:'12px', fontWeight:600, color:'#555'}}>{label}</label>
                        <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                          <input type="number" min="0" max="100"
                            style={{width:'60px', padding:'4px 8px', border:'1px solid #E0E0E0', borderRadius:'6px', fontSize:'13px', textAlign:'center'}}
                            value={funds[key]} onChange={e => setFunds(f => ({...f, [key]: Number(e.target.value)}))}/>
                          <span style={{fontSize:'12px', color:'#757575'}}>%</span>
                        </div>
                      </div>
                      <div style={{background:'#E0E0E0', borderRadius:'999px', height:'6px', overflow:'hidden'}}>
                        <div style={{width:`${Math.min(funds[key],100)}%`, height:'100%', background:color, borderRadius:'999px', transition:'width 0.3s ease'}}/>
                      </div>
                    </div>
                  ))}
                  {totalFundPct !== 100 && (
                    <div style={{display:'flex', gap:'6px', alignItems:'center', color:'#D32F2F', fontSize:'12px'}}>
                      <span className="material-symbols-outlined" style={{fontSize:'14px'}}>warning</span>
                      Percentages must add up to exactly 100%
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ══ Step 5: Milestones ══ */}
          {step === 5 && (
            <>
              <h2 className="profile-form__title">Funding Milestones</h2>
              <p className="profile-form__subtitle">Define 3–5 milestones. Each has a fund tranche % that releases when investors approve it.</p>
              <div className="profile-form">
                {milestones.map((m, i) => (
                  <div key={i} style={{border:'1px solid #E0E0E0', borderRadius:'12px', padding:'16px', position:'relative'}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px'}}>
                      <span style={{fontWeight:700, fontSize:'13px', color:'#1565C0'}}>Milestone {i + 1}</span>
                      {milestones.length > 1 && (
                        <button className="profile-team-remove" onClick={() => removeMilestone(i)}>
                          <span className="material-symbols-outlined" style={{fontSize:'16px'}}>close</span>
                        </button>
                      )}
                    </div>
                    <div className="profile-row" style={{marginBottom:'10px'}}>
                      <div className="profile-field">
                        <label className="profile-field__label">Title *</label>
                        <input className="profile-field__input" placeholder="e.g. MVP Launch"
                          value={m.title} onChange={e => updateMilestone(i,'title',e.target.value)}/>
                      </div>
                      <div className="profile-field">
                        <label className="profile-field__label">Target Date</label>
                        <input className="profile-field__input" type="date"
                          value={m.targetDate} onChange={e => updateMilestone(i,'targetDate',e.target.value)}/>
                      </div>
                    </div>
                    <div className="profile-field" style={{marginBottom:'10px'}}>
                      <label className="profile-field__label">Success Criteria</label>
                      <input className="profile-field__input" placeholder="e.g. 100 paying customers, $50k MRR"
                        value={m.successCriteria} onChange={e => updateMilestone(i,'successCriteria',e.target.value)}/>
                    </div>
                    <div className="profile-row">
                      <div className="profile-field">
                        <label className="profile-field__label">Description</label>
                        <input className="profile-field__input" placeholder="What will be achieved?"
                          value={m.description} onChange={e => updateMilestone(i,'description',e.target.value)}/>
                      </div>
                      <div className="profile-field">
                        <label className="profile-field__label">Tranche % of Funding</label>
                        <input className="profile-field__input" type="number" min="0" max="100"
                          placeholder="e.g. 25"
                          value={m.tranchePct} onChange={e => updateMilestone(i,'tranchePct',e.target.value)}/>
                      </div>
                    </div>
                  </div>
                ))}

                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  {milestones.length < 5 && (
                    <button className="profile-team-add" onClick={addMilestone}>
                      <span className="material-symbols-outlined" style={{fontSize:'16px'}}>add</span>
                      Add Milestone ({milestones.length}/5)
                    </button>
                  )}
                  <span style={{fontSize:'12px', color: totalTranchePct === 100 ? '#2E7D32' : '#D32F2F', fontWeight:600, marginLeft:'auto'}}>
                    Total Tranche: {totalTranchePct}% {totalTranchePct === 100 ? '✓' : '(should equal 100%)'}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* ── Navigation ── */}
          <div className="profile-nav">
            {step > 1 && (
              <button className="profile-nav__btn profile-nav__btn--back" onClick={() => setStep(s => s - 1)}>
                <span className="material-symbols-outlined" style={{fontSize:'18px'}}>arrow_back</span> Back
              </button>
            )}
            {step < 5 && (
              <button className="profile-nav__btn profile-nav__btn--next"
                onClick={saveStep} disabled={saving || (step === 4 && totalFundPct !== 100)}>
                {saving ? 'Saving...' : 'Save & Continue'}
                <span className="material-symbols-outlined" style={{fontSize:'18px'}}>arrow_forward</span>
              </button>
            )}
            {step === 5 && (
              <button className="profile-nav__btn profile-nav__btn--finish" onClick={saveStep} disabled={saving}>
                {saving ? 'Saving...' : 'Complete Profile'}
                <span className="material-symbols-outlined" style={{fontSize:'18px'}}>check</span>
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
