import { useState, useEffect } from "react";
import { X, Shield, Check } from "lucide-react";
import { PermisosSelector } from "./PermisosSelector";

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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(editingPermisos);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh] border border-gray-100 dark:border-gray-800">
        {/* Header armonizado con los colores del proyecto (Chazin Food #1e293b) */}
        <div className="bg-gradient-to-r from-[#1e293b] via-[#243042] to-[#1e293b] p-5 sm:p-6 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white shrink-0 border border-white/15">
              <Shield className="w-6 h-6 stroke-[2] text-[#F05454]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white leading-tight">
                Permisos y Privilegios: {rol.nombre}
              </h2>
              <p className="text-xs text-gray-300 mt-0.5 font-medium">
                Gestiona el acceso a módulos y las acciones específicas (Ver, Crear, Editar, Eliminar)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 flex-1 overflow-y-auto custom-modal-scrollbar space-y-4">
            <PermisosSelector
              value={editingPermisos}
              scrollable={false}
              onChange={(nuevosPermisos) => setEditingPermisos(nuevosPermisos)}
            />
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-5 bg-gray-50/60 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-[#F05454] hover:bg-[#d94444] text-white text-xs sm:text-sm font-bold transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Guardar Permisos y Privilegios</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
