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
      <TableCell sx={{ minWidth: 180 }}>
        <TextField
          type="text"
          inputMode="numeric"
          size="small"
          fullWidth
          disabled={disabled}
          value={rule.firstResponseHours}
          onChange={handleFieldChange("firstResponseHours")}
        />
      </TableCell>
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
      saveSettings(nextSettings, "SLA rules saved.");
    } catch {
      showToast("Failed to save SLA rules.", "error");
    } finally {
      setSaving(false);
    }
  }, [settings, updateSettings, saveSettings, showToast]);

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
        title="SLA Rules"
        subtitle="Set first response and resolution targets per priority and enable proactive monitoring."
        theme={theme}
        actions={
          <Chip
            label={`Notify ${settings.slaRules.notifyBeforeBreachedMinutes} min before breach`}
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
                    "Priority",
                    "First Response Time (hours)",
                    "Resolution Time (hours)",
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
              label="Enable SLA Monitoring"
            />
            <TextField
              type="text"
              inputMode="numeric"
              label="Notify Before SLA Breach (minutes)"
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
            helperText="SLA monitoring supports proactive breach warnings and priority-based targets."
            secondaryAction={
              <Button
                variant="outlined"
                onClick={handleResetToDefault}
                sx={{ borderRadius: "12px", fontWeight: 800, minHeight: 44 }}
              >
                Reset to Default
              </Button>
            }
          />
        </Stack>
      </SettingsPanel>
    </Stack>
  );
}

export default function SlaRulesPage() {
  return (
    <GeneralSetupSectionPage
      title="SLA Rules"
      subtitle="Set first response and resolution targets per priority and enable proactive monitoring."
      ContentComponent={SlaRulesContent}
    />
  );
}
