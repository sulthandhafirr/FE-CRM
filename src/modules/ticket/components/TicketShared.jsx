import { O, STATUS_STYLE } from "./ticketTheme";

export function Badge({ type, children }) {
  const key = (type || "").toLowerCase().replace(/\s/g, "");
  const styleMap = {};
  for (const [k, v] of Object.entries(STATUS_STYLE)) {
    styleMap[k.toLowerCase()] = v;
  }
  const s = styleMap[key] || { bg: "#F3F4F6", text: "#6B7280", border: "#E5E7EB" };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "1px 8px",
        borderRadius: "9999px",
        fontSize: "11px",
        fontWeight: "600",
        border: `1px solid ${s.border}`,
        background: s.bg,
        color: s.text,
      }}
    >
      {children}
    </span>
  );
}

export function ProgressBar({ progress, color = O[500] }) {
  const pct = Math.min(100, Math.max(0, progress || 0));
  return (
    <div style={{ width: "100%", background: "#F3F4F6", borderRadius: "9999px", height: "6px" }}>
      <div
        style={{
          height: "6px",
          borderRadius: "9999px",
          width: `${pct}%`,
          background: color,
          transition: "width 0.3s ease",
        }}
      />
    </div>
  );
}
