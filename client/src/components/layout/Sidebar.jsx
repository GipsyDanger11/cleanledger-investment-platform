import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const NAV_ITEMS = [
  { icon: 'dashboard',       label: 'Dashboard',   to: '/dashboard'   },
  { icon: 'storefront',      label: 'Marketplace', to: '/marketplace' },
  { icon: 'pie_chart',       label: 'Portfolio',   to: '/portfolio'   },
  { icon: 'account_balance', label: 'Ledger',      to: '/ledger'      },
  { icon: 'settings',        label: 'Settings',    to: '/settings'    },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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

      {/* User Avatar + Logout */}
      <div className="sidebar__footer">
        <div
          className="sidebar__avatar"
          title={user?.name || 'User'}
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
