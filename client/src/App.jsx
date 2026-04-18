import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { InvestmentProvider } from './context/InvestmentContext';
import AppLayout from './components/layout/AppLayout';

// Pages
import LandingPage          from './pages/LandingPage';
import AuthPage             from './pages/AuthPage';
import ProfileCompletion    from './pages/ProfileCompletion';
import FounderProfileCompletion from './pages/FounderProfileCompletion';
import AdminDashboard       from './pages/AdminDashboard';
import FounderDashboard     from './pages/FounderDashboard';
import InvestorDashboard    from './pages/InvestorDashboard';
import Marketplace          from './pages/Marketplace';
import StartupDetails       from './pages/StartupDetails';
import AuditTrail           from './pages/AuditTrail';
import Portfolio            from './pages/Portfolio';
import Settings             from './pages/Settings';
import FundDashboard        from './pages/FundDashboard';
import MilestoneTimeline    from './pages/MilestoneTimeline';
import CommunicationHub     from './pages/CommunicationHub';
import NotFound             from './pages/NotFound';
import AccessDenied         from './pages/AccessDenied';

// Registration wizards
import InvestorRegistration from './pages/InvestorRegistration';
import StartupRegistration  from './pages/StartupRegistration';

/* ── Role-gated wrapper ── */
function RequireRole({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) return <Navigate to="/access-denied" replace />;
  return children;
}

function ProfileSetupRoute() {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  if (user?.profileComplete) return <Navigate to="/dashboard" replace />;
  return <ProfileCompletion />;
}

export default function App() {
  return (
    <AuthProvider>
      <InvestmentProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            {/* ── Public ── */}
            <Route path="/"              element={<LandingPage />} />
            <Route path="/auth"          element={<AuthPage />} />
            <Route path="/profile-setup" element={<ProfileSetupRoute />} />
            <Route path="/access-denied" element={<AccessDenied />} />

            {/* ── Separate registration wizards ── */}
            <Route path="/register/investor" element={<InvestorRegistration />} />
            <Route path="/register/startup"  element={<StartupRegistration />} />

            {/* ── Admin (standalone, no AppLayout) ── */}
            <Route path="/admin" element={
              <RequireRole allowedRoles={['admin']}>
                <AdminDashboard />
              </RequireRole>
            } />

            {/* ── Authenticated routes — AppLayout (sidebar + bottom nav) ── */}
            <Route element={<AppLayout />}>

              {/* Smart redirect: /dashboard → role-specific dashboard */}
              <Route path="/dashboard" element={<DashboardRouter />} />
              <Route path="/founder-dashboard" element={
                <RequireRole allowedRoles={['startup']}>
                  <FounderDashboard />
                </RequireRole>
              } />
              
              <Route path="/edit-profile" element={
                <RequireRole allowedRoles={['startup']}>
                  <FounderProfileCompletion editing={true} />
                </RequireRole>
              } />

              <Route path="/investor-dashboard" element={
                <RequireRole allowedRoles={['investor']}>
                  <InvestorDashboard />
                </RequireRole>
              } />

              {/* Investor-specific */}
              <Route path="/portfolio" element={
                <RequireRole allowedRoles={['investor', 'admin']}>
                  <Portfolio />
                </RequireRole>
              } />

              {/* Shared pages (all roles) */}
              <Route path="/marketplace"     element={<Marketplace />} />
              <Route path="/marketplace/:id" element={<StartupDetails />} />
              <Route path="/ledger"          element={<AuditTrail />} />
              <Route path="/settings"        element={<Settings />} />

              {/* R2 — Fund Dashboard */}
              <Route path="/funds"    element={<FundDashboard />} />
              <Route path="/funds/:id" element={<FundDashboard />} />

              {/* R3 — Milestone Timeline (optional per-milestone deep link) */}
              <Route path="/milestones/:id/m/:milestoneId" element={<MilestoneTimeline />} />
              <Route path="/milestones/:id" element={<MilestoneTimeline />} />
              <Route path="/milestones" element={<MilestoneTimeline />} />

              {/* G3 — Communication Hub */}
              <Route path="/communicate"     element={<CommunicationHub />} />
              <Route path="/communicate/:id" element={<CommunicationHub />} />
            </Route>

            {/* ── Catch-all ── */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*"    element={<Navigate to="/404" replace />} />
          </Routes>
        </BrowserRouter>
      </InvestmentProvider>
    </AuthProvider>
  );
}

/* Renders the right dashboard based on the logged-in role */
function DashboardRouter() {
  const { user } = useAuth();
  if (user?.role === 'admin')   return <Navigate to="/admin" replace />;
  if (user?.role === 'startup') return <Navigate to="/founder-dashboard" replace />;
  return <Navigate to="/investor-dashboard" replace />;
}
