import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const NAV_ITEMS = [
  { icon: 'dashboard',        label: 'Dashboard',    to: '/dashboard'   },
  { icon: 'storefront',       label: 'Marketplace',  to: '/marketplace' },
  { icon: 'pie_chart',        label: 'Portfolio',    to: '/portfolio'   },
  { icon: 'account_balance',  label: 'Ledger',       to: '/ledger'      },
  { icon: 'settings',         label: 'Settings',     to: '/settings'    },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="sidebar">
      {/* Brand Mark */}
      <div className="sidebar__brand">
        <span className="sidebar__logo-mark">CL</span>
      </div>

      {/* Nav Items */}
      <nav className="sidebar__nav" aria-label="Primary navigation">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar__item${isActive ? ' sidebar__item--active' : ''}`
            }
            title={item.label}
          >
            <span className="sidebar__active-bar" aria-hidden="true" />
            <span className="material-symbols-outlined sidebar__icon">{item.icon}</span>
            <span className="sidebar__label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Avatar + Logout */}
      <div className="sidebar__footer">
        <div className="sidebar__avatar" title={user?.name || 'User'}>
          {(user?.name || 'U')[0].toUpperCase()}
        </div>
        <button
          className="sidebar__logout"
          onClick={handleLogout}
          title="Sign out"
          aria-label="Sign out"
        >
          <span className="material-symbols-outlined">logout</span>
        </button>
      </div>
    </aside>
  );
}
