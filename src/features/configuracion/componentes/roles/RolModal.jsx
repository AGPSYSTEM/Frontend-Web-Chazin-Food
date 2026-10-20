import { useState, useEffect } from "react";
import { X, Shield, Check, AlertCircle } from "lucide-react";
import { PermisosSelector } from "./PermisosSelector";

export function RolModal({ isOpen, onClose, onSave, rol = null }) {
  const isEditing = !!rol;
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [permisos, setPermisos] = useState([]);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (rol) {
      setNombre(rol.nombre || "");
      setDescripcion(rol.descripcion || "");
      setPermisos(rol.permisos || []);
    } else {
      setNombre("");
      setDescripcion("");
      setPermisos([]);
    }
    setValidationError("");
  }, [rol, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError("");

    if (!nombre.trim()) {
      setValidationError("El nombre del rol es obligatorio.");
      return;
    }

    if (!permisos || permisos.length === 0) {
      setValidationError("Debes asignar al menos un permiso o módulo al rol antes de crearlo.");
      return;
    }

    onSave(nombre.trim(), descripcion.trim(), permisos);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800 shrink-0 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-[#F05454] flex items-center justify-center border border-rose-100/80 dark:border-rose-900/40 shrink-0">
              <Shield className="w-5 h-5 text-[#F05454] stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                {isEditing ? `Editar Rol: ${rol.nombre}` : "Nuevo Rol"}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {isEditing
                  ? "Actualiza la información, permisos y privilegios asignados"
                  : "Define el nombre del rol y asigna sus módulos y privilegios de acceso"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 overflow-y-auto custom-modal-scrollbar space-y-6 flex-1">
            {/* Mensaje de validación si existe */}
            {validationError && (
              <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 flex items-center gap-2.5 text-xs font-semibold text-red-700 dark:text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{validationError}</span>
              </div>
            )}

            {/* SECCIÓN 1: DATOS BÁSICOS DEL ROL */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-1 border-b border-gray-100 dark:border-gray-800">
                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  1. Información General
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Nombre del Rol <span className="text-red-500 font-bold ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => {
                      setNombre(e.target.value);
                      if (validationError) setValidationError("");
                    }}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#F05454]/40 focus:border-transparent transition-colors font-medium outline-none"
                    placeholder="Ej. Cajero Principal"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Descripción <span className="text-gray-400 font-normal">(Opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#F05454]/40 focus:border-transparent transition-colors font-medium outline-none"
                    placeholder="Ej. Control de caja y cobros del punto de venta"
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: ASIGNACIÓN DE PERMISOS Y PRIVILEGIOS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-gray-100 dark:border-gray-800">
                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  2. Asignación de Permisos y Privilegios <span className="text-red-500 font-bold ml-0.5">*</span>
                </span>
                <span className="text-[11px] text-gray-400">
                  (Obligatorio al menos un módulo)
                </span>
              </div>

              {/* Selector interactivo con buscador, plantillas y privilegios granulares */}
              <PermisosSelector
                value={permisos}
                scrollable={false}
                onChange={(nuevosPermisos) => {
                  setPermisos(nuevosPermisos);
                  if (validationError) setValidationError("");
                }}
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3 bg-gray-50/60 dark:bg-gray-900 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-[#F05454] hover:bg-[#d94444] text-white text-xs sm:text-sm font-bold transition-colors shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{isEditing ? "Guardar Cambios" : "Crear Rol"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
