import { ChefHat, Calendar, Clock } from "lucide-react";

export function ProduccionTable({ ordenes = [], onUpdateEstado }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <th className="px-6 py-4">Orden / Código</th>
              <th className="px-6 py-4">Platillo / Receta</th>
              <th className="px-6 py-4">Cantidad Planeada</th>
              <th className="px-6 py-4">Fecha Producción</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
            {ordenes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No se encontraron órdenes de producción
                </td>
              </tr>
            ) : (
              ordenes.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                        <ChefHat className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                          {o.codigo || `OP-${o.id}`}
                        </div>
                        <div className="text-xs text-gray-400 font-mono">ID: #{o.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">
                    {o.platilloNombre || o.producto || "Platillo Principal"}
                  </td>
                  <td className="px-6 py-4 text-gray-800 dark:text-gray-200 font-bold">
                    {o.cantidad || 1} porciones
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300 text-xs">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {o.fecha ? new Date(o.fecha).toLocaleDateString("es-CO") : "Hoy"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        o.estado === "Finalizada" || o.estado === "Completada"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                          : o.estado === "En Proceso"
                          ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                          : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                      }`}
                    >
                      {o.estado || "Planeada"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <select
                      value={o.estado || "Planeada"}
                      onChange={(e) => onUpdateEstado(o.id, e.target.value)}
                      className="px-2.5 py-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-200"
                    >
                      <option value="Planeada">Planeada</option>
                      <option value="En Proceso">En Proceso</option>
                      <option value="Finalizada">Finalizada</option>
                      <option value="Cancelada">Cancelada</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
