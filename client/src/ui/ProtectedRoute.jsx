import React from 'react';
import { Alert } from '@mui/material';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext.jsx';

export function ProtectedRoute({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Alert severity="error">You do not have access to this area.</Alert>;
  return children;
}
