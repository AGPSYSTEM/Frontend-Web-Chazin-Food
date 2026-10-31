import React from "react";
import { ShoppingBag, ChevronRight, Trash2 } from "lucide-react";
import { motion } from "motion/react";

export default function KioskBottomBar({
  totalItems = 0,
  total = 0,
  onOpenReview,
  onCancelOrder,
  isBouncing = false
}) {
  const formatPrice = (val) => `$${Number(val || 0).toLocaleString("es-CO")}`;

  return (
    <nav
      aria-label="Barra de resumen del pedido"
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-red-100 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] p-3.5 sm:p-4 select-none"
    >
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between gap-3 sm:gap-6">
        {/* Left: Cart Counter & Total */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <motion.div
            animate={isBouncing ? { scale: [1, 1.35, 0.9, 1.2, 1], rotate: [0, -8, 8, 0] } : {}}
            transition={{ duration: 0.5 }}
            className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-[#A91B2E] text-white shadow-lg shadow-red-700/30 shrink-0"
          >
            <ShoppingBag className="h-7 w-7 sm:h-8 sm:w-8" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-amber-400 text-amber-950 text-xs sm:text-sm font-black border-2 border-white shadow-xs">
                {totalItems}
              </span>
            )}
          </motion.div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500">
                {totalItems} {totalItems === 1 ? "ítem agregado" : "ítems agregados"}
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-gray-900 leading-none">
              {formatPrice(total)}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
          {/* Cancelar pedido button */}
          <button
            type="button"
            onClick={onCancelOrder}
            disabled={totalItems === 0}
            aria-label="Cancelar pedido y comenzar de nuevo"
            className="h-12 sm:h-14 px-3 sm:px-5 rounded-2xl border-2 border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-600 disabled:opacity-40 text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer disabled:pointer-events-none"
          >
            <Trash2 className="w-4 h-4 text-gray-500" />
            <span className="hidden sm:inline">Cancelar</span>
          </button>

          {/* Ver mi pedido primary button */}
          <button
            type="button"
            onClick={onOpenReview}
            disabled={totalItems === 0}
            aria-label={`Ver mi pedido con ${totalItems} ítems por un total de ${formatPrice(total)}`}
            className="h-12 sm:h-14 sm:min-w-[200px] px-5 sm:px-8 rounded-2xl bg-linear-to-r from-[#A91B2E] to-red-600 hover:from-[#8F1626] hover:to-red-700 text-white disabled:opacity-40 text-base sm:text-xl font-black shadow-lg shadow-red-700/30 flex items-center justify-center gap-2 transition-all active:scale-97 cursor-pointer disabled:pointer-events-none"
          >
            <span>Ver mi pedido</span>
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
          </button>
        </div>
      </div>
    </nav>
  );
}
