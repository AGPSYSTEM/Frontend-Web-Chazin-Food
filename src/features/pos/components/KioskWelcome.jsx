import React from "react";
import { UtensilsCrossed, ShoppingBag, ArrowLeft, Sparkles, ChefHat } from "lucide-react";
import { motion } from "motion/react";
import logoImg from "@/shared/assets/ChatGPT_Image_1_jun_2026__21_55_04.png";

export default function KioskWelcome({ onSelectOrderMode, onExitStaff }) {
  return (
    <div className="relative min-h-screen w-full bg-linear-to-b from-amber-50/70 via-white to-red-50/60 flex flex-col justify-between p-6 sm:p-10 select-none overflow-hidden">
      {/* Background ambient decorative shapes */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-amber-200/40 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-red-200/40 blur-3xl pointer-events-none" />

      {/* Top Header with Brand Badge and Discrete Staff Exit */}
      <header className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-sm font-black tracking-widest text-emerald-700 uppercase bg-emerald-100/80 px-3 py-1 rounded-full border border-emerald-200">
            Kiosco de Autoservicio Activo
          </span>
        </div>

        {/* Staff Discrete Exit Button */}
        <button
          type="button"
          onClick={onExitStaff}
          aria-label="Acceso para el personal - Gestión de Ventas"
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/80 hover:bg-white border border-gray-200 text-gray-500 hover:text-gray-800 text-xs font-bold shadow-2xs backdrop-blur-xs transition-all cursor-pointer opacity-70 hover:opacity-100 active:scale-95"
          title="Gestión de Ventas (Solo Personal)"
        >
          <ChefHat className="w-4 h-4 text-[#A91B2E]" />
          <span className="hidden sm:inline">Personal</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>
      </header>

      {/* Center Welcome Content */}
      <main className="relative z-10 w-full max-w-4xl mx-auto my-auto flex flex-col items-center text-center py-6 sm:py-10">
        {/* Brand Logo with gentle floating bounce */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, y: [0, -6, 0] }}
          transition={{ duration: 0.6, y: { repeat: Infinity, duration: 3.5, ease: "easeInOut" } }}
          className="relative mb-6"
        >
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-white p-3 shadow-2xl border-4 border-amber-400/80 flex items-center justify-center overflow-hidden">
            <img
              src={logoImg}
              alt="Chazin Food Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-[#A91B2E] text-white p-2 rounded-2xl shadow-md border-2 border-white">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
        </motion.div>

        {/* Big Catchy Titles Legible from Distance */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight leading-none">
            ¡Bienvenido a <span className="text-[#A91B2E]">Chazin Food</span>!
          </h1>
          <p className="mt-3 text-lg sm:text-2xl font-bold text-gray-600">
            Pide en pantalla en menos de 1 minuto
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-amber-100/90 text-amber-900 border border-amber-300 px-4 py-1.5 rounded-full text-sm sm:text-base font-extrabold shadow-2xs">
            <span>¿Cómo deseas disfrutar tu pedido hoy?</span>
          </div>
        </motion.div>

        {/* Two Giant Tactile Choice Buttons (Comer aquí / Para llevar) */}
        <div className="mt-8 sm:mt-12 w-full grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-2xl">
          {/* Option 1: Comer aquí */}
          <motion.button
            type="button"
            onClick={() => onSelectOrderMode("Comer aquí")}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            aria-label="Seleccionar opción comer aquí en mesa"
            className="group relative flex flex-col items-center justify-center min-h-[180px] sm:min-h-[220px] p-6 sm:p-8 rounded-3xl bg-white border-4 border-red-500/80 hover:border-[#A91B2E] shadow-xl hover:shadow-2xl shadow-red-600/15 transition-all text-center cursor-pointer overflow-hidden focus:outline-hidden focus:ring-4 focus:ring-red-400"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-100/60 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-linear-to-br from-[#A91B2E] to-red-600 text-white flex items-center justify-center shadow-lg shadow-red-700/30 mb-4 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 group-hover:text-[#A91B2E] transition-colors leading-tight">
              Comer aquí
            </h2>
            <p className="mt-1 text-sm sm:text-base font-bold text-gray-500">
              Servido en mesa para disfrutar en el local
            </p>
          </motion.button>

          {/* Option 2: Para llevar */}
          <motion.button
            type="button"
            onClick={() => onSelectOrderMode("Para llevar")}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            aria-label="Seleccionar opción para llevar empacado"
            className="group relative flex flex-col items-center justify-center min-h-[180px] sm:min-h-[220px] p-6 sm:p-8 rounded-3xl bg-white border-4 border-amber-500/80 hover:border-amber-600 shadow-xl hover:shadow-2xl shadow-amber-500/15 transition-all text-center cursor-pointer overflow-hidden focus:outline-hidden focus:ring-4 focus:ring-amber-400"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-100/60 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-linear-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-lg shadow-amber-600/30 mb-4 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 group-hover:text-amber-700 transition-colors leading-tight">
              Para llevar
            </h2>
            <p className="mt-1 text-sm sm:text-base font-bold text-gray-500">
              Empacado listo para retirar y llevar
            </p>
          </motion.button>
        </div>
      </main>

      {/* Friendly Bottom Banner */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto text-center pt-4 border-t border-gray-200/60">
        <p className="text-sm font-extrabold text-gray-400">
          Chazin Food • Calidad, Rapidez y el Mejor Sabor
        </p>
      </footer>
    </div>
  );
}

