import { useState } from "react";
import { Plus, Search, Shield, ShieldCheck, ShieldAlert, Users, LayoutGrid, List } from "lucide-react";
import { useRoles } from "../hooks/useRoles";
import { RolesTable } from "../componentes/roles/RolesTable";
import { RolesGrid } from "../componentes/roles/RolesGrid";
import { RolModal } from "../componentes/roles/RolModal";
import { PermisosModal } from "../componentes/roles/PermisosModal";
import { ChazinLoader } from "@/shared/components/ui/ChazinLoader";

export function Roles() {
  const {
    roles,
    filteredRoles,
    loading,
    searchTerm,
    setSearchTerm,
    createRol,
    updateRol,
    updatePermisos,
    toggleEstadoRol,
    deleteRol
  } = useRoles();

  const [rolModalOpen, setRolModalOpen] = useState(false);
  const [editingRol, setEditingRol] = useState(null);

  const [permisosModalOpen, setPermisosModalOpen] = useState(false);
  const [permisosRol, setPermisosRol] = useState(null);
  const [filterEstado, setFilterEstado] = useState("Todos");
  const [viewMode, setViewMode] = useState("table"); // "table" | "grid"

  const totalRoles = roles.length;
  const rolesActivos = roles.filter((r) => r.estado === "Activo" || r.estado === 1 || r.estado === "1").length;
  const rolesInactivos = roles.filter((r) => r.estado === "Inactivo" || r.estado === 0 || r.estado === "0").length;
  const totalUsuariosAsignados = roles.reduce((acc, r) => acc + (r.usuarios || 0), 0);

  const rolesToDisplay = filteredRoles.filter((r) => {
    if (filterEstado === "Activo") return r.estado === "Activo" || r.estado === 1 || r.estado === "1";
    if (filterEstado === "Inactivo") return r.estado === "Inactivo" || r.estado === 0 || r.estado === "0";
    return true;
  });

  const handleOpenCreate = () => {
    setEditingRol(null);
    setRolModalOpen(true);
  };

  const handleOpenEdit = (rol) => {
    setEditingRol(rol);
    setRolModalOpen(true);
  };

  const handleSaveRol = async (nombre, descripcion) => {
    let ok = false;
    if (editingRol) {
      ok = await updateRol(editingRol.id, nombre, descripcion);
    } else {
      ok = await createRol(nombre, descripcion);
    }
    if (ok) {
      setRolModalOpen(false);
      setEditingRol(null);
    }
  };

  const handleOpenPermisos = (rol) => {
    setPermisosRol(rol);
    setPermisosModalOpen(true);
  };

  const handleSavePermisos = async (permisos) => {
    if (permisosRol) {
      const ok = await updatePermisos(permisosRol.id, permisos);
      if (ok) {
        setPermisosModalOpen(false);
        setPermisosRol(null);
      }
    }
  };

  const statCards = [
    {
      id: "total",
      title: "Total Roles",
      value: totalRoles,
      subtext: "configurados",
      subtextColor: "text-gray-400 dark:text-gray-500",
      icon: Shield,
      bgColor: "bg-blue-50 dark:bg-blue-950/40",
      iconColor: "text-blue-500 dark:text-blue-400"
    },
    {
      id: "activos",
      title: "Roles Activos",
      value: rolesActivos,
      subtext: "en operación",
      subtextColor: "text-emerald-600 dark:text-emerald-400",
      icon: ShieldCheck,
      bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
      iconColor: "text-emerald-500 dark:text-emerald-400"
    },
    {
      id: "inactivos",
      title: "Roles Inactivos",
      value: rolesInactivos,
      subtext: "deshabilitados",
      subtextColor: "text-rose-500 dark:text-rose-400",
      icon: ShieldAlert,
      bgColor: "bg-rose-50 dark:bg-rose-950/40",
      iconColor: "text-rose-500 dark:text-rose-400"
    },
    {
      id: "usuarios",
      title: "Usuarios Asignados",
      value: totalUsuariosAsignados,
      subtext: "con rol activo",
      subtextColor: "text-purple-600 dark:text-purple-400",
      icon: Users,
      bgColor: "bg-purple-50 dark:bg-purple-950/40",
      iconColor: "text-purple-500 dark:text-purple-400"
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Gestión de Roles
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Administra los roles del personal, sus descripciones y los permisos de acceso al sistema
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
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-4 sm:p-5 border border-gray-100 dark:border-gray-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar rol..."
            className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs sm:text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-colors placeholder:text-gray-400 outline-none"
          />
        </div>

        {/* Filter Dropdown & Primary Action Button */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs sm:text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-red-500/50 cursor-pointer w-full sm:w-auto outline-none font-medium"
          >
            <option value="Todos">Todos los estados</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>

          {/* Toggle View Mode */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-2xl p-1 border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setViewMode("table")}
              title="Vista en tabla"
              className={`p-2 rounded-xl transition-all ${viewMode === "table" ? "bg-white dark:bg-gray-700 text-[#F05454] shadow-xs" : "text-gray-400 hover:text-gray-600"}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              title="Vista en tarjetas"
              className={`p-2 rounded-xl transition-all ${viewMode === "grid" ? "bg-white dark:bg-gray-700 text-[#F05454] shadow-xs" : "text-gray-400 hover:text-gray-600"}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2 w-full sm:w-auto shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nuevo Rol</span>
          </button>
        </div>
      </div>

      {/* Main Content: Table by default or Grid */}
      {loading ? (
        <ChazinLoader text="CARGANDO ROLES" size="md" />
      ) : viewMode === "grid" ? (
        <RolesGrid
          roles={rolesToDisplay}
          onOpenPermisos={handleOpenPermisos}
          onEdit={handleOpenEdit}
          onToggleEstado={toggleEstadoRol}
          onDelete={deleteRol}
        />
      ) : (
        <RolesTable
          roles={rolesToDisplay}
          onOpenPermisos={handleOpenPermisos}
          onEdit={handleOpenEdit}
          onToggleEstado={toggleEstadoRol}
          onDelete={deleteRol}
        />
      )}

      {/* Modals */}
      <RolModal
        isOpen={rolModalOpen}
        onClose={() => setRolModalOpen(false)}
        onSave={handleSaveRol}
        rol={editingRol}
      />

      <PermisosModal
        isOpen={permisosModalOpen}
        onClose={() => setPermisosModalOpen(false)}
        onSave={handleSavePermisos}
        rol={permisosRol}
      />
    </div>
  );
}

export default Roles;
