import React, { useMemo, useState } from "react";
import { Plus, Sliders, Sparkles, Flame, Layers } from "lucide-react";
import { stripEmojis } from "@/shared/utils/foodEmojiUtils";
import { FoodIcon, FoodIconBadge } from "@/shared/components/ui/FoodIcon";

export function ProductCard({ producto, onAdd, onCustomize }) {
  const [imageError, setImageError] = useState(false);

  const variantes = useMemo(
    () => producto.variantes || [{ id: producto.id, nombre: producto.nombre, precio: producto.precio }],
    [producto]
  );

  const currentVariante = variantes[0] || { id: producto.id, precio: producto.precio || 0 };

  // Detect active promotional event
  const activeEvent = useMemo(() => {
    const eventos = Array.isArray(producto.eventos) ? producto.eventos : [];
    if (eventos.length === 0) return null;
    const now = new Date();
    const valid = eventos.filter((e) => {
      if (e.estado !== 1 && e.estado !== "Activo" && e.estado !== undefined) return false;
      if (e.fechaFin) {
        const finDate = new Date(`${e.fechaFin}T23:59:59`);
        if (now > finDate) return false;
      }
      if (e.fechaInicio) {
        const inicioDate = new Date(`${e.fechaInicio}T00:00:00`);
        if (now < inicioDate) return false;
      }
      return true;
    });
    if (valid.length === 0) return null;
    const evt = valid[0];

    const rawPrice = Number(currentVariante.precio || producto.precio || 0);
    let finalPrice = rawPrice;
    if (evt.nuevoPrecio && Number(evt.nuevoPrecio) > 0) {
      finalPrice = Number(evt.nuevoPrecio);
    } else if (evt.descuento && Number(evt.descuento) > 0) {
      finalPrice = rawPrice * (1 - Number(evt.descuento) / 100);
    }
    const savings = Math.max(0, rawPrice - finalPrice);
    const discountPercent = rawPrice > 0 && savings > 0
      ? Math.round((savings / rawPrice) * 100)
      : (evt.descuento ? Math.round(Number(evt.descuento)) : 0);

    return {
      ...evt,
      nombre: stripEmojis(evt.nombreEvento || evt.nombre || "Evento Especial"),
      rawPrice,
      finalPrice,
      savings,
      discountPercent,
      tipo: evt.tipoEvento || evt.tipo || "Evento"
    };
  }, [producto.eventos, currentVariante.precio, producto.precio]);

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

  const effectiveBasePrice = activeEvent ? activeEvent.finalPrice : (Number(currentVariante.precio) || 0);

  // Al hacer clic en "Agregar" se abre el modal completo del producto
  const handleAdd = () => {
    if (onCustomize) {
      onCustomize(producto);
    }
  };

  const handleOpenCustomize = () => {
    if (onCustomize) {
      onCustomize(producto);
    }
  };

  const productImage = producto.imagen || producto.imagenUrl || producto.urlImagen || producto.foto || producto.img;

  return (
    <article
      className={`group rounded-[24px] bg-white dark:bg-gray-900 transition-all flex flex-col justify-between h-full overflow-hidden relative ${
        activeEvent
          ? "border-2 border-amber-400 dark:border-amber-500 ring-2 ring-amber-400/40 shadow-md shadow-amber-500/10 dark:shadow-none"
          : "border border-[#e5e9ef] dark:border-gray-800 shadow-xs hover:shadow-md"
      }`}
    >
      {/* ═══ FAST FOOD EVENT HEADER BANNER ═══ */}
      {activeEvent && (
        <div
          onClick={handleOpenCustomize}
          className="bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white font-black text-[10px] uppercase tracking-wider py-1.5 px-3 flex items-center justify-between shadow-xs z-10 shrink-0 cursor-pointer hover:opacity-95 transition-opacity select-none"
          title={`Evento: ${activeEvent.nombre}. Clic para personalizar.`}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <Flame className="w-3.5 h-3.5 text-amber-200 fill-amber-200 animate-pulse shrink-0" />
            <span className="truncate">{activeEvent.nombre}</span>
          </div>
          <span className="bg-black/25 backdrop-blur-xs text-amber-200 text-[9px] font-black px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-amber-300" />
            {activeEvent.discountPercent > 0
              ? `-${activeEvent.discountPercent}% OFF`
              : activeEvent.tipo || "Promo"}
          </span>
        </div>
      )}

      {/* ── Spacious Product Image Space (Clickable to customize) ── */}
      <div
        onClick={handleOpenCustomize}
        className="relative flex h-36 sm:h-40 w-full items-center justify-center bg-gray-100 dark:bg-gray-800 shrink-0 overflow-hidden border-b border-gray-100 dark:border-gray-800/80 cursor-pointer"
        title="Clic para ver detalles, personalizar y ficha técnica"
      >
        {productImage && !imageError ? (
          <img
            src={productImage}
            alt={producto.nombre}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-3 text-center">
            <FoodIconBadge
              name={producto.nombre}
              category={producto.categoria?.nombre || producto.categoria}
              size="lg"
              className="group-hover:scale-110 transition-transform shadow-sm"
            />
          </div>
        )}

        {/* Hover quick pill */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md text-gray-900 dark:text-gray-100 text-[11px] font-black px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Sliders className="w-3.5 h-3.5 text-[#f05454]" />
            <span>Personalizar</span>
          </span>
        </div>

        {/* Active Event badge on image */}
        {activeEvent && (
          <span className="absolute top-2.5 left-2.5 bg-gradient-to-r from-amber-500 to-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md border border-white/20 z-10">
            <Flame className="w-2.5 h-2.5 text-amber-200 fill-amber-200" />
            <span>{activeEvent.discountPercent > 0 ? `-${activeEvent.discountPercent}%` : "Evento"}</span>
          </span>
        )}

        {/* Additions count badge */}
        {adiciones.length > 0 && (
          <span className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs z-10">
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
          {/* Active event subtitle badge */}
          {activeEvent && (
            <div className="mb-1">
              <span className="inline-flex items-center gap-1 text-[9.5px] font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/60">
                <Sparkles className="w-2.5 h-2.5" />
                <span className="truncate max-w-[170px]">{activeEvent.nombre}</span>
              </span>
            </div>
          )}

          {/* Title (clickable to customize) */}
          <div
            onClick={handleOpenCustomize}
            className="min-h-[38px] flex items-center justify-center text-center w-full px-1 cursor-pointer hover:text-[#f05454] transition-colors"
            title="Clic para personalizar y ver ficha técnica"
          >
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

        {/* ── Price & Action Footer ── */}
        <div className="pt-3 flex flex-col gap-2 mt-3 w-full border-t border-gray-100 dark:border-gray-800">
          {/* Price Row */}
          <div className="flex items-center justify-between gap-2 px-0.5">
            <div className="text-left flex flex-col min-w-0">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none">Precio</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                {activeEvent && activeEvent.savings > 0 && (
                  <span className="text-[11px] line-through font-semibold text-gray-400">
                    ${Number(activeEvent.rawPrice).toLocaleString("es-CO")}
                  </span>
                )}
                {activeEvent && activeEvent.savings > 0 && (
                  <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded-md">
                    -{activeEvent.discountPercent}%
                  </span>
                )}
                <span className={`text-sm sm:text-base font-black leading-tight ${
                  activeEvent ? "text-amber-600 dark:text-amber-400" : "text-[#f05454] dark:text-red-400"
                }`}>
                  ${Number(effectiveBasePrice).toLocaleString("es-CO")}
                </span>
              </div>
            </div>

            {/* Additions count chip */}
            {adiciones.length > 0 && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">
                <Layers className="w-3 h-3 text-amber-400" />
                {adiciones.length} extras
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-1.5 w-full">
            <button
              type="button"
              onClick={handleOpenCustomize}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 py-2.5 px-2 text-[11px] font-black text-gray-700 dark:text-gray-200 shadow-2xs transition-all cursor-pointer active:scale-95 border border-gray-200/70 dark:border-gray-700"
              title="Personalizar ingredientes, adiciones y ficha técnica"
            >
              <Sliders className="h-3.5 w-3.5 text-[#f05454]" />
              <span>Personalizar</span>
            </button>

            <button
              type="button"
              onClick={handleAdd}
              className={`inline-flex items-center justify-center gap-1 rounded-xl py-2.5 px-2 text-[11px] font-black text-white shadow-xs transition-all cursor-pointer active:scale-95 ${
                activeEvent
                  ? "bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 shadow-amber-500/20"
                  : "bg-[#f05454] hover:bg-[#d94444]"
              }`}
              title={activeEvent ? `Agregar con precio promocional de ${activeEvent.nombre}` : "Agregar al carrito"}
            >
              <Plus className="h-3.5 w-3.5 stroke-[3]" />
              <span>Agregar</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
