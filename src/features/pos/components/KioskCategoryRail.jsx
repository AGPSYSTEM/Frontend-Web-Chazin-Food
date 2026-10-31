import React from "react";
import { Utensils, Flame } from "lucide-react";
import { FoodIcon } from "@/shared/components/ui/FoodIcon";

export default function KioskCategoryRail({
  categorias = [],
  categoriaActiva = null,
  onSelectCategoria,
  eventCount = 0
}) {
  return (
    <aside
      aria-label="Categorías del menú"
      className="w-32 sm:w-40 lg:w-44 shrink-0 flex flex-col gap-2.5 py-1 pr-1.5 overflow-y-auto no-scrollbar select-none"
    >
      {/* Botón: Todos */}
      <button
        type="button"
        onClick={() => onSelectCategoria(null)}
        aria-pressed={categoriaActiva === null}
        className={`w-full min-h-[72px] sm:min-h-[84px] p-3 rounded-2xl flex flex-col items-center justify-center text-center transition-all cursor-pointer border-2 active:scale-96 ${
          categoriaActiva === null
            ? "bg-[#A91B2E] text-white border-[#8F1626] shadow-lg shadow-red-900/25 ring-3 ring-red-400/40"
            : "bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-800 hover:border-red-300 dark:hover:border-red-500/50 hover:bg-red-50/40 dark:hover:bg-gray-800/80 shadow-xs"
        }`}
      >
        <div className={`p-1.5 rounded-xl mb-1 ${categoriaActiva === null ? "bg-white/20 text-white" : "text-[#A91B2E]"}`}>
          <Utensils className="w-6 h-6 sm:w-7 sm:h-7" />
        </div>
        <span className="text-sm sm:text-base font-black leading-tight break-words">
          Todos
        </span>
      </button>

      {/* Botón: Eventos / Promociones si existen */}
      {eventCount > 0 && (
        <button
          type="button"
          onClick={() => onSelectCategoria("eventos")}
          aria-pressed={categoriaActiva === "eventos"}
          className={`w-full min-h-[72px] sm:min-h-[84px] p-3 rounded-2xl flex flex-col items-center justify-center text-center transition-all cursor-pointer border-2 active:scale-96 ${
            categoriaActiva === "eventos"
              ? "bg-linear-to-b from-amber-500 to-red-600 text-white border-amber-400 shadow-lg shadow-amber-600/30 ring-3 ring-amber-300"
              : "bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700/60 hover:bg-amber-100 dark:hover:bg-amber-900/40 shadow-xs"
          }`}
        >
          <div className="p-1 rounded-xl mb-1 text-amber-500 animate-pulse">
            <Flame className="w-6 h-6 sm:w-7 sm:h-7 fill-amber-500" />
          </div>
          <span className="text-sm sm:text-base font-black leading-tight break-words">
            Promociones
          </span>
          <span className={`mt-0.5 text-[10px] font-black px-2 py-0.2 rounded-full ${categoriaActiva === "eventos" ? "bg-white text-red-600" : "bg-amber-500 text-white"}`}>
            {eventCount} activas
          </span>
        </button>
      )}

      {/* Lista de categorías */}
      {categorias.map((cat) => {
        const catId = cat.id || cat.idCategoriaProducto;
        const isActive = categoriaActiva === catId;
        const catName = cat.nombre || "Categoría";

        return (
          <button
            key={catId}
            type="button"
            onClick={() => onSelectCategoria(catId)}
            aria-pressed={isActive}
            className={`w-full min-h-[72px] sm:min-h-[84px] p-2.5 sm:p-3 rounded-2xl flex flex-col items-center justify-center text-center transition-all cursor-pointer border-2 active:scale-96 ${
              isActive
                ? "bg-[#A91B2E] text-white border-[#8F1626] shadow-lg shadow-red-900/25 ring-3 ring-red-400/40"
                : "bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-800 hover:border-red-300 dark:hover:border-red-500/50 hover:bg-red-50/40 dark:hover:bg-gray-800/80 shadow-xs"
            }`}
          >
            <div className={`p-1 rounded-xl mb-1 ${isActive ? "text-white" : "text-[#A91B2E]"}`}>
              <FoodIcon name={catName} size={28} />
            </div>
            <span className="text-xs sm:text-sm lg:text-base font-black leading-tight break-words">
              {catName}
            </span>
          </button>
        );
      })}
    </aside>
  );
}

