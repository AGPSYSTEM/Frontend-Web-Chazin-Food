import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle, Trash2, ArrowLeft } from "lucide-react";

export default function KioskCancelConfirmModal({
  isOpen,
  onClose,
  onConfirmCancel
}) {
  if (!isOpen) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md animate-in fade-in duration-200" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col items-center text-center overflow-hidden border-2 border-gray-150 animate-in zoom-in-95 duration-200 focus:outline-hidden select-none">
          <div className="w-20 h-20 rounded-3xl bg-red-100 text-[#A91B2E] flex items-center justify-center mb-4 shadow-md">
            <Trash2 className="w-10 h-10" />
          </div>

          <Dialog.Title className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
            ¿Deseas cancelar tu pedido?
          </Dialog.Title>

          <p className="mt-2 text-sm sm:text-base font-semibold text-gray-600">
            Se vaciará tu carrito y volverás a la pantalla principal para comenzar de nuevo.
          </p>

          <div className="mt-6 w-full flex flex-col gap-3">
            <button
              type="button"
              onClick={onConfirmCancel}
              className="w-full min-h-[60px] bg-[#A91B2E] hover:bg-[#8F1626] text-white text-lg font-black rounded-2xl shadow-lg shadow-red-700/25 flex items-center justify-center gap-2 cursor-pointer active:scale-97 transition-all"
            >
              <span>Sí, cancelar pedido</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full min-h-[56px] bg-gray-100 hover:bg-gray-200 text-gray-800 text-base font-bold rounded-2xl flex items-center justify-center gap-2 cursor-pointer active:scale-97 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>No, continuar ordenando</span>
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

