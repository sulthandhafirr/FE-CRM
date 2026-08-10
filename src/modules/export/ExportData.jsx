import { useRef, useState } from "react";
import { MdOutlineFileDownload, MdClose, MdFileDownload } from "react-icons/md";
import * as XLSX from "xlsx";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";
import { exportTickets, exportUsers } from "./export.service";

export default function ExportData() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const dropdownRef = useRef(null);
  const [open, setOpen] = useState(false);

  const [inclTickets, setInclTickets] = useState(false);
  const [inclUsers, setInclUsers]     = useState(false);
  const [startDate, setStartDate]     = useState("");
  const [endDate, setEndDate]         = useState("");
  const [fileName, setFileName]       = useState("my_file");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [companyId, setCompanyId]     = useState(null);

  const fmt = (val) => (val == null ? "-" : val);

  const fmtDate = (val) => {
    if (!val) return "-";
    const d = new Date(val);
    return Number.isNaN(d.getTime()) ? "-" : d.toLocaleString("en-GB");
  };

  const buildTicketRows = (tickets) =>
    tickets.map((t) => ({
      "ID":                  t.id,
      "Created By":          fmt(t.customer_name),
      "Subject":             fmt(t.subject),
      "Description":         fmt(t.description),
      "Chosen Priority":     fmt(t.priority_label),
      "Status":              fmt(t.status),
      "First Response Time": fmtDate(t.first_response_at),
      "Resolved Time":       fmtDate(t.resolved_at),
      "Created Date":        fmtDate(t.created_at),
      "Assigned To":         fmt(t.agent_name),
      "Technician":          fmt(t.technician_name),
    }));

  const buildUserRows = (users) =>
    users.map((u) => ({
      "Name":         fmt(u.name),
      "Email":        fmt(u.email),
      "Role":         fmt(u.role?.role),
      "Position":     fmt(u.position),
      "Created Date": fmtDate(u.created_at),
    }));

  const autoWidth = (ws, rows) => {
    if (!rows.length) return;
    const keys = Object.keys(rows[0]);
    ws["!cols"] = keys.map((k) => ({
      wch: Math.max(k.length, ...rows.map((r) => String(r[k] ?? "").length)) + 2,
    }));
  };

  const downloadExcel = (ticketRows, userRows) => {
    const wb = XLSX.utils.book_new();
    if (inclTickets && ticketRows.length) {
      const ws = XLSX.utils.json_to_sheet(ticketRows);
      autoWidth(ws, ticketRows);
      XLSX.utils.book_append_sheet(wb, ws, "Tickets");
    }
    if (inclUsers && userRows.length) {
      const ws = XLSX.utils.json_to_sheet(userRows);
      autoWidth(ws, userRows);
      XLSX.utils.book_append_sheet(wb, ws, "Users");
    }
    const safeName = (fileName.trim() || "my_file").replace(/[^\w\-]/g, "_");
    XLSX.writeFile(wb, `${safeName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const fetchCompanyId = async () => {
    if (companyId) return companyId;
    if (!user?.id) return null;
    const { data } = await supabase
      .from("profile")
      .select("company_id")
      .eq("id", user.id)
      .single();
    const id = data?.company_id ?? null;
    if (id) setCompanyId(id);
    return id;
  };

  const canExport = inclTickets || inclUsers;

  const handleExport = async () => {
    if (!canExport) return;
    setLoading(true);
    setError("");
    try {
      const resolvedCompanyId = await fetchCompanyId();
      if (!resolvedCompanyId) {
        setError(t("pages.exportData.errors.noCompany"));
        setLoading(false);
        return;
      }

      let ticketRows = [];
      let userRows   = [];

      if (inclTickets) {
        const tickets = await exportTickets({ companyId: resolvedCompanyId, startDate, endDate });
        ticketRows = buildTicketRows(tickets);
      }
      if (inclUsers) {
        const users = await exportUsers({ companyId: resolvedCompanyId });
        userRows = buildUserRows(users);
      }

      if (!ticketRows.length && !userRows.length) {
        setError(t("pages.exportData.errors.noData"));
        return;
      }

      downloadExcel(ticketRows, userRows);
      setOpen(false);
    } catch (err) {
      console.error("Export error:", err);
      setError(err.message ?? t("pages.exportData.errors.failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setOpen(false);
    }
  };

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>

      <button
        onClick={() => setOpen((p) => !p)}
        onMouseEnter={(e) => { e.currentTarget.style.background = "#f5f5f5"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        style={{
          position: "relative", border: "none", background: "transparent",
          width: "48px", height: "48px", borderRadius: "12px",
          cursor: "pointer", display: "flex", alignItems: "center",
          justifyContent: "center", transition: "all 0.2s ease",
        }}
      >
        <MdOutlineFileDownload size={24} color="#ff7a33" />
      </button>

      {open && (
        <>
          <div
            onClick={handleBackdropClick}
            style={{ position: "fixed", inset: 0, zIndex: 9998 }}
          />
          <div
            style={{
              position: "fixed",
              top: "58px",
              right: window.innerWidth < 768 ? "16px" : "80px",
              width: "340px",
              maxWidth: "calc(100vw - 32px)",
              background: "white",
              borderRadius: "16px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
              border: "1px solid #eee",
              zIndex: 9999,
              animation: "fadeIn 0.2s ease",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div style={{
              padding: "18px 20px",
              borderBottom: "1px solid #f1f1f1",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#222" }}>
                  {t("pages.exportData.title")}
                </div>
                <div style={{ fontSize: "13px", color: "#888", marginTop: "2px" }}>
                  {t("pages.exportData.subtitle")}
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{ border: "none", background: "transparent", cursor: "pointer", color: "#999", display: "flex", alignItems: "center" }}
              >
                <MdClose size={20} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: "20px" }}>

              {/* File Name */}
              <div style={{ marginBottom: "18px" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>
                  {t("pages.exportData.fileName")}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="my_file"
                    style={{
                      flex: 1, padding: "8px 10px", borderRadius: "8px",
                      border: "1px solid #fde4d4", fontSize: "13px",
                      outline: "none", boxSizing: "border-box", color: "#333",
                    }}
                  />
                  <span style={{ fontSize: "12px", color: "#aaa", whiteSpace: "nowrap" }}>
                    _{new Date().toISOString().slice(0, 10)}.xlsx
                  </span>
                </div>
              </div>

              {/* Checkboxes */}
              <div style={{ marginBottom: "18px" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>
                  {t("pages.exportData.selectData")}
                </div>

                {[
                  { key: "ticket", label: t("pages.exportData.tickets"), checked: inclTickets, onChange: () => { setInclTickets((p) => !p); setError(""); } },
                  { key: "user",   label: t("pages.exportData.users"),   checked: inclUsers,   onChange: () => { setInclUsers((p) => !p);   setError(""); } },
                ].map(({ key, label, checked, onChange }) => (
                  <label
                    key={key}
                    style={{
                      display: "flex", alignItems: "center", gap: "10px",
                      padding: "10px 12px", borderRadius: "10px", cursor: "pointer",
                      background: checked ? "#fff8f4" : "transparent",
                      border: `1.5px solid ${checked ? "#ff7a33" : "#e5e7eb"}`,
                      marginBottom: "8px", transition: "all 0.15s",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={onChange}
                      style={{ accentColor: "#ff7a33", width: "16px", height: "16px", cursor: "pointer" }}
                    />
                    <span style={{ fontSize: "14px", fontWeight: checked ? 600 : 400, color: checked ? "#ff7a33" : "#333" }}>
                      {label}
                    </span>
                  </label>
                ))}
              </div>

              {/* Date Range */}
              <div style={{ marginBottom: "18px" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>
                  {t("pages.exportData.dateRange")}
                </div>

                {[
                  { id: "start", label: t("pages.exportData.startDate"), value: startDate, onChange: setStartDate },
                  { id: "end",   label: t("pages.exportData.endDate"),   value: endDate,   onChange: setEndDate   },
                ].map(({ id, label, value, onChange }) => (
                  <div key={id} style={{ marginBottom: "10px" }}>
                    <label style={{ display: "block", fontSize: "12px", color: inclTickets ? "#555" : "#bbb", fontWeight: 600, marginBottom: "4px" }}>
                      {label}
                    </label>
                    <input
                      type="date"
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                      disabled={!inclTickets}
                      style={{
                        width: "100%", padding: "8px 10px", borderRadius: "8px",
                        border: `1px solid ${inclTickets ? "#fde4d4" : "#e5e7eb"}`,
                        fontSize: "13px", outline: "none", boxSizing: "border-box",
                        background: inclTickets ? "white" : "#f9fafb",
                        color: inclTickets ? "#333" : "#bbb",
                        cursor: inclTickets ? "pointer" : "not-allowed",
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  background: "#fef2f2", border: "1px solid #fecaca",
                  borderRadius: "8px", padding: "8px 12px",
                  fontSize: "12px", color: "#dc2626", marginBottom: "14px",
                }}>
                  {error}
                </div>
              )}

              {/* Export Button */}
              <button
                onClick={handleExport}
                disabled={!canExport || loading}
                style={{
                  width: "100%", padding: "11px",
                  borderRadius: "10px", border: "none",
                  background: canExport && !loading ? "#ff7a33" : "#f0f0f0",
                  color: canExport && !loading ? "white" : "#bbb",
                  fontWeight: 700, fontSize: "14px",
                  cursor: canExport && !loading ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                  transition: "all 0.2s",
                }}
              >
                <MdFileDownload size={18} />
                {loading ? t("pages.exportData.exporting") : t("pages.exportData.download")}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}