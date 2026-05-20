import { useCallback, useMemo, useState, useRef, useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  MdChat,
  MdArrowBack,
  MdAttachFile,
  MdAccountCircle,
  MdSupportAgent,
  MdPerson,
  MdCheckCircle,
  MdDelete,
  MdKeyboardArrowDown,
} from "react-icons/md";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Checkbox,
} from "@mui/material";
import ChatBot from "../../../../components/ui/ChatBot";
import SearchBar from "../../../../components/ui/SearchBar";
import LoadingSpinner from "../../../../components/ui/LoadingSpinner";
import {
  getAllTickets,
  updateTicket,
  deleteTicket,
  getTicketComments,
  createTicketComment,
  getAttachmentDownloadUrl,
  uploadTicketAttachment,
  resolveTicket,
  getTechnicians,
} from "../../ticket.service";
import { getUsersByRole } from "../../../profile/profile.service";
import {
  getPriorityColor,
  getStatusColor,
  formatTicketDate,
} from "../../ticket.schema";

const STATUS_OPTIONS = ["Waiting", "Progress", "Solved"];
const PRIORITY_OPTIONS = ["Low", "Normal", "High", "Critical"];
const CS_AGENT_ROLE_ID = 2;

const ACTIVE_STATUS_SET = new Set(["active", "waiting", "progress"]);
const SOLVED_STATUS_SET = new Set(["solved", "completed"]);

function isSolvedStatus(status) {
  return SOLVED_STATUS_SET.has((status ?? "").toLowerCase());
}

function InlineDropdown({ value, options, onSelect, colorFn, disabled = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const display = value ?? "-";

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
          background: "transparent",
          border: "1px solid #fde4d4",
          borderRadius: "6px",
          padding: "4px 10px",
          color: colorFn ? colorFn(display) : "#333",
          fontWeight: "600",
          fontSize: "13px",
          cursor: disabled ? "default" : "pointer",
          transition: "border-color 0.15s",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => {
          if (!disabled) e.currentTarget.style.borderColor = "#FF8040";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#fde4d4";
        }}
      >
        {display}
        {!disabled && (
          <MdKeyboardArrowDown
            size={14}
            color="#FF8040"
            style={{
              transform: open ? "rotate(180deg)" : "none",
              transition: "transform 0.2s",
              flexShrink: 0,
            }}
          />
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            zIndex: 1000,
            background: "white",
            border: "1px solid #fde4d4",
            borderRadius: "8px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.14)",
            minWidth: "160px",
            maxHeight: "200px",
            overflowY: "auto",
          }}
        >
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onSelect(opt);
                setOpen(false);
              }}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "9px 14px",
                border: "none",
                background: opt === display ? "#FFF5EF" : "transparent",
                color: colorFn ? colorFn(opt) : "#333",
                fontWeight: opt === display ? "700" : "500",
                fontSize: "13px",
                cursor: "pointer",
                borderBottom: "1px solid #fdf2ec",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#FFF5EF";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  opt === display ? "#FFF5EF" : "transparent";
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function sortTicketsFn(list, ob, o) {
  return [...list].sort((a, b) => {
    let aValue = a[ob];
    let bValue = b[ob];

    if (ob === "createdAt") {
      aValue = new Date(aValue ?? 0).getTime();
      bValue = new Date(bValue ?? 0).getTime();
    }
    if (ob === "id") {
      aValue = Number(aValue);
      bValue = Number(bValue);
    }

    if (aValue == null) aValue = "";
    if (bValue == null) bValue = "";
    if (typeof aValue === "string") aValue = aValue.toLowerCase();
    if (typeof bValue === "string") bValue = bValue.toLowerCase();

    if (aValue < bValue) return o === "asc" ? -1 : 1;
    if (aValue > bValue) return o === "asc" ? 1 : -1;
    return 0;
  });
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "14px",
          padding: "28px 32px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          maxWidth: "420px",
          width: "90%",
          border: "2px solid #FF8040",
        }}
      >
        <div
          style={{
            fontSize: "16px",
            fontWeight: "600",
            color: "#333",
            marginBottom: "22px",
            lineHeight: "1.5",
          }}
        >
          {message}
        </div>
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{
              padding: "8px 20px",
              borderRadius: "8px",
              border: "2px solid #ddd",
              background: "white",
              color: "#666",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: "8px 20px",
              borderRadius: "8px",
              border: "none",
              background: "#ef4444",
              color: "white",
              fontWeight: "700",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminTicketListPage({ mode = "active" }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const isSolvedMode = mode === "solved";

  const [chatOpen, setChatOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [resolvingTicket, setResolvingTicket] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [pageHistory, setPageHistory] = useState(["list"]);
  const currentPage = pageHistory[pageHistory.length - 1];

  const [orderBy, setOrderBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [savingField, setSavingField] = useState(null);

  const selectedTicketId = selectedTicket?.id ?? null;

  const navigateTo = useCallback((p) => setPageHistory((prev) => [...prev, p]), []);
  const navigateBack = useCallback(
    () => setPageHistory((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev)),
    [],
  );

  const { data: tickets = [], isLoading: loading } = useQuery({
    queryKey: ["all-tickets"],
    queryFn: getAllTickets,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const { data: csAgents = [] } = useQuery({
    queryKey: ["users-by-role", CS_AGENT_ROLE_ID],
    queryFn: () => getUsersByRole(CS_AGENT_ROLE_ID),
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  const { data: technicians = [] } = useQuery({
    queryKey: ["technicians"],
    queryFn: getTechnicians,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  const {
    data: comments = [],
    isLoading: commentsLoading,
    isError: commentsError,
  } = useQuery({
    queryKey: ["ticket-comments", selectedTicketId],
    queryFn: () => getTicketComments(selectedTicketId),
    enabled: Boolean(selectedTicketId) && currentPage === "detail",
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });

  useQuery({
    queryKey: ["ticket-attachments", selectedTicketId],
    queryFn: async () => selectedTicket?.attachments ?? [],
    enabled: Boolean(selectedTicketId) && currentPage === "detail",
    staleTime: 0,
  });

  const { mutateAsync: submitComment } = useMutation({
    mutationFn: (message) => createTicketComment(selectedTicketId, message),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["ticket-comments", selectedTicketId] }),
  });

  const csAgentOptions = useMemo(
    () => ["Unassigned", ...csAgents.map((a) => a.name).filter(Boolean)],
    [csAgents],
  );

  const technicianOptions = useMemo(
    () => ["Unassigned", ...technicians.map((item) => item.name).filter(Boolean)],
    [technicians],
  );

  const filteredTickets = useMemo(() => {
    if (isSolvedMode) {
      return tickets.filter((ticket) => isSolvedStatus(ticket.status));
    }
    return tickets.filter((ticket) => ACTIVE_STATUS_SET.has((ticket.status ?? "").toLowerCase()));
  }, [tickets, isSolvedMode]);

  const sortedTickets = useMemo(
    () => sortTicketsFn(filteredTickets, orderBy, order),
    [filteredTickets, orderBy, order],
  );

  const safePage = useMemo(
    () => Math.min(page, Math.max(0, Math.ceil(sortedTickets.length / rowsPerPage) - 1)),
    [page, rowsPerPage, sortedTickets.length],
  );

  const paginatedTickets = useMemo(
    () =>
      sortedTickets.slice(
        safePage * rowsPerPage,
        safePage * rowsPerPage + rowsPerPage,
      ),
    [rowsPerPage, safePage, sortedTickets],
  );

  const allPageSelected =
    paginatedTickets.length > 0 && paginatedTickets.every((ticket) => selectedIds.has(ticket.id));
  const someSelected = selectedIds.size > 0;

  const toggleSelectAll = () => {
    if (allPageSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginatedTickets.forEach((ticket) => next.delete(ticket.id));
        return next;
      });
      return;
    }

    setSelectedIds((prev) => {
      const next = new Set(prev);
      paginatedTickets.forEach((ticket) => next.add(ticket.id));
      return next;
    });
  };

  const toggleOne = (id) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleDeleteSelected = () => {
    setConfirmDialog({
      message: t("pages.agentTicket.confirmDeleteSelected", { count: selectedIds.size }),
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          await Promise.all([...selectedIds].map((id) => deleteTicket(id)));
          setSelectedIds(new Set());
          queryClient.invalidateQueries({ queryKey: ["all-tickets"] });
        } catch (err) {
          console.error("Delete failed:", err);
          alert(t("pages.agentTicket.errors.deleteSome"));
        }
      },
    });
  };

  const handleFieldUpdate = async (field, value) => {
    if (!selectedTicket) return;

    try {
      setSavingField(field);
      const payload = { [field]: value ?? "" };
      await updateTicket(selectedTicket.id, payload);
      setSelectedTicket((prev) => ({ ...prev, [field]: value }));
      queryClient.invalidateQueries({ queryKey: ["all-tickets"] });
    } catch (err) {
      console.error("Failed to update field:", err);
      alert("Failed to update. Please try again.");
    } finally {
      setSavingField(null);
    }
  };

  const handleRequestSort = useCallback(
    (property) => {
      setOrder((prev) => (orderBy === property && prev === "asc" ? "desc" : "asc"));
      setOrderBy(property);
      setPage(0);
    },
    [orderBy],
  );

  const handleViewAttachment = async (attachmentId) => {
    if (!selectedTicketId) return;

    try {
      setDownloadingId(attachmentId);
      const result = await getAttachmentDownloadUrl(selectedTicketId, attachmentId);
      if (!result.signedUrl) throw new Error("No signed URL");
      window.open(result.signedUrl, "_blank");
    } catch {
      alert("Failed to open attachment. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleResolveTicket = async () => {
    if (!selectedTicket) return;

    setConfirmDialog({
      message: "Mark this ticket as Solved?",
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          setResolvingTicket(true);
          const result = await resolveTicket(selectedTicket.id);
          setSelectedTicket((prev) => ({
            ...prev,
            status: "Solved",
            resolvedAt: result.resolvedAt,
          }));
          queryClient.invalidateQueries({ queryKey: ["all-tickets"] });
        } catch {
          alert("Failed to resolve ticket.");
        } finally {
          setResolvingTicket(false);
        }
      },
    });
  };

  const openTicketDetail = (ticket) => {
    setSelectedTicket(ticket);
    setResponseText("");
    setAttachment(null);
    navigateTo("detail");
  };

  const handleSubmitResponse = async (e) => {
    e.preventDefault();

    const message = responseText.trim();
    if (!message && !attachment) return;

    try {
      setSubmitting(true);
      let newCommentId = null;

      if (message) {
        const result = await submitComment(message);
        newCommentId = result?.id ?? null;
      }

      if (attachment) {
        await uploadTicketAttachment(selectedTicketId, attachment, newCommentId);
        const updatedTickets = await queryClient.fetchQuery({
          queryKey: ["all-tickets"],
          queryFn: getAllTickets,
          staleTime: 0,
        });
        const refreshed = updatedTickets.find((ticket) => ticket.id === selectedTicketId);
        if (refreshed) setSelectedTicket(refreshed);
      }

      if (selectedTicket.status === "Waiting") {
        await updateTicket(selectedTicket.id, { status: "Progress" });
        setSelectedTicket((prev) => ({ ...prev, status: "Progress" }));
        queryClient.invalidateQueries({ queryKey: ["all-tickets"] });
      }

      setResponseText("");
      setAttachment(null);
    } catch {
      alert("Failed to submit response.");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { id: "id", label: t("pages.agentTicket.columns.ticketId") },
    { id: "subject", label: t("pages.agentTicket.columns.subject") },
    { id: "priority", label: t("pages.agentTicket.columns.priority") },
    { id: "status", label: t("pages.agentTicket.columns.status") },
    { id: "solver", label: t("pages.agentTicket.columns.assignedTo") },
    { id: "createdAt", label: t("pages.agentTicket.columns.createdAt") },
  ];

  const pageTitle = isSolvedMode ? "Solved Tickets" : "Active Tickets";

  const SavingBadge = ({ field }) =>
    savingField === field ? (
      <span style={{ color: "#aaa", fontSize: "11px", fontWeight: "400" }}> (saving...)</span>
    ) : null;

  const renderTableHead = () => (
    <TableHead>
      <TableRow sx={{ borderBottom: "2px solid #f0f0f0" }}>
        <TableCell padding="checkbox" sx={{ width: "48px" }}>
          <Checkbox
            indeterminate={someSelected && !allPageSelected}
            checked={allPageSelected}
            onChange={toggleSelectAll}
            sx={{
              color: "#FF8040",
              "&.Mui-checked": { color: "#FF8040" },
              "&.MuiCheckbox-indeterminate": { color: "#FF8040" },
            }}
          />
        </TableCell>
        {columns.map(({ id, label }) => (
          <TableCell key={id} sx={{ color: "#FF8040", fontWeight: 700 }}>
            <TableSortLabel
              active={orderBy === id}
              direction={orderBy === id ? order : "asc"}
              onClick={() => handleRequestSort(id)}
              sx={{
                color: "#FF8040 !important",
                fontWeight: 700,
                "&.Mui-active": { color: "#FF8040 !important" },
                "& .MuiTableSortLabel-icon": { color: "#FF8040 !important" },
              }}
            >
              {label}
            </TableSortLabel>
          </TableCell>
        ))}
        <TableCell sx={{ color: "#FF8040", fontWeight: 700 }}>
          {t("pages.agentTicket.columns.action")}
        </TableCell>
      </TableRow>
    </TableHead>
  );

  const renderTicketRow = (ticket) => {
    const isChecked = selectedIds.has(ticket.id);
    const isAssignedToSelf = ticket.solver === "You";
    const isDispatched = ticket.solver && ticket.solver !== "Not yet" && !isAssignedToSelf;

    return (
      <TableRow
        key={ticket.id}
        sx={{
          borderBottom: "1px solid #f0f0f0",
          background: isChecked ? "#FFF5EF" : "transparent",
          transition: "background 0.15s",
        }}
      >
        <TableCell padding="checkbox">
          <Checkbox
            checked={isChecked}
            onChange={() => toggleOne(ticket.id)}
            sx={{ color: "#FF8040", "&.Mui-checked": { color: "#FF8040" } }}
          />
        </TableCell>
        <TableCell sx={{ color: "#666", fontSize: "13px" }}>{ticket.id}</TableCell>
        <TableCell>{ticket.subject}</TableCell>
        <TableCell sx={{ color: getPriorityColor(ticket.priority), fontWeight: 500 }}>
          {ticket.priority ?? "-"}
        </TableCell>
        <TableCell sx={{ color: getStatusColor(ticket.status), fontWeight: 600 }}>
          {ticket.status}
        </TableCell>
        <TableCell>
          {isDispatched ? (
            <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "#333" }}>
              <MdPerson size={16} /> {ticket.solver}
            </span>
          ) : isAssignedToSelf ? (
            <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "#FF8040" }}>
              <MdSupportAgent size={16} /> You
            </span>
          ) : (
            <span style={{ color: "#999", fontSize: "13px" }}>Unassigned</span>
          )}
        </TableCell>
        <TableCell>{formatTicketDate(ticket.createdAt)}</TableCell>
        <TableCell>
          <button
            onClick={() => openTicketDetail(ticket)}
            style={{
              background: "#FF8040",
              color: "white",
              border: "none",
              padding: "6px 14px",
              borderRadius: "6px",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            {t("pages.agentTicket.detail")}
          </button>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {confirmDialog && (
        <ConfirmDialog
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}

      <div
        style={{
          background: "white",
          padding: "15px 30px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
          height: "70px",
        }}
      >
        {pageHistory.length > 1 ? (
          <button
            onClick={navigateBack}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              color: "#FF8040",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            <MdArrowBack size={20} /> Back
          </button>
        ) : (
          <SearchBar />
        )}
      </div>

      <div style={{ padding: "30px", flex: 1, overflowY: "auto" }}>
        {currentPage === "detail" && selectedTicket && (
          <div style={{ maxWidth: "1020px", margin: "0 auto" }}>
            <div
              style={{
                background: "white",
                borderRadius: "14px",
                boxShadow: "0 8px 28px rgba(0,0,0,0.08)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  background: "linear-gradient(180deg, #FFF7F2 0%, #FFFFFF 100%)",
                  padding: "16px 22px",
                  borderBottom: "1px solid #f1f5f9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ color: "#FF8040", fontWeight: "700", fontSize: "14px" }}>
                  Ticket #{selectedTicket.id}
                </div>
                {!isSolvedStatus(selectedTicket.status) && (
                  <button
                    onClick={handleResolveTicket}
                    disabled={resolvingTicket}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 18px",
                      borderRadius: "8px",
                      border: "none",
                      background: resolvingTicket ? "#ccc" : "#FF8040",
                      color: "white",
                      fontWeight: "700",
                      fontSize: "14px",
                      cursor: resolvingTicket ? "not-allowed" : "pointer",
                    }}
                  >
                    <MdCheckCircle size={18} />
                    {resolvingTicket ? "Resolving..." : "Mark as Resolved"}
                  </button>
                )}
                {isSolvedStatus(selectedTicket.status) && (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      color: "#FF8040",
                      fontWeight: "700",
                      fontSize: "14px",
                    }}
                  >
                    <MdCheckCircle size={18} /> Resolved
                  </span>
                )}
              </div>

              <div style={{ padding: "24px" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr",
                    gap: "24px",
                    alignItems: "start",
                  }}
                >
                  <div style={{ padding: "12px 6px" }}>
                    <h2
                      style={{
                        fontSize: "24px",
                        fontWeight: "700",
                        marginBottom: "10px",
                        color: "#333",
                      }}
                    >
                      {selectedTicket.subject}
                    </h2>
                    <div
                      style={{
                        color: "#FF8040",
                        fontWeight: "600",
                        fontSize: "14px",
                        marginBottom: "6px",
                      }}
                    >
                      Description
                    </div>
                    <p
                      style={{
                        color: "#555",
                        lineHeight: "1.65",
                        marginBottom: "24px",
                      }}
                    >
                      {selectedTicket.description || "No description provided."}
                    </p>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                      <div>
                        <div
                          style={{
                            color: "#FF8040",
                            fontWeight: "600",
                            fontSize: "13px",
                            marginBottom: "6px",
                          }}
                        >
                          Created at
                        </div>
                        <div style={{ color: "#333" }}>
                          {formatTicketDate(selectedTicket.createdAt)}
                        </div>
                      </div>

                      <div>
                        <div
                          style={{
                            color: "#FF8040",
                            fontWeight: "600",
                            fontSize: "13px",
                            marginBottom: "6px",
                          }}
                        >
                          Priority <SavingBadge field="priority" />
                        </div>
                        <InlineDropdown
                          value={selectedTicket.priority ?? "Low"}
                          options={PRIORITY_OPTIONS}
                          onSelect={(v) => handleFieldUpdate("priority", v)}
                          colorFn={getPriorityColor}
                          disabled={isSolvedStatus(selectedTicket.status)}
                        />
                      </div>

                      <div>
                        <div
                          style={{
                            color: "#FF8040",
                            fontWeight: "600",
                            fontSize: "13px",
                            marginBottom: "6px",
                          }}
                        >
                          Status <SavingBadge field="status" />
                        </div>
                        <InlineDropdown
                          value={selectedTicket.status}
                          options={STATUS_OPTIONS}
                          onSelect={(v) => handleFieldUpdate("status", v)}
                          colorFn={getStatusColor}
                          disabled={isSolvedStatus(selectedTicket.status)}
                        />
                      </div>

                      <div>
                        <div
                          style={{
                            color: "#FF8040",
                            fontWeight: "600",
                            fontSize: "13px",
                            marginBottom: "4px",
                          }}
                        >
                          Customer
                        </div>
                        <div style={{ color: "#333", display: "flex", alignItems: "center", gap: "6px" }}>
                          <MdAccountCircle size={16} color="#FF8040" />
                          {selectedTicket.customer ?? "-"}
                        </div>
                      </div>

                      <div>
                        <div
                          style={{
                            color: "#FF8040",
                            fontWeight: "600",
                            fontSize: "13px",
                            marginBottom: "6px",
                          }}
                        >
                          Assigned To <SavingBadge field="solver" />
                        </div>
                        <InlineDropdown
                          value={selectedTicket.solver || "Unassigned"}
                          options={csAgentOptions}
                          onSelect={(v) => handleFieldUpdate("solver", v === "Unassigned" ? null : v)}
                          disabled={isSolvedStatus(selectedTicket.status)}
                        />
                      </div>

                      <div>
                        <div
                          style={{
                            color: "#FF8040",
                            fontWeight: "600",
                            fontSize: "13px",
                            marginBottom: "6px",
                          }}
                        >
                          Technician <SavingBadge field="technician" />
                        </div>
                        <InlineDropdown
                          value={selectedTicket.technician || "Unassigned"}
                          options={technicianOptions}
                          onSelect={(v) =>
                            handleFieldUpdate("technician", v === "Unassigned" ? null : v)
                          }
                          disabled={isSolvedStatus(selectedTicket.status)}
                        />
                      </div>

                      {selectedTicket.resolvedAt && (
                        <div>
                          <div
                            style={{
                              color: "#FF8040",
                              fontWeight: "600",
                              fontSize: "13px",
                              marginBottom: "4px",
                            }}
                          >
                            Resolved at
                          </div>
                          <div style={{ color: "#333" }}>
                            {formatTicketDate(selectedTicket.resolvedAt)}
                          </div>
                        </div>
                      )}
                    </div>

                    {!isSolvedStatus(selectedTicket.status) && (
                      <div
                        style={{
                          marginTop: "26px",
                          paddingTop: "20px",
                          borderTop: "1px solid #f1f5f9",
                        }}
                      >
                        <h3
                          style={{
                            fontSize: "20px",
                            fontWeight: "700",
                            marginBottom: "14px",
                            color: "#333",
                          }}
                        >
                          Add Response
                        </h3>
                        <form onSubmit={handleSubmitResponse}>
                          <textarea
                            rows={4}
                            placeholder="Write your response..."
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            style={{
                              width: "100%",
                              padding: "12px",
                              borderRadius: "8px",
                              border: "1px solid #ddd",
                              resize: "none",
                              fontSize: "14px",
                              outline: "none",
                              marginBottom: "10px",
                              boxSizing: "border-box",
                            }}
                          />
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: "12px",
                            }}
                          >
                            <label
                              style={{
                                color: "#FF8040",
                                fontWeight: "600",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                                fontSize: "14px",
                              }}
                            >
                              <MdAttachFile size={18} /> Attachment
                              <input
                                type="file"
                                style={{ display: "none" }}
                                onChange={(e) => setAttachment(e.target.files[0] ?? null)}
                              />
                            </label>
                            {attachment && (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  fontSize: "13px",
                                  color: "#555",
                                  background: "#FFF5EF",
                                  border: "1px solid #fde4d4",
                                  borderRadius: "6px",
                                  padding: "4px 10px",
                                }}
                              >
                                <MdAttachFile size={14} color="#FF8040" />
                                {attachment.name}
                                <button
                                  type="button"
                                  onClick={() => setAttachment(null)}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    color: "#999",
                                    fontSize: "16px",
                                    lineHeight: 1,
                                    padding: "0 2px",
                                  }}
                                >
                                  ×
                                </button>
                              </div>
                            )}
                          </div>
                          <button
                            type="submit"
                            disabled={submitting || (!responseText.trim() && !attachment)}
                            style={{
                              padding: "10px 30px",
                              borderRadius: "8px",
                              border: "none",
                              background: "#FF8040",
                              color: "white",
                              fontWeight: "600",
                              cursor:
                                submitting || (!responseText.trim() && !attachment)
                                  ? "not-allowed"
                                  : "pointer",
                              opacity:
                                submitting || (!responseText.trim() && !attachment)
                                  ? 0.7
                                  : 1,
                              fontSize: "14px",
                            }}
                          >
                            {submitting ? "Submitting..." : "Submit"}
                          </button>
                        </form>
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      background: "#fffdfb",
                      borderRadius: "14px",
                      padding: "22px",
                      border: "1px solid #fce6d8",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "18px",
                        fontWeight: "700",
                        marginBottom: "16px",
                        color: "#333",
                      }}
                    >
                      Timeline
                    </h3>
                    {commentsLoading ? (
                      <div style={{ textAlign: "center", padding: "16px 0" }}>
                        <LoadingSpinner />
                      </div>
                    ) : commentsError ? (
                      <div style={{ color: "#9ca3af", fontSize: "14px" }}>
                        Failed to load timeline.
                      </div>
                    ) : (
                      <div style={{ position: "relative", paddingLeft: "30px" }}>
                        {(() => {
                          const attachments = selectedTicket?.attachments ?? [];
                          const createdDate = new Date(selectedTicket?.createdAt);
                          const createdDateStr = Number.isNaN(createdDate.getTime())
                            ? "-"
                            : createdDate.toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              });
                          const createdTimeStr = Number.isNaN(createdDate.getTime())
                            ? "-"
                            : createdDate.toLocaleTimeString("en-GB", {
                                hour: "2-digit",
                                minute: "2-digit",
                              });
                          const ticketLevelAttachments = attachments.filter((a) => !a.commentId);
                          const allItems = [
                            { _type: "created" },
                            ...comments.map((c) => ({ _type: "comment", ...c })),
                            ...(isSolvedStatus(selectedTicket.status) && selectedTicket.resolvedAt
                              ? [{ _type: "resolved" }]
                              : []),
                          ];

                          return allItems.map((item, index) => {
                            const isLast = index === allItems.length - 1;

                            if (item._type === "created") {
                              return (
                                <div key="ticket-created" style={{ position: "relative", marginBottom: "18px" }}>
                                  {!isLast && (
                                    <div
                                      style={{
                                        position: "absolute",
                                        left: "-20px",
                                        top: "22px",
                                        bottom: "-20px",
                                        width: "2px",
                                        background: "#FF8040",
                                      }}
                                    />
                                  )}
                                  <div
                                    style={{
                                      position: "absolute",
                                      left: "-30px",
                                      top: "2px",
                                      width: "22px",
                                      height: "22px",
                                      borderRadius: "50%",
                                      background: "white",
                                      border: "2px solid #FF8040",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <MdPerson size={12} color="#FF8040" />
                                  </div>
                                  <div
                                    style={{
                                      border: "1px solid #fde4d4",
                                      borderRadius: "10px",
                                      padding: "10px 12px",
                                      background: "#fffdfb",
                                    }}
                                  >
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        gap: "8px",
                                        marginBottom: "4px",
                                      }}
                                    >
                                      <div
                                        style={{
                                          fontWeight: "600",
                                          fontSize: "13px",
                                          color: "#333",
                                        }}
                                      >
                                        {selectedTicket?.customer || "Customer"}
                                      </div>
                                      <div
                                        style={{
                                          fontSize: "11px",
                                          color: "#9ca3af",
                                          whiteSpace: "nowrap",
                                        }}
                                      >
                                        {createdDateStr} • {createdTimeStr}
                                      </div>
                                    </div>
                                    <div style={{ fontSize: "13px", color: "#555", lineHeight: "1.5" }}>
                                      Ticket created
                                    </div>
                                    {ticketLevelAttachments.length > 0 && (
                                      <div
                                        style={{
                                          marginTop: "8px",
                                          paddingTop: "8px",
                                          borderTop: "1px solid #fde4d4",
                                          display: "flex",
                                          flexDirection: "column",
                                          gap: "6px",
                                        }}
                                      >
                                        {ticketLevelAttachments.map((file) => (
                                          <AttachmentButton
                                            key={file.id}
                                            file={file}
                                            downloadingId={downloadingId}
                                            onView={() => handleViewAttachment(file.id)}
                                          />
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            }

                            if (item._type === "resolved") {
                              const rd = new Date(selectedTicket.resolvedAt);
                              const rdStr = Number.isNaN(rd.getTime())
                                ? "-"
                                : rd.toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                  });
                              const rtStr = Number.isNaN(rd.getTime())
                                ? "-"
                                : rd.toLocaleTimeString("en-GB", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  });
                              return (
                                <div key="ticket-resolved" style={{ position: "relative", marginBottom: "18px" }}>
                                  <div
                                    style={{
                                      position: "absolute",
                                      left: "-30px",
                                      top: "2px",
                                      width: "22px",
                                      height: "22px",
                                      borderRadius: "50%",
                                      background: "#FF8040",
                                      border: "2px solid #FF8040",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <MdCheckCircle size={13} color="white" />
                                  </div>
                                  <div
                                    style={{
                                      border: "1px solid #bbf7d0",
                                      borderRadius: "10px",
                                      padding: "10px 12px",
                                      background: "#f0fdf4",
                                    }}
                                  >
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        gap: "8px",
                                        marginBottom: "4px",
                                      }}
                                    >
                                      <div
                                        style={{
                                          fontWeight: "600",
                                          fontSize: "13px",
                                          color: "#16a34a",
                                        }}
                                      >
                                        Ticket Resolved
                                      </div>
                                      <div
                                        style={{
                                          fontSize: "11px",
                                          color: "#9ca3af",
                                          whiteSpace: "nowrap",
                                        }}
                                      >
                                        {rdStr} • {rtStr}
                                      </div>
                                    </div>
                                    <div
                                      style={{
                                        fontSize: "13px",
                                        color: "#15803d",
                                        lineHeight: "1.5",
                                      }}
                                    >
                                      Status changed to Solved
                                    </div>
                                  </div>
                                </div>
                              );
                            }

                            const commentDate = new Date(item.createdAt);
                            const dateStr = Number.isNaN(commentDate.getTime())
                              ? "-"
                              : commentDate.toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric",
                                });
                            const timeStr = Number.isNaN(commentDate.getTime())
                              ? "-"
                              : commentDate.toLocaleTimeString("en-GB", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                });
                            const isAgentReply =
                              selectedTicket?.solver &&
                              item.senderName &&
                              item.senderName === selectedTicket.solver;
                            const commentAttachments = attachments.filter(
                              (a) => a.commentId === item.id,
                            );

                            return (
                              <div key={item.id ?? index} style={{ position: "relative", marginBottom: "18px" }}>
                                {!isLast && (
                                  <div
                                    style={{
                                      position: "absolute",
                                      left: "-20px",
                                      top: "22px",
                                      bottom: "-20px",
                                      width: "2px",
                                      background: "#FF8040",
                                    }}
                                  />
                                )}
                                <div
                                  style={{
                                    position: "absolute",
                                    left: "-30px",
                                    top: "2px",
                                    width: "22px",
                                    height: "22px",
                                    borderRadius: "50%",
                                    background: isAgentReply ? "#FF8040" : "white",
                                    border: "2px solid #FF8040",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  {isAgentReply ? (
                                    <MdSupportAgent size={12} color="white" />
                                  ) : (
                                    <MdPerson size={12} color="#FF8040" />
                                  )}
                                </div>
                                <div
                                  style={{
                                    border: "1px solid #fde4d4",
                                    borderRadius: "10px",
                                    padding: "10px 12px",
                                    background: isAgentReply ? "#FF8040" : "#fffdfb",
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      gap: "8px",
                                      marginBottom: "4px",
                                    }}
                                  >
                                    <div
                                      style={{
                                        fontWeight: "600",
                                        fontSize: "13px",
                                        color: isAgentReply ? "white" : "#333",
                                      }}
                                    >
                                      {item.senderName || "Unknown sender"}
                                    </div>
                                    <div
                                      style={{
                                        fontSize: "11px",
                                        color: isAgentReply ? "rgba(255,255,255,0.75)" : "#9ca3af",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {dateStr} • {timeStr}
                                    </div>
                                  </div>
                                  <div
                                    style={{
                                      fontSize: "13px",
                                      color: isAgentReply ? "white" : "#555",
                                      lineHeight: "1.5",
                                      wordBreak: "break-word",
                                    }}
                                  >
                                    {item.message || "-"}
                                  </div>
                                  {commentAttachments.length > 0 && (
                                    <div
                                      style={{
                                        marginTop: "8px",
                                        paddingTop: "8px",
                                        borderTop: `1px solid ${
                                          isAgentReply ? "rgba(255,255,255,0.3)" : "#fde4d4"
                                        }`,
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "6px",
                                      }}
                                    >
                                      {commentAttachments.map((file) => (
                                        <AttachmentButton
                                          key={file.id}
                                          file={file}
                                          downloadingId={downloadingId}
                                          onView={() => handleViewAttachment(file.id)}
                                          isAgentReply={isAgentReply}
                                        />
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentPage === "list" && (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "25px",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <div style={{ fontSize: "28px", fontWeight: "700", color: "#333" }}>
                {pageTitle} <span style={{ color: "#FF8040" }}>• {sortedTickets.length}</span>
              </div>

              <button
                onClick={handleDeleteSelected}
                disabled={!someSelected}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "9px 18px",
                  borderRadius: "8px",
                  border: "2px solid",
                  borderColor: someSelected ? "#ef4444" : "#ddd",
                  background: someSelected ? "#fef2f2" : "#f9f9f9",
                  color: someSelected ? "#ef4444" : "#bbb",
                  fontWeight: "700",
                  fontSize: "13px",
                  cursor: someSelected ? "pointer" : "not-allowed",
                  transition: "all 0.2s",
                }}
              >
                <MdDelete size={16} />
                {t("pages.agentTicket.delete")} {someSelected ? `(${selectedIds.size})` : ""}
              </button>
            </div>

            <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              {loading ? (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <LoadingSpinner />
                </div>
              ) : (
                <Paper elevation={0} sx={{ borderRadius: "12px", overflow: "hidden" }}>
                  <TableContainer>
                    <Table>
                      {renderTableHead()}
                      <TableBody>
                        {paginatedTickets.map((ticket) => renderTicketRow(ticket))}
                        {sortedTickets.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={8} sx={{ textAlign: "center", py: 4, color: "#999" }}>
                              {t("pages.agentTicket.empty")}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    component="div"
                    count={sortedTickets.length}
                    page={safePage}
                    onPageChange={(_, p) => setPage(p)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                      setRowsPerPage(parseInt(e.target.value, 10));
                      setPage(0);
                    }}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                  />
                </Paper>
              )}
            </div>
          </>
        )}
      </div>

      <button
        onClick={() => setChatOpen(!chatOpen)}
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: "#FF8040",
          border: "none",
          color: "white",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(255, 128, 64, 0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MdChat size={28} />
      </button>
      <ChatBot isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}

export default function ActiveTicketPage() {
  return <AdminTicketListPage mode="active" />;
}

function AttachmentButton({ file, downloadingId, onView, isAgentReply = false }) {
  return (
    <button
      type="button"
      onClick={onView}
      disabled={downloadingId === file.id}
      style={{
        width: "100%",
        textAlign: "left",
        border: `1px solid ${isAgentReply ? "rgba(255,255,255,0.4)" : "#fde4d4"}`,
        borderRadius: "8px",
        background:
          downloadingId === file.id
            ? isAgentReply
              ? "rgba(255,255,255,0.15)"
              : "#fde4d4"
            : isAgentReply
              ? "rgba(255,255,255,0.12)"
              : "#fffaf7",
        padding: "8px 10px",
        cursor: downloadingId === file.id ? "not-allowed" : "pointer",
        opacity: downloadingId === file.id ? 0.6 : 1,
        display: "flex",
        alignItems: "center",
        gap: "8px",
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => {
        if (downloadingId !== file.id) {
          e.currentTarget.style.background = isAgentReply
            ? "rgba(255,255,255,0.22)"
            : "#fde4d4";
        }
      }}
      onMouseLeave={(e) => {
        if (downloadingId !== file.id) {
          e.currentTarget.style.background = isAgentReply
            ? "rgba(255,255,255,0.12)"
            : "#fffaf7";
        }
      }}
    >
      <MdAttachFile size={15} color={isAgentReply ? "white" : "#FF8040"} />
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            color: isAgentReply ? "white" : "#374151",
            fontWeight: "600",
            fontSize: "12px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {file.fileName ?? file.name ?? "Attachment"}
        </div>
        <div
          style={{
            color: isAgentReply ? "rgba(255,255,255,0.65)" : "#9ca3af",
            fontSize: "11px",
            marginTop: "1px",
          }}
        >
          {downloadingId === file.id ? "Loading..." : "Click to view"}
        </div>
      </div>
    </button>
  );
}
