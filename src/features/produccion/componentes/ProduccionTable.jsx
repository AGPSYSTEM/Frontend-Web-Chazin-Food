import { Eye, Trash2, User, Clock, AlertCircle, ArrowRight, CheckCircle2, Check, X, FileText } from "lucide-react";
import { FoodIconBadge } from "@/shared/components/ui/FoodIcon";

export function ProduccionTable({ ordenes = [], onUpdateEstado, onDelete, onViewDetails, canEdit = true, canDelete = true }) {
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
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <th className="px-6 py-4 whitespace-nowrap">Orden / Código</th>
              <th className="px-6 py-4 text-center whitespace-nowrap">Cantidad</th>
              <th className="px-6 py-4 whitespace-nowrap">Responsable</th>
              <th className="px-6 py-4 whitespace-nowrap">Tiempo / Fecha</th>
              <th className="px-6 py-4 text-center whitespace-nowrap">Prioridad</th>
              <th className="px-6 py-4 text-center whitespace-nowrap">Estado</th>
              <th className="px-6 py-4 text-center whitespace-nowrap">Avanza a</th>
              <th className="px-6 py-4 text-center whitespace-nowrap">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
            {ordenes.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No se encontraron órdenes de producción
                </td>
              </tr>
            ) : (
              ordenes.map((o) => {
                const nextConfig = getNextStatusConfig(o.estado);

                return (
                  <tr key={o.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    {/* Orden / Código */}
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 mt-0.5">
                          <FoodIconBadge name={o.productos?.[0]?.nombre || o.nombreProducto || o.producto || "burger"} size="sm" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5 font-bold text-gray-900 dark:text-gray-100">
                            {Array.isArray(o.productos) && o.productos.length > 2 ? (
                              <>
                                <span>
                                  {o.productos.slice(0, 2).map((p) => `${p.nombre} (x${p.cantidad})`).join(", ")}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => onViewDetails && onViewDetails(o)}
                                  className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 cursor-pointer transition shadow-2xs whitespace-nowrap"
                                  title="Ver todos los platillos en el detalle de la orden"
                                >
                                  +{o.productos.length - 2} platillos más
                                </button>
                              </>
                            ) : (
                              <span>{o.platilloNombre}</span>
                            )}
                            {o.alerta && (
                              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" title="Alerta especial en orden" />
                            )}
                          </div>
                          <div className="text-xs text-gray-400 font-mono">{o.codigo || `OP-00${o.id}`}</div>

                          {/* Badges de Adiciones y Observaciones (primeros 2 para no sobrecargar la fila) */}
                          {Array.isArray(o.productos) && (
                            <div className="space-y-1 pt-0.5 max-w-sm">
                              {o.productos.slice(0, 2).map((prod, pIdx) => {
                                const adds = Array.isArray(prod.adiciones) ? prod.adiciones : [];
                                const obs = prod.observaciones || prod.observacion || "";
                                if (adds.length === 0 && !obs) return null;
                                return (
                                  <div key={pIdx} className="text-[11px] space-y-0.5">
                                    {adds.length > 0 && (
                                      <div className="flex flex-wrap gap-1">
                                        {adds.map((ad, aIdx) => (
                                          <span
                                            key={aIdx}
                                            className="px-1.5 py-0.5 bg-red-50 dark:bg-red-950/40 text-[#F05454] dark:text-red-300 font-bold rounded text-[10px] border border-red-100 dark:border-red-900/50"
                                          >
                                            + {typeof ad === "object" ? ad.nombre : String(ad)}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                    {obs && (
                                      <div
                                        className="text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded text-[10px] font-medium italic border border-amber-200 dark:border-amber-900/50 inline-flex items-center gap-1 max-w-full truncate"
                                        title={obs}
                                      >
                                        <FileText className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                                        <span className="truncate">Nota: {obs}</span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                              {o.productos.length > 2 && o.productos.slice(2).some(p => (Array.isArray(p.adiciones) && p.adiciones.length > 0) || p.observaciones) && (
                                <button
                                  type="button"
                                  onClick={() => onViewDetails && onViewDetails(o)}
                                  className="text-[10px] font-bold text-gray-400 hover:text-[#F05454] transition cursor-pointer"
                                >
                                  + más adiciones en detalle →
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Cantidad */}
                    <td className="px-6 py-4 text-center font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                      x{o.cantidad || 1}
                    </td>

                    {/* Responsable */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                        <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{o.responsable || o.cocinero || "Cliente"}</span>
                      </div>
                    </td>

                    {/* Tiempo / Fecha */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col text-xs space-y-0.5">
                        <div className="flex items-center gap-1 font-semibold text-gray-800 dark:text-gray-200">
                          <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>{o.tiempo || "15 min"}</span>
                        </div>
                        <div className="text-gray-400 font-mono text-[11px] pl-4">
                          {o.fecha || "2026-06-23"}
                        </div>
                      </div>
                    </td>

                    {/* Prioridad Secuencial (Turno de Preparación en Cocina - Ítem 117) */}
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      {o.prioridad ? (
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black shadow-2xs ${
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

                    {/* Estado de Cocina */}
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
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
                        {o.estado === "En Cola" && <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
                        {o.estado === "En Preparación" && <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                        {(o.estado === "Listo" || o.estado === "Listos") && <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />}
                        {o.estado === "Entregado" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                        <span>{o.estado}</span>
                      </span>
                    </td>

                    {/* Avanza a */}
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      {nextConfig && canEdit ? (
                        <button
                          type="button"
                          onClick={() => onUpdateEstado && onUpdateEstado(o.id, nextConfig.next)}
                          title={`Avanzar estado a: ${nextConfig.next}`}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95 ${nextConfig.color}`}
                        >
                          <span>{nextConfig.label}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : !nextConfig ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Completado</span>
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>

                    {/* Acciones (Eye & Trash icons perfectly aligned) */}
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* View details (Eye) */}
                        <button
                          type="button"
                          onClick={() => onViewDetails && onViewDetails(o)}
                          title="Ver detalles de la orden"
                          className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => onDelete && onDelete(o.id)}
                            title="Eliminar orden"
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
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
    </div>
  );
}
