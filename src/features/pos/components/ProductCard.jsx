import React, { useMemo, useState } from "react";
import { Plus, Check, ChevronDown, ChevronUp, Layers } from "lucide-react";

const getProductEmoji = (name = "") => {
  const normalized = (name || "").toLowerCase();
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

  const currentVariante = variantes[0] || { id: producto.id, precio: producto.precio || 0 };

  const adiciones = useMemo(() => {
    let raw = producto.adiciones;
    if (typeof raw === "string") {
      try {
        raw = JSON.parse(raw);
      } catch (e) {
        raw = [];
      }
    }
    if (!Array.isArray(raw)) return [];
    return raw.map((a, idx) => ({
      id: a.idAdicion || a.id || idx + 1,
      idAdicion: a.idAdicion || a.id || idx + 1,
      nombre: a.nombre || `Adición #${idx + 1}`,
      precio: Number(a.precio || 0)
    }));
  }, [producto.adiciones]);

  const toggleAdicion = (adicion) => {
    const adId = adicion.idAdicion || adicion.id;
    setSelectedAdditions((prev) => {
      const exists = prev.some((a) => (a.idAdicion || a.id) === adId);
      return exists
        ? prev.filter((a) => (a.idAdicion || a.id) !== adId)
        : [...prev, { ...adicion, id: adId, idAdicion: adId }];
    });
  };

  const additionsTotal = useMemo(() => {
    return selectedAdditions.reduce((sum, a) => sum + (Number(a.precio) || 0), 0);
  }, [selectedAdditions]);

  const finalCardPrice = (Number(currentVariante.precio) || 0) + additionsTotal;

  const handleAdd = () => {
    onAdd({
      productoId: producto.id,
      varianteId: currentVariante.id,
      nombre: producto.nombre,
      precio: currentVariante.precio,
      adiciones: selectedAdditions
    });
    setSelectedAdditions([]);
    setShowAdditions(false);
  };

  return (
    <article className="rounded-[22px] border border-[#e5e9ef] dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[270px] sm:min-h-[295px] h-full overflow-hidden">
      {/* Top Banner with Image or Emoji */}
      <div className="relative flex h-24 sm:h-28 items-center justify-center bg-gradient-to-br from-[#e05454] to-[#c93f3f] shrink-0 overflow-hidden">
        {producto.imagen ? (
          <img
            src={producto.imagen}
            alt={producto.nombre}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-white/20 text-2xl sm:text-3xl shadow-inner backdrop-blur-xs">
            {getProductEmoji(producto.nombre)}
          </div>
        )}

        {adiciones.length > 0 && (
          <span className="absolute top-2 right-2 bg-black/40 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Layers className="w-2.5 h-2.5" />
            <span>{adiciones.length} adic.</span>
          </span>
        )}
      </div>

      {/* Card Body */}
      <div className="bg-white dark:bg-gray-900 p-3 sm:p-3.5 flex flex-col justify-between flex-1 text-center transition-colors">
        <div className="flex flex-col items-center">
          {/* Title */}
          <div className="min-h-[36px] flex items-center justify-center text-center w-full px-1">
            <h3 className="text-xs sm:text-sm font-extrabold text-[#1f2d3d] dark:text-gray-100 leading-snug line-clamp-2">
              {producto.nombre}
            </h3>
          </div>

          {/* Subtitle */}
          <div className="h-4 flex items-center justify-center text-center mt-0.5 w-full px-1">
            <p className="text-[11px] text-[#718096] dark:text-gray-400 truncate w-full">
              {producto.descripcion || "Producto disponible"}
            </p>
          </div>
        </div>

        {/* Adiciones Toggle & Panel */}
        {adiciones.length > 0 && (
          <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-gray-800 w-full text-left">
            <button
              type="button"
              onClick={() => setShowAdditions((prev) => !prev)}
              className="w-full flex items-center justify-between px-2 py-1 rounded-lg text-[11px] font-bold text-[#f05454] dark:text-red-400 bg-red-50/70 dark:bg-red-900/20 hover:bg-red-100/70 dark:hover:bg-red-900/30 transition-colors"
            >
              <span className="flex items-center gap-1">
                <span>{showAdditions ? "Ocultar adiciones" : "Personalizar adiciones"}</span>
                {selectedAdditions.length > 0 && (
                  <span className="bg-[#f05454] text-white text-[9px] font-black rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center">
                    {selectedAdditions.length}
                  </span>
                )}
              </span>
              {showAdditions ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {showAdditions && (
              <div className="mt-1.5 space-y-1 rounded-xl border border-[#e9edf2] dark:border-gray-700 bg-[#f8fafc] dark:bg-gray-800/80 p-2 text-[11px] max-h-36 overflow-y-auto">
                <p className="text-[9px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-400 mb-1">
                  Elige tus extras:
                </p>
                {adiciones.map((adicion) => {
                  const adId = adicion.idAdicion || adicion.id;
                  const isChecked = selectedAdditions.some(
                    (a) => (a.idAdicion || a.id) === adId
                  );
                  return (
                    <label
                      key={adId}
                      className={`flex cursor-pointer items-center justify-between gap-1.5 py-1 px-1.5 rounded-lg transition-all ${
                        isChecked
                          ? "bg-red-50 dark:bg-red-950/40 text-[#f05454] dark:text-red-300 font-semibold"
                          : "text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-700/60"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleAdicion(adicion)}
                          className="h-3.5 w-3.5 rounded border-[#d5dbe2] dark:border-gray-600 accent-[#f05454] cursor-pointer"
                        />
                        <span className="truncate max-w-[100px] sm:max-w-[120px] text-[11px]">
                          {adicion.nombre}
                        </span>
                      </div>
                      <span className="font-bold text-[10px] shrink-0">
                        +${Number(adicion.precio || 0).toLocaleString("es-CO")}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Price & Action Button */}
        <div className="pt-2.5 flex items-center justify-between gap-2 px-1 mt-2.5 w-full border-t border-gray-100 dark:border-gray-800">
          <div className="text-left flex flex-col">
            <span className="text-[10px] text-gray-400 font-medium leading-none">Precio</span>
            <span className="text-xs sm:text-sm font-black text-[#f05454] dark:text-red-400 leading-tight">
              ${Number(finalCardPrice).toLocaleString("es-CO")}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center justify-center gap-1 rounded-xl bg-[#f05454] hover:bg-[#d94444] px-3 py-2 text-[11px] font-bold text-white shadow-sm transition-all cursor-pointer active:scale-95 shrink-0"
          >
            <Plus className="h-3 w-3 stroke-[2.5]" />
            <span>Agregar</span>
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
