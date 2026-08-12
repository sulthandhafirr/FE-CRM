import { useCallback, useState } from "react";
import {
  Alert,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
} from "@mui/material";
import { MdOutlineScheduleSend } from "react-icons/md";
import { useTranslation } from "react-i18next";
import GeneralSetupSectionPage, {
  SectionFooter,
  SettingsPanel,
} from "../GeneralSetupSectionPage";
import { saveExportScheduleToApi } from "../gsetup.service";
import { SWITCH_SX, GRID_2_SX } from "../components/gsetup.styles";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";

function ExportScheduleContent({
  settings,
  updateSettings,
  saveSettings,
  showToast,
  theme,
  exportScheduleApiLoading,
}) {
  const [saving, setSaving] = useState(false);
  const { t } = useTranslation();

  const schedule = settings.exportSchedule;

  const updateField = useCallback(
    (field, value) => {
      updateSettings("exportSchedule", (section) => ({
        ...section,
        [field]: value,
      }));
    },
    [updateSettings],
  );

  const handleToggle = useCallback(
    (field) => (event) => updateField(field, event.target.checked),
    [updateField],
  );

  const handleDayChange = useCallback(
    (event) => {
      const raw = event.target.value;
      if (raw === "" || /^\d+$/.test(raw)) {
        updateField("dayOfMonth", raw === "" ? "" : Number(raw));
      }
    },
    [updateField],
  );

  const handleSave = useCallback(async () => {
    if (schedule.frequency === "monthly") {
      const day = Number(schedule.dayOfMonth);
      if (!day || day < 1 || day > 31) {
        showToast(t("pages.gsetup.exportSchedule.toastDayInvalid"), "error");
        return;
      }
    }
    if (!schedule.time) {
      showToast(t("pages.gsetup.exportSchedule.toastTimeRequired"), "error");
      return;
    }
    if (!schedule.includeTickets && !schedule.includeUsers && !schedule.includeCombined) {
      showToast(t("pages.gsetup.exportSchedule.toastDataRequired"), "error");
      return;
    }

    setSaving(true);
    try {
      const updated = await saveExportScheduleToApi(schedule);
      updateSettings("exportSchedule", updated);
      saveSettings(
        { ...settings, exportSchedule: updated },
        t("pages.gsetup.exportSchedule.toastSaved"),
      );
    } catch {
      showToast(t("pages.gsetup.exportSchedule.toastSaveFailed"), "error");
    } finally {
      setSaving(false);
    }
  }, [settings, schedule, updateSettings, saveSettings, showToast, t]);

  if (exportScheduleApiLoading) {
    return <LoadingSpinner />;
  }

  const FREQUENCY_OPTIONS = [
    { value: "daily", label: t("pages.gsetup.exportSchedule.frequencyDaily") },
    { value: "weekly", label: t("pages.gsetup.exportSchedule.frequencyWeekly") },
    { value: "monthly", label: t("pages.gsetup.exportSchedule.frequencyMonthly") },
  ];

  const DAY_OF_WEEK_OPTIONS = [0, 1, 2, 3, 4, 5, 6].map((value) => ({
    value,
    label: t(`pages.gsetup.exportSchedule.days.${value}`),
  }));

  const dataOptions = [
    {
      key: "includeTickets",
      label: t("pages.gsetup.exportSchedule.includeTickets"),
    },
    {
      key: "includeUsers",
      label: t("pages.gsetup.exportSchedule.includeUsers"),
    },
    {
      key: "includeCombined",
      label: t("pages.gsetup.exportSchedule.includeCombined"),
    },
  ];

  return (
    <Stack spacing={2.5}>
      <SettingsPanel
        icon={MdOutlineScheduleSend}
        title={t("pages.gsetup.exportSchedule.title")}
        subtitle={t("pages.gsetup.exportSchedule.subtitle")}
        theme={theme}
        actions={
          <Chip
            label={
              schedule.enabled
                ? t("pages.gsetup.exportSchedule.activeChip")
                : t("pages.gsetup.exportSchedule.inactiveChip")
            }
            color={schedule.enabled ? "success" : "default"}
            sx={{ fontWeight: 700 }}
          />
        }
      >
        <Stack spacing={2.5}>
          <FormControlLabel
            control={
              <Switch
                checked={schedule.enabled}
                onChange={handleToggle("enabled")}
                sx={{ ...SWITCH_SX, "--switch-color": theme.accent }}
              />
            }
            label={t("pages.gsetup.exportSchedule.enableSending")}
          />

          <Stack sx={GRID_2_SX}>
            <FormControl fullWidth>
              <InputLabel>{t("pages.gsetup.exportSchedule.frequency")}</InputLabel>
              <Select
                label={t("pages.gsetup.exportSchedule.frequency")}
                value={schedule.frequency}
                onChange={(e) => updateField("frequency", e.target.value)}
                disabled={!schedule.enabled}
              >
                {FREQUENCY_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              type="time"
              label={t("pages.gsetup.exportSchedule.time")}
              value={schedule.time}
              onChange={(e) => updateField("time", e.target.value)}
              disabled={!schedule.enabled}
              fullWidth
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 60 }}
            />
          </Stack>

          {schedule.frequency === "monthly" && (
            <TextField
              type="text"
              inputMode="numeric"
              label={t("pages.gsetup.exportSchedule.dayOfMonth")}
              value={schedule.dayOfMonth}
              onChange={handleDayChange}
              disabled={!schedule.enabled}
              fullWidth
              helperText={t("pages.gsetup.exportSchedule.dayHelper")}
            />
          )}

          {schedule.frequency === "weekly" && (
            <FormControl fullWidth>
              <InputLabel>{t("pages.gsetup.exportSchedule.dayOfWeek")}</InputLabel>
              <Select
                label={t("pages.gsetup.exportSchedule.dayOfWeek")}
                value={schedule.dayOfWeek}
                onChange={(e) => updateField("dayOfWeek", Number(e.target.value))}
                disabled={!schedule.enabled}
              >
                {DAY_OF_WEEK_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <Stack spacing={1}>
            {dataOptions.map((option) => (
              <FormControlLabel
                key={option.key}
                control={
                  <Checkbox
                    checked={schedule[option.key]}
                    onChange={handleToggle(option.key)}
                    disabled={!schedule.enabled}
                    sx={{ color: theme.accent, "&.Mui-checked": { color: theme.accent } }}
                  />
                }
                label={option.label}
              />
            ))}
          </Stack>

          <TextField
            type="text"
            label={t("pages.gsetup.exportSchedule.recipients")}
            value={schedule.recipients}
            onChange={(e) => updateField("recipients", e.target.value)}
            disabled={!schedule.enabled}
            multiline
            minRows={2}
            fullWidth
            helperText={t("pages.gsetup.exportSchedule.recipientsHelper")}
          />

          <Alert severity="info" sx={{ borderRadius: "12px" }}>
            {t("pages.gsetup.exportSchedule.infoWindow")}
          </Alert>

          <SectionFooter
            theme={theme}
            onSave={handleSave}
            loading={saving}
            helperText={t("pages.gsetup.exportSchedule.helper")}
          />
        </Stack>
      </SettingsPanel>
    </Stack>
  );
}

export default function ExportSchedulePage() {
  const { t } = useTranslation();

  return (
    <GeneralSetupSectionPage
      title={t("pages.gsetup.exportSchedule.title")}
      ContentComponent={ExportScheduleContent}
    />
  );
}
