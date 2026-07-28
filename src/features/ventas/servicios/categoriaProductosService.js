import { apiClient } from "@/shared/api/apiClient";

export const categoriaProductosService = {
  getCategorias: async () => {
    return await apiClient.get("/categorias-producto");
  },

  createCategoria: async (data) => {
    return await apiClient.post("/categorias-producto", data);
  },

  updateCategoria: async (id, data) => {
    return await apiClient.put(`/categorias-producto/${id}`, data);
  },

  deleteCategoria: async (id) => {
    return await apiClient.delete(`/categorias-producto/${id}`);
  }
};
