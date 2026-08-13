import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import {
  MdAutorenew,
  MdEventAvailable,
  MdPayment,
  MdPayments,
  MdReceiptLong,
} from "react-icons/md";
import { useTranslation } from "react-i18next";
import GeneralSetupSectionPage, { SettingsPanel } from "../GeneralSetupSectionPage";
import { api } from "../../../lib/api/apiClient";
import {
  cancelSubscription,
  getSubscriptionPayments,
  getSubscriptionPlans,
  reactivateSubscription,
} from "../../subscription/subscription.service";
import SubscriptionPlanDialog from "../../subscription/SubscriptionPlanDialog";
import { ACCENT_BUTTON_SX, TABLE_HEADER_CELL_SX } from "../components/gsetup.styles";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";

const formatDate = (value) => value
  ? new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(new Date(value))
  : "—";

const formatAmount = (value) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value ?? 0);

const capitalize = (value) => value.replace("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());

function SummaryTile({ icon: Icon, label, value, theme }) {
  return (
    <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", minWidth: 0 }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: theme.iconBg,
          color: theme.accent,
          flexShrink: 0,
        }}
      >
        <Icon size={18} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: 11.5,
            fontWeight: 700,
            color: theme.subtext,
            textTransform: "uppercase",
            letterSpacing: ".03em",
          }}
        >
          {label}
        </Typography>
        <Typography sx={{ fontWeight: 800, fontSize: 15, color: theme.text, wordBreak: "break-word" }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

function SubscriptionBillingContent({ theme }) {
  const { t } = useTranslation();
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState(null);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [payments, setPayments] = useState([]);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [dialogInitialPlan, setDialogInitialPlan] = useState("monthly");

  const outlinedBtnSx = {
    borderRadius: "12px",
    fontWeight: 800,
    color: theme.text,
    borderColor: theme.border,
    "&:hover": { borderColor: theme.subtext, background: theme.inputHover },
  };
  const dangerOutlinedBtnSx = {
    borderRadius: "12px",
    fontWeight: 800,
    color: "#b91c1c",
    borderColor: "#fecaca",
    "&:hover": { borderColor: "#f87171", background: "#fef2f2" },
  };

  const openPlanDialog = (initialPlan) => {
    setDialogInitialPlan(initialPlan);
    setPlanDialogOpen(true);
  };

  const loadData = async () => {
    const [{ data }, history, planData] = await Promise.all([
      api.get("/api/company/settings/subscription"),
      getSubscriptionPayments(),
      getSubscriptionPlans(),
    ]);
    setSubscription(data);
    setPayments(history);
    setPlans(planData);
  };

  useEffect(() => {
    loadData().catch(() => setError(t("pages.gsetup.subscriptionBilling.loadFailed")));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  const status = (subscription?.status ?? "not_configured").toLowerCase();
  const plan = (subscription?.plan ?? "not_configured").toLowerCase();
  const isTrial = status === "trial" || plan === "trial";
  const cancelAtPeriodEnd = Boolean(subscription?.cancelAtPeriodEnd);

  const statusColor = status === "active" ? "success"
    : status === "expired" ? "error"
    : isTrial ? "warning"
    : status === "pending" ? "info"
    : "default";
  const statusLabel = status === "not_configured"
    ? t("pages.gsetup.subscriptionBilling.notConfigured")
    : capitalize(status);

  const currentPlan = plan === "monthly" || plan === "yearly" ? plan : "monthly";
  const otherPlan = currentPlan === "yearly" ? "monthly" : "yearly";

  const planLabel = isTrial
    ? t("pages.gsetup.subscriptionBilling.freeTrial")
    : plan === "not_configured"
      ? t("pages.gsetup.subscriptionBilling.notConfigured")
      : capitalize(plan);

  let priceLine = "—";
  if (isTrial) {
    priceLine = t("pages.gsetup.subscriptionBilling.free");
  } else if (plan === "monthly" && plans?.monthlyAmount) {
    priceLine = `${formatAmount(plans.monthlyAmount)}${t("pages.gsetup.subscriptionBilling.perMonth")}`;
  } else if (plan === "yearly" && plans?.yearlyAmount) {
    priceLine = `${formatAmount(plans.yearlyAmount)}${t("pages.gsetup.subscriptionBilling.perYear")}`;
  }

  return (
    <SettingsPanel
      theme={theme}
      icon={MdPayment}
      title={t("pages.gsetup.subscriptionBilling.title")}
      subtitle={t("pages.gsetup.subscriptionBilling.subtitle")}
    >
      {error ? (
        <Alert severity="error">{error}</Alert>
      ) : !subscription ? (
        <LoadingSpinner />
      ) : (
        <Stack spacing={2.5}>
          {actionError && <Alert severity="error" onClose={() => setActionError("")}>{actionError}</Alert>}

          {/* Summary hero card */}
          <Box
            sx={{
              borderRadius: "18px",
              border: `1px solid ${theme.border}`,
              background: "linear-gradient(135deg, #fff7f0 0%, #ffffff 55%)",
              overflow: "hidden",
            }}
          >
            <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
              >
                <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: theme.iconBg,
                      color: theme.accent,
                      flexShrink: 0,
                    }}
                  >
                    <MdPayment size={24} />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: 11.5,
                        fontWeight: 700,
                        color: theme.subtext,
                        textTransform: "uppercase",
                        letterSpacing: ".03em",
                      }}
                    >
                      {t("pages.gsetup.subscriptionBilling.plan")}
                    </Typography>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1}
                      alignItems={{ xs: "flex-start", sm: "center" }}
                      sx={{ mt: 0.25 }}
                    >
                      <Typography sx={{ fontSize: 22, fontWeight: 800, color: theme.text, lineHeight: 1.2 }}>
                        {planLabel}
                      </Typography>
                      {!isTrial && priceLine !== "—" && (
                        <Chip
                          size="small"
                          label={priceLine}
                          sx={{ fontWeight: 800, background: theme.iconBg, color: theme.accent, height: 26 }}
                        />
                      )}
                    </Stack>
                  </Box>
                </Stack>

                <Box sx={{ flexShrink: 0 }}>
                  <Chip
                    label={statusLabel}
                    color={statusColor}
                    sx={{ fontWeight: 800, textTransform: "capitalize", px: 0.5 }}
                  />
                </Box>
              </Stack>

              {/* Summary tiles */}
              <Box
                sx={{
                  mt: 2.5,
                  pt: 2.5,
                  borderTop: `1px dashed ${theme.border}`,
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" },
                  gap: { xs: 2, sm: 3 },
                }}
              >
                <SummaryTile
                  icon={MdAutorenew}
                  label={t("pages.gsetup.subscriptionBilling.billingCycle")}
                  value={planLabel}
                  theme={theme}
                />
                <SummaryTile
                  icon={MdPayments}
                  label={t("pages.gsetup.subscriptionBilling.price")}
                  value={isTrial ? t("pages.gsetup.subscriptionBilling.free") : priceLine}
                  theme={theme}
                />
                <SummaryTile
                  icon={MdEventAvailable}
                  label={isTrial ? t("pages.gsetup.subscriptionBilling.trialEnds") : t("pages.gsetup.subscriptionBilling.subscriptionEnds")}
                  value={formatDate(subscription.subscriptionEnd)}
                  theme={theme}
                />
              </Box>
            </Box>
          </Box>

          {isTrial && (
            <Alert severity="info" sx={{ borderRadius: "12px" }}>
              {t("pages.gsetup.subscriptionBilling.trialInfo", { date: formatDate(subscription.subscriptionEnd) })}
            </Alert>
          )}
          {status === "expired" && (
            <Alert severity="warning" sx={{ borderRadius: "12px" }}>
              {t("pages.gsetup.subscriptionBilling.expiredInfo")}
            </Alert>
          )}
          {status === "active" && cancelAtPeriodEnd && (
            <Alert severity="warning" sx={{ borderRadius: "12px" }}>
              {t("pages.gsetup.subscriptionBilling.cancelledInfo", { date: formatDate(subscription.subscriptionEnd) })}
            </Alert>
          )}

          {/* Actions */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} flexWrap="wrap">
            {status === "active" && !cancelAtPeriodEnd && (
              <>
                <Button
                  onClick={() => openPlanDialog(otherPlan)}
                  disabled={actionLoading}
                  variant="contained"
                  sx={{ ...ACCENT_BUTTON_SX(theme), color: "white", px: 2.5 }}
                >
                  {t("pages.gsetup.subscriptionBilling.changePlan")}
                </Button>
                <Button
                  onClick={() => openPlanDialog(currentPlan)}
                  disabled={actionLoading}
                  variant="outlined"
                  sx={outlinedBtnSx}
                >
                  {t("pages.gsetup.subscriptionBilling.renew")}
                </Button>
                <Button
                  onClick={handleCancel}
                  disabled={actionLoading}
                  variant="outlined"
                  sx={dangerOutlinedBtnSx}
                >
                  {actionLoading ? t("pages.gsetup.subscriptionBilling.processing") : t("pages.gsetup.subscriptionBilling.cancel")}
                </Button>
              </>
            )}
            {status === "active" && cancelAtPeriodEnd && (
              <>
                <Button
                  onClick={() => runAction(reactivateSubscription)}
                  disabled={actionLoading}
                  variant="contained"
                  sx={{ ...ACCENT_BUTTON_SX(theme), color: "white", px: 2.5 }}
                >
                  {t("pages.gsetup.subscriptionBilling.reactivate")}
                </Button>
                <Button
                  onClick={() => openPlanDialog(currentPlan)}
                  disabled={actionLoading}
                  variant="outlined"
                  sx={outlinedBtnSx}
                >
                  {t("pages.gsetup.subscriptionBilling.renew")}
                </Button>
                <Button
                  onClick={() => openPlanDialog(otherPlan)}
                  disabled={actionLoading}
                  variant="outlined"
                  sx={outlinedBtnSx}
                >
                  {t("pages.gsetup.subscriptionBilling.changePlan")}
                </Button>
              </>
            )}
            {isTrial && (
              <Button
                onClick={() => openPlanDialog("monthly")}
                disabled={actionLoading}
                variant="contained"
                sx={{ ...ACCENT_BUTTON_SX(theme), color: "white", px: 2.5 }}
              >
                {t("pages.gsetup.subscriptionBilling.choosePaidPlan")}
              </Button>
            )}
            {status === "expired" && (
              <Button
                onClick={() => openPlanDialog(currentPlan)}
                disabled={actionLoading}
                variant="contained"
                sx={{ ...ACCENT_BUTTON_SX(theme), color: "white", px: 2.5 }}
              >
                {t("pages.gsetup.subscriptionBilling.renew")}
              </Button>
            )}
            {status === "not_configured" && (
              <Button
                onClick={() => openPlanDialog("monthly")}
                disabled={actionLoading}
                variant="contained"
                sx={{ ...ACCENT_BUTTON_SX(theme), color: "white", px: 2.5 }}
              >
                {t("pages.gsetup.subscriptionBilling.choosePaidPlan")}
              </Button>
            )}
          </Stack>

          {/* Payment history */}
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
              <MdReceiptLong size={20} color={theme.accent} />
              <Typography sx={{ fontSize: 17, fontWeight: 800 }}>
                {t("pages.gsetup.subscriptionBilling.paymentHistory")}
              </Typography>
            </Stack>
            {payments.length === 0 ? (
              <Box
                sx={{
                  border: `1px dashed ${theme.border}`,
                  borderRadius: "16px",
                  p: 4,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                  textAlign: "center",
                  background: theme.inputHover,
                }}
              >
                <MdReceiptLong size={30} color={theme.subtext} />
                <Typography sx={{ color: theme.subtext, fontSize: 14 }}>
                  {t("pages.gsetup.subscriptionBilling.noPayments")}
                </Typography>
              </Box>
            ) : (
              <TableContainer sx={{ border: `1px solid ${theme.border}`, borderRadius: "16px", overflowX: "auto" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={TABLE_HEADER_CELL_SX(theme)}>{t("pages.gsetup.subscriptionBilling.plan")}</TableCell>
                      <TableCell sx={TABLE_HEADER_CELL_SX(theme)}>{t("pages.gsetup.subscriptionBilling.amount")}</TableCell>
                      <TableCell sx={TABLE_HEADER_CELL_SX(theme)}>{t("pages.gsetup.subscriptionBilling.status")}</TableCell>
                      <TableCell sx={TABLE_HEADER_CELL_SX(theme)}>{t("pages.gsetup.subscriptionBilling.paymentMethod")}</TableCell>
                      <TableCell sx={TABLE_HEADER_CELL_SX(theme)}>{t("pages.gsetup.subscriptionBilling.createdAt")}</TableCell>
                      <TableCell sx={TABLE_HEADER_CELL_SX(theme)}>{t("pages.gsetup.subscriptionBilling.period")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow
                        key={payment.id}
                        sx={{ "&:hover": { background: theme.inputHover }, "&:last-child td, &:last-child th": { border: 0 } }}
                      >
                        <TableCell sx={{ textTransform: "capitalize", fontWeight: 700 }}>
                          {payment.subscriptionPlan?.replace("_", " ")}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>{formatAmount(payment.amount)}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={payment.status}
                            color={payment.status === "paid" ? "success" : payment.status === "failed" ? "error" : "default"}
                            sx={{ textTransform: "capitalize", fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell>{payment.paymentMethod ?? "—"}</TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>{formatDate(payment.createdAt)}</TableCell>
                        <TableCell>
                          {payment.subscriptionStart && payment.subscriptionEnd
                            ? `${formatDate(payment.subscriptionStart)} – ${formatDate(payment.subscriptionEnd)}`
                            : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Stack>
      )}

      <SubscriptionPlanDialog
        open={planDialogOpen}
        onClose={() => setPlanDialogOpen(false)}
        onComplete={loadData}
        initialPlan={dialogInitialPlan}
        currentEnd={status === "active" && subscription?.subscriptionEnd ? formatDate(subscription.subscriptionEnd) : null}
      />
    </SettingsPanel>
  );
}

export default function SubscriptionBillingPage() {
  const { t } = useTranslation();
  return <GeneralSetupSectionPage title={t("pages.gsetup.subscriptionBilling.title")} ContentComponent={SubscriptionBillingContent} />;
}
