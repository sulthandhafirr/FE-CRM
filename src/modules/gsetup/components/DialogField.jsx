import { Box, Typography } from "@mui/material";

/**
 * Label + children + optional helper text, used inside dialogs or setting sections.
 */
export default function DialogField({ label, children, helperText, theme }) {
  return (
    <Box>
      <Typography sx={{ fontSize: 13, fontWeight: 700, color: theme.text, mb: 1 }}>
        {label}
      </Typography>
      {children}
      {helperText ? (
        <Typography sx={{ fontSize: 12, color: theme.subtext, mt: 0.75 }}>
          {helperText}
        </Typography>
      ) : null}
    </Box>
  );
}
