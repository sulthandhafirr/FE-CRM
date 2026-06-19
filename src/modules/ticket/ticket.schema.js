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
