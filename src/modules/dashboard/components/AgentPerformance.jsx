import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getAgentsRank } from "../dashboard.service";
import { formatDuration } from "../../ticket/ticket.schema";

const Metric = ({ label, value }) => (
  <div
    style={{
      background: "#fff5ef",
      border: "1px solid #f0f0f0",
      borderRadius: "10px",
      padding: "10px 14px",
      minWidth: "110px",
    }}
  >
    <div style={{ fontSize: "11px", color: "#777", fontWeight: "600" }}>
      {label}
    </div>
    <div
      style={{
        fontSize: "17px",
        color: "#333",
        fontWeight: "700",
        marginTop: "2px",
      }}
    >
      {value}
    </div>
  </div>
);

export default function AgentPerformance({ startDate, endDate }) {
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ["my-rank", startDate, endDate],
    queryFn: () => getAgentsRank(startDate, endDate),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const responseTime =
    data?.agent?.avgResponseTimeSec != null
      ? formatDuration(Math.floor(data.agent.avgResponseTimeSec))
      : "-";
  const resolutionTime =
    data?.agent?.avgResolutionTimeSec != null
      ? formatDuration(Math.floor(data.agent.avgResolutionTimeSec))
      : "-";

  return (
    <div
      style={{
        background: "white",
        padding: "16px 18px",
        borderRadius: "12px",
        border: "2px solid #FF8040",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        width: "100%",
      }}
    >
      <div
        style={{
          fontSize: "14px",
          fontWeight: "600",
          color: "#333",
          marginBottom: "2px",
        }}
      >
        {t("pages.dashboard.agentPerformanceTitle")}
      </div>
      <div style={{ fontSize: "12px", color: "#777", marginBottom: "12px" }}>
        {t("pages.dashboard.agentPerformanceSubtitle")}
      </div>

      {isLoading ? (
        <div
          style={{
            padding: "20px 0",
            textAlign: "center",
            color: "#999",
            fontSize: "14px",
          }}
        >
          {t("pages.dashboard.loadingLeaderboard")}
        </div>
      ) : !data?.hasData ? (
        <div
          style={{
            padding: "20px 0",
            textAlign: "center",
            color: "#999",
            fontSize: "14px",
          }}
        >
          {t("pages.dashboard.noLeaderboardData")}
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <div style={{ fontSize: "32px", fontWeight: "800", color: "#FF8040" }}>
              {Number(data.agent.avgScore).toFixed(2)}
            </div>
            <div style={{ fontSize: "13px", color: "#777", whiteSpace: "nowrap" }}>
              {t("pages.dashboard.rankOf", {
                rank: data.rank,
                total: data.totalAgents,
              })}
            </div>
          </div>

          <Metric
            label={t("pages.dashboard.leaderboardTickets")}
            value={data.agent.totalTickets}
          />
          <Metric
            label={t("pages.dashboard.leaderboardSlaBreached")}
            value={data.agent.slaBreachedCount}
          />
          <Metric
            label={t("pages.dashboard.leaderboardResponseTime")}
            value={responseTime}
          />
          <Metric
            label={t("pages.dashboard.leaderboardResolutionTime")}
            value={resolutionTime}
          />
        </div>
      )}
    </div>
  );
}