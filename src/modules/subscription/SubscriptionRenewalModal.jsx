import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import { ROUTE } from "../../app/routes";
import {
  getSubscriptionPlans,
  getSubscriptionStatus,
  renewSubscription,
} from "./subscription.service";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const formatIdr = (amount) => amount
  ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount)
  : "Price unavailable";

export default function SubscriptionRenewalModal() {
  const navigate = useNavigate();
  const { subscriptionStatus, setSubscriptionStatus } = useAuth();
  const [plan, setPlan] = useState("monthly");
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (subscriptionStatus === "expired" || subscriptionStatus === "pending")
      getSubscriptionPlans().then(setPrices).catch(() => {});
  }, [subscriptionStatus]);

  if (!["expired", "pending"].includes(subscriptionStatus)) return null;

  const waitForActivation = async () => {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      await wait(1500);
      const status = await getSubscriptionStatus();
      if (status.subscriptionStatus === "active") return;
    }
    throw new Error("Payment succeeded, but activation is still processing. Please try again shortly.");
  };

  const pay = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await renewSubscription(plan);
      if (!window.snap) throw new Error("Payment service is unavailable.");

      window.snap.pay(result.snapToken, {
        onSuccess: async () => {
          try {
            await waitForActivation();
            setSubscriptionStatus("active");
          } catch (activationError) {
            setError(activationError.message);
            setLoading(false);
          }
        },
        onPending: () => {
          setError("Payment is pending. Complete the payment before continuing.");
          setLoading(false);
        },
        onError: () => {
          setError("Payment failed. Please try again.");
          setLoading(false);
        },
        onClose: () => setLoading(false),
      });
    } catch (paymentError) {
      setError(paymentError?.response?.data?.message || paymentError.message || "Renewal failed.");
      setLoading(false);
    }
  };

  const returnToLogin = async () => {
    await supabase.auth.signOut();
    navigate(ROUTE.login);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="subscription-renewal-title"
      style={{ position: "fixed", inset: 0, zIndex: 1000, display: "grid", placeItems: "center", padding: 20, background: "rgba(15, 23, 42, .72)" }}
    >
      <div style={{ width: "100%", maxWidth: 520, padding: 30, borderRadius: 16, background: "white", boxShadow: "0 20px 50px rgba(0,0,0,.25)" }}>
        <h2 id="subscription-renewal-title" style={{ margin: "0 0 10px", color: "#111827" }}>Subscription expired</h2>
        <p style={{ margin: "0 0 22px", color: "#4b5563", lineHeight: 1.5 }}>
          Renew your subscription to continue using the CRM. Your company data and users are preserved.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          {[
            ["monthly", `Monthly — ${formatIdr(prices.monthlyAmount)}`],
            ["yearly", `Yearly — ${formatIdr(prices.yearlyAmount)}`],
          ].map(([value, label]) => (
            <button key={value} type="button" onClick={() => setPlan(value)} disabled={loading} style={{ padding: 14, borderRadius: 8, border: `2px solid ${plan === value ? "#FF8040" : "#e5e7eb"}`, background: plan === value ? "#fff7ed" : "white", color: "#111827", cursor: loading ? "not-allowed" : "pointer", fontWeight: 600 }}>
              {label}
            </button>
          ))}
        </div>

        {error && <div style={{ marginBottom: 14, padding: 10, borderRadius: 6, background: "#fee2e2", color: "#b91c1c", fontSize: 13 }}>{error}</div>}

        <button type="button" onClick={pay} disabled={loading} style={{ width: "100%", padding: 12, border: 0, borderRadius: 6, background: "#FF8040", color: "white", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "Processing..." : `Renew ${plan === "monthly" ? "Monthly" : "Yearly"}`}
        </button>
        <button type="button" onClick={returnToLogin} disabled={loading} style={{ width: "100%", marginTop: 10, padding: 11, border: "1px solid #d1d5db", borderRadius: 6, background: "white", color: "#374151", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>
          Return to Login
        </button>
      </div>
    </div>
  );
}
