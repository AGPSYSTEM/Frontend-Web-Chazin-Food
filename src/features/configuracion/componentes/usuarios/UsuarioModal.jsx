import { useState, useEffect } from "react";
import { X, Upload, Eye, EyeOff, Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  sanitizeTelefono,
  sanitizeDocumento,
  getDocConfig,
  validateTelefono,
  validateDocumento,
  validateNombre,
  validateEmail,
  validateContrasena,
  validateConfirmarContrasena,
  getPasswordCriteria,
  formatNombreCompleto
} from "@/shared/utils/validationUtils";

const baseInputCls = "w-full px-4 py-2.5 border rounded-xl transition-all duration-150 text-xs placeholder:text-gray-400 outline-none";
const inputCls = "w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-[#F05454]/40 transition-colors text-xs placeholder:text-gray-400";
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
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPasswords, setShowPasswords] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const validateSingleField = (name, value, currentForm = form) => {
    let err = "";
    switch (name) {
      case "nombre": {
        const res = validateNombre(value, "nombre");
        if (!res.isValid) err = res.error;
        break;
      }
      case "apellidos": {
        if (value && value.trim()) {
          const res = validateNombre(value, "apellido");
          if (!res.isValid) err = res.error;
        }
        break;
      }
      case "documento": {
        const res = validateDocumento(value, currentForm.tipoDocumento);
        if (!res.isValid) err = res.error;
        break;
      }
      case "email": {
        const res = validateEmail(value);
        if (!res.isValid) err = res.error;
        break;
      }
      case "telefono": {
        if (value && value.trim()) {
          const res = validateTelefono(value);
          if (!res.isValid) err = res.error;
        }
        break;
      }
      case "password": {
        if (!isEditing || value) {
          const res = validateContrasena(value, 8, "contraseña");
          if (!res.isValid) err = res.error;
        }
        break;
      }
      case "confirmPassword": {
        if (!isEditing || currentForm.password) {
          const res = validateConfirmarContrasena(currentForm.password, value);
          if (!res.isValid) err = res.error;
        }
        break;
      }
      default:
        break;
    }
    return err;
  };

  const handleFieldChange = (name, value) => {
    const updatedForm = { ...form, [name]: value };
    setForm(updatedForm);
    setTouched((prev) => ({ ...prev, [name]: true }));

    const err = validateSingleField(name, value, updatedForm);
    setErrors((prev) => {
      const next = { ...prev, [name]: err };
      // If changing password, revalidate confirmPassword if already touched
      if (name === "password" && (touched.confirmPassword || form.confirmPassword)) {
        next.confirmPassword = validateSingleField("confirmPassword", form.confirmPassword, updatedForm);
      }
      return next;
    });
  };

  const handleFieldBlur = (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const err = validateSingleField(name, form[name], form);
    setErrors((prev) => ({ ...prev, [name]: err }));
  };

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
    setErrors({});
    setTouched({});
    setErrorMsg("");
  }, [usuario, isOpen, rolesList]);

  if (!isOpen) return null;

  const docConfig = getDocConfig(form.tipoDocumento);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");

    // Validate all fields
    const newErrors = {};
    const fieldsToValidate = ["nombre", "documento", "email"];
    if (form.apellidos) fieldsToValidate.push("apellidos");
    if (form.telefono) fieldsToValidate.push("telefono");
    if (!isEditing) {
      fieldsToValidate.push("password", "confirmPassword");
    }

    let hasErrors = false;
    fieldsToValidate.forEach((f) => {
      const err = validateSingleField(f, form[f], form);
      if (err) {
        newErrors[f] = err;
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setErrors(newErrors);
      setTouched(fieldsToValidate.reduce((acc, f) => ({ ...acc, [f]: true }), {}));
      const firstError = Object.values(newErrors).find(Boolean);
      setErrorMsg(firstError || "Por favor corrige los errores antes de continuar.");
      return;
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

  const getInputClass = (fieldName) => {
    const hasValue = form[fieldName] && String(form[fieldName]).length > 0;
    const hasError = (touched[fieldName] || hasValue) && errors[fieldName];
    const isValid = (touched[fieldName] || hasValue) && !errors[fieldName] && hasValue;
    if (hasError) {
      return `${baseInputCls} border-red-500 bg-red-50/30 text-red-900 focus:ring-2 focus:ring-red-400 focus:border-red-500 dark:border-red-600 dark:bg-red-950/20 dark:text-red-300`;
    }
    if (isValid) {
      return `${baseInputCls} border-emerald-400/80 bg-emerald-50/15 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-400/40 dark:border-emerald-600 dark:bg-emerald-950/10`;
    }
    return `${baseInputCls} border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-[#F05454]/40 focus:border-transparent`;
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate autoComplete="off">
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

          {/* Tipo de Documento y Número de Documento — PRIMER campo del formulario */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Tipo de Documento</label>
              <select
                value={form.tipoDocumento}
                onChange={(e) => {
                  const newTipo = e.target.value;
                  const newDoc = sanitizeDocumento(form.documento, newTipo);
                  const updated = { ...form, tipoDocumento: newTipo, documento: newDoc };
                  setForm(updated);
                  setTouched((prev) => ({ ...prev, tipoDocumento: true, documento: true }));
                  const err = validateSingleField("documento", newDoc, updated);
                  setErrors((prev) => ({ ...prev, documento: err }));
                }}
                className={`${baseInputCls} border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-[#F05454]/40 cursor-pointer`}
              >
                <option value="C.C.">Cédula de Ciudadanía (C.C.)</option>
                <option value="T.I.">Tarjeta de Identidad (T.I.)</option>
                <option value="C.E.">Cédula de Extranjería (C.E.)</option>
                <option value="PPT">Permiso por Protección Temporal (PPT)</option>
                <option value="Pasaporte">Pasaporte</option>
                <option value="NIT">NIT</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={labelCls}>Número de Identificación *</label>
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
                  handleFieldChange("documento", clean);
                }}
                onBlur={() => handleFieldBlur("documento")}
                className={getInputClass("documento")}
                placeholder={docConfig.helper}
              />
              {(touched.documento || form.documento) && errors.documento ? (
                <p className="text-[11px] text-red-500 font-medium mt-1 flex items-center gap-1 animate-in fade-in duration-150">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.documento}</span>
                </p>
              ) : form.documento && !errors.documento ? (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1 animate-in fade-in duration-150">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Documento válido</span>
                </p>
              ) : null}
            </div>
          </div>

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
                    handleFieldChange("nombre", val);
                  }
                }}
                onBlur={() => handleFieldBlur("nombre")}
                className={getInputClass("nombre")}
                placeholder="Ej: Juan Carlos"
              />
              {(touched.nombre || form.nombre) && errors.nombre ? (
                <p className="text-[11px] text-red-500 font-medium mt-1 flex items-center gap-1 animate-in fade-in duration-150">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.nombre}</span>
                </p>
              ) : form.nombre && !errors.nombre ? (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1 animate-in fade-in duration-150">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Nombre válido</span>
                </p>
              ) : null}
            </div>
            <div>
              <label className={labelCls}>Apellidos</label>
              <input
                type="text"
                value={form.apellidos}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s-]*$/.test(val)) {
                    handleFieldChange("apellidos", val);
                  }
                }}
                onBlur={() => handleFieldBlur("apellidos")}
                className={getInputClass("apellidos")}
                placeholder="Ej: Pérez Gómez"
              />
              {(touched.apellidos || form.apellidos) && errors.apellidos ? (
                <p className="text-[11px] text-red-500 font-medium mt-1 flex items-center gap-1 animate-in fade-in duration-150">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.apellidos}</span>
                </p>
              ) : form.apellidos && !errors.apellidos ? (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1 animate-in fade-in duration-150">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Apellido válido</span>
                </p>
              ) : null}
            </div>
          </div>

          {/* Email + Telefono (2 Cols) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Email *</label>
              <input
                type="email"
                required
                autoComplete="off"
                name="new_user_email"
                value={form.email}
                onChange={(e) => handleFieldChange("email", e.target.value)}
                onBlur={() => handleFieldBlur("email")}
                className={getInputClass("email")}
                placeholder="usuario@chazinfood.com"
              />
              {(touched.email || form.email) && errors.email ? (
                <p className="text-[11px] text-red-500 font-medium mt-1 flex items-center gap-1 animate-in fade-in duration-150">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.email}</span>
                </p>
              ) : form.email && !errors.email ? (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1 animate-in fade-in duration-150">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Correo electrónico válido</span>
                </p>
              ) : null}
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
                  handleFieldChange("telefono", clean);
                }}
                onBlur={() => handleFieldBlur("telefono")}
                className={getInputClass("telefono")}
                placeholder="3190000000"
                inputMode="numeric"
              />
              {(touched.telefono || form.telefono) && errors.telefono ? (
                <p className="text-[11px] text-red-500 font-medium mt-1 flex items-center gap-1 animate-in fade-in duration-150">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.telefono}</span>
                </p>
              ) : form.telefono && !errors.telefono ? (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1 animate-in fade-in duration-150">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Teléfono válido</span>
                </p>
              ) : null}
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
                    className={`${baseInputCls} border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 cursor-pointer`}
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
                    className={`${baseInputCls} border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 cursor-pointer`}
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
                        autoComplete="new-password"
                        name="new_user_password"
                        value={form.password}
                        onChange={(e) => handleFieldChange("password", e.target.value)}
                        onBlur={() => handleFieldBlur("password")}
                        className={`${getInputClass("password")} pl-10`}
                        placeholder="••••••••"
                      />
                    </div>
                    {(touched.password || form.password) && (
                      <div className="mt-2 space-y-1 bg-white/80 dark:bg-gray-900/80 p-2.5 rounded-xl border border-gray-200/60 dark:border-gray-700/60 text-[10.5px]">
                        <p className="font-bold text-gray-700 dark:text-gray-300 mb-1">Requisitos de seguridad:</p>
                        {(() => {
                          const crit = getPasswordCriteria(form.password, 8);
                          return (
                            <div className="grid grid-cols-2 gap-1 font-medium">
                              <span className={`flex items-center gap-1 ${crit.hasLength ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-gray-400"}`}>
                                <CheckCircle2 className={`w-3 h-3 ${crit.hasLength ? "text-emerald-500" : "text-gray-300"}`} />
                                Mín. 8 caracteres
                              </span>
                              <span className={`flex items-center gap-1 ${crit.hasUpper ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-gray-400"}`}>
                                <CheckCircle2 className={`w-3 h-3 ${crit.hasUpper ? "text-emerald-500" : "text-gray-300"}`} />
                                1 Mayúscula
                              </span>
                              <span className={`flex items-center gap-1 ${crit.hasLower ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-gray-400"}`}>
                                <CheckCircle2 className={`w-3 h-3 ${crit.hasLower ? "text-emerald-500" : "text-gray-300"}`} />
                                1 Minúscula
                              </span>
                              <span className={`flex items-center gap-1 ${crit.hasNumber ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-gray-400"}`}>
                                <CheckCircle2 className={`w-3 h-3 ${crit.hasNumber ? "text-emerald-500" : "text-gray-300"}`} />
                                1 Número
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className={labelCls}>Confirmar Contraseña *</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPasswords ? "text" : "password"}
                        required
                        autoComplete="new-password"
                        name="new_user_confirm_password"
                        value={form.confirmPassword}
                        onChange={(e) => handleFieldChange("confirmPassword", e.target.value)}
                        onBlur={() => handleFieldBlur("confirmPassword")}
                        className={`${getInputClass("confirmPassword")} pl-10`}
                        placeholder="Repite tu contraseña"
                      />
                    </div>
                    {(touched.confirmPassword || form.confirmPassword) && (
                      form.confirmPassword ? (
                        form.password === form.confirmPassword ? (
                          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1 animate-in fade-in duration-150">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>Las contraseñas coinciden</span>
                          </p>
                        ) : (
                          <p className="text-[11px] text-red-500 font-medium mt-1 flex items-center gap-1 animate-in fade-in duration-150">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>Las contraseñas no coinciden</span>
                          </p>
                        )
                      ) : null
                    )}
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
                      className={`${baseInputCls} border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 cursor-pointer`}
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
