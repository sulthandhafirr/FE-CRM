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
import { getDashboardStats, getTicketTrend } from "../dashboard.service";
import { useAuth } from "../../../hooks/useAuth";
import TicketStatusDonutChart from "../chart/TicketStatusDonutChart";
import TicketPriorityDonutChart from "../chart/TicketPriorityDonutChart";
import TicketIntentDonutChart from "../chart/TicketIntentDonutChart";
import TicketTrendChart from "../chart/TicketTrendChart";
import AgentLeaderboard from "../components/AgentLeaderboard";
import DateRangeFilter from "../components/DateRangeFilter";

const StatCard = ({ title, value, icon, loading }) => (
  <div
    style={{
      flex: 1,
      minWidth: 0,
      background: "white",
      padding: "16px 18px",
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
        marginBottom: "6px",
      }}
    >
      <div style={{ fontSize: "13px", color: "#333", fontWeight: "500" }}>
        {title}
      </div>
      {icon ? createElement(icon, { size: 18, color: "#FF8040" }) : null}
    </div>
    <div style={{ fontSize: "24px", fontWeight: "700", color: "#FF8040" }}>
      {loading ? (
        <span style={{ fontSize: "16px", color: "#ddd" }}>—</span>
      ) : (
        (value ?? 0)
      )}
    </div>
  </div>
);

const ChartPanel = ({ title, children }) => (
  <div
    style={{
      background: "white",
      padding: "14px 16px",
      borderRadius: "12px",
      border: "2px solid #FF8040",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      flex: 1,
      minWidth: 0,
      overflow: "hidden",
    }}
  >
    <div
      style={{
        fontSize: "14px",
        fontWeight: "600",
        color: "#333",
        marginBottom: "6px",
      }}
    >
      {title}
    </div>
    {children}
  </div>
);

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const { name } = useAuth();
  const [chatOpen, setChatOpen] = useState(false);
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats", dateRange.startDate, dateRange.endDate],
    queryFn: () => getDashboardStats(dateRange.startDate, dateRange.endDate),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const { data: trend, isLoading: trendLoading } = useQuery({
    queryKey: ["ticket-trend", dateRange.startDate, dateRange.endDate],
    queryFn: () => getTicketTrend(dateRange.startDate, dateRange.endDate),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const handleDateApply = (startDate, endDate) => {
    setDateRange({ startDate, endDate });
  };

  return (
    <div
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          padding: "24px 30px",
          flex: 1,
          overflowY: "auto",
        }}
      >
        {/* Welcome Message */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "14px",
          }}
        >
          <div style={{ fontSize: "22px", fontWeight: "700", color: "#333" }}>
            {t("pages.dashboard.welcome")}, {name ?? "#"}
          </div>
          <DateRangeFilter onApply={handleDateApply} />
        </div>

        {/* Stat Cards Row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "12px",
            marginBottom: "14px",
          }}
        >
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

        {/* Leaderboard + Charts Row */}
        <div
          style={{
            display: "flex",
            gap: "14px",
            alignItems: "stretch",
            minWidth: 0,
            marginBottom: "14px",
          }}
        >
          <div style={{ flex: 1.2, display: "flex", minWidth: 0 }}>
            <AgentLeaderboard
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
            />
          </div>

          <div
            style={{
              flex: 1,
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "14px",
              minWidth: 0,
            }}
          >
            <ChartPanel title={t("pages.dashboard.ticketByStatus")}>
              <TicketStatusDonutChart
                ticketByStatus={stats?.ticketByStatus}
                loading={statsLoading}
              />
            </ChartPanel>
            <ChartPanel title={t("pages.dashboard.ticketPriority")}>
              <TicketPriorityDonutChart
                ticketByPriority={stats?.ticketByPriority}
                loading={statsLoading}
              />
            </ChartPanel>
          </div>
        </div>

        {/* Intent chart — full width own row since it's a 3rd donut, keeps the row above from getting cramped */}
        <div style={{ marginBottom: "14px" }}>
          <ChartPanel title={t("pages.dashboard.ticketIntent")}>
            <TicketIntentDonutChart
              ticketByIntent={stats?.ticketByIntent}
              loading={statsLoading}
            />
          </ChartPanel>
        </div>

        {/* Trend Chart — full width */}
        <ChartPanel title={t("pages.dashboard.ticketTrend")}>
          <TicketTrendChart trend={trend} loading={trendLoading} />
        </ChartPanel>
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