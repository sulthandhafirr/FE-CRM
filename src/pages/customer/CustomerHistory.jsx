import { useState } from "react";
import { MdChat } from "react-icons/md";
import { FaRobot, FaUserTie, FaHeadset } from "react-icons/fa";
import ChatBot from "../../components/ChatBot";
import SearchBar from "../../components/SearchBar";

export default function CustomerHistory() {
  const [chatOpen, setChatOpen] = useState(false);

  const historyData = [
    {
      id: 1,
      createdAt: "19-01-2026",
      name: "Question Request",
      priority: "Low",
      solvedAt: "27-01-2026",
      solvedBy: { type: "ai", name: "AI Agent" },
      satisfaction: 1,
    },
    {
      id: 2,
      createdAt: "19-01-2026",
      name: "Product Issue",
      priority: "Crucial",
      solvedAt: "20-01-2026",
      solvedBy: { type: "human", name: "Bani" },
      satisfaction: 3,
    },
    {
      id: 3,
      createdAt: "19-01-2026",
      name: "Question Request",
      priority: "Normal",
      solvedAt: "20-01-2026",
      solvedBy: { type: "cs", name: "CS Agent" },
      satisfaction: 3,
    },
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Crucial": return "#dc2626";
      case "High": return "#ea580c";
      case "Normal": return "#666";
      case "Low": return "#16a34a";
      default: return "#666";
    }
  };

  const renderStars = (count) => (
    <div style={{ display: "flex", gap: "3px" }}>
      {[1, 2, 3].map((star) => (
        <span key={star} style={{ fontSize: "20px", color: star <= count ? "#FF8040" : "#e0e0e0" }}>
          ★
        </span>
      ))}
    </div>
  );

  const getSolverIcon = (type) => {
    switch (type) {
      case "ai": return <FaRobot size={14} />;
      case "human": return <FaUserTie size={14} />;
      case "cs": return <FaHeadset size={14} />;
      default: return <FaUserTie size={14} />;
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
            type="text" placeholder="Search..."
            style={{
              width: "100%", padding: "10px 15px",
              border: "1px solid #ddd", borderRadius: "8px",
              fontSize: "14px", outline: "none",
            }}
          />
        </div> */}
        <SearchBar />
      </div>

      {/* History Content */}
      <div style={{ padding: "30px", flex: 1, overflowY: "auto" }}>
        <div style={{ fontSize: "28px", fontWeight: "700", marginBottom: "25px", color: "#333" }}>
          History
        </div>

        <div style={{
          background: "white", borderRadius: "12px",
          padding: "25px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #f0f0f0" }}>
                {["Created at", "Name", "Priority", "Solved at", "Solved by", "Satisfaction"].map((h) => (
                  <th key={h} style={{
                    padding: "15px 10px", textAlign: "left",
                    color: "#FF8040", fontWeight: "600", fontSize: "15px",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {historyData.map((item, index) => (
                <tr key={item.id} style={{
                  borderBottom: index < historyData.length - 1 ? "1px solid #f0f0f0" : "none",
                }}>
                  <td style={{ padding: "18px 10px", color: "#666" }}>{item.createdAt}</td>
                  <td style={{ padding: "18px 10px", color: "#666" }}>{item.name}</td>
                  <td style={{ padding: "18px 10px", color: getPriorityColor(item.priority), fontWeight: "500" }}>
                    {item.priority}
                  </td>
                  <td style={{ padding: "18px 10px", color: "#666" }}>{item.solvedAt}</td>
                  <td style={{ padding: "18px 10px", color: "#666" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      {getSolverIcon(item.solvedBy.type)}
                      {item.solvedBy.name}
                    </span>
                  </td>
                  <td style={{ padding: "18px 10px" }}>{renderStars(item.satisfaction)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Chat Button */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        style={{
          position: "fixed", bottom: "30px", right: "30px",
          width: "60px", height: "60px", borderRadius: "50%",
          background: "#FF8040", border: "none", color: "white",
          fontSize: "28px", cursor: "pointer",
          boxShadow: "0 4px 12px rgba(255, 128, 64, 0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <MdChat size={28} />
      </button>

      <ChatBot isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}