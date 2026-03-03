import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { ROUTE } from "../router/routes";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/http";

export default function MainPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [cities, setCities] = useState([]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate(ROUTE.login);
  };

  useEffect(() => {
    const testBackend = async () => {
      try {
        const res = await api.get("/Test/ping");
        setMessage(res.data.message);
      } catch (err) {
        console.error(err);
        setMessage("Failed to connect to backend");
      }
    };

    const fetchCities = async () => {
      try {
        const res = await api.get("/cities");
        setCities(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    testBackend();
    fetchCities();
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "50px auto" }}>
      <h1>Welcome to Main Page</h1>
      <p>{message}</p>

      <div
        style={{
          padding: "20px",
          background: "#f0f0f0",
          borderRadius: "8px",
          marginTop: "20px",
        }}
      >
        <p>
          <strong>Email:</strong> {user?.email}
        </p>
        <p>
          <strong>User ID:</strong> {user?.id}
        </p>
      </div>

      {/* === SIMPLE TABLE === */}
      <h3 style={{ marginTop: "30px" }}>City Temperature</h3>

      <table border="1" cellPadding="5" cellSpacing="0">
        <thead>
          <tr>
            <th>Id</th>
            <th>City</th>
            <th>Temperature</th>
          </tr>
        </thead>
        <tbody>
          {cities.length === 0 ? (
            <tr>
              <td colSpan="3">No data</td>
            </tr>
          ) : (
            cities.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.city}</td>
                <td>{c.temperature}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

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
