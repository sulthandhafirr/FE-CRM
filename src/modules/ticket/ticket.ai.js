import { api } from "../../lib/api/apiClient";

/**
 * Generate an AI summary of the ticket conversation (Stella Summary).
 * POST /api/tickets/{ticketId}/ai/summary
 *
 * @param {number|string} ticketId
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const getTicketSummary = async (ticketId) => {
  const { data } = await api.post(`/api/tickets/${ticketId}/ai/summary`);
  return data;
};

/**
 * Generate an AI draft reply for the agent (Stella Assist).
 * POST /api/tickets/{ticketId}/ai/draft
 *
 * @param {number|string} ticketId
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const getTicketDraft = async (ticketId) => {
  const { data } = await api.post(`/api/tickets/${ticketId}/ai/draft`);
  return data;
};
