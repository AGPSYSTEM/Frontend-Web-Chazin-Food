import { apiClient } from "@/shared/api/apiClient";

export const fichasTecnicasService = {
  getFichas: async () => {
    return await apiClient.get("/fichas-tecnicas");
  },

  getFichaById: async (id) => {
    return await apiClient.get(`/fichas-tecnicas/${id}`);
  },

  createFicha: async (data) => {
    return await apiClient.post("/fichas-tecnicas", data);
  },

  updateFicha: async (id, data) => {
    return await apiClient.put(`/fichas-tecnicas/${id}`, data);
  },

  deleteFicha: async (id) => {
    return await apiClient.delete(`/fichas-tecnicas/${id}`);
  }
};
