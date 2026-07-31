import { O } from "./ticketTheme";

export default function TicketChatMessage({ comment, user, role, ticket, norm, formatTicketDateTime, t, csAgents = [] }) {
  const isMine = comment.senderId && user?.id && comment.senderId === user.id;

  // Deteksi role sender: prioritaskan senderRole dari backend (paling andal),
  // fallback ke daftar agent / nama vs ticket (untuk data lama / realtime)
  const senderRole = (comment.senderRole || "").trim().toLowerCase();
  const isAgentByRole = senderRole === "cs_agent" || senderRole === "admin";
  const isTechByRole = senderRole === "technician";

  const isKnownAgent =
    comment.senderId &&
    csAgents?.some((a) => a.id && a.id === comment.senderId);
  const isKnownAgentByName =
    norm(comment.senderName) &&
    csAgents?.some((a) => a.name && norm(a.name) === norm(comment.senderName));
  const isAgentSender =
    isAgentByRole ||
    isKnownAgent ||
    isKnownAgentByName ||
    (norm(ticket?.solver) && norm(comment.senderName) === norm(ticket?.solver)) ||
    (norm(ticket?.handler) && norm(comment.senderName) === norm(ticket?.handler));
  const isTechSender =
    !isAgentSender &&
    (isTechByRole ||
      ((comment.senderId && ticket?.technicianId && comment.senderId === ticket.technicianId) ||
        (norm(ticket?.technician) && norm(comment.senderName) === norm(ticket?.technician))));
  const isCustomerSender = !isAgentSender && !isTechSender && !isMine;

  // Bubble CS agent = sender terdeteksi agent ATAU pesan sendiri oleh cs_agent/admin
  const isAdminOrAgent = role === "cs_agent" || role === "admin";
  const isOwnTechMsg = isMine && role === "technician";
  const isOwnCustomerMsg = isMine && role === "customer";
  const isOwnAgentMsg = isMine && isAdminOrAgent;
  const isAgentBubble = isAgentSender || isOwnAgentMsg;

  const showTechLabel = isTechSender && role !== "technician";
  // Label CS Agent muncul untuk semua bubble agent (termasuk admin), kecuali pesan sendiri
  const showAgentLabel = isAgentBubble && !isMine;
  const showCustomerLabel = isCustomerSender && role !== "customer";

  const techBlue = "#2563EB";
  const techBlueBg = "#EFF6FF";
  const techBlueBorder = "#BFDBFE";
  // Gaya soft ala technician (biru muda) tapi untuk customer (hijau muda)
  const customerGreen = "#16A34A";
  const customerGreenBg = "#F0FDF4";
  const customerGreenBorder = "#BBF7D0";
  // Oranye muda (soft) untuk CS agent / admin di kiri; solid untuk bubble kanan (isMine)
  const agentOrange = O[500];
  const agentOrangeBg = O[50];
  const agentOrangeBorder = O[200];
  const myColor =
    isOwnTechMsg ? techBlue : isOwnCustomerMsg ? customerGreen : agentOrange;

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
            background: isTechSender
              ? techBlueBg
              : isCustomerSender
                ? customerGreenBg
                : isAgentSender
                  ? agentOrangeBg
                  : "#E5E7EB",
            border: isTechSender
              ? `1px solid ${techBlueBorder}`
              : isCustomerSender
                ? `1px solid ${customerGreenBorder}`
                : isAgentSender
                  ? `1px solid ${agentOrangeBorder}`
                  : "1px solid #E5E7EB",
            boxShadow: isTechSender
              ? `0 1px 3px rgba(37,99,235,0.25)`
              : isCustomerSender
                ? `0 1px 3px rgba(22,163,74,0.25)`
                : isAgentSender
                  ? `0 1px 3px rgba(255,128,64,0.25)`
                  : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            fontWeight: "700",
            color: isTechSender ? techBlue : isCustomerSender ? customerGreen : isAgentSender ? agentOrange : "#6B7280",
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
              ? agentOrangeBg
              : isTechSender
                ? techBlueBg
                : customerGreenBg,
          border: isMine
            ? "none"
            : isAgentSender
              ? `1px solid ${agentOrangeBorder}`
              : isTechSender
                ? `1px solid ${techBlueBorder}`
                : `1px solid ${customerGreenBorder}`,
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
              color: isMine
                ? "rgba(255,255,255,0.9)"
                : isAgentBubble
                  ? agentOrange
                  : isTechSender
                    ? techBlue
                    : customerGreen,
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
                background: agentOrangeBg,
                color: agentOrange,
                border: `1px solid ${agentOrangeBorder}`,
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
                background: customerGreenBg,
                color: customerGreen,
                border: `1px solid ${customerGreenBorder}`,
              }}
            >
              Customer
            </span>
          )}
          <span
            style={{
              fontSize: "12px",
              color: isMine ? "rgba(255,255,255,0.65)" : "#6B7280",
            }}
          >
            {formatTicketDateTime(comment.createdAt)}
          </span>
        </div>
        <p
          style={{
            fontSize: "14px",
            color: isMine ? "white" : "#374151",
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
