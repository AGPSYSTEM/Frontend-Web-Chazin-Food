import { useState, useEffect, useMemo } from "react";
import {
  Check,
  X,
  ChevronDown,
  ChevronRight,
  Search,
  Sparkles,
  ShieldCheck,
  RotateCcw
} from "lucide-react";
import {
  GRUPOS_PERMISOS,
  ACCIONES_PRIVILEGIOS,
  TOTAL_MODULOS,
  parsePermisosYPrivilegios,
  buildPermisosArray,
  getPlantillaRol
} from "../../utils/privilegiosUtils";

export function PermisosSelector({ value = [], onChange, scrollable = false }) {
  const [stateMap, setStateMap] = useState(() => parsePermisosYPrivilegios(value));
  const [expandedGroups, setExpandedGroups] = useState({ configuracion: true, compras: true, produccion: true, ventas: true });
  const [searchFilter, setSearchFilter] = useState("");

  // Sincronizar si value cambia desde fuera
  useEffect(() => {
    setStateMap(parsePermisosYPrivilegios(value));
  }, [value]);

  const updateStateAndEmit = (newState) => {
    setStateMap(newState);
    if (onChange) {
      onChange(buildPermisosArray(newState));
    }
  };

  const toggleExpand = (groupId) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Alternar selección de un módulo completo
  const toggleModulo = (moduloId, defaultAcciones = ["ver", "crear", "editar", "eliminar"]) => {
    const current = stateMap[moduloId] || { activo: false, privilegios: {} };
    const willBeActive = !current.activo;

    const nextPrivilegios = {};
    defaultAcciones.forEach((acc) => {
      nextPrivilegios[acc] = willBeActive;
    });

    const nextState = {
      ...stateMap,
      [moduloId]: {
        activo: willBeActive,
        privilegios: nextPrivilegios
      }
    };
    updateStateAndEmit(nextState);
  };

  // Alternar un privilegio específico dentro de un módulo
  const togglePrivilegio = (moduloId, accionId) => {
    const current = stateMap[moduloId] || { activo: false, privilegios: {} };
    const curPrivs = { ...(current.privilegios || {}) };
    const nextVal = !curPrivs[accionId];
    curPrivs[accionId] = nextVal;

    // Verificar si queda al menos un privilegio activo
    const hasAnyActive = Object.values(curPrivs).some(Boolean);

    const nextState = {
      ...stateMap,
      [moduloId]: {
        activo: hasAnyActive,
        privilegios: curPrivs
      }
    };
    updateStateAndEmit(nextState);
  };

  // Alternar todos los módulos de un grupo
  const toggleGrupoCompleto = (grupo) => {
    if (!grupo.isGroup) {
      toggleModulo(grupo.permiso, grupo.accionesDisponibles);
      return;
    }

    const subIds = grupo.subPermisos.map((s) => s.id);
    const allSelected = subIds.every((id) => stateMap[id]?.activo);

    const nextState = { ...stateMap };
    subIds.forEach((id) => {
      const subDef = grupo.subPermisos.find((s) => s.id === id);
      const accs = subDef?.accionesDisponibles || ["ver", "crear", "editar", "eliminar"];
      const privs = {};
      accs.forEach((a) => {
        privs[a] = !allSelected;
      });
      nextState[id] = {
        activo: !allSelected,
        privilegios: privs
      };
    });

    updateStateAndEmit(nextState);
  };

  // Plantillas rápidas
  const aplicarPlantilla = (tipo) => {
    const templateState = getPlantillaRol(tipo);
    updateStateAndEmit(templateState);
  };

  // Conteo total de módulos y privilegios activos
  const stats = useMemo(() => {
    let modulosActivos = 0;
    let privilegiosActivos = 0;

    Object.values(stateMap).forEach((mod) => {
      if (mod?.activo) {
        modulosActivos += 1;
        Object.values(mod.privilegios || {}).forEach((p) => {
          if (p) privilegiosActivos += 1;
        });
      }
    });

    return { modulosActivos, privilegiosActivos };
  }, [stateMap]);

  // Filtrado de grupos y submódulos según búsqueda
  const gruposFiltrados = useMemo(() => {
    if (!searchFilter.trim()) return GRUPOS_PERMISOS;
    const q = searchFilter.toLowerCase();

    return GRUPOS_PERMISOS.map((g) => {
      if (!g.isGroup) {
        return g.nombre.toLowerCase().includes(q) ? g : null;
      }
      const matchedSubs = g.subPermisos.filter((s) => s.nombre.toLowerCase().includes(q) || s.descripcion?.toLowerCase().includes(q));
      if (matchedSubs.length > 0 || g.nombre.toLowerCase().includes(q)) {
        return {
          ...g,
          subPermisos: matchedSubs.length > 0 ? matchedSubs : g.subPermisos
        };
      }
      return null;
    }).filter(Boolean);
  }, [searchFilter]);

  return (
    <div className="space-y-4">
      {/* Barra superior de herramientas y plantillas rápidas */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Buscador de permisos */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Buscar módulo o permiso..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F05454]/40"
          />
        </div>

        {/* Resumen de selección */}
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-2 bg-slate-100 dark:bg-gray-800 rounded-xl text-slate-700 dark:text-gray-300 shrink-0">
          <ShieldCheck className="w-4 h-4 text-[#F05454]" />
          <span>
            {stats.modulosActivos} de {TOTAL_MODULOS} módulos • {stats.privilegiosActivos} privilegios
          </span>
        </div>
      </div>

      {/* Botones de plantillas rápidas */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mr-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          Plantillas:
        </span>
        <button
          type="button"
          onClick={() => aplicarPlantilla("admin")}
          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 transition-colors"
        >
          Administrador
        </button>
        <button
          type="button"
          onClick={() => aplicarPlantilla("cocinero")}
          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
        >
          Cocinero
        </button>
        <button
          type="button"
          onClick={() => aplicarPlantilla("vendedor")}
          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors"
        >
          Vendedor
        </button>
        <button
          type="button"
          onClick={() => aplicarPlantilla("cliente")}
          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors"
        >
          Cliente
        </button>
        <button
          type="button"
          onClick={() => updateStateAndEmit(parsePermisosYPrivilegios([]))}
          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 transition-colors flex items-center gap-1 ml-auto"
          title="Deseleccionar todos"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Limpiar</span>
        </button>
      </div>

      {/* Contenedor de módulos y privilegios: cuando está en un modal con su propio scroll, fluye naturalmente sin doble scrollbar */}
      <div className={`space-y-3 pt-1 ${scrollable ? "max-h-[380px] overflow-y-auto pr-3 custom-modal-scrollbar" : ""}`}>
        {gruposFiltrados.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400">
            No se encontraron módulos que coincidan con la búsqueda.
          </div>
        ) : (
          gruposFiltrados.map((grupo) => {
            const IconComponent = grupo.icon;

            // Caso 1: Módulo individual sin subniveles (Dashboard)
            if (!grupo.isGroup) {
              const moduloState = stateMap[grupo.permiso] || { activo: false, privilegios: {} };
              const isChecked = moduloState.activo;

              return (
                <div
                  key={grupo.id}
                  className={`rounded-2xl border p-4 transition-all duration-200 ${
                    isChecked
                      ? "border-emerald-300 dark:border-emerald-700/60 bg-emerald-50/40 dark:bg-emerald-950/20"
                      : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-850 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      onClick={() => toggleModulo(grupo.permiso, grupo.accionesDisponibles)}
                      className="flex items-center gap-3 cursor-pointer select-none flex-1 min-w-0"
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isChecked ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-gray-800 text-slate-500"}`}>
                        <IconComponent className="w-5 h-5 stroke-[2]" />
                      </div>
                      <div className="min-w-0">
                        <h4 className={`text-sm font-bold truncate ${isChecked ? "text-emerald-900 dark:text-emerald-300" : "text-gray-800 dark:text-gray-200"}`}>
                          {grupo.nombre}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {grupo.descripcion}
                        </p>
                      </div>
                    </div>

                    {/* Toggle botón */}
                    <button
                      type="button"
                      onClick={() => toggleModulo(grupo.permiso, grupo.accionesDisponibles)}
                      className="cursor-pointer ml-3 shrink-0"
                    >
                      {isChecked ? (
                        <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-400 flex items-center justify-center">
                          <X className="w-3.5 h-3.5 stroke-[2]" />
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              );
            }

            // Caso 2: Grupo con submódulos
            const isExpanded = !!expandedGroups[grupo.id];
            const subIds = grupo.subPermisos.map((s) => s.id);
            const activeSubCount = subIds.filter((id) => stateMap[id]?.activo).length;
            const isAllGroupSelected = activeSubCount === subIds.length;
            const isPartial = activeSubCount > 0 && !isAllGroupSelected;

            return (
              <div
                key={grupo.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isAllGroupSelected
                    ? "border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/20 dark:bg-emerald-950/10"
                    : isPartial
                    ? "border-amber-200 dark:border-amber-800/60 bg-amber-50/20 dark:bg-amber-950/10"
                    : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-850"
                }`}
              >
                {/* Cabecera del grupo */}
                <div className="p-3.5 sm:p-4 flex items-center justify-between select-none">
                  <div
                    onClick={() => toggleExpand(grupo.id)}
                    className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                  >
                    <button
                      type="button"
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-gray-300"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isAllGroupSelected ? "bg-emerald-500 text-white" : isPartial ? "bg-amber-500 text-white" : "bg-slate-100 dark:bg-gray-800 text-slate-500"}`}>
                      <IconComponent className="w-4 h-4 stroke-[2]" />
                    </div>

                    <div className="flex items-center gap-2 truncate">
                      <span className="font-bold text-sm text-gray-900 dark:text-gray-100">
                        {grupo.nombre}
                      </span>
                      {activeSubCount > 0 && (
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full text-white ${isAllGroupSelected ? "bg-emerald-500" : "bg-amber-500"}`}>
                          {activeSubCount}/{subIds.length}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleGrupoCompleto(grupo)}
                    className="cursor-pointer ml-3 shrink-0"
                    title={isAllGroupSelected ? "Deseleccionar todos" : "Seleccionar todos"}
                  >
                    {isAllGroupSelected ? (
                      <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    ) : isPartial ? (
                      <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs font-bold text-xs">
                        -
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-400 flex items-center justify-center hover:bg-gray-300">
                        <X className="w-3.5 h-3.5 stroke-[2]" />
                      </div>
                    )}
                  </button>
                </div>

                {/* Lista de submódulos y privilegios granulares */}
                {isExpanded && (
                  <div className="p-3 sm:p-4 pt-1 space-y-2.5 border-t border-gray-100 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-900/40">
                    {grupo.subPermisos.map((sub) => {
                      const modState = stateMap[sub.id] || { activo: false, privilegios: {} };
                      const isSubActive = modState.activo;
                      const privs = modState.privilegios || {};

                      return (
                        <div
                          key={sub.id}
                          className={`rounded-xl border p-3 transition-all ${
                            isSubActive
                              ? "bg-white dark:bg-gray-800 border-emerald-200 dark:border-emerald-800 shadow-2xs"
                              : "bg-white/70 dark:bg-gray-800/40 border-gray-200/70 dark:border-gray-800"
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                            {/* Checkbox y Nombre del módulo */}
                            <div
                              onClick={() => toggleModulo(sub.id, sub.accionesDisponibles)}
                              className="flex items-center gap-2.5 cursor-pointer select-none min-w-0"
                            >
                              <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-colors ${isSubActive ? "bg-emerald-500 border-emerald-500 text-white" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"}`}>
                                {isSubActive && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                              <div className="min-w-0">
                                <span className={`text-xs sm:text-sm font-bold block truncate ${isSubActive ? "text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-400"}`}>
                                  {sub.nombre}
                                </span>
                                <span className="text-[11px] text-gray-400 line-clamp-1">
                                  {sub.descripcion}
                                </span>
                              </div>
                            </div>

                            {/* Privilegios granulares: Ver, Crear, Editar, Eliminar */}
                            <div className="flex items-center gap-1.5 pl-7 sm:pl-0 shrink-0">
                              {ACCIONES_PRIVILEGIOS.map((acc) => {
                                const isAllowedForModule = sub.accionesDisponibles.includes(acc.id);
                                if (!isAllowedForModule) return null;
                                const isPrivActive = !!privs[acc.id];
                                const AccIcon = acc.icon;

                                return (
                                  <button
                                    key={acc.id}
                                    type="button"
                                    onClick={() => togglePrivilegio(sub.id, acc.id)}
                                    className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-all cursor-pointer ${
                                      isPrivActive
                                        ? acc.bgActive
                                        : "bg-gray-100 dark:bg-gray-700/60 text-gray-400 border-gray-200/80 dark:border-gray-700 hover:text-gray-600"
                                    }`}
                                    title={`Privilegio: ${acc.label} en ${sub.nombre}`}
                                  >
                                    <AccIcon className="w-3 h-3 stroke-[2.2]" />
                                    <span>{acc.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
