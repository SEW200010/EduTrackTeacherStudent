import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext1 } from '../context/AuthContext1';

const ProtectedRoutes = ({ allowedRoles }) => {
  const { user, loading } = useContext(AuthContext1);

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading Auth...</div>;

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/option" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoutes;