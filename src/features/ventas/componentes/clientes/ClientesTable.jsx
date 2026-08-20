import { useState } from "react";
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ShieldAlert, Flame } from "lucide-react";
import { formatNombreCompleto, formatDireccion } from "@/shared/utils/validationUtils";
import { FidelidadBadge } from "@/shared/components/ui/FidelidadBadge";

export function ClientesTable({ clientes = [], onViewDetail, onEdit, onDelete }) {
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const totalRecords = clientes.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedClientes = clientes.slice(startIndex, startIndex + pageSize);

  const getAvatarBg = (nombre = "") => {
    const firstChar = nombre.charAt(0).toUpperCase();
    if (["A", "B", "C"].includes(firstChar)) return "bg-emerald-500 text-white";
    if (["D", "E", "F", "G"].includes(firstChar)) return "bg-blue-500 text-white";
    if (["H", "I", "J", "K"].includes(firstChar)) return "bg-purple-500 text-white";
    if (["L", "M", "N"].includes(firstChar)) return "bg-indigo-500 text-white";
    if (["O", "P", "Q", "R"].includes(firstChar)) return "bg-amber-500 text-white";
    return "bg-slate-500 text-white";
  };

  const getTipoBadge = (tipo) => {
    switch (tipo) {
      case "VIP":
        return "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300";
      case "Frecuente":
        return "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300";
      case "Regular":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300";
      case "Nuevo":
      default:
        return "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800 text-[11px] font-bold text-gray-400 dark:text-gray-400 tracking-wider uppercase">
              <th className="px-5 py-3.5 w-12">ID</th>
              <th className="px-5 py-3.5">CLIENTE</th>
              <th className="px-5 py-3.5">TELÉFONO</th>
              <th className="px-5 py-3.5">EMAIL</th>
              <th className="px-5 py-3.5 text-center">COMPRAS</th>
              <th className="px-5 py-3.5">TOTAL GASTADO</th>
              <th className="px-5 py-3.5">TIPO</th>
              <th className="px-5 py-3.5">ESTADO</th>
              <th className="px-5 py-3.5 text-center">ACCIONES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
            {totalRecords === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No se encontraron clientes registrados
                </td>
              </tr>
            ) : (
              paginatedClientes.map((c, index) => {
                const tipoCliente = c.tipo || (c.esVip ? "VIP" : "Nuevo");
                const tieneCuenta = c.tieneCuenta !== false && !!c.idUsuario;
                const isActivo = tieneCuenta && (c.estado === "Activo" || c.estado === 1);

                return (
                  <tr key={c.id || index} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400 font-medium text-xs">
                      #{c.id || startIndex + index + 1}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs ${getAvatarBg(c.nombre)}`}>
                          {c.nombre ? c.nombre.charAt(0).toUpperCase() : "C"}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-gray-900 dark:text-gray-100 leading-tight">
                              {formatNombreCompleto(c.nombre, c.apellidos) || "Cliente General"}
                            </p>
                            {!tieneCuenta && (
                              <span title="Sin cuenta de usuario asociada" className="text-amber-500">
                                <ShieldAlert className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-400 mt-0.5 max-w-xs truncate">
                            {formatDireccion(c.direccion)}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-gray-600 dark:text-gray-300 font-medium">
                      {c.telefono || "Sin teléfono"}
                    </td>

                    <td className="px-5 py-4">
                      {c.email ? (
                        <a href={`mailto:${c.email}`} className="text-blue-500 hover:underline font-medium">
                          {c.email}
                        </a>
                      ) : (
                        <span className="text-gray-400 italic">Sin cuenta</span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-gray-800 dark:text-gray-200">{c.compras || 0}</span>
                        <span className="text-[10px] text-orange-600 dark:text-orange-400 font-extrabold flex items-center gap-0.5">
                          <Flame className="w-2.5 h-2.5" />
                          <span>{c.fidelidad?.comprasCiclo !== undefined ? c.fidelidad.comprasCiclo : ((c.compras || 0) % 3)}/3</span>
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-extrabold text-gray-900 dark:text-gray-100">
                      {c.totalGastado || "$0"}
                    </td>

                    <td className="px-5 py-4">
                      <FidelidadBadge
                        tipo={tipoCliente}
                        descuento={c.descuentoPorcentaje}
                        enGracia={c.fidelidad?.enGracia}
                        size="sm"
                      />
                    </td>

                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        isActivo
                          ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                          : "text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/50"
                      }`}>
                        {isActivo ? "Activo" : "Inactivo / Pendiente"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onViewDetail && onViewDetail(c)}
                          title="Ver detalle del cliente"
                          className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onEdit(c)}
                          title="Editar cliente"
                          className="p-1 text-gray-400 hover:text-emerald-500 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onDelete(c.id || c.idCliente, `${c.nombre} ${c.apellidos || ""}`)}
                          title="Eliminar cliente"
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
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
