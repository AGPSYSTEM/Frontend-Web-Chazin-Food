import { useState } from "react";
import { Eye, TrendingUp, Calendar, Clock, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { formatNombreCompleto } from "@/shared/utils/validationUtils";
import { FidelidadBadge } from "@/shared/components/ui/FidelidadBadge";

function formatDateSafe(dateVal, fallback = "Hoy") {
  if (!dateVal) return fallback;
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal).slice(0, 10) || fallback;
    return d.toLocaleDateString("es-CO", { timeZone: "America/Bogota", year: "numeric", month: "2-digit", day: "2-digit" });
  } catch (e) {
    return String(dateVal).slice(0, 10) || fallback;
  }
}

function formatTimeSafe(dateVal, fallbackHorario = "12:30 PM") {
  if (dateVal) {
    try {
      const d = new Date(dateVal);
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString("es-CO", { timeZone: "America/Bogota", hour: "2-digit", minute: "2-digit", hour12: true });
      }
    } catch (e) {}
  }
  return fallbackHorario;
}

export function VentasTable({ ventas = [], onViewDetail, onUpdateEstado }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalRecords = ventas.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
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
    if (metodoNormalized.includes("transfer") || metodoNormalized.includes("nequi") || metodoNormalized.includes("davi")) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
          <span>📱</span> Transferencia
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
            <tr className="bg-gray-50/70 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-[11px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider">
              <th className="px-5 py-3.5 whitespace-nowrap">ID</th>
              <th className="px-5 py-3.5 whitespace-nowrap">CLIENTE</th>
              <th className="px-5 py-3.5 whitespace-nowrap">FECHA</th>
              <th className="px-5 py-3.5 whitespace-nowrap">HORA</th>
              <th className="px-5 py-3.5 whitespace-nowrap">ENTREGA</th>
              <th className="px-5 py-3.5 whitespace-nowrap">MÉTODO</th>
              <th className="px-5 py-3.5 whitespace-nowrap">TOTAL</th>
              <th className="px-5 py-3.5 whitespace-nowrap">ESTADO</th>
              <th className="px-5 py-3.5 whitespace-nowrap text-right">ACCIONES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
            {paginatedVentas.map((v) => {
              const rawName = typeof v.cliente === "string" ? v.cliente : (v.clienteNombre || v.cliente?.nombre || "Cliente General");
              const clienteNombre = formatNombreCompleto(rawName) || "Cliente General";
              const codigoPedido = v.numeroVenta || v.codigoPedido || `PED-${String(v.id).padStart(3, "0")}`;
              const initial = clienteNombre.trim().charAt(0).toUpperCase() || "C";
              const descPct = Number(v.descuentoPorcentaje || 0);
              const origPrice = Number(v.subtotal || v.precioOriginal || (descPct > 0 && v.total ? Math.round(v.total / (1 - (descPct / 100))) : (v.subtotal > v.total ? v.subtotal : v.total)));
              const hasDiscount = (descPct > 0) || (origPrice > Number(v.total || 0)) || (Number(v.montoDescuento || 0) > 0);

              return (
                <tr key={v.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  {/* N° Factura / Pedido */}
                  <td className="px-5 py-4 whitespace-nowrap align-middle">
                    <div className="font-bold text-gray-900 dark:text-gray-100">
                      {codigoPedido}
                    </div>
                  </td>

                  {/* Cliente con Avatar e Insignia */}
                  <td className="px-5 py-4 whitespace-nowrap align-middle">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                        {initial}
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-gray-900 dark:text-gray-100">{clienteNombre}</span>
                        {v.clienteFidelidad?.tipo && v.clienteFidelidad.tipo !== "Nuevo" && (
                          <FidelidadBadge
                            tipo={v.clienteFidelidad.tipo}
                            descuento={v.clienteFidelidad.descuentoPorcentaje}
                            size="sm"
                          />
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Fecha */}
                  <td className="px-5 py-4 whitespace-nowrap align-middle text-gray-600 dark:text-gray-300 text-xs">
                    {formatDateSafe(v.fecha || v.fechaVenta, "Hoy")}
                  </td>

                  {/* Hora */}
                  <td className="px-5 py-4 whitespace-nowrap align-middle text-xs font-mono text-gray-600 dark:text-gray-300">
                    {formatTimeSafe(v.fecha || v.fechaVenta, v.horario)}
                  </td>

                  {/* Entrega */}
                  <td className="px-5 py-4 whitespace-nowrap align-middle">{getEntregaBadge(v.tipoEntrega)}</td>

                  {/* Método de Pago */}
                  <td className="px-5 py-4 whitespace-nowrap align-middle">{getMetodoIcon(v.metodoPago)}</td>

                  {/* Monto Total con Descuento Trazado */}
                  <td className="px-5 py-4 whitespace-nowrap align-middle">
                    {hasDiscount ? (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="line-through text-gray-400 font-normal">
                          ${origPrice.toLocaleString("es-CO")}
                        </span>
                        <span className="font-extrabold text-gray-900 dark:text-gray-100 text-sm">
                          ${Number(v.total).toLocaleString("es-CO")}
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-md">
                          -{descPct || Math.round(((origPrice - v.total) / origPrice) * 100)}% desc.
                        </span>
                      </div>
                    ) : (
                      <span className="font-extrabold text-gray-900 dark:text-gray-100 text-sm">
                        ${Number(v.total || v.subtotal || 0).toLocaleString("es-CO")}
                      </span>
                    )}
                  </td>

                  {/* Estado Badge (Verde Pagado) */}
                  <td className="px-5 py-4 whitespace-nowrap align-middle">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100/80 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Pagado
                    </span>
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
            <span>registros</span>
          </div>

          <div className="flex items-center gap-2">
            <span>
              Mostrando {startIndex + 1} a {Math.min(startIndex + pageSize, totalRecords)} de {totalRecords} registros
            </span>
            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Primera página"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Página anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 py-0.5 bg-[#F05454] text-white font-bold rounded-md">
                {currentPage}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Página siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
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
