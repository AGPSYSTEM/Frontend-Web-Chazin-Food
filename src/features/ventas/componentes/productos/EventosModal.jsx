import { useState } from "react";
import { X, Sparkles, Zap, Calendar } from "lucide-react";

export function EventosModal({ isOpen, onClose, eventos = [] }) {
  const [activeTab, setActiveTab] = useState("activos"); // 'activos' | 'historial'

  if (!isOpen) return null;

  const eventosActivos = eventos.filter((e) => e.estado === "Activo");
  const totalEventos = eventos.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col">
        {/* Header */}
        <div className="p-6 pb-4 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Versionamiento de Fichas Técnicas
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">
                {totalEventos} evento{totalEventos !== 1 ? "s" : ""} registrado{totalEventos !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Separator line */}
        <hr className="border-gray-100 dark:border-gray-800" />

        {/* Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("activos")}
              className={`px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                activeTab === "activos"
                  ? "bg-purple-100/80 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 font-medium"
              }`}
            >
              Eventos Activos
            </button>
            <button
              onClick={() => setActiveTab("historial")}
              className={`px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                activeTab === "historial"
                  ? "bg-purple-100/80 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 font-medium"
              }`}
            >
              Historial Completo
            </button>
          </div>

          {/* Tab Content */}
          <div className="py-12 flex flex-col items-center justify-center text-center">
            {activeTab === "activos" ? (
              eventosActivos.length === 0 ? (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 flex items-center justify-center mb-4">
                    <Zap className="w-8 h-8" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 font-medium text-base">
                    No hay eventos activos actualmente.
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    Crea un evento desde cualquier producto.
                  </p>
                </>
              ) : (
                <div className="w-full space-y-3">
                  {eventosActivos.map((evt) => (
                    <div key={evt.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl text-left border border-gray-100 dark:border-gray-700">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{evt.nombre}</p>
                      <p className="text-xs text-gray-500">{evt.descripcion}</p>
                    </div>
                  ))}
                </div>
              )
            ) : (
              eventos.length === 0 ? (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 flex items-center justify-center mb-4">
                    <Calendar className="w-8 h-8" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 font-medium text-base">
                    No hay eventos registrados.
                  </p>
                </>
              ) : (
                <div className="w-full space-y-3">
                  {eventos.map((evt) => (
                    <div key={evt.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl text-left border border-gray-100 dark:border-gray-700">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{evt.nombre}</p>
                      <p className="text-xs text-gray-500">{evt.descripcion}</p>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>

        {/* Separator line */}
        <hr className="border-gray-100 dark:border-gray-800" />

        {/* Footer */}
        <div className="p-4 px-6 flex justify-end bg-gray-50/50 dark:bg-gray-900/50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-2xl text-sm transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
