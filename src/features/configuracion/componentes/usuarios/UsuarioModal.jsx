import { useState, useEffect } from "react";
import { X, Upload } from "lucide-react";

const inputCls = "w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-[#F05454]/40 focus:border-transparent transition-colors text-sm placeholder:text-gray-400";
const labelCls = "block text-xs font-bold text-gray-800 dark:text-gray-200 mb-1.5";

export function UsuarioModal({ isOpen, onClose, onSave, usuario = null, rolesList = [] }) {
  const isEditing = !!usuario;
  const [form, setForm] = useState({
    nombre: "",
    apellidos: "",
    email: "",
    telefono: "",
    password: "",
    confirmPassword: "",
    idRolStr: "1",
    estado: "Activo",
    enviarCorreoBienvenida: true,
    notificarCambios: true,
    avatarFile: null
  });
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (usuario) {
      const nombreCompleto = `${usuario.nombre || ''} ${usuario.apellidos || ''}`.trim();
      setForm({
        nombre: nombreCompleto || usuario.nombre || "",
        apellidos: usuario.apellidos || "",
        email: usuario.email || usuario.correo || "",
        telefono: usuario.telefono || "",
        password: "",
        confirmPassword: "",
        idRolStr: String(usuario.idRol || usuario.idRolStr || "1"),
        estado: usuario.estado || "Activo",
        enviarCorreoBienvenida: true,
        notificarCambios: true,
        avatarFile: null
      });
    } else {
      setForm({
        nombre: "",
        apellidos: "",
        email: "",
        telefono: "",
        password: "",
        confirmPassword: "",
        idRolStr: rolesList.length > 0 ? String(rolesList[0].id) : "1",
        estado: "Activo",
        enviarCorreoBienvenida: true,
        notificarCambios: true,
        avatarFile: null
      });
    }
    setErrorMsg("");
  }, [usuario, isOpen, rolesList]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!isEditing) {
      if (form.password !== form.confirmPassword) {
        setErrorMsg("Las contraseñas no coinciden.");
        return;
      }
      if (form.password.length < 8) {
        setErrorMsg("La contraseña debe tener al menos 8 caracteres.");
        return;
      }
    }

    onSave({
      ...form,
      notificarEmail: isEditing ? form.notificarCambios : form.enviarCorreoBienvenida
    });
  };

  const initials = isEditing && form.nombre
    ? form.nombre.split(" ").slice(0, 2).map(n => n.charAt(0).toUpperCase()).join("") || "US"
    : "US";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header (Captura 3 Edit vs Captura 4 Create) */}
        <div className="flex items-start justify-between p-6 pb-2 border-b border-gray-100/60 dark:border-gray-800/60">
          {isEditing ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#8B5CF6] text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
                {initials}
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-gray-900 dark:text-gray-100">
                  Editar Usuario
                </h2>
                <p className="text-xs text-gray-400 font-medium">
                  {form.nombre || "Usuario"}
                </p>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-gray-100">
                Nuevo Usuario
              </h2>
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-semibold border border-rose-200">
              {errorMsg}
            </div>
          )}

          {/* CREATION ONLY: Avatar Upload (Captura 4 & 5) */}
          {!isEditing && (
            <div className="space-y-1.5">
              <label className={labelCls}>Imagen de Perfil (Opcional)</label>
              <div className="border-2 border-dashed border-gray-200 dark:border-gray-700/80 rounded-2xl p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                  <Upload className="w-5 h-5 stroke-[1.75]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Haz clic para subir foto de perfil
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    PNG, JPG hasta 2MB
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Nombre Completo */}
          <div>
            <label className={labelCls}>Nombre Completo</label>
            <input
              type="text"
              required
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value.replace(/[0-9]/g, "") })}
              className={inputCls}
              placeholder={isEditing ? "Nombre Completo" : "Ej: Juan Pérez"}
            />
          </div>

          {/* Email + Telefono (2 Cols) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputCls}
                placeholder="usuario@chazinfood.com"
              />
            </div>
            <div>
              <label className={labelCls}>Teléfono</label>
              <input
                type="tel"
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value.replace(/[^0-9]/g, "") })}
                className={inputCls}
                placeholder="319 000 0000"
                inputMode="numeric"
              />
            </div>
          </div>

          {/* EDITING MODE: Rol + Estado (2 Cols) & Blue Banner (Captura 3) */}
          {isEditing ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Rol</label>
                  <select
                    value={form.idRolStr}
                    onChange={(e) => setForm({ ...form, idRolStr: e.target.value })}
                    className={inputCls}
                  >
                    {rolesList.length > 0 ? (
                      rolesList.map((r) => (
                        <option key={r.id} value={String(r.id)}>
                          {r.nombre}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="1">Administrador</option>
                        <option value="2">Empleado</option>
                        <option value="3">Cliente</option>
                      </>
                    )}
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
              </div>

              {/* Blue Notification Box for Editing (Captura 3) */}
              <div className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100/80 dark:border-blue-900/50 rounded-2xl p-4 space-y-1.5">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-blue-900 dark:text-blue-200">
                  <input
                    type="checkbox"
                    checked={form.notificarCambios}
                    onChange={(e) => setForm({ ...form, notificarCambios: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-blue-300 cursor-pointer"
                  />
                  <span>Notificar al usuario por correo electrónico sobre los cambios</span>
                </label>
                <p className="text-[11px] text-blue-600 dark:text-blue-400 pl-6 leading-relaxed">
                  Se enviará un correo automático a <span className="font-semibold">{form.email || "usuario@chazinfood.com"}</span> detallando los datos modificados (Nombre, Teléfono, Rol o Estado).
                </p>
              </div>
            </>
          ) : (
            /* CREATION MODE: Credenciales Box & Rol Assignment Box (Captura 4 & 5) */
            <>
              {/* Box 1: Credenciales de Acceso */}
              <div className="bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 space-y-3">
                <h3 className="text-xs font-extrabold text-gray-800 dark:text-gray-200">
                  Credenciales de Acceso
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                </div>
                <p className="text-[11px] text-gray-400">
                  La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números
                </p>
              </div>

              {/* Box 2: Asignación de Rol */}
              <div className="bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 space-y-3">
                <h3 className="text-xs font-extrabold text-gray-800 dark:text-gray-200">
                  Asignación de Rol
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Rol</label>
                    <select
                      value={form.idRolStr}
                      onChange={(e) => setForm({ ...form, idRolStr: e.target.value })}
                      className={inputCls}
                    >
                      {rolesList.length > 0 ? (
                        rolesList.map((r) => (
                          <option key={r.id} value={String(r.id)}>
                            {r.nombre}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="3">Cliente</option>
                          <option value="1">Administrador</option>
                          <option value="2">Empleado</option>
                        </>
                      )}
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
                </div>

                {/* Inner Blue Banner */}
                <div className="bg-blue-50/80 dark:bg-blue-950/40 p-2.5 rounded-xl border border-blue-100/80 dark:border-blue-900/50 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                  El usuario heredará todos los permisos asignados al rol seleccionado
                </div>
              </div>

              {/* Welcome Checkbox (Captura 5) */}
              <div className="pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={form.enviarCorreoBienvenida}
                    onChange={(e) => setForm({ ...form, enviarCorreoBienvenida: e.target.checked })}
                    className="w-4 h-4 rounded text-[#F05454] focus:ring-[#F05454] border-gray-300 cursor-pointer"
                  />
                  <span>Enviar correo de bienvenida con credenciales de acceso</span>
                </label>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100/60 dark:border-gray-800/60">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-2xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#F05454] hover:bg-[#d84343] rounded-2xl transition-colors shadow-xs cursor-pointer"
            >
              {isEditing ? "Guardar Cambios" : "Crear Usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
