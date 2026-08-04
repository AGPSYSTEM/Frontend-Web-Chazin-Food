import { Eye, Trash2, User, Clock, AlertCircle, ArrowRight } from "lucide-react";

export function ProduccionTable({ ordenes = [], onUpdateEstado, onDelete, onViewDetails }) {
  const getNextStatusConfig = (currentStatus) => {
    switch (currentStatus) {
      case "En Cola":
        return { next: "En Preparación", label: "En Preparación", color: "bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200" };
      case "En Preparación":
        return { next: "Listo", label: "Listo", color: "bg-green-50 text-green-600 hover:bg-green-100 border-green-200" };
      case "Listo":
        return { next: "Despachado", label: "Despachado", color: "bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-200" };
      case "Despachado":
        return { next: "Entregado", label: "Entregado", color: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200" };
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <th className="px-6 py-4">Orden / Código</th>
              <th className="px-6 py-4">Cantidad</th>
              <th className="px-6 py-4">Responsable</th>
              <th className="px-6 py-4">Tiempo / Fecha</th>
              <th className="px-6 py-4">Prioridad</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
            {ordenes.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No se encontraron órdenes de producción
                </td>
              </tr>
            ) : (
              ordenes.map((o) => {
                const nextConfig = getNextStatusConfig(o.estado);
                return (
                  <tr key={o.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    {/* Orden / Código */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl select-none shrink-0">{o.imagen || "🍔"}</div>
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-gray-100">
                            <span>{o.platilloNombre}</span>
                            {o.alerta && (
                              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" title="Alerta especial" />
                            )}
                          </div>
                          <div className="text-xs text-gray-400 font-mono">{o.codigo || `OP-00${o.id}`}</div>
                        </div>
                      </div>
                    </td>

                    {/* Cantidad */}
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-gray-100">
                      x{o.cantidad || 1}
                    </td>

                    {/* Responsable */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                        <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{o.responsable || o.cocinero || "María G."}</span>
                      </div>
                    </td>

                    {/* Tiempo / Fecha */}
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-600 dark:text-gray-300 space-y-0.5">
                        <div className="flex items-center gap-1 font-semibold">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>{o.tiempo || "15 min"}</span>
                        </div>
                        <div className="text-gray-400 font-mono text-[11px]">
                          {o.fecha || "2026-06-23"}
                        </div>
                      </div>
                    </td>

                    {/* Prioridad */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          o.prioridad === "Alta"
                            ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                            : o.prioridad === "Media"
                            ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {o.prioridad || "Normal"}
                      </span>
                    </td>

                    {/* Estado */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          o.estado === "En Preparación"
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                            : o.estado === "Listo"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                            : o.estado === "Despachado"
                            ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                            : o.estado === "Entregado"
                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {o.estado}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* Status advance button */}
                        {nextConfig && (
                          <button
                            type="button"
                            onClick={() => onUpdateEstado && onUpdateEstado(o.id, nextConfig.next)}
                            title={`Avanzar estado a: ${nextConfig.next}`}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all ${nextConfig.color}`}
                          >
                            <span>{nextConfig.label}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* View details (Eye) */}
                        <button
                          type="button"
                          onClick={() => onViewDetails && onViewDetails(o)}
                          title="Ver detalles de la orden"
                          className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => onDelete && onDelete(o.id)}
                          title="Eliminar orden"
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
