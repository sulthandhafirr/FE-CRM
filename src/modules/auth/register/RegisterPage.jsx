import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmail } from "../login/login.service";
import { useAuth } from "../../../hooks/useAuth";
import { ROUTE } from "../../../app/routes";
import { getRegistrationPlans, getRegistrationStatus, registerCompany } from "./register.service";

const initialForm = {
  fullName: "",
  email: "",
  password: "",
  companyName: "",
  companyCode: "",
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const formatIdr = (amount) =>
  amount
    ? new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(amount)
    : "Price unavailable";

const yearlySavingsPercent = (prices) => {
  const { monthlyAmount, yearlyAmount } = prices;
  if (!monthlyAmount || !yearlyAmount) return null;
  const percent = Math.round(
    (1 - yearlyAmount / (monthlyAmount * 12)) * 100
  );
  return percent > 0 ? percent : null;
};

const PLANS = [
  {
    id: "trial",
    name: "Free Trial",
    price: () => "Free",
    period: (prices) => `for ${prices.trialDays ?? 14} days`,
    badge: () => "No payment required",
    submitLabel: "Start Free Trial",
    benefits: [
      "AI ticket classification & duplicate detection",
      "Ticket management across all roles",
      "Live monitoring dashboard",
      "Email support",
    ],
  },
  {
    id: "monthly",
    name: "Monthly",
    price: (prices) => formatIdr(prices.monthlyAmount),
    period: () => "/month",
    badge: () => null,
    submitLabel: "Continue to Payment",
    benefits: [
      "Everything in Free Trial",
      "SLA management & priority routing",
      "Performance & analytics reports",
      "Unlimited tickets & all team roles",
      "Priority email support",
      "Cancel anytime",
    ],
  },
  {
    id: "yearly",
    name: "Yearly",
    price: (prices) => formatIdr(prices.yearlyAmount),
    period: () => "/year",
    badge: (prices) => {
      const percent = yearlySavingsPercent(prices);
      return percent ? `Save ${percent}%` : "Best value";
    },
    submitLabel: "Continue to Payment",
    featured: true,
    benefits: [
      "Everything in Monthly",
      "Lowest price per month",
      "Priority email support",
      "Best value for growing teams",
    ],
  },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setVerified } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [plan, setPlan] = useState("trial");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [prices, setPrices] = useState({});

  useEffect(() => {
    getRegistrationPlans().then(setPrices).catch(() => {});
  }, []);

  const selectedPlan = PLANS.find((item) => item.id === plan);

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const completeLogin = async () => {
    const result = await signInWithEmail(form.email, form.password, form.companyCode, setVerified);
    if (result.error) throw new Error(result.error.message);
    navigate(ROUTE.adminDashboard);
  };

  const waitForPayment = async (companyId) => {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      await wait(1500);
      const status = await getRegistrationStatus(companyId, form.companyCode);
      if (status.subscriptionStatus === "active") return;
    }
    throw new Error("Payment succeeded, but activation is still processing. Please try signing in shortly.");
  };

  const submit = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await registerCompany({ ...form, subscriptionPlan: plan });

      if (!result.requiresPayment) {
        await completeLogin();
        return;
      }

      if (!window.snap) throw new Error("Payment service is unavailable.");

      window.snap.pay(result.snapToken, {
        onSuccess: async () => {
          try {
            await waitForPayment(result.companyId);
            await completeLogin();
          } catch (paymentError) {
            setError(paymentError.message);
            setLoading(false);
          }
        },
        onPending: () => {
          setError("Payment is pending. Complete the payment before signing in.");
          setLoading(false);
        },
        onError: () => {
          setError("Payment failed. Please try again.");
          setLoading(false);
        },
        onClose: () => setLoading(false),
      });
    } catch (submitError) {
      setError(submitError?.response?.data?.message || submitError.message || "Registration failed.");
      setLoading(false);
    }
  };

  const input = (name, label, type = "text") => (
    <label style={{ display: "block", marginBottom: 14, color: "#374151", fontSize: 14, fontWeight: 600 }}>
      {label}
      <input
        name={name}
        type={type}
        value={form[name]}
        onChange={update}
        required
        style={{ width: "100%", boxSizing: "border-box", marginTop: 7, padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 4, background: "#f9fafb", color: "#111827" }}
      />
    </label>
  );

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#FF8040", padding: "40px 20px" }}>
      <div style={{ width: "100%", maxWidth: step === 2 ? 800 : 460, boxSizing: "border-box", padding: 30, borderRadius: 16, background: "white", boxShadow: "0 20px 50px rgba(0,0,0,.18)" }}>
        <button type="button" onClick={() => navigate(ROUTE.login)} style={{ border: 0, background: "transparent", color: "#6b7280", cursor: "pointer", padding: 0 }}>← Back to login</button>
        <h1 style={{ margin: "18px 0 6px", color: "#132440", fontSize: 28 }}>Create your CRM</h1>
        <p style={{ margin: "0 0 22px", color: "#718096", fontSize: 13 }}>
          {step === 1 ? "Step 1 of 2" : "Step 2 of 2"}
        </p>

        {step === 1 ? (
          <>
            {input("fullName", "Full Name")}
            {input("email", "Email", "email")}
            {input("password", "Password", "password")}
            {input("companyName", "Company Name")}
            {input("companyCode", "Company Code")}
            <button type="button" onClick={() => setStep(2)} style={buttonStyle}>Continue</button>
          </>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 14,
                marginTop: 14,
                marginBottom: 20,
              }}
            >
              {PLANS.map((item) => {
                const isSelected = plan === item.id;
                return (
                  <label
                    key={item.id}
                    style={{
                      position: "relative",
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                      padding: "24px 20px 20px",
                      border: `1px solid ${isSelected ? "#FF8040" : "#e5e7eb"}`,
                      borderWidth: item.featured || isSelected ? 2 : 1,
                      borderRadius: 14,
                      background: isSelected ? "#fff8f3" : "white",
                      cursor: "pointer",
                      minHeight: 360,
                      boxShadow: isSelected
                        ? "0 8px 24px rgba(255,128,64,.12)"
                        : "0 2px 8px rgba(15,23,42,.04)",
                    }}
                  >
                    <input
                      type="radio"
                      name="plan"
                      value={item.id}
                      checked={isSelected}
                      onChange={(event) => setPlan(event.target.value)}
                      style={{
                        position: "absolute",
                        opacity: 0,
                        width: 0,
                        height: 0,
                      }}
                    />
                    {item.featured && (
                      <span
                        style={{
                          position: "absolute",
                          top: -12,
                          left: "50%",
                          transform: "translateX(-50%)",
                          background: "#FF8040",
                          color: "white",
                          fontSize: 10.5,
                          fontWeight: 700,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          padding: "4px 12px",
                          borderRadius: 999,
                          whiteSpace: "nowrap",
                          boxShadow: "0 4px 12px rgba(255,128,64,.35)",
                        }}
                      >
                        Most popular
                      </span>
                    )}
                    {isSelected && (
                      <span
                        style={{
                          position: "absolute",
                          top: 10,
                          right: 10,
                          color: "#FF8040",
                          fontWeight: 700,
                          fontSize: 15,
                          lineHeight: 1,
                        }}
                      >
                        ✓
                      </span>
                    )}
                    <span style={{ fontSize: 26, lineHeight: 1 }}>
                      {item.icon}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "#6b7280",
                      }}
                    >
                      {item.name}
                    </span>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 5,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 26,
                          fontWeight: 800,
                          color: "#132440",
                        }}
                      >
                        {item.price(prices)}
                      </span>
                      <span style={{ fontSize: 12, color: "#6b7280" }}>
                        {item.period(prices)}
                      </span>
                    </div>
                    {item.badge(prices) && (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#047857",
                          background: "#d1fae5",
                          padding: "2px 9px",
                          borderRadius: 999,
                          alignSelf: "flex-start",
                        }}
                      >
                        {item.badge(prices)}
                      </span>
                    )}
                    <div
                      style={{
                        borderTop: "1px solid #eef2f7",
                        margin: "6px 0 8px",
                      }}
                    />
                    <ul
                      style={{
                        margin: 0,
                        padding: 0,
                        listStyle: "none",
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        flex: 1,
                      }}
                    >
                      {item.benefits.map((benefit) => (
                        <li
                          key={benefit}
                          style={{
                            display: "flex",
                            gap: 8,
                            alignItems: "flex-start",
                            fontSize: 12.5,
                            color: "#4b5563",
                            lineHeight: 1.45,
                          }}
                        >
                          <span
                            style={{
                              color: "#FF8040",
                              fontWeight: 700,
                              lineHeight: "17px",
                            }}
                          >
                            ✓
                          </span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </label>
                );
              })}
            </div>
            <div style={{ maxWidth: 460, margin: "0 auto" }}>
              {error && (
                <div
                  style={{
                    marginBottom: 14,
                    padding: 10,
                    borderRadius: 4,
                    background: "#fee2e2",
                    color: "#dc2626",
                    fontSize: 13,
                  }}
                >
                  {error}
                </div>
              )}
              <button
                type="button"
                disabled={loading}
                onClick={submit}
                style={{ ...buttonStyle, opacity: loading ? 0.65 : 1 }}
              >
                {loading ? "Processing..." : selectedPlan?.submitLabel}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => setStep(1)}
                style={{
                  width: "100%",
                  marginTop: 10,
                  padding: 10,
                  border: "1px solid #e5e7eb",
                  borderRadius: 4,
                  background: "white",
                  color: "#374151",
                  cursor: "pointer",
                }}
              >
                Back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const buttonStyle = {
  width: "100%",
  padding: 11,
  border: 0,
  borderRadius: 4,
  background: "#132440",
  color: "white",
  cursor: "pointer",
  fontWeight: 600,
};
