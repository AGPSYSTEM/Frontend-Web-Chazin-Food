import { useState } from "react";
import { Eye, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, RotateCcw, AlertTriangle, CheckCircle, PackageX, UserCheck } from "lucide-react";

export function DevolucionesTable({
  devoluciones = [],
  onViewDetail,
  onResolve,
  canManage = true
}) {
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const totalRecords = devoluciones.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedDevoluciones = devoluciones.slice(startIndex, startIndex + pageSize);

  const formatCurrency = (val) => {
    const num = Number(val || 0);
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    }).format(num);
  };

  const getEstadoBadge = (estado) => {
    const est = String(estado || "PENDIENTE").toUpperCase();
    switch (est) {
      case "PENDIENTE":
        return {
          label: "Pendiente",
          classes: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60"
        };
      case "APROBADA":
        return {
          label: "Aprobada",
          classes: "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60"
        };
      case "COMPLETADA":
        return {
          label: "Completada",
          classes: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
        };
      case "RECHAZADA":
        return {
          label: "Rechazada",
          classes: "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60"
        };
      default:
        return {
          label: estado,
          classes: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
        };
    }
  };

  const getMotivoBadge = (motivo) => {
    const m = String(motivo || "").toLowerCase();
    if (m.includes("mal estado")) {
      return "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50";
    }
    return "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50";
  };

  const getResolucionBadge = (resolucion) => {
    const r = String(resolucion || "").toLowerCase();
    if (r.includes("dinero") && r.includes("cambio")) {
      return "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50";
    }
    if (r.includes("dinero")) {
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50";
    }
    return "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50";
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse table-auto">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800 text-[11px] font-bold text-gray-400 dark:text-gray-400 tracking-wider uppercase">
              <th className="px-3.5 py-3 whitespace-nowrap">DEVOLUCIÓN</th>
              <th className="px-3.5 py-3 whitespace-nowrap">VENTA ASOCIADA</th>
              <th className="px-3.5 py-3 whitespace-nowrap">CLIENTE</th>
              <th className="px-3.5 py-3 whitespace-nowrap">MOTIVO POLÍTICA</th>
              <th className="px-3.5 py-3 whitespace-nowrap">RESOLUCIÓN</th>
              <th className="px-3.5 py-3 text-center whitespace-nowrap">PRODUCTOS</th>
              <th className="px-3.5 py-3 text-right whitespace-nowrap">VALOR</th>
              <th className="px-3.5 py-3 whitespace-nowrap">ESTADO</th>
              <th className="px-3.5 py-3 text-center whitespace-nowrap">ACCIONES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
            {totalRecords === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                      <RotateCcw className="w-6 h-6" />
                    </div>
                    <span className="font-semibold text-gray-700 dark:text-gray-200 text-sm">No hay devoluciones registradas</span>
                    <span className="text-xs text-gray-400">No se encontraron solicitudes que coincidan con los criterios seleccionados.</span>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedDevoluciones.map((d) => {
                const badge = getEstadoBadge(d.estado);
                const clienteNombre = d.cliente?.nombre || d.venta?.cliente?.nombre || "Cliente General";
                const fechaStr = d.fecha
                  ? new Date(d.fecha).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })
                  : "-";
                const prodsCount = Array.isArray(d.productosDevueltos)
                  ? d.productosDevueltos.reduce((acc, p) => acc + Number(p.cantidad || 1), 0)
                  : 0;

                return (
                  <tr
                    key={d.idDevolucion}
                    className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors group"
                  >
                    {/* Código Devolución */}
                    <td className="px-3.5 py-3.5 font-bold text-gray-900 dark:text-white whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-red-600 dark:text-red-400">
                          {d.codigoDevolucion || `DEV-${d.idDevolucion}`}
                        </span>
                        <span className="text-[10px] text-gray-400 block font-normal">{fechaStr}</span>
                      </div>
                    </td>

                    {/* Venta Asociada */}
                    <td className="px-3.5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                          {d.codigoVenta || (d.idVenta ? `VEN-${String(d.idVenta).padStart(4, "0")}` : "-")}
                        </span>
                        {d.politicaInfo?.cumplePlazo && (
                          <span
                            title="Dentro del plazo de 2 días de la política"
                            className="inline-flex items-center text-[10px] text-emerald-600 dark:text-emerald-400"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Cliente */}
                    <td className="px-3.5 py-3.5 whitespace-nowrap">
                      <div className="font-medium text-gray-800 dark:text-gray-200 max-w-[150px] truncate" title={clienteNombre}>
                        {clienteNombre}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {d.cliente?.documento || d.venta?.cliente?.documento || "Sin doc"}
                      </div>
                    </td>

                    {/* Motivo según Política */}
                    <td className="px-3.5 py-3.5 whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-medium ${getMotivoBadge(d.motivo)}`}>
                        {d.motivo}
                      </span>
                    </td>

                    {/* Resolución */}
                    <td className="px-3.5 py-3.5 whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-medium ${getResolucionBadge(d.tipoResolucion)}`}>
                        {d.tipoResolucion}
                      </span>
                    </td>

                    {/* Productos */}
                    <td className="px-3.5 py-3.5 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium text-[11px]">
                        <PackageX className="w-3 h-3 text-gray-500" />
                        {prodsCount} {prodsCount === 1 ? "unidad" : "unidades"}
                      </span>
                    </td>

                    {/* Valor devuelto */}
                    <td className="px-3.5 py-3.5 text-right font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                      {Number(d.valorDevuelto || 0) > 0 ? (
                        formatCurrency(d.valorDevuelto)
                      ) : (
                        <span className="text-gray-400 font-normal">N/A (Reposición)</span>
                      )}
                    </td>

                    {/* Estado */}
                    <td className="px-3.5 py-3.5 whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${badge.classes}`}>
                        {badge.label}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="px-3.5 py-3.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onViewDetail && onViewDetail(d)}
                          title="Ver detalle completo"
                          className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {canManage && (d.estado === "PENDIENTE" || d.estado === "APROBADA") && (
                          <button
                            onClick={() => onResolve && onResolve(d)}
                            title="Gestionar / Resolver devolución"
                            className="p-1.5 rounded-lg text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
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
            className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium outline-none"
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
          <span className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-xs mx-1">
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

