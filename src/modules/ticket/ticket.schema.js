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
