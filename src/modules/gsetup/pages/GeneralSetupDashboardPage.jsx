import { useNavigate } from "react-router-dom";
import { Box, Paper, Stack, Typography } from "@mui/material";
import { createGeneralSetupThemeTokens } from "../GeneralSetupSectionPage";
import { GENERAL_SETUP_MODULES } from "../gsetup.navigation";

function ModuleCard({ module, theme, onNavigate }) {
  const accent = module.accent ?? theme.accent;
  const accentBg = module.accentBg ?? "#fff4ee";
  const accentBorder = module.accentBorder ?? "#fcd9bc";

  return (
    <Paper
      elevation={0}
      onClick={() => onNavigate(module.to)}
      sx={{
        background: theme.cardBg,
        border: `2px solid ${theme.border}`,
        borderRadius: "16px",
        p: "32px 28px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        minHeight: 170,
        display: "flex",
        flexDirection: "column",
        outline: "none",
        "&:hover": {
          borderColor: accent,
          boxShadow: `0 8px 24px ${accent}26`,
          transform: "translateY(-2px)",
        },
      }}
    >
      <Box
        sx={{
          display: "inline-block",
          background: accentBg,
          border: `1px solid ${accentBorder}`,
          color: accent,
          fontSize: 12,
          fontWeight: 700,
          px: 1.25,
          py: 0.5,
          borderRadius: "20px",
          mb: 2,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          width: "fit-content",
        }}
      >
        {module.badge}
      </Box>
      <Typography sx={{ fontSize: 24, fontWeight: 700, color: theme.text, mb: 1 }}>
        {module.title}
      </Typography>
      <Typography
        sx={{ fontSize: 14, color: theme.subtext, lineHeight: 1.6, mb: 2.5, flex: 1 }}
      >
        {module.description}
      </Typography>
      <Typography sx={{ color: accent, fontWeight: 600, fontSize: 14 }}>
        Open View
      </Typography>
    </Paper>
  );
}

export default function GeneralSetupDashboardPage() {
  const theme = createGeneralSetupThemeTokens();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100%",
        fontFamily: theme.fontFamily,
        background: theme.pageBg,
        color: theme.text,
        p: "40px",
      }}
    >
      <Stack
        direction="row"
        flexWrap="wrap"
        useFlexGap
        spacing={3}
        sx={{ width: "100%" }}
      >
        {GENERAL_SETUP_MODULES.map((mod) => (
          <Box
            key={mod.key}
            sx={{
              width: {
                xs: "100%",
                md: `calc(50% - 12px)`,
              },
            }}
          >
            <ModuleCard module={mod} theme={theme} onNavigate={navigate} />
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
