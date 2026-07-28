import { createElement } from "react";
import AnimatedNumber from "../../../components/ui/AnimatedNumber";

export const StatCard = ({ title, value, icon, loading }) => (
  <div
    className="stat-card"
    style={{
      background: "#FFFFFF",
      padding: "20px",
      borderRadius: "16px",
      border: "1px solid #E5E7EB",
      boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
      transition: "box-shadow 0.2s ease",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "8px",
      }}
    >
      <div
        style={{
          fontSize: "14px",
          color: "#6B7280",
          fontWeight: "500",
        }}
      >
        {title}
      </div>
      {icon ? createElement(icon, { size: 18, color: "#9CA3AF" }) : null}
    </div>
    <div
      style={{
        fontSize: "24px",
        fontWeight: "700",
        color: "#111827",
        letterSpacing: "-0.025em",
      }}
    >
      {loading ? (
        <span style={{ fontSize: "16px", color: "#D1D5DB" }}>—</span>
      ) : (
        <AnimatedNumber value={value ?? 0} />
      )}
    </div>
  </div>
);