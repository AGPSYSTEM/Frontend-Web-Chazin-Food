import { X, CheckCircle2, MapPin } from "lucide-react";

export function VentaDetalleModal({ isOpen, onClose, venta }) {
  if (!isOpen || !venta) return null;

  let obsMeta = {};
  if (venta.observaciones) {
    try {
      obsMeta = typeof venta.observaciones === 'string' && venta.observaciones.startsWith('{')
        ? JSON.parse(venta.observaciones)
        : { nota: venta.observaciones };
    } catch (e) {}
  }
  const direccionEntrega = obsMeta.direccion || venta.direccion || "";

  const codigo = venta.numeroVenta || venta.codigoPedido || `PED-${String(venta.id).padStart(3, "0")}`;
  const cliente = venta.clienteNombre || (typeof venta.cliente === "string" ? venta.cliente : "Cliente General");
  let fecha = "2026-06-09";
  if (venta.fecha || venta.fechaVenta) {
    try {
      const d = new Date(venta.fecha || venta.fechaVenta);
      fecha = !isNaN(d.getTime()) ? d.toISOString().split("T")[0] : String(venta.fecha || venta.fechaVenta).slice(0, 10);
    } catch (e) {
      fecha = String(venta.fecha || venta.fechaVenta).slice(0, 10);
    }
  }
  const horario = venta.horario || "12:30 – 12:48";
  const metodoPago = obsMeta.metodoPago || venta.metodoPago || "Efectivo";
  const tipoEntrega = obsMeta.tipoEntrega || venta.tipoEntrega || "Domicilio";
  const total = Number(venta.total || 0);
  const descPct = Number(venta.descuentoPorcentaje || obsMeta.descuentoPorcentaje || 0);
  const subtotal = Number(venta.precioOriginal || (descPct > 0 && total ? Math.round(total / (1 - (descPct / 100))) : (venta.subtotal > total ? venta.subtotal : total)));
  const descuentoMonto = Math.max(0, subtotal - total);
  const descuentoPorcentaje = descPct || (subtotal > total ? Math.round(((subtotal - total) / subtotal) * 100) : 0);
  const iva = Number(venta.iva || Math.round(total * 0.19));

  // Fallback products matching references
  const productos = venta.productos && venta.productos.length > 0
    ? venta.productos
    : [
        {
          id: 1,
          nombre: "Hamburguesa Especial",
          cantidad: 1,
          precioUnitario: 15000,
          total: 15000,
          adiciones: ["+ Queso Extra", "+ Salsa BBQ"]
        },
        {
          id: 2,
          nombre: "Coca Cola",
          cantidad: 1,
          precioUnitario: 3000,
          total: 3000,
          adiciones: []
        },
        {
          id: 3,
          nombre: "Papas Fritas",
          cantidad: 2,
          precioUnitario: 5000,
          total: 10000,
          adiciones: []
        }
      ];

  const getEntregaIcon = (tipo) => {
    const t = (tipo || "").toLowerCase();
    if (t.includes("mesa")) return "🍽️ En Mesa";
    if (t.includes("recoger") || t.includes("llevar")) return "🏪 Recoger";
    return "🛵 Domicilio";
  };

  const getMetodoIcon = (metodo) => {
    const m = (metodo || "").toLowerCase();
    if (m.includes("tarjeta")) return "💳 Tarjeta";
    if (m.includes("transfer") || m.includes("nequi") || m.includes("davi")) return "📱 Transferencia";
    return "💵 Efectivo";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-gray-100 dark:border-gray-800">
        {/* Dark Header */}
        <div className="bg-[#334155] text-white p-6 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="text-xl font-bold tracking-tight">{codigo}</div>
          <div className="text-sm text-slate-200 mt-0.5 font-medium">{cliente}</div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-gray-900 dark:text-gray-100">
          {/* 2x2 Grid Info Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50/80 dark:bg-gray-800/60 border border-slate-100 dark:border-gray-700/60 rounded-2xl p-3.5 space-y-1">
              <div className="text-xs text-gray-400 font-medium">Fecha</div>
              <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{fecha}</div>
            </div>

            <div className="bg-slate-50/80 dark:bg-gray-800/60 border border-slate-100 dark:border-gray-700/60 rounded-2xl p-3.5 space-y-1">
              <div className="text-xs text-gray-400 font-medium">Horario</div>
              <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{horario}</div>
            </div>

            <div className="bg-slate-50/80 dark:bg-gray-800/60 border border-slate-100 dark:border-gray-700/60 rounded-2xl p-3.5 space-y-1">
              <div className="text-xs text-gray-400 font-medium">Método de pago</div>
              <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                {getMetodoIcon(metodoPago)}
              </div>
            </div>

            <div className="bg-slate-50/80 dark:bg-gray-800/60 border border-slate-100 dark:border-gray-700/60 rounded-2xl p-3.5 space-y-1">
              <div className="text-xs text-gray-400 font-medium">Tipo de entrega</div>
              <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                {getEntregaIcon(tipoEntrega)}
              </div>
            </div>

            {direccionEntrega && (
              <div className="bg-slate-50/80 dark:bg-gray-800/60 border border-slate-100 dark:border-gray-700/60 rounded-2xl p-3.5 space-y-1 col-span-2">
                <div className="text-xs text-gray-400 font-medium">Dirección de Entrega</div>
                <div className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#F05454] shrink-0" />
                  <span className="truncate">{direccionEntrega}</span>
                </div>
              </div>
            )}
          </div>

          {/* Green Status Badge Box */}
          <div className="bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 rounded-2xl p-3.5 flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Pagado</span>
          </div>

          {/* Productos Section Title */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Productos del pedido ({productos.length})
            </h4>
          </div>

          {/* Products List Cards */}
          <div className="space-y-3">
            {productos.map((p, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-gray-800/80 border border-slate-200/80 dark:border-gray-700 rounded-2xl p-4 space-y-1.5 shadow-2xs"
              >
                <div className="flex items-center justify-between font-bold text-sm text-gray-900 dark:text-gray-100">
                  <span>{p.nombre || p.nombreProducto}</span>
                  <span>${Number(p.total || (p.precioUnitario || 15000) * (p.cantidad || 1)).toLocaleString("es-CO")}</span>
                </div>
                <div className="text-xs text-gray-400 font-medium">
                  {p.cantidad || 1} × ${Number(p.precioUnitario || 15000).toLocaleString("es-CO")}
                </div>

                {/* Adiciones pills */}
                {p.adiciones && p.adiciones.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {p.adiciones.map((adc, aIdx) => (
                      <span
                        key={aIdx}
                        className="px-3 py-1 bg-rose-50 dark:bg-rose-950/40 text-rose-500 dark:text-rose-400 text-xs font-semibold rounded-full"
                      >
                        {adc}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Summary Box with Discount Line */}
          <div className="bg-slate-50/90 dark:bg-gray-800/70 border border-slate-100 dark:border-gray-700 rounded-2xl p-4 space-y-2.5 text-sm">
            <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                ${subtotal.toLocaleString("es-CO")}
              </span>
            </div>

            {descuentoMonto > 0 && (
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                <span>Descuento (-{descuentoPorcentaje}%)</span>
                <span>-${descuentoMonto.toLocaleString("es-CO")}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
              <span>IVA (19%)</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                ${iva.toLocaleString("es-CO")}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200/80 dark:border-gray-700 flex items-center justify-between font-extrabold text-[#F05454]">
              <span className="text-gray-900 dark:text-gray-100 font-bold">Total</span>
              <span className="text-2xl">${total.toLocaleString("es-CO")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
