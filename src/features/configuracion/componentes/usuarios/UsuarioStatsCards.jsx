import { Users, UserCheck, UserX, Shield } from "lucide-react";

export function UsuarioStatsCards({ usuarios = [] }) {
  const total = usuarios.length;
  const activos = usuarios.filter((u) => u.estado === "Activo").length;
  const inactivos = usuarios.filter((u) => u.estado === "Inactivo").length;
  const admins = usuarios.filter((u) => u.rolNombre.toLowerCase() === "administrador").length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Usuarios</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{total}</h3>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0">
          <UserCheck className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Usuarios Activos</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{activos}</h3>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
          <UserX className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Usuarios Inactivos</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{inactivos}</h3>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Administradores</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{admins}</h3>
        </div>
      </div>
    </div>
  );
}
