import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../utils/apiClient';
import './Sidebar.css';

const NOTIF_ICON_MAP = {
  milestone_update: 'flag',
  vote_request: 'how_to_vote',
  qa_answer: 'forum',
  fund_release: 'payments',
  announcement: 'campaign',
  variance_alert: 'warning',
  milestone_comment: 'comment',
  trust_score_change: 'shield',
};

const INVESTOR_NAV = [
  { icon: 'dashboard',       label: 'Dashboard',    to: '/dashboard'    },
  { icon: 'storefront',      label: 'Marketplace',  to: '/marketplace'  },
  { icon: 'pie_chart',       label: 'Portfolio',    to: '/portfolio'    },
  { icon: 'account_balance', label: 'Ledger',       to: '/ledger'       },
  { icon: 'savings',         label: 'Funds',        to: '/funds'        },
  { icon: 'flag',            label: 'Milestones',   to: '/milestones'   },
  { icon: 'hub',             label: 'Communicate',  to: '/communicate'  },
  { icon: 'settings',        label: 'Settings',     to: '/settings'     },
];

const FOUNDER_NAV = [
  { icon: 'dashboard',       label: 'Dashboard',    to: '/dashboard'    },
  { icon: 'storefront',      label: 'Marketplace',  to: '/marketplace'  },
  { icon: 'savings',         label: 'Funds',        to: '/funds'        },
  { icon: 'flag',            label: 'Milestones',   to: '/milestones'   },
  { icon: 'hub',             label: 'Communicate',  to: '/communicate'  },
  { icon: 'account_balance', label: 'Ledger',       to: '/ledger'       },
  { icon: 'settings',        label: 'Settings',     to: '/settings'     },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isFounder = user?.role === 'startup';
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [showDrop, setShowDrop] = useState(false);
  const dropRef = useRef(null);

  const NAV_ITEMS = isFounder ? FOUNDER_NAV : INVESTOR_NAV;

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
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setShowDrop(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markRead = async (id, link) => {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
    } catch { /* silent */ }
    setNotifications((n) => n.map((x) => (x._id === id ? { ...x, read: true } : x)));
    setUnread((u) => Math.max(0, u - 1));
    setShowDrop(false);
    if (link) navigate(link);
  };

  const markAllRead = async () => {
    try {
      await apiClient.patch('/notifications/read-all');
    } catch { /* silent */ }
    setNotifications((n) => n.map((x) => ({ ...x, read: true })));
    setUnread(0);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <aside className="sidebar" aria-label="Main sidebar">
      {/* Brand Mark */}
      <div className="sidebar__brand">
        <span className="sidebar__logo-mark" title="CleanLedger">CL</span>
      </div>

      {/* Nav Items — icon only, tooltip via CSS data-label */}
      <nav className="sidebar__nav" aria-label="Primary navigation">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            data-label={item.label}
            className={({ isActive }) =>
              `sidebar__item${isActive ? ' sidebar__item--active' : ''}`
            }
            aria-label={item.label}
          >
            <span className="sidebar__active-bar" aria-hidden="true" />
            <span
              className="material-symbols-outlined sidebar__icon"
              aria-hidden="true"
            >
              {item.icon}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__notif-wrap" ref={dropRef}>
        <button
          type="button"
          className="sidebar__bell"
          onClick={() => setShowDrop((p) => !p)}
          aria-label="Notifications"
        >
          <span className="material-symbols-outlined sidebar__bell-icon">notifications</span>
          {unread > 0 && (
            <span className="sidebar__bell-badge">{unread > 9 ? '9+' : unread}</span>
          )}
        </button>
        {showDrop && (
          <div className="sidebar__notif-drop">
            <div className="sidebar__notif-drop-header">
              <span>Notifications</span>
              {unread > 0 && (
                <button type="button" className="sidebar__notif-readall" onClick={markAllRead}>
                  Mark all read
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <div className="sidebar__notif-empty">No notifications yet</div>
            ) : (
              <div className="sidebar__notif-list">
                {notifications.slice(0, 10).map((n) => (
                  <div
                    key={n._id}
                    className={`sidebar__notif-item ${!n.read ? 'sidebar__notif-item--unread' : ''}`}
                    onClick={() => markRead(n._id, n.link)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && markRead(n._id, n.link)}
                  >
                    <div className="sidebar__notif-item-icon">
                      <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#1976D2' }}>
                        {NOTIF_ICON_MAP[n.type] || 'notifications'}
                      </span>
                    </div>
                    <div className="sidebar__notif-item-body">
                      <div className="sidebar__notif-item-title">{n.title}</div>
                      {n.body && <div className="sidebar__notif-item-text">{n.body}</div>}
                      <div className="sidebar__notif-item-time">
                        {new Date(n.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                    {!n.read && <div className="sidebar__notif-dot" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Avatar + Logout */}
      <div className="sidebar__footer">
        <div
          className={`sidebar__avatar sidebar__avatar--${isFounder ? 'founder' : 'investor'}`}
          title={`${user?.name || 'User'} (${isFounder ? 'Founder' : 'Investor'})`}
          aria-label={`Logged in as ${user?.name || 'User'}`}
        >
          {(user?.name || 'U')[0].toUpperCase()}
        </div>
        <button
          className="sidebar__logout"
          onClick={handleLogout}
          data-label="Sign out"
          title="Sign out"
          aria-label="Sign out"
        >
          <span className="material-symbols-outlined" aria-hidden="true">logout</span>
        </button>
      </div>
    </aside>
  );
}

