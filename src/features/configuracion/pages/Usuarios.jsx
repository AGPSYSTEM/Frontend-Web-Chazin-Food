import { useState } from "react";
import { Plus, Search, Users } from "lucide-react";
import { useUsuarios } from "../hooks/useUsuarios";
import { UsuarioStatsCards } from "../components/usuarios/UsuarioStatsCards";
import { UsuariosTable } from "../components/usuarios/UsuariosTable";
import { UsuarioModal } from "../components/usuarios/UsuarioModal";
import { UsuarioPasswordModal } from "../components/usuarios/UsuarioPasswordModal";

const ROLES_FILTRO = ["Todos", "Administrador", "Cocinero", "Cliente"];
const ESTADOS_FILTRO = ["Todos", "Activo", "Inactivo"];

export function Usuarios() {
  const {
    usuarios,
    filteredUsuarios,
    rolesList,
    loading,
    searchTerm,
    setSearchTerm,
    filterRol,
    setFilterRol,
    filterEstado,
    setFilterEstado,
    createUsuario,
    updateUsuario,
    deleteUsuario,
    changePassword
  } = useUsuarios();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordUsuario, setPasswordUsuario] = useState(null);

  const handleOpenCreate = () => {
    setEditingUsuario(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (usuario) => {
    setEditingUsuario(usuario);
    setModalOpen(true);
  };

  const handleSaveUsuario = async (form) => {
    let success = false;
    if (editingUsuario) {
      success = await updateUsuario(editingUsuario.id, form);
    } else {
      success = await createUsuario(form);
    }
    if (success) {
      setModalOpen(false);
      setEditingUsuario(null);
    }
  };

  const handleOpenPassword = (usuario) => {
    setPasswordUsuario(usuario);
    setPasswordModalOpen(true);
  };

  const handleSavePassword = async (password) => {
    if (passwordUsuario) {
      const success = await changePassword(passwordUsuario.id, password);
      if (success) {
        setPasswordModalOpen(false);
        setPasswordUsuario(null);
      }
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Users className="w-7 h-7 text-[#F05454]" />
            Gestión de Usuarios
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Administra las cuentas de usuario, asignación de roles y estados.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#F05454] hover:bg-[#d84343] text-white font-medium rounded-xl shadow-md transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {/* Stats */}
      <UsuarioStatsCards usuarios={usuarios} />

      {/* Filter bar */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, correo o documento..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-[#F05454] focus:border-transparent transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Rol:</span>
            <select
              value={filterRol}
              onChange={(e) => setFilterRol(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-[#F05454]"
            >
              {ROLES_FILTRO.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Estado:</span>
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-[#F05454]"
            >
              {ESTADOS_FILTRO.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">Cargando usuarios...</div>
      ) : (
        <UsuariosTable
          usuarios={filteredUsuarios}
          onEdit={handleOpenEdit}
          onDelete={deleteUsuario}
          onChangePassword={handleOpenPassword}
        />
      )}

      {/* Modals */}
      <UsuarioModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveUsuario}
        usuario={editingUsuario}
        rolesList={rolesList}
      />

      <UsuarioPasswordModal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        onSave={handleSavePassword}
        usuario={passwordUsuario}
      />
    </div>
  );
}
