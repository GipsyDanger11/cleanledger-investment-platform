import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { InvestmentProvider } from './context/InvestmentContext';
import AppLayout from './components/layout/AppLayout';

// Pages
import LandingPage    from './pages/LandingPage';
import Onboarding     from './pages/Onboarding';
import Dashboard      from './pages/Dashboard';
import Marketplace    from './pages/Marketplace';
import StartupDetails from './pages/StartupDetails';
import AuditTrail     from './pages/AuditTrail';
import Portfolio      from './pages/Portfolio';
import Settings       from './pages/Settings';
import NotFound       from './pages/NotFound';

export default function App() {
  return (
    <AuthProvider>
      <InvestmentProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/"           element={<LandingPage />} />
            <Route path="/onboarding" element={<Onboarding />} />

            {/* Authenticated routes — wrapped in AppLayout (sidebar + bottom nav) */}
            <Route element={<AppLayout />}>
              <Route path="/dashboard"          element={<Dashboard />} />
              <Route path="/marketplace"        element={<Marketplace />} />
              <Route path="/marketplace/:id"    element={<StartupDetails />} />
              <Route path="/ledger"             element={<AuditTrail />} />
              <Route path="/portfolio"          element={<Portfolio />} />
              <Route path="/settings"           element={<Settings />} />
            </Route>

            {/* Catch-all */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*"    element={<Navigate to="/404" replace />} />
          </Routes>
        </BrowserRouter>
      </InvestmentProvider>
    </AuthProvider>
  );
}
