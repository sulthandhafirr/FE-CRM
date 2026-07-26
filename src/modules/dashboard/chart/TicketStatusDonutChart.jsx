import Chart from "react-apexcharts";
import { useTranslation } from "react-i18next";

const STATUS_ORDER = ["solved", "progress", "waiting"];
const STATUS_COLORS = ["#2E7D32", "#FF9800", "#42A5F5"];

export default function TicketStatusDonutChart({ ticketByStatus, loading, height = 220 }) {
  const { t } = useTranslation();

  const series = STATUS_ORDER.map((status) =>
    Number(ticketByStatus?.[status] ?? 0),
  );
  const total = series.reduce((sum, value) => sum + value, 0);
  const labels = STATUS_ORDER.map((status) =>
    t(`pages.dashboard.ticketStatusLabels.${status}`),
  );

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
        {t("pages.dashboard.noTicketStatusData")}
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
    colors: STATUS_COLORS,
    legend: {
      show: true,
      position: "bottom",
      fontSize: "12px",
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
        const statusName = w.globals.labels[seriesIndex];
        const count = series[seriesIndex] ?? 0;
        const percentage =
          total > 0 ? ((count / total) * 100).toFixed(1) : "0.0";

        return `
          <div style="padding:8px 10px;font-size:12px;line-height:1.4;">
            <div style="font-weight:600;margin-bottom:2px;">${statusName}</div>
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