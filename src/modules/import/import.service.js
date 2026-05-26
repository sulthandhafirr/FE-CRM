import * as XLSX from "xlsx";
import { api } from "../../lib/api/apiClient";

export const ROLES = [
  { id: 1, key: "customer" },
  { id: 2, key: "cs_agent" },
  { id: 3, key: "technician" },
];

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SERVICE_KEY  = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const BULK_DEFAULT_PASSWORD = "12345678";

const ROLE_ALIASES = {
  customer: 1,
  "1": 1,
  user: 1,
  "cs agent": 2,
  cs_agent: 2,
  "2": 2,
  agent: 2,
  technician: 3,
  teknisi: 3,
  "3": 3,
};

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

export const getRoleId = (role) => {
  const normalized = normalizeText(role);
  if (!normalized) return null;
  return ROLE_ALIASES[normalized] ?? null;
};

export const normalizeRows = (rows) =>
  (Array.isArray(rows) ? rows : []).map((row) => ({
    name: getCellValue(row, ["name", "Name", "full_name", "full name", "nama"]),
    email: getCellValue(row, ["email", "Email", "e-mail", "mail"]),
    role: getCellValue(row, ["role", "Role", "jabatan", "posisi", "position"]),
    position: getCellValue(row, ["position", "Position", "jabatan", "posisi"]),
  }));

export const validateRow = (row) => {
  const errors = [];
  const name = normalizeText(row?.name);
  const email = normalizeText(row?.email);
  const role = normalizeText(row?.role);

  if (!name) errors.push("Name is required");
  if (!email) errors.push("Email is required");
  else if (!/^\S+@\S+\.\S+$/.test(email)) errors.push("Email is invalid");

  if (!role) errors.push("Role is required");
  else if (!getRoleId(role)) errors.push("Role is invalid");

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

export const createBulkUser = async ({ name, email, roleId, position }) => {
  const authUserId = await createAuthUser(email, BULK_DEFAULT_PASSWORD);
  return addUserProfile({ authUserId, name, email, roleId, position });
};