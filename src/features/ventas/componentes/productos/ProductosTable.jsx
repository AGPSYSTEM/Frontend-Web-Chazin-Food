import { useState, useEffect } from "react";
import {
  Edit,
  Trash2,
  Utensils,
  Tag,
  Eye,
  Zap,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";

export function ProductosTable({
  productos = [],
  onEdit,
  onDelete,
  onView,
  onCreateEvento
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Reset page to 1 when dataset changes (e.g. search or filter applied)
  useEffect(() => {
    setCurrentPage(1);
  }, [productos.length]);

  const totalRecords = productos.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));

  // Ensure current page is within valid range
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalRecords);
  const paginatedProductos = productos.slice(startIndex, endIndex);

  // Helper for generating visible page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (validCurrentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (validCurrentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        pages.push(validCurrentPage - 1);
        pages.push(validCurrentPage);
        pages.push(validCurrentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <th className="px-6 py-4">Producto / Código</th>
              <th className="px-6 py-4">Categoría</th>
              <th className="px-6 py-4">Precio Venta</th>
              <th className="px-6 py-4">Stock Disponible</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
            {totalRecords === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                >
                  <Utensils className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="font-semibold text-gray-700 dark:text-gray-300">
                    No se encontraron productos en el menú
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Prueba ajustando los filtros de búsqueda o categoría
                  </p>
                </td>
              </tr>
            ) : (
              paginatedProductos.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {p.imagen ? (
                        <img
                          src={p.imagen}
                          alt={p.nombre}
                          className="w-10 h-10 rounded-xl object-cover border border-gray-200 dark:border-gray-700 shrink-0 shadow-2xs"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/30 text-[#F05454] flex items-center justify-center shrink-0">
                          <Utensils className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                          {p.nombre}
                        </div>
                        <div className="text-xs text-gray-400 font-mono">
                          {p.codigo || `PRD-${p.id}`}
                        </div>
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
                    {Number(p.stockDisponible !== undefined ? p.stockDisponible : (p.stock !== undefined ? p.stock : 50)) > 0 ? (
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          Number(p.stockDisponible || p.stock) <= 5
                            ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                            : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                        }`}
                        title={p.hasFicha ? "Stock disponible calculado a partir de insumos en bodega" : "Stock disponible en catálogo"}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${Number(p.stockDisponible || p.stock) <= 5 ? "bg-amber-500" : "bg-emerald-500 animate-pulse"}`} />
                        <span>{p.stockDisponible !== undefined ? p.stockDisponible : p.stock} porciones</span>
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/50"
                        title="Insumos insuficientes para preparar este producto"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        <span>Agotado (0)</span>
                      </span>
                    )}
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
                        title="Crear Evento / Promoción"
                        className="p-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-600 dark:text-purple-400 transition-colors cursor-pointer"
                      >
                        <Zap className="w-4 h-4" />
                      </button>
                      {/* Ver */}
                      <button
                        onClick={() => onView && onView(p)}
                        title="Ver detalle del producto"
                        className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {/* Editar */}
                      <button
                        onClick={() => onEdit(p)}
                        title="Editar producto"
                        className="p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 transition-colors cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {/* Eliminar */}
                      <button
                        onClick={() => onDelete(p.id, p.nombre)}
                        title="Eliminar producto"
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors cursor-pointer"
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

      {/* Pagination Footer */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400 bg-gray-50/30 dark:bg-gray-800/20">
        {/* Page size selector */}
        <div className="flex items-center gap-2">
          <span>Mostrar:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium outline-none focus:ring-2 focus:ring-[#F05454]/40 cursor-pointer text-xs"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>productos por página</span>
        </div>

        {/* Counter Info */}
        <div className="font-medium text-gray-600 dark:text-gray-400">
          Mostrando{" "}
          <span className="font-bold text-gray-900 dark:text-gray-100">
            {totalRecords === 0 ? 0 : startIndex + 1}
          </span>{" "}
          a{" "}
          <span className="font-bold text-gray-900 dark:text-gray-100">
            {endIndex}
          </span>{" "}
          de{" "}
          <span className="font-bold text-gray-900 dark:text-gray-100">
            {totalRecords}
          </span>{" "}
          productos
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-1">
          {/* First page */}
          <button
            onClick={() => setCurrentPage(1)}
            disabled={validCurrentPage === 1}
            title="Primera página"
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer disabled:cursor-not-allowed text-gray-600 dark:text-gray-300"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          {/* Previous page */}
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={validCurrentPage === 1}
            title="Página anterior"
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer disabled:cursor-not-allowed text-gray-600 dark:text-gray-300"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Numeric page buttons */}
          <div className="flex items-center gap-1 px-1">
            {getPageNumbers().map((page, index) =>
              page === "..." ? (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 py-1 text-gray-400 select-none text-xs"
                >
                  ...
                </span>
              ) : (
                <button
                  key={`page-${page}`}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center transition cursor-pointer ${
                    validCurrentPage === page
                      ? "bg-[#F05454] text-white shadow-2xs"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {page}
                </button>
              )
            )}
          </div>

          {/* Next page */}
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={validCurrentPage === totalPages || totalRecords === 0}
            title="Página siguiente"
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer disabled:cursor-not-allowed text-gray-600 dark:text-gray-300"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Last page */}
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={validCurrentPage === totalPages || totalRecords === 0}
            title="Última página"
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer disabled:cursor-not-allowed text-gray-600 dark:text-gray-300"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
