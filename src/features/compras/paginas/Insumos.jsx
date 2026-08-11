import { useState } from "react";
import { Plus, Search, Bell, FlaskConical, Package } from "lucide-react";
import { useInsumos } from "../hooks/useInsumos";
import { InsumosStatsCards } from "../componentes/insumos/InsumosStatsCards";
import { InsumosTable } from "../componentes/insumos/InsumosTable";
import { InsumosPreparadosAccordion } from "../componentes/insumos/InsumosPreparadosAccordion";
import { InsumoModal } from "../componentes/insumos/InsumoModal";
import { InsumoPreparadoModal } from "../componentes/insumos/InsumoPreparadoModal";
import { TrazabilidadModal } from "../componentes/insumos/TrazabilidadModal";
import { PapeleraReciclajeView } from "../componentes/insumos/PapeleraReciclajeView";
import { VerInsumoModal } from "../componentes/insumos/VerInsumoModal";

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
  const [modalBaseOpen, setModalBaseOpen] = useState(false);
  const [modalPreparadoOpen, setModalPreparadoOpen] = useState(false);
  const [editingInsumo, setEditingInsumo] = useState(null);
  const [viewingInsumo, setViewingInsumo] = useState(null);

  // Separate base insumos and prepared insumos
  const insumosBase = filteredInsumos.filter((i) => i.tipo !== "Preparado");
  const insumosPreparados = insumos.filter((i) => i.tipo === "Preparado");

  const handleOpenTrazabilidad = () => {
    resetUnreadCount();
    setTrazabilidadOpen(true);
  };

  const handleOpenCreateBase = () => {
    setEditingInsumo(null);
    setModalBaseOpen(true);
  };

  const handleOpenCreatePreparado = () => {
    setEditingInsumo(null);
    setModalPreparadoOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingInsumo(item);
    if (item.tipo === "Preparado") {
      setModalPreparadoOpen(true);
    } else {
      setModalBaseOpen(true);
    }
  };

  const handleSaveBase = async (form) => {
    let ok = false;
    if (editingInsumo) {
      ok = await updateInsumo(editingInsumo.id, form);
    } else {
      ok = await createInsumo({ ...form, tipo: "Base" });
    }
    if (ok) {
      setModalBaseOpen(false);
      setEditingInsumo(null);
    }
  };

  const handleSavePreparado = async (form) => {
    let ok = false;
    if (editingInsumo) {
      ok = await updateInsumo(editingInsumo.id, form);
    } else {
      ok = await createInsumo({ ...form, tipo: "Preparado" });
    }
    if (ok) {
      setModalPreparadoOpen(false);
      setEditingInsumo(null);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1e293b] dark:text-gray-100">
            Gestión de Insumos
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Administra el inventario de insumos del negocio
          </p>
        </div>

        {/* Button: Trazabilidad with Red Badge */}
        <div className="relative self-start sm:self-auto">
          <button
            type="button"
            onClick={handleOpenTrazabilidad}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-slate-700 dark:text-gray-200 font-medium text-sm shadow-xs flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Bell className="w-4 h-4 text-slate-600 dark:text-gray-300" />
            <span>Trazabilidad</span>
          </button>

          {/* Red Circle Badge Counter */}
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-[#F05454] text-white font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center shadow-xs animate-pulse">
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      {/* VIEW MODE: PAPELERA */}
      {viewMode === "papelera" ? (
        <div className="space-y-6">
          {/* Top filter bar inside trash view matching Image 2 */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar insumo..."
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm focus:ring-2 focus:ring-[#F05454]/50 focus:border-transparent transition-colors placeholder:text-gray-400"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={filterCategoria}
                onChange={(e) => setFilterCategoria(e.target.value)}
                className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-[#F05454]/50 cursor-pointer w-full sm:w-auto"
              >
                <option value="Todas">Todos</option>
                {categorias.map((c) => (
                  <option key={c.id || c.nombre} value={c.nombre}>
                    {c.nombre}
                  </option>
                ))}
              </select>

              <select
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
                className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-[#F05454]/50 cursor-pointer w-full sm:w-auto"
              >
                <option value="Todos los tipos">Todos los tipos</option>
                <option value="Base">Insumo Base</option>
                <option value="Preparado">Insumo Preparado</option>
              </select>

              {/* Trazabilidad button in trash bar */}
              <div className="relative">
                <button
                  type="button"
                  onClick={handleOpenTrazabilidad}
                  className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-slate-700 dark:text-gray-200 font-medium text-sm shadow-xs flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                >
                  <Bell className="w-4 h-4 text-slate-600 dark:text-gray-300" />
                  <span>Trazabilidad</span>
                </button>
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#F05454] text-white font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                    {unreadCount}
                  </span>
                )}
              </div>
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
          {/* Stats Cards */}
          <InsumosStatsCards insumos={insumos} />

          {/* Filter and Action Box */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
            {/* Search + Filters row */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar insumo..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm focus:ring-2 focus:ring-[#F05454]/50 focus:border-transparent transition-colors placeholder:text-gray-400"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <select
                  value={filterCategoria}
                  onChange={(e) => setFilterCategoria(e.target.value)}
                  className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-[#F05454]/50 cursor-pointer w-full sm:w-auto"
                >
                  <option value="Todas">Todos</option>
                  {categorias.map((c) => (
                    <option key={c.id || c.nombre} value={c.nombre}>
                      {c.nombre}
                    </option>
                  ))}
                </select>

                <select
                  value={filterTipo}
                  onChange={(e) => setFilterTipo(e.target.value)}
                  className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-[#F05454]/50 cursor-pointer w-full sm:w-auto"
                >
                  <option value="Todos los tipos">Todos los tipos</option>
                  <option value="Base">Insumo Base</option>
                  <option value="Preparado">Insumo Preparado</option>
                </select>
              </div>
            </div>

            {/* Action Buttons row */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
              <button
                onClick={handleOpenCreatePreparado}
                className="w-full sm:w-1/2 flex items-center justify-center gap-2 py-3 px-6 bg-[#2c3e50] hover:bg-[#1f2d3a] text-white font-medium rounded-2xl shadow-xs transition-colors"
              >
                <FlaskConical className="w-5 h-5" />
                <span>Insumo Preparado</span>
              </button>

              <button
                onClick={handleOpenCreateBase}
                className="w-full sm:w-1/2 flex items-center justify-center gap-2 py-3 px-6 bg-[#F05454] hover:bg-[#d84343] text-white font-medium rounded-2xl shadow-xs transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Nuevo Insumo</span>
              </button>
            </div>
          </div>

          {/* Accordion: Insumos Preparados */}
          {(filterTipo === "Todos los tipos" || filterTipo === "Preparado") && (
            <InsumosPreparadosAccordion
              insumosPreparados={insumosPreparados}
              onEdit={handleOpenEdit}
              onDelete={deletePreparado}
            />
          )}

          {/* Table: Base Insumos */}
          {(filterTipo === "Todos los tipos" || filterTipo === "Base") && (
            <>
              {loading ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">Cargando insumos...</div>
              ) : (
                <InsumosTable
                  insumos={insumosBase}
                  onEdit={handleOpenEdit}
                  onDelete={deleteInsumo}
                  onView={(item) => setViewingInsumo(item)}
                />
              )}
            </>
          )}
        </div>
      )}

      {/* Base Insumo Modal */}
      <InsumoModal
        isOpen={modalBaseOpen}
        onClose={() => {
          setModalBaseOpen(false);
          setEditingInsumo(null);
        }}
        onSave={handleSaveBase}
        insumo={editingInsumo}
        categorias={categorias}
        proveedores={proveedores}
      />

      {/* Prepared Insumo Modal */}
      <InsumoPreparadoModal
        isOpen={modalPreparadoOpen}
        onClose={() => {
          setModalPreparadoOpen(false);
          setEditingInsumo(null);
        }}
        onSave={handleSavePreparado}
        insumoPreparado={editingInsumo}
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
