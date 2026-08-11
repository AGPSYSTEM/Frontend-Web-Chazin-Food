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
  CheckCircle2
} from "lucide-react";

export function TrazabilidadProveedoresModal({
  isOpen,
  onClose,
  eventos = [],
  onClearAll,
  onOpenPapelera
}) {
  const [filterType, setFilterType] = useState("Todos");

  if (!isOpen) return null;

  const creadosCount = eventos.filter((e) => e.tipo === "Creado").length;
  const editadosCount = eventos.filter((e) => e.tipo === "Editado").length;
  const eliminadosCount = eventos.filter((e) => e.tipo === "Eliminado" || e.tipo === "Inactivado").length;
  const restauradosCount = eventos.filter((e) => e.tipo === "Restaurado").length;

  const filteredEventos = eventos.filter((e) => {
    if (filterType === "Todos") return true;
    if (filterType === "Creados") return e.tipo === "Creado";
    if (filterType === "Editados") return e.tipo === "Editado";
    if (filterType === "Eliminados") return e.tipo === "Eliminado" || e.tipo === "Inactivado";
    if (filterType === "Restaurados") return e.tipo === "Restaurado";
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-[28px] shadow-2xl w-full max-w-[680px] max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/30 text-[#F05454] flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1e293b] dark:text-gray-100">
                Trazabilidad de Proveedores
              </h2>
              <p className="text-xs text-gray-400">
                {eventos.length} {eventos.length === 1 ? "evento registrado" : "eventos registrados"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
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
            Todos
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
                Los cambios en proveedores aparecerán aquí
              </p>
            </div>
          ) : (
            filteredEventos.map((ev) => {
              const isCreado = ev.tipo === "Creado";
              const isEditado = ev.tipo === "Editado";
              const isEliminado = ev.tipo === "Eliminado" || ev.tipo === "Inactivado";

              const badgeBg = isCreado
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                : isEditado
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                : isEliminado
                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";

              const iconCircle = isCreado ? (
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                  <PlusCircle className="w-5 h-5" />
                </div>
              ) : isEditado ? (
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                  <Edit className="w-4 h-4" />
                </div>
              ) : isEliminado ? (
                <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 flex items-center justify-center shrink-0">
                  <Trash2 className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/40 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-4 h-4" />
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
                          • {ev.tipo}
                        </span>
                        <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                          {ev.nombre}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{ev.fecha}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      {ev.descripcion}
                    </p>
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
