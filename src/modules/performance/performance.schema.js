// Mirrors ticket.schema.js pattern for helper functions and constants

export const ROLE = {
  CUSTOMER: "customer",
  CS_AGENT: "cs_agent",
  TECHNICIAN: "technician",
};

export const ROLE_ID = {
  CUSTOMER: 1,
  CS_AGENT: 2,
  TECHNICIAN: 3,
};

export const formatDate = (dateString) => {
  if (!dateString) return "-";
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString("en-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export const getRoleLabel = (roleKey) => {
  switch (roleKey) {
    case ROLE.CS_AGENT:
      return "CS Agent";
    case ROLE.TECHNICIAN:
      return "Technician";
    case ROLE.CUSTOMER:
      return "Customer";
    default:
      return "User";
  }
};

export const PERFORMANCE_COLUMNS = [
  { id: "id", label: "ID" },
  { id: "name", label: "Name" },
  { id: "email", label: "Email" },
  { id: "ticketsHandled", label: "Tickets" },
  { id: "lastActive", label: "Last Active" },
];
