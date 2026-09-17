import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AuthLoading: React.FC = () => (
  <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-label="Checking authentication">
    <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-300 border-t-cyan-500" />
  </div>
);

export const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <AuthLoading />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
};
