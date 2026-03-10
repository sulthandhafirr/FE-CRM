import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ROUTE } from "../router/routes";
import {
  MdDashboard,
  MdConfirmationNumber,
  MdHistory,
  MdPerson,
  MdLogout,
} from "react-icons/md";
import { supabase } from "../lib/supabase";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const roleMenuItems = {
  customer: [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: MdDashboard,
      route: ROUTE.customerDashboard,
    },
    {
      key: "ticket",
      label: "Ticket",
      icon: MdConfirmationNumber,
      route: ROUTE.customerTicket,
    },
    {
      key: "history",
      label: "History",
      icon: MdHistory,
      route: ROUTE.customerHistory,
    },
  ],
  cs_agent: [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: MdDashboard,
      route: ROUTE.agentDashboard,
    },
    {
      key: "ticket",
      label: "Ticket",
      icon: MdConfirmationNumber,
      route: ROUTE.agentTicket,
    },
  ],
  technician: [
    // tambah buat page technician disini
  ],
  admin: [
    // tambah buat page admin disini
  ],

  // ADD MORE ROLE [

  // ]
};

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  activeMenu,
  setActiveMenu,
}) {
  const navigate = useNavigate();
  const { role } = useAuth();

  const menuItems = roleMenuItems[role] || [];

  const menuItemStyle = (menuKey) => ({
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "12px 15px",
    marginBottom: "5px",
    borderRadius: "8px",
    background: activeMenu === menuKey ? "#FF8040" : "transparent",
    color: activeMenu === menuKey ? "white" : "#666",
    cursor: "pointer",
    transition: "all 0.2s",
    fontWeight: "500",
  });

  const handleMouseEnter = (e, menuKey) => {
    if (activeMenu !== menuKey) e.currentTarget.style.background = "#f5f5f5";
  };

  const handleMouseLeave = (e, menuKey) => {
    if (activeMenu !== menuKey)
      e.currentTarget.style.background = "transparent";
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate(ROUTE.login);
  };

  return (
    <div
      style={{
        width: sidebarOpen ? "220px" : "70px",
        background: "#ffffff",
        transition: "width 0.3s ease",
        boxShadow: "2px 0 5px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "25px 20px",
          fontSize: "28px",
          fontWeight: "700",
          color: "#FF8040",
          // cursor: "pointer",
          textAlign: sidebarOpen ? "center" : "center",
        }}
        // onClick={() => navigate(menuItems[0]?.route || ROUTE.login)}
      >
        {sidebarOpen ? "crm." : "c."}
      </div>

      {/* Menu Items */}
      <div style={{ flex: 1, padding: "10px" }}>
        {menuItems.map((item) => (
          <div
            key={item.key}
            onClick={() => {
              setActiveMenu(item.key);
              if (item.route) navigate(item.route);
            }}
            style={menuItemStyle(item.key)}
            onMouseOver={(e) => handleMouseEnter(e, item.key)}
            onMouseOut={(e) => handleMouseLeave(e, item.key)}
          >
            <span style={{ minWidth: "18px", display: "flex" }}>
              <item.icon size={18} />
            </span>
            <span
              style={{
                lineHeight: "18px",
                opacity: sidebarOpen ? 1 : 0,
                transition: "opacity 0.3s ease, max-width 0.3s ease",
                whiteSpace: "nowrap",
                overflow: "hidden",
                maxWidth: sidebarOpen ? "200px" : "0",
              }}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom - Profile & Logout */}
      <div style={{ padding: "10px" }}>
        <div
          onClick={() => setActiveMenu("profile")}
          style={menuItemStyle("profile")}
          onMouseOver={(e) => handleMouseEnter(e, "profile")}
          onMouseOut={(e) => handleMouseLeave(e, "profile")}
        >
          <span style={{ minWidth: "18px", display: "flex" }}>
            <MdPerson size={18} />
          </span>
          <span
            style={{
              lineHeight: "18px",
              opacity: sidebarOpen ? 1 : 0,
              transition: "opacity 0.3s ease, max-width 0.3s ease",
              whiteSpace: "nowrap",
              overflow: "hidden",
              maxWidth: sidebarOpen ? "200px" : "0",
            }}
          >
            Profile
          </span>
        </div>

        <div
          onClick={handleSignOut}
          style={menuItemStyle("logout")}
          onMouseOver={(e) => handleMouseEnter(e, "logout")}
          onMouseOut={(e) => handleMouseLeave(e, "logout")}
        >
          <span style={{ minWidth: "18px", display: "flex" }}>
            <MdLogout size={18} />
          </span>
          <span
            style={{
              lineHeight: "18px",
              opacity: sidebarOpen ? 1 : 0,
              transition: "opacity 0.3s ease, max-width 0.3s ease",
              whiteSpace: "nowrap",
              overflow: "hidden",
              maxWidth: sidebarOpen ? "200px" : "0",
            }}
          >
            Logout
          </span>
        </div>
      </div>

      {/* Toggle button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          position: "absolute",
          right: "-15px",
          top: "50%",
          transform: "translateY(-50%)",
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          background: "#FF8040",
          border: "none",
          color: "white",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "14px",
        }}
      >
        {sidebarOpen ? (
          <ChevronLeftIcon fontSize="small" />
        ) : (
          <ChevronRightIcon fontSize="small" />
        )}
      </button>
    </div>
  );
}
