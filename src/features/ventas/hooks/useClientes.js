import { useState, useEffect, useCallback } from "react";
import { clientesService } from "../servicios/clientesService";
import { useNotifications } from "@/shared/hooks/useNotifications";

export function useClientes() {
  const notify = useNotifications();
  const [clientes, setClientes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("Todos");

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

  const filteredClientes = clientes.filter((c) => {
    const term = (searchTerm || "").trim().toLowerCase();
    
    let matchSearch = true;
    if (term !== "") {
      const idStr = String(c.id || c.idCliente || "");
      const idHashStr = `#${idStr}`;
      const nombre = (c.nombre || "").toLowerCase();
      const apellidos = (c.apellidos || "").toLowerCase();
      const nombreCompleto = `${nombre} ${apellidos}`.trim();
      const email = (c.email || "").toLowerCase();
      const rawTelefono = String(c.telefono || "").toLowerCase();
      const cleanTelefono = rawTelefono.replace(/\D/g, "");
      const cleanTermPhone = term.replace(/\D/g, "");
      const doc = String(c.documento || "").toLowerCase();
      const cleanDoc = doc.replace(/\D/g, "");
      const direccion = String(c.direccion || "").toLowerCase();
      const comprasCount = String(c.compras ?? 0);

      // Total consumido parsing (raw number, formatted, with/without '$' and dots)
      const rawTotalStr = String(c.totalConsumido || c.totalGastado || "").toLowerCase();
      const totalNumFromStr = Number(rawTotalStr.replace(/[^\d]/g, "")) || 0;
      const totalNum = Number(c.totalConsumidoRaw || c.totalGastadoRaw) || totalNumFromStr;
      const totalStr = String(totalNum);
      const totalFormatted = `$${totalNum.toLocaleString("es-CO")}`.toLowerCase();
      const totalFormattedNoDollar = totalNum.toLocaleString("es-CO").toLowerCase();
      const cleanTermNumber = term.replace(/[$. ]/g, "");

      // Fidelidad tier: VIP, Frecuente, Regular (handling "irregular"), Nuevo
      const clientTipo = c.tipo || (c.esVip ? "VIP" : "Nuevo");
      const rawTipo = clientTipo.toLowerCase();
      const isIrregularSearch = term === "irregular" || term.includes("irregular");
      const matchTipo = rawTipo.includes(term) || (isIrregularSearch && rawTipo.includes("regular"));

      // Estado: Activo / Inactivo
      const rawEstado = String(c.estado || (c.activo === false ? "Inactivo" : "Activo")).toLowerCase();
      const matchEstadoSearch = rawEstado.includes(term);

      // Compras match: exact match on number or e.g. "3 compras"
      const matchCompras =
        comprasCount === term ||
        term === `${comprasCount} compras` ||
        term === `${comprasCount} compra`;

      matchSearch =
        idStr === term ||
        idHashStr === term ||
        idStr.includes(term) ||
        nombreCompleto.includes(term) ||
        email.includes(term) ||
        (cleanTermPhone.length > 0 && cleanTelefono.includes(cleanTermPhone)) ||
        rawTelefono.includes(term) ||
        doc.includes(term) ||
        (cleanTermPhone.length > 0 && cleanDoc.includes(cleanTermPhone)) ||
        direccion.includes(term) ||
        matchCompras ||
        (cleanTermNumber.length > 0 && totalStr.includes(cleanTermNumber)) ||
        totalFormatted.includes(term) ||
        totalFormattedNoDollar.includes(term) ||
        rawTotalStr.includes(term) ||
        matchTipo ||
        matchEstadoSearch;
    }

    const clientTipo = c.tipo || (c.esVip ? "VIP" : "Nuevo");

    const matchEstado =
      filterEstado === "Todos" ||
      clientTipo.toLowerCase() === filterEstado.toLowerCase() ||
      c.estado === filterEstado;

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
    filterEstado,
    setFilterEstado,
    refetch: fetchClientes,
    createCliente,
    updateCliente,
    deleteCliente
  };
}
