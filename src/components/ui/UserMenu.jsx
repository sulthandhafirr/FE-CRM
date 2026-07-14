import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdLogout, MdPerson, MdKeyboardArrowDown } from "react-icons/md";
import { supabase } from "../../lib/supabase";
import { ROUTE } from "../../app/routes";
import { useAuth } from "../../hooks/useAuth";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";

const ROLE_CONFIG = {
  admin: { label: "Administrator", color: "#FF8040", bg: "#FFF3ED" },
  cs_agent: { label: "CS Agent", color: "#3B82F6", bg: "#EFF6FF" },
  technician: { label: "Technician", color: "#10B981", bg: "#ECFDF5" },
  customer: { label: "Customer", color: "#6B7280", bg: "#F3F4F6" },
  ultrauser: { label: "Ultra User", color: "#8B5CF6", bg: "#F5F3FF" },
};

const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const GRADIENT_MAP = [
  "linear-gradient(135deg, #FF8040, #FF6B6B)",
  "linear-gradient(135deg, #3B82F6, #6366F1)",
  "linear-gradient(135deg, #10B981, #34D399)",
  "linear-gradient(135deg, #8B5CF6, #A78BFA)",
  "linear-gradient(135deg, #F59E0B, #F97316)",
];

const getGradient = (name) => {
  if (!name) return GRADIENT_MAP[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return GRADIENT_MAP[Math.abs(hash) % GRADIENT_MAP.length];
};

const getProfileRoute = (role) => {
  const map = {
    customer: ROUTE.customerProfile,
    cs_agent: ROUTE.agentProfile,
    technician: ROUTE.technicianProfile,
    admin: ROUTE.adminProfile,
    ultrauser: ROUTE.ultrauserDashboard,
  };
  return map[role] || ROUTE.customerProfile;
};

export default function UserMenu() {
  const { i18n } = useTranslation();
  const { name, role, user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const dropdownRef = useRef(null);
  const [open, setOpen] = useState(false);

  const roleConfig = ROLE_CONFIG[role] || ROLE_CONFIG.customer;
  const initials = getInitials(name);
  const gradient = getGradient(name);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    try {
      queryClient.clear();
      await supabase.auth.signOut();
      navigate(ROUTE.login);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleProfile = () => {
    setOpen(false);
    navigate(getProfileRoute(role));
  };

  const locale = (i18n.language || "en").split("-")[0];
  const roleLabel = roleConfig.label;

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      {/* Trigger */}
      <div
        onClick={() => setOpen((prev) => !prev)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          cursor: "pointer",
          padding: "4px 8px 4px 4px",
          borderRadius: "10px",
          transition: "background 0.15s",
          userSelect: "none",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#F3F4F6")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        {/* Avatar */}
        <div
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "50%",
            background: gradient,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "#fff",
              lineHeight: 1,
            }}
          >
            {initials}
          </span>
        </div>

        {/* Name + Role */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            lineHeight: 1.3,
          }}
        >
          <span
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "#1F2937",
            }}
          >
            {name || "User"}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span
              style={{
                fontSize: "10px",
                fontWeight: 600,
                color: roleConfig.color,
                background: roleConfig.bg,
                padding: "1px 8px",
                borderRadius: "999px",
                display: "inline-block",
              }}
            >
              {roleLabel}
            </span>
          </div>
        </div>

        <MdKeyboardArrowDown
          size={16}
          color="#9CA3AF"
          style={{
            transition: "transform 0.2s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            width: "200px",
            background: "#ffffff",
            borderRadius: "12px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
            border: "1px solid #eee",
            zIndex: 9999,
            overflow: "hidden",
            animation: "fadeIn 0.15s ease",
          }}
        >
          {/* User info preview */}
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid #f1f1f1",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: gradient,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#fff" }}>
                {initials}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.3 }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#1F2937" }}>
                {name || "User"}
              </span>
              <span style={{ fontSize: "11px", color: "#9CA3AF" }}>
                {user?.email || ""}
              </span>
            </div>
          </div>

          {/* Menu items */}
          <div style={{ padding: "6px" }}>
            <button
              onClick={handleProfile}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                width: "100%",
                padding: "10px 12px",
                border: "none",
                background: "transparent",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "13px",
                color: "#374151",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#F3F4F6")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <MdPerson size={16} color="#6B7280" />
              {locale === "id" ? "Profil" : "Profile"}
            </button>

            <button
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                width: "100%",
                padding: "10px 12px",
                border: "none",
                background: "transparent",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "13px",
                color: "#EF4444",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#FEF2F2")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <MdLogout size={16} color="#EF4444" />
              {locale === "id" ? "Keluar" : "Logout"}
            </button>
          </div>
        </div>
      )}

      {/* Animation keyframes */}
      {open && (
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-4px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      )}
    </div>
  );
}
