import { useState } from "react";
import { FlaskConical, ChevronDown, ChevronUp, Search, Edit, Trash2, Package } from "lucide-react";

export function InsumosPreparadosAccordion({
  insumosPreparados = [],
  onView,
  onEdit,
  onDelete
}) {
  const [expanded, setExpanded] = useState(true);

  if (insumosPreparados.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xs overflow-hidden">
      {/* Accordion Header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300 flex items-center justify-center shrink-0">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100">Insumos Preparados</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {insumosPreparados.length} {insumosPreparados.length === 1 ? "receta guardada" : "recetas guardadas"}
            </p>
          </div>
        </div>
        <div className="text-gray-400 p-1">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {/* Accordion Body */}
      {expanded && (
        <div className="divide-y divide-gray-100 dark:divide-gray-800 border-t border-gray-100 dark:border-gray-800">
          {insumosPreparados.map((item) => (
            <div
              key={item.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/30 dark:hover:bg-gray-800/30 transition-colors"
            >
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300 flex items-center justify-center shrink-0 mt-1 sm:mt-0">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                      {item.nombre}
                    </h4>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-slate-600 dark:text-gray-300">
                      Preparado
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {item.descripcion || "Receta artesanal de la casa"}
                  </p>
                  {item.ingredientes && item.ingredientes.length > 0 && (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-300">
                      <Package className="w-3 h-3 text-gray-400" />
                      <span>× {item.ingredientes.length} insumos</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right area: price + action icons */}
              <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-800">
                <div className="text-right">
                  <div className="font-bold text-gray-900 dark:text-gray-100 text-base">
                    ${(item.precio || item.costo || 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">
                    por {item.unidadMedida || "und"}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {onView && (
                    <button
                      onClick={() => onView(item)}
                      title="Ver receta / detalles"
                      className="p-1.5 text-gray-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white transition-colors"
                    >
                      <Search className="w-4 h-4 stroke-[2]" />
                    </button>
                  )}
                  {onEdit && (
                    <button
                      onClick={() => onEdit(item)}
                      title="Editar insumo preparado"
                      className="p-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors"
                    >
                      <Edit className="w-4 h-4 stroke-[2]" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(item.id, item.nombre)}
                      title="Eliminar insumo preparado"
                      className="p-1.5 text-red-500 dark:text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 stroke-[2]" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
