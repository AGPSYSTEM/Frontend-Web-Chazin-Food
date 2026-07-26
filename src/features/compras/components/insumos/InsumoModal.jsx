import { useState, useEffect } from "react";
import { X, Package } from "lucide-react";
import { FichaTecnicaInsumo } from "@/features/fichas-tecnicas/components/FichaTecnicaInsumo";

const inputCls = "w-full px-4 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-[#F05454] focus:border-transparent transition-colors text-sm";
const labelCls = "block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1";

export function InsumoModal({ isOpen, onClose, onSave, insumo = null, categorias = [] }) {
  const isEditing = !!insumo;
  const [form, setForm] = useState({
    codigo: "",
    nombre: "",
    categoria: "",
    unidadMedida: "Kg",
    stock: 0,
    stockMinimo: 5,
    estado: "Activo"
  });
  const [fichaTecnica, setFichaTecnica] = useState(null);

  useEffect(() => {
    if (insumo) {
      setForm({
        codigo: insumo.codigo || "",
        nombre: insumo.nombre || "",
        categoria: insumo.categoria || (categorias[0]?.nombre || ""),
        unidadMedida: insumo.unidadMedida || "Kg",
        stock: insumo.stock || 0,
        stockMinimo: insumo.stockMinimo || 5,
        estado: insumo.estado || "Activo"
      });
      setFichaTecnica(insumo.fichaTecnica || null);
    } else {
      setForm({
        codigo: "",
        nombre: "",
        categoria: categorias[0]?.nombre || "",
        unidadMedida: "Kg",
        stock: 0,
        stockMinimo: 5,
        estado: "Activo"
      });
      setFichaTecnica(null);
    }
  }, [insumo, isOpen, categorias]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) return;
    onSave({ ...form, fichaTecnica });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-[#F05454]" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {isEditing ? "Editar Insumo" : "Nuevo Insumo"}
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
              <label className={labelCls}>Código Insumo</label>
              <input
                type="text"
                value={form.codigo}
                onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                className={inputCls}
                placeholder="Ej. INS-001"
              />
            </div>

            <div>
              <label className={labelCls}>Nombre del Insumo</label>
              <input
                type="text"
                required
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className={inputCls}
                placeholder="Ej. Carne Molida de Res"
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
              <label className={labelCls}>Unidad de Medida</label>
              <select
                value={form.unidadMedida}
                onChange={(e) => setForm({ ...form, unidadMedida: e.target.value })}
                className={inputCls}
              >
                <option value="Kg">Kilogramos (Kg)</option>
                <option value="Gr">Gramos (Gr)</option>
                <option value="Lt">Litros (Lt)</option>
                <option value="Ml">Mililitros (Ml)</option>
                <option value="Unidad">Unidad (Ud)</option>
                <option value="Paquete">Paquete</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>Stock Inicial / Actual</label>
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Stock Mínimo Alerta</label>
              <input
                type="number"
                min="1"
                value={form.stockMinimo}
                onChange={(e) => setForm({ ...form, stockMinimo: Number(e.target.value) })}
                className={inputCls}
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
          <FichaTecnicaInsumo
            insumoName={form.nombre}
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
              {isEditing ? "Guardar Cambios" : "Crear Insumo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
