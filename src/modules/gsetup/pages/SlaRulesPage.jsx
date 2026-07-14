import { useCallback } from "react";
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
} from "@mui/material";
import { MdGavel } from "react-icons/md";
import GeneralSetupSectionPage, { SectionFooter, SettingsPanel } from "../GeneralSetupSectionPage";
import {
  SWITCH_SX,
  TABLE_HEADER_CELL_SX,
  TABLE_CONTAINER_SX,
  GRID_2_SX,
} from "../components/gsetup.styles";

function SlaRuleRow({ rule, onUpdate }) {
  const handleFieldChange = useCallback(
    (field) => (event) => {
      onUpdate(rule.priority, field, Number(event.target.value) || 0);
    },
    [rule.priority, onUpdate],
  );

  return (
    <TableRow hover>
      <TableCell sx={{ fontWeight: 700 }}>{rule.priority}</TableCell>
      <TableCell sx={{ minWidth: 180 }}>
        <TextField
          type="number"
          size="small"
          fullWidth
          value={rule.firstResponseHours}
          onChange={handleFieldChange("firstResponseHours")}
        />
      </TableCell>
      <TableCell sx={{ minWidth: 180 }}>
        <TextField
          type="number"
          size="small"
          fullWidth
          value={rule.resolutionHours}
          onChange={handleFieldChange("resolutionHours")}
        />
      </TableCell>
    </TableRow>
  );
}

function SlaRulesContent({ settings, updateSettings, saveSettings, theme }) {
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
      updateSettings("slaRules", (section) => ({
        ...section,
        notifyBeforeBreachedMinutes: Number(event.target.value) || 0,
      }));
    },
    [updateSettings],
  );

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
                  {["Priority", "First Response Time (hours)", "Resolution Time (hours)"].map(
                    (header) => (
                      <TableCell key={header} sx={TABLE_HEADER_CELL_SX(theme)}>
                        {header}
                      </TableCell>
                    ),
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {settings.slaRules.rules.map((rule) => (
                  <SlaRuleRow
                    key={rule.priority}
                    rule={rule}
                    onUpdate={updateSlaRule}
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
              type="number"
              label="Notify Before SLA Breach (minutes)"
              value={settings.slaRules.notifyBeforeBreachedMinutes}
              onChange={handleNotifyChange}
              inputProps={{ min: 0 }}
              fullWidth
            />
          </Stack>

          <SectionFooter
            theme={theme}
            onSave={() => saveSettings(settings, "SLA rules saved.")}
            helperText="SLA monitoring supports proactive breach warnings and priority-based targets."
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
