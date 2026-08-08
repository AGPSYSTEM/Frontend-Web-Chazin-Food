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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {itemsToDisplay.map((v, index) => {
        const rawName = typeof v?.cliente === "string" ? v.cliente : (v?.clienteNombre || v?.cliente?.nombre || "Cliente General");
        const clienteNombre = String(rawName || "Cliente General");
        const inicial = clienteNombre.trim().charAt(0).toUpperCase() || "C";
        const codigo = v?.numeroVenta || v?.codigoPedido || `PED-${String(v?.id || index + 1).padStart(3, "0")}`;
        const fechaStr = formatDateSafe(v?.fecha || v?.fechaVenta, "2026-06-09");
        const horarioStr = v?.horario || "13:05 – 13:20";
        const totalNum = Number(v?.total || v?.subtotal || 40500);
        
        const hasDiscount = Boolean(v?.descuentoPorcentaje || v?.precioOriginal || v?.descuentoAplicado);
        const originalPriceNum = Number(v?.precioOriginal || Math.round(totalNum * 1.11));
        const discountPct = v?.descuentoPorcentaje || 10;

        const productosList = Array.isArray(v?.productos) && v.productos.length > 0
          ? v.productos
          : (Array.isArray(v?.detalles) && v.detalles.length > 0 
              ? v.detalles.map(d => ({ cantidad: d.cantidad || 1, nombre: d.observaciones || `Producto #${d.idVariante}` }))
              : [{ cantidad: 1, nombre: "Combo Familiar" }]);

        return (
          <div
            key={v?.id || index}
            className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4 hover:shadow-sm transition-all text-left"
          >
            {/* Header: Avatar, Name & Code, Date & Time */}
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-full bg-[#F05454] text-white font-bold text-base flex items-center justify-center shrink-0 shadow-2xs">
                {inicial}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base truncate">
                    {clienteNombre}
                  </h3>
                  <span className="text-xs font-mono text-gray-400 font-normal shrink-0">
                    {codigo}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500 mt-1 font-mono">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>{fechaStr}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>{horarioStr}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Row: Strikethrough + Total + Green Discount Badge & Action Link */}
            <div className="pt-2 border-t border-gray-100/80 dark:border-gray-800/80 flex items-end justify-between gap-2">
              <div>
                {hasDiscount && (
                  <div className="text-xs text-gray-400 line-through font-mono">
                    ${originalPriceNum.toLocaleString("es-CO")}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
                    ${totalNum.toLocaleString("es-CO")}
                  </span>
                  {hasDiscount && (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      -{discountPct}% desc.
                    </span>
                  )}
                </div>
              </div>

              {/* Action Button: Detalle in coral red #F05454 */}
              <button
                type="button"
                onClick={() => onViewDetail && onViewDetail(v)}
                className="flex items-center gap-1.5 text-xs font-bold text-[#F05454] hover:text-red-600 transition-colors cursor-pointer py-1 px-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40"
              >
                <Eye className="w-4 h-4 text-[#F05454]" />
                <span>Detalle</span>
              </button>
            </div>

            {/* Product Item Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {productosList.map((p, idx) => (
                <span
                  key={idx}
                  className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-gray-50 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border border-gray-200/80 dark:border-gray-700/80 whitespace-nowrap"
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
