import { useState, useEffect, useRef } from "react";

/* ─── Color & status helpers ─── */
const STATUS_CFG = {
  operational: { color: "#16A34A" },
  degraded:    { color: "#D97706" },
  down:        { color: "#DC2626" },
};

const SVC_STATUS_COLOR = {
  operational: "#16A34A",
  degraded:    "#D97706",
  down:        "#DC2626",
};

const SVC_STATUS_LABEL = {
  operational: "Operational",
  degraded:    "Degraded",
  down:        "Down",
};

/* ─── Dummy data — ganti dengan fetch real nanti ─── */
const DUMMY_STATUS = {
  overall: "operational",
  lastChecked: new Date(),
  services: [
    { name: "AI Urgency Prediction",     status: "operational", responseTime: 180, errorRate24h: 0.02 },
    { name: "Intent Classification",     status: "operational", responseTime: 240, errorRate24h: 0.05 },
    { name: "Ticket Sync",               status: "operational", responseTime: 120, errorRate24h: 0.01 },
    { name: "Notification Service",      status: "operational", responseTime:  80, errorRate24h: 0.00 },
    { name: "SLA Monitoring",            status: "operational", responseTime: 200, errorRate24h: 0.03 },
  ],
};

function timeAgo(date) {
  const diffMs = Date.now() - date.getTime();
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return `${sec} detik`;  // Indonesian for customer
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} menit`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} jam`;
  return `${Math.floor(hr / 24)} hari`;
}

function timeAgoEn(date) {
  const diffMs = Date.now() - date.getTime();
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return `${sec} sec ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  return `${Math.floor(hr / 24)} days ago`;
}

/* ─── Service filters per role ─── */
const CUSTOMER_SERVICES = new Set([]);             // none – we show plain text instead

const CS_SERVICES = new Set([
  "Ticket Sync",
  "Notification Service",
]);

const TECHNICIAN_SERVICES = new Set([
  "Ticket Sync",
  "SLA Monitoring",
  "Notification Service",
]);

const ADMIN_SERVICES = new Set([
  "AI Urgency Prediction",
  "Intent Classification",
  "Ticket Sync",
  "Notification Service",
  "SLA Monitoring",
]);

// Ultrauser sees everything just like admin, plus debug info

/* ─── Component ─── */
export default function SystemStatus({ data: propData, userRole, onStatusClick } = {}) {
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const hideTimer = useRef(null);

  const data = propData || DUMMY_STATUS;
  const cfg  = STATUS_CFG[data.overall] || STATUS_CFG.operational;

  const role = userRole || "customer";

  useEffect(() => {
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  }, []);

  const handleMouseEnter = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setHovered(true);
    requestAnimationFrame(() => setVisible(true));
  };

  const handleMouseLeave = () => {
    setVisible(false);
    hideTimer.current = setTimeout(() => setHovered(false), 150);
  };

  const handleClick = () => {
    if (data.overall !== "operational" && onStatusClick) onStatusClick(data);
  };

  const isClickable = data.overall !== "operational" && !!onStatusClick;

  /* ─── Role-based tooltip renderers ─── */

  const renderCustomerTooltip = () => {
    const isNormal = data.overall === "operational";
    return (
      <div style={{ minWidth: "220px", padding: "14px 16px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: cfg.color, flexShrink: 0 }} />
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#1F2937" }}>
            {isNormal ? "Layanan berjalan normal" : "Sedang ada gangguan, tim kami sedang menangani"}
          </span>
        </div>
        {/* Sub-text */}
        <div style={{ fontSize: "11px", color: "#9CA3AF", lineHeight: 1.5 }}>
          {isNormal
            ? "Seluruh sistem dalam keadaan baik."
            : "Mohon maaf atas ketidaknyamanannya. Kami akan segera memperbaikinya."}
        </div>
        {isNormal && (
          <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "6px" }}>
            Terakhir diperiksa {timeAgo(data.lastChecked)} yang lalu
          </div>
        )}
      </div>
    );
  };

  const renderCsTooltip = () => {
    const filtered = data.services.filter((s) => CS_SERVICES.has(s.name));
    const isNormal = data.overall === "operational";

    return (
      <div style={{ minWidth: "240px", padding: "14px 16px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: cfg.color, flexShrink: 0 }} />
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#1F2937" }}>
            {isNormal ? "All systems operational" : "Service disruption detected"}
          </span>
        </div>

        {/* Last checked */}
        <div style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "6px" }}>
          Checked {timeAgoEn(data.lastChecked)}
        </div>

        {/* Service breakdown */}
        {filtered.length > 0 && (
          <div style={{ borderTop: "1px solid #F3F4F6", paddingTop: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
            {filtered.map((svc, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px" }}>
                <span style={{ color: "#4B5563" }}>{svc.name}</span>
                <span style={{ fontSize: "11px", fontWeight: 600, color: SVC_STATUS_COLOR[svc.status] || "#6B7280" }}>
                  {SVC_STATUS_LABEL[svc.status] || svc.status}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* CS-specific tip */}
        <div style={{ marginTop: "10px", fontSize: "11px", color: "#6B7280", fontStyle: "italic", borderTop: "1px solid #F3F4F6", paddingTop: "8px" }}>
          Tip: If tickets are not updating, try refreshing the page.
        </div>
      </div>
    );
  };

  const renderTechnicianTooltip = () => {
    const filtered = data.services.filter((s) => TECHNICIAN_SERVICES.has(s.name));
    const isNormal = data.overall === "operational";

    return (
      <div style={{ minWidth: "260px", padding: "14px 16px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: cfg.color, flexShrink: 0 }} />
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#1F2937" }}>
            {isNormal ? "All systems operational" : "Service disruption detected"}
          </span>
        </div>

        <div style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "6px" }}>
          Checked {timeAgoEn(data.lastChecked)}
        </div>

        {/* Service breakdown with response time */}
        {filtered.length > 0 && (
          <div style={{ borderTop: "1px solid #F3F4F6", paddingTop: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
            {filtered.map((svc, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px" }}>
                  <span style={{ color: "#4B5563" }}>{svc.name}</span>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: SVC_STATUS_COLOR[svc.status] || "#6B7280" }}>
                    {SVC_STATUS_LABEL[svc.status] || svc.status}
                  </span>
                </div>
                <div style={{ fontSize: "10px", color: "#9CA3AF", paddingLeft: "0" }}>
                  Response time: {svc.responseTime || "—"}ms
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderAdminTooltip = () => {
    const filtered = data.services.filter((s) => ADMIN_SERVICES.has(s.name));

    return (
      <div style={{ minWidth: "270px", padding: "14px 16px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: cfg.color, flexShrink: 0 }} />
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#1F2937" }}>
            {data.overall === "operational" ? "All systems operational" : data.overall === "degraded" ? "Degraded performance" : "Systems down"}
          </span>
        </div>

        <div style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "10px" }}>
          Checked {timeAgoEn(data.lastChecked)} &middot;{" "}
          <span
            style={{ color: "#FF8040", cursor: "pointer" }}
            onClick={(e) => { e.stopPropagation(); window.open("https://status.example.com", "_blank"); }}
          >
            View full status page
          </span>
        </div>

        {/* Full breakdown */}
        {filtered.length > 0 && (
          <div style={{ borderTop: "1px solid #F3F4F6", paddingTop: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
            {filtered.map((svc, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px" }}>
                <span style={{ color: "#4B5563" }}>{svc.name}</span>
                <span style={{ fontSize: "11px", fontWeight: 600, color: SVC_STATUS_COLOR[svc.status] || "#6B7280" }}>
                  {SVC_STATUS_LABEL[svc.status] || svc.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderUltrauserTooltip = () => {
    const filtered = data.services.filter((s) => ADMIN_SERVICES.has(s.name));
    const hasIssue = data.overall !== "operational";

    return (
      <div style={{ minWidth: "300px", padding: "14px 16px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: cfg.color, flexShrink: 0 }} />
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#1F2937" }}>
            {data.overall === "operational" ? "All systems operational" : data.overall === "degraded" ? "Degraded performance" : "Systems down"}
          </span>
        </div>

        <div style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "10px" }}>
          Checked {timeAgoEn(data.lastChecked)} &middot;{" "}
          <span
            style={{ color: "#FF8040", cursor: "pointer" }}
            onClick={(e) => { e.stopPropagation(); window.open("https://status.example.com", "_blank"); }}
          >
            View full status page
          </span>
        </div>

        {/* Full breakdown with debug info */}
        {filtered.length > 0 && (
          <div style={{ borderTop: "1px solid #F3F4F6", paddingTop: "8px", display: "flex", flexDirection: "column", gap: "8px" }}>
            {filtered.map((svc, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                {/* Service name + status */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px" }}>
                  <span style={{ color: "#4B5563" }}>{svc.name}</span>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: SVC_STATUS_COLOR[svc.status] || "#6B7280" }}>
                    {SVC_STATUS_LABEL[svc.status] || svc.status}
                  </span>
                </div>
                {/* Debug row: response time + error rate */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "10px", color: "#9CA3AF" }}>
                  <span>RT: {svc.responseTime || "—"}ms</span>
                  <span>Err: {svc.errorRate24h != null ? `${svc.errorRate24h}%` : "—"}</span>
                  <span
                    style={{ color: "#FF8040", cursor: "pointer", textDecoration: "none" }}
                    onClick={(e) => { e.stopPropagation(); window.open("https://monitoring.example.com", "_blank"); }}
                  >
                    Logs
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick actions (when issue exists) */}
        {hasIssue && (
          <div style={{ borderTop: "1px solid #F3F4F6", marginTop: "10px", paddingTop: "10px", display: "flex", gap: "8px" }}>
            <button
              onClick={(e) => { e.stopPropagation(); alert("Restart initiated"); }}
              style={{
                flex: 1, padding: "6px 10px", border: "1px solid #D1D5DB", borderRadius: "6px",
                background: "#fff", fontSize: "11px", fontWeight: 600, color: "#374151",
                cursor: "pointer",
              }}
            >
              Restart service
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); alert("Incident acknowledged"); }}
              style={{
                flex: 1, padding: "6px 10px", border: "none", borderRadius: "6px",
                background: data.overall === "down" ? "#DC2626" : "#D97706",
                fontSize: "11px", fontWeight: 600, color: "#fff", cursor: "pointer",
              }}
            >
              Acknowledge
            </button>
          </div>
        )}

        {/* Link to Grafana/monitoring */}
        <div style={{ marginTop: "8px", fontSize: "11px", textAlign: "right" }}>
          <span
            style={{ color: "#FF8040", cursor: "pointer" }}
            onClick={(e) => { e.stopPropagation(); window.open("https://grafana.example.com", "_blank"); }}
          >
            Open Grafana &rarr;
          </span>
        </div>
      </div>
    );
  };

  const renderTooltip = () => {
    switch (role) {
      case "customer":
        return renderCustomerTooltip();
      case "cs_agent":
        return renderCsTooltip();
      case "technician":
        return renderTechnicianTooltip();
      case "admin":
        return renderAdminTooltip();
      case "ultrauser":
        return renderUltrauserTooltip();
      default:
        return renderAdminTooltip();
    }
  };

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        padding: "6px",
        cursor: isClickable ? "pointer" : "default",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      role="status"
      aria-label="System status"
    >
      {/* Dot + Ping */}
      <div style={{ position: "relative", width: "8px", height: "8px" }}>
        <span
          style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            border: `2px solid ${cfg.color}`, opacity: 0,
            animation: "statusPing 2s ease-out infinite",
          }}
        />
        <span
          style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            backgroundColor: cfg.color,
          }}
        />
      </div>

      {/* Tooltip */}
      {hovered && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: "50%",
            transform: visible ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(-4px)",
            opacity: visible ? 1 : 0,
            background: "#ffffff",
            borderRadius: "8px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
            border: "1px solid #E7E9EE",
            zIndex: 9999,
            transition: "opacity 150ms ease, transform 150ms ease",
            pointerEvents: "auto",
          }}
        >
          {renderTooltip()}
        </div>
      )}

      <style>{`
        @keyframes statusPing {
          0%   { transform: scale(1);  opacity: 0.6; }
          50%  { transform: scale(2.5); opacity: 0; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
