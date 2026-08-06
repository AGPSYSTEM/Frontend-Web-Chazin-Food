import { useState, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import { useGestionProduccion } from "../hooks/useGestionProduccion";
import { ProduccionTable } from "../componentes/ProduccionTable";
import { NuevaOrdenModal } from "../componentes/NuevaOrdenModal";
import { VerOrdenModal } from "../componentes/VerOrdenModal";

export function GestionProduccion() {
  const {
    ordenes,
    filteredOrdenes,
    loading,
    searchTerm,
    setSearchTerm,
    filterEstado,
    setFilterEstado,
    filterPrioridad,
    setFilterPrioridad,
    createOrden,
    updateEstado,
    deleteOrden
  } = useGestionProduccion();

  const [nuevaModalOpen, setNuevaModalOpen] = useState(false);
  const [selectedOrden, setSelectedOrden] = useState(null);

  // Dynamic stat counts
  const stats = useMemo(() => {
    const enCola = ordenes.filter((o) => o.estado === "En Cola").length;
    const enPreparacion = ordenes.filter((o) => o.estado === "En Preparación").length;
    const listos = ordenes.filter((o) => o.estado === "Listo" || o.estado === "Listos").length;
    const total = ordenes.length;

    return { enCola, enPreparacion, listos, total };
  }, [ordenes]);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Gestión de Producción
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Administra las órdenes de producción en tiempo real
        </p>
      </div>

      {/* Separator */}
      <hr className="border-gray-200 dark:border-gray-700" />

      {/* 4 Stat Cards - 2x2 Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: En Cola */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-xs space-y-2">
          <p className="text-sm font-medium text-gray-400 dark:text-gray-500">En Cola</p>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {stats.enCola}
            </span>
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-gray-300 ml-2.5 mb-1" />
          </div>
        </div>

        {/* Card 2: En Preparación */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-xs space-y-2">
          <p className="text-sm font-medium text-gray-400 dark:text-gray-500">En Preparación</p>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {stats.enPreparacion}
            </span>
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-400 ml-2.5 mb-1" />
          </div>
        </div>

        {/* Card 3: Listos */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-xs space-y-2">
          <p className="text-sm font-medium text-gray-400 dark:text-gray-500">Listos</p>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-green-600 dark:text-green-400">
              {stats.listos}
            </span>
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-400 ml-2.5 mb-1" />
          </div>
        </div>

        {/* Card 4: Total del Día */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-xs space-y-2">
          <p className="text-sm font-medium text-gray-400 dark:text-gray-500">Total del Día</p>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-[#F05454] dark:text-red-400">
              {stats.total}
            </span>
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-300 ml-2.5 mb-1" />
          </div>
        </div>
      </div>

      {/* Search & Filter Bar Container */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar orden, platillo o responsable..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-[#F05454] focus:border-transparent transition-colors"
            />
          </div>

          {/* Filter Estado */}
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-[#F05454] focus:border-transparent transition-colors shrink-0 cursor-pointer"
          >
            <option value="Todos">Todos los estados</option>
            <option value="En Cola">En Cola</option>
            <option value="En Preparación">En Preparación</option>
            <option value="Listo">Listo</option>
            <option value="Despachado">Despachado</option>
            <option value="Entregado">Entregado</option>
          </select>

          {/* Filter Prioridad */}
          <select
            value={filterPrioridad}
            onChange={(e) => setFilterPrioridad(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-[#F05454] focus:border-transparent transition-colors shrink-0 cursor-pointer"
          >
            <option value="Todas">Todas las prioridades</option>
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Normal">Normal</option>
          </select>

          {/* Nueva Orden Button */}
          <button
            type="button"
            onClick={() => setNuevaModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#F05454] hover:bg-[#d84343] text-white font-medium rounded-xl shadow-md transition-colors shrink-0"
          >
            <Plus className="w-5 h-5" />
            <span>Nueva Orden</span>
          </button>
        </div>
      </div>

      {/* CRUD Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Cargando órdenes de producción...
        </div>
      ) : (
        <ProduccionTable
          ordenes={filteredOrdenes}
          onUpdateEstado={updateEstado}
          onDelete={deleteOrden}
          onViewDetails={(orden) => setSelectedOrden(orden)}
        />
      )}

      {/* Modals */}
      <NuevaOrdenModal
        isOpen={nuevaModalOpen}
        onClose={() => setNuevaModalOpen(false)}
        onCreate={createOrden}
      />

      <VerOrdenModal
        isOpen={Boolean(selectedOrden)}
        onClose={() => setSelectedOrden(null)}
        orden={selectedOrden}
      />
    </div>
  );
}
