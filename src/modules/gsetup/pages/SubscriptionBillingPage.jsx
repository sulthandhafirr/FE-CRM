import { useEffect, useState } from "react";
import { Alert, Box, Button, Chip, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { MdPayment } from "react-icons/md";
import { useTranslation } from "react-i18next";
import GeneralSetupSectionPage, { SettingsPanel } from "../GeneralSetupSectionPage";
import { api } from "../../../lib/api/apiClient";
import { cancelSubscription, getSubscriptionPayments } from "../../subscription/subscription.service";
import SubscriptionPlanDialog from "../../subscription/SubscriptionPlanDialog";

const formatDate = (value) => value
  ? new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(new Date(value))
  : "—";

const formatAmount = (value) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value ?? 0);

function SubscriptionBillingContent({ theme }) {
  const { t } = useTranslation();
  const [subscription, setSubscription] = useState(null);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [payments, setPayments] = useState([]);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);

  const loadData = async () => {
    const [{ data }, history] = await Promise.all([
      api.get("/api/company/settings/subscription"),
      getSubscriptionPayments(),
    ]);
    setSubscription(data);
    setPayments(history);
  };

  useEffect(() => {
    loadData()
      .catch(() => setError(t("pages.gsetup.subscriptionBilling.loadFailed")));
  }, []);

  const runAction = async (action) => {
    setActionLoading(true);
    setActionError("");
    try {
      setSubscription(await action());
    } catch (actionError) {
      setActionError(actionError?.response?.data?.message || t("pages.gsetup.subscriptionBilling.actionFailed"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm(t("pages.gsetup.subscriptionBilling.cancelConfirm")))
      runAction(cancelSubscription);
  };

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!subscription) return <Typography sx={{ color: theme.subtext }}>{t("pages.gsetup.common.loading")}</Typography>;

  const status = (subscription.status ?? "not_configured").toLowerCase();
  const plan = (subscription.plan ?? "not_configured").toLowerCase();
  const isTrial = status === "trial" || plan === "trial";
  const cancelAtPeriodEnd = Boolean(subscription.cancelAtPeriodEnd);
  const canRenewActive = subscription.subscriptionEnd
    && new Date(subscription.subscriptionEnd).getTime() - Date.now() <= 7 * 24 * 60 * 60 * 1000;
  const statusColor = status === "active" ? "success" : status === "expired" ? "error" : isTrial ? "warning" : "default";

  return (
    <SettingsPanel
      theme={theme}
      icon={MdPayment}
      title={t("pages.gsetup.subscriptionBilling.title")}
      subtitle={t("pages.gsetup.subscriptionBilling.subtitle")}
    >
      <Stack spacing={2.5}>
        {actionError && <Alert severity="error">{actionError}</Alert>}
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
        {status === "active" && cancelAtPeriodEnd && (
          <Alert severity="warning">
            {t("pages.gsetup.subscriptionBilling.cancelledInfo", { date: formatDate(subscription.subscriptionEnd) })}
          </Alert>
        )}

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          {status === "active" && !cancelAtPeriodEnd && (
            <>
              <Button onClick={handleCancel} disabled={actionLoading} variant="outlined">{actionLoading ? t("pages.gsetup.subscriptionBilling.processing") : t("pages.gsetup.subscriptionBilling.cancel")}</Button>
              <Button onClick={() => setPlanDialogOpen(true)} disabled={actionLoading || !canRenewActive} variant="contained">{t("pages.gsetup.subscriptionBilling.changePlan")}</Button>
            </>
          )}
          {status === "active" && cancelAtPeriodEnd && (
            <Button onClick={() => setPlanDialogOpen(true)} disabled={actionLoading || !canRenewActive} variant="contained">
              {t("pages.gsetup.subscriptionBilling.renewReactivate")}
            </Button>
          )}
          {isTrial && <Button onClick={() => setPlanDialogOpen(true)} disabled={actionLoading} variant="contained">{t("pages.gsetup.subscriptionBilling.choosePaidPlan")}</Button>}
          {status === "expired" && <Button onClick={() => setPlanDialogOpen(true)} disabled={actionLoading} variant="contained">{t("pages.gsetup.subscriptionBilling.renew")}</Button>}
        </Stack>

        <Box>
          <Typography sx={{ fontSize: 18, fontWeight: 800, mb: 1.5 }}>
            {t("pages.gsetup.subscriptionBilling.paymentHistory")}
          </Typography>
          {payments.length === 0 ? (
            <Typography sx={{ color: theme.subtext }}>{t("pages.gsetup.subscriptionBilling.noPayments")}</Typography>
          ) : (
            <TableContainer sx={{ border: `1px solid ${theme.border}`, borderRadius: 2, overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t("pages.gsetup.subscriptionBilling.plan")}</TableCell>
                    <TableCell>{t("pages.gsetup.subscriptionBilling.amount")}</TableCell>
                    <TableCell>{t("pages.gsetup.subscriptionBilling.status")}</TableCell>
                    <TableCell>{t("pages.gsetup.subscriptionBilling.paymentMethod")}</TableCell>
                    <TableCell>{t("pages.gsetup.subscriptionBilling.createdAt")}</TableCell>
                    <TableCell>{t("pages.gsetup.subscriptionBilling.period")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell sx={{ textTransform: "capitalize" }}>{payment.subscriptionPlan}</TableCell>
                      <TableCell>{formatAmount(payment.amount)}</TableCell>
                      <TableCell><Chip size="small" label={payment.status} color={payment.status === "paid" ? "success" : payment.status === "failed" ? "error" : "default"} sx={{ textTransform: "capitalize" }} /></TableCell>
                      <TableCell>{payment.paymentMethod ?? "—"}</TableCell>
                      <TableCell>{formatDate(payment.createdAt)}</TableCell>
                      <TableCell>{payment.subscriptionStart && payment.subscriptionEnd ? `${formatDate(payment.subscriptionStart)} – ${formatDate(payment.subscriptionEnd)}` : "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Stack>
      <SubscriptionPlanDialog
        open={planDialogOpen}
        onClose={() => setPlanDialogOpen(false)}
        onComplete={loadData}
      />
    </SettingsPanel>
  );
}

export default function SubscriptionBillingPage() {
  const { t } = useTranslation();
  return <GeneralSetupSectionPage title={t("pages.gsetup.subscriptionBilling.title")} ContentComponent={SubscriptionBillingContent} />;
}
