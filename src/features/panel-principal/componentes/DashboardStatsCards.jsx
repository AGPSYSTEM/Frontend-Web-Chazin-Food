import { DollarSign, ShoppingCart, AlertCircle, Users, Layers } from "lucide-react";

export function DashboardStatsCards({ stats = {} }) {
  const cards = [
    {
      title: "Total Ventas (COP)",
      value: `$${Number(stats.totalVentasGlobal || stats.ventasTotal || 0).toLocaleString("es-CO")} COP`,
      change: "ingresos acumulados",
      isPositive: true,
      icon: Layers,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40"
    },
    {
      title: "Ventas del Mes (COP)",
      value: `$${Number(stats.ventasTotal || 0).toLocaleString("es-CO")} COP`,
      change: stats.ventasVariacion !== undefined ? `${stats.ventasVariacion >= 0 ? '+' : ''}${stats.ventasVariacion}% vs mes anterior` : "+0% vs mes anterior",
      isPositive: (stats.ventasVariacion || 0) >= 0,
      icon: DollarSign,
      color: "text-green-600 bg-green-50 dark:bg-green-900/30"
    },
    {
      title: "Total Pedidos",
      value: Number(stats.pedidosTotal || 0).toLocaleString("es-CO"),
      change: stats.frecuenciaVentas !== undefined ? `${stats.frecuenciaVentas} ped/día` : "+8.2% este mes",
      isPositive: true,
      icon: ShoppingCart,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-900/30"
    },
    {
      title: "Clientes Activos",
      value: Number(stats.clientesActivos || stats.clientesTotal || 0).toLocaleString("es-CO"),
      change: stats.clientesVariacion !== undefined ? `${stats.clientesVariacion >= 0 ? '+' : ''}${stats.clientesVariacion}% vs mes anterior` : "+0% este mes",
      isPositive: true,
      icon: Users,
      color: "text-purple-600 bg-purple-50 dark:bg-purple-900/30"
    },
    {
      title: "Stock Crítico",
      value: stats.insumosBajoStock ?? 0,
      change: (stats.insumosBajoStock ?? 0) > 0 ? "Insumos bajo mínimo" : "Inventario óptimo",
      isPositive: (stats.insumosBajoStock ?? 0) === 0,
      icon: AlertCircle,
      color: (stats.insumosBajoStock ?? 0) > 0 ? "text-red-600 bg-red-50 dark:bg-red-900/30" : "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">
                  {card.title}
                </span>
                <h3
                  title={card.value}
                  className="text-lg xl:text-xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight leading-snug break-words"
                >
                  {card.value}
                </h3>
              </div>
              <div className={`p-3 rounded-2xl ${card.color} shrink-0`}>
                <Icon className="w-5 h-5 stroke-[2.2]" />
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-gray-50 dark:border-gray-800/60 flex items-center justify-between">
              <p
                className={`text-xs font-semibold ${
                  card.isPositive
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {card.change}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
