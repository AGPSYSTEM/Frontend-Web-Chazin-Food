import { apiClient } from "@/shared/api/apiClient";

export const fichasTecnicasService = {
  getFichas: async () => {
    return await apiClient.get("/fichas-tecnicas");
  },

  getFichaById: async (id) => {
    return await apiClient.get(`/fichas-tecnicas/${id}`);
  },

  getFichaByProducto: async (idProducto) => {
    return await apiClient.get(`/fichas-tecnicas/producto/${idProducto}`);
  },

  getFichaByInsumoPreparado: async (idInsumoPreparado) => {
    return await apiClient.get(`/fichas-tecnicas/insumo-preparado/${idInsumoPreparado}`);
  },

  getFichaByInsumo: async (idInsumo) => {
    return await apiClient.get(`/fichas-tecnicas/insumo-preparado/${idInsumo}`);
  },

  saveFichaProducto: async (idProducto, data) => {
    return await apiClient.put(`/fichas-tecnicas/producto/${idProducto}`, data);
  },

  saveFichaInsumoPreparado: async (idInsumoPreparado, data) => {
    return await apiClient.put(`/fichas-tecnicas/insumo-preparado/${idInsumoPreparado}`, data);
  },

  saveFichaInsumo: async (idInsumo, data) => {
    return await apiClient.put(`/fichas-tecnicas/insumo-preparado/${idInsumo}`, data);
  },

  createFicha: async (data) => {
    return await apiClient.post("/fichas-tecnicas", data);
  },

  updateFicha: async (id, data) => {
    return await apiClient.put(`/fichas-tecnicas/${id}`, data);
  },

  deleteFicha: async (id) => {
    return await apiClient.delete(`/fichas-tecnicas/${id}`);
  }
};

