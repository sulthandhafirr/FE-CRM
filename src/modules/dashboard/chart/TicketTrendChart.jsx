import Chart from "react-apexcharts";
import { useTranslation } from "react-i18next";
import { formatLabel } from "../dashboard.schema";

export default function TicketTrendChart({ trend, loading, height = 240 }) {
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

  if (dataPoints.length === 0) {
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
        {t("pages.dashboard.noTicketTrendData")}
      </div>
    );
  }

  const options = {
    chart: {
      type: "line",
      toolbar: { show: false },
      redrawOnParentResize: true,
      redrawOnWindowResize: true,
      parentHeightOffset: 0,
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
      // Tighter range so the line isn't dwarfed by excess whitespace
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