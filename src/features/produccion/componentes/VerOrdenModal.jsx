import React from "react";
import { X, Sparkles, FileText, Plus, AlertCircle, Utensils } from "lucide-react";

export function VerOrdenModal({ isOpen, onClose, orden }) {
  if (!isOpen || !orden) return null;

  const productos = Array.isArray(orden.productos) && orden.productos.length > 0
    ? orden.productos
    : [
        {
          nombre: orden.platilloNombre || "Platillo Principal",
          cantidad: orden.cantidad || 1,
          observaciones: orden.observaciones || "",
          adiciones: [],
          receta: null
        }
      ];

  const defaultIngredientes = [
    { nombre: "Pan de hot dog / hamburguesa", cantidad: `${orden.cantidad * 1 || 1} unidades` },
    { nombre: "Carne / Proteína principal", cantidad: `${orden.cantidad * 1 || 1} unidades` },
    { nombre: "Aderezos y salsas especialidad", cantidad: `${orden.cantidad * 1 || 1} porciones` }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative bg-white dark:bg-gray-900 rounded-[28px] max-w-lg w-full shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex items-start justify-between bg-gray-50/50 dark:bg-gray-800/40">
          <div className="flex items-center gap-3">
            <div className="text-3xl select-none shrink-0">{orden.imagen || "🍔"}</div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                {orden.platilloNombre}
              </h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-mono font-semibold mt-0.5">
                {orden.codigo || `OP-00${orden.id}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 text-sm text-gray-900 dark:text-gray-100">
          {/* 2-Column Info Grid */}
          <div className="grid grid-cols-2 gap-3 bg-[#f8fafc] dark:bg-gray-800/60 p-4 rounded-2xl border border-gray-200 dark:border-gray-700/60 shadow-2xs">
            <div>
              <p className="text-[11px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-0.5">
                Estado
              </p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {orden.estado}
              </span>
            </div>

            <div>
              <p className="text-[11px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-0.5">
                Prioridad
              </p>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  orden.prioridad === "Alta"
                    ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                }`}
              >
                {orden.prioridad || "Normal"}
              </span>
            </div>

            <div>
              <p className="text-[11px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-0.5">
                Cantidad Total
              </p>
              <p className="font-extrabold text-gray-900 dark:text-gray-100 text-sm">
                x{orden.cantidad || 1}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-0.5">
                Cliente / Mesa
              </p>
              <p className="font-bold text-gray-900 dark:text-gray-100 text-sm truncate">
                {orden.cliente || orden.responsable || "Cliente Mostrador"}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-0.5">
                Fecha
              </p>
              <p className="font-semibold text-gray-900 dark:text-gray-100 text-xs">
                {orden.fecha || "2026-08-18"}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-0.5">
                Hora de Inicio
              </p>
              <p className="font-semibold text-gray-900 dark:text-gray-100 text-xs">
                {orden.horaInicio || "12:00 PM"}
              </p>
            </div>
          </div>

          {/* PRODUCTOS Y ESPECIFICACIONES DE COMANDA */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <Utensils className="w-4 h-4 text-[#F05454]" />
              <span>Platillos a Preparar ({productos.length})</span>
            </h4>

            <div className="space-y-3">
              {productos.map((prod, idx) => {
                const itemAdds = Array.isArray(prod.adiciones) ? prod.adiciones : [];
                const itemObs = prod.observaciones || prod.observacion || prod.especificaciones || prod.nota || "";
                const recetaIngredientes = prod.receta?.ingredientes || defaultIngredientes;

                return (
                  <div
                    key={idx}
                    className="p-4 bg-[#fbfcfd] dark:bg-gray-800/70 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-3 shadow-2xs"
                  >
                    {/* Título del producto */}
                    <div className="flex items-center justify-between font-bold text-sm">
                      <span className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <span className="bg-[#F05454] text-white text-xs font-black px-2 py-0.5 rounded-lg">
                          x{prod.cantidad || 1}
                        </span>
                        <span>{prod.nombre}</span>
                      </span>
                    </div>

                    {/* ADICIONES EXTRA SOLICITADAS */}
                    {itemAdds.length > 0 && (
                      <div className="bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 p-3 rounded-xl space-y-1.5">
                        <div className="text-[11px] font-black text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-1">
                          <Plus className="w-3.5 h-3.5" />
                          <span>Adiciones Extra a incluir ({itemAdds.length}):</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {itemAdds.map((ad, aIdx) => {
                            const adName = typeof ad === "object" ? (ad.nombre || ad.nombreAdicion) : String(ad);
                            const adQty = typeof ad === "object" && ad.cantidad > 1 ? `x${ad.cantidad} ` : "";
                            return (
                              <span
                                key={aIdx}
                                className="px-2.5 py-1 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 text-[#F05454] dark:text-red-300 text-xs font-bold rounded-lg shadow-2xs flex items-center gap-1"
                              >
                                <span>+ {adQty}{adName}</span>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* OBSERVACIÓN / NOTA DE PREPARACIÓN */}
                    {itemObs && (
                      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 p-3 rounded-xl text-xs text-amber-900 dark:text-amber-200 space-y-1">
                        <div className="font-bold flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                          <FileText className="w-3.5 h-3.5 shrink-0" />
                          <span>Observación / Instrucciones del Cliente:</span>
                        </div>
                        <p className="font-medium text-xs pl-5 italic leading-relaxed">
                          "{itemObs}"
                        </p>
                      </div>
                    )}

                    {/* INGREDIENTES / RECETA */}
                    {recetaIngredientes.length > 0 && (
                      <div className="pt-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                          Ingredientes base requeridos:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {recetaIngredientes.map((ing, ingIdx) => (
                            <div
                              key={ingIdx}
                              className="px-2.5 py-1.5 bg-white dark:bg-gray-800/90 rounded-lg flex items-center justify-between text-xs border border-gray-100 dark:border-gray-700"
                            >
                              <span className="text-gray-700 dark:text-gray-300 font-medium truncate">
                                {ing.nombre}
                              </span>
                              <span className="text-gray-400 font-mono text-[11px] shrink-0 ml-1">
                                {ing.cantidad}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* OBSERVACIONES GENERALES DE LA ORDEN SI EXISTEN */}
          {orden.observaciones && typeof orden.observaciones === "string" && orden.observaciones.trim() && (
            <div className="bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 p-3 rounded-2xl text-xs text-blue-900 dark:text-blue-200 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-blue-700 dark:text-blue-400">
                <FileText className="w-3.5 h-3.5" />
                <span>Nota General del Pedido:</span>
              </div>
              <p className="italic pl-5">{orden.observaciones}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-gray-100 dark:border-gray-800 flex justify-end bg-white dark:bg-gray-900">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold rounded-2xl text-xs sm:text-sm transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default VerOrdenModal;
