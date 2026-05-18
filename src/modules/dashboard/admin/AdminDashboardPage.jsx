import { createElement, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  MdChat,
  MdPeople,
  MdSupportAgent,
  MdConfirmationNumber,
  MdBuild,
} from "react-icons/md";
import { useTranslation } from "react-i18next";
import ChatBot from "../../../components/ui/ChatBot";
import { getDashboardStats } from "../dashboard.service";
import { useAuth } from "../../../hooks/useAuth";

const StatCard = ({ title, value, icon, loading }) => (
  <div
    style={{
      flex: 1,
      background: "white",
      padding: "25px",
      borderRadius: "12px",
      border: "2px solid #FF8040",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "10px",
      }}
    >
      <div style={{ fontSize: "16px", color: "#333", fontWeight: "500" }}>
        {title}
      </div>
      {icon ? createElement(icon, { size: 22, color: "#FF8040" }) : null}
    </div>
    <div style={{ fontSize: "36px", fontWeight: "700", color: "#FF8040" }}>
      {loading ? (
        <span style={{ fontSize: "20px", color: "#ddd" }}>—</span>
      ) : (
        (value ?? 0)
      )}
    </div>
  </div>
);

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const { name } = useAuth();
  const [chatOpen, setChatOpen] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  return (
    <div
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div style={{ padding: "30px", paddingTop: "15px", flex: 1, overflowY: "auto" }}>
        {/* Welcome Message */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "24px", fontWeight: "700", color: "#333" }}>
            {t("pages.dashboard.welcome")}, {name ?? "#"}
          </div>
          {/* <div style={{ fontSize: "14px", color: "#999", marginTop: "4px" }}>
            {t("pages.dashboard.welcomeSubtitle")}
          </div> */}
        </div>
        
        {/* Top Cards Row - baris 1 */}
        <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
          <StatCard
            title={t("pages.dashboard.totalTechnician")}
            value={stats?.totalTechnician}
            icon={MdBuild}
            loading={statsLoading}
          />
          <StatCard
            title={t("pages.dashboard.totalCsAgent")}
            value={stats?.totalCsAgent}
            icon={MdSupportAgent}
            loading={statsLoading}
          />
          <StatCard
            title={t("pages.dashboard.totalCustomer")}
            value={stats?.totalCustomer}
            icon={MdPeople}
            loading={statsLoading}
          />
          <StatCard
            title={t("pages.dashboard.totalTicket")}
            value={stats?.totalTicket}
            icon={MdConfirmationNumber}
            loading={statsLoading}
          />
        </div>

        {/* Charts Row */}
        <div style={{ display: "flex", gap: "20px" }}>
          <div
            style={{
              flex: 2,
              background: "white",
              padding: "25px",
              borderRadius: "12px",
              border: "2px solid #FF8040",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              minHeight: "400px",
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
            style={{
              flex: 1,
              background: "white",
              padding: "25px",
              borderRadius: "12px",
              border: "2px solid #FF8040",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              minHeight: "400px",
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