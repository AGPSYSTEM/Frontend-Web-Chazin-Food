import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { useGestionProduccion } from "../hooks/useGestionProduccion";
import { EstadoSeccion } from "../componentes/EstadoSeccion";
import { NuevaOrdenModal } from "../componentes/NuevaOrdenModal";
import { VerOrdenModal } from "../componentes/VerOrdenModal";

export function GestionProduccion() {
  const {
    ordenes,
    loading,
    createOrden,
    updateEstado
  } = useGestionProduccion();

  const [nuevaModalOpen, setNuevaModalOpen] = useState(false);
  const [selectedOrden, setSelectedOrden] = useState(null);

  // Group orders by status
  const ordenesEnCola = useMemo(
    () => ordenes.filter((o) => o.estado === "En Cola"),
    [ordenes]
  );
  const ordenesEnPreparacion = useMemo(
    () => ordenes.filter((o) => o.estado === "En Preparación"),
    [ordenes]
  );
  const ordenesListo = useMemo(
    () => ordenes.filter((o) => o.estado === "Listo" || o.estado === "Listos"),
    [ordenes]
  );
  const ordenesDespachado = useMemo(
    () => ordenes.filter((o) => o.estado === "Despachado"),
    [ordenes]
  );
  const ordenesEntregado = useMemo(
    () => ordenes.filter((o) => o.estado === "Entregado"),
    [ordenes]
  );

  // Summary stats
  const stats = useMemo(() => {
    return {
      enCola: ordenesEnCola.length,
      enPreparacion: ordenesEnPreparacion.length,
      listos: ordenesListo.length,
      total: ordenes.length
    };
  }, [ordenesEnCola, ordenesEnPreparacion, ordenesListo, ordenes]);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Gestión de Producción
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Administra las órdenes de producción en tiempo real
          </p>
        </div>

        {/* Top Right Action Button */}
        <button
          type="button"
          onClick={() => setNuevaModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#F05454] hover:bg-[#d84343] text-white font-medium rounded-2xl shadow-sm text-sm transition-all shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Nueva Orden</span>
        </button>
      </div>

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

      {/* Main Accordion Sections Container */}
      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Cargando órdenes de producción...
        </div>
      ) : (
        <div className="space-y-4 pt-2">
          {/* Section 1: En Cola */}
          <EstadoSeccion
            titulo="En Cola"
            ordenes={ordenesEnCola}
            onUpdateEstado={updateEstado}
            onViewDetails={(orden) => setSelectedOrden(orden)}
            defaultExpanded={true}
          />

          {/* Section 2: En Preparación */}
          <EstadoSeccion
            titulo="En Preparación"
            ordenes={ordenesEnPreparacion}
            onUpdateEstado={updateEstado}
            onViewDetails={(orden) => setSelectedOrden(orden)}
            defaultExpanded={true}
          />

          {/* Section 3: Listo */}
          <EstadoSeccion
            titulo="Listo"
            ordenes={ordenesListo}
            onUpdateEstado={updateEstado}
            onViewDetails={(orden) => setSelectedOrden(orden)}
            defaultExpanded={true}
          />

          {/* Section 4: Despachado */}
          <EstadoSeccion
            titulo="Despachado"
            ordenes={ordenesDespachado}
            onUpdateEstado={updateEstado}
            onViewDetails={(orden) => setSelectedOrden(orden)}
            defaultExpanded={true}
          />

          {/* Section 5: Entregado */}
          <EstadoSeccion
            titulo="Entregado"
            ordenes={ordenesEntregado}
            onUpdateEstado={updateEstado}
            onViewDetails={(orden) => setSelectedOrden(orden)}
            defaultExpanded={true}
          />
        </div>
      )}

      {/* Nueva Orden Modal */}
      <NuevaOrdenModal
        isOpen={nuevaModalOpen}
        onClose={() => setNuevaModalOpen(false)}
        onCreate={createOrden}
      />

      {/* Ver Detalle Orden Modal */}
      <VerOrdenModal
        isOpen={Boolean(selectedOrden)}
        onClose={() => setSelectedOrden(null)}
        orden={selectedOrden}
      />
    </div>
  );
}
