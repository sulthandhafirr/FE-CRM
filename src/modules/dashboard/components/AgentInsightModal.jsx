import { Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import { MdClose } from "react-icons/md";
import { useTranslation } from "react-i18next";
import { formatDuration } from "../../ticket/ticket.schema";

const REASON_STYLE = {
  slowResponse: { bg: "#FFF3E0", color: "#E65100" },
  slowResolution: { bg: "#FFF3E0", color: "#E65100" },
  frequentBreaches: { bg: "#FFEBEE", color: "#C62828" },
  consistentPerformance: { bg: "#E8F5E9", color: "#2E7D32" },
};

export default function AgentInsightModal({ agent, open, onClose }) {
  const { t } = useTranslation();

  if (!agent) return null;

  const reasonStyle =
    REASON_STYLE[agent.topReasonKey] ?? REASON_STYLE.consistentPerformance;

  const responseTime =
    agent?.avgResponseTimeSec != null
      ? formatDuration(Math.floor(agent.avgResponseTimeSec))
      : "-";
  const resolutionTime =
    agent?.avgResolutionTimeSec != null
      ? formatDuration(Math.floor(agent.avgResolutionTimeSec))
      : "-";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span>{agent.agentName}</span>
        <IconButton size="small" onClick={onClose}>
          <MdClose size={18} />
        </IconButton>
      </DialogTitle>

      <DialogContent style={{ paddingBottom: "24px" }}>
        {/* Score */}
        <div
          style={{
            fontSize: "36px",
            fontWeight: "800",
            color: "#FF8040",
            marginBottom: "4px",
          }}
        >
          {Number(agent.avgScore).toFixed(2)}
        </div>
        <div style={{ fontSize: "13px", color: "#777", marginBottom: "16px" }}>
          {t("pages.dashboard.leaderboardScore")}
        </div>

        {/* Reason tag */}
        <div
          style={{
            display: "inline-block",
            padding: "6px 14px",
            borderRadius: "999px",
            background: reasonStyle.bg,
            color: reasonStyle.color,
            fontSize: "13px",
            fontWeight: "600",
            marginBottom: "20px",
          }}
        >
          {t(`pages.dashboard.topReason.${agent.topReasonKey}`)}
        </div>

        {/* Stats grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
          }}
        >
          <div
            style={{
              background: "#fafafa",
              border: "1px solid #f0f0f0",
              borderRadius: "10px",
              padding: "12px 14px",
            }}
          >
            <div style={{ fontSize: "11px", color: "#777", fontWeight: "600" }}>
              {t("pages.dashboard.leaderboardTickets")}
            </div>
            <div style={{ fontSize: "18px", fontWeight: "700", color: "#333" }}>
              {agent.totalTickets ?? 0}
            </div>
          </div>

          <div
            style={{
              background: "#fafafa",
              border: "1px solid #f0f0f0",
              borderRadius: "10px",
              padding: "12px 14px",
            }}
          >
            <div style={{ fontSize: "11px", color: "#777", fontWeight: "600" }}>
              {t("pages.dashboard.leaderboardSlaBreached")}
            </div>
            <div style={{ fontSize: "18px", fontWeight: "700", color: "#333" }}>
              {agent.slaBreachedCount ?? 0}{" "}
              <span style={{ fontSize: "13px", fontWeight: "500", color: "#999" }}>
                ({agent.slaBreachRate ?? 0}%)
              </span>
            </div>
          </div>

          <div
            style={{
              background: "#fafafa",
              border: "1px solid #f0f0f0",
              borderRadius: "10px",
              padding: "12px 14px",
            }}
          >
            <div style={{ fontSize: "11px", color: "#777", fontWeight: "600" }}>
              {t("pages.dashboard.leaderboardResponseTime")}
            </div>
            <div style={{ fontSize: "18px", fontWeight: "700", color: "#333" }}>
              {responseTime}
            </div>
          </div>

          <div
            style={{
              background: "#fafafa",
              border: "1px solid #f0f0f0",
              borderRadius: "10px",
              padding: "12px 14px",
            }}
          >
            <div style={{ fontSize: "11px", color: "#777", fontWeight: "600" }}>
              {t("pages.dashboard.leaderboardResolutionTime")}
            </div>
            <div style={{ fontSize: "18px", fontWeight: "700", color: "#333" }}>
              {resolutionTime}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}