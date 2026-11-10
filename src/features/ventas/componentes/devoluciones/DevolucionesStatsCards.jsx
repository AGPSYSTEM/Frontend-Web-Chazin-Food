import { RotateCcw, Clock, CheckCircle2, CheckCheck } from "lucide-react";

export function DevolucionesStatsCards({ stats = null, devoluciones = [] }) {
  const total = stats ? stats.total : devoluciones.length;
  const pendientes = stats
    ? stats.pendientes
    : devoluciones.filter((d) => String(d.estado || "").toUpperCase() === "PENDIENTE").length;
  const aprobadas = stats
    ? stats.aprobadas
    : devoluciones.filter((d) => String(d.estado || "").toUpperCase() === "APROBADA").length;
  const completadas = stats
    ? stats.completadas
    : devoluciones.filter((d) => String(d.estado || "").toUpperCase() === "COMPLETADA").length;

  const statCards = [
    {
      id: "total",
      title: "Total Devoluciones",
      value: total,
      subtext: "solicitudes registradas",
      subtextColor: "text-gray-400 dark:text-gray-500",
      icon: RotateCcw,
      bgColor: "bg-blue-50 dark:bg-blue-950/40",
      iconColor: "text-blue-500 dark:text-blue-400"
    },
    {
      id: "pendientes",
      title: "Pendientes por Revisar",
      value: pendientes,
      subtext: "requieren atención",
      subtextColor: "text-amber-600 dark:text-amber-400 font-semibold",
      icon: Clock,
      bgColor: "bg-amber-50 dark:bg-amber-950/40",
      iconColor: "text-amber-500 dark:text-amber-400"
    },
    {
      id: "aprobadas",
      title: "Aprobadas",
      value: aprobadas,
      subtext: "en gestión / reposición",
      subtextColor: "text-blue-600 dark:text-blue-400",
      icon: CheckCircle2,
      bgColor: "bg-sky-50 dark:bg-sky-950/40",
      iconColor: "text-sky-500 dark:text-sky-400"
    },
    {
      id: "completadas",
      title: "Resueltas / Completadas",
      value: completadas,
      subtext: "finalizadas exitosamente",
      subtextColor: "text-emerald-600 dark:text-emerald-400 font-semibold",
      icon: CheckCheck,
      bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
      iconColor: "text-emerald-500 dark:text-emerald-400"
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
            <div className={`w-12 h-12 rounded-2xl ${card.bgColor} flex items-center justify-center shrink-0`}>
              <IconComponent className={`w-6 h-6 ${card.iconColor}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">{card.title}</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{card.value}</span>
                <span className={`text-[11px] truncate ${card.subtextColor}`}>{card.subtext}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

