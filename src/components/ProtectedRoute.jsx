import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children }) {
  const { isAuth, loading } = useAuth();
  if (loading) return null;
  return isAuth() ? children : <Navigate to="/login" replace />;
}

export function AdminRoute({ children }) {
  const { isAuth, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!isAuth()) return <Navigate to="/login" replace />;
  if (!isAdmin()) return <Navigate to="/dashboard" replace />;
  return children;
}