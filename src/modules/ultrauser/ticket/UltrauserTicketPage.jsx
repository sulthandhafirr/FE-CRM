import { useNavigate } from "react-router-dom";
import { ROUTE } from "../../../app/routes";

const VIEW_OPTIONS = [
  {
    title: "Customer View",
    description: "Browse and manage tickets from the customer's perspective.",
    route: ROUTE.ultrauserTicketCustomer,
    color: "#3b82f6",
    bg: "#eff6ff",
    border: "#bfdbfe",
  },
  {
    title: "CS Agent View",
    description: "Handle and respond to tickets as a customer service agent.",
    route: ROUTE.ultrauserTicketAgent,
    color: "#FF8040",
    bg: "#fff4ee",
    border: "#fcd9bc",
  },
  {
    title: "Technician View",
    description: "View tickets assigned to technical team members.",
    route: ROUTE.ultrauserTicketTechnician,
    color: "#8b5cf6",
    bg: "#f5f3ff",
    border: "#ddd6fe",
  },
  {
    title: "Admin View",
    description: "Full administrative overview of all ticket activity.",
    route: ROUTE.ultrauserTicketAdmin,
    color: "#16a34a",
    bg: "#f0fdf4",
    border: "#bbf7d0",
  },
];

export default function UltrauserTicketPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        padding: "40px",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        minHeight: "100vh",
        background: "#f9fafb",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "24px",
        }}
      >
        {VIEW_OPTIONS.map((opt) => (
          <div
            key={opt.title}
            onClick={() => navigate(opt.route)}
            style={{
              background: "white",
              border: `2px solid #e5e7eb`,
              borderRadius: "16px",
              padding: "32px 28px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = opt.color;
              e.currentTarget.style.boxShadow = `0 8px 24px ${opt.color}26`;
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e5e7eb";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div
              style={{
                display: "inline-block",
                background: opt.bg,
                border: `1px solid ${opt.border}`,
                color: opt.color,
                fontSize: "12px",
                fontWeight: "700",
                padding: "4px 10px",
                borderRadius: "20px",
                marginBottom: "16px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {opt.title.split(" ")[0]}
            </div>
            <h3
              style={{
                fontSize: "22px",
                fontWeight: "700",
                color: "#1a202c",
                margin: "0 0 10px",
              }}
            >
              {opt.title}
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "#6b7280",
                margin: "0 0 20px",
                lineHeight: "1.6",
              }}
            >
              {opt.description}
            </p>
            <div
              style={{
                color: opt.color,
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              Open view →
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
