import { apiClient } from "@/shared/api/apiClient";

export const posService = {
  getCategorias: async () => {
    return await apiClient.get("/categorias-producto");
  },

  getProductos: async (params) => {
    // params can include categoriaId
    return await apiClient.get("/productos", { params });
  },

  createVenta: async (data) => {
    // aligns with existing ventas endpoints
    return await apiClient.post("/ventas", data);
  }
};
