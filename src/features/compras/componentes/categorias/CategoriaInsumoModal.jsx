import { useState, useEffect } from "react";

const inputCls = "w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-colors text-sm placeholder:text-gray-400";
const labelCls = "block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1.5";

export function CategoriaInsumoModal({ isOpen, onClose, onSave, categoria = null }) {
  const isEditing = !!categoria;
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [estado, setEstado] = useState("Activo");

  useEffect(() => {
    if (categoria) {
      setNombre(categoria.nombre || "");
      setDescripcion(categoria.descripcion || "");
      setEstado(categoria.estado || "Activo");
    } else {
      setNombre("");
      setDescripcion("");
      setEstado("Activo");
    }
  }, [categoria, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    onSave({ nombre: nombre.trim(), descripcion: descripcion.trim(), estado });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-2xl font-bold text-[#1e293b] dark:text-gray-100">
            {isEditing ? "Editar Categoría" : "Nueva Categoría"}
          </h2>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={labelCls}>
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className={inputCls}
              placeholder="Ej: Frutas"
            />
          </div>

          <div>
            <label className={labelCls}>Descripción</label>
            <textarea
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className={`${inputCls} resize-none`}
              placeholder="Describe la categoría..."
            />
          </div>

          <div>
            <label className={labelCls}>Estado</label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className={`${inputCls} cursor-pointer`}
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-700 dark:text-gray-200 hover:bg-gray-50 text-sm font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-[#F05454]/80 hover:bg-[#F05454] text-white text-sm font-medium transition-colors shadow-xs"
            >
              {isEditing ? "Guardar Cambios" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
