import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { MdArrowBack, MdChevronRight, MdSave } from "react-icons/md";
import { ACCENT_BUTTON_SX } from "./components/gsetup.styles";
import useGeneralSetupEditor from "./components/useGeneralSetupEditor";

export function createGeneralSetupThemeTokens() {
  return {
    isDarkMode: false,
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    pageBg: "#f9fafb",
    cardBg: "#ffffff",
    sectionHeaderBg: "linear-gradient(180deg, #fffaf7 0%, #ffffff 100%)",
    border: "#e5e7eb",
    text: "#0f172a",
    subtext: "#64748b",
    inputHover: "#fff7f2",
    accent: "#ff8040",
    accentHover: "#e6723a",
    iconBg: "#fff1eb",
    shadow: "0 14px 34px rgba(15,23,42,0.08)",

  };
}

function SettingsPageShell({ title, actions, children, theme }) {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        minHeight: "100%",
        fontFamily: theme.fontFamily,
        background: theme.pageBg,
        color: theme.text,
        px: { xs: 2, sm: 3, lg: 4 },
        py: { xs: 2, sm: 3, lg: 4 },
      }}
    >
      <Box sx={{ maxWidth: 1320, mx: "auto" }}>
        <Stack
          direction={{ xs: "column", lg: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", lg: "center" }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexWrap: "wrap" }}>
            <Button
              onClick={() => window.history.back()}
              variant="outlined"
              startIcon={<MdArrowBack size={18} />}
              sx={{ borderRadius: "12px", fontWeight: 800, minHeight: 42 }}
            >
              {t("pages.gsetup.common.back")}
            </Button>
            <Breadcrumbs
              separator={<MdChevronRight size={16} color={theme.subtext} />}
              sx={{ color: theme.subtext }}
            >
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: theme.subtext }}>
                {t("pages.gsetup.breadcrumb.dashboard")}
              </Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: theme.subtext }}>
                {t("pages.gsetup.breadcrumb.generalSetup")}
              </Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: theme.text }}>
                {title}
              </Typography>
            </Breadcrumbs>
          </Stack>

          {actions ? (
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              {actions}
            </Stack>
          ) : null}
        </Stack>

        {children}
      </Box>
    </Box>
  );
}

export function SettingsPanel({ title, subtitle, icon: Icon, actions, children, theme }) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: "20px",
        border: `1px solid ${theme.border}`,
        background: theme.cardBg,
        boxShadow: theme.shadow,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: 2,
          background: theme.sectionHeaderBg,
          borderBottom: `1px solid ${theme.border}`,
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: theme.iconBg,
                color: theme.accent,
                flexShrink: 0,
              }}
            >
              <Icon size={22} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 18, fontWeight: 800, color: theme.text }}>
                {title}
              </Typography>
              <Typography sx={{ fontSize: 13, color: theme.subtext, mt: 0.35 }}>
                {subtitle}
              </Typography>
            </Box>
          </Stack>

          {actions}
        </Stack>
      </Box>

      <Box sx={{ p: { xs: 2, sm: 2.5 } }}>{children}</Box>
    </Paper>
  );
}

export function SectionFooter({
  theme,
  onSave,
  saveLabel,
  helperText,
  loading = false,
  secondaryAction,
}) {
  const { t } = useTranslation();
  const resolvedSaveLabel = saveLabel ?? t("pages.gsetup.common.saveChanges");

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "stretch", sm: "center" }}
      spacing={1.5}
      sx={{ mt: 2.5 }}
    >
      <Typography sx={{ color: theme.subtext, fontSize: 13 }}>{helperText}</Typography>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ alignSelf: { xs: "stretch", sm: "auto" } }}>
        {secondaryAction}
        <Button
          variant="contained"
          onClick={onSave}
          disabled={loading}
          startIcon={<MdSave size={18} />}
          sx={{
            minHeight: 44,
            ...ACCENT_BUTTON_SX(theme),
            color: "white",
            px: 2.5,
          }}
        >
          {resolvedSaveLabel}
        </Button>
      </Stack>
    </Stack>
  );
}

// Re-export shared components for convenience (preserves existing imports)
export { default as ConfirmDialog } from "./components/ConfirmDialog";
export { default as DialogField } from "./components/DialogField";

export default function GeneralSetupSectionPage({ title, actions, ContentComponent }) {
  const theme = useMemo(() => createGeneralSetupThemeTokens(), []);
  const editor = useGeneralSetupEditor();

  return (
    <SettingsPageShell title={title} actions={actions} theme={theme}>
      <ContentComponent {...editor} theme={theme} />

      <Snackbar
        open={editor.toast.open}
        autoHideDuration={2600}
        onClose={editor.handleCloseToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={editor.handleCloseToast}
          severity={editor.toast.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {editor.toast.message}
        </Alert>
      </Snackbar>
    </SettingsPageShell>
  );
}
