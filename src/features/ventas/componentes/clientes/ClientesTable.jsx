import { useState } from "react";
import { Edit, Trash2, User, Mail, Phone, MapPin, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

export function ClientesTable({ clientes = [], onEdit, onDelete }) {
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const totalRecords = clientes.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedClientes = clientes.slice(startIndex, startIndex + pageSize);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f8fafc] dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800 text-xs font-bold text-[#1e293b] dark:text-gray-200 tracking-wider uppercase">
              <th className="px-6 py-4 w-16">ID</th>
              <th className="px-6 py-4">CLIENTE</th>
              <th className="px-6 py-4">DOCUMENTO</th>
              <th className="px-6 py-4">CONTACTO</th>
              <th className="px-6 py-4">DIRECCIÓN</th>
              <th className="px-6 py-4">ESTADO</th>
              <th className="px-6 py-4 text-center">ACCIONES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
            {totalRecords === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No se encontraron clientes registrados
                </td>
              </tr>
            ) : (
              paginatedClientes.map((c, index) => (
                <tr key={c.id || index} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-medium">
                    {c.id || startIndex + index + 1}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-[#1e293b] dark:text-gray-100">
                        {c.nombre} {c.apellidos || ""}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-mono text-xs">
                    {c.tipoDocumento || "C.C."} {c.documento || "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-gray-600 dark:text-gray-300 space-y-0.5">
                      {c.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-gray-400" /> {c.email}
                        </div>
                      )}
                      {c.telefono && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-gray-400" /> {c.telefono}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300 text-xs">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                      <span className="truncate max-w-xs">{c.direccion || "N/A"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        c.estado === "Activo" || c.estado === 1
                          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                          : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                      }`}
                    >
                      {c.estado === 1 ? "Activo" : c.estado === 0 ? "Inactivo" : (c.estado || "Activo")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => onEdit(c)}
                        title="Editar cliente"
                        className="text-[#F05454] dark:text-[#F05454] hover:text-[#d84343] transition-colors p-1"
                      >
                        <Edit className="w-4 h-4 stroke-[2]" />
                      </button>
                      <button
                        onClick={() => onDelete(c.id || c.idCliente, `${c.nombre} ${c.apellidos || ""}`)}
                        title="Eliminar cliente"
                        className="text-red-500 dark:text-red-400 hover:text-red-600 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4 stroke-[2]" />
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
