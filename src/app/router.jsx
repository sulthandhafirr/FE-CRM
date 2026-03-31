import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { ROUTE } from "./routes";
import { useAuth } from "../hooks/useAuth";
import MainLayout from "../components/layout/MainLayout";
import LoginPage from "../modules/auth/login/LoginPage";
import CustomerDashboardPage from "../modules/dashboard/customer/CustomerDashboardPage";
import AgentDashboardPage from "../modules/dashboard/agent/AgentDashboardPage";
import TechnicianDashboardPage from "../modules/dashboard/technician/TechnicianDashboardPage";
import CustomerTicketPage from "../modules/ticket/pages/CustomerTicketPage";
import CustomerTicketViewDetailPage from "../modules/ticket/components/CustomerTicketViewDetailPage";
import CustomerHistoryPage from "../modules/history/CustomerHistoryPage";
import AgentTicketPage from "../modules/ticket/pages/AgentTicketPage";
import UltrauserMenuPage from "../modules/ultrauser/menu/UltrauserMenuPage";
import UltrauserTicketPage from "../modules/ultrauser/ticket/UltrauserTicketPage";
import ManageUsersPage from "../modules/ultrauser/users/pages/ManageUsersPage";
import CompanyListPage from "../modules/ultrauser/company/pages/CompanyListPage";
import ComingSoonPage from "../components/ui/ComingSoonPage";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import NotFoundPage from "../pages/NotFoundPage";

function ProtectedRoute({ allowedRoles }) {
  const { user, role, trueRole, loading } = useAuth();

  if (loading || (user && role === null)) return <LoadingSpinner />;
  if (!user) return <Navigate to={ROUTE.login} />;
  if (allowedRoles && !allowedRoles.includes(role) && trueRole !== "ultrauser")
    return <Navigate to={ROUTE.login} />;

  return <Outlet />;
}

const getRoleRoute = (role) => {
  // if (role === 'admin') return ROUTE.adminDashboard;
  if (role === "cs_agent") return ROUTE.agentDashboard;
  if (role === "ultrauser") return ROUTE.ultrauserDashboard;
  if (role === 'technician') return ROUTE.technicianDashboard;
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
        element={user ? <Navigate to={getRoleRoute(role)} /> : <LoginPage />}
      />

      {/* Customer Routes */}
      <Route element={<ProtectedRoute allowedRoles={["customer"]} />}>
        <Route element={<MainLayout />}>
          <Route
            path={ROUTE.customerDashboard}
            element={<CustomerDashboardPage />}
          />
          <Route path={ROUTE.customerTicket} element={<CustomerTicketPage />} />
          <Route
            path={ROUTE.customerTicketDetail}
            element={<CustomerTicketViewDetailPage />}
          />
          <Route
            path={ROUTE.customerHistory}
            element={<CustomerHistoryPage />}
          />
        </Route>
      </Route>

      {/* Agent Routes */}
      <Route element={<ProtectedRoute allowedRoles={["cs_agent"]} />}>
        <Route element={<MainLayout />}>
          <Route path={ROUTE.agentDashboard} element={<AgentDashboardPage />} />
          <Route path={ROUTE.agentTicket} element={<AgentTicketPage />} />
        </Route>
      </Route>

      {/* Ultrauser Routes */}
      <Route element={<ProtectedRoute allowedRoles={["ultrauser"]} />}>
        <Route element={<MainLayout />}>
          <Route
            path={ROUTE.ultrauserDashboard}
            element={<CustomerDashboardPage />}
          />
          <Route
            path={ROUTE.ultrauserTicket}
            element={<UltrauserTicketPage />}
          />
          <Route
            path={ROUTE.ultrauserTicketCustomer}
            element={<CustomerTicketPage />}
          />
          <Route
            path={ROUTE.ultrauserTicketCustomerDetail}
            element={<CustomerTicketViewDetailPage />}
          />
          <Route
            path={ROUTE.ultrauserTicketAgent}
            element={<AgentTicketPage />}
          />
          <Route
            path={ROUTE.ultrauserTicketTechnician}
            element={<ComingSoonPage title="Technician Ticket View" />}
          />
          <Route
            path={ROUTE.ultrauserTicketAdmin}
            element={<ComingSoonPage title="Admin Ticket View" />}
          />
          <Route
            path={ROUTE.ultrauserHistory}
            element={<CustomerHistoryPage />}
          />
          <Route path={ROUTE.ultrauserMenu} element={<UltrauserMenuPage />} />
          <Route path={ROUTE.ultrauserUsers} element={<ManageUsersPage />} />
          <Route path={ROUTE.ultrauserCompany} element={<CompanyListPage />} />
        </Route>
      </Route>

      {/* UNCOMMAND HERE */}

      {/* Technician Routes */}
      <Route element={<ProtectedRoute allowedRoles={["technician"]} />}>
        <Route element={<MainLayout />}>
          <Route path={ROUTE.technicianDashboard} element={<TechnicianDashboardPage />} />
          {/* <Route path={ROUTE.technicianTicket} element={<technicianTicket />} /> */}
        </Route>
      </Route>

      {/* Admin Routes */}
      {/* <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route element={<MainLayout />}>
          <Route path={ROUTE.adminDashboard} element={<adminDashboard />} />
          <Route path={ROUTE.adminTicket} element={<adminTicket />} />
        </Route>
      </Route> */}

      {/* Wildcard */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
