import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { ROUTE } from "../router/routes";
import {
  MdDashboard,
  MdConfirmationNumber,
  MdForum,
  MdTrendingUp,
  MdPerson,
  MdLogout,
  MdChat,
  MdArrowBack,
  MdAttachFile,
  MdAccountCircle,
  MdSupportAgent,
} from "react-icons/md";
import ChatBot from "../components/ChatBot";

export default function CsAgentTicket() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("ticket");
  const [chatOpen, setChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Ticket list state
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Detail view state
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [responseText, setResponseText] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // ─── Fetch all tickets for CS Agent ───
  const fetchTickets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("ticket")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formatted = data.map((t) => ({
        id: t.id,
        createdAt: new Date(t.created_at).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
        rawDate: t.created_at,
        name: t.subject,
        description: t.description,
        category: t.category,
        priority: t.priority,
        status: t.status,
        solver: t.solver || "Not yet",
        customer: t.created_by,
      }));
      setTickets(formatted);
    } catch (error) {
      console.error("Error fetching tickets:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Fetch timeline for a single ticket ───
  const fetchTimeline = async (ticketId) => {
    try {
      const { data, error } = await supabase
        .from("ticket_timeline")
        .select("*")
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setTimeline(data || []);
    } catch (err) {
      console.error("Error fetching timeline:", err.message);
      // If the table doesn't exist yet, fall back to empty
      setTimeline([]);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // ─── Open ticket detail ───
  const openTicketDetail = (ticket) => {
    setSelectedTicket(ticket);
    fetchTimeline(ticket.id);
    setResponseText("");
    setAttachment(null);
  };

  // ─── Submit response ───
  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    if (!responseText.trim()) return;
    try {
      setSubmitting(true);

      // Insert into ticket_timeline
      const { error } = await supabase.from("ticket_timeline").insert([
        {
          ticket_id: selectedTicket.id,
          action: "Response Ticket",
          description: responseText,
          actor: "CS Agent",
          created_at: new Date().toISOString(),
        },
      ]);
      if (error) throw error;

      if (selectedTicket.status === "Waiting") {
        await supabase
          .from("ticket")
          .update({ status: "Progress" })
          .eq("id", selectedTicket.id);
        setSelectedTicket({ ...selectedTicket, status: "Progress" });
      }

      setResponseText("");
      setAttachment(null);
      fetchTimeline(selectedTicket.id);
      alert("Response submitted!");
    } catch (err) {
      console.error("Error submitting response:", err.message);
      alert("Failed to submit response.");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Take Action (assign to self) ───
  const handleTakeAction = async (ticket) => {
    try {
      const { error } = await supabase
        .from("ticket")
        .update({ solver: "You", status: "Progress" })
        .eq("id", ticket.id);
      if (error) throw error;
      fetchTickets();
    } catch (err) {
      console.error("Error taking action:", err.message);
    }
  };

  // ─── Dispatch to technician (placeholder) ───
  const handleDispatch = async (ticket) => {
    const techName = prompt("Enter technician name to dispatch to:");
    if (!techName) return;
    try {
      const { error } = await supabase
        .from("ticket")
        .update({ solver: techName, status: "Progress" })
        .eq("id", ticket.id);
      if (error) throw error;
      fetchTickets();
    } catch (err) {
      console.error("Error dispatching:", err.message);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate(ROUTE.login);
  };

  // ─── Style helpers ───
  const menuItemStyle = (menuKey) => ({
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "12px 15px",
    marginBottom: "5px",
    borderRadius: "8px",
    background: activeMenu === menuKey ? "#FF8040" : "transparent",
    color: activeMenu === menuKey ? "white" : "#666",
    cursor: "pointer",
    transition: "all 0.2s",
    fontWeight: "500",
  });

  const handleMouseEnter = (e, menuKey) => {
    if (activeMenu !== menuKey) e.currentTarget.style.background = "#f5f5f5";
  };
  const handleMouseLeave = (e, menuKey) => {
    if (activeMenu !== menuKey)
      e.currentTarget.style.background = "transparent";
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Crucial":
        return "#dc2626";
      case "High":
        return "#ea580c";
      case "Normal":
        return "#666";
      case "Low":
        return "#16a34a";
      default:
        return "#666";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Progress":
        return "#FF8040";
      case "Waiting":
        return "#f59e0b";
      case "Solved":
        return "#16a34a";
      default:
        return "#666";
    }
  };

  // Filter tickets by search
  const filteredTickets = tickets.filter(
    (t) =>
      t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customer?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // ─── RENDER ───
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f5f5f5",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* ────────── SIDEBAR ────────── */}
      <div
        style={{
          width: sidebarOpen ? "220px" : "70px",
          background: "#ffffff",
          transition: "width 0.3s ease",
          boxShadow: "2px 0 5px rgba(0,0,0,0.05)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          zIndex: 100,
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: sidebarOpen ? "25px 20px" : "25px 15px",
            fontSize: "28px",
            fontWeight: "700",
            color: "#FF8040",
            cursor: "pointer",
          }}
          onClick={() => navigate(ROUTE.agentDashboard)}
        >
          {sidebarOpen ? "crm." : "c."}
        </div>

        {/* Menu Items */}
        <div style={{ flex: 1, padding: "10px" }}>
          {/* Dashboard */}
          <div
            onClick={() => {
              setActiveMenu("dashboard");
              navigate(ROUTE.agentDashboard);
            }}
            style={menuItemStyle("dashboard")}
            onMouseOver={(e) => handleMouseEnter(e, "dashboard")}
            onMouseOut={(e) => handleMouseLeave(e, "dashboard")}
          >
            <MdDashboard size={18} />
            {sidebarOpen && <span>Dashboard</span>}
          </div>

          {/* Ticket */}
          <div
            onClick={() => {
              setActiveMenu("ticket");
              setSelectedTicket(null);
            }}
            style={menuItemStyle("ticket")}
            onMouseOver={(e) => handleMouseEnter(e, "ticket")}
            onMouseOut={(e) => handleMouseLeave(e, "ticket")}
          >
            <MdConfirmationNumber size={18} />
            {sidebarOpen && <span>Ticket</span>}
          </div>

          {/* Discussion */}
          <div
            onClick={() => setActiveMenu("discussion")}
            style={menuItemStyle("discussion")}
            onMouseOver={(e) => handleMouseEnter(e, "discussion")}
            onMouseOut={(e) => handleMouseLeave(e, "discussion")}
          >
            <MdForum size={18} />
            {sidebarOpen && <span>Discussion</span>}
          </div>

          {/* Performance */}
          <div
            onClick={() => setActiveMenu("performance")}
            style={menuItemStyle("performance")}
            onMouseOver={(e) => handleMouseEnter(e, "performance")}
            onMouseOut={(e) => handleMouseLeave(e, "performance")}
          >
            <MdTrendingUp size={18} />
            {sidebarOpen && <span>Performance</span>}
          </div>
        </div>

        {/* Profile at bottom */}
        <div style={{ padding: "10px" }}>
          <div
            onClick={() => setActiveMenu("profile")}
            style={menuItemStyle("profile")}
            onMouseOver={(e) => handleMouseEnter(e, "profile")}
            onMouseOut={(e) => handleMouseLeave(e, "profile")}
          >
            <MdPerson size={18} />
            {sidebarOpen && <span>Profile</span>}
          </div>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: "absolute",
            right: "-12px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            background: "#FF8040",
            border: "2px solid white",
            color: "white",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
          }}
        >
          {sidebarOpen ? "‹" : "›"}
        </button>
      </div>

      {/* ────────── MAIN CONTENT ────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Top Bar */}
        <div
          style={{
            background: "white",
            padding: "15px 30px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
          }}
        >
          {selectedTicket ? (
            <button
              onClick={() => setSelectedTicket(null)}
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
              <MdArrowBack size={20} />
            </button>
          ) : (
            <div style={{ flex: 1, maxWidth: "400px" }}>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 15px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>
          )}

          <button
            onClick={handleSignOut}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#666",
            }}
          >
            <MdLogout size={24} />
          </button>
        </div>

        {/* Page Content */}
        <div style={{ padding: "30px", flex: 1, overflowY: "auto" }}>
          {selectedTicket ? (
            /* ═══════════ TICKET DETAIL VIEW ═══════════ */
            <div
              style={{ display: "flex", gap: "25px", alignItems: "flex-start" }}
            >
              {/* Left Column */}
              <div style={{ flex: 2 }}>
                {/* Ticket Info Card */}
                <div
                  style={{
                    background: "white",
                    borderRadius: "12px",
                    padding: "30px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    marginBottom: "20px",
                  }}
                >
                  <h2
                    style={{
                      fontSize: "24px",
                      fontWeight: "700",
                      marginBottom: "10px",
                      color: "#333",
                    }}
                  >
                    {selectedTicket.name}
                  </h2>

                  <div
                    style={{
                      color: "#FF8040",
                      fontWeight: "600",
                      fontSize: "14px",
                      marginBottom: "5px",
                    }}
                  >
                    Description
                  </div>
                  <p
                    style={{
                      color: "#555",
                      lineHeight: "1.6",
                      marginBottom: "25px",
                    }}
                  >
                    {selectedTicket.description || "No description provided."}
                  </p>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "20px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          color: "#FF8040",
                          fontWeight: "600",
                          fontSize: "14px",
                          marginBottom: "4px",
                        }}
                      >
                        Created at
                      </div>
                      <div style={{ color: "#333" }}>
                        {selectedTicket.createdAt}
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          color: "#FF8040",
                          fontWeight: "600",
                          fontSize: "14px",
                          marginBottom: "4px",
                        }}
                      >
                        Priority
                      </div>
                      <div
                        style={{
                          color: getPriorityColor(selectedTicket.priority),
                        }}
                      >
                        {selectedTicket.priority}
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          color: "#FF8040",
                          fontWeight: "600",
                          fontSize: "14px",
                          marginBottom: "4px",
                        }}
                      >
                        Customer
                      </div>
                      <div
                        style={{
                          color: "#333",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <MdAccountCircle size={18} color="#FF8040" />
                        {selectedTicket.customer}
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          color: "#FF8040",
                          fontWeight: "600",
                          fontSize: "14px",
                          marginBottom: "4px",
                        }}
                      >
                        Status
                      </div>
                      <div
                        style={{
                          color: getStatusColor(selectedTicket.status),
                          fontWeight: "600",
                        }}
                      >
                        {selectedTicket.status}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Add Response Card */}
                <div
                  style={{
                    background: "white",
                    borderRadius: "12px",
                    padding: "30px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "20px",
                      fontWeight: "700",
                      marginBottom: "15px",
                      color: "#333",
                    }}
                  >
                    Add Response
                  </h3>
                  <form onSubmit={handleSubmitResponse}>
                    <textarea
                      rows="4"
                      placeholder="Text"
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                        resize: "none",
                        fontSize: "14px",
                        outline: "none",
                        marginBottom: "10px",
                        boxSizing: "border-box",
                      }}
                    />
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        marginBottom: "15px",
                      }}
                    >
                      <label
                        style={{
                          color: "#FF8040",
                          fontWeight: "600",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          fontSize: "14px",
                        }}
                      >
                        Attachment <MdAttachFile size={18} />
                        <input
                          type="file"
                          style={{ display: "none" }}
                          onChange={(e) => setAttachment(e.target.files[0])}
                        />
                      </label>
                    </div>
                    {attachment && (
                      <div
                        style={{
                          marginBottom: "10px",
                          fontSize: "13px",
                          color: "#888",
                        }}
                      >
                        Selected: {attachment.name}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: "15px" }}>
                      <button
                        type="button"
                        onClick={() => handleDispatch(selectedTicket)}
                        style={{
                          padding: "10px 25px",
                          borderRadius: "8px",
                          border: "2px solid #FF8040",
                          background: "white",
                          color: "#FF8040",
                          fontWeight: "600",
                          cursor: "pointer",
                          fontSize: "14px",
                        }}
                      >
                        Dispatch
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        style={{
                          padding: "10px 30px",
                          borderRadius: "8px",
                          border: "none",
                          background: "#FF8040",
                          color: "white",
                          fontWeight: "600",
                          cursor: submitting ? "not-allowed" : "pointer",
                          opacity: submitting ? 0.7 : 1,
                          fontSize: "14px",
                        }}
                      >
                        {submitting ? "Submitting..." : "Submit"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Right Column — Timeline */}
              <div
                style={{
                  flex: 1,
                  background: "white",
                  borderRadius: "12px",
                  padding: "30px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  minHeight: "400px",
                }}
              >
                <h3
                  style={{
                    fontSize: "22px",
                    fontWeight: "700",
                    marginBottom: "25px",
                    color: "#333",
                  }}
                >
                  Timeline
                </h3>

                {timeline.length === 0 ? (
                  <div style={{ color: "#999", fontSize: "14px" }}>
                    No timeline events yet.
                  </div>
                ) : (
                  <div style={{ position: "relative", paddingLeft: "35px" }}>
                    {/* Vertical line */}
                    <div
                      style={{
                        position: "absolute",
                        left: "14px",
                        top: "10px",
                        bottom: "10px",
                        width: "2px",
                        background: "#FF8040",
                      }}
                    />

                    {timeline.map((event, idx) => {
                      const eventDate = new Date(event.created_at);
                      const dateStr = eventDate.toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      });
                      const timeStr = eventDate.toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                      const isAgent =
                        event.actor === "CS Agent" || event.actor === "System";

                      return (
                        <div
                          key={event.id || idx}
                          style={{
                            position: "relative",
                            marginBottom: "30px",
                          }}
                        >
                          {/* Circle icon */}
                          <div
                            style={{
                              position: "absolute",
                              left: "-35px",
                              top: "0",
                              width: "30px",
                              height: "30px",
                              borderRadius: "50%",
                              background: "white",
                              border: "2px solid #FF8040",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {isAgent ? (
                              <MdSupportAgent size={16} color="#FF8040" />
                            ) : (
                              <MdAccountCircle size={16} color="#FF8040" />
                            )}
                          </div>

                          {/* Event card */}
                          <div
                            style={{
                              border: "1.5px solid #FF8040",
                              borderRadius: "10px",
                              padding: "12px 15px",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                gap: "12px",
                                fontSize: "12px",
                                color: "#FF8040",
                                fontWeight: "600",
                                marginBottom: "6px",
                              }}
                            >
                              <span>{dateStr}</span>
                              <span>{timeStr}</span>
                            </div>
                            <div
                              style={{
                                fontWeight: "600",
                                color: "#333",
                                fontSize: "14px",
                                marginBottom: event.description ? "4px" : 0,
                              }}
                            >
                              {event.action}
                            </div>
                            {event.description && (
                              <div
                                style={{
                                  fontSize: "13px",
                                  color: "#666",
                                  lineHeight: "1.5",
                                }}
                              >
                                • {event.description}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ═══════════ TICKET LIST VIEW ═══════════ */
            <>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  marginBottom: "25px",
                  color: "#333",
                }}
              >
                List of Ticket
              </div>

              <div
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "25px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
              >
                {loading ? (
                  <div style={{ textAlign: "center", padding: "20px" }}>
                    Loading...
                  </div>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #f0f0f0" }}>
                        <th
                          style={{
                            padding: "15px 10px",
                            textAlign: "left",
                            color: "#FF8040",
                            fontWeight: "600",
                          }}
                        >
                          Created at
                        </th>
                        <th
                          style={{
                            padding: "15px 10px",
                            textAlign: "left",
                            color: "#FF8040",
                            fontWeight: "600",
                          }}
                        >
                          Name
                        </th>
                        <th
                          style={{
                            padding: "15px 10px",
                            textAlign: "left",
                            color: "#FF8040",
                            fontWeight: "600",
                          }}
                        >
                          Priority
                        </th>
                        <th
                          style={{
                            padding: "15px 10px",
                            textAlign: "left",
                            color: "#FF8040",
                            fontWeight: "600",
                          }}
                        >
                          Dispatch to
                        </th>
                        <th
                          style={{
                            padding: "15px 10px",
                            textAlign: "left",
                            color: "#FF8040",
                            fontWeight: "600",
                          }}
                        >
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTickets.map((ticket) => {
                        const isAssignedToSelf = ticket.solver === "You";
                        const isDispatched =
                          ticket.solver !== "Not yet" && !isAssignedToSelf;

                        return (
                          <tr
                            key={ticket.id}
                            style={{ borderBottom: "1px solid #f0f0f0" }}
                          >
                            <td style={{ padding: "18px 10px", color: "#333" }}>
                              {ticket.createdAt}
                            </td>
                            <td style={{ padding: "18px 10px", color: "#333" }}>
                              {ticket.name}
                            </td>
                            <td
                              style={{
                                padding: "18px 10px",
                                color: getPriorityColor(ticket.priority),
                                fontWeight: "500",
                              }}
                            >
                              {ticket.priority}
                            </td>
                            <td style={{ padding: "18px 10px" }}>
                              {isDispatched ? (
                                <span
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    color: "#333",
                                  }}
                                >
                                  <MdPerson size={16} /> {ticket.solver}
                                </span>
                              ) : isAssignedToSelf ? (
                                <span
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    color: "#FF8040",
                                  }}
                                >
                                  <MdSupportAgent size={16} /> You
                                </span>
                              ) : (
                                <span style={{ color: "#aaa" }}>Not yet</span>
                              )}
                            </td>
                            <td style={{ padding: "18px 10px" }}>
                              <div
                                style={{
                                  display: "flex",
                                  gap: "8px",
                                  flexWrap: "wrap",
                                }}
                              >
                                {/* If the agent already owns it → Follow up */}
                                {isAssignedToSelf ? (
                                  <button
                                    onClick={() => openTicketDetail(ticket)}
                                    style={{
                                      padding: "6px 16px",
                                      borderRadius: "6px",
                                      border: "2px solid #FF8040",
                                      background: "white",
                                      color: "#FF8040",
                                      fontWeight: "600",
                                      cursor: "pointer",
                                      fontSize: "13px",
                                    }}
                                  >
                                    Follow up
                                  </button>
                                ) : isDispatched ? /* Already dispatched to someone else — no actions */
                                null : (
                                  /* Unassigned → Take Action + Dispatch */
                                  <>
                                    <button
                                      onClick={() => {
                                        handleTakeAction(ticket);
                                      }}
                                      style={{
                                        padding: "6px 16px",
                                        borderRadius: "6px",
                                        border: "2px solid #FF8040",
                                        background: "white",
                                        color: "#FF8040",
                                        fontWeight: "600",
                                        cursor: "pointer",
                                        fontSize: "13px",
                                      }}
                                    >
                                      Take Action
                                    </button>
                                    <button
                                      onClick={() => handleDispatch(ticket)}
                                      style={{
                                        padding: "6px 16px",
                                        borderRadius: "6px",
                                        border: "none",
                                        background: "#FF8040",
                                        color: "white",
                                        fontWeight: "600",
                                        cursor: "pointer",
                                        fontSize: "13px",
                                      }}
                                    >
                                      Dispatch
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredTickets.length === 0 && (
                        <tr>
                          <td
                            colSpan="5"
                            style={{
                              textAlign: "center",
                              padding: "30px",
                              color: "#999",
                            }}
                          >
                            No tickets found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
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
    </div>
  );
}
