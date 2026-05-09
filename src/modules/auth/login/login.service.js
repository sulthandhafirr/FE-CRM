import { supabase } from "../../../lib/supabase";
import { api } from "../../../lib/api/apiClient";

export const signInWithEmail = async (email, password, companyCode, setVerified) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error };

    try {
        await api.get(`/api/auth/verify-company?code=${companyCode}`);
        setVerified(true);
    } catch {
        await supabase.auth.signOut();
        return { error: { message: "Invalid company code" } };
    }

    return { data };
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};