import { useState, useEffect, useCallback } from "react";
import { comprasService } from "../servicios/comprasService";
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
    // 1. Filtro por estado
    const matchEstado =
      filterEstado === "Todos" ||
      c.estado === filterEstado ||
      (filterEstado === "RECIBIDA" && (c.estado === "COMPLETADA" || c.estado === "RECIBIDA")) ||
      (filterEstado === "CANCELADA" && (c.estado === "CANCELADA" || c.estado === "ANULADA"));

    if (!matchEstado) return false;

    // 2. Filtro de búsqueda exhaustiva
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;

    // Recopilar todos los textos de la compra de manera segura
    const searchTokens = [];

    // IDs y códigos
    if (c.id !== undefined && c.id !== null) searchTokens.push(String(c.id), `#${c.id}`, `id: ${c.id}`);
    if (c.idCompra !== undefined && c.idCompra !== null) searchTokens.push(String(c.idCompra), `#${c.idCompra}`);
    if (c.numeroFactura) searchTokens.push(String(c.numeroFactura));

    // Proveedor
    const provNombre = c.proveedorNombre || (typeof c.proveedor === "string" ? c.proveedor : c.proveedor?.nombre) || "";
    if (provNombre && provNombre !== "Proveedor Genérico" && provNombre !== "Proveedor Desconocido") {
      searchTokens.push(provNombre);
    } else {
      searchTokens.push("sin proveedor", "compra directa", "sin prov");
    }
    if (c.proveedor && typeof c.proveedor === "object") {
      if (c.proveedor.nombreContacto) searchTokens.push(String(c.proveedor.nombreContacto));
      if (c.proveedor.telefono) searchTokens.push(String(c.proveedor.telefono));
      if (c.proveedor.correo) searchTokens.push(String(c.proveedor.correo));
      if (c.proveedor.nit) searchTokens.push(String(c.proveedor.nit));
    }

    // Estado y etiquetas de estado
    if (c.estado) {
      searchTokens.push(String(c.estado));
      const estLower = String(c.estado).toLowerCase();
      if (estLower.includes("recib") || estLower.includes("comp")) {
        searchTokens.push("confirmada", "confirmadas", "confirmado", "recibida", "recibidas", "completada");
      }
      if (estLower.includes("canc") || estLower.includes("anul")) {
        searchTokens.push("cancelada", "canceladas", "cancelado", "anulada", "anuladas", "anulado");
      }
    }

    // Totales y montos numéricos
    if (c.total !== undefined && c.total !== null) {
      const totNum = Number(c.total);
      searchTokens.push(
        String(c.total),
        String(totNum),
        totNum.toLocaleString("es-CO"),
        `$${totNum.toLocaleString("es-CO")}`,
        String(Math.round(totNum))
      );
    }
    if (c.subtotal) searchTokens.push(String(c.subtotal));
    if (c.iva) searchTokens.push(String(c.iva));

    // Fechas (compra, factura, cancelación)
    const procesarFecha = (f) => {
      if (!f) return;
      searchTokens.push(String(f));
      const d = new Date(f);
      if (!isNaN(d.getTime())) {
        searchTokens.push(
          d.toLocaleDateString("es-CO"),
          d.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" }),
          d.toLocaleDateString("es-CO", { month: "long" })
        );
      }
    };
    procesarFecha(c.fechaCompra);
    procesarFecha(c.fechaFactura);
    procesarFecha(c.fechaCancelacion);

    // Insumos y lotes incluidos en la compra
    if (Array.isArray(c.detalles)) {
      c.detalles.forEach((d) => {
        if (d.insumo?.nombre) searchTokens.push(d.insumo.nombre);
        if (d.insumoNombre) searchTokens.push(d.insumoNombre);
        if (d.nombre) searchTokens.push(d.nombre);
        if (d.insumo?.unidadMedida) searchTokens.push(d.insumo.unidadMedida);
        if (d.numeroLote) searchTokens.push(String(d.numeroLote));
        if (d.cantidad) searchTokens.push(String(d.cantidad));
        if (d.precioUnitario) searchTokens.push(String(d.precioUnitario));
        if (Array.isArray(d.lotes)) {
          d.lotes.forEach((l) => {
            if (l.numeroLote) searchTokens.push(String(l.numeroLote));
          });
        }
      });
    }

    if (Array.isArray(c.lotes)) {
      c.lotes.forEach((l) => {
        if (l.numeroLote) searchTokens.push(String(l.numeroLote));
      });
    }

    // Motivo de cancelación y usuario responsable
    if (c.motivoCancelacion) searchTokens.push(String(c.motivoCancelacion));
    if (c.usuarioCancelacionNombre) searchTokens.push(String(c.usuarioCancelacionNombre));
    if (c.detallesCancelacion) {
      if (typeof c.detallesCancelacion === "string") {
        searchTokens.push(c.detallesCancelacion);
      } else if (typeof c.detallesCancelacion === "object") {
        if (c.detallesCancelacion.motivoGeneral) searchTokens.push(String(c.detallesCancelacion.motivoGeneral));
        if (c.detallesCancelacion.observaciones) searchTokens.push(String(c.detallesCancelacion.observaciones));
        if (c.detallesCancelacion.tipoOperacion) searchTokens.push(String(c.detallesCancelacion.tipoOperacion));
      }
    }

    // Comparar término(s) de búsqueda contra los datos recopilados
    const fullHaystack = searchTokens.join(" ").toLowerCase();
    const searchWords = term.split(/\s+/).filter(Boolean);
    return searchWords.every((word) => fullHaystack.includes(word));
  });

  const createCompra = async (data) => {
    try {
      await comprasService.createCompra(data);
      notify.success("Compra registrada", "La compra se registró exitosamente");
      await fetchCompras();
      return true;
    } catch (err) {
      notify.error("Error", err.message || "No se pudo registrar la compra");
      return false;
    }
  };

  const updateCompra = async (id, data) => {
    try {
      await comprasService.updateCompra(id, data);
      notify.success("Compra actualizada", "La compra se editó correctamente");
      await fetchCompras();
      return true;
    } catch (err) {
      notify.error("Error", err.message || "No se pudo actualizar la compra");
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

  const cancelarCompra = async (id, cancelData = null) => {
    if (!cancelData) {
      const confirmed = await notify.confirmAction(
        "¿Anular compra?",
        "¿Estás seguro de que deseas anular esta compra?",
        "Sí, anular"
      );
      if (!confirmed) return false;
    }
    try {
      await comprasService.cancelarCompra(id, cancelData || {});
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
    updateCompra,
    updateEstado,
    cancelarCompra
  };
}
