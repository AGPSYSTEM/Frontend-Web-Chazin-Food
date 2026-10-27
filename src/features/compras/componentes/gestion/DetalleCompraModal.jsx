import { X, FileText, Calendar, User, Package, DollarSign, CheckCircle2, Clock, XCircle, AlertTriangle, Layers, Info, CornerDownRight, ArrowRightLeft, Truck, Wallet, RotateCcw, Edit3, Sparkles, Tag } from "lucide-react";

const estadoBadges = {
  RECIBIDA:         { cls: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", icon: CheckCircle2, label: "Confirmada" },
  Recibida:         { cls: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", icon: CheckCircle2, label: "Confirmada" },
  Completada:       { cls: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", icon: CheckCircle2, label: "Confirmada" },
  COMPLETADA:       { cls: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", icon: CheckCircle2, label: "Confirmada" },
  DEVUELTA_PARCIAL: { cls: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800", icon: RotateCcw, label: "Devolución Parcial" },
  CANCELADA:        { cls: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800", icon: XCircle, label: "Cancelada" },
  Anulada:          { cls: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800", icon: XCircle, label: "Anulada" }
};

function esEstadoRecibida(estado) {
  const e = String(estado || "").toUpperCase();
  return e === "RECIBIDA" || e === "COMPLETADA";
}

function esEstadoCancelada(estado) {
  const e = String(estado || "").toUpperCase();
  return e === "CANCELADA" || e === "ANULADA";
}

// Configuración de visualización según tipo de operación
const TIPO_OP_LABELS = {
  CAMBIO_PRODUCTO: { label: "Cambio de Producto", cls: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800" },
  PRODUCTO_VENCIDO: { label: "Producto Vencido / Averiado", cls: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800" },
  REEMBOLSO_DINERO: { label: "Reembolso de Dinero", cls: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" },
  DEVOLUCION_PARCIAL: { label: "Devolución Parcial", cls: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800" },
  ANULACION_ADMINISTRATIVA: { label: "Anulación Administrativa", cls: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800" }
};

export function DetalleCompraModal({ isOpen, onClose, compra, onCancelar, onEditarCancelacion }) {
  if (!isOpen || !compra) return null;

  const estadoInfo = estadoBadges[compra.estado] || {
    cls: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700",
    icon: Clock,
    label: compra.estado || "Desconocido"
  };
  const IconEstado = estadoInfo.icon;

  const fechaFormatted = (compra.fechaCompra || compra.fecha)
    ? new Date(compra.fechaCompra || compra.fecha).toLocaleDateString("es-CO", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      })
    : "Sin fecha";

  const fechaCancelacionFormatted = compra.fechaCancelacion
    ? new Date(compra.fechaCancelacion).toLocaleString("es-CO", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    : null;

  const detalles = compra.detalles || [];
  const estaRecibida = esEstadoRecibida(compra.estado);
  const estaCancelada = esEstadoCancelada(compra.estado);

  // Parsear detalles de cancelación si existen (soporte para array antiguo y objeto enriquecido nuevo)
  let itemsCancelados = [];
  let gestionInfo = null;
  if (compra.detallesCancelacion) {
    try {
      const parsed = typeof compra.detallesCancelacion === "string"
        ? JSON.parse(compra.detallesCancelacion)
        : compra.detallesCancelacion;
      if (Array.isArray(parsed)) {
        itemsCancelados = parsed;
      } else if (parsed && typeof parsed === "object") {
        gestionInfo = parsed;
        itemsCancelados = parsed.items || [];
      }
    } catch (_) {
      itemsCancelados = [];
    }
  }

  const esProveedorGenerico = !compra.idProveedor || compra.proveedorNombre === "Proveedor Genérico" || compra.proveedorNombre === "Sin proveedor";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden border border-gray-100 dark:border-gray-800"
        style={{ animation: "fadeInScale 0.2s ease-out" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#F05454]/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#F05454]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Detalle de Compra {compra.numeroFactura || `OC-${compra.id}`}
                </h2>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${estadoInfo.cls}`}>
                  <IconEstado className="w-3.5 h-3.5" />
                  {estadoInfo.label}
                </span>
                {esProveedorGenerico && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-semibold">
                    🏷️ Genérico
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Compra #{compra.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Banner de Estado */}
          <div className={`rounded-2xl p-4 border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
            estaRecibida
              ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50"
              : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/50"
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                estaRecibida
                  ? "bg-emerald-100 dark:bg-emerald-800/40 text-emerald-600 dark:text-emerald-300"
                  : "bg-red-100 dark:bg-red-800/40 text-red-600 dark:text-red-300"
              }`}>
                {estaRecibida && <CheckCircle2 className="w-5 h-5" />}
                {estaCancelada && <XCircle className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Estado actual</p>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{estadoInfo.label}</p>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                  {estaRecibida && (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>El inventario fue reabastecido automáticamente con los insumos adquiridos.</span>
                    </>
                  )}
                  {estaCancelada && (
                    <>
                      <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <span>Esta compra fue anulada y las cantidades fueron descontadas del inventario.</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {!estaCancelada && onCancelar && (
                <button
                  onClick={() => onCancelar(compra.id)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  Anular Compra
                </button>
              )}
              {estaCancelada && onEditarCancelacion && (
                <button
                  onClick={() => onEditarCancelacion(compra)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  title="Editar estados, horas, fechas, productos de cambio u observaciones"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Editar Devolución / Cancelación
                </button>
              )}
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              SECCIÓN DE CANCELACIÓN / DEVOLUCIÓN ENRIQUECIDA (#88)
          ═══════════════════════════════════════════════════════════════ */}
          {estaCancelada && (
            <div className="p-4 rounded-2xl bg-red-50/60 dark:bg-red-950/20 border border-red-200/80 dark:border-red-900/40 space-y-4">
              
              {/* Header de la Anulación */}
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-red-100 dark:border-red-900/40 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 dark:text-red-300">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-red-800 dark:text-red-300">
                    Registro de Devolución / Cancelación
                  </span>
                  {gestionInfo?.tipoOperacion && (
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${TIPO_OP_LABELS[gestionInfo.tipoOperacion]?.cls || "bg-gray-100 text-gray-700"}`}>
                      {TIPO_OP_LABELS[gestionInfo.tipoOperacion]?.label || gestionInfo.tipoOperacion}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {onEditarCancelacion && (
                    <button
                      type="button"
                      onClick={() => onEditarCancelacion(compra)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 text-[11px] font-bold shadow-2xs transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      Editar
                    </button>
                  )}
                </div>
              </div>

              {/* Tiempos y Estados (si vienen en formato estructurado) */}
              {gestionInfo && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {/* Fecha y Hora */}
                  <div className="p-2.5 rounded-xl bg-white dark:bg-gray-850 border border-red-100 dark:border-red-900/30">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block mb-0.5">
                      Fecha y Hora
                    </span>
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-red-500" />
                      {gestionInfo.fecha || "Sin fecha"} {gestionInfo.hora ? `• ${gestionInfo.hora}` : ""}
                    </p>
                  </div>

                  {/* Estado Mercancía */}
                  <div className="p-2.5 rounded-xl bg-white dark:bg-gray-850 border border-red-100 dark:border-red-900/30">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block mb-0.5">
                      Estado Productos
                    </span>
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1">
                      <Truck className="w-3 h-3 text-blue-500" />
                      {gestionInfo.estadoMercancia === "RECIBIDO" ? "✅ Ya se recibieron" : gestionInfo.estadoMercancia === "EN_PROCESO" ? "⏳ En proceso" : "📦 Pendiente"}
                    </p>
                  </div>

                  {/* Estado Dinero */}
                  <div className="p-2.5 rounded-xl bg-white dark:bg-gray-850 border border-red-100 dark:border-red-900/30">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block mb-0.5">
                      Estado Reembolso
                    </span>
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1">
                      <Wallet className="w-3 h-3 text-emerald-500" />
                      {gestionInfo.estadoDinero === "REEMBOLSADO" ? "💵 Dinero devuelto" : gestionInfo.estadoDinero === "ENTREGA_INMEDIATA" ? "⚡ Entrega inmediata" : gestionInfo.estadoDinero === "EN_PROCESO" ? "⏳ En proceso" : gestionInfo.estadoDinero === "SALDO_A_FAVOR" ? "🎟️ Saldo a favor" : "⛔ No aplica"}
                    </p>
                  </div>

                  {/* Monto y Método */}
                  <div className="p-2.5 rounded-xl bg-white dark:bg-gray-850 border border-red-100 dark:border-red-900/30">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block mb-0.5">
                      Monto Reembolso
                    </span>
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {gestionInfo.montoReembolsado ? `$${Number(gestionInfo.montoReembolsado).toLocaleString("es-CO")}` : "$0"}
                      <span className="text-[10px] text-gray-400 font-normal ml-1">({gestionInfo.metodoReembolso || "N/A"})</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Motivo y Responsable */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-white dark:bg-gray-800/80 rounded-xl border border-red-100 dark:border-red-900/30">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block mb-1">
                    Motivo General
                  </span>
                  <p className="text-xs font-semibold text-red-700 dark:text-red-300">
                    {gestionInfo?.motivoGeneral || compra.motivoCancelacion || "Sin motivo especificado"}
                  </p>
                </div>

                <div className="p-3 bg-white dark:bg-gray-800/80 rounded-xl border border-red-100 dark:border-red-900/30">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block mb-1">
                    Responsable de la anulación
                  </span>
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#F05454]" />
                    {compra.usuarioCancelacionNombre || "Usuario del sistema"}
                  </p>
                </div>
              </div>

              {/* Observaciones generales adicionales */}
              {gestionInfo?.observaciones && (
                <div className="p-3 bg-white dark:bg-gray-800/80 rounded-xl border border-red-100 dark:border-red-900/30">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block mb-1">
                    Observaciones y Acuerdos con el Proveedor
                  </span>
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                    {gestionInfo.observaciones}
                  </p>
                </div>
              )}

              {/* Insumos y Especificaciones Individuales */}
              {itemsCancelados.length > 0 && (
                <div className="pt-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 block mb-2 flex items-center gap-1">
                    <CornerDownRight className="w-3.5 h-3.5 text-red-500" />
                    Insumos Afectados, Motivos Individuales y Acciones:
                  </span>
                  <div className="border border-red-100 dark:border-red-900/40 rounded-xl overflow-hidden bg-white dark:bg-gray-800/80">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-red-50/70 dark:bg-red-950/30 border-b border-red-100 dark:border-red-900/40 text-[10px] uppercase font-bold text-red-800 dark:text-red-300">
                            <th className="px-3 py-2">Insumo Devuelto</th>
                            <th className="px-3 py-2 text-center">Cant. Cancelada</th>
                            <th className="px-3 py-2">Motivo & Acción</th>
                            <th className="px-3 py-2 text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                          {itemsCancelados.map((item, idx) => {
                            const cantCanc = Number(item.cantidadCancelada || 0);
                            const tieneReemplazo = item.insumoReemplazoNombre || (item.tipoAccion === "CAMBIO");
                            return (
                              <tr key={idx} className="hover:bg-red-50/30 dark:hover:bg-red-950/10">
                                <td className="px-3 py-2.5">
                                  <div className="font-semibold text-gray-800 dark:text-gray-200">
                                    {item.nombre || `Insumo #${item.idInsumo}`}
                                  </div>
                                  {item.observacionIndividual && (
                                    <div className="text-[10px] text-gray-500 italic mt-0.5">
                                      Nota: {item.observacionIndividual}
                                    </div>
                                  )}
                                </td>
                                <td className="px-3 py-2.5 text-center">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 font-bold text-[11px]">
                                    -{cantCanc.toLocaleString("es-CO")} {item.unidadMedida || ""}
                                  </span>
                                </td>
                                <td className="px-3 py-2.5">
                                  <div className="text-[11px] font-medium text-gray-700 dark:text-gray-300">
                                    {item.motivoIndividual || "Devolución / Cancelación"}
                                  </div>
                                  {tieneReemplazo ? (
                                    <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-semibold border border-blue-200 dark:border-blue-800">
                                      <ArrowRightLeft className="w-3 h-3 text-blue-500" />
                                      Cambiado por: {item.insumoReemplazoNombre || "Insumo de reemplazo"}
                                      {item.cantidadReemplazo ? ` (${item.cantidadReemplazo} ${item.unidadReemplazo || ""})` : ""}
                                    </div>
                                  ) : (
                                    <div className="text-[10px] text-gray-400 mt-0.5">
                                      Acción: {item.tipoAccion === "REEMBOLSO" ? "Reembolso $" : item.tipoAccion === "BAJA" ? "Desecho/Merma" : "Devolución simple"}
                                    </div>
                                  )}
                                </td>
                                <td className="px-3 py-2.5 text-right font-bold text-red-600 dark:text-red-400">
                                  -${Number(item.subtotal || 0).toLocaleString("es-CO")}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Metadata Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
            <div>
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide block mb-1">
                Proveedor
              </span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 dark:text-gray-200 truncate">
                <User className="w-3.5 h-3.5 text-[#F05454] shrink-0" />
                <span className="truncate">{compra.proveedorNombre || compra.proveedor?.nombre || "Sin Proveedor"}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide block mb-1">
                Nº Factura
              </span>
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-gray-800 dark:text-gray-200">
                <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>{compra.numeroFactura || `OC-${compra.id}`}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide block mb-1">
                Fecha Factura
              </span>
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                <Calendar className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>
                  {compra.fechaFactura
                    ? new Date(compra.fechaFactura).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })
                    : (compra.fechaCompra ? new Date(compra.fechaCompra).toLocaleDateString("es-CO") : "Sin fecha")}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide block mb-1">
                Fecha Registro
              </span>
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 capitalize">
                <Calendar className="w-3.5 h-3.5 text-[#F05454] shrink-0" />
                <span>{fechaFormatted}</span>
              </div>
            </div>
          </div>

          {/* Insumos Comprados Originales */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-[#F05454]" />
              Insumos Adquiridos en esta Orden ({detalles.length})
            </h3>

            <div className="border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <th className="px-4 py-3">Insumo</th>
                    <th className="px-4 py-3 text-center">Cantidad</th>
                    <th className="px-4 py-3 text-right">Precio Unitario</th>
                    <th className="px-4 py-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                  {detalles.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-gray-400 text-xs">
                        No hay detalles registrados para esta compra
                      </td>
                    </tr>
                  ) : (
                    detalles.map((d, i) => {
                      const insNombre = d.insumo?.nombre || `Insumo #${d.idInsumo}`;
                      const unidad = d.insumo?.unidadMedida || "";
                      const lotesArr = Array.isArray(d.lotes) && d.lotes.length > 0
                        ? d.lotes
                        : (d.numeroLote ? [{ numeroLote: d.numeroLote, fechaVencimiento: d.fechaVencimiento }] : []);

                      return (
                        <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="px-4 py-3">
                            <span className="font-semibold text-gray-900 dark:text-gray-100 block">
                              {insNombre}
                            </span>
                            {lotesArr.length > 0 && (
                              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                {lotesArr.map((lot, li) => (
                                  <span
                                    key={li}
                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-medium"
                                  >
                                    <Layers className="w-2.5 h-2.5" />
                                    Lote: {lot.numeroLote}
                                    {lot.fechaVencimiento && ` · Vence: ${lot.fechaVencimiento}`}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-bold text-xs">
                              {Number(d.cantidad).toLocaleString("es-CO")} {unidad}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                            ${Number(d.precioUnitario).toLocaleString("es-CO", { minimumFractionDigits: 0 })}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-gray-100">
                            ${Number(d.subtotal || (d.cantidad * d.precioUnitario)).toLocaleString("es-CO", { minimumFractionDigits: 0 })}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Total Summary con IVA (#83) */}
          <div className="flex justify-end">
            <div className="bg-gray-50 dark:bg-gray-800/80 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 min-w-[260px] space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Subtotal:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  ${Number(compra.subtotal || compra.total || 0).toLocaleString("es-CO", { minimumFractionDigits: 0 })}
                </span>
              </div>
              {Boolean(compra.incluyeIva || Number(compra.iva) > 0) && (
                <div className="flex items-center justify-between text-xs text-blue-600 dark:text-blue-400">
                  <span>IVA (19%):</span>
                  <span className="font-semibold">
                    +${Number(compra.iva || 0).toLocaleString("es-CO", { minimumFractionDigits: 0 })}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  Total Compra:
                </span>
                <span className="text-xl font-black text-[#F05454]">
                  ${Number(compra.total || 0).toLocaleString("es-CO", { minimumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
