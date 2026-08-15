import { Calendar, Clock, Eye } from "lucide-react";

function formatDateSafe(dateVal, fallback = "2026-06-09") {
  if (!dateVal) return fallback;
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal).slice(0, 10) || fallback;
    return d.toISOString().split("T")[0];
  } catch (e) {
    return String(dateVal).slice(0, 10) || fallback;
  }
}

export function VentasHistorialCardsView({ ventas = [], onViewDetail }) {
  // Sample data fallback if list is empty
  const itemsToDisplay = Array.isArray(ventas) && ventas.length > 0 ? ventas : [
    {
      id: 1,
      clienteNombre: "María López",
      codigoPedido: "PED-002",
      fecha: "2026-06-09",
      horario: "13:05 – 13:20",
      precioOriginal: 45000,
      total: 40500,
      descuentoPorcentaje: 10,
      productos: [{ cantidad: 1, nombre: "Combo Familiar" }]
    },
    {
      id: 2,
      clienteNombre: "Juan Garcia",
      codigoPedido: "PED-001",
      fecha: "2026-06-09",
      horario: "12:30 – 12:45",
      total: 28000,
      productos: [
        { cantidad: 1, nombre: "Hamburguesa Especial" },
        { cantidad: 1, nombre: "Coca Cola" },
        { cantidad: 2, nombre: "Papas Fritas" }
      ]
    },
    {
      id: 3,
      clienteNombre: "Luis Rodríguez",
      codigoPedido: "PED-005",
      fecha: "2026-06-08",
      horario: "14:15 – 14:30",
      total: 36000,
      productos: [
        { cantidad: 2, nombre: "Hamburguesa Especial" },
        { cantidad: 1, nombre: "Jugo de Naranja" }
      ]
    },
    {
      id: 4,
      clienteNombre: "Ana Martínez",
      codigoPedido: "PED-004",
      fecha: "2026-06-08",
      horario: "11:20 – 11:35",
      precioOriginal: 54000,
      total: 45900,
      descuentoPorcentaje: 15,
      productos: [
        { cantidad: 1, nombre: "Combo Familiar" },
        { cantidad: 1, nombre: "Arepa con Queso" }
      ]
    }
  ];

  return (
    <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
      {itemsToDisplay.map((v, index) => {
        const rawName = typeof v?.cliente === "string" ? v.cliente : (v?.clienteNombre || v?.cliente?.nombre || "Cliente General");
        const clienteNombre = String(rawName || "Cliente General");
        const inicial = clienteNombre.trim().charAt(0).toUpperCase() || "C";
        const codigo = v?.numeroVenta || v?.codigoPedido || `PED-${String(v?.id || index + 1).padStart(3, "0")}`;
        const fechaStr = formatDateSafe(v?.fecha || v?.fechaVenta, "2026-06-09");
        const horarioStr = v?.horario || "13:05 – 13:20";
        const totalNum = Number(v?.total || v?.subtotal || 40500);
        
        const descPct = Number(v?.descuentoPorcentaje || 0);
        const descMonto = Number(v?.descuentoAplicado || v?.montoDescuento || 0);
        const hasDiscount = descPct > 0 || descMonto > 0;
        const originalPriceNum = Number(v?.precioOriginal && v.precioOriginal > totalNum ? v.precioOriginal : (descPct > 0 ? Math.round(totalNum / (1 - descPct / 100)) : totalNum));
        const discountPct = descPct;

        const productosList = Array.isArray(v?.productos) && v.productos.length > 0
          ? v.productos
          : (Array.isArray(v?.detalles) && v.detalles.length > 0 
              ? v.detalles.map(d => ({ cantidad: d.cantidad || 1, nombre: d.observaciones || `Producto #${d.idVariante}` }))
              : [{ cantidad: 1, nombre: "Combo Familiar" }]);

        return (
          <div
            key={v?.id || index}
            className="py-5 px-2 space-y-3 text-left"
          >
            {/* Row: Avatar + Info left, Price + Detalle right */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[#F05454] text-white font-bold text-sm flex items-center justify-center shrink-0">
                  {inicial}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm truncate">
                      {clienteNombre}
                    </h3>
                    <span className="text-xs font-mono text-gray-400">
                      {codigo}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500 mt-0.5 font-mono">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{fechaStr}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{horarioStr}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price + Detalle */}
              <div className="text-right shrink-0 flex flex-col items-end gap-1">
                {hasDiscount && (
                  <span className="text-xs text-gray-400 line-through font-mono">
                    ${originalPriceNum.toLocaleString("es-CO")}
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold text-gray-900 dark:text-gray-100">
                    ${totalNum.toLocaleString("es-CO")}
                  </span>
                  {hasDiscount && (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      -{discountPct}% desc.
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onViewDetail && onViewDetail(v)}
                  className="flex items-center gap-1 text-xs font-bold text-[#F05454] hover:text-red-600 transition-colors cursor-pointer mt-0.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Detalle</span>
                </button>
              </div>
            </div>

            {/* Product Item Pills */}
            <div className="flex flex-wrap items-center gap-2 pl-13">
              {productosList.map((p, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-gray-50 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 border border-gray-200/80 dark:border-gray-700/80 whitespace-nowrap"
                >
                  {p.cantidad || 1}x {p.nombre || p.nombreProducto || "Producto"}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
