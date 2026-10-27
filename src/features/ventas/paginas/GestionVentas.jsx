import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import {
  CheckCircle2,
  Clock,
  BarChart2,
  Download,
  FileSpreadsheet,
  FileText,
  Plus,
  LayoutGrid,
  List,
  Search
} from "lucide-react";
import { useAuth } from "@/features/autenticacion/hooks/useAuth";
import { hasPrivilege } from "@/shared/utils/privilegiosUtils";
import { useGestionVentas } from "../hooks/useGestionVentas";
import { VentasStatsCards } from "../componentes/gestion/VentasStatsCards";
import { VentasTable } from "../componentes/gestion/VentasTable";
import { VentasHistorialCardsView } from "../componentes/gestion/VentasHistorialCardsView";
import { VentasHistorialTableView } from "../componentes/gestion/VentasHistorialTableView";
import { VentasReportesView } from "../componentes/gestion/VentasReportesView";
import { VentaDetalleModal } from "../componentes/gestion/VentaDetalleModal";
import { VentasBuscadorMulticriterio } from "../componentes/gestion/VentasBuscadorMulticriterio";
import { ChazinLoader } from "@/shared/components/ui/ChazinLoader";
import { formatTime12h } from "@/shared/utils/dateUtils";

export function GestionVentas() {
  const navigate = useNavigate();
  const {
    ventas,
    filteredVentas,
    stats,
    loading,
    searchTerm,
    setSearchTerm,
    filterEstado,
    setFilterEstado,
    selectedPeriod,
    setSelectedPeriod,
    filterFecha,
    setFilterFecha,
    filterFechaInicio,
    setFilterFechaInicio,
    filterFechaFin,
    setFilterFechaFin,
    filterMetodoPago,
    setFilterMetodoPago,
    filterOrigen,
    setFilterOrigen,
    filterTipoEntrega,
    setFilterTipoEntrega,
    filterFidelidad,
    setFilterFidelidad,
    montoMin,
    setMontoMin,
    montoMax,
    setMontoMax,
    clearAllFilters,
    hasActiveFilters,
    activeFiltersCount,
    updateEstado,
    updateTiempoEntrega,
    aprobarPago
  } = useGestionVentas();

  const { user } = useAuth();
  const canEdit = hasPrivilege(user, "Gestión de Ventas", "editar");
  const canCancel = hasPrivilege(user, "Gestión de Ventas", "eliminar");

  const [activeTab, setActiveTab] = useState("pedidos_pagados");
  const [historialViewMode, setHistorialViewMode] = useState("cards"); // "cards" | "table"
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [selectedVentaDetail, setSelectedVentaDetail] = useState(null);

  const periodLabelMap = {
    hoy: "Hoy",
    "7_dias": "Últimos 7 días",
    este_mes: "Este mes",
    este_ano: "Este año",
    personalizado: "Todos los registros"
  };
  const periodText = periodLabelMap[selectedPeriod] || "Últimos 7 días";

  const handleViewDetail = (v) => {
    setSelectedVentaDetail(v);
  };

  // Export to Excel (.xlsx) con los datos filtrados actualmente
  const handleExportExcel = () => {
    const headers = [
      "N° Factura / Pedido",
      "Cliente",
      "Fecha",
      "Horario",
      "Entrega",
      "Método de Pago",
      "Subtotal (COP)",
      "Descuento",
      "Total (COP)",
      "Estado"
    ];

    const rows = filteredVentas.map((v) => [
      v.numeroVenta || v.codigoPedido || `PED-${String(v.id).padStart(3, "0")}`,
      v.clienteNombre || v.cliente || "Cliente General",
      v.fecha ? new Date(v.fecha).toISOString().split("T")[0] : "2026-08-06",
      v.horario || "13:45 - 14:00",
      v.tipoEntrega || "En Mesa",
      v.metodoPago || "Efectivo",
      Number(v.subtotal || v.total || 0),
      v.descuentoPorcentaje ? `${v.descuentoPorcentaje}%` : "0%",
      Number(v.total || v.subtotal || 0),
      v.estado || "Completada"
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    worksheet["!cols"] = [
      { wch: 22 }, // N° Factura / Pedido
      { wch: 24 }, // Cliente
      { wch: 14 }, // Fecha
      { wch: 16 }, // Horario
      { wch: 14 }, // Entrega
      { wch: 18 }, // Método de Pago
      { wch: 16 }, // Subtotal
      { wch: 12 }, // Descuento
      { wch: 16 }, // Total
      { wch: 16 }  // Estado
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Historial de Pedidos");
    XLSX.writeFile(
      workbook,
      `Historial_Pedidos_${selectedPeriod}_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  // Export to Printable PDF Window con los datos filtrados actualmente
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
            .footer { margin-top: 30px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 10px; }
          </style>
        </head>
        <body>
          <h1>Chazin Food — Historial de Pedidos</h1>
          <h2>Período: ${periodText} | Registros: ${filteredVentas.length} | Generado el: ${new Date().toLocaleDateString("es-CO")} ${new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: true })}</h2>
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
              ${filteredVentas.map(v => `
                <tr>
                  <td><strong>${v.numeroVenta || v.codigoPedido || `PED-${String(v.id).padStart(3, "0")}`}</strong></td>
                  <td>${v.clienteNombre || v.cliente || "Cliente General"}</td>
                  <td>${v.fecha ? new Date(v.fecha).toISOString().split("T")[0] : "2026-08-06"} (${formatTime12h(v.horario || v.fecha, "12:30 PM")})</td>
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

  // Props comunes para el buscador multicriterio
  const buscadorProps = {
    searchTerm,
    setSearchTerm,
    filterEstado,
    setFilterEstado,
    selectedPeriod,
    setSelectedPeriod,
    filterFecha,
    setFilterFecha,
    filterFechaInicio,
    setFilterFechaInicio,
    filterFechaFin,
    setFilterFechaFin,
    filterMetodoPago,
    setFilterMetodoPago,
    filterOrigen,
    setFilterOrigen,
    filterTipoEntrega,
    setFilterTipoEntrega,
    filterFidelidad,
    setFilterFidelidad,
    montoMin,
    setMontoMin,
    montoMax,
    setMontoMax,
    clearAllFilters,
    hasActiveFilters,
    activeFiltersCount,
    totalRecords: ventas.length,
    filteredRecords: filteredVentas.length
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1e293b] dark:text-gray-100">
            Gestión de Ventas
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Monitoreo de pedidos pagados, historial completo y análisis comercial
          </p>
        </div>
        <button
          onClick={() => navigate("/ventas/pos")}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#F05454] hover:bg-[#d84040] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Crear venta</span>
        </button>
      </div>

      {/* Top 4 Stats Cards */}
      <VentasStatsCards ventas={ventas} stats={stats} />

      {/* Main Navigation Container */}
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

        {/* TAB 1: REPORTES */}
        {activeTab === "reportes" ? (
          <VentasReportesView ventas={ventas} />
        ) : activeTab === "historial" ? (
          /* TAB 2: HISTORIAL */
          <div className="space-y-6 pt-1">
            {/* Historial Header: Título, Vista Toggle (Cards vs Tabla) y Exportar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Historial de Transacciones
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Período actual: <span className="font-semibold">{periodText}</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Switch de Vistas: Tarjetas vs Tabla */}
                <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1 border border-gray-200/60 dark:border-gray-700/60 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setHistorialViewMode("cards")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      historialViewMode === "cards"
                        ? "bg-white dark:bg-gray-700 text-[#F05454] shadow-xs"
                        : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                    }`}
                    title="Vista en Tarjetas"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Tarjetas</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHistorialViewMode("table")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      historialViewMode === "table"
                        ? "bg-white dark:bg-gray-700 text-[#F05454] shadow-xs"
                        : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                    }`}
                    title="Vista en Tabla"
                  >
                    <List className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Tabla</span>
                  </button>
                </div>

                {/* Menú Exportar */}
                <div className="relative shrink-0">
                  <button
                    onClick={() => setExportMenuOpen(!exportMenuOpen)}
                    className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    <span>Exportar</span>
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
                        <span>Exportar a Excel (.xlsx)</span>
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
            </div>

            {/* Buscador Multicriterio en Historial */}
            <VentasBuscadorMulticriterio {...buscadorProps} />

            {/* Visualización de Resultados en Historial */}
            {loading ? (
              <ChazinLoader text="CARGANDO HISTORIAL DE VENTAS" size="md" />
            ) : filteredVentas.length === 0 ? (
              <div className="py-16 text-center flex flex-col items-center justify-center space-y-3 bg-gray-50/50 dark:bg-gray-800/40 rounded-3xl border border-gray-100 dark:border-gray-800">
                <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/40 text-[#F05454] flex items-center justify-center mb-1">
                  <Search className="w-7 h-7 stroke-[1.5]" />
                </div>
                <p className="text-base font-bold text-gray-800 dark:text-gray-100">
                  No se encontraron ventas para los criterios seleccionados
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md">
                  {searchTerm ? `No hay coincidencias para "${searchTerm}". ` : ""}
                  Prueba cambiando o eliminando los filtros aplicados.
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="mt-2 px-4 py-2 rounded-xl bg-[#F05454] hover:bg-[#d84040] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    Restablecer filtros
                  </button>
                )}
              </div>
            ) : historialViewMode === "table" ? (
              <VentasHistorialTableView
                ventas={filteredVentas}
                onViewDetail={handleViewDetail}
                onUpdateEstado={updateEstado}
              />
            ) : (
              <VentasHistorialCardsView
                ventas={filteredVentas}
                onViewDetail={handleViewDetail}
              />
            )}
          </div>
        ) : (
          /* TAB 3: PEDIDOS PAGADOS */
          <div className="space-y-6 pt-1">
            {/* Buscador Multicriterio en Pedidos Pagados */}
            <VentasBuscadorMulticriterio {...buscadorProps} />

            {/* Content View: Table or Empty State */}
            {loading ? (
              <ChazinLoader text="CARGANDO GESTIÓN DE VENTAS" size="md" />
            ) : filteredVentas.length === 0 ? (
              <div className="py-16 text-center flex flex-col items-center justify-center space-y-3 bg-gray-50/50 dark:bg-gray-800/40 rounded-3xl border border-gray-100 dark:border-gray-800">
                <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/40 text-[#F05454] flex items-center justify-center mb-1">
                  <Search className="w-7 h-7 stroke-[1.5]" />
                </div>
                <p className="text-base font-bold text-gray-800 dark:text-gray-100">
                  No se encontraron pedidos con los criterios aplicados
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md">
                  {searchTerm ? `No hay resultados para "${searchTerm}". ` : ""}
                  Intenta buscar por otro dato o restablece los filtros.
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="mt-2 px-4 py-2 rounded-xl bg-[#F05454] hover:bg-[#d84040] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    Restablecer filtros y ver todos los pedidos
                  </button>
                )}
              </div>
            ) : (
              <VentasTable
                ventas={filteredVentas}
                onViewDetail={handleViewDetail}
                onUpdateEstado={canEdit ? updateEstado : null}
                onAprobarPago={canEdit ? aprobarPago : null}
                canEdit={canEdit}
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
        onUpdateTiempoEntrega={canEdit ? updateTiempoEntrega : null}
        onAprobarPago={canEdit ? aprobarPago : null}
        canEdit={canEdit}
      />
    </div>
  );
}
