import { useTranslation } from "react-i18next";

export default function ComingSoonPage({ title = "Coming Soon" }) {
  const { t } = useTranslation();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: "#6b7280",
      }}
    >
      <div style={{ fontSize: "48px", marginBottom: "16px" }}>🚧</div>
      <h2
        style={{
          fontSize: "22px",
          fontWeight: "700",
          color: "#1a202c",
          margin: "0 0 8px",
        }}
      >
        {title}
      </h2>
      <p style={{ fontSize: "14px", margin: 0 }}>
        {t("pages.comingSoon.message")}
      </p>
    </div>
  );
}
