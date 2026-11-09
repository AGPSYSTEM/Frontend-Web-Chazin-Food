import { apiClient } from "@/shared/api/apiClient";

export const ventasService = {
  getVentas: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.periodo) query.append("periodo", params.periodo);
    if (params.estado) query.append("estado", params.estado);
    if (params.search) query.append("search", params.search);
    const qs = query.toString();
    return await apiClient.get(`/ventas${qs ? `?${qs}` : ""}`);
  },

  getStats: async (periodo) => {
    const qs = periodo ? `?periodo=${encodeURIComponent(periodo)}` : "";
    return await apiClient.get(`/ventas/stats${qs}`);
  },

  getVentaById: async (id) => {
    return await apiClient.get(`/ventas/${id}`);
  },

  createVenta: async (data) => {
    return await apiClient.post("/ventas", data);
  },

  updateEstadoVenta: async (id, estado) => {
    return await apiClient.put(`/ventas/${id}/estado`, { estado });
  },

  updateTiempoEntrega: async (id, tiempoEstimadoEntrega, modoTiempoEntrega = "MANUAL") => {
    return await apiClient.put(`/ventas/${id}/tiempo-entrega`, { tiempoEstimadoEntrega, modoTiempoEntrega });
  },

  cancelarVenta: async (id) => {
    return await apiClient.put(`/ventas/${id}/cancelar`);
  },

  aprobarPago: async (id) => {
    return await apiClient.put(`/ventas/${id}/aprobar-pago`);
  }
};

/**
 * Determina si una venta es de Punto de Venta (POS) / Punto Físico / Venta rápida / Hecha por Vendedor.
 * En estas ventas en persona, el cobro ya se realizó directamente en mostrador o caja,
 * por lo que no debe mostrarse el botón "Aprobar pago" (reservado exclusivamente para pedidos online pendientes).
 */
export function isVentaFisicaOPos(v) {
  if (!v) return false;
  const origen = String(v.origen || "").toUpperCase().trim();
  const tipoVenta = String(v.tipoVenta || "").toUpperCase().trim();
  const origenNombre = String(v.origenNombre || "").toLowerCase().trim();
  const metodo = String(v.metodoPago || "").toLowerCase().trim();

  // Si tiene indicador explícito de punto físico, POS, venta rápida, mostrador o vendedor
  if (
    origen === "PUNTO_FISICO" ||
    origen === "POS" ||
    origen === "VENTA_RAPIDA" ||
    tipoVenta === "PUNTO_DE_VENTA" ||
    tipoVenta === "POS" ||
    tipoVenta === "VENTA_RAPIDA" ||
    tipoVenta === "MOSTRADOR" ||
    origenNombre.includes("físico") ||
    origenNombre.includes("fisico") ||
    origenNombre.includes("pos") ||
    origenNombre.includes("mostrador") ||
    origenNombre.includes("rápida") ||
    origenNombre.includes("rapida") ||
    metodo.includes("efectivo") ||
    Boolean(v.idVendedor) ||
    Boolean(v.vendedor)
  ) {
    return true;
  }

  // Si NO es venta online ni delivery web
  const isOnline = origen === "ONLINE" || tipoVenta === "DOMICILIO" || origenNombre.includes("online");
  return !isOnline;
}
