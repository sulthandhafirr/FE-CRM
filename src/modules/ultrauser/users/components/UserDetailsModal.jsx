import React, { useState } from "react";

export default function UserDetailsModal({ user, onClose, onResetPassword }) {
  const [resetting, setResetting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  if (!user) return null;

  const handleReset = async () => {
    setError("");
    setResetting(true);
    try {
      await onResetPassword(user);
      // Do NOT expose any password in the UI. Show a generic success message instead.
      setSuccessMessage("Password has been reset. The user will receive instructions by email.");
    } catch (err) {
      setError(err?.message || "Failed to reset password");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(16,24,40,0.35)",
        backdropFilter: "blur(2px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1200,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: "white", borderRadius: 12, padding: 24, width: "min(640px, 94vw)", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
        <h3 style={{ margin: 0, marginBottom: 8, fontSize: 18, fontWeight: 800 }}>{user.name}</h3>
        <div style={{ color: "#6b7280", marginBottom: 16 }}>{user.email}</div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: "#666", marginBottom: 6, fontWeight: 600 }}>Role</div>
          <div style={{ fontSize: 14 }}>{user.role}</div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: "#666", marginBottom: 6, fontWeight: 600 }}>Created</div>
          <div style={{ fontSize: 14 }}>{new Date(user.createdAt).toLocaleString()}</div>
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 12, color: "#666", marginBottom: 6, fontWeight: 600 }}>Password</div>
          <div style={{ fontSize: 14, color: "#374151", marginBottom: 8 }}>
            <span style={{ color: "#9ca3af" }}>Password is not viewable for security reasons.</span>
          </div>
          {error && <div style={{ color: "#dc2626", marginBottom: 8 }}>{error}</div>}
          {successMessage && <div style={{ color: "#16a34a", marginBottom: 8 }}>{successMessage}</div>}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleReset} disabled={resetting} style={{ background: "#FF8040", color: "white", border: "none", padding: "10px 16px", borderRadius: 8, fontWeight: 700, cursor: resetting ? "default" : "pointer" }}>
              {resetting ? "Resetting..." : "Reset Password"}
            </button>
            <button onClick={onClose} style={{ background: "transparent", color: "#374151", border: "1px solid #e5e7eb", padding: "10px 16px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}
