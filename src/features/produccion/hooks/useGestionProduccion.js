import { useState, useEffect, useCallback } from "react";
import { produccionService } from "../servicios/produccionService";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { useAuth } from "@/features/autenticacion/hooks/useAuth";
import {
  recordLocalOrderTransition,
  getLocalOrderTransition
} from "../utils/tiempoProduccionUtils";
import { matchesSmartSearch, formatStatusTokens } from "@/shared/utils/searchUtils";

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
    const hasSearch = Boolean(searchTerm && searchTerm.trim());

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

    const hasObs = Boolean(o.observaciones && String(o.observaciones).trim());
    const obsText = hasObs ? o.observaciones : "sin_observaciones sin observaciones";
    const hasMesa = Boolean(o.mesa && String(o.mesa).trim());
    const mesaText = hasMesa ? `mesa ${o.mesa} #${o.mesa}` : "sin_mesa sin mesa para llevar llevar recoger domicilio";
    const hasCook = Boolean((o.cocinero || o.responsable) && String(o.cocinero || o.responsable).trim());
    const cookText = hasCook ? `${o.cocinero || ""} ${o.responsable || ""}` : "sin_cocinero sin cocinero sin_responsable sin responsable";

    const matchSearch = matchesSmartSearch(
      [
        o.codigo,
        o.id,
        String(o.id ?? ""),
        `#${o.id}`,
        o.platilloNombre,
        o.cliente,
        o.responsable,
        o.cocinero,
        cookText,
        formatStatusTokens(o.estado),
        o.horaInicio,
        o.horaEstado,
        o.fecha,
        o.tiempo,
        o.mesa,
        mesaText,
        o.tipo,
        o.cantidad,
        String(o.cantidad ?? ""),
        `${o.cantidad ?? 0} unidades`,
        o.prioridad ? `turno #${o.prioridad}` : "",
        o.observaciones,
        obsText,
        prodsString
      ],
      searchTerm
    );

    const matchEstado = !hasSearch ? (filterEstado === "Todos" || o.estado === filterEstado) : true;
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
