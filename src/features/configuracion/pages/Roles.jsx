import { useState } from "react";
import { Plus, Search, Shield, Users } from "lucide-react";
import { useRoles } from "../hooks/useRoles";
import { RolesGrid } from "../components/roles/RolesGrid";
import { RolModal } from "../components/roles/RolModal";
import { PermisosModal } from "../components/roles/PermisosModal";

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

  const totalRoles = roles.length;
  const rolesActivos = roles.filter((r) => r.estado === "Activo").length;
  const totalUsuariosAsignados = roles.reduce((acc, r) => acc + (r.usuarios || 0), 0);

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

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 bg-gray-50 dark:bg-gray-950 min-h-full flex flex-col items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#F05454]"></div>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium animate-pulse">Cargando roles desde la base de datos...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-50 dark:bg-gray-950 min-h-full">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-gray-900 dark:text-gray-100">Gestión de Roles</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Administra los roles y permisos del sistema</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F05454]/10 rounded-xl flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-[#F05454]" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Roles</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalRoles}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Roles Activos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{rolesActivos}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Usuarios Asignados</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalUsuariosAsignados}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar + Nuevo Rol */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-4 mb-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar rol..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-[#F05454] focus:border-transparent transition-colors text-sm"
            />
          </div>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#F05454] hover:bg-[#d94444] text-white rounded-xl text-sm font-medium transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Rol</span>
          </button>
        </div>
      </div>

      {/* Role Cards */}
      <RolesGrid
        roles={filteredRoles}
        onOpenPermisos={handleOpenPermisos}
        onEdit={handleOpenEdit}
        onToggleEstado={toggleEstadoRol}
        onDelete={deleteRol}
      />

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
