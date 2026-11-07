import { Users, UserCheck, UserX, Shield } from "lucide-react";

export function UsuarioStatsCards({ usuarios = [] }) {
  const total = usuarios.length;
  const activos = usuarios.filter((u) => u.estado === "Activo" || u.estado === 1 || u.estado === "1").length;
  const inactivos = usuarios.filter((u) => u.estado === "Inactivo" || u.estado === 0 || u.estado === "0").length;
  const rolesEnUso = new Set(
    usuarios
      .map((u) => u.nombreRol || u.rol?.nombre || u.rol || u.idRol)
      .filter(Boolean)
  ).size;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-700/60 shadow-sm flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-[#F05454] flex items-center justify-center shrink-0">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Usuarios</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{total}</h3>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-700/60 shadow-sm flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <UserCheck className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Activos</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{activos}</h3>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-700/60 shadow-sm flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0">
          <UserX className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Inactivos</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{inactivos}</h3>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-700/60 shadow-sm flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400 flex items-center justify-center shrink-0">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Roles en Uso</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{rolesEnUso}</h3>
        </div>
      </div>
    </div>
  );
}
