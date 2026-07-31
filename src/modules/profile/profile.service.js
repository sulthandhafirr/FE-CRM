// fe-crm/src/features/profile/profile.service.js
import { api } from "../../lib/api/apiClient";
import { supabase } from "../../lib/supabase";

// Fetch profile data from Supabase profile table
// Query key dipakai bersama: ["profile", userId] (lihat UserMenu & ProfilePageLayout)
export const fetchProfileData = async (userId) => {
  if (!userId) return null;
  const { data, error } = await supabase
    .from("profile")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
  return data;
};

export const getUsersByRole = async (roleId) => {
  const response = await api.get(`/api/users?role_id=${roleId}`);
  // Backend tidak return skills, jadi tambahkan default
  return (response.data ?? []).map((u) => ({ ...u, profile_skill: [] }));
};