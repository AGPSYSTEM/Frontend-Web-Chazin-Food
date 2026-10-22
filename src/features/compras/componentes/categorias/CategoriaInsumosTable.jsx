import { useState, useEffect } from "react";
import { Edit, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

export function CategoriaInsumosTable({ categorias = [], onEdit, onDelete }) {
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset pagination when categorias length changes (#51)
  useEffect(() => {
    setCurrentPage(1);
  }, [categorias.length]);

  const totalRecords = categorias.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedCategorias = categorias.slice(startIndex, startIndex + pageSize);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f8fafc] dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800 text-sm font-bold text-[#1e293b] dark:text-gray-200">
              {/* <th className="px-6 py-4 w-[13%] text-left">ID</th> */}
              <th className="px-6 py-4 w-[17%] text-left">Nombre</th>
              <th className="px-6 py-4 w-[17%] text-left">Descripción</th>
              <th className="px-6 py-4 w-[17%] text-left">Insumos</th>
              <th className="px-6 py-4 w-[17%] text-left">Estado</th>
              <th className="px-6 py-4 w-[19%] text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
            {totalRecords === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No se encontraron categorías de insumos
                </td>
              </tr>
            ) : (
              paginatedCategorias.map((c, index) => (
                <tr key={c.id ?? `cat-${index}`} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                
                  <td className="px-6 py-4 font-bold text-[#1e293b] dark:text-gray-100 whitespace-nowrap text-left">
                    {c.nombre}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-gray-300 font-normal text-left">
                    {c.descripcion || "-"}
                  </td>
                  <td className="px-6 py-4 text-left">
                    <span className="inline-flex items-center justify-center min-w-[32px] h-8 px-2.5 rounded-full bg-blue-100/80 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-medium text-sm">
                      {c.insumosCount ?? c.cantidad ?? (c.insumos?.length || 0)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-left">
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
                  <td className="px-6 py-4 text-left">
                    <div className="flex items-center gap-3">
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

      {/* Pagination Controls */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <span>Mostrar:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>registros</span>
        </div>

        <div>
          Mostrando {totalRecords === 0 ? 0 : startIndex + 1} a {Math.min(startIndex + pageSize, totalRecords)} de {totalRecords} registros
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="w-8 h-8 rounded-full bg-[#F05454] text-white flex items-center justify-center font-bold text-xs mx-1">
            {currentPage}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
