import { Shield, Users, Edit, Trash2, ToggleLeft, ToggleRight, Key } from "lucide-react";

const MODULOS_PERMISOS_VALIDOS = [
  "Dashboard",
  "Roles",
  "Usuarios",
  "Categoría Insumos",
  "Insumos",
  "Proveedores",
  "Gestión de Compras",
  "Categoría Productos",
  "Productos",
  "Fichas Técnicas",
  "Gestión de Producción",
  "Punto de Venta",
  "Clientes",
  "Gestión de Ventas"
];

export function RolesGrid({ roles = [], onEdit, onToggleEstado, onDelete, canEdit = true, canDelete = true }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {roles.map((rol) => {
        // Filtrar módulos válidos
        const modulosAsignados = (rol.permisos || []).filter((p) => MODULOS_PERMISOS_VALIDOS.includes(p));
        const privilegiosGranularesCount = (rol.permisos || []).filter((p) => p.includes(":")).length;
        const modulosCount = modulosAsignados.length;
        const isAdministrador = (rol.nombre || "").toLowerCase() === "administrador" || String(rol.id) === "1";
        const isActivo = rol.estado === "Activo" || rol.estado === 1 || rol.estado === "1";

        return (
          <div
            key={rol.id}
            className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Header de la tarjeta: Limpio, luminoso y con los colores oficiales del proyecto */}
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-[#F05454] border border-rose-100/80 dark:border-rose-900/40 flex items-center justify-center shrink-0">
                    <Shield className="w-6 h-6 stroke-[2]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base sm:text-lg truncate leading-tight">
                      {rol.nombre}
                    </h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-medium mt-0.5 truncate">
                      {isAdministrador ? "Rol del Sistema" : "Rol Operativo"}
                    </p>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 border transition-colors ${
                    isActivo
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/40"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700"
                  }`}
                >
                  {isActivo ? "Activo" : "Inactivo"}
                </span>
              </div>

              {/* Descripción del rol */}
              <div className="py-4">
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-2 min-h-[38px] leading-relaxed">
                  {rol.descripcion || "Sin descripción asignada"}
                </p>

                {/* Métricas: Usuarios y Módulos con fondo suave #f8fafc */}
                <div className="grid grid-cols-2 gap-3 my-4">
                  <div className="bg-[#f8fafc] dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-2xl p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
                      <Users className="w-3.5 h-3.5 text-gray-400" />
                      <span>Usuarios</span>
                    </div>
                    <p className="font-extrabold text-base text-gray-900 dark:text-gray-100 mt-0.5">
                      {rol.usuarios || 0}
                    </p>
                  </div>

                  <div className="bg-[#f8fafc] dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-2xl p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
                      <Key className="w-3.5 h-3.5 text-gray-400" />
                      <span>Módulos</span>
                    </div>
                    <p className="font-extrabold text-base text-gray-900 dark:text-gray-100 mt-0.5">
                      {modulosCount}
                    </p>
                  </div>
                </div>

                {/* Módulos asignados: Badges neutros y armónicos */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Módulos Asignados
                    </span>
                    {privilegiosGranularesCount > 0 && (
                      <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                        {privilegiosGranularesCount} privilegios
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5 min-h-[46px] items-start">
                    {modulosAsignados.slice(0, 3).map((permiso, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-[#f1f5f9] dark:bg-gray-800 text-slate-700 dark:text-gray-300 border border-slate-200/60 dark:border-gray-700 rounded-full text-xs font-semibold"
                      >
                        {permiso}
                      </span>
                    ))}
                    {modulosCount > 3 && (
                      <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200/60 dark:border-gray-700 rounded-full text-xs font-semibold">
                        +{modulosCount - 3} más
                      </span>
                    )}
                    {modulosCount === 0 && (
                      <span className="px-2.5 py-1 bg-gray-50 dark:bg-gray-800 text-gray-400 rounded-full text-xs font-medium italic">
                        Sin módulos asignados
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones de la tarjeta */}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-3.5 mt-2 flex items-center justify-between">
              {canEdit ? (
                <button
                  type="button"
                  onClick={() => onEdit(rol)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors font-bold text-xs cursor-pointer"
                  title="Editar Rol, Permisos y Privilegios"
                >
                  <Edit className="w-3.5 h-3.5 text-[#F05454] stroke-[2.2]" />
                  <span>Editar</span>
                </button>
              ) : <div />}

              <div className="flex items-center gap-1.5">
                {!isAdministrador && canEdit && (
                  <button
                    type="button"
                    onClick={() => onToggleEstado(rol.id)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      isActivo
                        ? "text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                        : "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                    }`}
                    title={isActivo ? "Inactivar rol" : "Activar rol"}
                  >
                    {isActivo ? (
                      <ToggleRight className="w-4 h-4 text-amber-500" />
                    ) : (
                      <ToggleLeft className="w-4 h-4 text-emerald-500" />
                    )}
                    <span>{isActivo ? "Desactivar" : "Activar"}</span>
                  </button>
                )}

                {onDelete && !isAdministrador && canDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(rol.id, rol.nombre)}
                    className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer ml-1"
                    title="Eliminar rol"
                  >
                    <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
