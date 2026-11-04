import { apiClient } from "@/shared/api/apiClient";

export const produccionService = {
  getOrdenes: async () => {
    return await apiClient.get("/produccion");
  },

  createOrden: async (data) => {
    return await apiClient.post("/produccion", data);
  },

  updateEstadoOrden: async (id, estado, extraData = {}) => {
    return await apiClient.put(`/produccion/${id}/estado`, { estado, ...extraData });
  },

  deleteOrden: async (id) => {
    return await apiClient.delete(`/produccion/${id}`);
  }
};
