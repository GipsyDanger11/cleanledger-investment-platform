import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import InvestorProfileCompletion from './InvestorProfileCompletion';
import FounderProfileCompletion from './FounderProfileCompletion';

/**
 * Role-specific profile completion: investors and founders use different forms,
 * data models, and API routes — no shared field layout between roles.
 */
export default function ProfileCompletion() {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'investor') return <InvestorProfileCompletion />;
  if (user.role === 'startup') return <FounderProfileCompletion />;
  return <Navigate to="/dashboard" replace />;
}
