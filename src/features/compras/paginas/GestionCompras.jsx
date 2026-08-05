import { useState, useMemo } from "react";
import { Plus, Search, FileText } from "lucide-react";
import { useGestionCompras } from "../hooks/useGestionCompras";
import { ComprasTable } from "../componentes/gestion/ComprasTable";

export function GestionCompras() {
  const {
    compras,
    filteredCompras,
    loading,
    searchTerm,
    setSearchTerm,
    filterEstado,
    setFilterEstado,
    updateEstado,
    cancelarCompra
  } = useGestionCompras();

  const [selectedCompra, setSelectedCompra] = useState(null);

  // Stats
  const stats = useMemo(() => {
    const total = compras.length;
    const completadas = compras.filter((c) => c.estado === "Completada").length;
    const pendientes = compras.filter((c) => c.estado === "Pendiente").length;
    const anuladas = compras.filter((c) => c.estado === "Anulada").length;
    return { total, completadas, pendientes, anuladas };
  }, [compras]);

  const handleViewDetail = (c) => {
    setSelectedCompra(c);
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Gestión de Compras
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Administra las órdenes de compra del negocio
        </p>
      </div>

      {/* Separator */}
      <hr className="border-gray-200 dark:border-gray-700" />

      {/* Stat cards - 2x2 grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Total Compras */}
        <div className="flex items-center gap-4 bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
            <FileText className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">Total Compras</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">registradas</p>
          </div>
        </div>

        {/* Completadas */}
        <div className="flex items-center gap-4 bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
            <FileText className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">Completadas</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.completadas}</p>
            <p className="text-xs text-green-500">finalizadas</p>
          </div>
        </div>

        {/* Pendientes */}
        <div className="flex items-center gap-4 bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center">
            <FileText className="w-6 h-6 text-yellow-500" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">Pendientes</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.pendientes}</p>
            <p className="text-xs text-yellow-500">por procesar</p>
          </div>
        </div>

        {/* Anuladas */}
        <div className="flex items-center gap-4 bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
            <FileText className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">Anuladas</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.anuladas}</p>
            <p className="text-xs text-red-400">canceladas</p>
          </div>
        </div>
      </div>

      {/* Search + filter card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar compra..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-[#F05454] focus:border-transparent transition-colors"
            />
          </div>

          {/* Estado select */}
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-[#F05454] focus:border-transparent transition-colors shrink-0 cursor-pointer"
          >
            <option value="Todos">Todos los estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Recibida">Recibida</option>
            <option value="Completada">Completada</option>
            <option value="Anulada">Anulada</option>
          </select>

          {/* Nueva Compra button */}
          <button
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#F05454] hover:bg-[#d84343] text-white font-medium rounded-xl shadow-md transition-colors shrink-0"
          >
            <Plus className="w-5 h-5" />
            <span>Nueva Compra</span>
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">Cargando historial de compras...</div>
      ) : (
        <ComprasTable
          compras={filteredCompras}
          onViewDetail={handleViewDetail}
          onUpdateEstado={updateEstado}
        />
      )}
    </div>
  );
}
