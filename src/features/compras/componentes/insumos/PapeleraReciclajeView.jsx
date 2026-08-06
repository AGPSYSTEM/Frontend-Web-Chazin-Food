import { Package, Trash2, RotateCcw, FlaskConical } from "lucide-react";

export function PapeleraReciclajeView({
  papeleraInsumos = [],
  papeleraPreparados = [],
  onVolverActivos,
  onRestaurarInsumo,
  onEliminarDefinitivoInsumo
}) {
  return (
    <div className="space-y-6">
      {/* Banner: Volver a Activos */}
      <button
        onClick={onVolverActivos}
        className="w-full py-3.5 px-6 rounded-2xl bg-blue-100/90 hover:bg-blue-200/90 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-300 font-medium text-sm flex items-center justify-center gap-2 transition-colors shadow-2xs"
      >
        <Package className="w-5 h-5 text-blue-600 dark:text-blue-300" />
        <span>Volver a Activos</span>
      </button>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-xs space-y-8">
        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-[#1e293b] dark:text-gray-100">
            Papelera de Reciclaje
          </h2>
        </div>

        {/* Section 1: Insumos Eliminados */}
        <div className="space-y-3">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base border-b border-gray-100 dark:border-gray-800 pb-2">
            Insumos Eliminados
          </h3>

          {papeleraInsumos.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 italic py-2">
              No hay insumos en la papelera.
            </p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
              {papeleraInsumos.map((item) => (
                <div
                  key={item.id}
                  className="p-4 flex items-center justify-between gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">
                        {item.nombre}
                      </h4>
                      <p className="text-xs text-gray-400">
                        {item.categoriaNombre || item.categoria || "Sin categoría"} — {item.stock ?? 0} {item.unidadMedida || "und"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onRestaurarInsumo(item)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-semibold transition-colors"
                      title="Restaurar insumo"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restaurar</span>
                    </button>
                    <button
                      onClick={() => onEliminarDefinitivoInsumo(item.id, item.nombre, false)}
                      className="p-1.5 text-red-500 hover:text-red-600 transition-colors"
                      title="Eliminar definitivamente"
                    >
                      <Trash2 className="w-4 h-4 stroke-[2]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Insumos Preparados Eliminados */}
        <div className="space-y-3">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base border-b border-gray-100 dark:border-gray-800 pb-2">
            Insumos Preparados Eliminados
          </h3>

          {papeleraPreparados.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 italic py-2">
              No hay preparados en la papelera.
            </p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
              {papeleraPreparados.map((item) => (
                <div
                  key={item.id}
                  className="p-4 flex items-center justify-between gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300 flex items-center justify-center shrink-0">
                      <FlaskConical className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">
                        {item.nombre}
                      </h4>
                      <p className="text-xs text-gray-400">
                        {item.descripcion || "Receta artesanal"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onRestaurarInsumo(item)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-semibold transition-colors"
                      title="Restaurar preparado"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restaurar</span>
                    </button>
                    <button
                      onClick={() => onEliminarDefinitivoInsumo(item.id, item.nombre, true)}
                      className="p-1.5 text-red-500 hover:text-red-600 transition-colors"
                      title="Eliminar definitivamente"
                    >
                      <Trash2 className="w-4 h-4 stroke-[2]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
