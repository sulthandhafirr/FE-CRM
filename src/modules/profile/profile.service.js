// fe-crm/src/features/profile/profile.service.js
import { api } from "../../lib/api/apiClient";

export const getUsersByRole = async (roleId) => {
  const response = await api.get(`/api/users?role_id=${roleId}`);
  // Backend tidak return skills, jadi tambahkan default
  return (response.data ?? []).map((u) => ({ ...u, profile_skill: [] }));
};