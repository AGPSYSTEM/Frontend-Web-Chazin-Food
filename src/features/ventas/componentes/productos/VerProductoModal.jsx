import { X, Package, PlusCircle, ChefHat, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { fichasTecnicasService } from "@/features/fichas-tecnicas/servicios/fichasTecnicasService";
export function VerProductoModal({ isOpen, onClose, producto }) {
  const [fichaTecnica, setFichaTecnica] = useState(null);
  const [loadingFicha, setLoadingFicha] = useState(false);

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

  // Cálculos simulados para datos faltantes (basados en el requerimiento)
  const precioVenta = Number(producto.precio || 0);
  const costoProduccion = precioVenta * 0.55; // Simulamos 55% de costo
  const margenGanancia = precioVenta - costoProduccion;
  const margenPorcentaje = precioVenta > 0 ? Math.round((margenGanancia / precioVenta) * 100) : 0;
  
  const totalVendidos = producto.ventas || 245; // Simulamos ventas si no existe
  const totalIngresos = totalVendidos * precioVenta;

  const isDisponible = producto.estado !== "Inactivo";
  const adiciones = producto.adiciones || [];
  const eventosActivos = producto.eventos || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden relative">
        
        {/* Top Header Section (Red) */}
        <div className="bg-[#E53935] w-full h-64 relative flex flex-col items-center justify-center">
          
          {/* Badge Disponible */}
          <div className="absolute top-6 left-6">
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${
              isDisponible 
                ? "bg-white text-[#4CAF50]" 
                : "bg-white text-red-500"
            }`}>
              {isDisponible ? "Disponible" : "Inactivo"}
            </span>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-white rounded-full text-gray-500 hover:text-gray-800 transition-colors shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Central Image or Emoji */}
          <div className="w-32 h-32 flex items-center justify-center">
            {producto.imagen ? (
              <img
                src={producto.imagen}
                alt={producto.nombre}
                className="w-full h-full object-contain filter drop-shadow-lg"
              />
            ) : (
              <span className="text-8xl drop-shadow-lg">🍔</span>
            )}
          </div>
        </div>

        {/* Body Section (White) */}
        <div className="p-8">
          
          {/* Product Title & Category */}
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {producto.nombre}
            </h2>
            <p className="text-sm font-medium text-gray-500">
              {producto.categoria || "Sin Categoría"}
            </p>
          </div>

          {/* Description */}
          <p className="text-[15px] text-gray-600 mb-8 leading-relaxed">
            {producto.descripcion || "Este producto no tiene una descripción detallada en este momento."}
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            
            {/* Precio de Venta */}
            <div className="bg-[#F9FAFB] rounded-2xl p-5">
              <p className="text-[13px] text-gray-500 font-medium mb-1">Precio de Venta</p>
              <p className="text-xl font-bold text-gray-900">
                ${precioVenta.toLocaleString("es-CO")}
              </p>
            </div>

            {/* Costo de Producción */}
            <div className="bg-[#F9FAFB] rounded-2xl p-5">
              <p className="text-[13px] text-gray-500 font-medium mb-1">Costo de Producción</p>
              <p className="text-xl font-bold text-gray-900">
                ${costoProduccion.toLocaleString("es-CO")}
              </p>
            </div>

            {/* Margen de Ganancia */}
            <div className="bg-[#F9FAFB] rounded-2xl p-5">
              <p className="text-[13px] text-gray-500 font-medium mb-1">Margen de Ganancia</p>
              <p className="text-xl font-bold text-[#4CAF50] mb-0.5">
                ${margenGanancia.toLocaleString("es-CO")}
              </p>
              <p className="text-xs text-gray-500 font-medium">{margenPorcentaje}%</p>
            </div>

            {/* Total Vendidos */}
            <div className="bg-[#F9FAFB] rounded-2xl p-5">
              <p className="text-[13px] text-gray-500 font-medium mb-1">Total Vendidos</p>
              <p className="text-xl font-bold text-gray-900 mb-0.5">
                {totalVendidos.toLocaleString("es-CO")} uds
              </p>
              <p className="text-xs text-gray-500 font-medium">${totalIngresos.toLocaleString("es-CO")} ingresos</p>
            </div>
          </div>

          <hr className="border-gray-100 my-6" />

          {/* Insumos & Adiciones Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Insumos */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ChefHat className="w-5 h-5 text-gray-400" />
                <h3 className="text-sm font-bold text-gray-900">Insumos del Producto</h3>
              </div>
              <div className="bg-[#F9FAFB] rounded-2xl p-4 min-h-[120px]">
                {loadingFicha ? (
                  <p className="text-sm text-gray-500 text-center py-4">Cargando...</p>
                ) : fichaTecnica && fichaTecnica.detalles && fichaTecnica.detalles.length > 0 ? (
                  <ul className="space-y-2">
                    {fichaTecnica.detalles.map((d, i) => (
                      <li key={i} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">{d.nombreInsumo || d.insumo?.nombre}</span>
                        <span className="text-gray-500 font-medium">{d.cantidad} {d.unidadMedida}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <Package className="w-6 h-6 mb-1 opacity-50" />
                    <p className="text-xs text-center">Sin ficha técnica configurada</p>
                  </div>
                )}
              </div>
            </div>

            {/* Adiciones */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <PlusCircle className="w-5 h-5 text-[#E53935]" />
                <h3 className="text-sm font-bold text-gray-900">Adiciones Disponibles</h3>
              </div>
              <div className="bg-[#F9FAFB] rounded-2xl p-4 min-h-[120px]">
                {adiciones.length > 0 ? (
                  <ul className="space-y-2">
                    {adiciones.map((a, i) => (
                      <li key={i} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">{a.nombre}</span>
                        <span className="text-[#E53935] font-semibold">
                          +${Number(a.precio).toLocaleString("es-CO")}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <PlusCircle className="w-6 h-6 mb-1 opacity-50" />
                    <p className="text-xs text-center">No tiene adiciones configuradas</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Eventos / Descuentos Activos */}
          {eventosActivos.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-yellow-500" />
                <h3 className="text-sm font-bold text-gray-900">Eventos Activos</h3>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/10 rounded-2xl p-4 border border-yellow-100 dark:border-yellow-900/30">
                <ul className="space-y-3">
                  {eventosActivos.map((evt, i) => (
                    <li key={i} className="flex justify-between items-start text-sm bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-yellow-100 dark:border-yellow-900/20">
                      <div>
                        <span className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                          {evt.nombreEvento || evt.nombre}
                          {evt.isTemporal && (
                            <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Temporal</span>
                          )}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">{evt.descripcion}</p>
                      </div>
                      <div className="text-right">
                        {evt.tipoEvento === "Descuento" && (
                          <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-md">
                            -{Number(evt.descuento)}% OFF
                          </span>
                        )}
                        {evt.tipoEvento === "Promoción Precio" && (
                          <span className="text-purple-600 font-bold bg-purple-50 px-2 py-1 rounded-md">
                            Nuevo Precio: ${Number(evt.nuevoPrecio).toLocaleString("es-CO")}
                          </span>
                        )}
                        {evt.tipoEvento === "Añadir Insumos" && (
                          <span className="text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded-md">
                            {evt.accionInsumo === "Quitar" ? "Insumos removidos" : "Insumos extra"}
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
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-[#F3F4F6] hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-full transition-colors"
            >
              Cerrar
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
