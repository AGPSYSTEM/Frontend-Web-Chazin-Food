import { Package, CheckCircle2, TrendingDown, ChefHat } from "lucide-react";

export function InsumosStatsCards({ insumos = [] }) {
  const baseInsumos = insumos.filter((i) => i.tipo !== "Preparado");
  const preparadosCount = insumos.filter((i) => i.tipo === "Preparado").length;
  const total = insumos.length;
  const stockNormal = baseInsumos.filter((i) => Number(i.stock || 0) > Number(i.stockMinimo || 0)).length;
  const stockBajo = baseInsumos.filter((i) => Number(i.stock || 0) <= Number(i.stockMinimo || 0)).length;

  const statCards = [
    {
      id: "total",
      title: "Total Insumos",
      value: total,
      subtext: "registrados",
      subtextColor: "text-gray-400 dark:text-gray-500",
      icon: Package,
      bgColor: "bg-blue-50 dark:bg-blue-950/40",
      iconColor: "text-blue-500 dark:text-blue-400"
    },
    {
      id: "normal",
      title: "Stock Normal",
      value: stockNormal,
      subtext: "en inventario",
      subtextColor: "text-emerald-600 dark:text-emerald-400",
      icon: CheckCircle2,
      bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
      iconColor: "text-emerald-500 dark:text-emerald-400"
    },
    {
      id: "bajo",
      title: "Stock Bajo / Agotado",
      value: stockBajo,
      subtext: "requiere compra",
      subtextColor: "text-rose-500 dark:text-rose-400",
      icon: TrendingDown,
      bgColor: "bg-rose-50 dark:bg-rose-950/40",
      iconColor: "text-rose-500 dark:text-rose-400"
    },
    {
      id: "preparados",
      title: "Insumos Preparados",
      value: preparadosCount,
      subtext: "con receta activa",
      subtextColor: "text-purple-600 dark:text-purple-400",
      icon: ChefHat,
      bgColor: "bg-purple-50 dark:bg-purple-950/40",
      iconColor: "text-purple-500 dark:text-purple-400"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card) => {
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
