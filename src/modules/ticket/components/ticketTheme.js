// ── Orange palette ──
export const O = {
  50: "#FFF7F2",
  100: "#FFEDE0",
  200: "#FDE4D4",
  300: "#FCCBA8",
  400: "#FB9E6B",
  500: "#FF8040",
  600: "#E86A2C",
  700: "#CC5520",
};

// ── Status badge styles ──
export const STATUS_STYLE = {
  Open: { bg: "#FFF7F2", text: O[500], border: "#FDE4D4" },
  New: { bg: "#E8F5E9", text: "#2E7D32", border: "#C8E6C9" },
  Progress: { bg: "#E3F2FD", text: "#1565C0", border: "#BBDEFB" },
  Waiting: { bg: "#FFF8E1", text: "#F57F17", border: "#FFECB3" },
  Solved: { bg: "#E8F5E9", text: "#2E7D32", border: "#C8E6C9" },
  Resolved: { bg: "#E8F5E9", text: "#2E7D32", border: "#C8E6C9" },
  Closed: { bg: "#F3F4F6", text: "#6B7280", border: "#E5E7EB" },
  Escalated: { bg: "#FFEBEE", text: "#C62828", border: "#FFCDD2" },
  Critical: { bg: "#FFEBEE", text: "#C62828", border: "#FFCDD2" },
  High: { bg: "#FFF3E0", text: "#E65100", border: "#FFE0B2" },
  Medium: { bg: "#E3F2FD", text: "#1565C0", border: "#BBDEFB" },
  Low: { bg: "#F3F4F6", text: "#6B7280", border: "#E5E7EB" },
};
