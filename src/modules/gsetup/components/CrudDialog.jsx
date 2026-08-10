import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useTranslation } from "react-i18next";
import { ACCENT_BUTTON_SX } from "./gsetup.styles";

/**
 * Reusable create/edit dialog wrapper.
 * Provides consistent title, close-on-escape behavior, and Cancel/Save action buttons.
 */
export default function CrudDialog({ open, title, children, onClose, onSave, theme }) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 800 }}>{title}</DialogTitle>
      <DialogContent sx={{ pt: 1.5 }}>{children}</DialogContent>
      <DialogActions sx={{ p: 2.5, pt: 0 }}>
        <Button onClick={onClose}>{t("pages.gsetup.common.cancel")}</Button>
        <Button onClick={onSave} variant="contained" sx={ACCENT_BUTTON_SX(theme)}>
          {t("pages.gsetup.common.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
