import { useEffect, useState } from "react";
import { Alert, Box, Button, Chip, Stack, Typography } from "@mui/material";
import { MdPayment } from "react-icons/md";
import { useTranslation } from "react-i18next";
import GeneralSetupSectionPage, { SettingsPanel } from "../GeneralSetupSectionPage";
import { api } from "../../../lib/api/apiClient";

const formatDate = (value) => value
  ? new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(new Date(value))
  : "—";

function SubscriptionBillingContent({ theme }) {
  const { t } = useTranslation();
  const [subscription, setSubscription] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get("/api/company/settings/subscription")
      .then(({ data }) => setSubscription(data))
      .catch(() => setError(true));
  }, []);

  if (error) return <Alert severity="error">{t("pages.gsetup.subscriptionBilling.loadFailed")}</Alert>;
  if (!subscription) return <Typography sx={{ color: theme.subtext }}>{t("pages.gsetup.common.loading")}</Typography>;

  const status = (subscription.status ?? "not_configured").toLowerCase();
  const plan = (subscription.plan ?? "not_configured").toLowerCase();
  const isTrial = status === "trial" || plan === "trial";
  const statusColor = status === "active" ? "success" : status === "expired" ? "error" : isTrial ? "warning" : "default";

  return (
    <SettingsPanel
      theme={theme}
      icon={MdPayment}
      title={t("pages.gsetup.subscriptionBilling.title")}
      subtitle={t("pages.gsetup.subscriptionBilling.subtitle")}
    >
      <Stack spacing={2.5}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} flexWrap="wrap">
          <Box sx={{ minWidth: 190 }}>
            <Typography variant="caption" color="text.secondary">{t("pages.gsetup.subscriptionBilling.plan")}</Typography>
            <Typography sx={{ fontWeight: 800, textTransform: "capitalize" }}>{isTrial ? t("pages.gsetup.subscriptionBilling.freeTrial") : plan.replace("_", " ")}</Typography>
          </Box>
          <Box sx={{ minWidth: 190 }}>
            <Typography variant="caption" color="text.secondary">{t("pages.gsetup.subscriptionBilling.status")}</Typography>
            <Box><Chip size="small" color={statusColor} label={status.replace("_", " ")} sx={{ mt: 0.5, textTransform: "capitalize" }} /></Box>
          </Box>
          <Box sx={{ minWidth: 190 }}>
            <Typography variant="caption" color="text.secondary">{isTrial ? t("pages.gsetup.subscriptionBilling.trialEnds") : t("pages.gsetup.subscriptionBilling.subscriptionEnds")}</Typography>
            <Typography sx={{ fontWeight: 700 }}>{formatDate(subscription.subscriptionEnd)}</Typography>
          </Box>
        </Stack>

        {isTrial && (
          <Alert severity="info">{t("pages.gsetup.subscriptionBilling.trialInfo", { date: formatDate(subscription.subscriptionEnd) })}</Alert>
        )}
        {status === "expired" && (
          <Alert severity="warning">{t("pages.gsetup.subscriptionBilling.expiredInfo")}</Alert>
        )}

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          {status === "active" && (
            <>
              <Button disabled variant="outlined">{t("pages.gsetup.subscriptionBilling.cancel")}</Button>
              <Button disabled variant="contained">{t("pages.gsetup.subscriptionBilling.changePlan")}</Button>
            </>
          )}
          {isTrial && <Button disabled variant="contained">{t("pages.gsetup.subscriptionBilling.choosePaidPlan")}</Button>}
          {status === "expired" && <Button disabled variant="contained">{t("pages.gsetup.subscriptionBilling.renew")}</Button>}
        </Stack>
      </Stack>
    </SettingsPanel>
  );
}

export default function SubscriptionBillingPage() {
  const { t } = useTranslation();
  return <GeneralSetupSectionPage title={t("pages.gsetup.subscriptionBilling.title")} ContentComponent={SubscriptionBillingContent} />;
}
