export default function UserPerformanceHeader({ title, count, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", gap: "12px", flexWrap: "wrap" }}>
      <div style={{ fontSize: "28px", fontWeight: "700", color: "#333" }}>
        {title} <span style={{ color: "#FF8040" }}>• {count}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {children}
      </div>
    </div>
  );
}
