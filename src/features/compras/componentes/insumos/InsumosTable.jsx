import { useState, useEffect } from "react";
import { Eye, Edit, Trash2, Package, Sparkles, ChefHat, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Power, ShoppingCart, AlertTriangle } from "lucide-react";

export function InsumosTable({ insumos = [], onEdit, onDelete, onView, onToggleEstado, onReabastecer, canEdit = true, canDelete = true }) {
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset pagination when insumos length changes (#51)
  useEffect(() => {
    setCurrentPage(1);
  }, [insumos.length]);

  const totalRecords = insumos.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedInsumos = insumos.slice(startIndex, startIndex + pageSize);

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xs overflow-hidden">
      <div className="overflow-x-auto focus:outline-none">
        <table className="w-full text-left border-collapse table-auto">
          <thead>
            <tr className="bg-[#f8fafc] dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800 text-[11px] font-bold text-[#1e293b] dark:text-gray-200 tracking-wider uppercase">
              <th className="px-2.5 py-3 w-10 text-center">ID</th>
              <th className="px-3 py-3 text-left">NOMBRE</th>
              <th className="px-2.5 py-3 text-left">CATEGORÍA</th>
              <th className="px-2 py-3 text-center">CANTIDAD</th>
              <th className="px-2 py-3 text-center">MÍN.</th>
              <th className="px-2 py-3 text-center">MÁX.</th>
              <th className="px-2.5 py-3 text-left">PRECIO / COSTO</th>
              <th className="px-2 py-3 text-center">STOCK</th>
              <th className="px-2 py-3 text-center">ESTADO</th>
              <th className="px-2 py-3 text-center w-24">ACCIONES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs sm:text-sm">
            {totalRecords === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No se encontraron insumos registrados
                </td>
              </tr>
            ) : (
              paginatedInsumos.map((i, index) => {
                const isPreparado = i.tipo === "Preparado";
                const isBajo = (i.stock || 0) <= (i.stockMinimo || 0) && (i.stock || 0) > 0;
                const isAgotado = (i.stock || 0) === 0;
                const tieneLoteVencido = (i.lotes || []).some(
                  (l) => l.estado === "VENCIDO" || (l.fechaVencimiento && l.fechaVencimiento <= todayStr)
                );
                const vencidoDirecto = i.fechaVencimiento && i.fechaVencimiento <= todayStr;
                const estaVencido = tieneLoteVencido || vencidoDirecto;

                const stockLabel = isAgotado ? "Agotado" : isBajo ? "Bajo" : "Normal";
                const stockBadgeClass = isAgotado
                  ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                  : isBajo
                  ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                  : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300";

                return (
                  <tr key={i.id || i.idInsumo || index} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-2.5 py-2.5 text-gray-500 dark:text-gray-400 font-medium text-center text-xs">
                      {i.id || i.idInsumo || startIndex + index + 1}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isPreparado 
                            ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" 
                            : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                        }`}>
                          {isPreparado ? <ChefHat className="w-3.5 h-3.5" /> : <Package className="w-3.5 h-3.5" />}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-[#1e293b] dark:text-gray-100 text-xs sm:text-sm truncate">
                              {i.nombre}
                            </span>
                            {isPreparado && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shrink-0">
                                <ChefHat className="w-2.5 h-2.5 text-purple-500" />
                                <span>Preparado</span>
                              </span>
                            )}
                            {estaVencido && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shrink-0">
                                <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                                <span>Lote Vencido</span>
                              </span>
                            )}
                            {(i.estado === "Inactivo" || i.estado === 0 || i.estado === "0") && (
                              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 shrink-0">
                                Inactivo
                              </span>
                            )}
                          </div>
                          {(i.esAdicion === 1 || i.esAdicion === true || i.esAdicion === "1") && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md text-[10px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                <Sparkles className="w-2.5 h-2.5 text-purple-500" />
                                <span>Adición (+${Number(i.precioAdicion || 0).toLocaleString("es-CO")})</span>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-2.5 py-2.5 text-gray-600 dark:text-gray-300 text-xs">
                      {isPreparado 
                        ? (i.categoriaNombre || (typeof i.categoria === "string" ? i.categoria : "Preparado Interno")) 
                        : (typeof i.categoria === "string" ? i.categoria : (i.categoriaNombre || i.categoria?.nombre || "Sin categoría"))}
                    </td>
                    <td className="px-2 py-2.5 font-semibold text-gray-900 dark:text-gray-100 text-center whitespace-nowrap text-xs">
                      {i.stock ?? 0} {i.unidadMedida || "und"}
                    </td>
                    <td className="px-2 py-2.5 text-gray-700 dark:text-gray-300 font-medium text-center whitespace-nowrap text-xs">
                      {i.stockMinimo !== undefined && i.stockMinimo !== null ? i.stockMinimo : 0} {i.unidadMedida || "und"}
                    </td>
                    <td className="px-2 py-2.5 text-gray-700 dark:text-gray-300 font-medium text-center whitespace-nowrap text-xs">
                      {i.stockMaximo !== undefined && i.stockMaximo !== null ? i.stockMaximo : 100} {i.unidadMedida || "und"}
                    </td>
                    <td className="px-2.5 py-2.5 text-gray-900 dark:text-gray-100 font-medium whitespace-nowrap text-xs">
                      ${Number(i.precioUnitario || i.costo || 0).toLocaleString("es-CO")}
                    </td>
                    <td className="px-2 py-2.5 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${stockBadgeClass}`}>
                        {stockLabel}
                      </span>
                    </td>
                    <td className="px-2 py-2.5 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        i.estado === "Activo"
                          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                      }`}>
                        {i.estado || "Activo"}
                      </span>
                    </td>
                    <td className="px-2 py-2.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        {onReabastecer && (estaVencido || isAgotado || isBajo) && (
                          <button
                            onClick={() => onReabastecer(i)}
                            title="Reabastecer insumo en Compras"
                            className="p-1 rounded-lg text-amber-600 dark:text-amber-400 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors cursor-pointer"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {onToggleEstado && canEdit && (
                          <button
                            onClick={() => onToggleEstado(i)}
                            title={i.estado === "Activo" ? "Inactivar insumo" : "Activar insumo"}
                            className={`p-1 rounded-lg transition-colors cursor-pointer ${
                              i.estado === "Activo"
                                ? "text-emerald-600 dark:text-emerald-400 hover:text-amber-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                : "text-gray-400 hover:text-emerald-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                            }`}
                          >
                            <Power className="w-3.5 h-3.5 stroke-[2.2]" />
                          </button>
                        )}
                        {onView && (
                          <button
                            onClick={() => onView(i)}
                            title="Ver detalles del insumo"
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors p-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 stroke-[2]" />
                          </button>
                        )}
                        {canEdit && (
                          <button
                            onClick={() => onEdit(i)}
                            title="Editar insumo"
                            className="text-[#F05454] dark:text-[#F05454] hover:text-[#d84343] transition-colors p-1 cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5 stroke-[2]" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => onDelete(i.id || i.idInsumo, i.nombre, i.tipo)}
                            title="Eliminar insumo"
                            className="text-red-500 dark:text-red-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
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
