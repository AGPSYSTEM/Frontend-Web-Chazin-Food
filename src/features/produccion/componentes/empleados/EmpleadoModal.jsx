import { useState, useEffect } from "react";
import { X, User, Briefcase, Phone, Mail, MapPin, DollarSign, Calendar, Clock, FileText } from "lucide-react";

export function EmpleadoModal({ isOpen, onClose, onSave, empleado = null }) {
  const isEditing = Boolean(empleado);

  const initialForm = {
    nombre: "",
    apellidos: "",
    tipoDocumento: "C.C.",
    numeroDocumento: "",
    telefono: "",
    correo: "",
    direccion: "",
    cargo: "Auxiliar de Cocina",
    fechaContratacion: new Date().toISOString().split("T")[0],
    tipoContrato: "Término Fijo",
    salario: "",
    turno: "Completo",
    estado: 1
  };

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (empleado) {
      setForm({
        nombre: empleado.nombre || "",
        apellidos: empleado.apellidos || "",
        tipoDocumento: empleado.tipoDocumento || "C.C.",
        numeroDocumento: empleado.numeroDocumento || "",
        telefono: empleado.telefono || "",
        correo: empleado.correo || "",
        direccion: empleado.direccion || "",
        cargo: empleado.cargo || "Auxiliar de Cocina",
        fechaContratacion: empleado.fechaContratacion
          ? new Date(empleado.fechaContratacion).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        tipoContrato: empleado.tipoContrato || "Término Fijo",
        salario: empleado.salario !== undefined ? String(empleado.salario) : "",
        turno: empleado.turno || "Completo",
        estado: empleado.estado !== undefined ? Number(empleado.estado) : 1
      });
    } else {
      setForm(initialForm);
    }
    setErrors({});
  }, [empleado, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const err = {};
    if (!form.nombre.trim()) err.nombre = "El nombre es obligatorio";
    if (!form.apellidos.trim()) err.apellidos = "Los apellidos son obligatorios";
    if (!form.numeroDocumento.trim()) err.numeroDocumento = "El número de documento es obligatorio";
    if (!form.cargo.trim()) err.cargo = "El cargo o función es obligatorio";

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
        salario: form.salario ? Number(form.salario) : 0
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

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
                Información del personal y desempeño de funciones en Chazin Food
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
                  Tipo de Documento <span className="text-red-500">*</span>
                </label>
                <select
                  name="tipoDocumento"
                  value={form.tipoDocumento}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30 dark:bg-gray-700 dark:text-white"
                >
                  <option value="C.C.">Cédula de Ciudadanía (C.C.)</option>
                  <option value="T.I.">Tarjeta de Identidad (T.I.)</option>
                  <option value="C.E.">Cédula de Extranjería (C.E.)</option>
                  <option value="PPT">Permiso por Protección Temporal (PPT)</option>
                  <option value="PASAPORTE">Pasaporte</option>
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

              {/* Cargo / Puesto */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Cargo o Puesto <span className="text-red-500">*</span>
                </label>
                <select
                  name="cargo"
                  value={form.cargo}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30 dark:bg-gray-700 dark:text-white"
                >
                  <option value="Cocinero Principal">Cocinero Principal</option>
                  <option value="Auxiliar de Cocina">Auxiliar de Cocina</option>
                  <option value="Cajera / Vendedora">Cajera / Vendedora</option>
                  <option value="Mesero / Atención al Cliente">Mesero / Atención al Cliente</option>
                  <option value="Domiciliario">Domiciliario</option>
                  <option value="Administrador de Turno">Administrador de Turno</option>
                  <option value="Personal de Limpieza y Apoyo">Personal de Limpieza y Apoyo</option>
                </select>
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
                    placeholder="Ej: Tarde - Noche / Rotativo"
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
                    step="1000"
                    className={`w-full pl-9 pr-3.5 py-2 rounded-xl border text-sm outline-none transition-all dark:bg-gray-700 dark:text-white ${
                      errors.salario
                        ? "border-red-500 focus:ring-2 focus:ring-red-200"
                        : "border-gray-200 dark:border-gray-600 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30"
                    }`}
                  />
                </div>
                {errors.salario && <p className="text-xs text-red-500 mt-1">{errors.salario}</p>}
              </div>

              {/* Estado Inicial */}
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
                  <option value="1">Activo (En funciones)</option>
                  <option value="0">Inactivo (Suspendido / Vacaciones)</option>
                </select>
              </div>

            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/20 transition-all disabled:opacity-50"
            >
              {submitting ? "Guardando..." : isEditing ? "Actualizar Empleado" : "Registrar Empleado"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

