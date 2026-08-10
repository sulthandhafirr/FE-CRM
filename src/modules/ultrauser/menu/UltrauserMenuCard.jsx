import { useNavigate } from "react-router-dom";

export default function UltrauserMenuCard({ title, description, link }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(link)}
      style={{
        background: "white",
        border: "2px solid #e5e7eb",
        borderRadius: "16px",
        padding: "32px 28px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#FF8040";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(255,128,64,0.15)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#e5e7eb";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div>
        <h3
          style={{
            fontSize: "26px",
            fontWeight: "700",
            color: "#1a202c",
            margin: "0 0 6px 0",
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: "14px",
            color: "#718096",
            margin: 0,
            lineHeight: "1.5",
          }}
        >
          {description}
        </p>
      </div>
      <div
        style={{
          marginTop: "auto",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          color: "#FF8040",
          fontWeight: "600",
          fontSize: "14px",
        }}
      >
        Open →
      </div>
    </div>
  );
}
