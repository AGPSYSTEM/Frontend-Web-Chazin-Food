import { apiClient } from "@/shared/api/apiClient";

export const devolucionesService = {
  getDevoluciones: async (filters = {}) => {
    return await apiClient.get("/devoluciones", { params: filters });
  },

  getStats: async () => {
    return await apiClient.get("/devoluciones/stats");
  },

  getPoliticas: async () => {
    return await apiClient.get("/devoluciones/politicas");
  },

  checkVentaElegibilidad: async (idVenta) => {
    return await apiClient.get(`/devoluciones/elegibilidad/${idVenta}`);
  },

  getMisDevoluciones: async (idCliente) => {
    return await apiClient.get("/devoluciones/mis-devoluciones", {
      params: idCliente ? { idCliente } : {}
    });
  },

  getDevolucionById: async (id) => {
    return await apiClient.get(`/devoluciones/${id}`);
  },

  createDevolucion: async (data) => {
    return await apiClient.post("/devoluciones", data);
  },

  updateEstadoDevolucion: async (id, data) => {
    return await apiClient.put(`/devoluciones/${id}/estado`, data);
  }
};

