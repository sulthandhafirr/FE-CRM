import { useState } from "react";
import { useTranslation } from "react-i18next";
import { signInWithEmail } from "./login.service";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setVerified } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!companyId.trim()) {
      setError(t("pages.loginForm.errors.companyIdRequired"));
      setLoading(false);
      return;
    }

    const { error: authError } = await signInWithEmail(email, password, companyId, setVerified);

    if (authError) {
      setError(authError.message);
    }
    // On success, onAuthStateChange in AuthProvider triggers re-render
    // and the Router redirects to the role-based dashboard automatically.

    setLoading(false);
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "420px",
        padding: "20px 30px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ marginBottom: "24px", textAlign: "center" }}>
        <h2
          style={{
            fontSize: "28px",
            fontWeight: "700",
            marginBottom: "6px",
            color: "#1a202c",
          }}
        >
          {t("pages.loginForm.title")}
        </h2>
        <p style={{ color: "#718096", fontSize: "13px" }}>
          {t("pages.loginForm.subtitle")}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Email Input */}
        <div style={{ marginBottom: "14px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: "600",
              color: "#374151",
            }}
          >
            {t("pages.loginForm.fields.emailLabel")}
          </label>
          <input
            type="email"
            placeholder={t("pages.loginForm.fields.emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px 14px",
              fontSize: "14px",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              outline: "none",
              transition: "all 0.2s",
              fontFamily: "inherit",
              boxSizing: "border-box",
              background: "#f9fafb",
              color: "#111827",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#FF6B6B")}
            onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
          />
        </div>

        {/* Password Input */}
        <div style={{ marginBottom: "14px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: "600",
              color: "#374151",
            }}
          >
            {t("pages.loginForm.fields.passwordLabel")}
          </label>
          <input
            type={showPassword ? "text" : "password"}
            placeholder={t("pages.loginForm.fields.passwordPlaceholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px 14px",
              fontSize: "14px",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              outline: "none",
              transition: "all 0.2s",
              fontFamily: "inherit",
              boxSizing: "border-box",
              background: "#f9fafb",
              color: "#111827",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#FF6B6B")}
            onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
          />
        </div>

        {/* Company ID Input */}
        <div style={{ marginBottom: "14px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: "600",
              color: "#374151",
            }}
          >
            {t("pages.loginForm.fields.companyIdLabel")}
          </label>
          <input
            type="text"
            placeholder={t("pages.loginForm.fields.companyIdPlaceholder")}
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px 14px",
              fontSize: "14px",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              outline: "none",
              transition: "all 0.2s",
              fontFamily: "inherit",
              boxSizing: "border-box",
              background: "#f9fafb",
              color: "#111827",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#FF6B6B")}
            onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
          />
        </div>

        {/* Show Password Checkbox */}
        <div style={{ marginBottom: "14px" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              fontSize: "13px",
              color: "#374151",
              fontWeight: "500",
            }}
          >
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              style={{
                width: "16px",
                height: "16px",
                marginRight: "7px",
                cursor: "pointer",
                accentColor: "#FF6B6B",
              }}
            />
            {t("pages.loginForm.showPassword")}
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              padding: "10px",
              marginBottom: "14px",
              background: "#fee2e2",
              border: "1px solid #fecaca",
              borderRadius: "4px",
              color: "#dc2626",
              fontSize: "13px",
            }}
          >
            {error}
          </div>
        )}

        {/* Login Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "11px",
            fontSize: "15px",
            fontWeight: "600",
            color: "#374151",
            background: "white",
            border: "2px solid #e5e7eb",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.2s",
            fontFamily: "inherit",
            marginBottom: "10px",
          }}
          onMouseOver={(e) =>
            !loading && (e.target.style.borderColor = "#FF6B6B")
          }
          onMouseOut={(e) => (e.target.style.borderColor = "#e5e7eb")}
        >
          {loading
            ? t("pages.loginForm.signingIn")
            : t("pages.loginForm.login")}
        </button>

        <div
          style={{
            textAlign: "center",
            fontSize: "12px",
            color: "#6b7280",
            marginTop: "8px",
          }}
        >
          {t("pages.loginForm.noAccount")}{" "}
          <button
            type="button"
            onClick={() => navigate("/register")}
            style={{
              border: "none",
              background: "transparent",
              color: "#374151",
              fontWeight: "600",
              cursor: "pointer",
              padding: 0,
            }}
          >
            Register
          </button>
        </div>
      </form>
    </div>
  );
}
