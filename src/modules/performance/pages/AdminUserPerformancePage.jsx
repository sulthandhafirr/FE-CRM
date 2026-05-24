import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { MdArrowBack, MdChat, MdOutlinePerson, MdPersonAdd } from "react-icons/md";
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
import { ROUTE } from "../../../app/routes";
import PerformanceCard from "../components/PerformanceCard";
import { getUsersByRole } from "../../profile/profile.service";
import ChatBot from "../../../components/ui/ChatBot";
import SearchBar from "../../../components/ui/SearchBar";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { getAllTickets } from "../../ticket/ticket.service";
import {
  formatTicketDate,
  getPriorityColor,
  getStatusColor,
} from "../../ticket/ticket.schema";
import AddUserForm from "../../history/components/AddUserForm";

function sortList(list, orderBy, order) {
  return [...list].sort((a, b) => {
    let aValue = a[orderBy];
    let bValue = b[orderBy];

    if (orderBy === "createdAt") {
      aValue = new Date(aValue ?? 0).getTime();
      bValue = new Date(bValue ?? 0).getTime();
    }

    if (orderBy === "id") {
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
}

const getSkillNames = (user) => {
  if (!user.profile_skill?.length) return "-";

  return user.profile_skill
    .map((profileSkill) => profileSkill.skills?.skill)
    .filter(Boolean)
    .join(", ") || "-";
};

const AvatarIcon = ({ size = 38 }) => (
  <div
    style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: "50%",
      background: "#FFF5EF",
      border: "2px solid #FF8040",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    <MdOutlinePerson size={size * 0.58} color="#FF8040" />
  </div>
);

const StatCard = ({ label, value, color = "#FF8040" }) => (
  <div
    style={{
      flex: 1,
      background: "white",
      padding: "18px 22px",
      borderRadius: "12px",
      border: "2px solid #FF8040",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    }}
  >
    <div
      style={{
        fontSize: "13px",
        color: "#666",
        fontWeight: "500",
        marginBottom: "6px",
      }}
    >
      {label}
    </div>
    <div style={{ fontSize: "28px", fontWeight: "700", color }}>{value}</div>
  </div>
);

const SortHead = ({ columns, orderBy, order, onSort, prefixCell }) => (
  <TableHead>
    <TableRow sx={{ borderBottom: "2px solid #f0f0f0" }}>
      {prefixCell}
      {columns.map(({ id, label, sortable = true }) => (
        <TableCell key={id} sx={{ color: "#FF8040", fontWeight: 700 }}>
          {sortable ? (
            <TableSortLabel
              active={orderBy === id}
              direction={orderBy === id ? order : "asc"}
              onClick={() => onSort(id)}
              sx={{
                color: "#FF8040 !important",
                fontWeight: 700,
                "&.Mui-active": { color: "#FF8040 !important" },
                "& .MuiTableSortLabel-icon": { color: "#FF8040 !important" },
              }}
            >
              {label}
            </TableSortLabel>
          ) : (
            label
          )}
        </TableCell>
      ))}
    </TableRow>
  </TableHead>
);

export default function AdminUserPerformancePage() {
  const cards = [
    {
      badge: "CS",
      title: "CS Agent",
      description: "View CS agent performance and handled tickets.",
      route: ROUTE.adminPerformanceCsAgent,
      color: "#FF8040",
      bg: "#fff4ee",
      border: "#fcd9bc",
    },
    {
      badge: "TECH",
      title: "Technician",
      description: "View technician performance and resolved tickets.",
      route: ROUTE.adminPerformanceTechnician,
      color: "#8b5cf6",
      bg: "#f5f3ff",
      border: "#ddd6fe",
    },
    {
      badge: "CUST",
      title: "Customer",
      description: "View customer-related ticket stats and history.",
      route: ROUTE.adminPerformanceCustomer,
      color: "#3b82f6",
      bg: "#eff6ff",
      border: "#bfdbfe",
    },
  ];

  return (
    <div
      style={{
        padding: "40px",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        minHeight: "100vh",
        background: "#f9fafb",
      }}
    >
      <style>{`
        .admin-performance-selector-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }

        @media (max-width: 992px) {
          .admin-performance-selector-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div
        className="admin-performance-selector-grid"
        style={{ width: "100%" }}
      >
        {cards.map((card) => (
          <PerformanceCard key={card.title} {...card} />
        ))}
      </div>
    </div>
  );
}

export function AdminUserPerformanceView({ initialTab = "cs_agent", showAdd = true }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [addUserOpen, setAddUserOpen] = useState(false);
  const { t } = useTranslation();

  const tabs = [
    { key: "cs_agent", label: t("pages.adminUserPerformance.tabs.cs_agent"), roleId: 2 },
    { key: "technician", label: t("pages.adminUserPerformance.tabs.technician"), roleId: 3 },
    { key: "customer", label: t("pages.adminUserPerformance.tabs.customer"), roleId: 1 },
  ];

  const currentTab = tabs.find((tab) => tab.key === initialTab) ?? tabs[0];
  const isCustomer = currentTab.key === "customer";

  const [activeTab, setActiveTab] = useState(currentTab.key);
  const [listOrderBy, setListOrderBy] = useState("name");
  const [listOrder, setListOrder] = useState("asc");
  const [listPage, setListPage] = useState(0);
  const [listRows, setListRows] = useState(10);

  const [detOrderBy, setDetOrderBy] = useState("createdAt");
  const [detOrder, setDetOrder] = useState("desc");
  const [detPage, setDetPage] = useState(0);
  const [detRows, setDetRows] = useState(10);

  const activeTabConfig = tabs.find((tab) => tab.key === activeTab) ?? tabs[0];

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["users-by-role", activeTab],
    queryFn: () => getUsersByRole(activeTabConfig.roleId),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const { data: allTickets = [], isLoading: ticketsLoading } = useQuery({
    queryKey: ["all-tickets"],
    queryFn: getAllTickets,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    enabled: Boolean(selectedUser),
  });

  const sortedUsers = useMemo(
    () => sortList(users, listOrderBy, listOrder),
    [users, listOrderBy, listOrder]
  );
  const safeListPage = useMemo(
    () => Math.min(listPage, Math.max(0, Math.ceil(sortedUsers.length / listRows) - 1)),
    [listPage, listRows, sortedUsers.length]
  );
  const paginatedUsers = useMemo(
    () => sortedUsers.slice(safeListPage * listRows, safeListPage * listRows + listRows),
    [sortedUsers, safeListPage, listRows]
  );

  const userTickets = useMemo(() => {
    if (!selectedUser) return [];

    const { user, tab } = selectedUser;

    if (tab === "cs_agent") return allTickets.filter((ticket) => ticket.solver === user.name);
    if (tab === "technician") return allTickets.filter((ticket) => ticket.technician === user.name);
    if (tab === "customer") return allTickets.filter((ticket) => ticket.customer === user.name);

    return [];
  }, [allTickets, selectedUser]);

  const sortedTickets = useMemo(
    () => sortList(userTickets, detOrderBy, detOrder),
    [userTickets, detOrderBy, detOrder]
  );
  const safeDetPage = useMemo(
    () => Math.min(detPage, Math.max(0, Math.ceil(sortedTickets.length / detRows) - 1)),
    [detPage, detRows, sortedTickets.length]
  );
  const paginatedTickets = useMemo(
    () => sortedTickets.slice(safeDetPage * detRows, safeDetPage * detRows + detRows),
    [sortedTickets, safeDetPage, detRows]
  );

  const handleListSort = (column) => {
    setListOrder((prevOrder) => (listOrderBy === column && prevOrder === "asc" ? "desc" : "asc"));
    setListOrderBy(column);
    setListPage(0);
  };

  const handleDetSort = (column) => {
    setDetOrder((prevOrder) => (detOrderBy === column && prevOrder === "asc" ? "desc" : "asc"));
    setDetOrderBy(column);
    setDetPage(0);
  };

  const handleSelectUser = (user) => {
    setSelectedUser({ user, tab: activeTab });
    setDetPage(0);
    setDetOrderBy("createdAt");
    setDetOrder("desc");
  };

  const handleBack = () => setSelectedUser(null);

  const totalTickets = userTickets.length;
  const solvedTickets = userTickets.filter((ticket) => ticket.status === "Solved").length;
  const activeTickets = userTickets.filter((ticket) => ticket.status !== "Solved").length;
  const highPriority = userTickets.filter((ticket) => ticket.priority === "High").length;

  const userColumns = isCustomer
    ? [
        { id: "name", label: t("pages.adminUserPerformance.columns.name") },
        { id: "email", label: t("pages.adminUserPerformance.columns.email") },
      ]
    : [
        { id: "name", label: t("pages.adminUserPerformance.columns.name") },
        { id: "email", label: t("pages.adminUserPerformance.columns.email") },
        { id: "position", label: t("pages.adminUserPerformance.columns.position") },
        { id: "skill", label: t("pages.adminUserPerformance.columns.skill"), sortable: false },
      ];

  const ticketColumns = [
    { id: "id", label: t("pages.adminUserPerformance.columns.ticketId") },
    { id: "subject", label: t("pages.adminUserPerformance.columns.subject") },
    { id: "priority", label: t("pages.adminUserPerformance.columns.priority") },
    { id: "status", label: t("pages.adminUserPerformance.columns.status") },
    ...(selectedUser?.tab !== "customer"
      ? [{ id: "customer", label: t("pages.adminUserPerformance.columns.customer") }]
      : []),
    { id: "createdAt", label: t("pages.adminUserPerformance.columns.createdAt") },
  ];

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div
        style={{
          background: "white",
          padding: "15px 30px",
          display: "flex",
          alignItems: "center",
          boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
          height: "70px",
        }}
      >
        {selectedUser ? (
          <button
            onClick={handleBack}
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
            <MdArrowBack size={20} /> {t("pages.adminUserPerformance.back")}
          </button>
        ) : (
          <SearchBar />
        )}
      </div>

      <div style={{ padding: "30px" }}>
        {selectedUser ? (
          <>
            <div
              style={{
                background: "white",
                borderRadius: "14px",
                padding: "24px 28px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                marginBottom: "24px",
                display: "flex",
                alignItems: "center",
                gap: "22px",
                border: "2px solid #FF8040",
              }}
            >
              <AvatarIcon size={64} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "22px", fontWeight: "700", color: "#333", marginBottom: "4px" }}>
                  {selectedUser.user.name}
                </div>
                <div style={{ fontSize: "14px", color: "#666", marginBottom: "2px" }}>
                  {selectedUser.user.email}
                </div>
                {selectedUser.tab !== "customer" && (
                  <div style={{ display: "flex", gap: "20px", marginTop: "6px" }}>
                    {selectedUser.user.position && (
                      <span style={{ fontSize: "13px", color: "#FF8040", fontWeight: "600" }}>
                        📌 {selectedUser.user.position}
                      </span>
                    )}
                    <span style={{ fontSize: "13px", color: "#666" }}>🛠 {getSkillNames(selectedUser.user)}</span>
                  </div>
                )}
              </div>
              <div
                style={{
                  background: "#FFF5EF",
                  borderRadius: "8px",
                  padding: "6px 16px",
                  color: "#FF8040",
                  fontWeight: "700",
                  fontSize: "13px",
                  border: "1px solid #fde4d4",
                }}
              >
                {tabs.find((tab) => tab.key === selectedUser.tab)?.label}
              </div>
            </div>

            <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
              <StatCard label={t("pages.adminUserPerformance.stats.total")} value={totalTickets} />
              <StatCard label={t("pages.adminUserPerformance.stats.active")} value={activeTickets} color="#f59e0b" />
              <StatCard label={t("pages.adminUserPerformance.stats.solved")} value={solvedTickets} color="#22c55e" />
              <StatCard label={t("pages.adminUserPerformance.stats.highPriority")} value={highPriority} color="#ef4444" />
            </div>

            <div style={{ fontSize: "20px", fontWeight: "700", color: "#333", marginBottom: "16px" }}>
              {selectedUser.tab === "customer"
                ? t("pages.adminUserPerformance.ticketsCreated")
                : t("pages.adminUserPerformance.ticketsHandled")}
              <span style={{ color: "#FF8040" }}>• {sortedTickets.length}</span>
            </div>

            <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              {ticketsLoading ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <LoadingSpinner />
                </div>
              ) : (
                <Paper elevation={0} sx={{ borderRadius: "12px", overflow: "hidden" }}>
                  <TableContainer>
                    <Table>
                      <SortHead columns={ticketColumns} orderBy={detOrderBy} order={detOrder} onSort={handleDetSort} />
                      <TableBody>
                        {paginatedTickets.map((ticket) => (
                          <TableRow key={ticket.id} sx={{ borderBottom: "1px solid #f0f0f0" }}>
                            <TableCell sx={{ color: "#666", fontSize: "13px" }}>{ticket.id}</TableCell>
                            <TableCell sx={{ fontWeight: 500, color: "#333" }}>{ticket.subject}</TableCell>
                            <TableCell sx={{ color: getPriorityColor(ticket.priority), fontWeight: 500 }}>
                              {ticket.priority ?? "-"}
                            </TableCell>
                            <TableCell sx={{ color: getStatusColor(ticket.status), fontWeight: 600 }}>{ticket.status}</TableCell>
                            {selectedUser.tab !== "customer" && (
                              <TableCell sx={{ color: "#555", fontSize: "13px" }}>{ticket.customer ?? "-"}</TableCell>
                            )}
                            <TableCell sx={{ color: "#666", fontSize: "13px" }}>{formatTicketDate(ticket.createdAt)}</TableCell>
                          </TableRow>
                        ))}
                        {sortedTickets.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={ticketColumns.length} sx={{ textAlign: "center", py: 4, color: "#999" }}>
                              {t("pages.adminUserPerformance.noTickets")}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    component="div"
                    count={sortedTickets.length}
                    page={safeDetPage}
                    onPageChange={(_, nextPage) => setDetPage(nextPage)}
                    rowsPerPage={detRows}
                    onRowsPerPageChange={(event) => {
                      setDetRows(parseInt(event.target.value, 10));
                      setDetPage(0);
                    }}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                  />
                </Paper>
              )}
            </div>
          </>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "25px", gap: "16px" }}>
              <div style={{ fontSize: "28px", fontWeight: "700", color: "#333", flexShrink: 0 }}>
                {t(`pages.adminUserPerformance.title_${activeTab}`)} <span style={{ color: "#FF8040" }}>• {sortedUsers.length}</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {showAdd && (
                  <button
                    onClick={() => setAddUserOpen(true)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "9px 18px",
                      borderRadius: "10px",
                      border: "none",
                      background: "#FF8040",
                      color: "white",
                      fontWeight: "700",
                      fontSize: "14px",
                      cursor: "pointer",
                      boxShadow: "0 2px 8px rgba(255,128,64,0.3)",
                      flexShrink: 0,
                    }}
                    onMouseEnter={(event) => {
                      event.currentTarget.style.background = "#e6703a";
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.background = "#FF8040";
                    }}
                  >
                    <MdPersonAdd size={18} /> Add {activeTabConfig.label}
                  </button>
                )}
              </div>
            </div>

            <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              {usersLoading ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <LoadingSpinner />
                </div>
              ) : (
                <Paper elevation={0} sx={{ borderRadius: "12px", overflow: "hidden" }}>
                  <TableContainer>
                    <Table>
                      <SortHead
                        columns={userColumns}
                        orderBy={listOrderBy}
                        order={listOrder}
                        onSort={handleListSort}
                        prefixCell={<TableCell sx={{ width: "60px" }} />}
                      />
                      <TableBody>
                        {paginatedUsers.map((user) => (
                          <TableRow
                            key={user.id}
                            onClick={() => handleSelectUser(user)}
                            sx={{
                              borderBottom: "1px solid #f0f0f0",
                              cursor: "pointer",
                              "&:hover": { background: "#FFF5EF" },
                              transition: "background 0.15s",
                            }}
                          >
                            <TableCell>
                              <AvatarIcon size={38} />
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, color: "#333" }}>{user.name ?? "-"}</TableCell>
                            <TableCell sx={{ color: "#666", fontSize: "13px" }}>{user.email ?? "-"}</TableCell>
                            {!isCustomer && (
                              <>
                                <TableCell sx={{ color: "#555", fontSize: "13px" }}>{user.position ?? "-"}</TableCell>
                                <TableCell sx={{ color: "#555", fontSize: "13px" }}>{getSkillNames(user)}</TableCell>
                              </>
                            )}
                          </TableRow>
                        ))}
                        {sortedUsers.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={isCustomer ? 3 : 5} sx={{ textAlign: "center", py: 4, color: "#999" }}>
                              {t("pages.adminUserPerformance.noUsers", { role: activeTabConfig.label })}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    component="div"
                    count={sortedUsers.length}
                    page={safeListPage}
                    onPageChange={(_, nextPage) => setListPage(nextPage)}
                    rowsPerPage={listRows}
                    onRowsPerPageChange={(event) => {
                      setListRows(parseInt(event.target.value, 10));
                      setListPage(0);
                    }}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                  />
                </Paper>
              )}
            </div>

            <AddUserForm isOpen={addUserOpen} onClose={() => setAddUserOpen(false)} defaultRoleId={activeTabConfig.roleId} />
          </>
        )}
      </div>

      <button
        onClick={() => setChatOpen((prev) => !prev)}
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
          boxShadow: "0 4px 12px rgba(255,128,64,0.4)",
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
