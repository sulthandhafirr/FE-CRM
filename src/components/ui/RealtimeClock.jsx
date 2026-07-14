import { useEffect, useState } from "react";

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

export default function RealtimeClock({ timezone = "Asia/Jakarta", locale = "id" }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { time, date } = formatInTimezone(now, timezone, locale);

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
