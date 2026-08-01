import { useEffect, useState } from "react";
import { Box, Button, Modal, Paper, Stack, TextField, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";


export default function EditPositionModal({ open, onClose, profile, onSave }) {
  const [position, setPosition] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    if (open) {
      setPosition(profile?.position ?? "");
      setError("");
    }
  }, [open, profile]);

  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setError("");
    try {
      await onSave(profile.id, position.trim());
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message ?? err?.message ?? "Failed to update position");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      slotProps={{ backdrop: { sx: { backgroundColor: "rgba(16,24,40,0.35)", backdropFilter: "blur(2px)" } } }}
    >
      <Box
        sx={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)", width: { xs: "92vw", sm: 420 },
          outline: "none",
        }}
      >
        <Paper
          sx={{
            borderRadius: "16px", p: 3,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          <Typography sx={{ fontSize: 20, fontWeight: 800, mb: 0.5 }}>{t("pages.adminUserPerformance.editPosition")}</Typography>
          <Typography sx={{ fontSize: 13, color: "#667085", mb: 2.5 }}>{profile?.name}</Typography>

          <TextField
            autoFocus
            fullWidth
            label={t("pages.adminUserPerformance.columns.position")}
            placeholder={t("pages.addUserForm.fields.positionPlaceholder")}
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
            }}
          />

          {error && (
            <Box sx={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", px: 2, py: 1.5, mt: 2 }}>
              <Typography sx={{ fontSize: 13, color: "#dc2626" }}>{error}</Typography>
            </Box>
          )}

          <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ mt: 3 }}>
            <Button
              onClick={handleClose}
              disabled={saving}
              variant="outlined"
              sx={{ borderRadius: "10px", borderColor: "#D0D5DD", color: "#344054", fontWeight: 700, px: 3 }}
            >
              {t("pages.adminUserPerformance.cancel")}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              variant="contained"
              sx={{ borderRadius: "10px", background: "#FF8040", fontWeight: 700, px: 3, "&:hover": { background: "#e6723a" } }}
            >
              {saving ? t("pages.adminUserPerformance.saving") : t("pages.adminUserPerformance.save")}
            </Button>
          </Stack>
        </Paper>
      </Box>
    </Modal>
  );
}