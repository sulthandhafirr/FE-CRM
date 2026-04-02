import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../Sidebar";
import LanguageToggle from "../ui/LanguageToggle";
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
        overflow: "hidden",
      }}
    >
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
      />
      <main style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        <LanguageToggle />
        <Outlet />
      </main>
    </div>
  );
}
