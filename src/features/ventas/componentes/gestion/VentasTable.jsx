import { useState } from "react";
import { Eye, TrendingUp, Calendar, Clock, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

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

  const getEntregaBadge = (tipo) => {
    const tipoNormalized = (tipo || "").toLowerCase();
    if (tipoNormalized.includes("mesa")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100/70 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300">
          <span>🍽️</span> En Mesa
        </span>
      );
    }
    if (tipoNormalized.includes("recoger") || tipoNormalized.includes("para llevar")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100/70 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300">
          <span>🏪</span> Recoger
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100/70 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300">
        <span>🛵</span> Domicilio
      </span>
    );
  };

  const getMetodoIcon = (metodo) => {
    const metodoNormalized = (metodo || "").toLowerCase();
    if (metodoNormalized.includes("tarjeta")) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
          <span>💳</span> Tarjeta
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
        <span>💵</span> Efectivo
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Clean CRUD Table matching system standards */}
      <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/70 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <th className="px-5 py-3.5 whitespace-nowrap">N° Factura / Pedido</th>
              <th className="px-5 py-3.5 whitespace-nowrap">Cliente</th>
              <th className="px-5 py-3.5 whitespace-nowrap">Fecha & Horario</th>
              <th className="px-5 py-3.5 whitespace-nowrap">Entrega</th>
              <th className="px-5 py-3.5 whitespace-nowrap">Método de Pago</th>
              <th className="px-5 py-3.5 whitespace-nowrap">Monto Total</th>
              <th className="px-5 py-3.5 whitespace-nowrap">Estado</th>
              <th className="px-5 py-3.5 whitespace-nowrap text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
            {paginatedVentas.map((v) => {
              const clienteNombre = typeof v.cliente === "string" ? v.cliente : (v.clienteNombre || v.cliente?.nombre || "Cliente General");
              const codigoPedido = v.numeroVenta || v.codigoPedido || `PED-${String(v.id).padStart(3, "0")}`;

              return (
                <tr key={v.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  {/* N° Factura / Pedido */}
                  <td className="px-5 py-4 whitespace-nowrap align-middle">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-gray-100">
                          {codigoPedido}
                        </div>
                        <div className="text-xs text-gray-400 font-mono">ID: #{v.id}</div>
                      </div>
                    </div>
                  </td>

                  {/* Cliente */}
                  <td className="px-5 py-4 whitespace-nowrap align-middle font-bold text-gray-900 dark:text-gray-100">
                    {clienteNombre}
                  </td>

                  {/* Fecha & Horario */}
                  <td className="px-5 py-4 whitespace-nowrap align-middle text-gray-600 dark:text-gray-300 text-xs">
                    <div className="flex items-center gap-1.5 font-medium text-gray-800 dark:text-gray-200">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>
                        {v.fecha ? new Date(v.fecha).toISOString().split("T")[0] : "2026-08-06"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5 font-mono">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span>{v.horario || "12:30 – 12:48"}</span>
                    </div>
                  </td>

                  {/* Entrega */}
                  <td className="px-5 py-4 whitespace-nowrap align-middle">{getEntregaBadge(v.tipoEntrega)}</td>

                  {/* Método de Pago */}
                  <td className="px-5 py-4 whitespace-nowrap align-middle">{getMetodoIcon(v.metodoPago)}</td>

                  {/* Monto Total */}
                  <td className="px-5 py-4 whitespace-nowrap align-middle font-extrabold text-gray-900 dark:text-gray-100 text-base">
                    ${Number(v.total || v.subtotal || 0).toLocaleString("es-CO")}
                  </td>

                  {/* Estado Select Badge */}
                  <td className="px-5 py-4 whitespace-nowrap align-middle">
                    <select
                      value={v.estado || "Completada"}
                      onChange={(e) => onUpdateEstado && onUpdateEstado(v.id, e.target.value)}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500/50 appearance-none text-center ${
                        v.estado === "Completada" || v.estado === "Entregado" || v.estado === "Listo"
                          ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
                          : v.estado === "En Preparación" || v.estado === "Pendiente"
                          ? "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300"
                          : "bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300"
                      }`}
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="En Preparación">En Preparación</option>
                      <option value="Listo">Listo</option>
                      <option value="Completada">Completada</option>
                      <option value="Anulada">Anulada</option>
                    </select>
                  </td>

                  {/* Acciones */}
                  <td className="px-5 py-4 whitespace-nowrap align-middle text-right">
                    <button
                      onClick={() => onViewDetail && onViewDetail(v)}
                      title="Ver Detalle del Pedido"
                      className="px-3 py-1.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 text-[#F05454] hover:text-red-600 transition-colors cursor-pointer inline-flex items-center gap-1.5 font-semibold text-xs"
                    >
                      <Eye className="w-4 h-4 text-[#F05454]" />
                      <span>Ver detalle</span>
                    </button>
                  </td>
                </tr>
              );
            })}
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
              className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg font-medium text-gray-700 dark:text-gray-200 cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>registros por página</span>
          </div>

          <div className="flex items-center gap-4">
            <span>
              Página {currentPage} de {totalPages} ({ventas.length} registros en total)
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Primera página"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Página anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-2.5 py-1 bg-[#1e293b] text-white font-semibold rounded-lg text-xs">
                {currentPage}
              </span>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Página siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Última página"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
