import { useState, useEffect, useCallback } from "react";
import { proveedoresService } from "../servicios/proveedoresService";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { apiClient } from "@/shared/api/apiClient";

export function useProveedores() {
  const notify = useNotifications();
  const [proveedores, setProveedores] = useState([]);
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
      const data = await proveedoresService.getProveedores();
      setProveedores(data || []);
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

  // Inactive / Trash suppliers (estado === "Inactivo" or estado === 0)
  const papeleraProveedores = proveedores.filter((p) => p.estado === "Inactivo" || p.estado === 0);

  const normalize = (str) =>
    String(str || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const filteredProveedores = proveedores.filter((p) => {
    const term = normalize(searchTerm);
    const matchSearch =
      !term ||
      normalize(p.nombre).includes(term) ||
      normalize(p.nit).includes(term) ||
      normalize(p.numeroDocumento).includes(term) ||
      normalize(p.contacto).includes(term) ||
      normalize(p.nombreContacto).includes(term) ||
      normalize(p.email).includes(term) ||
      normalize(p.correo).includes(term) ||
      normalize(p.telefono).includes(term) ||
      normalize(p.direccion).includes(term) ||
      normalize(p.tipoProveedor).includes(term) ||
      normalize(p.tipoPersona).includes(term) ||
      (p.estado === "Activo" || p.estado === 1 ? "activo" : "inactivo").includes(term);

    const matchEstado = filterEstado === "Todos" || p.estado === filterEstado;
    const matchTipo = filterTipo === "Todos" || p.tipoPersona === filterTipo;
    return matchSearch && matchEstado && matchTipo;
  });

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

  // #68 – Inactivar / Activar proveedor desde la tabla
  const toggleEstadoProveedor = async (item) => {
    const id = item.id || item.idProveedor;
    const isActivo = item.estado === "Activo" || item.estado === 1;
    const nuevoEstado = isActivo ? "Inactivo" : "Activo";
    try {
      await proveedoresService.updateProveedor(id, { ...item, estado: nuevoEstado });
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

  const deleteProveedor = async (id, nombre) => {
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
      notify.error("Error al inactivar", err.message || "No se pudo inactivar el proveedor");
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

  const deleteDefinitivoProveedor = async (id, nombre) => {
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
      notify.error("Error al eliminar", err.message || "No se pudo eliminar permanentemente");
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

