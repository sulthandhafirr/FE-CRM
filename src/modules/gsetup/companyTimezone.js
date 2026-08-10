const STORAGE_KEY = "crm-general-setup-v1";

export const TZ_MAP = {
  "WIB (UTC+7)": "Asia/Jakarta",
  "WITA (UTC+8)": "Asia/Makassar",
  "WIT (UTC+9)": "Asia/Jayapura",
};

export function toIana(displayTz) {
  return TZ_MAP[displayTz] || "Asia/Jakarta";
}

export function loadCompanyTimezone() {
  if (typeof window === "undefined") return "WIB (UTC+7)";
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return "WIB (UTC+7)";
    const stored = JSON.parse(raw);
    return stored?.companySettings?.timezone || "WIB (UTC+7)";
  } catch {
    return "WIB (UTC+7)";
  }
}