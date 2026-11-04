import React from "react";
import { stripEmojis } from "@/shared/utils/foodEmojiUtils";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Plus, Minus, Trash2, ArrowLeft, CheckCircle2, ShoppingBag } from "lucide-react";

export default function KioskOrderReviewModal({
  isOpen,
  onClose,
  cart = [],
  orderMode = "Comer aquí",
  onChangeOrderMode,
  onIncrement,
  onDecrement,
  onRemoveItem,
  subtotal = 0,
  descuento = 0,
  total = 0,
  onProceedToCheckout
}) {
  const formatPrice = (val) => `$${Number(val || 0).toLocaleString("es-CO")}`;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[96vw] max-w-3xl max-h-[92vh] -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-5 sm:p-8 flex flex-col justify-between overflow-hidden border-2 border-gray-150 dark:border-gray-800 animate-in zoom-in-95 duration-200 focus:outline-hidden select-none">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-150 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/50 text-[#A91B2E] dark:text-red-400 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <Dialog.Title className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-100 leading-tight">
                  Mi Pedido
                </Dialog.Title>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Modalidad:</span>
                  <span className="text-xs font-black text-[#A91B2E] dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-lg">
                    Consumo en Mesa
                  </span>
                </div>
              </div>
            </div>

            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Cerrar resumen del pedido"
                className="w-12 h-12 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center transition-all cursor-pointer active:scale-95"
              >
                <X className="w-6 h-6 stroke-[2.5]" />
              </button>
            </Dialog.Close>
          </div>

          {/* Items List (Scrollable) */}
          <div className="my-4 flex-1 overflow-y-auto pr-1 no-scrollbar space-y-3">
            {cart.length === 0 ? (
              <div className="py-12 text-center text-gray-400 dark:text-gray-500">
                <p className="text-lg font-bold">Tu pedido está vacío.</p>
                <p className="text-sm">Agrega productos tocando las tarjetas del menú.</p>
              </div>
            ) : (
              cart.map((item, idx) => {
                const itemBasePrice = Number(item.precio || 0);
                const additionsPrice = (item.adiciones || []).reduce(
                  (sum, a) => sum + (Number(a.precio) || 0) * (Number(a.cantidad) || 1),
                  0
                );
                const unitPrice = itemBasePrice + additionsPrice;
                const itemTotal = unitPrice * (item.cantidad || 1);

                return (
                  <div
                    key={`${item.productoId || idx}-${idx}`}
                    className="p-3.5 sm:p-4 rounded-2xl border-2 border-gray-150 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 transition-colors"
                  >
                    {/* Item Information */}
                    <div className="flex-1 min-w-0 pr-2">
                      <h4 className="text-base sm:text-lg font-black text-gray-900 dark:text-gray-100 leading-snug truncate" title={stripEmojis(item.nombre)}>
                        {stripEmojis(item.nombre)}
                      </h4>

                      {/* Adiciones list */}
                      {Array.isArray(item.adiciones) && item.adiciones.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {item.adiciones.map((a, aidx) => {
                            const aPrice = (Number(a.precio) || 0) * (Number(a.cantidad) || 1);
                            return (
                              <span
                                key={aidx}
                                className="text-[11px] font-bold bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-600"
                              >
                                +{stripEmojis(a.nombre)} {aPrice > 0 ? `(+${formatPrice(aPrice)})` : ""}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {/* Observaciones */}
                      {item.observacion && (
                        <p className="mt-1 text-xs text-amber-700 dark:text-amber-400 font-medium italic">
                          Nota: {item.observacion}
                        </p>
                      )}
                    </div>

                    {/* Controles y Precios alineados para sumar fácilmente */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0">
                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-1.5 bg-white dark:bg-gray-900 p-1 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs">
                        <button
                          type="button"
                          onClick={() => onDecrement(idx)}
                          aria-label={`Reducir cantidad de ${stripEmojis(item.nombre)}`}
                          className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 flex items-center justify-center font-black active:scale-95 cursor-pointer"
                        >
                          <Minus className="w-4 h-4 stroke-[3]" />
                        </button>
                        <span className="w-7 sm:w-8 text-center text-base sm:text-lg font-black text-gray-900 dark:text-gray-100 font-mono">
                          {item.cantidad}
                        </span>
                        <button
                          type="button"
                          onClick={() => onIncrement(idx)}
                          aria-label={`Aumentar cantidad de ${stripEmojis(item.nombre)}`}
                          className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#A91B2E] text-white flex items-center justify-center font-black active:scale-95 cursor-pointer"
                        >
                          <Plus className="w-4 h-4 stroke-[3]" />
                        </button>
                      </div>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => onRemoveItem(idx)}
                        aria-label={`Eliminar ${stripEmojis(item.nombre)} del pedido`}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 flex items-center justify-center transition-all cursor-pointer active:scale-95 shrink-0"
                        title="Quitar del pedido"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {/* Precios Apilados: Precio Unitario y Subtotal alineados a la derecha */}
                      <div className="flex flex-col items-end justify-center text-right min-w-[110px] sm:min-w-[130px] font-mono shrink-0 pl-1">
                        <div className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium tracking-tight">
                          Unit: <span className="font-bold text-gray-700 dark:text-gray-200">{formatPrice(unitPrice)}</span>
                        </div>
                        {item.cantidad > 1 && (
                          <div className="text-[10px] sm:text-[11px] text-gray-400 dark:text-gray-500 tabular-nums">
                            {item.cantidad} × {formatPrice(unitPrice)}
                          </div>
                        )}
                        <div className="text-lg sm:text-xl font-black text-[#A91B2E] dark:text-red-400 tabular-nums tracking-tight">
                          {formatPrice(itemTotal)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Totals & Proceed Controls */}
          <div className="pt-4 border-t-2 border-gray-150 dark:border-gray-800 space-y-4">
            {/* Price Breakdown */}
            <div className="bg-gray-50 dark:bg-gray-800/60 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col gap-1.5 font-mono">
              <div className="flex items-center justify-between text-sm font-bold text-gray-600 dark:text-gray-300">
                <span className="font-sans">Subtotal</span>
                <span className="tabular-nums text-base">{formatPrice(subtotal)}</span>
              </div>
              {descuento > 0 && (
                <div className="flex items-center justify-between text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="font-sans">Descuento aplicado</span>
                  <span className="tabular-nums text-base">-{formatPrice(descuento)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <span className="font-sans text-xl font-black text-gray-900 dark:text-gray-100">Total a Pagar</span>
                <span className="text-3xl sm:text-4xl font-black text-[#A91B2E] dark:text-red-400 tabular-nums">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            {/* Bottom Navigation Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto min-h-[56px] px-6 rounded-2xl border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-base hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center gap-2 cursor-pointer active:scale-97"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Seguir pidiendo</span>
              </button>

              <button
                type="button"
                onClick={onProceedToCheckout}
                disabled={cart.length === 0}
                className="flex-1 w-full min-h-[64px] sm:min-h-[72px] bg-linear-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white text-xl sm:text-2xl font-black rounded-2xl shadow-xl shadow-emerald-700/25 flex items-center justify-center gap-3 transition-all active:scale-98 cursor-pointer disabled:opacity-40"
              >
                <CheckCircle2 className="w-7 h-7" />
                <span>Finalizar Pedido • {formatPrice(total)}</span>
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
