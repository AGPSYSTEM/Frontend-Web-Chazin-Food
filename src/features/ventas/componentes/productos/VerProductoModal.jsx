import { X, Package, PlusCircle, ChefHat, Zap, Star, MessageSquare, Layers, Sparkles } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { fichasTecnicasService } from "@/features/fichas-tecnicas/servicios/fichasTecnicasService";
import { StarRating } from "@/shared/components/ui/StarRating";
import { apiClient } from "@/shared/api/apiClient";
import { isSizeVariantName } from "./ProductoModal";

export function VerProductoModal({ isOpen, onClose, producto }) {
  const [fichaTecnica, setFichaTecnica] = useState(null);
  const [loadingFicha, setLoadingFicha] = useState(false);
  const [resenasData, setResenasData] = useState({ promedio: 0, total: 0, resenas: [] });
  const [loadingResenas, setLoadingResenas] = useState(false);

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
    if (isOpen && (producto?.id || producto?.idProducto)) {
      const pId = producto.id || producto.idProducto;
      if (producto.fichaTecnica) {
        setFichaTecnica(producto.fichaTecnica);
      }
      setLoadingFicha(true);
      fichasTecnicasService.getFichaByProducto(pId)
        .then(f => setFichaTecnica(f || producto.fichaTecnica || null))
        .catch(err => {
          console.error("Error cargando ficha", err);
          if (producto.fichaTecnica) setFichaTecnica(producto.fichaTecnica);
        })
        .finally(() => setLoadingFicha(false));

      setLoadingResenas(true);
      apiClient.get(`/resenas/producto/${pId}`)
        .then(r => setResenasData(r || { promedio: 0, total: 0, resenas: [] }))
        .catch(() => setResenasData({ promedio: 0, total: 0, resenas: [] }))
        .finally(() => setLoadingResenas(false));
    } else {
      setFichaTecnica(null);
      setResenasData({ promedio: 0, total: 0, resenas: [] });
    }
  }, [isOpen, producto]);

  if (!isOpen || !producto) return null;

  // Cálculos para datos del producto
  const precioVenta = Number(producto.precio || 0);
  
  // Costo real calculado a partir de la suma de insumos de la ficha técnica
  const costoRealCalculado = fichaTecnica?.detalles?.length > 0
    ? fichaTecnica.detalles.reduce((acc, d) => {
        const cant = Number(d.cantidad || 0);
        const precioUnit = Number(d.precioUnitario || d.insumo?.precioUnitario || 0);
        return acc + (cant * precioUnit);
      }, 0)
    : 0;

  const costoProduccion = Math.round(costoRealCalculado);
  const margenGanancia = precioVenta > costoProduccion ? precioVenta - costoProduccion : 0;
  const margenPorcentaje = precioVenta > 0 && costoProduccion > 0
    ? Math.round((margenGanancia / precioVenta) * 100)
    : 0;
  
  const totalVendidos = Number(producto.ventas ?? producto.totalVendidos ?? 0);
  const totalIngresos = totalVendidos * precioVenta;

  const isDisponible = producto.estado !== "Inactivo" && producto.estado !== 0;
  const adiciones = producto.adiciones || [];
  const eventosActivos = producto.eventos || [];

  const catName = String(producto.categoria || producto.categoriaNombre || "").toLowerCase();
  const prodName = String(producto.nombre || "").toLowerCase();
  const variantes = Array.isArray(producto.variantes) ? producto.variantes : [];
  const sizeVariantes = variantes.filter((v) => isSizeVariantName(v.nombre));
  const flavorVariantes = variantes.filter((v) => !isSizeVariantName(v.nombre));

  const isDrink =
    catName.includes("bebida") ||
    catName.includes("gaseos") ||
    catName.includes("refresco") ||
    catName.includes("jugo") ||
    catName.includes("líquido") ||
    catName.includes("liquido") ||
    prodName.includes("gaseosa") ||
    prodName.includes("bebida") ||
    prodName.includes("coca-cola") ||
    prodName.includes("coca cola") ||
    prodName.includes("pepsi") ||
    prodName.includes("postobón") ||
    prodName.includes("postobon") ||
    prodName.includes("colombiana") ||
    prodName.includes("sprite") ||
    prodName.includes("cuatro") ||
    prodName.includes("quatro") ||
    prodName.includes("agua") ||
    sizeVariantes.length > 0;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div className="bg-white dark:bg-gray-900 rounded-[28px] shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden relative max-h-[92vh] border border-gray-100 dark:border-gray-800">
        
        {/* Top Showcase Header */}
        <div className="relative w-full bg-gradient-to-b from-gray-50/90 via-gray-100/40 to-white dark:from-gray-800/60 dark:via-gray-850 dark:to-gray-900 p-6 flex flex-col items-center justify-center border-b border-gray-100 dark:border-gray-800 shrink-0">
          
          {/* Badge Disponible */}
          <div className="absolute top-4 left-4 z-20">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-xs border ${
              isDisponible 
                ? "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800" 
                : "bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800"
            }`}>
              <span className={`w-2 h-2 rounded-full ${isDisponible ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
              {isDisponible ? "Disponible" : "Inactivo"}
            </span>
          </div>

          {/* Close Button 'X' */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar detalle"
            className="absolute top-4 right-4 p-2 bg-white/90 dark:bg-gray-800/90 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-full shadow-xs border border-gray-200/80 dark:border-gray-700 transition-all z-30 cursor-pointer active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Product Image Frame */}
          <div className="mt-3 w-48 h-48 sm:w-56 sm:h-56 rounded-3xl bg-white dark:bg-gray-800/90 p-3 shadow-md border border-gray-200/80 dark:border-gray-700/80 flex items-center justify-center overflow-hidden transition-transform duration-300 hover:scale-[1.02]">
            {producto.imagen ? (
              (producto.imagen.startsWith("http") || producto.imagen.startsWith("/")) ? (
                <img
                  src={producto.imagen}
                  alt={producto.nombre}
                  className="w-full h-full object-contain rounded-2xl"
                />
              ) : (
                <span className="text-7xl">{producto.imagen}</span>
              )
            ) : (
              <span className="text-7xl">🍔</span>
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
              <span className="px-3.5 py-1 bg-red-50 dark:bg-red-950/40 text-[#F05454] dark:text-red-400 border border-red-200/60 dark:border-red-900/50 rounded-full text-xs font-bold shrink-0">
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
            <div className="bg-emerald-50/60 dark:bg-emerald-950/20 rounded-2xl p-3.5 border border-emerald-100 dark:border-emerald-900/30">
              <p className="text-[11px] uppercase tracking-wider font-bold text-emerald-700 dark:text-emerald-400 mb-1">Precio Venta</p>
              <p className="text-lg font-black text-gray-900 dark:text-gray-100">
                ${precioVenta.toLocaleString("es-CO")}
              </p>
            </div>

            {/* Costo de Producción */}
            <div className="bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-3.5 border border-gray-200/80 dark:border-gray-700/50">
              <p className="text-[11px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 mb-1">Costo Estimado</p>
              <p className="text-lg font-black text-gray-900 dark:text-gray-100">
                {costoProduccion > 0 ? `$${costoProduccion.toLocaleString("es-CO")}` : (loadingFicha ? "Calculando..." : "Sin costeo")}
              </p>
            </div>

            {/* Margen de Ganancia */}
            <div className="bg-blue-50/60 dark:bg-blue-950/20 rounded-2xl p-3.5 border border-blue-100 dark:border-blue-900/30">
              <p className="text-[11px] uppercase tracking-wider font-bold text-blue-700 dark:text-blue-400 mb-1">Margen Ganancia</p>
              <p className="text-lg font-black text-blue-600 dark:text-blue-400">
                {costoProduccion > 0 ? `${margenPorcentaje}%` : "—"}
              </p>
            </div>

            {/* Total Vendidos */}
            <div className="bg-purple-50/60 dark:bg-purple-950/20 rounded-2xl p-3.5 border border-purple-100 dark:border-purple-900/30">
              <p className="text-[11px] uppercase tracking-wider font-bold text-purple-700 dark:text-purple-400 mb-1">Total Vendidos</p>
              <p className="text-lg font-black text-gray-900 dark:text-gray-100">
                {totalVendidos.toLocaleString("es-CO")} {totalVendidos === 1 ? "unidad" : "unidades"}
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-[#F05454]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Adiciones Disponibles
                  </h3>
                </div>
                {adiciones.length > 0 && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/50 text-[#F05454]">
                    {adiciones.length} activas
                  </span>
                )}
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-3.5 border border-gray-100 dark:border-gray-700/50 min-h-[100px]">
                {adiciones.length > 0 ? (
                  <ul className="space-y-2 max-h-48 overflow-y-auto pr-1 divide-y divide-gray-100 dark:divide-gray-800">
                    {adiciones.map((a, i) => (
                      <li key={a.idAdicion || a.id || i} className="flex justify-between items-center text-xs pt-1.5 first:pt-0">
                        <span className="text-gray-800 dark:text-gray-200 font-medium truncate pr-2">
                          {a.nombre}
                        </span>
                        <span className="text-[#F05454] font-bold shrink-0 font-mono">
                          +${Number(a.precio || 0).toLocaleString("es-CO")}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 py-4">
                    <PlusCircle className="w-5 h-5 mb-1 opacity-50" />
                    <p className="text-xs text-center">No tiene adiciones configuradas</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Variantes y Presentaciones: Separadas para bebidas o estándar para comidas */}
          {variantes.length > 0 && (
            isDrink ? (
              <div className="space-y-3">
                {/* 1. Tamaños de Bebida */}
                {sizeVariantes.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-amber-500" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                        Tamaños y Presentaciones de Bebida ({sizeVariantes.length})
                      </h3>
                    </div>
                    <div className="bg-amber-50/40 dark:bg-amber-950/20 rounded-2xl p-3 sm:p-4 border border-amber-200/70 dark:border-amber-900/40">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {sizeVariantes.map((v, i) => (
                          <div
                            key={v.idVariante || v.id || i}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-amber-200/80 dark:border-amber-900/40 shadow-2xs text-xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {v.imagen ? (
                                <img
                                  src={v.imagen}
                                  alt={v.nombre}
                                  className="w-7 h-7 rounded-lg object-contain bg-amber-50 dark:bg-gray-900 p-0.5 border border-amber-100 dark:border-amber-900/50 shrink-0"
                                />
                              ) : (
                                <span className="w-6 h-6 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                                  {i + 1}
                                </span>
                              )}
                              <div className="truncate">
                                <span className="font-bold text-gray-800 dark:text-gray-200 block truncate">
                                  {v.nombre}
                                </span>
                                <span className="text-[9px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                                  Tamaño adicional
                                </span>
                              </div>
                            </div>
                            <span className="font-black text-amber-600 dark:text-amber-400 shrink-0 ml-2 font-mono">
                              ${Number(v.precio || 0).toLocaleString("es-CO")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Sabores / Fórmulas de Bebida */}
                {flavorVariantes.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                        Sabores y Fórmulas de Bebida ({flavorVariantes.length})
                      </h3>
                    </div>
                    <div className="bg-purple-50/40 dark:bg-purple-950/20 rounded-2xl p-3 sm:p-4 border border-purple-200/70 dark:border-purple-900/40">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {flavorVariantes.map((v, i) => (
                          <div
                            key={v.idVariante || v.id || i}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-purple-200/80 dark:border-purple-900/40 shadow-2xs text-xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {v.imagen ? (
                                <img
                                  src={v.imagen}
                                  alt={v.nombre}
                                  className="w-7 h-7 rounded-lg object-contain bg-purple-50 dark:bg-gray-900 p-0.5 border border-purple-100 dark:border-purple-900/50 shrink-0"
                                />
                              ) : (
                                <span className="w-6 h-6 rounded-md bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                                  {i + 1}
                                </span>
                              )}
                              <div className="truncate">
                                <span className="font-bold text-gray-800 dark:text-gray-200 block truncate">
                                  {v.nombre}
                                </span>
                                <span className="text-[9px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                                  Fórmula / Sabor
                                </span>
                              </div>
                            </div>
                            <span className="font-black text-purple-600 dark:text-purple-400 shrink-0 ml-2 font-mono">
                              ${Number(v.precio || 0).toLocaleString("es-CO")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Comidas regulares */
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-orange-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Variantes y Presentaciones ({variantes.length})
                  </h3>
                </div>
                <div className="bg-orange-50/40 dark:bg-orange-950/20 rounded-2xl p-4 border border-orange-100 dark:border-orange-900/30">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {variantes.map((v, i) => (
                      <div
                        key={v.idVariante || v.id || i}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-orange-150 dark:border-orange-900/40 shadow-2xs text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {v.imagen ? (
                            <img
                              src={v.imagen}
                              alt={v.nombre}
                              className="w-7 h-7 rounded-lg object-contain bg-orange-50 dark:bg-gray-900 p-0.5 border border-orange-100 dark:border-orange-900/50 shrink-0"
                            />
                          ) : (
                            <span className="w-5 h-5 rounded-md bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                              {i + 1}
                            </span>
                          )}
                          <span className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                            {v.nombre}
                          </span>
                        </div>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 shrink-0 ml-2 font-mono">
                          ${Number(v.precio || 0).toLocaleString("es-CO")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          )}

          {/* Eventos / Descuentos Activos */}
          {eventosActivos.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-base">🎉</span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                  Eventos y Promociones Activas ({eventosActivos.length})
                </h3>
              </div>
              <div className="bg-purple-50/60 dark:bg-purple-950/20 rounded-2xl p-4 border border-purple-100 dark:border-purple-900/30">
                <ul className="space-y-2.5">
                  {eventosActivos.map((evt, i) => (
                    <li key={i} className="flex justify-between items-start text-xs bg-white dark:bg-gray-800 p-3.5 rounded-xl shadow-xs border border-purple-100 dark:border-purple-900/20">
                      <div className="flex items-start gap-2.5">
                        <span className="text-2xl shrink-0 p-1 bg-purple-50 dark:bg-purple-900/40 rounded-lg">{evt.icono || "🎉"}</span>
                        <div>
                          <span className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5 flex-wrap">
                            {evt.nombreEvento || evt.nombre}
                            {evt.tipoEvento && (
                              <span className="text-[10px] bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-md font-semibold">
                                {evt.tipoEvento}
                              </span>
                            )}
                            {evt.isTemporal && (
                              <span className="text-[10px] bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300 px-1.5 py-0.5 rounded font-bold uppercase">
                                Temporal
                              </span>
                            )}
                          </span>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-snug">{evt.descripcion}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        {evt.tipoEvento === "Descuento" && evt.descuento && (
                          <span className="text-emerald-700 dark:text-emerald-300 font-extrabold bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg">
                            -{Number(evt.descuento)}% OFF
                          </span>
                        )}
                        {(evt.tipoEvento === "Promoción Precio" || evt.nuevoPrecio) && (
                          <span className="text-purple-700 dark:text-purple-300 font-extrabold bg-purple-100 dark:bg-purple-950/60 px-2.5 py-1 rounded-lg">
                            ${Number(evt.nuevoPrecio).toLocaleString("es-CO")}
                          </span>
                        )}
                        {evt.tipoEvento === "2x1 / Combo Especial" && (
                          <span className="text-amber-700 dark:text-amber-300 font-extrabold bg-amber-100 dark:bg-amber-950/60 px-2.5 py-1 rounded-lg">
                            2x1 COMBO
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Sección de Reseñas del Producto */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Reseñas y Calificaciones ({resenasData.total})
                </h3>
              </div>
              {resenasData.total > 0 && (
                <div className="flex items-center gap-1.5">
                  <StarRating value={resenasData.promedio} readonly size="sm" />
                  <span className="text-xs font-black text-amber-600 dark:text-amber-400">{resenasData.promedio.toFixed(1)} / 5</span>
                </div>
              )}
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-4 border border-gray-100 dark:border-gray-700/50">
              {loadingResenas ? (
                <p className="text-xs text-gray-400 text-center py-3">Cargando reseñas...</p>
              ) : resenasData.resenas && resenasData.resenas.length > 0 ? (
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {resenasData.resenas.map((r) => (
                    <div key={r.id} className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700/60 shadow-2xs space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-gray-900 dark:text-gray-100">{r.nombre}</span>
                        <StarRating value={r.puntuacion} readonly size="xs" />
                      </div>
                      {r.comentario && (
                        <p className="text-xs text-gray-600 dark:text-gray-300 italic">"{r.comentario}"</p>
                      )}
                      <p className="text-[10px] text-gray-400">{new Date(r.fecha).toLocaleDateString("es-CO")}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 py-3">
                  <MessageSquare className="w-5 h-5 mb-1 opacity-50" />
                  <p className="text-xs text-center">Este producto aún no tiene reseñas registradas.</p>
                </div>
              )}
            </div>
          </div>

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
