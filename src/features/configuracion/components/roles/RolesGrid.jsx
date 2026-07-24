import { Shield, Users, Check, Edit, ToggleLeft, ToggleRight } from "lucide-react";

const getRolAccent = (nombre) => {
  switch (nombre) {
    case "Administrador":
      return {
        bg: "from-purple-500 to-purple-700",
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
        badge: "bg-[#F05454]/10 text-[#F05454]"
      };
    default:
      return {
        bg: "from-blue-500 to-blue-700",
        icon: "bg-blue-100 dark:bg-blue-900/30",
        iconText: "text-blue-600 dark:text-blue-400",
        badge: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
      };
  }
};

export function RolesGrid({ roles = [], onOpenPermisos, onEdit, onToggleEstado }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {roles.map((rol) => {
        const accent = getRolAccent(rol.nombre);
        const isActivo = rol.estado === "Activo";

        return (
          <div
            key={rol.id}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl ${accent.icon} flex items-center justify-center shrink-0`}>
                    <Shield className={`w-6 h-6 ${accent.iconText}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">{rol.nombre}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          isActivo
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {rol.estado}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEdit(rol)}
                    title="Editar Nombre/Descripción"
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:text-gray-400 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onToggleEstado(rol.id)}
                    title={isActivo ? "Desactivar Rol" : "Activar Rol"}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:text-gray-400 transition-colors"
                  >
                    {isActivo ? (
                      <ToggleRight className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 min-h-[40px]">
                {rol.descripcion || "Sin descripción asignada"}
              </p>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400">
                  <span>Permisos asignados:</span>
                  <span className="text-gray-900 dark:text-gray-100">{rol.permisos?.length || 0}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                  {(rol.permisos || []).slice(0, 5).map((p) => (
                    <span
                      key={p}
                      className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md text-xs font-medium"
                    >
                      {p}
                    </span>
                  ))}
                  {(rol.permisos?.length || 0) > 5 && (
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-md text-xs font-medium">
                      +{(rol.permisos?.length || 0) - 5} más
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                <Users className="w-4 h-4 text-gray-400" />
                <span>{rol.usuarios || 0} Usuarios</span>
              </div>
              <button
                onClick={() => onOpenPermisos(rol)}
                className="text-xs font-bold text-[#F05454] hover:text-[#d84343] transition-colors"
              >
                Gestionar Permisos →
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
