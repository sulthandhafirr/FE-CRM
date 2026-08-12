import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../hooks/useAuth";
import { ROUTE } from "../../../app/routes";
import { getPasswordChecks, passwordErrorKey } from "../../../utils/password";

const inputStyle = {
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
};

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isPasswordRecovery, user, name } = useAuth();

  // checking | ready | invalid
  const [status, setStatus] = useState(() => {
    if (isPasswordRecovery) return "ready";
    return (window.location.hash || "").includes("type=recovery")
      ? "checking"
      : "invalid";
  });
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Cadangan bila hash masih ada saat mount (token belum diproses)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setStatus("ready");
    });

    // Jeda singkat bila event tidak sempat terpanggil
    const timer = setTimeout(() => {
      setStatus((prev) => (prev === "checking" ? "ready" : prev));
    }, 1500);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const passwordChecks = getPasswordChecks(password, name, user?.email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const pwdErrorKey = passwordErrorKey(password, name, user?.email);
    if (pwdErrorKey) {
      setError(t(`pages.profile.${pwdErrorKey}`));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("pages.resetPassword.errors.mismatch"));
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message || t("pages.resetPassword.errors.updateFailed"));
      return;
    }

    setSuccess(true);
    await supabase.auth.signOut();
    setTimeout(() => navigate(ROUTE.login), 2500);
  };

  const renderContent = () => {
    if (status === "checking") {
      return (
        <p style={{ color: "#718096", fontSize: "13px", textAlign: "center" }}>
          {t("pages.resetPassword.checking")}
        </p>
      );
    }

    if (status === "invalid") {
      return (
        <div
          style={{
            padding: "12px",
            background: "#fee2e2",
            border: "1px solid #fecaca",
            borderRadius: "4px",
            color: "#dc2626",
            fontSize: "13px",
            lineHeight: 1.5,
          }}
        >
          {t("pages.resetPassword.invalidLink")}
        </div>
      );
    }

    if (success) {
      return (
        <div
          style={{
            padding: "12px",
            background: "#d1fae5",
            border: "1px solid #a7f3d0",
            borderRadius: "4px",
            color: "#047857",
            fontSize: "13px",
            lineHeight: 1.5,
          }}
        >
          {t("pages.resetPassword.success")}
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit}>
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
            {t("pages.resetPassword.newPasswordLabel")}
          </label>
          <input
            type={showPassword ? "text" : "password"}
            placeholder={t("pages.resetPassword.newPasswordPlaceholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "#FF6B6B")}
            onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
          />

          {password && (
            <div
              style={{
                marginTop: 8,
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              {passwordChecks.map((check) => (
                <div
                  key={check.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    color: check.ok ? "#10B981" : "#9CA3AF",
                  }}
                >
                  <span style={{ fontSize: 12 }}>{check.ok ? "✓" : "✗"}</span>
                  {t(`pages.profile.pwdCheck.${check.key}`)}
                </div>
              ))}
            </div>
          )}
        </div>

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
            {t("pages.resetPassword.confirmPasswordLabel")}
          </label>
          <input
            type={showPassword ? "text" : "password"}
            placeholder={t("pages.resetPassword.confirmPasswordPlaceholder")}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "#FF6B6B")}
            onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
          />
        </div>

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
            {t("pages.resetPassword.showPassword")}
          </label>
        </div>

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
          }}
          onMouseOver={(e) =>
            !loading && (e.target.style.borderColor = "#FF6B6B")
          }
          onMouseOut={(e) => (e.target.style.borderColor = "#e5e7eb")}
        >
          {loading
            ? t("pages.resetPassword.updating")
            : t("pages.resetPassword.updatePassword")}
        </button>
      </form>
    );
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#FF8040",
        padding: "24px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "28px 30px",
          boxSizing: "border-box",
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "0 18px 50px rgba(15,23,42,0.25)",
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
            {t("pages.resetPassword.title")}
          </h2>
          <p style={{ color: "#718096", fontSize: "13px" }}>
            {t("pages.resetPassword.subtitle")}
          </p>
        </div>

        {renderContent()}

        {(status === "invalid" || status === "ready") && !success && (
          <div
            style={{
              textAlign: "center",
              fontSize: "12px",
              color: "#6b7280",
              marginTop: "16px",
            }}
          >
            <span
              onClick={() => navigate(ROUTE.login)}
              style={{
                color: "#FF6B6B",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              {t("pages.resetPassword.backToLogin")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
