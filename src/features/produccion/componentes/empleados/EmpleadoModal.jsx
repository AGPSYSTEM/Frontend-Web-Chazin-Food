import { useState, useEffect } from "react";
import { X, User, Briefcase, Phone, Mail, MapPin, DollarSign, Calendar, Clock, FileText, ShieldCheck, Plus, List } from "lucide-react";
import { usuariosService } from "@/features/configuracion/servicios/usuariosService";

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
        salario: empleado.salario !== undefined ? String(Math.round(Number(empleado.salario) || 0)) : "",
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
  }, [empleado, isOpen, cargosDisponibles]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };

      // Si ingresa o cambia correo, autocompletar datos vacíos incluyendo dirección
      if (name === "correo" && value && value.includes("@")) {
        const found = usuariosSistema.find(
          (u) => (u.email || u.correo || "").toLowerCase() === value.trim().toLowerCase()
        );
        if (found) {
          const rawDir = found.direccion || (found.clienteInfo ? found.clienteInfo.direccion : "");
          const dirLimpia = extractCleanDireccion(rawDir);
          if (dirLimpia && !prev.direccion) next.direccion = dirLimpia;
          if (!prev.nombre && found.nombre) next.nombre = found.nombre;
          if (!prev.apellidos && (found.apellidos || found.apellido)) next.apellidos = found.apellidos || found.apellido;
          if (!prev.telefono && found.telefono) next.telefono = found.telefono;
          if (!prev.numeroDocumento && (found.numeroDocumento || found.documento)) {
            next.numeroDocumento = found.numeroDocumento || found.documento;
          }
          if (!prev.idUsuario && found.idUsuario) next.idUsuario = found.idUsuario;
        }
      }

      // Si ingresa número de documento, autocompletar si coincide con un usuario registrado
      if (name === "numeroDocumento" && value && value.trim().length >= 6) {
        const found = usuariosSistema.find(
          (u) => String(u.numeroDocumento || u.documento || u.idUsuario || "").trim() === value.trim()
        );
        if (found) {
          const rawDir = found.direccion || (found.clienteInfo ? found.clienteInfo.direccion : "");
          const dirLimpia = extractCleanDireccion(rawDir);
          if (dirLimpia && !prev.direccion) next.direccion = dirLimpia;
          if (!prev.nombre && found.nombre) next.nombre = found.nombre;
          if (!prev.apellidos && (found.apellidos || found.apellido)) next.apellidos = found.apellidos || found.apellido;
          if (!prev.telefono && found.telefono) next.telefono = found.telefono;
          if (!prev.correo && (found.email || found.correo)) next.correo = found.email || found.correo;
          if (!prev.idUsuario && found.idUsuario) next.idUsuario = found.idUsuario;
        }
      }

      return next;
    });
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Vincular usuario seleccionado con autocompletado inteligente (incluye dirección)
  const handleSelectUsuario = (e) => {
    const id = e.target.value;
    if (!id) {
      setForm((prev) => ({ ...prev, idUsuario: null }));
      return;
    }

    const found = usuariosSistema.find((u) => String(u.idUsuario) === String(id));
    if (found) {
      // Mapear rol a cargo base
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

      // Extraer y limpiar dirección del usuario o cliente asociado
      const rawDir = found.direccion || (found.clienteInfo ? found.clienteInfo.direccion : "");
      const dirLimpia = extractCleanDireccion(rawDir);

      setForm((prev) => ({
        ...prev,
        idUsuario: found.idUsuario,
        nombre: found.nombre || prev.nombre,
        apellidos: found.apellidos || found.apellido || prev.apellidos,
        tipoDocumento: found.tipoDocumento || prev.tipoDocumento || "C.C.",
        numeroDocumento: found.numeroDocumento || found.documento || prev.numeroDocumento,
        telefono: found.telefono || prev.telefono,
        correo: found.email || found.correo || prev.correo,
        direccion: dirLimpia || prev.direccion,
        cargo: cargoMapped
      }));
      setIsCustomCargo(false);
    }
  };

  const validate = () => {
    const err = {};
    if (!form.nombre.trim()) err.nombre = "El nombre es obligatorio";
    if (!form.apellidos.trim()) err.apellidos = "Los apellidos son obligatorios";
    if (!form.numeroDocumento.trim()) err.numeroDocumento = "El número de documento es obligatorio";
    if (!form.cargo.trim()) err.cargo = "El cargo o puesto es obligatorio";

    if (form.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo.trim())) {
      err.correo = "Ingresa un correo electrónico válido";
    }

    if (form.salario && (isNaN(Number(form.salario)) || Number(form.salario) < 0)) {
      err.salario = "El salario debe ser un número válido mayor o igual a 0";
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      await onSave({
        ...form,
        salario: form.salario ? Number(form.salario) : 0,
        idUsuario: form.idUsuario ? Number(form.idUsuario) : null
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Lista unificada de cargos base y existentes (sin cargos duplicados o sobrantes)
  const listaCargos = Array.from(
    new Set(["Administrador", "Cocinero", "Vendedor", ...cargosDisponibles, form.cargo])
  ).filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl border border-gray-100 dark:border-gray-700 my-8 overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 flex items-center justify-center font-bold">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {isEditing ? "Editar Empleado" : "Registrar Nuevo Empleado"}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Información del personal, rol en el sistema y desempeño de funciones en Chazin Food
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Vinculación con Usuario del Sistema y Roles */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/40">
            <div className="flex items-center justify-between gap-2 mb-2">
              <label className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Vincular con Usuario del Sistema (Roles Activos)</span>
              </label>
              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                Opcional
              </span>
            </div>
            <select
              value={form.idUsuario || ""}
              onChange={handleSelectUsuario}
              className="w-full px-3.5 py-2 rounded-xl border border-blue-200 dark:border-blue-800 text-sm outline-none bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30"
            >
              <option value="">-- Sin vincular (Empleado sin cuenta de sistema) --</option>
              {usuariosSistema.map((u) => {
                const rolLabel =
                  u.rol ||
                  u.rolNombre ||
                  (u.idRol === 1 ? "Administrador" : u.idRol === 2 ? "Cocinero" : u.idRol === 3 ? "Vendedor" : "Usuario");
                return (
                  <option key={u.idUsuario} value={u.idUsuario}>
                    {u.nombre} {u.apellidos || ""} — Rol: {rolLabel} ({u.email})
                  </option>
                );
              })}
            </select>
            <p className="text-[11px] text-blue-700/80 dark:text-blue-300/70 mt-1.5">
              Al seleccionar un usuario, sus datos personales y cargo se sincronizan automáticamente con su rol correspondiente.
            </p>
          </div>

          {/* Sección 1: Información Personal */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3 flex items-center gap-2">
              <User className="w-4 h-4" /> Datos Personales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Nombres */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Nombres <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Ej: Carlos Andrés"
                  className={`w-full px-3.5 py-2 rounded-xl border text-sm outline-none transition-all dark:bg-gray-700 dark:text-white ${
                    errors.nombre
                      ? "border-red-500 focus:ring-2 focus:ring-red-200"
                      : "border-gray-200 dark:border-gray-600 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30"
                  }`}
                />
                {errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre}</p>}
              </div>

              {/* Apellidos */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Apellidos <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="apellidos"
                  value={form.apellidos}
                  onChange={handleChange}
                  placeholder="Ej: Martínez Gómez"
                  className={`w-full px-3.5 py-2 rounded-xl border text-sm outline-none transition-all dark:bg-gray-700 dark:text-white ${
                    errors.apellidos
                      ? "border-red-500 focus:ring-2 focus:ring-red-200"
                      : "border-gray-200 dark:border-gray-600 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30"
                  }`}
                />
                {errors.apellidos && <p className="text-xs text-red-500 mt-1">{errors.apellidos}</p>}
              </div>

              {/* Tipo de Documento */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Tipo de Documento
                </label>
                <select
                  name="tipoDocumento"
                  value={form.tipoDocumento}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30 dark:bg-gray-700 dark:text-white"
                >
                  <option value="C.C.">Cédula de Ciudadanía (C.C.)</option>
                  <option value="C.E.">Cédula de Extranjería (C.E.)</option>
                  <option value="T.I.">Tarjeta de Identidad (T.I.)</option>
                  <option value="P.P.">Pasaporte (P.P.)</option>
                  <option value="P.E.P.">Permiso Especial (P.E.P.)</option>
                </select>
              </div>

              {/* Número de Documento */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Número de Documento <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="numeroDocumento"
                  value={form.numeroDocumento}
                  onChange={handleChange}
                  placeholder="Ej: 1020304050"
                  className={`w-full px-3.5 py-2 rounded-xl border text-sm outline-none transition-all dark:bg-gray-700 dark:text-white ${
                    errors.numeroDocumento
                      ? "border-red-500 focus:ring-2 focus:ring-red-200"
                      : "border-gray-200 dark:border-gray-600 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30"
                  }`}
                />
                {errors.numeroDocumento && <p className="text-xs text-red-500 mt-1">{errors.numeroDocumento}</p>}
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Teléfono / Celular
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    placeholder="Ej: 3109876543"
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Correo Electrónico */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="email"
                    name="correo"
                    value={form.correo}
                    onChange={handleChange}
                    placeholder="Ej: empleado@chazinfood.com"
                    className={`w-full pl-9 pr-3.5 py-2 rounded-xl border text-sm outline-none transition-all dark:bg-gray-700 dark:text-white ${
                      errors.correo
                        ? "border-red-500 focus:ring-2 focus:ring-red-200"
                        : "border-gray-200 dark:border-gray-600 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30"
                    }`}
                  />
                </div>
                {errors.correo && <p className="text-xs text-red-500 mt-1">{errors.correo}</p>}
              </div>

              {/* Dirección */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Dirección de Residencia
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    name="direccion"
                    value={form.direccion}
                    onChange={handleChange}
                    placeholder="Ej: Calle 45 # 12-34, Medellín"
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Sección 2: Desempeño y Funciones Laborales */}
          <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4" /> Desempeño y Funciones en el Negocio
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Cargo / Puesto (Escalable con selector y creación libre) */}
              <div className="md:col-span-2">
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
                    className="text-xs font-bold text-red-600 hover:text-red-700 dark:text-red-400 flex items-center gap-1 transition-colors"
                  >
                    {isCustomCargo ? (
                      <>
                        <List className="w-3.5 h-3.5" />
                        <span>Ver lista de cargos</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Crear nuevo cargo</span>
                      </>
                    )}
                  </button>
                </div>

                {isCustomCargo ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        name="cargo"
                        value={form.cargo}
                        onChange={handleChange}
                        autoFocus
                        placeholder="Escribe el nuevo cargo (Ej: Administrador, Cocinero, Vendedor, Cajero, Repartidor...)"
                        className={`w-full px-3.5 py-2 rounded-xl border text-sm outline-none transition-all dark:bg-gray-700 dark:text-white ${
                          errors.cargo
                            ? "border-red-500 focus:ring-2 focus:ring-red-200"
                            : "border-gray-200 dark:border-gray-600 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomCargo(false);
                          setForm((prev) => ({ ...prev, cargo: "Cocinero" }));
                        }}
                        className="px-3 py-2 text-xs font-semibold rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 shrink-0"
                      >
                        Cancelar
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-400">
                      Crea un nuevo cargo para escalar el personal de la empresa de forma independiente.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <select
                      name="cargo"
                      value={form.cargo}
                      onChange={(e) => {
                        if (e.target.value === "__CREAR_NUEVO__") {
                          setIsCustomCargo(true);
                          setForm((prev) => ({ ...prev, cargo: "" }));
                        } else {
                          handleChange(e);
                        }
                      }}
                      className={`w-full px-3.5 py-2 rounded-xl border text-sm outline-none transition-all dark:bg-gray-700 dark:text-white ${
                        errors.cargo
                          ? "border-red-500 focus:ring-2 focus:ring-red-200"
                          : "border-gray-200 dark:border-gray-600 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30"
                      }`}
                    >
                      {listaCargos.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                      <option value="__CREAR_NUEVO__">+ Crear nuevo cargo...</option>
                    </select>
                  </div>
                )}
                {errors.cargo && <p className="text-xs text-red-500 mt-1">{errors.cargo}</p>}
              </div>

              {/* Tipo de Contrato */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Tipo de Contrato
                </label>
                <select
                  name="tipoContrato"
                  value={form.tipoContrato}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30 dark:bg-gray-700 dark:text-white"
                >
                  <option value="Término Fijo">Término Fijo</option>
                  <option value="Término Indefinido">Término Indefinido</option>
                  <option value="Prestación de Servicios">Prestación de Servicios</option>
                  <option value="Aprendizaje SENA">Aprendizaje SENA</option>
                  <option value="Por Obra o Labor">Por Obra o Labor</option>
                </select>
              </div>

              {/* Turno / Horario */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Turno / Horario
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    name="turno"
                    value={form.turno}
                    onChange={handleChange}
                    placeholder="Ej: Completo / Mañana - Tarde / Tarde - Noche"
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Fecha de Contratación */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Fecha de Contratación / Ingreso
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="date"
                    name="fechaContratacion"
                    value={form.fechaContratacion}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Salario Mensual (COP) */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Salario Mensual (COP)
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="number"
                    name="salario"
                    value={form.salario}
                    onChange={handleChange}
                    placeholder="Ej: 1600000"
                    min="0"
                    step="50000"
                    className={`w-full pl-9 pr-3.5 py-2 rounded-xl border text-sm outline-none transition-all dark:bg-gray-700 dark:text-white ${
                      errors.salario
                        ? "border-red-500 focus:ring-2 focus:ring-red-200"
                        : "border-gray-200 dark:border-gray-600 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30"
                    }`}
                  />
                </div>
                {errors.salario && <p className="text-xs text-red-500 mt-1">{errors.salario}</p>}
              </div>

              {/* Estado */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Estado Operativo
                </label>
                <select
                  name="estado"
                  value={form.estado}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30 dark:bg-gray-700 dark:text-white"
                >
                  <option value={1}>Activo (En funciones)</option>
                  <option value={0}>Inactivo (Pausado)</option>
                </select>
              </div>

            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-md shadow-red-600/20 active:scale-95 disabled:opacity-50"
            >
              {submitting ? "Guardando..." : isEditing ? "Actualizar Empleado" : "Registrar Empleado"}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
