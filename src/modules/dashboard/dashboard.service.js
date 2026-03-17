import { api } from "../../lib/api/apiClient";

// ─── Dashboard calls (via backend API) ───────────────────────────────────────

// GET /api/dashboard/stats — cs_agent/admin only
// Response shape: {
//   totalCsAgent, totalTechnician
// }
export const getDashboardStats = async () => {
  const { data } = await api.get("/api/dashboard/stats");
  return data;
};