import { useNavigate } from "react-router-dom";
import { MdArrowBack, MdHome } from "react-icons/md";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: "24px",
      }}
    >
      <div
        style={{
          textAlign: "center",
          maxWidth: "480px",
          width: "100%",
        }}
      >
        {/* 404 with icon replacing the 0 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "120px",
            fontWeight: "800",
            color: "#1a202c",
            lineHeight: 1,
            marginBottom: "24px",
            letterSpacing: "-4px",
            gap: "8px",
          }}
        >
          <span>4</span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FF8040",
            }}
          >
            0
          </span>
          <span>4</span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: "36px",
            fontWeight: "800",
            color: "#1a202c",
            margin: "0 0 12px",
          }}
        >
          Oops!
        </h1>

        {/* Description */}
        <p
          style={{
            fontSize: "17px",
            color: "#6b7280",
            margin: "0 0 8px",
            lineHeight: "1.6",
            fontWeight: "500",
          }}
        >
          Looks like that page is lost.
        </p>
        <p
          style={{
            fontSize: "14px",
            color: "#9ca3af",
            margin: "0 0 40px",
            lineHeight: "1.6",
          }}
        >
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 24px",
              borderRadius: "10px",
              border: "2px solid #e5e7eb",
              background: "white",
              color: "#374151",
              fontWeight: "600",
              fontSize: "14px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#FF8040";
              e.currentTarget.style.color = "#FF8040";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e5e7eb";
              e.currentTarget.style.color = "#374151";
            }}
          >
            <MdArrowBack size={18} />
            Go Back
          </button>

          <button
            onClick={() => navigate("/")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 24px",
              borderRadius: "10px",
              border: "none",
              background: "#FF8040",
              color: "white",
              fontWeight: "600",
              fontSize: "14px",
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: "0 4px 12px rgba(255,128,64,0.3)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#e6723a";
              e.currentTarget.style.boxShadow = "0 6px 16px rgba(255,128,64,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#FF8040";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(255,128,64,0.3)";
            }}
          >
            <MdHome size={18} />
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
