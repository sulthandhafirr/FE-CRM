import { useState, useEffect } from "react";
import { DateRangePicker } from "react-date-range";
import { Popover, Button } from "@mui/material";
import { MdCalendarToday, MdKeyboardArrowDown } from "react-icons/md";
import { useTranslation } from "react-i18next";
import { id as idLocale, enUS } from "date-fns/locale";
import {
  startOfToday,
  endOfToday,
  startOfYesterday,
  endOfYesterday,
  startOfWeek,
  endOfWeek,
  subWeeks,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  endOfYear,
} from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

export default function DateRangeFilter({ onApply }) {
  const { t, i18n } = useTranslation();
  const currentLocale = i18n.language === "id" ? idLocale : enUS;

  const [anchorEl, setAnchorEl] = useState(null);

  // Default range = this year
  const [range, setRange] = useState([
    {
      startDate: startOfYear(new Date()),
      endDate: endOfYear(new Date()),
      key: "selection",
    },
  ]);

  // Apply the default range on mount so parent state matches immediately
  useEffect(() => {
    onApply(range[0].startDate, range[0].endDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const open = Boolean(anchorEl);

  // Translated static ranges — labels pull from i18n, logic is plain date-fns
  const customRanges = [
    {
      label: t("pages.dateFilter.today"),
      range: () => ({ startDate: startOfToday(), endDate: endOfToday() }),
    },
    {
      label: t("pages.dateFilter.yesterday"),
      range: () => ({
        startDate: startOfYesterday(),
        endDate: endOfYesterday(),
      }),
    },
    {
      label: t("pages.dateFilter.thisWeek"),
      range: () => ({
        startDate: startOfWeek(new Date()),
        endDate: endOfWeek(new Date()),
      }),
    },
    {
      label: t("pages.dateFilter.lastWeek"),
      range: () => ({
        startDate: startOfWeek(subWeeks(new Date(), 1)),
        endDate: endOfWeek(subWeeks(new Date(), 1)),
      }),
    },
    {
      label: t("pages.dateFilter.thisMonth"),
      range: () => ({
        startDate: startOfMonth(new Date()),
        endDate: endOfMonth(new Date()),
      }),
    },
    {
      label: t("pages.dateFilter.lastMonth"),
      range: () => ({
        startDate: startOfMonth(subMonths(new Date(), 1)),
        endDate: endOfMonth(subMonths(new Date(), 1)),
      }),
    },
    {
      label: t("pages.dateFilter.thisYear"),
      range: () => ({
        startDate: startOfYear(new Date()),
        endDate: endOfYear(new Date()),
      }),
    },
  ].map((r) => ({
    ...r,
    isSelected(range) {
      const defined = r.range();
      return (
        range.startDate?.getTime() === defined.startDate.getTime() &&
        range.endDate?.getTime() === defined.endDate.getTime()
      );
    },
  }));

  const handleSelect = (ranges) => {
    setRange([ranges.selection]);
  };

  const handleApply = () => {
    onApply(range[0].startDate, range[0].endDate);
    setAnchorEl(null);
  };

  const handleClear = () => {
    const cleared = [{ startDate: null, endDate: null, key: "selection" }];
    setRange(cleared);
    onApply(null, null);
    setAnchorEl(null);
  };

  // Button label reflects the current selection — preset name if it matches, else the raw dates
  const getButtonLabel = () => {
    const { startDate, endDate } = range[0];
    if (!startDate || !endDate) {
      return t("pages.dateFilter.filterByDate");
    }

    const matched = customRanges.find((r) => {
      const defined = r.range();
      return (
        startDate.getTime() === defined.startDate.getTime() &&
        endDate.getTime() === defined.endDate.getTime()
      );
    });

    if (matched) return matched.label;

    const formatDDMMYYYY = (date) =>
      date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

    return `${formatDDMMYYYY(startDate)} - ${formatDDMMYYYY(endDate)}`;
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<MdCalendarToday />}
        endIcon={<MdKeyboardArrowDown />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          borderColor: "#E5E7EB",
          color: "#374151",
          whiteSpace: "nowrap",
          textTransform: "none",
          fontWeight: 500,
          fontSize: "14px",
          borderRadius: "12px",
          padding: "6px 16px",
          boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
          background: "#FFFFFF",
          "&:hover": {
            background: "#F9FAFB",
            borderColor: "#E5E7EB",
          },
        }}
      >
        {getButtonLabel()}
      </Button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <style>{`
          .rdrDay .rdrDayNumber span {
            color: #000 !important;
          }
        `}</style>
        <DateRangePicker
          ranges={range}
          onChange={handleSelect}
          staticRanges={customRanges}
          inputRanges={[]}
          rangeColors={["#FF8040"]}
          locale={currentLocale}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "8px",
            padding: "12px",
          }}
        >
          <Button onClick={handleClear} size="small">
            {t("pages.dateFilter.clear")}
          </Button>
          <Button
            onClick={handleApply}
            variant="contained"
            size="small"
            sx={{ background: "#FF8040" }}
          >
            {t("pages.dateFilter.apply")}
          </Button>
        </div>
      </Popover>
    </>
  );
}
