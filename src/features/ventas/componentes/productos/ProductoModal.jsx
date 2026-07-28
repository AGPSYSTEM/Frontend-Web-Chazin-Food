import { useState, useEffect } from "react";
import { X, Utensils } from "lucide-react";
import { FichaTecnicaProducto } from "@/features/fichas-tecnicas/componentes/FichaTecnicaProducto";

const inputCls = "w-full px-4 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-[#F05454] focus:border-transparent transition-colors text-sm";
const labelCls = "block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1";

export function ProductoModal({ isOpen, onClose, onSave, producto = null, categorias = [] }) {
  const isEditing = !!producto;
  const [form, setForm] = useState({
    codigo: "",
    nombre: "",
    categoria: "",
    precio: "",
    descripcion: "",
    imagen: "",
    estado: "Activo"
  });
  const [fichaTecnica, setFichaTecnica] = useState(null);

  useEffect(() => {
    if (producto) {
      setForm({
        codigo: producto.codigo || "",
        nombre: producto.nombre || "",
        categoria: producto.categoria || (categorias[0]?.nombre || ""),
        precio: producto.precio || "",
        descripcion: producto.descripcion || "",
        imagen: producto.imagen || "",
        estado: producto.estado || "Activo"
      });
      setFichaTecnica(producto.fichaTecnica || null);
    } else {
      setForm({
        codigo: "",
        nombre: "",
        categoria: categorias[0]?.nombre || "",
        precio: "",
        descripcion: "",
        imagen: "",
        estado: "Activo"
      });
      setFichaTecnica(null);
    }
  }, [producto, isOpen, categorias]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) return;
    onSave({ ...form, precio: Number(form.precio) || 0, fichaTecnica });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-[#F05454]" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {isEditing ? "Editar Producto" : "Nuevo Producto"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Código del Producto</label>
              <input
                type="text"
                value={form.codigo}
                onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                className={inputCls}
                placeholder="Ej. PRD-101"
              />
            </div>

            <div>
              <label className={labelCls}>Nombre del Producto</label>
              <input
                type="text"
                required
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className={inputCls}
                placeholder="Ej. Hamburguesa Especial"
              />
            </div>

            <div>
              <label className={labelCls}>Categoría</label>
              <select
                value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                className={inputCls}
              >
                {categorias.map((c) => (
                  <option key={c.id || c.nombre} value={c.nombre}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Precio de Venta ($ COP)</label>
              <input
                type="number"
                required
                min="0"
                value={form.precio}
                onChange={(e) => setForm({ ...form, precio: e.target.value })}
                className={inputCls}
                placeholder="Ej. 25000"
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelCls}>URL de Imagen (Opcional)</label>
              <input
                type="url"
                value={form.imagen}
                onChange={(e) => setForm({ ...form, imagen: e.target.value })}
                className={inputCls}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelCls}>Descripción</label>
              <textarea
                rows={2}
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                className={inputCls}
                placeholder="Descripción del platillo e ingredientes principales..."
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelCls}>Estado</label>
              <select
                value={form.estado}
                onChange={(e) => setForm({ ...form, estado: e.target.value })}
                className={inputCls}
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>

          {/* Section: Ficha Técnica */}
          <FichaTecnicaProducto
            initialData={fichaTecnica}
            onSave={(data) => setFichaTecnica(data)}
          />

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
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
              {isEditing ? "Guardar Cambios" : "Crear Producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
