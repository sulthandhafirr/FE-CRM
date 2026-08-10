import Chart from "react-apexcharts";
import { useTranslation } from "react-i18next";
import { formatLabel, parseIsoWeek } from "../dashboard.schema";

const pad = (n) => String(n).padStart(2, "0");
const toDateStr = (d) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;

function labelToDateRange(label, granularity) {
  if (granularity === "day") {
    const d = new Date(`${label}T00:00:00Z`);
    return { startDate: toDateStr(d), endDate: toDateStr(d) };
  }
  if (granularity === "week") {
    const monday = parseIsoWeek(label);
    const sunday = new Date(monday);
    sunday.setUTCDate(monday.getUTCDate() + 6);
    return { startDate: toDateStr(monday), endDate: toDateStr(sunday) };
  }
  // month: "yyyy-MM"
  const [y, m] = label.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1));
  const end = new Date(Date.UTC(y, m, 0));
  return { startDate: toDateStr(start), endDate: toDateStr(end) };
}

export default function TicketTrendChart({ trend, loading, height = 240, onPointClick }) {
  const { t } = useTranslation();

  const granularity = trend?.granularity ?? "week";
  const dataPoints = trend?.data ?? [];

  const categories = dataPoints.map((d) => formatLabel(d.label ?? d.Label, granularity));
  const series = [
    {
      name: t("pages.dashboard.ticketTrendSeriesName"),
      data: dataPoints.map((d) => Number(d.count ?? d.Count ?? 0)),
    },
  ];

  if (loading) {
    return (
      <div style={{ height: `${height}px`, display: "flex", alignItems: "center", justifyContent: "center", color: "#999", fontSize: "14px" }}>
        {t("pages.dashboard.loadingChart")}
      </div>
    );
  }

  if (dataPoints.length === 0) {
    return (
      <div style={{ height: `${height}px`, display: "flex", alignItems: "center", justifyContent: "center", color: "#999", fontSize: "14px", textAlign: "center", padding: "0 12px" }}>
        {t("pages.dashboard.noTicketTrendData")}
      </div>
    );
  }

  const handlePointClick = (dataPointIndex) => {
    const point = dataPoints[dataPointIndex];
    const rawLabel = point.label ?? point.Label;
    const range = labelToDateRange(rawLabel, granularity);
    onPointClick?.(range, categories[dataPointIndex]);
  };

  const options = {
    chart: {
      type: "line",
      toolbar: { show: false },
      redrawOnParentResize: true,
      redrawOnWindowResize: true,
      parentHeightOffset: 0,
      events: {
        markerClick: (event, chartContext, { dataPointIndex }) => {
          handlePointClick(dataPointIndex);
        },
      },
    },
    xaxis: {
      categories,
      labels: {
        style: { colors: "#777", fontSize: "11px" },
      },
    },
    yaxis: {
      labels: {
        style: { colors: "#777", fontSize: "11px" },
        formatter: (value) => Math.round(value),
      },
      tickAmount: 4,
    },
    colors: ["#FF8040"],
    stroke: {
      curve: "smooth",
      width: 3,
    },
    markers: {
      size: 4,
      colors: ["#FF8040"],
      strokeColors: "#fff",
      strokeWidth: 2,
    },
    grid: {
      borderColor: "#f0f0f0",
      padding: { top: 0, right: 10, bottom: 0, left: 10 },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      y: {
        formatter: (value) => `${value} ${t("pages.dashboard.ticketTrendSeriesName")}`,
      },
    },
  };

  return (
    <Chart
      options={options}
      series={series}
      type="line"
      height={height}
      width="100%"
    />
  );
}