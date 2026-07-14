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

export const LANGUAGE_OPTIONS = ["English", "Bahasa Indonesia"];

export const CURRENCY_OPTIONS = ["USD", "IDR", "SGD", "EUR"];

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

const createRole = (roleName, userCount, permissions) => ({
  id: roleName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  roleName,
  userCount,
  permissions,
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
    roles: [
      createRole("Administrator", 2, {
        viewTickets: true,
        createTickets: true,
        editTickets: true,
        deleteTickets: true,
        overrideIntent: true,
        overrideUrgency: true,
        manageUsers: true,
        manageRoles: true,
        manageGeneralSetup: true,
        exportReports: true,
        viewAnalytics: true,
      }),
      createRole("Manager", 4, {
        viewTickets: true,
        createTickets: true,
        editTickets: true,
        deleteTickets: false,
        overrideIntent: true,
        overrideUrgency: true,
        manageUsers: true,
        manageRoles: false,
        manageGeneralSetup: false,
        exportReports: true,
        viewAnalytics: true,
      }),
      createRole("Support Agent", 16, {
        viewTickets: true,
        createTickets: true,
        editTickets: true,
        deleteTickets: false,
        overrideIntent: false,
        overrideUrgency: false,
        manageUsers: false,
        manageRoles: false,
        manageGeneralSetup: false,
        exportReports: false,
        viewAnalytics: true,
      }),
    ],
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
    language: "English",
    currency: "USD",
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
    permissions: PERMISSION_GROUPS.flatMap((group) => group.items).reduce(
      (accumulator, permission) => ({
        ...accumulator,
        [permission.key]: false,
      }),
      {},
    ),
  };
}
