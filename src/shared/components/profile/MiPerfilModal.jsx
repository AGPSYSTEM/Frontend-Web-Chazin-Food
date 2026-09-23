import { useState, useEffect } from "react";
import {
  X, User, Save, Eye, EyeOff, UserCircle,
  Mail, Phone, MapPin, CreditCard, Lock, AlertCircle, CheckCircle2
} from "lucide-react";
import { useAuth } from "@/features/autenticacion/hooks/useAuth";
import { DOCUMENTO_CONFIG, sanitizeDocumento, validateDocumento, sanitizeTelefono } from "@/shared/utils/validationUtils";
import Swal from "sweetalert2";

const TIPOS_DOCUMENTO = ["C.C.", "C.E.", "T.I.", "Pasaporte", "NIT"];

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {msg}
    </p>
  );
}

export function MiPerfilModal({ isOpen, onClose }) {
  const { user, updateProfile } = useAuth();

  const [tab, setTab] = useState("datos"); // "datos" | "seguridad"
  const [saving, setSaving] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    apellidos: "",
    email: "",
    telefono: "",
    direccion: "",
    tipoDocumento: "C.C.",
    numeroDocumento: "",
  });

  const [passForm, setPassForm] = useState({
    passwordActual: "",
    passwordNueva: "",
    passwordConfirm: "",
  });

  const [errors, setErrors] = useState({});

  // Inicializar formulario con datos del usuario cuando el modal se abre
  useEffect(() => {
    if (isOpen && user) {
      setForm({
        nombre: user.nombre || "",
        apellidos: user.apellidos || user.apellido || "",
        email: user.email || "",
        telefono: user.telefono || "",
        direccion: user.direccion || "",
        tipoDocumento: user.tipoDocumento || "C.C.",
        numeroDocumento: user.numeroDocumento || user.documento || "",
      });
      setPassForm({ passwordActual: "", passwordNueva: "", passwordConfirm: "" });
      setErrors({});
      setTab("datos");
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const docConfig = DOCUMENTO_CONFIG[form.tipoDocumento] || DOCUMENTO_CONFIG["C.C."];

  const handleChange = (e) => {
    const { name, value } = e.target;
    let v = value;

    if (name === "numeroDocumento") {
      v = sanitizeDocumento(value, form.tipoDocumento);
    } else if (name === "telefono") {
      v = sanitizeTelefono(value);
    } else if (name === "tipoDocumento") {
      // Reset numero when tipo changes
      setForm((prev) => ({ ...prev, tipoDocumento: v, numeroDocumento: "" }));
      setErrors((prev) => ({ ...prev, tipoDocumento: "", numeroDocumento: "" }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: v }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handlePassChange = (e) => {
    const { name, value } = e.target;
    setPassForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateDatos = () => {
    const errs = {};
    if (!form.nombre.trim()) errs.nombre = "El nombre es obligatorio.";
    if (!form.apellidos.trim()) errs.apellidos = "Los apellidos son obligatorios.";
    if (!form.email.trim()) errs.email = "El correo es obligatorio.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Correo inválido.";

    if (form.numeroDocumento) {
      const docVal = validateDocumento(form.numeroDocumento, form.tipoDocumento);
      if (!docVal.isValid) errs.numeroDocumento = docVal.error;
    }

    if (form.telefono && form.telefono.length < 7) {
      errs.telefono = "El teléfono debe tener mínimo 7 dígitos.";
    }

    return errs;
  };

  const validatePass = () => {
    const errs = {};
    if (!passForm.passwordActual) errs.passwordActual = "Ingresa tu contraseña actual.";
    if (!passForm.passwordNueva) errs.passwordNueva = "Ingresa la nueva contraseña.";
    else if (passForm.passwordNueva.length < 6) errs.passwordNueva = "Mínimo 6 caracteres.";
    if (passForm.passwordNueva !== passForm.passwordConfirm) errs.passwordConfirm = "Las contraseñas no coinciden.";
    return errs;
  };

  const handleSubmitDatos = async (e) => {
    e.preventDefault();
    const errs = validateDatos();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSaving(true);
    try {
      const payload = {
        nombre: form.nombre.trim(),
        apellidos: form.apellidos.trim(),
        email: form.email.trim(),
        telefono: form.telefono || null,
        direccion: form.direccion.trim() || null,
        tipoDocumento: form.tipoDocumento,
        numeroDocumento: form.numeroDocumento || null,
      };
      const result = await updateProfile(payload);
      if (result.success) {
        await Swal.fire({
          icon: "success",
          title: "¡Perfil actualizado!",
          text: "Tus datos han sido guardados correctamente.",
          confirmButtonColor: "#f05454",
          timer: 2200,
          timerProgressBar: true,
        });
        onClose();
      } else {
        Swal.fire({
          icon: "error",
          title: "No se pudo actualizar",
          text: result.message || "Ocurrió un error al guardar los datos.",
          confirmButtonColor: "#f05454",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitPass = async (e) => {
    e.preventDefault();
    const errs = validatePass();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSaving(true);
    try {
      const result = await updateProfile({
        passwordActual: passForm.passwordActual,
        passwordNueva: passForm.passwordNueva,
      });
      if (result.success) {
        await Swal.fire({
          icon: "success",
          title: "¡Contraseña cambiada!",
          text: "Tu contraseña ha sido actualizada correctamente.",
          confirmButtonColor: "#f05454",
          timer: 2200,
          timerProgressBar: true,
        });
        setPassForm({ passwordActual: "", passwordNueva: "", passwordConfirm: "" });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: result.message || "No se pudo cambiar la contraseña.",
          confirmButtonColor: "#f05454",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const rolColor = {
    administrador: "from-purple-600 to-indigo-600",
    admin: "from-purple-600 to-indigo-600",
    vendedor: "from-blue-500 to-cyan-500",
    cocinero: "from-orange-500 to-amber-500",
  };
  const gradient = rolColor[(user?.rol || "").toLowerCase()] || "from-gray-600 to-gray-700";
  const initials = `${(user?.nombre || "U")[0]}${(user?.apellidos || user?.apellido || "")[0] || ""}`.toUpperCase();

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className={`bg-gradient-to-r ${gradient} p-5 text-white relative flex items-center gap-4 shrink-0`}>
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-black text-2xl shadow-inner shrink-0">
            {initials || <UserCircle className="w-8 h-8" />}
          </div>
          <div className="min-w-0 pr-10">
            <h2 className="text-xl font-black tracking-tight">Mi Perfil</h2>
            <p className="text-sm text-white/85 font-medium truncate">
              {user?.nombre} {user?.apellidos || user?.apellido}
            </p>
            <span className="inline-block mt-0.5 text-[10px] font-bold uppercase tracking-wider bg-white/20 rounded-full px-2 py-0.5">
              {user?.rol || "Usuario"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Tabs ── */}
        <div className="flex border-b border-gray-100 dark:border-gray-800 shrink-0">
          <button
            onClick={() => setTab("datos")}
            className={`flex-1 py-3 text-sm font-bold transition-colors cursor-pointer ${tab === "datos" ? "text-[#f05454] border-b-2 border-[#f05454]" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}`}
          >
            Datos Personales
          </button>
          <button
            onClick={() => setTab("seguridad")}
            className={`flex-1 py-3 text-sm font-bold transition-colors cursor-pointer ${tab === "seguridad" ? "text-[#f05454] border-b-2 border-[#f05454]" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}`}
          >
            Cambiar Contraseña
          </button>
        </div>

        {/* ── Body ── */}
        <div className="overflow-y-auto flex-1">
          {tab === "datos" && (
            <form onSubmit={handleSubmitDatos} className="p-5 space-y-4" noValidate>
              {/* Nombre */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="nombre"
                      value={form.nombre}
                      onChange={handleChange}
                      placeholder="Ej: Juan"
                      className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm font-medium bg-gray-50 dark:bg-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-[#f05454]/40 transition ${errors.nombre ? "border-red-400 dark:border-red-500" : "border-gray-200 dark:border-gray-700"}`}
                    />
                  </div>
                  <FieldError msg={errors.nombre} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">
                    Apellidos <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="apellidos"
                    value={form.apellidos}
                    onChange={handleChange}
                    placeholder="Ej: García López"
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm font-medium bg-gray-50 dark:bg-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-[#f05454]/40 transition ${errors.apellidos ? "border-red-400 dark:border-red-500" : "border-gray-200 dark:border-gray-700"}`}
                  />
                  <FieldError msg={errors.apellidos} />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">
                  Correo Electrónico <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="correo@ejemplo.com"
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm font-medium bg-gray-50 dark:bg-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-[#f05454]/40 transition ${errors.email ? "border-red-400 dark:border-red-500" : "border-gray-200 dark:border-gray-700"}`}
                  />
                </div>
                <FieldError msg={errors.email} />
              </div>

              {/* Documento */}
              <div className="grid grid-cols-5 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">Tipo Doc.</label>
                  <select
                    name="tipoDocumento"
                    value={form.tipoDocumento}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium bg-gray-50 dark:bg-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-[#f05454]/40 transition cursor-pointer"
                  >
                    {TIPOS_DOCUMENTO.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-3">
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">
                    N.º Documento
                    <span className="ml-1 text-gray-400 font-normal">({docConfig.helper})</span>
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="numeroDocumento"
                      value={form.numeroDocumento}
                      onChange={handleChange}
                      inputMode={docConfig.numericOnly ? "numeric" : "text"}
                      placeholder={docConfig.helper}
                      className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm font-medium bg-gray-50 dark:bg-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-[#f05454]/40 transition ${errors.numeroDocumento ? "border-red-400 dark:border-red-500" : "border-gray-200 dark:border-gray-700"}`}
                    />
                  </div>
                  <FieldError msg={errors.numeroDocumento} />
                </div>
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">Teléfono</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    inputMode="numeric"
                    placeholder="3001234567"
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm font-medium bg-gray-50 dark:bg-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-[#f05454]/40 transition ${errors.telefono ? "border-red-400 dark:border-red-500" : "border-gray-200 dark:border-gray-700"}`}
                  />
                </div>
                <FieldError msg={errors.telefono} />
              </div>

              {/* Dirección */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">Dirección</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <textarea
                    name="direccion"
                    value={form.direccion}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Ej: Calle 50 #30-20, Medellín"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium bg-gray-50 dark:bg-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-[#f05454]/40 transition resize-none"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-gradient-to-r from-[#f05454] to-[#c43d3d] hover:from-[#e04444] hover:to-[#b52d2d] text-white font-bold rounded-2xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {saving ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                    </svg>
                    Guardando...
                  </>
                ) : (
                  <><Save className="w-4 h-4" /> Guardar Cambios</>
                )}
              </button>
            </form>
          )}

          {tab === "seguridad" && (
            <form onSubmit={handleSubmitPass} className="p-5 space-y-4" noValidate>
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-3 text-xs text-amber-800 dark:text-amber-300 font-medium">
                La contraseña debe tener mínimo 6 caracteres.
              </div>

              {/* Contraseña actual */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">Contraseña Actual</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPass ? "text" : "password"}
                    name="passwordActual"
                    value={passForm.passwordActual}
                    onChange={handlePassChange}
                    placeholder="Tu contraseña actual"
                    className={`w-full pl-9 pr-10 py-2.5 rounded-xl border text-sm font-medium bg-gray-50 dark:bg-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-[#f05454]/40 transition ${errors.passwordActual ? "border-red-400" : "border-gray-200 dark:border-gray-700"}`}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <FieldError msg={errors.passwordActual} />
              </div>

              {/* Nueva contraseña */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">Nueva Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showNewPass ? "text" : "password"}
                    name="passwordNueva"
                    value={passForm.passwordNueva}
                    onChange={handlePassChange}
                    placeholder="Mínimo 6 caracteres"
                    className={`w-full pl-9 pr-10 py-2.5 rounded-xl border text-sm font-medium bg-gray-50 dark:bg-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-[#f05454]/40 transition ${errors.passwordNueva ? "border-red-400" : "border-gray-200 dark:border-gray-700"}`}
                  />
                  <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <FieldError msg={errors.passwordNueva} />
              </div>

              {/* Confirmar contraseña */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">Confirmar Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    name="passwordConfirm"
                    value={passForm.passwordConfirm}
                    onChange={handlePassChange}
                    placeholder="Repite la nueva contraseña"
                    className={`w-full pl-9 pr-10 py-2.5 rounded-xl border text-sm font-medium bg-gray-50 dark:bg-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-[#f05454]/40 transition ${errors.passwordConfirm ? "border-red-400" : "border-gray-200 dark:border-gray-700"}`}
                  />
                  <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.passwordConfirm ? <FieldError msg={errors.passwordConfirm} /> : passForm.passwordNueva && passForm.passwordNueva === passForm.passwordConfirm && (
                  <p className="mt-1 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Las contraseñas coinciden
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-gradient-to-r from-[#f05454] to-[#c43d3d] hover:from-[#e04444] hover:to-[#b52d2d] text-white font-bold rounded-2xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {saving ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                    </svg>
                    Guardando...
                  </>
                ) : (
                  <><Lock className="w-4 h-4" /> Cambiar Contraseña</>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default MiPerfilModal;
