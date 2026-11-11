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
  CheckCircle2,
  XCircle,
  Activity,
  AlertCircle
} from "lucide-react";

export function VerEmpleadoModal({ isOpen, onClose, empleado }) {
  if (!isOpen || !empleado) return null;

  const initials = `${empleado.nombre?.[0] || ""}${empleado.apellidos?.[0] || ""}`.toUpperCase();

  const estadoStr = empleado.estado || (empleado.estado === 0 ? "Inactivo" : "Activo");
  const isActivo = estadoStr === "Activo";
  const isIncapacitado = estadoStr === "Incapacitado";
  const isInactivo = estadoStr === "Inactivo";

  const rolDisplay = empleado.rol || empleado.cargo || "Cocinero";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-xl border border-gray-100 dark:border-gray-700 my-8 overflow-hidden transition-all">
        
        {/* Banner de Cabecera con Avatar y Rol */}
        <div className="relative bg-gradient-to-r from-red-600 to-rose-700 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
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
                {isIncapacitado ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/90 text-white">
                    <Activity className="w-3.5 h-3.5" /> Incapacitado
                  </span>
                ) : isActivo ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/90 text-white">
                    <CheckCircle2 className="w-3 h-3" /> Activo
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-gray-600/90 text-white">
                    <XCircle className="w-3 h-3" /> Inactivo
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold mt-1 leading-tight">
                {empleado.nombre} {empleado.apellidos}
              </h2>
              <p className="text-sm text-red-100 flex items-center gap-1 mt-0.5 font-medium">
                <Briefcase className="w-3.5 h-3.5" />
                Rol: {rolDisplay}
              </p>
            </div>
          </div>
        </div>

        {/* Contenido en Rejilla */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          
          {/* Bloque 1: Documento de Identidad y Datos Personales (DE PRIMERO) */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2.5 flex items-center gap-2">
              <User className="w-4 h-4 text-red-500" /> Identificación y Contacto
            </h3>
            <div className="grid grid-cols-2 gap-3.5 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/60 text-sm">
              <div className="col-span-2 sm:col-span-1 p-2.5">
                <span className="text-xs text-gray-400 block">Documento de Identidad</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200 block mt-0.5">
                  {empleado.tipoDocumento || "C.C."} {empleado.numeroDocumento}
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1 p-2.5">
                <span className="text-xs text-gray-400 block">Teléfono de Contacto</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  {empleado.telefono || "No registrado"}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-xs text-gray-400 block">Correo Electrónico</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1 truncate mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  {empleado.correo || "No registrado"}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-xs text-gray-400 block">Dirección de Residencia</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  {empleado.direccion || "No registrada"}
                </span>
              </div>
            </div>
          </div>

          {/* Bloque 2: Rol, Turno y Contratación */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2.5 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-red-500" /> Condiciones de Contratación y Rol
            </h3>
            <div className="grid grid-cols-2 gap-3.5 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/60 text-sm">
              <div>
                <span className="text-xs text-gray-400 block">Rol Asignado</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5 block">
                  {rolDisplay}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">Tipo de Contrato</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5 block">
                  {empleado.tipoContrato || "Término Fijo"}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">Turno / Horario</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  {empleado.turno || "Completo"}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">Fecha de Inicio</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  {formatDate(empleado.fechaInicio || empleado.fechaContratacion)}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">Fecha de Finalización</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  {empleado.fechaFin ? formatDate(empleado.fechaFin) : "Indefinido"}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">Salario Mensual</span>
                <span className="font-bold text-base text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                  {formatMoney(empleado.salario)} <span className="text-xs font-normal text-gray-400">COP</span>
                </span>
              </div>
              {empleado.contratoVencido && (
                <div className="col-span-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-1.5 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Este empleado tiene su fecha de contrato vencida.</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
