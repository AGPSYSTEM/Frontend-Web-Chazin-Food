import { useState, useEffect } from "react";
import { X, Package } from "lucide-react";
import { FichaTecnicaInsumo } from "@/features/fichas-tecnicas/componentes/FichaTecnicaInsumo";

const inputCls = "w-full px-4 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-[#F05454] focus:border-transparent transition-colors text-sm";
const labelCls = "block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1";

export function InsumoModal({ isOpen, onClose, onSave, insumo = null, categorias = [], proveedores = [] }) {
  const isEditing = !!insumo;
  const [form, setForm] = useState({
    nombre: "",
    idCategoriaInsumo: "",
    categoria: "",
    unidadMedida: "Kg",
    precioUnitario: 0,
    idProveedor: "",
    proveedor: "",
    stock: 0,
    stockMinimo: 5,
    fechaExpedicion: "",
    fechaVencimiento: "",
    descripcion: "",
    estado: "Activo"
  });
  const [fichaTecnica, setFichaTecnica] = useState(null);

  useEffect(() => {
    if (insumo) {
      setForm({
        nombre: insumo.nombre || "",
        idCategoriaInsumo: insumo.idCategoriaInsumo || "",
        categoria: insumo.categoria || insumo.categoriaNombre || (categorias[0]?.nombre || ""),
        unidadMedida: insumo.unidadMedida || "Kg",
        precioUnitario: insumo.precioUnitario || insumo.costo || 0,
        idProveedor: insumo.idProveedor || "",
        proveedor: insumo.proveedor || insumo.proveedorNombre || "",
        stock: insumo.stock || 0,
        stockMinimo: insumo.stockMinimo || 5,
        fechaExpedicion: insumo.fechaExpedicion || "",
        fechaVencimiento: insumo.fechaVencimiento || "",
        descripcion: insumo.descripcion || "",
        estado: insumo.estado === 1 || insumo.estado === "Activo" ? "Activo" : "Inactivo"
      });
      setFichaTecnica(insumo.fichaTecnica || null);
    } else {
      setForm({
        nombre: "",
        idCategoriaInsumo: categorias[0]?.id || categorias[0]?.idCategoriaInsumo || "",
        categoria: categorias[0]?.nombre || "",
        unidadMedida: "Kg",
        precioUnitario: 0,
        idProveedor: proveedores[0]?.id || proveedores[0]?.idProveedor || "",
        proveedor: proveedores[0]?.nombre || "",
        stock: 0,
        stockMinimo: 5,
        fechaExpedicion: "",
        fechaVencimiento: "",
        descripcion: "",
        estado: "Activo"
      });
      setFichaTecnica(null);
    }
  }, [insumo, isOpen, categorias, proveedores]);

  if (!isOpen) return null;

  const handleNumberInput = (field, val) => {
    if (val === "") {
      setForm((prev) => ({ ...prev, [field]: "" }));
      return;
    }
    const sanitized = val.length > 1 && val.startsWith("0") && !val.startsWith("0.") ? val.replace(/^0+/, "") : val;
    setForm((prev) => ({ ...prev, [field]: sanitized }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) return;
    onSave({
      ...form,
      precioUnitario: form.precioUnitario === "" ? 0 : Number(form.precioUnitario),
      stock: form.stock === "" ? 0 : Number(form.stock),
      stockMinimo: form.stockMinimo === "" ? 0 : Number(form.stockMinimo),
      fichaTecnica
    });
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
            <div className="sm:col-span-2">
              <label className={labelCls}>Nombre del Insumo *</label>
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
                value={String(form.idCategoriaInsumo || "")}
                onChange={(e) => {
                  const val = e.target.value;
                  const selectedCat = categorias.find(c => String(c.id || c.idCategoriaInsumo) === String(val) || c.nombre === val);
                  setForm({
                    ...form,
                    idCategoriaInsumo: selectedCat ? (selectedCat.id || selectedCat.idCategoriaInsumo) : (val ? Number(val) : ""),
                    categoria: selectedCat ? selectedCat.nombre : val
                  });
                }}
                className={inputCls}
              >
                <option value="">Seleccionar categoría</option>
                {categorias.map((c) => {
                  const catId = c.id || c.idCategoriaInsumo;
                  return (
                    <option key={catId || c.nombre} value={String(catId)}>
                      {c.nombre}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className={labelCls}>Proveedor</label>
              <select
                value={String(form.idProveedor || "")}
                onChange={(e) => {
                  const val = e.target.value;
                  const selectedProv = proveedores.find(p => String(p.id || p.idProveedor) === String(val) || p.nombre === val);
                  setForm({
                    ...form,
                    idProveedor: selectedProv ? (selectedProv.id || selectedProv.idProveedor) : (val ? Number(val) : ""),
                    proveedor: selectedProv ? selectedProv.nombre : val
                  });
                }}
                className={inputCls}
              >
                <option value="">Sin Proveedor / Ninguno</option>
                {proveedores.map((p) => {
                  const provId = p.id || p.idProveedor;
                  return (
                    <option key={provId || p.nombre} value={String(provId)}>
                      {p.nombre}
                    </option>
                  );
                })}
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
                <option value="Porción">Porción</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>Precio Unitario ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.precioUnitario}
                onChange={(e) => handleNumberInput("precioUnitario", e.target.value)}
                className={inputCls}
                placeholder="0.00"
              />
            </div>

            <div>
              <label className={labelCls}>Stock Inicial / Actual</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.stock}
                onChange={(e) => handleNumberInput("stock", e.target.value)}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Stock Mínimo Alerta</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.stockMinimo}
                onChange={(e) => handleNumberInput("stockMinimo", e.target.value)}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Fecha de Expedición / Producción</label>
              <input
                type="date"
                value={form.fechaExpedicion}
                onChange={(e) => setForm({ ...form, fechaExpedicion: e.target.value })}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Fecha de Vencimiento / Expiración</label>
              <input
                type="date"
                value={form.fechaVencimiento}
                onChange={(e) => setForm({ ...form, fechaVencimiento: e.target.value })}
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

            <div className="sm:col-span-2">
              <label className={labelCls}>Descripción</label>
              <textarea
                rows={2}
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                className={inputCls}
                placeholder="Descripción adicional u observaciones sobre el insumo..."
              />
            </div>
          </div>

          {/* Section: Ficha Técnica */}
          <FichaTecnicaInsumo
            insumoId={insumo?.id || insumo?.idInsumo}
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
