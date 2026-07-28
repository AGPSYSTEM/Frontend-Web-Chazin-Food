import { useState, useEffect, useCallback } from "react";
import { produccionService } from "../servicios/produccionService";
import { useNotifications } from "@/shared/hooks/useNotifications";

export function useGestionProduccion() {
  const notify = useNotifications();
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("Todos");

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
    const matchSearch =
      searchTerm === "" ||
      o.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.platilloNombre?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchEstado = filterEstado === "Todos" || o.estado === filterEstado;
    return matchSearch && matchEstado;
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
      notify.success("Estado Actualizado", `La orden pasó a estado ${nuevoEstado}`);
      await fetchOrdenes();
      return true;
    } catch (err) {
      notify.error("Error", err.message || "Error al actualizar estado");
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
    refetch: fetchOrdenes,
    createOrden,
    updateEstado
  };
}
