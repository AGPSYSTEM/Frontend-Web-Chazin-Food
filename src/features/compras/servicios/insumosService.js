import { apiClient } from "@/shared/api/apiClient";

export const insumosService = {
  getInsumos: async () => {
    return await apiClient.get("/insumos");
  },

  getCategorias: async () => {
    return await apiClient.get("/categorias-insumo");
  },

  getPapeleraInsumos: async () => {
    return await apiClient.get("/insumos/papelera");
  },

  getPapeleraPreparados: async () => {
    return await apiClient.get("/insumos-preparados/papelera");
  },

  createInsumo: async (data) => {
    return await apiClient.post("/insumos", data);
  },

  updateInsumo: async (id, data) => {
    return await apiClient.put(`/insumos/${id}`, data);
  },

  deleteInsumo: async (id) => {
    return await apiClient.delete(`/insumos/${id}`);
  },

  restoreInsumo: async (id) => {
    return await apiClient.put(`/insumos/${id}/restaurar`);
  },

  hardDeleteInsumo: async (id) => {
    return await apiClient.delete(`/insumos/${id}/fisico`);
  },

  // --- Insumos Preparados ---
  getInsumosPreparados: async () => {
    return await apiClient.get("/insumos-preparados");
  },

  createPreparado: async (data) => {
    return await apiClient.post("/insumos-preparados", data);
  },

  updatePreparado: async (id, data) => {
    return await apiClient.put(`/insumos-preparados/${id}`, data);
  },

  deletePreparado: async (id) => {
    return await apiClient.delete(`/insumos-preparados/${id}`);
  },

  restorePreparado: async (id) => {
    return await apiClient.put(`/insumos-preparados/${id}/restaurar`);
  },

  hardDeletePreparado: async (id) => {
    return await apiClient.delete(`/insumos-preparados/${id}/fisico`);
  }
};
