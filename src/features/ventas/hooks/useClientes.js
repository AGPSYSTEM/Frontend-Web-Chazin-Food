import { useState, useEffect, useCallback, useMemo } from "react";
import { clientesService } from "../servicios/clientesService";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { matchClienteMultiCriteria } from "@/shared/utils/searchUtils";

export function useClientes() {
  const notify = useNotifications();
  const [clientes, setClientes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Criterios de búsqueda y filtrado multicriterio
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState("Todos");
  const [filterEstado, setFilterEstado] = useState("Todos");
  const [comprasMin, setComprasMin] = useState("");
  const [montoMin, setMontoMin] = useState("");
  const [montoMax, setMontoMax] = useState("");

  const fetchClientes = useCallback(async () => {
    try {
      setLoading(true);
      const [data, statsData] = await Promise.all([
        clientesService.getClientes(),
        clientesService.getStats().catch(() => null)
      ]);
      setClientes(data || []);
      setStats(statsData);
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

  // Filtrado multicriterio exhaustivo
  const filteredClientes = useMemo(() => {
    const criteria = {
      searchTerm,
      filterTipo,
      filterEstado,
      comprasMin,
      montoMin,
      montoMax
    };

    return clientes.filter((c) => matchClienteMultiCriteria(c, criteria));
  }, [clientes, searchTerm, filterTipo, filterEstado, comprasMin, montoMin, montoMax]);

  const clearAllFilters = useCallback(() => {
    setSearchTerm("");
    setFilterTipo("Todos");
    setFilterEstado("Todos");
    setComprasMin("");
    setMontoMin("");
    setMontoMax("");
  }, []);

  const hasActiveFilters = useMemo(() => {
    return (
      searchTerm.trim() !== "" ||
      filterTipo !== "Todos" ||
      filterEstado !== "Todos" ||
      comprasMin !== "" ||
      montoMin !== "" ||
      montoMax !== ""
    );
  }, [searchTerm, filterTipo, filterEstado, comprasMin, montoMin, montoMax]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchTerm.trim() !== "") count++;
    if (filterTipo !== "Todos") count++;
    if (filterEstado !== "Todos") count++;
    if (comprasMin !== "") count++;
    if (montoMin !== "" || montoMax !== "") count++;
    return count;
  }, [searchTerm, filterTipo, filterEstado, comprasMin, montoMin, montoMax]);

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

  const deleteCliente = async (id, nombre, comprasCount = 0) => {
    // Si tiene ventas asociadas, se bloquea la eliminación totalmente para proteger los registros contables
    if (comprasCount > 0) {
      notify.warning(
        "No se puede eliminar",
        `El cliente "${nombre}" cuenta con ${comprasCount} ${comprasCount === 1 ? 'venta asociada' : 'ventas asociadas'}. Por integridad contable, solo puedes cambiar su estado a Inactivo.`
      );
      return false;
    }

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
    stats,
    loading,
    searchTerm,
    setSearchTerm,
    filterTipo,
    setFilterTipo,
    filterEstado,
    setFilterEstado,
    comprasMin,
    setComprasMin,
    montoMin,
    setMontoMin,
    montoMax,
    setMontoMax,
    clearAllFilters,
    hasActiveFilters,
    activeFiltersCount,
    refetch: fetchClientes,
    createCliente,
    updateCliente,
    deleteCliente
  };
}
