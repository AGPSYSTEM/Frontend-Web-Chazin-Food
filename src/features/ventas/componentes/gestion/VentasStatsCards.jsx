import { TrendingUp, Users, ShoppingBag } from "lucide-react";

export function VentasStatsCards({ ventas = [] }) {
  const totalVentasSum = ventas.reduce((acc, v) => acc + Number(v.total || 0), 0);
  const totalVentasStr = `$${totalVentasSum.toLocaleString("es-CO")}`;

  const pedidosCount = ventas.length;

  const ticketPromedioVal = totalVentasSum > 0 && pedidosCount > 0 
    ? Math.round(totalVentasSum / pedidosCount) 
    : 0;
  const ticketPromedioStr = `$${ticketPromedioVal.toLocaleString("es-CO")}`;

  const descOtorgadosSum = ventas.reduce((acc, v) => acc + Number(v.descuentoAplicado || 0), 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* 1. Total Ventas */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-xs flex flex-col justify-between space-y-4">
        <div className="w-11 h-11 rounded-2xl bg-emerald-100/70 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <span className="font-bold text-xl leading-none font-sans">$</span>
        </div>
        <div>
          <span className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 block tracking-tight">
            {totalVentasStr}
          </span>
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-1 block">
            Total Ventas
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium block mt-0.5">
            ingresos brutos
          </span>
        </div>
      </div>

      {/* 2. Ticket Promedio */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-xs flex flex-col justify-between space-y-4">
        <div className="w-11 h-11 rounded-2xl bg-emerald-100/70 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <TrendingUp className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div>
          <span className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 block tracking-tight">
            {ticketPromedioStr}
          </span>
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-1 block">
            Ticket Promedio
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium block mt-0.5">
            valor medio por pedido
          </span>
        </div>
      </div>

      {/* 3. Frecuencia de Compra */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-xs flex flex-col justify-between space-y-4">
        <div className="w-11 h-11 rounded-2xl bg-blue-100/70 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <Users className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div>
          <span className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 block tracking-tight">
            {pedidosCount > 0 ? `${(pedidosCount / Math.max(1, new Set(ventas.map(v => v.idCliente || v.clienteNombre)).size)).toFixed(1)} ped/cli` : "1.0 ped/cli"}
          </span>
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-1 block">
            Frecuencia de Compra
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium block mt-0.5">
            pedidos por cliente
          </span>
        </div>
      </div>

      {/* 4. Tasa de Descuento */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-xs flex flex-col justify-between space-y-4">
        <div className="w-11 h-11 rounded-2xl bg-amber-100/70 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
          <ShoppingBag className="w-5 h-5 stroke-[2]" />
        </div>
        <div>
          <span className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 block tracking-tight">
            {totalVentasSum > 0 ? `${((descOtorgadosSum / totalVentasSum) * 100).toFixed(1)}%` : "0%"}
          </span>
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-1 block">
            Tasa de Descuento
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium block mt-0.5">
            ${descOtorgadosSum.toLocaleString("es-CO")} en desc.
          </span>
        </div>
      </div>
    </div>
  );
}
