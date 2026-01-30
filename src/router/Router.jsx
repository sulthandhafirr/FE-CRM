import { Routes, Route, Navigate } from 'react-router-dom';
// import { useState, useEffect } from 'react';
// import { supabase } from '../lib/supabase';
import { ROUTE } from './routes';
import { useAuth } from '../hooks/useAuth';
import AuthTest from '../pages/AuthTest';
import MainPage from '../pages/MainPage';


function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to={ROUTE.login} />;

  return children;
}

export default function Router() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path={ROUTE.login} element={<AuthTest />} />

      {/* Protected Route */}
      <Route
        path={ROUTE.main}
        element={
          <ProtectedRoute>
            <MainPage />
          </ProtectedRoute>
        }
      />

      {/* Redirect any unknown path to login */}
      <Route path="*" element={<Navigate to={ROUTE.login} />} />
    </Routes>
  );
}