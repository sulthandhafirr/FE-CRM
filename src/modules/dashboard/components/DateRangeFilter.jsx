import { useState } from "react";
import { DateRangePicker, defaultStaticRanges } from "react-date-range";
import { Popover, Button } from "@mui/material";
import { MdCalendarToday } from "react-icons/md";
import { startOfYear, endOfYear } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

export default function DateRangeFilter({ onApply }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [range, setRange] = useState([
    {
      startDate: null,
      endDate: null,
      key: "selection",
    },
  ]);

  const open = Boolean(anchorEl);

  const handleSelect = (ranges) => {
    setRange([ranges.selection]);
  };

  const handleApply = () => {
    onApply(range[0].startDate, range[0].endDate);
    setAnchorEl(null);
  };

  const handleClear = () => {
    setRange([{ startDate: null, endDate: null, key: "selection" }]);
    onApply(null, null);
    setAnchorEl(null);
  };

  const customRanges = [
    ...defaultStaticRanges,
    {
      label: "This Year",
      range: () => ({
        startDate: startOfYear(new Date()),
        endDate: endOfYear(new Date()),
      }),
      isSelected(range) {
        const definedRange = this.range();
        return (
          range.startDate?.getTime() === definedRange.startDate.getTime() &&
          range.endDate?.getTime() === definedRange.endDate.getTime()
        );
      },
    },
  ];

  return (
    <>
      <Button
        onClick={(e) => setAnchorEl(e.currentTarget)}
        startIcon={<MdCalendarToday size={20} />}
        size="small"
        sx={{
          border: "1px solid #FF8040",
          color: "#FF8040",
          borderRadius: "8px",
          textTransform: "none",
          px: 1.5,
          py: 0.75,
          minWidth: "auto",
        }}
      >
        Date Filter
      </Button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <DateRangePicker
          ranges={range}
          onChange={handleSelect}
          staticRanges={customRanges}
          inputRanges={[]}
          rangeColors={["#ff8c53"]}
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
            Clear
          </Button>
          <Button
            onClick={handleApply}
            variant="contained"
            size="small"
            sx={{ background: "#ff8c53" }}
          >
            Apply
          </Button>
        </div>
      </Popover>
    </>
  );
}
