import { useState } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/features/autenticacion/hooks/useAuth";
import { useToast } from "@/shared/context/ToastContext";
import { AlertCircle } from "lucide-react";

export function GoogleAuthButton({ onSuccess, text = "signin_with", width = "100%" }) {
  const { loginWithGoogle } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      toast.error("No se recibió credencial de Google");
      return;
    }

    setLoading(true);
    try {
      const res = await loginWithGoogle(credentialResponse.credential);
      if (res.success) {
        toast.success(`¡Bienvenido, ${res.user?.nombre || "Usuario"}!`);
        if (onSuccess) {
          onSuccess(res.user);
        }
      } else {
        toast.error(res.message || "Error al autenticar con Google");
      }
    } catch (err) {
      toast.error(err.message || "Error al conectar con Google");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error("No se pudo completar el inicio de sesión con Google");
  };

  const handleMissingClientIdClick = () => {
    toast.error(
      "Configuración pendiente: Agrega VITE_GOOGLE_CLIENT_ID en frontend/.env y GOOGLE_CLIENT_ID en backend/.env",
      { duration: 6000 }
    );
  };

  // If Client ID is not provided, show styled fallback button with Google Logo
  if (!clientId || clientId.trim() === "") {
    return (
      <div className="w-full flex flex-col items-center">
        <button
          type="button"
          onClick={handleMissingClientIdClick}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-medium text-sm rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
        >
          <svg className="w-5 h-5 transition-transform group-hover:scale-105" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continuar con Google</span>
        </button>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="w-full flex justify-center items-center overflow-hidden">
        {loading ? (
          <div className="w-full py-2.5 px-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center gap-2 text-slate-500 text-sm font-medium">
            <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
            <span>Conectando con Google...</span>
          </div>
        ) : (
          <div className="w-full flex justify-center [&>div]:w-full [&>div>iframe]:w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              size="large"
              text={text}
              shape="pill"
              locale="es"
              width={width}
            />
          </div>
        )}
      </div>
    </GoogleOAuthProvider>
  );
}
