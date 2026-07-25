import { useCallback, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { MdAdd, MdDeleteOutline, MdEdit, MdGroup } from "react-icons/md";
import GeneralSetupSectionPage, {
  ConfirmDialog,
  SectionFooter,
  SettingsPanel,
} from "../GeneralSetupSectionPage";
import {
  PERMISSION_GROUPS,
  createRoleDraft,
  fetchRolesFromApi,
  createRoleApi,
  updateRoleApi,
  deleteRoleApi,
} from "../gsetup.service";
import {
  ACCENT_BUTTON_SX,
  TABLE_HEADER_CELL_SX,
  TABLE_CONTAINER_SX,
} from "../components/gsetup.styles";
import CrudDialog from "../components/CrudDialog";

function buildPermissionSummary(permissions) {
  return Object.values(permissions || {}).filter(Boolean).length;
}

function RoleManagementContent({ settings, updateSettings, theme, showToast }) {
  const [roleDialog, setRoleDialog] = useState({ open: false, mode: "create", roleId: "" });
  const [roleDraft, setRoleDraft] = useState(createRoleDraft());
  const [saving, setSaving] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, title: "", description: "", onConfirm: null });

  const closeRoleDialog = useCallback(() => {
    setRoleDialog({ open: false, mode: "create", roleId: "" });
    setRoleDraft(createRoleDraft());
  }, []);

  const handleOpenRoleEditor = useCallback((role) => {
    setRoleDraft(role ?? createRoleDraft());
    setRoleDialog({ open: true, mode: role ? "edit" : "create", roleId: role?.id ?? "" });
  }, []);

  const commitRole = useCallback(async () => {
    if (!roleDraft.roleName.trim()) {
      showToast("Role name is required.", "error");
      return;
    }

    setSaving(true);
    try {
      if (roleDialog.mode === "edit") {
        const updated = await updateRoleApi(roleDraft);
        updateSettings("roleManagement", (section) => ({
          ...section,
          roles: section.roles.map((r) => (r.id === roleDialog.roleId ? updated : r)),
        }));
        showToast("Role updated.");
      } else {
        const created = await createRoleApi(roleDraft);
        updateSettings("roleManagement", (section) => ({
          ...section,
          roles: [...section.roles, created],
        }));
        showToast("Role created.");
      }
      closeRoleDialog();
    } catch {
      showToast("Failed to save role. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  }, [roleDraft, roleDialog, updateSettings, showToast, closeRoleDialog]);

  const handleDeleteRole = useCallback(
    (role) => {
      if (role.isSystem) return;

      setDeleteDialog({
        open: true,
        title: "Delete role?",
        description: `This will remove "${role.roleName}" permanently. Users assigned to it should be reassigned first.`,
        onConfirm: async () => {
          try {
            await deleteRoleApi(role.id);
            updateSettings("roleManagement", (section) => ({
              ...section,
              roles: section.roles.filter((item) => item.id !== role.id),
            }));
            showToast("Role deleted.");
          } catch {
            showToast("Failed to delete role.", "error");
          }
          setDeleteDialog({ open: false, title: "", description: "", onConfirm: null });
        },
      });
    },
    [updateSettings, showToast],
  );

  const closeDeleteDialog = useCallback(() => {
    setDeleteDialog({ open: false, title: "", description: "", onConfirm: null });
  }, []);

  const handlePermissionToggle = useCallback((key) => (event) => {
    setRoleDraft((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: event.target.checked,
      },
    }));
  }, []);

  const handleRefresh = useCallback(async () => {
    setSaving(true);
    try {
      const apiRoles = await fetchRolesFromApi();
      if (apiRoles !== null) {
        updateSettings("roleManagement", { roles: apiRoles });
        showToast("Role list refreshed from server.");
      }
    } catch {
      showToast("Failed to refresh roles.", "error");
    } finally {
      setSaving(false);
    }
  }, [updateSettings, showToast]);

  const roles = settings.roleManagement?.roles ?? [];

  return (
    <Stack spacing={2.5}>
      <SettingsPanel
        icon={MdGroup}
        title="Role Management"
        subtitle="Create roles, assign permissions, and manage access without leaving the admin console."
        theme={theme}
        actions={
          <Button
            onClick={() => handleOpenRoleEditor(null)}
            variant="contained"
            startIcon={<MdAdd size={18} />}
            sx={ACCENT_BUTTON_SX(theme)}
          >
            Create Role
          </Button>
        }
      >
        <Stack spacing={2.5}>
          <TableContainer sx={TABLE_CONTAINER_SX(theme)}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {["Role Name", "Number of Users", "Permissions", "Actions"].map((header) => (
                    <TableCell key={header} sx={TABLE_HEADER_CELL_SX(theme)}>
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id} hover>
                    <TableCell sx={{ fontWeight: 700 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {role.roleName}
                        {role.isSystem && (
                          <Chip
                            label="System"
                            size="small"
                            sx={{
                              fontSize: 10,
                              height: 20,
                              fontWeight: 700,
                              bgcolor: theme.iconBg,
                              color: theme.accent,
                            }}
                          />
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>{role.userCount}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ borderRadius: "999px", fontWeight: 700, textTransform: "none" }}
                      >
                        {buildPermissionSummary(role.permissions)} permissions enabled
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenRoleEditor(role)}
                          sx={{ color: theme.accent }}
                        >
                          <MdEdit size={18} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteRole(role)}
                          color="error"
                          disabled={role.isSystem}
                          sx={role.isSystem ? { opacity: 0.3 } : undefined}
                        >
                          <MdDeleteOutline size={18} />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {roles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 6, color: theme.subtext }}>
                      No roles defined yet. Click "Create Role" to add one.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <SectionFooter
            theme={theme}
            onSave={handleRefresh}
            saveLabel="Refresh from Server"
            helperText="Changes are saved immediately. Click refresh to reload the latest data."
            loading={saving}
          />
        </Stack>
      </SettingsPanel>

      <CrudDialog
        open={roleDialog.open}
        title={roleDialog.mode === "edit" ? "Edit Role" : "Create Role"}
        onClose={closeRoleDialog}
        onSave={commitRole}
        theme={theme}
      >
        <Stack spacing={2.5}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 220px" },
              gap: 2,
            }}
          >
            <TextField
              label="Role Name"
              value={roleDraft.roleName}
              onChange={(event) =>
                setRoleDraft((prev) => ({ ...prev, roleName: event.target.value }))
              }
              fullWidth
              disabled={roleDraft.isSystem}
              helperText={roleDraft.isSystem ? "System role names cannot be changed." : ""}
            />
            <TextField
              type="number"
              label="Number of Users"
              value={roleDraft.userCount}
              disabled
              inputProps={{ min: 0 }}
              fullWidth
              helperText="Auto-computed from server"
            />
          </Box>

          <Divider />

          {PERMISSION_GROUPS.map((group) => (
            <Box key={group.title}>
              <Typography
                sx={{ fontSize: 13, fontWeight: 800, color: theme.text, mb: 1.25 }}
              >
                {group.title}
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
                  gap: 0.5,
                  pl: 0.5,
                }}
              >
                {group.items.map((permission) => (
                  <FormControlLabel
                    key={permission.key}
                    control={
                      <Checkbox
                        checked={Boolean(roleDraft.permissions?.[permission.key])}
                        onChange={handlePermissionToggle(permission.key)}
                        sx={{
                          color: theme.accent,
                          "&.Mui-checked": { color: theme.accent },
                        }}
                      />
                    }
                    label={permission.label}
                  />
                ))}
              </Box>
            </Box>
          ))}
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

export default function RoleManagementPage() {
  return (
    <GeneralSetupSectionPage
      title="Role Management"
      subtitle="Create roles, assign permissions, and manage access without leaving the admin console."
      ContentComponent={RoleManagementContent}
    />
  );
}
