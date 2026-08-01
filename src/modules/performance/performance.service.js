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

// GET /api/tiers — fetch all available tiers for dropdown
export const getAllTiers = async () => {
  const { data } = await api.get("/api/tiers");
  return data; // [{ id, tierName }, ...]
};
 
// PUT /api/tiers/profile/:profileId — assign/replace a customer's tier
export const setProfileTier = async (profileId, tierId) => {
  const { data } = await api.put(`/api/tiers/profile/${profileId}`, { tierId });
  return data;
};
 
// DELETE /api/tiers/profile/:profileId — remove tier from a customer
export const removeProfileTier = async (profileId) => {
  await api.delete(`/api/tiers/profile/${profileId}`);
};

export async function getAllSkills() {
  const { data } = await api.get("/api/Skill");
  return data;
}

export async function addSkill(profileId, skillId) {
  const { data } = await api.post(`/api/usermanagement/${profileId}/skills`, { skillId });
  return data;
}

export async function removeSkill(profileId, skillId) {
  return api.delete(`/api/usermanagement/${profileId}/skills/${skillId}`);
}

export async function searchSkills(query) {
  const { data } = await api.get("/api/skill/search", { params: { query } });
  return data ?? []; // [{ id, skill }]
}

export async function createSkill(name) {
  const { data } = await api.post("/api/skill", { skill: name });
  return data; // { id, skill }
}

export const updatePosition = async (profileId, position) => {
  const { data } = await api.put(`/api/usermanagement/${profileId}/position`, {
    position: position || null,
  });
  return data; // { profileId, position }
};