import { useState } from "react";
import { Plus, Search, Shield } from "lucide-react";
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
    toggleEstadoRol
  } = useRoles();

  const [rolModalOpen, setRolModalOpen] = useState(false);
  const [editingRol, setEditingRol] = useState(null);

  const [permisosModalOpen, setPermisosModalOpen] = useState(false);
  const [permisosRol, setPermisosRol] = useState(null);

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

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Shield className="w-7 h-7 text-[#F05454]" />
            Gestión de Roles y Permisos
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Define los roles de acceso al sistema y configura sus permisos correspondientes.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#F05454] hover:bg-[#d84343] text-white font-medium rounded-xl shadow-md transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Rol</span>
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por rol o descripción..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-[#F05454] focus:border-transparent transition-colors"
          />
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
          Total Roles: {roles.length}
        </div>
      </div>

      {/* Roles Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">Cargando roles...</div>
      ) : (
        <RolesGrid
          roles={filteredRoles}
          onOpenPermisos={handleOpenPermisos}
          onEdit={handleOpenEdit}
          onToggleEstado={toggleEstadoRol}
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
