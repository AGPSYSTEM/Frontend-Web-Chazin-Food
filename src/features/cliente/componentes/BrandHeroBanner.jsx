import React from "react";
import {
  Sparkles,
  Flame,
  Clock,
  Truck,
  Star,
  ChevronRight,
  ShieldCheck,
  Award,
  ArrowDown
} from "lucide-react";
import { FoodIcon } from "@/shared/components/ui/FoodIcon";

export function BrandHeroBanner({
  onExplorarMenu,
  onSelectCategoria,
  categorias = []
}) {
  const scrollToMenu = () => {
    if (onExplorarMenu) {
      onExplorarMenu();
      return;
    }
    const el = document.getElementById("menu-categorias") || document.getElementById("menu-catalogo");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleVerCombos = () => {
    if (onSelectCategoria) {
      const comboCat = categorias.find((c) =>
        String(c.nombre || "").toLowerCase().includes("combo")
      );
      if (comboCat) {
        onSelectCategoria(comboCat.id || comboCat.idCategoriaProducto);
      }
    }
    scrollToMenu();
  };

  return (
    <section
      aria-label="Presentación Chazin Food"
      className="w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-6 select-none"
    >
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#7A0C17] via-[#A91B2E] to-[#F05454] shadow-2xl border-2 border-amber-300/30 text-white">
        {/* Glows y patrones de fondo */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-red-950/40 rounded-full blur-3xl pointer-events-none" />
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "20px 20px"
          }}
        />

        <div className="relative z-10 p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Columna Izquierda: Texto, Badges y Acciones */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5 text-center lg:text-left">
            {/* Pill de Autenticidad */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-amber-200 text-xs sm:text-sm font-black tracking-wide shadow-xs">
              <Flame className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>SABOR URBANO 100% ARTESANAL</span>
              <span className="hidden sm:inline text-white/50">•</span>
              <span className="hidden sm:inline text-white">CHAZIN FOOD</span>
            </div>

            {/* Gran Título */}
            <div className="space-y-1.5">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] drop-shadow-md">
                El Auténtico Placer de la{" "}
                <span className="text-amber-300 underline decoration-amber-400/50 decoration-wavy decoration-2">
                  Comida Rápida
                </span>
              </h1>
              <p className="text-sm sm:text-base text-red-100 font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Hamburguesas artesanales con carne 100% de res, salchipapas gourmet cargadas y perros calientes especiales preparados al instante con los mejores ingredientes de la casa.
              </p>
            </div>

            {/* Badges de Valor y Confianza */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 text-left">
                <Clock className="w-4 h-4 text-amber-300 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] font-black leading-tight text-white">15-20 min</p>
                  <p className="text-[10px] text-red-200 truncate">Preparación</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 text-left">
                <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] font-black leading-tight text-white">100% Fresco</p>
                  <p className="text-[10px] text-red-200 truncate">Carne de res</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 text-left">
                <Truck className="w-4 h-4 text-sky-300 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] font-black leading-tight text-white">Caliente</p>
                  <p className="text-[10px] text-red-200 truncate">A tu puerta</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 text-left">
                <Star className="w-4 h-4 text-amber-300 fill-amber-300 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] font-black leading-tight text-white">4.9 / 5.0</p>
                  <p className="text-[10px] text-red-200 truncate">Clientes felices</p>
                </div>
              </div>
            </div>

            {/* Botones de Llamado a la Acción */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              <button
                type="button"
                onClick={scrollToMenu}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-gray-950 font-black text-sm tracking-wide transition-all transform active:scale-95 shadow-xl hover:shadow-amber-400/30 flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>Explorar Menú Completo</span>
                <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={handleVerCombos}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-black text-sm tracking-wide transition-all border border-white/20 backdrop-blur-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Ver Combos Especiales</span>
              </button>
            </div>
          </div>

          {/* Columna Derecha: Tarjetas Culinarias Destacadas */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
            {/* Card 1: Hamburguesas */}
            <div
              onClick={scrollToMenu}
              className="p-3.5 rounded-2xl bg-white/15 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all cursor-pointer group flex items-center gap-3.5"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-600/60 border border-white/20 flex items-center justify-center text-white shrink-0 shadow-md group-hover:scale-105 transition-transform">
                <FoodIcon name="burger" size={26} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-black text-white group-hover:text-amber-200 transition-colors">
                    Hamburguesas Artesanales
                  </h4>
                  <ChevronRight className="w-4 h-4 text-white/50 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-[11px] text-red-100 truncate">
                  Pan brioche dorado, carne jugosa y queso cheddar
                </p>
              </div>
            </div>

            {/* Card 2: Salchipapas */}
            <div
              onClick={scrollToMenu}
              className="p-3.5 rounded-2xl bg-white/15 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all cursor-pointer group flex items-center gap-3.5"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-600/60 border border-white/20 flex items-center justify-center text-white shrink-0 shadow-md group-hover:scale-105 transition-transform">
                <FoodIcon name="fries" size={26} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-black text-white group-hover:text-amber-200 transition-colors">
                    Salchipapas Gourmet
                  </h4>
                  <ChevronRight className="w-4 h-4 text-white/50 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-[11px] text-red-100 truncate">
                  Papas crujientes con lluvia de queso y tocineta
                </p>
              </div>
            </div>

            {/* Card 3: Perros Calientes */}
            <div
              onClick={scrollToMenu}
              className="p-3.5 rounded-2xl bg-white/15 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all cursor-pointer group flex items-center gap-3.5"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-600/60 border border-white/20 flex items-center justify-center text-white shrink-0 shadow-md group-hover:scale-105 transition-transform">
                <FoodIcon name="hotdog" size={26} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-black text-white group-hover:text-amber-200 transition-colors">
                    Perros Calientes Especiales
                  </h4>
                  <ChevronRight className="w-4 h-4 text-white/50 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-[11px] text-red-100 truncate">
                  Salchicha suiza ahumada y salsas de la casa
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

