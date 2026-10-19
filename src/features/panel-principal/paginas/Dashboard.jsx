import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ShoppingCart,
  Users,
  Package,
  DollarSign,
  AlertCircle,
  Settings,
  ChevronRight,
  Zap,
  CheckCircle2,
  Calendar,
  Layers
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from "recharts";
import { useDashboardStats } from "../hooks/useDashboardStats";

function StatVariation({ value, label = "vs mes anterior" }) {
  const num = Number(value || 0);
  if (num > 0) {
    return (
      <p className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1">
        <TrendingUp className="w-3.5 h-3.5 shrink-0" />
        <span>+{num}% {label}</span>
      </p>
    );
  }
  if (num < 0) {
    return (
      <p className="text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-1">
        <TrendingDown className="w-3.5 h-3.5 shrink-0" />
        <span>{num}% {label}</span>
      </p>
    );
  }
  return (
    <p className="text-gray-500 dark:text-gray-400 text-xs font-medium flex items-center gap-1">
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
    sub: "Gestión comercial",
    to: "/ventas/gestion-ventas",
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
  const {
    stats,
    ventasChart,
    productosPopulares,
    alertasStock,
    ventasRecientes,
    periodo,
    setPeriodo,
    year,
    setYear
  } = useDashboardStats();

  const axisColor = isDark ? "#e0ecf8" : "#374151";
  const axisColorMuted = isDark ? "#b8cde0" : "#6b7280";
  const comprasColor = isDark ? "#f87171" : "#ef4444";
  const ventasColor = isDark ? "#4ade80" : "#16a34a";
  const tooltipStyle = {
    borderRadius: "12px",
    border: "none",
    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.15)",
    backgroundColor: isDark ? "#1f2937" : "#ffffff",
    color: isDark ? "#f3f4f6" : "#111827",
    padding: "10px 14px"
  };
  const tooltipLabelStyle = { color: isDark ? "#f3f4f6" : "#111827", fontWeight: 700 };
  const tooltipItemStyle = { color: isDark ? "#e5e7eb" : "#374151" };

  const finalVentasData = Array.isArray(ventasChart) && ventasChart.length > 0 ? ventasChart : defaultVentasData;
  const finalPopulares = Array.isArray(productosPopulares) && productosPopulares.length > 0 ? productosPopulares : defaultProductosPopulares;
  const finalAlertas = Array.isArray(alertasStock) && alertasStock.length > 0 ? alertasStock : defaultAlertasStock;

  const periods = [
    { id: "hoy", label: "Hoy" },
    { id: "7_dias", label: "7 días" },
    { id: "este_mes", label: "Este mes" },
    { id: "este_ano", label: "Este año" },
    { id: "todos", label: "Histórico" }
  ];

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 bg-gray-50 dark:bg-gray-950 min-h-full space-y-6">

      {/* ── Header con Filtro Global de Período y Año (Ítem 37) ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
            Panel de Control
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Indicadores financieros, stock crítico y métricas operativas en tiempo real
          </p>
        </div>

        {/* Global Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-gray-900 p-1.5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-2xs self-start md:self-auto">
          <div className="flex items-center gap-1">
            {periods.map((p) => {
              const isSelected = periodo === p.id;
              return (
                <button
                  key={p.id}
                  id={`filter-periodo-${p.id}`}
                  type="button"
                  onClick={() => setPeriodo(p.id)}
                  aria-pressed={isSelected}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-red-500 text-white shadow-xs"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block" />

          {/* Selector de Año */}
          <div className="flex items-center gap-1 pl-1">
            <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <select
              id="select-filter-year"
              value={year}
              onChange={(e) => {
                const selectedYear = Number(e.target.value);
                setYear(selectedYear);
                setPeriodo("este_ano");
              }}
              aria-label="Filtrar por año"
              className="bg-transparent text-xs font-bold text-gray-700 dark:text-gray-300 py-1 px-1 rounded-lg border-0 outline-none cursor-pointer focus:ring-1 focus:ring-red-500/50"
            >
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
              <option value={2024}>2024</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Mobile Quick Access (solo móviles) ── */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Acceso Rápido</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {quickAccess.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-2xs border border-gray-100 dark:border-gray-800 flex flex-col gap-2.5 active:scale-95 transition-transform"
            >
              <div className={`${item.iconBg} w-9 h-9 rounded-xl flex items-center justify-center shrink-0`}>
                <item.icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-800 dark:text-gray-100 text-sm">{item.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{item.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── KPI Cards Rediseñadas (Ítems 29, 30 y 31) ── */}
      {/* 5 Tarjetas simétricas con divisa COP explícita y distribución equilibrada */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 sm:gap-4 lg:gap-5">

        {/* 1. Total de Ventas (COP) - Ítem 31 y 30 */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-800 p-4 sm:p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">
                Total de ventas (COP)
              </span>
              <span className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-gray-100 block tracking-tight truncate">
                ${Number(stats.totalVentasGlobal || stats.ventasTotal || 0).toLocaleString("es-CO")}
              </span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-100/80 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs">
              <Layers className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-gray-50 dark:border-gray-800/60 flex items-center justify-between text-xs">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
              COP Divisa Oficial
            </span>
            <span className="text-gray-400 dark:text-gray-500 font-medium text-[11px]">Acumulado</span>
          </div>
        </div>

        {/* 2. Ventas del Período / Mes (COP) - Ítem 30 */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-800 p-4 sm:p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">
                Ventas del Período (COP)
              </span>
              <span className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-gray-100 block tracking-tight truncate">
                ${Number(stats.ventasTotal || 0).toLocaleString("es-CO")}
              </span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-green-100/80 dark:bg-green-950/50 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0 shadow-2xs">
              <DollarSign className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-gray-50 dark:border-gray-800/60 flex items-center justify-between text-xs">
            <StatVariation value={stats.ventasVariacion} label={stats.labelVariacion} />
            <span className="text-gray-400 dark:text-gray-500 font-medium text-[11px]">COP</span>
          </div>
        </div>

        {/* 3. Total Pedidos */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-800 p-4 sm:p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">
                Total Pedidos
              </span>
              <span className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-gray-100 block tracking-tight truncate">
                {Number(stats.pedidosTotal || 0).toLocaleString("es-CO")}
              </span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-blue-100/80 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-2xs">
              <ShoppingCart className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-gray-50 dark:border-gray-800/60 flex items-center justify-between text-xs">
            <StatVariation value={stats.pedidosVariacion} label={stats.labelVariacion} />
            {stats.frecuenciaVentas !== undefined && (
              <span className="text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md flex items-center gap-1 text-[11px]">
                <Zap className="w-3 h-3 text-blue-500 shrink-0" />
                <span>{stats.frecuenciaVentas} ped/día</span>
              </span>
            )}
          </div>
        </div>

        {/* 4. Clientes Activos */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-800 p-4 sm:p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">
                Clientes Activos
              </span>
              <span className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-gray-100 block tracking-tight truncate">
                {Number(stats.clientesActivos || stats.clientesTotal || 0).toLocaleString("es-CO")}
              </span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-purple-100/80 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 shadow-2xs">
              <Users className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-gray-50 dark:border-gray-800/60 flex items-center justify-between text-xs">
            <StatVariation value={stats.clientesVariacion} />
            <span className="text-gray-400 dark:text-gray-500 font-medium text-[11px]">Registrados</span>
          </div>
        </div>

        {/* 5. Insumos en Stock Crítico */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-800 p-4 sm:p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">
                Stock Crítico
              </span>
              <span className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-gray-100 block tracking-tight truncate">
                {stats.insumosBajoStock || 0}
              </span>
            </div>
            <div className={`w-10 h-10 rounded-2xl ${Number(stats.insumosBajoStock || 0) > 0 ? "bg-rose-100/80 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400" : "bg-emerald-100/80 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"} flex items-center justify-center shrink-0 shadow-2xs`}>
              <AlertCircle className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-gray-50 dark:border-gray-800/60 flex items-center justify-between text-xs">
            <span className={`font-semibold ${Number(stats.insumosBajoStock || 0) > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
              {Number(stats.insumosBajoStock || 0) > 0 ? "Insumos bajo mínimo" : "Inventario al día"}
            </span>
            <Link to="/compras/insumos" className="text-gray-400 hover:text-red-500 transition-colors text-[11px] font-medium">
              Ver
            </Link>
          </div>
        </div>

      </div>

      {/* ── Charts Grid (Ítems 32 y 33) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">

        {/* 1. Compras y Ventas - Nomenclatura corregida (Ítem 33) */}
        <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-800 dark:text-gray-100 text-base">Compras y Ventas</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Flujo monetario comparativo en COP</p>
            </div>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
              Valores en COP
            </span>
          </div>

          {finalVentasData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={finalVentasData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#f1f5f9"} />
                <XAxis dataKey="mes" tick={{ fill: axisColorMuted, fontSize: 11 }} />
                <YAxis
                  tick={{ fill: axisColorMuted, fontSize: 11 }}
                  width={60}
                  tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelStyle={tooltipLabelStyle}
                  itemStyle={tooltipItemStyle}
                  formatter={(value) => [`$${Number(value).toLocaleString("es-CO")} COP`, ""]}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                {/* Etiquetas Compras y Ventas (Ítem 33) */}
                <Area type="monotone" dataKey="ventas" name="Ventas" stroke={ventasColor} strokeWidth={2.5} fill={ventasColor} fillOpacity={0.18} />
                <Area type="monotone" dataKey="compras" name="Compras" stroke={comprasColor} strokeWidth={2.5} fill={comprasColor} fillOpacity={0.18} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[240px] text-gray-400 dark:text-gray-600 text-sm">
              Sin datos de compras y ventas para este período
            </div>
          )}
        </div>

        {/* 2. Productos Más Vendidos - Ejes X e Y etiquetados (Ítem 32) */}
        <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-800 dark:text-gray-100 text-base">Productos Más Vendidos</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Top 5 platos de mayor preferencia comercial</p>
            </div>
            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
              Unidades Vendidas
            </span>
          </div>

          {finalPopulares.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                layout="vertical"
                data={finalPopulares.map(p => ({
                  ...p,
                  nombreShort: (p.nombre || "").replace(/\s*\(.*?\)/g, "").trim()
                }))}
                margin={{ top: 5, right: 25, left: 20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDark ? "#374151" : "#f1f5f9"} />
                {/* Eje X Etiquetado claramente (Ítem 32) */}
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: axisColorMuted }}
                  label={{
                    value: "Cantidad de unidades vendidas",
                    position: "insideBottom",
                    offset: -12,
                    fill: axisColorMuted,
                    fontSize: 11,
                    fontWeight: 600
                  }}
                />
                {/* Eje Y Etiquetado claramente (Ítem 32) */}
                <YAxis
                  type="category"
                  dataKey="nombreShort"
                  width={130}
                  tick={{ fontSize: 11, fill: axisColor }}
                  tickLine={false}
                  tickFormatter={(val) => (val && val.length > 18 ? `${val.substring(0, 16)}...` : val)}
                  label={{
                    value: "Productos",
                    angle: -90,
                    position: "insideLeft",
                    offset: -5,
                    fill: axisColorMuted,
                    fontSize: 11,
                    fontWeight: 600
                  }}
                />
                <Tooltip
                  formatter={(value) => [`${value} unidades`, "Total Vendido"]}
                  labelFormatter={(label, items) => (items && items[0] && items[0].payload ? items[0].payload.nombre : label)}
                  contentStyle={tooltipStyle}
                  labelStyle={tooltipLabelStyle}
                  itemStyle={tooltipItemStyle}
                />
                <Bar dataKey="ventas" radius={[0, 6, 6, 0]} barSize={20}>
                  {finalPopulares.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? "#16a34a" : "#22c55e"} fillOpacity={1 - index * 0.12} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[260px] text-gray-400 dark:text-gray-600 text-sm">
              Sin ventas registradas para este período
            </div>
          )}
        </div>

      </div>

      {/* ── Recent Activity Grid (Ítems 34, 35 y 36) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">

        {/* Stock Crítico - Título cambiado y botón Reabastecer eliminado (Ítems 34 y 35) */}
        <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-800 dark:text-gray-100 text-base">Stock crítico</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Insumos activos con existencia mínima requerida</p>
            </div>
            <Link
              to="/compras/insumos"
              className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 hover:underline font-bold"
            >
              Ver inventario <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {finalAlertas.length > 0 ? (
              finalAlertas.map((item, index) => (
                <div
                  key={item.idInsumo || item.id || index}
                  className="flex items-center justify-between gap-3 p-3 bg-red-50/70 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/40 hover:border-red-200 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center shrink-0">
                      <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-gray-800 dark:text-gray-100 truncate">{item.nombre}</p>
                      <p className="text-xs text-red-700 dark:text-red-400 font-medium">
                        Mínimo requerido: <span className="font-bold">{item.minimo || item.stockMinimo} {item.unidadMedida || 'unidades'}</span>
                      </p>
                    </div>
                  </div>
                  {/* Badge de stock sin botón Reabastecer (Ítem 35) */}
                  <div className="px-3 py-1.5 bg-red-100/90 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-xl text-xs font-black shrink-0 border border-red-200 dark:border-red-800/60 shadow-2xs">
                    Stock: {item.stock} {item.unidadMedida || 'und'}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50/50 dark:bg-gray-800/20 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-200">Inventario al día</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Todos los insumos activos cuentan con stock suficiente</p>
              </div>
            )}
          </div>
        </div>

        {/* Ventas Recientes - Hora del estado dinámica (Ítem 36) */}
        <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-800 dark:text-gray-100 text-base">Ventas Recientes</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Estado del flujo operativo con hora exacta</p>
            </div>
            <Link
              to="/ventas/gestion-ventas"
              className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 hover:underline font-bold"
            >
              Ver todas <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {Array.isArray(ventasRecientes) && ventasRecientes.length > 0 ? (
              ventasRecientes.map((venta, index) => {
                const isCompletado = venta.estado === "Completada" || venta.estadoEntrega === "ENTREGADO" || venta.estadoEntrega === "LISTO";
                const isAnulado = venta.estado === "Anulada" || venta.estadoEntrega === "CANCELADO";

                const badgeStyle = isCompletado
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/50"
                  : isAnulado
                  ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50"
                  : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50";

                const formatHoraDynamic = (dateStr, fallback) => {
                  if (fallback) return fallback;
                  if (!dateStr) return "Reciente";
                  const d = new Date(dateStr);
                  return isNaN(d.getTime()) ? dateStr : d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });
                };

                const horaEstado = venta.horaEstado || formatHoraDynamic(venta.fechaVenta || venta.fecha, venta.horario);

                return (
                  <div
                    key={venta.id || index}
                    className="flex items-center justify-between gap-3 p-3 bg-gray-50/70 dark:bg-gray-800/60 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors border border-gray-100 dark:border-gray-800"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-extrabold text-sm text-gray-900 dark:text-gray-100">
                          {venta.codigoPedido || venta.numeroVenta || `#${String(venta.id).padStart(4, '0')}`}
                        </p>
                        {/* Estado con Hora del estado dinámica (Ítem 36) */}
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap inline-flex items-center gap-1.5 shadow-2xs ${badgeStyle}`}>
                          <span>{venta.estado || "Pendiente"}</span>
                          <span className="opacity-75 font-mono text-[11px] font-normal">• {horaEstado}</span>
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {venta.clienteNombre || venta.cliente || "Cliente General"} · {venta.origenNombre || (venta.tipoEntrega === 'Domicilio' ? 'Venta Online' : 'Punto Físico')}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-extrabold text-sm text-gray-900 dark:text-gray-100">
                        ${Number(venta.total || 0).toLocaleString('es-CO')}
                      </p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">COP</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex items-center justify-center py-8 text-gray-400 dark:text-gray-600 text-sm">
                Sin ventas registradas en este período
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
