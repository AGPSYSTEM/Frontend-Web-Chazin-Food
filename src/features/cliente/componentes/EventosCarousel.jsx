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
import { FoodIcon, getEventBadgeConfig } from "@/shared/components/ui/FoodIcon";
import { stripEmojis } from "@/shared/utils/foodEmojiUtils";

// Paletas de color premium cinematográficas para cada evento (8 temas únicos sin repeticiones)
export const THEMES = {
  fire: {
    bg: "from-red-950 via-stone-900 to-stone-950",
    glow: "rgba(239, 68, 68, 0.45)",
    border: "border-red-500/30",
    badgeBg: "bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-md shadow-red-900/40",
    accent: "text-red-400",
    btnGrad: "from-red-600 via-rose-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-lg shadow-red-950/60",
    pillBg: "bg-red-500/15 border-red-400/30 text-red-200",
    tag: "🔥 2X1 IMPERDIBLE",
    heroGradient: "from-red-600 via-rose-600 to-orange-600",
    heroSubtext: "text-red-100"
  },
  violet: {
    bg: "from-purple-950 via-indigo-950 to-stone-950",
    glow: "rgba(168, 85, 247, 0.45)",
    border: "border-purple-500/30",
    badgeBg: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/40",
    accent: "text-purple-300",
    btnGrad: "from-purple-500 via-indigo-600 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white shadow-lg shadow-purple-950/60",
    pillBg: "bg-purple-500/15 border-purple-400/30 text-purple-200",
    tag: "🎉 PROMO FIN DE SEMANA",
    heroGradient: "from-purple-700 via-indigo-600 to-pink-600",
    heroSubtext: "text-purple-100"
  },
  ocean: {
    bg: "from-sky-950 via-blue-950 to-stone-950",
    glow: "rgba(14, 165, 233, 0.45)",
    border: "border-sky-500/30",
    badgeBg: "bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md shadow-blue-900/40",
    accent: "text-sky-300",
    btnGrad: "from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-blue-950/60",
    pillBg: "bg-sky-500/15 border-sky-400/30 text-sky-200",
    tag: "💑 COMBO FESTIVO EN PAREJA",
    heroGradient: "from-blue-700 via-sky-600 to-indigo-700",
    heroSubtext: "text-sky-100"
  },
  gold: {
    bg: "from-amber-950 via-yellow-950 to-stone-950",
    glow: "rgba(245, 158, 11, 0.45)",
    border: "border-amber-500/30",
    badgeBg: "bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 text-gray-950 shadow-md shadow-amber-900/40 font-black",
    accent: "text-amber-300",
    btnGrad: "from-amber-400 via-yellow-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-gray-950 font-black shadow-lg shadow-amber-950/60",
    pillBg: "bg-amber-500/15 border-amber-400/30 text-amber-200",
    tag: "👑 EDICIÓN LIMITADA CHEF",
    heroGradient: "from-amber-600 via-yellow-600 to-orange-600",
    heroSubtext: "text-amber-100"
  },
  sunset: {
    bg: "from-orange-950 via-amber-950 to-stone-950",
    glow: "rgba(249, 115, 22, 0.45)",
    border: "border-orange-500/30",
    badgeBg: "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-900/40",
    accent: "text-orange-400",
    btnGrad: "from-orange-500 via-amber-500 to-red-500 hover:from-orange-400 hover:to-amber-500 text-white shadow-lg shadow-orange-950/60",
    pillBg: "bg-orange-500/15 border-orange-400/30 text-orange-200",
    tag: "⚡ OFERTA RELÁMPAGO CRISPY",
    heroGradient: "from-orange-600 via-amber-500 to-red-500",
    heroSubtext: "text-orange-100"
  },
  ruby: {
    bg: "from-rose-950 via-red-950 to-stone-950",
    glow: "rgba(225, 29, 72, 0.45)",
    border: "border-rose-500/30",
    badgeBg: "bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-900/40",
    accent: "text-rose-300",
    btnGrad: "from-rose-500 via-red-600 to-pink-600 hover:from-rose-400 hover:to-red-500 text-white shadow-lg shadow-rose-950/60",
    pillBg: "bg-rose-500/15 border-rose-400/30 text-rose-200",
    tag: "🥩 MASTER PARRILLA & BACON",
    heroGradient: "from-rose-700 via-red-600 to-pink-700",
    heroSubtext: "text-rose-100"
  },
  emerald: {
    bg: "from-emerald-950 via-teal-950 to-stone-950",
    glow: "rgba(16, 185, 129, 0.45)",
    border: "border-emerald-500/30",
    badgeBg: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/40",
    accent: "text-emerald-300",
    btnGrad: "from-emerald-500 via-teal-600 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white shadow-lg shadow-emerald-950/60",
    pillBg: "bg-emerald-500/15 border-emerald-400/30 text-emerald-200",
    tag: "🥓 FESTIVAL DE TOPPINGS",
    heroGradient: "from-emerald-700 via-teal-600 to-cyan-700",
    heroSubtext: "text-emerald-100"
  },
  teal: {
    bg: "from-teal-950 via-slate-900 to-stone-950",
    glow: "rgba(20, 184, 166, 0.45)",
    border: "border-teal-500/30",
    badgeBg: "bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md shadow-teal-900/40",
    accent: "text-teal-300",
    btnGrad: "from-teal-500 via-cyan-600 to-emerald-600 hover:from-teal-400 hover:to-cyan-500 text-white shadow-lg shadow-teal-950/60",
    pillBg: "bg-teal-500/15 border-teal-400/30 text-teal-200",
    tag: "✨ CREACIÓN DE AUTOR EXCLUSIVA",
    heroGradient: "from-teal-700 via-cyan-700 to-emerald-700",
    heroSubtext: "text-teal-100"
  }
};

/**
 * Asigna de forma inteligente un tema y etiqueta culinaria a cada evento
 * para garantizar máxima armonía visual y CERO colores repetidos en el carrusel.
 */
export const getEventThemeAndTag = (event, index) => {
  const name = String(event?.nombreEvento || event?.nombre || "").toLowerCase();
  const type = String(event?.tipoEvento || "").toLowerCase();
  const id = Number(event?.idEvento || 0);

  // Mapeo preciso por identidad de cada evento
  if (name.includes("2x1") || type.includes("2x1")) {
    return { theme: "fire", tag: "🔥 2X1 IMPERDIBLE" };
  }
  if (name.includes("fin de semana")) {
    return { theme: "violet", tag: "🎉 PROMO FIN DE SEMANA" };
  }
  if (name.includes("pareja") || type.includes("combo")) {
    return { theme: "ocean", tag: "💑 COMBO FESTIVO EN PAREJA" };
  }
  if (id === 5 || (name.includes("burger fest") && name.includes("🔥"))) {
    return { theme: "gold", tag: "👑 EDICIÓN LIMITADA CHEF" };
  }
  if (name.includes("pollo crispy") || name.includes("relampago") || name.includes("relámpago")) {
    return { theme: "sunset", tag: "⚡ OFERTA RELÁMPAGO CRISPY" };
  }
  if (name.includes("doble carne") || (name.includes("tocineta") && name.includes("20%"))) {
    return { theme: "ruby", tag: "🥩 MASTER PARRILLA & BACON" };
  }
  if (name.includes("toppings") || name.includes("perro suizo")) {
    return { theme: "emerald", tag: "🥓 FESTIVAL DE TOPPINGS" };
  }
  if (id === 9 || name.includes("edicion limitada") || name.includes("edición limitada") || type.includes("especial")) {
    return { theme: "teal", tag: "✨ CREACIÓN DE AUTOR" };
  }

  // Secuencia de rotación única para cualquier evento adicional sin repetir
  const themeOrder = ["fire", "violet", "ocean", "gold", "sunset", "ruby", "emerald", "teal"];
  const selectedTheme = themeOrder[index % themeOrder.length];
  return { theme: selectedTheme, tag: THEMES[selectedTheme]?.tag || "⭐ EXPERIENCIA CHAZIN" };
};

export function EventosCarousel({ eventos = [], productos = [], ratingsMap = {}, onSelectEvento, onThemeChange }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ dias: 2, horas: 14, minutos: 42, segundos: 30 });

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const animationFrameRef = useRef(null);
  const startTimeRef = useRef(null);
  const slideDuration = 6000; // 6 segundos por diapositiva

  // Referencias y estado para arrastre horizontal con mouse (drag-to-scroll)
  const pillsRef = useRef(null);
  const [isPillsDragging, setIsPillsDragging] = useState(false);
  const pillsDragStartX = useRef(0);
  const pillsScrollLeft = useRef(0);
  const pillsHasDragged = useRef(false);

  const handlePillsMouseDown = (e) => {
    if (!pillsRef.current) return;
    setIsPillsDragging(true);
    pillsHasDragged.current = false;
    pillsDragStartX.current = e.pageX - pillsRef.current.offsetLeft;
    pillsScrollLeft.current = pillsRef.current.scrollLeft;
  };

  const handlePillsMouseMove = (e) => {
    if (!isPillsDragging || !pillsRef.current) return;
    e.preventDefault();
    const x = e.pageX - pillsRef.current.offsetLeft;
    const walk = (x - pillsDragStartX.current) * 1.5;
    if (Math.abs(walk) > 4) {
      pillsHasDragged.current = true;
    }
    pillsRef.current.scrollLeft = pillsScrollLeft.current - walk;
  };

  const handlePillsMouseUp = () => {
    setIsPillsDragging(false);
  };

  const handlePillsMouseLeave = () => {
    setIsPillsDragging(false);
  };

  // Desplazar suavemente hacia la píldora activa cuando cambie el slide
  useEffect(() => {
    if (!pillsRef.current || isPillsDragging) return;
    const activeBtn = pillsRef.current.children[currentIndex];
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [currentIndex, isPillsDragging]);

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

    const getEventRating = (e, prod) => {
      // 1. Verificar calificación del producto principal del evento en ratingsMap
      const prodId = e.idProducto || (prod ? (prod.id || prod.idProducto) : null);
      if (prodId && ratingsMap && ratingsMap[prodId]) {
        const rInfo = ratingsMap[prodId];
        if (rInfo && rInfo.total > 0 && rInfo.promedio > 0) {
          return {
            rating: Number(rInfo.promedio),
            totalResenas: Number(rInfo.total)
          };
        }
      }

      // 2. Si es un combo con productos asociados, calcular promedio real de sus productos
      if (e.productosAsociados && ratingsMap) {
        try {
          const parsed = typeof e.productosAsociados === "string" ? JSON.parse(e.productosAsociados) : e.productosAsociados;
          if (Array.isArray(parsed) && parsed.length > 0) {
            let sumPromedios = 0;
            let countRated = 0;
            let sumTotal = 0;
            parsed.forEach((asoc) => {
              const asocId = asoc.idProducto || asoc.id;
              if (asocId && ratingsMap[asocId] && ratingsMap[asocId].total > 0) {
                sumPromedios += Number(ratingsMap[asocId].promedio || 0);
                countRated += 1;
                sumTotal += Number(ratingsMap[asocId].total || 0);
              }
            });
            if (countRated > 0 && sumTotal > 0) {
              return {
                rating: Math.round((sumPromedios / countRated) * 10) / 10,
                totalResenas: sumTotal
              };
            }
          }
        } catch (err) {
          // ignore parsing error
        }
      }

      // 3. Si el evento trae rating explícito verificado con totalResenas
      if (e.totalResenas && Number(e.totalResenas) > 0 && e.rating) {
        return {
          rating: Number(e.rating),
          totalResenas: Number(e.totalResenas)
        };
      }

      // 4. Sin reseñas registradas
      return {
        rating: null,
        totalResenas: 0
      };
    };

    const enrichedDb = rawActive.map((e, idx) => {
      const { theme: calculatedTheme, tag: calculatedTag } = getEventThemeAndTag(e, idx);
      const theme = e.theme || calculatedTheme;
      const customTag = calculatedTag;
      const prod = productos.find(
        (p) => String(p.id || p.idProducto) === String(e.idProducto)
      );
      const originalPrice = prod ? Number(prod.precio || 0) : 25000;
      let finalPrice = e.nuevoPrecio ? Number(e.nuevoPrecio) : null;
      if (!finalPrice && e.descuento && originalPrice) {
        finalPrice = Math.round(originalPrice * (1 - Number(e.descuento) / 100));
      }
      const ratingInfo = getEventRating(e, prod);

      return {
        ...e,
        theme,
        customTag,
        precioOriginal: originalPrice,
        nuevoPrecio: finalPrice || originalPrice,
        perks: e.perks || [
          "Ingredientes 100% Frescos",
          "Personalización Completa",
          "Preparación al Momento",
          "Garantía de Calidad Chazin"
        ],
        tiempoPrep: e.tiempoPrep || "10-15 min",
        rating: ratingInfo.rating,
        totalResenas: ratingInfo.totalResenas,
        calorias: e.calorias || "~650 kcal"
      };
    });

    return enrichedDb;
  }, [eventos, productos, ratingsMap]);

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

  const currentEvt = combinedEventos && combinedEventos.length > 0 ? (combinedEventos[currentIndex] || combinedEventos[0]) : null;
  const activeTheme = currentEvt ? (THEMES[currentEvt.theme] || THEMES.fire) : THEMES.fire;

  useEffect(() => {
    if (onThemeChange) {
      if (!combinedEventos || combinedEventos.length === 0) {
        onThemeChange(null);
      } else if (currentEvt) {
        onThemeChange({
          themeKey: currentEvt.theme || "fire",
          theme: activeTheme,
          hasEvents: true
        });
      }
    }
  }, [currentIndex, currentEvt, activeTheme, combinedEventos, onThemeChange]);

  if (!combinedEventos || combinedEventos.length === 0) {
    return null;
  }

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
                (isRealUrl(evt?.imagen) ? evt.imagen : null) ||
                (isRealUrl(prod?.imagen) ? prod.imagen : null) ||
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

                      {/* Píldora de Calificación Real o Sin Reseñas */}
                      {evt.rating && Number(evt.rating) > 0 && evt.totalResenas > 0 ? (
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white/15 backdrop-blur-md text-white/95 border border-white/20"
                          title={`Calificación: ${Number(evt.rating).toFixed(1)} / 5 (${evt.totalResenas} ${evt.totalResenas === 1 ? "reseña" : "reseñas"})`}
                        >
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span>{Number(evt.rating).toFixed(1)}</span>
                          <span className="text-[10px] text-amber-200/80 font-normal">({evt.totalResenas})</span>
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-black/30 backdrop-blur-md text-white/80 border border-white/10"
                          title="Este evento aún no tiene reseñas de usuarios"
                        >
                          <Star className="w-3 h-3 text-white/40" />
                          <span>Sin reseñas</span>
                        </span>
                      )}

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
                          {evt.customTag || theme.tag}
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

      {/* DOCK INFERIOR: SELECTOR DE PÍLDORAS CON ACCESO DIRECTO Y ARRASTRE SUAVE */}
      <div
        ref={pillsRef}
        onMouseDown={handlePillsMouseDown}
        onMouseMove={handlePillsMouseMove}
        onMouseUp={handlePillsMouseUp}
        onMouseLeave={handlePillsMouseLeave}
        className={`mt-4 flex items-center gap-3 overflow-x-auto no-scrollbar py-2.5 px-4 sm:px-6 select-none ${
          isPillsDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        style={{ scrollBehavior: isPillsDragging ? "auto" : "smooth" }}
      >
        {combinedEventos.map((evt, idx) => {
          const isSelected = idx === currentIndex;
          const badgeConfig = getEventBadgeConfig(evt);
          const BadgeIcon = badgeConfig?.Icon;
          const cleanName = badgeConfig?.fullLabel || stripEmojis(evt.nombreEvento || evt.nombre || "");

          return (
            <button
              key={evt.idEvento || idx}
              type="button"
              onClick={() => {
                if (pillsHasDragged.current) return;
                goToSlide(idx);
              }}
              className={`shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer border ${
                isSelected
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-950 border-gray-900 dark:border-white shadow-lg ring-2 ring-gray-900/15 dark:ring-white/20"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 hover:border-gray-300 dark:hover:border-gray-600 shadow-xs"
              }`}
            >
              {BadgeIcon ? (
                <BadgeIcon size={16} stroke={2} className={isSelected ? "text-amber-400 dark:text-amber-500" : "text-gray-500 dark:text-gray-400"} />
              ) : (
                <FoodIcon name={evt.icono || "burger"} size={16} />
              )}
              <span className="truncate max-w-[150px] sm:max-w-[200px] whitespace-nowrap">{cleanName}</span>
              {evt.descuento && (
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-md shrink-0 ${
                    isSelected
                      ? "bg-amber-400 text-gray-950 shadow-xs"
                      : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                  }`}
                >
                  -{evt.descuento}%
                </span>
              )}
            </button>
          );
        })}
        {/* Espaciador al final para garantizar que la última píldora nunca quede pegada ni recortada */}
        <div className="w-4 shrink-0 pointer-events-none" />
      </div>
    </section>
  );
}
