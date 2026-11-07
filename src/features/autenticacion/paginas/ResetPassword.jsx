import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/shared/context/ToastContext";
import { validateContrasena, validateConfirmarContrasena } from "@/shared/utils/validationUtils";

export function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();

  const [nuevaContraseña, setNuevaContraseña] = useState("");
  const [confirmarContraseña, setConfirmarContraseña] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [touched, setTouched] = useState({ nueva: false, confirmar: false });
  const [submitted, setSubmitted] = useState(false);

  const token = searchParams.get("token");
  let emailParam = searchParams.get("email");

  // Fallback: Si no viene email en query params, extraerlo del payload JWT del token
  if (!emailParam && token) {
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
        if (payload?.email) {
          emailParam = payload.email;
        }
      }
    } catch {
      // Ignorar fallback si falla el atob
    }
  }

  const email = emailParam ? decodeURIComponent(emailParam) : "";

  useEffect(() => {
    if (!token) {
      toast.error("Enlace inválido", "El enlace de recuperación no es válido");
      setTimeout(() => navigate("/login"), 2000);
    }
  }, [token, navigate, toast]);

  const valNueva = validateContrasena(nuevaContraseña, 6);
  const valConfirmar = validateConfirmarContrasena(nuevaContraseña, confirmarContraseña);

  const errorNueva = (touched.nueva || submitted) && !valNueva.isValid ? valNueva.error : "";
  const errorConfirmar = (touched.confirmar || submitted) && !valConfirmar.isValid ? valConfirmar.error : "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTouched({ nueva: true, confirmar: true });

    const checkPass = validateContrasena(nuevaContraseña, 6);
    const checkConf = validateConfirmarContrasena(nuevaContraseña, confirmarContraseña);

    if (!checkPass.isValid) {
      toast.error("Campos requeridos", checkPass.error);
      return;
    }
    if (!checkConf.isValid) {
      toast.error("Campos requeridos", checkConf.error);
      return;
    }

    setIsLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const response = await fetch(`${API_URL}/usuarios/restablecer-contrasena`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          email: email || undefined,
          contrasena: nuevaContraseña
        })
      });

      const data = await response.json();

      if (response.ok) {
        setResetSuccess(true);
        toast.success("¡Contraseña actualizada!", "Tu contraseña ha sido restablecida correctamente");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        toast.error("Error", data.message || "No se pudo restablecer la contraseña");
      }
    } catch (err) {
      console.error("Error en reset-password:", err);
      toast.error("Error de conexión", "No se pudo conectar con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex items-center justify-center p-4">
      {/* Decorative circles background */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-900/20 to-blue-800/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      {/* Dot pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)",
        backgroundSize: "30px 30px"
      }} />

      {/* SVG Wave decoration */}
      <svg className="absolute bottom-0 left-0 w-full h-32 opacity-10" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <path fill="#F05454" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,165.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
      </svg>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-gray-100">
          {!resetSuccess ? (
            <>
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                  <Lock className="w-10 h-10 text-white" />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold text-center text-gray-800 mb-3">
                Restablecer Contraseña
              </h1>
              {email ? (
                <>
                  <p className="text-center text-gray-600 mb-2">
                    Restableciendo contraseña para:
                  </p>
                  <p className="text-center font-semibold text-red-600 mb-6">
                    {email}
                  </p>
                </>
              ) : (
                <p className="text-center text-gray-600 mb-6">
                  Ingresa tu nueva contraseña para continuar
                </p>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Nueva contraseña */}
                <div>
                  <label htmlFor="nueva" className="block text-sm font-semibold text-gray-700 mb-2">
                    Nueva Contraseña <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="nueva"
                      type={showPasswords ? "text" : "password"}
                      value={nuevaContraseña}
                      onChange={(e) => {
                        setNuevaContraseña(e.target.value);
                        setTouched(prev => ({ ...prev, nueva: true }));
                      }}
                      onBlur={() => setTouched(prev => ({ ...prev, nueva: true }))}
                      placeholder="Ingresa tu nueva contraseña"
                      className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl focus:outline-none transition-all text-gray-800 font-medium ${
                        errorNueva
                          ? "border-red-500 bg-red-50/50 text-red-900 focus:ring-2 focus:ring-red-400 focus:border-red-500"
                          : touched.nueva && nuevaContraseña.length >= 6
                          ? "border-emerald-500/80 bg-white focus:border-emerald-500"
                          : "border-gray-200 bg-gray-50 focus:border-red-500 focus:bg-white"
                      }`}
                      disabled={isLoading}
                    />
                  </div>
                  {errorNueva && (
                    <p className="mt-1.5 text-xs font-semibold text-red-600 flex items-center gap-1 animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
                      <span>{errorNueva}</span>
                    </p>
                  )}
                </div>

                {/* Confirmar contraseña */}
                <div>
                  <label htmlFor="confirmar" className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirmar Contraseña <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="confirmar"
                      type={showPasswords ? "text" : "password"}
                      value={confirmarContraseña}
                      onChange={(e) => {
                        setConfirmarContraseña(e.target.value);
                        setTouched(prev => ({ ...prev, confirmar: true }));
                      }}
                      onBlur={() => setTouched(prev => ({ ...prev, confirmar: true }))}
                      placeholder="Confirma tu nueva contraseña"
                      className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl focus:outline-none transition-all text-gray-800 font-medium ${
                        errorConfirmar
                          ? "border-red-500 bg-red-50/50 text-red-900 focus:ring-2 focus:ring-red-400 focus:border-red-500"
                          : touched.confirmar && confirmarContraseña && confirmarContraseña === nuevaContraseña
                          ? "border-emerald-500/80 bg-white focus:border-emerald-500"
                          : "border-gray-200 bg-gray-50 focus:border-red-500 focus:bg-white"
                      }`}
                      disabled={isLoading}
                    />
                  </div>
                  {errorConfirmar && (
                    <p className="mt-1.5 text-xs font-semibold text-red-600 flex items-center gap-1 animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
                      <span>{errorConfirmar}</span>
                    </p>
                  )}
                </div>

                {/* Botón único para mostrar/ocultar ambas contraseñas */}
                <div className="flex items-center gap-2 -mt-2">
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 hover:text-red-500 transition-colors select-none cursor-pointer"
                  >
                    {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showPasswords ? "Ocultar contraseñas" : "Mostrar contraseñas"}
                  </button>
                </div>

                {/* Password requirements */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800 font-medium">
                    La contraseña debe tener al menos 6 caracteres
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Actualizando...</span>
                    </>
                  ) : (
                    <span>Restablecer Contraseña</span>
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              {/* Success state */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
              </div>

              <h1 className="text-3xl font-bold text-center text-gray-800 mb-3">
                ¡Contraseña Restablecida!
              </h1>
              <p className="text-center text-gray-600 mb-6">
                Tu contraseña ha sido actualizada correctamente. Ya puedes iniciar sesión con tu nueva contraseña.
              </p>
              <p className="text-center text-sm text-gray-500">
                Redirigiendo al inicio de sesión...
              </p>

              {/* Loading spinner */}
              <div className="flex justify-center mt-6">
                <div className="w-8 h-8 border-3 border-red-200 border-t-red-600 rounded-full animate-spin" />
              </div>
            </>
          )}
        </div>

        {/* Help text */}
        {!resetSuccess && (
          <p className="text-center text-sm text-gray-600 mt-6">
            ¿Recordaste tu contraseña?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-red-600 font-semibold hover:underline"
            >
              Volver al inicio de sesión
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
