import { useState, useEffect, useCallback } from "react";
import { insumosService } from "../servicios/insumosService";
import { proveedoresService } from "../servicios/proveedoresService";
import { fichasTecnicasService } from "@/features/fichas-tecnicas/servicios/fichasTecnicasService";
import { normalizeFichaWithVersions } from "@/features/fichas-tecnicas/utils/fichaVersionUtils";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { apiClient } from "@/shared/api/apiClient";
import { matchesSmartSearch } from "@/shared/utils/searchUtils";

export function useInsumos() {
  const notify = useNotifications();
  const [insumos, setInsumos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategoria, setFilterCategoria] = useState("Todas");
  const [filterEstado, setFilterEstado] = useState("Todos");
  const [insumosVencidos, setInsumosVencidos] = useState([]);

  // Traceability & Papelera State from backend
  const [eventos, setEventos] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [papeleraInsumos, setPapeleraInsumos] = useState([]);
  const [papeleraPreparados, setPapeleraPreparados] = useState([]);

  const fetchTrazabilidad = useCallback(async () => {
    try {
      const [trazabilidadData, unreadData] = await Promise.all([
        apiClient.get("/trazabilidad").catch(() => []),
        apiClient.get("/trazabilidad/unread-count").catch(() => ({ unreadCount: 0 }))
      ]);
      setEventos(Array.isArray(trazabilidadData) ? trazabilidadData : []);
      setUnreadCount(unreadData?.unreadCount ?? 0);
    } catch (err) {
      console.warn("Error cargando trazabilidad:", err);
    }
  }, []);

  const fetchInsumos = useCallback(async () => {
    try {
      setLoading(true);
      const [insumosData, categoriasData, preparadosData, proveedoresData] = await Promise.all([
        insumosService.getInsumos(),
        insumosService.getCategorias(),
        insumosService.getInsumosPreparados(),
        proveedoresService.getProveedores().catch(() => [])
      ]);

      const baseMapped = (insumosData || []).map(i => ({
        ...i,
        tipo: "Base",
        estado: i.estado === 1 || i.estado === "Activo" || i.estado === "1" ? "Activo" : "Inactivo"
      }));

      const prepMapped = (preparadosData || []).map(p => {
        const fichaNorm = p.fichaTecnica
          ? normalizeFichaWithVersions(p.fichaTecnica, "INSUMO_PREPARADO", p.id)
          : null;
        const ent = fichaNorm?.datosEntidad;
        const resolvedPrecio =
          ent?.precioUnitario !== undefined && Number(ent.precioUnitario) > 0
            ? Number(ent.precioUnitario)
            : (p.precioVenta || p.costoTotal || 0);
        return {
          id: p.id,
          idInsumo: p.id,
          nombre: p.nombre,
          tipo: "Preparado",
          descripcion: ent?.descripcion !== undefined ? ent.descripcion : (p.descripcion || ""),
          precio: resolvedPrecio,
          precioUnitario: resolvedPrecio,
          costo: p.costoTotal || 0,
          unidadMedida: ent?.unidadMedida || p.unidadMedida || "und",
          estado: p.estado === 1 || p.estado === "Activo" || p.estado === "1" ? "Activo" : "Inactivo",
          fichaTecnica: fichaNorm,
          ingredientes: (p.insumos || p.componentes || []).map(d => ({
            id: d.idInsumo,
            nombre: d.insumoNombre || `Insumo #${d.idInsumo}`,
            cantidad: parseFloat(d.cantidad || 0),
            unidadMedida: d.unidadMedida || "und",
            precioUnitario: parseFloat(d.precioUnitario || 0)
          }))
        };
      });

      const allInsumos = [...baseMapped, ...prepMapped];
      setInsumos(allInsumos);
      setCategorias(categoriasData || []);
      setProveedores(proveedoresData || []);

      const todayStr = new Date().toISOString().split("T")[0];
      const vencidos = allInsumos.filter((i) => {
        const tieneLoteVencido = (i.lotes || []).some(
          (l) => l.estado === "VENCIDO" || (l.fechaVencimiento && l.fechaVencimiento <= todayStr)
        );
        const insumoVencido = i.fechaVencimiento && i.fechaVencimiento <= todayStr;
        return (tieneLoteVencido || insumoVencido) && (i.estado === "Inactivo" || i.stock <= 0 || tieneLoteVencido);
      });
      setInsumosVencidos(vencidos);

      await fetchTrazabilidad();
    } catch (err) {
      console.error(err);
      notify.error("Error", err.message || "Error al obtener insumos o categorías");
    } finally {
      setLoading(false);
    }
  }, [fetchTrazabilidad]);

  // Fetch papelera data from backend API
  const fetchPapelera = useCallback(async () => {
    try {
      const [insumosTrash, preparadosTrash] = await Promise.all([
        insumosService.getPapeleraInsumos(),
        insumosService.getPapeleraPreparados()
      ]);

      const prepTrashMapped = (preparadosTrash || []).map(p => ({
        id: p.id,
        idInsumo: p.id,
        nombre: p.nombre,
        tipo: "Preparado",
        descripcion: p.descripcion || "",
        precio: p.precioVenta || p.costoTotal || 0,
        costo: p.costoTotal || 0,
        unidadMedida: p.unidadMedida || "und",
        estado: p.estado === 1 || p.estado === "Activo" || p.estado === "1" ? "Activo" : "Inactivo",
        fichaTecnica: p.fichaTecnica ? normalizeFichaWithVersions(p.fichaTecnica, "insumo", p.id) : null,
        ingredientes: (p.insumos || p.componentes || []).map(d => ({
          id: d.idInsumo,
          nombre: d.insumoNombre || `Insumo #${d.idInsumo}`,
          cantidad: parseFloat(d.cantidad || 0),
          unidadMedida: d.unidadMedida || "und",
          precioUnitario: parseFloat(d.precioUnitario || 0)
        }))
      }));

      setPapeleraInsumos(insumosTrash || []);
      setPapeleraPreparados(prepTrashMapped);
    } catch (err) {
      console.error("Error al cargar papelera:", err);
    }
  }, []);

  useEffect(() => {
    fetchInsumos();
    fetchPapelera();
  }, [fetchInsumos, fetchPapelera]);

  const filteredInsumos = insumos.filter((item) => {
    const isPrep = item.tipo === "Preparado";
    const isAgotado = (item.stock || 0) === 0;
    const isBajo = (item.stock || 0) <= (item.stockMinimo || 0) && (item.stock || 0) > 0;
    const stockStatus = isAgotado ? "Agotado stock agotado" : isBajo ? "Bajo stock bajo" : "Normal stock normal";
    const esAdicionStr = (item.esAdicion === 1 || item.esAdicion === true || item.esAdicion === "1") ? "Adición Adicion sí si" : "No";
    const lotesTokens = (item.lotes || []).map((l) => `${l.numeroLote || ""} ${l.fechaVencimiento || ""} ${l.estado || ""}`).join(" ");
    const ingredientesTokens = (item.ingredientes || []).map((ing) => `${ing.nombre || ""} ${ing.cantidad || ""} ${ing.unidadMedida || ""}`).join(" ");
    const precioNum = Number(item.precioUnitario || item.costo || item.precio || 0);

    const matchSearch = matchesSmartSearch(
      [
        item.nombre,
        item.categoria,
        item.categoriaNombre,
        item.categoria?.nombre,
        item.proveedor,
        item.proveedorNombre,
        item.estado,
        item.estado === "Activo" ? "activo activa habilitado" : "inactivo inactiva deshabilitado",
        item.tipo,
        isPrep ? "Insumo Preparado Preparado" : "Insumo Base Base",
        item.descripcion,
        item.unidadMedida,
        item.id,
        item.idInsumo,
        `#${item.id || item.idInsumo}`,
        String(item.stock ?? ""),
        item.stock !== undefined && item.stock !== null ? `${item.stock} ${item.unidadMedida || ""}` : "",
        String(item.stockMinimo ?? ""),
        String(item.stockMaximo ?? ""),
        String(precioNum),
        `$${precioNum.toLocaleString("es-CO")}`,
        stockStatus,
        esAdicionStr,
        item.precioAdicion ? String(item.precioAdicion) : "",
        item.fechaVencimiento || "",
        lotesTokens,
        ingredientesTokens
      ],
      searchTerm
    );

    const matchCategoria = filterCategoria === "Todas" || item.categoria === filterCategoria || item.categoriaNombre === filterCategoria;
    const matchEstado = filterEstado === "Todos" || item.estado === filterEstado;

    return matchSearch && matchCategoria && matchEstado;
  });

  const createInsumo = async (data) => {
    try {
      const isPrep = data.tipo === "Preparado";
      if (isPrep) {
        const payload = {
          nombre: data.nombre,
          descripcion: data.descripcion || "",
          unidadMedida: data.unidadMedida || "und",
          precioVenta: Number(data.precio) || 0,
          estado: data.estado || "Activo",
          incluyeIva: data.incluyeIva ? 1 : 0,
          insumos: (data.ingredientes || []).map(i => ({
            idInsumo: i.id || i.idInsumo,
            cantidad: i.cantidad,
            unidadMedida: i.unidadMedida || "und"
          })),
          fichaTecnica: data.fichaTecnica || null
        };
        const res = await insumosService.createPreparado(payload);
        const createdId = res?.id || res?.idInsumo || res?.data?.id;
        if (data.fichaTecnica && createdId) {
          try {
            await fichasTecnicasService.saveFichaInsumoPreparado(createdId, data.fichaTecnica);
          } catch (e) {
            console.error("Error guardando ficha técnica del preparado:", e);
          }
        }
      } else {
        const payload = {
          nombre: data.nombre,
          idCategoriaInsumo: data.idCategoriaInsumo || 1,
          stock: Number(data.stock) || 0,
          stockMinimo: Number(data.stockMinimo) || 0,
          unidadMedida: data.unidadMedida || "und",
          precioUnitario: Number(data.precioUnitario) || 0,
          idProveedor: data.idProveedor && String(data.idProveedor).trim() !== "" ? Number(data.idProveedor) : null,
          descripcion: data.descripcion || "",
          esAdicion: data.esAdicion ? 1 : 0,
          precioAdicion: Number(data.precioAdicion) || 0,
          imagen: data.imagen || "",
          incluyeIva: data.incluyeIva ? 1 : 0,
          estado: data.estado || "Activo",
          fechaExpedicion: null, // #62: Eliminada fecha de expedición
          fechaVencimiento: (data.fechaVencimiento && String(data.fechaVencimiento).trim() !== "") ? data.fechaVencimiento : null
        };
        await insumosService.createInsumo(payload);
      }

      await fetchInsumos();

      notify.success(
        isPrep ? "Insumo preparado creado" : "Insumo creado",
        "El registro se realizó exitosamente."
      );
      return true;
    } catch (err) {
      const statusPfx = err?.status ? `[HTTP ${err.status}] ` : "";
      notify.error("Error al registrar insumo", `${statusPfx}${err.message || "Error en el servidor"}`);
      return false;
    }
  };

  const updateInsumo = async (id, data) => {
    try {
      const isPrep = data.tipo === "Preparado";
      if (isPrep) {
        if (data.fichaTecnica && id) {
          try {
            await fichasTecnicasService.saveFichaInsumoPreparado(id, data.fichaTecnica);
          } catch (e) {
            console.error("Error guardando ficha técnica del preparado:", e);
          }
        }
        const payload = {
          nombre: data.nombre,
          descripcion: data.descripcion || "",
          unidadMedida: data.unidadMedida || "und",
          precioVenta: Number(data.precio) || 0,
          estado: data.estado !== undefined ? data.estado : "Activo",
          insumos: (data.ingredientes || []).map(i => ({
            idInsumo: i.id || i.idInsumo,
            cantidad: i.cantidad,
            unidadMedida: i.unidadMedida || "und"
          }))
        };
        await insumosService.updatePreparado(id, payload);
      } else {
        const payload = {
          nombre: data.nombre,
          idCategoriaInsumo: data.idCategoriaInsumo,
          stock: Number(data.stock),
          stockMinimo: Number(data.stockMinimo),
          unidadMedida: data.unidadMedida,
          precioUnitario: Number(data.precioUnitario),
          idProveedor: data.idProveedor && String(data.idProveedor).trim() !== "" ? Number(data.idProveedor) : null,
          descripcion: data.descripcion,
          esAdicion: data.esAdicion ? 1 : 0,
          precioAdicion: Number(data.precioAdicion) || 0,
          imagen: data.imagen || "",
          incluyeIva: data.incluyeIva !== undefined ? (data.incluyeIva ? 1 : 0) : undefined,
          estado: data.estado !== undefined ? data.estado : "Activo",
          fechaExpedicion: null, // #62: Eliminada fecha de expedición
          fechaVencimiento: (data.fechaVencimiento && String(data.fechaVencimiento).trim() !== "") ? data.fechaVencimiento : null
        };
        await insumosService.updateInsumo(id, payload);
      }

      await fetchInsumos();

      notify.success("Insumo actualizado", "Los datos fueron guardados exitosamente.");
      return true;
    } catch (err) {
      const statusPfx = err?.status ? `[HTTP ${err.status}] ` : "";
      notify.error("Error al actualizar insumo", `${statusPfx}${err.message || "Error en el servidor"}`);
      return false;
    }
  };

  const toggleEstadoInsumo = async (item) => {
    const id = item.id || item.idInsumo;
    const nuevoEstado = item.estado === "Activo" ? "Inactivo" : "Activo";
    try {
      if (item.tipo === "Preparado") {
        await insumosService.updatePreparado(id, {
          ...item,
          estado: nuevoEstado
        });
      } else {
        await insumosService.updateInsumo(id, {
          ...item,
          estado: nuevoEstado
        });
      }
      await fetchInsumos();
      notify.success(
        nuevoEstado === "Activo" ? "Insumo activado" : "Insumo inactivado",
        `"${item.nombre}" ahora está ${nuevoEstado}.`
      );
      return true;
    } catch (err) {
      notify.error("Error al cambiar estado", err.message || "No se pudo actualizar el estado del insumo");
      return false;
    }
  };

  // Soft delete — moves base insumo to papelera (sets estado = 0 in backend)
  const deleteInsumo = async (id, nombre) => {
    const confirmed = await notify.confirmDelete(
      "¿Mover a la papelera?",
      `¿Deseas mover "${nombre}" a la papelera de reciclaje?`
    );
    if (!confirmed) return false;

    try {
      await insumosService.deleteInsumo(id);
      await fetchInsumos();
      await fetchPapelera();

      notify.success("Movido a papelera", `"${nombre}" fue enviado a la papelera.`);
      return true;
    } catch (err) {
      notify.error("Error", err.message || "No se pudo eliminar");
      return false;
    }
  };

  // Soft delete for insumos preparados — moves prepared insumo to papelera
  const deletePreparado = async (id, nombre) => {
    const confirmed = await notify.confirmDelete(
      "¿Mover a la papelera?",
      `¿Deseas mover el preparado "${nombre}" a la papelera de reciclaje?`
    );
    if (!confirmed) return false;

    try {
      await insumosService.deletePreparado(id);
      await fetchInsumos();
      await fetchPapelera();

      notify.success("Movido a papelera", `"${nombre}" fue enviado a la papelera.`);
      return true;
    } catch (err) {
      notify.error("Error", err.message || "No se pudo eliminar el preparado");
      return false;
    }
  };

  // Restore from papelera — calls backend API to set estado = 1
  const restoreInsumo = async (item) => {
    try {
      const isPreparado = item.tipo === "Preparado" || item.componentes || item.ingredientes;

      if (isPreparado) {
        await insumosService.restorePreparado(item.id || item.idInsumo);
      } else {
        await insumosService.restoreInsumo(item.id || item.idInsumo);
      }

      await fetchInsumos();
      await fetchPapelera();

      notify.success("Insumo restaurado", `"${item.nombre}" volvió a estar activo.`);
    } catch (err) {
      notify.error("Error", err.message || "No se pudo restaurar");
    }
  };

  // Hard delete — permanent elimination from database
  const deleteDefinitivoInsumo = async (id, nombre, isPreparado) => {
    const confirmed = await notify.confirmDelete(
      "¿Eliminar definitivamente?",
      `Esta acción eliminará permanentemente "${nombre}" y no se podrá recuperar.`
    );
    if (!confirmed) return;

    try {
      if (isPreparado) {
        await insumosService.hardDeletePreparado(id);
      } else {
        await insumosService.hardDeleteInsumo(id);
      }

      await fetchPapelera();
      await fetchTrazabilidad();

      notify.success("Eliminado permanente", `"${nombre}" fue eliminado por completo.`);
    } catch (err) {
      notify.error("Error", err.message || "No se pudo eliminar permanentemente");
    }
  };

  const clearEventos = async () => {
    try {
      await apiClient.delete("/trazabilidad/clear");
      setEventos([]);
      setUnreadCount(0);
      notify.success("Trazabilidad limpia", "Se borró el historial de eventos.");
    } catch (err) {
      console.error("Error al limpiar eventos:", err);
    }
  };

  const resetUnreadCount = async () => {
    try {
      await apiClient.put("/trazabilidad/read-all");
      setUnreadCount(0);
    } catch (err) {
      console.error("Error al marcar como leídos:", err);
    }
  };

  return {
    insumos,
    filteredInsumos,
    categorias,
    proveedores,
    loading,
    searchTerm,
    setSearchTerm,
    filterCategoria,
    setFilterCategoria,
    filterEstado,
    setFilterEstado,
    insumosVencidos,
    eventos,
    unreadCount,
    papeleraInsumos,
    papeleraPreparados,
    refetch: fetchInsumos,
    refetchPapelera: fetchPapelera,
    createInsumo,
    updateInsumo,
    toggleEstadoInsumo,
    deleteInsumo,
    deletePreparado,
    restoreInsumo,
    deleteDefinitivoInsumo,
    clearEventos,
    resetUnreadCount
  };
}

