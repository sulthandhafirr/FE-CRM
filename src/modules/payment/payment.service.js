import { api } from "../../lib/api/apiClient";

export const getPaymentList = async () => {
  const response = await api.get("/api/payments");
  return response.data;
};