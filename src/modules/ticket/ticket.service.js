import { api } from "../../lib/api/apiClient";
import { supabase } from "../../lib/supabase";

// ─── Customer ticket calls (via backend API) ──────────────────────────────────

export const getMyTickets = async () => {
  const response = await api.get("/api/tickets");
  return response.data;
};

export const createTicket = async ({ subject, description }) => {
  const { data } = await api.post("/api/tickets", { subject, description });
  return data;
};

export const getUploadUrls = async ({ ticketId, files }) => {
  const { data } = await api.post("/api/tickets/upload-url", { ticketId, files });
  return data;
};

export const uploadAttachmentToStorage = async (filePath, token, file, contentType) => {
  const { error } = await supabase.storage
    .from("ticket-attachment")
    .uploadToSignedUrl(filePath, token, file, { contentType });
  if (error) throw error;
};

export const saveAttachments = async (ticketId, attachments) => {
  await api.post(`/api/tickets/${ticketId}/attachments`, attachments);
};

// ─── Agent ticket calls (Supabase direct) ────────────────────────────────────

export const getAllTickets = async () => {
  const { data, error } = await supabase
    .from("ticket")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};

export const getTicketTimeline = async (ticketId) => {
  const { data, error } = await supabase
    .from("ticket_timeline")
    .select("*")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
};

export const addTimelineEntry = async (entry) => {
  const { error } = await supabase.from("ticket_timeline").insert([entry]);
  if (error) throw error;
};

export const updateTicket = async (ticketId, updates) => {
  const { error } = await supabase
    .from("ticket")
    .update(updates)
    .eq("id", ticketId);
  if (error) throw error;
};
