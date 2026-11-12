import { useState, useEffect, useCallback, useMemo } from "react";
import { devolucionesService } from "../servicios/devolucionesService";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { matchesSmartSearch, rankSearchResults, formatStatusTokens } from "@/shared/utils/searchUtils";

export function useDevoluciones() {
  const notify = useNotifications();
  const [devoluciones, setDevoluciones] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    aprobadas: 0,
    completadas: 0,
    rechazadas: 0,
    totalValorDevuelto: 0
  });
  const [politicas, setPoliticas] = useState({
    MAX_DIAS: 2,
    MAX_HORAS: 48,
    MOTIVOS: ["Comida en mal estado", "Pedido incorrecto"],
    RESOLUCIONES: ["Cambio de producto", "Devolución de dinero", "Cambio de producto y devolución de dinero"],
    ESTADOS: ["PENDIENTE", "APROBADA", "RECHAZADA", "COMPLETADA"]
  });
  const [loading, setLoading] = useState(true);

  // Filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [filtroMotivo, setFiltroMotivo] = useState("Todos");
  const [filtroResolucion, setFiltroResolucion] = useState("Todos");

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [listData, statsData, polData] = await Promise.all([
        devolucionesService.getDevoluciones().catch(() => []),
        devolucionesService.getStats().catch(() => null),
        devolucionesService.getPoliticas().catch(() => null)
      ]);
      setDevoluciones(Array.isArray(listData) ? listData : []);
      if (statsData) setStats(statsData);
      if (polData) setPoliticas(polData);
    } catch (err) {
      console.error("Error al cargar devoluciones:", err);
      notify.error("Error", err.message || "Error al cargar el módulo de devoluciones");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtrado y ranking
  const filteredDevoluciones = useMemo(() => {
    const hasSearch = Boolean(searchTerm && searchTerm.trim());

    const baseFiltered = devoluciones.filter((d) => {
      // Filtro Estado
      if (filtroEstado !== "Todos") {
        if (String(d.estado || "").toUpperCase() !== String(filtroEstado).toUpperCase()) {
          return false;
        }
      }

      // Filtro Motivo
      if (filtroMotivo !== "Todos") {
        if (String(d.motivo || "").toLowerCase() !== String(filtroMotivo).toLowerCase()) {
          return false;
        }
      }

      // Filtro Tipo de Resolución
      if (filtroResolucion !== "Todos") {
        if (String(d.tipoResolucion || "").toLowerCase() !== String(filtroResolucion).toLowerCase()) {
          return false;
        }
      }

      // Búsqueda inteligente — cubre todos los datos visibles en la tabla
      if (hasSearch) {
        const clienteNombre = d.cliente?.nombre || d.venta?.cliente?.nombre || "";
        const clienteDoc = d.cliente?.documento || d.venta?.cliente?.documento || "";
        const clienteEmail = d.cliente?.email || d.cliente?.correo || d.venta?.cliente?.email || "";
        const clienteTel = d.cliente?.telefono || d.venta?.cliente?.telefono || "";
        const codigoDev = d.codigoDevolucion || `DEV-${String(d.idDevolucion).padStart(4, "0")}`;
        const codigoVen = d.codigoVenta || (d.idVenta ? `VEN-${String(d.idVenta).padStart(4, "0")}` : "");

        // Fecha de la devolución formateada en varios formatos buscables
        let fechaTexto = "";
        if (d.fecha) {
          const fechaObj = new Date(d.fecha);
          if (!isNaN(fechaObj.getTime())) {
            fechaTexto = [
              fechaObj.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" }),
              fechaObj.toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" }),
              fechaObj.toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" }),
              String(fechaObj.getFullYear()),
              String(fechaObj.getDate()).padStart(2, "0"),
            ].join(" ");
          }
        }

        // Valor devuelto — buscable como número y como texto formateado en COP
        const valorNum = Number(d.valorDevuelto || 0);
        const valorTexto = valorNum > 0
          ? new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(valorNum)
          : "reposicion cambio";

        // Productos devueltos — nombre, cantidad y precio unitario
        let prodsText = "";
        if (Array.isArray(d.productosDevueltos)) {
          prodsText = d.productosDevueltos
            .map(p => [
              p.nombre || p.nombreProducto || "",
              `x${p.cantidad || 1}`,
              p.cantidad ? `${p.cantidad} unidad` : "",
              p.precioUnitario ? String(p.precioUnitario) : ""
            ].join(" "))
            .join(" ");
        }

        // Totales de unidades devueltas (ej: "3 unidades")
        const totalUnidades = Array.isArray(d.productosDevueltos)
          ? d.productosDevueltos.reduce((acc, p) => acc + Number(p.cantidad || 1), 0)
          : 0;
        const unidadesTexto = `${totalUnidades} unidad${totalUnidades !== 1 ? "es" : ""}`;

        // Usuario que resolvió (si aplica)
        const resolvedBy = d.usuarioResolucion
          ? `${d.usuarioResolucion.nombre || ""} ${d.usuarioResolucion.apellidos || ""}`.trim()
          : "";

        return matchesSmartSearch(
          [
            codigoDev,
            codigoVen,
            `#${d.idDevolucion}`,
            `#${d.idVenta}`,
            clienteNombre,
            clienteDoc,
            clienteEmail,
            clienteTel,
            d.motivo,
            d.tipoResolucion,
            d.descripcion,
            d.accionRealizada,
            d.motivoRechazo,
            prodsText,
            unidadesTexto,
            fechaTexto,
            valorTexto,
            String(valorNum),
            formatStatusTokens(d.estado),
            d.estado,
            resolvedBy
          ],
          searchTerm
        );
      }

      return true;
    });

    if (hasSearch) {
      return rankSearchResults(baseFiltered, searchTerm, [
        (d) => d.codigoDevolucion,
        (d) => d.codigoVenta,
        (d) => d.cliente?.nombre || d.venta?.cliente?.nombre,
        (d) => d.motivo,
        (d) => d.tipoResolucion,
        (d) => d.estado,
        (d) => d.cliente?.documento || d.venta?.cliente?.documento
      ]);
    }

    return baseFiltered;
  }, [devoluciones, filtroEstado, filtroMotivo, filtroResolucion, searchTerm]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filteredDevoluciones.length / itemsPerPage));
  const paginatedDevoluciones = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDevoluciones.slice(start, start + itemsPerPage);
  }, [filteredDevoluciones, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filtroEstado, filtroMotivo, filtroResolucion, itemsPerPage]);

  // Lista de filtros activos para badges
  const activeFilters = useMemo(() => {
    const list = [];
    if (searchTerm.trim()) {
      list.push({ key: "search", label: `Búsqueda: "${searchTerm}"`, onRemove: () => setSearchTerm("") });
    }
    if (filtroEstado !== "Todos") {
      list.push({ key: "estado", label: `Estado: ${filtroEstado}`, onRemove: () => setFiltroEstado("Todos") });
    }
    if (filtroMotivo !== "Todos") {
      list.push({ key: "motivo", label: `Motivo: ${filtroMotivo}`, onRemove: () => setFiltroMotivo("Todos") });
    }
    if (filtroResolucion !== "Todos") {
      list.push({ key: "resolucion", label: `Resolución: ${filtroResolucion}`, onRemove: () => setFiltroResolucion("Todos") });
    }
    return list;
  }, [searchTerm, filtroEstado, filtroMotivo, filtroResolucion]);

  const clearAllFilters = useCallback(() => {
    setSearchTerm("");
    setFiltroEstado("Todos");
    setFiltroMotivo("Todos");
    setFiltroResolucion("Todos");
  }, []);

  // Operaciones de negocio
  const crearDevolucion = async (data) => {
    try {
      const res = await devolucionesService.createDevolucion(data);
      notify.success("Devolución Registrada", `La solicitud ${res.codigoDevolucion || ""} ha sido registrada con éxito.`);
      await fetchData();
      return res;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Error al registrar la devolución";
      notify.error("Error al registrar", msg);
      throw new Error(msg);
    }
  };

  const aprobarDevolucion = async (id, payload = {}) => {
    try {
      const res = await devolucionesService.updateEstadoDevolucion(id, {
        estado: "APROBADA",
        ...payload
      });
      notify.success("Devolución Aprobada", "La devolución ha sido aprobada de acuerdo con las políticas.");
      await fetchData();
      return res;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Error al aprobar la devolución";
      notify.error("Error al aprobar", msg);
      throw new Error(msg);
    }
  };

  const rechazarDevolucion = async (id, motivoRechazo) => {
    if (!motivoRechazo || !motivoRechazo.trim()) {
      notify.error("Campo Requerido", "Debe ingresar el motivo del rechazo de la devolución.");
      throw new Error("Debe ingresar el motivo del rechazo");
    }
    try {
      const res = await devolucionesService.updateEstadoDevolucion(id, {
        estado: "RECHAZADA",
        motivoRechazo
      });
      notify.warning("Devolución Rechazada", "La devolución ha sido marcada como rechazada.");
      await fetchData();
      return res;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Error al rechazar";
      notify.error("Error al rechazar", msg);
      throw new Error(msg);
    }
  };

  const completarDevolucion = async (id, accionRealizada = "", valorDevuelto = undefined) => {
    try {
      const res = await devolucionesService.updateEstadoDevolucion(id, {
        estado: "COMPLETADA",
        accionRealizada,
        ...(valorDevuelto !== undefined ? { valorDevuelto } : {})
      });
      notify.success("Devolución Completada", "Se ha cerrado y completado la gestión de la devolución.");
      await fetchData();
      return res;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Error al completar";
      notify.error("Error al completar", msg);
      throw new Error(msg);
    }
  };

  const verificarElegibilidadVenta = async (idVenta) => {
    try {
      return await devolucionesService.checkVentaElegibilidad(idVenta);
    } catch (err) {
      return {
        existe: false,
        elegible: false,
        mensaje: err.response?.data?.message || err.message || "Error al verificar la venta"
      };
    }
  };

  return {
    devoluciones,
    stats,
    politicas,
    loading,
    searchTerm,
    setSearchTerm,
    filtroEstado,
    setFiltroEstado,
    filtroMotivo,
    setFiltroMotivo,
    filtroResolucion,
    setFiltroResolucion,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    filteredDevoluciones,
    paginatedDevoluciones,
    activeFilters,
    clearAllFilters,
    fetchData,
    crearDevolucion,
    aprobarDevolucion,
    rechazarDevolucion,
    completarDevolucion,
    verificarElegibilidadVenta
  };
}

