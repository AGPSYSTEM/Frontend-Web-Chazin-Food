import { useState, useEffect, useCallback } from "react";
import { produccionService } from "../servicios/produccionService";
import { useNotifications } from "@/shared/hooks/useNotifications";

export function useGestionProduccion() {
  const notify = useNotifications();
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("Todos");
  const [filterPrioridad, setFilterPrioridad] = useState("Todas");

  const fetchOrdenes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await produccionService.getOrdenes();
      setOrdenes(data || []);
    } catch (err) {
      console.error(err);
      notify.error("Error", err.message || "Error al cargar órdenes de producción");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrdenes();
  }, [fetchOrdenes]);

  const filteredOrdenes = ordenes.filter((o) => {
    const term = searchTerm.trim().toLowerCase();
    const matchSearch =
      !term ||
      o.codigo?.toLowerCase().includes(term) ||
      o.platilloNombre?.toLowerCase().includes(term) ||
      o.responsable?.toLowerCase().includes(term) ||
      o.cocinero?.toLowerCase().includes(term);

    const matchEstado = filterEstado === "Todos" || o.estado === filterEstado;
    const matchPrioridad = filterPrioridad === "Todas" || o.prioridad === filterPrioridad;

    return matchSearch && matchEstado && matchPrioridad;
  });

  const createOrden = async (data) => {
    try {
      await produccionService.createOrden(data);
      notify.success("Orden Creada", "Orden de producción registrada con éxito");
      await fetchOrdenes();
      return true;
    } catch (err) {
      notify.error("Error", err.message || "Error al registrar la orden");
      return false;
    }
  };

  const updateEstado = async (id, nuevoEstado) => {
    try {
      await produccionService.updateEstadoOrden(id, nuevoEstado);
      notify.success("Estado Actualizado", `La orden pasó a estado "${nuevoEstado}"`);
      await fetchOrdenes();
      return true;
    } catch (err) {
      notify.error("Error", err.message || "Error al actualizar estado");
      return false;
    }
  };

  const deleteOrden = async (id) => {
    try {
      await produccionService.deleteOrden(id);
      notify.success("Orden Eliminada", "La orden fue eliminada de producción");
      await fetchOrdenes();
      return true;
    } catch (err) {
      notify.error("Error", err.message || "Error al eliminar orden");
      return false;
    }
  };

  return {
    ordenes,
    filteredOrdenes,
    loading,
    searchTerm,
    setSearchTerm,
    filterEstado,
    setFilterEstado,
    filterPrioridad,
    setFilterPrioridad,
    refetch: fetchOrdenes,
    createOrden,
    updateEstado,
    deleteOrden
  };
}
