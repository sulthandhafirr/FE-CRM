import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
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
import SearchBar from "../../components/ui/SearchBar";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { getPaymentList } from "../payment/payment.service";
import {
  formatCurrency,
  formatPaymentDate,
  getPaymentStatusColor,
  isPaymentOverdue,
  // formatPaymentStatus,
} from "../payment/payment.schema";
import { ROUTE } from "../../app/routes";
import { useAuth } from "../../hooks/useAuth";

export default function PaymentPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [orderBy, setOrderBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState("");
  const { role } = useAuth();

  const { data: payments = [], isLoading: loading } = useQuery({
    queryKey: ["payments"],
    queryFn: getPaymentList,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    refetchInterval: 5000,
    refetchIntervalInBackground: false,
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

  const getTicketRoute = (role, ticketId) => {
    switch (role) {
      case "customer":
        return ROUTE.customerTicketDetail.replace(":ticketId", ticketId);

      case "cs_agent":
        return ROUTE.agentTicketDetail.replace(":ticketId", ticketId);

      case "technician":
        return ROUTE.technicianTicketDetail.replace(":ticketId", ticketId);

      case "admin":
        return ROUTE.adminTicketDetail.replace(":ticketId", ticketId);

      default:
        return null;
    }
  };

  const filteredPayments = useMemo(() => {
    return [...payments]
      .filter((payment) => {
        const q = search.toLowerCase();

        return (
          String(payment.id).includes(q) ||
          payment.midtransOrderId?.toLowerCase().includes(q) ||
          payment.ticketSubject?.toLowerCase().includes(q) ||
          payment.customerName?.toLowerCase().includes(q) ||
          payment.status?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        let aValue = a[orderBy];
        let bValue = b[orderBy];

        if (
          orderBy === "createdAt" ||
          orderBy === "dueDate" ||
          orderBy === "paidAt"
        ) {
          aValue = aValue ? new Date(aValue).getTime() : 0;
          bValue = bValue ? new Date(bValue).getTime() : 0;
        }

        if (
          orderBy === "id" ||
          orderBy === "ticketId" ||
          orderBy === "amount"
        ) {
          aValue = Number(aValue);
          bValue = Number(bValue);
        }

        if (aValue == null) aValue = "";
        if (bValue == null) bValue = "";

        if (typeof aValue === "string") aValue = aValue.toLowerCase();
        if (typeof bValue === "string") bValue = bValue.toLowerCase();

        if (aValue < bValue) return order === "asc" ? -1 : 1;
        if (aValue > bValue) return order === "asc" ? 1 : -1;

        return 0;
      });
  }, [payments, order, orderBy, search]);

  const safePage = useMemo(() => {
    const maxPage = Math.max(
      0,
      Math.ceil(filteredPayments.length / rowsPerPage) - 1,
    );

    return Math.min(page, maxPage);
  }, [page, rowsPerPage, filteredPayments.length]);

  const paginatedPayments = useMemo(() => {
    const start = safePage * rowsPerPage;
    return filteredPayments.slice(start, start + rowsPerPage);
  }, [filteredPayments, rowsPerPage, safePage]);

  return (
    <div
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
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
        <SearchBar
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
        />
      </div>

      <div
        style={{
          padding: "30px",
          flex: 1,
          overflowY: "auto",
        }}
      >
        <div
          style={{
            fontSize: "28px",
            fontWeight: "700",
            marginBottom: "25px",
            color: "#333",
          }}
        >
          {t("pages.payment.title")}{" "}
          <span style={{ color: "#FF8040" }}>• {filteredPayments.length}</span>
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
              sx={{
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ borderBottom: "2px solid #f0f0f0" }}>
                      {/* <TableCell sx={{ color: "#FF8040", fontWeight: 700 }}>
                        <TableSortLabel
                          active={orderBy === "id"}
                          direction={orderBy === "id" ? order : "asc"}
                          onClick={() => handleRequestSort("id")}
                        >
                          {t("pages.payment.paymentId")}
                        </TableSortLabel>
                      </TableCell> */}
                      <TableCell
                        sx={{
                          color: "#FF8040",
                          fontWeight: 700,
                        }}
                      >
                        No
                      </TableCell>

                      <TableCell sx={{ color: "#FF8040", fontWeight: 700 }}>
                        <TableSortLabel
                          active={orderBy === "midtransOrderId"}
                          direction={
                            orderBy === "midtransOrderId" ? order : "asc"
                          }
                          onClick={() => handleRequestSort("midtransOrderId")}
                        >
                          {t("pages.payment.orderId")}
                        </TableSortLabel>
                      </TableCell>

                      <TableCell sx={{ color: "#FF8040", fontWeight: 700 }}>
                        <TableSortLabel
                          active={orderBy === "ticketSubject"}
                          direction={
                            orderBy === "ticketSubject" ? order : "asc"
                          }
                          onClick={() => handleRequestSort("ticketSubject")}
                        >
                          {t("pages.payment.ticket")}
                        </TableSortLabel>
                      </TableCell>

                      <TableCell sx={{ color: "#FF8040", fontWeight: 700 }}>
                        <TableSortLabel
                          active={orderBy === "customerName"}
                          direction={orderBy === "customerName" ? order : "asc"}
                          onClick={() => handleRequestSort("customerName")}
                        >
                          {t("pages.payment.customer")}
                        </TableSortLabel>
                      </TableCell>

                      <TableCell sx={{ color: "#FF8040", fontWeight: 700 }}>
                        <TableSortLabel
                          active={orderBy === "amount"}
                          direction={orderBy === "amount" ? order : "asc"}
                          onClick={() => handleRequestSort("amount")}
                        >
                          {t("pages.payment.amount")}
                        </TableSortLabel>
                      </TableCell>

                      <TableCell sx={{ color: "#FF8040", fontWeight: 700 }}>
                        {t("pages.payment.status")}
                      </TableCell>

                      <TableCell sx={{ color: "#FF8040", fontWeight: 700 }}>
                        <TableSortLabel
                          active={orderBy === "paidAt"}
                          direction={orderBy === "paidAt" ? order : "asc"}
                          onClick={() => handleRequestSort("paidAt")}
                        >
                          {t("pages.payment.paidAt")}
                        </TableSortLabel>
                      </TableCell>

                      <TableCell sx={{ color: "#FF8040", fontWeight: 700 }}>
                        <TableSortLabel
                          active={orderBy === "dueDate"}
                          direction={orderBy === "dueDate" ? order : "asc"}
                          onClick={() => handleRequestSort("dueDate")}
                        >
                          {t("pages.payment.dueDate")}
                        </TableSortLabel>
                      </TableCell>

                      <TableCell sx={{ color: "#FF8040", fontWeight: 700 }}>
                        {t("pages.payment.action")}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedPayments.map((payment, index) => {
                      const overdue = isPaymentOverdue(payment);

                      return (
                        <TableRow
                          key={payment.id}
                          sx={{ borderBottom: "1px solid #f0f0f0" }}
                        >
                          <TableCell sx={{ color: "#666", fontSize: "13px" }}>
                            {safePage * rowsPerPage + index + 1}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontFamily: "monospace",
                              fontSize: "13px",
                              color: "#666",
                            }}
                          >
                            {payment.midtransOrderId}
                          </TableCell>

                          <TableCell>{payment.ticketSubject}</TableCell>

                          <TableCell>{payment.customerName || "-"}</TableCell>

                          <TableCell>
                            {formatCurrency(payment.amount)}
                          </TableCell>

                          <TableCell
                            sx={{
                              color: overdue
                                ? "#DC2626"
                                : getPaymentStatusColor(payment.status),
                              fontWeight: 600,
                            }}
                          >
                            {overdue
                              ? t("pages.payment.overdue")
                              : t(`pages.payment.statuses.${payment.status}`)}
                          </TableCell>

                          <TableCell>
                            {payment.paidAt
                              ? formatPaymentDate(payment.paidAt)
                              : "-"}
                          </TableCell>

                          <TableCell>
                            {formatPaymentDate(payment.dueDate)}
                          </TableCell>

                          <TableCell>
                            <button
                              onClick={() => {
                                const path = getTicketRoute(
                                  role,
                                  payment.ticketId,
                                );

                                if (path) {
                                  navigate(path);
                                }
                              }}
                              style={{
                                background: "#FF8040",
                                color: "white",
                                border: "none",
                                padding: "6px 15px",
                                borderRadius: "6px",
                                cursor: "pointer",
                              }}
                            >
                              {t("pages.payment.details")}
                            </button>
                          </TableCell>
                        </TableRow>
                      );
                    })}

                    {filteredPayments.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          sx={{
                            textAlign: "center",
                            py: 4,
                            color: "#999",
                          }}
                        >
                          {t("pages.payment.noPayments")}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={filteredPayments.length}
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
    </div>
  );
}
