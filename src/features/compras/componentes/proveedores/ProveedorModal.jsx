import { useState, useEffect } from "react";
import { X, Building, User } from "lucide-react";

const TIPOS_PROVEEDOR = [
  { id: 1, nombre: "Mayorista" },
  { id: 2, nombre: "Distribuidor" },
  { id: 3, nombre: "Fabricante" }
];

const getInputCls = (hasError) =>
  `w-full px-4 py-2 border rounded-xl focus:ring-2 focus:border-transparent transition-colors text-sm dark:bg-gray-800 dark:text-gray-100 ${
    hasError
      ? "border-red-500 focus:ring-red-400 bg-red-50 dark:bg-red-950/30"
      : "border-gray-200 dark:border-gray-700 focus:ring-[#F05454]"
  }`;

const labelCls = "block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1";

const errorMsgCls = "text-xs text-red-500 mt-1 font-medium flex items-center gap-1";

export function ProveedorModal({ isOpen, onClose, onSave, proveedor = null }) {
  const isEditing = !!proveedor;

  const [form, setForm] = useState({
    tipoPersona: "Jurídica", // "Jurídica" | "Natural"
    idTipoProveedor: 1, // 1: Mayorista, 2: Distribuidor, 3: Fabricante
    tipoProveedor: "Mayorista",
    idTipoDocumento: 3, // 3: NIT, 1: CC, 2: CE, 4: Pasaporte
    nombre: "",
    nit: "",
    contacto: "",
    email: "",
    telefono: "",
    direccion: "",
    estado: "Activo",
  });

  // Errores por campo
  const [errors, setErrors] = useState({});
  // Si el usuario ya intentó enviar
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (proveedor) {
      const isJuridica = proveedor.tipoPersona === "Jurídica" || proveedor.idTipoDocumento === 3;
      let parsedTipoProv = Number(proveedor.idTipoProveedor);
      if (!parsedTipoProv || isNaN(parsedTipoProv)) {
        if (proveedor.tipoProveedor === "Distribuidor") parsedTipoProv = 2;
        else if (proveedor.tipoProveedor === "Fabricante") parsedTipoProv = 3;
        else parsedTipoProv = 1;
      }

      setForm({
        tipoPersona: isJuridica ? "Jurídica" : "Natural",
        idTipoProveedor: parsedTipoProv,
        tipoProveedor: proveedor.tipoProveedor || (parsedTipoProv === 2 ? "Distribuidor" : parsedTipoProv === 3 ? "Fabricante" : "Mayorista"),
        idTipoDocumento: proveedor.idTipoDocumento || (isJuridica ? 3 : 1),
        nombre: proveedor.nombre || "",
        nit: proveedor.nit || proveedor.numeroDocumento || "",
        contacto: proveedor.contacto || proveedor.nombreContacto || "",
        email: proveedor.email || proveedor.correo || "",
        telefono: proveedor.telefono || "",
        direccion: proveedor.direccion || "",
        estado: proveedor.estado || "Activo",
      });
    } else {
      setForm({
        tipoPersona: "Jurídica",
        idTipoProveedor: 1,
        tipoProveedor: "Mayorista",
        idTipoDocumento: 3,
        nombre: "",
        nit: "",
        contacto: "",
        email: "",
        telefono: "",
        direccion: "",
        estado: "Activo",
      });
    }
    setErrors({});
    setSubmitted(false);
  }, [proveedor, isOpen]);

  if (!isOpen) return null;

  // ── Validaciones individuales ───────────────────────────────────────────────

  const validate = (fields) => {
    const errs = {};
    const esJuridica = fields.tipoPersona === "Jurídica";

    // Nombre requerido
    if (!fields.nombre.trim()) {
      errs.nombre = esJuridica
        ? "El nombre / razón social es obligatorio."
        : "El nombre completo es obligatorio.";
    }

    // Documento/NIT: solo dígitos, puntos y guiones, y requerido
    if (!fields.nit.trim()) {
      errs.nit = esJuridica
        ? "El NIT es obligatorio."
        : "El número de documento es obligatorio.";
    } else if (!/^[\d.\-]+$/.test(fields.nit.trim())) {
      errs.nit = "Solo se permiten números, puntos (.) y guiones (-).";
    }

    // Contacto: Obligatorio para Persona Jurídica, Opcional para Persona Natural
    if (esJuridica && !fields.contacto.trim()) {
      errs.contacto = "La persona de contacto es obligatoria para empresas.";
    } else if (fields.contacto.trim() && /\d/.test(fields.contacto)) {
      errs.contacto = "El nombre de contacto no puede contener números.";
    }

    // Teléfono: solo dígitos, espacios y +, requerido
    if (!fields.telefono.trim()) {
      errs.telefono = "El teléfono / celular es obligatorio.";
    } else if (!/^[\d\s+\-()]+$/.test(fields.telefono.trim())) {
      errs.telefono = "Solo se permiten números en el teléfono.";
    }

    return errs;
  };

  const handleTipoPersonaChange = (nuevoTipo) => {
    const newForm = {
      ...form,
      tipoPersona: nuevoTipo,
      idTipoDocumento: nuevoTipo === "Jurídica" ? 3 : 1
    };
    setForm(newForm);
    if (submitted) setErrors(validate(newForm));
  };

  // ── Manejadores de cambio con filtrado en tiempo real ──────────────────────

  const handleNitChange = (e) => {
    const value = e.target.value.replace(/[^0-9.\-]/g, "");
    const newForm = { ...form, nit: value };
    setForm(newForm);
    if (submitted) setErrors(validate(newForm));
  };

  const handleContactoChange = (e) => {
    const value = e.target.value.replace(/[0-9]/g, "");
    const newForm = { ...form, contacto: value };
    setForm(newForm);
    if (submitted) setErrors(validate(newForm));
  };

  const handleTelefonoChange = (e) => {
    const value = e.target.value.replace(/[^0-9\s+\-()]/g, "");
    const newForm = { ...form, telefono: value };
    setForm(newForm);
    if (submitted) setErrors(validate(newForm));
  };

  const handleGenericChange = (field) => (e) => {
    const newForm = { ...form, [field]: e.target.value };
    setForm(newForm);
    if (submitted) setErrors(validate(newForm));
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    const errs = validate(form);
    setErrors(errs);

    if (Object.keys(errs).length > 0) return;

    onSave({
      ...form,
      numeroDocumento: form.nit,
      nombreContacto: form.contacto,
      correo: form.email,
    });
  };

  const esJuridica = form.tipoPersona === "Jurídica";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-[#F05454]" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {isEditing ? "Editar Proveedor" : "Nuevo Proveedor"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Switch / Selector Tipo de Persona */}
            <div className="sm:col-span-2 flex flex-col gap-1">
              <label className={labelCls}>Tipo de Persona</label>
              <div className="grid grid-cols-2 gap-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-xl">
                <button
                  type="button"
                  onClick={() => handleTipoPersonaChange("Jurídica")}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    esJuridica
                      ? "bg-white dark:bg-gray-900 text-[#F05454] shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                  }`}
                >
                  <Building className="w-4 h-4" />
                  <span>Persona Jurídica (Empresa)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTipoPersonaChange("Natural")}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    !esJuridica
                      ? "bg-white dark:bg-gray-900 text-[#F05454] shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Persona Natural</span>
                </button>
              </div>
            </div>

            {/* Nombre */}
            <div className="sm:col-span-2">
              <label className={labelCls}>
                {esJuridica ? "Razón Social / Nombre Empresa" : "Nombre Completo"}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.nombre}
                onChange={handleGenericChange("nombre")}
                className={getInputCls(!!errors.nombre)}
                placeholder={esJuridica ? "Ej. Distribuidora Avícola S.A.S." : "Ej. Juan Carlos Pérez"}
              />
              {errors.nombre && (
                <p className={errorMsgCls}>
                  <span>⚠</span> {errors.nombre}
                </p>
              )}
            </div>

            {/* Tipo de Proveedor (3 variantes DB) */}
            <div>
              <label className={labelCls}>
                Tipo de Proveedor <span className="text-red-500">*</span>
              </label>
              <select
                value={form.idTipoProveedor}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  const tpObj = TIPOS_PROVEEDOR.find((t) => t.id === val);
                  const newForm = {
                    ...form,
                    idTipoProveedor: val,
                    tipoProveedor: tpObj?.nombre || "Mayorista"
                  };
                  setForm(newForm);
                  if (submitted) setErrors(validate(newForm));
                }}
                className={getInputCls(false)}
              >
                {TIPOS_PROVEEDOR.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* NIT / Documento */}
            <div>
              <label className={labelCls}>
                {esJuridica ? "NIT (Número de Identificación Tributaria)" : "Número de Documento / Cédula"}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={form.nit}
                onChange={handleNitChange}
                className={getInputCls(!!errors.nit)}
                placeholder={esJuridica ? "Ej. 900.123.456-7" : "Ej. 1043673457"}
              />
              {errors.nit && (
                <p className={errorMsgCls}>
                  <span>⚠</span> {errors.nit}
                </p>
              )}
            </div>

            {/* Persona de Contacto */}
            <div>
              <label className={labelCls}>
                Persona de Contacto {esJuridica ? <span className="text-red-500">*</span> : <span className="text-gray-400 font-normal">(Opcional)</span>}
              </label>
              <input
                type="text"
                value={form.contacto}
                onChange={handleContactoChange}
                className={getInputCls(!!errors.contacto)}
                placeholder="Ej. Carlos Mendoza"
              />
              {errors.contacto && (
                <p className={errorMsgCls}>
                  <span>⚠</span> {errors.contacto}
                </p>
              )}
            </div>

            {/* Teléfono / Celular */}
            <div>
              <label className={labelCls}>
                Teléfono / Celular <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                inputMode="tel"
                value={form.telefono}
                onChange={handleTelefonoChange}
                className={getInputCls(!!errors.telefono)}
                placeholder="Ej. 310 987 6543"
              />
              {errors.telefono && (
                <p className={errorMsgCls}>
                  <span>⚠</span> {errors.telefono}
                </p>
              )}
            </div>

            {/* Correo Electrónico */}
            <div>
              <label className={labelCls}>Correo Electrónico</label>
              <input
                type="email"
                value={form.email}
                onChange={handleGenericChange("email")}
                className={getInputCls(false)}
                placeholder="contacto@empresa.com"
              />
            </div>

            {/* Dirección */}
            <div>
              <label className={labelCls}>Dirección</label>
              <input
                type="text"
                value={form.direccion}
                onChange={handleGenericChange("direccion")}
                className={getInputCls(false)}
                placeholder="Ej. Av. Central #12-34"
              />
            </div>

            {/* Estado */}
            <div className="sm:col-span-2">
              <label className={labelCls}>Estado</label>
              <select
                value={form.estado}
                onChange={handleGenericChange("estado")}
                className={getInputCls(false)}
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>

          {/* Hint campos requeridos */}
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Los campos marcados con <span className="text-red-500 font-bold">*</span> son obligatorios.
          </p>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium text-white bg-[#F05454] hover:bg-[#d84343] rounded-xl transition-colors shadow-md"
            >
              {isEditing ? "Guardar Cambios" : "Crear Proveedor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
