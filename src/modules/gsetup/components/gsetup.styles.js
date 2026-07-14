/** Shared Switch styling — applies accent color to checked state via CSS variable. */
export const SWITCH_SX = {
  "& .MuiSwitch-switchBase.Mui-checked": { color: "var(--switch-color, #ff8040)" },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
    backgroundColor: "var(--switch-color, #ff8040)",
  },
};

/** Contained button with theme accent. Usage: `sx={ACCENT_BUTTON_SX(theme)}` */
export const ACCENT_BUTTON_SX = (theme) => ({
  borderRadius: "12px",
  background: theme.accent,
  fontWeight: 800,
  "&:hover": { background: theme.accentHover },
});

/** Table header cell base styling. */
export const TABLE_HEADER_CELL_SX = (theme) => ({
  background: theme.sectionHeaderBg,
  color: theme.text,
  fontWeight: 800,
  whiteSpace: "nowrap",
});

/** Standard table container border. */
export const TABLE_CONTAINER_SX = (theme) => ({
  borderRadius: "16px",
  border: `1px solid ${theme.border}`,
});

/** Two-column grid responsive layout. */
export const GRID_2_SX = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
  gap: 2,
};
