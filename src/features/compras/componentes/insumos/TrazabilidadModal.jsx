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
  User,
  Search
} from "lucide-react";

export function TrazabilidadModal({
  isOpen,
  onClose,
  eventos = [],
  onClearAll,
  onOpenPapelera
}) {
  const [searchTrazabilidad, setSearchTrazabilidad] = useState("");
  const [filterType, setFilterType] = useState("Todos");

  if (!isOpen) return null;

  const isEventEliminado = (e) =>
    e.tipo === "Eliminado" ||
    e.tipo === "Eliminado permanente" ||
    (e.tipoRaw && e.tipoRaw.toLowerCase().includes("elimin")) ||
    (e.descripcion && (e.descripcion.toLowerCase().includes("papelera") || e.descripcion.toLowerCase().includes("elimin"))) ||
    (e.motivo && e.motivo.toLowerCase().includes("papelera"));

  const isEventEditado = (e) =>
    !isEventEliminado(e) &&
    (e.tipo === "Editado" ||
      (e.tipoRaw && (e.tipoRaw.toLowerCase().includes("edit") || e.tipoRaw.toLowerCase().includes("actualiz"))) ||
      (e.descripcion && e.descripcion.toLowerCase().includes("actualizaron")) ||
      (e.motivo && e.motivo.toLowerCase().includes("actualización")));

  const isEventCreado = (e) =>
    !isEventEliminado(e) &&
    !isEventEditado(e) &&
    (e.tipo === "Creado" ||
      (e.tipoRaw && (e.tipoRaw.toLowerCase().includes("crea") || e.tipoRaw.toLowerCase() === "nuevo")) ||
      (e.descripcion && (e.descripcion.toLowerCase().includes("creó") || e.descripcion.toLowerCase().includes("registro inicial"))));

  const isEventRestaurado = (e) =>
    !isEventEliminado(e) &&
    (e.tipo === "Restaurado" || (e.tipoRaw && e.tipoRaw.toLowerCase().includes("restaur")));

  const isEventCancelacion = (e) =>
    !isEventEliminado(e) &&
    !isEventEditado(e) &&
    !isEventCreado(e) &&
    !isEventRestaurado(e) &&
    (e.esCancelacion === true ||
      e.tipo === "Cancelación de Compra" ||
      e.tipo === "Anulación de Compra" ||
      e.tipo === "cancelacion_compra" ||
      (e.descripcion && (
        e.descripcion.toLowerCase().includes("cancelaci") ||
        e.descripcion.toLowerCase().includes("anulaci") ||
        e.descripcion.toLowerCase().includes("reversa")
      )) ||
      (e.motivo && (
        e.motivo.toLowerCase().includes("cancelaci") ||
        e.motivo.toLowerCase().includes("anulaci") ||
        e.motivo.toLowerCase().includes("reversa")
      )));

  const isEventReabastecimiento = (e) =>
    !isEventEliminado(e) &&
    !isEventEditado(e) &&
    !isEventCreado(e) &&
    !isEventRestaurado(e) &&
    !isEventCancelacion(e) &&
    (e.tipo === "Reabastecimiento" ||
      e.tipo === "compra" ||
      e.tipo === "Reabastecimiento por Compra" ||
      (e.tipoMovimiento === "Entrada" &&
        (String(e.tipoRaw).toLowerCase().includes("compra") ||
         String(e.descripcion).toLowerCase().includes("compra") ||
         String(e.motivo).toLowerCase().includes("compra") ||
         String(e.tipo).toLowerCase().includes("reabastec"))));

  const reabastecimientosCount = eventos.filter(isEventReabastecimiento).length;
  const cancelacionesCount = eventos.filter(isEventCancelacion).length;
  const creadosCount = eventos.filter(isEventCreado).length;
  const editadosCount = eventos.filter(isEventEditado).length;
  const eliminadosCount = eventos.filter(isEventEliminado).length;
  const restauradosCount = eventos.filter(isEventRestaurado).length;

  const filteredEventos = eventos.filter((e) => {
    // Type filter
    let matchType = true;
    if (filterType === "Reabastecimientos") matchType = isEventReabastecimiento(e);
    else if (filterType === "Cancelaciones") matchType = isEventCancelacion(e);
    else if (filterType === "Creados") matchType = isEventCreado(e);
    else if (filterType === "Editados") matchType = isEventEditado(e);
    else if (filterType === "Eliminados") matchType = isEventEliminado(e);
    else if (filterType === "Restaurados") matchType = isEventRestaurado(e);

    if (!matchType) return false;

    // Search query filter
    if (!searchTrazabilidad.trim()) return true;
    const q = searchTrazabilidad.toLowerCase().trim();

    const matchesIntent =
      (isEventEliminado(e) && (q.includes("elimin") || q.includes("papelera") || q.includes("borra"))) ||
      (isEventEditado(e) && (q.includes("edit") || q.includes("modif") || q.includes("actualiz"))) ||
      (isEventCreado(e) && (q.includes("crea") || q.includes("nuev") || q.includes("regist"))) ||
      (isEventRestaurado(e) && (q.includes("restaur") || q.includes("recuper"))) ||
      (isEventReabastecimiento(e) && (q.includes("reabastec") || q.includes("compra") || q.includes("entrad"))) ||
      (isEventCancelacion(e) && (q.includes("cancel") || q.includes("anul") || q.includes("revers")));

    return (
      matchesIntent ||
      (e.nombre && e.nombre.toLowerCase().includes(q)) ||
      (e.descripcion && e.descripcion.toLowerCase().includes(q)) ||
      (e.tipo && e.tipo.toLowerCase().includes(q)) ||
      (e.tipoRaw && e.tipoRaw.toLowerCase().includes(q)) ||
      (e.motivo && e.motivo.toLowerCase().includes(q)) ||
      (e.usuarioNombre && e.usuarioNombre.toLowerCase().includes(q)) ||
      (e.fecha && e.fecha.toLowerCase().includes(q))
    );
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

        {/* Search Bar - Arriba */}
        <div className="px-6 pt-4 pb-2 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTrazabilidad}
              onChange={(e) => setSearchTrazabilidad(e.target.value)}
              placeholder="Buscar en trazabilidad por insumo, acción o responsable..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-red-500/50 outline-none transition-colors"
            />
          </div>
        </div>

        {/* Filter Pills row - Abajo con flex-wrap para que se vean bien y no queden cortados */}
        <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-start flex-wrap gap-2 text-xs shrink-0">
          <div className="flex items-center gap-1.5 text-gray-400 mr-1 shrink-0 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span className="text-[11px] uppercase tracking-wider">Filtros:</span>
          </div>

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
              const isEliminado = isEventEliminado(ev);
              const isEditado = isEventEditado(ev);
              const isCreado = isEventCreado(ev);
              const isRestaurado = isEventRestaurado(ev);
              const isCancelacion = isEventCancelacion(ev);
              const isReabastecimiento = isEventReabastecimiento(ev);

              const badgeBg = isEliminado
                ? "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/80"
                : isEditado
                ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/80"
                : isCreado
                ? "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/80"
                : isRestaurado
                ? "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200/80"
                : isCancelacion
                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200/80"
                : isReabastecimiento
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200/80"
                : "bg-slate-100 text-slate-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200/80";

              const badgeLabel = isEliminado
                ? "Insumo Eliminado"
                : isEditado
                ? "Insumo Editado"
                : isCreado
                ? "Insumo Creado"
                : isRestaurado
                ? "Insumo Restaurado"
                : isCancelacion
                ? (ev.tipo && (ev.tipo.includes("Cancel") || ev.tipo.includes("Anul")) ? ev.tipo : "Cancelación de Compra")
                : isReabastecimiento
                ? "Reabastecimiento por Compra"
                : ev.tipo;

              const iconCircle = isEliminado ? (
                <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/40 flex items-center justify-center shrink-0">
                  <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                </div>
              ) : isEditado ? (
                <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                  <Edit className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
              ) : isCreado ? (
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                  <PlusCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              ) : isRestaurado ? (
                <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/40 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
              ) : isCancelacion ? (
                <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
              ) : isReabastecimiento ? (
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                  <ShoppingCart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 dark:bg-gray-800 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-4 h-4 text-slate-600 dark:text-gray-400" />
                </div>
              );

              const hasCantidad = ev.cantidad !== null && ev.cantidad !== undefined && !isNaN(parseFloat(ev.cantidad)) && (isReabastecimiento || isCancelacion || isCreado);

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
                          • {badgeLabel}
                        </span>
                        <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                          {ev.nombre}
                        </span>
                        {hasCantidad && (
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
