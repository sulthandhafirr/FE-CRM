import { useEffect, useState, useRef } from "react";
import { fetchCompanySettingsFromApi } from "../../modules/gsetup/gsetup.service";

const STORAGE_KEY = "crm-general-setup-v1";

/* Map display timezone → IANA name for Intl.DateTimeFormat */
const TZ_MAP = {
  "WIB (UTC+7)": "Asia/Jakarta",
  "WITA (UTC+8)": "Asia/Makassar",
  "WIT (UTC+9)": "Asia/Jayapura",
};

const DAY_NAMES = {
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  id: ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"],
};

const MONTH_NAMES = {
  en: [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ],
  id: [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ],
};

function formatInTimezone(date, timezone, locale = "en") {
  const dayNames = DAY_NAMES[locale] || DAY_NAMES.en;
  const monthNames = MONTH_NAMES[locale] || MONTH_NAMES.en;

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).formatToParts(date);

  const get = (type) => parts.find((p) => p.type === type)?.value || "";

  const weekdayRaw = get("weekday");
  const day = get("day");
  const monthRaw = get("month");
  const hour = get("hour");
  const minute = get("minute");
  const second = get("second");

  // Map English weekday/month to locale (Intl gives English output with en-US)
  const engDayIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(weekdayRaw);
  const engMonthIndex = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ].indexOf(monthRaw);

  const localeDay = engDayIndex >= 0 ? dayNames[engDayIndex] : weekdayRaw;
  const localeMonth = engMonthIndex >= 0 ? monthNames[engMonthIndex] : monthRaw;

  return {
    time: `${hour}:${minute}:${second}`,
    date: `${localeDay}, ${day} ${localeMonth}`,
  };
}

function loadTimezone() {
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

function toIana(displayTz) {
  return TZ_MAP[displayTz] || "Asia/Jakarta";
}

export default function RealtimeClock({ timezone: propTz, locale = "id" }) {
  const [now, setNow] = useState(new Date());
  const [tzDisplay, setTzDisplay] = useState(loadTimezone);
  const fetchedRef = useRef(false);

  /* ── On mount: fetch fresh timezone from API ── */
  useEffect(() => {
    let cancelled = false;

    async function fetchTz() {
      const settings = await fetchCompanySettingsFromApi();
      if (cancelled) return;
      fetchedRef.current = true;

      if (settings?.timezone) {
        setTzDisplay(settings.timezone);
        /* Persist to localStorage so it survives soft navigation */
        try {
          const raw = window.localStorage.getItem(STORAGE_KEY);
          const stored = raw ? JSON.parse(raw) : {};
          stored.companySettings = stored.companySettings || {};
          stored.companySettings.timezone = settings.timezone;
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
        } catch {
          /* non-critical */
        }
      }
    }

    fetchTz();

    return () => { cancelled = true; };
  }, []);

  /* ── Listen for save events from Company Settings page ── */
  useEffect(() => {
    const handler = () => setTzDisplay(loadTimezone());
    window.addEventListener("company-tz-changed", handler);
    return () => window.removeEventListener("company-tz-changed", handler);
  }, []);

  /* ── Re-read on focus (backup) ── */
  useEffect(() => {
    const onFocus = () => setTzDisplay(loadTimezone());
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  /* ── 1-second tick ── */
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const tz = propTz || tzDisplay;
  const iana = toIana(tz);
  const { time, date } = formatInTimezone(now, iana, locale);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        lineHeight: 1.3,
      }}
    >
      <span
        style={{
          fontSize: "16px",
          fontWeight: 700,
          color: "#1F2937",
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "0.5px",
        }}
      >
        {time}
      </span>
      <span
        style={{
          fontSize: "11px",
          color: "#9CA3AF",
        }}
      >
        {date}
      </span>
    </div>
  );
}
