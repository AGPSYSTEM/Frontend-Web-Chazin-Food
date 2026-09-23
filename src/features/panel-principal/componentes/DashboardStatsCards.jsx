import { DollarSign, ShoppingCart, AlertCircle, Users } from "lucide-react";

export function DashboardStatsCards({ stats }) {
  const cards = [
    {
      title: "Ventas del Mes",
      value: `$${(stats.ventasTotal || 28400).toLocaleString()}`,
      change: "+12.5% vs mes anterior",
      isPositive: true,
      icon: DollarSign,
      color: "text-green-600 bg-green-50 dark:bg-green-900/30"
    },
    {
      title: "Pedidos Realizados",
      value: stats.pedidosTotal || 876,
      change: "+8.2% este mes",
      isPositive: true,
      icon: ShoppingCart,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-900/30"
    },
    {
      title: "Insumos Críticos",
      value: stats.insumosBajoStock ?? 0,
      change: (stats.insumosBajoStock ?? 0) > 0 ? "Requiere reabastecimiento" : "Inventario óptimo",
      isPositive: (stats.insumosBajoStock ?? 0) === 0,
      icon: AlertCircle,
      color: (stats.insumosBajoStock ?? 0) > 0 ? "text-red-600 bg-red-50 dark:bg-red-900/30" : "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30"
    },
    {
      title: "Clientes Activos",
      value: stats.clientesTotal || 412,
      change: "+15 nuevos esta semana",
      isPositive: true,
      icon: Users,
      color: "text-purple-600 bg-purple-50 dark:bg-purple-900/30"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                {card.title}
              </span>
              <div className={`p-3 rounded-xl ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{card.value}</h3>
              <p
                className={`text-xs mt-1 font-medium ${
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
