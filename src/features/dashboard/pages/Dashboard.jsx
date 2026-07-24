import { Link } from "react-router-dom";
import { TrendingUp, ShoppingCart, Users, Settings, ChevronRight } from "lucide-react";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { DashboardStatsCards } from "../components/DashboardStatsCards";
import { DashboardCharts } from "../components/DashboardCharts";

const quickAccess = [
  {
    icon: ShoppingCart,
    label: "Compras",
    sub: "Gestión de insumos",
    to: "/compras/gestion",
    iconBg: "bg-[#30475E]"
  },
  {
    icon: TrendingUp,
    label: "Ventas",
    sub: "Punto de venta",
    to: "/ventas/productos",
    iconBg: "bg-red-500"
  },
  {
    icon: Users,
    label: "Usuarios",
    sub: "Administrar accesos",
    to: "/configuracion/usuarios",
    iconBg: "bg-purple-500"
  },
  {
    icon: Settings,
    label: "Configuración",
    sub: "Roles y permisos",
    to: "/configuracion/roles",
    iconBg: "bg-gray-600"
  }
];

export function Dashboard() {
  const { stats, loading } = useDashboardStats();

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#222831] via-[#30475E] to-[#F05454] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <h1 className="text-3xl font-extrabold mb-2">Panel de Control General</h1>
          <p className="text-gray-200 text-sm leading-relaxed">
            Bienvenido al sistema de administración de Chazin Food. Revisa las métricas clave, estado de inventarios y comportamiento de ventas en tiempo real.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-8 translate-y-8">
          <TrendingUp className="w-96 h-96" />
        </div>
      </div>

      {/* Stats Cards */}
      <DashboardStatsCards stats={stats} />

      {/* Quick Access */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Acceso Rápido</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickAccess.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                to={item.to}
                className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3.5 rounded-2xl text-white ${item.iconBg} shadow-md`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm group-hover:text-[#F05454] transition-colors">
                      {item.label}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.sub}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Charts */}
      <DashboardCharts />
    </div>
  );
}
