import { O } from "./ticketTheme";

export default function TicketChatMessage({ comment, user, role, ticket, norm, formatTicketDateTime, t }) {
  const isMine = comment.senderId && user?.id && comment.senderId === user.id;

  const isAgentSender =
    norm(ticket?.solver) && norm(comment.senderName) === norm(ticket?.solver);
  const isTechSender =
    !isAgentSender &&
    norm(ticket?.technician) &&
    norm(comment.senderName) === norm(ticket?.technician);
  const isCustomerSender = !isAgentSender && !isTechSender && !isMine;

  const showTechLabel = isTechSender && role !== "technician";
  const showAgentLabel = isAgentSender && role !== "cs_agent";
  const showCustomerLabel = isCustomerSender && role !== "customer";

  const techBlue = "#2563EB";
  const techBlueBg = "#EFF6FF";
  const techBlueBorder = "#BFDBFE";
  const myColor = role === "technician" ? techBlue : role === "customer" ? "white" : O[500];

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isMine ? "flex-end" : "flex-start",
      }}
    >
      {!isMine && (
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "9999px",
            background: isTechSender ? techBlueBg : "#E5E7EB",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            fontWeight: "700",
            color: isTechSender ? techBlue : "#6B7280",
            flexShrink: 0,
            marginRight: "12px",
            marginTop: "4px",
          }}
        >
          {(comment.senderName || "?")
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)}
        </div>
      )}

      <div
        style={{
          maxWidth: "85%",
          borderRadius: "16px",
          borderBottomLeftRadius: isMine ? undefined : "4px",
          borderBottomRightRadius: isMine ? "4px" : undefined,
          padding: "20px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          background: isMine
            ? myColor
            : isAgentSender
              ? O[500]
              : isTechSender
                ? techBlueBg
                : "white",
          border: isMine && role === "customer"
            ? "1px solid #E5E7EB"
            : isMine || isAgentSender
              ? "none"
              : isTechSender
                ? `1px solid ${techBlueBorder}`
                : "1px solid #E5E7EB",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "12px",
          }}
        >
          <span
            style={{
              fontWeight: "600",
              fontSize: "14px",
              color: isMine && role === "customer"
                ? "#111827"
                : isMine || isAgentSender
                  ? "rgba(255,255,255,0.9)"
                  : isTechSender
                    ? techBlue
                    : "#111827",
            }}
          >
            {comment.senderName || t("pages.ticketDetail.unknownSender")}
          </span>
          {showTechLabel && (
            <span
              style={{
                fontSize: "10px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                padding: "2px 6px",
                borderRadius: "4px",
                background: techBlueBg,
                color: techBlue,
                border: `1px solid ${techBlueBorder}`,
              }}
            >
              Technician
            </span>
          )}
          {showAgentLabel && (
            <span
              style={{
                fontSize: "10px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                padding: "2px 6px",
                borderRadius: "4px",
                background: O[50],
                color: O[500],
                border: `1px solid ${O[200]}`,
              }}
            >
              CS Agent
            </span>
          )}
          {showCustomerLabel && (
            <span
              style={{
                fontSize: "10px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                padding: "2px 6px",
                borderRadius: "4px",
                background: "#F3F4F6",
                color: "#6B7280",
                border: "1px solid #E5E7EB",
              }}
            >
              Customer
            </span>
          )}
          <span
            style={{
              fontSize: "12px",
              color: isMine && role === "customer"
                ? "#9CA3AF"
                : isMine || isAgentSender
                  ? "rgba(255,255,255,0.65)"
                  : isTechSender
                    ? "#6B7280"
                    : "#9CA3AF",
            }}
          >
            {formatTicketDateTime(comment.createdAt)}
          </span>
        </div>
        <p
          style={{
            fontSize: "14px",
            color: isMine && role === "customer" ? "#374151" : isMine || isAgentSender ? "white" : "#374151",
            lineHeight: 1.65,
            whiteSpace: "pre-wrap",
          }}
        >
          {comment.message || "-"}
        </p>
      </div>
    </div>
  );
}
