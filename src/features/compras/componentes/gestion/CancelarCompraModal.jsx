import { useState, useEffect } from "react";
import {
  X,
  AlertTriangle,
  Package,
  Calendar,
  Layers,
  Pencil,
  Check,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export function CancelarCompraModal({ isOpen, onClose, compra, onConfirm }) {
  const [motivo, setMotivo] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Estado por detalle: { [idx]: cantidadCancelar }
  const [cantidades, setCantidades] = useState({});
  const [expandedIdx, setExpandedIdx] = useState(null);

  useEffect(() => {
    if (isOpen && compra) {
      const initial = {};
      (compra.detalles || []).forEach((d, idx) => {
        initial[idx] = String(parseFloat(d.cantidad) || 0);
      });
      setCantidades(initial);
      setMotivo("");
      setErrorMsg("");
      setExpandedIdx(null);
    }
  }, [isOpen, compra]);

  if (!isOpen || !compra) return null;

  const detalles = compra.detalles || [];
  const quickMotivos = [
    "Mercancía defectuosa / dañada",
    "Error en cantidades o precios",
    "Cancelación por parte del proveedor",
    "Orden de compra duplicada",
    "No se recibió en el plazo acordado"
  ];

  const totalAnular = detalles.reduce((sum, d, idx) => {
    const cantCanc = parseFloat(cantidades[idx]) || 0;
    const precio = parseFloat(d.precioUnitario) || 0;
    return sum + cantCanc * precio;
  }, 0);

  const handleConfirm = async () => {
    if (!motivo.trim()) {
      setErrorMsg("Por favor ingresa o selecciona el motivo de la anulación.");
      return;
    }
    setErrorMsg("");
    setLoading(true);

    try {
      const snapshotDetalles = detalles.map((d, idx) => ({
        idInsumo: d.idInsumo,
        nombre: d.insumo?.nombre || `Insumo #${d.idInsumo}`,
        unidadMedida: d.insumo?.unidadMedida || "",
        cantidadCancelada: parseFloat(cantidades[idx]) || 0,
        subtotal: (parseFloat(cantidades[idx]) || 0) * (parseFloat(d.precioUnitario) || 0),
        lotes: d.lotes || []
      })).filter(d => d.cantidadCancelada > 0); // Solo los que tienen cantidad > 0

      const ok = await onConfirm(compra.id, {
        motivo: motivo.trim(),
        detallesCancelacion: snapshotDetalles,
        // Cantidades por insumo para ajuste parcial de stock
        cantidadesAjuste: snapshotDetalles.map(d => ({
          idInsumo: d.idInsumo,
          cantidadCancelada: d.cantidadCancelada
        }))
      });

      if (ok) {
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-red-100 dark:border-red-900/30">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0 bg-red-50/50 dark:bg-red-950/20">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-red-100 dark:bg-red-900/40 text-[#F05454] flex items-center justify-center shrink-0 shadow-inner">
              <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Anular Orden de Compra
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">
                  {compra.numeroFactura || `OC-${compra.id}`}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Proveedor: <strong className="text-gray-700 dark:text-gray-200">{compra.proveedorNombre}</strong> • Total original: <strong className="text-gray-700 dark:text-gray-200">${parseFloat(compra.total || 0).toLocaleString("es-CO")}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Warning Banner */}
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Atención:</strong> Puedes ajustar la cantidad a cancelar de cada insumo individualmente. Solo se descontará del stock la cantidad que indiques. Si dejas un insumo en <strong>0</strong>, no se le hará ajuste de stock.
            </div>
          </div>

          {/* List of items with editable quantities */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-red-500" />
                Insumos y Cantidades a Cancelar ({detalles.length})
              </label>
              <span className="text-xs text-gray-400">
                Total a anular: <strong className="text-red-600">${totalAnular.toLocaleString("es-CO")}</strong>
              </span>
            </div>

            <div className="border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
              {detalles.length === 0 ? (
                <div className="p-4 text-center text-xs text-gray-400">
                  No hay insumos detallados en esta compra.
                </div>
              ) : (
                detalles.map((d, idx) => {
                  const insumoNombre = d.insumo?.nombre || `Insumo #${d.idInsumo}`;
                  const unidadMedida = d.insumo?.unidadMedida || "";
                  const cantOriginal = parseFloat(d.cantidad) || 0;
                  const cantCanc = parseFloat(cantidades[idx]) ?? cantOriginal;
                  const lotes = Array.isArray(d.lotes) && d.lotes.length > 0
                    ? d.lotes
                    : (d.numeroLote ? [{ numeroLote: d.numeroLote, fechaVencimiento: d.fechaVencimiento, cantidad: cantOriginal }] : []);
                  const subtotalCanc = cantCanc * (parseFloat(d.precioUnitario) || 0);
                  const isExpanded = expandedIdx === idx;

                  return (
                    <div key={idx} className="p-3.5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
                              {insumoNombre}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 font-medium text-[10px]">
                              Comprado: {cantOriginal} {unidadMedida}
                            </span>
                          </div>

                          {/* Edición de cantidad */}
                          <div className="flex items-center gap-2 mt-2">
                            <label className="text-[10px] font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide shrink-0">
                              Cancelar:
                            </label>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="0"
                                max={cantOriginal}
                                step="0.01"
                                value={cantidades[idx] ?? cantOriginal}
                                onChange={(e) => {
                                  const val = Math.min(
                                    Math.max(0, parseFloat(e.target.value) || 0),
                                    cantOriginal
                                  );
                                  setCantidades(prev => ({ ...prev, [idx]: String(val) }));
                                }}
                                className="w-20 px-2 py-1 text-xs border border-red-200 dark:border-red-800 bg-white dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent text-center font-bold text-red-700 dark:text-red-300"
                              />
                              <span className="text-[10px] text-gray-500 dark:text-gray-400">{unidadMedida}</span>
                            </div>

                            {/* Botones rápidos */}
                            <div className="flex gap-1 ml-1">
                              <button
                                type="button"
                                onClick={() => setCantidades(prev => ({ ...prev, [idx]: "0" }))}
                                title="No cancelar este insumo"
                                className="px-1.5 py-0.5 rounded-md text-[10px] bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 transition-colors font-medium"
                              >
                                0
                              </button>
                              <button
                                type="button"
                                onClick={() => setCantidades(prev => ({ ...prev, [idx]: String(cantOriginal) }))}
                                title="Cancelar todo"
                                className="px-1.5 py-0.5 rounded-md text-[10px] bg-red-100 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 transition-colors font-medium"
                              >
                                Todo
                              </button>
                            </div>
                          </div>

                          {lotes.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                              className="flex items-center gap-1 mt-1.5 text-[10px] text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              <Layers className="w-2.5 h-2.5" />
                              {lotes.length} lote(s)
                              {isExpanded ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
                            </button>
                          )}

                          {isExpanded && lotes.length > 0 && (
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              {lotes.map((lot, lIdx) => (
                                <span
                                  key={lIdx}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 text-[10px] text-gray-600 dark:text-gray-300 font-medium"
                                >
                                  <Layers className="w-2.5 h-2.5 text-blue-500" />
                                  Lote: {lot.numeroLote} ({lot.cantidad || cantOriginal} {unidadMedida})
                                  {lot.fechaVencimiento && (
                                    <>
                                      • <Calendar className="w-2.5 h-2.5 text-amber-500" />
                                      Vence: {lot.fechaVencimiento}
                                    </>
                                  )}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-xs font-bold text-red-600 dark:text-red-400">
                            -${subtotalCanc.toLocaleString("es-CO")}
                          </div>
                          <div className="text-[10px] text-gray-400">
                            ${parseFloat(d.precioUnitario || 0).toLocaleString("es-CO")} / {unidadMedida}
                          </div>
                          {cantCanc === 0 && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                              <Check className="w-2.5 h-2.5" />
                              No se toca
                            </span>
                          )}
                          {cantCanc > 0 && cantCanc < cantOriginal && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-600 dark:text-amber-400 font-medium mt-0.5">
                              <Pencil className="w-2.5 h-2.5" />
                              Parcial
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Reason input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
              Motivo de la Anulación <span className="text-red-500">*</span>
            </label>

            {/* Quick chips */}
            <div className="flex items-center gap-1.5 flex-wrap mb-2">
              {quickMotivos.map((qm, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setMotivo(qm);
                    setErrorMsg("");
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    motivo === qm
                      ? "bg-red-500 text-white shadow-xs"
                      : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {qm}
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={motivo}
              onChange={(e) => {
                setMotivo(e.target.value);
                if (e.target.value.trim()) setErrorMsg("");
              }}
              placeholder="Describe detalladamente el motivo de la cancelación..."
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors placeholder:text-gray-400 resize-none"
            />

            {errorMsg && (
              <p className="text-xs text-red-500 mt-1 font-medium">{errorMsg}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3 shrink-0 bg-gray-50/50 dark:bg-gray-900">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Stock a descontar:{" "}
            <strong className="text-red-600 dark:text-red-400">
              -${totalAnular.toLocaleString("es-CO")}
            </strong>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            >
              Volver
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center gap-1.5"
            >
              {loading ? "Anulando..." : "Confirmar Anulación"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
