import { api } from "../../lib/api/apiClient";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SERVICE_KEY  = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const BULK_DEFAULT_PASSWORD = "12345678";

// ─── Supabase Admin ───────────────────────────────────────────────────────────

const createAuthUser = async (email, password) => {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SERVICE_KEY}`,
      "apikey": SERVICE_KEY,
    },
    body: JSON.stringify({ email, password, email_confirm: true }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Failed to create auth user");
  return data.id; // authUserId
};

// ─── Profile (C# backend) ─────────────────────────────────────────────────────

const addUserProfile = async ({ authUserId, name, email, roleId, position }) => {
  const { data } = await api.post("/api/usermanagement/add", {
    authUserId,
    name,
    email,
    roleId,
    position: position || null,
  });
  return data;
};

// ─── Public: single user ──────────────────────────────────────────────────────

export const createSingleUser = async ({ name, email, password, roleId, position }) => {
  const authUserId = await createAuthUser(email, password);
  return addUserProfile({ authUserId, name, email, roleId, position });
};

// ─── Public: bulk user (default password) ────────────────────────────────────

export const createBulkUser = async ({ name, email, roleId, position }) => {
  const authUserId = await createAuthUser(email, BULK_DEFAULT_PASSWORD);
  return addUserProfile({ authUserId, name, email, roleId, position });
};