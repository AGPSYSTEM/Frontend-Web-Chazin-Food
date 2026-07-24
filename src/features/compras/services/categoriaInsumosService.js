import { apiClient } from "@/shared/api/apiClient";

export const categoriaInsumosService = {
  getCategorias: async () => {
    return await apiClient.get("/categorias-insumo");
  },

  createCategoria: async (data) => {
    return await apiClient.post("/categorias-insumo", data);
  },

  updateCategoria: async (id, data) => {
    return await apiClient.put(`/categorias-insumo/${id}`, data);
  },

  deleteCategoria: async (id) => {
    return await apiClient.delete(`/categorias-insumo/${id}`);
  }
};
