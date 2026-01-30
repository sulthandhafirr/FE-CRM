import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { ROUTE } from "../router/routes";
import { useAuth } from "../hooks/useAuth";

export default function MainPage() {
  const { user } = useAuth();  // ← Get from context (no new request!)
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate(ROUTE.login);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "50px auto" }}>
      <h1>Welcome to Main Page</h1>

      <div
        style={{
          padding: "20px",
          background: "#f0f0f0",
          borderRadius: "8px",
          marginTop: "20px",
        }}
      >
        <p style={{ fontSize: "18px", marginBottom: "10px", color: "#666" }}>
          <strong>Email:</strong> {user?.email}
        </p>
        <p style={{ fontSize: "14px", color: "#666" }}> 
          <strong>User ID:</strong> {user?.id}
        </p>
      </div>

      <button
        onClick={handleSignOut}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          background: "#ef4444",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Sign Out
      </button>
    </div>
  );
}
