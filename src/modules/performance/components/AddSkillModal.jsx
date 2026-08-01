import { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Modal,
  Paper,
  Typography,
  Stack,
  Button,
  Autocomplete,
  TextField,
  CircularProgress,
} from "@mui/material";
import { searchSkills, createSkill } from "../performance.service";
import { useTranslation } from "react-i18next";

const SEARCH_DEBOUNCE_MS = 300;

export default function AddSkillModal({
  open,
  onClose,
  profile,
  existingSkillIds = [],
  onAssignSkill,
}) {
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const debounceRef = useRef(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (open) {
      setSelectedSkill(null);
      setInputValue("");
      setOptions([]);
      setError("");
    }
  }, [open]);

  const runSearch = useCallback(
    (query) => {
      if (!query.trim()) {
        setOptions([]);
        return;
      }
      setSearching(true);
      searchSkills(query.trim())
        .then((results) =>
          setOptions(results.filter((s) => !existingSkillIds.includes(s.id)))
        )
        .catch(() => setOptions([]))
        .finally(() => setSearching(false));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [existingSkillIds]
  );

  const handleInputChange = (_e, newInput, reason) => {
    setInputValue(newInput);
    if (reason === "reset") return;
    setSelectedSkill(null);
    setError("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(newInput), SEARCH_DEBOUNCE_MS);
  };

  const handleChange = (_e, value) => {
    if (value && typeof value === "object" && value.__isNew) {
      setSelectedSkill(null);
      setInputValue(value.inputValue);
      return;
    }
    if (typeof value === "string") {
      setSelectedSkill(null);
      setInputValue(value);
      return;
    }
    setSelectedSkill(value);
    setInputValue(value?.skill ?? "");
  };

  const filterOptions = (opts, params) => {
    const query = params.inputValue.trim();
    const matches = opts.filter((o) => o.skill.toLowerCase().includes(query.toLowerCase()));
    const exactMatchExists = opts.some((o) => o.skill.toLowerCase() === query.toLowerCase());
    if (query && !exactMatchExists) {
      matches.push({
        __isNew: true,
        inputValue: query,
        skill: `Add "${query}"`,
      });
    }
    return matches;
  };

  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  const saveSkill = async () => {
    const name = inputValue.trim();
    if (!name || !profile) return;

    setSaving(true);
    setError("");
    try {
      let skillId = selectedSkill?.id;

      if (!skillId) {
        const exactMatch = options.find(
          (s) => !s.__isNew && s.skill.toLowerCase() === name.toLowerCase()
        );
        skillId = exactMatch ? exactMatch.id : (await createSkill(name)).id;
      }

      await onAssignSkill(profile.id, skillId);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message ?? err?.message ?? "Failed to add skill");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      slotProps={{ backdrop: { sx: { backgroundColor: "rgba(16,24,40,0.35)", backdropFilter: "blur(2px)" } } }}
    >
      <Box
        sx={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)", width: { xs: "92vw", sm: 460 },
          outline: "none",
        }}
      >
        <Paper
          sx={{
            borderRadius: "16px", p: 3,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          <Typography sx={{ fontSize: 20, fontWeight: 800, mb: 0.5 }}>{t("pages.adminUserPerformance.addSkill")}</Typography>
          <Typography sx={{ fontSize: 13, color: "#667085", mb: 2.5 }}>{profile?.name}</Typography>

          <Autocomplete
            freeSolo
            loading={searching}
            options={options}
            getOptionLabel={(option) => (typeof option === "string" ? option : option.skill)}
            isOptionEqualToValue={(o, v) => o.id === v?.id}
            filterOptions={filterOptions}
            value={selectedSkill}
            inputValue={inputValue}
            onInputChange={handleInputChange}
            onChange={handleChange}
            renderOption={(props, option) => (
              <li {...props} key={option.__isNew ? `new-${option.inputValue}` : option.id}>
                {option.__isNew ? (
                  <span style={{ color: "#FF8040", fontWeight: 700 }}>{option.skill}</span>
                ) : (
                  option.skill
                )}
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                autoFocus
                label={t("pages.adminUserPerformance.skillSearchLabel")}
                placeholder={t("pages.addUserForm.fields.skillsPlaceholder")}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {searching && <CircularProgress size={16} sx={{ mr: 1, color: "#FF8040" }} />}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            onKeyDown={(e) => {
              if (e.key === "Enter" && inputValue.trim() && !searching) {
                e.preventDefault();
                saveSkill();
              }
            }}
          />

          {error && (
            <Box sx={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", px: 2, py: 1.5, mt: 2 }}>
              <Typography sx={{ fontSize: 13, color: "#dc2626" }}>{error}</Typography>
            </Box>
          )}

          <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ mt: 3 }}>
            <Button
              onClick={handleClose}
              disabled={saving}
              variant="outlined"
              sx={{ borderRadius: "10px", borderColor: "#D0D5DD", color: "#344054", fontWeight: 700, px: 3 }}
            >
              {t("pages.adminUserPerformance.cancel")}
            </Button>
            <Button
              onClick={saveSkill}
              disabled={saving || !inputValue.trim()}
              variant="contained"
              sx={{ borderRadius: "10px", background: "#FF8040", fontWeight: 700, px: 3, "&:hover": { background: "#e6723a" } }}
            >
              {saving ? <CircularProgress size={20} sx={{ color: "white" }} /> : t("pages.adminUserPerformance.add")}
            </Button>
          </Stack>
        </Paper>
      </Box>
    </Modal>
  );
}