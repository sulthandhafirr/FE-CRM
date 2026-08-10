import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function PerformanceCard({ badge, title, description, route, color = "#FF8040", bg = "#fff4ee", border = "#fcd9bc" }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div
      onClick={() => navigate(route)}
      style={{
        background: "white",
        border: "2px solid #e5e7eb",
        borderRadius: "16px",
        padding: "32px 28px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = color;
        e.currentTarget.style.boxShadow = `0 8px 24px ${color}26`;
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#e5e7eb";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div
        style={{
          display: "inline-block",
          background: bg,
          border: `1px solid ${border}`,
          color,
          fontSize: "12px",
          fontWeight: "700",
          padding: "4px 10px",
          borderRadius: "20px",
          marginBottom: "16px",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {badge}
      </div>
      <h3 style={{ fontSize: "24px", fontWeight: "700", color: "#1a202c", margin: "0 0 10px" }}>{title}</h3>
      <p style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 20px", lineHeight: "1.6" }}>{description}</p>
      <div style={{ color, fontWeight: "600", fontSize: "14px" }}>{t("pages.performance.openView")}</div>
    </div>
  );
}
