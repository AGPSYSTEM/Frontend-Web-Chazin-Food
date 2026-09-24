import { useState, useMemo } from "react";
import { Plus, Search, Building2, Bell, Trash2, ClipboardList, CheckCircle2, XCircle, Briefcase } from "lucide-react";
import { useProveedores } from "../hooks/useProveedores";
import { ProveedoresTable } from "../componentes/proveedores/ProveedoresTable";
import { ProveedorModal } from "../componentes/proveedores/ProveedorModal";
import { TrazabilidadProveedoresModal } from "../componentes/proveedores/TrazabilidadProveedoresModal";
import { PapeleraProveedoresView } from "../componentes/proveedores/PapeleraProveedoresView";
import { ChazinLoader } from "@/shared/components/ui/ChazinLoader";

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

  // Stats calculation
  const stats = useMemo(() => {
    const total = proveedores.length;
    const activos = proveedores.filter((p) => p.estado === "Activo" || p.estado === 1).length;
    const inactivos = proveedores.filter((p) => p.estado === "Inactivo" || p.estado === 0).length;
    const juridicas = proveedores.filter((p) => p.tipoPersona === "Jurídica" || p.idTipoDocumento === 3 || p.tipoDocumento === "NIT").length;
    return { total, activos, inactivos, juridicas };
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

  // Filtered suppliers based on view mode
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

  const statCards = [
    {
      id: "total",
      title: "Total Proveedores",
      value: stats.total,
      subtext: "registrados",
      subtextColor: "text-gray-400 dark:text-gray-500",
      icon: ClipboardList,
      bgColor: "bg-blue-50 dark:bg-blue-950/40",
      iconColor: "text-blue-500 dark:text-blue-400"
    },
    {
      id: "activos",
      title: "Proveedores Activos",
      value: stats.activos,
      subtext: "en operación",
      subtextColor: "text-emerald-600 dark:text-emerald-400",
      icon: CheckCircle2,
      bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
      iconColor: "text-emerald-500 dark:text-emerald-400"
    },
    {
      id: "inactivos",
      title: "Inactivos",
      value: stats.inactivos,
      subtext: "suspendidos",
      subtextColor: "text-rose-500 dark:text-rose-400",
      icon: XCircle,
      bgColor: "bg-rose-50 dark:bg-rose-950/40",
      iconColor: "text-rose-500 dark:text-rose-400"
    },
    {
      id: "juridicas",
      title: "Personas Jurídicas",
      value: stats.juridicas,
      subtext: "empresas con NIT",
      subtextColor: "text-purple-600 dark:text-purple-400",
      icon: Briefcase,
      bgColor: "bg-purple-50 dark:bg-purple-950/40",
      iconColor: "text-purple-500 dark:text-purple-400"
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Gestión de Proveedores
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Administra la información de proveedores, contactos comerciales y acuerdos de suministro
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
                placeholder="Buscar en papelera..."
                className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs sm:text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-colors placeholder:text-gray-400 outline-none"
              />
            </div>
            <button
              onClick={() => setViewMode("activos")}
              className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-xs sm:text-sm rounded-2xl transition-colors cursor-pointer"
            >
              Volver a Proveedores Activos
            </button>
          </div>

          <PapeleraProveedoresView
            papeleraProveedores={papeleraProveedores}
            onVolverActivos={() => setViewMode("activos")}
            onRestaurarProveedor={restoreProveedor}
            onEliminarDefinitivoProveedor={deleteDefinitivoProveedor}
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
                placeholder="Buscar por nombre, NIT, email o contacto..."
                className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs sm:text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-colors placeholder:text-gray-400 outline-none"
              />
            </div>

            {/* Filter Dropdowns, Papelera, Trazabilidad & Primary Action Button */}
            <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap sm:flex-nowrap">
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs sm:text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-red-500/50 cursor-pointer w-full sm:w-auto outline-none font-medium"
              >
                <option value="Todos">Todos los estados</option>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>

              <select
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
                className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs sm:text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-red-500/50 cursor-pointer w-full sm:w-auto outline-none font-medium"
              >
                <option value="Todos">Todos los tipos</option>
                <option value="Jurídica">P. Jurídica</option>
                <option value="Natural">P. Natural</option>
              </select>

              <button
                type="button"
                onClick={() => setViewMode("papelera")}
                className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-slate-700 dark:text-gray-200 font-medium text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer shrink-0"
              >
                <Trash2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span>Papelera ({papeleraProveedores.length})</span>
              </button>

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
                <span>Nuevo Proveedor</span>
              </button>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <ChazinLoader text="CARGANDO PROVEEDORES" size="md" />
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

export default Proveedores;
