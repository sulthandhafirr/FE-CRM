import { useCallback, useState } from "react";
import {
  Button,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
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
import { MdAdd, MdDeleteOutline, MdEdit, MdChecklist } from "react-icons/md";
import GeneralSetupSectionPage, {
  ConfirmDialog,
  SectionFooter,
  SettingsPanel,
} from "../GeneralSetupSectionPage";
import { STATUS_COLOR_OPTIONS, createStatusDraft } from "../gsetup.service";
import {
  SWITCH_SX,
  TABLE_HEADER_CELL_SX,
  TABLE_CONTAINER_SX,
  GRID_2_SX,
} from "../components/gsetup.styles";
import CrudDialog from "../components/CrudDialog";

function buildNewStatusId(statusName) {
  return `${statusName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
}

function TicketStatusContent({ settings, updateSettings, saveSettings, theme, showToast }) {
  const [statusDialog, setStatusDialog] = useState({
    open: false,
    mode: "create",
    statusId: "",
  });
  const [statusDraft, setStatusDraft] = useState(createStatusDraft());
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    title: "",
    description: "",
    onConfirm: null,
  });

  const closeStatusDialog = useCallback(() => {
    setStatusDialog({ open: false, mode: "create", statusId: "" });
    setStatusDraft(createStatusDraft());
  }, []);

  const openStatusEditor = useCallback((status) => {
    setStatusDraft(status ?? createStatusDraft());
    setStatusDialog({
      open: true,
      mode: status ? "edit" : "create",
      statusId: status?.id ?? "",
    });
  }, []);

  const commitStatus = useCallback(() => {
    if (!statusDraft.name.trim()) {
      showToast("Status name is required.", "error");
      return;
    }

    updateSettings("ticketStatus", (section) => {
      const nextStatuses =
        statusDialog.mode === "edit"
          ? section.statuses.map((status) =>
              status.id === statusDialog.statusId
                ? { ...statusDraft, id: status.id }
                : status,
            )
          : [
              ...section.statuses,
              { ...statusDraft, id: buildNewStatusId(statusDraft.name) },
            ];

      return { ...section, statuses: nextStatuses };
    });

    closeStatusDialog();
  }, [statusDraft, statusDialog, updateSettings, showToast, closeStatusDialog]);

  const handleDeleteStatus = useCallback(
    (status) => {
      setDeleteDialog({
        open: true,
        title: "Delete status?",
        description: `This will remove ${status.name} from the workflow. Existing tickets keep their current value.`,
        onConfirm: () => {
          updateSettings("ticketStatus", (section) => ({
            ...section,
            statuses: section.statuses.filter((item) => item.id !== status.id),
          }));
          setDeleteDialog({
            open: false,
            title: "",
            description: "",
            onConfirm: null,
          });
          showToast("Status deleted.");
        },
      });
    },
    [updateSettings, showToast],
  );

  const closeDeleteDialog = useCallback(() => {
    setDeleteDialog({ open: false, title: "", description: "", onConfirm: null });
  }, []);

  const updateStatusField = useCallback(
    (statusId, field, value) => {
      updateSettings("ticketStatus", (section) => ({
        ...section,
        statuses: section.statuses.map((item) =>
          item.id === statusId ? { ...item, [field]: value } : item,
        ),
      }));
    },
    [updateSettings],
  );

  const { ticketStatus: ts } = settings;

  return (
    <Stack spacing={2.5}>
      <SettingsPanel
        icon={MdChecklist}
        title="Ticket Status"
        subtitle="Edit statuses, colors, reopen behavior, and auto-close policy for ticket flow."
        theme={theme}
        actions={
          <Button
            onClick={() => openStatusEditor(null)}
            variant="outlined"
            startIcon={<MdAdd size={18} />}
            sx={{ borderRadius: "12px", fontWeight: 800 }}
          >
            Add Status
          </Button>
        }
      >
        <Stack spacing={2.5}>
          <TableContainer sx={TABLE_CONTAINER_SX(theme)}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {["Status Name", "Color Badge", "Active", "Actions"].map((header) => (
                    <TableCell key={header} sx={TABLE_HEADER_CELL_SX(theme)}>
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {ts.statuses.map((status) => (
                  <TableRow key={status.id} hover>
                    <TableCell sx={{ minWidth: 180 }}>
                      <TextField
                        value={status.name}
                        onChange={(event) =>
                          updateStatusField(status.id, "name", event.target.value)
                        }
                        size="small"
                        fullWidth
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 160 }}>
                      <TextField
                        select
                        value={status.color}
                        onChange={(event) =>
                          updateStatusField(status.id, "color", event.target.value)
                        }
                        size="small"
                        fullWidth
                      >
                        {STATUS_COLOR_OPTIONS.map((colorOption) => (
                          <MenuItem key={colorOption.value} value={colorOption.value}>
                            {colorOption.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={status.active}
                        onChange={(event) =>
                          updateStatusField(status.id, "active", event.target.checked)
                        }
                        sx={{ ...SWITCH_SX, "--switch-color": theme.accent }}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        <IconButton
                          size="small"
                          onClick={() => openStatusEditor(status)}
                          sx={{ color: theme.accent }}
                        >
                          <MdEdit size={18} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteStatus(status)}
                          color="error"
                        >
                          <MdDeleteOutline size={18} />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Stack sx={GRID_2_SX}>
            <FormControlLabel
              control={
                <Switch
                  checked={ts.allowTicketReopen}
                  onChange={(event) =>
                    updateSettings("ticketStatus", (section) => ({
                      ...section,
                      allowTicketReopen: event.target.checked,
                    }))
                  }
                  sx={{ ...SWITCH_SX, "--switch-color": theme.accent }}
                />
              }
              label="Allow Ticket Reopen"
            />
            <TextField
              type="number"
              label="Auto Close Ticket After (days)"
              value={ts.autoCloseTicketAfterDays}
              onChange={(event) =>
                updateSettings("ticketStatus", (section) => ({
                  ...section,
                  autoCloseTicketAfterDays: Number(event.target.value) || 0,
                }))
              }
              inputProps={{ min: 0 }}
              fullWidth
            />
          </Stack>

          <SectionFooter
            theme={theme}
            onSave={() => saveSettings(settings, "Ticket status settings saved.")}
            helperText="Statuses drive the CRM workflow and remain editable without rebuilding the UI."
          />
        </Stack>
      </SettingsPanel>

      <CrudDialog
        open={statusDialog.open}
        title={statusDialog.mode === "edit" ? "Edit Status" : "Add Status"}
        onClose={closeStatusDialog}
        onSave={commitStatus}
        theme={theme}
      >
        <Stack spacing={2}>
          <TextField
            label="Status Name"
            value={statusDraft.name}
            onChange={(event) =>
              setStatusDraft((prev) => ({ ...prev, name: event.target.value }))
            }
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Color Badge</InputLabel>
            <Select
              label="Color Badge"
              value={statusDraft.color}
              onChange={(event) =>
                setStatusDraft((prev) => ({ ...prev, color: event.target.value }))
              }
            >
              {STATUS_COLOR_OPTIONS.map((colorOption) => (
                <MenuItem key={colorOption.value} value={colorOption.value}>
                  {colorOption.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Switch
                checked={statusDraft.active}
                onChange={(event) =>
                  setStatusDraft((prev) => ({ ...prev, active: event.target.checked }))
                }
                sx={{ ...SWITCH_SX, "--switch-color": theme.accent }}
              />
            }
            label="Active"
          />
        </Stack>
      </CrudDialog>

      <ConfirmDialog
        open={deleteDialog.open}
        title={deleteDialog.title}
        description={deleteDialog.description}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onClose={closeDeleteDialog}
        onConfirm={() => deleteDialog.onConfirm?.()}
        theme={theme}
      />
    </Stack>
  );
}

export default function TicketStatusPage() {
  return (
    <GeneralSetupSectionPage
      title="Ticket Status"
      subtitle="Customize workflow statuses, colors, reopening behavior, and auto close timing."
      ContentComponent={TicketStatusContent}
    />
  );
}
