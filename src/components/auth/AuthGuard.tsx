import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const AuthGuard = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Only redirect to dashboard if user is on login or register page
  if (isAuthenticated && (location.pathname === '/login' || location.pathname === '/register')) {
    return <Navigate to="/dashboard/assignments" replace />;
  }

  return <Outlet />;
}; 