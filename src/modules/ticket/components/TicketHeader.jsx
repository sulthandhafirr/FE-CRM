import { MdArrowBack, MdMoreVert } from "react-icons/md";
import { O } from "./ticketTheme";
import { Badge } from "./TicketShared";

export default function TicketHeader({
  ticket,
  ticketId,
  role,
  resolved,
  isAssignedToMe,
  isAssignedToOther,
  assigning,
  resolvingTicket,
  onAssignToMe,
  onResolveTicket,
  onBack,
  formatTicketDate,
}) {
  return (
    <div
      style={{
        background: "white",
        borderBottom: "1px solid #E5E7EB",
        padding: "10px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
        zIndex: 10,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          onClick={onBack}
          style={{
            padding: "6px",
            background: "transparent",
            border: "1px solid transparent",
            borderRadius: "8px",
            cursor: "pointer",
            color: "#6B7280",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#F9FAFB";
            e.currentTarget.style.borderColor = "#E5E7EB";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "transparent";
          }}
        >
          <MdArrowBack size={18} />
        </button>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "2px" }}>
            <h1
              style={{
                fontSize: "17px",
                fontWeight: "700",
                color: "#111827",
                letterSpacing: "-0.01em",
                lineHeight: 1.3,
              }}
            >
              {ticket.id || `#${ticketId}`}
            </h1>
            <Badge type={ticket.status}>{ticket.status}</Badge>
            <span style={{ fontSize: "11px", color: "#9CA3AF" }}>
              Created {formatTicketDate(ticket.createdAt)}
            </span>
          </div>
          <h2 style={{ fontSize: "13px", fontWeight: "500", color: "#374151" }}>
            {ticket.subject}
          </h2>
        </div>
      </div>
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        {role !== "customer" && (
          <>
            <button
              onClick={onAssignToMe}
              disabled={isAssignedToMe || isAssignedToOther || resolved || assigning}
              style={{
                padding: "5px 12px",
                background: isAssignedToMe || isAssignedToOther || resolved ? "#D1D5DB" : O[500],
                border: "none",
                color: "white",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: "500",
                whiteSpace: "nowrap",
                maxWidth: "180px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                cursor: isAssignedToMe || isAssignedToOther || resolved || assigning ? "not-allowed" : "pointer",
                boxShadow:
                  isAssignedToMe || isAssignedToOther || resolved
                    ? "none"
                    : "0 1px 3px rgba(255,128,64,0.3)",
                transition: "all 0.15s",
              }}
            >
              {assigning
                ? "Assigning..."
                : isAssignedToMe
                  ? "Assigned to you"
                  : isAssignedToOther
                    ? `Assigned to ${role === "technician" ? ticket.technician : ticket.solver}`
                    : "Assign to me"}
            </button>
            <div style={{ height: "24px", width: "1px", background: "#E5E7EB" }} />
            <button
              onClick={onResolveTicket}
              disabled={resolvingTicket || resolved || !isAssignedToMe}
              style={{
                padding: "5px 12px",
                background: resolvingTicket || resolved || !isAssignedToMe ? "#D1D5DB" : O[500],
                color: "white",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: "500",
                border: "none",
                cursor: resolvingTicket || resolved || !isAssignedToMe ? "not-allowed" : "pointer",
                boxShadow:
                  resolvingTicket || resolved || !isAssignedToMe
                    ? "none"
                    : "0 1px 3px rgba(255,128,64,0.3)",
                transition: "all 0.15s",
              }}
            >
              {resolved ? "Resolved" : resolvingTicket ? "Resolving..." : "Resolve Ticket"}
            </button>
          </>
        )}
        <button
          style={{
            padding: "5px",
            background: "white",
            border: "1px solid #E5E7EB",
            borderRadius: "10px",
            cursor: "pointer",
            color: "#6B7280",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
          }}
        >
          <MdMoreVert size={14} />
        </button>
      </div>
    </div>
  );
}
