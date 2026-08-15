import { useState } from "react";
import { X, Lock } from "lucide-react";

const inputCls = "w-full px-4 py-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm placeholder:text-gray-400";
const labelCls = "block text-xs font-bold text-gray-800 dark:text-gray-200 mb-1.5";

export function UsuarioPasswordModal({ isOpen, onClose, onSave, usuario }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notificarEmail, setNotificarEmail] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen || !usuario) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (password !== confirmPassword) {
      setErrorMsg("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 8) {
      setErrorMsg("La contraseña debe tener al menos 8 caracteres.");
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

        <form onSubmit={handleSubmit} className="p-6 pt-3 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-semibold border border-rose-200">
              {errorMsg}
            </div>
          )}

          <div>
            <label className={labelCls}>Nueva Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className={labelCls}>Confirmar Nueva Contraseña</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputCls}
              placeholder="••••••••"
            />
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
