import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, Minus, ShoppingCart, Users, Package, DollarSign, AlertCircle, Settings, ChevronRight } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";
import { useDashboardStats } from "../hooks/useDashboardStats";

function StatVariation({ value, label = "vs mes anterior" }) {
  const num = Number(value || 0);
  if (num > 0) {
    return (
      <p className="text-green-600 dark:text-green-400 text-xs mt-1 flex items-center gap-1 font-medium">
        <TrendingUp className="w-3.5 h-3.5 shrink-0" />
        <span>+{num}% {label}</span>
      </p>
    );
  }
  if (num < 0) {
    return (
      <p className="text-red-600 dark:text-red-400 text-xs mt-1 flex items-center gap-1 font-medium">
        <TrendingDown className="w-3.5 h-3.5 shrink-0" />
        <span>{num}% {label}</span>
      </p>
    );
  }
  return (
    <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 flex items-center gap-1 font-medium">
      <Minus className="w-3.5 h-3.5 shrink-0" />
      <span>0% {label}</span>
    </p>
  );
}

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

const defaultVentasData = [];
const defaultProductosPopulares = [];
const defaultAlertasStock = [];

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
  const { stats, ventasChart, productosPopulares, alertasStock, ventasRecientes } = useDashboardStats();
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
    : `$${Number(stats.ventasTotal || 0).toLocaleString("es-CO")}`;

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
            <StatVariation value={stats.ventasVariacion} />
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
              {Number(stats.pedidosTotal || 0).toLocaleString("es-CO")}
            </p>
            <StatVariation value={stats.pedidosVariacion} />
            {stats.frecuenciaVentas !== undefined && (
              <p className="text-blue-600 dark:text-blue-400 text-xs mt-1.5 flex items-center gap-1 font-medium bg-blue-50 dark:bg-blue-900/20 w-fit px-2 py-0.5 rounded">
                ⚡ {stats.frecuenciaVentas} pedidos / día
              </p>
            )}
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
              {Number(stats.clientesActivos || stats.clientesTotal || 0).toLocaleString("es-CO")}
            </p>
            <StatVariation value={stats.clientesVariacion} />
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
              {stats.productosTotal || 0}
            </p>
            <p className="text-red-600 dark:text-red-400 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" /> {stats.insumosBajoStock || 0} bajo stock
            </p>
          </div>
        </div>

      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">

        {/* Ventas y Compras */}
        <div className="bg-white dark:bg-gray-900 p-4 lg:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60">
          <h2 className="font-bold text-gray-800 dark:text-gray-100 mb-4">Ventas y Compras</h2>
          {finalVentasData.length > 0 ? (
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
          ) : (
            <div className="flex items-center justify-center h-[220px] text-gray-400 dark:text-gray-600 text-sm">
              Sin datos de ventas aún
            </div>
          )}
        </div>

        {/* Productos más vendidos */}
        <div className="bg-white dark:bg-gray-900 p-4 lg:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60">
          <h2 className="font-bold text-gray-800 dark:text-gray-100 mb-4">Productos Más Vendidos</h2>
          {finalPopulares.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart layout="vertical" data={finalPopulares.map(p => ({
                ...p,
                nombreShort: (p.nombre || "").replace(/\s*\(.*?\)/g, "").trim()
              }))} margin={{ top: 0, right: 12, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: axisColorMuted }} />
                <YAxis
                  type="category"
                  dataKey="nombreShort"
                  width={135}
                  tick={{ fontSize: 11, fill: axisColor }}
                  tickLine={false}
                  tickFormatter={(val) => (val && val.length > 18 ? `${val.substring(0, 16)}...` : val)}
                />
                <Tooltip
                  formatter={(value) => [value, "Ventas"]}
                  labelFormatter={(label, items) => (items && items[0] && items[0].payload ? items[0].payload.nombre : label)}
                  contentStyle={tooltipStyle}
                  labelStyle={tooltipLabelStyle}
                  itemStyle={tooltipItemStyle}
                />
                <Bar dataKey="ventas" radius={[0, 6, 6, 0]} barSize={18}>
                  {finalPopulares.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? "#16a34a" : "#22c55e"} fillOpacity={1 - index * 0.12} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[260px] text-gray-400 dark:text-gray-600 text-sm">
              Sin ventas registradas aún
            </div>
          )}
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
            {finalAlertas.length > 0 ? finalAlertas.map((item, index) => (
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
            )) : (
              <div className="flex items-center justify-center py-8 text-gray-400 dark:text-gray-600 text-sm">
                ✅ Todos los insumos están abastecidos
              </div>
            )}
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
            {Array.isArray(ventasRecientes) && ventasRecientes.length > 0 ? (
              ventasRecientes.map((venta, index) => {
                const isCompletado = venta.estado === "Completada" || venta.estadoEntrega === "ENTREGADO" || venta.estadoEntrega === "LISTO";
                const isAnulado = venta.estado === "Anulada" || venta.estadoEntrega === "CANCELADO";

                const badgeStyle = isCompletado
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                  : isAnulado
                  ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                  : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400";

                const formatHora = (dateStr) => {
                  if (!dateStr) return "Reciente";
                  const d = new Date(dateStr);
                  return isNaN(d.getTime()) ? dateStr : d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });
                };

                return (
                  <div key={venta.id || index} className="flex items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <p className="font-medium text-sm text-gray-800 dark:text-gray-100">
                          {venta.codigoPedido || venta.numeroVenta || `#${String(venta.id).padStart(4, '0')}`}
                        </p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${badgeStyle}`}>
                          {venta.estado || "Pendiente"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {venta.clienteNombre || venta.cliente || "Cliente General"} · {formatHora(venta.fechaVenta || venta.fecha)}
                      </p>
                    </div>
                    <p className="font-bold text-sm text-gray-800 dark:text-gray-100 shrink-0">
                      ${Number(venta.total || 0).toLocaleString('es-CO')}
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="flex items-center justify-center py-8 text-gray-400 dark:text-gray-600 text-sm">
                Sin ventas registradas aún
              </div>
            )}
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
