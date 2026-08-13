import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Chip, CircularProgress, Stack, Typography } from "@mui/material";
import { MdCheck, MdCheckCircle, MdHourglassEmpty, MdLockOutline, MdWarningAmber } from "react-icons/md";
import { useTranslation } from "react-i18next";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import { ROUTE } from "../../app/routes";
import {
  getSubscriptionPlans,
  getSubscriptionPayment,
  renewSubscription,
} from "./subscription.service";
import { PLANS } from "../../lib/plans";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const formatIdr = (amount) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount ?? 0);

const ACCENT = "#ff8040";
const ACCENT_HOVER = "#e6723a";
const TEXT = "#111827";
const SUBTEXT = "#4b5563";
const BORDER = "#e5e7eb";

export default function SubscriptionRenewalModal() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { subscriptionStatus, setSubscriptionStatus } = useAuth();
  const [plan, setPlan] = useState("monthly");
  const [prices, setPrices] = useState({});
  const [plansLoading, setPlansLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const isPending = subscriptionStatus === "pending";
  const show = subscriptionStatus === "expired" || isPending;

  useEffect(() => {
    if (!show) return undefined;
    let active = true;
    setPlansLoading(true);
    getSubscriptionPlans()
      .then((data) => {
        if (active) setPrices(data);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setPlansLoading(false);
      });
    return () => {
      active = false;
    };
  }, [show]);

  if (!show) return null;

  const waitForActivation = async (orderId) => {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      await wait(1500);
      try {
        const payment = await getSubscriptionPayment(orderId);
        if (payment.status === "paid") return;
        if (payment.status === "failed") throw new Error(t("pages.subscriptionRenewal.paymentFailed"));
      } catch (paymentError) {
        if (paymentError?.response?.status !== 404) throw paymentError;
      }
    }
    throw new Error(t("pages.subscriptionRenewal.activationPending"));
  };

  const pay = async () => {
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const result = await renewSubscription(plan);
      if (!window.snap) throw new Error(t("pages.subscriptionRenewal.paymentUnavailable"));

      window.snap.pay(result.snapToken, {
        onSuccess: async () => {
          try {
            await waitForActivation(result.midtransOrderId);
            setSubscriptionStatus("active");
          } catch (activationError) {
            setError(activationError.message);
            setLoading(false);
          }
        },
        onPending: () => {
          setError(t("pages.subscriptionRenewal.paymentPending"));
          setLoading(false);
        },
        onError: () => {
          setError(t("pages.subscriptionRenewal.paymentFailed"));
          setLoading(false);
        },
        // User closed the payment popup without completing it — allow retrying.
        onClose: () => {
          setLoading(false);
          setNotice(t("pages.subscriptionRenewal.paymentCancelled"));
        },
      });
    } catch (paymentError) {
      setError(paymentError?.response?.data?.message || paymentError.message || t("pages.subscriptionRenewal.paymentFailed"));
      setLoading(false);
    }
  };

  const returnToLogin = async () => {
    await supabase.auth.signOut();
    navigate(ROUTE.login);
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
      name: t("pages.subscriptionRenewal.monthly"),
      billed: t("pages.subscriptionRenewal.billedMonthly"),
      price: monthlyAmount ? formatIdr(monthlyAmount) : t("pages.subscriptionRenewal.priceUnavailable"),
      perUnit: t("pages.subscriptionRenewal.perMonth"),
      hint: null,
      badge: null,
      benefits: PLANS.find((item) => item.id === "monthly")?.benefits ?? [],
    },
    {
      value: "yearly",
      name: t("pages.subscriptionRenewal.yearly"),
      billed: t("pages.subscriptionRenewal.billedYearly"),
      price: yearlyAmount ? formatIdr(yearlyAmount) : t("pages.subscriptionRenewal.priceUnavailable"),
      perUnit: t("pages.subscriptionRenewal.perYear"),
      hint: yearlyPerMonth
        ? t("pages.subscriptionRenewal.perMonthEquivalent", { price: formatIdr(yearlyPerMonth) })
        : null,
      badge: savingsPercent > 0
        ? t("pages.subscriptionRenewal.save", { percent: savingsPercent })
        : t("pages.subscriptionRenewal.bestValue"),
      benefits: PLANS.find((item) => item.id === "yearly")?.benefits ?? [],
    },
  ];

  return (
    <Box
      role="dialog"
      aria-modal="true"
      aria-labelledby="subscription-renewal-title"
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "grid",
        placeItems: "center",
        p: 2,
        background: "rgba(15, 23, 42, .72)",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 560,
          borderRadius: "20px",
          background: "#fff",
          boxShadow: "0 24px 60px rgba(0,0,0,.28)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 3,
            background: "linear-gradient(135deg, #fff7f0 0%, #ffffff 60%)",
            borderBottom: "1px solid #f3e7dc",
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#fff1eb",
                color: ACCENT,
                flexShrink: 0,
              }}
            >
              {isPending ? <MdHourglassEmpty size={26} /> : <MdWarningAmber size={26} />}
            </Box>
            <Box>
              <Typography
                id="subscription-renewal-title"
                sx={{ fontSize: 20, fontWeight: 800, color: TEXT, lineHeight: 1.3 }}
              >
                {isPending ? t("pages.subscriptionRenewal.pendingTitle") : t("pages.subscriptionRenewal.title")}
              </Typography>
              <Typography sx={{ fontSize: 13.5, color: SUBTEXT, mt: 0.5, lineHeight: 1.5 }}>
                {isPending ? t("pages.subscriptionRenewal.pendingSubtitle") : t("pages.subscriptionRenewal.subtitle")}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Body */}
        <Box sx={{ p: 3 }}>
          {plansLoading ? (
            <Stack alignItems="center" spacing={1.5} sx={{ py: 3 }}>
              <CircularProgress size={28} sx={{ color: ACCENT }} />
              <Typography sx={{ color: SUBTEXT, fontSize: 13 }}>
                {t("pages.subscriptionRenewal.loadingPlans")}
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
                      border: `2px solid ${selected ? ACCENT : BORDER}`,
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
                      <Typography sx={{ fontWeight: 800, fontSize: 15, color: TEXT }}>{card.name}</Typography>
                      {selected && <MdCheckCircle size={22} color={ACCENT} />}
                    </Stack>
                    <Typography sx={{ fontSize: 12, color: SUBTEXT, mt: 0.25 }}>{card.billed}</Typography>
                    <Box sx={{ mt: 1.5, display: "flex", alignItems: "baseline", gap: 0.5, flexWrap: "wrap" }}>
                      <Typography sx={{ fontSize: 22, fontWeight: 800, color: TEXT }}>{card.price}</Typography>
                      <Typography sx={{ fontSize: 12, color: SUBTEXT }}>{card.perUnit}</Typography>
                    </Box>
                    {card.hint && (
                      <Typography sx={{ fontSize: 12, color: SUBTEXT, mt: 0.25 }}>{card.hint}</Typography>
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
                              <Typography sx={{ fontSize: 11.5, color: SUBTEXT, lineHeight: 1.4 }}>
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

          {error && (
            <Box
              sx={{
                mt: 2,
                p: 1.5,
                borderRadius: "10px",
                background: "#fee2e2",
                color: "#b91c1c",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {error}
            </Box>
          )}
          {notice && (
            <Box
              sx={{
                mt: 2,
                p: 1.5,
                borderRadius: "10px",
                background: "#e0f2fe",
                color: "#0369a1",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {notice}
            </Box>
          )}

          <Button
            onClick={pay}
            disabled={loading}
            fullWidth
            sx={{
              mt: 2.5,
              minHeight: 46,
              borderRadius: "12px",
              background: ACCENT,
              color: "#fff",
              fontWeight: 800,
              fontSize: 14.5,
              "&:hover": { background: ACCENT_HOVER },
              "&:disabled": { background: "#f6c9a8", color: "#fff" },
            }}
          >
            {loading ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={16} thickness={5} sx={{ color: "#fff" }} />
                <span>{t("pages.subscriptionRenewal.processing")}</span>
              </Stack>
            ) : (
              t("pages.subscriptionRenewal.renew", {
                plan: plan === "monthly"
                  ? t("pages.subscriptionRenewal.monthly")
                  : t("pages.subscriptionRenewal.yearly"),
              })
            )}
          </Button>

          <Button
            onClick={returnToLogin}
            disabled={loading}
            fullWidth
            variant="outlined"
            sx={{
              mt: 1.5,
              minHeight: 44,
              borderRadius: "12px",
              borderColor: "#d1d5db",
              color: "#374151",
              fontWeight: 700,
              "&:hover": { borderColor: "#9ca3af", background: "#f9fafb" },
            }}
          >
            {t("pages.subscriptionRenewal.returnToLogin")}
          </Button>

          <Stack direction="row" spacing={0.75} alignItems="center" justifyContent="center" sx={{ mt: 2, color: "#9ca3af" }}>
            <MdLockOutline size={14} />
            <Typography sx={{ fontSize: 12 }}>{t("pages.subscriptionRenewal.secureNote")}</Typography>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
