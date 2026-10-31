import React from "react";
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
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[96vw] max-w-3xl max-h-[92vh] -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl p-5 sm:p-8 flex flex-col justify-between overflow-hidden border-2 border-gray-150 animate-in zoom-in-95 duration-200 focus:outline-hidden select-none">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-150">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-[#A91B2E] flex items-center justify-center">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <Dialog.Title className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
                  Mi Pedido
                </Dialog.Title>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-bold text-gray-500">Modalidad:</span>
                  <button
                    type="button"
                    onClick={() => onChangeOrderMode(orderMode === "Comer aquí" ? "Para llevar" : "Comer aquí")}
                    className="text-xs font-black text-[#A91B2E] hover:underline cursor-pointer bg-red-50 px-2 py-0.5 rounded-lg"
                  >
                    {orderMode} (Cambiar)
                  </button>
                </div>
              </div>
            </div>

            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Cerrar resumen del pedido"
                className="w-12 h-12 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-all cursor-pointer active:scale-95"
              >
                <X className="w-6 h-6 stroke-[2.5]" />
              </button>
            </Dialog.Close>
          </div>

          {/* Items List (Scrollable) */}
          <div className="my-4 flex-1 overflow-y-auto pr-1 no-scrollbar space-y-3">
            {cart.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
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
                const itemTotal = (itemBasePrice + additionsPrice) * (item.cantidad || 1);

                return (
                  <div
                    key={`${item.productoId || idx}-${idx}`}
                    className="p-3.5 sm:p-4 rounded-2xl border-2 border-gray-150 bg-gray-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    {/* Item Information */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4 className="text-base sm:text-lg font-black text-gray-900 leading-snug">
                          {item.nombre}
                        </h4>
                        <span className="sm:hidden text-lg font-black text-[#A91B2E]">
                          {formatPrice(itemTotal)}
                        </span>
                      </div>

                      {/* Adiciones list */}
                      {Array.isArray(item.adiciones) && item.adiciones.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {item.adiciones.map((a, aidx) => (
                            <span
                              key={aidx}
                              className="text-[11px] font-bold bg-white text-gray-700 px-2 py-0.5 rounded-md border border-gray-200"
                            >
                              +{a.nombre}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Observaciones */}
                      {item.observacion && (
                        <p className="mt-1 text-xs text-amber-700 font-medium italic">
                          Nota: {item.observacion}
                        </p>
                      )}
                    </div>

                    {/* Stepper + Item Total + Remove Button */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0">
                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-gray-200">
                        <button
                          type="button"
                          onClick={() => onDecrement(idx)}
                          aria-label={`Reducir cantidad de ${item.nombre}`}
                          className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 flex items-center justify-center font-black active:scale-95 cursor-pointer"
                        >
                          <Minus className="w-4 h-4 stroke-[3]" />
                        </button>
                        <span className="w-8 text-center text-lg font-black text-gray-900">
                          {item.cantidad}
                        </span>
                        <button
                          type="button"
                          onClick={() => onIncrement(idx)}
                          aria-label={`Aumentar cantidad de ${item.nombre}`}
                          className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-[#A91B2E] text-white flex items-center justify-center font-black active:scale-95 cursor-pointer"
                        >
                          <Plus className="w-4 h-4 stroke-[3]" />
                        </button>
                      </div>

                      {/* Desktop Total */}
                      <span className="hidden sm:inline-block text-xl font-black text-[#A91B2E] min-w-[100px] text-right">
                        {formatPrice(itemTotal)}
                      </span>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => onRemoveItem(idx)}
                        aria-label={`Eliminar ${item.nombre} del pedido`}
                        className="w-10 h-10 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 flex items-center justify-center transition-all cursor-pointer active:scale-95"
                        title="Quitar del pedido"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Totals & Proceed Controls */}
          <div className="pt-4 border-t-2 border-gray-150 space-y-4">
            {/* Price Breakdown */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-sm font-bold text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {descuento > 0 && (
                <div className="flex items-center justify-between text-sm font-bold text-emerald-600">
                  <span>Descuento aplicado</span>
                  <span>-{formatPrice(descuento)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                <span className="text-xl font-black text-gray-900">Total a Pagar</span>
                <span className="text-3xl sm:text-4xl font-black text-[#A91B2E]">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            {/* Bottom Navigation Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto min-h-[56px] px-6 rounded-2xl border-2 border-gray-200 text-gray-700 font-bold text-base hover:bg-gray-100 flex items-center justify-center gap-2 cursor-pointer active:scale-97"
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

