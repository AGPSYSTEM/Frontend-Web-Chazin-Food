import { useState, useEffect, useCallback } from "react";
import { ventasService } from "../services/ventasService";
import { useNotifications } from "@/shared/hooks/useNotifications";

export function useGestionVentas() {
  const notify = useNotifications();
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("Todos");

  const fetchVentas = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ventasService.getVentas();
      setVentas(data || []);
    } catch (err) {
      console.error(err);
      notify.error("Error", err.message || "Error al cargar historial de ventas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVentas();
  }, [fetchVentas]);

  const filteredVentas = ventas.filter((v) => {
    const matchSearch =
      searchTerm === "" ||
      v.numeroVenta?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.clienteNombre?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchEstado = filterEstado === "Todos" || v.estado === filterEstado;
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
    loading,
    searchTerm,
    setSearchTerm,
    filterEstado,
    setFilterEstado,
    refetch: fetchVentas,
    createVenta,
    updateEstado,
    cancelarVenta
  };
}
