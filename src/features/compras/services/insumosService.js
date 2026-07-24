import { apiClient } from "@/shared/api/apiClient";

export const insumosService = {
  getInsumos: async () => {
    return await apiClient.get("/insumos");
  },

  getCategorias: async () => {
    return await apiClient.get("/categorias-insumo");
  },

  createInsumo: async (data) => {
    return await apiClient.post("/insumos", data);
  },

  updateInsumo: async (id, data) => {
    return await apiClient.put(`/insumos/${id}`, data);
  },

  deleteInsumo: async (id) => {
    return await apiClient.delete(`/insumos/${id}`);
  }
};
