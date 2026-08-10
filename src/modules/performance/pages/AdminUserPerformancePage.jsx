import React, { useMemo, useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  MdArrowBack,
  MdOutlinePerson,
  MdPersonAdd,
  MdClose,
  MdAdd,
  MdEdit,
  MdConfirmationNumber,
  MdHourglassEmpty,
  MdCheckCircle,
  MdPriorityHigh,
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
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { ROUTE } from "../../../app/routes";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import PerformanceCard from "../components/PerformanceCard";
import { getUsersByRole } from "../../profile/profile.service";
import ChatFab from "../../../components/ui/ChatFab";
import SearchBar from "../../../components/ui/SearchBar";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { getAllTickets } from "../../ticket/ticket.service";
import {
  formatTicketDate,
  getPriorityColor,
  getStatusColor,
} from "../../ticket/ticket.schema";
import AddUserForm from "../../import/AddUserForm";
import { getCompanyRoles, createSkill } from "../../import/import.service";
import {
  getAllTiers,
  setProfileTier,
  addSkill,
  removeSkill,
  updatePosition,
} from "../performance.service";
import AddSkillModal from "../components/AddSkillModal";
import EditPositionModal from "../components/EditPositionModal";

// ─── tier colors ─────────────────────────────────────────────────────────────

const getTierStyle = (tierName, tierColor) => {
  if (!tierName) return null;
  const color = tierColor || "#6b7280";
  return {
    label: tierName,
    color,
    bg: `${color}15`,
    border: color,
    dot: color,
  };
};

// ─── helpers ─────────────────────────────────────────────────────────────────

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

const getSkillList = (user) => {
  const raw = user.profile_skill ?? user.profileSkills ?? user.skills ?? [];
  return raw
    .map((ps) => {
      const s = ps.skills ?? ps.skill;
      if (!s) return null;
      return { id: s.id ?? ps.skillId ?? ps.skill_id, skill: s.skill ?? s.skillName };
    })
    .filter((s) => s && s.id != null && s.skill);
};

// ─── sub-components ──────────────────────────────────────────────────────────

const AvatarIcon = ({ size = 38, avatarUrl, name }) => {
  const [imgError, setImgError] = useState(false);
  const showImage = avatarUrl && !imgError;

  return showImage ? (
    <img
      src={avatarUrl}
      alt={name ?? "avatar"}
      onError={() => setImgError(true)}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        objectFit: "cover",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.46)",
        flexShrink: 0,
      }}
    />
  ) : (
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
};

const StatCard = ({ label, value, icon, color = "#111827", iconColor = "#FF8040", iconBg = "#FFF5EF" }) => (
  <div
    style={{
      flex: 1,
      background: "white",
      padding: "20px 22px",
      borderRadius: "16px",
      border: "1px solid #F0F0F0",
      boxShadow: "0 1px 3px 0 rgba(0,0,0,0.04)",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "10px",
      }}
    >
      <div style={{ fontSize: "13px", color: "#6B7280", fontWeight: "500" }}>
        {label}
      </div>
      {icon && (
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {React.cloneElement(icon, { size: 16, color: iconColor })}
        </div>
      )}
    </div>
    <div style={{ fontSize: "26px", fontWeight: "700", color }}>{value}</div>
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

// ── Tier badge chip shown in the dropdown trigger and MenuItems ───────────────
const TierChip = ({ tierName, tierColor, style }) => {
  const s = getTierStyle(tierName, tierColor);
  if (!s)
    return <span style={{ color: "#aaa", fontSize: "13px" }}>— No tier —</span>;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "3px 10px",
        borderRadius: "20px",
        background: s.bg,
        border: `1.5px solid ${s.border}`,
        color: s.color,
        fontWeight: "600",
        fontSize: "12px",
        letterSpacing: "0.02em",
        ...style,
      }}
    >
      <span
        style={{
          width: "7px",
          height: "7px",
          borderRadius: "50%",
          background: s.dot,
          flexShrink: 0,
        }}
      />
      {s.label}
    </span>
  );
};

const SkillTags = ({
  user,
  onAdd,
  onRemove,
}) => {
  const skills = getSkillList(user);
  const { t } = useTranslation();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        flexWrap: "wrap",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {skills.map((skill) => (
        <div
          key={skill.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 15px",
            borderRadius: "10px",
            background: "#ffffff",
            color: "#555",
            border: "1px solid #dddddd",
            boxShadow: "0 2px 4px 0 rgba(0,0,0,0.05)",
            fontSize: "12px",
          }}
        >
          {skill.skill}

          <MdClose
            size={10}
            style={{
              cursor: "pointer",
            }}
            onClick={() => onRemove(user, skill)}
          />
        </div>
      ))}

      <button
        onClick={() => onAdd(user)}
        style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          border: "1px solid #ff80408a",
          background: "#ffffff7e",
          color: "#ff80407e",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        title={t("pages.adminUserPerformance.addSkill")}
      >
        <MdAdd size={18} />
      </button>
    </div>
  );
};

// ── Position cell: text + pencil icon that opens EditPositionModal ────────────
const PositionCell = ({ user, onEdit }) => {
  const { t } = useTranslation();

  return (
    <TableCell
      sx={{ color: "#555", fontSize: "12px" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span>{user.position ?? "-"}</span>
        <MdEdit
          size={12}
          style={{ cursor: "pointer", color: "#ff80403e", flexShrink: 0 }}
          onClick={() => onEdit(user)}
          title={t("pages.adminUserPerformance.editPosition")}
        />
      </div>
    </TableCell>
  );
};

/**
 * Inline tier dropdown — updates profile_tier on change, optimistic UI.
 */
const TierDropdownCell = ({ user, tiers }) => {
  const queryClient = useQueryClient();
  const currentTierId = user.profile_tier?.[0]?.tier_id ?? "";
  const [value, setValue] = useState(currentTierId);

  useEffect(() => {
    setValue(user.profile_tier?.[0]?.tier_id ?? "");
  }, [user.profile_tier]);

  const { mutate, isPending } = useMutation({
    mutationFn: (tierId) => setProfileTier(user.id, tierId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users-by-role", "customer"],
      });
    },
    onError: () => {
      setValue(currentTierId);
    },
  });

  const handleChange = (event) => {
    const tierId = event.target.value;
    setValue(tierId);
    mutate(tierId);
  };

  const selectedTier = tiers.find((t) => t.id === value);

  // ← Tunggu tiers loaded sebelum render Select
  if (!tiers.length) {
    return (
      <TableCell sx={{ minWidth: "160px" }}>
        <span style={{ color: "#aaa", fontSize: "13px" }}>— No tier —</span>
      </TableCell>
    );
  }

  return (
    <TableCell onClick={(e) => e.stopPropagation()} sx={{ minWidth: "160px" }}>
      {isPending ? (
        <CircularProgress size={18} sx={{ color: "#FF8040" }} />
      ) : (
        <Select
          value={value}
          onChange={handleChange}
          displayEmpty
          size="small"
          renderValue={(val) =>
            val ? (
              <TierChip
                tierName={selectedTier?.tierName}
                tierColor={selectedTier?.color}
              />
            ) : (
              <span style={{ color: "#aaa", fontSize: "13px" }}>
                — No tier —
              </span>
            )
          }
          sx={{
            fontSize: "13px",
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e5e7eb00" },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#ff804000",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#ff804000",
            },
            "& .MuiSelect-select": { padding: "5px 10px" },
            minWidth: "140px",
          }}
        >
          <MenuItem value="" disabled>
            <span style={{ color: "#aaa", fontSize: "13px" }}>— No tier —</span>
          </MenuItem>
          {tiers.map((tier) => (
            <MenuItem key={tier.id} value={tier.id} sx={{ py: "6px" }}>
              <TierChip tierName={tier.tierName} tierColor={tier.color} />
            </MenuItem>
          ))}
        </Select>
      )}
    </TableCell>
  );
};

// ─── page ────────────────────────────────────────────────────────────────────

export default function AdminUserPerformancePage() {
  const { t } = useTranslation();
  const cards = [
    {
      badge: "CS",
      title: t("pages.performance.cards.csAgent.title"),
      description: t("pages.performance.cards.csAgent.description"),
      route: ROUTE.adminPerformanceCsAgent,
      color: "#FF8040",
      bg: "#fff4ee",
      border: "#fcd9bc",
    },
    {
      badge: "TECH",
      title: t("pages.performance.cards.technician.title"),
      description: t("pages.performance.cards.technician.description"),
      route: ROUTE.adminPerformanceTechnician,
      color: "#8b5cf6",
      bg: "#f5f3ff",
      border: "#ddd6fe",
    },
    {
      badge: "CUST",
      title: t("pages.performance.cards.customer.title"),
      description: t("pages.performance.cards.customer.description"),
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
          .admin-performance-selector-grid { grid-template-columns: 1fr; }
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

// ─── view ────────────────────────────────────────────────────────────────────

export function AdminUserPerformanceView({
  initialTab = "cs_agent",
  showAdd = true,
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState(null);
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [skillModalOpen, setSkillModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [positionModalOpen, setPositionModalOpen] = useState(false);
  const [positionProfile, setPositionProfile] = useState(null);

  // Dynamically resolve role IDs from the admin's company
  const [roleIdMap, setRoleIdMap] = useState({});
  const roleFetched = useRef(false);

  useEffect(() => {
    if (!user?.id || roleFetched.current) return;
    getCompanyRoles(user.id).then((roles) => {
      const map = {};
      for (const r of roles) {
        map[r.role] = r.id;
      }
      setRoleIdMap(map);
      roleFetched.current = true;
    });
  }, [user?.id]);

  const tabs = [
    { key: "cs_agent", label: t("pages.adminUserPerformance.tabs.cs_agent") },
    {
      key: "technician",
      label: t("pages.adminUserPerformance.tabs.technician"),
    },
    { key: "customer", label: t("pages.adminUserPerformance.tabs.customer") },
  ];

  const currentTab = tabs.find((tab) => tab.key === initialTab) ?? tabs[0];
  const isCustomer = currentTab.key === "customer";

  const [activeTab] = useState(currentTab.key);
  const [listOrderBy, setListOrderBy] = useState("name");
  const [listOrder, setListOrder] = useState("asc");
  const [listPage, setListPage] = useState(0);
  const [listRows, setListRows] = useState(10);

  const [detOrderBy, setDetOrderBy] = useState("createdAt");
  const [detOrder, setDetOrder] = useState("desc");
  const [detPage, setDetPage] = useState(0);
  const [detRows, setDetRows] = useState(10);

  const [search, setSearch] = useState("");

  const activeTabConfig = tabs.find((tab) => tab.key === activeTab) ?? tabs[0];

  const activeRoleId = roleIdMap[activeTabConfig.key];

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["users-by-role", activeTab, activeRoleId],
    queryFn: () => getUsersByRole(activeRoleId),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    enabled: Boolean(activeRoleId),
  });

  const { data: tiers = [] } = useQuery({
    queryKey: ["tiers"],
    queryFn: getAllTiers,
    staleTime: 1000 * 60 * 30,
    enabled: isCustomer,
  });

  const { data: allTickets = [], isLoading: ticketsLoading } = useQuery({
    queryKey: ["all-tickets"],
    queryFn: getAllTickets,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    enabled: Boolean(selectedUser),
  });

  const sortedUsers = useMemo(() => {
    const q = search.toLowerCase();
    const filtered = users.filter(
      (user) =>
        user.name?.toLowerCase().includes(q) ||
        user.email?.toLowerCase().includes(q) ||
        user.position?.toLowerCase().includes(q),
    );
    return sortList(filtered, listOrderBy, listOrder);
  }, [users, listOrderBy, listOrder, search]);

  const safeListPage = useMemo(
    () =>
      Math.min(
        listPage,
        Math.max(0, Math.ceil(sortedUsers.length / listRows) - 1),
      ),
    [listPage, listRows, sortedUsers.length],
  );
  const paginatedUsers = useMemo(
    () =>
      sortedUsers.slice(
        safeListPage * listRows,
        safeListPage * listRows + listRows,
      ),
    [sortedUsers, safeListPage, listRows],
  );

  const userTickets = useMemo(() => {
    if (!selectedUser) return [];
    const { user, tab } = selectedUser;
    if (tab === "cs_agent")
      return allTickets.filter((t) => t.solver === user.name);
    if (tab === "technician")
      return allTickets.filter((t) => t.technician === user.name);
    if (tab === "customer")
      return allTickets.filter((t) => t.customer === user.name);
    return [];
  }, [allTickets, selectedUser]);

  const sortedTickets = useMemo(
    () => sortList(userTickets, detOrderBy, detOrder),
    [userTickets, detOrderBy, detOrder],
  );
  const safeDetPage = useMemo(
    () =>
      Math.min(
        detPage,
        Math.max(0, Math.ceil(sortedTickets.length / detRows) - 1),
      ),
    [detPage, detRows, sortedTickets.length],
  );
  const paginatedTickets = useMemo(
    () =>
      sortedTickets.slice(
        safeDetPage * detRows,
        safeDetPage * detRows + detRows,
      ),
    [sortedTickets, safeDetPage, detRows],
  );

  const handleListSort = (column) => {
    setListOrder((prev) =>
      listOrderBy === column && prev === "asc" ? "desc" : "asc",
    );
    setListOrderBy(column);
    setListPage(0);
  };
  const handleDetSort = (column) => {
    setDetOrder((prev) =>
      detOrderBy === column && prev === "asc" ? "desc" : "asc",
    );
    setDetOrderBy(column);
    setDetPage(0);
  };
  const handleSelectUser = (user) => {
    setSelectedUser({ user, tab: activeTab });
    setDetPage(0);
    setDetOrderBy("createdAt");
    setDetOrder("desc");
  };

  const handleAddSkill = (user) => {
      setSelectedProfile(user);
      setSkillModalOpen(true);
  };

  const handleRemoveSkill = async (user, skill) => {
    try {
      await removeSkill(user.id, skill.id);
      await queryClient.invalidateQueries({
        queryKey: ["users-by-role", activeTab, activeRoleId],
      });
    } catch (err) {
      console.error("Failed to remove skill", err);
    }
  };

  const handleEditPosition = (user) => {
    setPositionProfile(user);
    setPositionModalOpen(true);
  };

  const handleSavePosition = async (profileId, position) => {
    await updatePosition(profileId, position);
    await queryClient.invalidateQueries({
      queryKey: ["users-by-role", activeTab, activeRoleId],
    });
  };

  const handleBack = () => setSelectedUser(null);

  const totalTickets = userTickets.length;
  const solvedTickets = userTickets.filter((t) => t.status === "Solved").length;
  const activeTickets = userTickets.filter((t) => t.status !== "Solved").length;
  const highPriority = userTickets.filter((t) => t.priority === "High").length;

  const userColumns =
  activeTab === "customer"
    ? [
        { id: "name", label: t("pages.adminUserPerformance.columns.name") },
        { id: "email", label: t("pages.adminUserPerformance.columns.email") },
        { id: "tier", label: "Tier", sortable: false },
      ]
    : activeTab === "technician"
    ? [
        { id: "name", label: t("pages.adminUserPerformance.columns.name") },
        { id: "email", label: t("pages.adminUserPerformance.columns.email") },
        {
          id: "position",
          label: t("pages.adminUserPerformance.columns.position"),
          sortable: false,
        },
        {
          id: "skill",
          label: t("pages.adminUserPerformance.columns.skill"),
          sortable: false,
        },
      ]
    : [
        { id: "name", label: t("pages.adminUserPerformance.columns.name") },
        { id: "email", label: t("pages.adminUserPerformance.columns.email") },
        {
          id: "position",
          label: t("pages.adminUserPerformance.columns.position"),
          sortable: false,
        },
      ];

  const ticketColumns = [
    { id: "id", label: t("pages.adminUserPerformance.columns.ticketId") },
    { id: "subject", label: t("pages.adminUserPerformance.columns.subject") },
    { id: "priority", label: t("pages.adminUserPerformance.columns.priority") },
    { id: "status", label: t("pages.adminUserPerformance.columns.status") },
    ...(selectedUser?.tab !== "customer"
      ? [
          {
            id: "customer",
            label: t("pages.adminUserPerformance.columns.customer"),
          },
        ]
      : []),
    {
      id: "createdAt",
      label: t("pages.adminUserPerformance.columns.createdAt"),
    },
  ];

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
          boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
          height: "70px",
          gap: "12px", // ← tambah gap
        }}
      >
        {/* Tombol back ke selector — selalu tampil */}
        <button
          onClick={() =>
            selectedUser ? handleBack() : navigate(ROUTE.adminUserPerformance)
          }
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
            flexShrink: 0,
          }}
        >
          <MdArrowBack size={20} />
        </button>

        {!selectedUser && (
          <SearchBar
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setListPage(0);
            }}
          />
        )}
      </div>

      <div style={{ padding: "24px 30px" }}>
        {selectedUser ? (
          <>
            <div
              style={{
                background: "white",
                borderRadius: "16px",
                padding: "24px 28px",
                boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
                marginBottom: "24px",
                display: "flex",
                alignItems: "center",
                gap: "22px",
                border: "1px solid #E5E7EB",
              }}
            >
              <AvatarIcon size={64} avatarUrl={selectedUser.user.avatar_url} name={selectedUser.user.name} />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "22px",
                    fontWeight: "700",
                    color: "#333",
                    marginBottom: "4px",
                  }}
                >
                  {selectedUser.user.name}
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#666",
                    marginBottom: "2px",
                  }}
                >
                  {selectedUser.user.email}
                </div>
                {selectedUser.tab !== "customer" && (
                  <div
                    style={{ display: "flex", gap: "20px", marginTop: "6px" }}
                  >
                    {selectedUser.user.position && (
                      <span
                        style={{
                          fontSize: "13px",
                          color: "#FF8040",
                          fontWeight: "600",
                        }}
                      >
                        📌 {selectedUser.user.position}
                      </span>
                    )}
                    <span style={{ fontSize: "13px", color: "#666" }}>
                      🛠{" "}
                      {getSkillList(selectedUser.user)
                          .map(s => s.skill)
                          .join(", ")}
                    </span>
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
              <StatCard
                label={t("pages.adminUserPerformance.stats.total")}
                value={totalTickets}
                icon={<MdConfirmationNumber />}
                iconColor="#FF8040"
                iconBg="#FFF5EF"
              />
              <StatCard
                label={t("pages.adminUserPerformance.stats.active")}
                value={activeTickets}
                color="#f59e0b"
                icon={<MdHourglassEmpty />}
                iconColor="#f59e0b"
                iconBg="#FEF3C7"
              />
              <StatCard
                label={t("pages.adminUserPerformance.stats.solved")}
                value={solvedTickets}
                color="#22c55e"
                icon={<MdCheckCircle />}
                iconColor="#22c55e"
                iconBg="#DCFCE7"
              />
              <StatCard
                label={t("pages.adminUserPerformance.stats.highPriority")}
                value={highPriority}
                color="#ef4444"
                icon={<MdPriorityHigh />}
                iconColor="#ef4444"
                iconBg="#FEE2E2"
              />
            </div>

            <div
              style={{
                fontSize: "20px",
                fontWeight: "700",
                color: "#333",
                marginBottom: "16px",
              }}
            >
              {selectedUser.tab === "customer"
                ? t("pages.adminUserPerformance.ticketsCreated")
                : t("pages.adminUserPerformance.ticketsHandled")}
              <span style={{ color: "#FF8040" }}>• {sortedTickets.length}</span>
            </div>

            <div
              style={{
                background: "white",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              {ticketsLoading ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <LoadingSpinner />
                </div>
              ) : (
                <Paper
                  elevation={0}
                  sx={{ borderRadius: "12px", overflow: "hidden" }}
                >
                  <TableContainer>
                    <Table>
                      <SortHead
                        columns={ticketColumns}
                        orderBy={detOrderBy}
                        order={detOrder}
                        onSort={handleDetSort}
                      />
                      <TableBody>
                        {paginatedTickets.map((ticket) => (
                          <TableRow
                            key={ticket.id}
                            sx={{ borderBottom: "1px solid #f0f0f0" }}
                          >
                            <TableCell sx={{ color: "#666", fontSize: "13px" }}>
                              {ticket.id}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 500, color: "#333" }}>
                              {ticket.subject}
                            </TableCell>
                            <TableCell
                              sx={{
                                color: getPriorityColor(ticket.priority),
                                fontWeight: 500,
                              }}
                            >
                              {ticket.priority ?? "-"}
                            </TableCell>
                            <TableCell
                              sx={{
                                color: getStatusColor(ticket.status),
                                fontWeight: 600,
                              }}
                            >
                              {ticket.status}
                            </TableCell>
                            {selectedUser.tab !== "customer" && (
                              <TableCell
                                sx={{ color: "#555", fontSize: "13px" }}
                              >
                                {ticket.customer ?? "-"}
                              </TableCell>
                            )}
                            <TableCell sx={{ color: "#666", fontSize: "13px" }}>
                              {formatTicketDate(ticket.createdAt)}
                            </TableCell>
                          </TableRow>
                        ))}
                        {sortedTickets.length === 0 && (
                          <TableRow>
                            <TableCell
                              colSpan={ticketColumns.length}
                              sx={{ textAlign: "center", py: 4, color: "#999" }}
                            >
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
                    onRowsPerPageChange={(e) => {
                      setDetRows(parseInt(e.target.value, 10));
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "25px",
                gap: "16px",
              }}
            >
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  color: "#333",
                  flexShrink: 0,
                }}
              >
                {t(`pages.adminUserPerformance.title_${activeTab}`)}{" "}
                <span style={{ color: "#FF8040" }}>• {sortedUsers.length}</span>
              </div>
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
                    color: "#ffffff",
                    fontWeight: "500",
                    fontSize: "14px",
                    cursor: "pointer",
                    boxShadow: "0 2px 10px 0 rgba(14, 14, 14, 0.05)",
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#ea7940";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#FF8040";
                  }}
                >
                  <MdPersonAdd size={18} />{t("pages.adminUserPerformance.add")} {activeTabConfig.label}
                </button>
              )}
            </div>

            <div
              style={{
                background: "white",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              {usersLoading ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <LoadingSpinner />
                </div>
              ) : (
                <Paper
                  elevation={0}
                  sx={{ borderRadius: "12px", overflow: "hidden" }}
                >
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
                              <AvatarIcon size={38} avatarUrl={user.avatar_url} name={user.name} />
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, color: "#333" }}>
                              {user.name ?? "-"}
                            </TableCell>
                            <TableCell sx={{ color: "#666", fontSize: "13px" }}>
                              {user.email ?? "-"}
                            </TableCell>
                            {activeTab === "customer" ? (
                              <TierDropdownCell user={user} tiers={tiers} />
                            ) : activeTab === "technician" ? (
                              <>
                                <PositionCell user={user} onEdit={handleEditPosition} />
                                <TableCell>
                                  <SkillTags
                                    user={user}
                                    onAdd={handleAddSkill}
                                    onRemove={handleRemoveSkill}
                                  />
                                </TableCell>
                              </>
                            ) : (
                              <PositionCell user={user} onEdit={handleEditPosition} />
                            )}
                          </TableRow>
                        ))}
                        {sortedUsers.length === 0 && (
                          <TableRow>
                            <TableCell
                              colSpan={
                                activeTab === "customer"
                                  ? 4
                                  : activeTab === "technician"
                                  ? 5
                                  : 4
                              }
                              sx={{ textAlign: "center", py: 4, color: "#999" }}
                            >
                              {t("pages.adminUserPerformance.noUsers", {
                                role: activeTabConfig.label,
                              })}
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
                    onRowsPerPageChange={(e) => {
                      setListRows(parseInt(e.target.value, 10));
                      setListPage(0);
                    }}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                  />
                </Paper>
              )}
            </div>

            <AddUserForm
              isOpen={addUserOpen}
              onClose={() => setAddUserOpen(false)}
              defaultRoleName={activeTabConfig.key}
            />
            <AddSkillModal
              open={skillModalOpen}
              onClose={() => setSkillModalOpen(false)}
              profile={selectedProfile}
              existingSkillIds={selectedProfile ? getSkillList(selectedProfile).map((s) => s.id) : []}
              onCreateSkill={createSkill}
              onAssignSkill={async (profileId, skillId) => {
                await addSkill(profileId, skillId);
                await queryClient.invalidateQueries({
                  queryKey: ["users-by-role", activeTab, activeRoleId],
                });
              }}
            />
            <EditPositionModal
              open={positionModalOpen}
              onClose={() => setPositionModalOpen(false)}
              profile={positionProfile}
              onSave={handleSavePosition}
            />
          </>
        )}
      </div>

      <ChatFab />
    </div>
  );
}