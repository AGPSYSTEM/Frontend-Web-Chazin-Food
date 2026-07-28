import { apiClient } from "@/shared/api/apiClient";

export const comprasService = {
  getCompras: async () => {
    return await apiClient.get("/compras");
  },

  getCompraById: async (id) => {
    return await apiClient.get(`/compras/${id}`);
  },

  createCompra: async (data) => {
    return await apiClient.post("/compras", data);
  },

  updateEstadoCompra: async (id, estado) => {
    return await apiClient.put(`/compras/${id}/estado`, { estado });
  },

  cancelarCompra: async (id) => {
    return await apiClient.put(`/compras/${id}/cancelar`);
  }
};
