import { apiClient } from "@/shared/api/apiClient";

export const usuariosService = {
  getUsuarios: async () => {
    return await apiClient.get("/usuarios");
  },

  getRoles: async () => {
    return await apiClient.get("/roles");
  },

  createUsuario: async (data) => {
    return await apiClient.post("/usuarios", data);
  },

  updateUsuario: async (id, data) => {
    return await apiClient.put(`/usuarios/${id}`, data);
  },

  deleteUsuario: async (id) => {
    return await apiClient.delete(`/usuarios/${id}`);
  },

  changePassword: async (id, passwordData) => {
    return await apiClient.put(`/usuarios/${id}/password`, passwordData);
  },

  toggleEstado: async (id, nuevoEstado) => {
    return await apiClient.put(`/usuarios/${id}/estado`, { estado: nuevoEstado });
  }
};
