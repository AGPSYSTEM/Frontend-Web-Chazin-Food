import { useState, useEffect } from "react";
import { X, Shield } from "lucide-react";

const inputCls = "w-full px-4 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-[#F05454] focus:border-transparent transition-colors text-sm";
const labelCls = "block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1";

export function RolModal({ isOpen, onClose, onSave, rol = null }) {
  const isEditing = !!rol;
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");

  useEffect(() => {
    if (rol) {
      setNombre(rol.nombre || "");
      setDescripcion(rol.descripcion || "");
    } else {
      setNombre("");
      setDescripcion("");
    }
  }, [rol, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    onSave(nombre.trim(), descripcion.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#F05454]" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {isEditing ? "Editar Rol" : "Nuevo Rol"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={labelCls}>Nombre del Rol</label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className={inputCls}
              placeholder="Ej. Supervisor de Ventas"
            />
          </div>

          <div>
            <label className={labelCls}>Descripción</label>
            <textarea
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className={inputCls}
              placeholder="Describe las responsabilidades de este rol..."
            />
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
              className="px-5 py-2 text-sm font-medium text-white bg-[#F05454] hover:bg-[#d84343] rounded-xl transition-colors shadow-md"
            >
              {isEditing ? "Guardar Cambios" : "Crear Rol"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
