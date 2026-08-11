import { api } from "../../lib/api/apiClient";

export const getPaymentList = async () => {
  const response = await api.get("/api/payments");
  return response.data;
};

export const createPayment = async (ticketId) => {
  const response = await api.post(`/api/payments/ticket/${ticketId}`);
  return response.data; // { token, redirectUrl }
};

