import { RotateCcw, Clock, CheckCircle2, CheckCheck, XCircle } from "lucide-react";

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
  const canceladas = stats
    ? (stats.rechazadas !== undefined ? stats.rechazadas : (stats.canceladas || 0))
    : devoluciones.filter((d) => {
        const est = String(d.estado || "").toUpperCase();
        return est === "RECHAZADA" || est === "CANCELADA";
      }).length;

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
      title: "Pendientes",
      value: pendientes,
      subtext: "por revisar / aprobar",
      subtextColor: "text-amber-600 dark:text-amber-400 font-semibold",
      icon: Clock,
      bgColor: "bg-amber-50 dark:bg-amber-950/40",
      iconColor: "text-amber-500 dark:text-amber-400"
    },
    {
      id: "aprobadas",
      title: "Aprobadas",
      value: aprobadas,
      subtext: "en reposición / cambio",
      subtextColor: "text-sky-600 dark:text-sky-400 font-semibold",
      icon: CheckCircle2,
      bgColor: "bg-sky-50 dark:bg-sky-950/40",
      iconColor: "text-sky-500 dark:text-sky-400"
    },
    {
      id: "completadas",
      title: "Completadas",
      value: completadas,
      subtext: "resueltas con éxito",
      subtextColor: "text-emerald-600 dark:text-emerald-400 font-semibold",
      icon: CheckCheck,
      bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
      iconColor: "text-emerald-500 dark:text-emerald-400"
    },
    {
      id: "canceladas",
      title: "Canceladas",
      value: canceladas,
      subtext: "solicitudes denegadas",
      subtextColor: "text-rose-600 dark:text-rose-400 font-semibold",
      icon: XCircle,
      bgColor: "bg-rose-50 dark:bg-rose-950/40",
      iconColor: "text-rose-500 dark:text-rose-400"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
      {statCards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div
            key={card.id}
            className="bg-white dark:bg-gray-900 rounded-3xl p-4 sm:p-5 border border-gray-100 dark:border-gray-800 shadow-xs flex items-center gap-3.5 transition-all hover:shadow-sm"
          >
            <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl ${card.bgColor} flex items-center justify-center shrink-0`}>
              <IconComponent className={`w-5 h-5 sm:w-6 sm:h-6 ${card.iconColor}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">{card.title}</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{card.value}</span>
                <span className={`text-[10px] sm:text-[11px] truncate ${card.subtextColor}`}>{card.subtext}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

