export const ChartPanel = ({ title, subtitle, children }) => (
  <div
    style={{
      background: "#FFFFFF",
      padding: "24px",
      borderRadius: "16px",
      border: "1px solid #E5E7EB",
      boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
      display: "flex",
      flexDirection: "column",
      flex: 1,
      minWidth: 0,
      overflow: "hidden",
    }}
  >
    <div style={{ marginBottom: "24px" }}>
      <div
        style={{
          fontSize: "16px",
          fontWeight: "600",
          color: "#111827",
        }}
      >
        {title}
      </div>
      {subtitle ? (
        <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "2px" }}>
          {subtitle}
        </div>
      ) : null}
    </div>
    {children}
  </div>
);