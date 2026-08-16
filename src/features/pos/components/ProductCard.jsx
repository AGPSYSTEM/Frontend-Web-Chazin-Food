import React, { useMemo, useState } from "react";
import { Plus } from "lucide-react";

const getProductEmoji = (name = "") => {
  const normalized = name.toLowerCase();
  if (normalized.includes("hamburg")) return "🍔";
  if (normalized.includes("salchip")) return "🍟";
  if (normalized.includes("perro")) return "🌭";
  if (normalized.includes("pollo")) return "🍗";
  if (normalized.includes("papas")) return "🍟";
  if (normalized.includes("beb")) return "🥤";
  if (normalized.includes("gaseos") || normalized.includes("coca")) return "🥤";
  if (normalized.includes("pizza")) return "🍕";
  if (normalized.includes("postre")) return "🍰";
  if (normalized.includes("combo")) return "🍱";
  return "🍽️";
};

export function ProductCard({ producto, onAdd }) {
  const [showAdditions, setShowAdditions] = useState(false);
  const [selectedAdditions, setSelectedAdditions] = useState([]);

  const variantes = useMemo(
    () => producto.variantes || [{ id: producto.id, nombre: producto.nombre, precio: producto.precio }],
    [producto]
  );

  const adiciones = producto.adiciones || [];

  const toggleAdicion = (adicion) => {
    setSelectedAdditions((prev) => {
      const exists = prev.some((a) => a.id === adicion.id);
      return exists ? prev.filter((a) => a.id !== adicion.id) : [...prev, adicion];
    });
  };

  const handleAdd = (variante) => {
    onAdd({
      productoId: producto.id,
      varianteId: variante.id,
      nombre: producto.nombre,
      precio: variante.precio,
      adiciones: selectedAdditions
    });
    setShowAdditions(false);
    setSelectedAdditions([]);
  };

  return (
    <article className="overflow-hidden rounded-[22px] border border-[#e5e9ef] dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all flex flex-col h-[255px] sm:h-[290px] justify-between">
      {/* Red Coral Top Banner */}
      <div className="flex h-24 sm:h-32 items-center justify-center bg-[#e05454] shrink-0">
        <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-white/15 text-2xl sm:text-4xl shadow-inner">
          {getProductEmoji(producto.nombre)}
        </div>
      </div>

      {/* Card Body - Dark Mode Aware */}
      <div className="bg-white dark:bg-gray-900 p-3.5 flex flex-col justify-between flex-1 text-center transition-colors">
        <div className="flex flex-col items-center">
          {/* Centered Title container fixed height (40px) */}
          <div className="h-10 flex items-center justify-center text-center w-full px-1">
            <h3 className="text-xs sm:text-sm font-extrabold text-[#1f2d3d] dark:text-gray-100 leading-snug line-clamp-2 text-center">
              {producto.nombre}
            </h3>
          </div>

          {/* Centered Subtitle container */}
          <div className="h-4 flex items-center justify-center text-center mt-1 w-full px-1">
            <p className="text-[11px] text-[#718096] dark:text-gray-400 truncate text-center w-full">
              {producto.descripcion || "Producto de prueba"}
            </p>
          </div>
        </div>

        {/* Price & Button Bar */}
        <div className="pt-2.5 flex items-center justify-center gap-2.5 sm:gap-3 px-2 mt-auto w-full border-t border-gray-100 dark:border-gray-800">
          <span className="text-xs sm:text-sm font-black text-[#f05454] dark:text-red-400 leading-none whitespace-nowrap shrink-0 flex items-center">
            ${Number(producto.precio ?? 0).toLocaleString("es-CO")}
          </span>
          <button
            type="button"
            onClick={() => handleAdd(variantes[0])}
            className="inline-flex items-center justify-center gap-1 rounded-xl bg-[#f05454] hover:bg-[#d94444] px-2.5 py-1.5 text-[11px] font-bold text-white leading-none shadow-sm shrink-0 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="h-3 w-3 stroke-[2.5]" />
            <span>Agregar</span>
          </button>
        </div>

        {adiciones.length > 0 && (
          <div className="mt-2 pt-1.5 border-t border-gray-100 dark:border-gray-800 text-center">
            <button
              type="button"
              className="text-[10px] font-bold text-[#f05454] dark:text-red-400 hover:underline"
              onClick={() => setShowAdditions((prev) => !prev)}
            >
              {showAdditions ? "Ocultar adiciones" : "+ Adiciones"}
            </button>

            {showAdditions && (
              <div className="mt-1 space-y-1 rounded-xl border border-[#e9edf2] dark:border-gray-700 bg-[#f8fafc] dark:bg-gray-800 p-1.5 text-[11px] text-left">
                {adiciones.map((adicion) => (
                  <label key={adicion.id} className="flex cursor-pointer items-center justify-between gap-1 py-0.5 text-slate-700 dark:text-gray-200 hover:bg-slate-100/80 dark:hover:bg-gray-700 rounded px-1">
                    <span className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={selectedAdditions.some((a) => a.id === adicion.id)}
                        onChange={() => toggleAdicion(adicion)}
                        className="h-3 w-3 rounded border-[#d5dbe2] dark:border-gray-600 accent-[#f05454]"
                      />
                      <span className="truncate max-w-[90px]">{adicion.nombre}</span>
                    </span>
                    <span className="font-semibold text-slate-500 dark:text-gray-400 text-[10px]">+${Number(adicion.precio || 0).toLocaleString("es-CO")}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export default ProductCard;
