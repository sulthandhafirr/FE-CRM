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
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#FF8040", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 460, boxSizing: "border-box", padding: 30, borderRadius: 16, background: "white", boxShadow: "0 20px 50px rgba(0,0,0,.18)" }}>
        <button type="button" onClick={() => navigate(ROUTE.login)} style={{ border: 0, background: "transparent", color: "#6b7280", cursor: "pointer", padding: 0 }}>← Back to login</button>
        <h1 style={{ margin: "18px 0 6px", color: "#132440", fontSize: 28 }}>Create your CRM</h1>
        <p style={{ margin: "0 0 22px", color: "#718096", fontSize: 13 }}>Step {step} of 2</p>

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
            <div style={{ display: "grid", gap: 10, marginBottom: 20 }}>
              {["trial", "monthly", "yearly"].map((value) => (
                <label key={value} style={{ display: "flex", gap: 10, alignItems: "center", padding: 14, border: `1px solid ${plan === value ? "#FF8040" : "#e5e7eb"}`, borderRadius: 8, color: "#374151", cursor: "pointer" }}>
                  <input type="radio" name="plan" value={value} checked={plan === value} onChange={(event) => setPlan(event.target.value)} />
                  {value === "trial"
                    ? `Free Trial (${prices.trialDays ?? 14} days)`
                    : `${value === "monthly" ? "Monthly" : "Yearly"} — ${formatIdr(prices[`${value}Amount`])}`}
                </label>
              ))}
            </div>
            {error && <div style={{ marginBottom: 14, padding: 10, borderRadius: 4, background: "#fee2e2", color: "#dc2626", fontSize: 13 }}>{error}</div>}
            <button type="button" disabled={loading} onClick={submit} style={{ ...buttonStyle, opacity: loading ? 0.65 : 1 }}>{loading ? "Processing..." : plan === "trial" ? "Start Free Trial" : "Continue to Payment"}</button>
            <button type="button" disabled={loading} onClick={() => setStep(1)} style={{ width: "100%", marginTop: 10, padding: 10, border: "1px solid #e5e7eb", borderRadius: 4, background: "white", color: "#374151", cursor: "pointer" }}>Back</button>
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

const formatIdr = (amount) => amount ? new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
}).format(amount) : "Price unavailable";
