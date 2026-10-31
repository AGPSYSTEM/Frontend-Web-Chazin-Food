import React, { useState, useEffect, useMemo } from "react";
import { Flame, Sparkles, ChevronRight, Tag } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function KioskPromoCarousel({ productos = [], onSelectProduct }) {
  // Find products that have active events or 2x1 promotions or special discounts
  const promoItems = useMemo(() => {
    const now = new Date();
    const withEvents = (productos || []).filter((p) => {
      const evts = Array.isArray(p.eventos) ? p.eventos : [];
      return evts.some((e) => {
        if (e.estado !== 1 && e.estado !== "Activo" && e.estado !== undefined) return false;
        if (e.fechaFin && now > new Date(`${e.fechaFin}T23:59:59`)) return false;
        if (e.fechaInicio && now < new Date(`${e.fechaInicio}T00:00:00`)) return false;
        return true;
      });
    });

    if (withEvents.length > 0) return withEvents;

    // Fallback: combos or first 3 products with images to keep kiosk vibrant
    const withCombos = (productos || []).filter((p) => {
      let cfg = p.configuracionCombo;
      if (typeof cfg === "string") {
        try { cfg = JSON.parse(cfg); } catch (e) { cfg = null; }
      }
      return Boolean(cfg?.esCombo || p.nombre?.toLowerCase().includes("combo") || p.nombre?.toLowerCase().includes("promo"));
    });

    return withCombos.length > 0 ? withCombos : (productos || []).slice(0, 3);
  }, [productos]);

  const [currentIndex, setCurrentIndex] = useState(0);

  // Autoplay timer: advance every 4.5 seconds
  useEffect(() => {
    if (promoItems.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promoItems.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [promoItems.length]);

  if (promoItems.length === 0) return null;

  const currentItem = promoItems[currentIndex] || promoItems[0];
  const activeEvent = Array.isArray(currentItem?.eventos) ? currentItem.eventos[0] : null;

  const formatPrice = (val) => `$${Number(val || 0).toLocaleString("es-CO")}`;

  return (
    <div className="w-full mb-4 select-none">
      <div
        onClick={() => onSelectProduct(currentItem)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            onSelectProduct(currentItem);
          }
        }}
        aria-label={`Promoción destacada: ${currentItem?.nombre}. Toca para ordenar.`}
        className="relative w-full h-40 sm:h-48 rounded-3xl overflow-hidden bg-linear-to-r from-red-700 via-rose-600 to-amber-500 shadow-lg text-white flex items-center justify-between p-4 sm:p-6 cursor-pointer border-2 border-amber-300/40 group active:scale-[0.99] transition-transform"
      >
        {/* Ambient background particles/glow */}
        <div className="absolute top-0 right-1/4 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-40 h-40 bg-amber-400/20 rounded-full blur-xl pointer-events-none" />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentItem?.id || currentItem?.idProducto || currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35 }}
            className="relative z-10 flex-1 flex flex-col justify-between h-full pr-4 max-w-lg"
          >
            {/* Promo Tag */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-amber-400 text-amber-950 px-3 py-1 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider shadow-xs">
                <Flame className="w-4 h-4 fill-amber-950 animate-bounce" />
                {activeEvent?.nombre || "¡OFERTA DESTACADA!"}
              </span>
              {activeEvent?.descuentoPorcentaje && (
                <span className="inline-flex items-center gap-1 bg-white/20 text-white px-2.5 py-0.5 rounded-full text-xs font-black backdrop-blur-xs">
                  <Tag className="w-3.5 h-3.5" />
                  {activeEvent.descuentoPorcentaje}% OFF
                </span>
              )}
            </div>

            {/* Product Name */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight line-clamp-1 drop-shadow-xs">
                {currentItem?.nombre}
              </h2>
              <p className="text-xs sm:text-sm text-red-100 font-semibold line-clamp-1 mt-0.5">
                {currentItem?.descripcion || "Delicioso sabor recién preparado a la orden."}
              </p>
            </div>

            {/* Price & CTA */}
            <div className="flex items-center gap-3">
              <span className="text-2xl sm:text-3xl font-black text-amber-300 drop-shadow-xs">
                {formatPrice(currentItem?.precio)}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 bg-white text-[#A91B2E] px-3.5 py-1.5 rounded-xl text-xs font-black shadow-md group-hover:bg-amber-300 group-hover:text-amber-950 transition-colors">
                <span>Toca para pedir</span>
                <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
              </span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Product Image Right Side */}
        <div className="relative z-10 w-28 h-28 sm:w-36 sm:h-36 shrink-0 rounded-2xl bg-white/10 p-1.5 backdrop-blur-xs border border-white/20 shadow-xl overflow-hidden flex items-center justify-center">
          {currentItem?.imagen ? (
            <motion.img
              key={`img-${currentItem?.id || currentIndex}`}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              src={currentItem.imagen}
              alt={currentItem?.nombre}
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <Sparkles className="w-12 h-12 text-amber-300" />
          )}
        </div>

        {/* Dots Indicators at bottom */}
        {promoItems.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
            {promoItems.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(i);
                }}
                aria-label={`Ver diapositiva ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === currentIndex ? "w-6 bg-white" : "w-2 bg-white/40"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

