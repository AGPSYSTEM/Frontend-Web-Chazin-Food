import React, { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Banknote, CreditCard, User, Check, ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/features/autenticacion/hooks/useAuth";

export default function KioskCheckoutModal({
  isOpen,
  onClose,
  cart = [],
  orderMode = "Comer aquí",
  subtotal = 0,
  descuento = 0,
  total = 0,
  onConfirmCheckout,
  loading = false
}) {
  const { user } = useAuth();
  const [clienteNombre, setClienteNombre] = useState("");
  const [metodoPago, setMetodoPago] = useState("Efectivo"); // "Efectivo", "Tarjeta"
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      setClienteNombre("");
      setMetodoPago("Efectivo");
      setErrorMsg("");
    }
  }, [isOpen]);

  const formatPrice = (val) => `$${Number(val || 0).toLocaleString("es-CO")}`;

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalClientName = clienteNombre.trim() || "Cliente Kiosco";

    const payload = {
      idUsuario: user?.idUsuario || user?.id || null,
      idCliente: null,
      tipoEntrega: orderMode === "Comer aquí" ? "En Mesa" : "Recoger",
      direccion: orderMode === "Comer aquí" ? "Consumo en Mesa" : "Recoger en Mostrador",
      clienteNombre: finalClientName,
      responsable: user?.nombre ? `${user.nombre} ${user.apellidos || ''}`.trim() : "Kiosco Autoservicio",
      subtotal: Number(subtotal || 0),
      descuento: Number(descuento || 0),
      descuentoAplicado: Number(descuento || 0),
      total: Number(total || 0),
      origen: "PUNTO_FISICO",
      tiempoEstimadoEntrega: "15-20 min",
      empaqueParaLlevar: orderMode === "Para llevar",
      metodoPago: metodoPago,
      observacion: `Kiosco Autoservicio - ${orderMode}`,
      datosPago: {
        metodo: metodoPago,
        origen: "KIOSCO"
      }
    };

    onConfirmCheckout(payload);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && !loading && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md animate-in fade-in duration-200" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[96vw] max-w-xl max-h-[92vh] -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col justify-between overflow-hidden border-2 border-gray-150 animate-in zoom-in-95 duration-200 focus:outline-hidden select-none">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-150">
            <div>
              <Dialog.Title className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
                Finalizar Pedido
              </Dialog.Title>
              <p className="text-xs sm:text-sm font-bold text-gray-500">
                Paso final: confirma tu nombre y método de pago
              </p>
            </div>
            {!loading && (
              <Dialog.Close asChild>
                <button
                  type="button"
                  aria-label="Cerrar pantalla de pago"
                  className="w-12 h-12 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-all cursor-pointer active:scale-95"
                >
                  <X className="w-6 h-6 stroke-[2.5]" />
                </button>
              </Dialog.Close>
            )}
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="my-4 flex-1 overflow-y-auto pr-1 no-scrollbar space-y-5">
            {/* Total Highlight Card */}
            <div className="bg-linear-to-r from-red-600 to-[#A91B2E] text-white p-4 sm:p-5 rounded-2xl shadow-lg flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-red-200">
                  Total a pagar ({orderMode})
                </p>
                <p className="text-3xl sm:text-4xl font-black mt-0.5">
                  {formatPrice(total)}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-xs">
                  {cart.length} {cart.length === 1 ? "ítem" : "ítems"}
                </span>
              </div>
            </div>

            {/* Customer Name Input */}
            <div>
              <label htmlFor="kiosk-client-name" className="block text-sm font-black text-gray-800 mb-1.5">
                ¿A nombre de quién registramos la orden?
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  id="kiosk-client-name"
                  type="text"
                  value={clienteNombre}
                  onChange={(e) => setClienteNombre(e.target.value)}
                  placeholder="Tu nombre (o déjalo en blanco para 'Cliente Kiosco')"
                  className="w-full h-14 pl-12 pr-4 rounded-2xl bg-gray-50 border-2 border-gray-200 text-base font-bold text-gray-800 placeholder:text-gray-400 focus:outline-hidden focus:border-red-500 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Payment Method Selector (Giant Tactile Buttons) */}
            <div>
              <p className="text-sm font-black text-gray-800 mb-2">
                Selecciona tu forma de pago:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Efectivo */}
                <button
                  type="button"
                  onClick={() => setMetodoPago("Efectivo")}
                  aria-pressed={metodoPago === "Efectivo"}
                  className={`min-h-[90px] p-4 rounded-2xl border-2 flex flex-col justify-between text-left transition-all cursor-pointer active:scale-97 ${
                    metodoPago === "Efectivo"
                      ? "bg-emerald-50 border-emerald-600 shadow-md ring-3 ring-emerald-300"
                      : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Banknote className="w-6 h-6" />
                    </div>
                    {metodoPago === "Efectivo" && (
                      <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-base font-black text-gray-900 mt-2">
                      Efectivo en Caja
                    </h4>
                    <p className="text-xs font-semibold text-gray-500">
                      Pagas al retirar en barra
                    </p>
                  </div>
                </button>

                {/* Tarjeta */}
                <button
                  type="button"
                  onClick={() => setMetodoPago("Tarjeta")}
                  aria-pressed={metodoPago === "Tarjeta"}
                  className={`min-h-[90px] p-4 rounded-2xl border-2 flex flex-col justify-between text-left transition-all cursor-pointer active:scale-97 ${
                    metodoPago === "Tarjeta"
                      ? "bg-blue-50 border-blue-600 shadow-md ring-3 ring-blue-300"
                      : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    {metodoPago === "Tarjeta" && (
                      <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-base font-black text-gray-900 mt-2">
                      Tarjeta / Datáfono
                    </h4>
                    <p className="text-xs font-semibold text-gray-500">
                      Débito o crédito
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs font-bold text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
                {errorMsg}
              </p>
            )}

            <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Transacción segura y procesada en tiempo real</span>
            </div>
          </form>

          {/* Footer Controls */}
          <div className="pt-3 border-t border-gray-150 flex items-center gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="min-h-[56px] px-5 rounded-2xl border-2 border-gray-200 text-gray-700 font-bold text-base hover:bg-gray-100 flex items-center justify-center gap-1.5 cursor-pointer active:scale-97 disabled:opacity-40"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Atrás</span>
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 min-h-[64px] bg-[#A91B2E] hover:bg-[#8F1626] text-white text-xl sm:text-2xl font-black rounded-2xl shadow-xl shadow-red-700/25 flex items-center justify-center gap-3 transition-all active:scale-98 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-7 h-7 animate-spin" />
                  <span>Registrando pedido...</span>
                </>
              ) : (
                <span>Confirmar y Pagar • {formatPrice(total)}</span>
              )}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

