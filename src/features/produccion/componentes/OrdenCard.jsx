import { User, Clock, AlertCircle, Eye, Check, X } from "lucide-react";

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

  const isPorAprobar = orden.estado === "Por Aprobar" || orden.estadoAprobacion === "PENDIENTE";
  const isRechazado = orden.estado === "Rechazado" || orden.estadoAprobacion === "RECHAZADO" || orden.estado === "Anulada";
  const nextConfig = getNextStatusConfig(orden.estado);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl p-5 border shadow-sm transition-all hover:shadow-md space-y-4 ${
      isPorAprobar
        ? "border-amber-200 dark:border-amber-800/60 ring-1 ring-amber-100 dark:ring-amber-900/30"
        : isRechazado
        ? "border-rose-200 dark:border-rose-800/60 opacity-75"
        : "border-gray-100 dark:border-gray-700/80"
    }`}>
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="text-3xl select-none shrink-0">{orden.imagen || "🍔"}</div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-gray-100 text-base leading-tight">
              {orden.platilloNombre}
            </h4>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-mono mt-0.5">
              {orden.codigo || `OP-00${orden.id}`} · x{orden.cantidad || 1}
            </p>
          </div>
        </div>

        {/* Top Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {(orden.alerta || isPorAprobar) && (
            <button
              type="button"
              title={isPorAprobar ? "Pendiente de aprobación" : "Alerta de orden"}
              className={`transition-colors p-1 ${isPorAprobar ? "text-amber-500 hover:text-amber-600" : "text-red-500 hover:text-red-600"}`}
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

      {/* Info Row: User & Time */}
      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 font-medium">
        <div className="flex items-center gap-1.5">
          <User className="w-4 h-4 text-gray-400" />
          <span>{orden.responsable || orden.cocinero || "Cliente"}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-gray-400" />
          <span>{orden.tiempo || "15min"}</span>
        </div>
      </div>

      {/* Badges Row */}
      <div className="flex items-center gap-2">
        {/* Priority Badge */}
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
            orden.prioridad === "Alta"
              ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
              : orden.prioridad === "Media"
              ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          }`}
        >
          {orden.prioridad || "Normal"}
        </span>

        {/* Status Badge */}
        <span
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
            isPorAprobar
              ? "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300"
              : isRechazado
              ? "bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300"
              : orden.estado === "En Preparación"
              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
              : orden.estado === "Listo"
              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
              : orden.estado === "Despachado"
              ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
              : orden.estado === "Entregado"
              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          }`}
        >
          {isPorAprobar && <Clock className="w-3 h-3" />}
          {isRechazado && <X className="w-3 h-3" />}
          <span>{isPorAprobar ? "Por Aprobar" : isRechazado ? "Rechazado" : orden.estado}</span>
        </span>
      </div>

      {/* Bottom Action Buttons */}
      {isPorAprobar ? (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onUpdateEstado && onUpdateEstado(orden.id, "Aprobado")}
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Aprobar</span>
          </button>
          <button
            type="button"
            onClick={() => onUpdateEstado && onUpdateEstado(orden.id, "Rechazado")}
            className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>Rechazar</span>
          </button>
        </div>
      ) : isRechazado ? (
        <div className="w-full py-2.5 bg-rose-50/50 dark:bg-rose-900/10 border border-rose-200/60 dark:border-rose-800/40 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 flex items-center justify-center gap-1.5">
          <X className="w-4 h-4" />
          <span>Pedido Rechazado</span>
        </div>
      ) : nextConfig && (
        <button
          type="button"
          onClick={() => onUpdateEstado && onUpdateEstado(orden.id, nextConfig.next)}
          className="w-full py-2.5 bg-gray-50/80 hover:bg-gray-100 dark:bg-gray-900/60 dark:hover:bg-gray-700/80 border border-gray-200/80 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center justify-center gap-1.5 transition-all shadow-2xs hover:shadow-xs cursor-pointer"
        >
          <span>{nextConfig.label}</span>
        </button>
      )}
    </div>
  );
}
