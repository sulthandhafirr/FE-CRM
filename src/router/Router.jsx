import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { ROUTE } from "./routes";
import { useAuth } from "../hooks/useAuth";
import MainLayout from "../components/layout/MainLayout";
import Login from "../pages/Login";
import CustomerDashboard from "../pages/customer/CustomerDashboard";
import CsAgentDashboard from "../pages/cs-agent/CsAgentDashboard";
// import TechnicianDashboard from '../pages/TechnicianDashboard';
// import AdminDashboard from '../pages/AdminDashboard';
import CustomerTicket from "../pages/customer/CustomerTicket";
import CustomerHistory from "../pages/customer/CustomerHistory";
import CsAgentTicket from "../pages/cs-agent/CsAgentTicket";
import LoadingSpinner from "../components/common/LoadingSpinner";

function ProtectedRoute({ allowedRoles }) {
  const { user, role, loading } = useAuth();

  if (loading || (user && role === null)) return <LoadingSpinner />;
  if (!user) return <Navigate to={ROUTE.login} />;
  if (allowedRoles && !allowedRoles.includes(role))
    return <Navigate to={ROUTE.login} />;

  return <Outlet />;
}

const getRoleRoute = (role) => {
  // if (role === 'admin') return ROUTE.adminDashboard;
  if (role === "cs_agent") return ROUTE.agentDashboard;
  // if (role === 'technician') return ROUTE.technicianDashboard;
  return ROUTE.customerDashboard;
};

export default function Router() {
  const { user, role, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  return (
    <Routes>
      {/* Public Route */}
      <Route
        path={ROUTE.login}
        element={user ? <Navigate to={getRoleRoute(role)} /> : <Login />}
      />

      {/* Customer Routes */}
      <Route element={<ProtectedRoute allowedRoles={["customer"]} />}>
        <Route element={<MainLayout />}>
          <Route path={ROUTE.customerDashboard} element={<CustomerDashboard />} />
          <Route path={ROUTE.customerTicket} element={<CustomerTicket />} />
          <Route path={ROUTE.customerHistory} element={<CustomerHistory />} />
        </Route>
      </Route>

      {/* Agent Routes */}
      <Route element={<ProtectedRoute allowedRoles={["cs_agent"]} />}>
        <Route element={<MainLayout />}>
          <Route path={ROUTE.agentDashboard} element={<CsAgentDashboard />} />
          <Route path={ROUTE.agentTicket} element={<CsAgentTicket />} />
        </Route>
      </Route>

      {/* UNCOMMAND HERE */}

      {/* Technician Routes */}
      {/* <Route element={<ProtectedRoute allowedRoles={["technician"]} />}>
        <Route element={<MainLayout />}>
          <Route path={ROUTE.technicianDashboard} element={<technicianDashboard />} />
          <Route path={ROUTE.technicianTicket} element={<technicianTicket />} />
        </Route>
      </Route> */}

      {/* Admin Routes */}
      {/* <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route element={<MainLayout />}>
          <Route path={ROUTE.adminDashboard} element={<adminDashboard />} />
          <Route path={ROUTE.adminTicket} element={<adminTicket />} />
        </Route>
      </Route> */}

      {/* Wildcard */}
      <Route
        path="*"
        element={<Navigate to={user ? getRoleRoute(role) : ROUTE.login} />}
      />
    </Routes>
  );
}
