import { useState, useEffect } from "react";
import {
  X,
  User,
  Briefcase,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Calendar,
  Clock,
  ShieldCheck,
  Plus,
  List,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { usuariosService } from "@/features/configuracion/servicios/usuariosService";
import { useNotifications } from "@/shared/hooks/useNotifications";
import {
  validateNombre,
  validateDocumento,
  validateTelefono,
  validateEmail,
  validateRequerido,
  validateNumeroPositivo,
  formatMilesCOP,
  parseMilesCOP,
  sanitizeDocumento,
  sanitizeTelefono
} from "@/shared/utils/validationUtils";

// Helper robusto para extraer y limpiar la dirección
function extractCleanDireccion(raw) {
  if (!raw) return "";
  if (typeof raw === "object" && raw !== null) {
    return raw.direccion ? extractCleanDireccion(raw.direccion) : "";
  }
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && parsed.direccion !== undefined) {
          return extractCleanDireccion(parsed.direccion);
        }
      } catch (_) {}
    }
    return trimmed;
  }
  return String(raw).trim();
}

export function EmpleadoModal({
  isOpen,
  onClose,
  onSave,
  empleado = null,
  cargosDisponibles = ["Administrador", "Cocinero", "Vendedor"]
}) {
  const notify = useNotifications();
  const isEditing = Boolean(empleado);

  const initialForm = {
    nombre: "",
    apellidos: "",
    tipoDocumento: "C.C.",
    numeroDocumento: "",
    telefono: "",
    correo: "",
    direccion: "",
    cargo: "Cocinero",
    fechaContratacion: new Date().toISOString().split("T")[0],
    tipoContrato: "Término Fijo",
    salario: "",
    turno: "Completo",
    estado: 1,
    idUsuario: null
  };

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [isCustomCargo, setIsCustomCargo] = useState(false);
  const [usuariosSistema, setUsuariosSistema] = useState([]);

  // Cargar usuarios del sistema para vincular roles/cuentas
  useEffect(() => {
    if (isOpen) {
      usuariosService
        .getUsuarios()
        .then((data) => {
          if (Array.isArray(data)) {
            setUsuariosSistema(data);
          }
        })
        .catch(() => setUsuariosSistema([]));
    }
  }, [isOpen]);

  useEffect(() => {
    if (empleado) {
      const currentCargo = empleado.cargo || "Cocinero";
      const isBaseOrAvailable = ["Administrador", "Cocinero", "Vendedor", ...cargosDisponibles].includes(currentCargo);

      const numSalario = Number(empleado.salario) || 0;
      setForm({
        nombre: empleado.nombre || "",
        apellidos: empleado.apellidos || "",
        tipoDocumento: empleado.tipoDocumento || "C.C.",
        numeroDocumento: empleado.numeroDocumento || "",
        telefono: empleado.telefono || "",
        correo: empleado.correo || "",
        direccion: extractCleanDireccion(empleado.direccion) || "",
        cargo: currentCargo,
        fechaContratacion: empleado.fechaContratacion
          ? new Date(empleado.fechaContratacion).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        tipoContrato: empleado.tipoContrato || "Término Fijo",
        salario: numSalario > 0 ? formatMilesCOP(Math.round(numSalario)) : "",
        turno: empleado.turno || "Completo",
        estado: empleado.estado !== undefined ? Number(empleado.estado) : 1,
        idUsuario: empleado.idUsuario || null
      });

      setIsCustomCargo(!isBaseOrAvailable);
    } else {
      let defaultDir = "";
      try {
        const savedUser = JSON.parse(localStorage.getItem("chazin_user") || "{}");
        if (savedUser) {
          const raw =
            savedUser.direccion ||
            (savedUser.clienteInfo ? savedUser.clienteInfo.direccion : "") ||
            (savedUser.cliente ? savedUser.cliente.direccion : "");
          defaultDir = extractCleanDireccion(raw);
        }
      } catch (_) {}

      setForm({
        ...initialForm,
        direccion: defaultDir
      });
      setIsCustomCargo(false);
    }
    setErrors({});
    setTouched({});
  }, [empleado, isOpen, cargosDisponibles]);

  // Validador individual de campo en tiempo real
  const validateField = (name, value, currentForm = form) => {
    let errorMsg = "";

    switch (name) {
      case "nombre": {
        const res = validateNombre(value, "nombres");
        if (!res.isValid) errorMsg = res.error;
        break;
      }
      case "apellidos": {
        const res = validateNombre(value, "apellidos");
        if (!res.isValid) errorMsg = res.error;
        break;
      }
      case "numeroDocumento": {
        const res = validateDocumento(value, currentForm.tipoDocumento);
        if (!res.isValid) errorMsg = res.error;
        break;
      }
      case "telefono": {
        if (value && value.trim()) {
          const res = validateTelefono(value);
          if (!res.isValid) errorMsg = res.error;
        }
        break;
      }
      case "correo": {
        if (value && value.trim()) {
          const res = validateEmail(value);
          if (!res.isValid) errorMsg = res.error;
        }
        break;
      }
      case "cargo": {
        const res = validateRequerido(value, "El cargo o puesto");
        if (!res.isValid) errorMsg = res.error;
        else if (value.trim().length < 2) errorMsg = "El cargo debe tener al menos 2 caracteres.";
        break;
      }
      case "tipoContrato": {
        const res = validateRequerido(value, "El tipo de contrato");
        if (!res.isValid) errorMsg = res.error;
        break;
      }
      case "turno": {
        const res = validateRequerido(value, "El turno u horario");
        if (!res.isValid) errorMsg = res.error;
        break;
      }
      case "fechaContratacion": {
        const res = validateRequerido(value, "La fecha de contratación");
        if (!res.isValid) errorMsg = res.error;
        break;
      }
      case "salario": {
        if (value && String(value).trim()) {
          const res = validateNumeroPositivo(value, "salario", { min: 0, allowZero: true, isCurrency: true });
          if (!res.isValid) errorMsg = res.error;
        }
        break;
      }
      default:
        break;
    }

    setErrors((prev) => ({
      ...prev,
      [name]: errorMsg || null
    }));

    return !errorMsg;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let nextVal = value;

    // Sanitización en vivo según tipo de campo
    if (name === "numeroDocumento") {
      nextVal = sanitizeDocumento(value, form.tipoDocumento);
    } else if (name === "telefono") {
      nextVal = sanitizeTelefono(value);
    } else if (name === "salario") {
      // Permitir formateo de miles en vivo
      const rawNum = parseMilesCOP(value, false);
      nextVal = rawNum !== "" ? formatMilesCOP(rawNum) : "";
    }

    setForm((prev) => {
      const next = { ...prev, [name]: nextVal };

      // Autocompletar inteligente por correo
      if (name === "correo" && nextVal && nextVal.includes("@")) {
        const found = usuariosSistema.find(
          (u) => (u.email || u.correo || "").toLowerCase() === nextVal.trim().toLowerCase()
        );
        if (found) {
          const rawDir = found.direccion || (found.clienteInfo ? found.clienteInfo.direccion : "");
          const dirLimpia = extractCleanDireccion(rawDir);
          if (dirLimpia && !prev.direccion) next.direccion = dirLimpia;
          if (!prev.nombre && found.nombre) next.nombre = found.nombre;
          if (!prev.apellidos && (found.apellidos || found.apellido)) next.apellidos = found.apellidos || found.apellido;
          if (!prev.telefono && found.telefono) next.telefono = sanitizeTelefono(found.telefono);
          if (!prev.numeroDocumento && (found.numeroDocumento || found.documento)) {
            next.numeroDocumento = sanitizeDocumento(found.numeroDocumento || found.documento, prev.tipoDocumento);
          }
          if (!prev.idUsuario && found.idUsuario) next.idUsuario = found.idUsuario;
        }
      }

      // Autocompletar inteligente por número de documento
      if (name === "numeroDocumento" && nextVal && nextVal.trim().length >= 6) {
        const found = usuariosSistema.find(
          (u) => String(u.numeroDocumento || u.documento || u.idUsuario || "").trim() === nextVal.trim()
        );
        if (found) {
          const rawDir = found.direccion || (found.clienteInfo ? found.clienteInfo.direccion : "");
          const dirLimpia = extractCleanDireccion(rawDir);
          if (dirLimpia && !prev.direccion) next.direccion = dirLimpia;
          if (!prev.nombre && found.nombre) next.nombre = found.nombre;
          if (!prev.apellidos && (found.apellidos || found.apellido)) next.apellidos = found.apellidos || found.apellido;
          if (!prev.telefono && found.telefono) next.telefono = sanitizeTelefono(found.telefono);
          if (!prev.correo && (found.email || found.correo)) next.correo = found.email || found.correo;
          if (!prev.idUsuario && found.idUsuario) next.idUsuario = found.idUsuario;
        }
      }

      return next;
    });

    // Validación en vivo si ya fue tocado
    if (touched[name]) {
      validateField(name, nextVal, { ...form, [name]: nextVal });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  // Vincular usuario seleccionado con autocompletado inteligente
  const handleSelectUsuario = (e) => {
    const id = e.target.value;
    if (!id) {
      setForm((prev) => ({ ...prev, idUsuario: null }));
      return;
    }

    const found = usuariosSistema.find((u) => String(u.idUsuario) === String(id));
    if (found) {
      let cargoMapped = "Vendedor";
      const rolStr = (found.rol || found.rolNombre || "").toLowerCase();
      if (rolStr.includes("admin")) {
        cargoMapped = "Administrador";
      } else if (rolStr.includes("cocin")) {
        cargoMapped = "Cocinero";
      } else if (rolStr.includes("vend") || rolStr.includes("cajer")) {
        cargoMapped = "Vendedor";
      } else if (found.rol || found.rolNombre) {
        cargoMapped = found.rol || found.rolNombre;
      }

      const rawDir = found.direccion || (found.clienteInfo ? found.clienteInfo.direccion : "");
      const dirLimpia = extractCleanDireccion(rawDir);

      const updated = {
        ...form,
        idUsuario: found.idUsuario,
        nombre: found.nombre || form.nombre,
        apellidos: found.apellidos || found.apellido || form.apellidos,
        tipoDocumento: found.tipoDocumento || form.tipoDocumento || "C.C.",
        numeroDocumento: found.numeroDocumento || found.documento || form.numeroDocumento,
        telefono: found.telefono ? sanitizeTelefono(found.telefono) : form.telefono,
        correo: found.email || found.correo || form.correo,
        direccion: dirLimpia || form.direccion,
        cargo: cargoMapped
      };

      setForm(updated);
      setIsCustomCargo(false);

      // Revalidar campos autocompletados
      validateField("nombre", updated.nombre, updated);
      validateField("apellidos", updated.apellidos, updated);
      validateField("numeroDocumento", updated.numeroDocumento, updated);
      if (updated.telefono) validateField("telefono", updated.telefono, updated);
      if (updated.correo) validateField("correo", updated.correo, updated);
      validateField("cargo", updated.cargo, updated);
    }
  };

  const validateAll = () => {
    const fieldsToValidate = [
      "nombre",
      "apellidos",
      "numeroDocumento",
      "telefono",
      "correo",
      "cargo",
      "tipoContrato",
      "turno",
      "fechaContratacion",
      "salario"
    ];

    const markTouched = {};
    const errObj = {};

    fieldsToValidate.forEach((f) => {
      markTouched[f] = true;
      const val = form[f];
      let msg = "";

      if (f === "nombre") {
        const r = validateNombre(val, "nombres");
        if (!r.isValid) msg = r.error;
      } else if (f === "apellidos") {
        const r = validateNombre(val, "apellidos");
        if (!r.isValid) msg = r.error;
      } else if (f === "numeroDocumento") {
        const r = validateDocumento(val, form.tipoDocumento);
        if (!r.isValid) msg = r.error;
      } else if (f === "telefono" && val && val.trim()) {
        const r = validateTelefono(val);
        if (!r.isValid) msg = r.error;
      } else if (f === "correo" && val && val.trim()) {
        const r = validateEmail(val);
        if (!r.isValid) msg = r.error;
      } else if (f === "cargo") {
        const r = validateRequerido(val, "El cargo o puesto");
        if (!r.isValid) msg = r.error;
      } else if (f === "tipoContrato") {
        const r = validateRequerido(val, "El tipo de contrato");
        if (!r.isValid) msg = r.error;
      } else if (f === "turno") {
        const r = validateRequerido(val, "El turno u horario");
        if (!r.isValid) msg = r.error;
      } else if (f === "fechaContratacion") {
        const r = validateRequerido(val, "La fecha de contratación");
        if (!r.isValid) msg = r.error;
      } else if (f === "salario" && val && String(val).trim()) {
        const r = validateNumeroPositivo(val, "salario", { min: 0, allowZero: true, isCurrency: true });
        if (!r.isValid) msg = r.error;
      }

      if (msg) errObj[f] = msg;
    });

    setTouched(markTouched);
    setErrors(errObj);

    return Object.keys(errObj).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateAll();

    if (!isValid) {
      notify.warning(
        "Campos Incompletos o Inválidos",
        "Por favor completa o corrige los campos obligatorios resaltados en rojo."
      );
      return;
    }

    try {
      setSubmitting(true);
      const parsedSalario = form.salario ? Number(parseMilesCOP(form.salario, false)) : 0;
      await onSave({
        ...form,
        salario: parsedSalario,
        idUsuario: form.idUsuario ? Number(form.idUsuario) : null
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Lista unificada de cargos base y existentes
  const listaCargos = Array.from(
    new Set(["Administrador", "Cocinero", "Vendedor", ...cargosDisponibles, form.cargo])
  ).filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-4xl lg:max-w-5xl border border-gray-100 dark:border-gray-800 my-4 overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Header Compacto */}
        <div className="px-6 py-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/70 dark:bg-gray-800/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400 flex items-center justify-center font-bold shadow-xs">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                {isEditing ? "Editar Empleado" : "Registrar Nuevo Empleado"}
              </h2>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Información del personal, rol en el sistema y desempeño de funciones en Chazin Food
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-200/60 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body con Optimización de Espacios en 2 Columnas */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4">
          
          {/* Fila Superior: Vinculación con Usuario del Sistema (Roles Activos) */}
          <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/70 dark:from-blue-950/30 dark:to-indigo-950/20 px-4 py-2.5 rounded-2xl border border-blue-100 dark:border-blue-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-blue-900 dark:text-blue-200 block leading-tight">
                  Vincular con Usuario del Sistema (Roles Activos)
                </span>
                <span className="text-[11px] text-blue-700/80 dark:text-blue-300/70">
                  Sincroniza datos personales y cargo automáticamente con el rol
                </span>
              </div>
            </div>
            <div className="w-full sm:w-80 shrink-0">
              <select
                value={form.idUsuario || ""}
                onChange={handleSelectUsuario}
                className="w-full px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800 text-xs outline-none bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 font-medium"
              >
                <option value="">-- Sin vincular (Empleado sin cuenta) --</option>
                {usuariosSistema.map((u) => {
                  const rolLabel =
                    u.rol ||
                    u.rolNombre ||
                    (u.idRol === 1 ? "Administrador" : u.idRol === 2 ? "Cocinero" : u.idRol === 3 ? "Vendedor" : "Usuario");
                  return (
                    <option key={u.idUsuario} value={u.idUsuario}>
                      {u.nombre} {u.apellidos || ""} — {rolLabel}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Grid de 2 Columnas Aprovechando el Ancho Completo */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            {/* ──── COLUMNA 1: DATOS PERSONALES ──── */}
            <div className="p-4 rounded-2xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/70 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 flex items-center gap-1.5 pb-1 border-b border-gray-200/60 dark:border-gray-700">
                <User className="w-3.5 h-3.5 text-red-500" />
                <span>Datos Personales</span>
              </h3>

              {/* Nombres y Apellidos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Nombres <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Ej: Carlos Andrés"
                    className={`w-full px-3 py-2 rounded-xl border text-xs outline-none transition-all dark:bg-gray-800 dark:text-white ${
                      errors.nombre && touched.nombre
                        ? "border-red-500 bg-red-50/30 dark:bg-red-950/20 focus:ring-2 focus:ring-red-200"
                        : "border-gray-200 dark:border-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30"
                    }`}
                  />
                  {errors.nombre && touched.nombre && (
                    <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {errors.nombre}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Apellidos <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="apellidos"
                    value={form.apellidos}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Ej: Martínez Gómez"
                    className={`w-full px-3 py-2 rounded-xl border text-xs outline-none transition-all dark:bg-gray-800 dark:text-white ${
                      errors.apellidos && touched.apellidos
                        ? "border-red-500 bg-red-50/30 dark:bg-red-950/20 focus:ring-2 focus:ring-red-200"
                        : "border-gray-200 dark:border-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30"
                    }`}
                  />
                  {errors.apellidos && touched.apellidos && (
                    <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {errors.apellidos}
                    </p>
                  )}
                </div>
              </div>

              {/* Tipo y Número de Documento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Tipo de Documento
                  </label>
                  <select
                    name="tipoDocumento"
                    value={form.tipoDocumento}
                    onChange={(e) => {
                      handleChange(e);
                      // Revalidar documento con la nueva configuración
                      validateField("numeroDocumento", form.numeroDocumento, { ...form, tipoDocumento: e.target.value });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30 dark:bg-gray-800 dark:text-white font-medium"
                  >
                    <option value="C.C.">Cédula de Ciudadanía (C.C.)</option>
                    <option value="C.E.">Cédula de Extranjería (C.E.)</option>
                    <option value="T.I.">Tarjeta de Identidad (T.I.)</option>
                    <option value="Pasaporte">Pasaporte (P.P.)</option>
                    <option value="PPT">Permiso Temporal (PPT)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Número de Documento <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="numeroDocumento"
                    value={form.numeroDocumento}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Ej: 1020304050"
                    className={`w-full px-3 py-2 rounded-xl border text-xs outline-none transition-all dark:bg-gray-800 dark:text-white ${
                      errors.numeroDocumento && touched.numeroDocumento
                        ? "border-red-500 bg-red-50/30 dark:bg-red-950/20 focus:ring-2 focus:ring-red-200"
                        : "border-gray-200 dark:border-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30"
                    }`}
                  />
                  {errors.numeroDocumento && touched.numeroDocumento && (
                    <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {errors.numeroDocumento}
                    </p>
                  )}
                </div>
              </div>

              {/* Teléfono y Correo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Teléfono / Celular
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      name="telefono"
                      value={form.telefono}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Ej: 3109876543"
                      className={`w-full pl-8 pr-3 py-2 rounded-xl border text-xs outline-none transition-all dark:bg-gray-800 dark:text-white ${
                        errors.telefono && touched.telefono
                          ? "border-red-500 bg-red-50/30 dark:bg-red-950/20 focus:ring-2 focus:ring-red-200"
                          : "border-gray-200 dark:border-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30"
                      }`}
                    />
                  </div>
                  {errors.telefono && touched.telefono && (
                    <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {errors.telefono}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="email"
                      name="correo"
                      value={form.correo}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Ej: empleado@chazinfood.com"
                      className={`w-full pl-8 pr-3 py-2 rounded-xl border text-xs outline-none transition-all dark:bg-gray-800 dark:text-white ${
                        errors.correo && touched.correo
                          ? "border-red-500 bg-red-50/30 dark:bg-red-950/20 focus:ring-2 focus:ring-red-200"
                          : "border-gray-200 dark:border-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30"
                      }`}
                    />
                  </div>
                  {errors.correo && touched.correo && (
                    <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {errors.correo}
                    </p>
                  )}
                </div>
              </div>

              {/* Dirección */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Dirección de Residencia
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    name="direccion"
                    value={form.direccion}
                    onChange={handleChange}
                    placeholder="Ej: Calle 45 # 12-34, Medellín"
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* ──── COLUMNA 2: FUNCIONES LABORALES & CONTRATACIÓN ──── */}
            <div className="p-4 rounded-2xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/70 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 flex items-center gap-1.5 pb-1 border-b border-gray-200/60 dark:border-gray-700">
                <Briefcase className="w-3.5 h-3.5 text-red-500" />
                <span>Funciones y Desempeño Laboral</span>
              </h3>

              {/* Cargo o Puesto */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Cargo o Puesto <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomCargo(!isCustomCargo);
                      if (!isCustomCargo && !form.cargo) {
                        setForm((prev) => ({ ...prev, cargo: "" }));
                      }
                    }}
                    className="text-[11px] font-bold text-red-600 hover:text-red-700 dark:text-red-400 flex items-center gap-1 transition-colors"
                  >
                    {isCustomCargo ? (
                      <>
                        <List className="w-3 h-3" />
                        <span>Ver lista de cargos</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3" />
                        <span>+ Crear nuevo cargo</span>
                      </>
                    )}
                  </button>
                </div>

                {isCustomCargo ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      name="cargo"
                      value={form.cargo}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      autoFocus
                      placeholder="Escribe el nuevo cargo (Ej: Cajero, Repartidor...)"
                      className={`w-full px-3 py-2 rounded-xl border text-xs outline-none transition-all dark:bg-gray-800 dark:text-white ${
                        errors.cargo && touched.cargo
                          ? "border-red-500 bg-red-50/30 dark:bg-red-950/20 focus:ring-2 focus:ring-red-200"
                          : "border-gray-200 dark:border-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomCargo(false);
                        setForm((prev) => ({ ...prev, cargo: "Cocinero" }));
                        validateField("cargo", "Cocinero");
                      }}
                      className="px-2.5 py-2 text-xs font-semibold rounded-xl bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 shrink-0"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <select
                    name="cargo"
                    value={form.cargo}
                    onChange={(e) => {
                      if (e.target.value === "__CREAR_NUEVO__") {
                        setIsCustomCargo(true);
                        setForm((prev) => ({ ...prev, cargo: "" }));
                      } else {
                        handleChange(e);
                        validateField("cargo", e.target.value);
                      }
                    }}
                    className={`w-full px-3 py-2 rounded-xl border text-xs outline-none transition-all dark:bg-gray-800 dark:text-white font-medium ${
                      errors.cargo && touched.cargo
                        ? "border-red-500 focus:ring-2 focus:ring-red-200"
                        : "border-gray-200 dark:border-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30"
                    }`}
                  >
                    {listaCargos.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="__CREAR_NUEVO__">+ Crear nuevo cargo...</option>
                  </select>
                )}
                {errors.cargo && touched.cargo && (
                  <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {errors.cargo}
                  </p>
                )}
              </div>

              {/* Tipo de Contrato y Turno */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Tipo de Contrato <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="tipoContrato"
                    value={form.tipoContrato}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30 dark:bg-gray-800 dark:text-white font-medium"
                  >
                    <option value="Término Fijo">Término Fijo</option>
                    <option value="Término Indefinido">Término Indefinido</option>
                    <option value="Prestación de Servicios">Prestación de Servicios</option>
                    <option value="Aprendizaje SENA">Aprendizaje SENA</option>
                    <option value="Por Obra o Labor">Por Obra o Labor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Turno / Horario <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Clock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      name="turno"
                      value={form.turno}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Ej: Completo / Mañana / Noche"
                      className={`w-full pl-8 pr-3 py-2 rounded-xl border text-xs outline-none transition-all dark:bg-gray-800 dark:text-white ${
                        errors.turno && touched.turno
                          ? "border-red-500 bg-red-50/30 dark:bg-red-950/20 focus:ring-2 focus:ring-red-200"
                          : "border-gray-200 dark:border-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30"
                      }`}
                    />
                  </div>
                  {errors.turno && touched.turno && (
                    <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {errors.turno}
                    </p>
                  )}
                </div>
              </div>

              {/* Fecha de Contratación y Salario Mensual COP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Fecha de Ingreso <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="date"
                      name="fechaContratacion"
                      value={form.fechaContratacion}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  {errors.fechaContratacion && touched.fechaContratacion && (
                    <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {errors.fechaContratacion}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Salario Mensual (COP)
                  </label>
                  <div className="relative">
                    <DollarSign className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      name="salario"
                      value={form.salario}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Ej: 1.600.000"
                      className={`w-full pl-8 pr-3 py-2 rounded-xl border text-xs outline-none transition-all dark:bg-gray-800 dark:text-white ${
                        errors.salario && touched.salario
                          ? "border-red-500 bg-red-50/30 dark:bg-red-950/20 focus:ring-2 focus:ring-red-200"
                          : "border-gray-200 dark:border-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30"
                      }`}
                    />
                  </div>
                  {errors.salario && touched.salario && (
                    <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {errors.salario}
                    </p>
                  )}
                </div>
              </div>

              {/* Estado Operativo */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Estado Operativo
                </label>
                <select
                  name="estado"
                  value={form.estado}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30 dark:bg-gray-800 dark:text-white font-medium"
                >
                  <option value={1}>Activo (En funciones operativas)</option>
                  <option value={0}>Inactivo (Pausado temporalmente)</option>
                </select>
              </div>
            </div>

          </div>

          {/* Footer Compacto y Fijo */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-md shadow-red-600/20 active:scale-95 disabled:opacity-50"
            >
              {submitting ? "Guardando..." : isEditing ? "Actualizar Empleado" : "Registrar Empleado"}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
