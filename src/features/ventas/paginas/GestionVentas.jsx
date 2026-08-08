import { useState } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  CheckCircle2,
  Clock,
  BarChart2,
  Download,
  FileSpreadsheet,
  FileText
} from "lucide-react";
import { useGestionVentas } from "../hooks/useGestionVentas";
import { VentasStatsCards } from "../componentes/gestion/VentasStatsCards";
import { VentasTable } from "../componentes/gestion/VentasTable";
import { VentasHistorialTableView } from "../componentes/gestion/VentasHistorialTableView";
import { VentasReportesView } from "../componentes/gestion/VentasReportesView";
import { VentaDetalleModal } from "../componentes/gestion/VentaDetalleModal";

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
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [filterFecha, setFilterFecha] = useState("");
  const [filterMetodoPago, setFilterMetodoPago] = useState("Todos");
  const [selectedVentaDetail, setSelectedVentaDetail] = useState(null);

function formatDateSafe(dateVal, fallback = "") {
  if (!dateVal) return fallback;
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal).slice(0, 10) || fallback;
    return d.toISOString().split("T")[0];
  } catch (e) {
    return String(dateVal).slice(0, 10) || fallback;
  }
}

  const periodLabelMap = {
    hoy: "Hoy",
    "7_dias": "Últimos 7 días",
    este_mes: "Este mes",
    este_ano: "Este año",
    personalizado: "Todos los registros"
  };
  const periodText = periodLabelMap[selectedPeriod] || "Últimos 7 días";

  // Apply local filters (fecha + metodo de pago) on top of hook's filteredVentas
  const displayedVentas = filteredVentas.filter((v) => {
    if (filterFecha) {
      const ventaDate = formatDateSafe(v.fecha || v.fechaVenta, "");
      if (ventaDate !== filterFecha) return false;
    }
    if (filterMetodoPago !== "Todos") {
      const metodoPago = v.metodoPago || v.metodo_pago || v.medioPago || "";
      if (metodoPago.toLowerCase() !== filterMetodoPago.toLowerCase()) return false;
    }
    return true;
  });

  const handleClearFilters = () => {
    setFilterFecha("");
    setFilterMetodoPago("Todos");
    setSearchTerm("");
    setFilterEstado("Todos");
  };

  const hasActiveFilters = filterFecha !== "" || filterMetodoPago !== "Todos" || filterEstado !== "Todos" || searchTerm !== "";

  const handleViewDetail = (v) => {
    setSelectedVentaDetail(v);
  };

  // Export to Excel (CSV with UTF-8 BOM)
  const handleExportExcel = () => {
    const headers = ["N° Factura / Pedido", "Cliente", "Fecha", "Horario", "Entrega", "Método de Pago", "Subtotal", "Descuento", "Total (COP)", "Estado"];
    const rows = displayedVentas.map(v => [
      `"${v.numeroVenta || v.codigoPedido || `PED-${String(v.id).padStart(3, "0")}`}"`,
      `"${v.clienteNombre || v.cliente || "Cliente General"}"`,
      `"${v.fecha ? new Date(v.fecha).toISOString().split("T")[0] : "2026-08-06"}"`,
      `"${v.horario || "13:45 - 14:00"}"`,
      `"${v.tipoEntrega || "En Mesa"}"`,
      `"${v.metodoPago || "Efectivo"}"`,
      `"$${Number(v.subtotal || v.total || 0).toLocaleString("es-CO")}"`,
      `"${v.descuentoPorcentaje ? `-${v.descuentoPorcentaje}%` : "N/A"}"`,
      `"$${Number(v.total || v.subtotal || 0).toLocaleString("es-CO")}"`,
      `"${v.estado || "Completada"}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Historial_Pedidos_${selectedPeriod}_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export to Printable PDF Window
  const handleExportPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Historial de Pedidos - Chazin Food</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #1e293b; }
            h1 { color: #F05454; font-size: 24px; margin-bottom: 4px; }
            h2 { color: #64748b; font-size: 14px; font-weight: normal; margin-top: 0; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
            th, td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; }
            th { background-color: #f8fafc; color: #475569; font-weight: bold; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; background: #d1fae5; color: #065f46; }
            .total { font-weight: bold; text-align: right; }
            .footer { margin-top: 30px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 10px; }
          </style>
        </head>
        <body>
          <h1>Chazin Food — Historial de Pedidos</h1>
          <h2>Período: ${periodText} | Generado el: ${new Date().toLocaleDateString("es-CO")} ${new Date().toLocaleTimeString("es-CO")}</h2>
          <table>
            <thead>
              <tr>
                <th>N° Pedido</th>
                <th>Cliente</th>
                <th>Fecha & Horario</th>
                <th>Entrega</th>
                <th>Método de Pago</th>
                <th>Monto Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              ${displayedVentas.map(v => `
                <tr>
                  <td><strong>${v.numeroVenta || v.codigoPedido || `PED-${String(v.id).padStart(3, "0")}`}</strong></td>
                  <td>${v.clienteNombre || v.cliente || "Cliente General"}</td>
                  <td>${v.fecha ? new Date(v.fecha).toISOString().split("T")[0] : "2026-08-06"} (${v.horario || "13:45"})</td>
                  <td>${v.tipoEntrega || "En Mesa"}</td>
                  <td>${v.metodoPago || "Efectivo"}</td>
                  <td><strong>$${Number(v.total || v.subtotal || 0).toLocaleString("es-CO")}</strong></td>
                  <td><span class="badge">${v.estado || "Completada"}</span></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          <div class="footer">Chazin Food — Sistema de Gestión Comercial y Pedidos</div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const periods = [
    { id: "hoy", label: "Hoy" },
    { id: "7_dias", label: "7 días" },
    { id: "este_mes", label: "Este mes" },
    { id: "este_ano", label: "Este año" },
    { id: "personalizado", label: "Todos" }
  ];

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

      {/* Main Navigation Tabs */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-xs space-y-6">
        {/* Tabs Header */}
        <div className="border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-8 -mb-px">
            <button
              onClick={() => setActiveTab("pedidos_pagados")}
              className={`flex items-center gap-2 pb-3.5 text-sm font-semibold transition-colors relative cursor-pointer ${
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
              className={`flex items-center gap-2 pb-3.5 text-sm font-semibold transition-colors relative cursor-pointer ${
                activeTab === "historial"
                  ? "text-[#F05454] border-b-2 border-[#F05454]"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              <Clock
                className={`w-4 h-4 ${
                  activeTab === "historial" ? "text-[#F05454]" : "text-gray-400"
                }`}
              />
              <span>Historial</span>
            </button>

            <button
              onClick={() => setActiveTab("reportes")}
              className={`flex items-center gap-2 pb-3.5 text-sm font-semibold transition-colors relative cursor-pointer ${
                activeTab === "reportes"
                  ? "text-[#F05454] border-b-2 border-[#F05454]"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              <BarChart2
                className={`w-4 h-4 ${
                  activeTab === "reportes" ? "text-[#F05454]" : "text-gray-400"
                }`}
              />
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
                  className={`px-4 py-1.5 rounded-full text-xs transition-colors cursor-pointer ${
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

        {/* TAB CONTENT: REPORTES vs HISTORIAL vs PEDIDOS PAGADOS */}
        {activeTab === "reportes" ? (
          <VentasReportesView ventas={ventas} selectedPeriod={selectedPeriod} />
        ) : activeTab === "historial" ? (
          <div className="space-y-6 pt-2">
            {/* Historial Header with Exportar Button & Dropdown */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Historial — {periodText}
              </h2>
              <div className="relative shrink-0 self-start sm:self-auto">
                <button
                  onClick={() => setExportMenuOpen(!exportMenuOpen)}
                  className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  <span>Exportar</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${exportMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {exportMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl z-30 py-1.5 overflow-hidden">
                    <button
                      onClick={() => {
                        handleExportExcel();
                        setExportMenuOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      <span>Exportar a Excel (.csv)</span>
                    </button>
                    <button
                      onClick={() => {
                        handleExportPDF();
                        setExportMenuOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 flex items-center gap-2.5 transition-colors cursor-pointer border-t border-gray-100 dark:border-gray-700/60"
                    >
                      <FileText className="w-4 h-4 text-rose-600" />
                      <span>Exportar a PDF</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <VentasHistorialCardsView
              ventas={ventas}
              onViewDetail={handleViewDetail}
            />
          </div>
        ) : (
          /* Pedidos Pagados */
          <div className="space-y-6 pt-2">
            {/* Search Bar & Filter Toggle */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
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

              <button
                onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                className={`w-full sm:w-auto px-4 py-2.5 border rounded-2xl text-sm font-medium flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer ${
                  filterDropdownOpen
                    ? "bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <Filter className="w-4 h-4 text-gray-500" />
                <span>Filtros</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${filterDropdownOpen ? "rotate-180" : ""}`} />
              </button>
            </div>

            {/* Inline Filter Panel (Captura 2) */}
            {filterDropdownOpen && (
              <div className="bg-gray-50/70 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl px-5 py-4">
                <div className="flex flex-col sm:flex-row items-end gap-4">
                  {/* Fecha */}
                  <div className="flex-1 w-full sm:w-auto">
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                      Fecha
                    </label>
                    <input
                      type="date"
                      value={filterFecha}
                      onChange={(e) => setFilterFecha(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#F05454]/40 focus:border-transparent transition-colors placeholder:text-gray-400"
                    />
                  </div>

                  {/* Método de pago */}
                  <div className="flex-1 w-full sm:w-auto">
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                      Método de pago
                    </label>
                    <select
                      value={filterMetodoPago}
                      onChange={(e) => setFilterMetodoPago(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#F05454]/40 focus:border-transparent transition-colors cursor-pointer appearance-none"
                    >
                      <option value="Todos">Todos</option>
                      <option value="Efectivo">Efectivo</option>
                      <option value="Tarjeta">Tarjeta</option>
                      <option value="Transferencia">Transferencia</option>
                    </select>
                  </div>

                  {/* Limpiar */}
                  <div className="shrink-0 pb-0.5">
                    <button
                      onClick={handleClearFilters}
                      className={`text-sm font-semibold transition-colors cursor-pointer ${
                        hasActiveFilters
                          ? "text-[#F05454] hover:text-red-600"
                          : "text-[#F05454]/60"
                      }`}
                    >
                      Limpiar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Counter */}
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {displayedVentas.length} pedido(s) encontrado(s)
              </p>
            </div>

            {/* Content View: Table or Empty State */}
            {loading ? (
              <div className="text-center py-16 text-gray-500 dark:text-gray-400 font-medium">
                Cargando gestión de ventas...
              </div>
            ) : displayedVentas.length === 0 ? (
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
                ventas={displayedVentas}
                onViewDetail={handleViewDetail}
                onUpdateEstado={updateEstado}
              />
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <VentaDetalleModal
        isOpen={!!selectedVentaDetail}
        onClose={() => setSelectedVentaDetail(null)}
        venta={selectedVentaDetail}
      />
    </div>
  );
}
