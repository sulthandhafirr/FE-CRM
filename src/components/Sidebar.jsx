import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTranslation } from "react-i18next";
import { ROUTE } from "../app/routes";
import {
  MdDashboard,
  MdConfirmationNumber,
  MdHistory,
  MdPerson,
  MdLogout,
  MdAdminPanelSettings,
  MdSwitchAccount,
  MdWorkHistory,
  MdGroup,
  MdSettings,
  MdOutlinePayment,
} from "react-icons/md";
import { supabase } from "../lib/supabase";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useQueryClient } from "@tanstack/react-query";

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { role, trueRole, changeRole } = useAuth();
  const [showRoleModal, setShowRoleModal] = useState(false);

  const roleMenuItems = {
    customer: [
      {
        key: "dashboard",
        label: t("nav.dashboard"),
        icon: MdDashboard,
        route: ROUTE.customerDashboard,
      },
      {
        key: "ticket",
        label: t("nav.ticket"),
        icon: MdConfirmationNumber,
        route: ROUTE.customerTicket,
      },
      {
        key: "history",
        label: t("nav.history"),
        icon: MdHistory,
        route: ROUTE.customerHistory,
      },
      {
        key: "payment",
        label: t("nav.payment"),
        icon: MdOutlinePayment,
        route: ROUTE.customerPayment,
      }
    ],
    cs_agent: [
      {
        key: "dashboard",
        label: t("nav.dashboard"),
        icon: MdDashboard,
        route: ROUTE.agentDashboard,
      },
      {
        key: "ticket",
        label: t("nav.ticket"),
        icon: MdConfirmationNumber,
        route: ROUTE.agentTicket,
      },
      {
        key: "history",
        label: t("nav.performance"),
        icon: MdWorkHistory,
        route: ROUTE.agentHistory,
      },
      {
        key: "payment",
        label: t("nav.payment"),
        icon: MdOutlinePayment,
        route: ROUTE.agentPayment,
      }
    ],
    technician: [
      {
        key: "dashboard",
        label: t("nav.dashboard"),
        icon: MdDashboard,
        route: ROUTE.technicianDashboard,
      },
      {
        key: "ticket",
        label: t("nav.ticket"),
        icon: MdConfirmationNumber,
        route: ROUTE.technicianTicket,
      },
      {
        key: "history",
        label: t("nav.performance"),
        icon: MdWorkHistory,
        route: ROUTE.technicianHistory,
      },
      {
        key: "payment",
        label: t("nav.payment"),
        icon: MdOutlinePayment,
        route: ROUTE.technicianPayment,
      }
    ],
    admin: [
      {
        key: "dashboard",
        label: t("nav.dashboard"),
        icon: MdDashboard,
        route: ROUTE.adminDashboard,
      },
      {
        key: "ticket",
        label: t("nav.ticket"),
        icon: MdConfirmationNumber,
        route: ROUTE.adminTicket,
      },
      {
        key: "users",
        label: t("nav.userperformance"),
        icon: MdGroup,
        route: ROUTE.adminUserPerformance,
      },
      {
        key: "general-setup",
        label: t("nav.generalSetup"),
        icon: MdSettings,
        route: ROUTE.adminGeneralSetup,
      },
      {
        key: "payment",
        label: t("nav.payment"),
        icon: MdOutlinePayment,
        route: ROUTE.adminPayment,
      }
    ],
    ultrauser: [
      {
        key: "dashboard",
        label: t("nav.dashboard"),
        icon: MdDashboard,
        route: ROUTE.ultrauserDashboard,
      },
      {
        key: "ticket",
        label: t("nav.ticket"),
        icon: MdConfirmationNumber,
        route: ROUTE.ultrauserTicket,
      },
      {
        key: "history",
        label: t("nav.history"),
        icon: MdHistory,
        route: ROUTE.ultrauserHistory,
      },
      {
        key: "ultrauser-menu",
        label: t("nav.menu"),
        icon: MdAdminPanelSettings,
        route: ROUTE.ultrauserMenu,
      },
    ],
  };

  const ROLE_OPTIONS = [
    { value: "customer", label: t("roles.customer") },
    { value: "cs_agent", label: t("roles.cs_agent") },
    { value: "technician", label: t("roles.technician") },
    { value: "admin", label: t("roles.admin") },
    { value: "ultrauser", label: t("roles.ultrauser") },
  ];

  const getTargetRoute = (r) => {
    if (r === "cs_agent") return ROUTE.agentDashboard;
    if (r === "ultrauser") return ROUTE.ultrauserDashboard;
    if (r === "technician") return ROUTE.technicianDashboard;
    if (r === "admin") return ROUTE.adminDashboard;
    return ROUTE.customerDashboard;
  };

  const getProfileRoute = () => {
    if (role === "cs_agent") return ROUTE.agentProfile;
    if (role === "technician") return ROUTE.technicianProfile;
    if (role === "admin") return ROUTE.adminProfile;
    return ROUTE.customerProfile;
  };

  const menuItems = roleMenuItems[role] || [];

  // ── Hitung menu aktif dari URL saat ini, bukan dari klik terakhir ──
  const activeMenu = useMemo(() => {
    const matches = menuItems
      .filter((item) => item.route && location.pathname.startsWith(item.route))
      .sort((a, b) => b.route.length - a.route.length);

    if (matches.length > 0) return matches[0].key;

    const profileRoute = getProfileRoute();
    if (profileRoute && location.pathname.startsWith(profileRoute)) return "profile";

    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, role]);

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

  const queryClient = useQueryClient();

  const handleMouseEnter = (e, menuKey) => {
    if (activeMenu !== menuKey) e.currentTarget.style.background = "#f5f5f5";
  };

  const handleMouseLeave = (e, menuKey) => {
    if (activeMenu !== menuKey)
      e.currentTarget.style.background = "transparent";
  };

  const handleSignOut = async () => {
    queryClient.clear();
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
          textAlign: sidebarOpen ? "center" : "center",
        }}
      >
        {sidebarOpen ? "crm." : "c."}
      </div>

      {/* Menu Items */}
      <div style={{ flex: 1, padding: "10px" }}>
        {menuItems.map((item) => (
          <div
            key={item.key}
            onClick={() => {
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
      <div style={{ padding: "10px", position: "relative" }}>
        {/* Change Role Modal */}
        {showRoleModal && (
          <>
            <div
              onClick={() => setShowRoleModal(false)}
              style={{ position: "fixed", inset: 0, zIndex: 150 }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "calc(100% + 8px)",
                left: "0",
                background: "white",
                borderRadius: "12px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                border: "1px solid #e5e7eb",
                padding: "8px",
                zIndex: 200,
                minWidth: "200px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: "600",
                  color: "#9ca3af",
                  textTransform: "uppercase",
                  padding: "6px 8px 4px",
                  letterSpacing: "0.05em",
                }}
              >
                {t("common.switchRole")}
              </div>
              {ROLE_OPTIONS.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => {
                    changeRole(opt.value);
                    navigate(getTargetRoute(opt.value));
                    setShowRoleModal(false);
                  }}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: role === opt.value ? "700" : "500",
                    color: role === opt.value ? "#FF8040" : "#374151",
                    background: role === opt.value ? "#fff4ee" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                  onMouseOver={(e) => {
                    if (role !== opt.value)
                      e.currentTarget.style.background = "#f9fafb";
                  }}
                  onMouseOut={(e) => {
                    if (role !== opt.value)
                      e.currentTarget.style.background = "transparent";
                  }}
                >
                  {opt.label}
                  {role === opt.value && <span>&#10003;</span>}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Change Role - only visible for ultrauser */}
        {trueRole === "ultrauser" && (
          <div
            onClick={() => setShowRoleModal(!showRoleModal)}
            style={menuItemStyle("change-role")}
            onMouseOver={(e) => handleMouseEnter(e, "change-role")}
            onMouseOut={(e) => handleMouseLeave(e, "change-role")}
          >
            <span style={{ minWidth: "18px", display: "flex" }}>
              <MdSwitchAccount size={18} />
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
              {t("nav.changeRole")}
            </span>
          </div>
        )}

        <div
          onClick={() => navigate(getProfileRoute())}
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
            {t("nav.profile")}
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
              lineHeight: "21px",
              opacity: sidebarOpen ? 1 : 0,
              transition: "opacity 0.3s ease, max-width 0.3s ease",
              whiteSpace: "nowrap",
              overflow: "hidden",
              maxWidth: sidebarOpen ? "200px" : "0",
            }}
          >
            {t("common.logout")}
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