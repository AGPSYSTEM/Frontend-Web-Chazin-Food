import { apiClient } from "@/shared/api/apiClient";

export const proveedoresService = {
  getProveedores: async () => {
    return await apiClient.get("/proveedores");
  },

  createProveedor: async (data) => {
    return await apiClient.post("/proveedores", data);
  },

  updateProveedor: async (id, data) => {
    return await apiClient.put(`/proveedores/${id}`, data);
  },

  deleteProveedor: async (id) => {
    return await apiClient.delete(`/proveedores/${id}`);
  },

  restoreProveedor: async (id) => {
    return await apiClient.put(`/proveedores/${id}/restaurar`);
  },

  deletePermanenteProveedor: async (id) => {
    return await apiClient.delete(`/proveedores/${id}/permanente`);
  },

  toggleEstadoProveedor: async (id, estado) => {
    return await apiClient.put(`/proveedores/${id}/estado`, { estado });
  }
};
