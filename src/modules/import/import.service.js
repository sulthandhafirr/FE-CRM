import * as XLSX from "xlsx";
import { api } from "../../lib/api/apiClient";
import { supabase } from "../../lib/supabase";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SERVICE_KEY  = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const BULK_DEFAULT_PASSWORD = "12345678";

// ─── Dynamic roles per company ─────────────────────────────────────────────────

/** Build a role-name → role-id map from a roles array (fetched per company) */
export const buildRoleMap = (roles) => {
  const map = {};
  for (const r of roles) {
    const key = r.role?.toLowerCase();
    if (key) {
      map[key] = r.id;
      map[String(r.id)] = r.id;
    }
  }
  // Common aliases
  map["user"]     = map["customer"] ?? null;
  map["cs agent"] = map["cs_agent"] ?? null;
  map["agent"]    = map["cs_agent"] ?? null;
  map["teknisi"]  = map["technician"] ?? null;
  return map;
};

/** Fetch roles that belong to the same company as the given user */
export const getCompanyRoles = async (userId) => {
  const { data: profile, error: profileErr } = await supabase
    .from("profile")
    .select("company_id")
    .eq("id", userId)
    .single();

  if (profileErr || !profile?.company_id) {
    console.warn("Could not determine company, returning empty roles");
    return [];
  }

  const { data: roles, error: rolesErr } = await supabase
    .from("roles")
    .select("id, role")
    .eq("company_id", profile.company_id)
    .order("id");

  if (rolesErr || !roles?.length) {
    console.warn("No roles found for company, returning empty roles");
    return [];
  }

  return roles;
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

const normalizeText = (value) => String(value ?? "").trim().toLowerCase();

const getCellValue = (row, keys) => {
  for (const key of keys) {
    const value = row?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return String(value).trim();
    }
  }
  return "";
};

export const getRoleId = (role, roleMap) => {
  const normalized = normalizeText(role);
  if (!normalized) return null;
  if (roleMap && roleMap[normalized]) return roleMap[normalized];
  return null;
};

export const normalizeRows = (rows) =>
  (Array.isArray(rows) ? rows : []).map((row) => ({
    name: getCellValue(row, ["name", "Name", "full_name", "full name", "nama"]),
    email: getCellValue(row, ["email", "Email", "e-mail", "mail"]),
    role: getCellValue(row, ["role", "Role", "jabatan", "posisi", "position"]),
    position: getCellValue(row, ["position", "Position", "jabatan", "posisi"]),
  }));

export const validateRow = (row, roleMap) => {
  const errors = [];
  const name = normalizeText(row?.name);
  const email = normalizeText(row?.email);
  const role = normalizeText(row?.role);

  if (!name) errors.push("Name is required");
  if (!email) errors.push("Email is required");
  else if (!/^\S+@\S+\.\S+$/.test(email)) errors.push("Email is invalid");

  if (!role) errors.push("Role is required");
  else if (!getRoleId(role, roleMap)) errors.push("Role is invalid");

  return errors;
};

export const downloadTemplate = () => {
  const worksheet = XLSX.utils.aoa_to_sheet([
    ["Name", "Email", "Role", "Position"],
    ["Jane Doe", "jane@example.com", "cs_agent", "Support Agent"],
  ]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
  XLSX.writeFile(workbook, "user-import-template.xlsx");
};

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

export const createBulkUser = async ({ name, email, roleId, position, password }) => {
  const authUserId = await createAuthUser(email, password || BULK_DEFAULT_PASSWORD);
  return addUserProfile({ authUserId, name, email, roleId, position });
};
