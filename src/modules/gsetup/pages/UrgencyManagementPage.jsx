import { useCallback } from "react";
import {
  Chip,
  FormControlLabel,
  MenuItem,
  Slider,
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
import { MdBolt } from "react-icons/md";
import GeneralSetupSectionPage, {
  DialogField,
  SectionFooter,
  SettingsPanel,
} from "../GeneralSetupSectionPage";
import { URGENCY_OPTIONS } from "../gsetup.service";
import {
  SWITCH_SX,
  TABLE_HEADER_CELL_SX,
  TABLE_CONTAINER_SX,
  GRID_2_SX,
} from "../components/gsetup.styles";

function UrgencyManagementContent({ settings, updateSettings, saveSettings, theme }) {
  const handleToggle = useCallback(
    (field) => (event) => {
      updateSettings("urgencyManagement", (section) => ({
        ...section,
        [field]: event.target.checked,
      }));
    },
    [updateSettings],
  );

  const handleSliderChange = useCallback(
    (_, value) => {
      updateSettings("urgencyManagement", (section) => ({
        ...section,
        confidenceThreshold: Array.isArray(value) ? value[0] : value,
      }));
    },
    [updateSettings],
  );

  const handleUrgencyMapping = useCallback(
    (intent) => (event) => {
      updateSettings("urgencyManagement", (section) => ({
        ...section,
        intentMappings: section.intentMappings.map((item) =>
          item.intent === intent ? { ...item, defaultUrgency: event.target.value } : item,
        ),
      }));
    },
    [updateSettings],
  );

  const handleKeywordBoostChange = useCallback(
    (event) => {
      updateSettings("urgencyManagement", (section) => ({
        ...section,
        keywordBoostText: event.target.value,
      }));
    },
    [updateSettings],
  );

  const { urgencyManagement: um } = settings;

  return (
    <Stack spacing={2.5}>
      <SettingsPanel
        icon={MdBolt}
        title="Urgency Management"
        subtitle="Control AI urgency thresholds, sentiment boost, keyword boost, and intent mapping."
        theme={theme}
        actions={
          <Chip
            label={`${um.confidenceThreshold}% confidence threshold`}
            sx={{ fontWeight: 700 }}
          />
        }
      >
        <Stack spacing={2.5}>
          {/* Toggles */}
          <Stack sx={GRID_2_SX}>
            <FormControlLabel
              control={
                <Switch
                  checked={um.enableAiUrgencyPrediction}
                  onChange={handleToggle("enableAiUrgencyPrediction")}
                  sx={{ ...SWITCH_SX, "--switch-color": theme.accent }}
                />
              }
              label="Enable AI Urgency Prediction"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={um.enableSentimentPriorityBoost}
                  onChange={handleToggle("enableSentimentPriorityBoost")}
                  sx={{ ...SWITCH_SX, "--switch-color": theme.accent }}
                />
              }
              label="Enable Sentiment Priority Boost"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={um.enableKeywordPriorityBoost}
                  onChange={handleToggle("enableKeywordPriorityBoost")}
                  sx={{ ...SWITCH_SX, "--switch-color": theme.accent }}
                />
              }
              label="Enable Keyword Priority Boost"
            />
          </Stack>

          {/* Confidence slider */}
          <Stack>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
              <Chip label="Confidence Threshold" size="small" sx={{ fontWeight: 700 }} />
              <Chip label={`${um.confidenceThreshold}%`} size="small" />
            </Stack>
            <Slider
              value={um.confidenceThreshold}
              min={0}
              max={100}
              valueLabelDisplay="auto"
              onChange={handleSliderChange}
              sx={{ color: theme.accent }}
            />
          </Stack>

          {/* Intent mappings */}
          <TableContainer sx={TABLE_CONTAINER_SX(theme)}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {["Intent", "Default Urgency"].map((header) => (
                    <TableCell key={header} sx={TABLE_HEADER_CELL_SX(theme)}>
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {um.intentMappings.map((mapping, index) => (
                  <TableRow key={`${mapping.intent}-${index}`} hover>
                    <TableCell sx={{ fontWeight: 700 }}>{mapping.intent}</TableCell>
                    <TableCell sx={{ minWidth: 180 }}>
                      <TextField
                        select
                        size="small"
                        fullWidth
                        value={mapping.defaultUrgency}
                        onChange={handleUrgencyMapping(mapping.intent)}
                      >
                        {URGENCY_OPTIONS.map((urgency) => (
                          <MenuItem key={urgency} value={urgency}>
                            {urgency}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Keyword boost */}
          <DialogField
            label="Keyword Boost"
            helperText="Enter one keyword or phrase per line. Matching tickets will be boosted one urgency level."
            theme={theme}
          >
            <TextField
              multiline
              minRows={6}
              fullWidth
              value={um.keywordBoostText}
              onChange={handleKeywordBoostChange}
              placeholder={"payment failed\nsystem down\ncannot login\nserver offline\nproduction stopped"}
            />
          </DialogField>

          <SectionFooter
            theme={theme}
            onSave={() => saveSettings(settings, "Urgency settings saved.")}
            helperText="Global urgency settings are saved independently from other configuration sections."
          />
        </Stack>
      </SettingsPanel>
    </Stack>
  );
}

export default function UrgencyManagementPage() {
  return (
    <GeneralSetupSectionPage
      title="Urgency Management"
      subtitle="Adjust how ticket urgency is inferred from AI confidence, sentiment, and keywords."
      ContentComponent={UrgencyManagementContent}
    />
  );
}
