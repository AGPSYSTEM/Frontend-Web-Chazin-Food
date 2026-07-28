import { useState, useEffect } from "react";
import { X, User, Mail, Phone, Lock, Shield, MapPin, CreditCard } from "lucide-react";

const inputCls = "w-full px-4 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-[#F05454] focus:border-transparent transition-colors text-sm";
const labelCls = "block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1";

export function UsuarioModal({ isOpen, onClose, onSave, usuario = null, rolesList = [] }) {
  const isEditing = !!usuario;
  const [form, setForm] = useState({
    documento: "",
    tipoDocumento: "C.C.",
    nombre: "",
    apellidos: "",
    email: "",
    telefono: "",
    direccion: "",
    password: "",
    confirmPassword: "",
    idRolStr: "3",
    estado: "Activo"
  });

  useEffect(() => {
    if (usuario) {
      setForm({
        documento: usuario.documento || "",
        tipoDocumento: usuario.tipoDocumento || "C.C.",
        nombre: usuario.nombre || "",
        apellidos: usuario.apellidos || "",
        email: usuario.email || "",
        telefono: usuario.telefono || "",
        direccion: usuario.direccion || "",
        password: "",
        confirmPassword: "",
        idRolStr: String(usuario.idRol || usuario.idRolStr || "3"),
        estado: usuario.estado || "Activo"
      });
    } else {
      setForm({
        documento: "",
        tipoDocumento: "C.C.",
        nombre: "",
        apellidos: "",
        email: "",
        telefono: "",
        direccion: "",
        password: "",
        confirmPassword: "",
        idRolStr: "3",
        estado: "Activo"
      });
    }
  }, [usuario, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isEditing && form.password !== form.confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {isEditing ? "Editar Usuario" : "Nuevo Usuario"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Tipo de Documento</label>
              <select
                value={form.tipoDocumento}
                onChange={(e) => setForm({ ...form, tipoDocumento: e.target.value })}
                className={inputCls}
              >
                <option value="C.C.">Cédula de Ciudadanía (C.C.)</option>
                <option value="C.E.">Cédula de Extranjería (C.E.)</option>
                <option value="NIT">NIT</option>
                <option value="Pasaporte">Pasaporte</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>Número de Documento</label>
              <input
                type="text"
                required
                disabled={isEditing}
                value={form.documento}
                onChange={(e) => setForm({ ...form, documento: e.target.value })}
                className={inputCls}
                placeholder="Ej. 1098765432"
              />
            </div>

            <div>
              <label className={labelCls}>Nombre(s)</label>
              <input
                type="text"
                required
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className={inputCls}
                placeholder="Ej. Juan Andrés"
              />
            </div>

            <div>
              <label className={labelCls}>Apellidos</label>
              <input
                type="text"
                value={form.apellidos}
                onChange={(e) => setForm({ ...form, apellidos: e.target.value })}
                className={inputCls}
                placeholder="Ej. Pérez Gómez"
              />
            </div>

            <div>
              <label className={labelCls}>Correo Electrónico</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputCls}
                placeholder="correo@ejemplo.com"
              />
            </div>

            <div>
              <label className={labelCls}>Teléfono</label>
              <input
                type="tel"
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                className={inputCls}
                placeholder="Ej. 300 123 4567"
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelCls}>Dirección</label>
              <input
                type="text"
                value={form.direccion}
                onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                className={inputCls}
                placeholder="Ej. Calle 123 #45-67"
              />
            </div>

            <div>
              <label className={labelCls}>Rol del Sistema</label>
              <select
                value={form.idRolStr}
                onChange={(e) => setForm({ ...form, idRolStr: e.target.value })}
                className={inputCls}
              >
                {rolesList.map((r) => (
                  <option key={r.id} value={String(r.id)}>
                    {r.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
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

            {!isEditing && (
              <>
                <div>
                  <label className={labelCls}>Contraseña</label>
                  <input
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className={inputCls}
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className={labelCls}>Confirmar Contraseña</label>
                  <input
                    type="password"
                    required
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    className={inputCls}
                    placeholder="••••••••"
                  />
                </div>
              </>
            )}
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
              {isEditing ? "Guardar Cambios" : "Crear Usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
