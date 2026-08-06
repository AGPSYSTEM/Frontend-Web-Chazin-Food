import { Edit, Trash2, Utensils, Tag, Eye, Zap } from "lucide-react";

export function ProductosTable({ productos = [], onEdit, onDelete, onView, onCreateEvento }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <th className="px-6 py-4">Producto / Código</th>
              <th className="px-6 py-4">Categoría</th>
              <th className="px-6 py-4">Precio Venta</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
            {productos.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No se encontraron productos en el menú
                </td>
              </tr>
            ) : (
              productos.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {p.imagen ? (
                        <img
                          src={p.imagen}
                          alt={p.nombre}
                          className="w-10 h-10 rounded-xl object-cover border border-gray-200 dark:border-gray-700 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/30 text-[#F05454] flex items-center justify-center shrink-0">
                          <Utensils className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">{p.nombre}</div>
                        <div className="text-xs text-gray-400 font-mono">{p.codigo || `PRD-${p.id}`}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                      <Tag className="w-3 h-3" />
                      {p.categoria || "Sin categoría"}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-gray-100">
                    ${Number(p.precio || 0).toLocaleString("es-CO")}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        p.estado === "Activo"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                          : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                      }`}
                    >
                      {p.estado || "Activo"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Crear Evento */}
                      <button
                        onClick={() => onCreateEvento && onCreateEvento(p)}
                        title="Crear Evento"
                        className="p-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-600 dark:text-purple-400 transition-colors"
                      >
                        <Zap className="w-4 h-4" />
                      </button>
                      {/* Ver */}
                      <button
                        onClick={() => onView && onView(p)}
                        title="Ver producto"
                        className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {/* Editar */}
                      <button
                        onClick={() => onEdit(p)}
                        title="Editar producto"
                        className="p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {/* Eliminar */}
                      <button
                        onClick={() => onDelete(p.id, p.nombre)}
                        title="Eliminar producto"
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
