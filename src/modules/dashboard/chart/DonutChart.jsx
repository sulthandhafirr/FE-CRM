import Chart from "react-apexcharts";
import { useTranslation } from "react-i18next";

export default function DonutChart({ title, subtitle, data, loading, emptyMessage, height = 280, onSliceClick }) {
  const { t } = useTranslation();

  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (loading) {
    return (
      <div style={cardStyle(height)}>
        <Header title={title} subtitle={subtitle} />
        <div style={centerMessageStyle}>{t("pages.dashboard.loadingChart")}</div>
      </div>
    );
  }

  if (total === 0) {
    return (
      <div style={cardStyle(height)}>
        <Header title={title} subtitle={subtitle} />
        <div style={{ ...centerMessageStyle, textAlign: "center", padding: "0 12px" }}>
          {emptyMessage ?? t("pages.dashboard.noTicketStatusData")}
        </div>
      </div>
    );
  }

  const series = data.map((item) => item.value);
  const labels = data.map((item) => item.label);
  const colors = data.map((item) => item.color);

  const handleSliceClick = (dataPointIndex) => {
    const item = data[dataPointIndex];
    onSliceClick?.(item.key ?? item.label);
  };

  const options = {
    chart: {
      type: "donut",
      toolbar: { show: false },
      redrawOnParentResize: true,
      redrawOnWindowResize: true,
      parentHeightOffset: 0,
      events: {
        dataPointSelection: (event, chartContext, config) => {
          handleSliceClick(config.dataPointIndex);
        },
      },
    },
    labels,
    colors,
    legend: { show: false },
    dataLabels: { enabled: false },
    stroke: { colors: ["#FFFFFF"], width: 2 },
    plotOptions: {
      pie: {
        donut: {
          size: "62%",
          labels: {
            show: true,
            name: { show: false },
            value: {
              show: true,
              fontSize: "30px",
              fontWeight: "700",
              color: "#111827",
              offsetY: 8,
              formatter: () => total,
            },
            total: {
              show: true,
              label: "Tickets",
              color: "#9CA3AF",
              fontSize: "10px",
              fontWeight: "700",
              formatter: () => total,
            },
          },
        },
      },
    },
    tooltip: {
      custom: ({ series, seriesIndex, w }) => {
        const label = w.globals.labels[seriesIndex];
        const count = series[seriesIndex] ?? 0;
        const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : "0.0";
        return `
          <div style="padding:8px 10px;font-size:12px;line-height:1.4;">
            <div style="font-weight:600;margin-bottom:2px;">${label}</div>
            <div>${t("pages.dashboard.count")}: ${count}</div>
            <div>${t("pages.dashboard.percentage")}: ${percentage}%</div>
          </div>
        `;
      },
    },
  };

  return (
    <div style={cardStyle(height)}>
      <style>{`
        .donut-legend-item:hover { background: #F9FAFB !important; }
      `}</style>

      <Header title={title} subtitle={subtitle} />

      <div style={{ flex: 1, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: "32px" }}>
        <div style={{ width: "160px", height: "160px", flexShrink: 0 }}>
          <Chart options={options} series={series} type="donut" height={160} width={160} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1, minWidth: 0 }}>
          {data.map((item, i) => (
            <div
              key={i}
              className="donut-legend-item"
              onClick={() => onSliceClick?.(item.key ?? item.label)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
                padding: "6px 8px",
                marginLeft: "-8px",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "background 0.15s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                <span
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    background: item.color,
                    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: "14px", fontWeight: "500", color: "#374151", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {item.label}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>{item.value}</span>
                <span style={{ fontSize: "12px", fontWeight: "500", color: "#9CA3AF", width: "36px", textAlign: "right" }}>
                  {Math.round((item.value / total) * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Header({ title, subtitle }) {
  return (
    <div style={{ marginBottom: "24px" }}>
      <div style={{ fontSize: "16px", fontWeight: "600", color: "#111827" }}>{title}</div>
      {subtitle ? <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "2px" }}>{subtitle}</div> : null}
    </div>
  );
}

const cardStyle = (height) => ({
  background: "#FFFFFF",
  padding: "24px",
  borderRadius: "16px",
  border: "1px solid #E5E7EB",
  boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
  display: "flex",
  flexDirection: "column",
  minHeight: `${height}px`,
});

const centerMessageStyle = {
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#9CA3AF",
  fontSize: "14px",
};