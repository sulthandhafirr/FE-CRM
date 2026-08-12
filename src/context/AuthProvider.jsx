import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { api } from "../lib/api/apiClient";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [name, setName] = useState(null);
  const [overrideRole, setOverrideRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  // True saat user datang dari link reset password di email
  // (event PASSWORD_RECOVERY ditangkap di sini karena subscription
  // dipasang saat app start — sebelum supabase-js memproses hash URL)
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  const fetchRole = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from("profile")
      .select("name, roles(role)")
      .eq("id", userId)
      .single();

    if (!error && data) {
      setRole(data.roles.role);
      setName(data.name);
    } else {
      setRole(null);
      setName(null);
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
        try {
          await api.get("/api/auth/session-status");
          await fetchRole(user.id);
          setVerified(true);
        } catch {
          await supabase.auth.signOut();
          setUser(null);
          setVerified(false);
        }
      }
      setLoading(false);
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === "PASSWORD_RECOVERY") {
        setIsPasswordRecovery(true);
      } else if (_event === "SIGNED_OUT") {
        setIsPasswordRecovery(false);
      }
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRole(session.user.id);
      } else {
        setRole(null);
        setName(null);
        setOverrideRole(null);
        setVerified(false)

        /* Clear company settings from localStorage so next login
           doesn't show stale timezone / data from previous company */
        try {
          window.localStorage.removeItem("crm-general-setup-v1");
        } catch {
          /* non-critical */
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchRole]);

  const changeRole = (newRole) => setOverrideRole(newRole);

  return (
    <AuthContext.Provider
      value={{
        user,
        name,
        role: overrideRole ?? role,
        trueRole: role,
        changeRole,
        loading,
        verified,
        setVerified,
        isPasswordRecovery,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
