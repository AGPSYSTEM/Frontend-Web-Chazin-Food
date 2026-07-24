import { apiClient } from "@/shared/api/apiClient";

export const rolesService = {
  getRoles: async () => {
    return await apiClient.get("/roles");
  },

  createRol: async (data) => {
    return await apiClient.post("/roles", data);
  },

  updateRol: async (id, data) => {
    return await apiClient.put(`/roles/${id}`, data);
  },

  updatePermisos: async (id, permisos) => {
    return await apiClient.put(`/roles/${id}/permisos`, { permisos });
  },

  deleteRol: async (id) => {
    return await apiClient.delete(`/roles/${id}`);
  }
};
