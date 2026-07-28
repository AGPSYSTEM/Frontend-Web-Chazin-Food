import { apiClient } from "@/shared/api/apiClient";

export const ventasService = {
  getVentas: async () => {
    return await apiClient.get("/ventas");
  },

  getVentaById: async (id) => {
    return await apiClient.get(`/ventas/${id}`);
  },

  createVenta: async (data) => {
    return await apiClient.post("/ventas", data);
  },

  updateEstadoVenta: async (id, estado) => {
    return await apiClient.put(`/ventas/${id}/estado`, { estado });
  },

  cancelarVenta: async (id) => {
    return await apiClient.put(`/ventas/${id}/cancelar`);
  }
};
