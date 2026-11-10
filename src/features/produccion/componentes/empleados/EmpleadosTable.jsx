import { Eye, Edit2, Trash2, Power, Briefcase, Phone, Mail, Clock, DollarSign, Calendar, ShieldCheck } from "lucide-react";

const cleanMojibake = (str) => {
  if (!str || typeof str !== "string") return str;
  return str
    .replace(/Ã¡/g, "á")
    .replace(/Ã©/g, "é")
    .replace(/Ã­/g, "í")
    .replace(/Ã³/g, "ó")
    .replace(/Ãº/g, "ú")
    .replace(/Ã±/g, "ñ")
    .replace(/Ã /g, "Á")
    .replace(/Ã‰/g, "É")
    .replace(/Ã /g, "Í")
    .replace(/Ã“/g, "Ó")
    .replace(/Ãš/g, "Ú")
    .replace(/Ã‘/g, "Ñ");
};

export function EmpleadosTable({
  empleados = [],
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
  canEdit = true,
  canDelete = true
}) {
  const formatMoney = (val) => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    }).format(num);
  };

  if (!empleados || empleados.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xs p-16 text-center border border-gray-100 dark:border-gray-800">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4 text-gray-400">
          <Briefcase className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-gray-900 dark:text-white">No se encontraron empleados</h3>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
          No hay registros que coincidan con los criterios de búsqueda o filtros aplicados actualmente.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 overflow-hidden w-full">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse table-auto">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/50 text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold">
              <th className="py-4 px-5 sm:px-6 w-[26%] min-w-[220px]">Empleado</th>
              <th className="py-4 px-5 sm:px-6 w-[14%] min-w-[130px]">Documento</th>
              <th className="py-4 px-5 sm:px-6 w-[20%] min-w-[180px]">Cargo & Turno</th>
              <th className="py-4 px-5 sm:px-6 w-[18%] min-w-[180px]">Contacto</th>
              <th className="py-4 px-5 sm:px-6 w-[12%] min-w-[130px]">Salario</th>
              <th className="py-4 px-5 sm:px-6 w-[10%] min-w-[100px]">Estado</th>
              <th className="py-4 px-5 sm:px-6 text-center min-w-[110px]">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
            {empleados.map((emp) => {
              const isActivo = emp.estado === 1 || emp.estado === "1" || emp.estado === "Activo";
              const initials = `${emp.nombre?.[0] || ""}${emp.apellidos?.[0] || ""}`.toUpperCase();

              return (
                <tr
                  key={emp.idEmpleado}
                  className="hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors"
                >
                  {/* Nombre y Avatar */}
                  <td className="py-4 px-5 sm:px-6">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400 flex items-center justify-center font-bold text-xs shrink-0 border border-red-200/60 dark:border-red-900/40 shadow-2xs">
                        {emp.foto ? (
                          <img
                            src={emp.foto}
                            alt={emp.nombre}
                            className="w-full h-full rounded-2xl object-cover"
                          />
                        ) : (
                          initials || "EM"
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 dark:text-white block leading-tight text-sm">
                          {emp.nombre} {emp.apellidos}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500 block mt-0.5">
                          ID #{emp.idEmpleado} • {cleanMojibake(emp.tipoContrato) || "Término Fijo"}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Documento */}
                  <td className="py-4 px-5 sm:px-6">
                    <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 block">
                      {emp.tipoDocumento || "C.C."}
                    </span>
                    <span className="font-bold text-gray-800 dark:text-gray-200 text-sm">
                      {emp.numeroDocumento || "-"}
                    </span>
                  </td>

                  {/* Cargo y Turno */}
                  <td className="py-4 px-5 sm:px-6">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/40 shadow-2xs">
                      <Briefcase className="w-3 h-3 text-blue-500" />
                      <span>{emp.cargo}</span>
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-1.5 font-medium">
                      <Clock className="w-3 h-3 text-gray-400 shrink-0" />
                      <span>{cleanMojibake(emp.turno) || "Completo"}</span>
                    </span>
                    {emp.usuario && (
                      <span
                        className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 mt-1 font-semibold bg-blue-50/60 dark:bg-blue-900/20 px-2 py-0.5 rounded-lg border border-blue-100 dark:border-blue-900/40"
                        title={`Vinculado a usuario #${emp.usuario.idUsuario} (${emp.usuario.email})`}
                      >
                        <ShieldCheck className="w-3 h-3 text-blue-500 shrink-0" />
                        <span>Usuario #{emp.usuario.idUsuario}</span>
                      </span>
                    )}
                  </td>

                  {/* Contacto */}
                  <td className="py-4 px-5 sm:px-6">
                    {emp.telefono && (
                      <span className="text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1.5 font-medium">
                        <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{emp.telefono}</span>
                      </span>
                    )}
                    {emp.correo && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-1 truncate max-w-[220px]">
                        <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{emp.correo}</span>
                      </span>
                    )}
                    {!emp.telefono && !emp.correo && (
                      <span className="text-xs text-gray-400 italic">Sin contacto registrado</span>
                    )}
                  </td>

                  {/* Salario */}
                  <td className="py-4 px-5 sm:px-6">
                    <span className="font-bold text-gray-900 dark:text-white text-sm block">
                      {formatMoney(emp.salario)}
                    </span>
                    <span className="text-[11px] text-gray-400 block font-medium">COP Mensual</span>
                  </td>

                  {/* Estado */}
                  <td className="py-4 px-5 sm:px-6">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold ${
                        isActivo
                          ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800"
                          : "bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300 border border-red-200/70 dark:border-red-800"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isActivo ? "bg-emerald-500" : "bg-red-500"
                        }`}
                      />
                      <span>{isActivo ? "Activo" : "Inactivo"}</span>
                    </span>
                  </td>

                  {/* Acciones */}
                  <td className="py-4 px-5 sm:px-6 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Ver Detalle */}
                      <button
                        onClick={() => onView && onView(emp)}
                        title="Ver detalle del empleado"
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 rounded-xl transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Editar */}
                      {canEdit && (
                        <button
                          onClick={() => onEdit && onEdit(emp)}
                          title="Editar empleado"
                          className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 dark:hover:text-amber-400 rounded-xl transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}

                      {/* Cambiar Estado */}
                      {canEdit && (
                        <button
                          onClick={() => onToggleStatus && onToggleStatus(emp)}
                          title={isActivo ? "Desactivar empleado" : "Activar empleado"}
                          className={`p-2 rounded-xl transition-colors cursor-pointer ${
                            isActivo
                              ? "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                              : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                          }`}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      )}

                      {/* Eliminar */}
                      {canDelete && (
                        <button
                          onClick={() => onDelete && onDelete(emp)}
                          title="Eliminar empleado"
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 dark:hover:text-red-400 rounded-xl transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
