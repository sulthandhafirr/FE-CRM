import { supabase } from "../lib/supabase";
import { ROUTE } from "../router/routes";
import { useNavigate } from "react-router-dom";

export default function CsAgentDashboard() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate(ROUTE.login);
  };

  return (
    <div>
      <h1>CsAgentDashboard</h1>
      <button onClick={handleSignOut}>
        Sign Out
      </button>
    </div>
  );
}
