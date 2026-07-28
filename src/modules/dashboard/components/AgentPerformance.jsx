import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getAgentsRank } from "../dashboard.service";
import { formatDuration } from "../../ticket/ticket.schema";
import AgentInsightModal from "./AgentInsightModal";

const Metric = ({ label, value }) => (
  <div
    style={{
      background: "#FAFAFA",
      border: "1px solid #F0F0F0",
      borderRadius: "10px",
      padding: "10px 14px",
      minWidth: "110px",
    }}
  >
    <div style={{ fontSize: "11px", color: "#6B7280", fontWeight: "600" }}>
      {label}
    </div>
    <div
      style={{
        fontSize: "17px",
        color: "#111827",
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
  const [modalOpen, setModalOpen] = useState(false);

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
        background: "#FFFFFF",
        padding: "24px",
        borderRadius: "16px",
        border: "1px solid #E5E7EB",
        boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
        width: "100%",
      }}
    >
      <div
        style={{
          fontSize: "16px",
          fontWeight: "600",
          color: "#111827",
          marginBottom: "2px",
        }}
      >
        {t("pages.dashboard.agentPerformanceTitle")}
      </div>
      <div style={{ fontSize: "12px", color: "#6B7280", marginBottom: "12px" }}>
        {t("pages.dashboard.agentPerformanceSubtitle")}
      </div>

      {isLoading ? (
        <div
          style={{
            padding: "20px 0",
            textAlign: "center",
            color: "#9CA3AF",
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
            color: "#9CA3AF",
            fontSize: "14px",
          }}
        >
          {t("pages.dashboard.noLeaderboardData")}
        </div>
      ) : (
        <>
          <div
            onClick={() => setModalOpen(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap",
              cursor: "pointer",
            }}
            title={t("pages.dashboard.clickForDetails")}
          >
            <div
              style={{ display: "flex", alignItems: "baseline", gap: "8px" }}
            >
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: "800",
                  color: "#FF8040",
                }}
              >
                {Number(data.agent.avgScore).toFixed(2)}
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "#6B7280",
                  whiteSpace: "nowrap",
                }}
              >
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
              value={
                <>
                  {data.agent.slaBreachedCount}{" "}
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "500",
                      color: "#9CA3AF",
                    }}
                  >
                    ({data.agent.slaBreachRate ?? 0}%)
                  </span>
                </>
              }
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

          <AgentInsightModal
            agent={data.agent}
            open={modalOpen}
            onClose={() => setModalOpen(false)}
          />
        </>
      )}
    </div>
  );
}
