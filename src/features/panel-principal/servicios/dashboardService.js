import { apiClient } from "@/shared/api/apiClient";

export const dashboardService = {
  getStats: async () => {
    return await apiClient.get("/dashboard/stats");
  },

  getVentasChart: async () => {
    return await apiClient.get("/dashboard/ventas-chart");
  },

  getProductosPopulares: async () => {
    return await apiClient.get("/dashboard/productos-populares");
  },

  getAlertasStock: async () => {
    return await apiClient.get("/dashboard/alertas-stock");
  },

  getVentasRecientes: async () => {
    return await apiClient.get("/dashboard/ventas-recientes");
  }
};
