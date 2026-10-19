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
  const [selectedPeriod, setSelectedPeriod] = useState("personalizado");

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
    const term = (searchTerm || "").trim().toLowerCase();

    let matchSearch = true;
    if (term !== "") {
      const idStr = String(v.id || v.idVenta || "");
      const idHashStr = `#${idStr}`;
      const numVenta = String(v.numeroVenta || v.codigoPedido || `VEN-${idStr.padStart(4, "0")}`).toLowerCase();
      const pedVenta = `ped-${idStr.padStart(3, "0")}`;

      // Cliente info
      const rawClient = typeof v.cliente === "string" ? v.cliente : (v.clienteNombre || v.cliente?.nombre || "");
      const clientApellidos = typeof v.cliente === "object" ? (v.cliente?.apellidos || "") : "";
      const clientFullName = `${rawClient} ${clientApellidos}`.trim().toLowerCase();
      const rawTelefono = String(v.clienteTelefono || v.telefono || v.cliente?.telefono || "").toLowerCase();
      const cleanTelefono = rawTelefono.replace(/\D/g, "");
      const cleanTermPhone = term.replace(/\D/g, "");
      const clientDoc = String(v.clienteDocumento || v.documento || v.cliente?.documento || "").toLowerCase();

      // Observaciones / Metadata
      let obsMeta = {};
      if (typeof v.observaciones === "string" && v.observaciones.startsWith("{")) {
        try { obsMeta = JSON.parse(v.observaciones); } catch (e) {}
      } else if (typeof v.observaciones === "object" && v.observaciones) {
        obsMeta = v.observaciones;
      }

      // Dirección
      const direccion = String(v.direccion || v.direccionEntrega || obsMeta.direccion || v.cliente?.direccion || "").toLowerCase();

      // Tipo de entrega / canal
      const rawTipoEntrega = String(v.tipoEntrega || obsMeta.tipoEntrega || "").toLowerCase();
      const origen = String(v.origen || (rawTipoEntrega.includes("domicilio") ? "ONLINE" : "PUNTO_FISICO")).toLowerCase();
      const matchEntrega =
        rawTipoEntrega.includes(term) ||
        (term === "domicilio" && (rawTipoEntrega.includes("domicilio") || origen.includes("online"))) ||
        ((term === "recoger" || term === "llevar" || term === "para llevar") && (rawTipoEntrega.includes("recoger") || rawTipoEntrega.includes("llevar"))) ||
        ((term === "mesa" || term === "en mesa") && rawTipoEntrega.includes("mesa")) ||
        ((term === "online" || term === "web") && origen.includes("online")) ||
        ((term === "fisico" || term === "físico" || term === "punto fisico" || term === "mostrador") && (origen.includes("punto") || origen.includes("fisico")));

      // Estado
      const rawEstado = String(v.estado || "").toLowerCase();
      const rawEstadoEntrega = String(v.estadoEntrega || "").toLowerCase();
      const matchEstadoSearch =
        rawEstado.includes(term) ||
        rawEstadoEntrega.includes(term) ||
        (term === "pendiente" && (rawEstado.includes("pendiente") || rawEstadoEntrega.includes("pendiente"))) ||
        ((term === "preparando" || term === "en preparacion" || term === "en preparación" || term === "cocina") && (rawEstado.includes("prepar") || rawEstadoEntrega.includes("prepar"))) ||
        ((term === "listo" || term === "completada" || term === "entregado") && (rawEstado.includes("complet") || rawEstadoEntrega.includes("listo") || rawEstadoEntrega.includes("entregado"))) ||
        ((term === "anulada" || term === "cancelado" || term === "cancelada") && (rawEstado.includes("anul") || rawEstadoEntrega.includes("cancel")));

      // Fidelidad
      const fidelidadTipo = String(v.clienteFidelidad?.tipo || v.cliente?.tipo || (v.esVip ? "VIP" : "")).toLowerCase();
      const isIrregularSearch = term === "irregular" || term.includes("irregular");
      const matchFidelidad =
        fidelidadTipo.includes(term) ||
        (isIrregularSearch && fidelidadTipo.includes("regular"));

      // Total consumido / venta (raw number, formatted with/without '$' and dots)
      const totalNum = Number(v.total || v.subtotal || 0);
      const totalStr = String(totalNum);
      const totalFormatted = `$${totalNum.toLocaleString("es-CO")}`.toLowerCase();
      const totalFormattedNoDollar = totalNum.toLocaleString("es-CO").toLowerCase();
      const cleanTermNumber = term.replace(/[$. ]/g, "");
      const matchTotal =
        (cleanTermNumber.length > 0 && totalStr.includes(cleanTermNumber)) ||
        totalFormatted.includes(term) ||
        totalFormattedNoDollar.includes(term);

      // Fecha, Hora, Minutos, Período (AM / PM)
      let hourStr = "";
      let minuteStr = "";
      let periodStr = "";
      let timeFullStr = "";
      let time24Str = "";
      let dateFormattedStr = "";

      if (v.fecha || v.fechaVenta) {
        try {
          const d = new Date(v.fecha || v.fechaVenta);
          if (!isNaN(d.getTime())) {
            dateFormattedStr = d.toLocaleDateString("es-CO", { timeZone: "America/Bogota" }).toLowerCase();
            const timeParts = d.toLocaleTimeString("es-CO", {
              timeZone: "America/Bogota",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true
            }).toLowerCase();
            timeFullStr = timeParts;

            const timeMatch = timeParts.match(/(\d{1,2}):(\d{2})\s*(a\.?\s*m\.?|p\.?\s*m\.?|am|pm)?/i);
            if (timeMatch) {
              hourStr = timeMatch[1];
              minuteStr = timeMatch[2];
              periodStr = (timeMatch[3] || "").replace(/\./g, "").replace(/\s/g, "").toLowerCase();
            }
            const hours24 = String(d.getHours()).padStart(2, "0");
            time24Str = `${hours24}:${minuteStr}`;
          }
        } catch (e) {}
      }

      const horarioField = String(v.horario || "").toLowerCase();

      // Período AM / PM matching
      const isAmSearch = term === "am" || term === "a.m." || term === "a. m." || term === "mañana";
      const isPmSearch = term === "pm" || term === "p.m." || term === "p. m." || term === "tarde" || term === "noche";
      const matchPeriod =
        (isAmSearch && (periodStr === "am" || timeFullStr.includes("a. m.") || timeFullStr.includes("am") || horarioField.includes("am"))) ||
        (isPmSearch && (periodStr === "pm" || timeFullStr.includes("p. m.") || timeFullStr.includes("pm") || horarioField.includes("pm")));

      // Minutos exactos e.g. "30", "44", ":44", "30 min"
      const cleanTermMin = term.replace(/[^\d]/g, "");
      const matchMinutes =
        (cleanTermMin.length > 0 && minuteStr === cleanTermMin) ||
        (minuteStr.length > 0 && term === `:${minuteStr}`) ||
        (minuteStr.length > 0 && term === `${minuteStr} min`) ||
        (minuteStr.length > 0 && term === `${minuteStr} minutos`);

      // Hora exacta e.g. "12", "04", "12:30"
      const matchHour =
        (hourStr.length > 0 && (term === hourStr || term === String(Number(hourStr)))) ||
        timeFullStr.includes(term) ||
        time24Str.includes(term) ||
        horarioField.includes(term) ||
        dateFormattedStr.includes(term);

      // Tiempo estimado de entrega
      const tiempoEstimado = String(v.tiempoEstimadoEntrega || obsMeta.tiempoEstimadoEntrega || "").toLowerCase();
      const matchTiempoEstimado = tiempoEstimado.includes(term);

      // Método de pago
      const metodoPago = String(v.metodoPago || v.metodo_pago || "").toLowerCase();
      const matchMetodo = metodoPago.includes(term);

      matchSearch =
        idStr === term ||
        idHashStr === term ||
        numVenta.includes(term) ||
        pedVenta.includes(term) ||
        clientFullName.includes(term) ||
        (cleanTermPhone.length > 0 && cleanTelefono.includes(cleanTermPhone)) ||
        rawTelefono.includes(term) ||
        clientDoc.includes(term) ||
        direccion.includes(term) ||
        matchEntrega ||
        matchEstadoSearch ||
        matchFidelidad ||
        matchTotal ||
        matchPeriod ||
        matchMinutes ||
        matchHour ||
        matchTiempoEstimado ||
        matchMetodo;
    }

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
    updateTiempoEntrega,
    cancelarVenta
  };
}

