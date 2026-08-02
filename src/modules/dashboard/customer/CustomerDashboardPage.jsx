import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  MdHourglassEmpty,
  MdListAlt,
  MdPeople,
  MdSupportAgent,
  MdTaskAlt,
  MdOutlineWatchLater,
  MdAvTimer,
} from "react-icons/md";
import { useTranslation } from "react-i18next";
import ChatFab from "../../../components/ui/ChatFab";
import { getDashboardStats } from "../dashboard.service";
import { useAuth } from "../../../hooks/useAuth";
import DateRangeFilter from "../components/DateRangeFilter";
import TicketStatusDonutChart from "../chart/TicketStatusDonutChart";
import TicketPreviewModal from "../components/TicketPreviewModal";
import RecentTicketsCard from "../components/RecentTicketsCard";
import { useNavigate } from "react-router-dom";
import { StatCard } from "../components/StatCard";
import { formatDuration } from "../../ticket/ticket.schema";
import { ROUTE } from "../../../app/routes";

export default function CustomerDashboardPage() {
  const { t } = useTranslation();
  const { name } = useAuth();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
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

  const handleDateApply = (startDate, endDate) => {
    setDateRange({ startDate, endDate });
  };

  const openPreview = (filters, title) => {
    setPreviewFilters(filters);
    setPreviewTitle(title);
  };

  const handleDetailClick = (ticket) => {
    navigate(ROUTE.customerTicketDetail.replace(":ticketId", ticket.id));
  };

  return (
    <div>
      <style>{`
        .stat-card:hover {
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1) !important;
        }
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
        style={{ flex: 1, overflowY: "auto", padding: "24px 30px" }}
      >
        {/* Welcome Message */}
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
          <DateRangeFilter onApply={handleDateApply} />
        </div>

        {/* Top Cards Row */}
        <div
          style={{
            display: "grid",
            marginBottom: "24px",
            gap: "16px",
            gridTemplateColumns: "repeat(5, 1fr)",
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
          {/* <StatCard
            title={t("pages.dashboard.solvedTicket")}
            value={stats?.solvedTicket}
            icon={MdTaskAlt}
            loading={statsLoading}
          />
          <StatCard
            title={t("pages.dashboard.activeTicket")}
            value={stats?.activeTicket}
            icon={MdHourglassEmpty}
            loading={statsLoading}
          /> */}
          <StatCard
            title={t("pages.dashboard.totalTicket")}
            value={stats?.totalMyTicket}
            icon={MdListAlt}
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

        <div
          className="chart-row-responsive"
          style={{ display: "flex", marginBottom: "24px" }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <TicketStatusDonutChart
              ticketByStatus={stats?.ticketByStatus}
              loading={statsLoading}
              height={420} // same as the RecentTicketsCard, might change in the future
              onSliceClick={(status) =>
                openPreview({ status, ...dateRange }, `Tickets: ${status}`)
              }
            />
          </div>
          <RecentTicketsCard
            filters={{ ...dateRange }}
            onDetailClick={handleDetailClick}
          />
        </div>
      </div>

      {/* Floating Chat Button */}
      <ChatFab />
      <TicketPreviewModal
        open={!!previewFilters}
        onClose={() => setPreviewFilters(null)}
        title={previewTitle}
        filters={previewFilters}
        onDetailClick={handleDetailClick}
        hideColumns={["priority", "intent"]}
      />
    </div>
  );
}
