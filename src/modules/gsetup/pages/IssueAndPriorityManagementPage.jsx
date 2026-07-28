import { useCallback, useMemo, useState } from "react";
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Slider,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
} from "@mui/material";
import { MdBolt, MdEdit, MdPsychology, MdSearch } from "react-icons/md";
import GeneralSetupSectionPage, { DialogField, SectionFooter, SettingsPanel } from "../GeneralSetupSectionPage";
import { PRIORITY_OPTIONS, URGENCY_OPTIONS } from "../gsetup.service";
import {
  SWITCH_SX,
  TABLE_HEADER_CELL_SX,
  TABLE_CONTAINER_SX,
  GRID_2_SX,
} from "../components/gsetup.styles";

const EMPTY_DIALOG = { open: false, intentId: "", value: "" };

const INTENT_TABLE_HEADERS = [
  "Intent Name",
  "Display Name",
  "Description",
  "Default Priority",
  "Status",
  "Manual Override",
  "Actions",
];

// ── Intent Row ───────────────────────────────────────────────────────

function IntentRow({ intent, onUpdate, onEditDescription, theme }) {
  const handleChange = useCallback(
    (field) => (event) => {
      const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
      onUpdate(intent.id, field, value);
    },
    [intent.id, onUpdate],
  );

  return (
    <TableRow hover>
      <TableCell sx={{ whiteSpace: "nowrap", fontWeight: 700, color: theme.text }}>
        {intent.intentName}
      </TableCell>

      <TableCell sx={{ minWidth: 180 }}>
        <TextField
          value={intent.displayName}
          onChange={handleChange("displayName")}
          size="small"
          fullWidth
        />
      </TableCell>

      <TableCell sx={{ minWidth: 220 }}>
        <Button
          onClick={() => onEditDescription(intent)}
          sx={{
            justifyContent: "flex-start",
            textTransform: "none",
            color: theme.accent,
            fontWeight: 700,
            p: 0,
            minWidth: 0,
          }}
        >
          {intent.description ? "Edit description" : "Add description"}
        </Button>
      </TableCell>

      <TableCell sx={{ minWidth: 180 }}>
        <TextField
          select
          value={intent.defaultPriority}
          onChange={handleChange("defaultPriority")}
          size="small"
          fullWidth
        >
          {PRIORITY_OPTIONS.map((priority) => (
            <MenuItem key={priority} value={priority}>
              {priority}
            </MenuItem>
          ))}
        </TextField>
      </TableCell>

      <TableCell>
        <Switch
          checked={intent.enabled}
          onChange={handleChange("enabled")}
          sx={{ ...SWITCH_SX, "--switch-color": theme.accent }}
        />
      </TableCell>

      <TableCell>
        <Switch
          checked={intent.allowManualOverride}
          onChange={handleChange("allowManualOverride")}
          sx={{ ...SWITCH_SX, "--switch-color": theme.accent }}
        />
      </TableCell>

      <TableCell>
        <IconButton
          size="small"
          onClick={() => onEditDescription(intent)}
          sx={{ color: theme.accent }}
        >
          <MdEdit size={18} />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}

// ── Description Dialog ──────────────────────────────────────────────

function DescriptionDialog({ dialog, onClose, onChange, onSave, theme }) {
  return (
    <Dialog open={dialog.open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 800 }}>Edit Intent Description</DialogTitle>
      <DialogContent sx={{ pt: 1.5 }}>
        <TextField
          multiline
          minRows={5}
          fullWidth
          value={dialog.value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Describe how this intent should be interpreted by the AI model."
        />
      </DialogContent>
      <DialogActions sx={{ p: 2.5, pt: 0 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={onSave}
          variant="contained"
          sx={{
            background: theme.accent,
            "&:hover": { background: theme.accentHover },
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Intent Management Panel ─────────────────────────────────────────

function IntentManagementPanel({ settings, updateSettings, theme }) {
  const [intentQuery, setIntentQuery] = useState("");
  const [intentPage, setIntentPage] = useState(0);
  const [intentRowsPerPage, setIntentRowsPerPage] = useState(5);
  const [descriptionDialog, setDescriptionDialog] = useState(EMPTY_DIALOG);

  const intents = settings.intentManagement.intents;

  const handleQueryChange = useCallback((event) => {
    setIntentQuery(event.target.value);
    setIntentPage(0);
  }, []);

  const filteredIntents = useMemo(() => {
    const query = intentQuery.trim().toLowerCase();
    if (!query) return intents;

    return intents.filter((intent) =>
      [intent.intentName, intent.displayName, intent.description]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query)),
    );
  }, [intentQuery, intents]);

  const safePage = Math.min(
    intentPage,
    Math.max(0, Math.ceil(filteredIntents.length / intentRowsPerPage) - 1),
  );

  const pagedIntents = useMemo(() => {
    const start = safePage * intentRowsPerPage;
    return filteredIntents.slice(start, start + intentRowsPerPage);
  }, [filteredIntents, intentRowsPerPage, safePage]);

  const updateIntentField = useCallback(
    (intentId, field, value) => {
      updateSettings("intentManagement", (section) => ({
        ...section,
        intents: section.intents.map((item) =>
          item.id === intentId ? { ...item, [field]: value } : item,
        ),
      }));
    },
    [updateSettings],
  );

  const openDescriptionEditor = useCallback((intent) => {
    setDescriptionDialog({ open: true, intentId: intent.id, value: intent.description ?? "" });
  }, []);

  const closeDescriptionEditor = useCallback(() => {
    setDescriptionDialog(EMPTY_DIALOG);
  }, []);

  const handleDescriptionChange = useCallback((value) => {
    setDescriptionDialog((prev) => ({ ...prev, value }));
  }, []);

  const commitDescription = useCallback(() => {
    updateIntentField(descriptionDialog.intentId, "description", descriptionDialog.value);
    setDescriptionDialog(EMPTY_DIALOG);
  }, [descriptionDialog, updateIntentField]);

  const enabledCount = intents.filter((i) => i.enabled).length;

  return (
    <>
      <SettingsPanel
        icon={MdPsychology}
        title="Intent Management"
        subtitle="Manage labels, descriptions, priorities, and manual override controls for ticket intents."
        theme={theme}
        actions={<Chip label={`Enabled intents: ${enabledCount}`} sx={{ fontWeight: 700 }} />}
      >
        <Stack spacing={2.25}>
          <TextField
            value={intentQuery}
            onChange={handleQueryChange}
            placeholder="Search intent"
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MdSearch size={18} />
                </InputAdornment>
              ),
            }}
          />

          <TableContainer sx={TABLE_CONTAINER_SX(theme)}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  {INTENT_TABLE_HEADERS.map((header) => (
                    <TableCell key={header} sx={TABLE_HEADER_CELL_SX(theme)}>
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {pagedIntents.map((intent) => (
                  <IntentRow
                    key={intent.id}
                    intent={intent}
                    onUpdate={updateIntentField}
                    onEditDescription={openDescriptionEditor}
                    theme={theme}
                  />
                ))}

                {filteredIntents.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      sx={{ py: 6, textAlign: "center", color: theme.subtext }}
                    >
                      No intents found for your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredIntents.length}
            page={safePage}
            onPageChange={(_, nextPage) => setIntentPage(nextPage)}
            rowsPerPage={intentRowsPerPage}
            onRowsPerPageChange={(event) =>
              setIntentRowsPerPage(parseInt(event.target.value, 10))
            }
            rowsPerPageOptions={[5, 10, 25]}
            sx={{ color: theme.text, "& .MuiTablePagination-toolbar": { px: 0 } }}
          />
        </Stack>
      </SettingsPanel>

      <DescriptionDialog
        dialog={descriptionDialog}
        onClose={closeDescriptionEditor}
        onChange={handleDescriptionChange}
        onSave={commitDescription}
        theme={theme}
      />
    </>
  );
}

// ── Urgency Management Panel ────────────────────────────────────────

function UrgencyManagementPanel({ settings, updateSettings, theme }) {
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
      </Stack>
    </SettingsPanel>
  );
}

// ── Combined Content ────────────────────────────────────────────────

function IssueAndPriorityContent({ settings, updateSettings, saveSettings, theme }) {
  return (
    <Stack spacing={2.5}>
      <IntentManagementPanel
        settings={settings}
        updateSettings={updateSettings}
        theme={theme}
      />
      <UrgencyManagementPanel
        settings={settings}
        updateSettings={updateSettings}
        theme={theme}
      />
      <SectionFooter
        theme={theme}
        onSave={() => saveSettings(settings, "Issue & priority settings saved.")}
        helperText="Changes are stored locally for this CRM session and can later be wired to the backend."
      />
    </Stack>
  );
}

export default function IssueAndPriorityManagementPage() {
  return (
    <GeneralSetupSectionPage
      title="Issue and Priority Management"
      subtitle="Configure AI labels, priority thresholds, priority defaults, and keyword boosts in one place."
      ContentComponent={IssueAndPriorityContent}
    />
  );
}
