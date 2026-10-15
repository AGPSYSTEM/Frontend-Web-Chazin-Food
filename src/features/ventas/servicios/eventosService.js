import { apiClient } from "@/shared/api/apiClient";

export const eventosService = {
  getEventos: async () => {
    return await apiClient.get("/eventos");
  },

  getById: async (id) => {
    return await apiClient.get(`/eventos/${id}`);
  },

  createEvento: async (data) => {
    return await apiClient.post("/eventos", data);
  },

  updateEvento: async (id, data) => {
    return await apiClient.put(`/eventos/${id}`, data);
  },

  deleteEvento: async (id) => {
    return await apiClient.delete(`/eventos/${id}`);
  },

  getInsumos: async () => {
    return await apiClient.get("/insumos");
  },

  getProductos: async () => {
    return await apiClient.get("/productos");
  }
};
