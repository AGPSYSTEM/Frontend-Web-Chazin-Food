import { useState, useEffect, useCallback } from "react";
import { rolesService } from "../services/rolesService";
import { useNotifications } from "@/shared/hooks/useNotifications";

export function useRoles() {
  const { success, error: notifError, confirmDelete } = useNotifications();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      const data = await rolesService.getRoles();
      setRoles(data || []);
    } catch (err) {
      console.error(err);
      notifError("Error", err.message || "Error al cargar los roles");
    } finally {
      setLoading(false);
    }
  }, [notifError]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const filteredRoles = roles.filter(
    (r) =>
      searchTerm.trim() === "" ||
      r.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const createRol = async (nombre, descripcion) => {
    try {
      await rolesService.createRol({ nombre, descripcion, estado: "Activo" });
      success("Éxito", "Rol creado correctamente");
      await fetchRoles();
      return true;
    } catch (err) {
      notifError("Error", err.message || "Error al crear el rol");
      return false;
    }
  };

  const updateRol = async (id, nombre, descripcion) => {
    try {
      await rolesService.updateRol(id, { nombre, descripcion });
      success("Éxito", "Rol actualizado correctamente");
      await fetchRoles();
      return true;
    } catch (err) {
      notifError("Error", err.message || "Error al actualizar el rol");
      return false;
    }
  };

  const updatePermisos = async (id, permisos) => {
    try {
      await rolesService.updatePermisos(id, permisos);
      success("Éxito", "Permisos actualizados correctamente");
      await fetchRoles();
      return true;
    } catch (err) {
      notifError("Error", err.message || "Error al actualizar permisos");
      return false;
    }
  };

  const toggleEstadoRol = async (id) => {
    const rolActual = roles.find((r) => r.id === id);
    if (!rolActual) return;
    const nuevoEstado = rolActual.estado === "Activo" ? "Inactivo" : "Activo";
    try {
      await rolesService.updateRol(id, { estado: nuevoEstado });
      success("Estado Cambiado", `El rol ahora está ${nuevoEstado}`);
      await fetchRoles();
      return true;
    } catch (err) {
      notifError("Error", err.message || "Error al cambiar el estado del rol");
      return false;
    }
  };

  return {
    roles,
    filteredRoles,
    loading,
    searchTerm,
    setSearchTerm,
    refetch: fetchRoles,
    createRol,
    updateRol,
    updatePermisos,
    toggleEstadoRol
  };
}
