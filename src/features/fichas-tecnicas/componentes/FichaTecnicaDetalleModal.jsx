import { useState, useEffect } from "react";
import {
  X,
  FileText,
  Utensils,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Printer,
  Edit2,
  ChevronRight,
  ShieldAlert,
  Info,
  Check,
  Flame,
  Scale
} from "lucide-react";
import { fichasTecnicasService } from "../servicios/fichasTecnicasService";

export function FichaTecnicaDetalleModal({
  isOpen,
  onClose,
  item,
  isProducto = true,
  onEdit,
  readOnly = false,
}) {
  const [ficha, setFicha] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkedIngredients, setCheckedIngredients] = useState({});

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && item) {
      const id = item.id || item.idProducto || item.idInsumo;
      setLoading(true);
      setCheckedIngredients({});

      const fetchPromise = isProducto
        ? fichasTecnicasService.getFichaByProducto(id)
        : fichasTecnicasService.getFichaByInsumo(id);

      fetchPromise
        .then((res) => {
          if (res && (res.idFichaTecnica || res.procedimiento || res.detalles || res.especificaciones)) {
            setFicha(res);
          } else {
            setFicha(null);
          }
        })
        .catch((err) => {
          console.warn("No se encontró ficha para el ítem:", err);
          setFicha(null);
        })
        .finally(() => setLoading(false));
    } else {
      setFicha(null);
    }
  }, [isOpen, item, isProducto]);

  if (!isOpen || !item) return null;

  const itemName = item.nombre || "Ficha Técnica";
  const itemCategoria =
    item.categoria || item.categoriaNombre || item.categoria?.nombre || (isProducto ? "Producto" : "Insumo");

  // Extract ingredients/insumos
  const listaInsumos = ficha?.detalles || ficha?.insumos || [];
  const procedimientoText = ficha?.procedimiento || ficha?.descripcion || "";
  const pasos = procedimientoText
    ? procedimientoText
        .split("\n")
        .map((p) => p.trim())
        .filter(Boolean)
    : [];

  const tiempoEstimado = ficha?.tiempoPreparacion ? `${ficha.tiempoPreparacion} min` : "10 - 15 min";
  const rendimientoText = ficha?.rendimiento || "1 porción";
  const vidaUtilText = ficha?.vidaUtil || "Consumo inmediato";
  const almacenamientoText = ficha?.condicionesAlmacenamiento || "Conservar refrigerado o en lugar fresco y seco";

  const toggleCheck = (idx) => {
    setCheckedIngredients((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl space-y-6 relative border border-gray-100 dark:border-gray-800 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors z-10 cursor-pointer"
          title="Cerrar ventana"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4 pr-8">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-[#F05454] flex items-center justify-center shrink-0 shadow-xs">
            {isProducto ? <Utensils className="w-7 h-7" /> : <Package className="w-7 h-7" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-black uppercase tracking-wider bg-rose-100 text-[#F05454] dark:bg-rose-950/60 dark:text-rose-300">
                {isProducto ? "Ficha de Producto" : "Ficha de Insumo"}
              </span>
              <span className="text-xs text-gray-400 font-medium">• {itemCategoria}</span>
              {ficha ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ficha Configurada
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Estandarizada
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100 mt-1 truncate">
              {itemName}
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-[#F05454] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-gray-400 font-bold">Cargando ficha técnica y receta...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-rose-50/70 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 rounded-2xl">
                <p className="text-[11px] font-bold text-[#F05454] uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Tiempo
                </p>
                <p className="text-base font-black text-gray-900 dark:text-gray-100 mt-0.5">{tiempoEstimado}</p>
              </div>

              <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 rounded-2xl">
                <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5" /> Porción
                </p>
                <p className="text-base font-black text-gray-900 dark:text-gray-100 mt-0.5 truncate">{rendimientoText}</p>
              </div>

              <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl">
                <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Vida Útil
                </p>
                <p className="text-base font-black text-gray-900 dark:text-gray-100 mt-0.5 truncate">{vidaUtilText}</p>
              </div>

              <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 rounded-2xl">
                <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" /> Insumos
                </p>
                <p className="text-base font-black text-gray-900 dark:text-gray-100 mt-0.5">
                  {listaInsumos.length} registrados
                </p>
              </div>
            </div>

            {/* Insumos & Ingredientes Requeridos */}
            <div className="bg-gray-50/80 dark:bg-gray-800/40 p-4 sm:p-5 rounded-2xl border border-gray-200/70 dark:border-gray-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs sm:text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-wider flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#F05454]" />
                  <span>Ingredientes & Insumos Requeridos ({listaInsumos.length})</span>
                </h4>
                <span className="text-[11px] text-gray-400 font-medium hidden sm:inline">
                  Toca para marcar checklist
                </span>
              </div>

              {listaInsumos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {listaInsumos.map((itemIns, idx) => {
                    const insName = itemIns.nombreInsumo || itemIns.insumo?.nombre || `Insumo #${itemIns.idInsumo}`;
                    const cant = itemIns.cantidad || 1;
                    const unidad = itemIns.unidadMedida || itemIns.insumo?.unidadMedida || "und";
                    const isChecked = !!checkedIngredients[idx];

                    return (
                      <div
                        key={idx}
                        onClick={() => toggleCheck(idx)}
                        className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer select-none ${
                          isChecked
                            ? "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/80 opacity-75"
                            : "bg-white dark:bg-gray-800 border-gray-200/80 dark:border-gray-700/80 hover:border-rose-200 shadow-2xs"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center text-xs shrink-0 transition-colors ${
                              isChecked
                                ? "bg-emerald-500 text-white"
                                : "border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-750"
                            }`}
                          >
                            {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <span
                            className={`text-xs font-bold truncate ${
                              isChecked
                                ? "line-through text-gray-400 dark:text-gray-500"
                                : "text-gray-900 dark:text-gray-100"
                            }`}
                          >
                            {insName}
                          </span>
                        </div>

                        <span className="font-black text-xs text-[#F05454] dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-lg shrink-0">
                          {cant} {unidad}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-4 text-center text-xs text-gray-400 italic">
                  Ingredientes preparados al momento según receta estándar de cocina.
                </div>
              )}
            </div>

            {/* Procedimiento Paso a Paso */}
            <div className="bg-gray-50/80 dark:bg-gray-800/40 p-4 sm:p-5 rounded-2xl border border-gray-200/70 dark:border-gray-700/60 space-y-3">
              <h4 className="text-xs sm:text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#F05454]" />
                <span>Procedimiento de Preparación Paso a Paso</span>
              </h4>

              {pasos.length > 0 ? (
                <div className="space-y-2.5">
                  {pasos.map((paso, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200/70 dark:border-gray-700/70 shadow-2xs text-xs sm:text-sm"
                    >
                      <span className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950/60 text-[#F05454] font-black flex items-center justify-center text-xs shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-gray-800 dark:text-gray-200 font-medium leading-relaxed flex-1">
                        {paso}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic py-2">
                  Preparar siguiendo los estándares de higiene, cocción y emplatado de Chazin Food.
                </p>
              )}
            </div>

            {/* Especificaciones y Almacenamiento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {ficha?.especificaciones && (
                <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 space-y-1">
                  <p className="text-[11px] font-black text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-blue-500" /> Especificaciones de Calidad
                  </p>
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                    {ficha.especificaciones}
                  </p>
                </div>
              )}

              {ficha?.caracteristicas && (
                <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 space-y-1">
                  <p className="text-[11px] font-black text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Características Sensoriales
                  </p>
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                    {ficha.caracteristicas}
                  </p>
                </div>
              )}

              {ficha?.informacionNutricional && (
                <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 space-y-1">
                  <p className="text-[11px] font-black text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-orange-500" /> Información Nutricional
                  </p>
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                    {ficha.informacionNutricional}
                  </p>
                </div>
              )}

              <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 space-y-1">
                <p className="text-[11px] font-black text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-emerald-500" /> Almacenamiento & Conservación
                </p>
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                  {almacenamientoText}
                </p>
              </div>

              {ficha?.observaciones && (
                <div className="col-span-full p-4 bg-amber-50/60 dark:bg-amber-950/30 rounded-2xl border border-amber-200/80 dark:border-amber-900/40 space-y-1">
                  <p className="text-[11px] font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Observaciones y Alérgenos
                  </p>
                  <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
                    {ficha.observaciones}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800 flex-wrap gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Cerrar
          </button>

          <div className="flex items-center gap-2">
            {!readOnly && onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(item);
                }}
                className="px-5 py-2.5 bg-[#F05454] hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Editar Ficha Técnica</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FichaTecnicaDetalleModal;
