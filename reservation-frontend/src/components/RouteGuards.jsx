import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

export function ProtectedRoute({ children }) {
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return <Spinner full label="Checking your session" />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

export function RoleRoute({ role, children }) {
  const { user, initializing } = useAuth();

  if (initializing) return <Spinner full label="Checking your session" />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/book'} replace />;
  }
  return children;
}
