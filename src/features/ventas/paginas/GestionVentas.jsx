import { useState, useMemo } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  CheckCircle2,
  Clock,
  BarChart2,
  X,
  TrendingUp,
  Package,
  Calendar,
  Award,
  PieChart,
  ShoppingBag,
  DollarSign
} from "lucide-react";
import { useGestionVentas } from "../hooks/useGestionVentas";
import { VentasStatsCards } from "../componentes/gestion/VentasStatsCards";
import { VentasTable } from "../componentes/gestion/VentasTable";

export function GestionVentas() {
  const {
    ventas,
    filteredVentas,
    loading,
    searchTerm,
    setSearchTerm,
    filterEstado,
    setFilterEstado,
    selectedPeriod,
    setSelectedPeriod,
    updateEstado
  } = useGestionVentas();

  const [activeTab, setActiveTab] = useState("pedidos_pagados");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [selectedVentaDetail, setSelectedVentaDetail] = useState(null);

  const handleViewDetail = (v) => {
    setSelectedVentaDetail(v);
  };

  const periods = [
    { id: "hoy", label: "Hoy" },
    { id: "7_dias", label: "7 días" },
    { id: "este_mes", label: "Este mes" },
    { id: "este_ano", label: "Este año" },
    { id: "personalizado", label: "Todos" }
  ];

  // Compute analytics data for Reportes tab
  const analyticsData = useMemo(() => {
    const totalRevenue = ventas.reduce((acc, v) => acc + Number(v.total || 0), 0);
    const totalOrders = ventas.length;
    const avgTicket = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // Count by status
    const statusCounts = {
      Pendiente: 0,
      "En Preparación": 0,
      Completada: 0,
      Anulada: 0
    };

    ventas.forEach((v) => {
      const st = v.estado || "Pendiente";
      if (statusCounts[st] !== undefined) {
        statusCounts[st]++;
      } else {
        statusCounts["Completada"]++;
      }
    });

    // Top products calculation from details
    const productStats = {};
    ventas.forEach((v) => {
      if (v.detalles && Array.isArray(v.detalles)) {
        v.detalles.forEach((d) => {
          const name = d.observaciones || `Producto #${d.idVariante}`;
          if (!productStats[name]) {
            productStats[name] = { name, quantity: 0, revenue: 0 };
          }
          productStats[name].quantity += Number(d.cantidad || 1);
          productStats[name].revenue += Number(d.subtotal || d.precioUnitario * d.cantidad || 0);
        });
      }
    });

    const topProducts = Object.values(productStats)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const bestProduct = topProducts[0] ? topProducts[0].name : "N/A";

    return {
      totalRevenue,
      totalOrders,
      avgTicket,
      bestProduct,
      statusCounts,
      topProducts
    };
  }, [ventas]);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1e293b] dark:text-gray-100">
          Gestión de Ventas
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Monitoreo de pedidos pagados, historial completo y análisis comercial
        </p>
      </div>

      {/* Top 4 Stats Cards */}
      <VentasStatsCards ventas={ventas} />

      {/* Main Content Box */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-xs space-y-6">
        {/* Tabs Header */}
        <div className="border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-8 -mb-px">
            <button
              onClick={() => setActiveTab("pedidos_pagados")}
              className={`flex items-center gap-2 pb-3.5 text-sm font-semibold transition-colors relative ${
                activeTab === "pedidos_pagados"
                  ? "text-[#F05454] border-b-2 border-[#F05454]"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              <CheckCircle2
                className={`w-4 h-4 ${
                  activeTab === "pedidos_pagados" ? "text-[#F05454]" : "text-gray-400"
                }`}
              />
              <span>Pedidos Pagados</span>
            </button>

            <button
              onClick={() => setActiveTab("historial")}
              className={`flex items-center gap-2 pb-3.5 text-sm font-semibold transition-colors relative ${
                activeTab === "historial"
                  ? "text-[#F05454] border-b-2 border-[#F05454]"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              <Clock className="w-4 h-4 text-gray-400" />
              <span>Historial</span>
            </button>

            <button
              onClick={() => setActiveTab("reportes")}
              className={`flex items-center gap-2 pb-3.5 text-sm font-semibold transition-colors relative ${
                activeTab === "reportes"
                  ? "text-[#F05454] border-b-2 border-[#F05454]"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              <BarChart2 className="w-4 h-4 text-gray-400" />
              <span>Reportes</span>
            </button>
          </div>
        </div>

        {/* CONTENIDO SEGÚN LA PESTAÑA */}

        {/* 1. REPORTES TAB */}
        {activeTab === "reportes" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-red-500" />
                  Informe y Análisis Comercial
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Resumen de ventas, distribución por estado y productos más vendidos</p>
              </div>
            </div>

            {/* Metric Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 rounded-2xl">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs mb-1">
                  <DollarSign className="w-4 h-4" /> Ingresos Totales
                </div>
                <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                  ${analyticsData.totalRevenue.toLocaleString("es-CO")}
                </p>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 rounded-2xl">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-xs mb-1">
                  <Package className="w-4 h-4" /> Total de Pedidos
                </div>
                <p className="text-2xl font-black text-blue-700 dark:text-blue-300">
                  {analyticsData.totalOrders}
                </p>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900 rounded-2xl">
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-semibold text-xs mb-1">
                  <TrendingUp className="w-4 h-4" /> Ticket Promedio
                </div>
                <p className="text-2xl font-black text-purple-700 dark:text-purple-300">
                  ${analyticsData.avgTicket.toLocaleString("es-CO")}
                </p>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900 rounded-2xl">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-xs mb-1">
                  <Award className="w-4 h-4" /> Producto Más Vendido
                </div>
                <p className="text-lg font-extrabold text-amber-800 dark:text-amber-200 truncate">
                  {analyticsData.bestProduct}
                </p>
              </div>
            </div>

            {/* Distribution by Status & Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Distribution by Status */}
              <div className="p-5 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-4">
                <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-red-500" /> Distribución por Estado de Pedido
                </h4>
                <div className="space-y-3">
                  {Object.entries(analyticsData.statusCounts).map(([status, count]) => {
                    const percentage = analyticsData.totalOrders > 0 ? Math.round((count / analyticsData.totalOrders) * 100) : 0;
                    return (
                      <div key={status} className="space-y-1 text-xs">
                        <div className="flex justify-between font-semibold">
                          <span className="text-gray-700 dark:text-gray-300">{status}</span>
                          <span className="text-gray-500">{count} pedido(s) ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              status === "Completada" ? "bg-emerald-500" : status === "En Preparación" ? "bg-amber-500" : status === "Pendiente" ? "bg-blue-500" : "bg-rose-500"
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Selling Products */}
              <div className="p-5 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-4">
                <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-red-500" /> Productos Más Vendidos
                </h4>
                {analyticsData.topProducts.length === 0 ? (
                  <p className="text-xs text-gray-400 py-4 text-center">No hay productos registrados en las ventas</p>
                ) : (
                  <div className="space-y-3">
                    {analyticsData.topProducts.map((p, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 text-xs">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-950 text-red-600 font-bold flex items-center justify-center text-xs">
                            #{idx + 1}
                          </span>
                          <span className="font-bold text-gray-800 dark:text-gray-200">{p.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-gray-900 dark:text-gray-100">{p.quantity} unid.</span>
                          <p className="text-[10px] text-gray-400">${p.revenue.toLocaleString("es-CO")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. TAB DE PEDIDOS PAGADOS Y HISTORIAL */}
        {(activeTab === "pedidos_pagados" || activeTab === "historial") && (
          <>
            {/* Period Selector Row */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                Período:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {periods.map((p) => {
                  const isSelected = selectedPeriod === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPeriod(p.id)}
                      className={`px-4 py-1.5 rounded-full text-xs transition-colors ${
                        isSelected
                          ? "bg-[#1e293b] text-white font-semibold shadow-xs"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium"
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search Bar & Filter Dropdown */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por cliente o ID de factura..."
                  className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm focus:ring-2 focus:ring-[#F05454]/50 focus:border-transparent transition-colors placeholder:text-gray-400 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="relative w-full sm:w-auto shrink-0">
                <button
                  onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between gap-3 shadow-xs transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <span>Filtros {filterEstado !== "Todos" ? `(${filterEstado})` : ""}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {/* Filter Dropdown Menu */}
                {filterDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl z-20 py-2">
                    <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Filtrar por Estado
                    </div>
                    {["Todos", "Pendiente", "En Preparación", "Completada", "Anulada"].map((st) => (
                      <button
                        key={st}
                        onClick={() => {
                          setFilterEstado(st);
                          setFilterDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between ${
                          filterEstado === st
                            ? "bg-rose-50 dark:bg-rose-950/40 text-[#F05454] font-semibold"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        <span>{st}</span>
                        {filterEstado === st && <CheckCircle2 className="w-4 h-4 text-[#F05454]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Counter */}
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {filteredVentas.length} pedido(s) encontrado(s) en este período
              </p>
            </div>

            {/* Content View: Table or Empty State */}
            {loading ? (
              <div className="text-center py-16 text-gray-500 dark:text-gray-400 font-medium">
                Cargando gestión de ventas...
              </div>
            ) : filteredVentas.length === 0 ? (
              <div className="py-16 text-center flex flex-col items-center justify-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 flex items-center justify-center mb-1">
                  <CheckCircle2 className="w-10 h-10 stroke-[1.5]" />
                </div>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                  No se encontraron pedidos con los filtros aplicados
                </p>
              </div>
            ) : (
              <VentasTable
                ventas={filteredVentas}
                onViewDetail={handleViewDetail}
                onUpdateEstado={updateEstado}
              />
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {selectedVentaDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 relative border border-gray-100 dark:border-gray-800">
            <button
              onClick={() => setSelectedVentaDetail(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Detalle de Venta #{selectedVentaDetail.numeroVenta || selectedVentaDetail.id}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Información del cliente y productos facturados
              </p>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400">Cliente:</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {typeof selectedVentaDetail.cliente === 'string' ? selectedVentaDetail.cliente : (selectedVentaDetail.clienteNombre || "Cliente General")}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400">Fecha:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {selectedVentaDetail.fecha
                    ? new Date(selectedVentaDetail.fecha).toLocaleString("es-CO")
                    : "Fecha actual"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400">Estado:</span>
                <span className="font-semibold text-[#F05454]">
                  {selectedVentaDetail.estado || "Completada"}
                </span>
              </div>

              {selectedVentaDetail.detalles && selectedVentaDetail.detalles.length > 0 && (
                <div className="py-2 border-b border-gray-100 dark:border-gray-800 space-y-2">
                  <span className="text-gray-500 dark:text-gray-400 block text-xs font-bold uppercase">Productos:</span>
                  <div className="space-y-1 text-xs">
                    {selectedVentaDetail.detalles.map((d, idx) => (
                      <div key={idx} className="flex justify-between text-gray-800 dark:text-gray-200">
                        <span>{d.cantidad}x {d.observaciones || `Producto #${d.idVariante}`}</span>
                        <span className="font-semibold">${Number(d.subtotal || d.precioUnitario * d.cantidad || 0).toLocaleString("es-CO")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400">Total:</span>
                <span className="font-extrabold text-lg text-gray-900 dark:text-gray-100">
                  ${Number(selectedVentaDetail.total || 0).toLocaleString("es-CO")}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedVentaDetail(null)}
                className="px-5 py-2.5 bg-[#1e293b] hover:bg-[#0f172a] text-white text-sm font-semibold rounded-2xl transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
