import React from "react";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";

export function Cart({ cart, increment, decrement, setItemObservacion, submitOrder, loading, subtotal, descuento, total }) {
  const isEmpty = cart.length === 0;

  return (
    <div className="flex h-full flex-col rounded-[28px] border border-[#eef1f5] bg-[#f4f4f4] p-4 shadow-[0_10px_26px_rgba(15,23,42,0.08)]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[0.7rem] uppercase tracking-[0.2em] text-[#7a8698]">Pedido</p>
          <h3 className="text-[2rem] font-black text-[#1f2d3d]">Carrito</h3>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f05454]/10 text-[#f05454]">
          <ShoppingCart className="h-5 w-5" />
        </div>
      </div>

      {isEmpty ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-[#dbe3ed] bg-white/70 px-6 py-10 text-center text-[#75859a]">
          <ShoppingCart className="mb-3 h-10 w-10 text-[#bfcad7]" />
          <p className="text-lg font-semibold text-[#445366]">Carrito vacío</p>
          <p className="mt-1 text-sm">Agrega productos para comenzar la venta</p>
        </div>
      ) : (
        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          {cart.map((it, idx) => (
            <div key={`${it.productoId}-${it.varianteId}-${idx}`} className="rounded-[22px] border border-[#e8edf4] bg-white p-3 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-base font-black text-[#1e2b39]">{it.nombre}</div>
                  <div className="mt-1 text-sm text-[#647489]">
                    ${Number(it.precio || 0).toLocaleString("es-CL")} c/u
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => decrement(idx)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fef2f2] text-[#f05454] transition hover:bg-[#fde7e7]"
                  aria-label="Eliminar producto"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {(it.adiciones || []).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(it.adiciones || []).map((adicion, i) => (
                    <span key={`${adicion.id}-${i}`} className="rounded-full bg-[#eef5ff] px-2 py-1 text-[0.7rem] font-medium text-[#49617a]">
                      {adicion.nombre}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#e9edf3] bg-[#f7fafc] p-1">
                  <button
                    type="button"
                    onClick={() => decrement(idx)}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#1f2d3d] shadow-sm"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-[24px] text-center text-base font-bold text-[#1f2d3d]">{it.cantidad || 1}</span>
                  <button
                    type="button"
                    onClick={() => increment(idx)}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f05454] text-white shadow-sm"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="text-right text-base font-black text-[#1f2d3d]">
                  ${Number((it.precio || 0) * (it.cantidad || 1)).toLocaleString("es-CL")}
                </div>
              </div>

              <div className="mt-3">
                <input
                  placeholder="Observaciones..."
                  className="w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2 text-sm text-[#29384d] outline-none transition focus:border-[#f05454] focus:ring-2 focus:ring-[#fdc9c9]"
                  value={it.observacion || ""}
                  onChange={(e) => setItemObservacion(idx, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 rounded-[22px] bg-white p-3 shadow-sm ring-1 ring-[#eef1f5]">
        <div className="flex items-center justify-between text-sm text-[#647489]">
          <span>Subtotal</span>
          <span className="font-semibold text-[#1e2b39]">${Number(subtotal || 0).toLocaleString("es-CL")}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm text-[#647489]">
          <span>Descuento</span>
          <span className="font-semibold text-[#1e2b39]">${Number(descuento || 0).toLocaleString("es-CL")}</span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-[#edf1f5] pt-3 text-lg font-black text-[#1e2b39]">
          <span>Total</span>
          <span className="text-[#f05454]">${Number(total || 0).toLocaleString("es-CL")}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => submitOrder()}
        disabled={loading || isEmpty}
        className="mt-4 w-full rounded-[18px] bg-[#f05454] px-4 py-3 text-base font-black text-white shadow-[0_12px_22px_rgba(240,84,84,0.28)] transition hover:-translate-y-0.5 hover:bg-[#e64b4b] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Procesando..." : "Enviar orden"}
      </button>
    </div>
  );
}

export default Cart;
