import { useState, useEffect, useCallback } from "react";
import { clientesService } from "../services/clientesService";
import { useNotifications } from "@/shared/hooks/useNotifications";

export function useClientes() {
  const notify = useNotifications();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("Todos");

  const fetchClientes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await clientesService.getClientes();
      setClientes(data || []);
    } catch (err) {
      console.error(err);
      notify.error("Error", err.message || "Error al cargar lista de clientes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  const filteredClientes = clientes.filter((c) => {
    const matchSearch =
      searchTerm === "" ||
      c.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.apellidos?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.documento?.includes(searchTerm);

    const matchEstado = filterEstado === "Todos" || c.estado === filterEstado;
    return matchSearch && matchEstado;
  });

  const createCliente = async (data) => {
    try {
      await clientesService.createCliente(data);
      notify.success("Cliente registrado", "El cliente fue registrado exitosamente");
      await fetchClientes();
      return true;
    } catch (err) {
      notify.error("Error", err.message || "No se pudo registrar al cliente");
      return false;
    }
  };

  const updateCliente = async (id, data) => {
    try {
      await clientesService.updateCliente(id, data);
      notify.success("Cliente actualizado", "Los datos fueron actualizados correctamente");
      await fetchClientes();
      return true;
    } catch (err) {
      notify.error("Error", err.message || "No se pudo actualizar el cliente");
      return false;
    }
  };

  const deleteCliente = async (id, nombre) => {
    const confirmed = await notify.confirmDelete(
      "¿Eliminar cliente?",
      `¿Estás seguro de que deseas eliminar a "${nombre}"?`
    );
    if (!confirmed) return false;
    try {
      await clientesService.deleteCliente(id);
      notify.success("Cliente eliminado", "El cliente ha sido eliminado");
      await fetchClientes();
      return true;
    } catch (err) {
      notify.error("Error", err.message || "No se pudo eliminar al cliente");
      return false;
    }
  };

  return {
    clientes,
    filteredClientes,
    loading,
    searchTerm,
    setSearchTerm,
    filterEstado,
    setFilterEstado,
    refetch: fetchClientes,
    createCliente,
    updateCliente,
    deleteCliente
  };
}
