import { useState, useEffect, useCallback } from "react";
import { comprasService } from "../services/comprasService";
import { useNotifications } from "@/shared/hooks/useNotifications";

export function useGestionCompras() {
  const notify = useNotifications();
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("Todos");

  const fetchCompras = useCallback(async () => {
    try {
      setLoading(true);
      const data = await comprasService.getCompras();
      setCompras(data || []);
    } catch (err) {
      console.error(err);
      notify.error("Error", err.message || "Error al cargar las compras");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompras();
  }, [fetchCompras]);

  const filteredCompras = compras.filter((c) => {
    const matchSearch =
      searchTerm === "" ||
      c.numeroFactura?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.proveedorNombre?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchEstado = filterEstado === "Todos" || c.estado === filterEstado;
    return matchSearch && matchEstado;
  });

  const createCompra = async (data) => {
    try {
      await comprasService.createCompra(data);
      notify.success("Compra registrada", "La orden de compra se creó exitosamente");
      await fetchCompras();
      return true;
    } catch (err) {
      notify.error("Error", err.message || "No se pudo registrar la compra");
      return false;
    }
  };

  const updateEstado = async (id, nuevoEstado) => {
    try {
      await comprasService.updateEstadoCompra(id, nuevoEstado);
      notify.success("Estado actualizado", `La compra ahora está ${nuevoEstado}`);
      await fetchCompras();
      return true;
    } catch (err) {
      notify.error("Error", err.message || "No se pudo actualizar el estado");
      return false;
    }
  };

  const cancelarCompra = async (id) => {
    const confirmed = await notify.confirmAction(
      "¿Anular compra?",
      "¿Estás seguro de que deseas anular esta orden de compra?",
      "Sí, anular"
    );
    if (!confirmed) return false;
    try {
      await comprasService.cancelarCompra(id);
      notify.success("Compra anulada", "La compra fue anulada correctamente");
      await fetchCompras();
      return true;
    } catch (err) {
      notify.error("Error", err.message || "No se pudo anular la compra");
      return false;
    }
  };

  return {
    compras,
    filteredCompras,
    loading,
    searchTerm,
    setSearchTerm,
    filterEstado,
    setFilterEstado,
    refetch: fetchCompras,
    createCompra,
    updateEstado,
    cancelarCompra
  };
}
