import { useState, useMemo } from "react";
import { Plus, Search, UtensilsCrossed, Clock, Flame, CheckCircle2 } from "lucide-react";
import { useGestionProduccion } from "../hooks/useGestionProduccion";
import { ProduccionTable } from "../componentes/ProduccionTable";
import { NuevaOrdenModal } from "../componentes/NuevaOrdenModal";
import { VerOrdenModal } from "../componentes/VerOrdenModal";
import { ChazinLoader } from "@/shared/components/ui/ChazinLoader";

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
    const porAprobar = ordenes.filter((o) => o.estado === "Por Aprobar" || o.estadoAprobacion === "PENDIENTE" || o.estado === "En Cola").length;
    const enPreparacion = ordenes.filter((o) => o.estado === "En Preparación").length;
    const listos = ordenes.filter((o) => o.estado === "Listo" || o.estado === "Listos" || o.estado === "Despachado" || o.estado === "Entregado").length;
    const total = ordenes.length;

    return { porAprobar, enPreparacion, listos, total };
  }, [ordenes]);

  const statCards = [
    {
      id: "total",
      title: "Total Órdenes",
      value: stats.total,
      subtext: "registradas",
      subtextColor: "text-gray-400 dark:text-gray-500",
      icon: UtensilsCrossed,
      bgColor: "bg-blue-50 dark:bg-blue-950/40",
      iconColor: "text-blue-500 dark:text-blue-400"
    },
    {
      id: "pendientes",
      title: "Por Aprobar / En Cola",
      value: stats.porAprobar,
      subtext: "esperando inicio",
      subtextColor: "text-amber-600 dark:text-amber-400",
      icon: Clock,
      bgColor: "bg-amber-50 dark:bg-amber-950/40",
      iconColor: "text-amber-500 dark:text-amber-400"
    },
    {
      id: "preparacion",
      title: "En Preparación",
      value: stats.enPreparacion,
      subtext: "en cocina activa",
      subtextColor: "text-purple-600 dark:text-purple-400",
      icon: Flame,
      bgColor: "bg-purple-50 dark:bg-purple-950/40",
      iconColor: "text-purple-500 dark:text-purple-400"
    },
    {
      id: "listos",
      title: "Órdenes Listas",
      value: stats.listos,
      subtext: "preparadas / entregadas",
      subtextColor: "text-emerald-600 dark:text-emerald-400",
      icon: CheckCircle2,
      bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
      iconColor: "text-emerald-500 dark:text-emerald-400"
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Gestión de Producción
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Administra las órdenes de cocina, estados de preparación y despachos en tiempo real
        </p>
      </div>

      {/* 4 Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <div
              key={card.id}
              className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs flex items-center gap-4 transition-all hover:shadow-sm"
            >
              <div className={`w-12 h-12 rounded-2xl ${card.bgColor} ${card.iconColor} flex items-center justify-center shrink-0`}>
                <IconComponent className="w-6 h-6" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">
                  {card.title}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {card.value}
                  </span>
                  <span className={`text-xs font-medium ${card.subtextColor}`}>
                    {card.subtext}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter and Action Bar Box - En una sola línea */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-4 sm:p-5 border border-gray-100 dark:border-gray-800 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar orden, platillo o responsable..."
            className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs sm:text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-colors placeholder:text-gray-400 outline-none"
          />
        </div>

        {/* Filter Dropdowns & Primary Action Button */}
        <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap sm:flex-nowrap">
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs sm:text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-red-500/50 cursor-pointer w-full sm:w-auto outline-none font-medium"
          >
            <option value="Todos">Todos los estados</option>
            <option value="Por Aprobar">Por Aprobar</option>
            <option value="En Cola">En Cola</option>
            <option value="En Preparación">En Preparación</option>
            <option value="Listo">Listo</option>
            <option value="Despachado">Despachado</option>
            <option value="Entregado">Entregado</option>
            <option value="Rechazado">Rechazado</option>
          </select>

          <select
            value={filterPrioridad}
            onChange={(e) => setFilterPrioridad(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs sm:text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-red-500/50 cursor-pointer w-full sm:w-auto outline-none font-medium"
          >
            <option value="Todas">Todas las prioridades</option>
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Normal">Normal</option>
          </select>

          <button
            type="button"
            onClick={() => setNuevaModalOpen(true)}
            className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2 w-full sm:w-auto shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nueva Orden</span>
          </button>
        </div>
      </div>

      {/* Main Content Table */}
      {loading ? (
        <ChazinLoader text="CARGANDO ÓRDENES DE PRODUCCIÓN" size="md" />
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

export default GestionProduccion;
