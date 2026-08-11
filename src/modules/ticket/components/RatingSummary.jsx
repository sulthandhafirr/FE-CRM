import { useState } from "react";
import {
  MdStar,
  MdStarHalf,
  MdStarBorder,
  MdKeyboardArrowDown,
} from "react-icons/md";

function formatCompactNumber(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return `${n}`;
}

function StarRow({ value, size = 18 }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (value >= i) stars.push(<MdStar key={i} size={size} color="#FF8040" />);
    else if (value >= i - 0.5)
      stars.push(<MdStarHalf key={i} size={size} color="#FF8040" />);
    else stars.push(<MdStarBorder key={i} size={size} color="#FF8040" />);
  }
  return <div style={{ display: "flex", gap: "2px" }}>{stars}</div>;
}

export default function RatingSummary({
  average = 0,
  totalRatings = 0,
  reviewCount = 0,
  breakdown = [],
}) {
  const [expanded, setExpanded] = useState(true);
  const [hoveredStar, setHoveredStar] = useState(null);
  const maxCount = Math.max(1, ...breakdown.map((b) => b.count));

  if (totalRatings === 0) return null;

  return (
    <div
      style={{
        background: "white",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        padding: "20px 24px",
        marginBottom: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ fontSize: "32px", fontWeight: "700", color: "#333" }}>
            {average.toFixed(1)}
          </div>
          <div>
            <StarRow value={average} />
            <div style={{ fontSize: "13px", color: "#666", marginTop: "4px" }}>
              {average.toFixed(1)} · {formatCompactNumber(totalRatings)} Ratings{" "}
              <span style={{ textDecoration: "underline", cursor: "pointer" }}>
                {reviewCount} reviews
              </span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          style={{
            background: "transparent",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <MdKeyboardArrowDown
            size={18}
            color="#666"
            style={{
              transform: expanded ? "rotate(180deg)" : "none",
              transition: "transform 0.2s",
            }}
          />
        </button>
      </div>

      {expanded && (
        <div
          style={{
            marginTop: "18px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {breakdown.map(({ star, count }) => (
            <div
              key={star}
              style={{ display: "flex", alignItems: "center", gap: "10px" }}
            >
              <div
                style={{
                  position: "relative",
                  flex: 1,
                  height: "8px",
                }}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() =>
                  setHoveredStar((prev) => (prev === star ? null : prev))
                }
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "#f1f1f1",
                    borderRadius: "4px",
                    overflow: "hidden",
                    cursor: "default",
                  }}
                >
                  <div
                    style={{
                      width: `${(count / maxCount) * 100}%`,
                      height: "100%",
                      background: "#FF8040",
                      borderRadius: "4px",
                      transition: "filter 0.15s",
                      filter:
                        hoveredStar === star ? "brightness(0.9)" : "none",
                    }}
                  />
                </div>

                {hoveredStar === star && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "calc(100% + 6px)",
                      left: `${Math.min(
                        Math.max((count / maxCount) * 100, 8),
                        92,
                      )}%`,
                      transform: "translateX(-50%)",
                      background: "#333",
                      color: "white",
                      fontSize: "11px",
                      fontWeight: "600",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      whiteSpace: "nowrap",
                      zIndex: 10,
                      pointerEvents: "none",
                    }}
                  >
                    {count} tiket
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 0,
                        height: 0,
                        borderLeft: "5px solid transparent",
                        borderRight: "5px solid transparent",
                        borderTop: "5px solid #333",
                      }}
                    />
                  </div>
                )}
              </div>
              <div
                style={{
                  width: "42px",
                  fontSize: "13px",
                  color: "#666",
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                }}
              >
                {star.toFixed(1)} <MdStar size={13} color="#FF8040" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}