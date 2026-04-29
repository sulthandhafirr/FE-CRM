// ─── Status & Priority Helpers ────────────────────────────────────────────────

export const getStatusColor = (status) => {
  switch (status) {
    case "On Progress":
    case "Progress":
      return "#FF8040";
    case "Waiting":
      return "#f59e0b";
    case "Solved":
      return "#16a34a";
    default:
      return "#666";
  }
};

export const getPriorityColor = (priority) => {
  switch (priority) {
    case "Crucial":
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
    // second: "2-digit",
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

// ─── Constants ────────────────────────────────────────────────────────────────

export const TICKET_STATUS = {
  WAITING: "Waiting",
  PROGRESS: "Progress",
  SOLVED: "Solved",
};

export const TICKET_PRIORITY = {
  CRUCIAL: "Crucial",
  HIGH: "High",
  NORMAL: "Normal",
  LOW: "Low",
};
