import { useState, useMemo } from "react";
import { Plus, Search, Building, Bell, Trash2, ClipboardList, CheckCircle2, XCircle } from "lucide-react";
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
    filterTipo,
    setFilterTipo,
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

  // Stats
  const stats = useMemo(() => {
    const total = proveedores.length;
    const activos = proveedores.filter((p) => p.estado === "Activo" || p.estado === 1).length;
    const inactivos = proveedores.filter((p) => p.estado === "Inactivo" || p.estado === 0).length;
    return { total, activos, inactivos };
  }, [proveedores]);

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

  // Pill button helper
  const PillButton = ({ label, active, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
        active
          ? "bg-[#2D3748] text-white shadow-sm"
          : "bg-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}
    >
      {label}
    </button>
  );

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
    <div className="p-4 sm:p-6 lg:p-8 w-full space-y-6">
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
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total */}
            <div className="flex items-center gap-4 bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-slate-500 dark:text-slate-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">registrados</p>
              </div>
            </div>

            {/* Activos */}
            <div className="flex items-center gap-4 bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">Activos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.activos}</p>
                <p className="text-xs text-green-500">en operación</p>
              </div>
            </div>

            {/* Inactivos */}
            <div className="flex items-center gap-4 bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-slate-400 dark:text-slate-500" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">Inactivos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.inactivos}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">suspendidos</p>
              </div>
            </div>
          </div>

          {/* Search + Filters Card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
            {/* Search bar row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre, NIT, email o contacto..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-[#F05454] focus:border-transparent transition-colors"
                />
              </div>

              {/* Papelera view button */}
              <button
                onClick={() => setViewMode("papelera")}
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors shrink-0"
              >
                <Trash2 className="w-4 h-4 text-gray-500" />
                <span>Papelera ({papeleraProveedores.length})</span>
              </button>
            </div>

            {/* Filter: Estado */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-[#F05454] mr-1">Filtrar por:</span>
              <div className="flex items-center bg-gray-50 dark:bg-gray-800 rounded-full p-0.5 border border-gray-200 dark:border-gray-700">
                <PillButton label="Todos los estados" active={filterEstado === "Todos"} onClick={() => setFilterEstado("Todos")} />
                <PillButton label="Activo" active={filterEstado === "Activo"} onClick={() => setFilterEstado("Activo")} />
                <PillButton label="Inactivo" active={filterEstado === "Inactivo"} onClick={() => setFilterEstado("Inactivo")} />
              </div>
            </div>

            {/* Filter: Tipo + resultados */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center bg-gray-50 dark:bg-gray-800 rounded-full p-0.5 border border-gray-200 dark:border-gray-700">
                <PillButton label="Todos los tipos" active={filterTipo === "Todos"} onClick={() => setFilterTipo("Todos")} />
                <PillButton label="P. Jurídica" active={filterTipo === "Jurídica"} onClick={() => setFilterTipo("Jurídica")} />
                <PillButton label="P. Natural" active={filterTipo === "Natural"} onClick={() => setFilterTipo("Natural")} />
              </div>
              <span className="text-sm text-gray-400 dark:text-gray-500 italic ml-auto">
                {displayProveedores.length} resultado{displayProveedores.length !== 1 ? "s" : ""}
              </span>
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
