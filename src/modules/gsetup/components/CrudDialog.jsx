import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { ACCENT_BUTTON_SX } from "./gsetup.styles";

/**
 * Reusable create/edit dialog wrapper.
 * Provides consistent title, close-on-escape behavior, and Cancel/Save action buttons.
 */
export default function CrudDialog({ open, title, children, onClose, onSave, theme }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 800 }}>{title}</DialogTitle>
      <DialogContent sx={{ pt: 1.5 }}>{children}</DialogContent>
      <DialogActions sx={{ p: 2.5, pt: 0 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSave} variant="contained" sx={ACCENT_BUTTON_SX(theme)}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
