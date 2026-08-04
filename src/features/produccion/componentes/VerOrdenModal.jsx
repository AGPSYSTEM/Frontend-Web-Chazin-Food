import { X, User, Clock, AlertCircle, ChefHat } from "lucide-react";

export function VerOrdenModal({ isOpen, onClose, orden }) {
  if (!isOpen || !orden) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col">
        {/* Header */}
        <div className="bg-gray-900 text-white p-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{orden.imagen || "🍔"}</div>
            <div>
              <h3 className="text-lg font-bold">{orden.platilloNombre}</h3>
              <p className="text-xs text-gray-400 font-mono">
                {orden.codigo || `OP-00${orden.id}`} · Cantidad: {orden.cantidad || 1}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-sm text-gray-700 dark:text-gray-300">
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Responsable</p>
              <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-gray-100 mt-1">
                <User className="w-4 h-4 text-gray-400" />
                <span>{orden.responsable || "Carlos R."}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Tiempo Estimado</p>
              <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-gray-100 mt-1">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>{orden.tiempo || "15min"}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Prioridad</p>
              <span
                className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${
                  orden.prioridad === "Alta"
                    ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                    : orden.prioridad === "Media"
                    ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                {orden.prioridad || "Normal"}
              </span>
            </div>

            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Estado Actual</p>
              <span
                className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${
                  orden.estado === "En Preparación"
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
                {orden.estado}
              </span>
            </div>
          </div>

          {orden.alerta && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl flex items-center gap-2 text-red-700 dark:text-red-300 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Esta orden tiene una alerta o requerimiento especial prioritario.</span>
            </div>
          )}

          {orden.observaciones && (
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
                Observaciones / Especificaciones
              </p>
              <p className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700">
                {orden.observaciones}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl text-sm transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
