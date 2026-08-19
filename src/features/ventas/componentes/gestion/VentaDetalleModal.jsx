import React from "react";
import {
  X,
  CheckCircle2,
  MapPin,
  FileText,
  CreditCard,
  Banknote,
  Smartphone,
  Store,
  Clock,
  Calendar,
  Sparkles,
  ShoppingBag
} from "lucide-react";

export function VentaDetalleModal({ isOpen, onClose, venta }) {
  if (!isOpen || !venta) return null;

  let obsMeta = {};
  if (venta.observaciones) {
    try {
      obsMeta =
        typeof venta.observaciones === "string" && venta.observaciones.startsWith("{")
          ? JSON.parse(venta.observaciones)
          : { nota: venta.observaciones };
    } catch (e) {
      obsMeta = { nota: venta.observaciones };
    }
  }

  const direccionEntrega = obsMeta.direccion || venta.direccion || "";
  const codigo =
    venta.numeroVenta ||
    venta.codigoPedido ||
    obsMeta.codigoPedido ||
    `VEN-${String(venta.id || venta.idVenta || "").padStart(4, "0")}`;

  const cliente =
    venta.clienteNombre ||
    obsMeta.clienteNombre ||
    (typeof venta.cliente === "string" ? venta.cliente : "Cliente Mostrador");

  let fecha = "2026-08-18";
  if (venta.fecha || venta.fechaVenta) {
    try {
      const d = new Date(venta.fecha || venta.fechaVenta);
      fecha = !isNaN(d.getTime())
        ? d.toISOString().split("T")[0]
        : String(venta.fecha || venta.fechaVenta).slice(0, 10);
    } catch (e) {
      fecha = String(venta.fecha || venta.fechaVenta).slice(0, 10);
    }
  }

  const horario = venta.horario || obsMeta.horario || "12:30 – 12:48";
  const metodoPago = obsMeta.metodoPago || venta.metodoPago || "Efectivo";
  const tipoEntrega = obsMeta.tipoEntrega || venta.tipoEntrega || "Recoger";
  const total = Number(venta.total || 0);
  const descPct = Number(venta.descuentoPorcentaje || obsMeta.descuentoPorcentaje || 0);
  const subtotal = Number(
    venta.subtotal ||
      venta.precioOriginal ||
      (descPct > 0 && total
        ? Math.round(total / (1 - descPct / 100))
        : venta.subtotal > total
        ? venta.subtotal
        : total)
  );
  const descuentoMonto = Math.max(0, subtotal - total);
  const descuentoPorcentaje =
    descPct || (subtotal > total ? Math.round(((subtotal - total) / subtotal) * 100) : 0);
  const iva = Number(venta.iva || Math.round(total * 0.19));

  const productos =
    Array.isArray(venta.productos) && venta.productos.length > 0
      ? venta.productos
      : Array.isArray(obsMeta.productos) && obsMeta.productos.length > 0
      ? obsMeta.productos
      : [];

  const getEntregaBadge = (tipo) => {
    const t = (tipo || "").toLowerCase();
    if (t.includes("mesa")) return { icon: "🍽️", label: "En Mesa" };
    if (t.includes("recoger") || t.includes("llevar") || t.includes("local"))
      return { icon: "🏪", label: "Recoger en Local" };
    return { icon: "🛵", label: "Domicilio" };
  };

  const entregaInfo = getEntregaBadge(tipoEntrega);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative bg-white dark:bg-gray-900 rounded-[28px] max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh] border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-200">
        {/* Header con degradado Coral */}
        <div className="bg-gradient-to-r from-[#d84040] via-[#e05454] to-[#f05454] text-white p-5 sm:p-6 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="bg-white/20 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Detalle del Pedido
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black tracking-tight mt-1">{codigo}</div>
          <div className="text-xs sm:text-sm text-red-100 font-medium">{cliente}</div>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-gray-900 dark:text-gray-100">
          {/* 2x2 Grid Info Cards */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-[#f8fafc] dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 rounded-2xl p-3 space-y-0.5 shadow-2xs">
              <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span>Fecha</span>
              </div>
              <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{fecha}</div>
            </div>

            <div className="bg-[#f8fafc] dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 rounded-2xl p-3 space-y-0.5 shadow-2xs">
              <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span>Horario</span>
              </div>
              <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{horario}</div>
            </div>

            <div className="bg-[#f8fafc] dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 rounded-2xl p-3 space-y-0.5 shadow-2xs">
              <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                <span>Método de pago</span>
              </div>
              <div className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                <span>
                  {metodoPago.toLowerCase().includes("tarjeta")
                    ? "💳 Tarjeta"
                    : metodoPago.toLowerCase().includes("trans") ||
                      metodoPago.toLowerCase().includes("nequi") ||
                      metodoPago.toLowerCase().includes("davi")
                    ? "📱 Transferencia"
                    : "💵 Efectivo"}
                </span>
              </div>
            </div>

            <div className="bg-[#f8fafc] dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 rounded-2xl p-3 space-y-0.5 shadow-2xs">
              <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Store className="w-3.5 h-3.5 text-gray-400" />
                <span>Entrega</span>
              </div>
              <div className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1">
                <span>{entregaInfo.icon}</span>
                <span>{entregaInfo.label}</span>
              </div>
            </div>

            {/* Detalles adicionales de Pago si existen */}
            {(obsMeta.efectivoConCuanto ||
              obsMeta.transferenciaReferencia ||
              obsMeta.transferBanco ||
              obsMeta.tarjetaNumero) && (
              <div className="bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 rounded-2xl p-3 col-span-2 text-xs space-y-1 text-blue-900 dark:text-blue-200">
                <div className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  <span>Detalles de Transacción</span>
                </div>
                {obsMeta.efectivoConCuanto && (
                  <div className="flex justify-between">
                    <span>Pagó con efectivo:</span>
                    <span className="font-black">
                      ${Number(obsMeta.efectivoConCuanto).toLocaleString("es-CO")}
                    </span>
                  </div>
                )}
                {obsMeta.vueltoEfectivo > 0 && (
                  <div className="flex justify-between text-emerald-700 dark:text-emerald-300 font-bold">
                    <span>Cambio / Vueltos:</span>
                    <span>${Number(obsMeta.vueltoEfectivo).toLocaleString("es-CO")}</span>
                  </div>
                )}
                {obsMeta.transferBanco && (
                  <div className="flex justify-between">
                    <span>Banco / Billetera:</span>
                    <span className="font-bold">{obsMeta.transferBanco}</span>
                  </div>
                )}
                {obsMeta.transferenciaReferencia && (
                  <div className="flex justify-between">
                    <span>Referencia / Comprobante:</span>
                    <span className="font-mono font-bold">
                      {obsMeta.transferenciaReferencia}
                    </span>
                  </div>
                )}
                {obsMeta.tarjetaNumero && (
                  <div className="flex justify-between">
                    <span>Tarjeta:</span>
                    <span className="font-mono font-bold">{obsMeta.tarjetaNumero}</span>
                  </div>
                )}
              </div>
            )}

            {/* Dirección de Entrega */}
            {direccionEntrega && (
              <div className="bg-[#f8fafc] dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 rounded-2xl p-3 space-y-0.5 col-span-2 shadow-2xs">
                <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#F05454]" />
                  <span>Dirección / Punto de Entrega</span>
                </div>
                <div className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                  {direccionEntrega}
                </div>
              </div>
            )}
          </div>

          {/* Green Status Badge */}
          <div className="bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-3 flex items-center justify-between text-emerald-700 dark:text-emerald-300 font-bold text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Estado de Pago: Pagado</span>
            </div>
            <span className="bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-[11px] font-black px-2.5 py-0.5 rounded-full">
              {venta.estado || "Completada"}
            </span>
          </div>

          {/* Productos Section Title */}
          <div>
            <h4 className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#f05454]" />
              <span>Productos del Pedido ({productos.length})</span>
            </h4>
          </div>

          {/* Products List Cards */}
          <div className="space-y-2.5">
            {productos.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No hay productos registrados</p>
            ) : (
              productos.map((p, idx) => {
                const itemAdiciones = Array.isArray(p.adiciones) ? p.adiciones : [];
                const itemObs = p.observaciones || p.observacion || p.especificaciones || p.nota || "";

                return (
                  <div
                    key={idx}
                    className="bg-[#fbfcfd] dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/80 rounded-2xl p-3.5 space-y-2 shadow-2xs"
                  >
                    {/* Header del producto */}
                    <div className="flex items-center justify-between font-bold text-sm text-gray-900 dark:text-gray-100">
                      <span className="truncate">
                        <span className="text-[#f05454] font-black mr-1">{p.cantidad || 1}x</span>
                        {p.nombre || p.nombreProducto || "Producto"}
                      </span>
                      <span className="shrink-0 font-black text-gray-900 dark:text-gray-100">
                        ${Number(
                          p.total || (Number(p.precioUnitario || 0) * Number(p.cantidad || 1))
                        ).toLocaleString("es-CO")}
                      </span>
                    </div>

                    <div className="text-xs text-gray-400 font-medium">
                      Precio base: ${Number(p.precioUnitario || 0).toLocaleString("es-CO")} c/u
                    </div>

                    {/* Adiciones con cantidad y precio */}
                    {itemAdiciones.length > 0 && (
                      <div className="space-y-1 pt-1 border-t border-gray-100 dark:border-gray-700/60">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                          Adiciones ({itemAdiciones.length}):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {itemAdiciones.map((adc, aIdx) => {
                            const adcName = typeof adc === "object" ? adc.nombre : String(adc);
                            const adcPrice =
                              typeof adc === "object" && Number(adc.precio) > 0
                                ? Number(adc.precio) * Number(adc.cantidad || 1)
                                : 0;
                            const adcQty = typeof adc === "object" && Number(adc.cantidad) > 1 ? `x${adc.cantidad} ` : "";

                            return (
                              <span
                                key={aIdx}
                                className="px-2.5 py-1 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-[#f05454] dark:text-red-300 text-xs font-bold rounded-lg flex items-center gap-1 shadow-2xs"
                              >
                                <span>+ {adcQty}{adcName}</span>
                                {adcPrice > 0 && (
                                  <span className="font-extrabold opacity-95">
                                    (+${adcPrice.toLocaleString("es-CO")})
                                  </span>
                                )}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Observación / Nota del Producto */}
                    {itemObs && (
                      <div className="text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 px-3 py-1.5 rounded-xl font-medium flex items-start gap-1.5 mt-1.5">
                        <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Observación: </span>
                          <span className="italic">{itemObs}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Financial Summary Box */}
          <div className="bg-[#f8fafc] dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 space-y-2 text-xs sm:text-sm">
            <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
              <span>Subtotal</span>
              <span className="font-bold text-gray-900 dark:text-gray-100">
                ${subtotal.toLocaleString("es-CO")}
              </span>
            </div>

            {descuentoMonto > 0 && (
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                <span>Descuento (-{descuentoPorcentaje}%)</span>
                <span>-${descuentoMonto.toLocaleString("es-CO")}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
              <span>IVA (19% incluido)</span>
              <span className="font-bold text-gray-900 dark:text-gray-100">
                ${iva.toLocaleString("es-CO")}
              </span>
            </div>

            <div className="pt-2.5 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <span className="text-base font-black text-gray-900 dark:text-gray-100">
                Total Pagado
              </span>
              <span className="text-2xl font-black text-[#F05454] dark:text-red-400">
                ${total.toLocaleString("es-CO")}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold text-xs sm:text-sm transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default VentaDetalleModal;
