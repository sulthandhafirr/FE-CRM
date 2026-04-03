import { useCallback, useMemo, useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  MdChat, MdArrowBack, MdAttachFile, MdAccountCircle,
  MdSupportAgent, MdPerson, MdDelete, MdDeleteSweep,
  MdOutlineFilterNone, MdCheckCircle,
} from "react-icons/md";
import {
  Checkbox, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TablePagination, TableRow, TableSortLabel,
} from "@mui/material";
import ChatBot from "../../../components/ui/ChatBot";
import SearchBar from "../../../components/ui/SearchBar";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import {
  getAllTickets, updateTicket, deleteTicket,
  getTicketComments, createTicketComment,
  getAttachmentDownloadUrl, uploadTicketAttachment,
  resolveTicket, takeAction,
} from "../ticket.service";
import { getPriorityColor, getStatusColor, formatTicketDate } from "../ticket.schema";

function sortTicketsFn(list, ob, o) {
  return [...list].sort((a, b) => {
    let aValue = a[ob];
    let bValue = b[ob];
    if (ob === "createdAt") { aValue = new Date(aValue ?? 0).getTime(); bValue = new Date(bValue ?? 0).getTime(); }
    if (ob === "id") { aValue = Number(aValue); bValue = Number(bValue); }
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
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [resolvingTicket, setResolvingTicket] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [pageHistory, setPageHistory] = useState(["list"]);
  const currentPage = pageHistory[pageHistory.length - 1];
  const [duplicateSource, setDuplicateSource] = useState(null);
  const [orderBy, setOrderBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [dupOrderBy, setDupOrderBy] = useState("createdAt");
  const [dupOrder, setDupOrder] = useState("desc");
  const [dupPage, setDupPage] = useState(0);
  const [dupRowsPerPage, setDupRowsPerPage] = useState(5);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [deleting, setDeleting] = useState(false);

  const selectedTicketId = selectedTicket?.id ?? null;

  const navigateTo = useCallback((p) => setPageHistory((prev) => [...prev, p]), []);
  const navigateBack = useCallback(() => setPageHistory((prev) => prev.length > 1 ? prev.slice(0, -1) : prev), []);

  const { data: comments = [], isLoading: commentsLoading, isError: commentsError } = useQuery({
    queryKey: ["ticket-comments", selectedTicketId],
    queryFn: () => getTicketComments(selectedTicketId),
    enabled: Boolean(selectedTicketId) && currentPage === "detail",
    staleTime: 1000 * 60, refetchOnWindowFocus: false,
  });

  useQuery({
    queryKey: ["ticket-attachments", selectedTicketId],
    queryFn: async () => selectedTicket?.attachments ?? [],
    enabled: Boolean(selectedTicketId) && currentPage === "detail",
    staleTime: 0,
  });

  const { mutateAsync: submitComment } = useMutation({
    mutationFn: (message) => createTicketComment(selectedTicketId, message),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ticket-comments", selectedTicketId] }),
  });

  const { data: tickets = [], isLoading: loading } = useQuery({
    queryKey: ["all-tickets"],
    queryFn: getAllTickets,
    staleTime: 1000 * 60 * 5, refetchOnWindowFocus: false, refetchOnMount: false,
  });

  const handleViewAttachment = async (attachmentId) => {
    if (!selectedTicketId) return;
    try {
      setDownloadingId(attachmentId);
      const result = await getAttachmentDownloadUrl(selectedTicketId, attachmentId);
      if (!result.signedUrl) throw new Error("No signed URL");
      window.open(result.signedUrl, "_blank");
    } catch (error) {
      console.error("Failed to open attachment:", error);
      alert("Failed to open attachment. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleResolveTicket = async () => {
    if (!selectedTicket) return;
    if (!window.confirm("Mark this ticket as Solved?")) return;
    try {
      setResolvingTicket(true);
      const result = await resolveTicket(selectedTicket.id);
      setSelectedTicket((prev) => ({ ...prev, status: "Solved", resolvedAt: result.resolvedAt }));
      queryClient.invalidateQueries(["all-tickets"]);
    } catch (err) {
      console.error("Error resolving ticket:", err.message);
      alert("Failed to resolve ticket.");
    } finally {
      setResolvingTicket(false);
    }
  };

  const getDuplicates = useCallback((ticket, allTickets) =>
    allTickets.filter((t) => t.id !== ticket.id && t.subject?.trim().toLowerCase() === ticket.subject?.trim().toLowerCase()), []);

  const sortedTickets = useMemo(
    () => sortTicketsFn(tickets.filter((t) => t.status !== "Solved"), orderBy, order),
    [tickets, orderBy, order]
  );

  const sortedDuplicates = useMemo(() => {
    if (!duplicateSource) return [];
    return sortTicketsFn(getDuplicates(duplicateSource, tickets), dupOrderBy, dupOrder);
  }, [duplicateSource, tickets, dupOrderBy, dupOrder, getDuplicates]);

  const safePage = useMemo(() => Math.min(page, Math.max(0, Math.ceil(sortedTickets.length / rowsPerPage) - 1)), [page, rowsPerPage, sortedTickets.length]);
  const paginatedTickets = useMemo(() => sortedTickets.slice(safePage * rowsPerPage, safePage * rowsPerPage + rowsPerPage), [rowsPerPage, safePage, sortedTickets]);
  const safeDupPage = useMemo(() => Math.min(dupPage, Math.max(0, Math.ceil(sortedDuplicates.length / dupRowsPerPage) - 1)), [dupPage, dupRowsPerPage, sortedDuplicates.length]);
  const paginatedDuplicates = useMemo(() => sortedDuplicates.slice(safeDupPage * dupRowsPerPage, safeDupPage * dupRowsPerPage + dupRowsPerPage), [dupRowsPerPage, safeDupPage, sortedDuplicates]);

  const allVisibleIds = useMemo(() => paginatedDuplicates.map((t) => t.id), [paginatedDuplicates]);
  const allChecked = useMemo(() => allVisibleIds.length > 0 && allVisibleIds.every((id) => selectedIds.has(id)), [allVisibleIds, selectedIds]);
  const someChecked = useMemo(() => allVisibleIds.some((id) => selectedIds.has(id)) && !allChecked, [allVisibleIds, selectedIds, allChecked]);

  const toggleOne = useCallback((id) => {
    setSelectedIds((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }, []);
  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = allVisibleIds.every((id) => next.has(id));
      allSelected ? allVisibleIds.forEach((id) => next.delete(id)) : allVisibleIds.forEach((id) => next.add(id));
      return next;
    });
  }, [allVisibleIds]);

  const handleRequestSort = useCallback((property) => {
    setOrder((prev) => (orderBy === property && prev === "asc" ? "desc" : "asc"));
    setOrderBy(property); setPage(0);
  }, [orderBy]);
  const handleDupSort = useCallback((property) => {
    setDupOrder((prev) => (dupOrderBy === property && prev === "asc" ? "desc" : "asc"));
    setDupOrderBy(property); setDupPage(0);
  }, [dupOrderBy]);

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(t("pages.agentTicket.confirmDeleteSelected", { count: selectedIds.size }))) return;
    try {
      setDeleting(true);
      await Promise.all([...selectedIds].map((id) => deleteTicket(id)));
      setSelectedIds(new Set());
      queryClient.invalidateQueries(["all-tickets"]);
    } catch (err) {
      console.error("Error deleting tickets:", err.message);
      alert(t("pages.agentTicket.errors.deleteSome"));
    } finally { setDeleting(false); }
  };

  const handleDeleteAll = async () => {
    if (sortedDuplicates.length === 0) return;
    if (!window.confirm(t("pages.agentTicket.confirmDeleteAllDuplicates", { count: sortedDuplicates.length }))) return;
    try {
      setDeleting(true);
      await Promise.all(sortedDuplicates.map((t) => deleteTicket(t.id)));
      setSelectedIds(new Set());
      queryClient.invalidateQueries(["all-tickets"]);
      setPageHistory(["list"]);
    } catch (err) {
      console.error("Error deleting all duplicates:", err.message);
      alert(t("pages.agentTicket.errors.deleteAll"));
    } finally { setDeleting(false); }
  };

  const openTicketDetail = (ticket) => {
    setSelectedTicket(ticket);
    setResponseText("");
    setAttachment(null);
    navigateTo("detail");
  };

  const openDuplicates = useCallback((ticket) => {
    setDuplicateSource(ticket);
    setDupPage(0);
    setSelectedIds(new Set());
    navigateTo("duplicates");
  }, [navigateTo]);

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
        const updatedTickets = await queryClient.fetchQuery({ queryKey: ["all-tickets"], queryFn: getAllTickets, staleTime: 0 });
        const refreshed = updatedTickets.find((t) => t.id === selectedTicketId);
        if (refreshed) setSelectedTicket(refreshed);
      }
      if (selectedTicket.status === "Waiting") {
        await updateTicket(selectedTicket.id, { status: "Progress" });
        setSelectedTicket((prev) => ({ ...prev, status: "Progress" }));
        queryClient.invalidateQueries(["all-tickets"]);
      }
      setResponseText("");
      setAttachment(null);
    } catch (err) {
      console.error("Error submitting response:", err.message);
      alert(t("pages.agentTicket.errors.submitResponse"));
    } finally { setSubmitting(false); }
  };

  const handleTakeAction = async (ticket) => {
    try {
      await takeAction(ticket.id);
      queryClient.invalidateQueries(["all-tickets"]);
    } catch (err) {
      console.error("Error taking action:", err.message);
      alert("Failed to take action.");
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

  const columns = [
    { id: "id",        label: t("pages.agentTicket.columns.ticketId")   },
    { id: "subject",   label: t("pages.agentTicket.columns.subject")     },
    { id: "priority",  label: t("pages.agentTicket.columns.priority")    },
    { id: "status",    label: t("pages.agentTicket.columns.status")      },
    { id: "solver",    label: t("pages.agentTicket.columns.assignedTo")  },
    { id: "createdAt", label: t("pages.agentTicket.columns.createdAt")   },
  ];

  const renderTicketRow = (ticket, { showDuplicate = true, isDupPage = false } = {}) => {
    const isAssignedToSelf = ticket.solver === "You";
    const isDispatched = ticket.solver && ticket.solver !== "Not yet" && !isAssignedToSelf;
    const dupCount = getDuplicates(ticket, tickets).length;
    return (
      <TableRow key={ticket.id} sx={{ borderBottom: "1px solid #f0f0f0" }}>
        {isDupPage && (
          <TableCell padding="checkbox">
            <Checkbox checked={selectedIds.has(ticket.id)} onChange={() => toggleOne(ticket.id)} sx={{ color: "#FF8040", "&.Mui-checked": { color: "#FF8040" } }} />
          </TableCell>
        )}
        <TableCell sx={{ color: "#666", fontSize: "13px" }}>{ticket.id}</TableCell>
        <TableCell>{ticket.subject}</TableCell>
        <TableCell sx={{ color: getPriorityColor(ticket.priority), fontWeight: 500 }}>{ticket.priority ?? "-"}</TableCell>
        <TableCell sx={{ color: getStatusColor(ticket.status), fontWeight: 600 }}>{ticket.status}</TableCell>
        <TableCell>
          {isDispatched ? (
            <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "#333" }}><MdPerson size={16} /> {ticket.solver}</span>
          ) : isAssignedToSelf ? (
            <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "#FF8040" }}><MdSupportAgent size={16} /> {t("pages.agentTicket.you")}</span>
          ) : (
            <span style={{ color: "#999", fontSize: "13px" }}>{t("pages.agentTicket.unassigned")}</span>
          )}
        </TableCell>
        <TableCell>{formatTicketDate(ticket.createdAt)}</TableCell>
        <TableCell>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button onClick={() => openTicketDetail(ticket)} style={{ background: "#FF8040", color: "white", border: "none", padding: "6px 14px", borderRadius: "6px", fontWeight: "600", cursor: "pointer", fontSize: "13px" }}>
              {t("pages.agentTicket.detail")}
            </button>
            {!isAssignedToSelf && !isDispatched && (
              <button onClick={() => handleTakeAction(ticket)} style={{ background: "white", color: "#FF8040", border: "2px solid #FF8040", padding: "6px 14px", borderRadius: "6px", fontWeight: "600", cursor: "pointer", fontSize: "13px" }}>
                {t("pages.agentTicket.takeAction")}
              </button>
            )}
            {showDuplicate && !isDupPage && (
              <button
                onClick={() => openDuplicates(ticket)}
                title={dupCount > 0 ? t("pages.agentTicket.duplicatesFound", { count: dupCount }) : t("pages.agentTicket.noDuplicates")}
                style={{ background: "white", color: dupCount > 0 ? "#FF8040" : "#bbb", border: `2px solid ${dupCount > 0 ? "#FF8040" : "#ddd"}`, padding: "6px 10px", borderRadius: "6px", fontWeight: "600", cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", gap: "4px", position: "relative" }}
              >
                <MdOutlineFilterNone size={16} />
                {dupCount > 0 && (
                  <span style={{ position: "absolute", top: "-6px", right: "-6px", background: "#FF8040", color: "white", borderRadius: "50%", width: "16px", height: "16px", fontSize: "10px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center" }}>
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

  const renderTableHead = (isDupPage = false) => (
    <TableHead>
      <TableRow sx={{ borderBottom: "2px solid #f0f0f0" }}>
        {isDupPage && (
          <TableCell padding="checkbox">
            <Checkbox checked={allChecked} indeterminate={someChecked} onChange={toggleAll} sx={{ color: "#FF8040", "&.Mui-checked": { color: "#FF8040" }, "&.MuiCheckbox-indeterminate": { color: "#FF8040" } }} />
          </TableCell>
        )}
        {columns.map(({ id, label }) => (
          <TableCell key={id} sx={{ color: "#FF8040", fontWeight: 700 }}>
            <TableSortLabel
              active={isDupPage ? dupOrderBy === id : orderBy === id}
              direction={isDupPage ? (dupOrderBy === id ? dupOrder : "asc") : (orderBy === id ? order : "asc")}
              onClick={() => isDupPage ? handleDupSort(id) : handleRequestSort(id)}
              sx={{ color: "#FF8040 !important", fontWeight: 700, "&.Mui-active": { color: "#FF8040 !important" }, "& .MuiTableSortLabel-icon": { color: "#FF8040 !important" } }}
            >
              {label}
            </TableSortLabel>
          </TableCell>
        ))}
        <TableCell sx={{ color: "#FF8040", fontWeight: 700 }}>{t("pages.agentTicket.columns.action")}</TableCell>
      </TableRow>
    </TableHead>
  );

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div style={{ background: "white", padding: "15px 30px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 5px rgba(0,0,0,0.05)", height: "70px" }}>
        {pageHistory.length > 1 ? (
          <button onClick={navigateBack} style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", color: "#FF8040", fontWeight: "600", fontSize: "14px" }}>
            <MdArrowBack size={20} /> {t("pages.agentTicket.back")}
          </button>
        ) : <SearchBar />}
      </div>

      <div style={{ padding: "30px", flex: 1, overflowY: "auto" }}>
        {/* ── DETAIL VIEW ── */}
        {currentPage === "detail" && selectedTicket && (
          <div style={{ maxWidth: "1020px", margin: "0 auto" }}>
            <div style={{ background: "white", borderRadius: "14px", boxShadow: "0 8px 28px rgba(0,0,0,0.08)", overflow: "hidden" }}>
              <div style={{ background: "linear-gradient(180deg, #FFF7F2 0%, #FFFFFF 100%)", padding: "16px 22px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ color: "#FF8040", fontWeight: "700", fontSize: "14px" }}>Ticket #{selectedTicket.id}</div>
                {selectedTicket.status === "Progress" && (
                  <button onClick={handleResolveTicket} disabled={resolvingTicket} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 18px", borderRadius: "8px", border: "none", background: resolvingTicket ? "#ccc" : "#FF8040", color: "white", fontWeight: "700", fontSize: "14px", cursor: resolvingTicket ? "not-allowed" : "pointer", boxShadow: "0 2px 8px rgba(34,197,94,0.3)", transition: "all 0.2s" }}>
                    <MdCheckCircle size={18} />
                    {resolvingTicket ? "Resolving..." : "Mark as Resolved"}
                  </button>
                )}
                {selectedTicket.status === "Solved" && (
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#FF8040", fontWeight: "700", fontSize: "14px" }}>
                    <MdCheckCircle size={18} /> Resolved
                  </span>
                )}
              </div>
              <div style={{ padding: "24px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", alignItems: "start" }}>
                  <div style={{ padding: "12px 6px" }}>
                    <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "10px", color: "#333" }}>{selectedTicket.subject}</h2>
                    <div style={{ color: "#FF8040", fontWeight: "600", fontSize: "14px", marginBottom: "6px" }}>Description</div>
                    <p style={{ color: "#555", lineHeight: "1.65", marginBottom: "24px" }}>{selectedTicket.description || "No description provided."}</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                      <div><div style={{ color: "#FF8040", fontWeight: "600", fontSize: "13px", marginBottom: "4px" }}>Created at</div><div style={{ color: "#333" }}>{formatTicketDate(selectedTicket.createdAt)}</div></div>
                      <div><div style={{ color: "#FF8040", fontWeight: "600", fontSize: "13px", marginBottom: "4px" }}>Priority</div><div style={{ color: getPriorityColor(selectedTicket.priority), fontWeight: "500" }}>{selectedTicket.priority ?? "-"}</div></div>
                      <div><div style={{ color: "#FF8040", fontWeight: "600", fontSize: "13px", marginBottom: "4px" }}>Status</div><div style={{ color: getStatusColor(selectedTicket.status), fontWeight: "600" }}>{selectedTicket.status || "-"}</div></div>
                      <div><div style={{ color: "#FF8040", fontWeight: "600", fontSize: "13px", marginBottom: "4px" }}>Customer</div><div style={{ color: "#333", display: "flex", alignItems: "center", gap: "6px" }}><MdAccountCircle size={16} color="#FF8040" />{selectedTicket.customer ?? "-"}</div></div>
                      <div><div style={{ color: "#FF8040", fontWeight: "600", fontSize: "13px", marginBottom: "4px" }}>Assigned To</div><div style={{ color: "#333" }}>{selectedTicket.solver ?? "Unassigned"}</div></div>
                      {selectedTicket.resolvedAt && (
                        <div><div style={{ color: "#FF8040", fontWeight: "600", fontSize: "13px", marginBottom: "4px" }}>Resolved at</div><div style={{ color: "#333" }}>{formatTicketDate(selectedTicket.resolvedAt)}</div></div>
                      )}
                    </div>
                    <div style={{ marginTop: "26px", paddingTop: "20px", borderTop: "1px solid #f1f5f9" }}>
                      <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "14px", color: "#333" }}>Add Response</h3>
                      <form onSubmit={handleSubmitResponse}>
                        <textarea rows={4} placeholder="Write your response..." value={responseText} onChange={(e) => setResponseText(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ddd", resize: "none", fontSize: "14px", outline: "none", marginBottom: "10px", boxSizing: "border-box" }} />
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                          <label style={{ color: "#FF8040", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", fontSize: "14px" }}>
                            <MdAttachFile size={18} /> Attachment
                            <input type="file" style={{ display: "none" }} onChange={(e) => setAttachment(e.target.files[0] ?? null)} />
                          </label>
                          {attachment && (
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#555", background: "#FFF5EF", border: "1px solid #fde4d4", borderRadius: "6px", padding: "4px 10px" }}>
                              <MdAttachFile size={14} color="#FF8040" />
                              {attachment.name}
                              <button type="button" onClick={() => setAttachment(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#999", fontSize: "16px", lineHeight: 1, padding: "0 2px" }}>×</button>
                            </div>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: "12px" }}>
                          <button type="button" onClick={() => handleDispatch(selectedTicket)} style={{ padding: "10px 25px", borderRadius: "8px", border: "2px solid #FF8040", background: "white", color: "#FF8040", fontWeight: "600", cursor: "pointer", fontSize: "14px" }}>
                            Dispatch
                          </button>
                          <button type="submit" disabled={submitting || (!responseText.trim() && !attachment)} style={{ padding: "10px 30px", borderRadius: "8px", border: "none", background: "#FF8040", color: "white", fontWeight: "600", cursor: submitting || (!responseText.trim() && !attachment) ? "not-allowed" : "pointer", opacity: submitting || (!responseText.trim() && !attachment) ? 0.7 : 1, fontSize: "14px" }}>
                            {submitting ? "Submitting..." : "Submit"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                  <div style={{ background: "#fffdfb", borderRadius: "14px", padding: "22px", border: "1px solid #fce6d8" }}>
                    <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", color: "#333" }}>Timeline</h3>
                    {commentsLoading ? <div style={{ textAlign: "center", padding: "16px 0" }}><LoadingSpinner /></div>
                      : commentsError ? <div style={{ color: "#9ca3af", fontSize: "14px" }}>Failed to load timeline.</div>
                      : (
                        <div style={{ position: "relative", paddingLeft: "30px" }}>
                          {(() => {
                            const attachments = selectedTicket?.attachments ?? [];
                            const createdDate = new Date(selectedTicket?.createdAt);
                            const createdDateStr = Number.isNaN(createdDate.getTime()) ? "-" : createdDate.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
                            const createdTimeStr = Number.isNaN(createdDate.getTime()) ? "-" : createdDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
                            const ticketLevelAttachments = attachments.filter((a) => !a.commentId);
                            const allItems = [
                              { _type: "created" },
                              ...comments.map((c) => ({ _type: "comment", ...c })),
                              ...(selectedTicket.status === "Solved" && selectedTicket.resolvedAt ? [{ _type: "resolved" }] : []),
                            ];
                            return allItems.map((item, index) => {
                              const isLast = index === allItems.length - 1;
                              if (item._type === "created") return (
                                <div key="ticket-created" style={{ position: "relative", marginBottom: "18px" }}>
                                  {!isLast && <div style={{ position: "absolute", left: "-20px", top: "22px", bottom: "-20px", width: "2px", background: "#FF8040" }} />}
                                  <div style={{ position: "absolute", left: "-30px", top: "2px", width: "22px", height: "22px", borderRadius: "50%", background: "white", border: "2px solid #FF8040", display: "flex", alignItems: "center", justifyContent: "center" }}><MdPerson size={12} color="#FF8040" /></div>
                                  <div style={{ border: "1px solid #fde4d4", borderRadius: "10px", padding: "10px 12px", background: "#fffdfb" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", marginBottom: "4px" }}>
                                      <div style={{ fontWeight: "600", fontSize: "13px", color: "#333" }}>{selectedTicket?.customer || "Customer"}</div>
                                      <div style={{ fontSize: "11px", color: "#9ca3af", whiteSpace: "nowrap" }}>{createdDateStr} • {createdTimeStr}</div>
                                    </div>
                                    <div style={{ fontSize: "13px", color: "#555", lineHeight: "1.5" }}>Ticket created</div>
                                    {ticketLevelAttachments.length > 0 && (
                                      <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px solid #fde4d4", display: "flex", flexDirection: "column", gap: "6px" }}>
                                        {ticketLevelAttachments.map((file) => <AttachmentButton key={file.id} file={file} downloadingId={downloadingId} onView={() => handleViewAttachment(file.id)} />)}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                              if (item._type === "resolved") {
                                const rd = new Date(selectedTicket.resolvedAt);
                                const rdStr = Number.isNaN(rd.getTime()) ? "-" : rd.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
                                const rtStr = Number.isNaN(rd.getTime()) ? "-" : rd.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
                                return (
                                  <div key="ticket-resolved" style={{ position: "relative", marginBottom: "18px" }}>
                                    <div style={{ position: "absolute", left: "-30px", top: "2px", width: "22px", height: "22px", borderRadius: "50%", background: "#FF8040", border: "2px solid #FF8040", display: "flex", alignItems: "center", justifyContent: "center" }}><MdCheckCircle size={13} color="white" /></div>
                                    <div style={{ border: "1px solid #bbf7d0", borderRadius: "10px", padding: "10px 12px", background: "#f0fdf4" }}>
                                      <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", marginBottom: "4px" }}>
                                        <div style={{ fontWeight: "600", fontSize: "13px", color: "#16a34a" }}>Ticket Resolved</div>
                                        <div style={{ fontSize: "11px", color: "#9ca3af", whiteSpace: "nowrap" }}>{rdStr} • {rtStr}</div>
                                      </div>
                                      <div style={{ fontSize: "13px", color: "#15803d", lineHeight: "1.5" }}>Status changed to Solved</div>
                                    </div>
                                  </div>
                                );
                              }
                              const commentDate = new Date(item.createdAt);
                              const dateStr = Number.isNaN(commentDate.getTime()) ? "-" : commentDate.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
                              const timeStr = Number.isNaN(commentDate.getTime()) ? "-" : commentDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
                              const isAgentReply = selectedTicket?.solver && item.senderName && item.senderName === selectedTicket.solver;
                              const commentAttachments = attachments.filter((a) => a.commentId === item.id);
                              return (
                                <div key={item.id ?? index} style={{ position: "relative", marginBottom: "18px" }}>
                                  {!isLast && <div style={{ position: "absolute", left: "-20px", top: "22px", bottom: "-20px", width: "2px", background: "#FF8040" }} />}
                                  <div style={{ position: "absolute", left: "-30px", top: "2px", width: "22px", height: "22px", borderRadius: "50%", background: isAgentReply ? "#FF8040" : "white", border: "2px solid #FF8040", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    {isAgentReply ? <MdSupportAgent size={12} color="white" /> : <MdPerson size={12} color="#FF8040" />}
                                  </div>
                                  <div style={{ border: "1px solid #fde4d4", borderRadius: "10px", padding: "10px 12px", background: isAgentReply ? "#FF8040" : "#fffdfb" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", marginBottom: "4px" }}>
                                      <div style={{ fontWeight: "600", fontSize: "13px", color: isAgentReply ? "white" : "#333" }}>{item.senderName || "Unknown sender"}</div>
                                      <div style={{ fontSize: "11px", color: isAgentReply ? "rgba(255,255,255,0.75)" : "#9ca3af", whiteSpace: "nowrap" }}>{dateStr} • {timeStr}</div>
                                    </div>
                                    <div style={{ fontSize: "13px", color: isAgentReply ? "white" : "#555", lineHeight: "1.5", wordBreak: "break-word" }}>{item.message || "-"}</div>
                                    {commentAttachments.length > 0 && (
                                      <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: `1px solid ${isAgentReply ? "rgba(255,255,255,0.3)" : "#fde4d4"}`, display: "flex", flexDirection: "column", gap: "6px" }}>
                                        {commentAttachments.map((file) => <AttachmentButton key={file.id} file={file} downloadingId={downloadingId} onView={() => handleViewAttachment(file.id)} isAgentReply={isAgentReply} />)}
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

        {/* ── DUPLICATE VIEW ── */}
        {currentPage === "duplicates" && duplicateSource && (
          <>
            <div style={{ background: "#FFF5EF", border: "1.5px solid #FF8040", borderRadius: "10px", padding: "14px 20px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
              <MdOutlineFilterNone size={18} color="#FF8040" />
              <div>
                <span style={{ fontWeight: "700", color: "#FF8040", fontSize: "13px" }}>{t("pages.agentTicket.duplicateTicketsFor")}</span>{" "}
                <span style={{ color: "#333", fontWeight: "600", fontSize: "14px" }}>{duplicateSource.subject}</span>{" "}
                <span style={{ color: "#999", fontSize: "13px" }}>{t("pages.agentTicket.ticketNumber", { id: duplicateSource.id })}</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "25px" }}>
              <div style={{ fontSize: "28px", fontWeight: "700", color: "#333" }}>
                {t("pages.agentTicket.duplicateTickets")} <span style={{ color: "#FF8040" }}>• {sortedDuplicates.length}</span>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={handleDeleteSelected} disabled={selectedIds.size === 0 || deleting} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 18px", borderRadius: "8px", fontWeight: "600", fontSize: "14px", cursor: selectedIds.size === 0 || deleting ? "not-allowed" : "pointer", border: `2px solid ${selectedIds.size === 0 ? "#ddd" : "#FF8040"}`, background: "white", color: selectedIds.size === 0 ? "#bbb" : "#FF8040", opacity: deleting ? 0.7 : 1 }}>
                  <MdDelete size={17} />
                  {t("pages.agentTicket.delete")}{selectedIds.size > 0 ? ` (${selectedIds.size})` : ""}
                </button>
                <button onClick={handleDeleteAll} disabled={sortedDuplicates.length === 0 || deleting} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 18px", borderRadius: "8px", fontWeight: "600", fontSize: "14px", cursor: sortedDuplicates.length === 0 || deleting ? "not-allowed" : "pointer", border: "none", background: sortedDuplicates.length === 0 ? "#ddd" : "#FF8040", color: "white", opacity: deleting ? 0.7 : 1 }}>
                  <MdDeleteSweep size={18} />
                  {deleting ? t("pages.agentTicket.deleting") : t("pages.agentTicket.deleteAll")}
                </button>
              </div>
            </div>
            <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              {loading ? <div style={{ textAlign: "center", padding: "20px" }}><LoadingSpinner /></div> : (
                <Paper elevation={0} sx={{ borderRadius: "12px", overflow: "hidden" }}>
                  <TableContainer><Table>
                    {renderTableHead(true)}
                    <TableBody>
                      {paginatedDuplicates.map((ticket) => renderTicketRow(ticket, { showDuplicate: false, isDupPage: true }))}
                      {sortedDuplicates.length === 0 && <TableRow><TableCell colSpan={8} sx={{ textAlign: "center", py: 4, color: "#999" }}>{t("pages.agentTicket.noDuplicatesForSubject")}</TableCell></TableRow>}
                    </TableBody>
                  </Table></TableContainer>
                  <TablePagination component="div" count={sortedDuplicates.length} page={safeDupPage} onPageChange={(_, p) => setDupPage(p)} rowsPerPage={dupRowsPerPage} onRowsPerPageChange={(e) => { setDupRowsPerPage(parseInt(e.target.value, 10)); setDupPage(0); }} rowsPerPageOptions={[5, 10, 25, 50]} />
                </Paper>
              )}
            </div>
          </>
        )}

        {/* ── MAIN LIST VIEW ── */}
        {currentPage === "list" && (
          <>
            <div style={{ fontSize: "28px", fontWeight: "700", marginBottom: "25px", color: "#333" }}>
              {t("pages.agentTicket.listOfTickets")} <span style={{ color: "#FF8040" }}>• {sortedTickets.length}</span>
            </div>
            <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              {loading ? <div style={{ textAlign: "center", padding: "20px" }}><LoadingSpinner /></div> : (
                <Paper elevation={0} sx={{ borderRadius: "12px", overflow: "hidden" }}>
                  <TableContainer><Table>
                    {renderTableHead(false)}
                    <TableBody>
                      {paginatedTickets.map((ticket) => renderTicketRow(ticket))}
                      {sortedTickets.length === 0 && <TableRow><TableCell colSpan={7} sx={{ textAlign: "center", py: 4, color: "#999" }}>{t("pages.agentTicket.empty")}</TableCell></TableRow>}
                    </TableBody>
                  </Table></TableContainer>
                  <TablePagination component="div" count={sortedTickets.length} page={safePage} onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[5, 10, 25, 50]} />
                </Paper>
              )}
            </div>
          </>
        )}
      </div>

      <button onClick={() => setChatOpen(!chatOpen)} style={{ position: "fixed", bottom: "30px", right: "30px", width: "60px", height: "60px", borderRadius: "50%", background: "#FF8040", border: "none", color: "white", cursor: "pointer", boxShadow: "0 4px 12px rgba(255, 128, 64, 0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <MdChat size={28} />
      </button>
      <ChatBot isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}

function AttachmentButton({ file, downloadingId, onView, isAgentReply = false }) {
  return (
    <button type="button" onClick={onView} disabled={downloadingId === file.id}
      style={{ width: "100%", textAlign: "left", border: `1px solid ${isAgentReply ? "rgba(255,255,255,0.4)" : "#fde4d4"}`, borderRadius: "8px", background: downloadingId === file.id ? (isAgentReply ? "rgba(255,255,255,0.15)" : "#fde4d4") : (isAgentReply ? "rgba(255,255,255,0.12)" : "#fffaf7"), padding: "8px 10px", cursor: downloadingId === file.id ? "not-allowed" : "pointer", opacity: downloadingId === file.id ? 0.6 : 1, display: "flex", alignItems: "center", gap: "8px", transition: "all 0.2s" }}
      onMouseEnter={(e) => { if (downloadingId !== file.id) e.currentTarget.style.background = isAgentReply ? "rgba(255,255,255,0.22)" : "#fde4d4"; }}
      onMouseLeave={(e) => { if (downloadingId !== file.id) e.currentTarget.style.background = isAgentReply ? "rgba(255,255,255,0.12)" : "#fffaf7"; }}
    >
      <MdAttachFile size={15} color={isAgentReply ? "white" : "#FF8040"} />
      <div style={{ minWidth: 0 }}>
        <div style={{ color: isAgentReply ? "white" : "#374151", fontWeight: "600", fontSize: "12px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {file.fileName ?? file.name ?? "Attachment"}
        </div>
        <div style={{ color: isAgentReply ? "rgba(255,255,255,0.65)" : "#9ca3af", fontSize: "11px", marginTop: "1px" }}>
          {downloadingId === file.id ? "Loading..." : "Click to view"}
        </div>
      </div>
    </button>
  );
}