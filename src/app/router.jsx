import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ROUTE } from "./routes";
import { useAuth } from "../hooks/useAuth";
import MainLayout from "../components/layout/MainLayout";
import LoginPage from "../modules/auth/login/LoginPage";
import CustomerDashboardPage from "../modules/dashboard/customer/CustomerDashboardPage";
import AgentDashboardPage from "../modules/dashboard/agent/AgentDashboardPage";
import AgentTicketPage from "../modules/ticket/pages/AgentTicketPage";
import AgentPerformancePage from "../modules/history/AgentPerformancePage";
import AgentTicketViewDetailPage from "../modules/ticket/components/AgentTicketViewDetailPage";
import TechnicianDashboardPage from "../modules/dashboard/technician/TechnicianDashboardPage";
import TechnicianTicketPage from "../modules/ticket/pages/TechnicianTicketPage";
import TechnicianPerformancePage from "../modules/history/TechnicianPerformancePage";
import CustomerTicketPage from "../modules/ticket/pages/CustomerTicketPage";
import CustomerTicketViewDetailPage from "../modules/ticket/components/CustomerTicketViewDetailPage";
import CustomerHistoryPage from "../modules/history/CustomerHistoryPage";
import UltrauserMenuPage from "../modules/ultrauser/menu/UltrauserMenuPage";
import UltrauserTicketPage from "../modules/ultrauser/ticket/UltrauserTicketPage";
import UltrauserHistoryPage from "../modules/ultrauser/history/UltrauserHistoryPage";
import ManageUsersPage from "../modules/ultrauser/users/pages/ManageUsersPage";
import CompanyListPage from "../modules/ultrauser/company/pages/CompanyListPage";
import ComingSoonPage from "../components/ui/ComingSoonPage";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import NotFoundPage from "../pages/NotFoundPage";
import AdminDashboardPage from "../modules/dashboard/admin/AdminDashboardPage";
import AdminTicketPage from "../modules/ticket/pages/AdminTicketPage";
import AdminUserPerformancePage from "../modules/history/AdminUserPerformancePage";
import CustomerProfilePage from "../modules/profile/customer/CustomerProfilePage";
import AgentProfilePage from "../modules/profile/agent/AgentProfilePage";
import TechnicianProfilePage from "../modules/profile/technician/TechnicianProfilePage";
import AdminProfilePage from "../modules/profile/admin/AdminProfilePage";

function ProtectedRoute({ allowedRoles }) {
  const { user, role, trueRole, loading, verified } = useAuth();

  if (loading || (user && role === null)) return <LoadingSpinner />;
  if (!user || !verified) return <Navigate to={ROUTE.login} />;
  if (allowedRoles && !allowedRoles.includes(role) && trueRole !== "ultrauser")
    return <Navigate to={ROUTE.login} />;

  return <Outlet />;
}

const getRoleRoute = (role) => {
  if (role === "admin") return ROUTE.adminDashboard;
  if (role === "cs_agent") return ROUTE.agentDashboard;
  if (role === "ultrauser") return ROUTE.ultrauserDashboard;
  if (role === "technician") return ROUTE.technicianDashboard;
  return ROUTE.customerDashboard;
};

export default function Router() {
  const { t } = useTranslation();
  const { user, role, loading, verified } = useAuth();

  if (loading) return <LoadingSpinner />;

  return (
    <Routes>
      {/* Public Route */}
      <Route
        path={ROUTE.login}
        element={user && verified ? <Navigate to={getRoleRoute(role)} /> : <LoginPage />}
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
          <Route
            path={ROUTE.customerProfile}
            element={<CustomerProfilePage />}
          />
        </Route>
      </Route>

      {/* Agent Routes */}
      <Route element={<ProtectedRoute allowedRoles={["cs_agent"]} />}>
        <Route element={<MainLayout />}>
          <Route path={ROUTE.agentDashboard} element={<AgentDashboardPage />} />
          <Route path={ROUTE.agentTicket} element={<AgentTicketPage />} />
          <Route path={ROUTE.agentPerformance} element={<AgentPerformancePage />}/>
          <Route path={ROUTE.agentProfile} element={<AgentProfilePage />}/>
          <Route path={ROUTE.agentTicketDetail} element={<AgentTicketViewDetailPage />} />
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
            element={
              <ComingSoonPage
                title={t("pages.comingSoon.technicianTicketView")}
              />
            }
          />
          <Route
            path={ROUTE.ultrauserTicketAdmin}
            element={
              <ComingSoonPage title={t("pages.comingSoon.adminTicketView")} />
            }
          />
          <Route
            path={ROUTE.ultrauserHistory}
            element={<UltrauserHistoryPage />}
          />
          <Route
            path={ROUTE.ultrauserHistoryCustomer}
            element={<CustomerHistoryPage />}
          />
          <Route
            path={ROUTE.ultrauserHistoryAgent}
            element={<ComingSoonPage title="CS Agent History View" />}
          />
          <Route
            path={ROUTE.ultrauserHistoryTechnician}
            element={<ComingSoonPage title="Technician History View" />}
          />
          <Route
            path={ROUTE.ultrauserHistoryAdmin}
            element={<ComingSoonPage title="Admin History View" />}
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
          <Route
            path={ROUTE.technicianDashboard}
            element={<TechnicianDashboardPage />}
          />
          <Route
            path={ROUTE.technicianTicket}
            element={<TechnicianTicketPage />}
          />
          <Route
            path={ROUTE.technicianTicketDetail}
            element={<CustomerTicketViewDetailPage />}
          />
          <Route
            path={ROUTE.technicianPerformance}
            element={<TechnicianPerformancePage />}
          />
          <Route
            path={ROUTE.technicianProfile}
            element={<TechnicianProfilePage />}
          />
        </Route>
      </Route>

      {/* Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route element={<MainLayout />}>
          <Route path={ROUTE.adminDashboard} element={<AdminDashboardPage />} />
          <Route path={ROUTE.adminTicket} element={<AdminTicketPage />} />
          <Route path={ROUTE.adminUserPerformance} element={<AdminUserPerformancePage />} />
          <Route
            path={ROUTE.adminProfile}
            element={<AdminProfilePage />}
          />
        </Route>
      </Route>

      {/* Wildcard */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
