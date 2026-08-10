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
import { useTranslation } from "react-i18next";
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

const GROUP_KEYS = ["ticket", "ai", "administration", "reports"];

function RoleManagementContent({ settings, updateSettings, theme, showToast }) {
  const { t } = useTranslation();
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
      showToast(t("pages.gsetup.roleManagement.toastNameRequired"), "error");
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
        showToast(t("pages.gsetup.roleManagement.toastUpdated"));
      } else {
        const created = await createRoleApi(roleDraft);
        updateSettings("roleManagement", (section) => ({
          ...section,
          roles: [...section.roles, created],
        }));
        showToast(t("pages.gsetup.roleManagement.toastCreated"));
      }
      closeRoleDialog();
    } catch {
      showToast(t("pages.gsetup.roleManagement.toastSaveFailed"), "error");
    } finally {
      setSaving(false);
    }
  }, [roleDraft, roleDialog, updateSettings, showToast, closeRoleDialog, t]);

  const handleDeleteRole = useCallback(
    (role) => {
      if (role.isSystem) return;

      setDeleteDialog({
        open: true,
        title: t("pages.gsetup.roleManagement.deleteTitle"),
        description: t("pages.gsetup.roleManagement.deleteDesc", { name: role.roleName }),
        onConfirm: async () => {
          try {
            await deleteRoleApi(role.id);
            updateSettings("roleManagement", (section) => ({
              ...section,
              roles: section.roles.filter((item) => item.id !== role.id),
            }));
            showToast(t("pages.gsetup.roleManagement.toastDeleted"));
          } catch {
            showToast(t("pages.gsetup.roleManagement.toastDeleteFailed"), "error");
          }
          setDeleteDialog({ open: false, title: "", description: "", onConfirm: null });
        },
      });
    },
    [updateSettings, showToast, t],
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
        showToast(t("pages.gsetup.roleManagement.toastRefreshed"));
      }
    } catch {
      showToast(t("pages.gsetup.roleManagement.toastRefreshFailed"), "error");
    } finally {
      setSaving(false);
    }
  }, [updateSettings, showToast, t]);

  const roles = settings.roleManagement?.roles ?? [];

  return (
    <Stack spacing={2.5}>
      <SettingsPanel
        icon={MdGroup}
        title={t("pages.gsetup.roleManagement.title")}
        subtitle={t("pages.gsetup.roleManagement.subtitle")}
        theme={theme}
        actions={
          <Button
            onClick={() => handleOpenRoleEditor(null)}
            variant="contained"
            startIcon={<MdAdd size={18} />}
            sx={ACCENT_BUTTON_SX(theme)}
          >
            {t("pages.gsetup.roleManagement.createRole")}
          </Button>
        }
      >
        <Stack spacing={2.5}>
          <TableContainer sx={TABLE_CONTAINER_SX(theme)}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {[
                    t("pages.gsetup.roleManagement.colRoleName"),
                    t("pages.gsetup.roleManagement.colUserCount"),
                    t("pages.gsetup.roleManagement.colPermissions"),
                    t("pages.gsetup.roleManagement.colActions"),
                  ].map((header) => (
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
                            label={t("pages.gsetup.roleManagement.system")}
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
                        {t("pages.gsetup.roleManagement.permissionsEnabled", {
                          count: buildPermissionSummary(role.permissions),
                        })}
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
                      {t("pages.gsetup.roleManagement.empty")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <SectionFooter
            theme={theme}
            onSave={handleRefresh}
            saveLabel={t("pages.gsetup.roleManagement.refreshFromServer")}
            helperText={t("pages.gsetup.roleManagement.helper")}
            loading={saving}
          />
        </Stack>
      </SettingsPanel>

      <CrudDialog
        open={roleDialog.open}
        title={
          roleDialog.mode === "edit"
            ? t("pages.gsetup.roleManagement.editRole")
            : t("pages.gsetup.roleManagement.createRole")
        }
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
              label={t("pages.gsetup.roleManagement.colRoleName")}
              value={roleDraft.roleName}
              onChange={(event) =>
                setRoleDraft((prev) => ({ ...prev, roleName: event.target.value }))
              }
              fullWidth
              disabled={roleDraft.isSystem}
              helperText={roleDraft.isSystem ? t("pages.gsetup.roleManagement.roleNameLocked") : ""}
            />
            <TextField
              type="number"
              label={t("pages.gsetup.roleManagement.colUserCount")}
              value={roleDraft.userCount}
              disabled
              inputProps={{ min: 0 }}
              fullWidth
              helperText={t("pages.gsetup.roleManagement.userCountAuto")}
            />
          </Box>

          <Divider />

          {PERMISSION_GROUPS.map((group, index) => (
            <Box key={group.title}>
              <Typography
                sx={{ fontSize: 13, fontWeight: 800, color: theme.text, mb: 1.25 }}
              >
                {t(`pages.gsetup.roleManagement.permissions.groups.${GROUP_KEYS[index]}`)}
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
                    label={t(`pages.gsetup.roleManagement.permissions.items.${permission.key}`)}
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
        confirmLabel={t("pages.gsetup.common.delete")}
        cancelLabel={t("pages.gsetup.common.cancel")}
        onClose={closeDeleteDialog}
        onConfirm={() => deleteDialog.onConfirm?.()}
        theme={theme}
      />
    </Stack>
  );
}

export default function RoleManagementPage() {
  const { t } = useTranslation();

  return (
    <GeneralSetupSectionPage
      title={t("pages.gsetup.roleManagement.title")}
      ContentComponent={RoleManagementContent}
    />
  );
}
