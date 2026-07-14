import { useCallback, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { MdBusiness, MdUploadFile } from "react-icons/md";
import GeneralSetupSectionPage, { DialogField, SectionFooter, SettingsPanel } from "../GeneralSetupSectionPage";
import {
  CURRENCY_OPTIONS,
  DATE_FORMAT_OPTIONS,
  LANGUAGE_OPTIONS,
  TIMEZONE_OPTIONS,
  WORKING_DAY_OPTIONS,
} from "../gsetup.service";
import { GRID_2_SX } from "../components/gsetup.styles";

function CompanySettingsContent({ settings, updateSettings, saveSettings, theme, fileInputRef }) {
  const [fileName, setFileName] = useState("");

  const handleFieldChange = useCallback(
    (field) => (event) => {
      updateSettings("companySettings", (section) => ({
        ...section,
        [field]: event.target.value,
      }));
    },
    [updateSettings],
  );

  const handleWorkingDayToggle = useCallback(
    (day) => (event) => {
      updateSettings("companySettings", (section) => ({
        ...section,
        workingDays: event.target.checked
          ? [...section.workingDays, day]
          : section.workingDays.filter((value) => value !== day),
      }));
    },
    [updateSettings],
  );

  const handleLogoUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      updateSettings("companySettings", (section) => ({
        ...section,
        logoDataUrl: loadEvent.target?.result?.toString() ?? "",
      }));
    };
    reader.readAsDataURL(file);
  };

  const clearLogo = () => {
    updateSettings("companySettings", (section) => ({ ...section, logoDataUrl: "" }));
    setFileName("");
  };

  const { companySettings: s } = settings;

  return (
    <Stack spacing={2.5}>
      <SettingsPanel
        icon={MdBusiness}
        title="Company Settings"
        subtitle="Configure organization details, locale preferences, and ticket numbering format."
        theme={theme}
        actions={<Chip label="Company profile" sx={{ fontWeight: 700 }} />}
      >
        <Stack spacing={2.5}>
          <Box sx={GRID_2_SX}>
            <TextField
              label="Company Name"
              value={s.companyName}
              onChange={handleFieldChange("companyName")}
              fullWidth
            />
            <TextField
              label="Support Email"
              type="email"
              value={s.supportEmail}
              onChange={handleFieldChange("supportEmail")}
              fullWidth
            />
            <TextField
              label="Phone Number"
              value={s.phoneNumber}
              onChange={handleFieldChange("phoneNumber")}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Timezone</InputLabel>
              <Select label="Timezone" value={s.timezone} onChange={handleFieldChange("timezone")}>
                {TIMEZONE_OPTIONS.map((timezone) => (
                  <MenuItem key={timezone} value={timezone}>
                    {timezone}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "1.25fr 0.75fr" },
              gap: 2,
            }}
          >
            {/* Logo upload */}
            <Box
              sx={{
                border: `1px solid ${theme.border}`,
                borderRadius: "16px",
                p: 2,
                background: theme.isDarkMode ? "rgba(255,255,255,0.02)" : "#fff",
              }}
            >
              <Typography sx={{ fontSize: 13, fontWeight: 800, color: theme.text, mb: 1.5 }}>
                Company Logo
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 84,
                    height: 84,
                    borderRadius: "18px",
                    border: `1px dashed ${theme.border}`,
                    background: theme.inputHover,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  {s.logoDataUrl ? (
                    <Box
                      component="img"
                      src={s.logoDataUrl}
                      alt="Company logo"
                      sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <MdBusiness size={30} color={theme.subtext} />
                  )}
                </Box>
                <Stack spacing={1} sx={{ flex: 1, width: "100%" }}>
                  <Typography sx={{ fontSize: 13, color: theme.subtext }}>
                    Upload a square logo for the admin experience and branded exports.
                  </Typography>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                    <Button
                      variant="outlined"
                      onClick={() => fileInputRef.current?.click()}
                      startIcon={<MdUploadFile size={18} />}
                      sx={{ borderRadius: "12px", fontWeight: 800 }}
                    >
                      Upload Logo
                    </Button>
                    <Button
                      variant="text"
                      onClick={clearLogo}
                      sx={{ borderRadius: "12px", fontWeight: 800, color: theme.accent }}
                    >
                      Remove
                    </Button>
                  </Stack>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleLogoUpload}
                  />
                  {fileName ? (
                    <Typography sx={{ fontSize: 12, color: theme.subtext }}>
                      {fileName}
                    </Typography>
                  ) : null}
                </Stack>
              </Stack>
            </Box>

            {/* Locale defaults */}
            <Box
              sx={{
                border: `1px solid ${theme.border}`,
                borderRadius: "16px",
                p: 2,
                background: theme.isDarkMode ? "rgba(255,255,255,0.02)" : "#fff",
              }}
            >
              <Typography sx={{ fontSize: 13, fontWeight: 800, color: theme.text, mb: 1.5 }}>
                Locale Defaults
              </Typography>
              <Stack spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select
                    label="Language"
                    value={s.language}
                    onChange={handleFieldChange("language")}
                  >
                    {LANGUAGE_OPTIONS.map((lang) => (
                      <MenuItem key={lang} value={lang}>
                        {lang}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    label="Currency"
                    value={s.currency}
                    onChange={handleFieldChange("currency")}
                  >
                    {CURRENCY_OPTIONS.map((currency) => (
                      <MenuItem key={currency} value={currency}>
                        {currency}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Date Format</InputLabel>
                  <Select
                    label="Date Format"
                    value={s.dateFormat}
                    onChange={handleFieldChange("dateFormat")}
                  >
                    {DATE_FORMAT_OPTIONS.map((fmt) => (
                      <MenuItem key={fmt} value={fmt}>
                        {fmt}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Box>
          </Box>

          {/* Working days & hours */}
          <Box sx={GRID_2_SX}>
            <DialogField label="Working Days" theme={theme}>
              <FormGroup row sx={{ gap: 0.5 }}>
                {WORKING_DAY_OPTIONS.map((day) => (
                  <FormControlLabel
                    key={day.value}
                    control={
                      <Checkbox
                        checked={s.workingDays.includes(day.value)}
                        onChange={handleWorkingDayToggle(day.value)}
                        sx={{
                          color: theme.accent,
                          "&.Mui-checked": { color: theme.accent },
                        }}
                      />
                    }
                    label={day.label}
                  />
                ))}
              </FormGroup>
            </DialogField>

            <DialogField
              label="Working Hours"
              helperText="Set the default support operating window."
              theme={theme}
            >
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <TextField
                  type="time"
                  label="Start"
                  value={s.workingHoursStart}
                  onChange={handleFieldChange("workingHoursStart")}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  type="time"
                  label="End"
                  value={s.workingHoursEnd}
                  onChange={handleFieldChange("workingHoursEnd")}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>
            </DialogField>
          </Box>

          {/* Ticket number format */}
          <Box sx={GRID_2_SX}>
            <TextField
              label="Ticket Number Format"
              value={s.ticketNumberFormat}
              onChange={handleFieldChange("ticketNumberFormat")}
              fullWidth
            />
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 0.5 }}>
              <Chip label="Example" size="small" sx={{ fontWeight: 700 }} />
              <Typography sx={{ color: theme.subtext, fontSize: 13 }}>
                {s.ticketNumberFormat.replace("{YYYY}", "2026").replace("{0001}", "0001")}
              </Typography>
            </Box>
          </Box>

          <SectionFooter
            theme={theme}
            onSave={() => saveSettings(settings, "Company settings saved.")}
            helperText="Company settings influence branding, localization, and ticket numbering defaults."
          />
        </Stack>
      </SettingsPanel>
    </Stack>
  );
}

export default function CompanySettingsPage() {
  return (
    <GeneralSetupSectionPage
      title="Company Settings"
      subtitle="Configure organization details, locale preferences, and ticket numbering format."
      ContentComponent={CompanySettingsContent}
    />
  );
}
