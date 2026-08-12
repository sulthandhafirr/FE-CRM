import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmail } from "../login/login.service";
import { useAuth } from "../../../hooks/useAuth";
import { ROUTE } from "../../../app/routes";
import { getRegistrationPlans, getRegistrationStatus, registerCompany } from "./register.service";
import { PLANS } from "./plans";
import FormField from "./components/FormField";
import PlanPicker from "./components/PlanPicker";

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

  const selectedPlan = PLANS.find((item) => item.id === plan);

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const completeLogin = async () => {
    const result = await signInWithEmail(
      form.email,
      form.password,
      form.companyCode,
      setVerified
    );
    if (result.error) throw new Error(result.error.message);
    navigate(ROUTE.adminDashboard);
  };

  const waitForPayment = async (companyId) => {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      await wait(1500);
      const status = await getRegistrationStatus(companyId, form.companyCode);
      if (status.subscriptionStatus === "active") return;
    }
    throw new Error(
      "Payment succeeded, but activation is still processing. Please try signing in shortly."
    );
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
      setError(
        submitError?.response?.data?.message ||
          submitError.message ||
          "Registration failed."
      );
      setLoading(false);
    }
  };

  return (
    <div style={pageStyle}>
      <div
        style={{ ...cardStyle, maxWidth: step === 2 ? 860 : 460 }}
      >
        <button type="button" onClick={() => navigate(ROUTE.login)} style={backLinkStyle}>
          ← Back to login
        </button>
        <h1 style={titleStyle}>Create your CRM</h1>
        <p style={subtitleStyle}>
          {step === 1 ? "Step 1 of 2" : "Step 2 of 2"}
        </p>

        {step === 1 ? (
          <>
            <FormField label="Full Name" name="fullName" value={form.fullName} onChange={update} />
            <FormField label="Email" name="email" type="email" value={form.email} onChange={update} />
            <FormField label="Password" name="password" type="password" value={form.password} onChange={update} />
            <FormField label="Company Name" name="companyName" value={form.companyName} onChange={update} />
            <FormField label="Company Code" name="companyCode" value={form.companyCode} onChange={update} />
            <button type="button" onClick={() => setStep(2)} style={buttonStyle}>
              Continue
            </button>
          </>
        ) : (
          <>
            <PlanPicker value={plan} onChange={setPlan} prices={prices} />
            <div style={actionAreaStyle}>
              {error && <div style={errorStyle}>{error}</div>}
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
                style={backButtonStyle}
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

const pageStyle = {
  minHeight: "100dvh",
  display: "grid",
  placeItems: "center",
  background: "#FF8040",
  padding: "24px 20px",
};

const cardStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: 24,
  borderRadius: 16,
  background: "white",
  boxShadow: "0 20px 50px rgba(0,0,0,.18)",
};

const backLinkStyle = {
  border: 0,
  background: "transparent",
  color: "#6b7280",
  cursor: "pointer",
  padding: 0,
};

const titleStyle = {
  margin: "12px 0 4px",
  color: "#132440",
  fontSize: 24,
};

const subtitleStyle = {
  margin: "0 0 16px",
  color: "#718096",
  fontSize: 13,
};

const actionAreaStyle = { maxWidth: 460, margin: "0 auto" };

const errorStyle = {
  marginBottom: 14,
  padding: 10,
  borderRadius: 4,
  background: "#fee2e2",
  color: "#dc2626",
  fontSize: 13,
};

const buttonStyle = {
  width: "100%",
  padding: 10,
  border: 0,
  borderRadius: 4,
  background: "#132440",
  color: "white",
  cursor: "pointer",
  fontWeight: 600,
};

const backButtonStyle = {
  width: "100%",
  marginTop: 8,
  padding: 9,
  border: "1px solid #e5e7eb",
  borderRadius: 4,
  background: "white",
  color: "#374151",
  cursor: "pointer",
};
