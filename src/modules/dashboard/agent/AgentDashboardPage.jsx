import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  MdAvTimer,
  MdChat,
  MdOutlineWatchLater,
  MdPeople,
  MdSupportAgent,
} from "react-icons/md";
import { useTranslation } from "react-i18next";
import ChatBot from "../../../components/ui/ChatBot";
import { getDashboardStats, getTicketTrend } from "../dashboard.service";
import { formatDuration } from "../../ticket/ticket.schema";
import AgentPerformance from "../components/AgentPerformance";
import TicketStatusDonutChart from "../chart/TicketStatusDonutChart";
import TicketPriorityDonutChart from "../chart/TicketPriorityDonutChart";
import TicketIntentDonutChart from "../chart/TicketIntentDonutChart";
import TicketTrendChart from "../chart/TicketTrendChart";
import { useAuth } from "../../../hooks/useAuth";
import DateRangeFilter from "../components/DateRangeFilter";
import TicketPreviewModal from "../components/TicketPreviewModal";
import { useNavigate } from "react-router-dom";
import { ROUTE } from "../../../app/routes";
import { StatCard } from "../components/StatCard";
import { ChartPanel } from "../components/ChartPanel";

export default function AgentDashboardPage() {
  const { t } = useTranslation();
  const { name } = useAuth();
  const [chatOpen, setChatOpen] = useState(false);
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
  const navigate = useNavigate();
  const [previewFilters, setPreviewFilters] = useState(null);
  const [previewTitle, setPreviewTitle] = useState("");

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

  const openPreview = (filters, title) => {
    setPreviewFilters(filters);
    setPreviewTitle(title);
  };

  const handleDetailClick = (ticket) => {
    navigate(ROUTE.agentTicketDetail.replace(":ticketId", ticket.id));
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

        {/* Stat Cards Row — compact 5-across grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "12px",
            marginBottom: "14px",
          }}
        >
          <StatCard
            title={t("pages.dashboard.totalTechnician")}
            value={stats?.totalTechnician}
            icon={MdPeople}
            loading={statsLoading}
          />
          <StatCard
            title={t("pages.dashboard.totalCsAgent")}
            value={stats?.totalCsAgent}
            icon={MdSupportAgent}
            loading={statsLoading}
          />
          <StatCard
            title={t("pages.dashboard.totalTicket")}
            value={stats?.totalTicket}
            icon={MdChat}
            loading={statsLoading}
          />
          <StatCard
            title={t("pages.dashboard.myAvgResponseTime")}
            value={
              stats?.myAvgResponseTime != null
                ? formatDuration(Math.floor(stats.myAvgResponseTime))
                : "-"
            }
            icon={MdOutlineWatchLater}
            loading={statsLoading}
          />
          <StatCard
            title={t("pages.dashboard.myAvgResolutionTime")}
            value={
              stats?.myAvgResolutionTime != null
                ? formatDuration(Math.floor(stats.myAvgResolutionTime))
                : "-"
            }
            icon={MdAvTimer}
            loading={statsLoading}
          />
        </div>

        {/* My Performance — sized to content, no more forced tall min-height */}
        <div style={{ marginBottom: "14px" }}>
          <AgentPerformance
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
          />
        </div>

        {/* Status / Priority / Intent — 3-column row instead of stacked */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "14px",
            marginBottom: "14px",
          }}
        >
          <TicketStatusDonutChart
            ticketByStatus={stats?.ticketByStatus}
            loading={statsLoading}
            onSliceClick={(status) =>
              openPreview({ status, ...dateRange }, `Tickets: ${status}`)
            }
          />
          <TicketPriorityDonutChart
            ticketByPriority={stats?.ticketByPriority}
            loading={statsLoading}
            onSliceClick={(priority) =>
              openPreview({ priority, ...dateRange }, `Tickets: ${priority}`)
            }
          />
          <TicketIntentDonutChart
            ticketByIntent={stats?.ticketByIntent}
            loading={statsLoading}
            onSliceClick={(intentKey) =>
              openPreview({ intentKey, ...dateRange }, `Tickets: ${intentKey}`)
            }
          />
        </div>

        {/* Trend Chart — full width, shorter */}
        <ChartPanel title={t("pages.dashboard.ticketTrend")}>
          <TicketTrendChart
            trend={trend}
            loading={trendLoading}
            onPointClick={(range, label) =>
              openPreview({ ...range }, `Tickets: ${label}`)
            }
          />
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
      <TicketPreviewModal
        open={!!previewFilters}
        onClose={() => setPreviewFilters(null)}
        title={previewTitle}
        filters={previewFilters}
        onDetailClick={handleDetailClick}
      />
    </div>
  );
}
