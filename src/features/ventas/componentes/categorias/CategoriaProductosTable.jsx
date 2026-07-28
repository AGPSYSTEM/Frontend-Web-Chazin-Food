import { Edit, Trash2, UtensilsCrossed } from "lucide-react";

export function CategoriaProductosTable({ categorias = [], onEdit, onDelete }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <th className="px-6 py-4">Categoría</th>
              <th className="px-6 py-4">Descripción</th>
              <th className="px-6 py-4">Productos en Menú</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
            {categorias.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No se encontraron categorías de productos
                </td>
              </tr>
            ) : (
              categorias.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <UtensilsCrossed className="w-4 h-4 text-[#F05454]" />
                    {c.nombre}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {c.descripcion || "Sin descripción"}
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-medium">
                    {c.cantidad || c.productosCount || 0} platillos
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        c.estado === "Activo"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                          : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                      }`}
                    >
                      {c.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(c)}
                        title="Editar categoría"
                        className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(c.id, c.nombre)}
                        title="Eliminar categoría"
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
