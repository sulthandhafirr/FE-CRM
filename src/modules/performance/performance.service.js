import { api } from "../../lib/api/apiClient";
import { getUsersByRole as profileGetUsersByRole } from "../profile/profile.service";
import { getAllTickets as ticketGetAll } from "../ticket/ticket.service";

// Follow ticket.service pattern: simple wrappers to backend API or re-use existing services
export const getUsersByRole = async (roleId) => {
  try {
    // prefer existing profile service when possible
    const users = await profileGetUsersByRole(roleId);
    return users;
  } catch (err) {
    // fallback to direct API call mirroring ticket.service patterns
    const resp = await api.get(`/api/users/role/${roleId}`);
    return resp.data;
  }
};

export const getAllTickets = async () => {
  return ticketGetAll();
};

export const searchUsers = async (q) => {
  const { data } = await api.get(`/api/users/search?q=${encodeURIComponent(q)}`);
  return data;
};

export const getUserDetail = async (userId) => {
  const { data } = await api.get(`/api/users/${userId}`);
  return data;
};
