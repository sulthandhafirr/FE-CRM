import Chart from "react-apexcharts";
import { useTranslation } from "react-i18next";
import { INTENT_LABELS } from "../../ticket/ticket.schema";

// Fixed palette, cycled through if there are more intents than colors
const INTENT_COLORS = [
  "#42A5F5", // blue
  "#2E7D32", // green
  "#FF9800", // orange
  "#D32F2F", // red
  "#8E24AA", // purple
  "#00897B", // teal
  "#F9A825", // yellow
  "#6D4C41", // brown
];

const getIntentLabel = (intentKey) => {
  if (intentKey === "Unclassified") return "Unclassified";
  return INTENT_LABELS[intentKey] ?? intentKey;
};

export default function TicketIntentDonutChart({ ticketByIntent, loading, height = 220 }) {
  const { t } = useTranslation();

  const entries = Object.entries(ticketByIntent ?? {});
  const labels = entries.map(([intent]) => getIntentLabel(intent));
  const series = entries.map(([, count]) => Number(count ?? 0));
  const total = series.reduce((sum, value) => sum + value, 0);
  const colors = labels.map((_, i) => INTENT_COLORS[i % INTENT_COLORS.length]);

  if (loading) {
    return (
      <div
        style={{
          height: `${height}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#999",
          fontSize: "14px",
        }}
      >
        {t("pages.dashboard.loadingChart")}
      </div>
    );
  }

  if (total === 0) {
    return (
      <div
        style={{
          height: `${height}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#999",
          fontSize: "14px",
          textAlign: "center",
          padding: "0 12px",
        }}
      >
        {t("pages.dashboard.noTicketIntentData")}
      </div>
    );
  }

  const options = {
    chart: {
      type: "donut",
      toolbar: { show: false },
      redrawOnParentResize: true,
      redrawOnWindowResize: true,
      parentHeightOffset: 0,
    },
    labels,
    colors,
    legend: {
      show: true,
      position: "bottom",
      fontSize: "13px",
      labels: { colors: "#333" },
    },
    stroke: {
      colors: ["#FFFFFF"],
      width: 2,
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: "10px",
        fontWeight: 600,
      },
      formatter: (value) => `${value.toFixed(1)}%`,
      dropShadow: { enabled: false },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "62%",
        },
      },
    },
    tooltip: {
      custom: ({ series, seriesIndex, w }) => {
        const intentName = w.globals.labels[seriesIndex];
        const count = series[seriesIndex] ?? 0;
        const percentage =
          total > 0 ? ((count / total) * 100).toFixed(1) : "0.0";

        return `
          <div style="padding:8px 10px;font-size:12px;line-height:1.4;">
            <div style="font-weight:600;margin-bottom:2px;">${intentName}</div>
            <div>${t("pages.dashboard.count")}: ${count}</div>
            <div>${t("pages.dashboard.percentage")}: ${percentage}%</div>
          </div>
        `;
      },
    },
  };

  return (
    <Chart
      options={options}
      series={series}
      type="donut"
      height={height}
      width="100%"
    />
  );
}