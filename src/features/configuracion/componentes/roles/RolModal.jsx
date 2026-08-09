import { useState, useEffect } from "react";
import { X, Edit, Check } from "lucide-react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-800">
        {/* Header matching reference screenshot 1 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-[#F05454] flex items-center justify-center border border-rose-100/80 dark:border-rose-900/40 shrink-0">
              <Edit className="w-5 h-5 text-[#F05454] stroke-[2.2]" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {isEditing ? "Editar Rol" : "Nuevo Rol"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
              Nombre del Rol
            </label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#F05454]/40 focus:border-transparent transition-colors font-medium"
              placeholder="Ej. Cliente"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
              Descripción
            </label>
            <textarea
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#F05454]/40 focus:border-transparent transition-colors font-medium min-h-[100px] resize-none"
              placeholder="Acceso básico para realizar pedidos"
            />
          </div>

          {/* Footer Buttons matching reference screenshot 1 exact alignment */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-full border border-gray-200/90 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#F05454] hover:bg-[#d94444] text-white text-sm font-semibold transition-colors shadow-md flex items-center gap-2 cursor-pointer"
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
