import { useState } from "react";
import {
  X,
  Bell,
  Trash2,
  Filter,
  PlusCircle,
  Edit,
  Clock,
  RotateCcw,
  CheckCircle2,
  ShoppingCart,
  User
} from "lucide-react";

export function TrazabilidadModal({
  isOpen,
  onClose,
  eventos = [],
  onClearAll,
  onOpenPapelera
}) {
  const [filterType, setFilterType] = useState("Todos");

  if (!isOpen) return null;

  const isEventCancelacion = (e) =>
    e.esCancelacion === true ||
    e.tipo === "Cancelación de Compra" ||
    e.tipo === "Anulación de Compra" ||
    e.tipo === "cancelacion_compra" ||
    e.tipoMovimiento === "Salida" ||
    (e.descripcion && (
      e.descripcion.toLowerCase().includes("cancelaci") ||
      e.descripcion.toLowerCase().includes("anulaci") ||
      e.descripcion.toLowerCase().includes("reversa")
    )) ||
    (e.motivo && (
      e.motivo.toLowerCase().includes("cancelaci") ||
      e.motivo.toLowerCase().includes("anulaci") ||
      e.motivo.toLowerCase().includes("reversa")
    ));

  const isEventReabastecimiento = (e) =>
    !isEventCancelacion(e) &&
    (e.tipo === "Reabastecimiento" || e.tipo === "compra" || e.tipoMovimiento === "Entrada");

  const reabastecimientosCount = eventos.filter(isEventReabastecimiento).length;
  const cancelacionesCount = eventos.filter(isEventCancelacion).length;
  const creadosCount = eventos.filter((e) => e.tipo === "Creado").length;
  const editadosCount = eventos.filter((e) => e.tipo === "Editado").length;
  const eliminadosCount = eventos.filter((e) => e.tipo === "Eliminado").length;
  const restauradosCount = eventos.filter((e) => e.tipo === "Restaurado").length;

  const filteredEventos = eventos.filter((e) => {
    if (filterType === "Todos") return true;
    if (filterType === "Reabastecimientos") return isEventReabastecimiento(e);
    if (filterType === "Cancelaciones") return isEventCancelacion(e);
    if (filterType === "Creados") return e.tipo === "Creado";
    if (filterType === "Editados") return e.tipo === "Editado";
    if (filterType === "Eliminados") return e.tipo === "Eliminado";
    if (filterType === "Restaurados") return e.tipo === "Restaurado";
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-[28px] shadow-2xl w-full max-w-[900px] max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/30 text-[#F05454] flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1e293b] dark:text-gray-100">
                Trazabilidad de Insumos
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {eventos.length} eventos registrados
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenPapelera}
              className="px-3.5 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-gray-500" />
              <span>Papelera</span>
            </button>

            {onClearAll && eventos.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-[#F05454] hover:text-red-600 text-xs font-semibold transition-colors"
              >
                Limpiar todo
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Pills row */}
        <div className="px-6 py-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-center gap-2 overflow-x-auto text-xs shrink-0 scrollbar-none">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />

          <button
            onClick={() => setFilterType("Todos")}
            className={`px-3 py-1 rounded-full font-medium transition-colors shrink-0 ${
              filterType === "Todos"
                ? "bg-[#2c3e50] text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
            }`}
          >
            Todos ({eventos.length})
          </button>

          <button
            onClick={() => setFilterType("Reabastecimientos")}
            className={`px-3 py-1 rounded-full font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
              filterType === "Reabastecimientos"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100"
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Reabastecimientos ({reabastecimientosCount})</span>
          </button>

          <button
            onClick={() => setFilterType("Cancelaciones")}
            className={`px-3 py-1 rounded-full font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
              filterType === "Cancelaciones"
                ? "bg-red-600 text-white"
                : "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-100"
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Cancelaciones ({cancelacionesCount})</span>
          </button>

          <button
            onClick={() => setFilterType("Creados")}
            className={`px-3 py-1 rounded-full font-medium transition-colors shrink-0 ${
              filterType === "Creados"
                ? "bg-[#2c3e50] text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
            }`}
          >
            Creados ({creadosCount})
          </button>

          <button
            onClick={() => setFilterType("Editados")}
            className={`px-3 py-1 rounded-full font-medium transition-colors shrink-0 ${
              filterType === "Editados"
                ? "bg-[#2c3e50] text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
            }`}
          >
            Editados ({editadosCount})
          </button>

          <button
            onClick={() => setFilterType("Eliminados")}
            className={`px-3 py-1 rounded-full font-medium transition-colors shrink-0 ${
              filterType === "Eliminados"
                ? "bg-[#2c3e50] text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
            }`}
          >
            Eliminados ({eliminadosCount})
          </button>

          <button
            onClick={() => setFilterType("Restaurados")}
            className={`px-3 py-1 rounded-full font-medium transition-colors shrink-0 ${
              filterType === "Restaurados"
                ? "bg-[#2c3e50] text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
            }`}
          >
            Restaurados ({restauradosCount})
          </button>
        </div>

        {/* Events Cards List / Empty State */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {filteredEventos.length === 0 ? (
            <div className="py-14 text-center flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-slate-400 dark:text-gray-500 mb-3">
                <CheckCircle2 className="w-7 h-7 stroke-[1.8]" />
              </div>
              <h3 className="font-bold text-[#1e293b] dark:text-gray-100 text-base mb-1">
                Sin eventos registrados
              </h3>
              <p className="text-xs text-gray-400">
                Los reabastecimientos por compras y cambios a los insumos aparecerán aquí
              </p>
            </div>
          ) : (
            filteredEventos.map((ev) => {
              const isCancelacion = isEventCancelacion(ev);
              const isReabastecimiento = isEventReabastecimiento(ev);
              const isCreado = ev.tipo === "Creado";
              const isEditado = ev.tipo === "Editado";
              const isEliminado = ev.tipo === "Eliminado";

              const badgeBg = isCancelacion
                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200/80"
                : isReabastecimiento
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200/80"
                : isCreado
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                : isEditado
                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                : isEliminado
                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";

              const iconCircle = isCancelacion ? (
                <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
              ) : isReabastecimiento ? (
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                  <ShoppingCart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              ) : isCreado ? (
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                  <PlusCircle className="w-5 h-5 text-blue-600" />
                </div>
              ) : isEditado ? (
                <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                  <Edit className="w-4 h-4 text-amber-600" />
                </div>
              ) : isEliminado ? (
                <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 flex items-center justify-center shrink-0">
                  <Trash2 className="w-4 h-4 text-red-600" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/40 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-4 h-4 text-purple-600" />
                </div>
              );

              return (
                <div
                  key={ev.id}
                  className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700/60 p-4 flex items-start gap-3.5 shadow-2xs hover:shadow-xs transition-shadow"
                >
                  {iconCircle}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${badgeBg}`}>
                          • {isCancelacion
                              ? (ev.tipo && (ev.tipo.includes("Cancel") || ev.tipo.includes("Anul")) ? ev.tipo : "Cancelación de Compra")
                              : isReabastecimiento
                              ? "Reabastecimiento por Compra"
                              : ev.tipo}
                        </span>
                        <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                          {ev.nombre}
                        </span>
                        {ev.cantidad && (
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-xs border ${
                              isCancelacion
                                ? "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200/80 dark:border-red-800/60"
                                : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60"
                            }`}
                          >
                            {isCancelacion ? `-${Math.abs(parseFloat(ev.cantidad))}` : `+${Math.abs(parseFloat(ev.cantidad))}`}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{ev.fecha}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      {ev.descripcion}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700/40 text-[11px] text-gray-500 dark:text-gray-400">
                      <div className="w-4 h-4 rounded-full bg-slate-100 dark:bg-gray-700 flex items-center justify-center text-slate-500 dark:text-gray-300 shrink-0">
                        <User className="w-2.5 h-2.5" />
                      </div>
                      <span>
                        Responsable: <strong className="font-semibold text-gray-800 dark:text-gray-200">{ev.usuarioNombre || "Sistema"}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0">
          <span className="text-xs text-gray-400">
            Mostrando {filteredEventos.length} de {eventos.length} eventos
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-200 font-semibold text-xs sm:text-sm transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
