import { useState, useEffect } from "react";
import { Eye, FileText, Calendar, XCircle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ShoppingCart } from "lucide-react";

const estadoConfig = {
  RECIBIDA:   { cls: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300", label: "Confirmada" },
  Recibida:   { cls: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300", label: "Confirmada" },
  Completada: { cls: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300", label: "Confirmada" },
  CANCELADA:  { cls: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300", label: "Cancelada" },
  Anulada:    { cls: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300", label: "Anulada" },
};

function esEstadoRecibida(estado) {
  const e = String(estado || "").toUpperCase();
  return e === "RECIBIDA" || e === "COMPLETADA";
}
function esEstadoCancelada(estado) {
  const e = String(estado || "").toUpperCase();
  return e === "CANCELADA" || e === "ANULADA";
}

export function ComprasTable({ compras = [], onViewDetail, onCancelar, procesandoId = null }) {
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Resetear a página 1 cuando cambia el resultado de búsqueda o filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [compras.length]);

  const totalRecords = compras.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginated = compras.slice(startIndex, startIndex + pageSize);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <th className="px-6 py-4">Factura / Orden</th>
              <th className="px-6 py-4">Proveedor</th>
              <th className="px-6 py-4">Fecha</th>
              <th className="px-6 py-4">Ítems</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4 text-center">Estado</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
            {totalRecords === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No se encontraron órdenes de compra
                </td>
              </tr>
            ) : (
              paginated.map((c) => {
                const estadoInfo = estadoConfig[c.estado] || {
                  cls: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300",
                  label: c.estado || "Desconocido",
                };
                const fecha = c.fechaCompra || c.fecha;
                const estaRecibida = esEstadoRecibida(c.estado);
                const estaCancelada = esEstadoCancelada(c.estado);
                const numItems = c.detalles?.length || c.items?.length || 0;

                return (
                  <tr key={c.id || c.idCompra} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          estaCancelada
                            ? "bg-red-50 dark:bg-red-900/30 text-red-400"
                            : estaRecibida
                            ? "bg-green-50 dark:bg-green-900/30 text-green-600"
                            : "bg-red-50 dark:bg-red-900/30 text-[#F05454]"
                        }`}>
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-gray-100">
                            {c.numeroFactura || `OC-${String(c.id || c.idCompra).padStart(4, "0")}`}
                          </div>
                          <div className="text-xs text-gray-400 font-mono">ID: #{c.id || c.idCompra}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                      {c.proveedorNombre && c.proveedorNombre !== "Sin proveedor" && c.proveedorNombre !== "Proveedor Genérico" && c.proveedorNombre !== "Proveedor Desconocido" ? (
                        c.proveedorNombre
                      ) : (
                        <span className="text-gray-400 italic font-normal text-xs bg-gray-50 dark:bg-gray-800 px-2.5 py-1 rounded-lg border border-gray-100 dark:border-gray-700 inline-block">
                          Sin proveedor
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 text-xs">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {fecha
                          ? new Date(fecha).toLocaleDateString("es-CO", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "Sin fecha"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {numItems > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                          <ShoppingCart className="w-3 h-3" />
                          {numItems} {numItems === 1 ? "ítem" : "ítems"}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-gray-100">
                      ${Number(c.total || 0).toLocaleString("es-CO")}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${estadoInfo.cls}`}>
                        {estadoInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        {!estaCancelada && onCancelar && (
                          <button
                            onClick={() => onCancelar(c.id || c.idCompra)}
                            disabled={procesandoId === (c.id || c.idCompra)}
                            title="Anular compra (revierte stock)"
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => onViewDetail(c)}
                          title="Ver Detalle"
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
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
