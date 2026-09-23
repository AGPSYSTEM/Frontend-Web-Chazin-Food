import { apiClient } from "@/shared/api/apiClient";

export const ventasService = {
  getVentas: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.periodo) query.append("periodo", params.periodo);
    if (params.estado) query.append("estado", params.estado);
    if (params.search) query.append("search", params.search);
    const qs = query.toString();
    return await apiClient.get(`/ventas${qs ? `?${qs}` : ""}`);
  },

  getStats: async (periodo) => {
    const qs = periodo ? `?periodo=${encodeURIComponent(periodo)}` : "";
    return await apiClient.get(`/ventas/stats${qs}`);
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
