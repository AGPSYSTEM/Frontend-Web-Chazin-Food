import { useState, useEffect, useCallback } from "react";
import { ventasService } from "../servicios/ventasService";
import { useNotifications } from "@/shared/hooks/useNotifications";

export function useGestionVentas() {
  const notify = useNotifications();
  const [ventas, setVentas] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("Todos");
  const [selectedPeriod, setSelectedPeriod] = useState("7_dias");

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

  const filteredVentas = ventas.filter((v) => {
    const clientName = typeof v.cliente === 'string' ? v.cliente : (v.clienteNombre || "");
    const numVenta = v.numeroVenta || `VEN-${String(v.id || '').padStart(4, "0")}`;
    const matchSearch =
      searchTerm === "" ||
      numVenta.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(v.id).includes(searchTerm) ||
      clientName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchEstado =
      filterEstado === "Todos" ||
      v.estado === filterEstado ||
      v.estadoEntrega === filterEstado ||
      (filterEstado === "Pendiente" && (v.estado === "Pendiente" || v.estadoEntrega === "PENDIENTE")) ||
      (filterEstado === "En Preparación" && (v.estado === "En Preparación" || v.estadoEntrega === "PREPARANDO")) ||
      (filterEstado === "Completada" && (v.estado === "Completada" || v.estadoEntrega === "ENTREGADO" || v.estadoEntrega === "LISTO")) ||
      (filterEstado === "Anulada" && (v.estado === "Anulada" || v.estadoEntrega === "CANCELADO"));

    return matchSearch && matchEstado;
  });

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
    refetch: fetchVentas,
    createVenta,
    updateEstado,
    cancelarVenta
  };
}

