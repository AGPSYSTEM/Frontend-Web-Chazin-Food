import { apiClient } from "@/shared/api/apiClient";

export const productosService = {
  getProductos: async () => {
    return await apiClient.get("/productos");
  },

  getCategorias: async () => {
    return await apiClient.get("/categorias-producto");
  },

  createProducto: async (data) => {
    return await apiClient.post("/productos", data);
  },

  updateProducto: async (id, data) => {
    return await apiClient.put(`/productos/${id}`, data);
  },

  deleteProducto: async (id) => {
    return await apiClient.delete(`/productos/${id}`);
  }
};
