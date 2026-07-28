import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MdChat, MdConfirmationNumber, MdCheckCircle, MdHourglassTop } from "react-icons/md";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ChatBot from "../../../components/ui/ChatBot";
import { getDashboardStats } from "../dashboard.service";
import { useAuth } from "../../../hooks/useAuth";
import TicketPriorityDonutChart from "../chart/TicketPriorityDonutChart";
import DateRangeFilter from "../components/DateRangeFilter";
import { StatCard } from "../components/StatCard";
import TicketPreviewModal from "../components/TicketPreviewModal";
import { ROUTE } from "../../../app/routes";

export default function TechnicianDashboardPage() {
  const { t } = useTranslation();
  const { name } = useAuth();
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
  const [previewFilters, setPreviewFilters] = useState(null);
  const [previewTitle, setPreviewTitle] = useState("");

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats", dateRange.startDate, dateRange.endDate],
    queryFn: () => getDashboardStats(dateRange.startDate, dateRange.endDate),
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
    navigate(ROUTE.technicianTicketDetail.replace(":ticketId", ticket.id));
  };

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
            <div style={{ fontSize: "14px", color: "#6B7280", marginTop: "4px" }}>
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
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <StatCard
            title={t("pages.dashboard.activeTicket")}
            value={stats?.activeTicket}
            icon={MdHourglassTop}
            loading={statsLoading}
          />
          <StatCard
            title={t("pages.dashboard.solvedTicket")}
            value={stats?.solvedTicket}
            icon={MdCheckCircle}
            loading={statsLoading}
          />
          <StatCard
            title={t("pages.dashboard.totalTicket")}
            value={stats?.totalMyTicket}
            icon={MdConfirmationNumber}
            loading={statsLoading}
          />
        </div>

        <TicketPriorityDonutChart
          ticketByPriority={stats?.ticketByPriority}
          loading={statsLoading}
          onSliceClick={(priority) =>
            openPreview({ priority, ...dateRange }, `Tickets: ${priority}`)
          }
        />
      </div>

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
