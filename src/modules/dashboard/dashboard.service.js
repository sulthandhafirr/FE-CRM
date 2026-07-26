import { api } from "../../lib/api/apiClient";

// ─── Dashboard calls (via backend API) ───────────────────────────────────────

// GET /api/dashboard/stats — cs_agent/admin only
// Response shape: {
//   totalCsAgent, totalTechnician
// }
export const getDashboardStats = async (startDate, endDate) => {
  const { data } = await api.get("/api/dashboard/stats", {
    params: {
      startDate: startDate ? startDate.toISOString() : undefined,
      endDate: endDate ? endDate.toISOString() : undefined,
    },
  });
  return data;
};

// GET /api/rank/agents-rank — cs_agent/admin only
export const getAgentsRank = async (startDate, endDate) => {
  const { data } = await api.get("/api/rank/agents-rank", {
    params: {
      startDate: startDate ? startDate.toISOString() : undefined,
      endDate: endDate ? endDate.toISOString() : undefined,
    },
  });
  return data;
};

export const getTicketTrend = async (startDate, endDate) => {
  const { data } = await api.get("/api/dashboard/ticket-trend", {
    params: {
      startDate: startDate ? startDate.toISOString() : undefined,
      endDate: endDate ? endDate.toISOString() : undefined,
    },
  });
  return data;
};