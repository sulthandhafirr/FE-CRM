import { Avatar } from "@mui/material";
import { formatDate } from "../performance.schema";

export default function UserPerformanceDetail({ user = {}, stats = {} }) {
  return (
    <div style={{ background: "white", borderRadius: "14px", padding: "24px 28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: "24px", display: "flex", alignItems: "center", gap: "22px", border: "2px solid #FF8040" }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#FFF5EF", border: "2px solid #FF8040", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <span style={{ fontWeight: 700, color: "#FF8040" }}>{(user.name || "?").slice(0,1).toUpperCase()}</span>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "22px", fontWeight: "700", color: "#333", marginBottom: "4px" }}>{user.name}</div>
        <div style={{ fontSize: "14px", color: "#666", marginBottom: "6px" }}>{user.email}</div>
        <div style={{ display: "flex", gap: "20px", marginTop: "6px" }}>
          <span style={{ fontSize: "13px", color: "#FF8040", fontWeight: "600" }}>📌 {user.position ?? "-"}</span>
          <span style={{ fontSize: "13px", color: "#666" }}>Tickets: {stats.ticketsHandled ?? 0}</span>
        </div>
      </div>
      <div style={{ background: "#FFF5EF", borderRadius: "8px", padding: "6px 16px", color: "#FF8040", fontWeight: "700", fontSize: "13px", border: "1px solid #fde4d4" }}>
        {user.roleLabel}
      </div>
    </div>
  );
}
