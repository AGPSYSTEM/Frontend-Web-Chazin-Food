import { useState } from "react";
import { Eye, CheckCircle2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

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
    if (tipo === "En Mesa") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100/70 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300">
          <span>🍽️</span> En Mesa
        </span>
      );
    }
    if (tipo === "Recoger") {
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
    if (metodo === "Tarjeta") {
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
      {/* Cards List matching reference screenshots */}
      <div className="space-y-4">
        {paginatedVentas.map((v) => (
          <div
            key={v.id}
            className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-2xs space-y-3 transition-all hover:shadow-xs"
          >
            {/* Header row: Code & Pagado badge */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 tracking-wide">
                {v.numeroVenta || v.codigoPedido || `PED-${String(v.id).padStart(3, "0")}`}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100/80 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{v.estadoPago || "Pagado"}</span>
              </span>
            </div>

            {/* Second row: Client name & Payment Method */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {v.clienteNombre || v.cliente || "Cliente General"}
              </h3>
              <div>{getMetodoIcon(v.metodoPago)}</div>
            </div>

            {/* Third row: Time */}
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {v.fecha ? new Date(v.fecha).toISOString().split("T")[0] : "2026-08-06"}{" "}
              {v.horario || "12:30 – 12:48"}
            </div>

            {/* Fourth row: Delivery Type Badge */}
            <div>{getEntregaBadge(v.tipoEntrega)}</div>

            {/* Fifth row: Total amount & Ver detalle button */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-gray-800">
              <div className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
                ${Number(v.subtotal || v.total || 0).toLocaleString("es-CO")}
              </div>
              <button
                onClick={() => onViewDetail && onViewDetail(v)}
                className="text-[#F05454] hover:text-red-600 font-semibold text-sm inline-flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>Ver detalle</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Footer */}
      {ventas.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800">
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
