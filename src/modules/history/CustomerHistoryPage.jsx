import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
} from "@mui/material";
import ChatFab from "../../components/ui/ChatFab";
import SearchBar from "../../components/ui/SearchBar";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { getTicketHistory } from "../ticket/ticket.service";
import { formatTicketDate } from "../ticket/ticket.schema";
import { ROUTE } from "../../app/routes";

export default function CustomerHistoryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [orderBy, setOrderBy] = useState("resolvedAt");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState("");

  const { data: historyTickets = [], isLoading: loading } = useQuery({
    queryKey: ["history-tickets"],
    queryFn: getTicketHistory,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
    setPage(0);
  };

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const sortedTickets = useMemo(() => {
    return [...historyTickets]
      .filter((t) => {
        const q = search.toLowerCase();
        return (
          String(t.id).toLowerCase().includes(q) ||
          t.subject?.toLowerCase().includes(q) ||
          t.status?.toLowerCase().includes(q) ||
          t.handler?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        let aValue = a[orderBy];
        let bValue = b[orderBy];

        if (orderBy === "resolvedAt" || orderBy === "createdAt") {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }

        if (orderBy === "id") {
          aValue = Number(aValue);
          bValue = Number(bValue);
        }

        if (aValue === null || aValue === undefined) aValue = "";
        if (bValue === null || bValue === undefined) bValue = "";

        if (typeof aValue === "string") aValue = aValue.toLowerCase();
        if (typeof bValue === "string") bValue = bValue.toLowerCase();

        if (aValue < bValue) return order === "asc" ? -1 : 1;
        if (aValue > bValue) return order === "asc" ? 1 : -1;
        return 0;
      });
  }, [historyTickets, order, orderBy, search]);

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

  const handleViewDetail = (ticketId) => {
    const isUltrauserHistory = location.pathname.startsWith("/ultrauser");
    const targetPath = isUltrauserHistory
      ? ROUTE.ultrauserTicketCustomerDetail.replace(":ticketId", ticketId)
      : ROUTE.customerTicketDetail.replace(":ticketId", ticketId);
    navigate(targetPath);
  };

  return (
    <div
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <style>{`
        @media (max-width: 767px) {
          .customer-history-header {
            padding: 12px 16px;
            height: auto;
          }
          .customer-history-content {
            padding: 16px;
          }
          .customer-history-title {
            font-size: 24px;
            margin-bottom: 16px;
          }
          .customer-history-table-wrapper {
            display: none;
          }
          .customer-history-cards-wrapper {
            display: block;
          }
        }
        @media (min-width: 768px) {
          .customer-history-table-wrapper {
            display: block;
          }
          .customer-history-cards-wrapper {
            display: none;
          }
        }
      `}</style>
      {/* Top Bar */}
      <div
        className="customer-history-header"
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
        <SearchBar
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
        />
      </div>

      {/* Dynamic Content */}
      <div
        className="customer-history-content"
        style={{ padding: "30px", flex: 1, overflowY: "auto" }}
      >
        <div
          className="customer-history-title"
          style={{
            fontSize: "28px",
            fontWeight: "700",
            marginBottom: "25px",
            color: "#333",
          }}
        >
          {t("pages.customerHistory.title")}{" "}
          <span style={{ color: "#FF8040" }}>• {historyTickets.length}</span>
        </div>

        {/* Desktop Table View */}
        <div
          className="customer-history-table-wrapper"
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
                  <TableHead>
                    <TableRow sx={{ borderBottom: "2px solid #f0f0f0" }}>
                      <TableCell sx={{ color: "#FF8040", fontWeight: 700 }}>
                        <TableSortLabel
                          active={orderBy === "id"}
                          direction={orderBy === "id" ? order : "asc"}
                          onClick={() => handleRequestSort("id")}
                        >
                          {t("pages.customerHistory.columns.ticketId")}
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ color: "#FF8040", fontWeight: 700 }}>
                        <TableSortLabel
                          active={orderBy === "subject"}
                          direction={orderBy === "subject" ? order : "asc"}
                          onClick={() => handleRequestSort("subject")}
                        >
                          {t("pages.customerHistory.columns.subject")}
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ color: "#FF8040", fontWeight: 700 }}>
                        {t("pages.customerHistory.columns.status")}
                      </TableCell>
                      <TableCell sx={{ color: "#FF8040", fontWeight: 700 }}>
                        <TableSortLabel
                          active={orderBy === "handler"}
                          direction={orderBy === "handler" ? order : "asc"}
                          onClick={() => handleRequestSort("handler")}
                        >
                          {t("pages.customerHistory.columns.solvedBy")}
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ color: "#FF8040", fontWeight: 700 }}>
                        <TableSortLabel
                          active={orderBy === "resolvedAt"}
                          direction={orderBy === "resolvedAt" ? order : "asc"}
                          onClick={() => handleRequestSort("resolvedAt")}
                        >
                          {t("pages.customerHistory.columns.solvedAt")}
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ color: "#FF8040", fontWeight: 700 }}>
                        {t("pages.customerHistory.columns.action")}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedTickets.map((ticket) => (
                      <TableRow
                        key={ticket.id}
                        sx={{ borderBottom: "1px solid #f0f0f0" }}
                      >
                        <TableCell sx={{ color: "#666", fontSize: "13px" }}>
                          {ticket.id}
                        </TableCell>
                        <TableCell>{ticket.subject || "-"}</TableCell>
                        <TableCell sx={{ color: "#16a34a", fontWeight: 600 }}>
                          {ticket.status || "-"}
                        </TableCell>
                        <TableCell>{ticket.handler || "-"}</TableCell>
                        <TableCell>
                          {formatTicketDate(ticket.resolvedAt)}
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => handleViewDetail(ticket.id)}
                            style={{
                              background: "#FF8040",
                              color: "white",
                              border: "none",
                              padding: "6px 15px",
                              borderRadius: "6px",
                              cursor: "pointer",
                            }}
                          >
                            {t("pages.customerHistory.details")}
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}

                    {sortedTickets.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          sx={{ textAlign: "center", py: 4, color: "#999" }}
                        >
                          {t("pages.customerHistory.empty")}
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
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
            </Paper>
          )}
        </div>

        {/* Mobile Card View */}
        <div className="customer-history-cards-wrapper">
          {loading ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <LoadingSpinner />
            </div>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {paginatedTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    style={{
                      background: "white",
                      borderRadius: "12px",
                      padding: "16px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    {/* Top Row: Ticket ID and Status */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "12px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "700",
                          color: "#333",
                        }}
                      >
                        #{ticket.id}
                      </div>
                      <span
                        style={{
                          color: "#16a34a",
                          fontWeight: 600,
                          fontSize: "12px",
                          background: "#dcfce720",
                          padding: "4px 8px",
                          borderRadius: "6px",
                        }}
                      >
                        {ticket.status || "-"}
                      </span>
                    </div>

                    {/* Subject */}
                    <div
                      style={{
                        fontSize: "15px",
                        fontWeight: "600",
                        color: "#333",
                        marginBottom: "10px",
                        wordBreak: "break-word",
                      }}
                    >
                      {ticket.subject || "-"}
                    </div>

                    {/* Solved By */}
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#666",
                        marginBottom: "12px",
                      }}
                    >
                      Solved by: {ticket.handler || "Unknown"}
                    </div>

                    {/* Bottom Row: Date and Button */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontSize: "12px", color: "#999" }}>
                        {formatTicketDate(ticket.resolvedAt)}
                      </span>
                      <button
                        onClick={() => handleViewDetail(ticket.id)}
                        style={{
                          background: "#FF8040",
                          color: "white",
                          border: "none",
                          padding: "6px 14px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "13px",
                          fontWeight: "600",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {t("pages.customerHistory.details")}
                      </button>
                    </div>
                  </div>
                ))}

                {sortedTickets.length === 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      py: 4,
                      color: "#999",
                      padding: "20px",
                    }}
                  >
                    {t("pages.customerHistory.empty")}
                  </div>
                )}
              </div>

              {/* Mobile Pagination */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "12px",
                  marginTop: "20px",
                  padding: "16px 0",
                }}
              >
                <select
                  value={rowsPerPage}
                  onChange={handleChangeRowsPerPage}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "6px",
                    border: "1px solid #d1d5db",
                    fontSize: "13px",
                    background: "white",
                    cursor: "pointer",
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span style={{ fontSize: "12px", color: "#666" }}>
                  {safePage * rowsPerPage + 1}–
                  {Math.min((safePage + 1) * rowsPerPage, sortedTickets.length)}{" "}
                  of {sortedTickets.length}
                </span>
                <button
                  onClick={() => handleChangePage(null, safePage - 1)}
                  disabled={safePage === 0}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "6px",
                    border: "1px solid #d1d5db",
                    background: safePage === 0 ? "#f3f4f6" : "white",
                    cursor: safePage === 0 ? "default" : "pointer",
                    color: safePage === 0 ? "#9ca3af" : "#333",
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                >
                  ←
                </button>
                <button
                  onClick={() => handleChangePage(null, safePage + 1)}
                  disabled={
                    safePage >=
                    Math.ceil(sortedTickets.length / rowsPerPage) - 1
                  }
                  style={{
                    padding: "6px 10px",
                    borderRadius: "6px",
                    border: "1px solid #d1d5db",
                    background:
                      safePage >=
                      Math.ceil(sortedTickets.length / rowsPerPage) - 1
                        ? "#f3f4f6"
                        : "white",
                    cursor:
                      safePage >=
                      Math.ceil(sortedTickets.length / rowsPerPage) - 1
                        ? "default"
                        : "pointer",
                    color:
                      safePage >=
                      Math.ceil(sortedTickets.length / rowsPerPage) - 1
                        ? "#9ca3af"
                        : "#333",
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                >
                  →
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Floating Chat Button */}
      <ChatFab />
    </div>
  );
}
