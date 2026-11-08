import { useState, useEffect } from "react";
import {
  Eye,
  Trash2,
  User,
  Clock,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Check,
  X,
  FileText,
  ClipboardCheck,
  Printer,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChefHat,
  UserCheck
} from "lucide-react";
import { FoodIconBadge } from "@/shared/components/ui/FoodIcon";
import { imprimirComanda } from "../utils/comandaUtils";
import { resolveOrderTimings } from "../utils/tiempoProduccionUtils";

export function ProduccionTable({
  ordenes = [],
  onUpdateEstado,
  onDelete,
  onViewDetails,
  onOpenChecklist,
  canEdit = true,
  canDelete = true
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    setCurrentPage(1);
  }, [ordenes.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNowMs(Date.now());
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const totalRecords = ordenes.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalRecords);
  const paginatedOrdenes = ordenes.slice(startIndex, endIndex);

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

  const getNextStatusConfig = (currentStatus) => {
    switch (currentStatus) {
      case "En Cola":
        return {
          next: "En Preparación",
          label: "En Preparación",
          color: "bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-800"
        };
      case "En Preparación":
        return {
          next: "Listo",
          label: "Listo",
          color: "bg-green-50 hover:bg-green-100 text-green-700 dark:bg-green-900/30 dark:hover:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-800"
        };
      case "Listo":
      case "Listos":
        return {
          next: "Despachado",
          label: "Despachado",
          color: "bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 dark:text-purple-300 border-purple-200 dark:border-purple-800"
        };
      case "Despachado":
        return {
          next: "Entregado",
          label: "Entregado",
          color: "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
        };
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <th className="px-4 py-3 whitespace-nowrap">Orden / Cliente</th>
              <th className="px-4 py-3 text-center whitespace-nowrap">Cant.</th>
              <th className="px-4 py-3 whitespace-nowrap">Responsable Cocina</th>
              <th className="px-4 py-3 whitespace-nowrap">Tiempo / Inicio</th>
              <th className="px-4 py-3 text-center whitespace-nowrap">Turno</th>
              <th className="px-4 py-3 text-center whitespace-nowrap">Estado / Hora</th>
              <th className="px-4 py-3 text-center whitespace-nowrap">Avanza a</th>
              <th className="px-4 py-3 text-center whitespace-nowrap">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
            {totalRecords === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  No se encontraron órdenes de producción
                </td>
              </tr>
            ) : (
              paginatedOrdenes.map((o) => {
                const nextConfig = getNextStatusConfig(o.estado);
                const timings = resolveOrderTimings(o, nowMs);

                return (
                  <tr key={o.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    {/* Orden / Código + Nombre del Cliente Prominente */}
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-2.5">
                        <div className="shrink-0 mt-0.5">
                          <FoodIconBadge name={o.productos?.[0]?.nombre || o.nombreProducto || o.producto || "burger"} size="sm" />
                        </div>
                        <div className="space-y-0.5 max-w-sm">
                          {/* Cliente que recibe la orden (Requisito 9) */}
                          <div className="flex items-center gap-1.5 text-xs text-blue-700 dark:text-blue-300 font-bold">
                            <UserCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="truncate">Cliente: {o.cliente || "Cliente Mostrador"}</span>
                          </div>

                          {/* Platillo / Platillos */}
                          <div className="flex flex-wrap items-center gap-1.5 font-bold text-gray-900 dark:text-gray-100 text-xs sm:text-sm">
                            {Array.isArray(o.productos) && o.productos.length > 2 ? (
                              <>
                                <span>
                                  {o.productos.slice(0, 2).map((p) => `${p.nombre} (x${p.cantidad})`).join(", ")}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => onViewDetails && onViewDetails(o)}
                                  className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 cursor-pointer transition shadow-2xs whitespace-nowrap"
                                  title="Ver todos los platillos en el detalle de la orden"
                                >
                                  +{o.productos.length - 2} más
                                </button>
                              </>
                            ) : (
                              <span>{o.platilloNombre}</span>
                            )}
                            {o.alerta && (
                              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" title="Pedido incompleto registrado en checklist" />
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pt-0.5">
                            <span className="text-[11px] text-gray-400 font-mono font-bold">{o.codigo || `OP-00${o.id}`}</span>
                            {o.mesa && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                                {o.mesa}
                              </span>
                            )}
                            {Array.isArray(o.checklistPreparacion) && o.checklistPreparacion.length > 0 && (
                              <button
                                type="button"
                                onClick={() => (onOpenChecklist ? onOpenChecklist(o) : onViewDetails && onViewDetails(o))}
                                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-black border transition cursor-pointer ${
                                  o.pedidoCompleto
                                    ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                                    : "bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800"
                                }`}
                                title="Ver o actualizar el checklist de verificación del pedido"
                              >
                                <span>{o.pedidoCompleto ? "✅ Completo" : "⚠️ Incompleto"}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Cantidad */}
                    <td className="px-4 py-3 text-center font-black text-gray-900 dark:text-gray-100 whitespace-nowrap text-xs sm:text-sm">
                      x{o.cantidad || 1}
                    </td>

                    {/* Responsable (Cocinero/Chef que está preparando el pedido - Requisito 9) */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-800 dark:text-gray-200">
                        <ChefHat className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>{o.cocinero || o.responsableCocina || o.responsable || "Chef de Turno"}</span>
                      </div>
                    </td>

                    {/* Tiempo / Inicio (Sincronizado con Recetas, Hora Colombia y Tiempo Estimado) */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex flex-col text-xs space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-gray-800 dark:text-gray-200">
                          <Clock className="w-3.5 h-3.5 text-[#F05454] shrink-0" />
                          <span title="Tiempo total de cocción en cocina según recetas">{timings.tiempoPreparacion}</span>
                          {timings.elapsedInfo && (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${
                                timings.elapsedInfo.level === "fresh"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                                  : timings.elapsedInfo.level === "warning"
                                  ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                                  : timings.elapsedInfo.level === "critical"
                                  ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800"
                                  : "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                              }`}
                            >
                              {timings.elapsedInfo.text}
                            </span>
                          )}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400 font-mono text-[11px] flex items-center gap-1.5">
                          <span>Pedido: {timings.horaPedido}</span>
                          {!timings.esDeHoy && timings.fechaColombia && (
                            <span className="text-[10px] px-1 py-0.2 rounded bg-gray-100 dark:bg-gray-800 text-gray-500">
                              {timings.fechaColombia}
                            </span>
                          )}
                        </div>
                        {timings.tiempoEstimadoEntrega && (
                          <div className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                            Entrega est.: {timings.tiempoEstimadoEntrega}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Prioridad Secuencial (Turno de Preparación en Cocina) */}
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {o.prioridad ? (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black shadow-2xs ${
                            o.prioridad === 1
                              ? "bg-red-500 text-white ring-2 ring-red-300 dark:ring-red-900"
                              : o.prioridad === 2
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                              : "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                          }`}
                        >
                          <span>Turno #{o.prioridad}</span>
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500 text-xs font-medium">
                          -
                        </span>
                      )}
                    </td>

                    {/* Estado de Cocina + HORA DEL ESTADO (Requisitos 2 y 5) */}
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                            o.estado === "En Preparación"
                              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                              : o.estado === "Listo" || o.estado === "Listos"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                              : o.estado === "Despachado"
                              ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                              : o.estado === "Entregado"
                              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                              : "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                          }`}
                        >
                          {o.estado === "En Cola" && <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />}
                          {o.estado === "En Preparación" && <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400" />}
                          {(o.estado === "Listo" || o.estado === "Listos") && <Check className="w-3 h-3 text-green-600 dark:text-green-400" />}
                          {o.estado === "Entregado" && <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}
                          <span>{o.estado}</span>
                        </span>
                        {/* Hora contextual del estado actual en zona horaria Colombia (America/Bogota) */}
                        <span className="text-[10px] font-mono font-bold text-gray-600 dark:text-gray-300 flex items-center gap-1 bg-gray-50 dark:bg-gray-800/60 px-2 py-0.5 rounded-md border border-gray-200/60 dark:border-gray-700/60">
                          <Clock className="w-2.5 h-2.5 text-gray-400" />
                          <span>{timings.etiquetaHoraEstado}</span>
                        </span>
                      </div>
                    </td>

                    {/* Avanza a */}
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {nextConfig && canEdit ? (
                        <button
                          type="button"
                          onClick={() => onUpdateEstado && onUpdateEstado(o.id, nextConfig.next, o)}
                          title={nextConfig.next === "Listo" ? "Abrir Checklist de Verificación y pasar a Listo" : `Avanzar estado a: ${nextConfig.next}`}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95 ${nextConfig.color}`}
                        >
                          {nextConfig.next === "Listo" && <ClipboardCheck className="w-3.5 h-3.5" />}
                          <span>{nextConfig.next === "Listo" ? "Verificar y Listo" : nextConfig.label}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : !nextConfig ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Completado</span>
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>

                    {/* Acciones (Eye, Imprimir Comanda, Trash) */}
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        {/* Imprimir Comanda (Requisito 6) */}
                        <button
                          type="button"
                          onClick={() => imprimirComanda(o)}
                          title="Imprimir comanda para cocina"
                          className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-600 dark:text-amber-400 transition-colors cursor-pointer"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {/* View details (Eye) */}
                        <button
                          type="button"
                          onClick={() => onViewDetails && onViewDetails(o)}
                          title="Ver detalles de la orden"
                          className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => onDelete && onDelete(o.id)}
                            title="Eliminar orden"
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Paginador Compacto (Requisito 1: Poner paginador y ajustarlo mejor para evitar el scroll) */}
      <div className="p-3 px-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-400 bg-gray-50/30 dark:bg-gray-800/20">
        <div className="flex items-center gap-2">
          <span>Mostrar:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2 py-1 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium outline-none focus:ring-2 focus:ring-[#F05454]/40 cursor-pointer text-xs"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>órdenes por página</span>
        </div>

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
          órdenes
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={validCurrentPage === 1}
            title="Primera página"
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer disabled:cursor-not-allowed text-gray-600 dark:text-gray-300"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={validCurrentPage === 1}
            title="Página anterior"
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer disabled:cursor-not-allowed text-gray-600 dark:text-gray-300"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1 px-1">
            {getPageNumbers().map((page, index) =>
              page === "..." ? (
                <span
                  key={`ellipsis-${index}`}
                  className="px-1.5 py-0.5 text-gray-400 select-none text-xs"
                >
                  ...
                </span>
              ) : (
                <button
                  key={`page-${page}`}
                  onClick={() => setCurrentPage(page)}
                  className={`w-6 h-6 rounded-md font-bold text-xs flex items-center justify-center transition cursor-pointer ${
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

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={validCurrentPage === totalPages || totalRecords === 0}
            title="Página siguiente"
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer disabled:cursor-not-allowed text-gray-600 dark:text-gray-300"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={validCurrentPage === totalPages || totalRecords === 0}
            title="Última página"
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer disabled:cursor-not-allowed text-gray-600 dark:text-gray-300"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
