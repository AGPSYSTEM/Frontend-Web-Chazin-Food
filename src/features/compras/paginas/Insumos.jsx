import { useState } from "react";
import { Plus, Search, Bell } from "lucide-react";
import { useInsumos } from "../hooks/useInsumos";
import { InsumosStatsCards } from "../componentes/insumos/InsumosStatsCards";
import { InsumosTable } from "../componentes/insumos/InsumosTable";
import { InsumoModal } from "../componentes/insumos/InsumoModal";
import { TrazabilidadModal } from "../componentes/insumos/TrazabilidadModal";
import { PapeleraReciclajeView } from "../componentes/insumos/PapeleraReciclajeView";
import { VerInsumoModal } from "../componentes/insumos/VerInsumoModal";
import { ChazinLoader } from "@/shared/components/ui/ChazinLoader";

export function Insumos() {
  const {
    insumos,
    filteredInsumos,
    categorias,
    proveedores,
    loading,
    searchTerm,
    setSearchTerm,
    filterCategoria,
    setFilterCategoria,
    eventos,
    unreadCount,
    papeleraInsumos,
    papeleraPreparados,
    createInsumo,
    updateInsumo,
    deleteInsumo,
    deletePreparado,
    restoreInsumo,
    deleteDefinitivoInsumo,
    clearEventos,
    resetUnreadCount
  } = useInsumos();

  const [viewMode, setViewMode] = useState("activos"); // "activos" | "papelera"
  const [filterTipo, setFilterTipo] = useState("Todos los tipos");
  const [trazabilidadOpen, setTrazabilidadOpen] = useState(false);
  const [modalInsumoOpen, setModalInsumoOpen] = useState(false);
  const [editingInsumo, setEditingInsumo] = useState(null);
  const [viewingInsumo, setViewingInsumo] = useState(null);

  // Filter unified insumos (base + prepared) according to selected type filter
  const itemsToShow = filteredInsumos.filter((item) => {
    if (filterTipo === "Base") return item.tipo !== "Preparado";
    if (filterTipo === "Preparado") return item.tipo === "Preparado";
    return true;
  });

  const handleOpenTrazabilidad = () => {
    resetUnreadCount();
    setTrazabilidadOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingInsumo(null);
    setModalInsumoOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingInsumo(item);
    setModalInsumoOpen(true);
  };

  const handleDeleteItem = async (id, nombre, tipo) => {
    if (tipo === "Preparado") {
      await deletePreparado(id, nombre);
    } else {
      await deleteInsumo(id, nombre);
    }
  };

  const handleSaveInsumo = async (form) => {
    let ok = false;
    if (editingInsumo) {
      ok = await updateInsumo(editingInsumo.id || editingInsumo.idInsumo, form);
    } else {
      ok = await createInsumo(form);
    }
    if (ok) {
      setModalInsumoOpen(false);
      setEditingInsumo(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Gestión de Insumos
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Administra el inventario de insumos del negocio y sus adiciones disponibles
        </p>
      </div>

      {/* 4 Stat Cards Grid */}
      <InsumosStatsCards insumos={insumos} />

      {/* VIEW MODE: PAPELERA */}
      {viewMode === "papelera" ? (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-4 sm:p-5 border border-gray-100 dark:border-gray-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar insumo en papelera..."
                className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs sm:text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-colors placeholder:text-gray-400 outline-none"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setViewMode("activos")}
                className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-xs sm:text-sm rounded-2xl transition-colors cursor-pointer"
              >
                Volver a Insumos Activos
              </button>
            </div>
          </div>

          <PapeleraReciclajeView
            papeleraInsumos={papeleraInsumos}
            papeleraPreparados={papeleraPreparados}
            onVolverActivos={() => setViewMode("activos")}
            onRestaurarInsumo={restoreInsumo}
            onEliminarDefinitivoInsumo={deleteDefinitivoInsumo}
          />
        </div>
      ) : (
        /* VIEW MODE: ACTIVOS */
        <div className="space-y-6">
          {/* Filter and Action Bar Box - En una sola línea */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-4 sm:p-5 border border-gray-100 dark:border-gray-800 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar insumo..."
                className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs sm:text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-colors placeholder:text-gray-400 outline-none"
              />
            </div>

            {/* Filter Dropdowns, Trazabilidad & Primary Action Button */}
            <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap sm:flex-nowrap">
              <select
                value={filterCategoria}
                onChange={(e) => setFilterCategoria(e.target.value)}
                className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs sm:text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-red-500/50 cursor-pointer w-full sm:w-auto outline-none font-medium"
              >
                <option value="Todas">Todas las categorías</option>
                {categorias.map((c) => (
                  <option key={c.id || c.nombre} value={c.nombre}>
                    {c.nombre}
                  </option>
                ))}
              </select>

              <select
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
                className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs sm:text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-red-500/50 cursor-pointer w-full sm:w-auto outline-none font-medium"
              >
                <option value="Todos los tipos">Todos los tipos</option>
                <option value="Base">Insumo Base</option>
                <option value="Preparado">Insumo Preparado</option>
              </select>

              <div className="relative">
                <button
                  type="button"
                  onClick={handleOpenTrazabilidad}
                  className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-slate-700 dark:text-gray-200 font-medium text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer shrink-0"
                >
                  <Bell className="w-4 h-4 text-slate-600 dark:text-gray-300" />
                  <span>Trazabilidad</span>
                </button>
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#F05454] text-white font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center shadow-xs animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </div>

              <button
                onClick={handleOpenCreate}
                className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2 w-full sm:w-auto shrink-0"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Nuevo Insumo</span>
              </button>
            </div>
          </div>

          {/* Unified Table: Base + Preparados */}
          {loading ? (
            <ChazinLoader text="CARGANDO INSUMOS" size="md" />
          ) : (
            <InsumosTable
              insumos={itemsToShow}
              onEdit={handleOpenEdit}
              onDelete={handleDeleteItem}
              onView={(item) => setViewingInsumo(item)}
            />
          )}
        </div>
      )}

      {/* Unified Insumo Modal (Base + Preparado + Adición) */}
      <InsumoModal
        isOpen={modalInsumoOpen}
        onClose={() => {
          setModalInsumoOpen(false);
          setEditingInsumo(null);
        }}
        onSave={handleSaveInsumo}
        insumo={editingInsumo}
        categorias={categorias}
        proveedores={proveedores}
        insumosDisponibles={insumos.filter((i) => i.tipo !== "Preparado")}
      />

      {/* Detail View Modal */}
      <VerInsumoModal
        isOpen={!!viewingInsumo}
        onClose={() => setViewingInsumo(null)}
        insumo={viewingInsumo}
      />

      {/* Trazabilidad Modal */}
      <TrazabilidadModal
        isOpen={trazabilidadOpen}
        onClose={() => setTrazabilidadOpen(false)}
        eventos={eventos}
        onClearAll={clearEventos}
        onOpenPapelera={() => {
          setTrazabilidadOpen(false);
          setViewMode("papelera");
        }}
      />
    </div>
  );
}

export default Insumos;
