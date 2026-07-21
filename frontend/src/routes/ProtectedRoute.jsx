import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import Loader from '../components/common/Loader.jsx';

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, loading, user } = useAuth();

  // If session is still loading, display a gorgeous full-page loader spinner
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-darkBg text-slate-500">
        <Loader size="lg" color="primary" />
        <span className="text-xs font-semibold tracking-wider uppercase mt-4 animate-pulse">Loading Workspace...</span>
      </div>
    );
  }

  // If not logged in, redirect to welcome page
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If logged in, check role auth
  if (allowedRoles.length > 0 && (!user || !allowedRoles.includes(user.role))) {
    return <Navigate to="/" replace />;
  }

  // Render children or outlets
  return <Outlet />;
};

export default ProtectedRoute;
