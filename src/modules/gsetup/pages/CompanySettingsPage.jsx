import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { MdBusiness, MdUploadFile } from "react-icons/md";
import { useTranslation } from "react-i18next";
import GeneralSetupSectionPage, { DialogField, SectionFooter, SettingsPanel } from "../GeneralSetupSectionPage";
import {
  TIMEZONE_OPTIONS,
  WORKING_DAY_OPTIONS,
  fetchCompanySettingsFromApi,
  saveCompanySettingsToApi,
  uploadCompanyLogo,
} from "../gsetup.service";
import { GRID_2_SX } from "../components/gsetup.styles";

function CompanySettingsContent({ settings, updateSettings, saveSettings, showToast, theme, fileInputRef }) {
  const { t } = useTranslation();
  const [fileName, setFileName] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingApi, setLoadingApi] = useState(true);

  /* Load company settings from API on mount — persist to localStorage immediately */
  useEffect(() => {
    const STORAGE_KEY = "crm-general-setup-v1";

    setLoadingApi(true);
    fetchCompanySettingsFromApi().then((apiSettings) => {
      if (apiSettings) {
        updateSettings("companySettings", apiSettings);

        /* Persist only the companySettings section to localStorage
           so RealtimeClock and other components pick up the new timezone */
        try {
          const raw = window.localStorage.getItem(STORAGE_KEY);
          const stored = raw ? JSON.parse(raw) : {};
          stored.companySettings = apiSettings;
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
        } catch {
          /* localStorage unavailable — non-critical */
        }

        /* Notify RealtimeClock to pick up the new timezone immediately */
        window.dispatchEvent(new Event("company-tz-changed"));
      }
      setLoadingApi(false);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const updated = await saveCompanySettingsToApi(settings.companySettings);
      /* Merge API response back into editor state, then persist to localStorage */
      const nextSettings = {
        ...settings,
        companySettings: updated,
      };
      updateSettings("companySettings", updated);
      saveSettings(nextSettings, t("pages.gsetup.companySettings.toastSaved"));

      /* Notify RealtimeClock to pick up the new timezone immediately */
      window.dispatchEvent(new Event("company-tz-changed"));
    } catch {
      showToast(t("pages.gsetup.companySettings.toastSaveFailed"), "error");
    } finally {
      setSaving(false);
    }
  }, [settings, updateSettings, saveSettings, showToast, t]);

  const handleFieldChange = useCallback(
    (field) => (event) => {
      updateSettings("companySettings", (section) => ({
        ...section,
        [field]: event.target.value,
      }));
    },
    [updateSettings],
  );

  const handleWorkingDayToggle = useCallback(
    (day) => (event) => {
      updateSettings("companySettings", (section) => ({
        ...section,
        workingDays: event.target.checked
          ? [...section.workingDays, day]
          : section.workingDays.filter((value) => value !== day),
      }));
    },
    [updateSettings],
  );

  const handleLogoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    try {
      const logoUrl = await uploadCompanyLogo(file);
      updateSettings("companySettings", (section) => ({
        ...section,
        logoDataUrl: logoUrl,
      }));
      showToast(t("pages.gsetup.companySettings.toastLogoOk"));
    } catch {
      showToast(t("pages.gsetup.companySettings.toastLogoFail"), "error");
      setFileName("");
    }

    // Reset input so the same file can be re-selected
    event.target.value = "";
  };

  const clearLogo = () => {
    updateSettings("companySettings", (section) => ({ ...section, logoDataUrl: "" }));
    setFileName("");
  };

  const { companySettings: s } = settings;

  /* Show loading until fresh API data arrives */
  if (loadingApi) {
    return (
      <Stack spacing={2.5}>
        <SettingsPanel
          icon={MdBusiness}
          title={t("pages.gsetup.companySettings.title")}
          subtitle={t("pages.gsetup.companySettings.loading")}
          theme={theme}
        >
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <Typography sx={{ color: theme.subtext, fontSize: 14 }}>
              {t("pages.gsetup.companySettings.loading")}
            </Typography>
          </Box>
        </SettingsPanel>
      </Stack>
    );
  }

  return (
    <Stack spacing={2.5}>
      <SettingsPanel
        icon={MdBusiness}
        title={t("pages.gsetup.companySettings.title")}
        subtitle={t("pages.gsetup.companySettings.subtitle")}
        theme={theme}
        actions={<Chip label={t("pages.gsetup.companySettings.chip")} sx={{ fontWeight: 700 }} />}
      >
        <Stack spacing={2.5}>
          <Box sx={GRID_2_SX}>
            <TextField
              label={t("pages.gsetup.companySettings.companyName")}
              value={s.companyName}
              onChange={handleFieldChange("companyName")}
              fullWidth
            />
            <TextField
              label={t("pages.gsetup.companySettings.supportEmail")}
              type="email"
              value={s.supportEmail}
              onChange={handleFieldChange("supportEmail")}
              fullWidth
            />
            <TextField
              label={t("pages.gsetup.companySettings.phoneNumber")}
              value={s.phoneNumber}
              onChange={handleFieldChange("phoneNumber")}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>{t("pages.gsetup.companySettings.timezone")}</InputLabel>
              <Select label={t("pages.gsetup.companySettings.timezone")} value={s.timezone} onChange={handleFieldChange("timezone")}>
                {TIMEZONE_OPTIONS.map((timezone) => (
                  <MenuItem key={timezone} value={timezone}>
                    {timezone}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Logo upload */}
          <Box
            sx={{
              border: `1px solid ${theme.border}`,
              borderRadius: "16px",
              p: 2,
              background: theme.isDarkMode ? "rgba(255,255,255,0.02)" : "#fff",
            }}
          >
            <Typography sx={{ fontSize: 13, fontWeight: 800, color: theme.text, mb: 1.5 }}>
              {t("pages.gsetup.companySettings.companyLogo")}
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 84,
                  height: 84,
                  borderRadius: "18px",
                  border: `1px dashed ${theme.border}`,
                  background: theme.inputHover,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                {s.logoDataUrl ? (
                  <Box
                    component="img"
                    src={s.logoDataUrl}
                    alt="Company logo"
                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <MdBusiness size={30} color={theme.subtext} />
                )}
              </Box>
              <Stack spacing={1} sx={{ flex: 1, width: "100%" }}>
                <Typography sx={{ fontSize: 13, color: theme.subtext }}>
                  {t("pages.gsetup.companySettings.logoHelp")}
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                  <Button
                    variant="outlined"
                    onClick={() => fileInputRef.current?.click()}
                    startIcon={<MdUploadFile size={18} />}
                    sx={{ borderRadius: "12px", fontWeight: 800 }}
                  >
                    {t("pages.gsetup.companySettings.uploadLogo")}
                  </Button>
                  <Button
                    variant="text"
                    onClick={clearLogo}
                    sx={{ borderRadius: "12px", fontWeight: 800, color: theme.accent }}
                  >
                    {t("pages.gsetup.companySettings.remove")}
                  </Button>
                </Stack>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleLogoUpload}
                />
                {fileName ? (
                  <Typography sx={{ fontSize: 12, color: theme.subtext }}>
                    {fileName}
                  </Typography>
                ) : null}
              </Stack>
            </Stack>
          </Box>

          {/* Working days & hours */}
          <Box sx={GRID_2_SX}>
            <DialogField label={t("pages.gsetup.companySettings.workingDays")} theme={theme}>
              <FormGroup row sx={{ gap: 0.5 }}>
                {WORKING_DAY_OPTIONS.map((day) => (
                  <FormControlLabel
                    key={day.value}
                    control={
                      <Checkbox
                        checked={s.workingDays.includes(day.value)}
                        onChange={handleWorkingDayToggle(day.value)}
                        sx={{
                          color: theme.accent,
                          "&.Mui-checked": { color: theme.accent },
                        }}
                      />
                    }
                    label={day.label}
                  />
                ))}
              </FormGroup>
            </DialogField>

            <DialogField
              label={t("pages.gsetup.companySettings.workingHours")}
              helperText={t("pages.gsetup.companySettings.workingHoursHelp")}
              theme={theme}
            >
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <TextField
                  type="time"
                  label={t("pages.gsetup.companySettings.start")}
                  value={s.workingHoursStart}
                  onChange={handleFieldChange("workingHoursStart")}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  type="time"
                  label={t("pages.gsetup.companySettings.end")}
                  value={s.workingHoursEnd}
                  onChange={handleFieldChange("workingHoursEnd")}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>
            </DialogField>
          </Box>

          <SectionFooter
            theme={theme}
            onSave={handleSave}
            loading={saving}
            helperText={t("pages.gsetup.companySettings.helper")}
          />
        </Stack>
      </SettingsPanel>
    </Stack>
  );
}

export default function CompanySettingsPage() {
  const { t } = useTranslation();

  return (
    <GeneralSetupSectionPage
      title={t("pages.gsetup.companySettings.title")}
      ContentComponent={CompanySettingsContent}
    />
  );
}
