import { X, Package, PlusCircle, ChefHat, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { fichasTecnicasService } from "@/features/fichas-tecnicas/servicios/fichasTecnicasService";

export function VerProductoModal({ isOpen, onClose, producto }) {
  const [fichaTecnica, setFichaTecnica] = useState(null);
  const [loadingFicha, setLoadingFicha] = useState(false);

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
    if (isOpen && producto?.id) {
      setLoadingFicha(true);
      fichasTecnicasService.getFichaByProducto(producto.id)
        .then(f => setFichaTecnica(f))
        .catch(err => console.error("Error cargando ficha", err))
        .finally(() => setLoadingFicha(false));
    } else {
      setFichaTecnica(null);
    }
  }, [isOpen, producto]);

  if (!isOpen || !producto) return null;

  // Cálculos para datos del producto
  const precioVenta = Number(producto.precio || 0);
  const costoProduccion = precioVenta * 0.55;
  const margenGanancia = precioVenta - costoProduccion;
  const margenPorcentaje = precioVenta > 0 ? Math.round((margenGanancia / precioVenta) * 100) : 0;
  
  const totalVendidos = producto.ventas || 245;
  const totalIngresos = totalVendidos * precioVenta;

  const isDisponible = producto.estado !== "Inactivo" && producto.estado !== 0;
  const adiciones = producto.adiciones || [];
  const eventosActivos = producto.eventos || [];

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div className="bg-white dark:bg-gray-900 rounded-[28px] shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden relative max-h-[92vh] border border-gray-100 dark:border-gray-800">
        
        {/* Top Header Section (Red Banner) */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-500 w-full h-56 relative flex flex-col items-center justify-center shrink-0 shadow-inner">
          
          {/* Badge Disponible */}
          <div className="absolute top-5 left-5 z-20">
            <span className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-sm ${
              isDisponible 
                ? "bg-white text-emerald-600 dark:bg-gray-900 dark:text-emerald-400" 
                : "bg-white text-rose-600 dark:bg-gray-900 dark:text-rose-400"
            }`}>
              {isDisponible ? "Disponible" : "Inactivo"}
            </span>
          </div>

          {/* Close Button 'X' */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar detalle"
            className="absolute top-5 right-5 p-2.5 bg-white/95 dark:bg-gray-900/95 hover:bg-white dark:hover:bg-gray-900 text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 rounded-full shadow-lg transition-all z-30 flex items-center justify-center active:scale-95 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Central Image or Emoji */}
          <div className="w-28 h-28 flex items-center justify-center">
            {producto.imagen ? (
              <img
                src={producto.imagen}
                alt={producto.nombre}
                className="w-full h-full object-contain filter drop-shadow-xl"
              />
            ) : (
              <span className="text-7xl drop-shadow-xl">🍔</span>
            )}
          </div>
        </div>

        {/* Body Section */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          
          {/* Product Title & Category */}
          <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100">
                {producto.nombre}
              </h2>
              <span className="px-3 py-1 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-full text-xs font-bold shrink-0">
                {producto.categoria || "General"}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
              {producto.descripcion || "Este producto no tiene una descripción detallada en este momento."}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Precio de Venta */}
            <div className="bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-4 border border-gray-100 dark:border-gray-700/50">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Precio Venta</p>
              <p className="text-lg font-black text-gray-900 dark:text-gray-100">
                ${precioVenta.toLocaleString("es-CO")}
              </p>
            </div>

            {/* Costo de Producción */}
            <div className="bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-4 border border-gray-100 dark:border-gray-700/50">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Costo Estimado</p>
              <p className="text-lg font-black text-gray-900 dark:text-gray-100">
                ${costoProduccion.toLocaleString("es-CO")}
              </p>
            </div>

            {/* Margen de Ganancia */}
            <div className="bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-4 border border-gray-100 dark:border-gray-700/50">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Margen Ganancia</p>
              <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                {margenPorcentaje}%
              </p>
            </div>

            {/* Total Vendidos */}
            <div className="bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-4 border border-gray-100 dark:border-gray-700/50">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Total Vendidos</p>
              <p className="text-lg font-black text-gray-900 dark:text-gray-100">
                {totalVendidos.toLocaleString("es-CO")}
              </p>
            </div>
          </div>

          {/* Insumos & Adiciones Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Insumos */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">Insumos de la Ficha Técnica</h3>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-4 border border-gray-100 dark:border-gray-700/50 min-h-[100px]">
                {loadingFicha ? (
                  <p className="text-xs text-gray-400 text-center py-4">Cargando insumos...</p>
                ) : fichaTecnica && fichaTecnica.detalles && fichaTecnica.detalles.length > 0 ? (
                  <ul className="space-y-2">
                    {fichaTecnica.detalles.map((d, i) => (
                      <li key={i} className="flex justify-between items-center text-xs">
                        <span className="text-gray-800 dark:text-gray-200 font-medium">{d.nombreInsumo || d.insumo?.nombre}</span>
                        <span className="text-gray-500 dark:text-gray-400 font-mono">{d.cantidad} {d.unidadMedida}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 py-3">
                    <Package className="w-5 h-5 mb-1 opacity-50" />
                    <p className="text-xs text-center">Sin ficha técnica configurada</p>
                  </div>
                )}
              </div>
            </div>

            {/* Adiciones */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-red-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">Adiciones Disponibles</h3>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-4 border border-gray-100 dark:border-gray-700/50 min-h-[100px]">
                {adiciones.length > 0 ? (
                  <ul className="space-y-2">
                    {adiciones.map((a, i) => (
                      <li key={i} className="flex justify-between items-center text-xs">
                        <span className="text-gray-800 dark:text-gray-200 font-medium">{a.nombre}</span>
                        <span className="text-red-500 dark:text-red-400 font-bold">
                          +${Number(a.precio).toLocaleString("es-CO")}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 py-3">
                    <PlusCircle className="w-5 h-5 mb-1 opacity-50" />
                    <p className="text-xs text-center">No tiene adiciones configuradas</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Eventos / Descuentos Activos */}
          {eventosActivos.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">Eventos y Promociones Activas</h3>
              </div>
              <div className="bg-amber-50/70 dark:bg-amber-900/10 rounded-2xl p-4 border border-amber-100 dark:border-amber-900/30">
                <ul className="space-y-2.5">
                  {eventosActivos.map((evt, i) => (
                    <li key={i} className="flex justify-between items-start text-xs bg-white dark:bg-gray-800 p-3 rounded-xl shadow-xs border border-amber-100 dark:border-amber-900/20">
                      <div>
                        <span className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                          {evt.nombreEvento || evt.nombre}
                          {evt.isTemporal && (
                            <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.2 rounded font-bold uppercase">Temporal</span>
                          )}
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{evt.descripcion}</p>
                      </div>
                      <div className="text-right">
                        {evt.tipoEvento === "Descuento" && (
                          <span className="text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-md">
                            -{Number(evt.descuento)}% OFF
                          </span>
                        )}
                        {evt.tipoEvento === "Promoción Precio" && (
                          <span className="text-purple-600 font-bold bg-purple-50 dark:bg-purple-950/40 px-2 py-1 rounded-md">
                            ${Number(evt.nuevoPrecio).toLocaleString("es-CO")}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Footer Action */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-bold rounded-xl transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
