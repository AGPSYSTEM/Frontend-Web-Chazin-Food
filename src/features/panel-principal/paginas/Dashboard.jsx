import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, ShoppingCart, Users, Package, DollarSign, AlertCircle, Settings, ChevronRight } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";
import { useDashboardStats } from "../hooks/useDashboardStats";

function useDarkMode() {
  const [isDark, setIsDark] = useState(
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  );
  useEffect(() => {
    const obs = new MutationObserver(
      () => setIsDark(document.documentElement.classList.contains("dark"))
    );
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return isDark;
}

const defaultVentasData = [
  { mes: "Ene", ventas: 12500, compras: 8000 },
  { mes: "Feb", ventas: 15200, compras: 9500 },
  { mes: "Mar", ventas: 18800, compras: 11000 },
  { mes: "Abr", ventas: 22100, compras: 13500 },
  { mes: "May", ventas: 25600, compras: 15000 },
  { mes: "Jun", ventas: 28400, compras: 16800 }
];

const defaultProductosPopulares = [
  { nombre: "Hamburguesa Especial", ventas: 245, ingresos: 2450000 },
  { nombre: "Salchipapa Grande", ventas: 198, ingresos: 1584000 },
  { nombre: "Perro Caliente", ventas: 167, ingresos: 1336000 },
  { nombre: "Pollo Broaster", ventas: 142, ingresos: 2130000 },
  { nombre: "Papas Fritas", ventas: 124, ingresos: 620000 }
];

const defaultAlertasStock = [
  { nombre: "Pan de Hamburguesa", stock: 15, minimo: 50 },
  { nombre: "Salchicha Premium", stock: 8, minimo: 30 },
  { nombre: "Papas Congeladas", stock: 12, minimo: 40 },
  { nombre: "Queso Mozzarella", stock: 6, minimo: 20 },
  { nombre: "Tomate", stock: 9, minimo: 25 }
];

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
  const isDark = useDarkMode();
  const { stats, ventasChart, productosPopulares, alertasStock } = useDashboardStats();
  const [reabastecerItem, setReabastecerItem] = useState(null);
  const axisColor = isDark ? "#e0ecf8" : "#374151";
  const axisColorMuted = isDark ? "#b8cde0" : "#6b7280";
  const comprasColor = isDark ? "#f87171" : "#ef4444";
  const ventasColor = isDark ? "#4ade80" : "#16a34a";
  const tooltipStyle = {
    borderRadius: "8px",
    border: "none",
    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    backgroundColor: "#ffffff",
    color: "#111827"
  };
  const tooltipLabelStyle = { color: "#111827", fontWeight: 600 };
  const tooltipItemStyle = { color: "#111827" };

  const finalVentasData = Array.isArray(ventasChart) && ventasChart.length > 0 ? ventasChart : defaultVentasData;
  const finalPopulares = Array.isArray(productosPopulares) && productosPopulares.length > 0 ? productosPopulares : defaultProductosPopulares;
  const finalAlertas = Array.isArray(alertasStock) && alertasStock.length > 0 ? alertasStock : defaultAlertasStock;

  const ventasFormatted = stats.ventasTotal > 1000000
    ? `$${(stats.ventasTotal / 1000000).toFixed(1)}M`
    : `$${Number(stats.ventasTotal || 28400000).toLocaleString("es-CO")}`;

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 bg-gray-50 dark:bg-gray-950 min-h-full">

      {/* ── Header ── */}
      <div className="mb-4 sm:mb-6 lg:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-gray-100">Panel de Control</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">Bienvenido a Chazin Food</p>
      </div>

      {/* ── Mobile Quick Access (only on mobile) ── */}
      <div className="lg:hidden mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-700 dark:text-gray-200">Acceso Rápido</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {quickAccess.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700/60 flex flex-col gap-3 active:scale-95 transition-transform"
            >
              <div className={`${item.iconBg} w-10 h-10 rounded-xl flex items-center justify-center shrink-0`}>
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{item.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">

        {/* Ventas del Mes */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-4 lg:p-6 flex items-center gap-4 lg:flex-col lg:items-stretch lg:gap-0 hover:shadow-md transition-shadow">
          <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl shrink-0 lg:w-fit lg:mb-3">
            <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-500 dark:text-gray-400 text-xs font-medium mb-0.5">Ventas del Mes</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{ventasFormatted}</p>
            <p className="text-green-600 dark:text-green-400 text-xs mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 shrink-0" /> +{stats.ventasVariacion || 12.5}%
            </p>
          </div>
        </div>

        {/* Total Pedidos */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-4 lg:p-6 flex items-center gap-4 lg:flex-col lg:items-stretch lg:gap-0 hover:shadow-md transition-shadow">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl shrink-0 lg:w-fit lg:mb-3">
            <ShoppingCart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-500 dark:text-gray-400 text-xs font-medium mb-0.5">Total Pedidos</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {Number(stats.pedidosTotal || 1248).toLocaleString("es-CO")}
            </p>
            <p className="text-green-600 dark:text-green-400 text-xs mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 shrink-0" /> +{stats.pedidosVariacion || 8.2}%
            </p>
          </div>
        </div>

        {/* Clientes Activos */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-4 lg:p-6 flex items-center gap-4 lg:flex-col lg:items-stretch lg:gap-0 hover:shadow-md transition-shadow">
          <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-xl shrink-0 lg:w-fit lg:mb-3">
            <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-500 dark:text-gray-400 text-xs font-medium mb-0.5">Clientes Activos</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {Number(stats.clientesActivos || stats.clientesTotal || 342).toLocaleString("es-CO")}
            </p>
            <p className="text-green-600 dark:text-green-400 text-xs mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 shrink-0" /> +{stats.clientesVariacion || 15.3}%
            </p>
          </div>
        </div>

        {/* Productos */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-4 lg:p-6 flex items-center gap-4 lg:flex-col lg:items-stretch lg:gap-0 hover:shadow-md transition-shadow">
          <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-xl shrink-0 lg:w-fit lg:mb-3">
            <Package className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-500 dark:text-gray-400 text-xs font-medium mb-0.5">Productos</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {stats.productosTotal || 68}
            </p>
            <p className="text-red-600 dark:text-red-400 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" /> {stats.insumosBajoStock || 5} bajo stock
            </p>
          </div>
        </div>

      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">

        {/* Ventas y Compras */}
        <div className="bg-white dark:bg-gray-900 p-4 lg:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60">
          <h2 className="font-bold text-gray-800 dark:text-gray-100 mb-4">Ventas y Compras</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={finalVentasData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" tick={{ fill: axisColorMuted, fontSize: 11 }} />
              <YAxis tick={{ fill: axisColorMuted, fontSize: 11 }} width={40} />
              <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Area type="monotone" dataKey="ventas" name="Ingresos" stroke={ventasColor} strokeWidth={2} fill={ventasColor} fillOpacity={0.15} />
              <Area type="monotone" dataKey="compras" name="Egresos" stroke={comprasColor} strokeWidth={2} fill={comprasColor} fillOpacity={0.15} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Productos más vendidos */}
        <div className="bg-white dark:bg-gray-900 p-4 lg:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60">
          <h2 className="font-bold text-gray-800 dark:text-gray-100 mb-4">Productos Más Vendidos</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart layout="vertical" data={finalPopulares} margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: axisColorMuted }} />
              <YAxis type="category" dataKey="nombre" width={95} tick={{ fontSize: 10, fill: axisColor }} tickLine={false} />
              <Tooltip
                formatter={(value) => [value, "Ventas"]}
                contentStyle={tooltipStyle}
                labelStyle={tooltipLabelStyle}
                itemStyle={tooltipItemStyle}
              />
              <Bar dataKey="ventas" radius={[0, 6, 6, 0]} barSize={16}>
                {finalPopulares.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? "#16a34a" : "#22c55e"} fillOpacity={1 - index * 0.1} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Recent Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">

        {/* Alertas de Stock */}
        <div className="bg-white dark:bg-gray-900 p-4 lg:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800 dark:text-gray-100">Alertas de Stock</h2>
            <Link to="/compras/insumos" className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 hover:underline">
              Ver todo <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {finalAlertas.map((item, index) => (
              <div key={index} className="flex items-center justify-between gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800/50">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-gray-800 dark:text-gray-100 truncate">{item.nombre}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.stock} / {item.minimo} unidades</p>
                  </div>
                </div>
                <button onClick={() => setReabastecerItem(item)} className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium shrink-0 active:scale-95 transition-transform hover:bg-red-600">
                  Reabastecer
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Ventas Recientes */}
        <div className="bg-white dark:bg-gray-900 p-4 lg:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800 dark:text-gray-100">Ventas Recientes</h2>
            <Link to="/ventas/gestion-ventas" className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 hover:underline">
              Ver todo <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {[
              { id: "#0042", cliente: "Juan Pérez", total: 45000, estado: "Completado", hora: "10:30 AM" },
              { id: "#0041", cliente: "María García", total: 32500, estado: "En proceso", hora: "10:15 AM" },
              { id: "#0040", cliente: "Carlos López", total: 28000, estado: "Completado", hora: "09:45 AM" },
              { id: "#0039", cliente: "Ana Martínez", total: 52000, estado: "Completado", hora: "09:30 AM" },
              { id: "#0038", cliente: "Luis Rodríguez", total: 38500, estado: "Completado", hora: "09:00 AM" }
            ].map((venta, index) => (
              <div key={index} className="flex items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="font-medium text-sm text-gray-800 dark:text-gray-100">{venta.id}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${venta.estado === "Completado" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"}`}>
                      {venta.estado}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{venta.cliente} · {venta.hora}</p>
                </div>
                <p className="font-bold text-sm text-gray-800 dark:text-gray-100 shrink-0">${venta.total.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {reabastecerItem && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Reabastecer Insumo</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                <span className="font-semibold text-gray-800 dark:text-gray-100">{reabastecerItem.nombre}</span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                Stock actual: <span className="font-medium text-red-600">{reabastecerItem.stock}</span> / Mínimo: {reabastecerItem.minimo} unidades
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setReabastecerItem(null)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 dark:text-gray-300 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <Link
                  to="/compras/gestion"
                  onClick={() => setReabastecerItem(null)}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm hover:bg-red-600 transition-colors font-medium text-center"
                >
                  Ir a Compras
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
