import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useInvestment } from '../context/InvestmentContext';
import { useAuth } from '../context/AuthContext';
import './CommunicationHub.css';

const TABS = [
  { id: 'qa',            label: 'Q&A',            icon: 'forum',    desc: 'Anonymous Q&A' },
  { id: 'announcements', label: 'Announcements',  icon: 'campaign', desc: 'Official updates' },
  { id: 'milestones',    label: 'Milestone Chat',icon: 'flag',      desc: 'Voting comments' },
  { id: 'notifications', label: 'Notifications', icon: 'notifications', desc: 'Push alerts' },
];

const NOTIF_TYPE_COLOR = {
  vote_request: { bg: '#EDE9FE', color: '#6D28D9', icon: 'how_to_vote' },
  milestone_update: { bg: '#FEF3C7', color: '#D97706', icon: 'flag' },
  qa_answer: { bg: '#DBEAFE', color: '#1D4ED8', icon: 'forum' },
  fund_release: { bg: '#D1FAE5', color: '#065F46', icon: 'account_balance' },
  announcement: { bg: '#FEE2E2', color: '#DC2626', icon: 'campaign' },
  variance_alert: { bg: '#FEF9C3', color: '#CA8A04', icon: 'warning' },
  milestone_comment: { bg: '#E0E7FF', color: '#4338CA', icon: 'comment' },
  default:   { bg: '#F3F4F6', color: '#374151', icon: 'notifications' },
};

function formatDate(d) {
  if (!d) return '';
  const dt = new Date(d);
  const now = new Date();
  const diff = now - dt;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function CommunicationHub() {
  const { id: routeStartupId } = useParams();
  const { user } = useAuth();
  const {
    startups,
    myStartup,
    fetchMyStartup,
    notifications,
    fetchStartups,
    fetchNotifications,
    fetchQA,
    fetchAnnouncements,
    fetchMilestoneComments,
    askQuestion,
    answerQuestion,
    postAnnouncement,
    postMilestoneComment,
  } = useInvestment();

  const [tab, setTab]                     = useState('qa');
  const [selectedStartupId, setSelectedStartupId] = useState('');
  const [qa, setQa] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [milestoneComments, setMilestoneComments] = useState({});
  const [questionText, setQuestionText]   = useState('');
  const [isAnonymous, setIsAnonymous]     = useState(false);
  const [answeringId, setAnsweringId]     = useState(null);
  const [answerText, setAnswerText]       = useState('');
  const [annText, setAnnText]             = useState('');
  const [pinAnn, setPinAnn]               = useState(false);
  const [milestoneCommentText, setMilestoneCommentText] = useState('');
  const [commentMilestoneId, setCommentMilestoneId]     = useState(null);
  const [commentAnonymous, setCommentAnonymous]         = useState(false);
  const [msg, setMsg]                     = useState('');
  const [submitting, setSubmitting]       = useState(false);
  const [notifFilter, setNotifFilter]     = useState('all');

  const isFounder = user?.role === 'startup';
  const hubStartups = useMemo(() => {
    if (!isFounder) return startups;
    if (myStartup) return [myStartup];
    const owned = (startups || []).filter((s) => String(s.createdBy) === String(user?._id));
    return owned.length ? owned : [];
  }, [isFounder, myStartup, startups, user?._id]);

  useEffect(() => {
    fetchStartups();
    fetchNotifications();
  }, [fetchStartups, fetchNotifications]);

  useEffect(() => {
    if (isFounder) fetchMyStartup();
  }, [isFounder, fetchMyStartup]);

  useEffect(() => {
    if (routeStartupId && hubStartups.some((s) => String(s._id) === String(routeStartupId))) {
      setSelectedStartupId(String(routeStartupId));
      return;
    }
    if (!selectedStartupId && hubStartups.length > 0) {
      setSelectedStartupId(hubStartups[0]._id);
    }
  }, [routeStartupId, hubStartups, selectedStartupId]);

  const startup = hubStartups.find((s) => String(s._id) === String(selectedStartupId)) || hubStartups[0];
  const milestones = startup?.milestones || [];

  useEffect(() => {
    if (!selectedStartupId) return;
    const load = async () => {
      const [qaData, annData] = await Promise.all([
        fetchQA(selectedStartupId),
        fetchAnnouncements(selectedStartupId),
      ]);
      setQa(qaData || []);
      setAnnouncements(annData || []);

      const ms = hubStartups.find((s) => String(s._id) === String(selectedStartupId))?.milestones || [];
      const comments = {};
      for (const m of ms) {
        if (m._id) {
          comments[m._id] = await fetchMilestoneComments(selectedStartupId, m._id);
        }
      }
      setMilestoneComments(comments);
    };
    load();
  }, [selectedStartupId, fetchQA, fetchAnnouncements, fetchMilestoneComments, hubStartups, milestones.length]);

  const unansweredCount = qa.filter(q => !q.isAnswered).length;
  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifs = notifFilter === 'all'
    ? notifications
    : notifications.filter(n => n.type === notifFilter);

  const handlePostQuestion = async () => {
    if (!questionText.trim()) return;
    setSubmitting(true);
    try {
      await askQuestion(selectedStartupId, questionText.trim(), isAnonymous);
      setQa(await fetchQA(selectedStartupId));
      setMsg('Question posted!');
      setQuestionText('');
      setIsAnonymous(false);
      setTimeout(() => setMsg(''), 3000);
    } catch (e) {
      setMsg(e?.message || 'Could not post question');
      setTimeout(() => setMsg(''), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnswer = async (qid) => {
    if (!answerText.trim()) return;
    setSubmitting(true);
    try {
      await answerQuestion(selectedStartupId, qid, answerText.trim());
      setQa(await fetchQA(selectedStartupId));
      if (isFounder) await fetchMyStartup();
      setAnsweringId(null);
      setAnswerText('');
      setMsg('Answer posted!');
      setTimeout(() => setMsg(''), 3000);
    } catch (e) {
      setMsg(e?.message || 'Could not post answer');
      setTimeout(() => setMsg(''), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePostAnnouncement = async () => {
    if (!annText.trim()) return;
    setSubmitting(true);
    try {
      await postAnnouncement(selectedStartupId, annText.trim(), pinAnn);
      setAnnouncements(await fetchAnnouncements(selectedStartupId));
      if (isFounder) await fetchMyStartup();
      setAnnText('');
      setPinAnn(false);
      setMsg('Announcement posted! Investors notified.');
      setTimeout(() => setMsg(''), 3000);
    } catch (e) {
      setMsg(e?.message || 'Could not post announcement');
      setTimeout(() => setMsg(''), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMilestoneComment = async (milestoneId) => {
    if (!milestoneCommentText.trim()) return;
    setSubmitting(true);
    try {
      await postMilestoneComment(selectedStartupId, milestoneId, milestoneCommentText.trim());
      const fresh = await fetchMilestoneComments(selectedStartupId, milestoneId);
      setMilestoneComments((prev) => ({ ...prev, [milestoneId]: fresh || [] }));
      setCommentMilestoneId(null);
      setMilestoneCommentText('');
      setCommentAnonymous(false);
      setMsg('Comment added!');
      setTimeout(() => setMsg(''), 3000);
    } catch (e) {
      setMsg(e?.message || 'Could not post comment');
      setTimeout(() => setMsg(''), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const markAllRead = () => {
    // handled in Dashboard + notifications endpoint; this tab is read-only
  };

  if (isFounder && hubStartups.length === 0) {
    return (
      <div className="ch2-root">
        <main className="ch2-content" style={{ maxWidth: 560, margin: '0 auto', padding: 32 }}>
          <p className="text-body-md text-secondary" style={{ margin: 0 }}>
            Create or finish your startup profile to use Q&amp;A, announcements, and milestone chat.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="ch2-root">
      {/* ── Sidebar ── */}
      <aside className="ch2-sidebar">
        <div className="ch2-sidebar__title">
          <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#6366F1' }}>hub</span>
          Communication Hub
          <span className="ch2-tag">G3</span>
        </div>

        {/* Startup selector */}
        <div className="ch2-startup-select">
          <label className="ch2-label">Viewing Startup</label>
          <select
            className="ch2-select"
            value={selectedStartupId}
            onChange={e => setSelectedStartupId(e.target.value)}
          >
            {hubStartups.map(s => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Nav tabs */}
        <nav className="ch2-nav">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`ch2-nav-btn ${tab === t.id ? 'active' : ''}`}
              onClick={() => { setTab(t.id); setMsg(''); }}
            >
              <span className="material-symbols-outlined ch2-nav-icon">{t.icon}</span>
              <div className="ch2-nav-text">
                <span className="ch2-nav-label">{t.label}</span>
                <span className="ch2-nav-desc">{t.desc}</span>
              </div>
              {t.id === 'qa' && unansweredCount > 0 && (
                <span className="ch2-badge ch2-badge--orange">{unansweredCount}</span>
              )}
              {t.id === 'notifications' && unreadCount > 0 && (
                <span className="ch2-badge ch2-badge--red">{unreadCount}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Live indicator */}
        <div className="ch2-live-pill">
          <span className="ch2-live-dot" />
          Live · Local state
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="ch2-content">
        {/* Header */}
        <div className="ch2-header">
          <div>
            <h1 className="ch2-header__title">
              {TABS.find(t => t.id === tab)?.label}
            </h1>
            <p className="ch2-header__sub">
              {startup?.name} — {TABS.find(t => t.id === tab)?.desc}
            </p>
          </div>
          {startup?.verificationStatus === 'verified' && (
            <span className="ch2-verified-badge">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>verified</span>
              KYB Verified
            </span>
          )}
        </div>

        {/* Toast message */}
        {msg && (
          <div className={`ch2-toast ${msg.includes('!') ? 'ch2-toast--success' : 'ch2-toast--warn'}`}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
              {msg.includes('!') ? 'check_circle' : 'info'}
            </span>
            {msg}
          </div>
        )}

        {/* ══════ Q&A TAB ══════ */}
        {tab === 'qa' && (
          <div className="ch2-section">
            {/* Post question (investors) */}
            {!isFounder && (
              <div className="ch2-compose-card">
                <div className="ch2-compose-card__title">
                  <span className="material-symbols-outlined" style={{ color: '#6366F1' }}>help</span>
                  Ask a Question
                  <span className="ch2-compose-tag">Anonymous option available</span>
                </div>
                <textarea
                  className="ch2-textarea"
                  rows={3}
                  placeholder="Ask about financials, milestones, team, technology…"
                  value={questionText}
                  onChange={e => setQuestionText(e.target.value)}
                />
                <div className="ch2-compose-footer">
                  <label className="ch2-toggle-label">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={e => setIsAnonymous(e.target.checked)}
                    />
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 16, color: isAnonymous ? '#6366F1' : '#9CA3AF' }}
                    >
                      {isAnonymous ? 'visibility_off' : 'visibility'}
                    </span>
                    Post anonymously
                  </label>
                  <button
                    className="ch2-btn ch2-btn--primary"
                    onClick={handlePostQuestion}
                    disabled={submitting || !questionText.trim()}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>send</span>
                    Submit Question
                  </button>
                </div>
              </div>
            )}

            {/* Q&A list */}
            <div className="ch2-list">
              {qa.length === 0 && (
                <div className="ch2-empty">
                  <span className="material-symbols-outlined ch2-empty-icon">forum</span>
                  <p>No questions yet. Be the first to ask!</p>
                </div>
              )}
              {[...qa].reverse().map(q => (
                <div key={q._id} className={`ch2-qa-item ${q.isAnswered ? 'ch2-qa-item--answered' : ''}`}>
                  <div className="ch2-qa-item__header">
                    <div className="ch2-avatar ch2-avatar--q">
                      {q.isAnonymous ? '?' : (q.author?.name || 'I').substring(0, 2).toUpperCase()}
                    </div>
                    <div className="ch2-qa-item__meta">
                      <span className="ch2-qa-item__author">
                        {q.isAnonymous ? 'Anonymous Investor' : (q.author?.name || 'Investor')}
                      </span>
                      <span className="ch2-qa-item__time">{formatDate(q.createdAt)}</span>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                      {q.isAnonymous && (
                        <span className="ch2-pill ch2-pill--grey">
                          <span className="material-symbols-outlined" style={{ fontSize: 12 }}>visibility_off</span>
                          Anonymous
                        </span>
                      )}
                      {q.isAnswered
                        ? <span className="ch2-pill ch2-pill--green">✓ Answered</span>
                        : <span className="ch2-pill ch2-pill--orange">Awaiting Answer</span>
                      }
                    </div>
                  </div>

                  <p className="ch2-qa-item__question">{q.question}</p>

                  {q.isAnswered && (
                    <div className="ch2-qa-item__answer">
                      <div className="ch2-qa-item__answer-header">
                        <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#059669' }}>verified</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#059669' }}>Official Answer</span>
                        <span style={{ fontSize: 11, color: '#9CA3AF', marginLeft: 'auto' }}>{formatDate(q.answeredAt)}</span>
                      </div>
                      <p className="ch2-qa-item__answer-text">{q.answer}</p>
                    </div>
                  )}

                  {/* Answer form — founder only */}
                  {isFounder && !q.isAnswered && (
                    answeringId === q._id ? (
                      <div className="ch2-answer-form">
                        <textarea
                          className="ch2-textarea"
                          rows={2}
                          placeholder="Type your official answer…"
                          value={answerText}
                          onChange={e => setAnswerText(e.target.value)}
                        />
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          <button className="ch2-btn ch2-btn--primary" onClick={() => handleAnswer(q._id)} disabled={submitting || !answerText.trim()}>
                            Post Answer
                          </button>
                          <button className="ch2-btn ch2-btn--ghost" onClick={() => { setAnsweringId(null); setAnswerText(''); }}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button className="ch2-answer-trigger" onClick={() => { setAnsweringId(q._id); setMsg(''); }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 15 }}>reply</span>
                        Answer this question
                      </button>
                    )
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════ ANNOUNCEMENTS TAB ══════ */}
        {tab === 'announcements' && (
          <div className="ch2-section">
            {/* Post form — founder only */}
            {isFounder && (
              <div className="ch2-compose-card">
                <div className="ch2-compose-card__title">
                  <span className="material-symbols-outlined" style={{ color: '#EF4444' }}>campaign</span>
                  Post Official Update
                  <span className="ch2-compose-tag">Visible to all investors</span>
                </div>
                <textarea
                  className="ch2-textarea"
                  rows={4}
                  placeholder="Share a milestone update, funding announcement, or news…"
                  value={annText}
                  onChange={e => setAnnText(e.target.value)}
                />
                <div className="ch2-compose-footer">
                  <label className="ch2-toggle-label">
                    <input
                      type="checkbox"
                      checked={pinAnn}
                      onChange={e => setPinAnn(e.target.checked)}
                    />
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: pinAnn ? '#6366F1' : '#9CA3AF' }}>push_pin</span>
                    Pin this update
                  </label>
                  <button
                    className="ch2-btn ch2-btn--primary"
                    onClick={handlePostAnnouncement}
                    disabled={submitting || !annText.trim()}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>campaign</span>
                    Notify All Investors
                  </button>
                </div>
              </div>
            )}

            <div className="ch2-list">
              {announcements.length === 0 && (
                <div className="ch2-empty">
                  <span className="material-symbols-outlined ch2-empty-icon">campaign</span>
                  <p>No announcements yet. Founders can post official updates here.</p>
                </div>
              )}
              {[...announcements].sort((a, b) => {
                if (a.pinned && !b.pinned) return -1;
                if (!a.pinned && b.pinned) return 1;
                return new Date(b.createdAt) - new Date(a.createdAt);
              }).map(ann => (
                <div key={ann._id} className={`ch2-announcement ${ann.pinned ? 'ch2-announcement--pinned' : ''}`}>
                  <div className="ch2-announcement__header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {ann.pinned && (
                        <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#6366F1' }}>push_pin</span>
                      )}
                      <div className="ch2-avatar ch2-avatar--startup">
                        {startup?.name[0]}
                      </div>
                      <div>
                        <span className="ch2-ann-name">{startup?.name}</span>
                        <span className="ch2-pill ch2-pill--blue" style={{ marginLeft: 8 }}>Official Update</span>
                      </div>
                    </div>
                    <span className="ch2-ann-time">{formatDate(ann.createdAt)}</span>
                  </div>
                  <p className="ch2-announcement__body">{ann.content}</p>
                  {ann.likeCount > 0 && (
                    <div className="ch2-ann-likes">
                      👍 {ann.likeCount} investor{ann.likeCount > 1 ? 's' : ''} found this helpful
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════ MILESTONE COMMENTS TAB ══════ */}
        {tab === 'milestones' && (
          <div className="ch2-section">
            <div className="ch2-info-banner">
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#6366F1' }}>info</span>
              Investors can comment on milestone proof submissions during the 48-hour voting window.
            </div>

            {milestones.map(m => {
              const comments = milestoneComments[m._id] || [];
              const isVotingOpen = m.status === 'submitted';
              const votes = m.votes || [];
              const approvedVotes = votes.filter(v => v.approved).length;
              const votePct = votes.length > 0 ? Math.round((approvedVotes / votes.length) * 100) : 0;

              return (
                <div key={m._id} className={`ch2-milestone-card ${isVotingOpen ? 'ch2-milestone-card--active' : ''}`}>
                  <div className="ch2-milestone-card__header">
                    <div className="ch2-milestone-badge-row">
                      <span className="ch2-milestone-num">MILESTONE</span>
                      <span className={`ch2-ms-status ch2-ms-status--${m.status}`}>
                        {m.status.replace('_', ' ').toUpperCase()}
                      </span>
                      {isVotingOpen && (
                        <span className="ch2-pill ch2-pill--orange">
                          <span className="material-symbols-outlined" style={{ fontSize: 12 }}>timer</span>
                          Voting Open
                        </span>
                      )}
                    </div>
                    <h3 className="ch2-milestone-title">{m.title}</h3>
                    <p className="ch2-milestone-desc">{m.description}</p>
                  </div>

                  {/* Vote progress for submitted milestones */}
                  {m.status === 'submitted' && votes.length > 0 && (
                    <div className="ch2-vote-bar-section">
                      <div className="ch2-vote-bar-header">
                        <span>Investor Votes</span>
                        <span style={{ color: votePct >= 60 ? '#059669' : '#DC2626', fontWeight: 700 }}>
                          {approvedVotes}/{votes.length} approved ({votePct}%)
                          {votePct >= 60 ? ' ✓ Will pass' : ' — Needs 60%'}
                        </span>
                      </div>
                      <div className="ch2-vote-bar-track">
                        <div
                          className="ch2-vote-bar-fill"
                          style={{ width: `${votePct}%`, background: votePct >= 60 ? '#10B981' : '#EF4444' }}
                        />
                      </div>
                      <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>
                        Threshold: 60% approval required for tranche release
                      </p>
                    </div>
                  )}

                  {/* Comments */}
                  <div className="ch2-milestone-comments">
                    <div className="ch2-comments-title">
                      <span className="material-symbols-outlined" style={{ fontSize: 15 }}>chat_bubble</span>
                      {comments.length} Comment{comments.length !== 1 ? 's' : ''}
                    </div>
                    {comments.map((c, ci) => (
                      <div key={c._id || ci} className="ch2-comment">
                        <div className="ch2-avatar ch2-avatar--sm">
                          {c.isAnonymous ? '?' : (c.author?.name || 'I').substring(0, 2).toUpperCase()}
                        </div>
                        <div className="ch2-comment__body">
                          <div className="ch2-comment__meta">
                            <span className="ch2-comment__author">
                              {c.isAnonymous ? 'Anonymous Investor' : (c.author?.name || 'Investor')}
                            </span>
                            {c.isAnonymous && (
                              <span className="ch2-pill ch2-pill--grey" style={{ fontSize: 9 }}>
                                Anonymous
                              </span>
                            )}
                            <span className="ch2-comment__time">{formatDate(c.createdAt)}</span>
                          </div>
                          <p className="ch2-comment__text">{c.content}</p>
                        </div>
                      </div>
                    ))}

                    {/* Add comment — investors, during voting window */}
                    {!isFounder && isVotingOpen && (
                      commentMilestoneId === m._id ? (
                        <div className="ch2-comment-form">
                          <textarea
                            className="ch2-textarea"
                            rows={2}
                            placeholder="Add your comment on this milestone submission…"
                            value={milestoneCommentText}
                            onChange={e => setMilestoneCommentText(e.target.value)}
                          />
                          <div className="ch2-compose-footer" style={{ marginTop: 8 }}>
                            <label className="ch2-toggle-label">
                              <input
                                type="checkbox"
                                checked={commentAnonymous}
                                onChange={e => setCommentAnonymous(e.target.checked)}
                              />
                              <span className="material-symbols-outlined" style={{ fontSize: 14, color: commentAnonymous ? '#6366F1' : '#9CA3AF' }}>
                                {commentAnonymous ? 'visibility_off' : 'visibility'}
                              </span>
                              Anonymous
                            </label>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button className="ch2-btn ch2-btn--primary ch2-btn--sm"
                                onClick={() => handleMilestoneComment(m._id)}
                                disabled={submitting || !milestoneCommentText.trim()}>
                                Post Comment
                              </button>
                              <button className="ch2-btn ch2-btn--ghost ch2-btn--sm"
                                onClick={() => { setCommentMilestoneId(null); setMilestoneCommentText(''); }}>
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button className="ch2-add-comment-btn"
                          onClick={() => setCommentMilestoneId(m._id)}>
                          <span className="material-symbols-outlined" style={{ fontSize: 15 }}>add_comment</span>
                          Add comment during voting window
                        </button>
                      )
                    )}

                    {!isVotingOpen && !isFounder && (
                      <p className="ch2-voting-closed-note">
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>lock</span>
                        Comments available during the 48-hour voting window only.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ══════ NOTIFICATIONS TAB ══════ */}
        {tab === 'notifications' && (
          <div className="ch2-section">
            {/* Filter bar */}
            <div className="ch2-notif-filters">
              {['all','vote_request','milestone_update','qa_answer','announcement','fund_release'].map(f => (
                <button
                  key={f}
                  className={`ch2-pill-btn ${notifFilter === f ? 'active' : ''}`}
                  onClick={() => setNotifFilter(f)}
                >
                  {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
              <button className="ch2-btn ch2-btn--ghost ch2-btn--sm" style={{ marginLeft: 'auto' }} onClick={markAllRead}>
                Mark all read
              </button>
            </div>

            <div className="ch2-list">
              {filteredNotifs.length === 0 && (
                <div className="ch2-empty">
                  <span className="material-symbols-outlined ch2-empty-icon">notifications_off</span>
                  <p>No notifications match this filter.</p>
                </div>
              )}
              {filteredNotifs.map(n => {
                const meta = NOTIF_TYPE_COLOR[n.type] || NOTIF_TYPE_COLOR.default;
                const isRead = n.read;
                return (
                  <div
                    key={n._id}
                    className={`ch2-notif-item ${!isRead ? 'ch2-notif-item--unread' : ''}`}
                    onClick={() => null}
                  >
                    <div className="ch2-notif-icon" style={{ background: meta.bg }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18, color: meta.color }}>
                        {meta.icon}
                      </span>
                    </div>
                    <div className="ch2-notif-body">
                      <p className="ch2-notif-message">{n.title}</p>
                      <span className="ch2-notif-time">{formatDate(n.createdAt)}</span>
                    </div>
                    {!isRead && <div className="ch2-unread-dot" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
