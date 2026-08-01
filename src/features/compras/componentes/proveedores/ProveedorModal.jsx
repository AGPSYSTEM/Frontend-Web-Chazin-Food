import { useState, useEffect } from "react";
import { X, Building } from "lucide-react";

const inputCls = "w-full px-4 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-[#F05454] focus:border-transparent transition-colors text-sm";
const labelCls = "block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1";

export function ProveedorModal({ isOpen, onClose, onSave, proveedor = null }) {
  const isEditing = !!proveedor;
  const [form, setForm] = useState({
    nombre: "",
    nit: "",
    contacto: "",
    email: "",
    telefono: "",
    direccion: "",
    estado: "Activo"
  });

  useEffect(() => {
    if (proveedor) {
      setForm({
        nombre: proveedor.nombre || "",
        nit: proveedor.nit || proveedor.numeroDocumento || "",
        contacto: proveedor.contacto || proveedor.nombreContacto || "",
        email: proveedor.email || proveedor.correo || "",
        telefono: proveedor.telefono || "",
        direccion: proveedor.direccion || "",
        estado: proveedor.estado || "Activo"
      });
    } else {
      setForm({
        nombre: "",
        nit: "",
        contacto: "",
        email: "",
        telefono: "",
        direccion: "",
        estado: "Activo"
      });
    }
  }, [proveedor, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) return;
    onSave({
      ...form,
      numeroDocumento: form.nit,
      nombreContacto: form.contacto,
      correo: form.email
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-[#F05454]" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {isEditing ? "Editar Proveedor" : "Nuevo Proveedor"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>Nombre de la Empresa / Razón Social</label>
              <input
                type="text"
                required
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className={inputCls}
                placeholder="Ej. Distribuidora Avícola S.A.S."
              />
            </div>

            <div>
              <label className={labelCls}>NIT / Documento</label>
              <input
                type="text"
                value={form.nit}
                onChange={(e) => setForm({ ...form, nit: e.target.value })}
                className={inputCls}
                placeholder="Ej. 900.123.456-7"
              />
            </div>

            <div>
              <label className={labelCls}>Persona de Contacto</label>
              <input
                type="text"
                value={form.contacto}
                onChange={(e) => setForm({ ...form, contacto: e.target.value })}
                className={inputCls}
                placeholder="Ej. Carlos Mendoza"
              />
            </div>

            <div>
              <label className={labelCls}>Correo Electrónico</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputCls}
                placeholder="contacto@empresa.com"
              />
            </div>

            <div>
              <label className={labelCls}>Teléfono / Celular</label>
              <input
                type="tel"
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                className={inputCls}
                placeholder="Ej. 310 987 6543"
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelCls}>Dirección</label>
              <input
                type="text"
                value={form.direccion}
                onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                className={inputCls}
                placeholder="Ej. Av. Central #12-34"
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

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
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
              {isEditing ? "Guardar Cambios" : "Crear Proveedor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
