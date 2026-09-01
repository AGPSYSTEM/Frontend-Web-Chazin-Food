import { useState, useEffect } from "react";
import { X, Package } from "lucide-react";
import { FichaTecnicaInsumo } from "@/features/fichas-tecnicas/componentes/FichaTecnicaInsumo";
import { NumberInput } from "@/shared/components/ui/NumberInput";
import { useNotifications } from "@/shared/hooks/useNotifications";

const inputCls = "w-full px-4 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-[#F05454] focus:border-transparent transition-colors text-sm";
const labelCls = "block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1";

export function InsumoModal({ isOpen, onClose, onSave, insumo = null, categorias = [], proveedores = [] }) {
  const notify = useNotifications();
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
        stock: Math.max(0, Number(insumo.stock || 0)),
        stockMinimo: Math.max(0, Number(insumo.stockMinimo !== undefined && insumo.stockMinimo !== null ? insumo.stockMinimo : 5)),
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

  const getUnitShort = (u) => {
    if (!u) return "und";
    const s = String(u).toLowerCase();
    if (s.includes("kg") || s.includes("kilo")) return "Kg";
    if (s.includes("gr") || s.includes("gram")) return "Gr";
    if (s.includes("lt") || s.includes("litr")) return "Lt";
    if (s.includes("ml") || s.includes("mili") || s.includes("cc")) return "Ml";
    if (s.includes("paq")) return "Paq";
    if (s.includes("porc")) return "Porción";
    return "Ud";
  };

  const handleNumberInput = (field, val) => {
    if (val === "") {
      setForm((prev) => ({ ...prev, [field]: "" }));
      return;
    }
    // Prevenir cualquier valor negativo
    if (String(val).includes("-")) {
      val = String(val).replace(/-/g, "");
    }
    const sanitized = val.length > 1 && val.startsWith("0") && !val.startsWith("0.") ? val.replace(/^0+/, "") : val;
    setForm((prev) => ({ ...prev, [field]: sanitized }));
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!form.nombre.trim()) {
      notify.warning("Campo Requerido", "Por favor escribe el nombre del insumo.");
      return;
    }

    const defaultCatId = form.idCategoriaInsumo || (categorias[0]?.id || categorias[0]?.idCategoriaInsumo || 1);
    const defaultProvId = form.idProveedor || (proveedores[0]?.id || proveedores[0]?.idProveedor || null);

    onSave({
      ...form,
      nombre: form.nombre.trim(),
      idCategoriaInsumo: defaultCatId,
      idProveedor: defaultProvId,
      precioUnitario: Math.max(0, form.precioUnitario === "" ? 0 : Number(form.precioUnitario)),
      stock: Math.max(0, form.stock === "" ? 0 : Number(form.stock)),
      stockMinimo: Math.max(0, form.stockMinimo === "" ? 0 : Number(form.stockMinimo)),
      fichaTecnica
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-100 dark:border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800 shrink-0 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/50 text-[#F05454] flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {isEditing ? "Editar Insumo" : "Nuevo Insumo"}
              </h2>
              <p className="text-xs text-gray-400">
                {isEditing ? "Modifica los datos del insumo en inventario" : "Registra un nuevo insumo para recetas e inventario"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form wrapping body and sticky footer */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden min-h-0"
        >
          {/* Scrollable Form Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Banner de Guía de Unidades y Stock */}
              <div className="sm:col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-100 dark:border-blue-900/50 rounded-2xl p-3.5 flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  ℹ️
                </div>
                <div className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
                  <p className="font-semibold text-blue-950 dark:text-blue-100">Control de Inventario y Fórmulas:</p>
                  El stock nunca será negativo. Si compras en <strong>Kilogramos (Kg)</strong> o <strong>Litros (Lt)</strong>, en las Fichas Técnicas puedes usar porciones en <strong>Gramos (Gr)</strong> o <strong>Mililitros (Ml)</strong> y el sistema convertirá las proporciones automáticamente al vender.
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className={labelCls}>Nombre del Insumo *</label>
                <input
                  type="text"
                  required
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className={inputCls}
                  placeholder="Ej. Queso Cheddar o Pan Hamburguesa"
                  autoFocus
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
                <label className={labelCls}>Unidad de Medida / Presentación</label>
                <select
                  value={form.unidadMedida}
                  onChange={(e) => setForm({ ...form, unidadMedida: e.target.value })}
                  className={inputCls}
                >
                  <option value="Kg">Kilogramos (Kg) — Peso / Masa</option>
                  <option value="Gr">Gramos (Gr) — Peso / Masa</option>
                  <option value="Lt">Litros (Lt) — Volumen / Líquidos</option>
                  <option value="Ml">Mililitros (Ml) — Volumen / Líquidos</option>
                  <option value="Unidad">Unidad (Ud) — Conteo individual</option>
                  <option value="Paquete">Paquete — Presentación cerrada</option>
                  <option value="Porción">Porción — Ración individual</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>
                  Precio de Compra (${form.unidadMedida ? ` / ${getUnitShort(form.unidadMedida)}` : ""})
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">$</span>
                  <NumberInput
                    min="0"
                    step="0.01"
                    value={form.precioUnitario}
                    onChange={(e) => handleNumberInput("precioUnitario", e.target.value)}
                    className={`${inputCls} pl-8 pr-16`}
                    placeholder="0.00"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase">
                    / {getUnitShort(form.unidadMedida)}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Costo por cada {getUnitShort(form.unidadMedida)} comprado.</p>
              </div>

              <div>
                <label className={labelCls}>
                  Stock Inicial / Actual ({getUnitShort(form.unidadMedida)})
                </label>
                <div className="relative">
                  <NumberInput
                    min="0"
                    step={form.unidadMedida === "Kg" || form.unidadMedida === "Lt" ? "0.01" : "1"}
                    value={form.stock}
                    onChange={(e) => handleNumberInput("stock", e.target.value)}
                    className={`${inputCls} pr-16 font-semibold`}
                    placeholder="0"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                    {getUnitShort(form.unidadMedida)}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Existencia física total en bodega (mínimo 0).</p>
              </div>

              <div>
                <label className={labelCls}>
                  Stock Mínimo Alerta ({getUnitShort(form.unidadMedida)})
                </label>
                <div className="relative">
                  <NumberInput
                    min="0"
                    step={form.unidadMedida === "Kg" || form.unidadMedida === "Lt" ? "0.01" : "1"}
                    value={form.stockMinimo}
                    onChange={(e) => handleNumberInput("stockMinimo", e.target.value)}
                    className={`${inputCls} pr-16`}
                    placeholder="5"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                    {getUnitShort(form.unidadMedida)}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Alerta cuando las existencias sean ≤ {form.stockMinimo || 5} {getUnitShort(form.unidadMedida)}.</p>
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
          </div>

          {/* Pinned Sticky Footer - ALWAYS VISIBLE */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-gray-700/60 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-bold text-white bg-[#F05454] hover:bg-[#d84343] rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center gap-2"
            >
              {isEditing ? "Guardar Cambios" : "Crear Insumo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
