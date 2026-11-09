import { useState, useEffect, useCallback } from "react";
import { produccionService } from "../servicios/produccionService";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { useAuth } from "@/features/autenticacion/hooks/useAuth";
import {
  recordLocalOrderTransition,
  getLocalOrderTransition
} from "../utils/tiempoProduccionUtils";

export function useGestionProduccion() {
  const { user } = useAuth();
  const notify = useNotifications();
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("Todos");

  const fetchOrdenes = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const data = await produccionService.getOrdenes();
      const merged = (data || []).map((o) => {
        const local = getLocalOrderTransition(o.id || o.idVenta);
        if (!local) return o;

        const mergedTiempos = {
          ...(o.tiemposEstados || {}),
          ...(local.tiemposEstados || {})
        };

        // Si el usuario marcó "Despachado" y un backend anterior lo mapeó a "Entregado" sin haber marcado "Entregado" aún
        let resolvedEstado = o.estado;
        if (
          local.estadoActual === "Despachado" &&
          !local.tiemposEstados?.entregado &&
          (o.estado === "Entregado" || o.estado === "Listo")
        ) {
          resolvedEstado = "Despachado";
        }

        return {
          ...o,
          estado: resolvedEstado,
          tiemposEstados: mergedTiempos,
          fechaCambioEstado: local.updatedAt || o.fechaCambioEstado
        };
      });
      setOrdenes(merged);
    } catch (err) {
      console.error(err);
      if (!isSilent) {
        notify.error("Error", err.message || "Error al cargar órdenes de producción");
      }
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrdenes();

    const interval = setInterval(() => {
      fetchOrdenes(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchOrdenes]);

  // Buscador generalizado que busca por TODAS las columnas y atributos (Ítems 8, 17, 20 y Comandas)
  const filteredOrdenes = ordenes.filter((o) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return filterEstado === "Todos" || o.estado === filterEstado;
    }

    const prodsString = Array.isArray(o.productos)
      ? o.productos
          .map(
            (p) =>
              `${p.nombre || ""} ${p.observaciones || ""} ${(p.adiciones || [])
                .map((a) => (typeof a === "object" ? a.nombre : a))
                .join(" ")}`
          )
          .join(" ")
      : "";

    const matchSearch =
      (o.codigo && o.codigo.toLowerCase().includes(term)) ||
      (o.id && String(o.id).includes(term)) ||
      (o.platilloNombre && o.platilloNombre.toLowerCase().includes(term)) ||
      (o.cliente && o.cliente.toLowerCase().includes(term)) ||
      (o.responsable && o.responsable.toLowerCase().includes(term)) ||
      (o.cocinero && o.cocinero.toLowerCase().includes(term)) ||
      (o.estado && o.estado.toLowerCase().includes(term)) ||
      (o.horaInicio && o.horaInicio.toLowerCase().includes(term)) ||
      (o.horaEstado && o.horaEstado.toLowerCase().includes(term)) ||
      (o.fecha && o.fecha.toLowerCase().includes(term)) ||
      (o.tiempo && o.tiempo.toLowerCase().includes(term)) ||
      (o.mesa && o.mesa.toLowerCase().includes(term)) ||
      (o.tipo && o.tipo.toLowerCase().includes(term)) ||
      (o.cantidad && String(o.cantidad).includes(term)) ||
      (o.prioridad && `turno #${o.prioridad}`.includes(term)) ||
      (o.observaciones && o.observaciones.toLowerCase().includes(term)) ||
      prodsString.toLowerCase().includes(term);

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

  const updateEstado = async (id, nuevoEstado, extraData = {}) => {
    try {
      const cookName = user?.nombre
        ? `${user.nombre} ${user.apellidos || ""}`.trim()
        : "Chef en Turno";

      const payload = {
        ...extraData,
        cocinero: extraData?.cocinero || cookName,
        responsableCocina: extraData?.cocinero || cookName
      };

      const targetOrder = ordenes.find((o) => String(o.id || o.idVenta) === String(id)) || null;
      const recordedLocal = recordLocalOrderTransition(id, nuevoEstado, targetOrder);

      // Actualización optimista inmediata con el registro exacto de hora del nuevo estado
      setOrdenes((prev) =>
        prev.map((o) => {
          if (String(o.id || o.idVenta) !== String(id)) return o;
          return {
            ...o,
            estado: nuevoEstado,
            cocinero: payload.cocinero,
            responsableCocina: payload.responsableCocina,
            fechaCambioEstado: recordedLocal?.updatedAt || new Date().toISOString(),
            tiemposEstados: {
              ...(o.tiemposEstados || {}),
              ...(recordedLocal?.tiemposEstados || {})
            }
          };
        })
      );

      await produccionService.updateEstadoOrden(id, nuevoEstado, payload);
      if (extraData?.checklistPreparacion) {
        if (extraData.pedidoCompleto) {
          notify.success(
            "Pedido Completo (✅)",
            `La orden pasó a "${nuevoEstado}" con todos los productos verificados.`
          );
        } else {
          notify.warning(
            "Pedido Incompleto Registrado",
            `La orden pasó a "${nuevoEstado}" registrando las novedades del checklist.`
          );
        }
      } else {
        notify.success("Estado Actualizado", `La orden pasó a estado "${nuevoEstado}"`);
      }
      await fetchOrdenes(true);
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
    refetch: fetchOrdenes,
    createOrden,
    updateEstado,
    deleteOrden
  };
}
