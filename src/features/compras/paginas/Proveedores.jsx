import { useState } from "react";
import { Plus, Search, Building, Bell, Trash2 } from "lucide-react";
import { useProveedores } from "../hooks/useProveedores";
import { ProveedoresTable } from "../componentes/proveedores/ProveedoresTable";
import { ProveedorModal } from "../componentes/proveedores/ProveedorModal";
import { TrazabilidadProveedoresModal } from "../componentes/proveedores/TrazabilidadProveedoresModal";
import { PapeleraProveedoresView } from "../componentes/proveedores/PapeleraProveedoresView";

export function Proveedores() {
  const {
    proveedores,
    activosProveedores,
    papeleraProveedores,
    filteredProveedores,
    loading,
    searchTerm,
    setSearchTerm,
    filterEstado,
    setFilterEstado,
    eventos,
    unreadCount,
    createProveedor,
    updateProveedor,
    deleteProveedor,
    restoreProveedor,
    deleteDefinitivoProveedor,
    clearEventos,
    resetUnreadCount
  } = useProveedores();

  const [viewMode, setViewMode] = useState("activos"); // "activos" | "papelera"
  const [modalOpen, setModalOpen] = useState(false);
  const [trazabilidadOpen, setTrazabilidadOpen] = useState(false);
  const [editingProveedor, setEditingProveedor] = useState(null);

  const handleOpenTrazabilidad = () => {
    resetUnreadCount();
    setTrazabilidadOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingProveedor(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProveedor(p);
    setModalOpen(true);
  };

  const handleSave = async (form) => {
    let ok = false;
    if (editingProveedor) {
      ok = await updateProveedor(editingProveedor.id || editingProveedor.idProveedor, form);
    } else {
      ok = await createProveedor(form);
    }
    if (ok) {
      setModalOpen(false);
      setEditingProveedor(null);
    }
  };

  // Filtered suppliers based on view mode (in activos mode we show active or filtered)
  const displayProveedores = viewMode === "papelera"
    ? papeleraProveedores.filter((p) => {
        return (
          searchTerm === "" ||
          p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.nit?.includes(searchTerm) ||
          p.contacto?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      })
    : filteredProveedores.filter((p) => filterEstado !== "Inactivo" ? (p.estado === "Activo" || p.estado === 1) : true);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Building className="w-7 h-7 text-[#F05454]" />
            Gestión de Proveedores
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Administra la información de proveedores y contactos de suministro.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Trazabilidad Button */}
          <div className="relative">
            <button
              type="button"
              onClick={handleOpenTrazabilidad}
              className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-slate-700 dark:text-gray-200 font-medium text-sm shadow-xs flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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

          {/* New Supplier Button */}
          {viewMode === "activos" && (
            <button
              onClick={handleOpenCreate}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#F05454] hover:bg-[#d84343] text-white font-medium rounded-xl shadow-md transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Nuevo Proveedor</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW MODE: PAPELERA */}
      {viewMode === "papelera" ? (
        <PapeleraProveedoresView
          papeleraProveedores={papeleraProveedores}
          onVolverActivos={() => setViewMode("activos")}
          onRestaurarProveedor={restoreProveedor}
          onEliminarDefinitivoProveedor={deleteDefinitivoProveedor}
        />
      ) : (
        /* VIEW MODE: ACTIVOS */
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, NIT o contacto..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-[#F05454] focus:border-transparent transition-colors"
              />
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Estado:</span>
                <select
                  value={filterEstado}
                  onChange={(e) => setFilterEstado(e.target.value)}
                  className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-[#F05454]"
                >
                  <option value="Todos">Todos</option>
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>

              {/* Button to go to Papelera view directly from filter bar */}
              <button
                onClick={() => setViewMode("papelera")}
                className="px-3.5 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-gray-500" />
                <span>Papelera ({papeleraProveedores.length})</span>
              </button>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">Cargando proveedores...</div>
          ) : (
            <ProveedoresTable
              proveedores={displayProveedores}
              onEdit={handleOpenEdit}
              onDelete={deleteProveedor}
            />
          )}
        </div>
      )}

      {/* Modal Crear/Editar Proveedor */}
      <ProveedorModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingProveedor(null);
        }}
        onSave={handleSave}
        proveedor={editingProveedor}
      />

      {/* Modal Trazabilidad Proveedores */}
      <TrazabilidadProveedoresModal
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
