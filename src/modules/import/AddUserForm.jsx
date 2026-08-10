import { useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { MdDownload, MdTableChart, MdUploadFile } from "react-icons/md";
import {
  Autocomplete, Box, Button, Chip, CircularProgress, Divider, FormControl,
  InputLabel, MenuItem, Modal, Paper, Select, Stack, Table, TableBody,
  TableCell, TableHead, TableRow, TextField, Typography,
} from "@mui/material";
import * as XLSX from "xlsx";
import { useAuth } from "../../hooks/useAuth";
import {
  createBulkUser, createSingleUser, createSkill, downloadTemplate,
  getRoleId, normalizeRows, parseSkillNames, resolveSkillNames,
  searchSkills, validateRow,
} from "./import.service";
import { useCompanyRoles } from "./useCompanyRoles";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const TECHNICIAN_ROLE_KEY = "technician";
const CUSTOMER_ROLE_KEY = "customer";
const SKILL_SEARCH_DEBOUNCE_MS = 300;

const emptySingleForm = (roleId = "") => ({
  name: "", email: "", password: "", roleId, position: "",
});

const roleKeyOf = (role) => role?.role ?? role?.key;

// ─── Skill tag field (comic-genre-tag look) ────────────────────────────────
// Local-only until the form is submitted: picking an existing skill just adds
// its real { id, skill }; typing a new one and clicking "Add" adds a
// { id: null, skill, isNew: true } placeholder tag. Nothing hits the database
// yet — AddUserForm resolves any `isNew` tags into real skill rows at submit
// time. Every tag (existing or new) gets the default Chip delete (×) icon.
function SkillField({ value, onChange, disabled }) {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef(null);

  const runSearch = useCallback((query) => {
    if (!query.trim()) {
      setOptions([]);
      return;
    }
    setSearching(true);
    searchSkills(query.trim())
      .then(setOptions)
      .catch(() => setOptions([]))
      .finally(() => setSearching(false));
  }, []);

  const handleInputChange = (_e, newInput, reason) => {
    setInputValue(newInput);
    if (reason === "reset") return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(newInput), SKILL_SEARCH_DEBOUNCE_MS);
  };

  const handleChange = (_e, newValue) => {
    const last = newValue[newValue.length - 1];

    // User clicked the synthetic "Add <name>" option -> add a local pending tag.
    if (last && typeof last === "object" && last.__isNew) {
      const name = last.inputValue.trim();
      if (!name) return;

      const duplicate = value.some((s) => s.skill.toLowerCase() === name.toLowerCase());
      if (duplicate) return;

      const withoutMarker = newValue.slice(0, -1);
      onChange([...withoutMarker, { id: null, skill: name, isNew: true }]);
      setInputValue("");
      setOptions([]);
      return;
    }

    // Regular picks from the existing-skills list, deduped; drop stray
    // free-typed strings that freeSolo can surface without an explicit pick.
    const objectsOnly = newValue.filter((v) => typeof v === "object");
    const seen = new Set();
    const deduped = objectsOnly.filter((v) => {
      const key = v.isNew ? `new:${v.skill.toLowerCase()}` : `id:${v.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    onChange(deduped);
  };

  const filterOptions = (opts, params) => {
    const query = params.inputValue.trim();
    const selectedIds = new Set(value.filter((v) => !v.isNew).map((v) => v.id));

    const matches = opts.filter(
      (o) => !selectedIds.has(o.id) && o.skill.toLowerCase().includes(query.toLowerCase())
    );

    const exactMatchExists = opts.some((o) => o.skill.toLowerCase() === query.toLowerCase());
    const alreadyAddedLocally = value.some((v) => v.skill.toLowerCase() === query.toLowerCase());
    if (query && !exactMatchExists && !alreadyAddedLocally) {
      matches.push({
        __isNew: true,
        inputValue: query,
        skill: t("pages.addUserForm.fields.addSkillOption", { defaultValue: `Add "${query}"`, name: query }),
      });
    }
    return matches;
  };

  return (
    <Autocomplete
      multiple
      freeSolo
      disabled={disabled}
      loading={searching}
      options={options}
      value={value}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      onChange={handleChange}
      filterOptions={filterOptions}
      isOptionEqualToValue={(o, v) => (v.isNew ? o.skill === v.skill : o.id === v.id)}
      getOptionLabel={(o) => (typeof o === "string" ? o : o.skill)}
      renderOption={(props, option) => (
        <li {...props} key={option.__isNew ? `new-${option.inputValue}` : option.id}>
          {option.__isNew ? <span style={{ color: "#FF8040", fontWeight: 700 }}>{option.skill}</span> : option.skill}
        </li>
      )}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => (
          <Chip
            {...getTagProps({ index })}
            key={option.isNew ? `new-${option.skill}` : option.id}
            label={option.skill}
            size="small"
            sx={{
              borderRadius: "999px",
              background: "#FFF0E6",
              color: "#FF8040",
              fontWeight: 700,
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: 0.3,
              border: "1px solid #FFD9BF",
              "& .MuiChip-deleteIcon": { color: "#FF8040" },
            }}
          />
        ))
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={t("pages.addUserForm.fields.skills", { defaultValue: "Skills" })}
          placeholder={t("pages.addUserForm.fields.skillsPlaceholder", { defaultValue: "Type to search or add a skill" })}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {searching && <CircularProgress size={16} sx={{ mr: 1 }} />}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}

export default function AddUserForm({ isOpen, onClose, defaultRoleName = "cs_agent" }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const { roles: companyRoles, roleMap, defaultRoleId } = useCompanyRoles(isOpen, user?.id, defaultRoleName);

  const [mode, setMode] = useState("single");

  // ─── Single-add state ────────────────────────────────────────────────
  const [formData, setFormData] = useState(() => emptySingleForm());
  const [skills, setSkills] = useState([]); // [{ id: number|null, skill, isNew?: boolean }]
  const [errors, setErrors] = useState({});
  const [isSubmitting, setSubmitting] = useState(false);
  const roleIdInitialized = useRef(false);

  if (defaultRoleId && !roleIdInitialized.current) {
    roleIdInitialized.current = true;
    setFormData((prev) => ({ ...prev, roleId: defaultRoleId }));
  }

  // ─── Bulk-import state ───────────────────────────────────────────────
  const [bulkRows, setBulkRows] = useState([]);
  const [bulkErrors, setBulkErrors] = useState([]);
  const [bulkApiError, setBulkApiError] = useState("");
  const [bulkSubmitting, setBulkSubmit] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ done: 0, total: 0 });
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState("");
  const [bulkPassword, setBulkPassword] = useState("12345678");

  const selectedRole = (companyRoles ?? []).find((r) => r.id === formData.roleId);
  const isCustomer = roleKeyOf(selectedRole) === CUSTOMER_ROLE_KEY;
  const isTechnician = roleKeyOf(selectedRole) === TECHNICIAN_ROLE_KEY;

  const resetSingle = () => {
    roleIdInitialized.current = false;
    setFormData(emptySingleForm(companyRoles?.[0]?.id ?? ""));
    setSkills([]);
    setErrors({});
  };

  const resetBulk = () => {
    setBulkRows([]);
    setBulkErrors([]);
    setBulkApiError("");
    setBulkProgress({ done: 0, total: 0 });
    setFileName("");
    setBulkPassword("12345678");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    if (isSubmitting || bulkSubmitting) return;
    resetSingle();
    resetBulk();
    setMode("single");
    onClose();
  };

  // ─── Single mode ──────────────────────────────────────────────────────

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = t("pages.addUserForm.errors.nameRequired");
    if (!formData.email.trim()) e.email = t("pages.addUserForm.errors.emailRequired");
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = t("pages.addUserForm.errors.emailInvalid");
    if (!formData.password.trim()) e.password = t("pages.addUserForm.errors.passwordRequired");
    else if (formData.password.length < 6) e.password = t("pages.addUserForm.errors.passwordTooShort");
    return e;
  };

  /** New (isNew) tags are only persisted here, right before the user is created. */
  const resolveSkillIds = async () => {
    if (!isTechnician || skills.length === 0) return undefined;
    return Promise.all(
      skills.map((s) => (s.isNew ? createSkill(s.skill).then((created) => created.id) : s.id))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      const skillIds = await resolveSkillIds();
      await createSingleUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        roleId: formData.roleId,
        position: formData.position.trim(),
        skillIds,
      });
      await queryClient.invalidateQueries({ queryKey: ["users-by-role"] });
      resetSingle();
      onClose();
    } catch (err) {
      const message = err?.response?.data?.message ?? err?.message ?? "Failed to add user";
      setErrors((prev) => ({ ...prev, api: message }));
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // ─── Bulk mode ────────────────────────────────────────────────────────

  const parseExcel = (file) => {
    setFileName(file.name);
    resetBulk();
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const workbook = XLSX.read(ev.target.result, { type: "array" });
        const rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: "" });
        const rows = normalizeRows(rawRows);
        setBulkRows(rows);
        setBulkErrors(rows.map((row) => validateRow(row, roleMap)));
      } catch {
        setBulkApiError(t("pages.addUserForm.bulk.readError"));
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) parseExcel(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) parseExcel(file);
  };

  const handleBulkSubmit = async () => {
    if (!bulkRows.length) return;
    if (bulkErrors.some((rowErrors) => rowErrors.length > 0)) {
      setBulkApiError(t("pages.addUserForm.bulk.fixErrors"));
      return;
    }

    setBulkSubmit(true);
    setBulkApiError("");
    setBulkProgress({ done: 0, total: bulkRows.length });

    const nextErrors = [...bulkErrors];
    let successCount = 0;
    const skillCache = new Map(); // normalized skill name -> id, shared across the whole batch

    for (let i = 0; i < bulkRows.length; i++) {
      try {
        const row = bulkRows[i];
        const roleId = getRoleId(row.role, roleMap);
        const isTechnicianRow = roleId === roleMap[TECHNICIAN_ROLE_KEY];

        let skillIds;
        if (isTechnicianRow && row.skill) {
          const skillNames = parseSkillNames(row.skill);
          if (skillNames.length) {
            skillIds = await resolveSkillNames(skillNames, skillCache);
          }
        }

        await createBulkUser({
          ...row,
          roleId,
          password: bulkPassword,
          skillIds,
        });
        nextErrors[i] = [];
        successCount++;
      } catch (err) {
        nextErrors[i] = [err?.response?.data?.message ?? err?.message ?? "Failed"];
      }
      setBulkProgress({ done: i + 1, total: bulkRows.length });
      setBulkErrors([...nextErrors]);
    }

    setBulkSubmit(false);
    await queryClient.invalidateQueries({ queryKey: ["users-by-role"] });

    if (successCount === bulkRows.length) {
      resetBulk();
      onClose();
      return;
    }
    setBulkApiError(t("pages.addUserForm.bulk.partialSuccess", { success: successCount, total: bulkRows.length }));
    setBulkRows(bulkRows.filter((_, i) => nextErrors[i].length > 0));
    setBulkErrors(nextErrors.filter((rowErrors) => rowErrors.length > 0));
  };

  const totalErrors = bulkErrors.filter((rowErrors) => rowErrors.length > 0).length;
  const readyToSubmit = bulkRows.length > 0 && bulkErrors.every((rowErrors) => rowErrors.length === 0);

  return (
    <Modal
      open={isOpen}
      onClose={() => {}}
      slotProps={{ backdrop: { sx: { backgroundColor: "rgba(16,24,40,0.35)", backdropFilter: "blur(2px)" } } }}
    >
      <Box
        sx={{
          position: "absolute", top: { xs: 0, sm: "50%" }, left: "50%",
          transform: { xs: "translateX(-50%)", sm: "translate(-50%,-50%)" },
          width: { xs: "100vw", sm: "94%", md: mode === "bulk" ? 700 : 520 },
          height: { xs: "100vh", sm: "auto" },
          maxHeight: { xs: "100vh", sm: "calc(100vh - 48px)" },
          outline: "none", transition: "width 0.2s",
        }}
      >
        <Paper
          sx={{
            borderRadius: "16px", position: "relative", display: "flex", flexDirection: "column",
            maxHeight: "calc(100vh - 48px)", overflow: "hidden",
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
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
              <Button onClick={handleClose} disabled={isSubmitting || bulkSubmitting} sx={{ minWidth: "auto", px: 1.5, color: "#667085", fontSize: 18 }}>
                ✕
              </Button>
            </Stack>

            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              {[
                { key: "single", label: t("pages.addUserForm.modeSingle") },
                { key: "bulk", label: t("pages.addUserForm.modeBulk") },
              ].map((m) => (
                <Button
                  key={m.key}
                  onClick={() => setMode(m.key)}
                  size="small"
                  sx={{
                    borderRadius: "8px", px: 2, py: 0.75, fontWeight: 700, fontSize: 13,
                    border: "2px solid #FF8040",
                    background: mode === m.key ? "#FF8040" : "transparent",
                    color: mode === m.key ? "#fff" : "#FF8040",
                    "&:hover": { background: mode === m.key ? "#e6723a" : "#FFF5EF" },
                  }}
                >
                  {m.label}
                </Button>
              ))}
            </Stack>
          </Box>

          <Divider />

          <Box sx={{ px: { xs: 2, sm: 3.5 }, py: 3, overflowY: "auto", flex: 1 }}>
            {mode === "single" && (
              <form onSubmit={handleSubmit}>
                <Stack spacing={2.5}>
                  <FormControl fullWidth>
                    <InputLabel>{t("pages.addUserForm.fields.role")}</InputLabel>
                    <Select
                      value={formData.roleId}
                      label={t("pages.addUserForm.fields.role")}
                      onChange={(e) => setFormData((prev) => ({ ...prev, roleId: e.target.value }))}
                    >
                      {(companyRoles ?? []).map((r) => (
                        <MenuItem key={r.id} value={r.id}>{t(`roles.${roleKeyOf(r)}`)}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {[
                    { field: "name", type: "text", labelKey: "fullName", placeholderKey: "fullNamePlaceholder" },
                    { field: "email", type: "email", labelKey: "email", placeholderKey: "emailPlaceholder" },
                    { field: "password", type: "password", labelKey: "password", placeholderKey: "passwordPlaceholder" },
                  ].map(({ field, type, labelKey, placeholderKey }) => (
                    <TextField
                      key={field}
                      required
                      type={type}
                      label={t(`pages.addUserForm.fields.${labelKey}`)}
                      placeholder={t(`pages.addUserForm.fields.${placeholderKey}`)}
                      value={formData[field]}
                      onChange={updateField(field)}
                      error={Boolean(errors[field])}
                      helperText={errors[field]}
                      fullWidth
                    />
                  ))}

                  {!isCustomer && (
                    <TextField
                      label={t("pages.addUserForm.fields.position")}
                      placeholder={t("pages.addUserForm.fields.positionPlaceholder")}
                      value={formData.position}
                      onChange={updateField("position")}
                      fullWidth
                    />
                  )}

                  {isTechnician && (
                    <SkillField value={skills} onChange={setSkills} disabled={isSubmitting} />
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

            {mode === "bulk" && (
              <Stack spacing={3}>
                <TextField
                  required
                  type="password"
                  label="Default Password"
                  helperText="Password untuk semua user yang di-import"
                  value={bulkPassword}
                  onChange={(e) => setBulkPassword(e.target.value)}
                  fullWidth
                />

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
                              {["no", "name", "email", "role", "position", "skill", "status"].map((h) => (
                                <TableCell key={h} sx={{ background: "#FFF9F5", color: "#FF8040", fontWeight: 700, fontSize: 12, whiteSpace: "nowrap" }}>
                                  {t(`pages.addUserForm.bulk.tableHeaders.${h}`)}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {bulkRows.map((row, i) => {
                              const rowErrors = bulkErrors[i] ?? [];
                              const hasErrors = rowErrors.length > 0;
                              return (
                                <TableRow key={i} sx={{ background: hasErrors ? "#fef2f2" : "transparent" }}>
                                  <TableCell sx={{ color: "#999", fontSize: 12 }}>{i + 1}</TableCell>
                                  <TableCell sx={{ fontSize: 13 }}>{row.name || <span style={{ color: "#dc2626" }}>—</span>}</TableCell>
                                  <TableCell sx={{ fontSize: 13 }}>{row.email || <span style={{ color: "#dc2626" }}>—</span>}</TableCell>
                                  <TableCell sx={{ fontSize: 13 }}>{row.role || <span style={{ color: "#dc2626" }}>—</span>}</TableCell>
                                  <TableCell sx={{ fontSize: 13, color: "#667085" }}>{row.position || "-"}</TableCell>
                                  <TableCell sx={{ fontSize: 13, color: "#667085" }}>{row.skill || "-"}</TableCell>
                                  <TableCell>
                                    {hasErrors ? (
                                      <Typography sx={{ fontSize: 11, color: "#dc2626" }}>{rowErrors.join("; ")}</Typography>
                                    ) : (
                                      <Typography sx={{ fontSize: 11, color: "#16a34a", fontWeight: 600 }}>{t("pages.addUserForm.bulk.statusReady")}</Typography>
                                    )}
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

                {bulkSubmitting && (
                  <Box>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <Typography sx={{ fontSize: 13, color: "#667085" }}>{t("pages.addUserForm.bulk.creating")}</Typography>
                      <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#FF8040" }}>{bulkProgress.done} / {bulkProgress.total}</Typography>
                    </Stack>
                    <Box sx={{ height: 6, borderRadius: 3, background: "#f0f0f0", overflow: "hidden" }}>
                      <Box
                        sx={{
                          height: "100%", background: "#FF8040", borderRadius: 3, transition: "width 0.3s",
                          width: `${bulkProgress.total ? (bulkProgress.done / bulkProgress.total) * 100 : 0}%`,
                        }}
                      />
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

          {isSubmitting && (
            <Box
              sx={{
                position: "absolute", inset: 0, zIndex: 20, backgroundColor: "rgba(15,23,42,0.28)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Box
                sx={{
                  backgroundColor: "#fff", borderRadius: "12px", px: 3, py: 2,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
                  boxShadow: "0 10px 24px rgba(2,6,23,0.2)",
                }}
              >
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