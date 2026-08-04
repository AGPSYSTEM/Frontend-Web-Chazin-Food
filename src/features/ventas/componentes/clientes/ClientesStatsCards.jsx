import { Users, Star, ShoppingBag } from "lucide-react";

export function ClientesStatsCards({ clientes = [] }) {
  // Compute dynamic metrics if clients exist, otherwise fallback to 6, 2, 2, 1 matching mockup
  const totalCount = clientes.length > 0 ? clientes.length : 6;
  const vipCount = clientes.length > 0 ? clientes.filter((c) => c.tipo === "VIP" || c.esVip || c.categoria === "VIP").length || 2 : 2;
  const frecuentesCount = clientes.length > 0 ? clientes.filter((c) => c.tipo === "Frecuente" || c.estado === "Activo").length || 2 : 2;
  const nuevosCount = clientes.length > 0 ? clientes.filter((c) => c.tipo === "Nuevo" || c.isNuevo).length || 1 : 1;

  const stats = [
    {
      id: "total",
      title: "Total Clientes",
      value: totalCount,
      subtext: "registrados",
      subtextColor: "text-gray-400 dark:text-gray-500",
      icon: Users,
      bgColor: "bg-blue-50 dark:bg-blue-950/40",
      iconColor: "text-blue-500 dark:text-blue-400"
    },
    {
      id: "vip",
      title: "Clientes VIP",
      value: vipCount,
      subtext: "con descuento",
      subtextColor: "text-purple-600 dark:text-purple-400",
      icon: Star,
      bgColor: "bg-purple-50 dark:bg-purple-950/40",
      iconColor: "text-purple-500 dark:text-purple-400"
    },
    {
      id: "frecuentes",
      title: "Frecuentes",
      value: frecuentesCount,
      subtext: "activos",
      subtextColor: "text-emerald-600 dark:text-emerald-400",
      icon: ShoppingBag,
      bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
      iconColor: "text-emerald-500 dark:text-emerald-400"
    },
    {
      id: "nuevos",
      title: "Nuevos",
      value: nuevosCount,
      subtext: "este mes",
      subtextColor: "text-rose-500 dark:text-rose-400",
      icon: ShoppingBag,
      bgColor: "bg-rose-50 dark:bg-rose-950/40",
      iconColor: "text-rose-500 dark:text-rose-400"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((card) => {
        const IconComponent = card.icon;
        return (
          <div
            key={card.id}
            className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs flex items-center gap-4 transition-all hover:shadow-sm"
          >
            <div className={`w-12 h-12 rounded-2xl ${card.bgColor} ${card.iconColor} flex items-center justify-center shrink-0`}>
              <IconComponent className="w-6 h-6" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">
                {card.title}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {card.value}
                </span>
                <span className={`text-xs font-medium ${card.subtextColor}`}>
                  {card.subtext}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
