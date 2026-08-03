import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box, Button, Chip, IconButton, Stack, TextField, Typography,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from "@mui/material";
import { MdLayers, MdAdd, MdEdit, MdDelete, MdKeyboardArrowUp, MdKeyboardArrowDown } from "react-icons/md";
import { useTranslation } from "react-i18next";
import GeneralSetupSectionPage, { SettingsPanel } from "../GeneralSetupSectionPage";
import { fetchCompanyTiers, createTierApi, updateTierApi, deleteTierApi, updateTierLevelApi } from "../gsetup.service";

function LevelCell({ tier, maxLevel, disabled, onChangeLevel }) {
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(tier.level);

  const startEdit = () => {
    setValue(tier.level);
    setEditing(true);
  };

  const commit = () => {
    setEditing(false);
    const parsed = parseInt(value, 10);
    if (!Number.isNaN(parsed) && parsed !== tier.level) {
      onChangeLevel(tier, parsed);
    }
  };

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{ display: "flex", alignItems: "center", gap: 0.5, minHeight: 32 }}
    >
      {editing ? (
        <TextField
          autoFocus
          size="small"
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") setEditing(false);
          }}
          inputProps={{ min: 1, max: maxLevel }}
          sx={{ width: 68 }}
        />
      ) : (
        <Typography
          onClick={disabled ? undefined : startEdit}
          sx={{ fontWeight: 700, cursor: disabled ? "default" : "text", width: 24, textAlign: "center" }}
        >
          {tier.level}
        </Typography>
      )}

      {hovered && !editing && (
        <Stack sx={{ lineHeight: 0 }}>
          <IconButton
            size="small"
            sx={{ p: 0 }}
            disabled={disabled || tier.level >= maxLevel}
            onClick={() => onChangeLevel(tier, tier.level + 1)}
          >
            <MdKeyboardArrowUp size={16} />
          </IconButton>
          <IconButton
            size="small"
            sx={{ p: 0 }}
            disabled={disabled || tier.level <= 1}
            onClick={() => onChangeLevel(tier, tier.level - 1)}
          >
            <MdKeyboardArrowDown size={16} />
          </IconButton>
        </Stack>
      )}
    </Box>
  );
}

function TierSettingsContent({ theme, showToast }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTier, setEditingTier] = useState(null);
  const [tierName, setTierName] = useState("");
  const [tierColor, setTierColor] = useState("#6b7280");
  const [tierLevel, setTierLevel] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const PRESET_COLORS = [
    "#b45309", "#6b7280", "#ca8a04", "#7c3aed",
    "#0891b2", "#dc2626", "#16a34a", "#2563eb",
  ];

  const { data: tiers = [], isLoading } = useQuery({
    queryKey: ["company-tiers"],
    queryFn: fetchCompanyTiers,
  });

  // urut descending: level tertinggi di atas, level 1 paling bawah
  const sortedTiers = [...tiers].sort((a, b) => b.level - a.level);
  const maxLevel = tiers.length;

  const openCreateDialog = () => {
    setEditingTier(null);
    setTierName("");
    setTierColor("#6b7280");
    setTierLevel(maxLevel + 1); // default: posisi paling atas
    setDialogOpen(true);
  };

  const openEditDialog = (tier) => {
    setEditingTier(tier);
    setTierName(tier.tierName);
    setTierColor(tier.color || "#6b7280");
    setTierLevel(tier.level);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingTier(null);
    setTierName("");
  };

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["company-tiers"] });
    queryClient.invalidateQueries({ queryKey: ["tiers"] });
  };

  // mutation "polos", tanpa toast/close sendiri — dikontrol terpusat di handleSubmit
  const createMutation = useMutation({
    mutationFn: ({ name, color }) => createTierApi(name, color),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, name, color }) => updateTierApi(id, name, color),
  });
  const levelMutation = useMutation({
    mutationFn: ({ id, newLevel }) => updateTierLevelApi(id, newLevel),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteTierApi(id),
    onSuccess: () => { invalidate(); showToast(t("pages.gsetup.tierSettings.toastDeleted")); },
    onError: (err) => showToast(err?.response?.data?.message ?? t("pages.gsetup.tierSettings.toastDeleteFailed"), "error"),
  });

  const handleDelete = (tier) => {
    if (window.confirm(t("pages.gsetup.tierSettings.deleteConfirm", { name: tier.tierName }))) {
      deleteMutation.mutate(tier.id);
    }
  };

  // arrow di tabel: tetap langsung reorder tanpa lewat popup
  const handleChangeLevel = (tier, newLevel) => {
    levelMutation.mutate(
      { id: tier.id, newLevel },
      { onSuccess: invalidate, onError: (err) => showToast(err?.response?.data?.message ?? t("pages.gsetup.tierSettings.toastLevelFailed"), "error") },
    );
  };

  const handleSubmit = async () => {
    const name = tierName.trim();
    if (!name) return;
    const parsedLevel = parseInt(tierLevel, 10);

    setSubmitting(true);
    try {
      if (editingTier) {
        await updateMutation.mutateAsync({ id: editingTier.id, name, color: tierColor });
        if (!Number.isNaN(parsedLevel) && parsedLevel !== editingTier.level) {
          await levelMutation.mutateAsync({ id: editingTier.id, newLevel: parsedLevel });
        }
        invalidate();
        showToast(t("pages.gsetup.tierSettings.toastUpdated"));
      } else {
        const created = await createMutation.mutateAsync({ name, color: tierColor });
        const defaultLevel = maxLevel + 1;
        if (!Number.isNaN(parsedLevel) && parsedLevel !== defaultLevel && created?.id) {
          await levelMutation.mutateAsync({ id: created.id, newLevel: parsedLevel });
        }
        invalidate();
        showToast(t("pages.gsetup.tierSettings.toastAdded"));
      }
      closeDialog();
    } catch (err) {
      showToast(err?.response?.data?.message ?? t("pages.gsetup.tierSettings.toastSaveFailed"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  // saat create, tier baru sendiri nambah slot → max level ikut naik 1
  const levelInputMax = editingTier ? maxLevel : maxLevel + 1;

  return (
    <SettingsPanel
      icon={MdLayers}
      title={t("pages.gsetup.tierSettings.title")}
      subtitle={t("pages.gsetup.tierSettings.subtitle")}
      theme={theme}
      actions={
        <Button
          variant="contained"
          startIcon={<MdAdd size={18} />}
          onClick={openCreateDialog}
          sx={{ borderRadius: "12px", fontWeight: 800, background: theme.accent }}
        >
          {t("pages.gsetup.tierSettings.addTier")}
        </Button>
      }
    >
      <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.border}` }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: theme.accent, width: 100 }}>{t("pages.gsetup.tierSettings.level")}</TableCell>
              <TableCell sx={{ fontWeight: 700, color: theme.accent }}>{t("pages.gsetup.tierSettings.tierName")}</TableCell>
              <TableCell sx={{ fontWeight: 700, color: theme.accent, width: 120 }} align="right">{t("pages.gsetup.tierSettings.action")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && (
              <TableRow><TableCell colSpan={3} sx={{ textAlign: "center", py: 4, color: theme.subtext }}>{t("pages.gsetup.tierSettings.loading")}</TableCell></TableRow>
            )}
            {!isLoading && sortedTiers.length === 0 && (
              <TableRow><TableCell colSpan={3} sx={{ textAlign: "center", py: 4, color: theme.subtext }}>{t("pages.gsetup.tierSettings.empty")}</TableCell></TableRow>
            )}
            {sortedTiers.map((tier) => (
              <TableRow key={tier.id} hover>
                <TableCell>
                  <LevelCell
                    tier={tier}
                    maxLevel={maxLevel}
                    disabled={levelMutation.isPending}
                    onChangeLevel={handleChangeLevel}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={tier.tierName}
                    sx={{
                      fontWeight: 700,
                      background: `${tier.color}20`,
                      color: tier.color,
                      border: `1.5px solid ${tier.color}`,
                    }}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => openEditDialog(tier)}>
                    <MdEdit size={18} color={theme.accent} />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(tier)}>
                    <MdDelete size={18} color="#ef4444" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography sx={{ mt: 2, fontSize: 13, color: theme.subtext }}>
        {t("pages.gsetup.tierSettings.footerNote")}
      </Typography>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingTier ? t("pages.gsetup.tierSettings.editTier") : t("pages.gsetup.tierSettings.addNewTier")}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label={t("pages.gsetup.tierSettings.tierName")}
            value={tierName}
            onChange={(e) => setTierName(e.target.value)}
            sx={{ mt: 1, mb: 2.5 }}
            placeholder={t("pages.gsetup.tierSettings.tierNamePlaceholder")}
          />

          <TextField
            fullWidth
            type="number"
            label={t("pages.gsetup.tierSettings.level")}
            value={tierLevel}
            onChange={(e) => setTierLevel(e.target.value)}
            inputProps={{ min: 1, max: levelInputMax }}
            helperText={t("pages.gsetup.tierSettings.levelHelper", { max: levelInputMax })}
            sx={{ mb: 2.5 }}
          />

          <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#374151", mb: 1 }}>
            {t("pages.gsetup.tierSettings.tierColor")}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: "wrap", gap: 1 }}>
            {PRESET_COLORS.map((c) => (
              <Box
                key={c}
                onClick={() => setTierColor(c)}
                sx={{
                  width: 32, height: 32, borderRadius: "50%", background: c, cursor: "pointer",
                  border: tierColor === c ? "3px solid #111827" : "3px solid transparent",
                  boxShadow: "0 0 0 1px #e5e7eb",
                }}
              />
            ))}
          </Stack>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <input
              type="color"
              value={tierColor}
              onChange={(e) => setTierColor(e.target.value)}
              style={{ width: 44, height: 36, border: "1px solid #e5e7eb", borderRadius: 8, cursor: "pointer" }}
            />
            <TextField size="small" value={tierColor} onChange={(e) => setTierColor(e.target.value)} sx={{ flex: 1 }} />
            <Chip
              label={t("pages.gsetup.tierSettings.preview")}
              sx={{ background: `${tierColor}20`, color: tierColor, border: `1.5px solid ${tierColor}`, fontWeight: 700 }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDialog}>{t("pages.gsetup.common.cancel")}</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!tierName.trim() || submitting}
            sx={{ background: theme.accent, fontWeight: 800 }}
          >
            {t("pages.gsetup.common.save")}
          </Button>
        </DialogActions>
      </Dialog>
    </SettingsPanel>
  );
}

export default function TierSettingsPage() {
  const { t } = useTranslation();

  return (
    <GeneralSetupSectionPage
      title={t("pages.gsetup.tierSettings.title")}
      subtitle={t("pages.gsetup.tierSettings.subtitle")}
      ContentComponent={TierSettingsContent}
    />
  );
}