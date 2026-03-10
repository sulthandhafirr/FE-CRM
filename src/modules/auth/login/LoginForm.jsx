import { useState } from "react";
import { signInWithEmail } from "./login.service";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!companyId.trim()) {
      setError("Please enter Company ID");
      setLoading(false);
      return;
    }

    const { error: authError } = await signInWithEmail(email, password);

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
          Sign in
        </h2>
        <p style={{ color: "#718096", fontSize: "13px" }}>
          Please enter your Email, Password and Company ID
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
            Email
          </label>
          <input
            type="email"
            placeholder="Please enter your email."
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
            Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Please enter your password."
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
            Company id
          </label>
          <input
            type="text"
            placeholder="Please enter your Company ID."
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
            Show password
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
          onMouseOver={(e) => !loading && (e.target.style.borderColor = "#FF6B6B")}
          onMouseOut={(e) => (e.target.style.borderColor = "#e5e7eb")}
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        <div
          style={{
            textAlign: "center",
            fontSize: "12px",
            color: "#6b7280",
            marginTop: "8px",
          }}
        >
          Don&apos;t have account?{" "}
          <span style={{ color: "#374151", fontWeight: "600", cursor: "pointer" }}>
            Contact admin
          </span>
        </div>
      </form>
    </div>
  );
}
