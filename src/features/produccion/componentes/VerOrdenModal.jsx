import { X } from "lucide-react";

export function VerOrdenModal({ isOpen, onClose, orden }) {
  if (!isOpen || !orden) return null;

  // Fallback ingredients if not specified on the order object
  const defaultIngredientes = [
    { nombre: "Pan de hot dog / hamburguesa", cantidad: `${orden.cantidad * 1 || 1} unidades` },
    { nombre: "Carne / Proteína principal", cantidad: `${orden.cantidad * 1 || 1} unidades` },
    { nombre: "Aderezos y salsas especialidad", cantidad: `${orden.cantidad * 1 || 1} porciones` }
  ];

  const ingredientes = orden.ingredientes || defaultIngredientes;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl select-none">{orden.imagen || "🌭"}</div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {orden.platilloNombre}
              </h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                {orden.codigo || `OP-00${orden.id}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-sm">
          {/* 2-Column Info Grid */}
          <div className="grid grid-cols-2 gap-y-4 gap-x-6">
            <div>
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-0.5">Estado</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                {orden.estado}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-0.5">Prioridad</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                {orden.prioridad || "Normal"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-0.5">Cantidad</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                x{orden.cantidad || 1}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-0.5">Cocinero</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                {orden.responsable || orden.cocinero || "María G."}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-0.5">Fecha</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                {orden.fecha || "2026-06-23"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-0.5">Hora Inicio</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                {orden.horaInicio || "09:50"}
              </p>
            </div>

            <div className="col-span-2">
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-0.5">Tiempo Est.</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                {orden.tiempo || "12 min"}
              </p>
            </div>
          </div>

          {/* INGREDIENTES Section */}
          <div className="pt-2">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              INGREDIENTES
            </h4>
            <div className="space-y-2.5">
              {ingredientes.map((ing, idx) => (
                <div
                  key={idx}
                  className="px-4 py-3 bg-gray-50/80 dark:bg-gray-800/60 rounded-2xl flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-100/50 dark:border-gray-700/50"
                >
                  <span>{ing.nombre}</span>
                  <span className="text-gray-500 dark:text-gray-400 font-normal">
                    {ing.cantidad}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-gray-100 dark:border-gray-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium rounded-2xl text-sm transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
