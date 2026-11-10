import { X, User, Briefcase, Phone, Mail, MapPin, DollarSign, Calendar, Clock, ShieldCheck, CheckCircle2, XCircle } from "lucide-react";

export function VerEmpleadoModal({ isOpen, onClose, empleado }) {
  if (!isOpen || !empleado) return null;

  const isActivo = empleado.estado === 1 || empleado.estado === "1" || empleado.estado === "Activo";
  const initials = `${empleado.nombre?.[0] || ""}${empleado.apellidos?.[0] || ""}`.toUpperCase();

  const formatMoney = (val) => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    }).format(num);
  };

  const formatDate = (d) => {
    if (!d) return "No registrada";
    try {
      const date = new Date(d);
      return date.toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    } catch {
      return String(d);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-xl border border-gray-100 dark:border-gray-700 my-8 overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {/* Banner de Cabecera con Avatar */}
        <div className="relative bg-gradient-to-r from-red-600 to-rose-700 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white text-red-600 flex items-center justify-center font-extrabold text-xl shadow-lg shrink-0">
              {empleado.foto ? (
                <img
                  src={empleado.foto}
                  alt={empleado.nombre}
                  className="w-full h-full rounded-2xl object-cover"
                />
              ) : (
                initials || "EM"
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm uppercase tracking-wider">
                  ID #{empleado.idEmpleado}
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    isActivo ? "bg-emerald-500/90 text-white" : "bg-red-900/80 text-white"
                  }`}
                >
                  {isActivo ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  {isActivo ? "Activo" : "Inactivo"}
                </span>
              </div>
              <h2 className="text-xl font-bold mt-1 leading-tight">
                {empleado.nombre} {empleado.apellidos}
              </h2>
              <p className="text-sm text-red-100 flex items-center gap-1 mt-0.5">
                <Briefcase className="w-3.5 h-3.5" />
                {empleado.cargo}
              </p>
            </div>
          </div>
        </div>

        {/* Contenido en Rejilla */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* Bloque 1: Información Personal */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-red-500" /> Datos Personales
            </h3>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700/60 text-sm">
              <div>
                <span className="text-xs text-gray-400 block">Tipo & Documento</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {empleado.tipoDocumento || "C.C."} {empleado.numeroDocumento}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">Teléfono de Contacto</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  {empleado.telefono || "No registrado"}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-xs text-gray-400 block">Correo Electrónico</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1 truncate">
                  <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  {empleado.correo || "No registrado"}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-xs text-gray-400 block">Dirección</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  {empleado.direccion || "No registrada"}
                </span>
              </div>
            </div>
          </div>

          {/* Bloque 2: Desempeño y Funciones Laborales */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-red-500" /> Desempeño de Funciones
            </h3>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700/60 text-sm">
              <div>
                <span className="text-xs text-gray-400 block">Cargo Asignado</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {empleado.cargo}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">Tipo de Contrato</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {empleado.tipoContrato || "Término Fijo"}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">Turno / Horario</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  {empleado.turno || "Completo"}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">Fecha de Ingreso</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  {formatDate(empleado.fechaContratacion)}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-xs text-gray-400 block">Salario Mensual</span>
                <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400">
                  {formatMoney(empleado.salario)} <span className="text-xs font-normal text-gray-400">COP</span>
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}

