import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import CompanyTable from "../components/CompanyTable";
import {
  getCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
} from "../company.service";
import { ROUTE } from "../../../../app/routes";

function CompanyModal({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    domain: initial?.domain ?? "",
  });

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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <label style={labelStyle}>Company Name</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Enter company name"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Domain (optional)</label>
          <input
            value={form.domain}
            onChange={(e) => setForm((p) => ({ ...p, domain: e.target.value }))}
            placeholder="e.g. acme.com"
            style={inputStyle}
          />
        </div>
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
          {loading ? "Saving..." : initial ? "Save Changes" : "Create Company"}
        </button>
      </div>
    </form>
  );
}

export default function CompanyListPage() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getCompanies();
      setCompanies(data);
    } catch (err) {
      setError(err?.response?.data?.message ?? "Failed to load companies.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleSubmit = async (data) => {
    try {
      setSubmitting(true);
      if (editingCompany) {
        await updateCompany(editingCompany.id, data);
      } else {
        await createCompany(data);
      }
      setFormOpen(false);
      setEditingCompany(null);
      await fetchCompanies();
    } catch (err) {
      alert(err?.response?.data?.message ?? "Operation failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (company) => {
    if (!confirm(`Delete company "${company.name}"? This cannot be undone.`)) return;
    try {
      await deleteCompany(company.id);
      await fetchCompanies();
    } catch (err) {
      alert(err?.response?.data?.message ?? "Delete failed.");
    }
  };

  return (
    <div
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        minHeight: "100vh",
        background: "#f9fafb",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "white",
          padding: "20px 40px",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <button
          onClick={() => navigate(ROUTE.ultrauserMenu)}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "#FF8040",
            fontSize: "20px",
            display: "flex",
            alignItems: "center",
            padding: 0,
          }}
        >
          ←
        </button>
        <div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "800",
              color: "#1a202c",
              margin: "0 0 2px 0",
            }}
          >
            Company Management
          </h1>
          <p style={{ color: "#718096", fontSize: "13px", margin: 0 }}>
            View and manage companies registered in the CRM system.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingCompany(null);
            setFormOpen(true);
          }}
          style={{
            marginLeft: "auto",
            background: "#FF8040",
            color: "white",
            border: "none",
            padding: "10px 24px",
            borderRadius: "8px",
            fontWeight: "700",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          + Add Company
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: "32px 40px" }}>
        {error && (
          <div
            style={{
              background: "#fee2e2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              padding: "12px 16px",
              borderRadius: "8px",
              marginBottom: "20px",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            overflow: "hidden",
          }}
        >
          {loading ? (
            <div
              style={{ textAlign: "center", padding: "60px", color: "#9ca3af" }}
            >
              Loading companies...
            </div>
          ) : (
            <CompanyTable
              companies={companies}
              onEdit={(company) => {
                setEditingCompany(company);
                setFormOpen(true);
              }}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>

      {/* Modal */}
      {formOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(16,24,40,0.35)",
            backdropFilter: "blur(2px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={(e) => e.target === e.currentTarget && setFormOpen(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "32px",
              width: "min(480px, 94vw)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
            }}
          >
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "800",
                color: "#1a202c",
                margin: "0 0 20px 0",
              }}
            >
              {editingCompany ? "Edit Company" : "Create New Company"}
            </h2>
            <CompanyModal
              initial={editingCompany}
              onSubmit={handleSubmit}
              onCancel={() => {
                setFormOpen(false);
                setEditingCompany(null);
              }}
              loading={submitting}
            />
          </div>
        </div>
      )}
    </div>
  );
}
