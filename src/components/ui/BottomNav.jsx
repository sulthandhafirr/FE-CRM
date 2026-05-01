import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { ROUTE } from "../../app/routes";
import {
  MdDashboard,
  MdConfirmationNumber,
  MdHistory,
  MdPerson,
} from "react-icons/md";

export default function BottomNav({ activeMenu, setActiveMenu }) {
  const navigate = useNavigate();
  const { role } = useAuth();

  // Map role to dashboard route
  const getDashboardRoute = () => {
    if (role === "cs_agent") return ROUTE.agentDashboard;
    if (role === "technician") return ROUTE.technicianDashboard;
    if (role === "admin") return ROUTE.adminDashboard;
    if (role === "ultrauser") return ROUTE.ultrauserDashboard;
    return ROUTE.customerDashboard;
  };

  // Map role to ticket route
  const getTicketRoute = () => {
    if (role === "cs_agent") return ROUTE.agentTicket;
    if (role === "technician") return ROUTE.technicianTicket;
    if (role === "admin") return ROUTE.adminTicket;
    if (role === "ultrauser") return ROUTE.ultrauserTicket;
    return ROUTE.customerTicket;
  };

  // Map role to history route
  const getHistoryRoute = () => {
    if (role === "cs_agent") return ROUTE.agentPerformance;
    if (role === "technician") return ROUTE.technicianPerformance;
    if (role === "admin") return ROUTE.adminUserPerformance;
    if (role === "ultrauser") return ROUTE.ultrauserHistory;
    return ROUTE.customerHistory;
  };

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: MdDashboard, route: getDashboardRoute() },
    { key: "ticket", label: "Ticket", icon: MdConfirmationNumber, route: getTicketRoute() },
    { key: "history", label: "History", icon: MdHistory, route: getHistoryRoute() },
    { key: "profile", label: "Profile", icon: MdPerson, route: "#" }, // Profile TODO
  ];

  const handleNavClick = (item) => {
    setActiveMenu(item.key);
    if (item.route !== "#") {
      navigate(item.route);
    }
  };

  return (
    <>
      <style>{`
        .bottom-nav-mobile {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: #ffffff;
          border-top: 0.5px solid #e5e7eb;
          display: flex;
          padding: 10px 0 14px;
          z-index: 40;
        }
        @media (max-width: 767px) {
          .bottom-nav-mobile { display: flex !important; }
        }
        @media (min-width: 768px) {
          .bottom-nav-mobile { display: none !important; }
        }
      `}</style>
      <div className="bottom-nav-mobile">
      {navItems.map((item) => (
        <button
          key={item.key}
          onClick={() => handleNavClick(item)}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
            cursor: "pointer",
            padding: "4px 0",
            background: "none",
            border: "none",
          }}
        >
          <item.icon
            size={20}
            color={activeMenu === item.key ? "#FF8040" : "#9ca3af"}
          />
          <span
            style={{
              fontSize: "10px",
              color: activeMenu === item.key ? "#FF8040" : "#9ca3af",
              fontWeight: activeMenu === item.key ? "600" : "400",
            }}
          >
            {item.label}
          </span>
        </button>
      ))}
      </div>
    </>
  );
}
