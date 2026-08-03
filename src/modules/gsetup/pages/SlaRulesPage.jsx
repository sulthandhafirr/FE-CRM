import { useCallback, useState } from "react";
import {
  Chip,
  FormControlLabel,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button
} from "@mui/material";
import { MdGavel } from "react-icons/md";
import { useTranslation } from "react-i18next";
import GeneralSetupSectionPage, {
  SectionFooter,
  SettingsPanel,
} from "../GeneralSetupSectionPage";
import { saveSlaConfigToApi } from "../gsetup.service";
import {
  SWITCH_SX,
  TABLE_HEADER_CELL_SX,
  TABLE_CONTAINER_SX,
  GRID_2_SX,
} from "../components/gsetup.styles";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";

  const DEFAULT_SLA_RULES = [
    { priority: "Critical", firstResponseHours: 1, resolutionHours: 24 },
    { priority: "High", firstResponseHours: 2, resolutionHours: 48 },
    { priority: "Normal", firstResponseHours: 8, resolutionHours: 72 },
    { priority: "Low", firstResponseHours: 24, resolutionHours: 96 },
  ];

function SlaRuleRow({ rule, onUpdate, disabled }) {
  const handleFieldChange = useCallback(
    (field) => (event) => {
      const raw = event.target.value;

      if (raw === "" || /^\d+$/.test(raw)) {
        onUpdate(rule.priority, field, raw === "" ? 0 : Number(raw));
      }
    },
    [rule.priority, onUpdate],
  );

  return (
    <TableRow hover>
      <TableCell sx={{ fontWeight: 700 }}>{rule.priority}</TableCell>
      {/* ── First Response Time (hours) — hidden column ── */}
      {/* <TableCell sx={{ minWidth: 180 }}>
        <TextField
          type="text"
          inputMode="numeric"
          size="small"
          fullWidth
          disabled={disabled}
          value={rule.firstResponseHours}
          onChange={handleFieldChange("firstResponseHours")}
        />
      </TableCell> */}
      <TableCell sx={{ minWidth: 180 }}>
        <TextField
          type="text"
          inputMode="numeric"
          size="small"
          fullWidth
          disabled={disabled}
          value={rule.resolutionHours}
          onChange={handleFieldChange("resolutionHours")}
        />
      </TableCell>
    </TableRow>
  );
}

function SlaRulesContent({
  settings,
  updateSettings,
  saveSettings,
  showToast,
  theme,
  slaApiLoading,
}) {
  const [saving, setSaving] = useState(false);
  const { t } = useTranslation();

  const updateSlaRule = useCallback(
    (priority, field, value) => {
      updateSettings("slaRules", (section) => ({
        ...section,
        rules: section.rules.map((item) =>
          item.priority === priority ? { ...item, [field]: value } : item,
        ),
      }));
    },
    [updateSettings],
  );

  const handleToggle = useCallback(
    (field) => (event) => {
      updateSettings("slaRules", (section) => ({
        ...section,
        [field]: event.target.checked,
      }));
    },
    [updateSettings],
  );

  const handleNotifyChange = useCallback(
    (event) => {
      const raw = event.target.value;
      if (raw === "" || /^\d+$/.test(raw)) {
        updateSettings("slaRules", (section) => ({
          ...section,
          notifyBeforeBreachedMinutes: raw === "" ? 0 : Number(raw),
        }));
      }
    },
    [updateSettings],
  );

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const updated = await saveSlaConfigToApi(settings.slaRules);
      const nextSettings = {
        ...settings,
        slaRules: updated,
      };
      updateSettings("slaRules", updated);
      saveSettings(nextSettings, t("pages.gsetup.slaRules.toastSaved"));
    } catch {
      showToast(t("pages.gsetup.slaRules.toastSaveFailed"), "error");
    } finally {
      setSaving(false);
    }
  }, [settings, updateSettings, saveSettings, showToast, t]);

  const handleResetToDefault = useCallback(() => {
    updateSettings("slaRules", (section) => ({
      ...section,
      rules: DEFAULT_SLA_RULES.map((rule) => ({ ...rule })),
      enableSlaMonitoring: true,
      notifyBeforeBreachedMinutes: 30,
    }));
  }, [updateSettings]);

  if (slaApiLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Stack spacing={2.5}>
      <SettingsPanel
        icon={MdGavel}
        title={t("pages.gsetup.slaRules.title")}
        subtitle={t("pages.gsetup.slaRules.subtitle")}
        theme={theme}
        actions={
          <Chip
            label={t("pages.gsetup.slaRules.notifyChip", {
              minutes: settings.slaRules.notifyBeforeBreachedMinutes,
            })}
            sx={{ fontWeight: 700 }}
          />
        }
      >
        <Stack spacing={2.5}>
          <TableContainer sx={TABLE_CONTAINER_SX(theme)}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {[
                    t("pages.gsetup.slaRules.priority"),
                    // "First Response Time (hours)", // hidden column
                    t("pages.gsetup.slaRules.resolutionHours"),
                  ].map((header) => (
                    <TableCell key={header} sx={TABLE_HEADER_CELL_SX(theme)}>
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {settings.slaRules.rules.map((rule) => (
                  <SlaRuleRow
                    key={rule.priority}
                    rule={rule}
                    onUpdate={updateSlaRule}
                    disabled={!settings.slaRules.enableSlaMonitoring}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Stack sx={GRID_2_SX}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.slaRules.enableSlaMonitoring}
                  onChange={handleToggle("enableSlaMonitoring")}
                  sx={{ ...SWITCH_SX, "--switch-color": theme.accent }}
                />
              }
              label={t("pages.gsetup.slaRules.enableMonitoring")}
            />
            <TextField
              type="text"
              inputMode="numeric"
              label={t("pages.gsetup.slaRules.notifyMinutes")}
              value={settings.slaRules.notifyBeforeBreachedMinutes}
              onChange={handleNotifyChange}
              disabled={!settings.slaRules.enableSlaMonitoring}
              fullWidth
            />
          </Stack>

          <SectionFooter
            theme={theme}
            onSave={handleSave}
            loading={saving}
            helperText={t("pages.gsetup.slaRules.helper")}
            secondaryAction={
              <Button
                variant="outlined"
                onClick={handleResetToDefault}
                sx={{ borderRadius: "12px", fontWeight: 800, minHeight: 44 }}
              >
                {t("pages.gsetup.slaRules.resetToDefault")}
              </Button>
            }
          />
        </Stack>
      </SettingsPanel>
    </Stack>
  );
}

export default function SlaRulesPage() {
  const { t } = useTranslation();

  return (
    <GeneralSetupSectionPage
      title={t("pages.gsetup.slaRules.title")}
      subtitle={t("pages.gsetup.slaRules.subtitle")}
      ContentComponent={SlaRulesContent}
    />
  );
}
