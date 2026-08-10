import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ROUTE } from "./routes";
import { useAuth } from "../hooks/useAuth";
import MainLayout from "../components/layout/MainLayout";
import LoginPage from "../modules/auth/login/LoginPage";
import CustomerDashboardPage from "../modules/dashboard/customer/CustomerDashboardPage";
import AgentDashboardPage from "../modules/dashboard/agent/AgentDashboardPage";
import AgentTicketPage from "../modules/ticket/pages/AgentTicketPage";
import AgentHistoryPage from "../modules/history/AgentHistoryPage";
// import AgentTicketViewDetailPage from "../modules/ticket/components/AgentTicketViewDetailPage";
import ModernTicketViewDetailPage from "../modules/ticket/components/ModernTicketViewDetailPage";
import TechnicianDashboardPage from "../modules/dashboard/technician/TechnicianDashboardPage";
import TechnicianTicketPage from "../modules/ticket/pages/TechnicianTicketPage";
import TechnicianHistoryPage from "../modules/history/TechnicianHistoryPage";
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
import AdminTicketSelectorPage from "../modules/ticket/pages/AdminTicketSelectorPage";
import ActiveTicketPage from "../modules/ticket/pages/admin/ActiveTicketPage";
import SolvedTicketPage from "../modules/ticket/pages/admin/SolvedTicketPage";
import AdminUserPerformancePage from "../modules/performance/pages/AdminUserPerformancePage";
import CSAgentPerformancePage from "../modules/performance/pages/admin/CSAgentPerformancePage";
import AdminTechnicianPerformancePage from "../modules/performance/pages/admin/TechnicianPerformancePage";
import CustomerPerformancePage from "../modules/performance/pages/admin/CustomerPerformancePage";
import GeneralSetupDashboardPage from "../modules/gsetup/pages/GeneralSetupDashboardPage";
import IssueAndPriorityManagementPage from "../modules/gsetup/pages/IssueAndPriorityManagementPage";
import TicketStatusPage from "../modules/gsetup/pages/TicketStatusPage";
import SlaRulesPage from "../modules/gsetup/pages/SlaRulesPage";
import RoleManagementPage from "../modules/gsetup/pages/RoleManagementPage";
import CompanySettingsPage from "../modules/gsetup/pages/CompanySettingsPage";
import TierSettingsPage from "../modules/gsetup/pages/TierSettingsPage";
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
          {/* <Route
            path={ROUTE.customerTicketDetail}
            element={<CustomerTicketViewDetailPage />}
          /> */}
          <Route
            path={ROUTE.customerTicketDetail}
            element={<ModernTicketViewDetailPage />}
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
          <Route path={ROUTE.agentHistory} element={<AgentHistoryPage />}/>
          <Route path={ROUTE.agentProfile} element={<AgentProfilePage />}/>
          <Route path={ROUTE.agentTicketDetail} element={<ModernTicketViewDetailPage />} />
          {/* <Route path={ROUTE.agentTicketDetail} element={<AgentTicketViewDetailPage />} /> */}
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
          {/* <Route
            path={ROUTE.technicianTicketDetail}
            element={<CustomerTicketViewDetailPage />}
          /> */}
          <Route
            path={ROUTE.technicianTicketDetail}
            element={<ModernTicketViewDetailPage />}
          />
          <Route
            path={ROUTE.technicianHistory}
            element={<TechnicianHistoryPage />}
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
          <Route path={ROUTE.adminTicket} element={<AdminTicketSelectorPage />} />
          <Route path={ROUTE.adminTicketActive} element={<ActiveTicketPage />} />
          <Route path={ROUTE.adminTicketSolved} element={<SolvedTicketPage />} />
          <Route
            path={ROUTE.adminTicketDetail}
            element={<ModernTicketViewDetailPage />}
          />
          <Route path={ROUTE.adminUserPerformance} element={<AdminUserPerformancePage />} />
          <Route path={ROUTE.adminGeneralSetup} element={<GeneralSetupDashboardPage />} />
          <Route path={ROUTE.adminGeneralSetupIssuePriority} element={<IssueAndPriorityManagementPage />} />
          <Route path={ROUTE.adminGeneralSetupTicketStatus} element={<TicketStatusPage />} />
          <Route path={ROUTE.adminGeneralSetupSla} element={<SlaRulesPage />} />
          <Route path={ROUTE.adminGeneralSetupRoles} element={<RoleManagementPage />} />
          <Route path={ROUTE.adminGeneralSetupCompany} element={<CompanySettingsPage />} />
          <Route path={ROUTE.adminGeneralSetupTiers} element={<TierSettingsPage />} />
          <Route path={ROUTE.adminPerformanceCsAgent} element={<CSAgentPerformancePage />} />
          <Route path={ROUTE.adminPerformanceTechnician} element={<AdminTechnicianPerformancePage />} />
          <Route path={ROUTE.adminPerformanceCustomer} element={<CustomerPerformancePage />} />
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
