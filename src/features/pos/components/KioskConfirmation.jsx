import React, { useState, useEffect } from "react";
import { CheckCircle2, RotateCcw, UtensilsCrossed, Sparkles } from "lucide-react";
import { motion } from "motion/react";

export default function KioskConfirmation({ orderId, orderData, onReset }) {
  const [secondsLeft, setSecondsLeft] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onReset();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onReset]);

  // Format order number cleanly: e.g. #065
  const formattedNumber = orderId ? `#${String(orderId).padStart(3, "0")}` : "#001";

  return (
    <div className="relative min-h-screen w-full bg-linear-to-b from-emerald-50 via-white to-red-50 flex flex-col justify-between items-center p-6 sm:p-12 select-none overflow-hidden">
      {/* Background ambient decorative shapes */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-200/40 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-red-200/30 blur-3xl pointer-events-none" />

      {/* Top Banner */}
      <header className="relative z-10 w-full max-w-3xl flex justify-center">
        <span className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 border border-emerald-300 px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-wider shadow-2xs">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          ¡Orden enviada a cocina con éxito!
        </span>
      </header>

      {/* Center Giant Ticket */}
      <main className="relative z-10 w-full max-w-xl mx-auto my-auto flex flex-col items-center text-center">
        {/* Animated Checkmark */}
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-emerald-500 text-white flex items-center justify-center shadow-2xl shadow-emerald-600/30 mb-6"
        >
          <CheckCircle2 className="w-14 h-14 sm:w-16 sm:h-16 stroke-[2.5]" />
        </motion.div>

        <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight leading-tight">
          ¡Gracias por tu compra!
        </h1>
        <p className="mt-2 text-base sm:text-xl font-bold text-gray-600">
          Tu pedido ya está siendo preparado en nuestra cocina
        </p>

        {/* GIANT ORDER NUMBER TICKET BOX */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 w-full p-6 sm:p-8 rounded-3xl bg-white border-4 border-dashed border-[#A91B2E] shadow-2xl relative overflow-hidden"
        >
          <span className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-[#A91B2E] bg-red-50 px-4 py-1 rounded-full border border-red-200">
            NÚMERO DE ORDEN
          </span>

          <div className="my-2 text-7xl sm:text-9xl font-black text-[#A91B2E] tracking-tight leading-none">
            {formattedNumber}
          </div>

          <div className="flex items-center justify-center gap-2 text-sm sm:text-base font-extrabold text-gray-700 mt-2">
            <UtensilsCrossed className="w-5 h-5 text-amber-500" />
            <span>Retira en barra cuando tu número aparezca en pantalla</span>
          </div>

          {orderData?.clienteNombre && (
            <p className="mt-2 text-xs font-bold text-gray-500">
              Cliente: {orderData.clienteNombre} • {orderData.tipoEntrega || "En local"}
            </p>
          )}
        </motion.div>

        {/* 10-Second Auto-Reset Indicator */}
        <div className="mt-8 w-full max-w-md">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-1.5">
            <span>Regresando a pantalla de inicio...</span>
            <span className="font-black text-[#A91B2E]">{secondsLeft}s</span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 10, ease: "linear" }}
              className="h-full bg-linear-to-r from-[#A91B2E] to-amber-500"
            />
          </div>
        </div>

        {/* Instant Reset Button */}
        <button
          type="button"
          onClick={onReset}
          className="mt-6 min-h-[56px] px-8 rounded-2xl bg-gray-900 hover:bg-black text-white text-base sm:text-lg font-black shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Hacer un nuevo pedido ahora</span>
        </button>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full text-center pt-2">
        <p className="text-xs font-extrabold text-gray-400">
          Chazin Food • ¡Buen provecho!
        </p>
      </footer>
    </div>
  );
}

