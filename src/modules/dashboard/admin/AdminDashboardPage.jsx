import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  MdPeople,
  MdSupportAgent,
  MdConfirmationNumber,
  MdBuild,
  MdHourglassTop,
} from "react-icons/md";
import { useTranslation } from "react-i18next";
import ChatFab from "../../../components/ui/ChatFab";
import { getDashboardStats, getTicketTrend } from "../dashboard.service";
import { useAuth } from "../../../hooks/useAuth";
import TicketStatusDonutChart from "../chart/TicketStatusDonutChart";
import TicketPriorityDonutChart from "../chart/TicketPriorityDonutChart";
import TicketIntentDonutChart from "../chart/TicketIntentDonutChart";
import TicketTrendChart from "../chart/TicketTrendChart";
import AgentLeaderboard from "../components/AgentLeaderboard";
import DateRangeFilter from "../components/DateRangeFilter";
import AnimatedNumber from "../../../components/ui/AnimatedNumber";
import InsightCarousel from "../../../components/ui/InsightCarousel";
import TicketPreviewModal from "../components/TicketPreviewModal";
import { isResolvedStatus } from "../../ticket/ticket.schema";
import { useNavigate } from "react-router-dom";
import { ROUTE } from "../../../app/routes";
import { StatCard } from "../components/StatCard";
import { ChartPanel } from "../components/ChartPanel";

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const { name } = useAuth();
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const navigate = useNavigate();
  const [previewFilters, setPreviewFilters] = useState(null);
  const [previewTitle, setPreviewTitle] = useState("");

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats", dateRange.startDate, dateRange.endDate],
    queryFn: () => getDashboardStats(dateRange.startDate, dateRange.endDate),
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  });

  const { data: trend, isLoading: trendLoading } = useQuery({
    queryKey: ["ticket-trend", dateRange.startDate, dateRange.endDate],
    queryFn: () => getTicketTrend(dateRange.startDate, dateRange.endDate),
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  });

  const handleDateApply = (startDate, endDate) => {
    setDateRange({ startDate, endDate });
  };

  const openPreview = (filters, title) => {
    setPreviewFilters(filters);
    setPreviewTitle(title);
  };

  const handleDetailClick = (ticket) => {
    const targetRoute = isResolvedStatus(ticket.status)
      ? ROUTE.adminTicketSolved
      : ROUTE.adminTicketActive;
    navigate(targetRoute, { state: { openTicketId: ticket.id } });
  };

  const insights = useMemo(() => {
    if (!stats) return [];

    const result = [];
    const totalTicket = stats?.totalTicket ?? 0;
    const solved = stats?.ticketByStatus?.solved ?? 0;
    const progress = stats?.ticketByStatus?.progress ?? 0;
    const waiting = stats?.ticketByStatus?.waiting ?? 0;
    const csAgent = stats?.totalCsAgent ?? 0;

    result.push({
      title: "Summary",
      badge: "Overview",
      badgeColor: "rgba(59,130,246,0.2)",
      content: `Total: ${totalTicket} tickets. ${solved} resolved, ${progress} in progress, ${waiting} waiting.`,
    });

    result.push({
      title: "Performance Tip",
      badge: "Highlight",
      badgeColor: "rgba(16,185,129,0.2)",
      content: `Your team of ${csAgent} CS agents are managing ${totalTicket} tickets in this period.`,
    });

    if (trend?.data?.length > 1) {
      const data = trend.data;
      const first = Number(data[0]?.count ?? 0);
      const last = Number(data[data.length - 1]?.count ?? 0);
      const diff = last - first;
      const pct = first > 0 ? Math.round((diff / first) * 100) : 0;
      const direction = diff > 0 ? "increased" : "decreased";
      result.push({
        title: "Trend Insight",
        badge: diff > 0 ? "Up" : "Down",
        badgeColor: diff > 0 ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.2)",
        content: `Ticket volume has ${direction} by ${Math.abs(pct)}% compared to the start of this period.`,
      });
    }

    const breachedCount = stats?.slaBreachedCount ?? 0;
    const almostBreachedCount = stats?.slaAlmostBreachedCount ?? 0;
    const isHealthy = breachedCount === 0 && almostBreachedCount === 0;

    result.push({
      title: "System Health",
      badge: isHealthy ? "All Good" : "Attention",
      badgeColor: isHealthy ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)",
      content: isHealthy
        ? "All systems operational. No SLA breaches detected."
        : `${breachedCount} ticket(s) have breached SLA. ${almostBreachedCount} approaching deadline.`,
    });

    return result;
  }, [stats, trend]);

  return (
    <div>
      <style>{`
        .stat-card:hover {
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1) !important;
        }
      `}</style>

      <div
        style={{
          padding: "24px 30px",
          flex: 1,
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "24px",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "#111827",
                letterSpacing: "-0.025em",
              }}
            >
              {t("pages.dashboard.welcome")}, {name ?? "#"}
            </div>
            <div
              style={{ fontSize: "14px", color: "#6B7280", marginTop: "4px" }}
            >
              Here&apos;s what&apos;s happening with your support operations.
            </div>
          </div>
          <div>
            <DateRangeFilter onApply={handleDateApply} />
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "16px",
            marginBottom: "24px",
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
          <StatCard
            title={t("pages.dashboard.ticketProgress")}
            value={stats?.ticketByStatus?.progress}
            icon={MdHourglassTop}
            loading={statsLoading}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "24px",
            marginBottom: "24px",
          }}
        >
          <ChartPanel title={t("pages.dashboard.ticketTrend")}>
            <TicketTrendChart
              trend={trend}
              loading={trendLoading}
              onPointClick={(range, label) =>
                openPreview({ ...range }, `Tickets: ${label}`)
              }
            />
          </ChartPanel>

          <InsightCarousel insights={insights} />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
            marginBottom: "24px",
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
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
            marginBottom: "24px",
          }}
        >
          <TicketIntentDonutChart
            ticketByIntent={stats?.ticketByIntent}
            loading={statsLoading}
            onSliceClick={(intentKey) =>
              openPreview({ intentKey, ...dateRange }, `Tickets: ${intentKey}`)
            }
          />
          <AgentLeaderboard
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
          />
        </div>
      </div>

      <ChatFab />
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
