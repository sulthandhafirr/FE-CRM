import { api } from "../../lib/api/apiClient";

const STORAGE_KEY = "crm-general-setup-v1";

export const PRIORITY_OPTIONS = ["Low", "Medium", "High", "Critical"];

export const URGENCY_OPTIONS = ["Low", "Medium", "High", "Critical"];

export const STATUS_COLOR_OPTIONS = [
  { value: "slate", label: "Slate" },
  { value: "blue", label: "Blue" },
  { value: "amber", label: "Amber" },
  { value: "green", label: "Green" },
  { value: "red", label: "Red" },
  { value: "purple", label: "Purple" },
];

export const WORKING_DAY_OPTIONS = [
  { value: "Mon", label: "Mon" },
  { value: "Tue", label: "Tue" },
  { value: "Wed", label: "Wed" },
  { value: "Thu", label: "Thu" },
  { value: "Fri", label: "Fri" },
  { value: "Sat", label: "Sat" },
  { value: "Sun", label: "Sun" },
];

export const TIMEZONE_OPTIONS = [
  "UTC",
  "Asia/Jakarta",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Europe/London",
  "America/New_York",
];

export const DATE_FORMAT_OPTIONS = [
  "YYYY-MM-DD",
  "DD/MM/YYYY",
  "MM/DD/YYYY",
];

export const PERMISSION_GROUPS = [
  {
    title: "Ticket Permissions",
    items: [
      { key: "viewTickets", label: "View Tickets" },
      { key: "createTickets", label: "Create Tickets" },
      { key: "editTickets", label: "Edit Tickets" },
      { key: "deleteTickets", label: "Delete Tickets" },
    ],
  },
  {
    title: "AI Permissions",
    items: [
      { key: "overrideIntent", label: "Override Intent" },
      { key: "overrideUrgency", label: "Override Urgency" },
    ],
  },
  {
    title: "Administration",
    items: [
      { key: "manageUsers", label: "Manage Users" },
      { key: "manageRoles", label: "Manage Roles" },
      { key: "manageGeneralSetup", label: "Manage General Setup" },
    ],
  },
  {
    title: "Reports",
    items: [
      { key: "exportReports", label: "Export Reports" },
      { key: "viewAnalytics", label: "View Analytics" },
    ],
  },
];

const createIntent = (
  intentName,
  displayName,
  description,
  defaultPriority,
  enabled = true,
  allowManualOverride = true,
) => ({
  id: intentName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  intentName,
  displayName,
  description,
  defaultPriority,
  enabled,
  allowManualOverride,
});

const createStatus = (name, color, active = true) => ({
  id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  name,
  color,
  active,
});

const DEFAULT_GENERAL_SETUP = {
  intentManagement: {
    intents: [
      createIntent(
        "Billing Issue",
        "Billing Issue",
        "Issues about invoices, refunds, payment status, and subscription charges.",
        "High",
      ),
      createIntent(
        "Technical Issue",
        "Technical Issue",
        "System errors, bugs, failed workflows, and application malfunctions.",
        "Critical",
      ),
      createIntent(
        "Order Inquiry",
        "Order Inquiry",
        "Questions about order status, delivery tracking, and fulfillment updates.",
        "Medium",
      ),
      createIntent(
        "Account Management",
        "Account Management",
        "Profile changes, access requests, password resets, and account updates.",
        "Medium",
      ),
      createIntent(
        "Security Incident",
        "Security Incident",
        "Unauthorized access, suspicious activity, or possible data exposure.",
        "Critical",
        true,
        false,
      ),
      createIntent(
        "General Inquiry",
        "General Inquiry",
        "Non-urgent questions that do not fit another operational category.",
        "Low",
      ),
      createIntent(
        "Feature Request",
        "Feature Request",
        "Suggestions for new capabilities, improvements, or workflow changes.",
        "Low",
      ),
      createIntent(
        "Complaint",
        "Complaint",
        "Escalated feedback, dissatisfaction, or service quality complaints.",
        "High",
      ),
    ],
  },
  urgencyManagement: {
    enableAiUrgencyPrediction: true,
    confidenceThreshold: 72,
    enableSentimentPriorityBoost: true,
    enableKeywordPriorityBoost: true,
    intentMappings: [
      { intent: "Billing Issue", defaultUrgency: "High" },
      { intent: "Technical Issue", defaultUrgency: "Critical" },
      { intent: "Order Inquiry", defaultUrgency: "Medium" },
      { intent: "Account Management", defaultUrgency: "Medium" },
      { intent: "Security Incident", defaultUrgency: "Critical" },
      { intent: "General Inquiry", defaultUrgency: "Low" },
      { intent: "Feature Request", defaultUrgency: "Low" },
      { intent: "Complaint", defaultUrgency: "High" },
    ],
    keywordBoostText: [
      "payment failed",
      "system down",
      "cannot login",
      "server offline",
      "production stopped",
    ].join("\n"),
  },
  ticketStatus: {
    statuses: [
      createStatus("Open", "blue", true),
      createStatus("In Progress", "amber", true),
      createStatus("Pending", "purple", true),
      createStatus("Resolved", "green", true),
      createStatus("Closed", "slate", true),
    ],
    allowTicketReopen: true,
    autoCloseTicketAfterDays: 7,
  },
  slaRules: {
    enableSlaMonitoring: true,
    notifyBeforeBreachedMinutes: 30,
    rules: [
      { priority: "Critical", firstResponseHours: 1, resolutionHours: 4 },
      { priority: "High", firstResponseHours: 2, resolutionHours: 8 },
      { priority: "Medium", firstResponseHours: 8, resolutionHours: 24 },
      { priority: "Low", firstResponseHours: 24, resolutionHours: 72 },
    ],
  },
  roleManagement: {
    roles: [],
  },
  companySettings: {
    companyName: "Capstone CRM",
    logoDataUrl: "",
    supportEmail: "support@capstonecrm.com",
    phoneNumber: "+62 21 555 0199",
    timezone: "Asia/Jakarta",
    workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    workingHoursStart: "09:00",
    workingHoursEnd: "18:00",
    ticketNumberFormat: "TKT-{YYYY}-{0001}",
    dateFormat: "YYYY-MM-DD",
  },
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function mergeSection(defaultSection, storedSection) {
  return {
    ...clone(defaultSection),
    ...(storedSection ?? {}),
  };
}

export function createDefaultGeneralSetup() {
  return clone(DEFAULT_GENERAL_SETUP);
}

const SETTINGS_SECTIONS = [
  "intentManagement",
  "urgencyManagement",
  "ticketStatus",
  "slaRules",
  "roleManagement",
  "companySettings",
];

/** Normalise company settings snake_case response → camelCase for internal state */
function mapApiResponseToCompanySettings(apiData) {
  return {
    companyName: apiData.companyName ?? "",
    supportEmail: apiData.supportEmail ?? "",
    phoneNumber: apiData.phoneNumber ?? "",
    timezone: apiData.timezone ?? "Asia/Jakarta",
    workingDays: apiData.workingDays ?? ["Mon", "Tue", "Wed", "Thu", "Fri"],
    workingHoursStart: apiData.workingHoursStart ?? "09:00",
    workingHoursEnd: apiData.workingHoursEnd ?? "18:00",
    ticketNumberFormat: apiData.ticketNumberFormat ?? "TKT-{YYYY}-{0001}",
    dateFormat: apiData.dateFormat ?? "YYYY-MM-DD",
    logoDataUrl: apiData.logoUrl ?? "",
  };
}

export async function fetchCompanySettingsFromApi() {
  try {
    const { data } = await api.get("/api/company/settings");
    return mapApiResponseToCompanySettings(data);
  } catch {
    return null;
  }
}

export async function saveCompanySettingsToApi(companySettings) {
  const payload = {
    companyName: companySettings.companyName,
    supportEmail: companySettings.supportEmail,
    phoneNumber: companySettings.phoneNumber,
    timezone: companySettings.timezone,
    workingDays: companySettings.workingDays,
    workingHoursStart: companySettings.workingHoursStart,
    workingHoursEnd: companySettings.workingHoursEnd,
    ticketNumberFormat: companySettings.ticketNumberFormat,
    dateFormat: companySettings.dateFormat,
    logoUrl: companySettings.logoDataUrl || "",
  };
  const { data } = await api.put("/api/company/settings", payload);
  return mapApiResponseToCompanySettings(data);
}

export async function uploadCompanyLogo(file) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post("/api/company/settings/logo", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.logoUrl;
}

// ── Role Management API ──────────────────────────────────────────────

/** Map backend role response to frontend role shape */
function mapApiRoleToFrontend(apiRole) {
  return {
    id: String(apiRole.id),
    roleName: apiRole.role,
    userCount: apiRole.userCount ?? 0,
    isSystem: apiRole.isSystem ?? false,
    permissions: apiRole.permissions ?? {},
  };
}

/** Fetch all roles + permissions for the current user's company */
export async function fetchRolesFromApi() {
  try {
    const { data } = await api.get("/api/roles");
    return (data ?? []).map(mapApiRoleToFrontend);
  } catch {
    return null;
  }
}

/** Create a custom role */
export async function createRoleApi(role) {
  const payload = {
    role: role.roleName,
    permissions: role.permissions ?? {},
  };
  const { data } = await api.post("/api/roles", payload);
  return mapApiRoleToFrontend(data);
}

/** Update role name (custom only) and/or permissions */
export async function updateRoleApi(role) {
  const payload = {
    role: role.isSystem ? undefined : role.roleName,
    permissions: role.permissions ?? {},
  };
  const { data } = await api.put(`/api/roles/${role.id}`, payload);
  return mapApiRoleToFrontend(data);
}

/** Delete a custom role */
export async function deleteRoleApi(roleId) {
  await api.delete(`/api/roles/${roleId}`);
}

export function loadGeneralSetup() {
  if (typeof window === "undefined") return createDefaultGeneralSetup();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultGeneralSetup();

    const stored = JSON.parse(raw);
    return Object.fromEntries(
      SETTINGS_SECTIONS.map((section) => [
        section,
        mergeSection(DEFAULT_GENERAL_SETUP[section], stored[section]),
      ]),
    );
  } catch {
    return createDefaultGeneralSetup();
  }
}

export function saveGeneralSetup(nextValue) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextValue));
}

export function createStatusDraft() {
  return {
    id: "",
    name: "",
    color: "blue",
    active: true,
  };
}

export function createRoleDraft() {
  return {
    id: "",
    roleName: "",
    userCount: 0,
    isSystem: false,
    permissions: PERMISSION_GROUPS.flatMap((group) => group.items).reduce(
      (accumulator, permission) => ({
        ...accumulator,
        [permission.key]: false,
      }),
      {},
    ),
  };
}

/** Fetch all company tiers */
export async function fetchCompanyTiers() {
  const { data } = await api.get("/api/tiers");
  return data;
}

/** Create a new tier */
export async function createTierApi(tierName, color) {
  const { data } = await api.post("/api/tiers", { tierName, color });
  return data;
}

/** Fetch a single tier by ID */
export async function updateTierApi(id, tierName, color) {
  const { data } = await api.put(`/api/tiers/${id}`, { tierName, color });
  return data;
}

/** Delete a tier by ID */
export async function deleteTierApi(id) {
  await api.delete(`/api/tiers/${id}`);
}
