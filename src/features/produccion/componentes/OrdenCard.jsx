import React from "react";
import { User, Clock, AlertCircle, Eye, Check, X, Sparkles, Printer, ChefHat } from "lucide-react";
import { FoodIconBadge } from "@/shared/components/ui/FoodIcon";
import { imprimirComanda } from "../utils/comandaUtils";

export function OrdenCard({ orden, onUpdateEstado, onViewDetails }) {
  // Determine next status and button label
  const getNextStatusConfig = (currentStatus) => {
    switch (currentStatus) {
      case "En Cola":
        return { next: "En Preparación", label: "→ En Preparación >" };
      case "En Preparación":
        return { next: "Listo", label: "→ Listo >" };
      case "Listo":
        return { next: "Despachado", label: "→ Despachado >" };
      case "Despachado":
        return { next: "Entregado", label: "→ Entregado >" };
      case "Entregado":
        return null;
      default:
        return null;
    }
  };

  const nextConfig = getNextStatusConfig(orden.estado);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700/80 shadow-sm transition-all hover:shadow-md space-y-4">
      {/* Cliente encima del pedido (Requerimiento 9) */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-750 text-xs">
        <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 font-medium">
          <User className="w-3.5 h-3.5 text-gray-400" />
          <span>Cliente:</span>
          <strong className="text-gray-900 dark:text-gray-100 font-bold truncate max-w-[150px]">
            {orden.cliente || "Cliente Mostrador"}
          </strong>
        </div>
        {orden.mesa && (
          <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-extrabold text-[11px] border border-blue-200 dark:border-blue-800">
            {orden.mesa}
          </span>
        )}
      </div>

      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <FoodIconBadge
            name={orden.platilloNombre || orden.productos?.[0]?.nombre}
            size="md"
          />
          <div>
            <h4 className="font-bold text-gray-900 dark:text-gray-100 text-base leading-tight">
              {Array.isArray(orden.productos) && orden.productos.length > 2 ? (
                <span>
                  {orden.productos.slice(0, 2).map((p) => `${p.nombre} (x${p.cantidad})`).join(", ")}{" "}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails && onViewDetails(orden);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-bold underline cursor-pointer inline-flex items-center ml-1"
                  >
                    +{orden.productos.length - 2} más
                  </button>
                </span>
              ) : (
                orden.platilloNombre
              )}
            </h4>
            {Array.isArray(orden.productos) && orden.productos.some(p => (p.adiciones && p.adiciones.length > 0) || p.observaciones) && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails && onViewDetails(orden);
                }}
                className="mt-1 text-xs text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 font-semibold text-left cursor-pointer"
              >
                <span className="inline-flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" /><span>Con adiciones / notas personalizadas</span></span>
                <span className="text-[10px] text-gray-400 font-normal">(ver detalle)</span>
              </button>
            )}
            <p className="text-xs text-gray-400 dark:text-gray-500 font-mono mt-0.5">
              {orden.codigo || `OP-00${orden.id}`} · x{orden.cantidad || 1}
            </p>
          </div>
        </div>

        {/* Top Right Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => imprimirComanda(orden)}
            title="Imprimir comanda térmica"
            className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
          </button>
          {orden.alerta && (
            <button
              type="button"
              title="Alerta de orden"
              className="transition-colors p-1 text-red-500 hover:text-red-600"
            >
              <AlertCircle className="w-5 h-5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onViewDetails && onViewDetails(orden)}
            title="Ver detalles"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Info Row: Responsable (Cocinero) & Hora del Estado */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-medium">
        <div className="flex items-center gap-1.5 min-w-0" title="Cocinero / Responsable de preparación">
          <ChefHat className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="truncate">
            Cocinero: <strong className="text-gray-700 dark:text-gray-300 font-bold">{orden.cocinero || orden.responsableCocina || orden.responsable || "En cocina"}</strong>
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 text-emerald-700 dark:text-emerald-400 font-bold" title="Hora del estado actual">
          <Clock className="w-3.5 h-3.5" />
          <span>{orden.horaEstado || orden.horaEstadoCalculada || orden.horaCambioEstado || orden.horaInicio || orden.tiempo || "Reciente"}</span>
        </div>
      </div>

      {/* Badges Row */}
      <div className="flex items-center gap-2">
        {/* Priority Badge - Turno Secuencial */}
        {orden.prioridad ? (
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black shadow-2xs ${
              orden.prioridad === 1
                ? "bg-red-500 text-white ring-2 ring-red-300 dark:ring-red-900"
                : orden.prioridad === 2
                ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                : "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
            }`}
          >
            Turno #{orden.prioridad}
          </span>
        ) : (
          <span className="text-gray-400 text-xs font-medium">-</span>
        )}

        {/* Status Badge */}
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
            orden.estado === "En Preparación"
              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
              : orden.estado === "Listo"
              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
              : orden.estado === "Despachado"
              ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
              : orden.estado === "Entregado"
              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              : "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
          }`}
        >
          {orden.estado === "En Cola" && <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />}
          {orden.estado === "En Preparación" && <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400" />}
          {orden.estado === "Listo" && <Check className="w-3 h-3 text-green-600 dark:text-green-400" />}
          <span>{orden.estado}</span>
        </span>
      </div>

      {/* Bottom Action Button */}
      {nextConfig && (
        <button
          type="button"
          onClick={() => onUpdateEstado && onUpdateEstado(orden.id, nextConfig.next, orden)}
          className="w-full py-2.5 bg-gray-50/80 hover:bg-gray-100 dark:bg-gray-900/60 dark:hover:bg-gray-700/80 border border-gray-200/80 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center justify-center gap-1.5 transition-all shadow-2xs hover:shadow-xs cursor-pointer active:scale-95"
        >
          <span>{nextConfig.next === "Listo" ? "→ Verificar Checklist y Listo >" : nextConfig.label}</span>
        </button>
      )}
    </div>
  );
}

export default OrdenCard;
