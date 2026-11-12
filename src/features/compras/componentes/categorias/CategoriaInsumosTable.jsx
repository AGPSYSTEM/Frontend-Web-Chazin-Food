import { useState, useEffect } from "react";
import { Edit, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { FoodIcon } from "@/shared/components/ui/FoodIcon";

export function CategoriaInsumosTable({ categorias = [], onEdit, onDelete, canEdit = true, canDelete = true }) {
  const [pageSize, setPageSize] = useState(5);
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
    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xs overflow-hidden">
      <div className="overflow-x-auto focus:outline-none">
        <table className="w-full text-left border-collapse table-auto">
          <thead>
            <tr className="bg-[#f8fafc] dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800 text-xs font-bold text-[#1e293b] dark:text-gray-200 uppercase tracking-wider">
              <th className="px-4 sm:px-6 py-3.5 w-[28%] text-left">Nombre</th>
              <th className="px-4 sm:px-6 py-3.5 w-[32%] text-left">Descripción</th>
              <th className="px-4 sm:px-6 py-3.5 w-[15%] text-center">Insumos</th>
              <th className="px-4 sm:px-6 py-3.5 w-[13%] text-center">Estado</th>
              <th className="px-4 sm:px-6 py-3.5 w-[12%] text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs sm:text-sm">
            {totalRecords === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No se encontraron categorías de insumos
                </td>
              </tr>
            ) : (
              paginatedCategorias.map((c, index) => (
                <tr key={c.id ?? `cat-${index}`} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 sm:px-6 py-3.5 font-bold text-[#1e293b] dark:text-gray-100 text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/40 flex items-center justify-center shrink-0 overflow-hidden text-[#F05454] shadow-2xs">
                        {c.icon && typeof c.icon === "string" && (c.icon.startsWith("http") || c.icon.startsWith("/")) ? (
                          <img src={c.icon} alt={c.nombre} className="w-full h-full object-cover" />
                        ) : (
                          <FoodIcon name={c.icon || c.nombre || "bread"} category={c.nombre} size={20} stroke={1.75} />
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-[#1e293b] dark:text-gray-100 block">
                          {c.nombre}
                        </span>
                        <span className="text-[11px] text-gray-400 font-normal">
                          ID #{c.id || c.idCategoriaInsumo}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-3.5 text-slate-600 dark:text-gray-300 font-normal text-left">
                    <span className="line-clamp-2">{c.descripcion || "-"}</span>
                  </td>
                  <td className="px-4 sm:px-6 py-3.5 text-center">
                    <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-full bg-blue-100/80 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-semibold text-xs">
                      {c.insumosCount ?? c.cantidad ?? (c.insumos?.length || 0)}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-3.5 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        c.estado === "Activo" || c.estado === 1 || c.estado === "1"
                          ? "bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                          : "bg-red-100/80 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                      }`}
                    >
                      {c.estado === 1 || c.estado === "1" ? "Activo" : c.estado || "Activo"}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-2.5">
                      {canEdit && (
                        <button
                          onClick={() => onEdit(c)}
                          title="Editar categoría"
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors p-1 cursor-pointer"
                        >
                          <Edit className="w-4 h-4 stroke-[2]" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => onDelete(c.id, c.nombre)}
                          title="Eliminar categoría"
                          className="text-red-500 dark:text-red-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 stroke-[2]" />
                        </button>
                      )}
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
