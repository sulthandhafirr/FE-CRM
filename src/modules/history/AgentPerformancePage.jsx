import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { MdChat } from "react-icons/md";
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
import ChatBot from "../../components/ui/ChatBot";
import SearchBar from "../../components/ui/SearchBar";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { getAgentSolvedTickets } from "../ticket/ticket.service";
import { formatTicketDate, getPriorityColor } from "../ticket/ticket.schema";

function sortTicketsFn(list, ob, o) {
  return [...list].sort((a, b) => {
    let aValue = a[ob];
    let bValue = b[ob];
    if (ob === "resolvedAt" || ob === "createdAt") {
      aValue = new Date(aValue ?? 0).getTime();
      bValue = new Date(bValue ?? 0).getTime();
    }
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

export default function AgentPerformancePage() {
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);
  const [orderBy, setOrderBy] = useState("resolvedAt");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const { data: solvedTickets = [], isLoading: loading } = useQuery({
    queryKey: ["agent-solved-tickets"],
    queryFn: getAgentSolvedTickets,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const handleRequestSort = (property) => {
    setOrder((prev) => (orderBy === property && prev === "asc" ? "desc" : "asc"));
    setOrderBy(property);
    setPage(0);
  };

  const sortedTickets = useMemo(
    () => sortTicketsFn(solvedTickets, orderBy, order),
    [solvedTickets, orderBy, order]
  );

  const safePage = useMemo(() => {
    const maxPage = Math.max(0, Math.ceil(sortedTickets.length / rowsPerPage) - 1);
    return Math.min(page, maxPage);
  }, [page, rowsPerPage, sortedTickets.length]);

  const paginatedTickets = useMemo(() => {
    const start = safePage * rowsPerPage;
    return sortedTickets.slice(start, start + rowsPerPage);
  }, [rowsPerPage, safePage, sortedTickets]);

  const columns = [
    { id: "id",         label: "Ticket ID"   },
    { id: "subject",    label: "Subject"      },
    { id: "priority",   label: "Priority"     },
    { id: "customer",   label: "Customer"     },
    { id: "createdAt",  label: "Created At"   },
    { id: "resolvedAt", label: "Resolved At"  },
  ];

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Top Bar */}
      <div style={{
        background: "white", padding: "15px 30px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 2px 5px rgba(0,0,0,0.05)", height: "70px",
      }}>
        <SearchBar />
      </div>

      <div style={{ padding: "30px", flex: 1, overflowY: "auto" }}>
        {/* Title + summary */}
        <div style={{ marginBottom: "25px" }}>
          <div style={{ fontSize: "28px", fontWeight: "700", color: "#333", marginBottom: "6px" }}>
            My Performance{" "}
            <span style={{ color: "#FF8040" }}>• {solvedTickets.length}</span>
          </div>
        </div>

        {/* Stats cards */}
        {!loading && solvedTickets.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
            marginBottom: "24px",
          }}>
            {[
              {
                label: "Total Resolved",
                value: solvedTickets.length,
                color: "#FF8040",
                bg: "#ffffff",
                border: "#FF8040",
              },
              {
                label: "This Month",
                value: solvedTickets.filter((t) => {
                  if (!t.resolvedAt) return false;
                  const d = new Date(t.resolvedAt);
                  const now = new Date();
                  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                }).length,
                color: "#FF8040",
                bg: "#ffffff",
                border: "#FF8040",
              },
              {
                label: "This Year",
                value: solvedTickets.filter((t) => {
                  if (!t.resolvedAt) return false;
                  return new Date(t.resolvedAt).getFullYear() === new Date().getFullYear();
                }).length,
                color: "#FF8040",
                bg: "#ffffff",
                border: "#FF8040",
              },
            ].map((stat) => (
              <div key={stat.label} style={{
                background: stat.bg,
                border: `1px solid ${stat.border}`,
                borderRadius: "12px",
                padding: "20px 24px",
              }}>
                <div style={{ fontSize: "13px", color: "#666", marginBottom: "6px" }}>{stat.label}</div>
                <div style={{ fontSize: "32px", fontWeight: "700", color: stat.color }}>{stat.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Table */}
        <div style={{
          background: "white", borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <LoadingSpinner />
            </div>
          ) : (
            <Paper elevation={0} sx={{ borderRadius: "12px", overflow: "hidden" }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ borderBottom: "2px solid #f0f0f0" }}>
                      {columns.map(({ id, label }) => (
                        <TableCell key={id} sx={{ color: "#FF8040", fontWeight: 700 }}>
                          <TableSortLabel
                            active={orderBy === id}
                            direction={orderBy === id ? order : "asc"}
                            onClick={() => handleRequestSort(id)}
                            sx={{
                              color: "#FF8040 !important",
                              "&.Mui-active": { color: "#FF8040 !important" },
                              "& .MuiTableSortLabel-icon": { color: "#FF8040 !important" },
                            }}
                          >
                            {label}
                          </TableSortLabel>
                        </TableCell>
                      ))}
                      <TableCell sx={{ color: "#FF8040", fontWeight: 700 }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedTickets.map((ticket) => (
                      <TableRow key={ticket.id} sx={{ borderBottom: "1px solid #f0f0f0" }}>
                        <TableCell sx={{ color: "#666", fontSize: "13px" }}>{ticket.id}</TableCell>
                        <TableCell>{ticket.subject || "-"}</TableCell>
                        <TableCell sx={{
                          color: getPriorityColor(ticket.priority),
                          fontWeight: 500,
                        }}>
                          {ticket.priority ?? "-"}
                        </TableCell>
                        <TableCell>{ticket.customer || "-"}</TableCell>
                        <TableCell>{formatTicketDate(ticket.createdAt)}</TableCell>
                        <TableCell sx={{ color: "#22c55e", fontWeight: 600 }}>
                          {formatTicketDate(ticket.resolvedAt)}
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => navigate(`/agent/tickets/${ticket.id}`)}
                            style={{
                              background: "#FF8040", color: "white",
                              border: "none", padding: "6px 15px",
                              borderRadius: "6px", cursor: "pointer",
                              fontWeight: "600", fontSize: "13px",
                            }}
                          >
                            Detail
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {sortedTickets.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} sx={{ textAlign: "center", py: 4, color: "#999" }}>
                          No resolved tickets yet.
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
      </div>

      {/* Floating Chat */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        style={{
          position: "fixed", bottom: "30px", right: "30px",
          width: "60px", height: "60px", borderRadius: "50%",
          background: "#FF8040", border: "none", color: "white",
          cursor: "pointer", boxShadow: "0 4px 12px rgba(255, 128, 64, 0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <MdChat size={28} />
      </button>
      <ChatBot isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}