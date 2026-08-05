import { X, FileText, Calendar, User, Package, DollarSign, CheckCircle2, Clock, XCircle } from "lucide-react";

const estadoBadges = {
  RECIBIDA: { cls: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800", icon: CheckCircle2, label: "Recibida" },
  Recibida:  { cls: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800", icon: CheckCircle2, label: "Recibida" },
  Completada:{ cls: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800", icon: CheckCircle2, label: "Completada" },
  PENDIENTE: { cls: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800", icon: Clock, label: "Pendiente" },
  Pendiente: { cls: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800", icon: Clock, label: "Pendiente" },
  CANCELADA: { cls: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800", icon: XCircle, label: "Cancelada" },
  Anulada:   { cls: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800", icon: XCircle, label: "Anulada" }
};

function esEstadoPendiente(estado) {
  const e = String(estado || "").toUpperCase();
  return e === "PENDIENTE";
}

function esEstadoRecibida(estado) {
  const e = String(estado || "").toUpperCase();
  return e === "RECIBIDA" || e === "COMPLETADA";
}

function esEstadoCancelada(estado) {
  const e = String(estado || "").toUpperCase();
  return e === "CANCELADA" || e === "ANULADA";
}

export function DetalleCompraModal({ isOpen, onClose, compra, onUpdateEstado, onCancelar }) {
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

  const detalles = compra.detalles || [];
  const estaPendiente = esEstadoPendiente(compra.estado);
  const estaRecibida = esEstadoRecibida(compra.estado);
  const estaCancelada = esEstadoCancelada(compra.estado);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-100 dark:border-gray-800"
        style={{ animation: "fadeInScale 0.2s ease-out" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F05454]/10 flex items-center justify-center">
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
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Orden de compra #{compra.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Estado destacado y acciones */}
          <div className={`rounded-xl p-4 border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
            estaPendiente
              ? "bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800/50"
              : estaRecibida
              ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/50"
              : "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/50"
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                estaPendiente
                  ? "bg-yellow-100 dark:bg-yellow-800/40 text-yellow-600 dark:text-yellow-300"
                  : estaRecibida
                  ? "bg-green-100 dark:bg-green-800/40 text-green-600 dark:text-green-300"
                  : "bg-red-100 dark:bg-red-800/40 text-red-600 dark:text-red-300"
              }`}>
                {estaPendiente && <Clock className="w-5 h-5" />}
                {estaRecibida && <CheckCircle2 className="w-5 h-5" />}
                {estaCancelada && <XCircle className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Estado actual</p>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{estadoInfo.label}</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                  {estaPendiente && "⚠️ El stock NO ha sido actualizado aún. Marca como Recibida cuando lleguen los insumos."}
                  {estaRecibida && "✅ El stock de los insumos fue actualizado cuando se marcó como Recibida."}
                  {estaCancelada && "❌ Esta compra fue anulada. Si tenía stock asociado, fue revertido."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {estaPendiente && onUpdateEstado && (
                <button
                  onClick={() => onUpdateEstado(compra.id, "RECIBIDA")}
                  className="flex items-center gap-1.5 px-3 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Marcar como Recibida
                </button>
              )}
              {!estaCancelada && onCancelar && (
                <button
                  onClick={() => onCancelar(compra.id)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Anular Compra
                </button>
              )}
            </div>
          </div>

          {/* Metadata Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
            <div>
              <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide block mb-1">
                Proveedor
              </span>
              <div className="flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-200">
                <User className="w-4 h-4 text-[#F05454]" />
                {compra.proveedorNombre || compra.proveedor?.nombre || "Sin Proveedor"}
              </div>
            </div>
            <div>
              <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide block mb-1">
                Fecha de Compra
              </span>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                <Calendar className="w-4 h-4 text-[#F05454]" />
                {fechaFormatted}
              </div>
            </div>
          </div>

          {/* Insumos Comprados */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-[#F05454]" />
              Insumos Adquiridos ({detalles.length})
            </h3>

            <div className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
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
                      return (
                        <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">
                            {insNombre}
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

          {/* Total Summary */}
          <div className="flex justify-end">
            <div className="bg-[#F05454]/10 rounded-xl px-5 py-3 flex items-center gap-3 border border-[#F05454]/20">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                Total de la Orden:
              </span>
              <span className="text-xl font-extrabold text-[#F05454]">
                ${Number(compra.total || 0).toLocaleString("es-CO", { minimumFractionDigits: 0 })}
              </span>
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
