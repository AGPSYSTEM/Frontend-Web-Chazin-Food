import { useState, useEffect, useCallback } from "react";
import { clientesService } from "../servicios/clientesService";
import { useNotifications } from "@/shared/hooks/useNotifications";
import Swal from "sweetalert2";

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
    const matchSearch =
      searchTerm === "" ||
      c.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.apellidos?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.telefono?.includes(searchTerm) ||
      c.documento?.includes(searchTerm);

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
      await Swal.fire({
        icon: "warning",
        title: "No se puede eliminar",
        html: `El cliente <b>"${nombre}"</b> cuenta con <b>${comprasCount}</b> ${comprasCount === 1 ? 'venta asociada' : 'ventas asociadas'} en el sistema.<br/><br/><span style="color:#d97706;font-size:0.9em;">Por integridad y trazabilidad contable, este cliente no puede ser eliminado. Si ya no requiere actividad comercial, únicamente es posible cambiar su estado a <b>Inactivo</b> desde la opción de edición.</span>`,
        confirmButtonText: "Entendido",
        confirmButtonColor: "#30475E"
      });
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
