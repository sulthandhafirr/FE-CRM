import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MdChat } from "react-icons/md";
import ChatBot from "../../components/ChatBot";
import SearchBar from "../../components/SearchBar";
import { api } from "../../services/http";

export default function CustomerTicket() {
  const [chatOpen, setChatOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
  });

  const queryClient = useQueryClient();

  const { data: tickets = [], isLoading: loading } = useQuery({
    queryKey: ["my-tickets"],
    queryFn: async () => {
      const response = await api.get("/api/tickets");
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // cache for 5 minutes
    refetchOnWindowFocus: false, // don't refetch when switching tabs
    refetchOnMount: false, // don't refetch on component remount
  });

  const createTicket = useMutation({
    mutationFn: async (data) => {
      await api.post("/api/tickets", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["my-tickets"]);
      alert("Ticket created successfully!");
      setFormData({ subject: "", description: "" });
      setShowCreateForm(false);
    },
    onError: (error) => {
      console.error("Insert Error:", error);
      alert(error.message);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    createTicket.mutate({
      subject: formData.subject,
      description: formData.description,
    });
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
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
        <SearchBar />
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
      </div>

      {/* Dynamic Content */}
      <div style={{ padding: "30px", flex: 1, overflowY: "auto" }}>
        {showCreateForm ? (
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
                      setFormData({ ...formData, description: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      resize: "none",
                    }}
                  />
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
                      {[
                        "Ticket ID",
                        "Subject",
                        "Status",
                        "Handler",
                        "Created at",
                        "Action",
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "15px 10px",
                            textAlign: "left",
                            color: "#FF8040",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((ticket) => (
                      <tr
                        key={ticket.id}
                        style={{ borderBottom: "1px solid #f0f0f0" }}
                      >
                        <td
                          style={{
                            padding: "18px 10px",
                            color: "#666",
                            fontSize: "13px",
                          }}
                        >
                          {ticket.id}
                        </td>
                        <td style={{ padding: "18px 10px" }}>
                          {ticket.subject}
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
                        <td style={{ padding: "18px 10px", color: "#666" }}>
                          {ticket.handler}
                        </td>
                        <td style={{ padding: "18px 10px" }}>
                          {formatDate(ticket.createdAt)}
                        </td>
                        <td style={{ padding: "18px 10px" }}>
                          <button
                            style={{
                              background: "#FF8040",
                              color: "white",
                              border: "none",
                              padding: "6px 15px",
                              borderRadius: "6px",
                              cursor: "pointer",
                            }}
                          >
                            Follow up
                          </button>
                        </td>
                      </tr>
                    ))}
                    {tickets.length === 0 && (
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
  );
}
