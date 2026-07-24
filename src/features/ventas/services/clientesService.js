import { apiClient } from "@/shared/api/apiClient";

export const clientesService = {
  getClientes: async () => {
    return await apiClient.get("/clientes");
  },

  createCliente: async (data) => {
    return await apiClient.post("/clientes", data);
  },

  updateCliente: async (id, data) => {
    return await apiClient.put(`/clientes/${id}`, data);
  },

  deleteCliente: async (id) => {
    return await apiClient.delete(`/clientes/${id}`);
  }
};
