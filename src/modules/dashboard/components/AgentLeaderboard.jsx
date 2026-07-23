import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getAgentsRank } from "../dashboard.service";
import { formatDuration } from "../../ticket/ticket.schema";

const LeaderboardMetric = ({ label, value, highlight = false }) => (
  <div
    style={{
      background: highlight ? "#fff5ef" : "#fafafa",
      border: "1px solid #f0f0f0",
      borderRadius: "10px",
      padding: "10px 12px",
      minWidth: "92px",
    }}
  >
    <div style={{ fontSize: "11px", color: "#777", fontWeight: "600" }}>
      {label}
    </div>
    <div
      style={{
        fontSize: "16px",
        color: "#333",
        fontWeight: "700",
        marginTop: "2px",
      }}
    >
      {value}
    </div>
  </div>
);

const LeaderboardRow = ({ agent, index, t }) => {
  const isTop = index === 0;
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
        gap: "14px",
        alignItems: "stretch",
        padding: "14px",
        borderRadius: "14px",
        border: isTop ? "1.5px solid #FF8040" : "1px solid #ececec",
        background: isTop
          ? "linear-gradient(135deg, #fff8f3, #ffffff)"
          : "#fff",
        boxShadow: isTop ? "0 6px 18px rgba(255, 128, 64, 0.12)" : "none",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "14px",
          background: isTop ? "#FF8040" : "#f5f5f5",
          color: isTop ? "#fff" : "#666",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px",
          fontWeight: "800",
          flexShrink: 0,
        }}
      >
        #{index + 1}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "6px",
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontSize: "16px",
              fontWeight: "700",
              color: "#333",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {agent?.agentName ?? "-"}
          </div>
          {isTop ? (
            <span
              style={{
                padding: "4px 10px",
                borderRadius: "999px",
                background: "#FF8040",
                color: "#fff",
                fontSize: "11px",
                fontWeight: "700",
                letterSpacing: "0.02em",
                flexShrink: 0,
              }}
            >
              {t("pages.dashboard.leaderboardTop")}
            </span>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "2px",
            fontSize: "13px",
            color: "#777",
            lineHeight: 1.2,
          }}
        >
          <div>
            {t("pages.dashboard.leaderboardResponseTime")}: {responseTime}
          </div>
          <div>
            {t("pages.dashboard.leaderboardResolutionTime")}: {resolutionTime}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: "10px",
          alignItems: "start",
          minWidth: 0,
        }}
      >
        <LeaderboardMetric
          label={t("pages.dashboard.leaderboardTickets")}
          value={agent?.totalTickets ?? 0}
          highlight={isTop}
        />
        <LeaderboardMetric
          label={t("pages.dashboard.leaderboardSlaBreached")}
          value={agent?.slaBreachedCount ?? 0}
          highlight={isTop}
        />
        <LeaderboardMetric
          label={t("pages.dashboard.leaderboardScore")}
          value={
            agent?.avgScore != null ? Number(agent.avgScore).toFixed(2) : "-"
          }
          highlight={isTop}
        />
      </div>
    </div>
  );
};

export default function AgentLeaderboard({ startDate, endDate }) {
  const { t } = useTranslation();

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
      .slice(0, 5);
  }, [agentRanks]);

  return (
    <div
      style={{
        flex: 1.2,
        background: "white",
        padding: "25px",
        borderRadius: "12px",
        border: "2px solid #FF8040",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        minHeight: "620px",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        minWidth: 0,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          fontSize: "18px",
          fontWeight: "600",
          color: "#333",
          marginBottom: "8px",
        }}
      >
        {t("pages.dashboard.leaderboardTitle")}
      </div>

      <div style={{ fontSize: "13px", color: "#777", marginBottom: "18px" }}>
        {t("pages.dashboard.leaderboardSubtitle")}
      </div>

      {agentRanksLoading ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#999",
            fontSize: "14px",
          }}
        >
          {t("pages.dashboard.loadingLeaderboard")}
        </div>
      ) : topAgents.length > 0 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            flex: 1,
            minWidth: 0,
          }}
        >
          {topAgents.map((agent, index) => (
            <LeaderboardRow
              key={agent.agentId ?? `${agent.agentName}-${index}`}
              agent={agent}
              index={index}
              t={t}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            display: "flex",
            minWidth: 0,
            alignItems: "center",
            justifyContent: "center",
            color: "#999",
            fontSize: "14px",
            textAlign: "center",
            padding: "0 12px",
          }}
        >
          {t("pages.dashboard.noLeaderboardData")}
        </div>
      )}
    </div>
  );
}
