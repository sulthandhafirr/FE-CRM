import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [overrideRole, setOverrideRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);

  const fetchRole = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from("profile")
      .select("roles(role)")
      .eq("id", userId)
      .single();

    if (!error && data) {
      setRole(data.roles.role);
    } else {
      setRole(null);
    }
  }, []);

  useEffect(() => {
    // Check initial session
    const checkUser = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        await fetchRole(user.id);
        setVerified(true)
      }
      setLoading(false);
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRole(session.user.id);
      } else {
        setRole(null);
        setOverrideRole(null);
        setVerified(false)
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchRole]);

  const changeRole = (newRole) => setOverrideRole(newRole);

  return (
    <AuthContext.Provider value={{ user, role: overrideRole ?? role, trueRole: role, changeRole, loading, verified, setVerified }}>
      {children}
    </AuthContext.Provider>
  );
}
