import { api } from "../../../lib/api/apiClient";

export const registerCompany = async (payload) => {
  const { data } = await api.post("/api/auth/register", payload);
  return data;
};

export const getRegistrationStatus = async (companyId, companyCode) => {
  const { data } = await api.get("/api/auth/registration-status", {
    params: { companyId, code: companyCode },
  });
  return data;
};

export const getRegistrationPlans = async () => {
  const { data } = await api.get("/api/auth/registration-plans");
  return data;
};
