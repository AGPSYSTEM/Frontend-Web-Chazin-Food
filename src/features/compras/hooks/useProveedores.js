import { useState, useEffect, useCallback } from "react";
import { proveedoresService } from "../servicios/proveedoresService";
import { useNotifications } from "@/shared/hooks/useNotifications";

const INITIAL_EVENTOS = [
  {
    id: 1,
    tipo: "Creado",
    nombre: "Distribuidora Avícola S.A.S.",
    descripcion: "Se registró el proveedor en el sistema.",
    fecha: "23/07/2026 06:35"
  },
  {
    id: 2,
    tipo: "Editado",
    nombre: "Lácteos del Valle",
    descripcion: "Se actualizaron los datos de contacto del proveedor.",
    fecha: "23/07/2026 06:40"
  }
];

export function useProveedores() {
  const notify = useNotifications();
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("Todos");

  // Traceability & Trash Bin State with localStorage persistence
  const [eventos, setEventos] = useState(() => {
    try {
      const saved = localStorage.getItem("proveedores_trazabilidad_eventos");
      return saved ? JSON.parse(saved) : INITIAL_EVENTOS;
    } catch {
      return INITIAL_EVENTOS;
    }
  });

  const [unreadCount, setUnreadCount] = useState(() => {
    try {
      const saved = localStorage.getItem("proveedores_trazabilidad_unread");
      return saved ? JSON.parse(saved) : 1;
    } catch {
      return 1;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("proveedores_trazabilidad_eventos", JSON.stringify(eventos));
    } catch {}
  }, [eventos]);

  useEffect(() => {
    try {
      localStorage.setItem("proveedores_trazabilidad_unread", JSON.stringify(unreadCount));
    } catch {}
  }, [unreadCount]);

  const fetchProveedores = useCallback(async () => {
    try {
      setLoading(true);
      const data = await proveedoresService.getProveedores();
      setProveedores(data || []);
    } catch (err) {
      console.error(err);
      notify.error("Error", err.message || "Error al cargar proveedores");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProveedores();
  }, [fetchProveedores]);

  const addTraceabilityEvent = (tipo, nombre, descripcion) => {
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, "0")}/${String(
      now.getMonth() + 1
    ).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(
      2,
      "0"
    )}:${String(now.getMinutes()).padStart(2, "0")}`;

    const newEv = {
      id: Date.now(),
      tipo,
      nombre,
      descripcion,
      fecha: formattedDate
    };

    setEventos((prev) => [newEv, ...prev]);
    setUnreadCount((prev) => prev + 1);
  };

  // Active suppliers (estado === "Activo" or estado === 1)
  const activosProveedores = proveedores.filter((p) => p.estado === "Activo" || p.estado === 1);

  // Inactive / Trash suppliers (estado === "Inactivo" or estado === 0)
  const papeleraProveedores = proveedores.filter((p) => p.estado === "Inactivo" || p.estado === 0);

  const filteredProveedores = proveedores.filter((p) => {
    const matchSearch =
      searchTerm === "" ||
      p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nit?.includes(searchTerm) ||
      p.numeroDocumento?.includes(searchTerm) ||
      p.contacto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nombreContacto?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchEstado = filterEstado === "Todos" || p.estado === filterEstado;
    return matchSearch && matchEstado;
  });

  const createProveedor = async (data) => {
    try {
      await proveedoresService.createProveedor(data);
      notify.success("Proveedor creado", "El proveedor se registró exitosamente");
      addTraceabilityEvent(
        "Creado",
        data.nombre,
        `Se registró el nuevo proveedor: ${data.nombre}`
      );
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
      addTraceabilityEvent(
        "Editado",
        data.nombre,
        `Se actualizaron los datos del proveedor: ${data.nombre}`
      );
      await fetchProveedores();
      return true;
    } catch (err) {
      notify.error("Error", err.message || "No se pudo actualizar el proveedor");
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
      addTraceabilityEvent(
        "Eliminado",
        nombre,
        `Se inactivó y envió a la papelera el proveedor: ${nombre}`
      );
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
      addTraceabilityEvent(
        "Restaurado",
        nombre,
        `Se restauró de la papelera el proveedor: ${nombre}`
      );
      await fetchProveedores();
      return true;
    } catch (err) {
      // Fallback: if server endpoint not reachable, update local estado
      try {
        await proveedoresService.updateProveedor(id, { ...item, estado: "Activo" });
        notify.success("Proveedor restaurado", `"${nombre}" volvió a estar activo.`);
        addTraceabilityEvent(
          "Restaurado",
          nombre,
          `Se restauró de la papelera el proveedor: ${nombre}`
        );
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
      addTraceabilityEvent(
        "Eliminado",
        nombre,
        `Se eliminó permanentemente el proveedor: ${nombre}`
      );
      await fetchProveedores();
      return true;
    } catch (err) {
      notify.error("Error al eliminar", err.message || "No se pudo eliminar permanentemente");
      return false;
    }
  };

  const clearEventos = () => {
    setEventos([]);
    notify.success("Trazabilidad limpia", "Se borró el historial de eventos.");
  };

  const resetUnreadCount = () => {
    setUnreadCount(0);
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
    eventos,
    unreadCount,
    refetch: fetchProveedores,
    createProveedor,
    updateProveedor,
    deleteProveedor,
    restoreProveedor,
    deleteDefinitivoProveedor,
    clearEventos,
    resetUnreadCount
  };
}
