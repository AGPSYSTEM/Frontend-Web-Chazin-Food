import { useState, useEffect, useCallback, useMemo } from "react";
import { ventasService } from "../servicios/ventasService";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { matchVentaMultiCriteria } from "@/shared/utils/searchUtils";

export function useGestionVentas() {
  const notify = useNotifications();
  const [ventas, setVentas] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Criterios de búsqueda y filtrado multicriterio
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("Todos");
  const [selectedPeriod, setSelectedPeriod] = useState("personalizado");
  const [filterFecha, setFilterFecha] = useState("");
  const [filterFechaInicio, setFilterFechaInicio] = useState("");
  const [filterFechaFin, setFilterFechaFin] = useState("");
  const [filterMetodoPago, setFilterMetodoPago] = useState("Todos");
  const [filterOrigen, setFilterOrigen] = useState("Todos");
  const [filterTipoEntrega, setFilterTipoEntrega] = useState("Todos");
  const [filterFidelidad, setFilterFidelidad] = useState("Todos");
  const [montoMin, setMontoMin] = useState("");
  const [montoMax, setMontoMax] = useState("");

  const fetchVentas = useCallback(async () => {
    try {
      setLoading(true);
      const [data, statsData] = await Promise.all([
        ventasService.getVentas({ periodo: selectedPeriod }),
        ventasService.getStats(selectedPeriod).catch(() => null)
      ]);
      setVentas(data || []);
      setStats(statsData);
    } catch (err) {
      console.error(err);
      notify.error("Error", err.message || "Error al cargar historial de ventas");
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    fetchVentas();
  }, [fetchVentas]);

  // Filtrado multicriterio exhaustivo en tiempo real
  const filteredVentas = useMemo(() => {
    const criteria = {
      searchTerm,
      filterEstado,
      filterFecha,
      filterFechaInicio,
      filterFechaFin,
      filterMetodoPago,
      filterOrigen,
      filterTipoEntrega,
      filterFidelidad,
      montoMin,
      montoMax
    };

    return ventas.filter((v) => matchVentaMultiCriteria(v, criteria));
  }, [
    ventas,
    searchTerm,
    filterEstado,
    filterFecha,
    filterFechaInicio,
    filterFechaFin,
    filterMetodoPago,
    filterOrigen,
    filterTipoEntrega,
    filterFidelidad,
    montoMin,
    montoMax
  ]);

  const clearAllFilters = useCallback(() => {
    setSearchTerm("");
    setFilterEstado("Todos");
    setFilterFecha("");
    setFilterFechaInicio("");
    setFilterFechaFin("");
    setFilterMetodoPago("Todos");
    setFilterOrigen("Todos");
    setFilterTipoEntrega("Todos");
    setFilterFidelidad("Todos");
    setMontoMin("");
    setMontoMax("");
  }, []);

  const hasActiveFilters = useMemo(() => {
    return (
      searchTerm.trim() !== "" ||
      filterEstado !== "Todos" ||
      filterFecha !== "" ||
      filterFechaInicio !== "" ||
      filterFechaFin !== "" ||
      filterMetodoPago !== "Todos" ||
      filterOrigen !== "Todos" ||
      filterTipoEntrega !== "Todos" ||
      filterFidelidad !== "Todos" ||
      montoMin !== "" ||
      montoMax !== ""
    );
  }, [
    searchTerm,
    filterEstado,
    filterFecha,
    filterFechaInicio,
    filterFechaFin,
    filterMetodoPago,
    filterOrigen,
    filterTipoEntrega,
    filterFidelidad,
    montoMin,
    montoMax
  ]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchTerm.trim() !== "") count++;
    if (filterEstado !== "Todos") count++;
    if (filterFecha !== "") count++;
    if (filterFechaInicio !== "" || filterFechaFin !== "") count++;
    if (filterMetodoPago !== "Todos") count++;
    if (filterOrigen !== "Todos") count++;
    if (filterTipoEntrega !== "Todos") count++;
    if (filterFidelidad !== "Todos") count++;
    if (montoMin !== "" || montoMax !== "") count++;
    return count;
  }, [
    searchTerm,
    filterEstado,
    filterFecha,
    filterFechaInicio,
    filterFechaFin,
    filterMetodoPago,
    filterOrigen,
    filterTipoEntrega,
    filterFidelidad,
    montoMin,
    montoMax
  ]);

  const createVenta = async (data) => {
    try {
      await ventasService.createVenta(data);
      notify.success("Venta registrada", "La venta fue procesada exitosamente");
      await fetchVentas();
      return true;
    } catch (err) {
      notify.error("Error", err.message || "Error al registrar la venta");
      return false;
    }
  };

  const updateEstado = async (id, nuevoEstado) => {
    try {
      await ventasService.updateEstadoVenta(id, nuevoEstado);
      notify.success("Estado actualizado", `La venta pasó a estado ${nuevoEstado}`);
      await fetchVentas();
      return true;
    } catch (err) {
      notify.error("Error", err.message || "Error al actualizar estado");
      return false;
    }
  };

  const cancelarVenta = async (id) => {
    const confirmed = await notify.confirmAction(
      "¿Anular venta?",
      "¿Estás seguro de que deseas anular esta factura de venta?",
      "Sí, anular"
    );
    if (!confirmed) return false;
    try {
      await ventasService.cancelarVenta(id);
      notify.success("Venta anulada", "La venta ha sido anulada");
      await fetchVentas();
      return true;
    } catch (err) {
      notify.error("Error", err.message || "Error al anular la venta");
      return false;
    }
  };

  const updateTiempoEntrega = async (id, tiempoEstimado) => {
    try {
      await ventasService.updateTiempoEntrega(id, tiempoEstimado);
      notify.success("Tiempo estimado actualizado", `El tiempo de entrega/recogida se fijó en ${tiempoEstimado}`);
      await fetchVentas();
      return true;
    } catch (err) {
      notify.error("Error", err.message || "Error al actualizar tiempo estimado");
      return false;
    }
  };

  const aprobarPago = async (id) => {
    try {
      await ventasService.aprobarPago(id);
      notify.success("Pago Aprobado", "El pago ha sido aprobado y la comanda avanzó automáticamente a cocina.");
      await fetchVentas();
      return true;
    } catch (err) {
      notify.error("Error", err.message || "Error al aprobar el pago");
      return false;
    }
  };

  return {
    ventas,
    filteredVentas,
    stats,
    loading,
    searchTerm,
    setSearchTerm,
    filterEstado,
    setFilterEstado,
    selectedPeriod,
    setSelectedPeriod,
    filterFecha,
    setFilterFecha,
    filterFechaInicio,
    setFilterFechaInicio,
    filterFechaFin,
    setFilterFechaFin,
    filterMetodoPago,
    setFilterMetodoPago,
    filterOrigen,
    setFilterOrigen,
    filterTipoEntrega,
    setFilterTipoEntrega,
    filterFidelidad,
    setFilterFidelidad,
    montoMin,
    setMontoMin,
    montoMax,
    setMontoMax,
    clearAllFilters,
    hasActiveFilters,
    activeFiltersCount,
    refetch: fetchVentas,
    createVenta,
    updateEstado,
    updateTiempoEntrega,
    cancelarVenta,
    aprobarPago
  };
}
