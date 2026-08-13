import { api } from "../../lib/api/apiClient";

export const renewSubscription = async (subscriptionPlan) => {
  const { data } = await api.post("/api/payments/renewal", { subscriptionPlan });
  return data;
};

export const getSubscriptionStatus = async () => {
  const { data } = await api.get("/api/auth/session-status");
  return data;
};

export const getSubscriptionPlans = async () => {
  const { data } = await api.get("/api/auth/registration-plans");
  return data;
};

export const getSubscriptionPayments = async () => {
  const { data } = await api.get("/api/company/settings/subscription/payments");
  return data;
};

export const getSubscriptionPayment = async (orderId) => {
  const { data } = await api.get(`/api/company/settings/subscription/payments/${encodeURIComponent(orderId)}`);
  return data;
};

export const cancelSubscription = async () => {
  const { data } = await api.post("/api/company/settings/subscription/cancel");
  return data;
};

export const reactivateSubscription = async () => {
  const { data } = await api.post("/api/company/settings/subscription/reactivate");
  return data;
};
