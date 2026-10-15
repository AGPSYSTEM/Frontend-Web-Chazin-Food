import {
  LayoutDashboard,
  Settings,
  ShoppingCart,
  ChefHat,
  TrendingUp,
  Eye,
  PlusCircle,
  Edit3,
  Trash2
} from "lucide-react";

export const ACCIONES_PRIVILEGIOS = [
  { id: "ver", label: "Ver", key: "Ver", icon: Eye, color: "text-blue-600 dark:text-blue-400", bgActive: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800" },
  { id: "crear", label: "Crear", key: "Crear", icon: PlusCircle, color: "text-emerald-600 dark:text-emerald-400", bgActive: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" },
  { id: "editar", label: "Editar", key: "Editar", icon: Edit3, color: "text-amber-600 dark:text-amber-400", bgActive: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800" },
  { id: "eliminar", label: "Eliminar", key: "Eliminar", icon: Trash2, color: "text-rose-600 dark:text-rose-400", bgActive: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800" }
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
    id: "configuracion",
    nombre: "Configuración",
    icon: Settings,
    isGroup: true,
    parentPermiso: "Configuración",
    subPermisos: [
      { id: "Roles", nombre: "Roles", descripcion: "Administración de roles y asignación de permisos del sistema", accionesDisponibles: ["ver", "crear", "editar", "eliminar"] },
      { id: "Usuarios", nombre: "Usuarios", descripcion: "Gestión de cuentas, colaboradores y estados de acceso", accionesDisponibles: ["ver", "crear", "editar", "eliminar"] }
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
      { id: "Insumos", nombre: "Insumos", descripcion: "Catálogo de insumos, unidades y control de stock", accionesDisponibles: ["ver", "crear", "editar", "eliminar"] },
      { id: "Proveedores", nombre: "Proveedores", descripcion: "Directorio de proveedores y datos de contacto", accionesDisponibles: ["ver", "crear", "editar", "eliminar"] },
      { id: "Gestión de Compras", nombre: "Gestión de Compras", descripcion: "Registro, recepción y anulación de compras a proveedores", accionesDisponibles: ["ver", "crear", "editar", "eliminar"] }
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
      { id: "Productos", nombre: "Productos", descripcion: "Catálogo de productos finales, precios y fotos", accionesDisponibles: ["ver", "crear", "editar", "eliminar"] },
      { id: "Fichas Técnicas", nombre: "Fichas Técnicas", descripcion: "Recetas estándar, ingredientes y gramajes", accionesDisponibles: ["ver", "crear", "editar", "eliminar"] },
      { id: "Gestión de Producción", nombre: "Gestión de Producción", descripcion: "Control de órdenes de preparación y cocción", accionesDisponibles: ["ver", "crear", "editar", "eliminar"] }
    ]
  },
  {
    id: "ventas",
    nombre: "Ventas",
    icon: TrendingUp,
    isGroup: true,
    parentPermiso: "Ventas",
    subPermisos: [
      { id: "Punto de Venta", nombre: "Punto de Venta", descripcion: "Terminal de venta rápida y cobros en caja", accionesDisponibles: ["ver", "crear", "editar", "eliminar"] },
      { id: "Clientes", nombre: "Clientes", descripcion: "Directorio de clientes y registro de compradores", accionesDisponibles: ["ver", "crear", "editar", "eliminar"] },
      { id: "Gestión de Ventas", nombre: "Gestión de Ventas", descripcion: "Historial de transacciones, facturación y estados", accionesDisponibles: ["ver", "crear", "editar", "eliminar"] }
    ]
  }
];

export const TOTAL_MODULOS = GRUPOS_PERMISOS.reduce((acc, g) => {
  return acc + (g.isGroup ? g.subPermisos.length : 1);
}, 0);

/**
 * Convierte un arreglo plano de permisos (ej: ["Insumos", "Insumos:Ver", "Insumos:Crear"])
 * a un mapa estructurado de { [modulo]: { activo: boolean, privilegios: { ver, crear, editar, eliminar } } }
 */
export function parsePermisosYPrivilegios(permisosArray = []) {
  const result = {};

  // Inicializar todos los módulos
  GRUPOS_PERMISOS.forEach((g) => {
    if (!g.isGroup) {
      const isActivo = permisosArray.includes(g.permiso);
      result[g.permiso] = {
        activo: isActivo,
        privilegios: { ver: isActivo }
      };
    } else {
      g.subPermisos.forEach((sub) => {
        const isActivo = permisosArray.includes(sub.id);
        const hasGranular = permisosArray.some((p) => p.startsWith(`${sub.id}:`));

        if (isActivo && !hasGranular) {
          // Si el rol ya tenía el módulo pero no privilegios específicos (datos previos en BD),
          // por defecto se habilitan todas las acciones disponibles para no romper funcionalidad.
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
        if (stateMap[g.permiso]?.privilegios?.ver) {
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
    // Administrador: Todos los módulos, todos los privilegios
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
    // Cocinero: Dashboard, Insumos (solo ver), Fichas Técnicas (solo ver), Producción (ver, crear, editar)
    base["Dashboard"] = { activo: true, privilegios: { ver: true } };
    base["Categoría Insumos"] = { activo: true, privilegios: { ver: true, crear: false, editar: false, eliminar: false } };
    base["Insumos"] = { activo: true, privilegios: { ver: true, crear: false, editar: false, eliminar: false } };
    base["Categoría Productos"] = { activo: true, privilegios: { ver: true, crear: false, editar: false, eliminar: false } };
    base["Productos"] = { activo: true, privilegios: { ver: true, crear: false, editar: false, eliminar: false } };
    base["Fichas Técnicas"] = { activo: true, privilegios: { ver: true, crear: false, editar: false, eliminar: false } };
    base["Gestión de Producción"] = { activo: true, privilegios: { ver: true, crear: true, editar: true, eliminar: false } };
  } else if (tipo === "vendedor") {
    // Vendedor: Categoría Productos, Productos, Punto de Venta (ver, crear, editar), Clientes (ver, crear), Ventas (ver)
    base["Categoría Productos"] = { activo: true, privilegios: { ver: true, crear: false, editar: false, eliminar: false } };
    base["Productos"] = { activo: true, privilegios: { ver: true, crear: false, editar: false, eliminar: false } };
    base["Punto de Venta"] = { activo: true, privilegios: { ver: true, crear: true, editar: true, eliminar: false } };
    base["Clientes"] = { activo: true, privilegios: { ver: true, crear: true, editar: false, eliminar: false } };
    base["Gestión de Ventas"] = { activo: true, privilegios: { ver: true, crear: false, editar: false, eliminar: false } };
  } else if (tipo === "cliente") {
    // Cliente: Catálogo/Productos (ver) y realizar pedidos
    base["Categoría Productos"] = { activo: true, privilegios: { ver: true, crear: false, editar: false, eliminar: false } };
    base["Productos"] = { activo: true, privilegios: { ver: true, crear: false, editar: false, eliminar: false } };
    base["Punto de Venta"] = { activo: true, privilegios: { ver: true, crear: true, editar: false, eliminar: false } };
  }

  return base;
}
