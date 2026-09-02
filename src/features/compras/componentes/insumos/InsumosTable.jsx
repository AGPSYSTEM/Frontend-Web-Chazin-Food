import { useState } from "react";
import { Eye, Edit, Trash2, Package, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

export function InsumosTable({ insumos = [], onEdit, onDelete, onView }) {
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const totalRecords = insumos.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedInsumos = insumos.slice(startIndex, startIndex + pageSize);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f8fafc] dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800 text-xs font-bold text-[#1e293b] dark:text-gray-200 tracking-wider uppercase">
              <th className="px-6 py-4 w-16">ID</th>
              <th className="px-6 py-4">NOMBRE</th>
              <th className="px-6 py-4">CATEGORÍA</th>
              <th className="px-6 py-4">CANTIDAD</th>
              <th className="px-6 py-4">PRECIO UNIT.</th>
              <th className="px-6 py-4">PROVEEDOR</th>
              <th className="px-6 py-4">STOCK</th>
              <th className="px-6 py-4 text-center">ACCIONES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
            {totalRecords === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No se encontraron insumos
                </td>
              </tr>
            ) : (
              paginatedInsumos.map((i, index) => {
                const isBajo = (i.stock || 0) <= (i.stockMinimo || 0) && (i.stock || 0) > 0;
                const isAgotado = (i.stock || 0) === 0;

                const stockLabel = isAgotado ? "Agotado" : isBajo ? "Bajo" : "Normal";
                const stockBadgeClass = isAgotado
                  ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                  : isBajo
                  ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                  : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300";

                return (
                  <tr key={i.id || index} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-medium">
                      {i.id || startIndex + index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 flex items-center justify-center shrink-0">
                          <Package className="w-4 h-4" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#1e293b] dark:text-gray-100">
                            {i.nombre}
                          </span>
                          {(i.estado === "Inactivo" || i.estado === 0 || i.estado === "0") && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                              Inactivo
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {typeof i.categoria === "string" ? i.categoria : (i.categoriaNombre || i.categoria?.nombre || "Sin categoría")}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">
                      {i.stock ?? 0} {i.unidadMedida || "und"}
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-medium">
                      ${Number(i.precioUnitario || i.costo || 0).toLocaleString("es-CO")}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {typeof i.proveedor === "string" ? i.proveedor : (i.proveedorNombre || i.proveedor?.nombre || "Sin Proveedor")}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${stockBadgeClass}`}>
                        {stockLabel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        {onView && (
                          <button
                            onClick={() => onView(i)}
                            title="Ver detalles del insumo"
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors p-1"
                          >
                            <Eye className="w-4 h-4 stroke-[2]" />
                          </button>
                        )}
                        <button
                          onClick={() => onEdit(i)}
                          title="Editar insumo"
                          className="text-[#F05454] dark:text-[#F05454] hover:text-[#d84343] transition-colors p-1"
                        >
                          <Edit className="w-4 h-4 stroke-[2]" />
                        </button>
                        <button
                          onClick={() => onDelete(i.id || i.idInsumo, i.nombre)}
                          title="Eliminar insumo"
                          className="text-red-500 dark:text-red-400 hover:text-red-600 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4 stroke-[2]" />
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

      {/* Pagination Footer */}
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
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="w-8 h-8 rounded-full bg-[#F05454] text-white flex items-center justify-center font-bold text-xs mx-1">
            {currentPage}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
