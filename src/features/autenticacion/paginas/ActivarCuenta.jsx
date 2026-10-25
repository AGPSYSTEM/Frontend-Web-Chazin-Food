import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ShieldCheck } from "lucide-react";
import { useToast } from "@/shared/context/ToastContext";
import { validateContrasena, validateConfirmarContrasena } from "@/shared/utils/validationUtils";
import apiClient from "@/shared/api/apiClient";

export default function ActivarCuenta() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();

  const [nuevaContraseña, setNuevaContraseña] = useState("");
  const [confirmarContraseña, setConfirmarContraseña] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [activationSuccess, setActivationSuccess] = useState(false);
  const [userData, setUserData] = useState(null);
  const [tokenError, setTokenError] = useState("");
  const [touched, setTouched] = useState({ nueva: false, confirmar: false });
  const [submitted, setSubmitted] = useState(false);

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setTokenError("El enlace de activación no es válido o no incluye el token requerido.");
      setIsVerifying(false);
      return;
    }

    const checkToken = async () => {
      try {
        const response = await apiClient.get(`/auth/verificar-activacion?token=${encodeURIComponent(token)}`);
        setUserData(response.data?.user || response.data || null);
      } catch (err) {
        setTokenError(err?.data?.message || err?.message || "El enlace de activación ha expirado o ya fue utilizado.");
      } finally {
        setIsVerifying(false);
      }
    };

    checkToken();
  }, [token]);

  const valNueva = validateContrasena(nuevaContraseña, 6);
  const valConfirmar = validateConfirmarContrasena(nuevaContraseña, confirmarContraseña);

  const errorNueva = (touched.nueva || submitted) && !valNueva.isValid ? valNueva.error : "";
  const errorConfirmar = (touched.confirmar || submitted) && !valConfirmar.isValid ? valConfirmar.error : "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTouched({ nueva: true, confirmar: true });

    if (!valNueva.isValid) {
      toast.error("Validación", valNueva.error);
      return;
    }
    if (!valConfirmar.isValid) {
      toast.error("Validación", valConfirmar.error);
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post("/auth/activar-cuenta", {
        token,
        password: nuevaContraseña
      });

      setActivationSuccess(true);
      toast.success("¡Cuenta activada!", "Tu cuenta ha sido activada con éxito. Ya puedes iniciar sesión.");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      const msg = err?.data?.message || err?.message || "No se pudo activar la cuenta. Intenta de nuevo.";
      toast.error("Error al activar", msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-neutral-900 flex flex-col justify-center items-center px-4">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-neutral-300 font-medium">Verificando enlace de activación...</p>
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="min-h-screen bg-neutral-900 flex flex-col justify-center items-center px-4">
        <div className="max-w-md w-full bg-neutral-800/80 border border-neutral-700/60 rounded-2xl p-8 text-center shadow-xl">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Enlace inválido o expirado</h2>
          <p className="text-neutral-400 text-sm mb-6">{tokenError}</p>
          <Link
            to="/login"
            className="inline-block w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-semibold rounded-xl transition duration-200"
          >
            Ir al inicio de sesión
          </Link>
        </div>
      </div>
    );
  }

  if (activationSuccess) {
    return (
      <div className="min-h-screen bg-neutral-900 flex flex-col justify-center items-center px-4">
        <div className="max-w-md w-full bg-neutral-800/80 border border-neutral-700/60 rounded-2xl p-8 text-center shadow-xl">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">¡Cuenta Activada!</h2>
          <p className="text-neutral-300 text-sm mb-6">
            Tu contraseña ha sido establecida exitosamente. Redirigiéndote al inicio de sesión...
          </p>
          <Link
            to="/login"
            className="inline-block w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-semibold rounded-xl transition duration-200"
          >
            Iniciar sesión ahora
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col justify-center items-center px-4 py-8">
      <div className="mb-6">
        <Link to="/" className="inline-block transition-transform hover:scale-105">
          <img src="/logo-chazin.png" alt="Chazin Food" className="h-16 w-auto object-contain mx-auto" onError={(e) => { e.target.style.display = 'none'; }} />
        </Link>
      </div>

      <div className="max-w-md w-full bg-neutral-800/80 border border-neutral-700/60 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white">Activar tu cuenta</h1>
          {userData?.nombre && (
            <p className="text-amber-400 font-medium text-sm mt-1">
              Hola, {userData.nombre} {userData.apellidos || ''}
            </p>
          )}
          <p className="text-neutral-400 text-xs mt-1">
            Crea una contraseña segura para activar y acceder a tu cuenta en Chazin Food.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Nueva Contraseña
            </label>
            <div className="relative">
              <input
                type={showPasswords ? "text" : "password"}
                value={nuevaContraseña}
                onChange={(e) => {
                  setNuevaContraseña(e.target.value);
                  if (!touched.nueva) setTouched((t) => ({ ...t, nueva: true }));
                }}
                placeholder="Mínimo 6 caracteres"
                className={`w-full px-4 py-2.5 bg-neutral-900/80 border rounded-xl text-white text-sm focus:outline-none transition ${
                  errorNueva
                    ? "border-red-500 focus:border-red-500"
                    : "border-neutral-700 focus:border-amber-500"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
              >
                {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errorNueva && (
              <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {errorNueva}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Confirmar Contraseña
            </label>
            <div className="relative">
              <input
                type={showPasswords ? "text" : "password"}
                value={confirmarContraseña}
                onChange={(e) => {
                  setConfirmarContraseña(e.target.value);
                  if (!touched.confirmar) setTouched((t) => ({ ...t, confirmar: true }));
                }}
                placeholder="Repite la contraseña"
                className={`w-full px-4 py-2.5 bg-neutral-900/80 border rounded-xl text-white text-sm focus:outline-none transition ${
                  errorConfirmar
                    ? "border-red-500 focus:border-red-500"
                    : "border-neutral-700 focus:border-amber-500"
                }`}
              />
            </div>
            {errorConfirmar && (
              <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {errorConfirmar}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-neutral-950 font-bold rounded-xl transition duration-200 shadow-lg shadow-amber-500/20 text-sm mt-4 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                <span>Activando cuenta...</span>
              </>
            ) : (
              <span>Activar mi cuenta</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-xs text-amber-400 hover:underline">
            ¿Ya activaste tu cuenta? Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
