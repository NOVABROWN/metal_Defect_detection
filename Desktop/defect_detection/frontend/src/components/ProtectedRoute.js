import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin }) => {
  const { isAuthenticated, loading, user } = useContext(AuthContext);

  if (loading) {
    return <div className="text-center mt-20 text-xl text-gray-600">Loading auth state...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/upload" replace />;
  }

  return children;
};

export default ProtectedRoute;
