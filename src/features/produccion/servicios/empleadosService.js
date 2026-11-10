import { apiClient } from "@/shared/api/apiClient";

export const empleadosService = {
  getEmpleados: async (params = {}) => {
    return await apiClient.get("/empleados", { params });
  },

  getEmpleadoById: async (id) => {
    return await apiClient.get(`/empleados/${id}`);
  },

  createEmpleado: async (data) => {
    return await apiClient.post("/empleados", data);
  },

  updateEmpleado: async (id, data) => {
    return await apiClient.put(`/empleados/${id}`, data);
  },

  toggleEstadoEmpleado: async (id) => {
    return await apiClient.patch(`/empleados/${id}/estado`);
  },

  deleteEmpleado: async (id) => {
    return await apiClient.delete(`/empleados/${id}`);
  },

  restoreEmpleado: async (id) => {
    return await apiClient.patch(`/empleados/${id}/restaurar`);
  }
};

