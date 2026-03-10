import { supabase } from "../../../lib/supabase";
import { api } from "../../../lib/api/apiClient";

export const getUsers = async () => {
  const { data, error } = await supabase
    .from("profile")
    .select("id, name, email, created_at, roles(id, role)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.roles?.role ?? "—",
    roleId: u.roles?.id ?? null,
    createdAt: u.created_at,
  }));
};

export const getRoles = async () => {
  const { data, error } = await supabase
    .from("roles")
    .select("id, role")
    .order("id");
  if (error) throw error;
  return data;
};

export const updateUser = async (userId, { name, roleId }) => {
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (roleId !== undefined) updates.role_id = roleId;
  const { error } = await supabase
    .from("profile")
    .update(updates)
    .eq("id", userId);
  if (error) throw error;
};

export const deleteUser = async (userId) => {
  const { error } = await supabase
    .from("profile")
    .delete()
    .eq("id", userId);
  if (error) throw error;
};

// Create user requires a backend with admin privileges
export const createUser = async (userData) => {
  const response = await api.post("/api/users", userData);
  return response.data;
};
