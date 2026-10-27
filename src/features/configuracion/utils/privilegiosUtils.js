import {
  LayoutDashboard,
  Settings,
  Users,
  ShoppingCart,
  ChefHat,
  TrendingUp,
  Eye,
  PlusCircle,
  Edit3,
  Trash2
} from "lucide-react";

export const ACCIONES_PRIVILEGIOS = [
  { id: "ver", label: "Ver", key: "Ver", icon: Eye, color: "text-slate-600 dark:text-slate-300", bgActive: "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-600" },
  { id: "crear", label: "Crear", key: "Crear", icon: PlusCircle, color: "text-slate-600 dark:text-slate-300", bgActive: "bg-red-50/80 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/60" },
  { id: "editar", label: "Editar", key: "Editar", icon: Edit3, color: "text-slate-600 dark:text-slate-300", bgActive: "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-600" },
  { id: "eliminar", label: "Eliminar", key: "Eliminar", icon: Trash2, color: "text-slate-600 dark:text-slate-300", bgActive: "bg-red-50/80 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/60" }
];

export const GRUPOS_PERMISOS = [
  {
    id: "dashboard",
    nombre: "Dashboard",
    icon: LayoutDashboard,
    isGroup: false,
    permiso: "Dashboard",
    descripcion: "Panel de métricas, estadísticas e indicadores en tiempo real",
    accionesDisponibles: ["ver"]
  },
  {
    id: "usuarios",
    nombre: "Usuarios",
    icon: Users,
    isGroup: true,
    parentPermiso: "Usuarios",
    subPermisos: [
      { id: "Usuarios", nombre: "Gestión de Usuarios", descripcion: "Gestión de cuentas, colaboradores y estados de acceso", accionesDisponibles: ["ver", "crear", "editar", "eliminar"] }
    ]
  },
  {
    id: "configuracion",
    nombre: "Configuración",
    icon: Settings,
    isGroup: true,
    parentPermiso: "Configuración",
    subPermisos: [
      { id: "Roles", nombre: "Roles", descripcion: "Administración de roles, módulos y privilegios del sistema", accionesDisponibles: ["ver", "crear", "editar", "eliminar"] }
    ]
  },
  {
    id: "compras",
    nombre: "Compras",
    icon: ShoppingCart,
    isGroup: true,
    parentPermiso: "Compras",
    subPermisos: [
      { id: "Categoría Insumos", nombre: "Categoría Insumos", descripcion: "Clasificación de insumos y materias primas", accionesDisponibles: ["ver", "crear", "editar", "eliminar"] },
      { id: "Insumos", nombre: "Insumos", descripcion: "Catálogo de insumos, recetas preparadas y control de stock", accionesDisponibles: ["ver", "crear", "editar", "eliminar"] },
      { id: "Proveedores", nombre: "Proveedores", descripcion: "Directorio de proveedores y datos de contacto", accionesDisponibles: ["ver", "crear", "editar", "eliminar"] },
      { id: "Gestión de Compras", nombre: "Gestión de Compras", descripcion: "Registro de compras, lotes y devoluciones a proveedores", accionesDisponibles: ["ver", "crear", "editar", "eliminar"] }
    ]
  },
  {
    id: "produccion",
    nombre: "Producción",
    icon: ChefHat,
    isGroup: true,
    parentPermiso: "Producción",
    subPermisos: [
      { id: "Categoría Productos", nombre: "Categoría Productos", descripcion: "Familias de productos del menú y bebidas", accionesDisponibles: ["ver", "crear", "editar", "eliminar"] },
      { id: "Productos", nombre: "Productos", descripcion: "Catálogo de productos, combos, fichas técnicas y eventos", accionesDisponibles: ["ver", "crear", "editar", "eliminar"] },
      { id: "Gestión de Producción", nombre: "Gestión de Producción", descripcion: "Control de órdenes de preparación y cocción en cocina", accionesDisponibles: ["ver", "crear", "editar", "eliminar"] }
    ]
  },
  {
    id: "ventas",
    nombre: "Ventas",
    icon: TrendingUp,
    isGroup: true,
    parentPermiso: "Ventas",
    subPermisos: [
      { id: "Clientes", nombre: "Clientes", descripcion: "Directorio de clientes, activación y programa de fidelidad", accionesDisponibles: ["ver", "crear", "editar", "eliminar"] },
      { id: "Gestión de Ventas", nombre: "Gestión de Ventas", descripcion: "Historial de ventas, aprobación de pagos y creación de venta física (POS)", accionesDisponibles: ["ver", "crear", "editar", "eliminar"] }
    ]
  }
];

export const TOTAL_MODULOS = GRUPOS_PERMISOS.reduce((acc, g) => {
  return acc + (g.isGroup ? g.subPermisos.length : 1);
}, 0);

/**
 * Verifica si un usuario autenticado posee un privilegio específico (ver, crear, editar, eliminar)
 * sobre un módulo del sistema, manteniendo retrocompatibilidad con permisos heredados.
 */
export function hasPrivilege(user, modulo, accion = "ver") {
  if (!user) return false;
  const rawRol = typeof user.rol === "object" ? user.rol?.nombre : user.rol;
  const rolLower = String(rawRol || "").toLowerCase().trim();
  if (rolLower === "administrador" || rolLower === "admin") return true;

  const permisos = Array.isArray(user.permisos) ? user.permisos : [];
  if (permisos.length === 0) return false;

  const accionNorm = String(accion || "ver").toLowerCase().trim();
  const accionKey = accionNorm.charAt(0).toUpperCase() + accionNorm.slice(1); // "Ver", "Crear", "Editar", "Eliminar"

  // Compatibilidad para Punto de Venta integrado en Gestión de Ventas (Ítem #40)
  const modulosEquivalentes = [modulo];
  if (modulo === "Punto de Venta") {
    modulosEquivalentes.push("Gestión de Ventas", "Vendedor");
  } else if (modulo === "Gestión de Ventas" && (accionNorm === "ver" || accionNorm === "crear")) {
    modulosEquivalentes.push("Punto de Venta");
  } else if (modulo === "Fichas Técnicas") {
    modulosEquivalentes.push("Productos", "Insumos");
  }

  for (const mod of modulosEquivalentes) {
    if (permisos.includes(`${mod}:${accionKey}`)) {
      return true;
    }
    const hasGranularForMod = permisos.some((p) => typeof p === "string" && p.startsWith(`${mod}:`));
    if (!hasGranularForMod && permisos.includes(mod)) {
      return true;
    }
  }

  return false;
}

/**
 * Convierte un arreglo plano de permisos (ej: ["Insumos", "Insumos:Ver", "Insumos:Crear"])
 * a un mapa estructurado de { [modulo]: { activo: boolean, privilegios: { ver, crear, editar, eliminar } } }
 */
export function parsePermisosYPrivilegios(permisosArray = []) {
  const result = {};

  GRUPOS_PERMISOS.forEach((g) => {
    if (!g.isGroup) {
      const hasGranular = permisosArray.some((p) => typeof p === "string" && p.startsWith(`${g.permiso}:`));
      const isActivo = permisosArray.includes(g.permiso) || permisosArray.includes(`${g.permiso}:Ver`);
      result[g.permiso] = {
        activo: isActivo,
        privilegios: { ver: hasGranular ? permisosArray.includes(`${g.permiso}:Ver`) : isActivo }
      };
    } else {
      g.subPermisos.forEach((sub) => {
        let isActivo = permisosArray.includes(sub.id);
        let hasGranular = permisosArray.some((p) => typeof p === "string" && p.startsWith(`${sub.id}:`));

        // Retrocompatibilidad: roles que tenían "Punto de Venta" heredan acceso a "Gestión de Ventas"
        if (!isActivo && sub.id === "Gestión de Ventas" && permisosArray.includes("Punto de Venta")) {
          isActivo = true;
          hasGranular = false;
        }

        if (isActivo && !hasGranular) {
          result[sub.id] = {
            activo: true,
            privilegios: {
              ver: true,
              crear: sub.accionesDisponibles.includes("crear"),
              editar: sub.accionesDisponibles.includes("editar"),
              eliminar: sub.accionesDisponibles.includes("eliminar")
            }
          };
        } else if (isActivo && hasGranular) {
          result[sub.id] = {
            activo: true,
            privilegios: {
              ver: permisosArray.includes(`${sub.id}:Ver`),
              crear: permisosArray.includes(`${sub.id}:Crear`),
              editar: permisosArray.includes(`${sub.id}:Editar`),
              eliminar: permisosArray.includes(`${sub.id}:Eliminar`)
            }
          };
        } else {
          result[sub.id] = {
            activo: false,
            privilegios: { ver: false, crear: false, editar: false, eliminar: false }
          };
        }
      });
    }
  });

  return result;
}

/**
 * Convierte el estado estructurado a un arreglo plano compatible con el backend y con el sistema de permisos
 */
export function buildPermisosArray(stateMap = {}) {
  const list = new Set();

  GRUPOS_PERMISOS.forEach((g) => {
    if (!g.isGroup) {
      if (stateMap[g.permiso]?.activo) {
        list.add(g.permiso);
        if (stateMap[g.permiso]?.privilegios?.ver !== false) {
          list.add(`${g.permiso}:Ver`);
        }
      }
    } else {
      let groupHasAny = false;
      g.subPermisos.forEach((sub) => {
        const modState = stateMap[sub.id];
        if (modState?.activo) {
          groupHasAny = true;
          list.add(sub.id);
          if (modState.privilegios?.ver) list.add(`${sub.id}:Ver`);
          if (modState.privilegios?.crear) list.add(`${sub.id}:Crear`);
          if (modState.privilegios?.editar) list.add(`${sub.id}:Editar`);
          if (modState.privilegios?.eliminar) list.add(`${sub.id}:Eliminar`);
        }
      });
      if (groupHasAny) {
        list.add(g.parentPermiso);
      }
    }
  });

  return Array.from(list);
}

/**
 * Plantillas predefinidas según roles clave del restaurante
 */
export function getPlantillaRol(tipo) {
  const base = parsePermisosYPrivilegios([]);

  if (tipo === "admin") {
    GRUPOS_PERMISOS.forEach((g) => {
      if (!g.isGroup) {
        base[g.permiso] = { activo: true, privilegios: { ver: true } };
      } else {
        g.subPermisos.forEach((sub) => {
          base[sub.id] = {
            activo: true,
            privilegios: { ver: true, crear: true, editar: true, eliminar: true }
          };
        });
      }
    });
  } else if (tipo === "cocinero") {
    base["Dashboard"] = { activo: true, privilegios: { ver: true } };
    base["Categoría Insumos"] = { activo: true, privilegios: { ver: true, crear: false, editar: false, eliminar: false } };
    base["Insumos"] = { activo: true, privilegios: { ver: true, crear: false, editar: false, eliminar: false } };
    base["Categoría Productos"] = { activo: true, privilegios: { ver: true, crear: false, editar: false, eliminar: false } };
    base["Productos"] = { activo: true, privilegios: { ver: true, crear: false, editar: false, eliminar: false } };
    base["Gestión de Producción"] = { activo: true, privilegios: { ver: true, crear: true, editar: true, eliminar: false } };
  } else if (tipo === "vendedor") {
    base["Categoría Productos"] = { activo: true, privilegios: { ver: true, crear: false, editar: false, eliminar: false } };
    base["Productos"] = { activo: true, privilegios: { ver: true, crear: false, editar: false, eliminar: false } };
    base["Clientes"] = { activo: true, privilegios: { ver: true, crear: true, editar: false, eliminar: false } };
    base["Gestión de Ventas"] = { activo: true, privilegios: { ver: true, crear: true, editar: true, eliminar: false } };
  } else if (tipo === "cliente") {
    base["Categoría Productos"] = { activo: true, privilegios: { ver: true, crear: false, editar: false, eliminar: false } };
    base["Productos"] = { activo: true, privilegios: { ver: true, crear: false, editar: false, eliminar: false } };
  }

  return base;
}
