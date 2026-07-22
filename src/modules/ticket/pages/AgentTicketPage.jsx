import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  MdChat, MdArrowBack,
  MdSupportAgent, MdPerson, MdDelete, MdDeleteSweep,
  MdOutlineFilterNone,
} from "react-icons/md";
import {
  Checkbox, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TablePagination, TableRow, TableSortLabel,
} from "@mui/material";
import ChatBot from "../../../components/ui/ChatBot";
import SearchBar from "../../../components/ui/SearchBar";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import TicketRecommendation from "../components/TicketRecommendation";
import {
  getAllTickets, deleteTicket,
  takeAction,
} from "../ticket.service";
import { sortTickets, getPriorityColor, getStatusColor, formatTicketDate, getIntentLabel, getIntentColor } from "../ticket.schema";

export default function AgentTicketPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [chatOpen, setChatOpen] = useState(false);
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

  // ── Navigate helpers ──
  const navigateTo = useCallback((p) => setPageHistory((prev) => [...prev, p]), []);
  const navigateBack = useCallback(() => setPageHistory((prev) => prev.length > 1 ? prev.slice(0, -1) : prev), []);

  // ── Queries ──
  const { data: tickets = [], isLoading: loading } = useQuery({
    queryKey: ["all-tickets"],
    queryFn: getAllTickets,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // ── Mutations ──
  const handleTakeAction = async (ticket) => {
    try {
      await takeAction(ticket.id);
      queryClient.invalidateQueries({ queryKey: ["all-tickets"] });
    } catch (err) {
      console.error("Error taking action:", err.message);
      alert("Failed to take action.");
    }
  };

  // ── Sorting & Pagination ──
  const getDuplicates = useCallback((ticket, allTickets) =>
    allTickets.filter((t) => t.id !== ticket.id && t.subject?.trim().toLowerCase() === ticket.subject?.trim().toLowerCase()), []);

  const sortedTickets = useMemo(
    () => sortTickets(tickets.filter((t) => t.status !== "Solved"), orderBy, order),
    [tickets, orderBy, order]
  );
  const sortedDuplicates = useMemo(() => {
    if (!duplicateSource) return [];
    return sortTickets(getDuplicates(duplicateSource, tickets), dupOrderBy, dupOrder);
  }, [duplicateSource, tickets, dupOrderBy, dupOrder, getDuplicates]);

  const safePage = useMemo(
    () => Math.min(page, Math.max(0, Math.ceil(sortedTickets.length / rowsPerPage) - 1)),
    [page, rowsPerPage, sortedTickets.length]
  );
  const paginatedTickets = useMemo(
    () => sortedTickets.slice(safePage * rowsPerPage, safePage * rowsPerPage + rowsPerPage),
    [rowsPerPage, safePage, sortedTickets]
  );
  const safeDupPage = useMemo(
    () => Math.min(dupPage, Math.max(0, Math.ceil(sortedDuplicates.length / dupRowsPerPage) - 1)),
    [dupPage, dupRowsPerPage, sortedDuplicates.length]
  );
  const paginatedDuplicates = useMemo(
    () => sortedDuplicates.slice(safeDupPage * dupRowsPerPage, safeDupPage * dupRowsPerPage + dupRowsPerPage),
    [dupRowsPerPage, safeDupPage, sortedDuplicates]
  );

  // ── Checkbox helpers ──
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

  // ── Sort handlers ──
  const handleRequestSort = useCallback((property) => {
    setOrder((prev) => (orderBy === property && prev === "asc" ? "desc" : "asc"));
    setOrderBy(property);
    setPage(0);
  }, [orderBy]);
  const handleDupSort = useCallback((property) => {
    setDupOrder((prev) => (dupOrderBy === property && prev === "asc" ? "desc" : "asc"));
    setDupOrderBy(property);
    setDupPage(0);
  }, [dupOrderBy]);

  // ── Delete handlers ──
  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(t("pages.agentTicket.confirmDeleteSelected", { count: selectedIds.size }))) return;
    try {
      setDeleting(true);
      await Promise.all([...selectedIds].map((id) => deleteTicket(id)));
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ["all-tickets"] });
    } catch (err) {
      console.error("Error deleting tickets:", err.message);
      alert(t("pages.agentTicket.errors.deleteSome"));
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteAll = async () => {
    if (sortedDuplicates.length === 0) return;
    if (!window.confirm(t("pages.agentTicket.confirmDeleteAllDuplicates", { count: sortedDuplicates.length }))) return;
    try {
      setDeleting(true);
      await Promise.all(sortedDuplicates.map((t) => deleteTicket(t.id)));
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ["all-tickets"] });
      setPageHistory(["list"]);
    } catch (err) {
      console.error("Error deleting all duplicates:", err.message);
      alert(t("pages.agentTicket.errors.deleteAll"));
    } finally {
      setDeleting(false);
    }
  };

  // ── Navigation handlers ──
  const openTicketDetail = useCallback((ticket) => {
    navigate(`/dashboard/csAgent/ticket/${ticket.id}`);
  }, [navigate]);

  const openDuplicates = useCallback((ticket) => {
    setDuplicateSource(ticket);
    setDupPage(0);
    setSelectedIds(new Set());
    navigateTo("duplicates");
  }, [navigateTo]);

  // ── Table columns ──
  const columns = [
    { id: "id",        label: t("pages.agentTicket.columns.ticketId")  },
    { id: "subject",   label: t("pages.agentTicket.columns.subject")    },
    { id: "priority",  label: t("pages.agentTicket.columns.priority")   },
    { id: "intent",    label: t("pages.agentTicket.columns.issue")      },
    { id: "status",    label: t("pages.agentTicket.columns.status")     },
    { id: "solver",    label: t("pages.agentTicket.columns.assignedTo") },
    { id: "createdAt", label: t("pages.agentTicket.columns.createdAt")  },
  ];

  // ── Row renderer ──
  const renderTicketRow = (ticket, { showDuplicate = true, isDupPage = false } = {}) => {
    const isAssignedToSelf = ticket.solver === "You";
    const isDispatched = ticket.solver && ticket.solver !== "Not yet" && !isAssignedToSelf;
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
        <TableCell sx={{ color: "#666", fontSize: "13px" }}>{ticket.id}</TableCell>
        <TableCell>{ticket.subject}</TableCell>
        <TableCell sx={{ color: getPriorityColor(ticket.priority), fontWeight: 500 }}>{ticket.priority ?? "-"}</TableCell>
        <TableCell sx={{ color: getIntentColor(ticket.intent), fontWeight: 500 }}>{getIntentLabel(ticket.intent)}</TableCell>
        <TableCell sx={{ color: getStatusColor(ticket.status), fontWeight: 600 }}>{ticket.status}</TableCell>
        <TableCell>
          {isDispatched ? (
            <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "#333" }}>
              <MdPerson size={16} /> {ticket.solver}
            </span>
          ) : isAssignedToSelf ? (
            <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "#FF8040" }}>
              <MdSupportAgent size={16} /> {t("pages.agentTicket.you")}
            </span>
          ) : (
            <span style={{ color: "#999", fontSize: "13px" }}>{t("pages.agentTicket.unassigned")}</span>
          )}
        </TableCell>
        <TableCell>{formatTicketDate(ticket.createdAt)}</TableCell>
        <TableCell>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              onClick={() => openTicketDetail(ticket)}
              style={{ background: "#FF8040", color: "white", border: "none", padding: "6px 14px", borderRadius: "6px", fontWeight: "600", cursor: "pointer", fontSize: "13px" }}
            >
              {t("pages.agentTicket.detail")}
            </button>
            {!isAssignedToSelf && !isDispatched && (
              <button
                onClick={() => handleTakeAction(ticket)}
                style={{ background: "white", color: "#FF8040", border: "2px solid #FF8040", padding: "6px 14px", borderRadius: "6px", fontWeight: "600", cursor: "pointer", fontSize: "13px" }}
              >
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

  // ── Table head renderer ──
  const renderTableHead = (isDupPage = false) => (
    <TableHead>
      <TableRow sx={{ borderBottom: "2px solid #f0f0f0" }}>
        {isDupPage && (
          <TableCell padding="checkbox">
            <Checkbox
              checked={allChecked}
              indeterminate={someChecked}
              onChange={toggleAll}
              sx={{ color: "#FF8040", "&.Mui-checked": { color: "#FF8040" }, "&.MuiCheckbox-indeterminate": { color: "#FF8040" } }}
            />
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

  // ── Render ──
  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>

      {/* ── Top bar ── */}
      <div style={{ background: "white", padding: "15px 30px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 5px rgba(0,0,0,0.05)", height: "70px" }}>
        {pageHistory.length > 1 ? (
          <button
            onClick={navigateBack}
            style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", color: "#FF8040", fontWeight: "600", fontSize: "14px" }}
          >
            <MdArrowBack size={20} /> {t("pages.agentTicket.back")}
          </button>
        ) : (
          <SearchBar />
        )}
      </div>

      <div style={{ padding: "30px", flex: 1, overflowY: "auto" }}>

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
                <button
                  onClick={handleDeleteSelected}
                  disabled={selectedIds.size === 0 || deleting}
                  style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 18px", borderRadius: "8px", fontWeight: "600", fontSize: "14px", cursor: selectedIds.size === 0 || deleting ? "not-allowed" : "pointer", border: `2px solid ${selectedIds.size === 0 ? "#ddd" : "#FF8040"}`, background: "white", color: selectedIds.size === 0 ? "#bbb" : "#FF8040", opacity: deleting ? 0.7 : 1 }}
                >
                  <MdDelete size={17} />
                  {t("pages.agentTicket.delete")}{selectedIds.size > 0 ? ` (${selectedIds.size})` : ""}
                </button>
                <button
                  onClick={handleDeleteAll}
                  disabled={sortedDuplicates.length === 0 || deleting}
                  style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 18px", borderRadius: "8px", fontWeight: "600", fontSize: "14px", cursor: sortedDuplicates.length === 0 || deleting ? "not-allowed" : "pointer", border: "none", background: sortedDuplicates.length === 0 ? "#ddd" : "#FF8040", color: "white", opacity: deleting ? 0.7 : 1 }}
                >
                  <MdDeleteSweep size={18} />
                  {deleting ? t("pages.agentTicket.deleting") : t("pages.agentTicket.deleteAll")}
                </button>
              </div>
            </div>
            <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              {loading ? (
                <div style={{ textAlign: "center", padding: "20px" }}><LoadingSpinner /></div>
              ) : (
                <Paper elevation={0} sx={{ borderRadius: "12px", overflow: "hidden" }}>
                  <TableContainer>
                    <Table>
                      {renderTableHead(true)}
                      <TableBody>
                        {paginatedDuplicates.map((ticket) => renderTicketRow(ticket, { showDuplicate: false, isDupPage: true }))}
                        {sortedDuplicates.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={8} sx={{ textAlign: "center", py: 4, color: "#999" }}>
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
                    onPageChange={(_, p) => setDupPage(p)}
                    rowsPerPage={dupRowsPerPage}
                    onRowsPerPageChange={(e) => { setDupRowsPerPage(parseInt(e.target.value, 10)); setDupPage(0); }}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                  />
                </Paper>
              )}
            </div>
          </>
        )}

        {/* ── MAIN LIST VIEW ── */}
        {currentPage === "list" && (
          <>
            <TicketRecommendation 
              onTakeAction={(ticketId) => handleTakeAction({ id: ticketId })} 
              onDetail={(ticketId) => openTicketDetail({ id: ticketId })}
            />
            <div style={{ fontSize: "28px", fontWeight: "700", marginBottom: "25px", color: "#333" }}>
              {t("pages.agentTicket.listOfTickets")} <span style={{ color: "#FF8040" }}>• {sortedTickets.length}</span>
            </div>
            <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              {loading ? (
                <div style={{ textAlign: "center", padding: "20px" }}><LoadingSpinner /></div>
              ) : (
                <Paper elevation={0} sx={{ borderRadius: "12px", overflow: "hidden" }}>
                  <TableContainer>
                    <Table>
                      {renderTableHead(false)}
                      <TableBody>
                        {paginatedTickets.map((ticket) => renderTicketRow(ticket))}
                        {sortedTickets.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={7} sx={{ textAlign: "center", py: 4, color: "#999" }}>
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
                    onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                  />
                </Paper>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── ChatBot FAB ── */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        style={{ position: "fixed", bottom: "30px", right: "30px", width: "60px", height: "60px", borderRadius: "50%", background: "#FF8040", border: "none", color: "white", cursor: "pointer", boxShadow: "0 4px 12px rgba(255, 128, 64, 0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <MdChat size={28} />
      </button>
      <ChatBot isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}