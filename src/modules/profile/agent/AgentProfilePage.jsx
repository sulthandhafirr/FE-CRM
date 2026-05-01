import { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MdEdit, MdPassword, MdLogout } from "react-icons/md";
import { supabase } from "../../../lib/supabase";
import { api } from "../../../lib/api/apiClient";
import { ROUTE } from "../../../app/routes";

// Helper: Generate initials from name
const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Helper: Role display name
const getRoleDisplayName = (role) => {
  const roleMap = {
    customer: "Customer",
    cs_agent: "CS Agent",
    technician: "Technician",
    admin: "Administrator",
    ultrauser: "Ultra User",
  };
  return roleMap[role] || role;
};

// Helper: Fetch profile data from Supabase profile table
const fetchProfileData = async (userId) => {
  if (!userId) return null;
  const { data, error } = await supabase
    .from("profile")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
  return data;
};

export default function AgentProfilePage() {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State for edit modes
  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);
  const [editValues, setEditValues] = useState({ name: "", phone: "" });
  const [passwordValues, setPasswordValues] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  // Fetch profile data
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => fetchProfileData(user?.id),
    enabled: !!user?.id && !authLoading,
    staleTime: 1000 * 60 * 5,
  });

  // Initialize edit form when profile data loads
  useEffect(() => {
    if (profileData) {
      setEditValues({
        name: profileData.name || "",
        phone: profileData.phone || "",
      });
    }
  }, [profileData]);

  // Handle logout
  const handleLogout = async () => {
    try {
      queryClient.clear();
      await supabase.auth.signOut();
      navigate(ROUTE.login);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Handle update profile
  const handleUpdateProfile = async () => {
    if (!editValues.name.trim()) {
      setMessage({ type: "error", text: "Name is required" });
      return;
    }

    setLoading(true);
    try {
      const response = await api.put(`/api/profile/${user.id}`, {
        name: editValues.name,
        phone: editValues.phone,
      });

      if (response.status === 200 || response.status === 204) {
        setMessage({ type: "success", text: "Profile updated successfully" });
        queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
        setEditMode(false);
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update profile",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle change password
  const handleChangePassword = async () => {
    if (!passwordValues.oldPassword || !passwordValues.newPassword) {
      setMessage({ type: "error", text: "Please fill in all password fields" });
      return;
    }

    if (passwordValues.newPassword !== passwordValues.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    if (passwordValues.newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "New password must be at least 6 characters",
      });
      return;
    }

    setLoading(true);
    try {
      await supabase.auth.updateUser({
        password: passwordValues.newPassword,
      });

      setMessage({ type: "success", text: "Password changed successfully" });
      setPasswordValues({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordMode(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to change password",
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          color: "#999",
        }}
      >
        Loading...
      </div>
    );
  }

  const displayName = profileData?.name || user?.email || "User";
  const phone = profileData?.phone || "-";
  const position = profileData?.position || null;

  return (
    <div
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <style>{`
        @media (max-width: 767px) {
          .profile-container { padding: 14px !important; }
          .profile-card-mobile { padding: 16px !important; border-radius: 14px !important; }
          .form-input-mobile { padding: 10px 12px !important; font-size: 14px !important; }
          .button-mobile { padding: 10px 16px !important; font-size: 13px !important; }
          .logout-section { display: flex !important; }
        }
        @media (min-width: 768px) {
          .profile-container { padding: 30px !important; }
          .profile-card-mobile { padding: 25px !important; border-radius: 12px !important; }
          .form-input-mobile { padding: 12px 14px !important; font-size: 14px !important; }
          .button-mobile { padding: 12px 20px !important; font-size: 14px !important; }
          .logout-section { display: none !important; }
        }
      `}</style>

      <div className="profile-container" style={{ flex: 1, overflowY: "auto" }}>
        {/* Message Alert */}
        {message.text && (
          <div
            style={{
              padding: "12px 16px",
              marginBottom: "16px",
              borderRadius: "8px",
              background:
                message.type === "success" ? "#f0fdf4" : "#fef2f2",
              color: message.type === "success" ? "#16a34a" : "#dc2626",
              fontSize: "14px",
              border:
                message.type === "success"
                  ? "1px solid #bbf7d0"
                  : "1px solid #fecaca",
            }}
          >
            {message.text}
          </div>
        )}

        {/* Profile Header Card */}
        <div
          className="profile-card-mobile"
          style={{
            background: "white",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "#FF8040",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              fontWeight: "700",
              flexShrink: 0,
            }}
          >
            {getInitials(displayName)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: "18px",
                fontWeight: "700",
                color: "#333",
                marginBottom: "4px",
                wordBreak: "break-word",
              }}
            >
              {displayName}
            </div>
            <div style={{ fontSize: "13px", color: "#666", marginBottom: "4px" }}>
              {user?.email}
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#999",
                background: "#FFF5EF",
                display: "inline-block",
                padding: "4px 10px",
                borderRadius: "6px",
                marginTop: "4px",
              }}
            >
              {getRoleDisplayName(role)}
            </div>
          </div>
        </div>

        {/* User Info Section */}
        {!editMode && (
          <div
            className="profile-card-mobile"
            style={{
              background: "white",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#333",
                marginBottom: "16px",
              }}
            >
              User Information
            </div>

            {/* Full Name */}
            <div style={{ marginBottom: "14px" }}>
              <div
                style={{
                  fontSize: "12px",
                  color: "#666",
                  marginBottom: "4px",
                  fontWeight: "500",
                }}
              >
                Full Name
              </div>
              <div style={{ fontSize: "14px", color: "#333" }}>
                {displayName}
              </div>
            </div>

            {/* Email */}
            <div style={{ marginBottom: "14px" }}>
              <div
                style={{
                  fontSize: "12px",
                  color: "#666",
                  marginBottom: "4px",
                  fontWeight: "500",
                }}
              >
                Email
              </div>
              <div style={{ fontSize: "14px", color: "#333" }}>
                {user?.email}
              </div>
            </div>

            {/* Phone */}
            <div style={{ marginBottom: "14px" }}>
              <div
                style={{
                  fontSize: "12px",
                  color: "#666",
                  marginBottom: "4px",
                  fontWeight: "500",
                }}
              >
                Phone
              </div>
              <div style={{ fontSize: "14px", color: "#333" }}>
                {phone}
              </div>
            </div>

            {/* Position */}
            {position && (
              <div style={{ marginBottom: "14px" }}>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    marginBottom: "4px",
                    fontWeight: "500",
                  }}
                >
                  Position
                </div>
                <div style={{ fontSize: "14px", color: "#333" }}>
                  {position}
                </div>
              </div>
            )}

            {/* Edit Button */}
            <button
              onClick={() => setEditMode(true)}
              className="button-mobile"
              style={{
                width: "100%",
                marginTop: "16px",
                padding: "12px 20px",
                background: "#FF8040",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <MdEdit size={16} />
              Edit Profile
            </button>
          </div>
        )}

        {/* Edit Profile Form */}
        {editMode && (
          <div
            className="profile-card-mobile"
            style={{
              background: "white",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#333",
                marginBottom: "16px",
              }}
            >
              Edit Profile
            </div>

            {/* Name Input */}
            <div style={{ marginBottom: "14px" }}>
              <label
                style={{
                  fontSize: "12px",
                  color: "#666",
                  marginBottom: "6px",
                  display: "block",
                  fontWeight: "500",
                }}
              >
                Full Name
              </label>
              <input
                type="text"
                value={editValues.name}
                onChange={(e) =>
                  setEditValues({ ...editValues, name: e.target.value })
                }
                className="form-input-mobile"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  fontSize: "14px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Phone Input */}
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  fontSize: "12px",
                  color: "#666",
                  marginBottom: "6px",
                  display: "block",
                  fontWeight: "500",
                }}
              >
                Phone
              </label>
              <input
                type="tel"
                value={editValues.phone}
                onChange={(e) =>
                  setEditValues({ ...editValues, phone: e.target.value })
                }
                className="form-input-mobile"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  fontSize: "14px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={handleUpdateProfile}
                disabled={loading}
                className="button-mobile"
                style={{
                  flex: 1,
                  padding: "12px 20px",
                  background: "#FF8040",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => setEditMode(false)}
                disabled={loading}
                className="button-mobile"
                style={{
                  flex: 1,
                  padding: "12px 20px",
                  background: "#e5e7eb",
                  color: "#333",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Change Password Section */}
        {!passwordMode && (
          <button
            onClick={() => setPasswordMode(true)}
            className="profile-card-mobile"
            style={{
              width: "100%",
              padding: "16px",
              background: "white",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              borderRadius: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "16px",
              fontSize: "14px",
              fontWeight: "600",
              color: "#333",
              transition: "background 0.2s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.background = "#f9fafb")
            }
            onMouseOut={(e) => (e.currentTarget.style.background = "white")}
          >
            <MdPassword size={20} color="#FF8040" />
            Change Password
          </button>
        )}

        {/* Change Password Form */}
        {passwordMode && (
          <div
            className="profile-card-mobile"
            style={{
              background: "white",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#333",
                marginBottom: "16px",
              }}
            >
              Change Password
            </div>

            {/* Old Password */}
            <div style={{ marginBottom: "14px" }}>
              <label
                style={{
                  fontSize: "12px",
                  color: "#666",
                  marginBottom: "6px",
                  display: "block",
                  fontWeight: "500",
                }}
              >
                Current Password
              </label>
              <input
                type="password"
                value={passwordValues.oldPassword}
                onChange={(e) =>
                  setPasswordValues({
                    ...passwordValues,
                    oldPassword: e.target.value,
                  })
                }
                className="form-input-mobile"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  fontSize: "14px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* New Password */}
            <div style={{ marginBottom: "14px" }}>
              <label
                style={{
                  fontSize: "12px",
                  color: "#666",
                  marginBottom: "6px",
                  display: "block",
                  fontWeight: "500",
                }}
              >
                New Password
              </label>
              <input
                type="password"
                value={passwordValues.newPassword}
                onChange={(e) =>
                  setPasswordValues({
                    ...passwordValues,
                    newPassword: e.target.value,
                  })
                }
                className="form-input-mobile"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  fontSize: "14px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  fontSize: "12px",
                  color: "#666",
                  marginBottom: "6px",
                  display: "block",
                  fontWeight: "500",
                }}
              >
                Confirm Password
              </label>
              <input
                type="password"
                value={passwordValues.confirmPassword}
                onChange={(e) =>
                  setPasswordValues({
                    ...passwordValues,
                    confirmPassword: e.target.value,
                  })
                }
                className="form-input-mobile"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  fontSize: "14px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={handleChangePassword}
                disabled={loading}
                className="button-mobile"
                style={{
                  flex: 1,
                  padding: "12px 20px",
                  background: "#FF8040",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
              <button
                onClick={() => setPasswordMode(false)}
                disabled={loading}
                className="button-mobile"
                style={{
                  flex: 1,
                  padding: "12px 20px",
                  background: "#e5e7eb",
                  color: "#333",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Logout Section - Mobile Only */}
        <div className="logout-section" style={{ display: "none" }}>
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "12px 20px",
              background: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <MdLogout size={16} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
