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
  FileText,
  Activity
} from "lucide-react";
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
  rolesDisponibles = ["Administrador", "Cocinero", "Vendedor"],
  cargosDisponibles
}) {
  const notify = useNotifications();
  const isEditing = Boolean(empleado);

  const availableRoles = rolesDisponibles || cargosDisponibles || ["Administrador", "Cocinero", "Vendedor"];

  const initialForm = {
    tipoDocumento: "C.C.",
    numeroDocumento: "",
    nombre: "",
    apellidos: "",
    telefono: "",
    correo: "",
    direccion: "",
    rol: "Cocinero",
    tipoContrato: "Término Fijo",
    fechaInicio: new Date().toISOString().split("T")[0],
    fechaFin: "",
    turno: "Completo",
    salario: "",
    estado: "Activo"
  };

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [isCustomRol, setIsCustomRol] = useState(false);

  useEffect(() => {
    if (empleado) {
      const currentRol = empleado.rol || empleado.cargo || "Cocinero";
      const isBaseOrAvailable = ["Administrador", "Cocinero", "Vendedor", ...availableRoles].includes(currentRol);

      const numSalario = Number(empleado.salario) || 0;
      const fInicio = empleado.fechaInicio || empleado.fechaContratacion
        ? new Date(empleado.fechaInicio || empleado.fechaContratacion).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];
      const fFin = empleado.fechaFin ? new Date(empleado.fechaFin).toISOString().split("T")[0] : "";

      let estadoValue = "Activo";
      if (empleado.estado === "Incapacitado" || empleado.estado === 2 || empleado.estado === "2") {
        estadoValue = "Incapacitado";
      } else if (empleado.estado === 0 || empleado.estado === "0" || empleado.estado === "Inactivo" || empleado.estado === false) {
        estadoValue = "Inactivo";
      } else {
        estadoValue = "Activo";
      }

      setForm({
        tipoDocumento: empleado.tipoDocumento || "C.C.",
        numeroDocumento: empleado.numeroDocumento || "",
        nombre: empleado.nombre || "",
        apellidos: empleado.apellidos || "",
        telefono: empleado.telefono || "",
        correo: empleado.correo || "",
        direccion: extractCleanDireccion(empleado.direccion) || "",
        rol: currentRol,
        tipoContrato: empleado.tipoContrato || "Término Fijo",
        fechaInicio: fInicio,
        fechaFin: fFin,
        salario: numSalario > 0 ? formatMilesCOP(Math.round(numSalario)) : "",
        turno: empleado.turno || "Completo",
        estado: estadoValue
      });

      setIsCustomRol(!isBaseOrAvailable);
    } else {
      setForm({
        ...initialForm,
        fechaInicio: new Date().toISOString().split("T")[0]
      });
      setIsCustomRol(false);
    }
    setErrors({});
    setTouched({});
  }, [empleado, isOpen]);

  // Validador individual de campo en tiempo real
  const validateField = (name, value, currentForm = form) => {
    let errorMsg = "";

    switch (name) {
      case "numeroDocumento": {
        const res = validateDocumento(value, currentForm.tipoDocumento);
        if (!res.isValid) errorMsg = res.error;
        break;
      }
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
      case "rol": {
        const res = validateRequerido(value, "El rol del empleado");
        if (!res.isValid) errorMsg = res.error;
        else if (value.trim().length < 2) errorMsg = "El rol debe tener al menos 2 caracteres.";
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
      case "fechaInicio": {
        const res = validateRequerido(value, "La fecha de inicio de contratación");
        if (!res.isValid) errorMsg = res.error;
        break;
      }
      case "fechaFin": {
        if (currentForm.tipoContrato === "Término Fijo" && (!value || !value.trim())) {
          errorMsg = "La fecha de finalización es obligatoria para contratos a Término Fijo.";
        } else if (value && currentForm.fechaInicio && value < currentForm.fechaInicio) {
          errorMsg = "La fecha fin no puede ser anterior a la fecha de inicio.";
        }
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

    if (name === "numeroDocumento") {
      nextVal = sanitizeDocumento(value, form.tipoDocumento);
    } else if (name === "telefono") {
      nextVal = sanitizeTelefono(value);
    } else if (name === "salario") {
      const rawNum = parseMilesCOP(value, false);
      nextVal = rawNum !== "" ? formatMilesCOP(rawNum) : "";
    }

    setForm((prev) => {
      const updated = { ...prev, [name]: nextVal };

      // Si cambia tipo de contrato a Término Indefinido, limpiar error de fechaFin si no se ingresa
      if (name === "tipoContrato" && nextVal === "Término Indefinido" && !updated.fechaFin) {
        setErrors((errs) => ({ ...errs, fechaFin: null }));
      }

      return updated;
    });

    if (touched[name]) {
      validateField(name, nextVal, { ...form, [name]: nextVal });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const validateAll = () => {
    const fieldsToValidate = [
      "numeroDocumento",
      "nombre",
      "apellidos",
      "telefono",
      "correo",
      "rol",
      "tipoContrato",
      "turno",
      "fechaInicio",
      "fechaFin",
      "salario"
    ];

    const markTouched = {};
    const errObj = {};

    fieldsToValidate.forEach((f) => {
      markTouched[f] = true;
      const val = form[f];
      let msg = "";

      if (f === "numeroDocumento") {
        const r = validateDocumento(val, form.tipoDocumento);
        if (!r.isValid) msg = r.error;
      } else if (f === "nombre") {
        const r = validateNombre(val, "nombres");
        if (!r.isValid) msg = r.error;
      } else if (f === "apellidos") {
        const r = validateNombre(val, "apellidos");
        if (!r.isValid) msg = r.error;
      } else if (f === "telefono" && val && val.trim()) {
        const r = validateTelefono(val);
        if (!r.isValid) msg = r.error;
      } else if (f === "correo" && val && val.trim()) {
        const r = validateEmail(val);
        if (!r.isValid) msg = r.error;
      } else if (f === "rol") {
        const r = validateRequerido(val, "El rol del empleado");
        if (!r.isValid) msg = r.error;
      } else if (f === "tipoContrato") {
        const r = validateRequerido(val, "El tipo de contrato");
        if (!r.isValid) msg = r.error;
      } else if (f === "turno") {
        const r = validateRequerido(val, "El turno u horario");
        if (!r.isValid) msg = r.error;
      } else if (f === "fechaInicio") {
        const r = validateRequerido(val, "La fecha de inicio de contratación");
        if (!r.isValid) msg = r.error;
      } else if (f === "fechaFin") {
        if (form.tipoContrato === "Término Fijo" && (!val || !val.trim())) {
          msg = "La fecha de finalización es obligatoria para contratos a Término Fijo.";
        } else if (val && form.fechaInicio && val < form.fechaInicio) {
          msg = "La fecha fin no puede ser anterior a la fecha de inicio.";
        }
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
        cargo: form.rol, // Para retrocompatibilidad
        salario: parsedSalario,
        fechaContratacion: form.fechaInicio
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Lista unificada de roles disponibles
  const listaRoles = Array.from(
    new Set(["Administrador", "Cocinero", "Vendedor", ...availableRoles, form.rol])
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
                Información del personal, rol asignado y condiciones de contratación en Chazin Food
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-200/60 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario en 2 Columnas */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            {/* ──── COLUMNA 1: DOCUMENTO DE IDENTIDAD Y DATOS PERSONALES ──── */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/70 space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 flex items-center gap-1.5 pb-2 border-b border-gray-200/60 dark:border-gray-700">
                <User className="w-4 h-4 text-red-500" />
                <span>Identificación y Datos Personales</span>
              </h3>

              {/* 1. DOCUMENTO DE IDENTIDAD (DE PRIMERO) */}
              <div className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-red-100 dark:border-red-900/30 shadow-2xs space-y-2">
                <span className="text-[11px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider block">
                  Documento de Identidad (Principal)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-300 mb-1">
                      Tipo Documento
                    </label>
                    <select
                      name="tipoDocumento"
                      value={form.tipoDocumento}
                      onChange={(e) => {
                        handleChange(e);
                        validateField("numeroDocumento", form.numeroDocumento, { ...form, tipoDocumento: e.target.value });
                      }}
                      className="w-full px-2.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30 dark:bg-gray-750 dark:text-white font-semibold cursor-pointer"
                    >
                      <option value="C.C.">Cédula (C.C.)</option>
                      <option value="C.E.">Cédula Ext. (C.E.)</option>
                      <option value="T.I.">Tarjeta Id. (T.I.)</option>
                      <option value="Pasaporte">Pasaporte (P.P.)</option>
                      <option value="PPT">Permiso Temp. (PPT)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-300 mb-1">
                      Número de Documento <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="numeroDocumento"
                      value={form.numeroDocumento}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Ej: 1020304050"
                      className={`w-full px-3 py-2 rounded-xl border text-xs outline-none font-bold transition-all dark:bg-gray-750 dark:text-white ${
                        errors.numeroDocumento && touched.numeroDocumento
                          ? "border-red-500 bg-red-50/40 dark:bg-red-950/30 focus:ring-2 focus:ring-red-200"
                          : "border-gray-200 dark:border-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30"
                      }`}
                    />
                    {errors.numeroDocumento && touched.numeroDocumento && (
                      <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        {errors.numeroDocumento}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Nombres y Apellidos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
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

              {/* 3. Teléfono y Correo */}
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

              {/* 4. Dirección */}
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

            {/* ──── COLUMNA 2: ROL, CONTRATACIÓN Y ESTADO OPERATIVO ──── */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/70 space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 flex items-center gap-1.5 pb-2 border-b border-gray-200/60 dark:border-gray-700">
                <Briefcase className="w-4 h-4 text-red-500" />
                <span>Rol, Contratación y Estado Operativo</span>
              </h3>

              {/* 1. ROL DEL EMPLEADO (ANTES CARGO) */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Rol del Empleado <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomRol(!isCustomRol);
                      if (!isCustomRol && !form.rol) {
                        setForm((prev) => ({ ...prev, rol: "" }));
                      }
                    }}
                    className="text-[11px] font-bold text-red-600 hover:text-red-700 dark:text-red-400 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {isCustomRol ? (
                      <>
                        <List className="w-3 h-3" />
                        <span>Ver lista de roles</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3" />
                        <span>+ Crear nuevo rol</span>
                      </>
                    )}
                  </button>
                </div>

                {isCustomRol ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      name="rol"
                      value={form.rol}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      autoFocus
                      placeholder="Escribe el nuevo rol (Ej: Supervisor, Repartidor...)"
                      className={`w-full px-3 py-2 rounded-xl border text-xs outline-none transition-all dark:bg-gray-800 dark:text-white ${
                        errors.rol && touched.rol
                          ? "border-red-500 bg-red-50/30 dark:bg-red-950/20 focus:ring-2 focus:ring-red-200"
                          : "border-gray-200 dark:border-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomRol(false);
                        setForm((prev) => ({ ...prev, rol: "Cocinero" }));
                        validateField("rol", "Cocinero");
                      }}
                      className="px-2.5 py-2 text-xs font-semibold rounded-xl bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 shrink-0 cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <select
                    name="rol"
                    value={form.rol}
                    onChange={(e) => {
                      if (e.target.value === "__CREAR_NUEVO__") {
                        setIsCustomRol(true);
                        setForm((prev) => ({ ...prev, rol: "" }));
                      } else {
                        handleChange(e);
                        validateField("rol", e.target.value);
                      }
                    }}
                    className={`w-full px-3 py-2 rounded-xl border text-xs outline-none transition-all dark:bg-gray-800 dark:text-white font-medium cursor-pointer ${
                      errors.rol && touched.rol
                        ? "border-red-500 focus:ring-2 focus:ring-red-200"
                        : "border-gray-200 dark:border-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30"
                    }`}
                  >
                    {listaRoles.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                    <option value="__CREAR_NUEVO__">+ Crear nuevo rol...</option>
                  </select>
                )}
                {errors.rol && touched.rol && (
                  <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {errors.rol}
                  </p>
                )}
              </div>

              {/* 2. TIPO DE CONTRATO Y TURNO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Tipo de Contrato <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="tipoContrato"
                    value={form.tipoContrato}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30 dark:bg-gray-800 dark:text-white font-medium cursor-pointer"
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

              {/* 3. FECHAS DE CONTRATACIÓN: INICIO Y FIN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 shadow-2xs">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Fecha de Inicio <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="date"
                      name="fechaInicio"
                      value={form.fechaInicio}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full pl-8 pr-2.5 py-1.5 rounded-xl border text-xs outline-none dark:bg-gray-750 dark:text-white ${
                        errors.fechaInicio && touched.fechaInicio
                          ? "border-red-500"
                          : "border-gray-200 dark:border-gray-700 focus:border-red-500"
                      }`}
                    />
                  </div>
                  {errors.fechaInicio && touched.fechaInicio && (
                    <p className="text-[10px] text-red-500 mt-1 flex items-center gap-0.5">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {errors.fechaInicio}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Fecha de Finalización {form.tipoContrato === "Término Fijo" && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="date"
                      name="fechaFin"
                      value={form.fechaFin}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Opcional si es indefinido"
                      className={`w-full pl-8 pr-2.5 py-1.5 rounded-xl border text-xs outline-none dark:bg-gray-750 dark:text-white ${
                        errors.fechaFin && touched.fechaFin
                          ? "border-red-500"
                          : "border-gray-200 dark:border-gray-700 focus:border-red-500"
                      }`}
                    />
                  </div>
                  {errors.fechaFin && touched.fechaFin && (
                    <p className="text-[10px] text-red-500 mt-1 flex items-center gap-0.5 font-medium">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {errors.fechaFin}
                    </p>
                  )}
                </div>
              </div>

              {/* 4. SALARIO Y ESTADO OPERATIVO (ACTIVO, INACTIVO, INCAPACITADO) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Estado Operativo <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="estado"
                    value={form.estado}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30 dark:bg-gray-800 dark:text-white font-semibold cursor-pointer"
                  >
                    <option value="Activo">🟢 Activo (Operando)</option>
                    <option value="Incapacitado">🟣 Incapacitado (Licencia médica)</option>
                    <option value="Inactivo">⚪ Inactivo (Pausado / Finalizado)</option>
                  </select>
                </div>
              </div>

            </div>

          </div>

          {/* Footer Compacto y Fijo */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-md shadow-red-600/20 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Guardando..." : isEditing ? "Actualizar Empleado" : "Registrar Empleado"}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
