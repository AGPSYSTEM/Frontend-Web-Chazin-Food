import { Shield, Users, Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

const getRolAccent = (nombre) => {
  switch (nombre) {
    case "Administrador":
      return {
        bg: "from-purple-600 to-purple-800",
        icon: "bg-purple-100 dark:bg-purple-900/30",
        iconText: "text-purple-600 dark:text-purple-400",
        badge: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
      };
    case "Cocinero":
      return {
        bg: "from-green-500 to-green-700",
        icon: "bg-green-100 dark:bg-green-900/30",
        iconText: "text-green-600 dark:text-green-400",
        badge: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
      };
    case "Cliente":
      return {
        bg: "from-[#F05454] to-[#c0392b]",
        icon: "bg-[#F05454]/10",
        iconText: "text-[#F05454]",
        badge: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
      };
    default:
      return {
        bg: "from-gray-400 to-gray-600",
        icon: "bg-gray-100 dark:bg-gray-700",
        iconText: "text-gray-500",
        badge: "bg-gray-100 dark:bg-gray-700 text-gray-600"
      };
  }
};

export function RolesGrid({ roles = [], onOpenPermisos, onEdit, onToggleEstado, onDelete }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {roles.map((rol) => {
        const accent = getRolAccent(rol.nombre);
        const permisosCount = rol.permisos?.length || 0;

        return (
          <div key={rol.id} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden hover:shadow-md transition-shadow">
            {/* Card hero strip */}
            <div className={`bg-gradient-to-r ${accent.bg} px-5 py-4 flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">{rol.nombre}</h3>
                  <p className="text-white/70 text-xs">{permisosCount} permisos</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${rol.estado === "Activo" ? "bg-white/20 text-white" : "bg-black/20 text-white/80"}`}>
                {rol.estado}
              </span>
            </div>

            {/* Card body */}
            <div className="p-4 sm:p-5">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{rol.descripcion}</p>

              {/* Stats row */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Usuarios</p>
                  <p className="font-bold text-gray-900 dark:text-gray-100 mt-0.5">{rol.usuarios || 0}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Permisos</p>
                  <p className="font-bold text-gray-900 dark:text-gray-100 mt-0.5">{permisosCount}</p>
                </div>
              </div>

              {/* Permission tags */}
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Permisos Asignados</p>
                <div className="flex flex-wrap gap-1.5">
                  {(rol.permisos || []).slice(0, 3).map((permiso, i) => (
                    <span key={i} className={`px-3 py-1 rounded-full text-xs font-medium ${accent.badge}`}>
                      {permiso}
                    </span>
                  ))}
                  {permisosCount > 3 && (
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs font-medium">
                      +{permisosCount - 3} más
                    </span>
                  )}
                  {permisosCount === 0 && (
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-400 rounded-full text-xs">Sin permisos</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-gray-100 dark:border-gray-700/60 pt-3 flex items-center justify-center gap-1.5 text-[10px] lg:text-[11px] font-medium whitespace-nowrap">
                <button
                  onClick={() => onOpenPermisos(rol)}
                  className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors shrink-0"
                  title="Permisos del rol"
                >
                  <Shield className="w-3 h-3 stroke-[2]" />
                  <span>Permisos</span>
                </button>

                <span className="text-gray-300 dark:text-gray-700 select-none shrink-0">|</span>

                <button
                  onClick={() => onEdit(rol)}
                  className="flex items-center gap-1 text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0"
                  title="Editar rol"
                >
                  <Edit className="w-3 h-3 stroke-[2]" />
                  <span>Editar</span>
                </button>

                <span className="text-gray-300 dark:text-gray-700 select-none shrink-0">|</span>

                <button
                  onClick={() => onToggleEstado(rol.id)}
                  className={`flex items-center gap-1 transition-colors shrink-0 ${
                    rol.estado === "Activo"
                      ? "text-amber-600 dark:text-amber-400 hover:text-amber-700"
                      : "text-emerald-600 dark:text-emerald-400 hover:text-emerald-700"
                  }`}
                  title={rol.estado === "Activo" ? "Desactivar rol" : "Activar rol"}
                >
                  {rol.estado === "Activo" ? (
                    <ToggleRight className="w-3 h-3 stroke-[2] text-amber-500" />
                  ) : (
                    <ToggleLeft className="w-3 h-3 stroke-[2] text-emerald-500" />
                  )}
                  <span>{rol.estado === "Activo" ? "Desactivar" : "Activar"}</span>
                </button>

                {onDelete && (
                  <>
                    <span className="text-gray-300 dark:text-gray-700 select-none shrink-0">|</span>
                    <button
                      onClick={() => onDelete(rol.id, rol.nombre)}
                      className="flex items-center justify-center text-red-500 hover:text-red-600 transition-colors shrink-0 p-0.5"
                      title="Eliminar rol"
                    >
                      <Trash2 className="w-3 h-3 stroke-[2]" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
