import { getStatusColor, getPriorityColor, formatTicketDate } from "../ticket.schema";
import { useTranslation } from "react-i18next";

export default function TicketCard({ ticket, onAction, actionLabel }) {
  const { t } = useTranslation();
  const label = actionLabel ?? t("pages.ticketCard.view");
  return (
    <div
      style={{
        background: "white",
        borderRadius: "10px",
        padding: "16px 20px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 600,
            color: "#333",
            marginBottom: 4,
            fontSize: 14,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          #{ticket.id} — {ticket.subject || ticket.name}
        </div>
        <div style={{ display: "flex", gap: 12, fontSize: 12, flexWrap: "wrap" }}>
          {ticket.priority && (
            <span style={{ color: getPriorityColor(ticket.priority), fontWeight: 500 }}>
              {ticket.priority}
            </span>
          )}
          <span style={{ color: getStatusColor(ticket.status), fontWeight: 600 }}>
            {ticket.status}
          </span>
          {(ticket.createdAt || ticket.rawDate) && (
            <span style={{ color: "#666" }}>
              {formatTicketDate(ticket.createdAt || ticket.rawDate)}
            </span>
          )}
          {ticket.handler && (
            <span style={{ color: "#999" }}>
              {t("pages.ticketCard.handler", { name: ticket.handler })}
            </span>
          )}
        </div>
      </div>

      {onAction && (
        <button
          onClick={onAction}
          style={{
            background: "#FF8040",
            color: "white",
            border: "none",
            padding: "6px 14px",
            borderRadius: "6px",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: 13,
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </button>
      )}
    </div>
  );
}
