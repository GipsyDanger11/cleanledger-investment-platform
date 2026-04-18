import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';

const InvestmentContext = createContext(null);

const BASE = 'http://localhost:5000/api/v1';

// ── Thin fetch wrapper that always attaches JWT ───────────────
async function api(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}

export function InvestmentProvider({ children }) {
  const { user, token, isAuthenticated } = useAuth();

  // ── Core state ──────────────────────────────────────────────
  const [startups,      setStartups]      = useState([]);
  /** Full profile for the logged-in founder (single owned startup). */
  const [myStartup,     setMyStartup]     = useState(null);
  const [investments,   setInvestments]   = useState([]);
  const [auditEntries,  setAuditEntries]  = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);   // ₹ virtual wallet
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState(null);

  // prevent double-fetch on StrictMode double-invoke
  const fetchedRef = useRef(false);

  // ── Token helper ────────────────────────────────────────────
  const tok = useCallback(() =>
    token || localStorage.getItem('cl_token') || localStorage.getItem('token'),
  [token]);

  // ── Fetch: all startups (Marketplace) ──────────────────────
  const fetchStartups = useCallback(async () => {
    try {
      const data = await api('GET', '/startups', null, tok());
      setStartups(data.data || []);
    } catch (e) {
      console.error('fetchStartups:', e.message);
    }
  }, [tok]);

  const fetchMyStartup = useCallback(async () => {
    try {
      const data = await api('GET', '/startups/me/profile', null, tok());
      setMyStartup(data.data || null);
      return data.data;
    } catch {
      setMyStartup(null);
      return null;
    }
  }, [tok]);

  // ── Fetch: single startup (full detail) ────────────────────
  const fetchStartup = useCallback(async (id) => {
    const data = await api('GET', `/startups/${id}`, null, tok());
    return data.data;
  }, [tok]);

  // ── Fetch: investments for logged-in user ──────────────────
  const fetchInvestments = useCallback(async () => {
    try {
      const data = await api('GET', '/investments', null, tok());
      setInvestments(data.data || []);
    } catch (e) {
      console.error('fetchInvestments:', e.message);
    }
  }, [tok]);

  // ── Fetch: wallet balance ──────────────────────────────────
  const fetchWallet = useCallback(async () => {
    try {
      const data = await api('GET', '/investments/wallet', null, tok());
      setWalletBalance(data.data?.walletBalance ?? null);
      return data.data;
    } catch (e) {
      console.error('fetchWallet:', e.message);
      return null;
    }
  }, [tok]);

  // ── Action: top-up virtual wallet ──────────────────────────
  const topUpWallet = useCallback(async (amount) => {
    const data = await api('POST', '/investments/wallet/topup', { amount }, tok());
    if (data?.data?.walletBalance !== undefined) {
      setWalletBalance(data.data.walletBalance);
    }
    return data;
  }, [tok]);

  // ── Action: invest in a startup (deducts virtual wallet) ──
  const invest = useCallback(async (startupId, amount, trancheTag) => {
    const data = await api('POST', '/investments', { startupId, amount, trancheTag }, tok());
    // Optimistically update wallet balance and investments list
    if (data?.data?.walletBalance !== undefined) {
      setWalletBalance(data.data.walletBalance);
    }
    if (data?.data?.investment) {
      setInvestments(prev => [data.data.investment, ...prev]);
    }
    return data;
  }, [tok]);

  // ── Action: verify SHA-256 chain integrity ─────────────────
  const verifyChainIntegrity = useCallback(async () => {
    const data = await api('GET', '/audit/verify', null, tok());
    return data.data;
  }, [tok]);

  // ── Action: simulate tamper (demo) ─────────────────────────
  const simulateTamper = useCallback(async (blockNumber) => {
    const data = await api('POST', '/audit/simulate-tamper', { blockNumber }, tok());
    return data;
  }, [tok]);

  // ── Action: FHE homomorphic aggregate ──────────────────────
  const fheAggregate = useCallback(async (startupId) => {
    const data = await api('GET', `/investments/fhe-aggregate/${startupId}`, null, tok());
    return data.data;
  }, [tok]);

  // ── Action: AI Pitch Analysis ──────────────────────────────
  const analyzePitch = useCallback(async (startupId, pitchText) => {
    const data = await api('POST', `/startups/${startupId}/analyze-pitch`, { pitchText }, tok());
    return data.data;
  }, [tok]);


  // ── Fetch: audit trail ─────────────────────────────────────
  const fetchAuditEntries = useCallback(async (params = {}) => {
    try {
      const qs = new URLSearchParams(params).toString();
      const data = await api('GET', `/audit${qs ? '?' + qs : ''}`, null, tok());
      setAuditEntries(data.data || []);
      return data;
    } catch (e) {
      console.error('fetchAuditEntries:', e.message);
      return { data: [] };
    }
  }, [tok]);

  // ── Fetch: notifications ───────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    try {
      const data = await api('GET', '/notifications', null, tok());
      setNotifications(data.data || []);
      return data;
    } catch (e) {
      console.error('fetchNotifications:', e.message);
      return { data: [] };
    }
  }, [tok]);

  // ── Fetch: role-aware dashboard summary ────────────────────
  const fetchDashboard = useCallback(async () => {
    try {
      const role = user?.role;
      let path = '/dashboard/investor';
      if (role === 'startup') path = '/dashboard/founder';
      if (role === 'admin')   path = '/dashboard/admin';
      const data = await api('GET', path, null, tok());
      setDashboardData(data.data || null);
      return data.data;
    } catch (e) {
      console.error('fetchDashboard:', e.message);
      return null;
    }
  }, [user, tok]);

  // ── Fetch: fund dashboard for a startup ────────────────────
  const fetchFundDashboard = useCallback(async (startupId) => {
    const data = await api('GET', `/startups/${startupId}/funds`, null, tok());
    return data.data;
  }, [tok]);

  // ── Fetch: milestones for a startup ────────────────────────
  const fetchMilestones = useCallback(async (startupId) => {
    const data = await api('GET', `/startups/${startupId}/milestones`, null, tok());
    return data.data;
  }, [tok]);

  // ── Fetch: Q&A for a startup ───────────────────────────────
  const fetchQA = useCallback(async (startupId) => {
    const data = await api('GET', `/startups/${startupId}/qa`, null, tok());
    return data.data || [];
  }, [tok]);

  // ── Fetch: announcements for a startup ─────────────────────
  const fetchAnnouncements = useCallback(async (startupId) => {
    const data = await api('GET', `/startups/${startupId}/announcements`, null, tok());
    return data.data || [];
  }, [tok]);

  // ── Fetch: milestone comments ──────────────────────────────
  const fetchMilestoneComments = useCallback(async (startupId, milestoneId) => {
    const data = await api('GET', `/startups/${startupId}/milestones/${milestoneId}/comments`, null, tok());
    return data.data || [];
  }, [tok]);

  // ── Action: cast milestone vote ────────────────────────────
  const castVote = useCallback(async (startupId, milestoneId, approved) => {
    const data = await api('POST', `/startups/${startupId}/milestones/${milestoneId}/vote`, { approved }, tok());
    return data;
  }, [tok]);

  // ── Action: submit milestone proof ────────────────────────
  const submitMilestoneProof = useCallback(async (startupId, milestoneId, proofUrl, proofNote) => {
    const data = await api('POST', `/startups/${startupId}/milestones/${milestoneId}/submit`, { proofUrl, proofNote }, tok());
    return data;
  }, [tok]);

  // ── Action: add expense ────────────────────────────────────
  const addExpense = useCallback(async (startupId, expense) => {
    const data = await api('POST', `/startups/${startupId}/funds/expense`, expense, tok());
    return data;
  }, [tok]);

  // ── Action: ask Q&A question ───────────────────────────────
  const askQuestion = useCallback(async (startupId, question, isAnonymous = false) => {
    const data = await api('POST', `/startups/${startupId}/qa`, { question, isAnonymous }, tok());
    return data;
  }, [tok]);

  // ── Action: answer Q&A question ────────────────────────────
  const answerQuestion = useCallback(async (startupId, questionId, answer) => {
    const data = await api('POST', `/startups/${startupId}/qa/${questionId}/answer`, { answer }, tok());
    return data;
  }, [tok]);

  // ── Action: post announcement ──────────────────────────────
  const postAnnouncement = useCallback(async (startupId, content, pinned = false) => {
    const data = await api('POST', `/startups/${startupId}/announcements`, { content, pinned }, tok());
    return data;
  }, [tok]);

  // ── Action: post milestone comment ─────────────────────────
  const postMilestoneComment = useCallback(async (startupId, milestoneId, content) => {
    const data = await api('POST', `/startups/${startupId}/milestones/${milestoneId}/comments`, { content }, tok());
    return data;
  }, [tok]);

  // ── Action: mark notification read ─────────────────────────
  const markNotificationRead = useCallback(async (notifId) => {
    await api('PATCH', `/notifications/${notifId}/read`, null, tok());
    setNotifications(prev => prev.map(n => n._id === notifId ? { ...n, read: true } : n));
  }, [tok]);

  // ── Action: mark all notifications read ────────────────────
  const markAllNotificationsRead = useCallback(async () => {
    await api('PATCH', '/notifications/read-all', null, tok());
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, [tok]);

  // ── Initial load when user authenticates ───────────────────
  useEffect(() => {
    if (!isAuthenticated || !tok()) {
      // Reset on logout
      setStartups([]); setMyStartup(null); setInvestments([]); setAuditEntries([]);
      setNotifications([]); setDashboardData(null); setWalletBalance(null);
      fetchedRef.current = false;
      return;
    }
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    setLoading(true);
    setError(null);

    const load = async () => {
      try {
        await Promise.all([
          fetchStartups(),
          fetchDashboard(),
          fetchNotifications(),
          fetchWallet(), // both startup and investors need it
          user?.role !== 'startup' ? fetchInvestments() : Promise.resolve(),
          user?.role === 'startup' ? fetchMyStartup() : Promise.resolve(),
        ]);
      } catch (e) {
        setError(e.message);
        console.error('Initial load error:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuthenticated, user?.role, tok, fetchStartups, fetchMyStartup, fetchDashboard, fetchNotifications, fetchInvestments]);

  // ── Derived values ──────────────────────────────────────────
  const portfolioValue   = investments.reduce((s, i) => s + (i.amount || 0), 0);
  const avgTrustScore    = investments.length
    ? Math.round(investments.reduce((s, i) => s + (i.trustScore || 0), 0) / investments.length)
    : 0;
  const tranchesReleased = investments.length;
  const unreadCount      = notifications.filter(n => !n.read).length;

  // Investor notifications = all
  const investorNotifications = notifications;
  // Founder notifications = same source (filtered for their startup by backend)
  const founderNotifications  = notifications;

  // ── Context value ────────────────────────────────────────────
  const value = {
    // State
    startups,
    myStartup,
    investments,
    auditEntries,
    notifications,
    dashboardData,
    walletBalance,
    loading,
    error,

    // Derived
    portfolioValue,
    avgTrustScore,
    tranchesReleased,
    unreadCount,
    investorNotifications,
    founderNotifications,

    // Fetch functions (pages call these on mount)
    fetchStartups,
    fetchMyStartup,
    fetchStartup,
    fetchInvestments,
    fetchAuditEntries,
    fetchNotifications,
    fetchDashboard,
    fetchFundDashboard,
    fetchMilestones,
    fetchQA,
    fetchAnnouncements,
    fetchMilestoneComments,
    fetchWallet,

    // Action functions (write to DB)
    topUpWallet,
    castVote,
    submitMilestoneProof,
    addExpense,
    invest,
    verifyChainIntegrity,
    simulateTamper,
    fheAggregate,
    askQuestion,
    answerQuestion,
    postAnnouncement,
    postMilestoneComment,
    markNotificationRead,
    markAllNotificationsRead,
    analyzePitch,
  };

  return (
    <InvestmentContext.Provider value={value}>
      {children}
    </InvestmentContext.Provider>
  );
}

export function useInvestment() {
  const ctx = useContext(InvestmentContext);
  if (!ctx) throw new Error('useInvestment must be used within InvestmentProvider');
  return ctx;
}
