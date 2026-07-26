// Converts an ISO week string like "2026-W28" into the Monday of that week
export const parseIsoWeek = (label) => {
  const match = /^(\d{4})-W(\d{2})$/.exec(label);
  if (!match) return null;

  const year = Number(match[1]);
  const week = Number(match[2]);

  // Jan 4th is always in week 1 (ISO 8601 rule)
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7; // Sunday = 0 treat as 7
  const week1Monday = new Date(jan4);
  week1Monday.setUTCDate(jan4.getUTCDate() - jan4Day + 1);

  const targetMonday = new Date(week1Monday);
  targetMonday.setUTCDate(week1Monday.getUTCDate() + (week - 1) * 7);

  return targetMonday;
};

// Week shows a range like "Jul 6 - Jul 12".
export const formatLabel = (label, granularity) => {
  if (granularity === "week") {
    const monday = parseIsoWeek(label) ?? new Date(label);
    if (isNaN(monday?.getTime?.())) return label;

    const sunday = new Date(monday);
    sunday.setUTCDate(monday.getUTCDate() + 6);

    const mondayStr = monday.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const sundayStr = sunday.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    return `${mondayStr} - ${sundayStr}`;
  }

  const date = new Date(label);
  if (isNaN(date.getTime())) return label;

  if (granularity === "month") {
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  }

  // day — show as "Jul 6"
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};