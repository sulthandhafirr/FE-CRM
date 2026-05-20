import { useNavigate } from "react-router-dom";
import { ROUTE } from "../../../app/routes";

export default function AdminTicketSelectorPage() {
  const navigate = useNavigate();

  const ticketViews = [
    {
      key: "active",
      title: "Active Tickets",
      badge: "ACTIVE",
      description: "View and manage ongoing active customer tickets.",
      route: ROUTE.adminTicketActive,
      color: "#FF8040",
      bg: "#fff4ee",
      border: "#fcd9bc",
    },
    {
      key: "solved",
      title: "Solved Tickets",
      badge: "SOLVED",
      description: "View resolved and completed support tickets.",
      route: ROUTE.adminTicketSolved,
      color: "#16a34a",
      bg: "#f0fdf4",
      border: "#bbf7d0",
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
        .admin-ticket-selector-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }

        @media (max-width: 992px) {
          .admin-ticket-selector-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      <div
        className="admin-ticket-selector-grid"
        style={{
          width: "100%",
        }}
      >
        {ticketViews.map((view) => (
          <div
            key={view.key}
            onClick={() => navigate(view.route)}
            style={{
              background: "white",
              border: "2px solid #e5e7eb",
              borderRadius: "16px",
              padding: "32px 28px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = view.color;
              e.currentTarget.style.boxShadow = `0 8px 24px ${view.color}26`;
              e.currentTarget.style.transform = "translateY(-2px) scale(1.01)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e5e7eb";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
              e.currentTarget.style.transform = "translateY(0) scale(1)";
            }}
          >
            <div
              style={{
                display: "inline-block",
                background: view.bg,
                border: `1px solid ${view.border}`,
                color: view.color,
                fontSize: "12px",
                fontWeight: "700",
                padding: "4px 10px",
                borderRadius: "20px",
                marginBottom: "16px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {view.badge}
            </div>
            <h3
              style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "#1a202c",
                margin: "0 0 10px",
              }}
            >
              {view.title}
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "#6b7280",
                margin: "0 0 20px",
                lineHeight: "1.6",
              }}
            >
              {view.description}
            </p>
            <div style={{ color: view.color, fontWeight: "600", fontSize: "14px" }}>
              Open View
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
