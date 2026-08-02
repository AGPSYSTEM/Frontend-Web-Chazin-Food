import { useState, useEffect, useCallback } from "react";
import { proveedoresService } from "../servicios/proveedoresService";
import { useNotifications } from "@/shared/hooks/useNotifications";

export function useProveedores() {
  const notify = useNotifications();
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("Todos");
  const [filterTipo, setFilterTipo] = useState("Todos");

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

  const filteredProveedores = proveedores.filter((p) => {
    const matchSearch =
      searchTerm === "" ||
      p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nit?.includes(searchTerm) ||
      p.contacto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchTerm.toLowerCase());

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

  const deleteProveedor = async (id, nombre) => {
    const confirmed = await notify.confirmDelete(
      "¿Eliminar proveedor?",
      `¿Estás seguro de que deseas eliminar a "${nombre}"?`
    );
    if (!confirmed) return false;
    try {
      await proveedoresService.deleteProveedor(id);
      notify.success("Proveedor eliminado", "El proveedor fue eliminado");
      await fetchProveedores();
      return true;
    } catch (err) {
      notify.error("Error al eliminar", err.message || "No se pudo eliminar el proveedor");
      return false;
    }
  };

  const toggleEstadoProveedor = async (id, currentEstado) => {
    const nuevoEstado = currentEstado === "Activo" ? "Inactivo" : "Activo";
    try {
      await proveedoresService.toggleEstadoProveedor(id, nuevoEstado);
      notify.success("Estado actualizado", `El proveedor ahora está ${nuevoEstado.toLowerCase()}`);
      await fetchProveedores();
      return true;
    } catch (err) {
      notify.error("Error al cambiar estado", err.message || "No se pudo actualizar el estado del proveedor");
      return false;
    }
  };

  return {
    proveedores,
    filteredProveedores,
    loading,
    searchTerm,
    setSearchTerm,
    filterEstado,
    setFilterEstado,
    filterTipo,
    setFilterTipo,
    refetch: fetchProveedores,
    createProveedor,
    updateProveedor,
    deleteProveedor,
    toggleEstadoProveedor
  };
}
