import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/features/autenticacion/hooks/useAuth";
import { useToast } from "@/shared/context/ToastContext";
import { GoogleAuthButton } from "@/features/autenticacion/componentes/GoogleAuthButton";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  User,
  UserPlus,
  LogIn,
  Phone,
  MapPin,
  CreditCard,
  ShoppingCart,
  AlertCircle,
  CheckCircle2,
  X,
  ArrowLeft,
  Sparkles,
  ChevronDown,
  Check
} from "lucide-react";
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

export function ClienteAuthModal({
  isOpen,
  onClose,
  onSuccess,
  totalItems = 0,
  cartTotal = 0,
  initialView = "choice" // "choice" | "login" | "register"
}) {
  const [currentView, setCurrentView] = useState(initialView);
  const [loginCorreo, setLoginCorreo] = useState("");
  const [loginContraseña, setLoginContraseña] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  // Registro fields
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

  // Touched state for displaying errors in real time
  const [touched, setTouched] = useState({});

  const { login, register } = useAuth();
  const toast = useToast();

  const handleGoogleSuccess = (userData) => {
    if (onSuccess) {
      onSuccess(userData);
    }
    onClose();
  };

  // Cerrar dropdown al hacer click afuera
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
    if (isOpen) {
      setCurrentView(initialView || "choice");
      setTouched({});
    }
  }, [isOpen, initialView]);

  if (!isOpen) return null;

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
    const res = validateDocumento(regDocumento, regTipoDocumento);
    return res.error;
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
    if (!regContraseña) return "La contraseña es obligatoria.";
    if (regContraseña.length < 6) return `Mínimo 6 caracteres (llevas ${regContraseña.length}).`;
    return "";
  };

  const getRegConfirmarError = () => {
    if (!touched.regConfirmar && !regConfirmar) return "";
    if (!regConfirmar) return "Por favor confirma tu contraseña.";
    if (regConfirmar !== regContraseña) return "Las contraseñas no coinciden.";
    return "";
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setTouched({ loginCorreo: true, loginContraseña: true });

    const emailCheck = validateEmail(loginCorreo);
    if (!emailCheck.isValid) {
      toast.error("Correo inválido", emailCheck.error);
      return;
    }

    if (!loginContraseña || loginContraseña.length < 6) {
      toast.error("Contraseña requerida", "Ingresa una contraseña válida de al menos 6 caracteres.");
      return;
    }

    setIsLoginLoading(true);
    try {
      const result = await login(loginCorreo, loginContraseña);
      if (result === true || result?.success) {
        toast.success("¡Bienvenido!", "Has iniciado sesión correctamente. Continuemos con tu pago.");
        if (onSuccess) {
          onSuccess(result?.user || null);
        }
        onClose();
      } else {
        toast.error("Error de autenticación", result?.message || "Correo o contraseña incorrectos");
      }
    } catch (err) {
      toast.error("Error", "Ocurrió un error al iniciar sesión.");
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
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

    const nomCheck = validateNombre(regNombre, "nombre");
    if (!nomCheck.isValid) {
      toast.error("Nombre inválido", nomCheck.error);
      return;
    }

    const apeCheck = validateNombre(regApellidos, "apellido");
    if (!apeCheck.isValid) {
      toast.error("Apellidos inválidos", apeCheck.error);
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
      toast.error("Teléfono requerido", "El número de teléfono es obligatorio.");
      return;
    }
    const telVal = validateTelefono(regTelefono);
    if (!telVal.isValid) {
      toast.error("Teléfono inválido", telVal.error);
      return;
    }

    if (!regDireccion.trim() || regDireccion.trim().length < 5) {
      toast.error("Dirección requerida", "Ingresa una dirección de entrega completa.");
      return;
    }

    if (regContraseña.length < 6) {
      toast.error("Contraseña corta", "La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (regContraseña !== regConfirmar) {
      toast.error("Contraseñas no coinciden", "Verifica que ambas contraseñas sean exactamente iguales.");
      return;
    }

    setIsRegLoading(true);
    try {
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

      if (result?.success) {
        toast.success("¡Cuenta creada!", "Tu cuenta fue creada con éxito. Continuemos con tu pago.");
        if (onSuccess) {
          onSuccess(result?.user || null);
        }
        onClose();
      } else {
        toast.error("Error al registrar", result?.message || "No se pudo crear la cuenta.");
      }
    } catch (err) {
      toast.error("Error", "Ocurrió un error al crear la cuenta.");
    } finally {
      setIsRegLoading(false);
    }
  };

  const inputBaseStyle = (hasError, isOk) =>
    `relative w-full pl-10 pr-3 py-2.5 rounded-xl border-2 transition-all outline-none text-xs sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 ${
      hasError
        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
        : isOk
        ? "border-emerald-500/80 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
        : "border-gray-200 dark:border-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
    }`;

  const inputWithRightStyle = (hasError, isOk) =>
    `relative w-full pl-10 pr-10 py-2.5 rounded-xl border-2 transition-all outline-none text-xs sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 ${
      hasError
        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
        : isOk
        ? "border-emerald-500/80 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
        : "border-gray-200 dark:border-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`bg-white dark:bg-gray-900 rounded-3xl w-full ${
          currentView === "register" ? "max-w-xl" : "max-w-md"
        } shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200`}
      >
        {/* Barra superior con gradiente de marca */}
        <div className="h-2 bg-gradient-to-r from-red-500 via-rose-500 to-red-500 shrink-0" />

        {/* Encabezado del Modal */}
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            {currentView !== "choice" && (
              <button
                type="button"
                onClick={() => setCurrentView("choice")}
                className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all cursor-pointer"
                title="Volver a opciones"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                {currentView === "choice" && "Inicia sesión para pagar"}
                {currentView === "login" && "Iniciar Sesión para Pagar"}
                {currentView === "register" && "Crear Cuenta para Pagar"}
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
                Tus productos se mantendrán listos en tu carrito
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Banner resumen del Carrito */}
        {totalItems > 0 && (
          <div className="px-4 py-2.5 sm:px-5 bg-red-50/70 dark:bg-red-950/20 border-b border-red-100 dark:border-red-900/30 flex items-center justify-between text-xs shrink-0">
            <span className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 font-semibold">
              <ShoppingCart className="w-4 h-4 text-red-500" /> {totalItems} {totalItems === 1 ? "producto" : "productos"} en tu carrito
            </span>
            <span className="font-black text-red-600 dark:text-red-400 text-sm">
              ${Number(cartTotal || 0).toLocaleString("es-CO")}
            </span>
          </div>
        )}

        {/* Switch Tabs si ya no está en choice */}
        {currentView !== "choice" && (
          <div className="flex border-b border-gray-100 dark:border-gray-800 shrink-0 bg-gray-50/50 dark:bg-gray-800/40">
            <button
              type="button"
              onClick={() => {
                setCurrentView("login");
                setTouched({});
              }}
              className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                currentView === "login"
                  ? "text-red-600 dark:text-red-400 border-b-2 border-red-500 bg-white dark:bg-gray-900 shadow-xs"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <LogIn className="w-4 h-4" />
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentView("register");
                setTouched({});
              }}
              className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                currentView === "register"
                  ? "text-red-600 dark:text-red-400 border-b-2 border-red-500 bg-white dark:bg-gray-900 shadow-xs"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Crear Cuenta Nueva
            </button>
          </div>
        )}

        {/* Contenido scrolleable */}
        <div className="p-4 sm:p-6 overflow-y-auto custom-modal-scrollbar space-y-4">
          {/* VISTA 1: ELECCIÓN INICIAL */}
          {currentView === "choice" && (
            <div className="text-center space-y-4 py-2">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-950/40 rounded-3xl flex items-center justify-center mx-auto text-red-500 shadow-inner">
                <LogIn className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-black text-gray-900 dark:text-gray-100">
                  ¿Cómo deseas continuar?
                </h4>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto leading-relaxed">
                  Inicia sesión si ya tienes cuenta, o crea una nueva en segundos para ingresar tu dirección de entrega y pagar.
                </p>
              </div>

              <div className="flex flex-col gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentView("login")}
                  className="w-full py-3.5 px-4 bg-red-500 hover:bg-red-600 active:scale-98 text-white font-extrabold rounded-2xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Iniciar Sesión</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentView("register")}
                  className="w-full py-3.5 px-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-98 text-gray-800 dark:text-gray-200 font-bold rounded-2xl text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  <span>Crear Cuenta Nueva</span>
                </button>

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-gray-900 px-2 text-gray-400 font-medium">O continúa con</span>
                  </div>
                </div>

                <GoogleAuthButton onSuccess={handleGoogleSuccess} />

                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors py-2 cursor-pointer"
                >
                  Seguir viendo el menú
                </button>
              </div>
            </div>
          )}

          {/* VISTA 2: FORMULARIO DE LOGIN */}
          {currentView === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Correo Electrónico */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Correo Electrónico <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 w-4 h-4 transition-colors z-10" />
                  <input
                    type="email"
                    value={loginCorreo}
                    onChange={(e) => {
                      setLoginCorreo(e.target.value);
                      markTouched("loginCorreo");
                    }}
                    onBlur={() => markTouched("loginCorreo")}
                    className={inputBaseStyle(!!getLoginCorreoError(), touched.loginCorreo && !getLoginCorreoError())}
                    placeholder="ejemplo@gmail.com"
                    autoFocus
                  />
                </div>
                {/* Mensaje de validación en tiempo real */}
                {getLoginCorreoError() && (
                  <p className="mt-1 text-[11px] font-semibold text-red-500 flex items-center gap-1 animate-in fade-in">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{getLoginCorreoError()}</span>
                  </p>
                )}
                {touched.loginCorreo && !getLoginCorreoError() && loginCorreo && (
                  <p className="mt-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-in fade-in">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Correo válido</span>
                  </p>
                )}
              </div>

              {/* Contraseña */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    Contraseña <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 w-4 h-4 transition-colors z-10" />
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    value={loginContraseña}
                    onChange={(e) => {
                      setLoginContraseña(e.target.value);
                      markTouched("loginContraseña");
                    }}
                    onBlur={() => markTouched("loginContraseña")}
                    className={inputWithRightStyle(!!getLoginContraseñaError(), touched.loginContraseña && !getLoginContraseñaError())}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors z-10 p-1 cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Mensaje de validación en tiempo real */}
                {getLoginContraseñaError() && (
                  <p className="mt-1 text-[11px] font-semibold text-red-500 flex items-center gap-1 animate-in fade-in">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{getLoginContraseñaError()}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoginLoading || !loginCorreo.includes("@")}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-red-500 via-rose-500 to-red-500 hover:from-red-600 hover:to-rose-600 active:scale-98 text-white font-extrabold rounded-2xl text-sm transition-all shadow-md shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                {isLoginLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Ingresar y Proceder al Pago</span>
                  </>
                )}
              </button>

              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-gray-900 px-2 text-gray-400 font-medium">O continúa con</span>
                </div>
              </div>

              <GoogleAuthButton onSuccess={handleGoogleSuccess} />

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentView("register");
                    setTouched({});
                  }}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 font-semibold transition-colors"
                >
                  ¿No tienes cuenta? <span className="text-red-600 dark:text-red-400 underline font-bold">Regístrate aquí</span>
                </button>
              </div>
            </form>
          )}

          {/* VISTA 3: FORMULARIO DE REGISTRO */}
          {currentView === "register" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <p className="text-[11px] text-gray-500 dark:text-gray-400 text-center -mt-1">
                Completa tus datos para entrega y factura. Los campos con <span className="text-red-500">*</span> son requeridos.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Nombres (NO acepta @ ni números) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Nombres <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 w-4 h-4 transition-colors z-10" />
                    <input
                      type="text"
                      value={regNombre}
                      onChange={(e) => {
                        // Bloquear explícitamente el @ y números al escribir
                        const val = e.target.value.replace(/[@0-9]/g, "");
                        setRegNombre(val);
                        markTouched("regNombre");
                      }}
                      onBlur={() => markTouched("regNombre")}
                      className={inputBaseStyle(!!getRegNombreError(), touched.regNombre && !getRegNombreError())}
                      placeholder="Juan"
                      autoFocus
                    />
                  </div>
                  {getRegNombreError() && (
                    <p className="mt-1 text-[11px] font-semibold text-red-500 flex items-center gap-1 animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{getRegNombreError()}</span>
                    </p>
                  )}
                </div>

                {/* Apellidos (NO acepta @ ni números) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
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
                      className={inputBaseStyle(!!getRegApellidosError(), touched.regApellidos && !getRegApellidosError())}
                      placeholder="Pérez"
                    />
                  </div>
                  {getRegApellidosError() && (
                    <p className="mt-1 text-[11px] font-semibold text-red-500 flex items-center gap-1 animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{getRegApellidosError()}</span>
                    </p>
                  )}
                </div>

                {/* Tipo de Documento con selector redondeado (border-radius) */}
                <div className="relative" ref={tipoDocRef}>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Tipo de Documento <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsTipoDocOpen(!isTipoDocOpen)}
                    className="relative w-full pl-10 pr-9 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all outline-none text-xs sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-left flex items-center justify-between cursor-pointer"
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
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-gray-100 dark:border-gray-700/80 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden backdrop-blur-md">
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
                                  ? "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold"
                                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/60"
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

                {/* Número de Documento */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                      Número Documento <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-gray-400">
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
                      className={inputBaseStyle(!!getRegDocumentoError(), touched.regDocumento && !getRegDocumentoError())}
                      placeholder={getDocConfig(regTipoDocumento).helper}
                    />
                  </div>
                  {getRegDocumentoError() && (
                    <p className="mt-1 text-[11px] font-semibold text-red-500 flex items-center gap-1 animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{getRegDocumentoError()}</span>
                    </p>
                  )}
                </div>

                {/* Teléfono (Obligatorio) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                      Teléfono <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-gray-400">
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
                      className={inputBaseStyle(
                        !!getRegTelefonoError(),
                        touched.regTelefono && !getRegTelefonoError() && regTelefono.length === 10
                      )}
                      placeholder="3001234567"
                      inputMode="numeric"
                    />
                  </div>
                  {getRegTelefonoError() && (
                    <p className="mt-1 text-[11px] font-semibold text-red-500 flex items-center gap-1 animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{getRegTelefonoError()}</span>
                    </p>
                  )}
                  {touched.regTelefono && !getRegTelefonoError() && regTelefono.length === 10 && (
                    <p className="mt-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-in fade-in">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Teléfono válido</span>
                    </p>
                  )}
                </div>

                {/* Correo Electrónico (Validación en tiempo real con @) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
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
                      className={inputBaseStyle(!!getRegCorreoError(), touched.regCorreo && !getRegCorreoError())}
                      placeholder="ejemplo@gmail.com"
                    />
                  </div>
                  {getRegCorreoError() && (
                    <p className="mt-1 text-[11px] font-semibold text-red-500 flex items-center gap-1 animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{getRegCorreoError()}</span>
                    </p>
                  )}
                  {touched.regCorreo && !getRegCorreoError() && regCorreo && (
                    <p className="mt-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-in fade-in">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Correo válido</span>
                    </p>
                  )}
                </div>

                {/* Dirección de Entrega */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
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
                      className={inputBaseStyle(!!getRegDireccionError(), touched.regDireccion && !getRegDireccionError())}
                      placeholder="Calle 12 # 34-56, Apto 201"
                    />
                  </div>
                  {getRegDireccionError() && (
                    <p className="mt-1 text-[11px] font-semibold text-red-500 flex items-center gap-1 animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{getRegDireccionError()}</span>
                    </p>
                  )}
                </div>

                {/* Contraseña */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
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
                      className={inputBaseStyle(!!getRegContraseñaError(), touched.regContraseña && !getRegContraseñaError())}
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                  {getRegContraseñaError() && (
                    <p className="mt-1 text-[11px] font-semibold text-red-500 flex items-center gap-1 animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{getRegContraseñaError()}</span>
                    </p>
                  )}
                </div>

                {/* Confirmar Contraseña */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
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
                      className={inputBaseStyle(!!getRegConfirmarError(), touched.regConfirmar && !getRegConfirmarError())}
                      placeholder="Repite tu contraseña"
                    />
                  </div>
                  {getRegConfirmarError() && (
                    <p className="mt-1 text-[11px] font-semibold text-red-500 flex items-center gap-1 animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{getRegConfirmarError()}</span>
                    </p>
                  )}
                </div>

                {/* Mostrar / Ocultar contraseñas */}
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
                className="w-full py-3.5 px-4 bg-gradient-to-r from-red-500 via-rose-500 to-red-500 hover:from-red-600 hover:to-rose-600 active:scale-98 text-white font-extrabold rounded-2xl text-sm transition-all shadow-md shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-3 cursor-pointer"
              >
                {isRegLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creando cuenta...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Crear Cuenta y Proceder al Pago</span>
                  </>
                )}
              </button>

              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-gray-900 px-2 text-gray-400 font-medium">O continúa con</span>
                </div>
              </div>

              <GoogleAuthButton onSuccess={handleGoogleSuccess} text="signup_with" />

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentView("login");
                    setTouched({});
                  }}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 font-semibold transition-colors"
                >
                  ¿Ya tienes cuenta? <span className="text-red-600 dark:text-red-400 underline font-bold">Inicia sesión aquí</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
