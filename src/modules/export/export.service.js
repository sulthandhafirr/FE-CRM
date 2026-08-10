import { supabase } from "../../lib/supabase";

// ─── Export Tickets ───────────────────────────────────────────────────────────

export const exportTickets = async ({ companyId, startDate, endDate }) => {
  const { data, error } = await supabase.rpc("get_tickets_by_company", {
    p_company_id: companyId,
    p_start_date: startDate ? `${startDate}T00:00:00.000Z` : null,
    p_end_date:   endDate   ? `${endDate}T23:59:59.999Z`   : null,
  });

  if (error) throw error;
  console.log("[exportTickets] tickets:", data?.length);
  return data ?? [];
};

// ─── Export Users ─────────────────────────────────────────────────────────────

export const exportUsers = async ({ companyId }) => {
  const { data, error } = await supabase
    .from("profile")
    .select(`
      id,
      name,
      email,
      position:Position,
      created_at,
      role:role_id ( id, role )
    `)
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
};