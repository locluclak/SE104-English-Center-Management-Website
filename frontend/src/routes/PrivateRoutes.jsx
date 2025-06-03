import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ allowedRoles, children }) => {
  const role = localStorage.getItem('role');

  if (!role) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.includes(role)) {
    return children; // render trực tiếp component con
  } else {
    return <Navigate to="/unauthorized" replace />;
  }
};

export default PrivateRoute;