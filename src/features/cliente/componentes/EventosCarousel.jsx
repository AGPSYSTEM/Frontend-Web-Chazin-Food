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
  Award,
  ShieldCheck,
  Percent,
  CheckCircle2,
  Utensils,
  Play,
  Pause,
  Layers,
  ChefHat
} from "lucide-react";
import { FoodIcon, FoodIconBadge } from "@/shared/components/ui/FoodIcon";

// Paletas temáticas ultra-premium con gradientes cinematográficos y ambient glow
const THEMES = {
  fire: {
    bg: "from-red-950 via-orange-950 to-neutral-950",
    glow: "rgba(249, 115, 22, 0.45)",
    border: "border-orange-500/30",
    badgeBg: "bg-gradient-to-r from-red-500 to-amber-500 text-white shadow-orange-500/30",
    accent: "text-amber-400",
    btnGrad: "from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white shadow-orange-600/40",
    pillBg: "bg-orange-500/15 border-orange-400/30 text-orange-200",
    tag: "🔥 SUPER PROMO FLASH"
  },
  violet: {
    bg: "from-purple-950 via-indigo-950 to-neutral-950",
    glow: "rgba(168, 85, 247, 0.45)",
    border: "border-purple-500/30",
    badgeBg: "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-purple-500/30",
    accent: "text-purple-300",
    btnGrad: "from-purple-500 via-indigo-600 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white shadow-purple-600/40",
    pillBg: "bg-purple-500/15 border-purple-400/30 text-purple-200",
    tag: "⚡ COMBO EXCLUSIVO"
  },
  emerald: {
    bg: "from-emerald-950 via-teal-950 to-neutral-950",
    glow: "rgba(16, 185, 129, 0.45)",
    border: "border-emerald-500/30",
    badgeBg: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/30",
    accent: "text-emerald-300",
    btnGrad: "from-emerald-500 via-teal-600 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white shadow-emerald-600/40",
    pillBg: "bg-emerald-500/15 border-emerald-400/30 text-emerald-200",
    tag: "🌿 EDICIÓN ESPECIAL"
  },
  gold: {
    bg: "from-amber-950 via-yellow-950 to-neutral-950",
    glow: "rgba(245, 158, 11, 0.45)",
    border: "border-amber-500/30",
    badgeBg: "bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 text-gray-950 shadow-amber-500/30",
    accent: "text-amber-300",
    btnGrad: "from-amber-400 via-yellow-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-gray-950 font-black shadow-amber-500/40",
    pillBg: "bg-amber-500/15 border-amber-400/30 text-amber-200",
    tag: "👑 SELECCIÓN CHEF GOURMET"
  }
};

// Eventos curados de alta gastronomía para garantizar que el carrusel SIEMPRE sea el más potente
const SHOWCASE_EVENTOS = [
  {
    idEvento: "showcase-1",
    idProducto: 16,
    nombreEvento: "Combo Pareja Legendario Chazin",
    tipoEvento: "2x1 / Combo Especial",
    descuento: 25,
    nuevoPrecio: 28500,
    precioOriginal: 38000,
    descripcion: "2 Hamburguesas Clásicas en pan brioche sellado + Papas Francesas crujientes + 2 Bebidas frías a elección. ¡Ahorra en pareja!",
    icono: "burger",
    perks: ["2 Hamburguesas Artesanales", "Papas Francesas Grandes", "2 Bebidas 400ml", "100% Personalizable"],
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
    descripcion: "Generosa cama de papas doradas, salchicha americana y suiza ahumada, tocineta crocante y doble queso fundido.",
    icono: "fries",
    perks: ["Salchicha Suiza y Americana", "Tocineta Crocante", "Queso Mozzarella Gratinado", "Salsa Chazin Incluida"],
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
    descripcion: "300g de carne de res 80/20 a la parrilla, doble tocineta ahumada, doble cheddar fundido y cebolla caramelizada.",
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
    descripcion: "2 Perros Especiales con salchicha premium americana, tocineta crujiente, queso mozzarella gratinado y ripio.",
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
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [timeLeft, setTimeLeft] = useState({ dias: 2, horas: 14, minutos: 42, segundos: 30 });

  const containerRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const animationFrameRef = useRef(null);
  const startTimeRef = useRef(null);
  const slideDuration = 6000; // 6 segundos por diapositiva

  // Fusionar eventos de BD activos con showcases gourmet para tener siempre la mejor experiencia
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

    // Si la BD tiene eventos activos, los enriquecemos; si son pocos, incorporamos los showcase
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

    // Agregar showcases que no colisionen con los ya presentes
    const missingCount = 4 - enrichedDb.length;
    const extraShowcases = SHOWCASE_EVENTOS.slice(0, missingCount);
    return [...enrichedDb, ...extraShowcases];
  }, [eventos, productos]);

  // Manejo de la barra de progreso fluida e Instagram-style autoplay
  useEffect(() => {
    if (combinedEventos.length <= 1) return;

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
        setCurrentIndex((prev) => (prev + 1) % combinedEventos.length);
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
  }, [currentIndex, isPaused, combinedEventos.length, progress]);

  // Cuenta regresiva viva en segundos para FOMO de alta conversión
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

  // Interacción 3D Tilt con el cursor del mouse
  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 6;
    setTilt({ x: rotateX, y: rotateY });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPaused(false);
    setTilt({ x: 0, y: 0 });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsPaused(true);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % combinedEventos.length);
    setProgress(0);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + combinedEventos.length) % combinedEventos.length);
    setProgress(0);
  };

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
    if (Math.abs(diff) > 45) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
  };

  if (!combinedEventos || combinedEventos.length === 0) {
    return null;
  }

  const currentEvt = combinedEventos[currentIndex] || combinedEventos[0];
  const activeTheme = THEMES[currentEvt.theme] || THEMES.fire;

  // Encontrar producto real vinculado
  const targetProduct = productos.find(
    (p) => String(p.id || p.idProducto) === String(currentEvt.idProducto)
  );

  // Cálculos de ahorro
  const originalPrice = currentEvt.precioOriginal || (targetProduct ? Number(targetProduct.precio) : 25000);
  const finalPrice = currentEvt.nuevoPrecio || (targetProduct ? Number(targetProduct.precio) : 20000);
  const ahorro = Math.max(0, originalPrice - finalPrice);
  const ahorroPorcentaje = originalPrice > 0 ? Math.round((ahorro / originalPrice) * 100) : (currentEvt.descuento || 20);

  // Determinar imagen o fallback de alta calidad
  const displayImage =
    targetProduct?.imagen ||
    currentEvt.imagen ||
    (currentEvt.icono === "fries"
      ? "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&auto=format&fit=crop&q=80"
      : currentEvt.icono === "hotdog"
      ? "https://images.unsplash.com/photo-1619740455993-9e612b1af08a?w=800&auto=format&fit=crop&q=80"
      : "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80");

  return (
    <section
      aria-label="Eventos y Ofertas Exclusivas Chazin Food"
      className="w-full px-3 sm:px-6 lg:px-8 py-5 select-none"
    >
      {/* HEADER DE LA SECCIÓN CON CONTROLES TOP-TIER */}
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
              Promociones gastronómicas por tiempo limitado con ingredientes premium.
            </p>
          </div>
        </div>

        {/* CONTADOR DIGITAL FLOTANTE DE TIEMPO RESTANTE */}
        <div className="flex items-center gap-2 bg-gray-100/90 dark:bg-gray-800/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 shadow-xs self-start sm:self-auto">
          <Clock className="w-3.5 h-3.5 text-amber-500 animate-spin" style={{ animationDuration: "10s" }} />
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

      {/* HISTORIAS SEGMENTADAS (PROGRESS BAR ESTILO INSTAGRAM/APPLE) */}
      <div className="w-full flex items-center gap-1.5 mb-3.5">
        {combinedEventos.map((evt, idx) => {
          const isCurrent = idx === currentIndex;
          const isPast = idx < currentIndex;
          return (
            <button
              key={evt.idEvento || idx}
              type="button"
              onClick={() => goToSlide(idx)}
              aria-label={`Ver diapositiva ${idx + 1}`}
              className="flex-1 h-1.5 sm:h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800 transition-all cursor-pointer relative group"
            >
              <div
                className={`h-full transition-all duration-150 ${
                  isCurrent
                    ? "bg-gradient-to-r from-amber-500 to-red-500"
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

      {/* ESCENARIO 3D PRINCIPAL (CINEMATIC HERO CONTAINER) */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative perspective-[1200px]"
      >
        {/* Glow dinámico exterior detrás de la tarjeta */}
        <div
          className="absolute -inset-2 sm:-inset-4 rounded-3xl sm:rounded-4xl blur-3xl opacity-60 dark:opacity-75 transition-all duration-700 pointer-events-none"
          style={{ backgroundColor: activeTheme.glow }}
        />

        {/* Tarjeta 3D Hero Principal */}
        <div
          style={{
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transition: "transform 0.18s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s ease"
          }}
          className={`relative overflow-hidden rounded-3xl sm:rounded-4xl border ${activeTheme.border} bg-gradient-to-br ${activeTheme.bg} text-white shadow-2xl backdrop-blur-xl min-h-[360px] sm:min-h-[380px] lg:min-h-[400px] flex flex-col justify-between`}
        >
          {/* Textura de partículas / malla de luz decorativa de fondo */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(0,0,0,0.6),transparent_50%)] pointer-events-none" />

          {/* Destello especular de cristal que recorre la tarjeta al interactuar */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none transform -skew-x-12 translate-x-full group-hover:translate-x-[-150%] transition-transform duration-1000" />

          {/* TOP BAR DENTRO DEL BANNER */}
          <div className="relative z-10 px-5 sm:px-8 pt-5 sm:pt-7 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${activeTheme.badgeBg} shadow-md`}
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>{currentEvt.tipoEvento || "Evento Activo"}</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white/15 backdrop-blur-md text-white/95 border border-white/20">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>{currentEvt.rating}</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-black/30 backdrop-blur-md text-white/80 border border-white/10">
                <Clock className="w-3 h-3" />
                <span>{currentEvt.tiempoPrep}</span>
              </span>
            </div>

            {/* AHORRO DESTACADO O BADGE DE PORCENTAJE */}
            {ahorroPorcentaje > 0 && (
              <div className="flex items-center gap-1.5 bg-red-600/90 hover:bg-red-600 text-white px-3 py-1 rounded-full text-xs font-black shadow-lg shadow-red-900/50 animate-bounce">
                <Percent className="w-3.5 h-3.5" />
                <span>-{ahorroPorcentaje}% OFF</span>
              </div>
            )}
          </div>

          {/* CONTENIDO CENTRAL: GRID 2 COLUMNAS (INFO + FOTOGRAFÍA GASTRONÓMICA) */}
          <div className="relative z-10 px-5 sm:px-8 py-4 sm:py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* COLUMNA IZQUIERDA: TEXTO, PERKS Y PRECIO */}
            <div className="lg:col-span-7 space-y-4 text-left">
              <div>
                <span className={`text-xs font-extrabold uppercase tracking-widest ${activeTheme.accent} block mb-1`}>
                  {activeTheme.tag}
                </span>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight drop-shadow-md leading-tight">
                  {currentEvt.nombreEvento || currentEvt.nombre}
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-gray-200/90 leading-relaxed font-normal max-w-xl line-clamp-2 sm:line-clamp-3">
                {currentEvt.descripcion}
              </p>

              {/* LISTA DE BENEFICIOS / INGREDIENTES INCLUIDOS */}
              {currentEvt.perks && currentEvt.perks.length > 0 && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {currentEvt.perks.slice(0, 4).map((perk, pIdx) => (
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

              {/* MÓDULO DE PRECIO IMPACTANTE CON COMPARADOR */}
              <div className="pt-2 flex items-baseline gap-3 flex-wrap">
                {originalPrice > finalPrice && (
                  <div className="text-sm sm:text-base font-bold text-gray-400 line-through">
                    ${Number(originalPrice).toLocaleString("es-CO")} COP
                  </div>
                )}
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-white flex items-center gap-1 tracking-tight">
                  <span className="text-emerald-400">$</span>
                  <span>{Number(finalPrice).toLocaleString("es-CO")}</span>
                  <span className="text-xs font-bold text-emerald-300 ml-1">COP</span>
                </div>
                {ahorro > 0 && (
                  <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs">
                    Ahorras ${Number(ahorro).toLocaleString("es-CO")}
                  </span>
                )}
              </div>
            </div>

            {/* COLUMNA DERECHA: PLATO DESTACADO EN 3D CON SOMBRA FLOTANTE */}
            <div className="lg:col-span-5 flex justify-center items-center relative">
              <div className="relative group/plate w-52 h-52 sm:w-64 sm:h-64 lg:w-72 lg:h-72 flex items-center justify-center">
                {/* Aura giratoria de luz detrás del plato */}
                <div
                  className="absolute inset-4 rounded-full blur-2xl opacity-70 animate-pulse pointer-events-none"
                  style={{ backgroundColor: activeTheme.glow }}
                />

                {/* Contenedor circular con imagen gastronómica */}
                <div className="relative z-10 w-full h-full rounded-3xl overflow-hidden border-2 border-white/20 bg-black/40 shadow-2xl backdrop-blur-md p-2 flex items-center justify-center transform group-hover/plate:scale-105 transition-transform duration-500">
                  <img
                    src={displayImage}
                    alt={currentEvt.nombreEvento || "Plato Chazin Food"}
                    className="w-full h-full object-cover rounded-2xl filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.7)] group-hover/plate:rotate-1 transition-all duration-500"
                    loading="eager"
                  />

                  {/* Badge flotante de receta sobre la foto */}
                  <div className="absolute bottom-3 left-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                      <ChefHat className="w-3.5 h-3.5" /> Receta Chazin
                    </span>
                    <span className="text-[10px] text-white/70">{currentEvt.calorias}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER INTERACTIVO CON BOTÓN CTA Y CONTROLES */}
          <div className="relative z-10 px-5 sm:px-8 pb-5 sm:pb-7 pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-white/10 bg-black/20 backdrop-blur-md">
            {/* BOTÓN CTA PRINCIPAL DE ALTO IMPACTO */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => onSelectEvento && onSelectEvento(currentEvt, targetProduct)}
                className={`w-full sm:w-auto px-7 py-3.5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 bg-gradient-to-r ${activeTheme.btnGrad} transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 cursor-pointer group/cta`}
              >
                <Sparkles className="w-4 h-4 text-white animate-spin" style={{ animationDuration: "6s" }} />
                <span>Personalizar & Pedir Promo</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover/cta:translate-x-1" />
              </button>

              <button
                type="button"
                onClick={() => setIsPaused((prev) => !prev)}
                aria-label={isPaused ? "Reanudar carrusel" : "Pausar carrusel"}
                className="w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
                title={isPaused ? "Reanudar animación" : "Pausar animación"}
              >
                {isPaused ? <Play className="w-4 h-4 fill-white" /> : <Pause className="w-4 h-4 fill-white" />}
              </button>
            </div>

            {/* NAVEGACIÓN Y MINIATURAS ACCESIBLES */}
            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-1.5">
                {combinedEventos.map((e, idx) => (
                  <button
                    key={e.idEvento || idx}
                    type="button"
                    onClick={() => goToSlide(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      currentIndex === idx
                        ? "w-8 bg-white shadow-lg shadow-white/50"
                        : "w-2.5 bg-white/30 hover:bg-white/60"
                    }`}
                    aria-label={`Ir al evento ${idx + 1}`}
                  />
                ))}
              </div>

              {/* BOTONES PREV Y NEXT ELEGANTE GLASS */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={prevSlide}
                  aria-label="Evento anterior"
                  className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/25 border border-white/20 text-white flex items-center justify-center transition-all shadow-md active:scale-90 cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="Evento siguiente"
                  className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/25 border border-white/20 text-white flex items-center justify-center transition-all shadow-md active:scale-90 cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DOCK INFERIOR: CHIPS RÁPIDOS DE SELECCIÓN DIRECTA */}
      <div className="mt-4 flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
        {combinedEventos.map((evt, idx) => {
          const isSelected = idx === currentIndex;
          const theme = THEMES[evt.theme] || THEMES.fire;
          return (
            <button
              key={evt.idEvento || idx}
              type="button"
              onClick={() => goToSlide(idx)}
              className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
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
