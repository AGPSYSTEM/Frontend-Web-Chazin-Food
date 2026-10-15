import { useState, useEffect } from "react";
import { X, Upload, Eye, EyeOff, Lock } from "lucide-react";
import {
  sanitizeTelefono,
  sanitizeDocumento,
  getDocConfig,
  validateTelefono,
  validateDocumento,
  formatNombreCompleto
} from "@/shared/utils/validationUtils";

const inputCls = "w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-[#F05454]/40 focus:border-transparent transition-colors text-xs placeholder:text-gray-400";
const labelCls = "block text-xs font-bold text-gray-800 dark:text-gray-200 mb-1.5";

export function UsuarioModal({ isOpen, onClose, onSave, usuario = null, rolesList = [] }) {
  const isEditing = !!usuario;
  const [form, setForm] = useState({
    nombre: "",
    apellidos: "",
    tipoDocumento: "C.C.",
    documento: "",
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
  const [showPasswords, setShowPasswords] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (usuario) {
      setForm({
        nombre: usuario.nombre || "",
        apellidos: usuario.apellidos || "",
        tipoDocumento: usuario.tipoDocumento || "C.C.",
        documento: usuario.documento || (usuario.idUsuario ? String(usuario.idUsuario) : ""),
        email: usuario.email || usuario.correo || "",
        telefono: sanitizeTelefono(usuario.telefono || ""),
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
        tipoDocumento: "C.C.",
        documento: "",
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

  const docConfig = getDocConfig(form.tipoDocumento);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!form.nombre.trim()) {
      setErrorMsg("El nombre del usuario es obligatorio.");
      return;
    }

    if (form.telefono) {
      const telVal = validateTelefono(form.telefono);
      if (!telVal.isValid) {
        setErrorMsg(telVal.error);
        return;
      }
    }

    if (form.documento) {
      const docVal = validateDocumento(form.documento, form.tipoDocumento);
      if (!docVal.isValid) {
        setErrorMsg(docVal.error);
        return;
      }
    }

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
      nombre: form.nombre.trim(),
      apellidos: form.apellidos.trim(),
      telefono: sanitizeTelefono(form.telefono),
      documento: sanitizeDocumento(form.documento, form.tipoDocumento),
      notificarEmail: isEditing ? form.notificarCambios : form.enviarCorreoBienvenida
    });
  };

  const displayName = formatNombreCompleto(form.nombre, form.apellidos) || "Usuario";
  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((n) => n.charAt(0).toUpperCase())
    .join("") || "US";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
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
                  {displayName}
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
            <div className="p-3 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 text-xs font-semibold border border-rose-200 dark:border-rose-800">
              {errorMsg}
            </div>
          )}

          {/* CREATION ONLY: Avatar Upload */}
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

          {/* Nombres y Apellidos Separados */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Nombres *</label>
              <input
                type="text"
                required
                value={form.nombre}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s-]*$/.test(val)) {
                    setForm({ ...form, nombre: val });
                  }
                }}
                className={inputCls}
                placeholder="Ej: Juan Carlos"
              />
            </div>
            <div>
              <label className={labelCls}>Apellidos</label>
              <input
                type="text"
                value={form.apellidos}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s-]*$/.test(val)) {
                    setForm({ ...form, apellidos: val });
                  }
                }}
                className={inputCls}
                placeholder="Ej: Pérez Gómez"
              />
            </div>
          </div>

          {/* Tipo de Documento y Número de Documento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Tipo de Documento</label>
              <select
                value={form.tipoDocumento}
                onChange={(e) => {
                  const newTipo = e.target.value;
                  setForm({
                    ...form,
                    tipoDocumento: newTipo,
                    documento: sanitizeDocumento(form.documento, newTipo)
                  });
                }}
                className={`${inputCls} cursor-pointer`}
              >
                <option value="C.C.">Cédula de Ciudadanía (C.C.)</option>
                <option value="T.I.">Tarjeta de Identidad (T.I.)</option>
                <option value="C.E.">Cédula de Extranjería (C.E.)</option>
                <option value="Pasaporte">Pasaporte</option>
                <option value="NIT">NIT</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={labelCls}>Número de Documento</label>
                <span className="text-[10px] text-gray-400 font-medium">
                  {docConfig.helper}
                </span>
              </div>
              <input
                type="text"
                value={form.documento}
                maxLength={docConfig.max}
                onChange={(e) => {
                  const clean = sanitizeDocumento(e.target.value, form.tipoDocumento);
                  setForm({ ...form, documento: clean });
                }}
                className={inputCls}
                placeholder={docConfig.helper}
              />
            </div>
          </div>

          {/* Email + Telefono (2 Cols) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Email *</label>
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
              <div className="flex items-center justify-between mb-1.5">
                <label className={labelCls}>Teléfono</label>
                <span className="text-[10px] text-gray-400 font-medium">
                  Máx. 10 dígitos ({form.telefono.length}/10)
                </span>
              </div>
              <input
                type="tel"
                value={form.telefono}
                maxLength={10}
                onChange={(e) => {
                  const clean = sanitizeTelefono(e.target.value);
                  setForm({ ...form, telefono: clean });
                }}
                className={inputCls}
                placeholder="3190000000"
                inputMode="numeric"
              />
            </div>
          </div>

          {/* EDITING MODE: Rol + Estado (2 Cols) & Blue Banner */}
          {isEditing ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Rol</label>
                  <select
                    value={form.idRolStr}
                    onChange={(e) => setForm({ ...form, idRolStr: e.target.value })}
                    className={`${inputCls} cursor-pointer`}
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
                        <option value="2">Cocinero</option>
                        <option value="3">Vendedor</option>
                        <option value="4">Cliente</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Estado</label>
                  <select
                    value={form.estado}
                    onChange={(e) => setForm({ ...form, estado: e.target.value })}
                    className={`${inputCls} cursor-pointer`}
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              </div>

              {/* Blue Notification Box for Editing */}
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
                  Se enviará un correo automático a <span className="font-semibold">{form.email || "usuario@chazinfood.com"}</span> detallando los datos modificados.
                </p>
              </div>
            </>
          ) : (
            /* CREATION MODE: Credenciales Box & Rol Assignment Box */
            <>
              {/* Box 1: Credenciales de Acceso */}
              <div className="bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 space-y-3">
                <h3 className="text-xs font-extrabold text-gray-800 dark:text-gray-200">
                  Credenciales de Acceso
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Contraseña *</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPasswords ? "text" : "password"}
                        required
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className={`${inputCls} pl-10`}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Confirmar Contraseña *</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPasswords ? "text" : "password"}
                        required
                        value={form.confirmPassword}
                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                        className={`${inputCls} pl-10`}
                        placeholder="Repite tu contraseña"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors cursor-pointer"
                  >
                    {showPasswords ? (
                      <>
                        <EyeOff className="w-4 h-4 text-gray-500" />
                        <span>Ocultar contraseñas</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 text-gray-500" />
                        <span>Mostrar contraseñas</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-gray-400">
                  La contraseña debe tener al menos 8 caracteres
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
                      className={`${inputCls} cursor-pointer`}
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
                          <option value="2">Cocinero</option>
                          <option value="3">Vendedor</option>
                          <option value="4">Cliente</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Estado</label>
                    <select
                      value={form.estado}
                      onChange={(e) => setForm({ ...form, estado: e.target.value })}
                      className={`${inputCls} cursor-pointer`}
                    >
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>

                <div className="bg-blue-50/80 dark:bg-blue-950/40 p-2.5 rounded-xl border border-blue-100/80 dark:border-blue-900/50 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                  El usuario heredará todos los permisos asignados al rol seleccionado
                </div>
              </div>

              {/* Welcome Checkbox */}
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
