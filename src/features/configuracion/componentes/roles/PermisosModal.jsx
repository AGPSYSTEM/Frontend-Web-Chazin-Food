import { useState, useEffect } from "react";
import { X, Shield, Check, AlertCircle } from "lucide-react";
import { PermisosSelector } from "./PermisosSelector";

export function PermisosModal({ isOpen, onClose, onSave, rol }) {
  const [editingPermisos, setEditingPermisos] = useState([]);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (rol) {
      setEditingPermisos([...(rol.permisos || [])]);
      setError("");
      setTouched(false);
    } else {
      setEditingPermisos([]);
      setError("");
      setTouched(false);
    }
  }, [rol, isOpen]);

  const handlePermisosChange = (nuevosPermisos) => {
    setEditingPermisos(nuevosPermisos);
    setTouched(true);
    if (!nuevosPermisos || nuevosPermisos.length === 0) {
      setError("Debes seleccionar al menos un permiso o privilegio para el rol");
    } else {
      setError("");
    }
  };

  if (!isOpen || !rol) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (!editingPermisos || editingPermisos.length === 0) {
      setError("Debes seleccionar al menos un permiso o privilegio para el rol");
      return;
    }
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
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/60 rounded-2xl text-xs font-semibold text-red-600 dark:text-red-400 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}
            <PermisosSelector
              value={editingPermisos}
              scrollable={false}
              onChange={handlePermisosChange}
            />
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-5 bg-gray-50/60 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3 shrink-0">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {editingPermisos.length > 0 ? (
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  {editingPermisos.length} permiso(s) asignado(s)
                </span>
              ) : (
                <span className="font-semibold text-red-500">
                  0 permisos seleccionados
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={Boolean(error) || editingPermisos.length === 0}
                className={`px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                  editingPermisos.length === 0
                    ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed shadow-none"
                    : "bg-[#F05454] hover:bg-[#d94444] text-white"
                }`}
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Guardar Permisos y Privilegios</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
