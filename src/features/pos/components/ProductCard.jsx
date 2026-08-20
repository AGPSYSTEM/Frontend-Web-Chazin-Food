import React, { useMemo, useState } from "react";
import { Plus, Minus, Check, ChevronDown, ChevronUp, Layers, ImageIcon } from "lucide-react";
import { getAdditionEmoji, getProductEmoji } from "@/shared/utils/foodEmojiUtils";

export function ProductCard({ producto, onAdd }) {
  const [showAdditions, setShowAdditions] = useState(false);
  const [selectedAdditions, setSelectedAdditions] = useState([]); // [{ id, nombre, precio, cantidad, imagen }]
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);

  const variantes = useMemo(
    () => producto.variantes || [{ id: producto.id, nombre: producto.nombre, precio: producto.precio }],
    [producto]
  );

  const currentVariante = variantes[0] || { id: producto.id, precio: producto.precio || 0 };

  const adiciones = useMemo(() => {
    let raw = producto.adiciones;
    if (typeof raw === "string") {
      try {
        raw = JSON.parse(raw);
      } catch (e) {
        raw = [];
      }
    }
    if (!Array.isArray(raw)) return [];
    return raw.map((a, idx) => ({
      id: a.idAdicion || a.id || idx + 1,
      idAdicion: a.idAdicion || a.id || idx + 1,
      nombre: a.nombre || `Adición #${idx + 1}`,
      precio: Number(a.precio || 0),
      imagen: a.imagen || a.foto || a.icono || ""
    }));
  }, [producto.adiciones]);

  // Toggle addition checked
  const toggleAdicion = (adicion) => {
    const adId = adicion.idAdicion || adicion.id;
    setSelectedAdditions((prev) => {
      const exists = prev.find((a) => (a.idAdicion || a.id) === adId);
      if (exists) {
        return prev.filter((a) => (a.idAdicion || a.id) !== adId);
      } else {
        return [...prev, { ...adicion, id: adId, idAdicion: adId, cantidad: 1 }];
      }
    });
  };

  // Change quantity of a selected addition
  const changeAdicionQty = (adId, delta) => {
    setSelectedAdditions((prev) =>
      prev.map((a) => {
        if ((a.idAdicion || a.id) === adId) {
          const newQty = Math.max(1, (a.cantidad || 1) + delta);
          return { ...a, cantidad: newQty };
        }
        return a;
      })
    );
  };

  const additionsTotal = useMemo(() => {
    return selectedAdditions.reduce((sum, a) => sum + (Number(a.precio) || 0) * (Number(a.cantidad) || 1), 0);
  }, [selectedAdditions]);

  const unitPrice = (Number(currentVariante.precio) || 0) + additionsTotal;
  const finalCardPrice = unitPrice * quantity;

  const handleAdd = () => {
    onAdd({
      productoId: producto.id,
      varianteId: currentVariante.id,
      nombre: producto.nombre,
      precio: currentVariante.precio,
      adiciones: selectedAdditions,
      cantidad: quantity
    });
    setQuantity(1);
    setSelectedAdditions([]);
    setShowAdditions(false);
  };

  const productImage = producto.imagen || producto.imagenUrl || producto.urlImagen || producto.foto || producto.img;

  return (
    <article className="group rounded-[24px] border border-[#e5e9ef] dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs hover:shadow-md transition-all flex flex-col justify-between h-full overflow-hidden">
      {/* ── Spacious Product Image Space ── */}
      <div className="relative flex h-36 sm:h-40 w-full items-center justify-center bg-gradient-to-br from-red-500/10 via-rose-500/5 to-amber-500/10 dark:from-red-950/40 dark:to-gray-850 shrink-0 overflow-hidden border-b border-gray-100 dark:border-gray-800/80">
        {productImage && !imageError ? (
          <img
            src={productImage}
            alt={producto.nombre}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-3 text-center">
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-white/70 dark:bg-white/10 text-3xl sm:text-4xl shadow-xs backdrop-blur-md border border-white/40 dark:border-white/10 group-hover:scale-110 transition-transform">
              {getProductEmoji(producto.nombre)}
            </div>
          </div>
        )}

        {/* Additions count badge */}
        {adiciones.length > 0 && (
          <span className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
            <Layers className="w-2.5 h-2.5 text-amber-400" />
            <span>{adiciones.length} adic.</span>
          </span>
        )}

        {/* Category tag if available */}
        {producto.categoria && (
          <span className="absolute bottom-2 left-2.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md text-gray-700 dark:text-gray-200 text-[10px] font-black px-2 py-0.5 rounded-md shadow-2xs border border-gray-200/50 dark:border-gray-700">
            {producto.categoria}
          </span>
        )}
      </div>

      {/* ── Card Body ── */}
      <div className="p-3.5 sm:p-4 flex flex-col justify-between flex-1 text-center transition-colors">
        <div className="flex flex-col items-center">
          {/* Title */}
          <div className="min-h-[38px] flex items-center justify-center text-center w-full px-1">
            <h3 className="text-xs sm:text-sm font-black text-[#1f2d3d] dark:text-gray-100 leading-snug line-clamp-2">
              {producto.nombre}
            </h3>
          </div>

          {/* Description */}
          <div className="h-4 flex items-center justify-center text-center mt-0.5 w-full px-1">
            <p className="text-[11px] text-[#718096] dark:text-gray-400 truncate w-full font-medium">
              {producto.descripcion || "Producto disponible"}
            </p>
          </div>
        </div>

        {/* ── Adiciones Toggle & Panel ── */}
        {adiciones.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-800 w-full text-left">
            <button
              type="button"
              onClick={() => setShowAdditions((prev) => !prev)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-[#f05454] dark:text-red-400 bg-red-50/70 dark:bg-red-900/20 hover:bg-red-100/70 dark:hover:bg-red-900/30 transition-colors cursor-pointer border border-red-100/60 dark:border-red-900/40"
            >
              <span className="flex items-center gap-1.5">
                <span>{showAdditions ? "Ocultar adiciones" : "Personalizar adiciones"}</span>
                {selectedAdditions.length > 0 && (
                  <span className="bg-[#f05454] text-white text-[9.5px] font-black rounded-full h-4 min-w-[18px] px-1 flex items-center justify-center shadow-2xs">
                    {selectedAdditions.length}
                  </span>
                )}
              </span>
              {showAdditions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showAdditions && (
              <div className="mt-2 space-y-1.5 rounded-xl border border-[#e9edf2] dark:border-gray-700 bg-[#f8fafc] dark:bg-gray-800/80 p-2.5 text-[11px] max-h-44 overflow-y-auto">
                <p className="text-[9.5px] uppercase tracking-wider font-extrabold text-gray-400 dark:text-gray-400 mb-1">
                  Elige tus extras:
                </p>
                {adiciones.map((adicion) => {
                  const adId = adicion.idAdicion || adicion.id;
                  const selectedObj = selectedAdditions.find((a) => (a.idAdicion || a.id) === adId);
                  const isChecked = Boolean(selectedObj);
                  const itemQty = selectedObj?.cantidad || 1;

                  return (
                    <div
                      key={adId}
                      className={`flex items-center justify-between gap-1.5 py-1.5 px-2 rounded-xl transition-all border ${
                        isChecked
                          ? "bg-red-50/80 dark:bg-red-950/40 border-red-200 dark:border-red-900/60 text-[#f05454] dark:text-red-300 font-bold"
                          : "border-transparent text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-700/60"
                      }`}
                    >
                      {/* Checkbox, Avatar (Image/Emoji) & Name */}
                      <label className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleAdicion(adicion)}
                          className="h-4 w-4 rounded border-[#d5dbe2] dark:border-gray-600 accent-[#f05454] cursor-pointer shrink-0"
                        />
                        <span className="w-6 h-6 shrink-0 flex items-center justify-center rounded-lg bg-white dark:bg-gray-700 shadow-2xs text-xs border border-gray-200/70 dark:border-gray-600 overflow-hidden">
                          {adicion.imagen && (adicion.imagen.startsWith("http") || adicion.imagen.startsWith("/")) ? (
                            <img src={adicion.imagen} alt={adicion.nombre} className="w-full h-full object-cover" />
                          ) : (
                            getAdditionEmoji(adicion.nombre, adicion.imagen)
                          )}
                        </span>
                        <span className="truncate text-[11.5px] font-semibold leading-tight">
                          {adicion.nombre}
                        </span>
                      </label>

                      {/* Right: Quantity Stepper if checked + Price */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isChecked && (
                          <div className="flex items-center gap-1 bg-white dark:bg-gray-900 rounded-lg p-0.5 border border-red-200 dark:border-red-900/50 shadow-2xs">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                changeAdicionQty(adId, -1);
                              }}
                              className="h-4.5 w-4.5 flex items-center justify-center rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-red-100 text-[10px] font-bold cursor-pointer"
                              title="Disminuir cantidad"
                            >
                              -
                            </button>
                            <span className="text-[10px] font-black min-w-[14px] text-center text-[#f05454]">
                              {itemQty}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                changeAdicionQty(adId, 1);
                              }}
                              className="h-4.5 w-4.5 flex items-center justify-center rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-red-100 text-[10px] font-bold cursor-pointer"
                              title="Aumentar cantidad"
                            >
                              +
                            </button>
                          </div>
                        )}
                        <span className="font-black text-[10.5px]">
                          +${Number((Number(adicion.precio || 0) * itemQty)).toLocaleString("es-CO")}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Product Quantity Stepper & Price/Action Footer ── */}
        <div className="pt-3 flex flex-col gap-2 mt-3 w-full border-t border-gray-100 dark:border-gray-800">
          {/* Stepper & Price Row */}
          <div className="flex items-center justify-between gap-2 px-0.5">
            {/* Price Info */}
            <div className="text-left flex flex-col">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none">
                {quantity > 1 ? `Total (${quantity} unids)` : "Precio"}
              </span>
              <span className="text-sm sm:text-base font-black text-[#f05454] dark:text-red-400 leading-tight">
                ${Number(finalCardPrice).toLocaleString("es-CO")}
              </span>
            </div>

            {/* Product Quantity Incrementer / Decrementer Stepper */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200/70 dark:border-gray-700/60 shadow-2xs">
              <button
                type="button"
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                disabled={quantity <= 1}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 transition cursor-pointer shadow-2xs active:scale-95"
                title="Disminuir cantidad del producto"
              >
                <Minus className="w-3 h-3 stroke-[3]" />
              </button>

              <span className="w-6 text-center text-xs font-black text-gray-800 dark:text-gray-100">
                {quantity}
              </span>

              <button
                type="button"
                onClick={() => setQuantity((prev) => prev + 1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition cursor-pointer shadow-2xs active:scale-95"
                title="Aumentar cantidad del producto"
              >
                <Plus className="w-3 h-3 stroke-[3]" />
              </button>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handleAdd}
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#f05454] hover:bg-[#d94444] py-2.5 px-3 text-xs font-black text-white shadow-xs transition-all cursor-pointer active:scale-[0.98]"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>{quantity > 1 ? `Agregar (${quantity})` : "Agregar al Carrito"}</span>
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
