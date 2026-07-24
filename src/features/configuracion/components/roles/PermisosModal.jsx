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

  const handleSelectAll = () => {
    setEditingPermisos([...TODOS_PERMISOS]);
  };

  const handleDeselectAll = () => {
    setEditingPermisos([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(editingPermisos);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Gestión de Permisos — {rol.nombre}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Selecciona los módulos a los que este rol tendrá acceso.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Seleccionados: {editingPermisos.length} de {TODOS_PERMISOS.length}
            </span>
            <div className="flex gap-2 text-xs">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
              >
                Marcar Todos
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={handleDeselectAll}
                className="text-gray-500 hover:underline"
              >
                Desmarcar Todos
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {TODOS_PERMISOS.map((perm) => {
              const checked = editingPermisos.includes(perm);

              return (
                <button
                  type="button"
                  key={perm}
                  onClick={() => togglePermiso(perm)}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left text-sm transition-all ${
                    checked
                      ? "border-purple-500 bg-purple-50/50 dark:bg-purple-900/20 text-purple-900 dark:text-purple-100 font-medium"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors shrink-0 ${
                      checked
                        ? "bg-purple-600 border-purple-600 text-white"
                        : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
                    }`}
                  >
                    {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <span className="truncate">{perm}</span>
                </button>
              );
            })}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors shadow-md"
            >
              Guardar Permisos
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
