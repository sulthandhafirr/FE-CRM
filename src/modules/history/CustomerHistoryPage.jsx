import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { getTicketHistory } from "../ticket/ticket.service";
import { formatTicketDate } from "../ticket/ticket.schema";

export default function CustomerHistoryPage() {
  const [chatOpen, setChatOpen] = useState(false);
  const [orderBy, setOrderBy] = useState("resolvedAt");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

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
    return [...historyTickets].sort((a, b) => {
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
  }, [historyTickets, order, orderBy]);

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
        <SearchBar />
      </div>

      {/* Dynamic Content */}
      <div style={{ padding: "30px", flex: 1, overflowY: "auto" }}>
        <div
          style={{
            fontSize: "28px",
            fontWeight: "700",
            marginBottom: "25px",
            color: "#333",
          }}
        >
          History Ticket{" "}
          <span style={{ color: "#FF8040" }}>• {historyTickets.length}</span>
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
                  <TableHead>
                    <TableRow sx={{ borderBottom: "2px solid #f0f0f0" }}>
                      <TableCell sx={{ color: "#FF8040", fontWeight: 700 }}>
                        <TableSortLabel
                          active={orderBy === "id"}
                          direction={orderBy === "id" ? order : "asc"}
                          onClick={() => handleRequestSort("id")}
                        >
                          Ticket ID
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ color: "#FF8040", fontWeight: 700 }}>
                        <TableSortLabel
                          active={orderBy === "subject"}
                          direction={orderBy === "subject" ? order : "asc"}
                          onClick={() => handleRequestSort("subject")}
                        >
                          Subject
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ color: "#FF8040", fontWeight: 700 }}>
                        Status
                      </TableCell>
                      <TableCell sx={{ color: "#FF8040", fontWeight: 700 }}>
                        <TableSortLabel
                          active={orderBy === "handler"}
                          direction={orderBy === "handler" ? order : "asc"}
                          onClick={() => handleRequestSort("handler")}
                        >
                          Solved By
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ color: "#FF8040", fontWeight: 700 }}>
                        <TableSortLabel
                          active={orderBy === "resolvedAt"}
                          direction={orderBy === "resolvedAt" ? order : "asc"}
                          onClick={() => handleRequestSort("resolvedAt")}
                        >
                          Solved At
                        </TableSortLabel>
                      </TableCell>
                      {/* <TableCell sx={{ color: "#FF8040", fontWeight: 700 }}>
                        Satisfaction
                      </TableCell> */}
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
                        {/* <TableCell sx={{ color: "#666" }}>
                          {ticket.satisfaction || "-"}
                        </TableCell> */}
                      </TableRow>
                    ))}

                    {sortedTickets.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          sx={{ textAlign: "center", py: 4, color: "#999" }}
                        >
                          None
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
      </div>

      {/* Floating Chat Button */}
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
          fontSize: "28px",
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
