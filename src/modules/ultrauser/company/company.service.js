import { api } from "../../../lib/api/apiClient";

export const getCompanies = async () => {
  const response = await api.get("/api/companies");
  return response.data;
};

export const createCompany = async (companyData) => {
  const response = await api.post("/api/companies", companyData);
  return response.data;
};

export const updateCompany = async (companyId, companyData) => {
  const response = await api.put(`/api/companies/${companyId}`, companyData);
  return response.data;
};

export const deleteCompany = async (companyId) => {
  const response = await api.delete(`/api/companies/${companyId}`);
  return response.data;
};
