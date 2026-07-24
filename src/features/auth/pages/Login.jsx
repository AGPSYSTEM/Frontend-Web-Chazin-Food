import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/shared/context/AuthContext";
import { Lock, Mail, Eye, EyeOff, ChefHat, Sparkles, User, UserPlus, LogIn, Phone, MapPin, CreditCard } from "lucide-react";
import { useToast } from "@/shared/context/ToastContext";
import logoImg from "@/shared/assets/ChatGPT_Image_1_jun_2026__21_55_04.png";

export function Login() {
  const [tab, setTab] = useState("login");
  const [loginCorreo, setLoginCorreo] = useState("");
  const [loginContraseña, setLoginContraseña] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  const [regNombre, setRegNombre] = useState("");
  const [regApellidos, setRegApellidos] = useState("");
  const [regTipoDocumento, setRegTipoDocumento] = useState("C.C.");
  const [regDocumento, setRegDocumento] = useState("");
  const [regCorreo, setRegCorreo] = useState("");
  const [regTelefono, setRegTelefono] = useState("");
  const [regDireccion, setRegDireccion] = useState("");
  const [regContraseña, setRegContraseña] = useState("");
  const [regConfirmar, setRegConfirmar] = useState("");

  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);
  const [isRegLoading, setIsRegLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const wasDark = document.documentElement.classList.contains("dark");
    if (wasDark) document.documentElement.classList.remove("dark");
    return () => {
      if (localStorage.getItem("darkMode") === "true") {
        document.documentElement.classList.add("dark");
      }
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginCorreo || !loginContraseña) {
      toast.error("Campos requeridos", "Por favor ingresa tu correo y contraseña");
      return;
    }
    setIsLoginLoading(true);
    const success = await login(loginCorreo, loginContraseña);
    if (success) {
      toast.success("¡Bienvenido!", "Inicio de sesión exitoso");
      setTimeout(() => navigate("/"), 500);
    } else {
      toast.error("Error de autenticación", "Correo o contraseña incorrectos");
    }
    setIsLoginLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regNombre.trim() || !regApellidos.trim() || !regDocumento.trim() || !regCorreo.trim() || !regContraseña.trim() || !regConfirmar.trim() || !regDireccion.trim()) {
      toast.error("Campos requeridos", "Por favor completa todos los campos obligatorios");
      return;
    }
    if (regContraseña.length < 6) {
      toast.error("Contraseña débil", "La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (regContraseña !== regConfirmar) {
      toast.error("Contraseñas no coinciden", "Verifica que ambas contraseñas sean iguales");
      return;
    }
    setIsRegLoading(true);

    const result = await register({
      idUsuario: regDocumento,
      nombre: regNombre,
      apellidos: regApellidos,
      tipoDocumento: regTipoDocumento,
      telefono: regTelefono || null,
      direccion: regDireccion,
      email: regCorreo,
      contrasena: regContraseña
    });

    if (result.success) {
      toast.success("¡Cuenta creada!", result.message);
      setTimeout(() => navigate("/"), 500);
    } else {
      toast.error("Error al registrar", result.message);
    }
    setIsRegLoading(false);
  };

  const inputBase = "relative w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all bg-white/50 backdrop-blur-sm outline-none text-sm";
  const inputWithRight = "relative w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all bg-white/50 backdrop-blur-sm outline-none text-sm";
  const selectBase = "relative w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all bg-white/50 backdrop-blur-sm outline-none text-sm appearance-none cursor-pointer";

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex items-center justify-center p-4">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-red-400/30 to-rose-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-[#30475E]/30 to-blue-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md z-10 my-6">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center relative mb-4">
            <div className="relative bg-white rounded-full p-5 shadow-2xl border-4 border-red-500/20">
              <img src={logoImg} alt="Chazin Food" className="w-20 h-20 object-contain" />
            </div>
            <div className="absolute -top-1 -right-1 bg-gradient-to-br from-red-500 to-rose-600 p-1.5 rounded-full shadow-lg">
              <ChefHat className="w-4 h-4 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-1 bg-gradient-to-r from-red-600 via-rose-500 to-red-600 bg-clip-text text-transparent">
            Chazin Food
          </h1>
          <p className="text-gray-600 font-medium flex items-center justify-center gap-2 text-sm font-semibold">
            <Sparkles className="w-4 h-4 text-red-500" />
            Sistema de Gestión
            <Sparkles className="w-4 h-4 text-red-500" />
          </p>
        </div>

        {/* Card principal */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-red-500 via-rose-500 to-red-500" />

          {/* Tabs */}
          <div className="flex border-b border-gray-200/70">
            <button
              onClick={() => setTab("login")}
              className={`flex-1 flex items-center justify-center gap-2 py-4 font-semibold text-sm transition-all duration-300 ${tab === "login" ? "text-red-600 border-b-2 border-red-500 bg-red-50/50" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
            >
              <LogIn className="w-4 h-4" />
              Iniciar Sesión
            </button>
            <button
              onClick={() => setTab("register")}
              className={`flex-1 flex items-center justify-center gap-2 py-4 font-semibold text-sm transition-all duration-300 ${tab === "register" ? "text-red-600 border-b-2 border-red-500 bg-red-50/50" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
            >
              <UserPlus className="w-4 h-4" />
              Registrarse
            </button>
          </div>

          <div className="p-8">
            {/* LOGIN */}
            {tab === "login" && (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Correo Electrónico
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 w-5 h-5 transition-colors z-10" />
                    <input
                      type="email"
                      value={loginCorreo}
                      onChange={(e) => setLoginCorreo(e.target.value)}
                      className={inputBase}
                      placeholder="usuario@chazinfood.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contraseña
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 w-5 h-5 transition-colors z-10" />
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      value={loginContraseña}
                      onChange={(e) => setLoginContraseña(e.target.value)}
                      className={inputWithRight}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors z-10"
                    >
                      {showLoginPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoginLoading}
                  className="relative w-full bg-gradient-to-r from-red-500 via-rose-500 to-red-500 text-white font-bold py-4 px-4 rounded-xl transition-all duration-500 shadow-lg hover:shadow-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group text-sm"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoginLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Ingresando...
                      </>
                    ) : (
                      <>
                        <LogIn className="w-5 h-5" />
                        Iniciar Sesión
                      </>
                    )}
                  </span>
                </button>
              </form>
            )}

            {/* REGISTRO */}
            {tab === "register" && (
              <form onSubmit={handleRegister} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                <p className="text-xs text-gray-500 text-center -mt-1 mb-2">
                  Los campos marcados con <span className="text-red-500">*</span> son obligatorios.
                </p>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombres <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 w-5 h-5 transition-colors z-10" />
                    <input
                      type="text"
                      value={regNombre}
                      onChange={(e) => setRegNombre(e.target.value)}
                      className={inputBase}
                      placeholder="Juan"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Apellidos <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 w-5 h-5 transition-colors z-10" />
                    <input
                      type="text"
                      value={regApellidos}
                      onChange={(e) => setRegApellidos(e.target.value)}
                      className={inputBase}
                      placeholder="Pérez"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tipo de Documento <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 w-5 h-5 transition-colors z-10" />
                    <select
                      value={regTipoDocumento}
                      onChange={(e) => setRegTipoDocumento(e.target.value)}
                      className={selectBase}
                    >
                      <option value="C.C.">C.C. (Cédula de Ciudadanía)</option>
                      <option value="T.I.">T.I. (Tarjeta de Identidad)</option>
                      <option value="C.E.">C.E. (Cédula de Extranjería)</option>
                      <option value="P.P.">Pasaporte</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Número de Documento (ID) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 w-5 h-5 transition-colors z-10" />
                    <input
                      type="text"
                      value={regDocumento}
                      onChange={(e) => setRegDocumento(e.target.value)}
                      className={inputBase}
                      placeholder="Ej: 1094000123"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 w-5 h-5 transition-colors z-10" />
                    <input
                      type="tel"
                      value={regTelefono}
                      onChange={(e) => setRegTelefono(e.target.value)}
                      className={inputBase}
                      placeholder="3190000000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Dirección de Entrega <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 w-5 h-5 transition-colors z-10" />
                    <input
                      type="text"
                      value={regDireccion}
                      onChange={(e) => setRegDireccion(e.target.value)}
                      className={inputBase}
                      placeholder="Calle 12 # 34-56"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Correo Electrónico <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 w-5 h-5 transition-colors z-10" />
                    <input
                      type="email"
                      value={regCorreo}
                      onChange={(e) => setRegCorreo(e.target.value)}
                      className={inputBase}
                      placeholder="tu@correo.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contraseña <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 w-5 h-5 transition-colors z-10" />
                    <input
                      type={showRegPassword ? "text" : "password"}
                      value={regContraseña}
                      onChange={(e) => setRegContraseña(e.target.value)}
                      className={inputWithRight}
                      placeholder="Mínimo 6 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors z-10"
                    >
                      {showRegPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirmar Contraseña <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 w-5 h-5 transition-colors z-10" />
                    <input
                      type={showRegConfirm ? "text" : "password"}
                      value={regConfirmar}
                      onChange={(e) => setRegConfirmar(e.target.value)}
                      className={inputWithRight}
                      placeholder="Repite tu contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegConfirm(!showRegConfirm)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors z-10"
                    >
                      {showRegConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isRegLoading}
                  className="relative w-full bg-gradient-to-r from-red-500 via-rose-500 to-red-500 text-white font-bold py-4 px-4 rounded-xl transition-all duration-500 shadow-lg hover:shadow-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group text-sm mt-4"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isRegLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Creando cuenta...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5" />
                        Crear Cuenta
                      </>
                    )}
                  </span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
