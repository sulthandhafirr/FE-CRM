import Chart from "react-apexcharts";
import { useTranslation } from "react-i18next";

const PRIORITY_ORDER = ["low", "normal", "high", "critical"];
const PRIORITY_COLORS = ["#42A5F5", "#2E7D32", "#FF9800", "#D32F2F"];

export default function TicketPriorityDonutChart({
  ticketByPriority,
  loading,
}) {
  const { t } = useTranslation();

  const series = PRIORITY_ORDER.map((priority) =>
    Number(ticketByPriority?.[priority] ?? 0),
  );
  const total = series.reduce((sum, value) => sum + value, 0);
  const labels = PRIORITY_ORDER.map((priority) =>
    t(`pages.dashboard.ticketPriorityLabels.${priority}`),
  );

  if (loading) {
    return (
      <div
        style={{
          height: "300px",
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
          height: "300px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#999",
          fontSize: "14px",
          textAlign: "center",
          padding: "0 12px",
        }}
      >
        {t("pages.dashboard.noTicketPriorityData")}
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
    colors: PRIORITY_COLORS,
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
        const priorityName = w.globals.labels[seriesIndex];
        const count = series[seriesIndex] ?? 0;
        const percentage =
          total > 0 ? ((count / total) * 100).toFixed(1) : "0.0";

        return `
          <div style="padding:8px 10px;font-size:12px;line-height:1.4;">
            <div style="font-weight:600;margin-bottom:2px;">${priorityName}</div>
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
      height={300}
      width="100%"
    />
  );
}
