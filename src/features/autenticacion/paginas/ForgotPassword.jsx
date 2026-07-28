import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Send } from "lucide-react";
import { useToast } from "@/shared/context/ToastContext";

export function ForgotPassword() {
  const navigate = useNavigate();
  const toast = useToast();
  const [correo, setCorreo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!correo) {
      toast.error("Campo requerido", "Por favor ingresa tu correo electrónico");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      toast.error("Correo inválido", "Por favor ingresa un correo electrónico válido");
      return;
    }
    setIsLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const response = await fetch(`${API_URL}/usuarios/recuperar-contrasena`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: correo })
      });

      const data = await response.json();

      if (response.ok) {
        setEmailSent(true);
        toast.success("¡Correo enviado!", "Revisa tu bandeja de entrada para restablecer tu contraseña");
      } else {
        toast.error("Error", data.message || "No se pudo enviar el correo de recuperación");
      }
    } catch (err) {
      console.error("Error en forgot-password:", err);
      toast.error("Error de conexión", "No se pudo conectar con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

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
        {/* Back button */}
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Volver al inicio de sesión</span>
        </button>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-gray-100">
          {!emailSent ? (
            <>
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                  <Mail className="w-10 h-10 text-white" />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold text-center text-gray-800 mb-3">
                ¿Olvidaste tu contraseña?
              </h1>
              <p className="text-center text-gray-600 mb-8">
                Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña.
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="correo" className="block text-sm font-semibold text-gray-700 mb-2">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="correo"
                      type="email"
                      value={correo}
                      onChange={(e) => setCorreo(e.target.value)}
                      placeholder="tu@correo.com"
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:bg-white transition-all text-gray-800 font-medium"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      <span>Enviar instrucciones</span>
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              {/* Success state */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <Mail className="w-10 h-10 text-white" />
                </div>
              </div>

              <h1 className="text-3xl font-bold text-center text-gray-800 mb-3">
                ¡Correo enviado!
              </h1>
              <p className="text-center text-gray-600 mb-4">
                Hemos enviado las instrucciones para restablecer tu contraseña a:
              </p>
              <p className="text-center font-bold text-red-600 mb-6">
                {correo}
              </p>
              <p className="text-center text-sm text-gray-500">
                Revisa tu bandeja de entrada (incluyendo las pestañas <strong>Spam / Correo no deseado</strong>, <strong>Promociones</strong> y <strong>Notificaciones</strong>) y haz clic en el enlace para restablecer tu contraseña.
              </p>
            </>
          )}
        </div>

        {/* Help text */}
        <p className="text-center text-sm text-gray-600 mt-6">
          ¿No recibiste el correo?{" "}
          <button
            onClick={() => {
              setEmailSent(false);
              setCorreo("");
            }}
            className="text-red-600 font-semibold hover:underline"
          >
            Intentar nuevamente
          </button>
        </p>
      </div>
    </div>
  );
}
