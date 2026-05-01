import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../Sidebar";
import LanguageToggle from "../ui/LanguageToggle";
import BottomNav from "../ui/BottomNav";
import { ROUTE } from "../../app/routes";

const routeToMenuKey = {
  [ROUTE.customerDashboard]: "dashboard",
  [ROUTE.customerTicket]: "ticket",
  [ROUTE.customerHistory]: "history",
  [ROUTE.agentDashboard]: "dashboard",
  [ROUTE.agentTicket]: "ticket",
};

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState(
    routeToMenuKey[location.pathname] || "dashboard",
  );

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#f5f5f5",
      }}
    >
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
      `}</style>
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="desktop-sidebar-wrapper">
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
        />
      </div>

      {/* Main content - responsive padding for bottom nav on mobile */}
      <main
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          paddingBottom: 0,
        }}
      >
        <style>{`
          @media (max-width: 767px) {
            main { padding-bottom: 80px; }
          }
        `}</style>
        <LanguageToggle />
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation - hidden on desktop */}
      <BottomNav activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
    </div>
  );
}
