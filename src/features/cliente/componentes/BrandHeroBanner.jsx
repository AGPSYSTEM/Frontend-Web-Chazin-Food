import React from "react";
import {
  Sparkles,
  Flame,
  Clock,
  Truck,
  Star,
  ChevronRight,
  ShieldCheck,
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
    const el = document.getElementById("menu-categorias") || document.getElementById("search-menu-input");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSelectCategoryByKeyword = (keyword) => {
    if (onSelectCategoria && Array.isArray(categorias)) {
      const matched = categorias.find((c) =>
        String(c.nombre || "").toLowerCase().includes(keyword.toLowerCase())
      );
      if (matched) {
        onSelectCategoria(matched.id || matched.idCategoriaProducto);
      }
    }
    scrollToMenu();
  };

  return (
    <section
      aria-label="Presentación Chazin Food"
      className="w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-6 select-none"
    >
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#121319] via-[#181922] to-[#0d0e13] shadow-2xl border border-white/10 text-white">
        {/* Iluminación ambiental cálida gourmet (sin saturar) */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-600/15 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)] pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "24px 24px"
          }}
        />

        <div className="relative z-10 p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Columna Izquierda: Texto, Badges y Acciones */}
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            {/* Pill de Autenticidad */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.08] backdrop-blur-md border border-white/10 text-amber-300 text-xs sm:text-sm font-semibold tracking-wide shadow-xs transition-colors">
              <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Sabor Urbano 100% Artesanal</span>
              <span className="text-white/30">•</span>
              <span className="text-zinc-300 font-bold">Chazin Food</span>
            </div>

            {/* Gran Título */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] text-white">
                El auténtico placer de la comida rápida,{" "}
                <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400 bg-clip-text text-transparent">
                  hecha con pasión artesanal.
                </span>
              </h1>
              <p className="text-sm sm:text-base text-zinc-300 font-normal max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Hamburguesas de pura carne de res a la parrilla, salchipapas gourmet cargadas y perros calientes especiales con los ingredientes más frescos de la casa.
              </p>
            </div>

            {/* Badges de Valor y Confianza */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.07] text-left transition-colors">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-bold leading-tight text-white">15-20 min</p>
                  <p className="text-[10px] text-zinc-400 truncate">Preparación</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.07] text-left transition-colors">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-bold leading-tight text-white">100% Fresco</p>
                  <p className="text-[10px] text-zinc-400 truncate">Carne seleccionada</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.07] text-left transition-colors">
                <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4 text-sky-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-bold leading-tight text-white">Caliente</p>
                  <p className="text-[10px] text-zinc-400 truncate">A tu puerta</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.07] text-left transition-colors">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-bold leading-tight text-white">4.9 / 5.0</p>
                  <p className="text-[10px] text-zinc-400 truncate">Clientes felices</p>
                </div>
              </div>
            </div>

            {/* Botones de Llamado a la Acción */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              <button
                type="button"
                onClick={scrollToMenu}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-sm tracking-wide transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-red-950/50 hover:shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>Explorar Menú Completo</span>
                <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => handleSelectCategoryByKeyword("combo")}
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.10] text-zinc-200 hover:text-white font-semibold text-sm tracking-wide transition-all border border-white/10 hover:border-white/20 backdrop-blur-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Ver Combos Especiales</span>
              </button>
            </div>
          </div>

          {/* Columna Derecha: Tarjetas Culinarias Destacadas con estética premium */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
            {/* Card 1: Hamburguesas */}
            <div
              onClick={() => handleSelectCategoryByKeyword("hamburguesa")}
              className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] backdrop-blur-md border border-white/10 hover:border-amber-500/30 transition-all duration-300 cursor-pointer group flex items-center gap-3.5 hover:-translate-y-0.5"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-red-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 shrink-0 shadow-md group-hover:scale-105 transition-transform">
                <FoodIcon name="burger" size={26} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                      Hamburguesas Artesanales
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                      Favoritas
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
                <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                  Pan brioche dorado, carne jugosa y queso cheddar
                </p>
              </div>
            </div>

            {/* Card 2: Salchipapas */}
            <div
              onClick={() => handleSelectCategoryByKeyword("salchipapa")}
              className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] backdrop-blur-md border border-white/10 hover:border-amber-500/30 transition-all duration-300 cursor-pointer group flex items-center gap-3.5 hover:-translate-y-0.5"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 shrink-0 shadow-md group-hover:scale-105 transition-transform">
                <FoodIcon name="fries" size={26} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                      Salchipapas Gourmet
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Populares
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
                <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                  Papas crujientes con lluvia de queso y tocineta
                </p>
              </div>
            </div>

            {/* Card 3: Perros Calientes */}
            <div
              onClick={() => handleSelectCategoryByKeyword("perro")}
              className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] backdrop-blur-md border border-white/10 hover:border-rose-500/30 transition-all duration-300 cursor-pointer group flex items-center gap-3.5 hover:-translate-y-0.5"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500/20 to-orange-500/20 border border-rose-500/30 flex items-center justify-center text-rose-300 shrink-0 shadow-md group-hover:scale-105 transition-transform">
                <FoodIcon name="hotdog" size={26} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                      Perros Calientes Especiales
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      Clásicos
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
                <p className="text-[11px] text-zinc-400 truncate mt-0.5">
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
