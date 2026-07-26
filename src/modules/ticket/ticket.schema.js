// ─── Status Color Map (config name → hex) ────────────────────────────────────

const STATUS_COLOR_HEX = {
  blue: "#3b82f6",
  amber: "#f59e0b",
  green: "#16a34a",
  red: "#dc2626",
  purple: "#9333ea",
  slate: "#64748b",
};

// ─── Read ticket status config from localStorage (synced from General Setup) ────

const STORAGE_KEY = "crm-general-setup-v1";

function getTicketStatusConfig() {
  try {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.ticketStatus ?? null;
  } catch {
    return null;
  }
}

// ─── Status Helpers (reads from config, falls back to hardcoded) ───────────────

/**
 * Get the display color for a ticket status.
 * Looks up the status name in the General Setup config first,
 * then falls back to legacy hardcoded colors.
 */
export const getStatusColor = (status) => {
  if (!status) return "#666";

  // 1) Try configurable statuses from General Setup
  const config = getTicketStatusConfig();
  if (config?.statuses?.length) {
    const match = config.statuses.find(
      (s) => s.name.toLowerCase() === status.toLowerCase(),
    );
    if (match && STATUS_COLOR_HEX[match.color]) {
      return STATUS_COLOR_HEX[match.color];
    }
  }

  // 2) Fallback to legacy hardcoded colors (covers old DB data during migration)
  const lower = status.toLowerCase();
  if (lower === "in progress" || lower === "progress" || lower === "on progress")
    return "#3b82f6";
  if (lower === "waiting" || lower === "open")
    return "#f59e0b";
  if (lower === "resolved" || lower === "solved" || lower === "closed" || lower === "completed")
    return "#16a34a";
  if (lower === "pending")
    return "#9333ea";

  return "#666";
};

/**
 * Get the list of active status names from General Setup config.
 * Falls back to legacy hardcoded list if no config found.
 */
export const getActiveStatusNames = () => {
  const config = getTicketStatusConfig();
  if (config?.statuses?.length) {
    return config.statuses
      .filter((s) => s.active !== false)
      .map((s) => s.name);
  }
  // Legacy fallback
  return ["Waiting", "In Progress", "Resolved"];
};

/**
 * Check whether a ticket status is considered "resolved/closed".
 * Matches statuses whose name contains resolved/solved/closed (case-insensitive)
 * or are explicitly matched in the config, with legacy fallback.
 */
export const isResolvedStatus = (status) => {
  if (!status) return false;
  const lower = status.toLowerCase();

  // Matches config status names that indicate final state
  if (lower.includes("resolved") || lower.includes("solved") || lower.includes("closed")) {
    return true;
  }

  // Legacy fallback
  return lower === "solved" || lower === "completed";
};

/**
 * Get the name of the first "resolved/solved/closed" status from config.
 * Used by resolveTicket() to know which status to set.
 */
export const getResolvedStatusName = () => {
  const config = getTicketStatusConfig();
  if (config?.statuses?.length) {
    const resolved = config.statuses.find(
      (s) =>
        s.name.toLowerCase().includes("resolved") ||
        s.name.toLowerCase().includes("solved") ||
        s.name.toLowerCase().includes("closed"),
    );
    if (resolved) return resolved.name;
  }
  // Legacy fallback
  return "Resolved";
};

// ─── Priority Helpers ──────────────────────────────────────────────────────────

export const getPriorityColor = (priority) => {
  switch (priority) {
    case "Critical":
      return "#dc2626";
    case "High":
      return "#ea580c";
    case "Normal":
      return "#666";
    case "Low":
      return "#16a34a";
    default:
      return "#666";
  }
};

// ─── Date & Duration Helpers ───────────────────────────────────────────────────

export const formatTicketDate = (dateString) => {
  if (!dateString) return "-";

  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleDateString("en-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export const formatTicketDateTime = (dateString) => {
  if (!dateString) return "-";

  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return "-";

  const datePart = parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const timePart = parsed.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return `${datePart}, ${timePart}`;
};

export const formatDuration = (seconds) => {
    if (seconds == null) return "-";
    
    if (seconds < 60)
        return `${seconds}s`;
    
    if (seconds < 3600)
        return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    
    if (seconds < 86400)
        return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    
    return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`;
};

export const formatFileSize = (sizeInBytes) => {
  const sizeInKb = sizeInBytes / 1024;
  if (sizeInKb < 1024) return `${sizeInKb.toFixed(1)} KB`;
  return `${(sizeInKb / 1024).toFixed(1)} MB`;
};

export const sortTickets = (list, orderBy, order) => {
  return [...list].sort((a, b) => {
    let aValue = a[orderBy];
    let bValue = b[orderBy];
    if (orderBy === "createdAt") { aValue = new Date(aValue ?? 0).getTime(); bValue = new Date(bValue ?? 0).getTime(); }
    if (orderBy === "id") { aValue = Number(aValue); bValue = Number(bValue); }
    if (aValue == null) aValue = "";
    if (bValue == null) bValue = "";
    if (typeof aValue === "string") aValue = aValue.toLowerCase();
    if (typeof bValue === "string") bValue = bValue.toLowerCase();
    if (aValue < bValue) return order === "asc" ? -1 : 1;
    if (aValue > bValue) return order === "asc" ? 1 : -1;
    return 0;
  });
};

export const formatTechnicianSkills = (skills) => {
  if (!Array.isArray(skills) || skills.length === 0) return "-";
  return skills.join(", ");
};

// ─── Intent Labels ────────────────────────────────────────────────────────────

export const INTENT_LABELS = {
  technical_issue: "Technical Issue",
  security_incident: "Security Incident",
  billing_issue: "Billing Issue",
  account_management: "Account Management",
  order_inquiry: "Order Inquiry",
  service_request: "Service Request",
  complaint: "Complaint",
  feature_request: "Feature Request",
  information_request: "Information Request",
  refund_request: "Refund Request",
  cancellation_request: "Cancellation Request",
  other: "Other",
};

export const getIntentLabel = (intent) => {
  if (!intent) return "-";
  return INTENT_LABELS[intent.toLowerCase()] || intent;
};

export const getIntentColor = (intent) => {
  switch (intent?.toLowerCase()) {
    case "security_incident":
      return "#dc2626";
    case "complaint":
    case "refund_request":
    case "cancellation_request":
      return "#ea580c";
    case "billing_issue":
    case "technical_issue":
      return "#ca8a04";
    case "feature_request":
    case "information_request":
      return "#16a34a";
    default:
      return "#666";
  }
};

export const getUrgencyColor = (urgency) => {
  switch (urgency?.toLowerCase()) {
    case "critical":
      return "#dc2626";
    case "high":
      return "#ea580c";
    case "medium":
      return "#ca8a04";
    case "low":
      return "#16a34a";
    default:
      return "#666";
  }
};

// ─── Constants ────────────────────────────────────────────────────────────────

export const TICKET_STATUS = {
  WAITING: "Waiting",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
};

export const TICKET_PRIORITY = {
  CRUCIAL: "Crucial",
  HIGH: "High",
  NORMAL: "Normal",
  LOW: "Low",
};
