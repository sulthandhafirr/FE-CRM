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
