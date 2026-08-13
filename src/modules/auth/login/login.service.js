import { supabase } from "../../../lib/supabase";
import { api } from "../../../lib/api/apiClient";

export const signInWithEmail = async (email, password, companyCode, setVerified, setSubscriptionStatus) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error };

    try {
        const { data: companyStatus } = await api.get(`/api/auth/verify-company?code=${companyCode}`);
        setSubscriptionStatus?.(companyStatus.subscriptionStatus);
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

// Kirim link reset password ke email user (verifikasi via email dulu)
export const resetPassword = async (email) => {
  const redirectTo = `${window.location.origin}/reset-password`;
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });
  if (error) return { error };
  return { data };
};
