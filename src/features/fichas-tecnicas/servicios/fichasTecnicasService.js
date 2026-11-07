import { apiClient } from "@/shared/api/apiClient";
import {
  normalizeFichaWithVersions,
  buildVersionedFichaPayload
} from "../utils/fichaVersionUtils";

export const fichasTecnicasService = {
  getFichas: async () => {
    const res = await apiClient.get("/fichas-tecnicas");
    const list = Array.isArray(res) ? res : res?.data || [];
    return list.map((f) => normalizeFichaWithVersions(f));
  },

  getAllFichas: async () => {
    const res = await apiClient.get("/fichas-tecnicas");
    const list = Array.isArray(res) ? res : res?.data || [];
    return list.map((f) => normalizeFichaWithVersions(f));
  },

  getFichaById: async (id) => {
    const res = await apiClient.get(`/fichas-tecnicas/${id}`);
    return res ? normalizeFichaWithVersions(res) : res;
  },

  getFichaByProducto: async (idProducto) => {
    const res = await apiClient.get(`/fichas-tecnicas/producto/${idProducto}`);
    return res && (res.idFichaTecnica || res.id || res.procedimiento || res.detalles)
      ? normalizeFichaWithVersions(res, "PRODUCTO", idProducto)
      : res;
  },

  getFichaByInsumoPreparado: async (idInsumoPreparado) => {
    const res = await apiClient.get(`/fichas-tecnicas/insumo-preparado/${idInsumoPreparado}`);
    return res && (res.idFichaTecnica || res.id || res.procedimiento || res.detalles)
      ? normalizeFichaWithVersions(res, "INSUMO_PREPARADO", idInsumoPreparado)
      : res;
  },

  getFichaByInsumo: async (idInsumo) => {
    const res = await apiClient.get(`/fichas-tecnicas/insumo-preparado/${idInsumo}`);
    return res && (res.idFichaTecnica || res.id || res.procedimiento || res.detalles)
      ? normalizeFichaWithVersions(res, "INSUMO_PREPARADO", idInsumo)
      : res;
  },

  saveFichaProducto: async (idProducto, data, options = {}) => {
    let prevFicha = data?._prevFicha || null;
    if (!prevFicha && idProducto) {
      try {
        const current = await apiClient.get(`/fichas-tecnicas/producto/${idProducto}`);
        if (current && (current.idFichaTecnica || current.id || current.procedimiento || (current.detalles && current.detalles.length > 0))) {
          prevFicha = current;
        }
      } catch (_) {}
    }

    const versionedPayload = buildVersionedFichaPayload(prevFicha, data, {
      tipo: "PRODUCTO",
      entityId: idProducto,
      forceVersion: Boolean(options.forceVersion)
    });

    const saved = await apiClient.put(`/fichas-tecnicas/producto/${idProducto}`, versionedPayload);
    return normalizeFichaWithVersions(
      {
        ...saved,
        versionActual: versionedPayload.versionActual,
        fechaInicioVigencia: versionedPayload.fechaInicioVigencia,
        versionesAnteriores: versionedPayload.versionesAnteriores
      },
      "PRODUCTO",
      idProducto
    );
  },

  saveFichaInsumoPreparado: async (idInsumoPreparado, data, options = {}) => {
    let prevFicha = data?._prevFicha || null;
    if (!prevFicha && idInsumoPreparado) {
      try {
        const current = await apiClient.get(`/fichas-tecnicas/insumo-preparado/${idInsumoPreparado}`);
        if (current && (current.idFichaTecnica || current.id || current.procedimiento || (current.detalles && current.detalles.length > 0))) {
          prevFicha = current;
        }
      } catch (_) {}
    }

    const versionedPayload = buildVersionedFichaPayload(prevFicha, data, {
      tipo: "INSUMO_PREPARADO",
      entityId: idInsumoPreparado,
      forceVersion: Boolean(options.forceVersion)
    });

    const saved = await apiClient.put(`/fichas-tecnicas/insumo-preparado/${idInsumoPreparado}`, versionedPayload);
    return normalizeFichaWithVersions(
      {
        ...saved,
        versionActual: versionedPayload.versionActual,
        fechaInicioVigencia: versionedPayload.fechaInicioVigencia,
        versionesAnteriores: versionedPayload.versionesAnteriores
      },
      "INSUMO_PREPARADO",
      idInsumoPreparado
    );
  },

  saveFichaInsumo: async (idInsumo, data, options = {}) => {
    return await fichasTecnicasService.saveFichaInsumoPreparado(idInsumo, data, options);
  },

  createFicha: async (data) => {
    const res = await apiClient.post("/fichas-tecnicas", data);
    return normalizeFichaWithVersions(res);
  },

  updateFicha: async (id, data, options = {}) => {
    let prevFicha = data?._prevFicha || null;
    if (!prevFicha && id) {
      try {
        const current = await apiClient.get(`/fichas-tecnicas/${id}`);
        if (current && (current.idFichaTecnica || current.id)) {
          prevFicha = current;
        }
      } catch (_) {}
    }

    const tipo = data?.tipo || prevFicha?.tipo || (data?.idProducto || prevFicha?.idProducto ? "PRODUCTO" : "INSUMO_PREPARADO");
    const entityId = data?.idProducto || prevFicha?.idProducto || data?.idInsumo || prevFicha?.idInsumo;

    const versionedPayload = buildVersionedFichaPayload(prevFicha, data, {
      tipo,
      entityId,
      forceVersion: Boolean(options.forceVersion)
    });

    const saved = await apiClient.put(`/fichas-tecnicas/${id}`, versionedPayload);
    return normalizeFichaWithVersions(
      {
        ...saved,
        versionActual: versionedPayload.versionActual,
        fechaInicioVigencia: versionedPayload.fechaInicioVigencia,
        versionesAnteriores: versionedPayload.versionesAnteriores
      },
      tipo,
      entityId
    );
  },

  deleteFicha: async (id) => {
    return await apiClient.delete(`/fichas-tecnicas/${id}`);
  }
};
