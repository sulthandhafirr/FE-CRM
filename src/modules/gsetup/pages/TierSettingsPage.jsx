import { useCallback, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box, Button, Chip, IconButton, Stack, TextField, Typography,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from "@mui/material";
import { MdLayers, MdAdd, MdEdit, MdDelete } from "react-icons/md";
import GeneralSetupSectionPage, { SettingsPanel } from "../GeneralSetupSectionPage";
import { fetchCompanyTiers, createTierApi, updateTierApi, deleteTierApi } from "../gsetup.service";

function TierSettingsContent({ theme, showToast }) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTier, setEditingTier] = useState(null);
  const [tierName, setTierName] = useState("");
  const [tierColor, setTierColor] = useState("#6b7280");

  const PRESET_COLORS = [
    "#b45309", // bronze
    "#6b7280", // silver
    "#ca8a04", // gold
    "#7c3aed", // purple/platinum
    "#0891b2", // teal
    "#dc2626", // red
    "#16a34a", // green
    "#2563eb", // blue
  ];

  const openCreateDialog = () => {
    setEditingTier(null);
    setTierName("");
    setTierColor("#6b7280");
    setDialogOpen(true);
  };

  const openEditDialog = (tier) => {
    setEditingTier(tier);
    setTierName(tier.tierName);
    setTierColor(tier.color || "#6b7280");
    setDialogOpen(true);
  };

  const { data: tiers = [], isLoading } = useQuery({
    queryKey: ["company-tiers"],
    queryFn: fetchCompanyTiers,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["company-tiers"] });

  const createMutation = useMutation({
    mutationFn: ({ name, color }) => createTierApi(name, color),
    onSuccess: () => { invalidate(); showToast("Successfully added tier."); closeDialog(); },
    onError: (err) => showToast(err?.response?.data?.message ?? "Failed to add tier.", "error"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name, color }) => updateTierApi(id, name, color),
    onSuccess: () => { invalidate(); showToast("Successfully updated tier."); closeDialog(); },
    onError: (err) => showToast(err?.response?.data?.message ?? "Failed to update tier.", "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteTierApi(id),
    onSuccess: () => { invalidate(); showToast("Successfully deleted tier."); },
    onError: (err) => showToast(err?.response?.data?.message ?? "Failed to delete tier.", "error"),
  });

  const closeDialog = () => { setDialogOpen(false); setEditingTier(null); setTierName(""); };

  const handleSubmit = useCallback(() => {
    const name = tierName.trim();
    if (!name) return;
    if (editingTier) updateMutation.mutate({ id: editingTier.id, name, color: tierColor });
    else createMutation.mutate({ name, color: tierColor });
  }, [tierName, tierColor, editingTier, createMutation, updateMutation]);

  const handleDelete = (tier) => {
    if (window.confirm(`Delete tier "${tier.tierName}"? Users still using this tier must be unassigned first.`)) {
      deleteMutation.mutate(tier.id);
    }
  };

  return (
    <SettingsPanel
      icon={MdLayers}
      title="Tier Settings"
      subtitle="Manage custom customer tier lists for your company."
      theme={theme}
      actions={
        <Button
          variant="contained"
          startIcon={<MdAdd size={18} />}
          onClick={openCreateDialog}
          sx={{ borderRadius: "12px", fontWeight: 800, background: theme.accent }}
        >
          Add Tier
        </Button>
      }
    >
      <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.border}` }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: theme.accent }}>Tier Name</TableCell>
              <TableCell sx={{ fontWeight: 700, color: theme.accent, width: 120 }} align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && (
              <TableRow><TableCell colSpan={2} sx={{ textAlign: "center", py: 4, color: theme.subtext }}>Loading...</TableCell></TableRow>
            )}
            {!isLoading && tiers.length === 0 && (
              <TableRow><TableCell colSpan={2} sx={{ textAlign: "center", py: 4, color: theme.subtext }}>No tiers available.</TableCell></TableRow>
            )}
            {tiers.map((tier) => (
                <TableRow key={tier.id} hover>
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
        Tiers currently in use by users cannot be deleted, remove the assignment first on the Performance &gt; Customer page.
      </Typography>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800 }}>
            {editingTier ? "Edit Tier" : "Add New Tier"}
        </DialogTitle>
        <DialogContent>
            <TextField
            autoFocus
            fullWidth
            label="Tier Name"
            value={tierName}
            onChange={(e) => setTierName(e.target.value)}
            sx={{ mt: 1, mb: 2.5 }}
            placeholder="e.g., Platinum"
            />

            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#374151", mb: 1 }}>
            Warna Tier
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: "wrap", gap: 1 }}>
            {PRESET_COLORS.map((c) => (
                <Box
                key={c}
                onClick={() => setTierColor(c)}
                sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: c,
                    cursor: "pointer",
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
            <TextField
                size="small"
                value={tierColor}
                onChange={(e) => setTierColor(e.target.value)}
                sx={{ flex: 1 }}
            />
            <Chip
                label="Preview"
                sx={{
                background: `${tierColor}20`,
                color: tierColor,
                border: `1.5px solid ${tierColor}`,
                fontWeight: 700,
                }}
            />
            </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={closeDialog}>Batal</Button>
            <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!tierName.trim() || createMutation.isPending || updateMutation.isPending}
            sx={{ background: theme.accent, fontWeight: 800 }}
            >
            Simpan
            </Button>
        </DialogActions>
      </Dialog>
    </SettingsPanel>
  );
}

export default function TierSettingsPage() {
  return (
    <GeneralSetupSectionPage
      title="Tier Settings"
      subtitle="Manage custom customer tier lists for your company."
      ContentComponent={TierSettingsContent}
    />
  );
}