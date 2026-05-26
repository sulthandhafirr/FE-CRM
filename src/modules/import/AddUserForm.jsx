import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { MdUploadFile, MdTableChart, MdDownload } from "react-icons/md";
import {
  Box, Button, Chip, Divider, FormControl, InputLabel, MenuItem,
  Modal, Paper, Select, Stack, Table, TableBody, TableCell,
  TableHead, TableRow, TextField, Typography,
} from "@mui/material";
import * as XLSX from "xlsx";
import { ROLES, downloadTemplate, createSingleUser, createBulkUser, normalizeRows, validateRow, getRoleId } from "./import.service";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const INIT_FORM = (roleId) => ({ name: "", email: "", password: "", roleId, position: "" });

export default function AddUserForm({ isOpen, onClose, defaultRoleId = 2 }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [mode, setMode]             = useState("single");
  const [formData, setFormData]     = useState(INIT_FORM(defaultRoleId));
  const [errors, setErrors]         = useState({});
  const [isSubmitting, setSubmitting] = useState(false);

  const [bulkRows, setBulkRows]         = useState([]);
  const [bulkErrors, setBulkErrors]     = useState([]);
  const [bulkApiError, setBulkApiError] = useState("");
  const [bulkSubmitting, setBulkSubmit] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ done: 0, total: 0 });
  const [dragOver, setDragOver]         = useState(false);
  const [fileName, setFileName]         = useState("");

  const resetSingle = () => { setFormData(INIT_FORM(defaultRoleId)); setErrors({}); };
  const resetBulk   = () => {
    setBulkRows([]); setBulkErrors([]); setBulkApiError("");
    setBulkProgress({ done: 0, total: 0 }); setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    if (isSubmitting || bulkSubmitting) return;
    resetSingle(); resetBulk(); setMode("single"); onClose();
  };

  const validate = () => {
    const e = {};
    if (!formData.name.trim())             e.name     = t("pages.addUserForm.errors.nameRequired");
    if (!formData.email.trim())            e.email    = t("pages.addUserForm.errors.emailRequired");
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = t("pages.addUserForm.errors.emailInvalid");
    if (!formData.password.trim())         e.password = t("pages.addUserForm.errors.passwordRequired");
    else if (formData.password.length < 6) e.password = t("pages.addUserForm.errors.passwordTooShort");
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({}); setSubmitting(true);
    try {
      await createSingleUser({
        name: formData.name.trim(), email: formData.email.trim(),
        password: formData.password, roleId: formData.roleId,
        position: formData.position.trim(),
      });
      await queryClient.invalidateQueries({ queryKey: ["users-by-role"] });
      resetSingle(); onClose();
    } catch (err) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Failed to add user";
      setErrors((p) => ({ ...p, api: msg }));
    } finally { setSubmitting(false); }
  };

  const parseExcel = (file) => {
    setFileName(file.name); resetBulk();
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const wb   = XLSX.read(ev.target.result, { type: "array" });
        const raw  = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });
        const rows = normalizeRows(raw);
        setBulkRows(rows); setBulkErrors(rows.map(validateRow));
      } catch { setBulkApiError(t("pages.addUserForm.bulk.readError")); }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileChange = (e) => { const f = e.target.files?.[0]; if (f) parseExcel(f); };
  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) parseExcel(f); };

  const handleBulkSubmit = async () => {
    if (!bulkRows.length) return;
    if (bulkErrors.some((e) => e.length > 0)) { setBulkApiError(t("pages.addUserForm.bulk.fixErrors")); return; }

    setBulkSubmit(true); setBulkApiError(""); setBulkProgress({ done: 0, total: bulkRows.length });
    const newErrors = [...bulkErrors];
    let ok = 0;

    for (let i = 0; i < bulkRows.length; i++) {
      try {
        await createBulkUser({ ...bulkRows[i], roleId: getRoleId(bulkRows[i].role) });
        newErrors[i] = []; ok++;
      } catch (err) {
        newErrors[i] = [err?.response?.data?.message ?? err?.message ?? "Failed"];
      }
      setBulkProgress({ done: i + 1, total: bulkRows.length });
      setBulkErrors([...newErrors]);
    }

    setBulkSubmit(false);
    await queryClient.invalidateQueries({ queryKey: ["users-by-role"] });

    if (ok === bulkRows.length) { resetBulk(); onClose(); return; }
    setBulkApiError(t("pages.addUserForm.bulk.partialSuccess", { success: ok, total: bulkRows.length }));
    setBulkRows(bulkRows.filter((_, i) => newErrors[i].length > 0));
    setBulkErrors(newErrors.filter((e) => e.length > 0));
  };

  const totalErrors   = bulkErrors.filter((e) => e.length > 0).length;
  const readyToSubmit = bulkRows.length > 0 && bulkErrors.every((e) => e.length === 0);

  return (
    <Modal
      open={isOpen}
      onClose={() => {}}
      slotProps={{ backdrop: { sx: { backgroundColor: "rgba(16,24,40,0.35)", backdropFilter: "blur(2px)" } } }}
    >
      <Box sx={{
        position: "absolute", top: { xs: 0, sm: "50%" }, left: "50%",
        transform: { xs: "translateX(-50%)", sm: "translate(-50%,-50%)" },
        width: { xs: "100vw", sm: "94%", md: mode === "bulk" ? 700 : 520 },
        height: { xs: "100vh", sm: "auto" },
        maxHeight: { xs: "100vh", sm: "calc(100vh - 48px)" },
        outline: "none", transition: "width 0.2s",
      }}>
        <Paper sx={{
          borderRadius: "16px", position: "relative", display: "flex", flexDirection: "column",
          maxHeight: "calc(100vh - 48px)", overflow: "hidden",
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}>

          {/* Header */}
          <Box sx={{ px: { xs: 2.5, sm: 3.5 }, py: 2, background: "linear-gradient(180deg,#FFF9F5 0%,#FFFFFF 100%)" }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography sx={{ fontSize: { xs: 22, sm: 26 }, fontWeight: 800 }}>
                  {t("pages.addUserForm.title")}
                </Typography>
                <Typography sx={{ fontSize: 13, color: "#667085", mt: 0.5 }}>
                  {t(mode === "single" ? "pages.addUserForm.subtitleSingle" : "pages.addUserForm.subtitleBulk")}
                </Typography>
              </Box>
              <Button
                onClick={handleClose}
                disabled={isSubmitting || bulkSubmitting}
                sx={{ minWidth: "auto", px: 1.5, color: "#667085", fontSize: 18 }}
              >
                ✕
              </Button>
            </Stack>

            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              {[
                { key: "single", label: t("pages.addUserForm.modeSingle") },
                { key: "bulk",   label: t("pages.addUserForm.modeBulk")   },
              ].map((m) => (
                <Button key={m.key} onClick={() => setMode(m.key)} size="small" sx={{
                  borderRadius: "8px", px: 2, py: 0.75, fontWeight: 700, fontSize: 13,
                  border: "2px solid #FF8040",
                  background: mode === m.key ? "#FF8040" : "transparent",
                  color: mode === m.key ? "#fff" : "#FF8040",
                  "&:hover": { background: mode === m.key ? "#e6723a" : "#FFF5EF" },
                }}>
                  {m.label}
                </Button>
              ))}
            </Stack>
          </Box>

          <Divider />

          <Box sx={{ px: { xs: 2, sm: 3.5 }, py: 3, overflowY: "auto", flex: 1 }}>

            {/* Single mode */}
            {mode === "single" && (
              <form onSubmit={handleSubmit}>
                <Stack spacing={2.5}>
                  <FormControl fullWidth>
                    <InputLabel>{t("pages.addUserForm.fields.role")}</InputLabel>
                    <Select
                      value={formData.roleId}
                      label={t("pages.addUserForm.fields.role")}
                      onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                    >
                      {ROLES.map((r) => (
                        <MenuItem key={r.id} value={r.id}>{t(`roles.${r.key}`)}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {[
                    { field: "name",     type: "text",     labelKey: "fullName",    placeholderKey: "fullNamePlaceholder" },
                    { field: "email",    type: "email",    labelKey: "email",       placeholderKey: "emailPlaceholder"    },
                    { field: "password", type: "password", labelKey: "password",    placeholderKey: "passwordPlaceholder" },
                  ].map(({ field, type, labelKey, placeholderKey }) => (
                    <TextField
                      key={field}
                      required
                      type={type}
                      label={t(`pages.addUserForm.fields.${labelKey}`)}
                      placeholder={t(`pages.addUserForm.fields.${placeholderKey}`)}
                      value={formData[field]}
                      onChange={(e) => {
                        setFormData({ ...formData, [field]: e.target.value });
                        setErrors((p) => ({ ...p, [field]: undefined }));
                      }}
                      error={Boolean(errors[field])}
                      helperText={errors[field]}
                      fullWidth
                    />
                  ))}

                  {formData.roleId !== 1 && (
                    <TextField
                      label={t("pages.addUserForm.fields.position")}
                      placeholder={t("pages.addUserForm.fields.positionPlaceholder")}
                      helperText={t("pages.addUserForm.fields.positionHint")}
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      fullWidth
                    />
                  )}

                  {errors.api && (
                    <Box sx={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", px: 2, py: 1.5 }}>
                      <Typography sx={{ fontSize: 13, color: "#dc2626" }}>{errors.api}</Typography>
                    </Box>
                  )}
                </Stack>

                <Divider sx={{ my: 3 }} />

                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="flex-end" spacing={1.5}>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    variant="contained"
                    sx={{
                      borderRadius: "10px", background: "#FF8040", px: 3, py: 1.5,
                      fontWeight: 700, minHeight: "44px",
                      "&:hover": { background: "#e6723a" },
                      width: { xs: "100%", sm: "auto" }, order: { xs: -1, sm: 0 },
                    }}
                  >
                    {t(isSubmitting ? "pages.addUserForm.buttons.adding" : "pages.addUserForm.buttons.add")}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    variant="outlined"
                    sx={{
                      borderRadius: "10px", borderColor: "#D0D5DD", color: "#344054",
                      px: 3, py: 1.5, fontWeight: 700, minHeight: "44px",
                      width: { xs: "100%", sm: "auto" },
                    }}
                  >
                    {t("pages.addUserForm.buttons.cancel")}
                  </Button>
                </Stack>
              </form>
            )}

            {/* Bulk mode */}
            {mode === "bulk" && (
              <Stack spacing={3}>

                {/* Drop zone */}
                <Box
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    border: `2px dashed ${dragOver ? "#FF8040" : "#D0D5DD"}`,
                    borderRadius: "12px", background: dragOver ? "#FFF5EF" : "#FAFAFA",
                    p: 4, textAlign: "center", cursor: "pointer", transition: "all 0.2s",
                    "&:hover": { borderColor: "#FF8040", background: "#FFF5EF" },
                  }}
                >
                  <input ref={fileInputRef} type="file" accept=".xlsx,.xls" style={{ display: "none" }} onChange={handleFileChange} />
                  <MdUploadFile size={40} color="#FF8040" style={{ marginBottom: 8 }} />
                  <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#333", mb: 0.5 }}>
                    {fileName || t("pages.addUserForm.bulk.dropzone")}
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: "#667085" }}>{t("pages.addUserForm.bulk.dropzoneHint")}</Typography>
                  <Typography sx={{ fontSize: 12, color: "#999", mt: 0.5 }}>{t("pages.addUserForm.bulk.columnsHint")}</Typography>
                  <Divider sx={{ my: 2 }} />
                  <Button
                    onClick={(e) => { e.stopPropagation(); downloadTemplate(); }}
                    startIcon={<MdTableChart size={16} />}
                    endIcon={<MdDownload size={16} />}
                    size="small"
                    sx={{ borderRadius: "8px", border: "1.5px solid #FF8040", color: "#FF8040", fontWeight: 700, fontSize: 13, px: 2, "&:hover": { background: "#FFF5EF" } }}
                  >
                    {t("pages.addUserForm.buttons.downloadTemplate")}
                  </Button>
                </Box>

                {/* Preview table */}
                {bulkRows.length > 0 && (
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: 15 }}>{t("pages.addUserForm.bulk.preview")}</Typography>
                      <Chip
                        label={t("pages.addUserForm.bulk.rows", { count: bulkRows.length })}
                        size="small"
                        sx={{ background: "#FFF5EF", color: "#FF8040", fontWeight: 700, border: "1px solid #fde4d4" }}
                      />
                      {totalErrors > 0 && (
                        <Chip
                          label={t("pages.addUserForm.bulk.errors", { count: totalErrors })}
                          size="small"
                          sx={{ background: "#fef2f2", color: "#dc2626", fontWeight: 700, border: "1px solid #fecaca" }}
                        />
                      )}
                    </Stack>
                    <Box sx={{ borderRadius: "10px", overflow: "hidden", border: "1px solid #f0f0f0" }}>
                      <Box sx={{ overflowX: "auto", maxHeight: 320 }}>
                        <Table size="small" stickyHeader>
                          <TableHead>
                            <TableRow>
                              {["no", "name", "email", "role", "position", "status"].map((h) => (
                                <TableCell key={h} sx={{ background: "#FFF9F5", color: "#FF8040", fontWeight: 700, fontSize: 12, whiteSpace: "nowrap" }}>
                                  {t(`pages.addUserForm.bulk.tableHeaders.${h}`)}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {bulkRows.map((row, i) => {
                              const rowErrs = bulkErrors[i] ?? [];
                              const hasErr  = rowErrs.length > 0;
                              return (
                                <TableRow key={i} sx={{ background: hasErr ? "#fef2f2" : "transparent" }}>
                                  <TableCell sx={{ color: "#999", fontSize: 12 }}>{i + 1}</TableCell>
                                  <TableCell sx={{ fontSize: 13 }}>{row.name  || <span style={{ color: "#dc2626" }}>—</span>}</TableCell>
                                  <TableCell sx={{ fontSize: 13 }}>{row.email || <span style={{ color: "#dc2626" }}>—</span>}</TableCell>
                                  <TableCell sx={{ fontSize: 13 }}>{row.role  || <span style={{ color: "#dc2626" }}>—</span>}</TableCell>
                                  <TableCell sx={{ fontSize: 13, color: "#667085" }}>{row.position || "-"}</TableCell>
                                  <TableCell>
                                    {hasErr
                                      ? <Typography sx={{ fontSize: 11, color: "#dc2626" }}>{rowErrs.join("; ")}</Typography>
                                      : <Typography sx={{ fontSize: 11, color: "#16a34a", fontWeight: 600 }}>{t("pages.addUserForm.bulk.statusReady")}</Typography>
                                    }
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </Box>
                    </Box>
                  </Box>
                )}

                {/* Progress */}
                {bulkSubmitting && (
                  <Box>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <Typography sx={{ fontSize: 13, color: "#667085" }}>{t("pages.addUserForm.bulk.creating")}</Typography>
                      <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#FF8040" }}>{bulkProgress.done} / {bulkProgress.total}</Typography>
                    </Stack>
                    <Box sx={{ height: 6, borderRadius: 3, background: "#f0f0f0", overflow: "hidden" }}>
                      <Box sx={{
                        height: "100%", background: "#FF8040", borderRadius: 3, transition: "width 0.3s",
                        width: `${bulkProgress.total ? (bulkProgress.done / bulkProgress.total) * 100 : 0}%`,
                      }} />
                    </Box>
                  </Box>
                )}

                {bulkApiError && (
                  <Box sx={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", px: 2, py: 1.5 }}>
                    <Typography sx={{ fontSize: 13, color: "#dc2626" }}>{bulkApiError}</Typography>
                  </Box>
                )}

                <Divider />

                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="flex-end" spacing={1.5}>
                  <Button
                    onClick={handleBulkSubmit}
                    disabled={!readyToSubmit || bulkSubmitting}
                    variant="contained"
                    sx={{
                      borderRadius: "10px", background: "#FF8040", px: 3, py: 1.5,
                      fontWeight: 700, minHeight: "44px",
                      "&:hover": { background: "#e6723a" },
                      "&:disabled": { background: "#f0f0f0", color: "#bbb" },
                      width: { xs: "100%", sm: "auto" }, order: { xs: -1, sm: 0 },
                    }}
                  >
                    {bulkSubmitting
                      ? t("pages.addUserForm.bulk.addingProgress", { done: bulkProgress.done, total: bulkProgress.total })
                      : bulkRows.length > 0
                        ? t("pages.addUserForm.bulk.addNUsers", { count: bulkRows.length })
                        : t("pages.addUserForm.bulk.addUsers")}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleClose}
                    disabled={bulkSubmitting}
                    variant="outlined"
                    sx={{
                      borderRadius: "10px", borderColor: "#D0D5DD", color: "#344054",
                      px: 3, py: 1.5, fontWeight: 700, minHeight: "44px",
                      width: { xs: "100%", sm: "auto" },
                    }}
                  >
                    {t("pages.addUserForm.buttons.cancel")}
                  </Button>
                </Stack>
              </Stack>
            )}
          </Box>

          {/* Loading overlay */}
          {isSubmitting && (
            <Box sx={{
              position: "absolute", inset: 0, zIndex: 20, backgroundColor: "rgba(15,23,42,0.28)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Box sx={{
                backgroundColor: "#fff", borderRadius: "12px", px: 3, py: 2,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
                boxShadow: "0 10px 24px rgba(2,6,23,0.2)",
              }}>
                <LoadingSpinner />
                <Typography sx={{ fontSize: 13, color: "#475467", fontWeight: 600 }}>
                  {t("pages.addUserForm.loading")}
                </Typography>
              </Box>
            </Box>
          )}

        </Paper>
      </Box>
    </Modal>
  );
}