import { useState, useEffect, useCallback, useMemo } from "react";
import { proveedoresService } from "../servicios/proveedoresService";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { apiClient } from "@/shared/api/apiClient";
import { matchesSmartSearch, formatStatusTokens, rankSearchResults, normalizeSearchText } from "@/shared/utils/searchUtils";

export function useProveedores() {
  const notify = useNotifications();
  const [proveedores, setProveedores] = useState([]);
  const [papeleraProveedores, setPapeleraProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("Todos");
  const [filterTipo, setFilterTipo] = useState("Todos");

  // Traceability State from backend
  const [eventos, setEventos] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

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

  const fetchProveedores = useCallback(async () => {
    try {
      setLoading(true);
      const [data, trashData] = await Promise.all([
        proveedoresService.getProveedores(),
        proveedoresService.getPapeleraProveedores().catch(() => [])
      ]);
      setProveedores(data || []);
      setPapeleraProveedores(trashData || []);
      await fetchTrazabilidad();
    } catch (err) {
      console.error(err);
      notify.error("Error", err.message || "Error al cargar proveedores");
    } finally {
      setLoading(false);
    }
  }, [fetchTrazabilidad]);

  useEffect(() => {
    fetchProveedores();
  }, [fetchProveedores]);

  // Active suppliers (estado === "Activo" or estado === 1)
  const activosProveedores = proveedores.filter((p) => p.estado === "Activo" || p.estado === 1);

  const filteredProveedores = useMemo(() => {
    const hasSearch = Boolean(searchTerm && searchTerm.trim());

    const baseFiltered = proveedores.filter((p) => {
      const isActivo = p.estado === "Activo" || p.estado === 1 || p.estado === "1";
      const esJuridica = p.tipoPersona === "Jurídica" || p.idTipoDocumento === 3 || p.tipoDocumento === "NIT";
      const docLabel = esJuridica ? "NIT" : "CC";
      const tipoPersonaStr = esJuridica ? "Jurídica Juridica Persona Jurídica" : "Natural Persona Natural";

      const hasDesc = Boolean((p.descripcion || p.observaciones) && String(p.descripcion || p.observaciones).trim());
      const descText = hasDesc ? `${p.descripcion || ""} ${p.observaciones || ""} con_descripcion con descripcion` : "sin_descripcion sin descripcion";

      const hasTel = Boolean((p.telefono || p.celular) && String(p.telefono || p.celular).trim() && p.telefono !== "N/A");
      const telText = hasTel ? `${p.telefono || ""} ${p.celular || ""} con_telefono con telefono` : "sin_telefono sin telefono";

      const hasEmail = Boolean((p.email || p.correo) && String(p.email || p.correo).trim() && p.email !== "N/A");
      const emailText = hasEmail ? `${p.email || ""} ${p.correo || ""} con_correo con correo con_email con email` : "sin_correo sin correo sin_email sin email";

      const hasContacto = Boolean((p.contacto || p.nombreContacto) && String(p.contacto || p.nombreContacto).trim() && p.contacto !== "N/A");
      const contactoText = hasContacto ? `${p.contacto || ""} ${p.nombreContacto || ""} con_contacto con contacto` : "sin_contacto sin contacto";

      const hasDireccion = Boolean(p.direccion && String(p.direccion).trim() && p.direccion !== "N/A");
      const direccionText = hasDireccion ? `${p.direccion} con_direccion con direccion` : "sin_direccion sin direccion";

      const clasifArr = Array.isArray(p.clasificacion) ? p.clasificacion : Array.isArray(p.tiposProveedor) ? p.tiposProveedor : [];
      const clasifText = clasifArr.join(" ");

      const matchSearch = matchesSmartSearch(
        [
          p.nombre,
          p.nit,
          p.numeroDocumento,
          p.documento,
          docLabel,
          `${docLabel}: ${p.nit || p.numeroDocumento || ""}`,
          p.contacto,
          p.nombreContacto,
          contactoText,
          p.email,
          p.correo,
          emailText,
          p.telefono,
          p.celular,
          telText,
          p.direccion,
          direccionText,
          p.tipoProveedor,
          p.tipoProveedorNombre,
          clasifText,
          p.tipoPersona,
          tipoPersonaStr,
          formatStatusTokens(p.estado),
          p.id,
          p.idProveedor,
          `#${p.id || p.idProveedor}`,
          p.descripcion,
          p.observaciones,
          descText
        ],
        searchTerm
      );

      const matchEstadoFiltro =
        filterEstado === "Todos" ||
        (filterEstado === "Activo" && isActivo) ||
        (filterEstado === "Inactivo" && !isActivo);

      const matchEstado = !hasSearch ? matchEstadoFiltro : true;
      const matchTipo = !hasSearch ? (filterTipo === "Todos" || p.tipoPersona === filterTipo || (filterTipo === "Jurídica" && esJuridica) || (filterTipo === "Natural" && !esJuridica)) : true;
      return matchSearch && matchEstado && matchTipo;
    });

    if (!hasSearch) {
      return baseFiltered;
    }

    return rankSearchResults(baseFiltered, searchTerm, (p, normQuery, tokens) => {
      let extra = 0;
      const esJuridica = p.tipoPersona === "Jurídica" || p.idTipoDocumento === 3 || p.tipoDocumento === "NIT";

      // Coincidencia con NIT o documento exacto
      const nitStr = normalizeSearchText(p.nit || p.numeroDocumento || p.documento || "");
      if (nitStr) {
        if (nitStr === normQuery) extra += 1500;
        else if (nitStr.startsWith(normQuery)) extra += 800;
        else if (nitStr.includes(normQuery)) extra += 400;
      }

      // Coincidencia con contacto
      const contactoStr = normalizeSearchText(p.contacto || p.nombreContacto || "");
      if (contactoStr) {
        if (contactoStr === normQuery) extra += 1000;
        else if (contactoStr.startsWith(normQuery)) extra += 600;
        else if (contactoStr.includes(normQuery)) extra += 300;
      }

      // Tipo persona
      if (tokens.some((t) => t.includes("juridic"))) {
        if (esJuridica) extra += 900;
      } else if (tokens.some((t) => t === "natural")) {
        if (!esJuridica) extra += 900;
      }

      return extra;
    });
  }, [proveedores, searchTerm, filterEstado, filterTipo]);

  const createProveedor = async (data) => {
    try {
      await proveedoresService.createProveedor(data);
      notify.success("Proveedor creado", "El proveedor se registró exitosamente");
      await fetchProveedores();
      return true;
    } catch (err) {
      notify.error("Error", err.message || "No se pudo crear el proveedor");
      return false;
    }
  };

  const updateProveedor = async (id, data) => {
    try {
      await proveedoresService.updateProveedor(id, data);
      notify.success("Proveedor actualizado", "Se guardaron los cambios correctamente");
      await fetchProveedores();
      return true;
    } catch (err) {
      notify.error("Error", err.message || "No se pudo actualizar el proveedor");
      return false;
    }
  };

  // #68 – Inactivar / Activar proveedor desde la tabla llamando a PUT /proveedores/:id/estado
  const toggleEstadoProveedor = async (item) => {
    const id = item.id || item.idProveedor;
    const isActivo = item.estado === "Activo" || item.estado === 1;
    const nuevoEstado = isActivo ? "Inactivo" : "Activo";
    const confirmed = await notify.confirmAction(
      isActivo ? "¿Inactivar proveedor?" : "¿Activar proveedor?",
      isActivo
        ? `¿Estás seguro de que deseas inactivar a "${item.nombre}"? No estará disponible para nuevas compras hasta que sea activado nuevamente.`
        : `¿Deseas activar nuevamente a "${item.nombre}"? Volverá a estar disponible para nuevas compras.`,
      isActivo ? "Sí, inactivar" : "Sí, activar"
    );
    if (!confirmed) return false;
    try {
      await proveedoresService.toggleEstadoProveedor(id, nuevoEstado);
      await fetchProveedores();
      notify.success(
        nuevoEstado === "Activo" ? "Proveedor activado" : "Proveedor inactivado",
        `"${item.nombre}" ahora está ${nuevoEstado}.`
      );
      return true;
    } catch (err) {
      notify.error("Error al cambiar estado", err.message || "No se pudo actualizar el estado del proveedor");
      return false;
    }
  };

  const deleteProveedor = async (id, nombre, item = null) => {
    if (item?.tieneCompras || (item?.comprasCount && item.comprasCount > 0)) {
      notify.error(
        "Proveedor con compras",
        `No es posible eliminar al proveedor "${nombre}" porque tiene ${item.comprasCount} compra(s) registrada(s) en el sistema.`
      );
      return false;
    }

    const confirmed = await notify.confirmDelete(
      "¿Mover a la papelera?",
      `¿Deseas enviar a "${nombre}" a la papelera (inactivar)?`
    );
    if (!confirmed) return false;
    try {
      await proveedoresService.deleteProveedor(id);
      notify.success("Proveedor inactivado", `"${nombre}" fue movido a la papelera.`);
      await fetchProveedores();
      return true;
    } catch (err) {
      notify.error("Error al inactivar", err.response?.data?.mensaje || err.message || "No se pudo inactivar el proveedor");
      return false;
    }
  };

  const restoreProveedor = async (item) => {
    const id = item.id || item.idProveedor;
    const nombre = item.nombre;
    try {
      await proveedoresService.restoreProveedor(id);
      notify.success("Proveedor restaurado", `"${nombre}" volvió a estar activo.`);
      await fetchProveedores();
      return true;
    } catch (err) {
      try {
        await proveedoresService.updateProveedor(id, { ...item, estado: "Activo" });
        notify.success("Proveedor restaurado", `"${nombre}" volvió a estar activo.`);
        await fetchProveedores();
        return true;
      } catch (innerErr) {
        notify.error("Error al restaurar", innerErr.message || "No se pudo restaurar el proveedor");
        return false;
      }
    }
  };

  const deleteDefinitivoProveedor = async (id, nombre, item = null) => {
    if (item?.tieneCompras || (item?.comprasCount && item.comprasCount > 0)) {
      notify.error(
        "Proveedor con compras",
        `No es posible eliminar definitivamente al proveedor "${nombre}" porque tiene compras registradas en el sistema.`
      );
      return false;
    }

    const confirmed = await notify.confirmDelete(
      "¿Eliminar definitivamente?",
      `Esta acción eliminará permanentemente al proveedor "${nombre}" de la base de datos y no se podrá recuperar.`
    );
    if (!confirmed) return false;

    try {
      await proveedoresService.deletePermanenteProveedor(id);
      notify.success("Eliminado permanente", `El proveedor "${nombre}" fue eliminado por completo.`);
      await fetchProveedores();
      return true;
    } catch (err) {
      notify.error("Error al eliminar", err.response?.data?.mensaje || err.message || "No se pudo eliminar permanentemente");
      return false;
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
    proveedores,
    activosProveedores,
    papeleraProveedores,
    filteredProveedores,
    loading,
    searchTerm,
    setSearchTerm,
    filterEstado,
    setFilterEstado,
    filterTipo,
    setFilterTipo,
    eventos,
    unreadCount,
    refetch: fetchProveedores,
    createProveedor,
    updateProveedor,
    toggleEstadoProveedor,
    deleteProveedor,
    restoreProveedor,
    deleteDefinitivoProveedor,
    clearEventos,
    resetUnreadCount
  };
}
