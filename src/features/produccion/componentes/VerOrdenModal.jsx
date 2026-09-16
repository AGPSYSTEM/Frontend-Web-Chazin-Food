import React, { useState, useEffect, useMemo } from "react";
import { 
  X, 
  FileText, 
  Plus, 
  AlertCircle, 
  Utensils, 
  ChevronDown, 
  ChevronsUpDown, 
  Check, 
  Clock, 
  User, 
  Layers 
} from "lucide-react";

export function VerOrdenModal({ isOpen, onClose, orden }) {
  if (!isOpen || !orden) return null;

  const productos = useMemo(() => {
    if (Array.isArray(orden.productos) && orden.productos.length > 0) {
      return orden.productos;
    }
    return [
      {
        nombre: orden.platilloNombre || "Platillo Principal",
        cantidad: orden.cantidad || 1,
        observaciones: orden.observaciones || "",
        adiciones: [],
        receta: null
      }
    ];
  }, [orden]);

  const totalUnidades = useMemo(() => {
    return productos.reduce((sum, p) => sum + (Number(p.cantidad) || 1), 0) || orden.cantidad || 1;
  }, [productos, orden]);

  // Control de estado expandido por platillo
  const [expanded, setExpanded] = useState({});
  // Marcador de platillos preparados/listos en cocina
  const [preparados, setPreparados] = useState({});

  useEffect(() => {
    if (orden) {
      const initialExp = {};
      productos.forEach((_, idx) => {
        // Si son 3 o menos productos, abrirlos todos; si son más, dejar el primero abierto para orden inicial
        initialExp[idx] = productos.length <= 3 ? true : idx === 0;
      });
      setExpanded(initialExp);
      setPreparados({});
    }
  }, [orden, productos]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const toggleExpand = (idx) => {
    setExpanded((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const expandAll = () => {
    const all = {};
    productos.forEach((_, idx) => { all[idx] = true; });
    setExpanded(all);
  };

  const collapseAll = () => {
    const none = {};
    productos.forEach((_, idx) => { none[idx] = false; });
    setExpanded(none);
  };

  const areAllExpanded = Object.values(expanded).filter(Boolean).length === productos.length;

  const togglePreparado = (idx, e) => {
    e?.stopPropagation();
    setPreparados((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const listosCount = Object.values(preparados).filter(Boolean).length;

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative bg-white dark:bg-gray-900 rounded-[28px] max-w-3xl w-full shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Limpio y Estructurado */}
        <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex items-start justify-between bg-gray-50/70 dark:bg-gray-800/40 shrink-0">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-800/80 flex items-center justify-center text-3xl select-none shrink-0 shadow-2xs">
              {orden.imagen || "🍔"}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-gray-100 leading-tight">
                  Orden de Cocina {orden.codigo ? `#${orden.codigo}` : `#OP-00${orden.id}`}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#F05454]/10 text-[#F05454] border border-[#F05454]/20 shadow-2xs">
                  {totalUnidades} {totalUnidades === 1 ? "unidad" : "unidades"}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                  {productos.length} {productos.length === 1 ? "platillo" : "platillos distintos"}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
                <span>
                  Cliente: <strong className="text-gray-800 dark:text-gray-200">{orden.cliente || orden.responsable || "Cliente Mostrador"}</strong>
                </span>
                {orden.mesa && (
                  <>
                    <span>•</span>
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold text-[11px] border border-blue-200 dark:border-blue-800">
                      {orden.mesa}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer shrink-0 ml-2"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 text-sm text-gray-900 dark:text-gray-100">
          
          {/* Info Grid (4 columnas para aprovechar el ancho) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50/80 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-200/80 dark:border-gray-700/60 shadow-2xs">
            <div>
              <p className="text-[11px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-1">
                Estado
              </p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {orden.estado}
              </span>
            </div>

            <div>
              <p className="text-[11px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-1">
                Prioridad
              </p>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  orden.prioridad === "Alta"
                    ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600"
                }`}
              >
                {orden.prioridad || "Normal"}
              </span>
            </div>

            <div>
              <p className="text-[11px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-1">
                Fecha
              </p>
              <p className="font-semibold text-gray-900 dark:text-gray-100 text-xs truncate">
                {orden.fecha || "2026-08-18"}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-1">
                Hora de Inicio
              </p>
              <p className="font-semibold text-gray-900 dark:text-gray-100 text-xs truncate">
                {orden.horaInicio || "12:00 PM"}
              </p>
            </div>
          </div>

          {/* Sección Platillos a Preparar con Despliegue Interactivo */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2">
                <Utensils className="w-4 h-4 text-[#F05454]" />
                <h4 className="text-xs font-black text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                  Platillos a Preparar ({productos.length})
                </h4>
                {listosCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {listosCount} de {productos.length} listos
                  </span>
                )}
              </div>

              {productos.length > 1 && (
                <button
                  type="button"
                  onClick={areAllExpanded ? collapseAll : expandAll}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition cursor-pointer self-start sm:self-auto active:scale-95"
                >
                  <ChevronsUpDown className="w-3.5 h-3.5" />
                  <span>{areAllExpanded ? "Colapsar Todos" : "Expandir Todos"}</span>
                </button>
              )}
            </div>

            {/* Listado tipo Acordeón */}
            <div className="space-y-2.5">
              {productos.map((prod, idx) => {
                const qty = Number(prod.cantidad) || 1;
                const itemAdds = Array.isArray(prod.adiciones) ? prod.adiciones : [];
                const itemObs = prod.observaciones || prod.observacion || prod.especificaciones || prod.nota || "";
                const isExpanded = !!expanded[idx];
                const isListo = !!preparados[idx];

                // Insumos calculados para la cantidad exacta de este platillo
                const recetaIngredientes = prod.receta?.ingredientes && prod.receta.ingredientes.length > 0
                  ? prod.receta.ingredientes
                  : [
                      { nombre: "Pan / Base del platillo", cantidad: `${qty * 1} unidad${qty > 1 ? "es" : ""}` },
                      { nombre: "Carne / Proteína principal", cantidad: `${qty * 1} porci${qty > 1 ? "ones" : "ón"}` },
                      { nombre: "Aderezos, salsas y acompañamientos", cantidad: `${qty * 1} porci${qty > 1 ? "ones" : "ón"}` }
                    ];

                return (
                  <div
                    key={idx}
                    className={`rounded-2xl border transition-all overflow-hidden ${
                      isListo
                        ? "bg-emerald-50/30 dark:bg-emerald-950/15 border-emerald-300 dark:border-emerald-800"
                        : isExpanded
                        ? "bg-white dark:bg-gray-850 border-gray-300 dark:border-gray-700 shadow-xs"
                        : "bg-[#fbfcfd] dark:bg-gray-800/60 border-gray-200 dark:border-gray-750 hover:border-gray-300"
                    }`}
                  >
                    {/* Fila Encabezado del Platillo (Clickable para abrir/cerrar) */}
                    <div
                      onClick={() => toggleExpand(idx)}
                      className="p-3 sm:p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Botón interactivo para marcar listo en cocina */}
                        <button
                          type="button"
                          onClick={(e) => togglePreparado(idx, e)}
                          title={isListo ? "Marcar como pendiente" : "Marcar como preparado"}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                            isListo
                              ? "bg-emerald-500 text-white shadow-xs"
                              : "bg-gray-100 dark:bg-gray-700/80 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50"
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>

                        {/* Cantidad destacada */}
                        <span className={`px-2.5 py-1 rounded-xl text-xs font-black shrink-0 ${
                          isListo
                            ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200"
                            : "bg-[#F05454] text-white shadow-2xs"
                        }`}>
                          x{qty}
                        </span>

                        {/* Nombre del Platillo */}
                        <span className={`font-bold text-sm truncate ${
                          isListo
                            ? "line-through text-gray-400 dark:text-gray-500"
                            : "text-gray-900 dark:text-gray-100"
                        }`}>
                          {prod.nombre}
                        </span>

                        {/* Badges rápidos de resumen */}
                        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                          {itemAdds.length > 0 && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-red-50 dark:bg-red-950/40 text-[#F05454] dark:text-red-300 border border-red-200/60 dark:border-red-900/40">
                              +{itemAdds.length} {itemAdds.length === 1 ? "adición" : "adiciones"}
                            </span>
                          )}
                          {itemObs && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40 flex items-center gap-1">
                              <FileText className="w-2.5 h-2.5" />
                              <span>Nota</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Flecha Desplegable */}
                      <div className="flex items-center gap-2 shrink-0">
                        {isListo && (
                          <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 hidden sm:inline">
                            Listo
                          </span>
                        )}
                        <span className={`p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-transform duration-200 ${
                          isExpanded ? "rotate-180" : ""
                        }`}>
                          <ChevronDown className="w-4 h-4" />
                        </span>
                      </div>
                    </div>

                    {/* Contenido Desplegable */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 border-t border-gray-100 dark:border-gray-800 space-y-3">
                        {/* Observación / Instrucción del cliente */}
                        {itemObs && (
                          <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-3 rounded-xl text-xs text-amber-900 dark:text-amber-200 space-y-1">
                            <div className="font-bold flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                              <FileText className="w-3.5 h-3.5 shrink-0" />
                              <span>Instrucciones Especiales del Cliente:</span>
                            </div>
                            <p className="font-medium text-xs pl-5 italic leading-relaxed">
                              "{itemObs}"
                            </p>
                          </div>
                        )}

                        {/* Adiciones Extra */}
                        {itemAdds.length > 0 && (
                          <div className="bg-red-50/60 dark:bg-red-950/25 border border-red-200/80 dark:border-red-900/40 p-3 rounded-xl space-y-1.5">
                            <div className="text-[11px] font-black text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-1">
                              <Plus className="w-3.5 h-3.5" />
                              <span>Adiciones a incluir ({itemAdds.length}):</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {itemAdds.map((ad, aIdx) => {
                                const adName = typeof ad === "object" ? (ad.nombre || ad.nombreAdicion) : String(ad);
                                const adQty = typeof ad === "object" && ad.cantidad > 1 ? `x${ad.cantidad} ` : "";
                                return (
                                  <span
                                    key={aIdx}
                                    className="px-2.5 py-1 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800/80 text-[#F05454] dark:text-red-300 text-xs font-bold rounded-lg shadow-2xs flex items-center gap-1"
                                  >
                                    <span>+ {adQty}{adName}</span>
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Ingredientes / Ficha Técnica */}
                        {recetaIngredientes.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <div className="flex items-center justify-between">
                              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider">
                                Insumos e ingredientes requeridos (para x{qty}):
                              </p>
                              {prod.receta?.tiempoPreparacion && (
                                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{prod.receta.tiempoPreparacion}</span>
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                              {recetaIngredientes.map((ing, ingIdx) => (
                                <div
                                  key={ingIdx}
                                  className="p-2.5 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-between text-xs border border-gray-150 dark:border-gray-700/80 shadow-2xs"
                                >
                                  <span className="text-gray-800 dark:text-gray-200 font-medium truncate pr-2">
                                    {ing.nombre}
                                  </span>
                                  <span className="text-gray-500 dark:text-gray-400 font-mono text-[11px] font-bold bg-gray-50 dark:bg-gray-700/50 px-2 py-0.5 rounded-md shrink-0 border border-gray-200/50 dark:border-gray-600/50">
                                    {ing.cantidad}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
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
        <div className="p-4 px-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900 shrink-0">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <span>Total a preparar: <strong>{totalUnidades} unidades</strong></span>
            {listosCount > 0 && (
              <span className="ml-2 font-bold text-emerald-600 dark:text-emerald-400">
                ({listosCount}/{productos.length} listos)
              </span>
            )}
          </div>
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
