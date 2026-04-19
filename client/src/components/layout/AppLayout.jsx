import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { useAuth } from '../../context/AuthContext';
import './AppLayout.css';

export default function AppLayout() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [showProfileToast, setShowProfileToast] = useState(false);

  if (!isAuthenticated) return <Navigate to="/auth" replace />;

  /** Founders use role `startup`; investors use `investor`. Left rail already covers nav. */
  const showBottomNav = !['investor', 'startup', 'founder'].includes(user?.role);

  useEffect(() => {
    if (!user) return;
    if (user.role === 'admin') return;
    setShowProfileToast(!user.profileComplete);
  }, [user?.role, user?.profileComplete]);

  return (
    <div className={`app-layout${showBottomNav ? '' : ' app-layout--no-bottom-nav'}`}>
      <Sidebar />
      <main className="app-layout__main">
        <div className="app-layout__content">
          {showProfileToast && (
            <div className="profile-toast" onClick={() => navigate('/profile-setup')}>
              <div>
                <strong>Complete your profile</strong>
                <p>Finish your investor or founder setup — opens the right form for your role.</p>
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
      {showBottomNav ? <BottomNav /> : null}
    </div>
  );
}
