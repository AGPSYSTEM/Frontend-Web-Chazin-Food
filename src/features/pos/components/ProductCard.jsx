import React, { useMemo, useState } from "react";
import { Plus, Minus } from "lucide-react";

const getProductEmoji = (name = "") => {
  const normalized = name.toLowerCase();
  if (normalized.includes("hamburg")) return "🍔";
  if (normalized.includes("salchip")) return "🍟";
  if (normalized.includes("pollo")) return "🍗";
  if (normalized.includes("papas")) return "🍟";
  if (normalized.includes("beb")) return "🥤";
  if (normalized.includes("coca")) return "🥤";
  if (normalized.includes("pizza")) return "🍕";
  if (normalized.includes("postre")) return "🍰";
  if (normalized.includes("combo")) return "🍔";
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
    <article className="overflow-hidden rounded-[26px] border border-[#f7d7d7] bg-white shadow-[0_12px_28px_rgba(31,45,61,0.1)] ring-1 ring-[#f1d2d2]">
      <div className="flex h-40 items-center justify-center bg-[#f05454]">
        <div className="flex h-[120px] w-[120px] items-center justify-center rounded-full bg-[#f7f7f7]/5 text-[5.1rem] shadow-inner shadow-[#b92d2d]/30">
          {getProductEmoji(producto.nombre)}
        </div>
      </div>

      <div className="bg-[#f9f9f9] p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-[1.1rem] font-black text-[#1d2b3a]">{producto.nombre}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-[#66768b]">{producto.descripcion || "Producto disponible"}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <div className="text-[1.6rem] font-black text-[#f05454]">
            ${Number(producto.precio ?? 0).toLocaleString("es-CL")}
          </div>
          <button
            type="button"
            onClick={() => handleAdd(variantes[0])}
            className="inline-flex items-center gap-2 rounded-xl bg-[#f05454] px-3 py-2 text-sm font-bold text-white shadow-[0_8px_18px_rgba(240,84,84,0.3)] transition hover:-translate-y-0.5 hover:bg-[#e44b4b]"
          >
            <Plus className="h-4 w-4" />
            Agregar
          </button>
        </div>

        {adiciones.length > 0 && (
          <div className="mt-3">
            <button
              type="button"
              className="text-xs font-semibold uppercase tracking-[0.12em] text-[#f05454] underline decoration-2 underline-offset-4"
              onClick={() => setShowAdditions((prev) => !prev)}
            >
              {showAdditions ? "Ocultar adiciones" : "Adiciones"}
            </button>

            {showAdditions && (
              <div className="mt-2 space-y-2 rounded-2xl border border-[#e9edf2] bg-white p-2 shadow-sm">
                {adiciones.map((adicion) => (
                  <label key={adicion.id} className="flex cursor-pointer items-center justify-between gap-2 rounded-xl px-2 py-1.5 text-sm text-[#334155] hover:bg-[#f8fafc]">
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedAdditions.some((a) => a.id === adicion.id)}
                        onChange={() => toggleAdicion(adicion)}
                        className="h-4 w-4 rounded border-[#d5dbe2] accent-[#f05454]"
                      />
                      <span>{adicion.nombre}</span>
                    </span>
                    <span className="font-semibold text-[#6a7380]">+${Number(adicion.precio || 0).toLocaleString("es-CL")}</span>
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
