import { apiClient } from "@/shared/api/apiClient";

export const dashboardService = {
  getStats: async (params = {}) => {
    return await apiClient.get("/dashboard/stats", { params });
  },

  getVentasChart: async (params = {}) => {
    return await apiClient.get("/dashboard/ventas-chart", { params });
  },

  getProductosPopulares: async (params = {}) => {
    return await apiClient.get("/dashboard/productos-populares", { params });
  },

  getAlertasStock: async (params = {}) => {
    return await apiClient.get("/dashboard/alertas-stock", { params });
  },

  getVentasRecientes: async (params = {}) => {
    return await apiClient.get("/dashboard/ventas-recientes", { params });
  }
};
