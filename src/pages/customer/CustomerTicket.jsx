import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { MdChat } from "react-icons/md";
import ChatBot from "../../components/ChatBot";
import SearchBar from "../../components/SearchBar";

export default function CustomerTicket() {
  const [chatOpen, setChatOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
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
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      alert("Ticket created successfully!");
      setFormData({ subject: "", category: "", description: "" });
      setShowCreateForm(false);
      fetchTickets();
    } catch (error) {
      console.error("Insert Error:", error);
      alert(error.message);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Crucial": return "#dc2626";
      case "High": return "#ea580c";
      case "Low": return "#16a34a";
      default: return "#666";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Progress": return "#FF8040";
      case "Waiting": return "#f59e0b";
      case "Solved": return "#16a34a";
      default: return "#666";
    }
  };

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Top Bar */}
      <div style={{
        background: "white", padding: "15px 30px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
      }}>
        {/* <div style={{ flex: 1, maxWidth: "400px" }}>
          <input
            type="text"
            placeholder="Search..."
            style={{
              width: "100%", padding: "10px 15px",
              border: "1px solid #ddd", borderRadius: "8px",
              fontSize: "14px", outline: "none",
            }}
          />
        </div> */}
        <SearchBar  />
        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            style={{
              background: "#FF8040", color: "white", border: "none",
              padding: "10px 25px", borderRadius: "8px",
              fontWeight: "600", cursor: "pointer", margin: "0 20px",
            }}
          >
            Create Ticket +
          </button>
        )}
      </div>

      {/* Dynamic Content */}
      <div style={{ padding: "30px", flex: 1, overflowY: "auto" }}>
        {showCreateForm ? (
          <div>
            <div style={{ fontSize: "24px", fontWeight: "700", marginBottom: "20px" }}>
              Create New Ticket
            </div>
            <div style={{
              background: "white", borderRadius: "12px",
              padding: "30px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}>
              <form onSubmit={handleSubmit}>
                <div style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr",
                  gap: "20px", marginBottom: "20px",
                }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#555" }}>
                      Person Name*
                    </label>
                    <input
                      type="text" value="Sulthan Gerald" disabled
                      style={{
                        width: "100%", padding: "12px", borderRadius: "8px",
                        border: "1px solid #ddd", background: "#f9f9f9", color: "#888",
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#555" }}>
                      Category*
                    </label>
                    <select
                      required value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ddd" }}
                    >
                      <option value="">Select Category</option>
                      <option value="Technical">Technical</option>
                      <option value="Billing">Billing</option>
                      <option value="Inquiry">Inquiry</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#555" }}>
                    Subject*
                  </label>
                  <input
                    type="text" required placeholder="Enter subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ddd" }}
                  />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#555" }}>
                    Describe your problem*
                  </label>
                  <textarea
                    required rows="5" placeholder="Describe detail here..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    style={{
                      width: "100%", padding: "12px", borderRadius: "8px",
                      border: "1px solid #ddd", resize: "none",
                    }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "15px", marginTop: "30px" }}>
                  <button
                    type="button" onClick={() => setShowCreateForm(false)}
                    style={{
                      padding: "10px 30px", borderRadius: "8px",
                      border: "1px solid #ddd", background: "white",
                      cursor: "pointer", fontWeight: "600",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: "10px 40px", borderRadius: "8px", border: "none",
                      background: "#FF8040", color: "white", cursor: "pointer", fontWeight: "600",
                    }}
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: "28px", fontWeight: "700", marginBottom: "25px", color: "#333" }}>
              My Active Ticket <span style={{ color: "#FF8040" }}>• {tickets.length}</span>
            </div>
            <div style={{
              background: "white", borderRadius: "12px",
              padding: "25px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}>
              {loading ? (
                <div style={{ textAlign: "center", padding: "20px" }}>Loading...</div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #f0f0f0" }}>
                      {["Created at", "Name", "Priority", "Status", "Solver", "Action"].map((h) => (
                        <th key={h} style={{ padding: "15px 10px", textAlign: "left", color: "#FF8040" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((ticket) => (
                      <tr key={ticket.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                        <td style={{ padding: "18px 10px" }}>{ticket.createdAt}</td>
                        <td style={{ padding: "18px 10px" }}>{ticket.name}</td>
                        <td style={{ padding: "18px 10px", color: getPriorityColor(ticket.priority) }}>
                          {ticket.priority}
                        </td>
                        <td style={{ padding: "18px 10px", color: getStatusColor(ticket.status), fontWeight: "600" }}>
                          {ticket.status}
                        </td>
                        <td style={{ padding: "18px 10px" }}>{ticket.solver}</td>
                        <td style={{ padding: "18px 10px" }}>
                          <button style={{
                            background: "#FF8040", color: "white", border: "none",
                            padding: "6px 15px", borderRadius: "6px",
                          }}>
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
          position: "fixed", bottom: "30px", right: "30px",
          width: "60px", height: "60px", borderRadius: "50%",
          background: "#FF8040", border: "none", color: "white",
          cursor: "pointer", boxShadow: "0 4px 12px rgba(255, 128, 64, 0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <MdChat size={28} />
      </button>
      <ChatBot isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}