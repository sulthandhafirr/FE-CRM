import { useRef, useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  MdPerson,
  MdMail,
  MdBusiness,
  MdShield,
  MdLockOutline,
  MdVisibility,
  MdVisibilityOff,
  MdCheckCircle,
  MdError,
  MdWarning,
  MdLogout,
} from "react-icons/md";
import { useTranslation } from "react-i18next";
import { supabase } from "../../../lib/supabase";
import { api } from "../../../lib/api/apiClient";
import { fetchProfileData } from "../profile.service";
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

// Gradient avatar — dipakai juga di UserMenu (header), jadi warnanya sama
const GRADIENT_MAP = [
  ["#FF8040", "#FF6B6B"],
  ["#3B82F6", "#6366F1"],
  ["#10B981", "#34D399"],
  ["#8B5CF6", "#A78BFA"],
  ["#F59E0B", "#F97316"],
];

const getGradientIndex = (name) => {
  if (!name) return 0;
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % GRADIENT_MAP.length;
};

const getGradient = (name) => {
  const [c1, c2] = GRADIENT_MAP[getGradientIndex(name)];
  return `linear-gradient(135deg, ${c1}, ${c2})`;
};

// Warna aksen tag (teks/border) diambil dari warna avatar, bukan dari role
const getAvatarAccent = (name) => GRADIENT_MAP[getGradientIndex(name)][0];

// Ambil path file (folder + nama) dari URL publik avatar
const getStoragePathFromUrl = (url) => {
  if (!url) return null;
  const marker = "/avatars/";
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(url.slice(idx + marker.length));
};

/**
 * Shared profile page UI used by all roles (admin, cs agent, technician,
 * customer), with layout mengikuti referensi mockup:
 * - "Personal Information" card (avatar + form editable + tombol save)
 * - "Account Security" card (ganti password, tanpa 2FA)
 * Role-specific extras:
 * - `tier`: { tierName, tierColor } badge untuk customer
 * - `showPosition`: tampilkan field posisi (admin / technician)
 */
export default function ProfilePageLayout({ tier = null, showPosition = false }) {
  const { t } = useTranslation();
  const { user, name: authName, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State
  const [passwordMode, setPasswordMode] = useState(false);
  const [editValues, setEditValues] = useState({ name: "" });
  const [passwordValues, setPasswordValues] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [messageAnchor, setMessageAnchor] = useState("top"); // "top" | "security"
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

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
      });
    }
  }, [profileData]);

  const showMessage = (type, text, anchor = "top") => {
    setMessage({ type, text });
    setMessageAnchor(anchor);
    setTimeout(() => setMessage({ type: "", text: "" }), 3500);
  };

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
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!editValues.name.trim()) {
      showMessage("error", t("pages.profile.nameRequired"));
      return;
    }

    setSavingProfile(true);
    try {
      const response = await api.put(`/api/profile/${user.id}`, {
        name: editValues.name,
      });

      if (response.status === 200 || response.status === 204) {
        showMessage("success", t("pages.profile.profileUpdatedSuccess"));
        queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      }
    } catch (error) {
      showMessage(
        "error",
        error.response?.data?.message || t("pages.profile.errors.updateProfile")
      );
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle avatar photo upload (upload ke Supabase Storage, lalu simpan URL via API)
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // biar file yang sama bisa dipilih lagi
    if (!file || !user?.id) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      showMessage("error", t("pages.profile.errors.invalidImageType"));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showMessage("error", t("pages.profile.errors.imageTooLarge"));
      return;
    }

    setUploadingAvatar(true);
    try {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const filePath = `${user.id}/avatar-${Date.now()}.${ext}`;
      const oldPath = getStoragePathFromUrl(profileData?.avatar_url);

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          contentType: file.type,
          upsert: false,
        });
      if (uploadError) throw uploadError;

      const publicUrl = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath).data.publicUrl;

      const response = await api.put(`/api/profile/${user.id}`, {
        avatarUrl: publicUrl,
      });

      if (response.status === 200 || response.status === 204) {
        // Hapus foto lama setelah foto baru berhasil disimpan
        if (oldPath) {
          await supabase.storage.from("avatars").remove([oldPath]);
        }
        showMessage("success", t("pages.profile.avatarUpdatedSuccess"));
        queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      }
    } catch (error) {
      showMessage(
        "error",
        error.message || t("pages.profile.errors.avatarUpload")
      );
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Handle change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordValues.currentPassword) {
      showMessage("error", t("pages.profile.currentPasswordRequired"), "security");
      return;
    }

    if (!passwordValues.newPassword) {
      showMessage("error", t("pages.profile.passwordRequired"), "security");
      return;
    }

    if (passwordValues.newPassword !== passwordValues.confirmPassword) {
      showMessage("error", t("pages.profile.passwordMismatch"), "security");
      return;
    }

    if (passwordValues.newPassword.length < 6) {
      showMessage("error", t("pages.profile.passwordTooShort"), "security");
      return;
    }

    setSavingPassword(true);
    try {
      // Verify the current password before allowing the update
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user?.email,
        password: passwordValues.currentPassword,
      });

      if (verifyError) {
        showMessage(
          "error",
          verifyError.message || t("pages.profile.errors.changePassword"),
          "security"
        );
        return;
      }

      await supabase.auth.updateUser({
        password: passwordValues.newPassword,
      });

      showMessage("success", t("pages.profile.passwordChangedSuccess"), "security");
      setPasswordValues({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordMode(false);
    } catch (error) {
      showMessage(
        "error",
        error.message || t("pages.profile.errors.changePassword"),
        "security"
      );
    } finally {
      setSavingPassword(false);
    }
  };

  const togglePassword = (field) =>
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));

  // Field with leading icon (dan opsi suffix, mis. toggle mata password)
  const renderField = ({ id, label, icon, inputProps = {}, suffix }) => (
    <div>
      <label htmlFor={id} className="profile-label">
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <span
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#9CA3AF",
            display: "flex",
            pointerEvents: "none",
          }}
        >
          {icon}
        </span>
        <input
          id={id}
          {...inputProps}
          className="profile-input"
          style={{
            paddingLeft: 38,
            paddingRight: suffix ? 42 : 14,
            ...(inputProps.style || {}),
          }}
        />
        {suffix}
      </div>
    </div>
  );

  const renderPasswordField = (field, label, autoComplete) => (
    <div style={{ marginBottom: 16 }}>
      {renderField({
        id: `profile-${field}`,
        label,
        icon: <MdLockOutline size={17} />,
        inputProps: {
          type: showPasswords[field] ? "text" : "password",
          value: passwordValues[field],
          onChange: (e) =>
            setPasswordValues({ ...passwordValues, [field]: e.target.value }),
          autoComplete,
        },
        suffix: (
          <button
            type="button"
            onClick={() => togglePassword(field)}
            aria-label={showPasswords[field] ? "Hide password" : "Show password"}
            title={showPasswords[field] ? "Hide password" : "Show password"}
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 30,
              height: 30,
              border: "none",
              background: "transparent",
              color: "#9CA3AF",
              cursor: "pointer",
              borderRadius: 8,
              transition: "color 0.15s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = "#FF8040")}
            onMouseOut={(e) => (e.currentTarget.style.color = "#9CA3AF")}
          >
            {showPasswords[field] ? (
              <MdVisibilityOff size={18} />
            ) : (
              <MdVisibility size={18} />
            )}
          </button>
        ),
      })}
    </div>
  );

  if (authLoading || profileLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          gap: 10,
          color: "#9CA3AF",
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        <span className="profile-spinner" />
        Loading...
      </div>
    );
  }

  const displayName = profileData?.name || user?.email || "User";
  const position = profileData?.position || null;
  const avatarAccent = getAvatarAccent(authName);

  const messageAlert = message.text ? (
    <div
      role="alert"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 16px",
        borderRadius: 12,
        marginBottom: 20,
        fontSize: 13.5,
        fontWeight: 500,
        background: message.type === "success" ? "#F0FDF4" : "#FEF2F2",
        color: message.type === "success" ? "#16A34A" : "#DC2626",
        border:
          message.type === "success"
            ? "1px solid #BBF7D0"
            : "1px solid #FECACA",
      }}
    >
      {message.type === "success" ? (
        <MdCheckCircle size={19} style={{ flexShrink: 0 }} />
      ) : (
        <MdError size={19} style={{ flexShrink: 0 }} />
      )}
      {message.text}
    </div>
  ) : null;

  return (
    <div
      style={{
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <style>{`
        .profile-container {
          padding: 28px 30px 48px;
        }

        .profile-card {
          background: #FFFFFF;
          border: 1px solid #E7E9EE;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          padding: 24px;
          margin-bottom: 20px;
        }

        .profile-section-title {
          font-size: 17px;
          font-weight: 600;
          color: #111827;
          padding-bottom: 14px;
          border-bottom: 1px solid #F1F2F4;
          margin-bottom: 20px;
        }

        .profile-body-row {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }
        @media (min-width: 768px) {
          .profile-body-row {
            flex-direction: row;
            align-items: flex-start;
          }
        }

        .profile-fields-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px;
        }
        @media (min-width: 768px) {
          .profile-fields-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .profile-security-row {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        @media (min-width: 768px) {
          .profile-security-row {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }

        .profile-label {
          display: block;
          font-size: 12.5px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 7px;
        }

        .profile-input {
          width: 100%;
          padding: 10px 14px;
          font-size: 14px;
          color: #111827;
          background: #FFFFFF;
          border: 1px solid #E5E7EB;
          border-radius: 10px;
          box-sizing: border-box;
          font-family: inherit;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .profile-input:focus {
          outline: none;
          border-color: #FF8040;
          box-shadow: 0 0 0 3px rgba(255, 128, 64, 0.14);
        }
        .profile-input:disabled {
          background: #F9FAFB;
          color: #9CA3AF;
          cursor: not-allowed;
        }

        .profile-btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 11px 22px;
          border: none;
          border-radius: 10px;
          background: #FF8040;
          color: #FFFFFF;
          font-size: 14px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
        }
        .profile-btn-primary:hover:not(:disabled) {
          background: #E67339;
          box-shadow: 0 4px 14px rgba(255, 128, 64, 0.32);
        }
        .profile-btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .profile-btn-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 11px 20px;
          border: 1px solid #E5E7EB;
          border-radius: 10px;
          background: #FFFFFF;
          color: #374151;
          font-size: 14px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .profile-btn-secondary:hover:not(:disabled) {
          background: #F9FAFB;
        }
        .profile-btn-secondary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .profile-btn-danger {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 11px 20px;
          border: 1px solid #FECACA;
          border-radius: 10px;
          background: #FFFFFF;
          color: #DC2626;
          font-size: 14px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .profile-btn-danger:hover {
          background: #FEF2F2;
        }

        .profile-spinner {
          width: 16px;
          height: 16px;
          border: 2.5px solid #FFD6BC;
          border-top-color: #FF8040;
          border-radius: 50%;
          animation: profile-spin 0.7s linear infinite;
          display: inline-block;
          flex-shrink: 0;
        }
        @keyframes profile-spin {
          to { transform: rotate(360deg); }
        }

        .profile-avatar {
          position: relative;
          cursor: pointer;
        }
        .profile-avatar-overlay {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFFFFF;
          font-size: 12px;
          font-weight: 500;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .profile-avatar:hover .profile-avatar-overlay {
          opacity: 1;
        }

        @media (max-width: 767px) {
          .profile-container { padding: 16px 14px 100px; }
          .profile-card { padding: 18px; border-radius: 14px; }
        }
        @media (max-width: 767px) {
          .logout-section { display: flex !important; }
        }
        @media (min-width: 768px) {
          .logout-section { display: none !important; }
        }
      `}</style>

      <div className="profile-container">
        {/* Page Header */}
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              fontSize: 24,
              fontWeight: 600,
              color: "#111827",
              letterSpacing: "-0.02em",
            }}
          >
            {t("pages.profile.title")}
          </div>
          <div style={{ fontSize: 13.5, color: "#6B7280", marginTop: 4 }}>
            {t("pages.profile.subtitle")}
          </div>
        </div>

        {/* Message Alert */}
        {messageAnchor === "top" && messageAlert}

        {/* Section 1: Personal Information */}
        <div className="profile-card">
          <div className="profile-section-title">
            {t("pages.profile.personalInformation")}
          </div>

          <div className="profile-body-row">
            {/* Avatar + badges */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                className="profile-avatar"
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: "50%",
                  background: getGradient(authName),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  fontSize: 30,
                  fontWeight: 700,
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
                  overflow: "hidden",
                }}
              >
                {profileData?.avatar_url ? (
                  <img
                    src={profileData.avatar_url}
                    alt={displayName}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  getInitials(displayName)
                )}
                <div className="profile-avatar-overlay">
                  {uploadingAvatar ? (
                    <span className="profile-spinner" />
                  ) : (
                    t("pages.profile.changeAvatar")
                  )}
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: "none" }}
                onChange={handleAvatarChange}
              />

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    fontSize: 12,
                    fontWeight: 600,
                    color: avatarAccent,
                    background: `${avatarAccent}1A`,
                    border: `1px solid ${avatarAccent}40`,
                    padding: "4px 12px",
                    borderRadius: 999,
                  }}
                >
                  {getRoleDisplayName(role)}
                </span>

                {tier?.tierName && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      color: tier.tierColor || "#6B7280",
                      background: `${tier.tierColor || "#6B7280"}1A`,
                      border: `1.5px solid ${tier.tierColor || "#6B7280"}`,
                      padding: "3px 12px",
                      borderRadius: 999,
                    }}
                  >
                    {tier.tierName}
                  </span>
                )}
              </div>
            </div>

            {/* Form */}
            <form
              onSubmit={handleUpdateProfile}
              style={{ flex: 1, width: "100%", minWidth: 0, maxWidth: 900 }}
            >
              <div className="profile-fields-grid">
                {renderField({
                  id: "profile-edit-name",
                  label: t("pages.profile.fullName"),
                  icon: <MdPerson size={17} />,
                  inputProps: {
                    type: "text",
                    value: editValues.name,
                    onChange: (e) =>
                      setEditValues({ ...editValues, name: e.target.value }),
                  },
                })}

                {renderField({
                  id: "profile-edit-email",
                  label: t("pages.profile.email"),
                  icon: <MdMail size={17} />,
                  inputProps: {
                    type: "email",
                    value: user?.email || "",
                    disabled: true,
                  },
                })}

                {showPosition && position
                  ? renderField({
                      id: "profile-edit-position",
                      label: t("pages.profile.position"),
                      icon: <MdBusiness size={17} />,
                      inputProps: {
                        type: "text",
                        value: position,
                        disabled: true,
                      },
                    })
                  : null}
              </div>

              <div style={{ marginTop: 22 }}>
                <button
                  type="submit"
                  className="profile-btn-primary"
                  disabled={savingProfile}
                >
                  {savingProfile ? (
                    <>
                      <span className="profile-spinner" />
                      {t("pages.profile.saving")}
                    </>
                  ) : (
                    <>
                      <MdCheckCircle size={16} />
                      {t("pages.profile.saveChanges")}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Account Security Warning */}
        <div
          role="note"
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            padding: "12px 16px",
            borderRadius: 12,
            marginBottom: 20,
            fontSize: 13.5,
            fontWeight: 500,
            background: "#FFFBEB",
            color: "#92400E",
            border: "1px solid #FDE68A",
          }}
        >
          <MdWarning size={19} style={{ flexShrink: 0, marginTop: 1 }} />
          {t("pages.profile.passwordSecurityWarning")}
        </div>

        {/* Notification above Account Security */}
        {messageAnchor === "security" && messageAlert}

        {/* Section 2: Account Security */}
        <div className="profile-card">
          <div
            className="profile-section-title"
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <MdShield size={20} color="#FF8040" />
            {t("pages.profile.accountSecurity")}
          </div>

          {!passwordMode ? (
            <div className="profile-security-row">
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                  {t("pages.profile.password")}
                </div>
                <div style={{ fontSize: 13, color: "#6B7280", marginTop: 3 }}>
                  {t("pages.profile.passwordDescription")}
                </div>
              </div>
              <button
                type="button"
                className="profile-btn-secondary"
                onClick={() => setPasswordMode(true)}
              >
                <MdLockOutline size={16} />
                {t("pages.profile.changePassword")}
              </button>
            </div>
          ) : (
            <form onSubmit={handleChangePassword} style={{ maxWidth: 460 }}>
              {renderPasswordField(
                "currentPassword",
                t("pages.profile.currentPassword"),
                "current-password"
              )}
              {renderPasswordField(
                "newPassword",
                t("pages.profile.newPassword"),
                "new-password"
              )}
              {renderPasswordField(
                "confirmPassword",
                t("pages.profile.confirmPassword"),
                "new-password"
              )}

              <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                <button
                  type="submit"
                  className="profile-btn-primary"
                  disabled={savingPassword}
                >
                  {savingPassword ? (
                    <>
                      <span className="profile-spinner" />
                      {t("pages.profile.updating")}
                    </>
                  ) : (
                    <>
                      <MdCheckCircle size={16} />
                      {t("pages.profile.updatePassword")}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="profile-btn-secondary"
                  onClick={() => setPasswordMode(false)}
                  disabled={savingPassword}
                >
                  {t("pages.profile.cancel")}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Logout Section - Mobile Only */}
        <div className="logout-section" style={{ display: "none" }}>
          <button
            type="button"
            className="profile-btn-danger"
            onClick={handleLogout}
          >
            <MdLogout size={16} />
            {t("pages.profile.logout")}
          </button>
        </div>
      </div>
    </div>
  );
}
