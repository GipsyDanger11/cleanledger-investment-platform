import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../utils/apiClient';
import './AppLayout.css';

export default function AppLayout() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [showDrop, setShowDrop] = useState(false);
  const [showProfileToast, setShowProfileToast] = useState(false);
  const dropRef = useRef(null);

  if (!isAuthenticated) return <Navigate to="/auth" replace />;

  // Fetch notifications (poll every 30s)
  const fetchNotifications = async () => {
    try {
      const res = await apiClient.get('/notifications');
      setNotifications(res.data.data || []);
      setUnread(res.data.unreadCount || 0);
    } catch { /* silent */ }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!user) return;
    if (user.role === 'admin') return;
    setShowProfileToast(!user.profileComplete);
  }, [user?.role, user?.profileComplete]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setShowDrop(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markRead = async (id, link) => {
    try { await apiClient.patch(`/notifications/${id}/read`); } catch { /* silent */ }
    setNotifications(n => n.map(x => x._id === id ? { ...x, read: true } : x));
    setUnread(u => Math.max(0, u - 1));
    setShowDrop(false);
    if (link) navigate(link);
  };

  const markAllRead = async () => {
    try { await apiClient.patch('/notifications/read-all'); } catch { /* silent */ }
    setNotifications(n => n.map(x => ({ ...x, read: true })));
    setUnread(0);
  };

  const ICON_MAP = {
    milestone_update: 'flag',
    vote_request: 'how_to_vote',
    qa_answer: 'forum',
    fund_release: 'payments',
    announcement: 'campaign',
    variance_alert: 'warning',
    milestone_comment: 'comment',
    trust_score_change: 'shield',
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-layout__main">
        {/* ── App Top Bar with notification bell ── */}
        <div className="app-topbar">
          <div className="app-topbar__greeting">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0] || 'there'} 👋
          </div>
          <div className="app-topbar__right" ref={dropRef}>
            {/* Notification Bell */}
            <button className="app-bell" onClick={() => setShowDrop(p => !p)} aria-label="Notifications">
              <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#555' }}>notifications</span>
              {unread > 0 && <span className="app-bell__badge">{unread > 9 ? '9+' : unread}</span>}
            </button>

            {/* Dropdown */}
            {showDrop && (
              <div className="app-notif-drop">
                <div className="app-notif-drop__header">
                  <span style={{ fontWeight: 700, fontSize: '14px' }}>Notifications</span>
                  {unread > 0 && (
                    <button className="app-notif-drop__readall" onClick={markAllRead}>Mark all read</button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <div className="app-notif-drop__empty">No notifications yet</div>
                ) : (
                  <div className="app-notif-drop__list">
                    {notifications.slice(0, 10).map(n => (
                      <div key={n._id} className={`app-notif-item ${!n.read ? 'app-notif-item--unread' : ''}`}
                        onClick={() => markRead(n._id, n.link)}>
                        <div className="app-notif-item__icon">
                          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#1976D2' }}>
                            {ICON_MAP[n.type] || 'notifications'}
                          </span>
                        </div>
                        <div className="app-notif-item__body">
                          <div className="app-notif-item__title">{n.title}</div>
                          {n.body && <div className="app-notif-item__text">{n.body}</div>}
                          <div className="app-notif-item__time">
                            {new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        {!n.read && <div className="app-notif-item__dot" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="app-layout__content">
          {showProfileToast && (
            <div className="profile-toast" onClick={() => navigate('/profile-setup')}>
              <div>
                <strong>Complete your profile</strong>
                <p>Click here to finish setup and unlock full features.</p>
              </div>
              <button
                className="profile-toast__close"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowProfileToast(false);
                }}
                aria-label="Dismiss profile reminder"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
              </button>
            </div>
          )}
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
