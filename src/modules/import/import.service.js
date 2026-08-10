import * as XLSX from "xlsx";
import { api } from "../../lib/api/apiClient";
import { supabase } from "../../lib/supabase";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SERVICE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const BULK_DEFAULT_PASSWORD = "12345678";

// ─── Dynamic roles per company ─────────────────────────────────────────────

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
  map["user"] = map["customer"] ?? null;
  map["cs agent"] = map["cs_agent"] ?? null;
  map["agent"] = map["cs_agent"] ?? null;
  map["teknisi"] = map["technician"] ?? null;
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

// ─── Helpers ─────────────────────────────────────────────────────────────

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
  return roleMap?.[normalized] ?? null;
};

export const normalizeRows = (rows) =>
  (Array.isArray(rows) ? rows : []).map((row) => ({
    name: getCellValue(row, ["name", "Name", "full_name", "full name", "nama"]),
    email: getCellValue(row, ["email", "Email", "e-mail", "mail"]),
    role: getCellValue(row, ["role", "Role", "jabatan", "posisi", "position"]),
    position: getCellValue(row, ["position", "Position", "jabatan", "posisi"]),
    skill: getCellValue(row, ["skill", "Skill", "skills", "Skills"]),
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
    ["Name", "Email", "Role", "Position", "Skill"],
    ["Jane Doe", "jane@example.com", "cs_agent", "Support Agent", ""],
    ["John Tech", "john@example.com", "technician", "Field Tech", "Word;Excel"],
  ]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
  XLSX.writeFile(workbook, "user-import-template.xlsx");
};

// ─── Supabase Admin ─────────────────────────────────────────────────────

const createAuthUser = async (email, password) => {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SERVICE_KEY}`,
      apikey: SERVICE_KEY,
    },
    body: JSON.stringify({ email, password, email_confirm: true }),
  });

  const data = await res.json();
  if (!res.ok) {
    const reason = data.msg ?? data.message ?? data.error_description ?? data.error ?? `HTTP ${res.status}`;
    throw new Error(reason);
  }
  return data.id;
};

// ─── Profile (C# backend) ────────────────────────────────────────────────

/**
 * `skillIds` is optional — only technicians get a skills picker in the UI.
 * The backend is expected to insert the corresponding `profile_skill` rows
 * as part of this same call. See backend/NOTES.md for the wiring needed
 * on the UserManagementController side.
 */
const addUserProfile = async ({ authUserId, name, email, roleId, position, skillIds }) => {
  const { data } = await api.post("/api/usermanagement/add", {
    authUserId,
    name,
    email,
    roleId,
    position: position || null,
    skillIds: skillIds?.length ? skillIds : undefined,
  });
  return data;
};

// ─── Public: single user ────────────────────────────────────────────────

export const createSingleUser = async ({ name, email, password, roleId, position, skillIds }) => {
  const authUserId = await createAuthUser(email, password);
  return addUserProfile({ authUserId, name, email, roleId, position, skillIds });
};

// ─── Public: bulk user (default password) ───────────────────────────────

export const createBulkUser = async ({ name, email, roleId, position, password, skillIds }) => {
  const authUserId = await createAuthUser(email, password || BULK_DEFAULT_PASSWORD);
  return addUserProfile({ authUserId, name, email, roleId, position, skillIds });
};

// ─── Skills (technician tag input) ───────────────────────────────────────

/**
 * Search skills whose name contains `query` (case-insensitive).
 * Backend: GET /api/skill/search?query=...
 */
export const searchSkills = async (query) => {
  const { data } = await api.get("/api/skill/search", { params: { query } });
  return data ?? []; // [{ id, skill }]
};

/**
 * Persist a brand-new skill. Only called at form-submit time, for any
 * skill tags the user typed that didn't already exist in the database.
 * Backend: POST /api/skill  { skill: string }
 */
export const createSkill = async (name) => {
  const { data } = await api.post("/api/skill", { skill: name });
  return data; // { id, skill }
};

export const addProfileSkill = async (profileId, skillId) => {
  const { data } = await api.post(`/api/usermanagement/${profileId}/skills`, { skillId });
  return data;
};

export const removeProfileSkill = async (profileId, skillId) => {
  await api.delete(`/api/usermanagement/${profileId}/skills/${skillId}`);
};

/** "Word;Excel" -> ["Word", "Excel"]; trims each name, drops empty entries. */
export const parseSkillNames = (raw) =>
  String(raw ?? "")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);

/**
 * Resolve a list of skill names into their DB ids, creating any that don't
 * exist yet (createSkill is idempotent server-side). `cache` is a Map shared
 * across the whole bulk-import batch so a name like "Hardware Expert" that
 * appears on many rows is only created once, not once per row.
 */
export const resolveSkillNames = async (skillNames, cache) => {
  const ids = [];
  for (const rawName of skillNames) {
    const name = rawName.trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (cache.has(key)) {
      ids.push(cache.get(key));
      continue;
    }
    const created = await createSkill(name); // get-or-create, idempotent
    cache.set(key, created.id);
    ids.push(created.id);
  }
  return ids;
};