import React, { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AlertCircle, Clock, Check } from "lucide-react";
import { motion } from "motion/react";

export default function KioskInactivityModal({
  isOpen,
  onStayActive,
  onTimeout
}) {
  const [seconds, setSeconds] = useState(10);

  useEffect(() => {
    if (!isOpen) {
      setSeconds(10);
      return;
    }

    setSeconds(10);
    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, onTimeout]);

  if (!isOpen) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onStayActive()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col items-center text-center overflow-hidden border-4 border-amber-400 animate-in zoom-in-95 duration-200 focus:outline-hidden select-none">
          {/* Animated Warning Icon */}
          <div className="w-20 h-20 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4 shadow-md">
            <Clock className="w-10 h-10 animate-pulse stroke-[2.5]" />
          </div>

          <Dialog.Title className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
            ¿Sigues ahí?
          </Dialog.Title>

          <p className="mt-2 text-base sm:text-lg font-bold text-gray-600">
            Por seguridad, tu pedido se cancelará en:
          </p>

          {/* Giant Countdown Clock */}
          <div className="my-5 w-24 h-24 rounded-full bg-red-50 border-4 border-[#A91B2E] flex items-center justify-center text-4xl sm:text-5xl font-black text-[#A91B2E] shadow-lg">
            {seconds}
          </div>

          {/* Big Tactile "I'm still here" button */}
          <button
            type="button"
            onClick={onStayActive}
            className="w-full min-h-[64px] sm:min-h-[72px] bg-linear-to-r from-[#A91B2E] to-red-600 hover:from-[#8F1626] hover:to-red-700 text-white text-xl sm:text-2xl font-black rounded-2xl shadow-xl shadow-red-700/30 flex items-center justify-center gap-2 transition-all active:scale-97 cursor-pointer"
          >
            <Check className="w-6 h-6 stroke-[3]" />
            <span>¡Sí, seguir ordenando!</span>
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

