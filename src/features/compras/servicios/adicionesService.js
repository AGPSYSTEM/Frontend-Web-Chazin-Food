import { apiClient } from "@/shared/api/apiClient";

export const adicionesService = {
  getAdiciones: async () => {
    return await apiClient.get('/adiciones');
  },

  getAdicionById: async (id) => {
    return await apiClient.get(`/adiciones/${id}`);
  },

  createAdicion: async (data) => {
    return await apiClient.post('/adiciones', data);
  },

  updateAdicion: async (id, data) => {
    return await apiClient.put(`/adiciones/${id}`, data);
  },

  deleteAdicion: async (id) => {
    return await apiClient.delete(`/adiciones/${id}`);
  }
};

