import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { MdCheck, MdCheckCircle, MdLockOutline } from "react-icons/md";
import { useTranslation } from "react-i18next";
import { getSubscriptionPayment, getSubscriptionPlans, renewSubscription } from "./subscription.service";
import { PLANS } from "../../lib/plans";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const formatIdr = (amount) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount ?? 0);

const ACCENT = "#ff8040";
const ACCENT_HOVER = "#e6723a";

export default function SubscriptionPlanDialog({ open, onClose, onComplete, currentEnd, initialPlan }) {
  const { t } = useTranslation();
  const [plan, setPlan] = useState("monthly");
  const [prices, setPrices] = useState(null);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Sync the selected plan whenever the dialog is (re)opened, so
  // "Renew" preselects the current plan and "Change Plan" the other one.
  useEffect(() => {
    if (open) setPlan(initialPlan === "yearly" ? "yearly" : "monthly");
  }, [open, initialPlan]);

  useEffect(() => {
    if (!open) return undefined;
    let active = true;
    setPlansLoading(true);
    setPlansError("");
    getSubscriptionPlans()
      .then((data) => {
        if (active) setPrices(data);
      })
      .catch(() => {
        if (active) setPlansError(t("pages.gsetup.subscriptionBilling.dialog.plansFailed"));
      })
      .finally(() => {
        if (active) setPlansLoading(false);
      });
    return () => {
      active = false;
    };
  }, [open, t]);

  const waitForPayment = async (orderId) => {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      await wait(1500);
      try {
        const payment = await getSubscriptionPayment(orderId);
        if (payment.status === "paid") return payment;
        if (payment.status === "failed") throw new Error(t("pages.gsetup.subscriptionBilling.dialog.paymentFailed"));
      } catch (paymentError) {
        if (paymentError?.response?.status !== 404) throw paymentError;
      }
    }
    throw new Error(t("pages.gsetup.subscriptionBilling.dialog.activationPending"));
  };

  const submit = async () => {
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const result = await renewSubscription(plan);
      if (!window.snap) throw new Error(t("pages.gsetup.subscriptionBilling.dialog.paymentUnavailable"));

      window.snap.pay(result.snapToken, {
        onSuccess: async () => {
          try {
            await waitForPayment(result.midtransOrderId);
            await onComplete?.();
            onClose();
          } catch (paymentError) {
            setError(paymentError?.response?.data?.message || paymentError.message || t("pages.gsetup.subscriptionBilling.dialog.paymentFailed"));
            setLoading(false);
          }
        },
        onPending: () => {
          setError(t("pages.gsetup.subscriptionBilling.dialog.paymentPending"));
          setLoading(false);
        },
        onError: () => {
          setError(t("pages.gsetup.subscriptionBilling.dialog.paymentFailed"));
          setLoading(false);
        },
        // User closed the payment popup without completing it — allow retrying.
        onClose: () => {
          setLoading(false);
          setNotice(t("pages.gsetup.subscriptionBilling.dialog.paymentCancelled"));
        },
      });
    } catch (paymentError) {
      setError(paymentError?.response?.data?.message || paymentError.message || t("pages.gsetup.subscriptionBilling.dialog.paymentFailed"));
      setLoading(false);
    }
  };

  const monthlyAmount = prices?.monthlyAmount;
  const yearlyAmount = prices?.yearlyAmount;
  const yearlyPerMonth = yearlyAmount ? Math.round(yearlyAmount / 12) : null;
  const savingsPercent = monthlyAmount && yearlyAmount
    ? Math.max(0, Math.round((1 - yearlyAmount / (monthlyAmount * 12)) * 100))
    : 0;

  const cards = [
    {
      value: "monthly",
      name: t("pages.gsetup.subscriptionBilling.dialog.monthly"),
      billed: t("pages.gsetup.subscriptionBilling.dialog.billedMonthly"),
      price: monthlyAmount ? formatIdr(monthlyAmount) : t("pages.gsetup.subscriptionBilling.dialog.priceUnavailable"),
      perUnit: t("pages.gsetup.subscriptionBilling.dialog.perMonth"),
      hint: null,
      badge: null,
      benefits: PLANS.find((item) => item.id === "monthly")?.benefits ?? [],
    },
    {
      value: "yearly",
      name: t("pages.gsetup.subscriptionBilling.dialog.yearly"),
      billed: t("pages.gsetup.subscriptionBilling.dialog.billedYearly"),
      price: yearlyAmount ? formatIdr(yearlyAmount) : t("pages.gsetup.subscriptionBilling.dialog.priceUnavailable"),
      perUnit: t("pages.gsetup.subscriptionBilling.dialog.perYear"),
      hint: yearlyPerMonth
        ? t("pages.gsetup.subscriptionBilling.dialog.perMonthEquivalent", { price: formatIdr(yearlyPerMonth) })
        : null,
      badge: savingsPercent > 0
        ? t("pages.gsetup.subscriptionBilling.dialog.save", { percent: savingsPercent })
        : t("pages.gsetup.subscriptionBilling.dialog.bestValue"),
      benefits: PLANS.find((item) => item.id === "yearly")?.benefits ?? [],
    },
  ];

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: "20px" } }}
    >
      <DialogTitle sx={{ fontWeight: 800, fontSize: 20 }}>
        {t("pages.gsetup.subscriptionBilling.dialog.title")}
      </DialogTitle>
      <DialogContent sx={{ pt: "0 !important" }}>
        <Typography color="text.secondary" sx={{ mb: 2.5, fontSize: 13.5 }}>
          {t("pages.gsetup.subscriptionBilling.dialog.subtitle")}
        </Typography>

        {currentEnd && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {t("pages.gsetup.subscriptionBilling.dialog.activeNote", { date: currentEnd })}
          </Alert>
        )}

        {plansError && <Alert severity="error" sx={{ mb: 2 }}>{plansError}</Alert>}

        {plansLoading ? (
          <Stack alignItems="center" spacing={1.5} sx={{ py: 4 }}>
            <CircularProgress size={28} sx={{ color: ACCENT }} />
            <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
              {t("pages.gsetup.subscriptionBilling.dialog.loadingPlans")}
            </Typography>
          </Stack>
        ) : (
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            {cards.map((card) => {
              const selected = plan === card.value;
              return (
                <Box
                  key={card.value}
                  component="button"
                  type="button"
                  onClick={() => setPlan(card.value)}
                  disabled={loading}
                  sx={{
                    flex: 1,
                    textAlign: "left",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                    borderRadius: "16px",
                    border: `2px solid ${selected ? ACCENT : "#e5e7eb"}`,
                    background: selected ? "#fff7f0" : "#ffffff",
                    p: 2,
                    transition: "border-color .15s ease, box-shadow .15s ease, transform .15s ease",
                    "&:hover": {
                      borderColor: selected ? ACCENT : "#ffb38a",
                      transform: loading ? "none" : "translateY(-2px)",
                      boxShadow: selected ? "0 6px 18px rgba(255,128,64,.18)" : "0 6px 18px rgba(15,23,42,.06)",
                    },
                    "&:disabled": { opacity: 0.65, cursor: "not-allowed" },
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography sx={{ fontWeight: 800, fontSize: 15 }}>{card.name}</Typography>
                    {selected && <MdCheckCircle size={22} color={ACCENT} />}
                  </Stack>
                  <Typography sx={{ fontSize: 12, color: "#64748b", mt: 0.25 }}>{card.billed}</Typography>
                  <Box sx={{ mt: 1.5, display: "flex", alignItems: "baseline", gap: 0.5, flexWrap: "wrap" }}>
                    <Typography sx={{ fontSize: 22, fontWeight: 800, color: "#0f172a" }}>{card.price}</Typography>
                    <Typography sx={{ fontSize: 12, color: "#64748b" }}>{card.perUnit}</Typography>
                  </Box>
                  {card.hint && (
                    <Typography sx={{ fontSize: 12, color: "#64748b", mt: 0.25 }}>{card.hint}</Typography>
                  )}
                  {card.badge && (
                    <Chip
                      size="small"
                      label={card.badge}
                      sx={{ mt: 1, background: "#fff1eb", color: ACCENT, fontWeight: 800, fontSize: 11, height: 22 }}
                    />
                  )}
                  {card.benefits.length > 0 && (
                    <>
                      <Box sx={{ borderTop: "1px solid #eef2f7", my: 1.5 }} />
                      <Stack spacing={0.75}>
                        {card.benefits.map((benefit) => (
                          <Stack key={benefit} direction="row" spacing={0.75} alignItems="flex-start">
                            <MdCheck size={14} color={ACCENT} style={{ marginTop: 1, flexShrink: 0 }} />
                            <Typography sx={{ fontSize: 11.5, color: "#4b5563", lineHeight: 1.4 }}>
                              {benefit}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                    </>
                  )}
                </Box>
              );
            })}
          </Stack>
        )}

        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 2, color: "text.secondary" }}>
          <MdLockOutline size={15} />
          <Typography sx={{ fontSize: 12 }}>
            {t("pages.gsetup.subscriptionBilling.dialog.secureNote")}
          </Typography>
        </Stack>

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {notice && <Alert severity="info" sx={{ mt: 2 }}>{notice}</Alert>}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{ borderRadius: "12px", fontWeight: 800, color: "#374151" }}
        >
          {t("pages.gsetup.common.cancel")}
        </Button>
        <Button
          onClick={submit}
          disabled={loading || plansLoading}
          variant="contained"
          sx={{
            minHeight: 42,
            px: 3,
            borderRadius: "12px",
            background: ACCENT,
            color: "#fff",
            fontWeight: 800,
            "&:hover": { background: ACCENT_HOVER },
            "&:disabled": { background: "#f6c9a8", color: "#fff" },
          }}
        >
          {loading ? t("pages.gsetup.subscriptionBilling.dialog.processing") : t("pages.gsetup.subscriptionBilling.dialog.continue")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
