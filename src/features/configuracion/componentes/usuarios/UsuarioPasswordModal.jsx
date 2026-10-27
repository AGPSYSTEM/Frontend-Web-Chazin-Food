import { useState, useEffect } from "react";
import { X, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { validateContrasena, validateConfirmarContrasena, getPasswordCriteria } from "@/shared/utils/validationUtils";

const baseInputCls = "w-full px-4 py-3 border rounded-xl transition-all duration-150 text-sm placeholder:text-gray-400 outline-none";
const labelCls = "block text-xs font-bold text-gray-800 dark:text-gray-200 mb-1.5";

export function UsuarioPasswordModal({ isOpen, onClose, onSave, usuario }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPasswords, setShowPasswords] = useState(false);
  const [notificarEmail, setNotificarEmail] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setPassword("");
    setConfirmPassword("");
    setErrors({});
    setTouched({});
    setErrorMsg("");
  }, [isOpen, usuario]);

  if (!isOpen || !usuario) return null;

  const handlePasswordChange = (val) => {
    setPassword(val);
    setTouched((prev) => ({ ...prev, password: true }));
    const passErr = validateContrasena(val, 8, "contraseña");
    setErrors((prev) => {
      const next = { ...prev, password: passErr.isValid ? "" : passErr.error };
      if (touched.confirmPassword || confirmPassword) {
        const confErr = validateConfirmarContrasena(val, confirmPassword);
        next.confirmPassword = confErr.isValid ? "" : confErr.error;
      }
      return next;
    });
  };

  const handleConfirmChange = (val) => {
    setConfirmPassword(val);
    setTouched((prev) => ({ ...prev, confirmPassword: true }));
    const confErr = validateConfirmarContrasena(password, val);
    setErrors((prev) => ({
      ...prev,
      confirmPassword: confErr.isValid ? "" : confErr.error
    }));
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === "password") {
      const res = validateContrasena(password, 8, "contraseña");
      setErrors((prev) => ({ ...prev, password: res.isValid ? "" : res.error }));
    } else if (field === "confirmPassword") {
      const res = validateConfirmarContrasena(password, confirmPassword);
      setErrors((prev) => ({ ...prev, confirmPassword: res.isValid ? "" : res.error }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");

    const passRes = validateContrasena(password, 8, "contraseña");
    const confRes = validateConfirmarContrasena(password, confirmPassword);

    const newErrors = {};
    if (!passRes.isValid) newErrors.password = passRes.error;
    if (!confRes.isValid) newErrors.confirmPassword = confRes.error;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched({ password: true, confirmPassword: true });
      setErrorMsg(newErrors.password || newErrors.confirmPassword);
      return;
    }

    onSave({
      password,
      notificarEmail
    });
    setPassword("");
    setConfirmPassword("");
    onClose();
  };

  const getInputCls = (field) => {
    const val = field === "password" ? password : confirmPassword;
    const hasValue = val && val.length > 0;
    if ((touched[field] || hasValue) && errors[field]) {
      return `${baseInputCls} border-red-500 bg-red-50/30 text-red-900 focus:ring-2 focus:ring-red-400 focus:border-red-500 dark:border-red-600 dark:bg-red-950/20 dark:text-red-300`;
    }
    if ((touched[field] || hasValue) && !errors[field] && hasValue) {
      return `${baseInputCls} border-emerald-400/80 bg-emerald-50/15 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-400/40 dark:border-emerald-600 dark:bg-emerald-950/10`;
    }
    return `${baseInputCls} border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent`;
  };

  const userName = `${usuario.nombre || ''} ${usuario.apellidos || ''}`.trim() || "Usuario";
  const userEmail = usuario.email || usuario.correo || "usuario@chazinfood.com";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header with Purple Lock Icon */}
        <div className="flex items-start justify-between p-6 pb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-[#8B5CF6] dark:text-purple-400 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-gray-100">
                Cambiar Contraseña
              </h2>
              <p className="text-xs text-gray-400 font-medium">
                {userName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 pt-3 space-y-4" noValidate autoComplete="off">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-semibold border border-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Nueva Contraseña *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPasswords ? "text" : "password"}
                  autoComplete="new-password"
                  name="modal_new_password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  onBlur={() => handleBlur("password")}
                  className={`${getInputCls("password")} pl-10`}
                  placeholder="••••••••"
                />
              </div>
              {(touched.password || password) && errors.password && (
                <p className="text-[11px] text-red-500 font-medium mt-1 flex items-center gap-1 animate-in fade-in duration-150">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.password}</span>
                </p>
              )}

              {/* Checklist en vivo de requisitos */}
              {(touched.password || password) && (
                <div className="mt-2 space-y-1 bg-purple-50/50 dark:bg-purple-950/20 p-2.5 rounded-xl border border-purple-100 dark:border-purple-900/50 text-[10.5px]">
                  <p className="font-bold text-gray-700 dark:text-gray-300 mb-1">Requisitos de contraseña:</p>
                  {(() => {
                    const crit = getPasswordCriteria(password, 8);
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
              <label className={labelCls}>Confirmar Nueva Contraseña *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPasswords ? "text" : "password"}
                  autoComplete="new-password"
                  name="modal_confirm_password"
                  value={confirmPassword}
                  onChange={(e) => handleConfirmChange(e.target.value)}
                  onBlur={() => handleBlur("confirmPassword")}
                  className={`${getInputCls("confirmPassword")} pl-10`}
                  placeholder="Repite tu contraseña"
                />
              </div>
              {(touched.confirmPassword || confirmPassword) && (
                confirmPassword ? (
                  password === confirmPassword ? (
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
                ) : errors.confirmPassword ? (
                  <p className="text-[11px] text-red-500 font-medium mt-1 flex items-center gap-1 animate-in fade-in duration-150">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.confirmPassword}</span>
                  </p>
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

          {/* Explicatory text */}
          <p className="text-xs text-gray-400 leading-relaxed font-normal">
            La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números
          </p>

          {/* Blue Notification Box (Matching Captura 1) */}
          <div className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100/80 dark:border-blue-900/50 rounded-2xl p-4 space-y-1.5">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-blue-900 dark:text-blue-200">
              <input
                type="checkbox"
                checked={notificarEmail}
                onChange={(e) => setNotificarEmail(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-blue-300 cursor-pointer"
              />
              <span>Notificar al usuario por correo electrónico</span>
            </label>
            <p className="text-[11px] text-blue-600 dark:text-blue-400 pl-6 leading-relaxed">
              Se enviará un correo automático a <span className="font-semibold">{userEmail}</span> para notificarle que su contraseña ha sido modificada por seguridad.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-2xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-2xl transition-colors shadow-xs cursor-pointer"
            >
              Actualizar Contraseña
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
