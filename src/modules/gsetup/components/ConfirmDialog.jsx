import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

/**
 * Reusable confirmation dialog with cancel/confirm actions.
 */
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onClose,
  onConfirm,
  theme,
}) {
  const { t } = useTranslation();
  const resolvedConfirmLabel = confirmLabel ?? t("pages.gsetup.common.confirm");
  const resolvedCancelLabel = cancelLabel ?? t("pages.gsetup.common.cancel");

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, color: theme.text }}>{title}</DialogTitle>
      <DialogContent>
        <Typography sx={{ color: theme.subtext, fontSize: 14 }}>{description}</Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, pt: 0 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: "10px" }}>
          {resolvedCancelLabel}
        </Button>
        <Button onClick={onConfirm} variant="contained" color="error" sx={{ borderRadius: "10px" }}>
          {resolvedConfirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
