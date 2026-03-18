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

export const getTicketHistory = async () => {
  const response = await api.get("/api/tickets/history");
  return response.data
}

// ─── Agent ticket calls (via backend API) ────────────────────────────────────

// GET /api/tickets/all — agent/admin only, returns all tickets
// Response shape: { id, subject, description, status, priority, customer, solver, createdAt }
export const getAllTickets = async () => {
  const response = await api.get("/api/tickets/all");
  return response.data;
};

export const updateTicket = async (ticketId, updates) => {
  const { data } = await api.put(`/api/tickets/${ticketId}`, updates);
  return data;
};

export const deleteTicket = async (ticketId) => {
  const { data } = await api.delete(`/api/tickets/${ticketId}`);
  return data;
};

// ─── Timeline (Supabase direct) ───────────────────────────────────────────────

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