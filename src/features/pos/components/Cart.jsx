import React from "react";
import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";

export function Cart({
  cart,
  increment,
  decrement,
  setItemObservacion,
  submitOrder,
  onOpenCheckout = null,
  loading,
  subtotal,
  descuento,
  total,
  onClose = null
}) {
  const isEmpty = cart.length === 0;

  const handleProceed = () => {
    if (onOpenCheckout) {
      if (onClose) onClose();
      onOpenCheckout();
    } else {
      submitOrder();
    }
  };

  return (
    <div className="flex h-full flex-col rounded-[24px] border border-[#e7eaee] dark:border-gray-800 bg-[#f8f8f8] dark:bg-gray-900/60 p-4 shadow-sm transition-colors">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.2em] font-bold text-[#7a8698] dark:text-gray-400">PEDIDO</p>
          <h3 className="text-xl font-black text-[#1f2d3d] dark:text-gray-100">Carrito</h3>
        </div>
        <div className="flex items-center gap-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fef2f2] dark:bg-red-900/30 text-[#f05454] dark:text-red-400">
            <ShoppingCart className="h-4 w-4" />
          </div>
        </div>
      </div>

      {isEmpty ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-[20px] border-2 border-dashed border-[#dbe3ed] dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-12 text-center text-[#75859a] dark:text-gray-400 min-h-[260px]">
          <ShoppingCart className="mb-2 h-10 w-10 text-[#bfcad7] dark:text-gray-600" />
          <p className="text-sm font-bold text-[#445366] dark:text-gray-200">Carrito vacío</p>
          <p className="mt-1 text-xs text-[#7a8698] dark:text-gray-400 leading-tight">Agrega productos para comenzar la venta</p>
        </div>
      ) : (
        <div className="flex-1 space-y-2.5 overflow-y-auto pr-1 max-h-[380px]">
          {cart.map((it, idx) => (
            <div key={`${it.productoId}-${it.varianteId}-${idx}`} className="rounded-[18px] border border-[#e8edf4] dark:border-gray-800 bg-white dark:bg-gray-900 p-3 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-[#1e2b39] dark:text-gray-100 line-clamp-1">{it.nombre}</div>
                  <div className="mt-0.5 text-[11px] text-[#647489] dark:text-gray-400">
                    ${Number(it.precio || 0).toLocaleString("es-CO")} c/u
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => decrement(idx)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-[#fef2f2] dark:bg-red-900/30 text-[#f05454] dark:text-red-400 transition hover:bg-[#fde7e7] dark:hover:bg-red-900/50 shrink-0"
                  aria-label="Eliminar producto"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {(it.adiciones || []).length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {(it.adiciones || []).map((adicion, i) => (
                    <span
                      key={`${adicion.idAdicion || adicion.id || i}-${i}`}
                      className="rounded-full bg-[#fef2f2] dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 px-2 py-0.5 text-[10px] font-semibold text-[#f05454] dark:text-red-300 flex items-center gap-1"
                    >
                      <span>+{adicion.nombre}</span>
                      {Number(adicion.precio) > 0 && (
                        <span className="opacity-75">(${Number(adicion.precio).toLocaleString("es-CO")})</span>
                      )}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-[#e9edf3] dark:border-gray-700 bg-[#f7fafc] dark:bg-gray-800 px-1 py-0.5">
                  <button
                    type="button"
                    onClick={() => decrement(idx)}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-gray-700 text-[#1f2d3d] dark:text-gray-100 shadow-sm text-xs"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="min-w-[18px] text-center text-xs font-bold text-[#1f2d3d] dark:text-gray-100">{it.cantidad || 1}</span>
                  <button
                    type="button"
                    onClick={() => increment(idx)}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f05454] text-white shadow-sm text-xs"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>

                <div className="text-right text-xs font-black text-[#1f2d3d] dark:text-gray-100">
                  ${Number(
                    ((Number(it.precio) || 0) + (it.adiciones || []).reduce((s, a) => s + (Number(a.precio) || 0), 0)) *
                      (it.cantidad || 1)
                  ).toLocaleString("es-CO")}
                </div>
              </div>

              <div className="mt-2">
                <input
                  placeholder="Observaciones..."
                  className="w-full rounded-lg border border-[#e2e8f0] dark:border-gray-700 bg-[#f8fafc] dark:bg-gray-800 px-2.5 py-1 text-xs text-[#29384d] dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none transition focus:border-[#f05454]"
                  value={it.observacion || ""}
                  onChange={(e) => setItemObservacion(idx, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 rounded-[18px] bg-white dark:bg-gray-900 p-3 shadow-sm border border-[#edf1f5] dark:border-gray-800">
        <div className="flex items-center justify-between text-xs text-[#647489] dark:text-gray-400">
          <span>Subtotal</span>
          <span className="font-semibold text-[#1e2b39] dark:text-gray-100">${Number(subtotal || 0).toLocaleString("es-CO")}</span>
        </div>
        <div className="mt-1.5 flex items-center justify-between text-xs text-[#647489] dark:text-gray-400">
          <span>Descuento</span>
          <span className="font-semibold text-[#1e2b39] dark:text-gray-100">${Number(descuento || 0).toLocaleString("es-CO")}</span>
        </div>
        <div className="mt-2.5 flex items-center justify-between border-t border-[#edf1f5] dark:border-gray-800 pt-2 text-sm font-black text-[#1e2b39] dark:text-gray-100">
          <span>Total</span>
          <span className="text-[#f05454] dark:text-red-400">${Number(total || 0).toLocaleString("es-CO")}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleProceed}
        disabled={loading || isEmpty}
        className="mt-3 w-full rounded-[16px] bg-[#f05454] hover:bg-[#e04545] px-4 py-3 text-xs sm:text-sm font-black text-white shadow-[0_8px_18px_rgba(240,84,84,0.25)] transition disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer active:scale-98"
      >
        {loading ? "Procesando..." : "Finalizar Pedido"}
      </button>
    </div>
  );
}

export default Cart;
