import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { ROUTE } from "../router/routes";
import {
  MdDashboard,
  MdConfirmationNumber,
  MdHistory,
  MdPerson,
  MdLogout,
  MdChat,
} from "react-icons/md";
import ChatBot from "../components/ChatBot";

export default function CustomerTicket() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("ticket");
  const [chatOpen, setChatOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // State untuk data tiket
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // State untuk form input
  const [formData, setFormData] = useState({
    subject: "",
    category: "",
    description: "",
  });

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("ticket")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedData = data.map((t) => ({
        id: t.id,
        // Menggunakan t.created_at dari database
        createdAt: new Date(t.created_at).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
        name: t.subject,
        priority: t.priority,
        status: t.status,
        solver: t.solver,
      }));
      setTickets(formattedData);
    } catch (error) {
      console.error("Error fetching tickets:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("ticket").insert([
        {
          created_by: "Sulthan Gerald",
          subject: formData.subject,
          category: formData.category,
          description: formData.description,
          priority: "Analyzing...",
          status: "Waiting",
          solver: "Not yet",
          created_at: new Date().toISOString(), // Tambahkan baris ini
        },
      ]);

      if (error) throw error;

      alert("Ticket created successfully!");
      setFormData({ subject: "", category: "", description: "" });
      setShowCreateForm(false);
      fetchTickets(); // Ambil ulang data terbaru
    } catch (error) {
      console.error("Insert Error:", error);
      alert(error.message);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate(ROUTE.login);
  };

  // Helper function untuk style menu item agar tidak duplikasi kode
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
    if (activeMenu !== menuKey) {
      e.currentTarget.style.background = "#f5f5f5";
    }
  };

  const handleMouseLeave = (e, menuKey) => {
    if (activeMenu !== menuKey) {
      e.currentTarget.style.background = "transparent";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Crucial":
        return "#dc2626";
      case "High":
        return "#ea580c";
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
      {/* SIDEBAR */}
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
        <div
          style={{
            padding: "25px 20px",
            fontSize: "28px",
            fontWeight: "700",
            color: "#FF8040",
            cursor: "pointer",
          }}
          onClick={() => navigate(ROUTE.customerDashboard)}
        >
          {sidebarOpen ? "crm." : "c."}
        </div>

        {/* Menu Items Main */}
        <div style={{ flex: 1, padding: "10px" }}>
          {/* Dashboard */}
          <div
            onClick={() => {
              setActiveMenu("dashboard");
              navigate(ROUTE.customerDashboard);
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
              setShowCreateForm(false);
            }}
            style={menuItemStyle("ticket")}
            onMouseOver={(e) => handleMouseEnter(e, "ticket")}
            onMouseOut={(e) => handleMouseLeave(e, "ticket")}
          >
            <MdConfirmationNumber size={18} />
            {sidebarOpen && <span>Ticket</span>}
          </div>

          {/* History */}
          <div
            onClick={() => {
              setActiveMenu("history");
              navigate(ROUTE.customerHistory || "#");
            }}
            style={menuItemStyle("history")}
            onMouseOver={(e) => handleMouseEnter(e, "history")}
            onMouseOut={(e) => handleMouseLeave(e, "history")}
          >
            <MdHistory size={18} />
            {sidebarOpen && <span>History</span>}
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

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: "absolute",
            right: "-12px",
            top: "50%",
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            background: "#FF8040",
            border: "none",
            color: "white",
            cursor: "pointer",
          }}
        >
          {sidebarOpen ? "‹" : "›"}
        </button>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Top Bar */}
        <div
          style={{
            background: "white",
            padding: "15px 30px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ flex: 1, maxWidth: "400px" }}>
            <input
              type="text"
              placeholder="Search..."
              style={{
                width: "100%",
                padding: "10px 15px",
                border: "1px solid #ddd",
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>
          {!showCreateForm && (
            <button
              onClick={() => setShowCreateForm(true)}
              style={{
                background: "#FF8040",
                color: "white",
                border: "none",
                padding: "10px 25px",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: "pointer",
                margin: "0 20px",
              }}
            >
              Create Ticket +
            </button>
          )}
          <button
            onClick={handleSignOut}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            <MdLogout size={24} color="#666" />
          </button>
        </div>

        {/* Dynamic Content */}
        <div style={{ padding: "30px", flex: 1, overflowY: "auto" }}>
          {showCreateForm ? (
            /* --- TAMPILAN FORM CREATE TICKET --- */
            <div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  marginBottom: "20px",
                }}
              >
                Create New Ticket
              </div>
              <div
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "30px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
              >
                <form onSubmit={handleSubmit}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "20px",
                      marginBottom: "20px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: "600",
                          color: "#555",
                        }}
                      >
                        Person Name*
                      </label>
                      <input
                        type="text"
                        value="Sulthan Gerald"
                        disabled
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: "8px",
                          border: "1px solid #ddd",
                          background: "#f9f9f9",
                          color: "#888",
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: "600",
                          color: "#555",
                        }}
                      >
                        Category*
                      </label>
                      <select
                        required
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: "8px",
                          border: "1px solid #ddd",
                        }}
                      >
                        <option value="">Select Category</option>
                        <option value="Technical">Technical</option>
                        <option value="Billing">Billing</option>
                        <option value="Inquiry">Inquiry</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "600",
                        color: "#555",
                      }}
                    >
                      Subject*
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter subject"
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "600",
                        color: "#555",
                      }}
                    >
                      Describe your problem*
                    </label>
                    <textarea
                      required
                      rows="5"
                      placeholder="Describe detail here..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                        resize: "none",
                      }}
                    ></textarea>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "15px",
                      marginTop: "30px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      style={{
                        padding: "10px 30px",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                        background: "white",
                        cursor: "pointer",
                        fontWeight: "600",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{
                        padding: "10px 40px",
                        borderRadius: "8px",
                        border: "none",
                        background: "#FF8040",
                        color: "white",
                        cursor: "pointer",
                        fontWeight: "600",
                      }}
                    >
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            /* --- TAMPILAN MY TICKET (ORIGINAL) --- */
            <>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  marginBottom: "25px",
                  color: "#333",
                }}
              >
                My Active Ticket{" "}
                <span style={{ color: "#FF8040" }}>• {tickets.length}</span>
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
                          }}
                        >
                          Created at
                        </th>
                        <th
                          style={{
                            padding: "15px 10px",
                            textAlign: "left",
                            color: "#FF8040",
                          }}
                        >
                          Name
                        </th>
                        <th
                          style={{
                            padding: "15px 10px",
                            textAlign: "left",
                            color: "#FF8040",
                          }}
                        >
                          Priority
                        </th>
                        <th
                          style={{
                            padding: "15px 10px",
                            textAlign: "left",
                            color: "#FF8040",
                          }}
                        >
                          Status
                        </th>
                        <th
                          style={{
                            padding: "15px 10px",
                            textAlign: "left",
                            color: "#FF8040",
                          }}
                        >
                          Solver
                        </th>
                        <th
                          style={{
                            padding: "15px 10px",
                            textAlign: "left",
                            color: "#FF8040",
                          }}
                        >
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.map((ticket) => (
                        <tr
                          key={ticket.id}
                          style={{ borderBottom: "1px solid #f0f0f0" }}
                        >
                          <td style={{ padding: "18px 10px" }}>
                            {ticket.createdAt}
                          </td>
                          <td style={{ padding: "18px 10px" }}>
                            {ticket.name}
                          </td>
                          <td
                            style={{
                              padding: "18px 10px",
                              color: getPriorityColor(ticket.priority),
                            }}
                          >
                            {ticket.priority}
                          </td>
                          <td
                            style={{
                              padding: "18px 10px",
                              color: getStatusColor(ticket.status),
                              fontWeight: "600",
                            }}
                          >
                            {ticket.status}
                          </td>
                          <td style={{ padding: "18px 10px" }}>
                            {ticket.solver}
                          </td>
                          <td style={{ padding: "18px 10px" }}>
                            <button
                              style={{
                                background: "#FF8040",
                                color: "white",
                                border: "none",
                                padding: "6px 15px",
                                borderRadius: "6px",
                              }}
                            >
                              Follow up
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>

        {/* Floating Chat */}
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
