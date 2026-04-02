import { useCallback, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  MdChat,
  MdArrowBack,
  MdAttachFile,
  MdAccountCircle,
  MdSupportAgent,
  MdPerson,
  MdDelete,
  MdDeleteSweep,
  MdOutlineFilterNone,
} from "react-icons/md";
import {
  Checkbox,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
} from "@mui/material";
import ChatBot from "../../../components/ui/ChatBot";
import SearchBar from "../../../components/ui/SearchBar";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import {
  getAllTickets,
  getTicketTimeline,
  addTimelineEntry,
  updateTicket,
  deleteTicket,
} from "../ticket.service";
import {
  getPriorityColor,
  getStatusColor,
  formatTicketDate,
} from "../ticket.schema";

// ── Pure sort helper (defined outside component — stable reference) ─────────
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

export default function AgentTicketPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // UI state
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [responseText, setResponseText] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Page state: "list" | "detail" | "duplicates"
  const [pageHistory, setPageHistory] = useState(["list"]);
  const currentPage = pageHistory[pageHistory.length - 1];
  const [duplicateSource, setDuplicateSource] = useState(null);

  // Helper navigate & back
  const navigateTo = useCallback((page) => {
    setPageHistory((prev) => [...prev, page]);
  }, []);

  const navigateBack = useCallback(() => {
    setPageHistory((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  // Main table state
  const [orderBy, setOrderBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Duplicate table state
  const [dupOrderBy, setDupOrderBy] = useState("createdAt");
  const [dupOrder, setDupOrder] = useState("desc");
  const [dupPage, setDupPage] = useState(0);
  const [dupRowsPerPage, setDupRowsPerPage] = useState(5);

  // Checkbox & delete state
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [deleting, setDeleting] = useState(false);

  // ── Data fetching ─────────────────────────────────────────────────────────
  const { data: tickets = [], isLoading: loading } = useQuery({
    queryKey: ["all-tickets"],
    queryFn: getAllTickets,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // ── Duplicate detection (stable with useCallback) ─────────────────────────
  const getDuplicates = useCallback(
    (ticket, allTickets) =>
      allTickets.filter(
        (t) =>
          t.id !== ticket.id &&
          t.subject?.trim().toLowerCase() ===
            ticket.subject?.trim().toLowerCase(),
      ),
    [],
  );

  // ── Sorted lists ──────────────────────────────────────────────────────────
  const sortedTickets = useMemo(
    () => sortTicketsFn(tickets, orderBy, order),
    [tickets, orderBy, order],
  );

  const sortedDuplicates = useMemo(() => {
    if (!duplicateSource) return [];
    return sortTicketsFn(
      getDuplicates(duplicateSource, tickets),
      dupOrderBy,
      dupOrder,
    );
  }, [duplicateSource, tickets, dupOrderBy, dupOrder, getDuplicates]);

  // ── Pagination — main list ────────────────────────────────────────────────
  const safePage = useMemo(() => {
    const maxPage = Math.max(
      0,
      Math.ceil(sortedTickets.length / rowsPerPage) - 1,
    );
    return Math.min(page, maxPage);
  }, [page, rowsPerPage, sortedTickets.length]);

  const paginatedTickets = useMemo(() => {
    const start = safePage * rowsPerPage;
    return sortedTickets.slice(start, start + rowsPerPage);
  }, [rowsPerPage, safePage, sortedTickets]);

  // ── Pagination — duplicates list ──────────────────────────────────────────
  const safeDupPage = useMemo(() => {
    const maxPage = Math.max(
      0,
      Math.ceil(sortedDuplicates.length / dupRowsPerPage) - 1,
    );
    return Math.min(dupPage, maxPage);
  }, [dupPage, dupRowsPerPage, sortedDuplicates.length]);

  const paginatedDuplicates = useMemo(() => {
    const start = safeDupPage * dupRowsPerPage;
    return sortedDuplicates.slice(start, start + dupRowsPerPage);
  }, [dupRowsPerPage, safeDupPage, sortedDuplicates]);

  // ── Checkbox helpers ──────────────────────────────────────────────────────
  const allVisibleIds = useMemo(
    () => paginatedDuplicates.map((t) => t.id),
    [paginatedDuplicates],
  );

  const allChecked = useMemo(
    () =>
      allVisibleIds.length > 0 &&
      allVisibleIds.every((id) => selectedIds.has(id)),
    [allVisibleIds, selectedIds],
  );

  const someChecked = useMemo(
    () => allVisibleIds.some((id) => selectedIds.has(id)) && !allChecked,
    [allVisibleIds, selectedIds, allChecked],
  );

  const toggleOne = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = allVisibleIds.every((id) => next.has(id));
      if (allSelected) {
        allVisibleIds.forEach((id) => next.delete(id));
      } else {
        allVisibleIds.forEach((id) => next.add(id));
      }
      return next;
    });
  }, [allVisibleIds]);

  // ── Sorting handlers ──────────────────────────────────────────────────────
  const handleRequestSort = useCallback(
    (property) => {
      setOrder((prev) =>
        orderBy === property && prev === "asc" ? "desc" : "asc",
      );
      setOrderBy(property);
      setPage(0);
    },
    [orderBy],
  );

  const handleDupSort = useCallback(
    (property) => {
      setDupOrder((prev) =>
        dupOrderBy === property && prev === "asc" ? "desc" : "asc",
      );
      setDupOrderBy(property);
      setDupPage(0);
    },
    [dupOrderBy],
  );

  // ── Delete handlers ───────────────────────────────────────────────────────
  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (
      !window.confirm(
        t("pages.agentTicket.confirmDeleteSelected", {
          count: selectedIds.size,
        }),
      )
    )
      return;
    try {
      setDeleting(true);
      await Promise.all([...selectedIds].map((id) => deleteTicket(id)));
      setSelectedIds(new Set());
      queryClient.invalidateQueries(["all-tickets"]);
    } catch (err) {
      console.error("Error deleting tickets:", err.message);
      alert(t("pages.agentTicket.errors.deleteSome"));
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteAll = async () => {
    if (sortedDuplicates.length === 0) return;
    if (
      !window.confirm(
        t("pages.agentTicket.confirmDeleteAllDuplicates", {
          count: sortedDuplicates.length,
        }),
      )
    )
      return;
    try {
      setDeleting(true);
      await Promise.all(sortedDuplicates.map((t) => deleteTicket(t.id)));
      setSelectedIds(new Set());
      queryClient.invalidateQueries(["all-tickets"]);
      setPageHistory(["list"]); // ← reset ke root
    } catch (err) {
      console.error("Error deleting all duplicates:", err.message);
      alert(t("pages.agentTicket.errors.deleteAll"));
    } finally {
      setDeleting(false);
    }
  };

  // ── Navigation handlers ───────────────────────────────────────────────────
  const openTicketDetail = async (ticket) => {
    setSelectedTicket(ticket);
    setResponseText("");
    setAttachment(null);
    navigateTo("detail"); // ← ganti
    try {
      const data = await getTicketTimeline(ticket.id);
      setTimeline(data);
    } catch (err) {
      console.error("Error fetching timeline:", err.message);
      setTimeline([]);
    }
  };

  const openDuplicates = useCallback(
    (ticket) => {
      setDuplicateSource(ticket);
      setDupPage(0);
      setSelectedIds(new Set());
      navigateTo("duplicates"); // ← ganti
    },
    [navigateTo],
  );

  // ── Response / action handlers ────────────────────────────────────────────
  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    if (!responseText.trim()) return;
    try {
      setSubmitting(true);
      await addTimelineEntry({
        ticket_id: selectedTicket.id,
        action: "Response Ticket",
        description: responseText,
        actor: "CS Agent",
        created_at: new Date().toISOString(),
      });
      if (selectedTicket.status === "Waiting") {
        await updateTicket(selectedTicket.id, { status: "Progress" });
        setSelectedTicket((prev) => ({ ...prev, status: "Progress" }));
      }
      setResponseText("");
      setAttachment(null);
      const data = await getTicketTimeline(selectedTicket.id);
      setTimeline(data);
      alert(t("pages.agentTicket.responseSubmitted"));
    } catch (err) {
      console.error("Error submitting response:", err.message);
      alert(t("pages.agentTicket.errors.submitResponse"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleTakeAction = async (ticket) => {
    try {
      await updateTicket(ticket.id, { solver: "You", status: "Progress" });
      queryClient.invalidateQueries(["all-tickets"]);
    } catch (err) {
      console.error("Error taking action:", err.message);
    }
  };

  const handleDispatch = async (ticket) => {
    const techName = prompt(t("pages.agentTicket.promptDispatch"));
    if (!techName) return;
    try {
      await updateTicket(ticket.id, { solver: techName, status: "Progress" });
      queryClient.invalidateQueries(["all-tickets"]);
    } catch (err) {
      console.error("Error dispatching:", err.message);
    }
  };

  // ── Shared columns config ─────────────────────────────────────────────────
  const columns = [
    { id: "id", label: t("pages.agentTicket.columns.ticketId") },
    { id: "subject", label: t("pages.agentTicket.columns.subject") },
    { id: "priority", label: t("pages.agentTicket.columns.priority") },
    { id: "status", label: t("pages.agentTicket.columns.status") },
    { id: "solver", label: t("pages.agentTicket.columns.assignedTo") },
    { id: "createdAt", label: t("pages.agentTicket.columns.createdAt") },
  ];

  // ── Row renderer ──────────────────────────────────────────────────────────
  const renderTicketRow = (
    ticket,
    { showDuplicate = true, isDupPage = false } = {},
  ) => {
    const isAssignedToSelf = ticket.solver === "You";
    const isDispatched =
      ticket.solver && ticket.solver !== "Not yet" && !isAssignedToSelf;
    const dupCount = getDuplicates(ticket, tickets).length;

    return (
      <TableRow key={ticket.id} sx={{ borderBottom: "1px solid #f0f0f0" }}>
        {isDupPage && (
          <TableCell padding="checkbox">
            <Checkbox
              checked={selectedIds.has(ticket.id)}
              onChange={() => toggleOne(ticket.id)}
              sx={{ color: "#FF8040", "&.Mui-checked": { color: "#FF8040" } }}
            />
          </TableCell>
        )}

        <TableCell sx={{ color: "#666", fontSize: "13px" }}>
          {ticket.id}
        </TableCell>
        <TableCell>{ticket.subject}</TableCell>
        <TableCell
          sx={{ color: getPriorityColor(ticket.priority), fontWeight: 500 }}
        >
          {ticket.priority ?? "-"}
        </TableCell>
        <TableCell
          sx={{ color: getStatusColor(ticket.status), fontWeight: 600 }}
        >
          {ticket.status}
        </TableCell>
        <TableCell>
          {isDispatched ? (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                color: "#333",
              }}
            >
              <MdPerson size={16} /> {ticket.solver}
            </span>
          ) : isAssignedToSelf ? (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                color: "#FF8040",
              }}
            >
              <MdSupportAgent size={16} /> {t("pages.agentTicket.you")}
            </span>
          ) : (
            <span style={{ color: "#999", fontSize: "13px" }}>
              {t("pages.agentTicket.unassigned")}
            </span>
          )}
        </TableCell>
        <TableCell>{formatTicketDate(ticket.createdAt)}</TableCell>
        <TableCell>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
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

            {!isAssignedToSelf && !isDispatched && (
              <button
                onClick={() => handleTakeAction(ticket)}
                style={{
                  background: "white",
                  color: "#FF8040",
                  border: "2px solid #FF8040",
                  padding: "6px 14px",
                  borderRadius: "6px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                {t("pages.agentTicket.takeAction")}
              </button>
            )}

            {showDuplicate && !isDupPage && (
              <button
                onClick={() => openDuplicates(ticket)}
                title={
                  dupCount > 0
                    ? t("pages.agentTicket.duplicatesFound", {
                        count: dupCount,
                      })
                    : t("pages.agentTicket.noDuplicates")
                }
                style={{
                  background: "white",
                  color: dupCount > 0 ? "#FF8040" : "#bbb",
                  border: `2px solid ${dupCount > 0 ? "#FF8040" : "#ddd"}`,
                  padding: "6px 10px",
                  borderRadius: "6px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  position: "relative",
                }}
              >
                <MdOutlineFilterNone size={16} />
                {dupCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-6px",
                      right: "-6px",
                      background: "#FF8040",
                      color: "white",
                      borderRadius: "50%",
                      width: "16px",
                      height: "16px",
                      fontSize: "10px",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {dupCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </TableCell>
      </TableRow>
    );
  };

  // ── Shared table header ───────────────────────────────────────────────────
  const renderTableHead = (isDupPage = false) => (
    <TableHead>
      <TableRow sx={{ borderBottom: "2px solid #f0f0f0" }}>
        {isDupPage && (
          <TableCell padding="checkbox">
            <Checkbox
              checked={allChecked}
              indeterminate={someChecked}
              onChange={toggleAll}
              sx={{
                color: "#FF8040",
                "&.Mui-checked": { color: "#FF8040" },
                "&.MuiCheckbox-indeterminate": { color: "#FF8040" },
              }}
            />
          </TableCell>
        )}
        {columns.map(({ id, label }) => (
          <TableCell key={id} sx={{ color: "#FF8040", fontWeight: 700 }}>
            <TableSortLabel
              active={isDupPage ? dupOrderBy === id : orderBy === id}
              direction={
                isDupPage
                  ? dupOrderBy === id
                    ? dupOrder
                    : "asc"
                  : orderBy === id
                    ? order
                    : "asc"
              }
              onClick={() =>
                isDupPage ? handleDupSort(id) : handleRequestSort(id)
              }
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

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Top Bar */}
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
            <MdArrowBack size={20} /> {t("pages.agentTicket.back")}
          </button>
        ) : (
          <SearchBar />
        )}
      </div>

      <div style={{ padding: "30px", flex: 1, overflowY: "auto" }}>
        {/* ── DETAIL VIEW ─────────────────────────────────────────────────── */}
        {currentPage === "detail" && selectedTicket && (
          <div
            style={{ display: "flex", gap: "25px", alignItems: "flex-start" }}
          >
            <div style={{ flex: 2 }}>
              {/* Ticket Info Card */}
              <div
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "30px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  marginBottom: "20px",
                }}
              >
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
                    marginBottom: "5px",
                  }}
                >
                  {t("pages.agentTicket.description")}
                </div>
                <p
                  style={{
                    color: "#555",
                    lineHeight: "1.6",
                    marginBottom: "25px",
                  }}
                >
                  {selectedTicket.description ||
                    t("pages.agentTicket.noDescription")}
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px",
                  }}
                >
                  {[
                    {
                      label: t("pages.agentTicket.createdAt"),
                      value: formatTicketDate(selectedTicket.createdAt),
                      color: "#333",
                    },
                    {
                      label: t("pages.agentTicket.priority"),
                      value: selectedTicket.priority,
                      color: getPriorityColor(selectedTicket.priority),
                    },
                    {
                      label: t("pages.agentTicket.status"),
                      value: selectedTicket.status,
                      color: getStatusColor(selectedTicket.status),
                    },
                  ].map((item) => (
                    <div key={item.label}>
                      <div
                        style={{
                          color: "#FF8040",
                          fontWeight: "600",
                          fontSize: "14px",
                          marginBottom: "4px",
                        }}
                      >
                        {item.label}
                      </div>
                      <div
                        style={{
                          color: item.color,
                          fontWeight:
                            item.label === t("pages.agentTicket.status")
                              ? "600"
                              : "normal",
                        }}
                      >
                        {item.value}
                      </div>
                    </div>
                  ))}
                  <div>
                    <div
                      style={{
                        color: "#FF8040",
                        fontWeight: "600",
                        fontSize: "14px",
                        marginBottom: "4px",
                      }}
                    >
                      {t("pages.agentTicket.customer")}
                    </div>
                    <div
                      style={{
                        color: "#333",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <MdAccountCircle size={18} color="#FF8040" />
                      {selectedTicket.customer ?? "-"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Add Response Card */}
              <div
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "30px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
              >
                <h3
                  style={{
                    fontSize: "20px",
                    fontWeight: "700",
                    marginBottom: "15px",
                    color: "#333",
                  }}
                >
                  {t("pages.agentTicket.addResponse")}
                </h3>
                <form onSubmit={handleSubmitResponse}>
                  <textarea
                    rows="4"
                    placeholder={t("pages.agentTicket.responsePlaceholder")}
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
                      justifyContent: "flex-end",
                      alignItems: "center",
                      marginBottom: "15px",
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
                      {t("pages.agentTicket.attachment")}{" "}
                      <MdAttachFile size={18} />
                      <input
                        type="file"
                        style={{ display: "none" }}
                        onChange={(e) => setAttachment(e.target.files[0])}
                      />
                    </label>
                  </div>
                  {attachment && (
                    <div
                      style={{
                        marginBottom: "10px",
                        fontSize: "13px",
                        color: "#888",
                      }}
                    >
                      {t("pages.agentTicket.selected")}: {attachment.name}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: "15px" }}>
                    <button
                      type="button"
                      onClick={() => handleDispatch(selectedTicket)}
                      style={{
                        padding: "10px 25px",
                        borderRadius: "8px",
                        border: "2px solid #FF8040",
                        background: "white",
                        color: "#FF8040",
                        fontWeight: "600",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      {t("pages.agentTicket.dispatch")}
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      style={{
                        padding: "10px 30px",
                        borderRadius: "8px",
                        border: "none",
                        background: "#FF8040",
                        color: "white",
                        fontWeight: "600",
                        cursor: submitting ? "not-allowed" : "pointer",
                        opacity: submitting ? 0.7 : 1,
                        fontSize: "14px",
                      }}
                    >
                      {submitting
                        ? t("pages.agentTicket.submitting")
                        : t("pages.agentTicket.submit")}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Timeline */}
            <div
              style={{
                flex: 1,
                background: "white",
                borderRadius: "12px",
                padding: "30px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                minHeight: "400px",
              }}
            >
              <h3
                style={{
                  fontSize: "22px",
                  fontWeight: "700",
                  marginBottom: "25px",
                  color: "#333",
                }}
              >
                {t("pages.agentTicket.timeline")}
              </h3>

              {timeline.length === 0 ? (
                <div style={{ color: "#999", fontSize: "14px" }}>
                  {t("pages.agentTicket.noTimeline")}
                </div>
              ) : (
                <div style={{ position: "relative", paddingLeft: "35px" }}>
                  <div
                    style={{
                      position: "absolute",
                      left: "14px",
                      top: "10px",
                      bottom: "10px",
                      width: "2px",
                      background: "#FF8040",
                    }}
                  />
                  {timeline.map((event, idx) => {
                    const eventDate = new Date(event.created_at);
                    const dateStr = eventDate.toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    });
                    const timeStr = eventDate.toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    const isAgent =
                      event.actor === "CS Agent" || event.actor === "System";
                    return (
                      <div
                        key={event.id ?? idx}
                        style={{ position: "relative", marginBottom: "30px" }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            left: "-35px",
                            top: "0",
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                            background: "white",
                            border: "2px solid #FF8040",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {isAgent ? (
                            <MdSupportAgent size={16} color="#FF8040" />
                          ) : (
                            <MdAccountCircle size={16} color="#FF8040" />
                          )}
                        </div>
                        <div
                          style={{
                            border: "1.5px solid #FF8040",
                            borderRadius: "10px",
                            padding: "12px 15px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              gap: "12px",
                              fontSize: "12px",
                              color: "#FF8040",
                              fontWeight: "600",
                              marginBottom: "6px",
                            }}
                          >
                            <span>{dateStr}</span>
                            <span>{timeStr}</span>
                          </div>
                          <div
                            style={{
                              fontWeight: "600",
                              color: "#333",
                              fontSize: "14px",
                              marginBottom: event.description ? "4px" : 0,
                            }}
                          >
                            {event.action}
                          </div>
                          {event.description && (
                            <div
                              style={{
                                fontSize: "13px",
                                color: "#666",
                                lineHeight: "1.5",
                              }}
                            >
                              • {event.description}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── DUPLICATE VIEW ───────────────────────────────────────────────── */}
        {currentPage === "duplicates" && duplicateSource && (
          <>
            {/* Source banner */}
            <div
              style={{
                background: "#FFF5EF",
                border: "1.5px solid #FF8040",
                borderRadius: "10px",
                padding: "14px 20px",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <MdOutlineFilterNone size={18} color="#FF8040" />
              <div>
                <span
                  style={{
                    fontWeight: "700",
                    color: "#FF8040",
                    fontSize: "13px",
                  }}
                >
                  {t("pages.agentTicket.duplicateTicketsFor")}
                </span>{" "}
                <span
                  style={{ color: "#333", fontWeight: "600", fontSize: "14px" }}
                >
                  {duplicateSource.subject}
                </span>{" "}
                <span style={{ color: "#999", fontSize: "13px" }}>
                  {t("pages.agentTicket.ticketNumber", {
                    id: duplicateSource.id,
                  })}
                </span>
              </div>
            </div>

            {/* Title row + Delete buttons */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "25px",
              }}
            >
              <div
                style={{ fontSize: "28px", fontWeight: "700", color: "#333" }}
              >
                {t("pages.agentTicket.duplicateTickets")}{" "}
                <span style={{ color: "#FF8040" }}>
                  • {sortedDuplicates.length}
                </span>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                {/* Delete selected */}
                <button
                  onClick={handleDeleteSelected}
                  disabled={selectedIds.size === 0 || deleting}
                  title={
                    selectedIds.size === 0
                      ? t("pages.agentTicket.selectAtLeastOne")
                      : t("pages.agentTicket.deleteSelectedN", {
                          count: selectedIds.size,
                        })
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 18px",
                    borderRadius: "8px",
                    fontWeight: "600",
                    fontSize: "14px",
                    cursor:
                      selectedIds.size === 0 || deleting
                        ? "not-allowed"
                        : "pointer",
                    border: `2px solid ${selectedIds.size === 0 ? "#ddd" : "#FF8040"}`,
                    background: "white",
                    color: selectedIds.size === 0 ? "#bbb" : "#FF8040",
                    opacity: deleting ? 0.7 : 1,
                    transition: "all 0.2s",
                  }}
                >
                  <MdDelete size={17} />
                  {t("pages.agentTicket.delete")}
                  {selectedIds.size > 0 ? ` (${selectedIds.size})` : ""}
                </button>

                {/* Delete All */}
                <button
                  onClick={handleDeleteAll}
                  disabled={sortedDuplicates.length === 0 || deleting}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 18px",
                    borderRadius: "8px",
                    fontWeight: "600",
                    fontSize: "14px",
                    cursor:
                      sortedDuplicates.length === 0 || deleting
                        ? "not-allowed"
                        : "pointer",
                    border: "none",
                    background:
                      sortedDuplicates.length === 0 ? "#ddd" : "#FF8040",
                    color: "white",
                    opacity: deleting ? 0.7 : 1,
                    transition: "all 0.2s",
                  }}
                >
                  <MdDeleteSweep size={18} />
                  {deleting
                    ? t("pages.agentTicket.deleting")
                    : t("pages.agentTicket.deleteAll")}
                </button>
              </div>
            </div>

            {/* Duplicate table */}
            <div
              style={{
                background: "white",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              {loading ? (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <LoadingSpinner />
                </div>
              ) : (
                <Paper
                  elevation={0}
                  sx={{ borderRadius: "12px", overflow: "hidden" }}
                >
                  <TableContainer>
                    <Table>
                      {renderTableHead(true)}
                      <TableBody>
                        {paginatedDuplicates.map((ticket) =>
                          renderTicketRow(ticket, {
                            showDuplicate: false,
                            isDupPage: true,
                          }),
                        )}
                        {sortedDuplicates.length === 0 && (
                          <TableRow>
                            <TableCell
                              colSpan={8}
                              sx={{ textAlign: "center", py: 4, color: "#999" }}
                            >
                              {t("pages.agentTicket.noDuplicatesForSubject")}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    component="div"
                    count={sortedDuplicates.length}
                    page={safeDupPage}
                    onPageChange={(_, newPage) => setDupPage(newPage)}
                    rowsPerPage={dupRowsPerPage}
                    onRowsPerPageChange={(e) => {
                      setDupRowsPerPage(parseInt(e.target.value, 10));
                      setDupPage(0);
                    }}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                  />
                </Paper>
              )}
            </div>
          </>
        )}

        {/* ── MAIN LIST VIEW ───────────────────────────────────────────────── */}
        {currentPage === "list" && (
          <>
            <div
              style={{
                fontSize: "28px",
                fontWeight: "700",
                marginBottom: "25px",
                color: "#333",
              }}
            >
              {t("pages.agentTicket.listOfTickets")}{" "}
              <span style={{ color: "#FF8040" }}>• {tickets.length}</span>
            </div>
            <div
              style={{
                background: "white",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              {loading ? (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <LoadingSpinner />
                </div>
              ) : (
                <Paper
                  elevation={0}
                  sx={{ borderRadius: "12px", overflow: "hidden" }}
                >
                  <TableContainer>
                    <Table>
                      {renderTableHead(false)}
                      <TableBody>
                        {paginatedTickets.map((ticket) =>
                          renderTicketRow(ticket),
                        )}
                        {sortedTickets.length === 0 && (
                          <TableRow>
                            <TableCell
                              colSpan={7}
                              sx={{ textAlign: "center", py: 4, color: "#999" }}
                            >
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
                    onPageChange={(_, newPage) => setPage(newPage)}
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

      {/* Floating Chat */}
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
