import { useCallback, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
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
import { PERMISSION_GROUPS, createRoleDraft } from "../gsetup.service";
import {
  ACCENT_BUTTON_SX,
  TABLE_HEADER_CELL_SX,
  TABLE_CONTAINER_SX,
} from "../components/gsetup.styles";
import CrudDialog from "../components/CrudDialog";

function buildPermissionSummary(permissions) {
  return Object.values(permissions || {}).filter(Boolean).length;
}

function buildNewRoleId(roleName) {
  return `${roleName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
}

function RoleManagementContent({ settings, updateSettings, saveSettings, theme, showToast }) {
  const [roleDialog, setRoleDialog] = useState({ open: false, mode: "create", roleId: "" });
  const [roleDraft, setRoleDraft] = useState(createRoleDraft());
  const [deleteDialog, setDeleteDialog] = useState({ open: false, title: "", description: "", onConfirm: null });

  const closeRoleDialog = useCallback(() => {
    setRoleDialog({ open: false, mode: "create", roleId: "" });
    setRoleDraft(createRoleDraft());
  }, []);

  const handleOpenRoleEditor = useCallback((role) => {
    setRoleDraft(role ?? createRoleDraft());
    setRoleDialog({ open: true, mode: role ? "edit" : "create", roleId: role?.id ?? "" });
  }, []);

  const commitRole = useCallback(() => {
    if (!roleDraft.roleName.trim()) {
      showToast("Role name is required.", "error");
      return;
    }

    updateSettings("roleManagement", (section) => {
      const nextRoles =
        roleDialog.mode === "edit"
          ? section.roles.map((role) =>
              role.id === roleDialog.roleId ? { ...roleDraft, id: role.id } : role,
            )
          : [
              ...section.roles,
              {
                ...roleDraft,
                id: buildNewRoleId(roleDraft.roleName),
                userCount: Number(roleDraft.userCount) || 0,
              },
            ];

      return { ...section, roles: nextRoles };
    });

    closeRoleDialog();
  }, [roleDraft, roleDialog, updateSettings, showToast, closeRoleDialog]);

  const handleDeleteRole = useCallback(
    (role) => {
      setDeleteDialog({
        open: true,
        title: "Delete role?",
        description: `This will remove ${role.roleName} from the role list. Users assigned to it should be reassigned first.`,
        onConfirm: () => {
          updateSettings("roleManagement", (section) => ({
            ...section,
            roles: section.roles.filter((item) => item.id !== role.id),
          }));
          setDeleteDialog({ open: false, title: "", description: "", onConfirm: null });
          showToast("Role deleted.");
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
                {settings.roleManagement.roles.map((role) => (
                  <TableRow key={role.id} hover>
                    <TableCell sx={{ fontWeight: 700 }}>{role.roleName}</TableCell>
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

          <SectionFooter
            theme={theme}
            onSave={() => saveSettings(settings, "Role settings saved.")}
            helperText="Role permissions can be edited without changing the authentication architecture."
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
            />
            <TextField
              type="number"
              label="Number of Users"
              value={roleDraft.userCount}
              onChange={(event) =>
                setRoleDraft((prev) => ({ ...prev, userCount: Number(event.target.value) || 0 }))
              }
              inputProps={{ min: 0 }}
              fullWidth
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
