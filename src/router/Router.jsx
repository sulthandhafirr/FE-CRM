import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTE } from './routes';
import { useAuth } from '../hooks/useAuth';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Ticket from '../pages/Ticket';
import History from '../pages/History';
import LoadingSpinner from '../components/common/LoadingSpinner';


function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to={ROUTE.login} />;

  return children;
}

export default function Router() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  return (
    <Routes>
      {/* Public Route */}
      <Route path={ROUTE.login} element={
        user ? <Navigate to={ROUTE.dashboard} /> : <Login />
      } />

      {/* Protected Route */}
      <Route
        path={ROUTE.dashboard}
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTE.ticket}
        element={
          <ProtectedRoute>
            <Ticket />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTE.history}
        element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        }
      />

      {/* Redirect any unknown path based on auth */}
      <Route path="*" element={
        <Navigate to={user ? ROUTE.dashboard : ROUTE.login} />
      } />
    </Routes>
  );
}