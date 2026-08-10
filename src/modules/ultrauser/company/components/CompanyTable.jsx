const thStyle = {
  padding: "12px 16px",
  textAlign: "left",
  color: "#FF8040",
  fontWeight: "700",
  fontSize: "13px",
  borderBottom: "2px solid #f3f4f6",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "14px 16px",
  fontSize: "14px",
  color: "#374151",
  borderBottom: "1px solid #f3f4f6",
};

export default function CompanyTable({ companies, onEdit, onDelete }) {
  if (!companies.length) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#9ca3af", fontSize: "14px" }}>
        No companies found.
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {["ID", "Name", "Domain", "Users", "Created At", "Actions"].map((h) => (
              <th key={h} style={thStyle}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => (
            <tr key={company.id}>
              <td style={{ ...tdStyle, color: "#9ca3af", fontSize: "12px" }}>{company.id}</td>
              <td style={{ ...tdStyle, fontWeight: "600" }}>{company.name}</td>
              <td style={{ ...tdStyle, color: "#6b7280" }}>{company.domain || "—"}</td>
              <td style={tdStyle}>{company.userCount ?? "—"}</td>
              <td style={{ ...tdStyle, color: "#6b7280" }}>
                {company.createdAt
                  ? new Date(company.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
              </td>
              <td style={tdStyle}>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => onEdit(company)}
                    style={{
                      padding: "5px 14px",
                      borderRadius: "6px",
                      border: "1.5px solid #FF8040",
                      background: "white",
                      color: "#FF8040",
                      fontWeight: "600",
                      cursor: "pointer",
                      fontSize: "13px",
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(company)}
                    style={{
                      padding: "5px 14px",
                      borderRadius: "6px",
                      border: "none",
                      background: "#fee2e2",
                      color: "#dc2626",
                      fontWeight: "600",
                      cursor: "pointer",
                      fontSize: "13px",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
