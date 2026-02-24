import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTE } from './routes';
import { useAuth } from '../hooks/useAuth';
import Login from '../pages/Login';
import CustomerDashboard from '../pages/CustomerDashboard';
import CsAgentDashboard from '../pages/CsAgentDashboard';
// import TechnicianDashboard from '../pages/TechnicianDashboard';
// import AdminDashboard from '../pages/AdminDashboard';
import Ticket from '../pages/Ticket';
import History from '../pages/History';
import LoadingSpinner from '../components/common/LoadingSpinner';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, role, loading } = useAuth();

  if (loading || (user && role === null)) return <LoadingSpinner />;
  if (!user) return <Navigate to={ROUTE.login} />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to={ROUTE.login} />;

  return children;
}

const getRoleRoute = (role) => {
  // if (role === 'admin') return ROUTE.adminDashboard;
  if (role === 'cs_agent') return ROUTE.agentDashboard;
  // if (role === 'technician') return ROUTE.technicianDashboard;
  return ROUTE.customerDashboard;
};

export default function Router() {
  const { user, role, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  return (
    <Routes>
      {/* Public Route */}
      <Route path={ROUTE.login} element={
        user ? <Navigate to={getRoleRoute(role)} /> : <Login />
      } />

      {/* Customer Routes */}
      <Route path={ROUTE.customerDashboard} element={
        <ProtectedRoute allowedRoles={['customer']}>
          <CustomerDashboard />
        </ProtectedRoute>
      } />
      <Route path={ROUTE.ticket} element={
        <ProtectedRoute allowedRoles={['customer']}>
          <Ticket />
        </ProtectedRoute>
      } />
      <Route path={ROUTE.history} element={
        <ProtectedRoute allowedRoles={['customer']}>
          <History />
        </ProtectedRoute>
      } />

      {/* Agent Routes */}
      <Route path={ROUTE.agentDashboard} element={
        <ProtectedRoute allowedRoles={['cs_agent']}>
          <CsAgentDashboard />
        </ProtectedRoute>
      } />

      {/* UNCOMMAND HERE */}

      {/* Technician Routes */}
      {/* <Route path={ROUTE.technicianDashboard} element={
        <ProtectedRoute allowedRoles={['technician']}>
          <TechnicianDashboard />
        </ProtectedRoute>
      } /> */}

      {/* Admin Routes */}
      {/* <Route path={ROUTE.adminDashboard} element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } /> */}

      {/* Wildcard */}
      <Route path="*" element={
        <Navigate to={user ? getRoleRoute(role) : ROUTE.login} />
      } />
    </Routes>
  );
}