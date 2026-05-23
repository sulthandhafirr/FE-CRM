import { useEffect, useRef, useState } from "react";
import { MdNotificationsNone, MdDoneAll, MdCircle } from "react-icons/md";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "./notification.service";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import { useTranslation } from "react-i18next";

export default function NotificationBell() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notification",
        },
        (payload) => {
          if (payload.new.user_id !== user?.id) return;
          setNotifications((prev) => [
            {
              id: payload.new.id,
              message: payload.new.message,
              isRead: payload.new.is_read,
              createdAt: payload.new.created_at,
            },
            ...prev,
          ]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMarkAsRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );

    try {
      await markAsRead(id);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);

      fetchNotifications();
    }
  };

  const handleMarkAllAsRead = async () => {
    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        isRead: true,
      })),
    );

    try {
      await markAllAsRead();
    } catch (error) {
      console.error("Failed to mark all as read:", error);

      fetchNotifications();
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const locale = (i18n.language || "en").split("-")[0];
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

    if (diffMins < 1) return locale === "id" ? "Baru saja" : "Just now";
    if (diffMins < 60) return rtf.format(-diffMins, "minute");
    if (diffHours < 24) return rtf.format(-diffHours, "hour");
    if (diffDays < 30) return rtf.format(-diffDays, "day");
    return date.toLocaleDateString(locale === "id" ? "id-ID" : "en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div
      ref={dropdownRef}
      style={{
        position: "relative",
      }}
    >
      {/* Bell Button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#f5f5f5";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
        }}
        style={{
          position: "relative",
          border: "none",
          background: "transparent",
          width: "48px",
          height: "48px",
          borderRadius: "12px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "none",
          transition: "all 0.2s ease",
        }}
      >
        <MdNotificationsNone size={24} color="#ff7a33" />

        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              minWidth: "18px",
              height: "18px",
              borderRadius: "999px",
              background: "#ff7a33",
              color: "white",
              fontSize: "11px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 5px",
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "fixed",
            top: "58px",
            right: window.innerWidth < 768 ? "16px" : "32px",
            width: "360px",
            maxWidth: "calc(100vw - 32px)",
            maxHeight: "500px",
            overflow: "hidden",
            background: "white",
            borderRadius: "16px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
            border: "1px solid #eee",
            zIndex: 9999,
            animation: "fadeIn 0.2s ease",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "18px 20px",
              borderBottom: "1px solid #f1f1f1",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#222",
                }}
              >
                {t("pages.notificationBell.title")}
              </div>

              <div
                style={{
                  fontSize: "13px",
                  color: "#888",
                  marginTop: "2px",
                }}
              >
                {t("pages.notificationBell.unread", { count: unreadCount })}
              </div>
            </div>

            {notifications.length > 0 && unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                style={{
                  border: "none",
                  background: "#fff4ee",
                  color: "#ff7a33",
                  padding: "8px 12px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <MdDoneAll size={16} />
                {t("pages.notificationBell.readAll")}
              </button>
            )}
          </div>

          {/* Notification List */}
          <div
            style={{
              maxHeight: "420px",
              overflowY: "auto",
            }}
          >
            {loading ? (
              <div
                style={{
                  padding: "30px",
                  textAlign: "center",
                  color: "#999",
                  fontSize: "14px",
                }}
              >
                {t("pages.notificationBell.loading")}
              </div>
            ) : notifications.length === 0 ? (
              <div
                style={{
                  padding: "40px 20px",
                  textAlign: "center",
                  color: "#999",
                  fontSize: "14px",
                }}
              >
                {t("pages.notificationBell.empty")}
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => {
                    if (!notification.isRead) {
                      handleMarkAsRead(notification.id);
                    }
                  }}
                  style={{
                    padding: "16px 20px",
                    borderBottom: "1px solid #f5f5f5",
                    cursor: "pointer",
                    transition: "background 0.2s ease",
                    background: notification.isRead ? "#fff" : "#fff8f4",
                    display: "flex",
                    gap: "12px",
                    alignItems: "flex-start",
                  }}
                >
                  {/* unread indicator */}
                  <div
                    style={{
                      marginTop: "6px",
                    }}
                  >
                    <MdCircle
                      size={10}
                      color={notification.isRead ? "#ddd" : "#ff7a33"}
                    />
                  </div>

                  {/* content */}
                  <div
                    style={{
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#222",
                        lineHeight: 1.5,
                        fontWeight: notification.isRead ? 400 : 600,
                      }}
                    >
                      {notification.message}
                    </div>

                    <div
                      style={{
                        marginTop: "6px",
                        fontSize: "12px",
                        color: "#999",
                      }}
                    >
                      {formatTime(notification.createdAt)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
