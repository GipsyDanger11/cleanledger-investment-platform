import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../utils/apiClient';
import './CommunicationHub.css';

const TABS = [
  { id: 'qa',            label: 'Q&A',           icon: 'forum' },
  { id: 'announcements', label: 'Announcements',  icon: 'campaign' },
];

export default function CommunicationHub() {
  const { id: startupIdParam } = useParams();
  const { user } = useAuth();
  const [startupId, setStartupId] = useState(startupIdParam || null);
  const [startupName, setStartupName] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [tab, setTab] = useState('qa');
  const [loading, setLoading] = useState(true);
  const [qa, setQA] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [questionText, setQuestionText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');
  const [pinAnnouncement, setPinAnnouncement] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const [answeringId, setAnsweringId] = useState(null);
  const [answerText, setAnswerText] = useState('');

  // Load startup identity
  useEffect(() => {
    const init = async () => {
      try {
        let sid = startupIdParam;
        if (!sid) {
          const me = await apiClient.get('/startups/me/profile');
          sid = me.data.data._id;
          setIsOwner(true);
          setStartupName(me.data.data.name);
        } else {
          const s = await apiClient.get(`/startups/${sid}`);
          setStartupName(s.data.data.name);
          setIsOwner(s.data.data.createdBy === user?._id);
        }
        setStartupId(sid);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    init();
  }, [startupIdParam]);

  // Fetch Q&A and announcements
  const fetchQA = async (sid) => {
    try {
      const res = await apiClient.get(`/startups/${sid}/qa`);
      setQA(res.data.data || []);
    } catch { /* silent */ }
  };

  const fetchAnnouncements = async (sid) => {
    try {
      const res = await apiClient.get(`/startups/${sid}/announcements`);
      setAnnouncements(res.data.data || []);
    } catch { /* silent */ }
  };

  useEffect(() => {
    if (!startupId) return;
    fetchQA(startupId);
    fetchAnnouncements(startupId);
    // Poll every 30 seconds (G3 notification engine)
    const interval = setInterval(() => {
      fetchQA(startupId);
      fetchAnnouncements(startupId);
    }, 30000);
    return () => clearInterval(interval);
  }, [startupId]);

  const handlePostQuestion = async () => {
    if (!questionText.trim()) return;
    setSubmitting(true); setMsg('');
    try {
      await apiClient.post(`/startups/${startupId}/qa`, {
        question: questionText.trim(), isAnonymous,
      });
      setMsg('Question submitted!');
      setQuestionText('');
      await fetchQA(startupId);
    } catch (err) { setMsg(err.response?.data?.message || 'Failed to submit.'); }
    finally { setSubmitting(false); }
  };

  const handleAnswer = async (qid) => {
    if (!answerText.trim()) return;
    setSubmitting(true);
    try {
      await apiClient.post(`/startups/${startupId}/qa/${qid}/answer`, { answer: answerText.trim() });
      setAnsweringId(null); setAnswerText('');
      await fetchQA(startupId);
    } catch { /* silent */ }
    finally { setSubmitting(false); }
  };

  const handlePostAnnouncement = async () => {
    if (!announcementText.trim()) return;
    setSubmitting(true); setMsg('');
    try {
      await apiClient.post(`/startups/${startupId}/announcements`, {
        content: announcementText.trim(), pinned: pinAnnouncement,
      });
      setMsg('Announcement posted! Investors have been notified.');
      setAnnouncementText(''); setPinAnnouncement(false);
      await fetchAnnouncements(startupId);
    } catch (err) { setMsg(err.response?.data?.message || 'Failed to post.'); }
    finally { setSubmitting(false); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  if (loading) return <div className="ch-loading"><span className="material-symbols-outlined fd-spin">refresh</span> Loading...</div>;

  return (
    <div className="communication-hub">
      {/* ── Header ── */}
      <div className="ch-header">
        <div>
          <h1 className="ch-header__title">Communication Hub</h1>
          <p className="ch-header__sub">{startupName} — Investor Relations (G3)</p>
        </div>
        <div className="ch-header__badge">
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>wifi</span>
          Live · Auto-refresh 30s
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="ch-tabs">
        {TABS.map(t => (
          <button key={t.id} className={`ch-tab ${tab === t.id ? 'ch-tab--active' : ''}`}
            onClick={() => { setTab(t.id); setMsg(''); }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{t.icon}</span>
            {t.label}
            {t.id === 'qa' && qa.filter(q => !q.isAnswered).length > 0 && (
              <span className="ch-badge">{qa.filter(q => !q.isAnswered).length}</span>
            )}
          </button>
        ))}
      </div>

      {msg && (
        <div className="ch-msg" style={{
          background: msg.includes('!') ? '#E8F5E9' : '#FFEBEE',
          color: msg.includes('!') ? '#2E7D32' : '#D32F2F',
          border: `1px solid ${msg.includes('!') ? '#C8E6C9' : '#FFCDD2'}`,
        }}>{msg}</div>
      )}

      {/* ══════════ Q & A TAB ══════════ */}
      {tab === 'qa' && (
        <div className="ch-content">
          {/* Ask form (investors) */}
          {!isOwner && (
            <div className="ch-compose">
              <h3 className="ch-compose__title">
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#1976D2' }}>help</span>
                Ask a Question
              </h3>
              <textarea className="ch-compose__textarea" rows={3}
                placeholder="Ask investors or the startup team a question..."
                value={questionText} onChange={e => setQuestionText(e.target.value)} />
              <div className="ch-compose__footer">
                <label className="ch-anon-toggle">
                  <input type="checkbox" checked={isAnonymous}
                    onChange={e => setIsAnonymous(e.target.checked)} />
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: isAnonymous ? '#1976D2' : '#BDBDBD' }}>
                    {isAnonymous ? 'visibility_off' : 'visibility'}
                  </span>
                  Post anonymously
                </label>
                <button className="ch-submit-btn" onClick={handlePostQuestion}
                  disabled={submitting || !questionText.trim()}>
                  {submitting ? 'Posting...' : 'Submit Question'}
                </button>
              </div>
            </div>
          )}

          {/* Q&A list */}
          <div className="ch-list">
            {qa.length === 0 && (
              <div className="ch-empty">
                <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#E0E0E0' }}>forum</span>
                <p>No questions yet. Be the first to ask!</p>
              </div>
            )}
            {qa.map((q) => (
              <div key={q._id} className={`ch-qa-item ${q.isAnswered ? 'ch-qa-item--answered' : ''}`}>
                <div className="ch-qa-item__question">
                  <div className="ch-qa-item__meta">
                    <div className="ch-avatar" style={{ background: q.isAnonymous ? '#F0F0F0' : '#E3F2FD' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px', color: q.isAnonymous ? '#9E9E9E' : '#1976D2' }}>
                        {q.isAnonymous ? 'person_off' : 'person'}
                      </span>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#333' }}>
                        {q.isAnonymous ? 'Anonymous Investor' : (q.author?.name || 'Investor')}
                      </div>
                      <div style={{ fontSize: '11px', color: '#9E9E9E' }}>{formatDate(q.createdAt)}</div>
                    </div>
                    {!q.isAnswered && (
                      <span style={{ marginLeft: 'auto', fontSize: '10px', background: '#FFF3E0', color: '#E65100', padding: '3px 8px', borderRadius: '999px', fontWeight: 700 }}>
                        Awaiting Answer
                      </span>
                    )}
                  </div>
                  <p className="ch-qa-item__text">{q.question}</p>
                </div>

                {/* Answer */}
                {q.isAnswered && (
                  <div className="ch-qa-item__answer">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#2E7D32' }}>verified</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#2E7D32' }}>Official Answer</span>
                      <span style={{ fontSize: '11px', color: '#9E9E9E', marginLeft: 'auto' }}>{formatDate(q.answeredAt)}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#333', lineHeight: 1.6, margin: 0 }}>{q.answer}</p>
                  </div>
                )}

                {/* Answer form for owner */}
                {isOwner && !q.isAnswered && (
                  answeringId === q._id ? (
                    <div className="ch-answer-form">
                      <textarea className="ch-compose__textarea" rows={2}
                        placeholder="Type your answer..."
                        value={answerText} onChange={e => setAnswerText(e.target.value)} />
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <button className="ch-submit-btn" onClick={() => handleAnswer(q._id)} disabled={submitting || !answerText.trim()}>
                          {submitting ? 'Posting...' : 'Post Answer'}
                        </button>
                        <button className="ch-cancel-btn" onClick={() => { setAnsweringId(null); setAnswerText(''); }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button className="ch-answer-trigger" onClick={() => setAnsweringId(q._id)}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>reply</span>
                      Answer this question
                    </button>
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════ ANNOUNCEMENTS TAB ══════════ */}
      {tab === 'announcements' && (
        <div className="ch-content">
          {/* Post form (owner only) */}
          {isOwner && (
            <div className="ch-compose">
              <h3 className="ch-compose__title">
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#1976D2' }}>campaign</span>
                Post Announcement
              </h3>
              <textarea className="ch-compose__textarea" rows={4}
                placeholder="Share an official update with all your investors..."
                value={announcementText} onChange={e => setAnnouncementText(e.target.value)} />
              <div className="ch-compose__footer">
                <label className="ch-anon-toggle">
                  <input type="checkbox" checked={pinAnnouncement}
                    onChange={e => setPinAnnouncement(e.target.checked)} />
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: pinAnnouncement ? '#1976D2' : '#BDBDBD' }}>push_pin</span>
                  Pin this update
                </label>
                <button className="ch-submit-btn" onClick={handlePostAnnouncement}
                  disabled={submitting || !announcementText.trim()}>
                  {submitting ? 'Posting...' : '📢 Notify Investors'}
                </button>
              </div>
            </div>
          )}

          {/* Announcements list */}
          <div className="ch-list">
            {announcements.length === 0 && (
              <div className="ch-empty">
                <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#E0E0E0' }}>campaign</span>
                <p>No announcements yet. Founders can post official updates here.</p>
              </div>
            )}
            {announcements.map((a) => (
              <div key={a._id} className={`ch-announcement ${a.pinned ? 'ch-announcement--pinned' : ''}`}>
                <div className="ch-announcement__header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {a.pinned && (
                      <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#1976D2' }}>push_pin</span>
                    )}
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#111' }}>{startupName}</span>
                    <span style={{ fontSize: '10px', background: '#E3F2FD', color: '#1565C0', padding: '2px 8px', borderRadius: '999px', fontWeight: 700 }}>
                      Official Update
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#9E9E9E' }}>{formatDate(a.createdAt)}</span>
                </div>
                <p className="ch-announcement__body">{a.content}</p>
                {a.likeCount > 0 && (
                  <div style={{ fontSize: '11px', color: '#9E9E9E', marginTop: '8px' }}>
                    👍 {a.likeCount} investor{a.likeCount > 1 ? 's' : ''} found this helpful
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
