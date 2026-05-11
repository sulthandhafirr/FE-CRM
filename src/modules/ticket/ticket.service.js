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
  const { data } = await api.post("/api/tickets/upload-url", {
    ticketId,
    files,
  });
  return data;
};

export const uploadAttachmentToStorage = async (
  filePath,
  token,
  file,
  contentType,
) => {
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
  return response.data;
};

export const getTicketById = async (ticketId) => {
  const response = await api.get(`/api/tickets/${ticketId}`);
  return response.data;
};

export const getAttachmentDownloadUrl = async (ticketId, attachmentId) => {
  const response = await api.get(
    `/api/tickets/${ticketId}/attachments/${attachmentId}/download-url`,
  );
  return response.data;
};

export const getTicketComments = async (ticketId) => {
  try {
    const response = await api.get(`/api/tickets/${ticketId}/comments`);
    return response.data;
  } catch (error) {
    if (error?.response?.status === 403) return [];
    if (error?.response?.status === 404) return [];
    throw error;
  }
};

export const createTicketComment = async (ticketId, message) => {
  const { data } = await api.post(`/api/tickets/${ticketId}/comments`, {
    message,
  });
  return data;
};

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

// ─── Agent: Upload attachment (get signed URL → storage → save record) ────────

export const uploadTicketAttachment = async (ticketId, file, commentId = null) => {
  // 1. Minta signed upload URL dari backend
  const { data: urlData } = await api.post("/api/tickets/upload-url", {
    ticketId,
    files: [{ fileName: file.name }],
  });

  const { filePath, token, attachmentId } = urlData[0];

  // 2. Upload file langsung ke Supabase Storage via signed URL
  const { error } = await supabase.storage
    .from("ticket-attachment")
    .uploadToSignedUrl(filePath, token, file, { contentType: file.type });

  if (error) throw error;

  // 3. Simpan record attachment ke database
  //    Kirim commentId agar bisa ditampilkan di timeline comment yang sesuai
  await api.post(`/api/tickets/${ticketId}/attachments`, [
    {
      attachmentId,
      filePath,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      ...(commentId ? { commentId } : {}),
    },
  ]);

  return { attachmentId, filePath, fileName: file.name };
};

// ─── Agent: Resolve ticket ────────────────────────────────────────────────────

export const resolveTicket = async (ticketId) => {
  const resolvedAt = new Date().toISOString();
  const { data } = await api.put(`/api/tickets/${ticketId}`, {
    status: "Solved",
    resolvedAt: resolvedAt,   // ← camelCase, bukan resolved_at
  });
  return {
    ...data,
    resolvedAt: data?.resolvedAt ?? data?.resolved_at ?? resolvedAt,
  };
};

// GET /api/tickets/my-solved — agent gets their own solved tickets
export const getAgentSolvedTickets = async () => {
  const response = await api.get("/api/tickets/my-solved");
  return response.data;
};

export const takeAction = async (ticketId) => {
  const { data } = await api.post(`/api/tickets/${ticketId}/take-action`);
  return data;
};

export const getTechnicians = async () => {
  const response = await api.get("/api/tickets/technicians");
  return response.data;
};