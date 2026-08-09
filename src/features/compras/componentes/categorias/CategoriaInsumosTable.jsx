import { Edit, Trash2 } from "lucide-react";

export function CategoriaInsumosTable({ categorias = [], onEdit, onDelete }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f8fafc] dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800 text-sm font-bold text-[#1e293b] dark:text-gray-200">
              <th className="px-6 py-4 w-[10%] text-left">ID</th>
              <th className="px-6 py-4 w-[18%] text-left">Nombre</th>
              <th className="px-6 py-4 w-[25%] text-left">Descripción</th>
              <th className="px-6 py-4 w-[17%] text-center">Insumos</th>
              <th className="px-6 py-4 w-[15%] text-center">Estado</th>
              <th className="px-6 py-4 w-[15%] text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
            {categorias.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No se encontraron categorías de insumos
                </td>
              </tr>
            ) : (
              categorias.map((c, index) => (
                <tr key={c.id || index} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-medium">
                    {c.id || index + 1}
                  </td>
                  <td className="px-6 py-4 font-bold text-[#1e293b] dark:text-gray-100 whitespace-nowrap">
                    {c.nombre}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-gray-300 font-normal">
                    {c.descripcion || "-"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center min-w-[32px] h-8 px-2.5 rounded-full bg-blue-100/80 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-medium text-sm">
                      {c.insumosCount ?? c.cantidad ?? (c.insumos?.length || 0)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        c.estado === "Activo"
                          ? "bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                          : "bg-red-100/80 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                      }`}
                    >
                      {c.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => onEdit(c)}
                        title="Editar categoría"
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors p-1 cursor-pointer"
                      >
                        <Edit className="w-4 h-4 stroke-[2]" />
                      </button>
                      <button
                        onClick={() => onDelete(c.id, c.nombre)}
                        title="Eliminar categoría"
                        className="text-red-500 dark:text-red-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 stroke-[2]" />
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
