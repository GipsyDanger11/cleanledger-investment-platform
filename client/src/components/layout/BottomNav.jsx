import { NavLink } from 'react-router-dom';
import './BottomNav.css';

const BOTTOM_NAV_ITEMS = [
  { icon: 'home',         label: 'Home',   to: '/dashboard'   },
  { icon: 'search',       label: 'Market', to: '/marketplace' },
  { icon: 'history_edu',  label: 'Ledger', to: '/ledger'      },
  { icon: 'pie_chart',    label: 'Funds',  to: '/funds'       },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Contextual navigation">
      {BOTTOM_NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `bottom-nav__item${isActive ? ' bottom-nav__item--active' : ''}`
          }
        >
          <span className="material-symbols-outlined bottom-nav__icon">{item.icon}</span>
          <span className="bottom-nav__label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
