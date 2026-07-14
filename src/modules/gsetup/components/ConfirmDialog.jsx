import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";

/**
 * Reusable confirmation dialog with cancel/confirm actions.
 */
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onClose,
  onConfirm,
  theme,
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, color: theme.text }}>{title}</DialogTitle>
      <DialogContent>
        <Typography sx={{ color: theme.subtext, fontSize: 14 }}>{description}</Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, pt: 0 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: "10px" }}>
          {cancelLabel}
        </Button>
        <Button onClick={onConfirm} variant="contained" color="error" sx={{ borderRadius: "10px" }}>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
