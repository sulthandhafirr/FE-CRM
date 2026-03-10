const ROLE_COLOR = {
  ultrauser:  { bg: "#fef3c7", text: "#92400e" },
  cs_agent:   { bg: "#dbeafe", text: "#1e40af" },
  customer:   { bg: "#d1fae5", text: "#065f46" },
  technician: { bg: "#f3e8ff", text: "#6b21a8" },
  admin:      { bg: "#fee2e2", text: "#991b1b" },
};

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-ID", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function UserTable({ users, onEdit, onDelete }) {
  if (!users.length) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#9ca3af", fontSize: "14px" }}>
        No users found.
      </div>
    );
  }

  const thStyle = { padding: "12px 16px", textAlign: "left", color: "#FF8040", fontWeight: "700", fontSize: "13px", borderBottom: "2px solid #f3f4f6", whiteSpace: "nowrap" };
  const tdStyle = { padding: "14px 16px", fontSize: "14px", color: "#374151", borderBottom: "1px solid #f3f4f6" };

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {["Name", "Email", "Role", "Created At", "Actions"].map((h) => (
              <th key={h} style={thStyle}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const roleStyle = ROLE_COLOR[user.role] ?? { bg: "#f3f4f6", text: "#374151" };
            return (
              <tr key={user.id}>
                <td style={{ ...tdStyle, fontWeight: "600" }}>{user.name}</td>
                <td style={{ ...tdStyle, color: "#6b7280" }}>{user.email}</td>
                <td style={tdStyle}>
                  <span style={{ background: roleStyle.bg, color: roleStyle.text, padding: "3px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "600" }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ ...tdStyle, color: "#9ca3af", fontSize: "13px" }}>{formatDate(user.createdAt)}</td>
                <td style={tdStyle}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => onEdit(user)} style={{ padding: "5px 14px", borderRadius: "6px", border: "1.5px solid #FF8040", background: "white", color: "#FF8040", fontWeight: "600", cursor: "pointer", fontSize: "13px" }}>Edit</button>
                    <button onClick={() => onDelete(user)} style={{ padding: "5px 14px", borderRadius: "6px", border: "none", background: "#fee2e2", color: "#dc2626", fontWeight: "600", cursor: "pointer", fontSize: "13px" }}>Delete</button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
