import React, { useState, useEffect, useMemo } from "react";
import { Sparkles, ChevronRight, Tag } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { stripEmojis } from "@/shared/utils/foodEmojiUtils";
import { isDrinkProduct, resolveDrinkImage } from "@/shared/components/ui/FastFoodProductModal";

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
    // Si no hay eventos activos vigentes, no mostrar carrusel promocional ficticio
    return [];
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

  // Si no hay promociones activas, retornar null (después de registrar todos los hooks)
  if (promoItems.length === 0) return null;

  const currentItem = promoItems[currentIndex] || promoItems[0];
  const activeEvent = Array.isArray(currentItem?.eventos) ? currentItem.eventos[0] : null;

  const originalPrice = Number(currentItem?.precio || 0);
  let promoPrice = originalPrice;
  let discountPercent = 0;

  if (activeEvent) {
    if (activeEvent.nuevoPrecio && Number(activeEvent.nuevoPrecio) > 0) {
      promoPrice = Number(activeEvent.nuevoPrecio);
      if (originalPrice > promoPrice) {
        discountPercent = Math.round(((originalPrice - promoPrice) / originalPrice) * 100);
      }
    } else {
      const desc = Number(
        activeEvent.descuento ??
        activeEvent.descuentoPorcentaje ??
        activeEvent.porcentajeDescuento ??
        0
      );
      if (desc > 0) {
        discountPercent = Math.round(desc);
        promoPrice = Math.round(originalPrice * (1 - desc / 100));
      }
    }
  }

  const formatPrice = (val) => `${Number(val || 0).toLocaleString("es-CO")}`;

  const handleSelectBanner = () => {
    onSelectProduct({
      ...currentItem,
      precio: promoPrice,
      precioOriginal: originalPrice,
      precioPromo: promoPrice,
      descuentoPorcentaje: discountPercent,
      activeEvent: activeEvent || null
    });
  };

  const itemImage = currentItem
    ? (isDrinkProduct(currentItem)
        ? resolveDrinkImage(currentItem)
        : currentItem.imagen || currentItem.imagenUrl || currentItem.foto || "")
    : "";

  return (
    <div className="w-full mb-4 select-none">
      <div
        onClick={handleSelectBanner}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleSelectBanner();
          }
        }}
        aria-label={`Promoción destacada: ${stripEmojis(currentItem?.nombre)}. Toca para ordenar.`}
        className="relative w-full h-40 sm:h-48 rounded-3xl overflow-hidden bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 dark:from-[#7f1d1d] dark:via-[#881337] dark:to-[#78350f] shadow-lg dark:shadow-2xl dark:shadow-rose-950/50 text-white flex items-center justify-between p-4 sm:p-6 cursor-pointer border-2 border-amber-300/40 dark:border-amber-400/40 group active:scale-[0.99] transition-transform"
      >
        {/* Ambient background particles/glow */}
        <div className="absolute top-0 right-1/4 w-48 h-48 bg-white/10 dark:bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-40 h-40 bg-amber-400/20 dark:bg-rose-500/15 rounded-full blur-xl pointer-events-none" />

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
              <span className="inline-flex items-center gap-1.5 bg-amber-400 text-neutral-950 px-3 py-1 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider shadow-sm">
                <Tag className="w-3.5 h-3.5 text-neutral-950 stroke-[2.5]" />
                {stripEmojis(activeEvent?.nombre || activeEvent?.nombreEvento || "OFERTA DESTACADA")}
              </span>
              {discountPercent > 0 && (
                <span className="inline-flex items-center gap-1 bg-black/35 dark:bg-black/55 text-amber-200 border border-amber-400/35 px-2.5 py-0.5 rounded-full text-xs font-black backdrop-blur-xs shadow-xs">
                  <Tag className="w-3.5 h-3.5 text-amber-300" />
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Product Name */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight line-clamp-1 drop-shadow-sm">
                {stripEmojis(currentItem?.nombre)}
              </h2>
              <p className="text-xs sm:text-sm text-red-100 dark:text-amber-100/90 font-medium line-clamp-1 mt-0.5 drop-shadow-xs">
                {stripEmojis(currentItem?.descripcion) || "Delicioso sabor recién preparado a la orden."}
              </p>
            </div>

            {/* Price & CTA */}
            <div className="flex items-center gap-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-amber-300 drop-shadow-xs">
                  {formatPrice(promoPrice)}
                </span>
                {discountPercent > 0 && (
                  <span className="text-sm font-bold text-white/70 dark:text-rose-200/70 line-through">
                    {formatPrice(originalPrice)}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 bg-amber-400 text-neutral-950 hover:bg-amber-300 dark:bg-amber-400 dark:text-neutral-950 dark:hover:bg-amber-300 px-4 py-2 rounded-xl text-xs sm:text-sm font-black shadow-md transition-all group-hover:scale-105">
                <span>Pedir ahora</span>
                <ChevronRight className="w-4 h-4 stroke-[3]" />
              </span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Product Image Right Side */}
        <div className="relative z-10 w-28 h-28 sm:w-36 sm:h-36 shrink-0 rounded-2xl bg-black/20 dark:bg-black/40 p-1.5 backdrop-blur-xs border border-white/20 dark:border-amber-400/25 shadow-xl overflow-hidden flex items-center justify-center">
          {itemImage ? (
            <motion.img
              key={`img-${currentItem?.id || currentIndex}`}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              src={itemImage}
              alt={stripEmojis(currentItem?.nombre)}
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
                  i === currentIndex ? "w-7 bg-amber-400 shadow-sm" : "w-2 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
