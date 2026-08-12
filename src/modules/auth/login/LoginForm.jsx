import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { signInWithEmail, resetPassword } from "./login.service";
import { useAuth } from "../../../hooks/useAuth";
import { ROUTE } from "../../../app/routes";

// Cooldown kirim ulang link reset (detik) — hindari kena rate limit Supabase
const RESEND_COOLDOWN_SEC = 60;
// Limit email per jam Supabase (free tier ±30/jam) — reset kira-kira tiap 1 jam
const HOURLY_LIMIT_COOLDOWN_SEC = 3600;

export default function LoginForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState("login");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef(null);
  const { setVerified } = useAuth();

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

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (cooldown > 0) {
      // Blokir dari sisi aplikasi (bukan error dari Supabase)
      setError(
        t("pages.loginForm.errors.cooldown", { time: formatCooldown(cooldown) })
      );
      return;
    }

    if (!forgotEmail.trim()) {
      setError(t("pages.loginForm.errors.emailRequired"));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail.trim())) {
      setError(t("pages.loginForm.errors.emailInvalid"));
      return;
    }

    setForgotLoading(true);
    const { error: resetError } = await resetPassword(forgotEmail.trim());
    setForgotLoading(false);

    if (resetError) {
      // Simpan error mentah untuk debugging di console
      console.error("[resetPassword] error:", resetError);
      const rawMsg = resetError.message || "";
      const msg = rawMsg.toLowerCase();

      // 1) Cooldown singkat — Supabase menyebut durasinya ("after N seconds")
      const shortCooldownMatch = rawMsg.match(/after\s+(\d+)\s*seconds?/i);
      if (shortCooldownMatch) {
        const seconds = Math.min(parseInt(shortCooldownMatch[1], 10), 3600);
        startCooldown(seconds);
        setError(t("pages.loginForm.errors.rateLimited"));
        return;
      }

      // 2) Limit per jam ("Email rate limit exceeded" / "too many") —
      //    durasi reset tidak disebutkan, pakai 1 jam
      if (msg.includes("rate limit") || msg.includes("too many")) {
        startCooldown(HOURLY_LIMIT_COOLDOWN_SEC);
        setError(t("pages.loginForm.errors.hourlyLimit"));
        return;
      }

      setError(rawMsg || t("pages.loginForm.errors.resetFailed"));
      return;
    }

    setForgotSent(true);
    startCooldown();
  };

  const startCooldown = (seconds = RESEND_COOLDOWN_SEC) => {
    setCooldown(seconds);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Bersihkan interval countdown saat komponen unmount
  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  // Format durasi countdown agar mudah dibaca: "1 jam", "45 mnt 12 dtk", "10 dtk"
  const formatCooldown = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    if (h > 0) {
      return m > 0
        ? `${h} ${t("pages.loginForm.time.hours")} ${m} ${t("pages.loginForm.time.minutes")}`
        : `${h} ${t("pages.loginForm.time.hours")}`;
    }
    if (m > 0) {
      return s > 0
        ? `${m} ${t("pages.loginForm.time.minutes")} ${s} ${t("pages.loginForm.time.seconds")}`
        : `${m} ${t("pages.loginForm.time.minutes")}`;
    }
    return `${s} ${t("pages.loginForm.time.seconds")}`;
  };

  const openForgotView = () => {
    setView("forgot");
    setError("");
  };

  const closeForgotView = () => {
    setView("login");
    setError("");
    setForgotSent(false);
    setForgotEmail("");
  };

  const emailInputStyle = {
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

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "420px",
        padding: "20px 30px",
        boxSizing: "border-box",
      }}
    >
      {view === "forgot" ? (
        /* ============ FORGOT PASSWORD VIEW ============ */
        <>
          <div style={{ marginBottom: "24px", textAlign: "center" }}>
            <h2
              style={{
                fontSize: "28px",
                fontWeight: "700",
                marginBottom: "6px",
                color: "#1a202c",
              }}
            >
              {t("pages.loginForm.forgotTitle")}
            </h2>
            <p style={{ color: "#718096", fontSize: "13px" }}>
              {t("pages.loginForm.forgotSubtitle")}
            </p>
          </div>

          {forgotSent ? (
            <div
              style={{
                padding: "10px",
                marginBottom: "14px",
                background: "#d1fae5",
                border: "1px solid #a7f3d0",
                borderRadius: "4px",
                color: "#047857",
                fontSize: "13px",
                lineHeight: 1.5,
              }}
            >
              <div>{t("pages.loginForm.resetLinkSent")}</div>
              {cooldown > 0 && (
                <div style={{ marginTop: "6px", fontWeight: "600" }}>
                  {t("pages.loginForm.resendIn", {
                    time: formatCooldown(cooldown),
                  })}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleForgotSubmit}>
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
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  style={emailInputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#FF6B6B")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                />
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
                  <div>{error}</div>
                  {/* Countdown live: kapan bisa mencoba kirim lagi */}
                  {cooldown > 0 && (
                    <div style={{ marginTop: "6px", fontWeight: "600" }}>
                      {t("pages.loginForm.resendIn", {
                        time: formatCooldown(cooldown),
                      })}
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={forgotLoading || cooldown > 0}
                style={{
                  width: "100%",
                  padding: "11px",
                  fontSize: "15px",
                  fontWeight: "600",
                  color: "#374151",
                  background: "white",
                  border: "2px solid #e5e7eb",
                  borderRadius: "4px",
                  cursor: forgotLoading || cooldown > 0 ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  fontFamily: "inherit",
                }}
                onMouseOver={(e) =>
                  !forgotLoading &&
                  cooldown === 0 &&
                  (e.target.style.borderColor = "#FF6B6B")
                }
                onMouseOut={(e) => (e.target.style.borderColor = "#e5e7eb")}
              >
                {forgotLoading
                  ? t("pages.loginForm.sendingResetLink")
                  : cooldown > 0
                    ? `${t("pages.loginForm.sendResetLink")} (${formatCooldown(cooldown)})`
                    : t("pages.loginForm.sendResetLink")}
              </button>

              {/* Countdown live — tombol belum bisa diklik sampai hitung mundur habis */}
              {cooldown > 0 && (
                <div
                  style={{
                    textAlign: "center",
                    fontSize: "12px",
                    color: "#b45309",
                    marginTop: "8px",
                    fontWeight: "600",
                  }}
                >
                  {t("pages.loginForm.resendIn", {
                    time: formatCooldown(cooldown),
                  })}
                </div>
              )}
            </form>
          )}

          <div
            style={{
              textAlign: "center",
              fontSize: "12px",
              color: "#6b7280",
              marginTop: "16px",
            }}
          >
            <span
              onClick={closeForgotView}
              style={{
                color: "#FF6B6B",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              {t("pages.loginForm.backToLogin")}
            </span>
          </div>
        </>
      ) : (
        /* ============ LOGIN VIEW ============ */
        <>
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
                style={emailInputStyle}
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
                style={emailInputStyle}
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
                style={emailInputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#FF6B6B")}
                onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
              />
            </div>

            {/* Show Password + Forgot Password */}
            <div
              style={{
                marginBottom: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
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
              <span
                onClick={openForgotView}
                style={{
                  color: "#FF6B6B",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                {t("pages.loginForm.forgotPassword")}
              </span>
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
            onClick={() => navigate(ROUTE.register)}
            style={{
              border: "none",
              background: "transparent",
              color: "#374151",
              fontWeight: "600",
              cursor: "pointer",
              padding: 0,
              fontSize: "12px",
              textDecoration: "underline",
            }}
          >
            {t("pages.loginForm.register")}
          </button>
        </div>
      </form>
      </>
    )}
  </div>
  );
}
