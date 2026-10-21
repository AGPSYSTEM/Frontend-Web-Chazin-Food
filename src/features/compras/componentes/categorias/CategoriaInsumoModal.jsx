import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { validateTexto } from "@/shared/utils/validationUtils";

const baseInputCls = "w-full px-4 py-2.5 border rounded-xl transition-all duration-150 text-sm placeholder:text-gray-400 outline-none";
const labelCls = "block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1.5";

export function CategoriaInsumoModal({ isOpen, onClose, onSave, categoria = null }) {
  const isEditing = !!categoria;
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [estado, setEstado] = useState("Activo");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

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
    setErrors({});
    setTouched({});
  }, [categoria, isOpen]);

  if (!isOpen) return null;

  const handleNombreChange = (e) => {
    const raw = e.target.value;
    const clean = raw.replace(/[0-9]/g, "");
    setNombre(clean);

    let err = "";
    if (/[0-9]/.test(raw)) {
      err = "El nombre de la categoría no debe contener números.";
    } else {
      const res = validateTexto(clean, "nombre de la categoría", { min: 3, max: 50, permitirNumeros: false });
      if (!res.isValid) err = res.error;
    }
    setErrors((prev) => ({ ...prev, nombre: err }));
  };

  const handleNombreBlur = () => {
    setTouched((prev) => ({ ...prev, nombre: true }));
    const res = validateTexto(nombre, "nombre de la categoría", { min: 3, max: 50, permitirNumeros: false });
    setErrors((prev) => ({ ...prev, nombre: res.isValid ? "" : res.error }));
  };

  const handleDescripcionChange = (e) => {
    const val = e.target.value;
    setDescripcion(val);
    const res = validateTexto(val, "descripción", { min: 0, max: 255, required: false });
    setErrors((prev) => ({ ...prev, descripcion: res.isValid ? "" : res.error }));
  };

  const handleDescripcionBlur = () => {
    setTouched((prev) => ({ ...prev, descripcion: true }));
    const res = validateTexto(descripcion, "descripción", { min: 0, max: 255, required: false });
    setErrors((prev) => ({ ...prev, descripcion: res.isValid ? "" : res.error }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ nombre: true, descripcion: true });

    const nombreRes = validateTexto(nombre, "nombre de la categoría", { min: 3, max: 50, permitirNumeros: false });
    const descRes = validateTexto(descripcion, "descripción", { min: 0, max: 255, required: false });

    const newErrors = {};
    if (!nombreRes.isValid) newErrors.nombre = nombreRes.error;
    if (!descRes.isValid) newErrors.descripcion = descRes.error;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

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
              onChange={handleNombreChange}
              onBlur={handleNombreBlur}
              className={`${baseInputCls} ${
                touched.nombre && errors.nombre
                  ? "border-red-500 bg-red-50/30 text-red-900 focus:ring-2 focus:ring-red-400 focus:border-red-500 dark:border-red-600 dark:bg-red-950/20 dark:text-red-300"
                  : "border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-red-500/50 focus:border-transparent"
              }`}
              placeholder="Ej: Frutas y Verduras"
            />
            {touched.nombre && errors.nombre && (
              <p className="text-xs text-red-500 mt-1 font-medium flex items-center gap-1 animate-in fade-in duration-150">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.nombre}</span>
              </p>
            )}
          </div>

          <div>
            <label className={labelCls}>Descripción</label>
            <textarea
              rows={3}
              value={descripcion}
              onChange={handleDescripcionChange}
              onBlur={handleDescripcionBlur}
              className={`${baseInputCls} resize-none ${
                touched.descripcion && errors.descripcion
                  ? "border-red-500 bg-red-50/30 text-red-900 focus:ring-2 focus:ring-red-400 focus:border-red-500 dark:border-red-600 dark:bg-red-950/20 dark:text-red-300"
                  : "border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-red-500/50 focus:border-transparent"
              }`}
              placeholder="Describe la categoría..."
            />
            {touched.descripcion && errors.descripcion && (
              <p className="text-xs text-red-500 mt-1 font-medium flex items-center gap-1 animate-in fade-in duration-150">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.descripcion}</span>
              </p>
            )}
          </div>

          <div>
            <label className={labelCls}>Estado</label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className={`${baseInputCls} border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 cursor-pointer`}
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
              className="px-6 py-2.5 rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-700 dark:text-gray-200 hover:bg-gray-50 text-sm font-medium transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-[#F05454] hover:bg-[#d84343] text-white text-sm font-medium transition-colors shadow-xs cursor-pointer"
            >
              {isEditing ? "Guardar Cambios" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
