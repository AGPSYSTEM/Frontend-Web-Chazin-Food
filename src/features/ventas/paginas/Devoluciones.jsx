import { useState } from "react";
import { Plus, Search, Filter, X, RotateCcw } from "lucide-react";
import { useAuth } from "@/features/autenticacion/hooks/useAuth";
import { hasPrivilege } from "@/shared/utils/privilegiosUtils";
import { useDevoluciones } from "../hooks/useDevoluciones";
import { DevolucionesStatsCards } from "../componentes/devoluciones/DevolucionesStatsCards";
import { DevolucionesTable } from "../componentes/devoluciones/DevolucionesTable";
import { DevolucionDetalleModal } from "../componentes/devoluciones/DevolucionDetalleModal";
import { NuevaDevolucionModal } from "../componentes/devoluciones/NuevaDevolucionModal";
import { ChazinLoader } from "@/shared/components/ui/ChazinLoader";

export default function Devoluciones() {
  const { user } = useAuth();
  const canManage = hasPrivilege(user, "Devoluciones", "editar") || hasPrivilege(user, "Gestión de Ventas", "editar");
  const canCreate = hasPrivilege(user, "Devoluciones", "crear") || hasPrivilege(user, "Gestión de Ventas", "crear");

  const {
    devoluciones,
    stats,
    politicas,
    loading,
    searchTerm,
    setSearchTerm,
    filtroEstado,
    setFiltroEstado,
    filtroMotivo,
    setFiltroMotivo,
    filtroResolucion,
    setFiltroResolucion,
    filteredDevoluciones,
    activeFilters,
    clearAllFilters,
    crearDevolucion,
    aprobarDevolucion,
    rechazarDevolucion,
    completarDevolucion,
    verificarElegibilidadVenta
  } = useDevoluciones();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedDevolucion, setSelectedDevolucion] = useState(null);

  const handleOpenDetail = (d) => {
    setSelectedDevolucion(d);
    setDetailModalOpen(true);
  };

  const handleOpenResolve = (d) => {
    setSelectedDevolucion(d);
    setDetailModalOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Devoluciones
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Gestión, trazabilidad y control de devoluciones según políticas de la empresa
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Registrar Devolución</span>
          </button>
        )}
      </div>

      {/* 4 Stat KPI Cards */}
      <DevolucionesStatsCards stats={stats} devoluciones={devoluciones} />

      {/* Filter and Action Bar Box - Estandarizado */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-4 sm:p-5 border border-gray-100 dark:border-gray-800 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar devolución por código, venta, cliente, motivo, resolución o producto..."
            className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs sm:text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-colors placeholder:text-gray-400 outline-none"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto flex-wrap sm:flex-nowrap">
          {/* Estado */}
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-3.5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs sm:text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-red-500/50 cursor-pointer w-full sm:w-auto outline-none font-medium"
          >
            <option value="Todos">Todos los estados</option>
            <option value="PENDIENTE">Pendientes</option>
            <option value="APROBADA">Aprobadas</option>
            <option value="COMPLETADA">Completadas</option>
            <option value="RECHAZADA">Rechazadas</option>
          </select>

          {/* Motivo */}
          <select
            value={filtroMotivo}
            onChange={(e) => setFiltroMotivo(e.target.value)}
            className="px-3.5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs sm:text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-red-500/50 cursor-pointer w-full sm:w-auto outline-none font-medium"
          >
            <option value="Todos">Todos los motivos</option>
            <option value="Comida en mal estado">Comida en mal estado</option>
            <option value="Pedido incorrecto">Pedido incorrecto</option>
          </select>

          {/* Resolución */}
          <select
            value={filtroResolucion}
            onChange={(e) => setFiltroResolucion(e.target.value)}
            className="px-3.5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs sm:text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-red-500/50 cursor-pointer w-full sm:w-auto outline-none font-medium"
          >
            <option value="Todos">Todas las resoluciones</option>
            <option value="Cambio de producto">Cambio de producto</option>
            <option value="Devolución de dinero">Devolución de dinero</option>
            <option value="Cambio de producto y devolución de dinero">Ambos (Cambio y Dinero)</option>
          </select>
        </div>
      </div>

      {/* Active Filter Badges (Solo se muestran si hay filtros aplicados) */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-xs px-2 py-0.5">
          <span className="text-gray-500 dark:text-gray-400 font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            FILTROS ACTIVOS:
          </span>
          <button
            onClick={clearAllFilters}
            className="text-red-500 hover:text-red-600 font-bold underline hover:no-underline text-xs mr-2 cursor-pointer"
          >
            Limpiar todos
          </button>
          {activeFilters.map((f) => (
            <span
              key={f.key}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/50 text-xs font-medium"
            >
              <span>{f.label}</span>
              <button
                onClick={f.onRemove}
                className="hover:bg-red-200/60 dark:hover:bg-red-900/60 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Content Table or Loader */}
      {loading ? (
        <ChazinLoader text="CARGANDO DEVOLUCIONES" size="md" />
      ) : (
        <DevolucionesTable
          devoluciones={filteredDevoluciones}
          onViewDetail={handleOpenDetail}
          onResolve={handleOpenResolve}
          canManage={canManage}
        />
      )}

      {/* Modal Detalle */}
      <DevolucionDetalleModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedDevolucion(null);
        }}
        devolucion={selectedDevolucion}
        onAprobar={aprobarDevolucion}
        onRechazar={rechazarDevolucion}
        onCompletar={completarDevolucion}
        canManage={canManage}
      />

      {/* Modal Registrar Nueva Devolución */}
      <NuevaDevolucionModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={crearDevolucion}
        onCheckElegibilidad={verificarElegibilidadVenta}
        politicas={politicas}
      />
    </div>
  );
}

