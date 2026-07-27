import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";

export default function DonutChart({ title, subtitle, data, loading, emptyMessage, height = 280 }) {
  const { t } = useTranslation();
  const [selectedLabel, setSelectedLabel] = useState(null);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const gap = 2;

  const segments = useMemo(() => {
    const result = [];
    let runningOff = 0;
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const percent = item.value / total;
      const strokeLength = Math.max(0, percent * circumference - gap);
      result.push({ ...item, strokeLength, offset: runningOff });
      runningOff += percent * circumference;
    }
    return result;
  }, [data, total, circumference, gap]);

  const handleSelect = (label) => {
    setSelectedLabel((prev) => (prev === label ? null : label));
  };

  const isSelected = (label) => selectedLabel === label;
  const hasSelection = selectedLabel !== null;

  if (loading) {
    return (
      <div
        style={{
          background: "#FFFFFF",
          padding: "24px",
          borderRadius: "16px",
          border: "1px solid #E5E7EB",
          boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
          display: "flex",
          flexDirection: "column",
          minHeight: `${height}px`,
        }}
      >
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "16px", fontWeight: "600", color: "#111827" }}>
            {title}
          </div>
          {subtitle ? (
            <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "2px" }}>
              {subtitle}
            </div>
          ) : null}
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#9CA3AF",
            fontSize: "14px",
          }}
        >
          {t("pages.dashboard.loadingChart")}
        </div>
      </div>
    );
  }

  if (total === 0) {
    return (
      <div
        style={{
          background: "#FFFFFF",
          padding: "24px",
          borderRadius: "16px",
          border: "1px solid #E5E7EB",
          boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
          display: "flex",
          flexDirection: "column",
          minHeight: `${height}px`,
        }}
      >
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "16px", fontWeight: "600", color: "#111827" }}>
            {title}
          </div>
          {subtitle ? (
            <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "2px" }}>
              {subtitle}
            </div>
          ) : null}
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#9CA3AF",
            fontSize: "14px",
            textAlign: "center",
            padding: "0 12px",
          }}
        >
          {emptyMessage ?? t("pages.dashboard.noTicketStatusData")}
        </div>
      </div>
    );
  }

  const centerCount = hasSelection
    ? data.find((d) => d.label === selectedLabel)?.value ?? total
    : total;
  const centerLabel = hasSelection ? selectedLabel : "Tickets";

  return (
    <div
      style={{
        background: "#FFFFFF",
        padding: "24px",
        borderRadius: "16px",
        border: "1px solid #E5E7EB",
        boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
        minHeight: `${height}px`,
      }}
    >
      <style>{`
        .donut-legend-item:hover {
          background: #F9FAFB !important;
        }
        .donut-svg-segment {
          cursor: pointer;
          transition: opacity 0.2s ease;
        }
        .donut-svg-segment:hover {
          opacity: 0.75;
        }
      `}</style>

      <div style={{ marginBottom: "24px" }}>
        <div style={{ fontSize: "16px", fontWeight: "600", color: "#111827" }}>
          {title}
        </div>
        {subtitle ? (
          <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "2px" }}>
            {subtitle}
          </div>
        ) : null}
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: "32px",
        }}
      >
        <div
          style={{
            width: "160px",
            height: "160px",
            position: "relative",
            flexShrink: 0,
          }}
        >
          <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
            {segments.map((item, i) => (
              <circle
                key={i}
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth="14"
                strokeDasharray={`${item.strokeLength} ${circumference - item.strokeLength}`}
                strokeDashoffset={-item.offset}
                strokeLinecap="round"
                className="donut-svg-segment"
                onClick={() => handleSelect(item.label)}
                style={{
                  transition: "all 1s ease-out, opacity 0.2s ease",
                  opacity: hasSelection && !isSelected(item.label) ? 0.2 : 1,
                }}
              />
            ))}
          </svg>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: hasSelection ? "pointer" : "default",
            }}
            onClick={() => hasSelection && setSelectedLabel(null)}
          >
            <span
              style={{
                fontSize: "30px",
                fontWeight: "700",
                color: "#111827",
                letterSpacing: "-0.025em",
                lineHeight: 1,
              }}
            >
              {centerCount}
            </span>
            <span
              style={{
                fontSize: "10px",
                fontWeight: "700",
                color: "#9CA3AF",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                marginTop: "2px",
              }}
            >
              {centerLabel}
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            flex: 1,
            minWidth: 0,
          }}
        >
          {data.map((item, i) => {
            const dimmed = hasSelection && !isSelected(item.label);
            return (
              <div
                key={i}
                className="donut-legend-item"
                onClick={() => handleSelect(item.label)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                  padding: "6px 8px",
                  marginLeft: "-8px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "background 0.15s ease, opacity 0.2s ease",
                  opacity: dimmed ? 0.35 : 1,
                  background: isSelected(item.label) ? "#FFF7ED" : "transparent",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    minWidth: 0,
                  }}
                >
                  <span
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      background: item.color,
                      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                      flexShrink: 0,
                      opacity: dimmed ? 0.3 : 1,
                    }}
                  />
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: isSelected(item.label) ? "700" : "500",
                      color: "#374151",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.label}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#111827",
                    }}
                  >
                    {item.value}
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "500",
                      color: "#9CA3AF",
                      width: "36px",
                      textAlign: "right",
                    }}
                  >
                    {Math.round((item.value / total) * 100)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
