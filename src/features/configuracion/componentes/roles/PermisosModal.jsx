import { useState, useEffect } from "react";
import { X, Shield, Check, ChevronDown, ChevronRight, LayoutDashboard, Settings, ShoppingCart, ChefHat, TrendingUp } from "lucide-react";

const GRUPOS_PERMISOS = [
  {
    id: "dashboard",
    nombre: "Dashboard",
    icon: LayoutDashboard,
    isGroup: false,
    permiso: "Dashboard"
  },
  {
    id: "configuracion",
    nombre: "Configuración",
    icon: Settings,
    isGroup: true,
    parentPermiso: "Configuración",
    subPermisos: ["Roles", "Usuarios"]
  },
  {
    id: "compras",
    nombre: "Compras",
    icon: ShoppingCart,
    isGroup: true,
    parentPermiso: "Compras",
    subPermisos: ["Categoría Insumos", "Insumos", "Proveedores", "Gestión de Compras"]
  },
  {
    id: "produccion",
    nombre: "Producción",
    icon: ChefHat,
    isGroup: true,
    parentPermiso: "Producción",
    subPermisos: ["Categoría Productos", "Productos", "Fichas Técnicas", "Gestión de Producción"]
  },
  {
    id: "ventas",
    nombre: "Ventas",
    icon: TrendingUp,
    isGroup: true,
    parentPermiso: "Ventas",
    subPermisos: ["Punto de Venta", "Clientes", "Gestión de Ventas"]
  }
];

// Helper to count total sub-permissions across all groups
const TOTAL_SUB_PERMISOS = GRUPOS_PERMISOS.reduce((acc, g) => {
  return acc + (g.isGroup ? g.subPermisos.length : 1);
}, 0);

const getHeaderStyle = (nombre = "") => {
  const n = nombre.toLowerCase();
  if (n.includes("admin")) {
    return "bg-gradient-to-r from-[#a855f7] via-[#8b3dff] to-[#7924d6] dark:from-purple-800 dark:to-purple-950";
  }
  if (n.includes("cocinero") || n.includes("cocina")) {
    return "bg-gradient-to-r from-[#00c853] via-[#00a340] to-[#008030] dark:from-emerald-700 dark:to-emerald-900";
  }
  if (n.includes("vendedor")) {
    return "bg-gradient-to-r from-[#475569] via-[#334155] to-[#1e293b] dark:from-slate-700 dark:to-slate-900";
  }
  if (n.includes("cliente")) {
    return "bg-gradient-to-r from-[#F05454] via-[#ef4444] to-[#c62828] dark:from-rose-700 dark:to-rose-950";
  }
  return "bg-gradient-to-r from-[#3b82f6] via-[#2563eb] to-[#1d4ed8]";
};

export function PermisosModal({ isOpen, onClose, onSave, rol }) {
  const [editingPermisos, setEditingPermisos] = useState([]);
  const [expandedGroups, setExpandedGroups] = useState({});

  useEffect(() => {
    if (rol) {
      setEditingPermisos([...(rol.permisos || [])]);
      // Default: collapse all groups on modal open
      setExpandedGroups({});
    } else {
      setEditingPermisos([]);
      setExpandedGroups({});
    }
  }, [rol, isOpen]);

  if (!isOpen || !rol) return null;

  const toggleExpand = (groupId) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Toggle single standalone permission (e.g. Dashboard)
  const toggleSinglePermiso = (permiso) => {
    setEditingPermisos((prev) =>
      prev.includes(permiso) ? prev.filter((p) => p !== permiso) : [...prev, permiso]
    );
  };

  // Toggle entire category group (e.g. Configuración -> Roles, Usuarios)
  const toggleGroupAll = (group) => {
    const allGroupItems = [group.parentPermiso, ...group.subPermisos];
    const currentSelectedInGroup = editingPermisos.filter((p) => group.subPermisos.includes(p));
    const isAllSelected = currentSelectedInGroup.length === group.subPermisos.length;

    if (isAllSelected) {
      // Remove all items of this group
      setEditingPermisos((prev) => prev.filter((p) => !allGroupItems.includes(p)));
    } else {
      // Add all items of this group
      setEditingPermisos((prev) => {
        const next = new Set([...prev, ...allGroupItems]);
        return Array.from(next);
      });
    }
  };

  // Toggle individual sub-permission inside a group
  const toggleSubPermiso = (group, subPermiso) => {
    setEditingPermisos((prev) => {
      const exists = prev.includes(subPermiso);
      let updated = exists ? prev.filter((p) => p !== subPermiso) : [...prev, subPermiso];

      // Sync parent module permission presence
      const remainingSelected = updated.filter((p) => group.subPermisos.includes(p));
      if (remainingSelected.length > 0) {
        if (!updated.includes(group.parentPermiso)) {
          updated.push(group.parentPermiso);
        }
      } else {
        updated = updated.filter((p) => p !== group.parentPermiso);
      }

      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(editingPermisos);
  };

  const headerStyle = getHeaderStyle(rol.nombre);

  // Count total distinct sub-permissions selected
  const totalSelectedSubCount = GRUPOS_PERMISOS.reduce((acc, g) => {
    if (g.isGroup) {
      return acc + editingPermisos.filter((p) => g.subPermisos.includes(p)).length;
    }
    return acc + (editingPermisos.includes(g.permiso) ? 1 : 0);
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] border border-gray-100 dark:border-gray-800">
        {/* Header */}
        <div className={`${headerStyle} p-5 sm:p-6 flex items-center justify-between text-white shrink-0`}>
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white shrink-0 border border-white/20">
              <Shield className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white leading-tight">{rol.nombre}</h2>
              <p className="text-xs text-white/90 mt-0.5 font-normal">Editar permisos del rol</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/90 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-3">
            <div className="pb-1 flex items-center justify-between">
              <span className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 font-medium">
                {totalSelectedSubCount} de {TOTAL_SUB_PERMISOS} módulos seleccionados
              </span>
            </div>

            <div className="space-y-2.5">
              {GRUPOS_PERMISOS.map((grupo) => {
                const IconComponent = grupo.icon;

                // Handle Standalone Item (e.g. Dashboard)
                if (!grupo.isGroup) {
                  const checked = editingPermisos.includes(grupo.permiso);
                  return (
                    <div
                      key={grupo.id}
                      onClick={() => toggleSinglePermiso(grupo.permiso)}
                      className={`w-full flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                        checked
                          ? "border-[#a7f3d0] dark:border-emerald-700/60 bg-[#ecfdf5] dark:bg-emerald-950/30"
                          : "border-[#e2e8f0] dark:border-gray-800 bg-[#f8fafc] dark:bg-gray-800/40 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent className={`w-5 h-5 ${checked ? "text-[#047857] dark:text-emerald-400" : "text-slate-400"}`} />
                        <span className={`text-sm ${checked ? "font-semibold text-[#047857] dark:text-emerald-300" : "font-medium text-[#475569] dark:text-gray-300"}`}>
                          {grupo.nombre}
                        </span>
                      </div>
                      {checked ? (
                        <div className="w-7 h-7 rounded-full bg-[#00c853] text-white flex items-center justify-center shrink-0 shadow-2xs">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-[#e2e8f0] dark:bg-gray-700/80 text-[#94a3b8] dark:text-gray-400 flex items-center justify-center shrink-0">
                          <X className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                      )}
                    </div>
                  );
                }

                // Handle Collapsible Group Item (e.g. Configuración, Compras, Producción, Ventas)
                const isExpanded = !!expandedGroups[grupo.id];
                const selectedSubCount = editingPermisos.filter((p) => grupo.subPermisos.includes(p)).length;
                const isAllSelected = selectedSubCount === grupo.subPermisos.length;
                const isPartial = selectedSubCount > 0 && !isAllSelected;

                return (
                  <div
                    key={grupo.id}
                    className={`rounded-2xl border transition-all overflow-hidden ${
                      isAllSelected
                        ? "border-[#a7f3d0] dark:border-emerald-700/60 bg-[#f0fdf4] dark:bg-emerald-950/20"
                        : isPartial
                        ? "border-amber-200 dark:border-amber-800/60 bg-amber-50/40 dark:bg-amber-950/20"
                        : "border-[#e2e8f0] dark:border-gray-800 bg-[#f8fafc] dark:bg-gray-800/40"
                    }`}
                  >
                    {/* Category Group Header */}
                    <div className="flex items-center justify-between p-3.5 sm:p-4 select-none">
                      {/* Left: Expand Arrow + Icon + Title + Selected Badge Count */}
                      <div
                        onClick={() => toggleExpand(grupo.id)}
                        className="flex items-center gap-3 flex-1 cursor-pointer min-w-0"
                      >
                        <button
                          type="button"
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-gray-200 transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-slate-500" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          )}
                        </button>

                        <IconComponent
                          className={`w-5 h-5 shrink-0 ${
                            isAllSelected
                              ? "text-[#047857] dark:text-emerald-400"
                              : isPartial
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-slate-400"
                          }`}
                        />

                        <span
                          className={`text-sm truncate ${
                            isAllSelected
                              ? "font-bold text-[#047857] dark:text-emerald-300"
                              : isPartial
                              ? "font-bold text-amber-800 dark:text-amber-300"
                              : "font-semibold text-[#475569] dark:text-gray-300"
                          }`}
                        >
                          {grupo.nombre}
                        </span>

                        {/* Selected Permisos Count Badge beside title */}
                        {selectedSubCount > 0 && (
                          <span
                            className={`px-2 py-0.5 text-xs font-bold rounded-full text-white shadow-2xs shrink-0 ${
                              isAllSelected ? "bg-[#00c853]" : "bg-amber-500"
                            }`}
                            title={`${selectedSubCount} permisos seleccionados`}
                          >
                            {selectedSubCount}
                          </span>
                        )}
                      </div>

                      {/* Right: Toggle ALL Checkbox for this Group */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleGroupAll(grupo);
                        }}
                        className="ml-2 cursor-pointer focus:outline-none"
                        title={isAllSelected ? "Deseleccionar todos" : "Seleccionar todos"}
                      >
                        {isAllSelected ? (
                          <div className="w-7 h-7 rounded-full bg-[#00c853] text-white flex items-center justify-center shrink-0 shadow-2xs">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        ) : isPartial ? (
                          <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                            <span className="font-bold text-xs leading-none">-</span>
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-[#e2e8f0] dark:bg-gray-700/80 text-[#94a3b8] dark:text-gray-400 flex items-center justify-center shrink-0 hover:bg-gray-300">
                            <X className="w-3.5 h-3.5 stroke-[2.5]" />
                          </div>
                        )}
                      </button>
                    </div>

                    {/* Sub-permissions Dropdown List */}
                    {isExpanded && (
                      <div className="px-4 pb-3 pt-1 space-y-1.5 border-t border-gray-100 dark:border-gray-800 bg-white/70 dark:bg-gray-900/50">
                        {grupo.subPermisos.map((subP) => {
                          const subChecked = editingPermisos.includes(subP);
                          return (
                            <div
                              key={subP}
                              onClick={() => toggleSubPermiso(grupo, subP)}
                              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                                subChecked
                                  ? "border-emerald-300 dark:border-emerald-700/60 bg-[#ecfdf5] dark:bg-emerald-950/40"
                                  : "border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-800/40 hover:bg-gray-50 dark:hover:bg-gray-800/70"
                              }`}
                            >
                              <span
                                className={`text-xs sm:text-sm pl-4 relative before:content-['•'] before:absolute before:left-1 before:text-slate-400 ${
                                  subChecked
                                    ? "font-semibold text-emerald-800 dark:text-emerald-300"
                                    : "font-medium text-slate-600 dark:text-gray-300"
                                }`}
                              >
                                {subP}
                              </span>

                              {subChecked ? (
                                <div className="w-5 h-5 rounded-full bg-[#00c853] text-white flex items-center justify-center shrink-0">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-400 flex items-center justify-center shrink-0">
                                  <X className="w-2.5 h-2.5 stroke-[2]" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex items-center justify-center gap-4 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-full border border-gray-200/90 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#F05454] hover:bg-[#d94444] text-white text-sm font-semibold transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Guardar Permisos</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
