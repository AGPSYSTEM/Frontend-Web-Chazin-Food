import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Sparkles, Tag, Zap, Clock, ArrowRight, Gift, Flame } from "lucide-react";
import { FoodIcon, FoodIconBadge } from "@/shared/components/ui/FoodIcon";

export function EventosCarousel({ eventos = [], productos = [], onSelectEvento }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Filter active events only
  const activeEventos = eventos.filter((e) => {
    const isActivo = e.estado === "Activo" || e.estado === 1;
    if (!isActivo) return false;
    // Check temporal dates if set
    if (e.fechaFin) {
      const today = new Date().toISOString().split("T")[0];
      if (today > e.fechaFin) return false;
    }
    return true;
  });

  // Autoplay
  useEffect(() => {
    if (activeEventos.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeEventos.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [activeEventos.length, isPaused]);

  if (activeEventos.length === 0) {
    return null;
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % activeEventos.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + activeEventos.length) % activeEventos.length);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
  };

  const currentEvt = activeEventos[currentIndex];
  const targetProduct = productos.find(
    (p) => String(p.id || p.idProducto) === String(currentEvt?.idProducto)
  );

  return (
    <section 
      aria-label="Eventos Activos"
      className="w-full px-4 sm:px-6 lg:px-8 py-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
              Eventos y Ofertas Especiales
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                {activeEventos.length} activo{activeEventos.length !== 1 ? "s" : ""}
              </span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Aprovecha nuestras promociones exclusivas y personaliza tu pedido al mejor precio.
            </p>
          </div>
        </div>

        {/* Navigation buttons for desktop */}
        {activeEventos.length > 1 && (
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={prevSlide}
              aria-label="Evento anterior"
              className="w-9 h-9 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors shadow-xs active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Evento siguiente"
              className="w-9 h-9 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors shadow-xs active:scale-95 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Banner Slide Container */}
      <div 
        className="relative overflow-hidden rounded-3xl shadow-xl border border-purple-100 dark:border-purple-900/40 bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 text-white min-h-[260px] sm:min-h-[280px] flex items-center"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Background decorative glow effects */}
        <div className="absolute -right-16 -top-16 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Slide Content */}
        <div 
          onClick={() => onSelectEvento && onSelectEvento(currentEvt, targetProduct)}
          className="w-full p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 cursor-pointer group z-10 transition-all"
        >
          {/* Left / Info column */}
          <div className="flex-1 space-y-4 text-center md:text-left">
            {/* Badges row */}
            <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/20 backdrop-blur-md border border-white/20 text-white shadow-xs">
                <FoodIcon name={currentEvt.icono || "party"} size={16} />
                <span>{currentEvt.tipoEvento || "Evento Activo"}</span>
              </span>

              {currentEvt.isTemporal && currentEvt.fechaFin && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/30 text-amber-200 border border-amber-400/40 backdrop-blur-md">
                  <Clock className="w-3 h-3" />
                  <span>Hasta {currentEvt.fechaFin}</span>
                </span>
              )}

              {currentEvt.tipoEvento === "Descuento" && currentEvt.descuento && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-500 text-white shadow-md animate-pulse">
                  <Zap className="w-3 h-3" />
                  <span>-{Number(currentEvt.descuento)}% OFF</span>
                </span>
              )}

              {currentEvt.tipoEvento === "2x1 / Combo Especial" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-amber-500 text-gray-900 shadow-md">
                  <Gift className="w-3 h-3" />
                  <span>2x1 ESPECIAL</span>
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight group-hover:text-purple-200 transition-colors">
              {currentEvt.nombreEvento || currentEvt.nombre}
            </h3>

            {/* Description */}
            <p className="text-xs sm:text-sm text-purple-100/80 max-w-xl line-clamp-2 leading-relaxed font-medium">
              {currentEvt.descripcion || (targetProduct ? `Promoción exclusiva aplicada a ${targetProduct.nombre}. ¡Añádelo ahora y personalízalo!` : "Oferta especial de tiempo limitado. Descubre todas las opciones disponibles.")}
            </p>

            {/* Target product pill if available */}
            {targetProduct && (
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/15">
                <span className="text-xs text-purple-200 font-semibold">Producto en promo:</span>
                <span className="text-xs font-bold text-white truncate max-w-[200px]">{targetProduct.nombre}</span>
                {currentEvt.nuevoPrecio ? (
                  <span className="text-xs font-black text-emerald-300">
                    ${Number(currentEvt.nuevoPrecio).toLocaleString("es-CO")}
                  </span>
                ) : currentEvt.descuento ? (
                  <span className="text-xs font-black text-emerald-300">
                    ${Math.round(targetProduct.precio * (1 - Number(currentEvt.descuento)/100)).toLocaleString("es-CO")}
                  </span>
                ) : null}
              </div>
            )}

            {/* CTA Button */}
            <div className="pt-2 flex items-center justify-center md:justify-start gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectEvento && onSelectEvento(currentEvt, targetProduct);
                }}
                className="px-6 py-3 bg-white hover:bg-purple-50 text-purple-900 font-black rounded-2xl text-xs sm:text-sm transition-all shadow-lg hover:shadow-xl flex items-center gap-2 group-hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Personalizar Evento</span>
                <ArrowRight className="w-4 h-4 text-purple-600 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Right / Visual Product or Icon Card */}
          <div className="shrink-0 flex items-center justify-center relative">
            <div className="w-36 h-36 sm:w-48 sm:h-48 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center p-3 shadow-2xl relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
              {targetProduct?.imagen ? (
                <img
                  src={targetProduct.imagen}
                  alt={targetProduct.nombre}
                  className="w-full h-full object-contain filter drop-shadow-2xl"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center">
                  <FoodIconBadge name={currentEvt.icono || targetProduct?.nombre || "party"} size="xl" />
                  {targetProduct && (
                    <span className="text-[11px] font-bold text-white/90 mt-2 truncate max-w-[140px]">
                      {targetProduct.nombre}
                    </span>
                  )}
                </div>
              )}

              {/* Glowing Corner Badge */}
              <div className="absolute top-2 right-2 bg-purple-500/80 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-black text-white shadow-xs">
                OFERTA
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Indicators / Dots */}
        {activeEventos.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
            {activeEventos.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                aria-label={`Ir al evento ${idx + 1}`}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentIndex === idx
                    ? "w-7 bg-white shadow-md"
                    : "w-2 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
