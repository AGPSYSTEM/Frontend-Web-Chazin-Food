import React, { useState } from "react";
import {
  X,
  Store,
  MapPin,
  Banknote,
  CreditCard,
  Smartphone,
  CheckCircle2,
  ShoppingBag,
  Info
} from "lucide-react";

export function PosCheckoutModal({
  isOpen,
  onClose,
  cart,
  subtotal,
  descuento,
  total,
  onConfirm,
  loading
}) {
  const [clienteNombre, setClienteNombre] = useState("Cliente Mostrador");
  const [metodoPago, setMetodoPago] = useState("efectivo"); // "efectivo", "tarjeta", "transferencia"

  // Pago en Efectivo
  const [efectivoPaga, setEfectivoPaga] = useState("");

  // Pago con Tarjeta
  const [tarjetaNumero, setTarjetaNumero] = useState("");

  // Pago con Transferencia
  const [transferBanco, setTransferBanco] = useState("Nequi");
  const [transferReferencia, setTransferReferencia] = useState("");

  if (!isOpen) return null;

  const montoPagaNum = Number(efectivoPaga) || 0;
  const vueltoEfectivo = montoPagaNum >= total ? montoPagaNum - total : 0;

  const handleConfirm = (e) => {
    e.preventDefault();

    // Validaciones
    if (metodoPago === "tarjeta" && !tarjetaNumero.trim()) {
      alert("Por favor ingresa los datos de la tarjeta.");
      return;
    }
    if (metodoPago === "transferencia" && !transferReferencia.trim()) {
      alert("Por favor ingresa el número de referencia de la transferencia.");
      return;
    }

    const payload = {
      tipoEntrega: "Recoger",
      direccion: "Recoger en Local",
      clienteNombre: clienteNombre.trim() || "Cliente Mostrador",
      metodoPago:
        metodoPago === "tarjeta"
          ? "Tarjeta"
          : metodoPago === "transferencia"
          ? "Transferencia"
          : "Efectivo",
      datosPago: {
        efectivoConCuanto: efectivoPaga ? Number(efectivoPaga) : null,
        vueltoEfectivo: vueltoEfectivo > 0 ? vueltoEfectivo : null,
        tarjetaNumero: tarjetaNumero || null,
        transferBanco: metodoPago === "transferencia" ? transferBanco : null,
        transferReferencia: metodoPago === "transferencia" ? transferReferencia : null
      }
    };

    onConfirm(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-lg bg-white dark:bg-gray-900 rounded-[28px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-200">
        {/* Header con degradado Coral */}
        <div className="relative bg-gradient-to-r from-[#d84040] via-[#e05454] to-[#f05454] text-white p-5 sm:p-6 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">Finalizar Pedido</h2>
          <p className="text-xs text-red-100 mt-0.5 font-medium">
            Completa los datos de entrega y pago
          </p>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* 1. Tarjeta Resumen Financiero */}
          <div className="bg-[#f8fafc] dark:bg-gray-800/60 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Subtotal ({cart.reduce((a, b) => a + (b.cantidad || 1), 0)} items)</span>
              <span className="font-bold text-gray-800 dark:text-gray-200">
                ${Number(subtotal || 0).toLocaleString("es-CO")}
              </span>
            </div>

            {Number(descuento) > 0 && (
              <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400">
                <span>Descuento</span>
                <span className="font-bold">-${Number(descuento).toLocaleString("es-CO")}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="text-base font-black text-gray-900 dark:text-gray-100">Total</span>
              <span className="text-2xl font-black text-[#f05454] dark:text-red-400">
                ${Number(total || 0).toLocaleString("es-CO")}
              </span>
            </div>
          </div>

          {/* 2. Tipo de Entrega (Únicamente Recoger en Local) */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <Store className="w-4 h-4 text-[#f05454]" />
              <span>Tipo de Entrega</span>
            </h4>

            <div className="p-3.5 rounded-2xl border border-[#f05454] bg-[#FFF5F5] dark:bg-red-950/20 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/40 text-[#f05454]">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm text-[#f05454]">Recoger en Local</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    Pasas a recogerlo / Entrega en mostrador
                  </p>
                </div>
              </div>
              <span className="w-5 h-5 rounded-full border-2 border-[#f05454] flex items-center justify-center text-[#f05454] text-xs font-black">
                ✓
              </span>
            </div>
          </div>

          {/* 3. Datos de Entrega */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#f05454]" />
              <span>Datos de Entrega</span>
            </h4>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Nombre del destinatario
              </label>
              <input
                type="text"
                value={clienteNombre}
                onChange={(e) => setClienteNombre(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-[#f05454]/30 focus:border-[#f05454]"
                placeholder="Ej. María García / Cliente Mostrador"
              />
            </div>

            <div className="bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 rounded-xl p-3 flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                <span className="font-bold">Recoger en:</span> Chazin Food — Cra. 12 #45-67.
                Entrega física en mostrador.
              </p>
            </div>
          </div>

          {/* 4. Método de Pago */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#f05454]" />
              <span>Método de Pago</span>
            </h4>

            {/* Selector de Métodos (3 Columnas) */}
            <div className="grid grid-cols-3 gap-2.5">
              {/* Efectivo */}
              <button
                type="button"
                onClick={() => setMetodoPago("efectivo")}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                  metodoPago === "efectivo"
                    ? "border-[#f05454] bg-[#FFF5F5] dark:bg-red-950/20 text-[#f05454] shadow-xs"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50"
                }`}
              >
                <Banknote className="w-5 h-5 text-inherit" />
                <span className="text-xs font-bold text-inherit">Efectivo</span>
                {metodoPago === "efectivo" && (
                  <span className="w-4 h-4 rounded-full border border-[#f05454] flex items-center justify-center text-[#f05454] text-[10px] font-black">
                    ✓
                  </span>
                )}
              </button>

              {/* Tarjeta */}
              <button
                type="button"
                onClick={() => setMetodoPago("tarjeta")}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                  metodoPago === "tarjeta"
                    ? "border-[#f05454] bg-[#FFF5F5] dark:bg-red-950/20 text-[#f05454] shadow-xs"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50"
                }`}
              >
                <CreditCard className="w-5 h-5 text-inherit" />
                <span className="text-xs font-bold text-inherit">Tarjeta</span>
                {metodoPago === "tarjeta" && (
                  <span className="w-4 h-4 rounded-full border border-[#f05454] flex items-center justify-center text-[#f05454] text-[10px] font-black">
                    ✓
                  </span>
                )}
              </button>

              {/* Transferencia */}
              <button
                type="button"
                onClick={() => setMetodoPago("transferencia")}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                  metodoPago === "transferencia"
                    ? "border-[#f05454] bg-[#FFF5F5] dark:bg-red-950/20 text-[#f05454] shadow-xs"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50"
                }`}
              >
                <Smartphone className="w-5 h-5 text-inherit" />
                <span className="text-xs font-bold text-inherit">Transferencia</span>
                {metodoPago === "transferencia" && (
                  <span className="w-4 h-4 rounded-full border border-[#f05454] flex items-center justify-center text-[#f05454] text-[10px] font-black">
                    ✓
                  </span>
                )}
              </button>
            </div>

            {/* Sub-formulario Efectivo */}
            {metodoPago === "efectivo" && (
              <div className="bg-[#F0FDF4] dark:bg-emerald-950/20 border border-[#DCFCE7] dark:border-emerald-900/40 rounded-2xl p-3.5 space-y-2">
                <label className="block text-xs font-bold text-[#166534] dark:text-emerald-300">
                  ¿Con cuánto vas a pagar? <span className="font-normal text-gray-500">(opcional)</span>
                </label>
                <div className="relative flex items-center bg-white dark:bg-gray-800 border border-[#86EFAC] dark:border-emerald-700 rounded-xl px-3.5 py-2 shadow-2xs">
                  <Banknote className="w-4 h-4 text-[#16A34A] mr-2 shrink-0" />
                  <input
                    type="number"
                    min="0"
                    value={efectivoPaga}
                    onChange={(e) => setEfectivoPaga(e.target.value)}
                    placeholder="Ej: 50000"
                    className="w-full bg-transparent text-sm font-bold text-gray-900 dark:text-gray-100 outline-none"
                  />
                </div>
                {montoPagaNum >= total && (
                  <div className="flex items-center justify-between text-xs font-black text-[#16A34A] dark:text-emerald-400 bg-white/80 dark:bg-gray-800/80 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <span>💰 Cambio / Vueltos:</span>
                    <span>${vueltoEfectivo.toLocaleString("es-CO")}</span>
                  </div>
                )}
              </div>
            )}

            {/* Sub-formulario Tarjeta */}
            {metodoPago === "tarjeta" && (
              <div className="bg-[#F8FAFF] dark:bg-blue-950/20 border border-[#E0E7FF] dark:border-blue-900/40 rounded-2xl p-3.5 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#1E40AF] dark:text-blue-300 mb-1">
                    Número de tarjeta <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center bg-white dark:bg-gray-800 border border-[#C7D2FE] dark:border-blue-700 rounded-xl px-3.5 py-2 shadow-2xs">
                    <CreditCard className="w-4 h-4 text-[#3B82F6] mr-2 shrink-0" />
                    <input
                      type="text"
                      required
                      value={tarjetaNumero}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^\d]/g, "").slice(0, 16);
                        setTarjetaNumero(v.replace(/(\d{4})(?=\d)/g, "$1 "));
                      }}
                      placeholder="0000 0000 0000 0000"
                      className="w-full bg-transparent text-sm font-mono font-bold text-gray-900 dark:text-gray-100 outline-none tracking-widest"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E40AF] dark:text-blue-300 mb-1">
                    Monto a cargar (No editable)
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={`$ ${Number(total).toLocaleString("es-CO")}`}
                    className="w-full px-3.5 py-2 bg-gray-100 dark:bg-gray-800/80 border border-[#C7D2FE] dark:border-blue-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 outline-none cursor-not-allowed"
                  />
                </div>
              </div>
            )}

            {/* Sub-formulario Transferencia */}
            {metodoPago === "transferencia" && (
              <div className="bg-[#F8FAFF] dark:bg-blue-950/20 border border-[#E0E7FF] dark:border-blue-900/40 rounded-2xl p-3.5 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#1E40AF] dark:text-blue-300 mb-1">
                    Entidad / Banco origen
                  </label>
                  <select
                    value={transferBanco}
                    onChange={(e) => setTransferBanco(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white dark:bg-gray-800 border border-[#C7D2FE] dark:border-blue-700 rounded-xl text-sm font-bold text-gray-900 dark:text-gray-100 outline-none cursor-pointer"
                  >
                    <optgroup label="Billeteras digitales">
                      <option value="Nequi">Nequi</option>
                      <option value="Daviplata">Daviplata</option>
                    </optgroup>
                    <optgroup label="Bancos">
                      <option value="Bancolombia">Bancolombia</option>
                      <option value="Davivienda">Davivienda</option>
                      <option value="BBVA">BBVA</option>
                      <option value="Banco de Bogotá">Banco de Bogotá</option>
                      <option value="Banco Caja Social">Banco Caja Social</option>
                      <option value="Scotiabank Colpatria">Scotiabank Colpatria</option>
                      <option value="Otro">Otro</option>
                    </optgroup>
                  </select>
                </div>

                <div className="bg-blue-100/70 dark:bg-blue-900/30 p-2.5 rounded-xl text-xs text-[#1E40AF] dark:text-blue-300 font-medium leading-relaxed">
                  Transfiere a <span className="font-bold">Bancolombia Ahorros 123-456789-00</span> o{" "}
                  <span className="font-bold">Nequi 312-345-6789</span> a nombre de{" "}
                  <span className="font-bold">Chazin Food</span>.
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E40AF] dark:text-blue-300 mb-1">
                    Número de referencia / Comprobante <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={transferReferencia}
                    onChange={(e) => setTransferReferencia(e.target.value)}
                    placeholder="Ej: 987654321"
                    className="w-full px-3.5 py-2 bg-white dark:bg-gray-800 border border-[#C7D2FE] dark:border-blue-700 rounded-xl text-sm font-mono font-bold text-gray-900 dark:text-gray-100 outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 5. Productos y Observaciones del Carrito */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#f05454]" />
              <span>Resumen de Productos ({cart.length})</span>
            </h4>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {cart.map((item, idx) => {
                const itemAddsTotal = (item.adiciones || []).reduce(
                  (s, a) => s + (Number(a.precio) || 0),
                  0
                );
                const itemLineTotal =
                  ((Number(item.precio) || 0) + itemAddsTotal) * (item.cantidad || 1);

                return (
                  <div
                    key={`${item.productoId}-${idx}`}
                    className="p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-[#fbfcfd] dark:bg-gray-800/40 text-xs flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between font-bold text-gray-900 dark:text-gray-100">
                      <span className="truncate">
                        {item.cantidad}x {item.nombre}
                      </span>
                      <span className="shrink-0 text-gray-800 dark:text-gray-200 font-black">
                        ${itemLineTotal.toLocaleString("es-CO")}
                      </span>
                    </div>

                    {(item.adiciones || []).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {item.adiciones.map((adc, aIdx) => (
                          <span
                            key={aIdx}
                            className="bg-red-50 dark:bg-red-950/40 text-[#f05454] dark:text-red-300 border border-red-100 dark:border-red-900/50 px-2 py-0.5 rounded-md text-[10px] font-semibold"
                          >
                            +{adc.nombre} (${Number(adc.precio).toLocaleString("es-CO")})
                          </span>
                        ))}
                      </div>
                    )}

                    {item.observacion && (
                      <div className="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 px-2.5 py-1 rounded-lg mt-1 font-medium">
                        <span className="font-bold">Observación:</span> {item.observacion}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
              Total a pagar:
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#f05454] dark:text-red-400">
              ${Number(total || 0).toLocaleString("es-CO")}
            </span>
          </div>

          <p className="text-[11px] text-gray-400 dark:text-gray-400 flex items-center justify-center gap-1">
            <Info className="w-3.5 h-3.5" />
            <span>Precio sin IVA aplicado</span>
          </p>

          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 px-4 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-bold transition cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#e04545] hover:bg-[#d03535] text-white text-xs sm:text-sm font-black shadow-[0_8px_20px_rgba(224,69,69,0.35)] transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? "Procesando..." : "Confirmar Pedido"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PosCheckoutModal;
