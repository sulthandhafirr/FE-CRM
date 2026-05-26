import { createElement, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MdChat, MdCheckCircle, MdConfirmationNumber, MdHourglassBottom, MdHourglassDisabled, MdHourglassEmpty, MdListAlt, MdPending, MdPeople, MdSupportAgent, MdTaskAlt } from "react-icons/md";
import { useTranslation } from "react-i18next";
import ChatBot from "../../../components/ui/ChatBot";
import { getDashboardStats } from "../dashboard.service";
import { useAuth } from "../../../hooks/useAuth";

export default function CustomerDashboardPage() {
  const { t } = useTranslation();
  const { name } = useAuth();
  const [chatOpen, setChatOpen] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
    staleTime: 1000 * 60 * 5, // 5 Minutes
    refetchOnWindowFocus: false,
  });

  return (
    <div
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <style>{`
        @media (max-width: 767px) {
          .dashboard-container { padding: 14px !important; }
          .stat-grid-responsive { grid-template-columns: 1fr 1fr !important; gap: 10px !important; }
          .chart-row-responsive { flex-direction: column !important; gap: 12px !important; }
          .stat-card-mobile { padding: 14px !important; border-radius: 14px !important; }
          .chart-card-mobile { border-radius: 14px !important; min-height: auto !important; }
        }
        @media (min-width: 768px) {
          .dashboard-container { padding: 15px 30px 30px 30px !important; }
          .stat-grid-responsive { grid-template-columns: 1fr 1fr 1fr !important; gap: 20px !important; }
          .chart-row-responsive { flex-direction: row !important; gap: 20px !important; }
          .stat-card-mobile { padding: 25px !important; border-radius: 12px !important; }
          .chart-card-mobile { border-radius: 12px !important; min-height: 400px !important; }
        }
      `}</style>
      <div
        className="dashboard-container"
        style={{ flex: 1, overflowY: "auto" }}
      >
        {/* Welcome Message */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "24px", fontWeight: "700", color: "#333" }}>
            {t("pages.dashboard.welcome")}, {name ?? "#"}
          </div>
          {/* <div style={{ fontSize: "14px", color: "#999", marginTop: "4px" }}>
            {t("pages.dashboard.welcomeSubtitle")}
          </div> */}
        </div>

        {/* Top Cards Row */}
        <div style={{ display: "grid", marginBottom: "20px" }} className="stat-grid-responsive">
          <div className="stat-card-mobile" style={{
            background: "white",
            border: "2px solid #FF8040",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <div style={{ fontSize: "16px", color: "#333", fontWeight: "500" }}>
                {t("pages.dashboard.totalTechnician")}
              </div>
              {createElement(MdPeople, { size: 22, color: "#FF8040" })}
            </div>
            <div style={{ fontSize: "36px", fontWeight: "700", color: "#FF8040" }}>
              {statsLoading ? (
                <span style={{ fontSize: "20px", color: "#ddd" }}>—</span>
              ) : (
                (stats?.totalTechnician ?? 0)
              )}
            </div>
          </div>

          <div className="stat-card-mobile" style={{
            background: "white",
            border: "2px solid #FF8040",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <div style={{ fontSize: "16px", color: "#333", fontWeight: "500" }}>
                {t("pages.dashboard.totalCsAgent")}
              </div>
              {createElement(MdSupportAgent, { size: 22, color: "#FF8040" })}
            </div>
            <div style={{ fontSize: "36px", fontWeight: "700", color: "#FF8040" }}>
              {statsLoading ? (
                <span style={{ fontSize: "20px", color: "#ddd" }}>—</span>
              ) : (
                (stats?.totalCsAgent ?? 0)
              )}
            </div>
          </div>

          <div className="stat-card-mobile" style={{
            background: "white",
            border: "2px solid #FF8040",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <div style={{ fontSize: "16px", color: "#333", fontWeight: "500" }}>
                {t("pages.dashboard.solvedTicket")}
              </div>
              {createElement(MdTaskAlt, { size: 22, color: "#FF8040" })}
            </div>
            <div style={{ fontSize: "36px", fontWeight: "700", color: "#FF8040" }}>
              {statsLoading ? (
                <span style={{ fontSize: "20px", color: "#ddd" }}>—</span>
              ) : (
                (stats?.solvedTicket ?? 0)
              )}
            </div>
          </div>

          <div className="stat-card-mobile" style={{
            background: "white",
            border: "2px solid #FF8040",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <div style={{ fontSize: "16px", color: "#333", fontWeight: "500" }}>
                {t("pages.dashboard.activeTicket")}
              </div>
              {createElement(MdHourglassEmpty, { size: 22, color: "#FF8040" })}
            </div>
            <div style={{ fontSize: "36px", fontWeight: "700", color: "#FF8040" }}>
              {statsLoading ? (
                <span style={{ fontSize: "20px", color: "#ddd" }}>—</span>
              ) : (
                (stats?.activeTicket ?? 0)
              )}
            </div>
          </div>

          <div className="stat-card-mobile" style={{
            background: "white",
            border: "2px solid #FF8040",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <div style={{ fontSize: "16px", color: "#333", fontWeight: "500" }}>
                {t("pages.dashboard.totalTicket")}
              </div>
              {createElement(MdListAlt, { size: 22, color: "#FF8040" })}
            </div>
            <div style={{ fontSize: "36px", fontWeight: "700", color: "#FF8040" }}>
              {statsLoading ? (
                <span style={{ fontSize: "20px", color: "#ddd" }}>—</span>
              ) : (
                (stats?.totalMyTicket ?? 0)
              )}
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div style={{ display: "flex" }} className="chart-row-responsive">
          <div
            className="chart-card-mobile"
            style={{
              flex: 2,
              background: "white",
              padding: "25px",
              border: "2px solid #FF8040",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#333",
                marginBottom: "20px",
              }}
            >
              {t("pages.dashboard.ticketSolvedByAi")}
            </div>
            <div
              style={{
                height: "300px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#999",
                fontSize: "14px",
              }}
            >
              {t("pages.dashboard.lineChartPlaceholder")}
            </div>
          </div>

          <div
            className="chart-card-mobile"
            style={{
              flex: 1,
              background: "white",
              padding: "25px",
              border: "2px solid #FF8040",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#333",
                marginBottom: "20px",
              }}
            >
              {t("pages.dashboard.ticketPriority")}
            </div>
            <div
              style={{
                height: "300px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#999",
                fontSize: "14px",
              }}
            >
              {t("pages.dashboard.barChartPlaceholder")}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Chat Button */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: "#FF8040",
          border: "none",
          color: "white",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(255, 128, 64, 0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MdChat size={28} />
      </button>
      <ChatBot isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}
