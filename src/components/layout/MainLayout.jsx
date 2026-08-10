import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../Sidebar";
import LanguageToggle from "../ui/LanguageToggle";
import NotificationBell from "../../modules/notification/NotificationBell";
import ExportData from "../../modules/export/ExportData";
import BottomNav from "../ui/BottomNav";
import CompanyIdentity from "../ui/CompanyIdentity";
import RealtimeClock from "../ui/RealtimeClock";
import UserMenu from "../ui/UserMenu";
import { ROUTE } from "../../app/routes";
import { useAuth } from "../../hooks/useAuth";

const Divider = () => (
  <div
    style={{
      width: "1px",
      height: "32px",
      background: "#E7E9EE",
      flexShrink: 0,
    }}
  />
);

const routeToMenuKey = {
  [ROUTE.customerDashboard]: "dashboard",
  [ROUTE.customerTicket]: "ticket",
  [ROUTE.customerHistory]: "history",
  [ROUTE.agentDashboard]: "dashboard",
  [ROUTE.agentTicket]: "ticket",
  [ROUTE.agentHistory]: "history",
  [ROUTE.adminDashboard]: "dashboard",
  [ROUTE.adminTicket]: "ticket",
  [ROUTE.adminUserPerformance]: "users",
  [ROUTE.adminGeneralSetup]: "general-setup",
  [ROUTE.technicianDashboard]: "dashboard",
  [ROUTE.technicianTicket]: "ticket",
  [ROUTE.technicianHistory]: "history",
};

const resolveMenuKey = (pathname) => {
  if (pathname.startsWith(ROUTE.adminGeneralSetup)) return "general-setup";
  return routeToMenuKey[pathname] || "dashboard";
};

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const activeMenu = resolveMenuKey(location.pathname);
  const setActiveMenu = () => {};
  const { role } = useAuth();

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f5f5f5" }}>
      <style>{`
        .desktop-sidebar-wrapper {
          display: flex;
          flex-shrink: 0;
        }
        @media (max-width: 767px) {
          .desktop-sidebar-wrapper { display: none !important; }
        }
        @media (min-width: 768px) {
          .desktop-sidebar-wrapper { display: flex !important; }
        }
        main {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding-bottom: 0;
        }
        @media (max-width: 767px) {
          main {
            padding-bottom: 80px;
            position: relative;
          }
        }
        @media (max-width: 767px) {
          main button[style*="position: fixed"][style*="bottom: 30px"] {
            bottom: 100px !important;
          }
        }
      `}</style>

      {/* Desktop Sidebar */}
      <div className="desktop-sidebar-wrapper">
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
        />
      </div>

      <main>
        {/* TopBar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 20px",
          borderBottom: "1px solid #E7E9EE",
          background: "#ffffff",
          position: "sticky",
          top: 0,
          zIndex: 50,
          minHeight: "56px",
        }}>
          {/* Left: Company Identity */}
          <CompanyIdentity />

          {/* Right: Clock, Notifications, Lang, Export, User */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <RealtimeClock />

            <Divider />

            <LanguageToggle />

            <Divider />

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {role === "admin" && <ExportData />}
              <NotificationBell />
            </div>

            <Divider />

            <UserMenu />
          </div>
        </div>
        <Outlet />
      </main>

      <BottomNav activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
    </div>
  );
}