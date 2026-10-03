import { useState, useMemo } from "react";
import { Flame, ChevronDown, ChevronUp, X, Filter, Sparkles } from "lucide-react";

export function TotalizadorCocina({
  pedidosActivos = [],
  filtroProductoSeleccionado = null,
  onSeleccionarProducto
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Aggregation of active items in kitchen
  const itemsAgrupados = useMemo(() => {
    const map = {};
    for (const ped of pedidosActivos) {
      // Only count pending or in-preparation orders (not completed ones)
      const isListo = ped.estado === "Listo" || ped.estadoEntrega === "LISTO";
      if (isListo) continue;

      for (const item of ped.productos || []) {
        const rawName = (item.nombre || "Platillo").trim();
        const qty = Number(item.cantidad) || 1;
        map[rawName] = (map[rawName] || 0) + qty;
      }
    }

    return Object.entries(map)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);
  }, [pedidosActivos]);

  const totalPlatillos = useMemo(() => {
    return itemsAgrupados.reduce((acc, i) => acc + i.cantidad, 0);
  }, [itemsAgrupados]);

  if (itemsAgrupados.length === 0) {
    return null; // Nothing cooking right now
  }

  return (
    <div className="bg-linear-to-r from-red-500/10 via-amber-500/10 to-orange-500/10 dark:from-red-950/40 dark:via-amber-950/30 dark:to-orange-950/40 border border-red-200/80 dark:border-red-900/40 rounded-2xl p-3 shadow-2xs transition-all">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-red-500 text-white flex items-center justify-center shrink-0 shadow-xs animate-pulse">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black text-gray-900 dark:text-gray-100 tracking-tight">
                Totalizador de Cocina (Batch en Marcha)
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-[#F05454] text-white text-[10px] font-black">
                {totalPlatillos} platillos en marcha
              </span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
              Suma de todos los platillos activos para cocción en lote en parrilla y freidora
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {filtroProductoSeleccionado && (
            <button
              type="button"
              onClick={() => onSeleccionarProducto(null)}
              className="flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl text-[11px] font-black hover:bg-red-50 transition cursor-pointer"
            >
              <X className="w-3 h-3" />
              <span>Limpiar Filtro ({filtroProductoSeleccionado})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition cursor-pointer"
            title={isCollapsed ? "Expandir totalizador" : "Minimizar totalizador"}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Chips List */}
      {!isCollapsed && (
        <div className="flex flex-wrap gap-2 mt-3 pt-2.5 border-t border-red-200/50 dark:border-red-900/30">
          {itemsAgrupados.map((it, idx) => {
            const isSelected = filtroProductoSeleccionado === it.nombre;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSeleccionarProducto(isSelected ? null : it.nombre)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 select-none shadow-2xs ${
                  isSelected
                    ? "bg-[#F05454] text-white ring-2 ring-red-400 scale-105"
                    : "bg-white dark:bg-gray-800/90 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-800 hover:bg-red-50/50 dark:hover:bg-gray-750"
                }`}
                title={`Haz clic para ver solo las comandas con ${it.nombre}`}
              >
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[11px] font-black ${
                    isSelected ? "bg-white/30 text-white" : "bg-red-100 dark:bg-red-950/60 text-[#F05454]"
                  }`}
                >
                  {it.cantidad}x
                </span>
                <span className="truncate max-w-[200px]">{it.nombre}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
