import { useCallback, useMemo, useState } from "react";
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  MenuItem,
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
import { MdEdit, MdPsychology, MdSearch } from "react-icons/md";
import GeneralSetupSectionPage, { SectionFooter, SettingsPanel } from "../GeneralSetupSectionPage";
import { PRIORITY_OPTIONS } from "../gsetup.service";
import {
  SWITCH_SX,
  TABLE_HEADER_CELL_SX,
  TABLE_CONTAINER_SX,
} from "../components/gsetup.styles";

const EMPTY_DIALOG = { open: false, intentId: "", value: "" };

const TABLE_HEADERS = [
  "Intent Name",
  "Display Name",
  "Description",
  "Default Priority",
  "Status",
  "Manual Override",
  "Actions",
];

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

function IntentManagementContent({ settings, updateSettings, saveSettings, theme }) {
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
    <Stack spacing={2.5}>
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
                  {TABLE_HEADERS.map((header) => (
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

          <SectionFooter
            theme={theme}
            onSave={() => saveSettings(settings, "Intent settings saved.")}
            helperText="Changes are stored locally for this CRM session and can later be wired to the backend."
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
    </Stack>
  );
}

export default function IntentManagementPage() {
  return (
    <GeneralSetupSectionPage
      title="Intent Management"
      subtitle="Tune AI intent labels, priority defaults, and manual override policy without retraining the model."
      ContentComponent={IntentManagementContent}
    />
  );
}
