import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TrendingUp, TrendingDown, Minus, ShoppingCart, Users, Package, DollarSign, AlertCircle, Settings, ChevronRight, Zap, CheckCircle2, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { comprasService } from "@/features/compras/servicios/comprasService";
import { apiClient } from "@/shared/api/apiClient";

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
  const navigate = useNavigate();
  const notify = useNotifications();
  const { stats, ventasChart, productosPopulares, alertasStock, ventasRecientes, refetch } = useDashboardStats();

  const [reabastecerItem, setReabastecerItem] = useState(null);
  const [reabastecerCantidad, setReabastecerCantidad] = useState(10);
  const [reabastecerPrecio, setReabastecerPrecio] = useState(0);
  const [reabastecerProveedor, setReabastecerProveedor] = useState("");
  const [proveedoresList, setProveedoresList] = useState([]);
  const [isRestocking, setIsRestocking] = useState(false);

  useEffect(() => {
    apiClient.get("/proveedores")
      .then((res) => setProveedoresList(Array.isArray(res) ? res : res?.data || []))
      .catch(() => setProveedoresList([]));
  }, []);

  const handleOpenReabastecer = (item) => {
    setReabastecerItem(item);
    const deficit = Math.max(1, Math.ceil((Number(item.minimo || item.stockMinimo || 0) * 2) - Number(item.stock || 0)));
    setReabastecerCantidad(deficit > 0 ? deficit : 10);
    setReabastecerPrecio(Number(item.precioUnitario || 0));
    setReabastecerProveedor(item.idProveedor ? String(item.idProveedor) : "");
  };

  const handleConfirmReabastecer = async (e) => {
    e.preventDefault();
    if (!reabastecerItem) return;
    const cant = parseFloat(reabastecerCantidad);
    if (isNaN(cant) || cant <= 0) {
      notify.warning("Cantidad requerida", "Por favor ingresa una cantidad válida mayor a 0.");
      return;
    }
    const precio = parseFloat(reabastecerPrecio) || 0;
    const total = parseFloat((cant * precio).toFixed(2));

    setIsRestocking(true);
    try {
      await comprasService.createCompra({
        idProveedor: reabastecerProveedor ? parseInt(reabastecerProveedor) : null,
        fechaCompra: new Date().toISOString().split("T")[0],
        total,
        estado: "RECIBIDA",
        detalles: [
          {
            idInsumo: reabastecerItem.idInsumo || reabastecerItem.id,
            cantidad: cant,
            precioUnitario: precio,
            subtotal: total
          }
        ]
      });

      notify.success(
        "¡Insumo Reabastecido con Éxito!",
        `Se sumaron ${cant} ${reabastecerItem.unidadMedida || 'unidades'} a "${reabastecerItem.nombre}". El inventario ha sido actualizado inmediatamente.`
      );
      setReabastecerItem(null);
      await refetch();
    } catch (err) {
      console.error("Error al reabastecer:", err);
      notify.error("Error al reabastecer", err.response?.data?.message || err.message || "No se pudo registrar la compra de reabastecimiento.");
    } finally {
      setIsRestocking(false);
    }
  };

  const handleIrAComprasDetalladas = () => {
    const item = reabastecerItem;
    setReabastecerItem(null);
    navigate("/compras/gestion", {
      state: {
        openNuevaCompra: true,
        initialInsumo: item,
        initialInsumoId: item.idInsumo || item.id
      }
    });
  };
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
                <Zap className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>{stats.frecuenciaVentas} pedidos / día</span>
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
            <div>
              <h2 className="font-bold text-gray-800 dark:text-gray-100">Alertas de Stock</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Insumos activos con existencia crítica</p>
            </div>
            <Link to="/compras/insumos" className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 hover:underline font-medium">
              Ver inventario <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-2.5">
            {finalAlertas.length > 0 ? finalAlertas.map((item, index) => (
              <div key={item.idInsumo || item.id || index} className="flex items-center justify-between gap-3 p-3 bg-red-50/80 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/40 hover:border-red-200 transition-colors">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-gray-800 dark:text-gray-100 truncate">{item.nombre}</p>
                    <p className="text-xs text-red-700 dark:text-red-400 font-medium">
                      Stock: <span className="font-bold">{item.stock}</span> / Mínimo: {item.minimo || item.stockMinimo} {item.unidadMedida || 'unidades'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenReabastecer(item)}
                  className="px-3.5 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-semibold shrink-0 shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Reabastecer</span>
                </button>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50/50 dark:bg-gray-800/20 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Inventario al día</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Todos los insumos activos cuentan con stock suficiente</p>
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
        <div className="fixed inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-800 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                  <ShoppingCart className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Reabastecer Insumo</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Genera una orden de compra inmediata</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReabastecerItem(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg text-lg leading-none"
              >
                ✕
              </button>
            </div>

            {/* Insumo summary badge */}
            <div className="p-6 space-y-4">
              <div className="p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200/70 dark:border-gray-700/60">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Insumo a Comprar</p>
                <p className="text-base font-bold text-gray-800 dark:text-gray-100">{reabastecerItem.nombre}</p>
                <div className="flex items-center gap-4 mt-2 text-xs">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Stock Actual: </span>
                    <span className="font-bold text-red-600 dark:text-red-400">{reabastecerItem.stock} {reabastecerItem.unidadMedida || 'und'}</span>
                  </div>
                  <div className="text-gray-300 dark:text-gray-600">•</div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Mínimo: </span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{reabastecerItem.minimo || reabastecerItem.stockMinimo} {reabastecerItem.unidadMedida || 'und'}</span>
                  </div>
                </div>
              </div>

              {/* Form fields */}
              <form onSubmit={handleConfirmReabastecer} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Cantidad a comprar
                    </label>
                    <input
                      type="number"
                      min="0.01"
                      step="any"
                      required
                      value={reabastecerCantidad}
                      onChange={(e) => setReabastecerCantidad(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-red-500 text-gray-800 dark:text-gray-100 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Precio Unitario ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      required
                      value={reabastecerPrecio}
                      onChange={(e) => setReabastecerPrecio(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-red-500 text-gray-800 dark:text-gray-100 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Proveedor
                  </label>
                  <select
                    value={reabastecerProveedor}
                    onChange={(e) => setReabastecerProveedor(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-red-500 text-gray-800 dark:text-gray-100 font-medium"
                  >
                    <option value="">Compra Directa / Sin Proveedor</option>
                    {proveedoresList.map((p) => (
                      <option key={p.idProveedor || p.id} value={p.idProveedor || p.id}>
                        {p.nombre} {p.empresa ? `(${p.empresa})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subtotal Banner */}
                <div className="p-3 bg-red-50/70 dark:bg-red-950/20 rounded-xl flex items-center justify-between border border-red-100 dark:border-red-900/30">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Total de la Compra:</span>
                  <span className="text-base font-extrabold text-red-600 dark:text-red-400">
                    ${Number((parseFloat(reabastecerCantidad) || 0) * (parseFloat(reabastecerPrecio) || 0)).toLocaleString("es-CO")}
                  </span>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setReabastecerItem(null)}
                    disabled={isRestocking}
                    className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isRestocking}
                    className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    {isRestocking ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Reabasteciendo...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirmar Reabastecer</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Advanced link */}
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={handleIrAComprasDetalladas}
                    className="text-[11px] text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors font-medium inline-flex items-center gap-1"
                  >
                    <span>Configurar orden completa con lotes y fechas en Compras</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
