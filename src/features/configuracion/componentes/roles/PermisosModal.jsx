import { useState, useEffect } from "react";
import { X, Shield, Check } from "lucide-react";

const TODOS_PERMISOS = [
  "Dashboard",
  "Compras",
  "Categoría Insumos",
  "Insumos",
  "Proveedores",
  "Gestión de Compras",
  "Producción",
  "Categoría Productos",
  "Productos",
  "Fichas Técnicas",
  "Gestión de Producción",
  "Ventas",
  "Clientes",
  "Gestión de Ventas",
  "Punto de Venta",
  "Configuración",
  "Usuarios",
  "Roles"
];

const getHeaderStyle = (nombre = "") => {
  const n = nombre.toLowerCase();
  if (n.includes("admin")) {
    return "bg-gradient-to-r from-[#a855f7] via-[#9333ea] to-[#7c3aed] dark:from-[#9333ea] dark:via-[#7c3aed] dark:to-[#6d28d9]";
  }
  if (n.includes("cocinero") || n.includes("cocina")) {
    return "bg-gradient-to-r from-[#22c55e] via-[#16a34a] to-[#15803d] dark:from-[#16a34a] dark:via-[#15803d] dark:to-[#166534]";
  }
  if (n.includes("cliente")) {
    return "bg-gradient-to-r from-[#f87171] via-[#ef4444] to-[#dc2626] dark:from-[#ef4444] dark:via-[#dc2626] dark:to-[#b91c1c]";
  }
  return "bg-gradient-to-r from-[#60a5fa] via-[#3b82f6] to-[#2563eb]";
};

export function PermisosModal({ isOpen, onClose, onSave, rol }) {
  const [editingPermisos, setEditingPermisos] = useState([]);

  useEffect(() => {
    if (rol) {
      setEditingPermisos([...(rol.permisos || [])]);
    } else {
      setEditingPermisos([]);
    }
  }, [rol, isOpen]);

  if (!isOpen || !rol) return null;

  const togglePermiso = (permiso) => {
    setEditingPermisos((prev) =>
      prev.includes(permiso) ? prev.filter((p) => p !== permiso) : [...prev, permiso]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(editingPermisos);
  };

  const headerStyle = getHeaderStyle(rol.nombre);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] border border-gray-100 dark:border-gray-800">
        {/* Header with exact role gradient colors from reference */}
        <div className={`${headerStyle} p-5 sm:p-6 flex items-center justify-between text-white shrink-0`}>
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white shrink-0 border border-white/20">
              <Shield className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white leading-tight">{rol.nombre}</h2>
              <p className="text-xs text-white/80 mt-0.5 font-normal">Editar permisos del rol</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-3">
            <div className="pb-1">
              <span className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 font-normal">
                {editingPermisos.length} de {TODOS_PERMISOS.length} permisos seleccionados
              </span>
            </div>

            <div className="space-y-2.5">
              {TODOS_PERMISOS.map((perm) => {
                const checked = editingPermisos.includes(perm);

                return (
                  <div
                    key={perm}
                    onClick={() => togglePermiso(perm)}
                    className={`w-full flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                      checked
                        ? "border-[#bbf7d0] dark:border-emerald-700/60 bg-[#f0fdf4] dark:bg-emerald-950/20"
                        : "border-[#e5e7eb] dark:border-gray-700 bg-[#f9fafb] dark:bg-gray-800/40 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {perm}
                    </span>
                    {checked ? (
                      <div className="w-7 h-7 rounded-full bg-[#22c55e] text-white flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[#e5e7eb] dark:bg-gray-700 text-[#9ca3af] dark:text-gray-500 flex items-center justify-center shrink-0">
                        <X className="w-3.5 h-3.5 stroke-[2.5]" />
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
              className="px-6 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#F05454] hover:bg-[#d94444] text-white text-sm font-medium transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
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
