import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getAgentsRank } from "../dashboard.service";
import { formatDuration } from "../../ticket/ticket.schema";
import AgentInsightModal from "./AgentInsightModal";

// ── Compact Top Agents row — mockup style ────────────────────────────

const AgentRow = ({ agent }) => {
  const initials = agent?.agentName
    ? agent.agentName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  const responseTime =
    agent?.avgResponseTimeSec != null
      ? formatDuration(Math.floor(agent.avgResponseTimeSec))
      : "-";

  const resolutionTime =
    agent?.avgResolutionTimeSec != null
      ? formatDuration(Math.floor(agent.avgResolutionTimeSec))
      : "-";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "4px 0",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: "#F3F4F6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            fontWeight: "700",
            color: "#4B5563",
          }}
        >
          {initials}
        </div>
        <div>
          <div
            className="agent-name"
            style={{
              fontSize: "14px",
              fontWeight: "500",
              color: "#111827",
            }}
          >
            {agent?.agentName ?? "-"}
          </div>
          <div style={{ fontSize: "12px", color: "#6B7280" }}>
            {`Avg response: ${responseTime} · Avg resolution: ${resolutionTime}`}
          </div>
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div
          style={{
            fontSize: "14px",
            fontWeight: "600",
            color: "#111827",
          }}
        >
          {agent?.totalTickets ?? 0}{" "}
          <span
            style={{ fontSize: "12px", color: "#6B7280", fontWeight: "400" }}
          >
            resolved
          </span>
        </div>
        <div style={{ fontSize: "12px", color: "#DC2626", fontWeight: "500" }}>
          SLA breached: {agent?.slaBreachedCount ?? 0} (
          {agent?.slaBreachRate ?? 0}%)
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "12px",
            color: "#D97706",
            fontWeight: "500",
            justifyContent: "flex-end",
          }}
        >
          ★ {agent?.avgScore != null ? Number(agent.avgScore).toFixed(2) : "-"}
        </div>
      </div>
    </div>
  );
};

export default function AgentLeaderboard({ startDate, endDate }) {
  const { t } = useTranslation();
  const [selectedAgent, setSelectedAgent] = useState(null);

  const { data: agentRanks, isLoading: agentRanksLoading } = useQuery({
    queryKey: ["agents-rank", startDate, endDate],
    queryFn: () => getAgentsRank(startDate, endDate),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const topAgents = useMemo(() => {
    if (!Array.isArray(agentRanks)) return [];

    return [...agentRanks]
      .sort((a, b) => Number(b?.avgScore ?? 0) - Number(a?.avgScore ?? 0))
      // .slice(0, 5);
  }, [agentRanks]);

  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: "16px",
        border: "1px solid #E5E7EB",
        boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minWidth: 0,
      }}
    >
      <style>{`
      .agent-leaderboard-row:hover {
        background: #F9FAFB;
      }
      .agent-leaderboard-row:hover .agent-name {
        color: #FF8040 !important;
        text-decoration: underline;
      }
    `}</style>

      {/* Header */}
      <div
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid #F3F4F6",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#F9FAFB",
        }}
      >
        <div
          style={{
            fontSize: "14px",
            fontWeight: "600",
            color: "#111827",
          }}
        >
          {t("pages.dashboard.leaderboardTitle")}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "24px", flex: 1 }}>
        {agentRanksLoading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#999",
              fontSize: "14px",
              padding: "20px 0",
            }}
          >
            {t("pages.dashboard.loadingLeaderboard")}
          </div>
        ) : topAgents.length > 0 ? (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {topAgents.map((agent, index) => (
              <div
                key={agent.agentId ?? `${agent.agentName}-${index}`}
                className="agent-leaderboard-row"
                onClick={() => setSelectedAgent(agent)}
                style={{
                  cursor: "pointer",
                  padding: "8px 12px",
                  margin: "-8px -12px",
                  borderRadius: "10px",
                  transition: "background 0.15s ease",
                }}
              >
                <AgentRow agent={agent} />
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#999",
              fontSize: "14px",
              textAlign: "center",
              padding: "20px 0",
            }}
          >
            {t("pages.dashboard.noLeaderboardData")}
          </div>
        )}
      </div>

      <AgentInsightModal
        agent={selectedAgent}
        open={!!selectedAgent}
        onClose={() => setSelectedAgent(null)}
      />
    </div>
  );
}
