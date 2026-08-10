import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getTicketsPreview } from "../dashboard.service";
import { formatTicketDate } from "../../ticket/ticket.schema";

const STATUS_BADGE = {
  Solved: { bg: "#E8F5E9", color: "#2E7D32" },
  Progress: { bg: "#FFF3E0", color: "#E65100" },
  Waiting: { bg: "#E3F2FD", color: "#1565C0" },
};

const Badge = ({ label, palette }) => (
  <span
    style={{
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: "999px",
      background: palette?.bg ?? "#F5F5F5",
      color: palette?.color ?? "#555",
      fontSize: "12px",
      fontWeight: "600",
      whiteSpace: "nowrap",
    }}
  >
    {label}
  </span>
);

export default function RecentTicketsCard({ filters, onDetailClick }) {
  const { t } = useTranslation();

  const { data: tickets, isLoading } = useQuery({
    queryKey: ["tickets-preview-recent", filters],
    queryFn: () => getTicketsPreview(filters),
    staleTime: 1000 * 60 * 2,
  });

  const recentTickets = (tickets ?? []).slice(0, 5);

  return (
    <div
      className="chart-card-mobile"
      style={{
        background: "white",
        border: "1px solid #E5E7EB",
        borderRadius: "12px",
        padding: "20px 24px",
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ fontSize: "16px", fontWeight: "700", color: "#111827", marginBottom: "2px" }}>
        {t("pages.dashboard.recentTicketsTitle")}
      </div>
      <div style={{ fontSize: "13px", color: "#6B7280", marginBottom: "16px" }}>
        {t("pages.dashboard.recentTicketsSubtitle")}
      </div>

      {isLoading ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#999", fontSize: "14px" }}>
          {t("pages.dashboard.loadingChart")}
        </div>
      ) : recentTickets.length === 0 ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#999", fontSize: "14px" }}>
          {t("pages.dashboard.noTicketsFound")}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {recentTickets.map((ticket) => (
            <div
              key={ticket.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                padding: "10px 4px",
                borderBottom: "1px solid #f5f5f5",
              }}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "500",
                    color: "#333",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {ticket.subject ?? "-"}
                </div>
                <div style={{ fontSize: "12px", color: "#999", marginTop: "2px" }}>
                  #{ticket.id} · {formatTicketDate(ticket.createdAt)}
                </div>
              </div>

              <Badge label={ticket.status ?? "-"} palette={STATUS_BADGE[ticket.status]} />

              <button
                onClick={() => onDetailClick(ticket)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: "1.5px solid #FF8040",
                  background: "white",
                  color: "#FF8040",
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {t("pages.dashboard.previewDetail")}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}