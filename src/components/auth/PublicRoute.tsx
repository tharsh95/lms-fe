import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";

export const PublicRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return <div>Loading...</div>; // Or your loading component
  }

  // If authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard/assignments" replace />;
  }

  // If not authenticated, render the public route
  return <Outlet />;
}; 