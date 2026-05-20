import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Box, Button, Divider, FormControl, InputLabel, MenuItem,
  Modal, Paper, Select, Stack, TextField, Typography,
} from "@mui/material";
import { api } from "../../../lib/api/apiClient";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";

const ROLES = [
  { id: 1, key: "customer",   label: "Customer"   },
  { id: 2, key: "cs_agent",   label: "CS Agent"   },
  { id: 3, key: "technician", label: "Technician" },
];

export default function AddUserForm({ isOpen, onClose, defaultRoleId = 2 }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", roleId: defaultRoleId, position: "",
  });
  const [errors, setErrors] = useState({});

  const roleLabel = ROLES.find((r) => r.id === formData.roleId)?.label ?? "";

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ name: "", email: "", password: "", roleId: defaultRoleId, position: "" });
      setErrors({});
      onClose();
    }
  };

  const validate = () => {
    const e = {};
    if (!formData.name.trim())     e.name     = "Name is required";
    if (!formData.email.trim())    e.email    = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = "Invalid email format";
    if (!formData.password.trim()) e.password = "Password is required";
    else if (formData.password.length < 6) e.password = "Minimum 6 characters";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setErrors({});
    setIsSubmitting(true);

    try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const serviceKey  = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

        // 1. Buat auth user via Supabase Admin API
        const authRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${serviceKey}`,
            "apikey": serviceKey,
        },
        body: JSON.stringify({
            email: formData.email.trim(),
            password: formData.password,
            email_confirm: true,
        }),
        });

        const authData = await authRes.json();
        if (!authRes.ok) throw new Error(authData.message ?? "Failed to create auth user");

        const authUserId = authData.id;

        // 2. Insert profile via backend C# (token admin yang login)
        await api.post("/api/usermanagement/add", {
        authUserId,
        name:     formData.name.trim(),
        email:    formData.email.trim(),
        roleId:   formData.roleId,
        position: formData.position.trim() || null,
        });

        await queryClient.invalidateQueries({ queryKey: ["users-by-role"] });
        setFormData({ name: "", email: "", password: "", roleId: defaultRoleId, position: "" });
        onClose();

    } catch (error) {
        const msg = error?.response?.data?.message ?? error?.message ?? "Failed to add user";
        setErrors((prev) => ({ ...prev, api: msg }));
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: "rgba(16, 24, 40, 0.35)",
            backdropFilter: "blur(2px)",
          },
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: { xs: 0, sm: "50%" },
          left: "50%",
          transform: { xs: "translateX(-50%)", sm: "translate(-50%, -50%)" },
          width: { xs: "100vw", sm: "94%", md: 520 },
          height: { xs: "100vh", sm: "auto" },
          maxHeight: { xs: "100vh", sm: "calc(100vh - 48px)" },
          outline: "none",
        }}
      >
        <Paper
          sx={{
            borderRadius: "16px",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            maxHeight: "calc(100vh - 48px)",
            overflow: "hidden",
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              px: { xs: 2.5, sm: 3.5 }, py: 2,
              background: "linear-gradient(180deg, #FFF9F5 0%, #FFFFFF 100%)",
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography sx={{ fontSize: { xs: 22, sm: 26 }, fontWeight: 800 }}>
                  Add {roleLabel}
                </Typography>
                <Typography sx={{ fontSize: 13, color: "#667085", mt: 0.5 }}>
                  Fill in the details to create a new {roleLabel.toLowerCase()} account
                </Typography>
              </Box>
              <Button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                sx={{ minWidth: "auto", px: 1.5, color: "#667085", fontSize: 18, lineHeight: 1 }}
              >
                x
              </Button>
            </Stack>
          </Box>

          <Divider />

          {/* Body */}
          <Box sx={{ px: { xs: 2, sm: 3.5 }, py: 3, overflowY: "auto", flex: 1 }}>
            <form onSubmit={handleSubmit}>
              <Stack spacing={2.5}>

                {/* Role selector */}
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={formData.roleId}
                    label="Role"
                    onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                  >
                    {ROLES.map((r) => (
                      <MenuItem key={r.id} value={r.id}>{r.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Name */}
                <TextField
                  required
                  label="Full Name"
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  error={Boolean(errors.name)}
                  helperText={errors.name}
                  fullWidth
                />

                {/* Email */}
                <TextField
                  required
                  type="email"
                  label="Email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  error={Boolean(errors.email)}
                  helperText={errors.email}
                  fullWidth
                />

                {/* Password */}
                <TextField
                  required
                  type="password"
                  label="Password"
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  error={Boolean(errors.password)}
                  helperText={errors.password}
                  fullWidth
                />

                {/* Position — hanya non-customer */}
                {formData.roleId !== 1 && (
                  <TextField
                    label="Position"
                    placeholder="e.g. Senior Technician"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    helperText="Optional"
                    fullWidth
                  />
                )}

                {/* API error */}
                {errors.api && (
                  <Box
                    sx={{
                      background: "#fef2f2", border: "1px solid #fecaca",
                      borderRadius: "8px", px: 2, py: 1.5,
                    }}
                  >
                    <Typography sx={{ fontSize: 13, color: "#dc2626" }}>
                      {errors.api}
                    </Typography>
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
                    borderRadius: "10px", background: "#FF8040",
                    px: 3, py: 1.5, fontWeight: 700, minHeight: "44px",
                    "&:hover": { background: "#e6723a" },
                    width: { xs: "100%", sm: "auto" },
                    order: { xs: -1, sm: 0 },
                  }}
                >
                  {isSubmitting ? "Adding..." : `Add ${roleLabel}`}
                </Button>
                <Button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  variant="outlined"
                  sx={{
                    borderRadius: "10px", borderColor: "#D0D5DD",
                    color: "#344054", px: 3, py: 1.5, fontWeight: 700,
                    minHeight: "44px", width: { xs: "100%", sm: "auto" },
                  }}
                >
                  Cancel
                </Button>
              </Stack>
            </form>
          </Box>

          {/* Loading overlay */}
          {isSubmitting && (
            <Box
              sx={{
                position: "absolute", inset: 0, zIndex: 20,
                backgroundColor: "rgba(15, 23, 42, 0.28)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Box
                sx={{
                  backgroundColor: "#fff", borderRadius: "12px",
                  px: 3, py: 2, display: "flex", flexDirection: "column",
                  alignItems: "center", gap: 1,
                  boxShadow: "0 10px 24px rgba(2, 6, 23, 0.2)",
                }}
              >
                <LoadingSpinner />
                <Typography sx={{ fontSize: 13, color: "#475467", fontWeight: 600 }}>
                  Creating user...
                </Typography>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Modal>
  );
}