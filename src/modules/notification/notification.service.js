import { api } from "../../lib/api/apiClient";

export const getNotifications = async () => {
  const { data } = await api.get("/api/notifications");
  return data;
};

export const markAsRead = async (id) => {
  const { data } = await api.put(`/api/notifications/${id}/read`);
  return data;
};

export const markAllAsRead = async () => {
  const { data } = await api.put("/api/notifications/read-all");
  return data;
};