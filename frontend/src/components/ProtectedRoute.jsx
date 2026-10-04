import React, { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 font-sans text-gray-600">
        Loading...
      </div>
    );
  }

  // 1. Redirect unauthenticated users to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Extract role safely regardless of context payload structure
  const rawRole = user.role || user.user?.role || user.data?.role;
  const userRole = rawRole ? String(rawRole).toLowerCase() : 'buyer';

  // 3. Check role authorization against allowed list
  if (allowedRoles) {
    const formattedAllowedRoles = allowedRoles.map((r) => String(r).toLowerCase());
    
    if (!formattedAllowedRoles.includes(userRole)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;