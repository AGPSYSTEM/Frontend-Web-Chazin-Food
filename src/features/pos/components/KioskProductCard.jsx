import React from "react";
import { Sparkles, Flame, Tag } from "lucide-react";
import { motion } from "motion/react";

export default function KioskProductCard({ producto, onSelect }) {
  if (!producto) return null;

  const now = new Date();
  const eventos = Array.isArray(producto.eventos) ? producto.eventos : [];
  const activeEvent = eventos.find((e) => {
    if (e.estado !== 1 && e.estado !== "Activo" && e.estado !== undefined) return false;
    if (e.fechaFin && now > new Date(`${e.fechaFin}T23:59:59`)) return false;
    if (e.fechaInicio && now < new Date(`${e.fechaInicio}T00:00:00`)) return false;
    return true;
  });

  const is2x1Promo = Boolean(
    activeEvent?.tipo === "2X1" ||
    activeEvent?.nombre?.toLowerCase().includes("2x1") ||
    producto.is2x1Promo ||
    producto.nombre?.toLowerCase().includes("2x1")
  );

  const discountPercent = activeEvent?.descuentoPorcentaje ? Number(activeEvent.descuentoPorcentaje) : 0;
  const originalPrice = Number(producto.precio || 0);
  const finalPrice = discountPercent > 0
    ? Math.round(originalPrice * (1 - discountPercent / 100))
    : originalPrice;

  const formatPrice = (val) => `$${Number(val || 0).toLocaleString("es-CO")}`;

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onSelect(producto)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(producto);
        }
      }}
      aria-label={`Seleccionar ${producto.nombre}, precio ${formatPrice(finalPrice)} COP`}
      className="group relative flex flex-col justify-between rounded-3xl bg-white border-2 border-gray-200/90 hover:border-red-400 p-3.5 sm:p-4 shadow-sm hover:shadow-xl shadow-red-500/10 transition-all cursor-pointer select-none overflow-hidden min-h-[280px] sm:min-h-[300px]"
    >
      {/* Promo badge floating at top right */}
      {is2x1Promo && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-amber-400 text-amber-950 font-black text-xs px-2.5 py-1 rounded-full shadow-md uppercase tracking-wider">
          <Flame className="w-3.5 h-3.5 fill-amber-950" />
          <span>¡2x1 Promo!</span>
        </div>
      )}
      {!is2x1Promo && discountPercent > 0 && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-red-600 text-white font-black text-xs px-2.5 py-1 rounded-full shadow-md">
          <Tag className="w-3.5 h-3.5" />
          <span>{discountPercent}% OFF</span>
        </div>
      )}

      {/* Big Appetizing Photo */}
      <div className="relative w-full h-36 sm:h-44 rounded-2xl bg-gray-50 overflow-hidden flex items-center justify-center border border-gray-100">
        {producto.imagen ? (
          <img
            src={producto.imagen}
            alt={producto.nombre}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-300">
            <Sparkles className="w-10 h-10 text-amber-400/60" />
            <span className="text-[11px] font-bold text-gray-400 mt-1">Chazin Food</span>
          </div>
        )}
      </div>

      {/* Product Details (Legible at 1 meter, max 2 lines title) */}
      <div className="mt-3 flex-1 flex flex-col justify-between">
        <h3 className="text-lg sm:text-xl font-black text-gray-900 leading-snug line-clamp-2 group-hover:text-[#A91B2E] transition-colors">
          {producto.nombre}
        </h3>

        {/* Pricing area */}
        <div className="mt-2 pt-2 border-t border-gray-100 flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-[#A91B2E]">
              {formatPrice(finalPrice)}
            </span>
            {discountPercent > 0 && (
              <span className="text-sm font-bold text-gray-400 line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>

          <span className="text-[11px] font-black uppercase text-gray-400 tracking-wider">
            Tocar
          </span>
        </div>
      </div>
    </motion.div>
  );
}

