import { useState } from "react";

export default function UserForm({ initial = null, roles = [], onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    email: initial?.email ?? "",
    roleId: initial?.roleId ?? (roles[0]?.id ?? ""),
    password: "",
  });

  const isEdit = Boolean(initial);

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      roleId: Number(form.roleId),
    };
    if (!isEdit) {
      payload.email = form.email;
      payload.password = form.password;
    }
    onSubmit(payload);
  };

  const inputStyle = {
    width: "100%",
    padding: "9px 12px",
    fontSize: "14px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "6px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div>
          <label style={labelStyle}>Full Name</label>
          <input
            required
            value={form.name}
            onChange={handleChange("name")}
            placeholder="Enter full name"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Role</label>
          <select
            value={form.roleId}
            onChange={handleChange("roleId")}
            style={inputStyle}
          >
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.role}
              </option>
            ))}
          </select>
        </div>
        {!isEdit && (
          <>
            <div>
              <label style={labelStyle}>Email</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={handleChange("email")}
                placeholder="Enter email"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input
                required
                type="password"
                value={form.password}
                onChange={handleChange("password")}
                placeholder="Enter password"
                style={inputStyle}
              />
            </div>
          </>
        )}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "12px",
          marginTop: "24px",
        }}
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          style={{
            padding: "9px 22px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            background: "white",
            color: "#374151",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "9px 22px",
            borderRadius: "8px",
            border: "none",
            background: "#FF8040",
            color: "white",
            fontWeight: "700",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "14px",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Saving..." : isEdit ? "Save Changes" : "Create User"}
        </button>
      </div>
    </form>
  );
}
