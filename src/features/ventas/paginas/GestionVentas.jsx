import { useState } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  CheckCircle2,
  Clock,
  BarChart2,
  X
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
    updateEstado
  } = useGestionVentas();

  const [activeTab, setActiveTab] = useState("pedidos_pagados");
  const [selectedPeriod, setSelectedPeriod] = useState("7_dias");
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
    { id: "personalizado", label: "Personalizado" }
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1e293b] dark:text-gray-100">
          Gestión de Ventas
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Monitoreo de pedidos pagados y análisis comercial
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
              placeholder="Buscar por cliente o ID..."
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
            {filteredVentas.length} pedido(s) encontrado(s)
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
                  {selectedVentaDetail.clienteNombre || selectedVentaDetail.cliente || "Cliente General"}
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
