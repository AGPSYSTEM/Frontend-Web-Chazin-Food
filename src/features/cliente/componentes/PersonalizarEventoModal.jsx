import React, { useState, useEffect, useMemo } from "react";
import { 
  X, Sparkles, Plus, Minus, ShoppingCart, Tag, Zap, Gift, 
  Layers, Check, PackagePlus, FileText, Info
} from "lucide-react";

export function PersonalizarEventoModal({
  isOpen,
  onClose,
  evento,
  producto: initialProducto,
  productosList = [],
  adicionesList = [],
  onAddToCart,
  getProductQuantityInCart
}) {
  const [selectedProduct, setSelectedProduct] = useState(initialProducto || null);
  const [cantidad, setCantidad] = useState(1);
  const [selectedAdditions, setSelectedAdditions] = useState([]);
  const [especificaciones, setEspecificaciones] = useState("");

  // Determine available products for this event
  const eventProducts = useMemo(() => {
    if (!evento) return [];
    if (evento.idProducto) {
      const p = productosList.find(
        (prod) => String(prod.id || prod.idProducto) === String(evento.idProducto)
      );
      return p ? [p] : (initialProducto ? [initialProducto] : []);
    }
    if (evento.productosAsociados && Array.isArray(evento.productosAsociados) && evento.productosAsociados.length > 0) {
      return evento.productosAsociados
        .map((pa) => {
          const p = productosList.find(
            (prod) => String(prod.id || prod.idProducto) === String(pa.idProducto || pa.id)
          );
          if (p) {
            return {
              ...p,
              eventNuevoPrecio: pa.nuevoPrecio,
              eventDescuento: pa.descuento
            };
          }
          return null;
        })
        .filter(Boolean);
    }
    return initialProducto ? [initialProducto] : productosList.slice(0, 3);
  }, [evento, productosList, initialProducto]);

  useEffect(() => {
    if (isOpen) {
      setCantidad(1);
      setSelectedAdditions([]);
      setEspecificaciones("");
      if (initialProducto) {
        setSelectedProduct(initialProducto);
      } else if (eventProducts.length > 0) {
        setSelectedProduct(eventProducts[0]);
      }
    }
  }, [isOpen, initialProducto, eventProducts]);

  if (!isOpen || !evento) return null;

  // Calculate promotional base price
  const basePrice = Number(selectedProduct?.precio || 0);
  let promoPrice = basePrice;
  let savings = 0;

  if (selectedProduct) {
    if (selectedProduct.eventNuevoPrecio) {
      promoPrice = Number(selectedProduct.eventNuevoPrecio);
    } else if (selectedProduct.eventDescuento) {
      promoPrice = basePrice * (1 - Number(selectedProduct.eventDescuento) / 100);
    } else if (evento.tipoEvento === "Promoción Precio" && evento.nuevoPrecio) {
      promoPrice = Number(evento.nuevoPrecio);
    } else if (evento.tipoEvento === "Descuento" && evento.descuento) {
      promoPrice = basePrice * (1 - Number(evento.descuento) / 100);
    } else if (evento.nuevoPrecio) {
      promoPrice = Number(evento.nuevoPrecio);
    }
    savings = Math.max(0, basePrice - promoPrice);
  }

  // Additions total
  const additionsTotal = selectedAdditions.reduce(
    (sum, a) => sum + (Number(a.precio) || 0) * (Number(a.cantidad) || 1),
    0
  );

  const unitTotal = promoPrice + additionsTotal;
  const finalTotal = unitTotal * cantidad;

  // Toggle addition
  const toggleAdicion = (ad) => {
    const adId = ad.idAdicion || ad.id;
    const exists = selectedAdditions.find((a) => (a.idAdicion || a.id) === adId);
    if (exists) {
      setSelectedAdditions(selectedAdditions.filter((a) => (a.idAdicion || a.id) !== adId));
    } else {
      setSelectedAdditions([
        ...selectedAdditions,
        {
          idAdicion: adId,
          id: adId,
          nombre: ad.nombre,
          precio: Number(ad.precio) || 0,
          cantidad: 1,
          imagen: ad.imagen || "🥫"
        }
      ]);
    }
  };

  const changeAdicionQty = (adId, delta) => {
    setSelectedAdditions((prev) =>
      prev
        .map((a) => {
          if ((a.idAdicion || a.id) === adId) {
            const next = (a.cantidad || 1) + delta;
            return next > 0 ? { ...a, cantidad: next } : null;
          }
          return a;
        })
        .filter(Boolean)
    );
  };

  const handleConfirmAddToCart = () => {
    if (!selectedProduct) return;

    const eventNameTag = evento.nombreEvento || evento.nombre || "Evento Especial";
    const itemToAdd = {
      id: selectedProduct.id || selectedProduct.idProducto,
      idProducto: selectedProduct.idProducto || selectedProduct.id,
      nombre: `${selectedProduct.nombre} (${evento.icono || "🎉"} ${eventNameTag})`,
      nombreOriginal: selectedProduct.nombre,
      precio: promoPrice,
      cantidad: cantidad,
      stock: Number(selectedProduct.stock || selectedProduct.stockActual || 50),
      imagen: selectedProduct.imagen,
      isEvento: true,
      eventoInfo: {
        idEvento: evento.id || evento.idEvento,
        nombre: eventNameTag,
        tipoEvento: evento.tipoEvento,
        icono: evento.icono || "🎉"
      },
      adiciones: selectedAdditions.map((a) => ({
        idAdicion: a.idAdicion,
        nombre: a.nombre,
        precio: Number(a.precio) || 0,
        cantidad: Number(a.cantidad) || 1,
        imagen: a.imagen || "🥫"
      })),
      observaciones: especificaciones.trim() || undefined
    };

    onAddToCart(itemToAdd);
    onClose();
  };

  // Stock check
  const stockTot = Number(selectedProduct?.stock || selectedProduct?.stockActual || 50);
  const inCart = getProductQuantityInCart ? getProductQuantityInCart(selectedProduct?.id || selectedProduct?.idProducto) : 0;
  const remainingStock = Math.max(0, stockTot - inCart);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col max-h-[92vh]">
        
        {/* Header with Event Gradient */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-600 p-5 text-white flex items-start justify-between relative overflow-hidden shrink-0">
          <div className="flex items-center gap-3.5 z-10">
            <div className="w-13 h-13 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner">
              {evento.icono || "🎉"}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/20">
                  {evento.tipoEvento || "Evento Activo"}
                </span>
                {evento.isTemporal && evento.fechaFin && (
                  <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-gray-900">
                    Hasta {evento.fechaFin}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-black text-white mt-1 leading-snug">
                {evento.nombreEvento || evento.nombre}
              </h2>
              <p className="text-xs text-purple-100/90 line-clamp-1">
                {evento.descripcion || "Personaliza tu pedido con esta oferta especial."}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors z-10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-left">
          
          {/* If Event has multiple associated products, let user choose */}
          {eventProducts.length > 1 && (
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                Selecciona el producto a personalizar:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {eventProducts.map((p) => {
                  const isSelected = String(p.id || p.idProducto) === String(selectedProduct?.id || selectedProduct?.idProducto);
                  return (
                    <button
                      key={p.id || p.idProducto}
                      type="button"
                      onClick={() => setSelectedProduct(p)}
                      className={`p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                        isSelected
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-900/30 ring-2 ring-purple-400/40"
                          : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 overflow-hidden text-xl">
                        {p.imagen ? <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover" /> : "🍔"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">{p.nombre}</p>
                        <p className="text-[11px] font-black text-purple-600 dark:text-purple-400">
                          ${(p.eventNuevoPrecio ? Number(p.eventNuevoPrecio) : p.precio).toLocaleString("es-CO")}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Product Spotlight Card with Promo Price */}
          {selectedProduct && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50/70 via-indigo-50/40 to-slate-50/80 dark:from-purple-950/20 dark:to-gray-850 border border-purple-100 dark:border-purple-900/40 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 border border-purple-100 dark:border-purple-900/50 flex items-center justify-center shrink-0 overflow-hidden shadow-xs text-3xl">
                  {selectedProduct.imagen ? (
                    <img src={selectedProduct.imagen} alt={selectedProduct.nombre} className="w-full h-full object-cover" />
                  ) : (
                    "🍔"
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="font-extrabold text-gray-900 dark:text-gray-100 text-sm sm:text-base truncate">
                    {selectedProduct.nombre}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                    {selectedProduct.descripcion || "Producto con beneficios del evento aplicados."}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                      Stock: {remainingStock} disp.
                    </span>
                  </div>
                </div>
              </div>

              {/* Price Calculation Column */}
              <div className="text-right shrink-0">
                {savings > 0 && (
                  <span className="text-xs text-gray-400 line-through block font-medium">
                    ${basePrice.toLocaleString("es-CO")}
                  </span>
                )}
                <span className="text-xl font-black text-purple-700 dark:text-purple-300 flex items-center justify-end gap-1">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  ${promoPrice.toLocaleString("es-CO")}
                </span>
                {savings > 0 && (
                  <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                    Ahorras ${savings.toLocaleString("es-CO")}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Included Event Insumos/Ingredients (if present) */}
          {evento.insumosAsociados && Array.isArray(evento.insumosAsociados) && evento.insumosAsociados.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
              <div className="flex items-center gap-2 mb-2">
                <PackagePlus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-black uppercase tracking-wider text-indigo-900 dark:text-indigo-200">
                  Ingredientes del Evento Incluidos:
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {evento.insumosAsociados.map((ins, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-gray-800 text-xs font-bold text-gray-800 dark:text-gray-200 border border-indigo-200 dark:border-indigo-800 shadow-2xs"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>+{ins.cantidad} {ins.unidad || "und"} {ins.nombre}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Cantidad Stepper */}
          <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Cantidad del Evento
              </p>
              <p className="text-[11px] text-gray-400">
                ¿Cuántas porciones de esta promoción deseas?
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCantidad((prev) => Math.max(1, prev - 1))}
                className="w-8 h-8 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-200 cursor-pointer active:scale-95 shadow-xs"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-black text-base text-gray-900 dark:text-gray-100 min-w-6 text-center">
                {cantidad}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (cantidad < remainingStock) {
                    setCantidad((prev) => prev + 1);
                  }
                }}
                className="w-8 h-8 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-200 cursor-pointer active:scale-95 shadow-xs"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Adiciones Personalizables */}
          {adicionesList.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-purple-600" />
                  <span>Personalizar con Adiciones Extras:</span>
                </label>
                {selectedAdditions.length > 0 && (
                  <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400">
                    +{selectedAdditions.length} seleccionada{selectedAdditions.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {adicionesList.map((ad) => {
                  const adId = ad.idAdicion || ad.id;
                  const selected = selectedAdditions.find((a) => (a.idAdicion || a.id) === adId);
                  return (
                    <div
                      key={adId}
                      className={`p-2.5 rounded-2xl border text-xs flex items-center justify-between transition-all ${
                        selected
                          ? "border-purple-500 bg-purple-50/70 dark:bg-purple-950/30 shadow-xs"
                          : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      <div
                        onClick={() => toggleAdicion(ad)}
                        className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer select-none"
                      >
                        <span className="text-lg shrink-0">{ad.imagen || "🥫"}</span>
                        <div className="min-w-0">
                          <p className="text-gray-900 dark:text-gray-100 font-bold truncate">{ad.nombre}</p>
                          <p className="text-purple-600 dark:text-purple-400 font-black text-[11px]">
                            +${Number(ad.precio).toLocaleString("es-CO")}
                          </p>
                        </div>
                      </div>

                      {/* Stepper Sumar / Restar cuando está seleccionada */}
                      {selected ? (
                        <div className="flex items-center gap-1.5 bg-white dark:bg-gray-800 px-2 py-1 rounded-xl border border-purple-200 dark:border-purple-900 shadow-xs">
                          <button
                            type="button"
                            onClick={() => changeAdicionQty(adId, -1)}
                            className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-purple-100 text-gray-700 dark:text-gray-200 flex items-center justify-center cursor-pointer active:scale-95"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-black text-gray-900 dark:text-gray-100 min-w-5 text-center text-xs">
                            {selected.cantidad}
                          </span>
                          <button
                            type="button"
                            onClick={() => changeAdicionQty(adId, 1)}
                            className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-purple-100 text-gray-700 dark:text-gray-200 flex items-center justify-center cursor-pointer active:scale-95"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggleAdicion(ad)}
                          className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-purple-600 hover:text-white text-gray-700 dark:text-gray-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Añadir</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notas / Especificaciones para cocina */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Instrucciones especiales para cocina (Opcional):
            </label>
            <input
              type="text"
              value={especificaciones}
              onChange={(e) => setEspecificaciones(e.target.value)}
              placeholder="Ej: Salsa aparte, término bien asado, sin servilletas..."
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 transition-colors"
            />
          </div>
        </div>

        {/* Footer with Total and Add to Cart */}
        <div className="p-4 px-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/60 flex items-center justify-between gap-4 shrink-0">
          <div>
            <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
              Total Evento ({cantidad} {cantidad === 1 ? "und" : "unds"})
            </span>
            <span className="text-2xl font-black text-gray-900 dark:text-gray-100">
              ${finalTotal.toLocaleString("es-CO")}
            </span>
          </div>

          <button
            type="button"
            onClick={handleConfirmAddToCart}
            disabled={remainingStock <= 0}
            className="flex-1 max-w-[260px] py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:scale-[0.98] text-white rounded-2xl font-black text-sm transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Agregar al carrito</span>
          </button>
        </div>
      </div>
    </div>
  );
}
