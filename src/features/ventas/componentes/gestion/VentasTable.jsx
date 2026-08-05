import { useState } from "react";
import { Eye, TrendingUp, Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

export function VentasTable({ ventas = [], onViewDetail, onUpdateEstado }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalPages = Math.ceil(ventas.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedVentas = ventas.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-gray-800">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/70 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <th className="px-6 py-4">N° Factura / Venta</th>
              <th className="px-6 py-4">Cliente</th>
              <th className="px-6 py-4">Fecha</th>
              <th className="px-6 py-4">Monto Total</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
            {paginatedVentas.map((v) => (
              <tr key={v.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {v.numeroVenta || `VEN-${String(v.id).padStart(4, "0")}`}
                      </div>
                      <div className="text-xs text-gray-400 font-mono">ID: #{v.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                  {v.clienteNombre || v.cliente || "Cliente General"}
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-300 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    {v.fecha ? new Date(v.fecha).toLocaleDateString("es-CO") : "Hoy"}
                  </div>
                </td>
                <td className="px-6 py-4 font-bold text-gray-900 dark:text-gray-100">
                  ${Number(v.total || 0).toLocaleString("es-CO")}
                </td>
                <td className="px-6 py-4">
                  <select
                    value={v.estado || "Completada"}
                    onChange={(e) => onUpdateEstado && onUpdateEstado(v.id, e.target.value)}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer focus:ring-2 focus:ring-[#F05454]/40 ${
                      v.estado === "Completada" || v.estado === "Entregado" || v.estado === "Pagado"
                        ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                        : v.estado === "En Preparación" || v.estado === "Pendiente"
                        ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
                        : "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300"
                    }`}
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="En Preparación">En Preparación</option>
                    <option value="Completada">Completada</option>
                    <option value="Anulada">Anulada</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onViewDetail && onViewDetail(v)}
                    title="Ver Detalle de Venta"
                    className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-rose-500 hover:text-rose-600 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {ventas.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <span>Mostrar:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg font-medium text-gray-700 dark:text-gray-200"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>registros</span>
          </div>

          <div>
            Mostrando {startIndex + 1} a {Math.min(startIndex + pageSize, ventas.length)} de {ventas.length} registros
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="w-8 h-8 rounded-full bg-[#F05454] text-white font-semibold flex items-center justify-center text-xs shadow-xs mx-1">
              {currentPage}
            </span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
