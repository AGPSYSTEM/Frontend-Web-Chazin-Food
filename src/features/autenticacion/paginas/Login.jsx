import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/features/autenticacion/hooks/useAuth";
import { GoogleAuthButton } from "@/features/autenticacion/componentes/GoogleAuthButton";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ChefHat,
  Sparkles,
  User,
  UserPlus,
  LogIn,
  Phone,
  MapPin,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Check
} from "lucide-react";
import { useToast } from "@/shared/context/ToastContext";
import logoImg from "@/shared/assets/ChatGPT_Image_1_jun_2026__21_55_04.png";
import {
  sanitizeTelefono,
  sanitizeDocumento,
  getDocConfig,
  validateTelefono,
  validateDocumento,
  validateNombre,
  validateEmail
} from "@/shared/utils/validationUtils";

const TIPOS_DOC_OPTIONS = [
  { value: "C.C.", label: "C.C. (Cédula de Ciudadanía)" },
  { value: "T.I.", label: "T.I. (Tarjeta de Identidad)" },
  { value: "C.E.", label: "C.E. (Cédula de Extranjería)" },
  { value: "Pasaporte", label: "Pasaporte" },
  { value: "PPT", label: "PPT (Permiso por Protección Temporal)" }
];

export function Login() {
  const [tab, setTab] = useState("login");
  const [loginCorreo, setLoginCorreo] = useState("");
  const [loginContraseña, setLoginContraseña] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  const [regNombre, setRegNombre] = useState("");
  const [regApellidos, setRegApellidos] = useState("");
  const [regTipoDocumento, setRegTipoDocumento] = useState("C.C.");
  const [isTipoDocOpen, setIsTipoDocOpen] = useState(false);
  const tipoDocRef = useRef(null);

  const [regDocumento, setRegDocumento] = useState("");
  const [regCorreo, setRegCorreo] = useState("");
  const [regTelefono, setRegTelefono] = useState("");
  const [regDireccion, setRegDireccion] = useState("");
  const [regContraseña, setRegContraseña] = useState("");
  const [regConfirmar, setRegConfirmar] = useState("");

  const [showRegPassword, setShowRegPassword] = useState(false);
  const [isRegLoading, setIsRegLoading] = useState(false);

  // Control de campos interactuados para mostrar validaciones en tiempo real
  const [touched, setTouched] = useState({});

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleGoogleSuccess = (userData) => {
    if (userData?.rol && userData.rol.toLowerCase() !== "cliente") {
      navigate("/admin/dashboard");
    } else {
      navigate("/");
    }
  };

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (tipoDocRef.current && !tipoDocRef.current.contains(event.target)) {
        setIsTipoDocOpen(false);
      }
    }
    if (isTipoDocOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isTipoDocOpen]);

  useEffect(() => {
    const wasDark = document.documentElement.classList.contains("dark");
    if (wasDark) document.documentElement.classList.remove("dark");
    return () => {
      if (localStorage.getItem("chazin-dark") === "true") {
        document.documentElement.classList.add("dark");
      }
    };
  }, []);

  const markTouched = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Validaciones en tiempo real para LOGIN
  const getLoginCorreoError = () => {
    if (!touched.loginCorreo && !loginCorreo) return "";
    return validateEmail(loginCorreo).error;
  };

  const getLoginContraseñaError = () => {
    if (!touched.loginContraseña && !loginContraseña) return "";
    if (!loginContraseña) return "La contraseña es requerida.";
    if (loginContraseña.length < 6) return "La contraseña debe tener al menos 6 caracteres.";
    return "";
  };

  // Validaciones en tiempo real para REGISTRO
  const getRegNombreError = () => {
    if (!touched.regNombre && !regNombre) return "";
    return validateNombre(regNombre, "nombre").error;
  };

  const getRegApellidosError = () => {
    if (!touched.regApellidos && !regApellidos) return "";
    return validateNombre(regApellidos, "apellido").error;
  };

  const getRegDocumentoError = () => {
    if (!touched.regDocumento && !regDocumento) return "";
    return validateDocumento(regDocumento, regTipoDocumento).error;
  };

  const getRegTelefonoError = () => {
    if (!touched.regTelefono && !regTelefono) return "";
    if (!regTelefono.trim()) {
      return "El número de teléfono es obligatorio.";
    }
    if (regTelefono.length < 10) {
      return `Debe tener 10 dígitos (llevas ${regTelefono.length}/10).`;
    }
    return "";
  };

  const getRegCorreoError = () => {
    if (!touched.regCorreo && !regCorreo) return "";
    return validateEmail(regCorreo).error;
  };

  const getRegDireccionError = () => {
    if (!touched.regDireccion && !regDireccion) return "";
    if (!regDireccion.trim()) return "La dirección de entrega es obligatoria.";
    if (regDireccion.trim().length < 5) return "Ingresa una dirección completa (ej: Calle 12 # 34-56).";
    return "";
  };

  const getRegContraseñaError = () => {
    if (!touched.regContraseña && !regContraseña) return "";
    if (!regContraseña) return "La contraseña es requerida.";
    if (regContraseña.length < 6) return `Mínimo 6 caracteres (llevas ${regContraseña.length}).`;
    return "";
  };

  const getRegConfirmarError = () => {
    if (!touched.regConfirmar && !regConfirmar) return "";
    if (!regConfirmar) return "Por favor confirma tu contraseña.";
    if (regConfirmar !== regContraseña) return "Las contraseñas no coinciden.";
    return "";
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setTouched({ loginCorreo: true, loginContraseña: true });

    const emailCheck = validateEmail(loginCorreo);
    if (!emailCheck.isValid) {
      toast.error("Correo inválido", emailCheck.error);
      return;
    }

    if (!loginContraseña || loginContraseña.length < 6) {
      toast.error("Contraseña inválida", "La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsLoginLoading(true);
    const result = await login(loginCorreo, loginContraseña);
    if (result === true || result?.success) {
      toast.success("¡Bienvenido!", "Inicio de sesión exitoso");
      setTimeout(() => navigate("/"), 500);
    } else {
      const msg = result?.message || "";
      if (
        msg.toLowerCase().includes("la cuenta no existe") ||
        msg.toLowerCase().includes("no existe") ||
        result?.status === 404
      ) {
        toast.error("La cuenta no existe", "No se encontró ninguna cuenta registrada con este correo.");
      } else {
        toast.error("Error de autenticación", msg || "Correo o contraseña incorrectos");
      }
    }
    setIsLoginLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setTouched({
      regNombre: true,
      regApellidos: true,
      regDocumento: true,
      regCorreo: true,
      regTelefono: true,
      regDireccion: true,
      regContraseña: true,
      regConfirmar: true
    });

    const nomVal = validateNombre(regNombre, "nombre");
    if (!nomVal.isValid) {
      toast.error("Nombre inválido", nomVal.error);
      return;
    }

    const apeVal = validateNombre(regApellidos, "apellido");
    if (!apeVal.isValid) {
      toast.error("Apellidos inválidos", apeVal.error);
      return;
    }

    const docVal = validateDocumento(regDocumento, regTipoDocumento);
    if (!docVal.isValid) {
      toast.error("Documento inválido", docVal.error);
      return;
    }

    const emailCheck = validateEmail(regCorreo);
    if (!emailCheck.isValid) {
      toast.error("Correo inválido", emailCheck.error);
      return;
    }

    if (!regTelefono.trim()) {
      toast.error("Teléfono requerido", "El número de teléfono es obligatorio");
      return;
    }
    const telVal = validateTelefono(regTelefono);
    if (!telVal.isValid) {
      toast.error("Teléfono inválido", telVal.error);
      return;
    }

    if (!regDireccion.trim() || regDireccion.trim().length < 5) {
      toast.error("Dirección requerida", "Ingresa una dirección de entrega completa");
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
      idUsuario: sanitizeDocumento(regDocumento, regTipoDocumento),
      nombre: regNombre.trim(),
      apellidos: regApellidos.trim(),
      tipoDocumento: regTipoDocumento,
      telefono: sanitizeTelefono(regTelefono) || null,
      direccion: regDireccion.trim(),
      email: regCorreo.trim(),
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

  const getInputClass = (hasError, isOk) =>
    `relative w-full pl-12 pr-4 py-3.5 border-2 rounded-xl focus:ring-2 focus:ring-red-500/20 transition-all bg-white/50 backdrop-blur-sm outline-none text-sm ${
      hasError ? "border-red-500 focus:border-red-500" : isOk ? "border-emerald-500/80 focus:border-emerald-500" : "border-gray-200 focus:border-red-500"
    }`;

  const getInputWithRightClass = (hasError, isOk) =>
    `relative w-full pl-12 pr-12 py-3.5 border-2 rounded-xl focus:ring-2 focus:ring-red-500/20 transition-all bg-white/50 backdrop-blur-sm outline-none text-sm ${
      hasError ? "border-red-500 focus:border-red-500" : isOk ? "border-emerald-500/80 focus:border-emerald-500" : "border-gray-200 focus:border-red-500"
    }`;

  const getRegInputClass = (hasError, isOk) =>
    `relative w-full pl-10 pr-3 py-2.5 border-2 rounded-xl focus:ring-2 focus:ring-red-500/20 transition-all bg-white/50 backdrop-blur-sm outline-none text-xs sm:text-sm ${
      hasError ? "border-red-500 focus:border-red-500" : isOk ? "border-emerald-500/80 focus:border-emerald-500" : "border-gray-200 focus:border-red-500"
    }`;

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex items-center justify-center p-4">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-red-400/30 to-rose-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-[#30475E]/30 to-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-red-300/20 to-rose-400/10 rounded-full blur-2xl" />
        <div className="absolute top-10 right-10 w-64 h-64 opacity-5">
          <div className="grid grid-cols-8 gap-4">
            {[...Array(64)].map((_, i) => <div key={i} className="w-2 h-2 bg-gray-800 rounded-full" />)}
          </div>
        </div>
        <svg className="absolute bottom-0 left-0 w-full opacity-5" viewBox="0 0 1440 320">
          <path fill="#F05454" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,138.7C960,139,1056,117,1152,112C1248,107,1344,117,1392,122.7L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
        </svg>
      </div>

      <div className={`relative w-full ${tab === "register" ? "max-w-xl" : "max-w-md"} z-10 my-4 transition-all duration-300`}>
        {/* Logo */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="inline-flex items-center justify-center relative mb-3 sm:mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-rose-500 rounded-full blur-2xl opacity-30 animate-pulse" />
            <div className="relative bg-white rounded-full p-4 sm:p-5 shadow-2xl border-4 border-red-500/20">
              <img src={logoImg} alt="Chazin Food" className={`transition-all duration-300 ${tab === "register" ? "w-14 h-14" : "w-20 h-20"} object-contain`} />
            </div>
            <div className="absolute -top-1 -right-1 bg-gradient-to-br from-red-500 to-rose-600 p-1.5 rounded-full shadow-lg">
              <ChefHat className="w-4 h-4 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-1 bg-gradient-to-r from-red-600 via-rose-500 to-red-600 bg-clip-text text-transparent">
            Chazin Food
          </h1>
          <p className="text-gray-600 font-medium flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold">
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
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 font-semibold text-sm transition-all duration-300 ${tab === "login" ? "text-red-600 border-b-2 border-red-500 bg-red-50/50" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
            >
              <LogIn className="w-4 h-4" />
              Iniciar Sesión
            </button>
            <button
              onClick={() => setTab("register")}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 font-semibold text-sm transition-all duration-300 ${tab === "register" ? "text-red-600 border-b-2 border-red-500 bg-red-50/50" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
            >
              <UserPlus className="w-4 h-4" />
              Registrarse
            </button>
          </div>

          <div className={tab === "register" ? "p-5 sm:p-6" : "p-8"}>
            {/* LOGIN */}
            {tab === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Correo Electrónico <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-500 rounded-xl opacity-0 group-focus-within:opacity-10 blur transition-opacity" />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 w-5 h-5 transition-colors z-10" />
                    <input
                      type="email"
                      value={loginCorreo}
                      onChange={(e) => {
                        setLoginCorreo(e.target.value);
                        markTouched("loginCorreo");
                      }}
                      onBlur={() => markTouched("loginCorreo")}
                      className={getInputClass(!!getLoginCorreoError(), touched.loginCorreo && !getLoginCorreoError())}
                      placeholder="usuario@chazinfood.com"
                    />
                  </div>
                  {getLoginCorreoError() && (
                    <p className="mt-1.5 text-xs font-semibold text-red-500 flex items-center gap-1 animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{getLoginCorreoError()}</span>
                    </p>
                  )}
                  {touched.loginCorreo && !getLoginCorreoError() && loginCorreo && (
                    <p className="mt-1.5 text-xs font-semibold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Correo válido</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contraseña <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-500 rounded-xl opacity-0 group-focus-within:opacity-10 blur transition-opacity" />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 w-5 h-5 transition-colors z-10" />
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      value={loginContraseña}
                      onChange={(e) => {
                        setLoginContraseña(e.target.value);
                        markTouched("loginContraseña");
                      }}
                      onBlur={() => markTouched("loginContraseña")}
                      className={getInputWithRightClass(!!getLoginContraseñaError(), touched.loginContraseña && !getLoginContraseñaError())}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors z-10 cursor-pointer"
                    >
                      {showLoginPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {getLoginContraseñaError() && (
                    <p className="mt-1.5 text-xs font-semibold text-red-500 flex items-center gap-1 animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{getLoginContraseñaError()}</span>
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoginLoading || !loginCorreo.includes("@")}
                  className="relative w-full bg-gradient-to-r from-red-500 via-rose-500 to-red-500 text-white font-bold py-4 px-4 rounded-xl transition-all duration-500 shadow-lg hover:shadow-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group text-sm cursor-pointer"
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
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                </button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-400 font-medium">O continúa con</span>
                  </div>
                </div>

                <GoogleAuthButton onSuccess={handleGoogleSuccess} />

                <div className="text-center pt-2">
                  <Link to="/forgot-password" className="text-sm text-red-600 hover:text-red-700 font-semibold hover:underline transition-colors">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
              </form>
            )}

            {/* REGISTRO */}
            {tab === "register" && (
              <form onSubmit={handleRegister} className="space-y-3">
                <p className="text-xs text-gray-500 text-center -mt-1 mb-2">
                  Los campos marcados con <span className="text-red-500">*</span> son obligatorios.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Nombres <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 w-4 h-4 transition-colors z-10" />
                      <input
                        type="text"
                        value={regNombre}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[@0-9]/g, "");
                          setRegNombre(val);
                          markTouched("regNombre");
                        }}
                        onBlur={() => markTouched("regNombre")}
                        className={getRegInputClass(!!getRegNombreError(), touched.regNombre && !getRegNombreError())}
                        placeholder="Juan"
                      />
                    </div>
                    {getRegNombreError() && (
                      <p className="mt-1 text-[11px] font-semibold text-red-500 flex items-center gap-1 animate-in fade-in">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{getRegNombreError()}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Apellidos <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 w-4 h-4 transition-colors z-10" />
                      <input
                        type="text"
                        value={regApellidos}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[@0-9]/g, "");
                          setRegApellidos(val);
                          markTouched("regApellidos");
                        }}
                        onBlur={() => markTouched("regApellidos")}
                        className={getRegInputClass(!!getRegApellidosError(), touched.regApellidos && !getRegApellidosError())}
                        placeholder="Pérez"
                      />
                    </div>
                    {getRegApellidosError() && (
                      <p className="mt-1 text-[11px] font-semibold text-red-500 flex items-center gap-1 animate-in fade-in">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{getRegApellidosError()}</span>
                      </p>
                    )}
                  </div>

                  {/* Tipo de Documento con selector redondeado (border-radius) */}
                  <div className="relative" ref={tipoDocRef}>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Tipo de Documento <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsTipoDocOpen(!isTipoDocOpen)}
                      className="relative w-full pl-10 pr-9 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 hover:border-gray-300 transition-all bg-white/50 backdrop-blur-sm outline-none text-xs sm:text-sm text-gray-900 text-left flex items-center justify-between cursor-pointer"
                    >
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <span className="truncate">
                        {TIPOS_DOC_OPTIONS.find((opt) => opt.value === regTipoDocumento)?.label || regTipoDocumento}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                          isTipoDocOpen ? "rotate-180 text-red-500" : ""
                        }`}
                      />
                    </button>

                    {/* Desplegable con bordes redondeados (border-radius 2xl) */}
                    {isTipoDocOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl shadow-2xl border-2 border-gray-100 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden backdrop-blur-md">
                        <div className="space-y-0.5">
                          {TIPOS_DOC_OPTIONS.map((opt) => {
                            const isSelected = regTipoDocumento === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                  setRegTipoDocumento(opt.value);
                                  setRegDocumento(sanitizeDocumento(regDocumento, opt.value));
                                  setIsTipoDocOpen(false);
                                  markTouched("regDocumento");
                                }}
                                className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center justify-between cursor-pointer ${
                                  isSelected
                                    ? "bg-red-50 text-red-600 font-bold"
                                    : "text-gray-700 hover:bg-gray-100"
                                }`}
                              >
                                <span>{opt.label}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Número de Documento <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {getDocConfig(regTipoDocumento).helper}
                      </span>
                    </div>
                    <div className="relative group">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 w-4 h-4 transition-colors z-10" />
                      <input
                        type="text"
                        value={regDocumento}
                        maxLength={getDocConfig(regTipoDocumento).max}
                        onChange={(e) => {
                          setRegDocumento(sanitizeDocumento(e.target.value, regTipoDocumento));
                          markTouched("regDocumento");
                        }}
                        onBlur={() => markTouched("regDocumento")}
                        className={getRegInputClass(!!getRegDocumentoError(), touched.regDocumento && !getRegDocumentoError())}
                        placeholder={getDocConfig(regTipoDocumento).helper}
                      />
                    </div>
                    {getRegDocumentoError() && (
                      <p className="mt-1 text-[11px] font-semibold text-red-500 flex items-center gap-1 animate-in fade-in">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{getRegDocumentoError()}</span>
                      </p>
                    )}
                  </div>

                  {/* Teléfono (Obligatorio) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Teléfono <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {regTelefono.length}/10 dígitos
                      </span>
                    </div>
                    <div className="relative group">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 w-4 h-4 transition-colors z-10" />
                      <input
                        type="tel"
                        value={regTelefono}
                        maxLength={10}
                        onChange={(e) => {
                          setRegTelefono(sanitizeTelefono(e.target.value));
                          markTouched("regTelefono");
                        }}
                        onBlur={() => markTouched("regTelefono")}
                        className={getRegInputClass(
                          !!getRegTelefonoError(),
                          touched.regTelefono && !getRegTelefonoError() && regTelefono.length === 10
                        )}
                        placeholder="3190000000"
                        inputMode="numeric"
                      />
                    </div>
                    {getRegTelefonoError() && (
                      <p className="mt-1 text-[11px] font-semibold text-red-500 flex items-center gap-1 animate-in fade-in">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{getRegTelefonoError()}</span>
                      </p>
                    )}
                    {touched.regTelefono && !getRegTelefonoError() && regTelefono.length === 10 && (
                      <p className="mt-1 text-[11px] font-semibold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Teléfono válido</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Correo Electrónico <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 w-4 h-4 transition-colors z-10" />
                      <input
                        type="email"
                        value={regCorreo}
                        onChange={(e) => {
                          setRegCorreo(e.target.value);
                          markTouched("regCorreo");
                        }}
                        onBlur={() => markTouched("regCorreo")}
                        className={getRegInputClass(!!getRegCorreoError(), touched.regCorreo && !getRegCorreoError())}
                        placeholder="tu@correo.com"
                      />
                    </div>
                    {getRegCorreoError() && (
                      <p className="mt-1 text-[11px] font-semibold text-red-500 flex items-center gap-1 animate-in fade-in">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{getRegCorreoError()}</span>
                      </p>
                    )}
                    {touched.regCorreo && !getRegCorreoError() && regCorreo && (
                      <p className="mt-1 text-[11px] font-semibold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                        <span>Correo válido</span>
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Dirección de Entrega <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 w-4 h-4 transition-colors z-10" />
                      <input
                        type="text"
                        value={regDireccion}
                        onChange={(e) => {
                          setRegDireccion(e.target.value);
                          markTouched("regDireccion");
                        }}
                        onBlur={() => markTouched("regDireccion")}
                        className={getRegInputClass(!!getRegDireccionError(), touched.regDireccion && !getRegDireccionError())}
                        placeholder="Calle 12 # 34-56"
                      />
                    </div>
                    {getRegDireccionError() && (
                      <p className="mt-1 text-[11px] font-semibold text-red-500 flex items-center gap-1 animate-in fade-in">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{getRegDireccionError()}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Contraseña <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 w-4 h-4 transition-colors z-10" />
                      <input
                        type={showRegPassword ? "text" : "password"}
                        value={regContraseña}
                        onChange={(e) => {
                          setRegContraseña(e.target.value);
                          markTouched("regContraseña");
                        }}
                        onBlur={() => markTouched("regContraseña")}
                        className={getRegInputClass(!!getRegContraseñaError(), touched.regContraseña && !getRegContraseñaError())}
                        placeholder="Mínimo 6 caracteres"
                      />
                    </div>
                    {getRegContraseñaError() && (
                      <p className="mt-1 text-[11px] font-semibold text-red-500 flex items-center gap-1 animate-in fade-in">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{getRegContraseñaError()}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Confirmar Contraseña <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 w-4 h-4 transition-colors z-10" />
                      <input
                        type={showRegPassword ? "text" : "password"}
                        value={regConfirmar}
                        onChange={(e) => {
                          setRegConfirmar(e.target.value);
                          markTouched("regConfirmar");
                        }}
                        onBlur={() => markTouched("regConfirmar")}
                        className={getRegInputClass(!!getRegConfirmarError(), touched.regConfirmar && !getRegConfirmarError())}
                        placeholder="Repite tu contraseña"
                      />
                    </div>
                    {getRegConfirmarError() && (
                      <p className="mt-1 text-[11px] font-semibold text-red-500 flex items-center gap-1 animate-in fade-in">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{getRegConfirmarError()}</span>
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="flex items-center gap-2 text-xs text-gray-500 hover:text-red-500 transition-colors select-none cursor-pointer"
                    >
                      {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {showRegPassword ? "Ocultar contraseñas" : "Mostrar contraseñas"}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isRegLoading || !regCorreo.includes("@") || regTelefono.length !== 10}
                  className="relative w-full bg-gradient-to-r from-red-500 via-rose-500 to-red-500 text-white font-bold py-3 px-4 rounded-xl transition-all duration-500 shadow-lg hover:shadow-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group text-sm mt-3 cursor-pointer"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isRegLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Creando cuenta...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        Crear Cuenta
                      </>
                    )}
                  </span>
                </button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-400 font-medium">O continúa con</span>
                  </div>
                </div>

                <GoogleAuthButton onSuccess={handleGoogleSuccess} text="signup_with" />
              </form>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .bg-size-200 { background-size: 200% 100%; }
        .bg-pos-0 { background-position: 0% 50%; }
        .bg-pos-100 { background-position: 100% 50%; }
      `}</style>
    </div>
  );
}
