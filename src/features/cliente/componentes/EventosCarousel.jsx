import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  Clock,
  ArrowRight,
  Gift,
  Flame,
  Star,
  CheckCircle2,
  Percent,
  ChefHat
} from "lucide-react";
import { FoodIcon } from "@/shared/components/ui/FoodIcon";

// Paletas de color premium cinematográficas para cada evento
const THEMES = {
  fire: {
    bg: "from-red-950 via-orange-950 to-stone-950",
    glow: "rgba(239, 68, 68, 0.4)",
    border: "border-orange-500/30",
    badgeBg: "bg-gradient-to-r from-red-600 to-amber-500 text-white shadow-md shadow-red-900/40",
    accent: "text-amber-400",
    btnGrad: "from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white shadow-lg shadow-orange-950/60",
    pillBg: "bg-orange-500/15 border-orange-400/30 text-orange-200",
    tag: "🔥 SUPER PROMO FLASH"
  },
  violet: {
    bg: "from-purple-950 via-indigo-950 to-stone-950",
    glow: "rgba(168, 85, 247, 0.4)",
    border: "border-purple-500/30",
    badgeBg: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/40",
    accent: "text-purple-300",
    btnGrad: "from-purple-500 via-indigo-600 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white shadow-lg shadow-purple-950/60",
    pillBg: "bg-purple-500/15 border-purple-400/30 text-purple-200",
    tag: "⚡ COMBO EXCLUSIVO"
  },
  emerald: {
    bg: "from-emerald-950 via-teal-950 to-stone-950",
    glow: "rgba(16, 185, 129, 0.4)",
    border: "border-emerald-500/30",
    badgeBg: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/40",
    accent: "text-emerald-300",
    btnGrad: "from-emerald-500 via-teal-600 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white shadow-lg shadow-emerald-950/60",
    pillBg: "bg-emerald-500/15 border-emerald-400/30 text-emerald-200",
    tag: "🌿 EDICIÓN ESPECIAL"
  },
  gold: {
    bg: "from-amber-950 via-yellow-950 to-stone-950",
    glow: "rgba(245, 158, 11, 0.4)",
    border: "border-amber-500/30",
    badgeBg: "bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 text-gray-950 shadow-md shadow-amber-900/40 font-black",
    accent: "text-amber-300",
    btnGrad: "from-amber-400 via-yellow-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-gray-950 font-black shadow-lg shadow-amber-950/60",
    pillBg: "bg-amber-500/15 border-amber-400/30 text-amber-200",
    tag: "👑 SELECCIÓN CHEF GOURMET"
  }
};

// Eventos insignia de alta conversión culinaria
const SHOWCASE_EVENTOS = [
  {
    idEvento: "showcase-1",
    idProducto: 16,
    nombreEvento: "Combo Pareja Legendario Chazin",
    tipoEvento: "2x1 / Combo Especial",
    descuento: 25,
    nuevoPrecio: 28500,
    precioOriginal: 38000,
    descripcion: "2 Hamburguesas Clásicas en pan brioche artesanal sellado + Porción generosa de Papas Francesas + 2 Bebidas frías de 400ml.",
    icono: "burger",
    perks: ["2 Hamburguesas Clásicas", "Papas Francesas Grandes", "2 Bebidas 400ml", "100% Personalizable"],
    theme: "violet",
    tiempoPrep: "12 min",
    rating: "4.9",
    calorias: "1.280 kcal",
    fechaFin: "2026-12-31"
  },
  {
    idEvento: "showcase-2",
    idProducto: 15,
    nombreEvento: "Festival Salchipapa Salvaje Titán",
    tipoEvento: "Descuento",
    descuento: 20,
    nuevoPrecio: 18400,
    precioOriginal: 23000,
    descripcion: "Papas doraditas con salchicha americana y suiza ahumada, tocineta crocante y doble queso fundido con salsa Chazin.",
    icono: "fries",
    perks: ["Salchicha Suiza & Americana", "Lluvia de Tocineta Crocante", "Queso Mozzarella Fundido", "Salsa Chazin Incluida"],
    theme: "fire",
    tiempoPrep: "10 min",
    rating: "5.0",
    calorias: "890 kcal",
    fechaFin: "2026-12-31"
  },
  {
    idEvento: "showcase-3",
    idProducto: 11,
    nombreEvento: "Noche Gourmet: Doble Carne & Bacon",
    tipoEvento: "Descuento",
    descuento: 15,
    nuevoPrecio: 21250,
    precioOriginal: 25000,
    descripcion: "300g de pura carne de res 80/20 a la parrilla, doble tocineta ahumada, doble cheddar fundido y cebolla caramelizada.",
    icono: "burger",
    perks: ["300g Carne 80/20 Res", "Doble Queso Cheddar", "Doble Tocineta Ahumada", "Pan Brioche Sellado"],
    theme: "gold",
    tiempoPrep: "14 min",
    rating: "4.9",
    calorias: "980 kcal",
    fechaFin: "2026-12-31"
  },
  {
    idEvento: "showcase-4",
    idProducto: 13,
    nombreEvento: "Dúo Perro Especial Americano",
    tipoEvento: "2x1 / Combo Especial",
    descuento: 30,
    nuevoPrecio: 19600,
    precioOriginal: 28000,
    descripcion: "2 Perros Especiales con salchicha premium americana, tocineta crujiente, queso mozzarella gratinado y ripio de papa.",
    icono: "hotdog",
    perks: ["2 Perros Americanos", "Lluvia de Tocineta", "Queso Mozzarella", "Salsas de la Casa"],
    theme: "emerald",
    tiempoPrep: "8 min",
    rating: "4.8",
    calorias: "640 kcal",
    fechaFin: "2026-12-31"
  }
];

export function EventosCarousel({ eventos = [], productos = [], onSelectEvento }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ dias: 2, horas: 14, minutos: 42, segundos: 30 });

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const animationFrameRef = useRef(null);
  const startTimeRef = useRef(null);
  const slideDuration = 6000; // 6 segundos por diapositiva

  // Fusionar eventos activos de base de datos con showcases culinarios
  const combinedEventos = useMemo(() => {
    const rawActive = eventos.filter((e) => {
      const isActivo = e.estado === "Activo" || e.estado === 1 || e.estado === true;
      if (!isActivo) return false;
      if (e.fechaFin) {
        const today = new Date().toISOString().split("T")[0];
        if (today > e.fechaFin) return false;
      }
      return true;
    });

    const enrichedDb = rawActive.map((e, idx) => {
      const themeKeys = ["fire", "violet", "emerald", "gold"];
      const theme = e.theme || themeKeys[idx % themeKeys.length];
      const prod = productos.find(
        (p) => String(p.id || p.idProducto) === String(e.idProducto)
      );
      const originalPrice = prod ? Number(prod.precio || 0) : 25000;
      let finalPrice = e.nuevoPrecio ? Number(e.nuevoPrecio) : null;
      if (!finalPrice && e.descuento && originalPrice) {
        finalPrice = Math.round(originalPrice * (1 - Number(e.descuento) / 100));
      }
      return {
        ...e,
        theme,
        precioOriginal: originalPrice,
        nuevoPrecio: finalPrice || originalPrice,
        perks: e.perks || [
          "Ingredientes 100% Frescos",
          "Personalización Completa",
          "Preparación al Momento",
          "Garantía de Calidad Chazin"
        ],
        tiempoPrep: e.tiempoPrep || "10-15 min",
        rating: e.rating || "4.9",
        calorias: e.calorias || "~650 kcal"
      };
    });

    if (enrichedDb.length >= 3) {
      return enrichedDb;
    }

    const missingCount = 4 - enrichedDb.length;
    const extraShowcases = SHOWCASE_EVENTOS.slice(0, missingCount);
    return [...enrichedDb, ...extraShowcases];
  }, [eventos, productos]);

  const totalSlides = combinedEventos.length;

  // Barra de progreso y autoplay continuo
  useEffect(() => {
    if (totalSlides <= 1) return;

    let start = performance.now();
    startTimeRef.current = start;

    const tick = (now) => {
      if (isPaused) {
        startTimeRef.current = now - (progress / 100) * slideDuration;
        animationFrameRef.current = requestAnimationFrame(tick);
        return;
      }

      const elapsed = now - startTimeRef.current;
      const pct = Math.min(100, (elapsed / slideDuration) * 100);
      setProgress(pct);

      if (pct >= 100) {
        setCurrentIndex((prev) => (prev + 1) % totalSlides);
        startTimeRef.current = performance.now();
        setProgress(0);
      }

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [currentIndex, isPaused, totalSlides, progress]);

  // Reloj de cuenta regresiva en vivo
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.segundos > 0) {
          return { ...prev, segundos: prev.segundos - 1 };
        } else if (prev.minutos > 0) {
          return { ...prev, minutos: prev.minutos - 1, segundos: 59 };
        } else if (prev.horas > 0) {
          return { ...prev, horas: prev.horas - 1, minutos: 59, segundos: 59 };
        } else if (prev.dias > 0) {
          return { ...prev, dias: prev.dias - 1, horas: 23, minutos: 59, segundos: 59 };
        }
        return { dias: 2, horas: 12, minutos: 30, segundos: 45 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Navegación fluida por teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        prevSlide();
      } else if (e.key === "ArrowRight") {
        nextSlide();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [totalSlides]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
    setProgress(0);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
    setProgress(0);
  }, [totalSlides]);

  const goToSlide = (idx) => {
    setCurrentIndex(idx);
    setProgress(0);
  };

  const handleTouchStart = (e) => {
    setIsPaused(true);
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    setIsPaused(false);
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
  };

  if (!combinedEventos || combinedEventos.length === 0) {
    return null;
  }

  const currentEvt = combinedEventos[currentIndex] || combinedEventos[0];
  const activeTheme = THEMES[currentEvt.theme] || THEMES.fire;

  return (
    <section
      aria-label="Eventos y Ofertas Exclusivas Chazin Food"
      className="w-full px-3 sm:px-6 lg:px-8 py-5 select-none"
    >
      {/* Estilos CSS locales de animación fluida para el carrusel */}
      <style>{`
        @keyframes floatFoodPlate {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }
        .animate-float-plate {
          animation: floatFoodPlate 3.6s ease-in-out infinite;
        }
        @keyframes sweepLight {
          0% { transform: translateX(-150%) skewX(-20deg); }
          100% { transform: translateX(250%) skewX(-20deg); }
        }
        .animate-sweep {
          animation: sweepLight 5s ease-in-out infinite;
        }
      `}</style>

      {/* HEADER SUPERIOR CON RELOJ DIGITAL Y ESTADO EN VIVO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-600 text-white flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border-2 border-white dark:border-gray-900"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                Experiencias & Ofertas Exclusivas
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wide uppercase bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30">
                En Vivo
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
              Desliza para descubrir nuestras promociones especiales y combos de la casa.
            </p>
          </div>
        </div>

        {/* TEMPORIZADOR DIGITAL FLOTANTE */}
        <div className="flex items-center gap-2 bg-gray-100/90 dark:bg-gray-800/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 shadow-xs self-start sm:self-auto">
          <Clock className="w-3.5 h-3.5 text-amber-500 animate-spin" style={{ animationDuration: "12s" }} />
          <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300">Termina en:</span>
          <div className="flex items-center gap-1 font-mono text-xs font-black text-gray-900 dark:text-amber-300">
            <span className="bg-white dark:bg-gray-900 px-1.5 py-0.5 rounded-md shadow-2xs border border-gray-200 dark:border-gray-700">
              {String(timeLeft.dias).padStart(2, "0")}d
            </span>
            <span>:</span>
            <span className="bg-white dark:bg-gray-900 px-1.5 py-0.5 rounded-md shadow-2xs border border-gray-200 dark:border-gray-700">
              {String(timeLeft.horas).padStart(2, "0")}h
            </span>
            <span>:</span>
            <span className="bg-white dark:bg-gray-900 px-1.5 py-0.5 rounded-md shadow-2xs border border-gray-200 dark:border-gray-700">
              {String(timeLeft.minutos).padStart(2, "0")}m
            </span>
            <span>:</span>
            <span className="bg-red-500 text-white px-1.5 py-0.5 rounded-md shadow-2xs animate-pulse">
              {String(timeLeft.segundos).padStart(2, "0")}s
            </span>
          </div>
        </div>
      </div>

      {/* BARRA DE HISTORIAS SEGMENTADAS (ESTILO APPLE / INSTAGRAM) */}
      <div className="w-full flex items-center gap-1.5 mb-3.5">
        {combinedEventos.map((evt, idx) => {
          const isCurrent = idx === currentIndex;
          const isPast = idx < currentIndex;
          return (
            <button
              key={evt.idEvento || idx}
              type="button"
              onClick={() => goToSlide(idx)}
              aria-label={`Ver oferta ${idx + 1}`}
              className="flex-1 h-1.5 sm:h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800 transition-all cursor-pointer relative group"
            >
              <div
                className={`h-full transition-all duration-150 ${
                  isCurrent
                    ? "bg-gradient-to-r from-amber-500 via-orange-500 to-red-500"
                    : isPast
                    ? "bg-gray-400 dark:bg-gray-600"
                    : "w-0"
                }`}
                style={{
                  width: isCurrent ? `${progress}%` : isPast ? "100%" : "0%"
                }}
              />
              <span className="absolute inset-0 group-hover:bg-white/20 transition-colors" />
            </button>
          );
        })}
      </div>

      {/* CONTENEDOR PRINCIPAL: DESLIZAMIENTO HORIZONTAL SUAVE (SLIDER TRACK 100% ESTABLE) */}
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative"
      >
        {/* Halo de luz difusa ambiental detrás del carrusel */}
        <div
          className="absolute -inset-2 sm:-inset-4 rounded-3xl sm:rounded-4xl blur-3xl opacity-50 dark:opacity-60 transition-colors duration-700 pointer-events-none"
          style={{ backgroundColor: activeTheme.glow }}
        />

        {/* Ventana de visualización con esquinas redondeadas y overflow hidden */}
        <div className="relative overflow-hidden rounded-3xl sm:rounded-4xl border border-white/10 shadow-2xl bg-stone-950">
          {/* TRACK DESLIZANTE CON TRANSICIÓN HORIZONTAL SILKY SMOOTH */}
          <div
            className="flex transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {combinedEventos.map((evt, idx) => {
              const theme = THEMES[evt.theme] || THEMES.fire;
              const prod = productos.find(
                (p) => String(p.id || p.idProducto) === String(evt.idProducto)
              );
              const origPrice = evt.precioOriginal || (prod ? Number(prod.precio) : 25000);
              const curPrice = evt.nuevoPrecio || (prod ? Number(prod.precio) : 20000);
              const saveAmount = Math.max(0, origPrice - curPrice);
              const savePct = origPrice > 0 ? Math.round((saveAmount / origPrice) * 100) : (evt.descuento || 20);

              const isRealUrl = (url) => typeof url === "string" && (url.startsWith("http") || url.startsWith("/"));
              const cardImage =
                (isRealUrl(prod?.imagen) ? prod.imagen : null) ||
                (isRealUrl(evt?.imagen) ? evt.imagen : null) ||
                (evt.icono === "fries"
                  ? "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=800&auto=format&fit=crop&q=80"
                  : evt.icono === "hotdog"
                  ? "https://images.unsplash.com/photo-1619740455993-9e612b1af08a?w=800&auto=format&fit=crop&q=80"
                  : "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80");

              return (
                <div
                  key={evt.idEvento || idx}
                  className={`w-full shrink-0 relative bg-gradient-to-br ${theme.bg} text-white min-h-[380px] sm:min-h-[400px] flex flex-col justify-between overflow-hidden`}
                >
                  {/* Destello suave que barre la tarjeta */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none animate-sweep" />

                  {/* Top Bar de la diapositiva */}
                  <div className="relative z-10 px-8 sm:px-14 lg:px-16 pt-5 sm:pt-6 flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${theme.badgeBg}`}
                      >
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>{evt.tipoEvento || "Evento Activo"}</span>
                      </span>

                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white/15 backdrop-blur-md text-white/95 border border-white/20">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span>{evt.rating || "4.9"}</span>
                      </span>

                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-black/30 backdrop-blur-md text-white/80 border border-white/10">
                        <Clock className="w-3 h-3" />
                        <span>{evt.tiempoPrep || "10-15 min"}</span>
                      </span>
                    </div>

                    {savePct > 0 && (
                      <div className="flex items-center gap-1.5 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-black shadow-lg shadow-red-950/60">
                        <Percent className="w-3.5 h-3.5" />
                        <span>-{savePct}% OFF</span>
                      </div>
                    )}
                  </div>

                  {/* Contenido Central: Información gastronómica + Plato fotográfico */}
                  <div className="relative z-10 px-8 sm:px-14 lg:px-16 py-4 sm:py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    {/* Información y detalles */}
                    <div className="lg:col-span-7 space-y-3.5 text-left">
                      <div>
                        <span className={`text-xs font-extrabold uppercase tracking-widest ${theme.accent} block mb-1`}>
                          {theme.tag}
                        </span>
                        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight drop-shadow-md leading-tight">
                          {evt.nombreEvento || evt.nombre}
                        </h3>
                      </div>

                      <p className="text-xs sm:text-sm text-gray-200/90 leading-relaxed font-normal max-w-xl line-clamp-2 sm:line-clamp-3">
                        {evt.descripcion}
                      </p>

                      {/* Perks e ingredientes clave */}
                      {evt.perks && evt.perks.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          {evt.perks.slice(0, 4).map((perk, pIdx) => (
                            <div
                              key={pIdx}
                              className="flex items-center gap-1.5 text-xs font-medium text-white/90 bg-white/10 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/10"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span className="truncate">{perk}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Comparativa de precio */}
                      <div className="pt-2 flex items-baseline gap-3 flex-wrap">
                        {origPrice > curPrice && (
                          <div className="text-sm sm:text-base font-bold text-gray-400 line-through">
                            ${Number(origPrice).toLocaleString("es-CO")} COP
                          </div>
                        )}
                        <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-white flex items-center gap-1 tracking-tight">
                          <span className="text-emerald-400">$</span>
                          <span>{Number(curPrice).toLocaleString("es-CO")}</span>
                          <span className="text-xs font-bold text-emerald-300 ml-1">COP</span>
                        </div>
                        {saveAmount > 0 && (
                          <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs">
                            Ahorras ${Number(saveAmount).toLocaleString("es-CO")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Plato gastronómico flotante con sombra suave */}
                    <div className="lg:col-span-5 flex justify-center items-center relative">
                      <div className="relative w-52 h-52 sm:w-64 sm:h-64 lg:w-72 lg:h-72 flex items-center justify-center animate-float-plate">
                        {/* Glow interior de fondo detrás del plato */}
                        <div
                          className="absolute inset-4 rounded-full blur-2xl opacity-60 pointer-events-none"
                          style={{ backgroundColor: theme.glow }}
                        />

                        <div className="relative z-10 w-full h-full rounded-3xl overflow-hidden border-2 border-white/20 bg-black/40 shadow-2xl backdrop-blur-md p-2 flex items-center justify-center">
                          <img
                            src={cardImage}
                            alt={evt.nombreEvento || "Plato Chazin Food"}
                            className="w-full h-full object-cover rounded-2xl filter drop-shadow-[0_12px_20px_rgba(0,0,0,0.8)]"
                            loading="eager"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80";
                            }}
                          />

                          <div className="absolute bottom-3 left-3 right-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 flex items-center justify-between text-xs">
                            <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                              <ChefHat className="w-3.5 h-3.5" /> Receta Chazin
                            </span>
                            <span className="text-[10px] text-white/70">{evt.calorias || "~700 kcal"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer de la diapositiva con Botón CTA directo */}
                  <div className="relative z-10 px-8 sm:px-14 lg:px-16 pb-5 sm:pb-6 pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-white/10 bg-black/25 backdrop-blur-md">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => onSelectEvento && onSelectEvento(evt, prod)}
                        className={`w-full sm:w-auto px-7 py-3.5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 bg-gradient-to-r ${theme.btnGrad} transition-all duration-200 shadow-xl hover:scale-[1.02] active:scale-98 cursor-pointer group/cta`}
                      >
                        <Sparkles className="w-4 h-4 text-white" />
                        <span>¡Aprovechar Oferta!</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover/cta:translate-x-1" />
                      </button>
                    </div>

                    {/* Indicadores de diapositivas totalmente centrados */}
                    <div className="sm:absolute sm:left-1/2 sm:-translate-x-1/2 flex items-center justify-center gap-2 py-1 sm:py-0">
                      {combinedEventos.map((_, dotIdx) => (
                        <button
                          key={dotIdx}
                          type="button"
                          onClick={() => goToSlide(dotIdx)}
                          className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                            currentIndex === dotIdx
                              ? "w-8 bg-white shadow-lg shadow-white/60"
                              : "w-2.5 bg-white/35 hover:bg-white/70"
                          }`}
                          aria-label={`Ir al slide ${dotIdx + 1}`}
                        />
                      ))}
                    </div>

                    {/* Contador discreto a la derecha para equilibrio visual */}
                    <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-white/50">
                      <span>{currentIndex + 1}</span>
                      <span>/</span>
                      <span>{totalSlides}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* BOTÓN NAVEGACIÓN IZQUIERDO (CENTRADO VERTICALMENTE EN EL EXTREMO IZQUIERDO) */}
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Slide anterior"
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/50 hover:bg-black/85 backdrop-blur-md border border-white/25 text-white flex items-center justify-center transition-all duration-200 shadow-2xl hover:scale-110 active:scale-95 cursor-pointer group"
          >
            <ChevronLeft className="w-6 h-6 transition-transform group-hover:-translate-x-0.5" />
          </button>

          {/* BOTÓN NAVEGACIÓN DERECHO (CENTRADO VERTICALMENTE EN EL EXTREMO DERECHO) */}
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Siguiente slide"
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/50 hover:bg-black/85 backdrop-blur-md border border-white/25 text-white flex items-center justify-center transition-all duration-200 shadow-2xl hover:scale-110 active:scale-95 cursor-pointer group"
          >
            <ChevronRight className="w-6 h-6 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>

      {/* DOCK INFERIOR: SELECTOR DE PÍLDORAS CON ACCESO DIRECTO */}
      <div className="mt-4 flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
        {combinedEventos.map((evt, idx) => {
          const isSelected = idx === currentIndex;
          return (
            <button
              key={evt.idEvento || idx}
              type="button"
              onClick={() => goToSlide(idx)}
              className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer border ${
                isSelected
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-950 border-gray-900 dark:border-white shadow-md scale-102"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750"
              }`}
            >
              <FoodIcon name={evt.icono || "burger"} size={16} />
              <span className="truncate max-w-[140px] sm:max-w-[180px]">{evt.nombreEvento}</span>
              {evt.descuento && (
                <span
                  className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                    isSelected
                      ? "bg-amber-400 text-gray-950"
                      : "bg-red-500/10 text-red-600 dark:text-red-400"
                  }`}
                >
                  -{evt.descuento}%
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
