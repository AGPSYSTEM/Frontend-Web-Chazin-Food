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
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-12 text-center border border-gray-100 dark:border-gray-700">
        <Briefcase className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">No se encontraron empleados</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          No hay registros que coincidan con los criterios de búsqueda o filtros aplicados.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">
              <th className="py-3.5 px-4">Empleado</th>
              <th className="py-3.5 px-4">Documento</th>
              <th className="py-3.5 px-4">Cargo & Turno</th>
              <th className="py-3.5 px-4">Contacto</th>
              <th className="py-3.5 px-4">Salario</th>
              <th className="py-3.5 px-4">Estado</th>
              <th className="py-3.5 px-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
            {empleados.map((emp) => {
              const isActivo = emp.estado === 1 || emp.estado === "1" || emp.estado === "Activo";
              const initials = `${emp.nombre?.[0] || ""}${emp.apellidos?.[0] || ""}`.toUpperCase();

              return (
                <tr
                  key={emp.idEmpleado}
                  className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors"
                >
                  {/* Nombre y Avatar */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 flex items-center justify-center font-bold text-xs shrink-0 border border-red-200 dark:border-red-800">
                        {emp.foto ? (
                          <img
                            src={emp.foto}
                            alt={emp.nombre}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          initials || "EM"
                        )}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900 dark:text-white block leading-tight">
                          {emp.nombre} {emp.apellidos}
                        </span>
                        <span className="text-xs text-gray-400 block mt-0.5">
                          ID #{emp.idEmpleado} • {cleanMojibake(emp.tipoContrato) || "Término Fijo"}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Documento */}
                  <td className="py-3.5 px-4">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block">
                      {emp.tipoDocumento || "C.C."}
                    </span>
                    <span className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                      {emp.numeroDocumento || "-"}
                    </span>
                  </td>

                  {/* Cargo y Turno */}
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                      <Briefcase className="w-3 h-3" />
                      {emp.cargo}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      {cleanMojibake(emp.turno) || "Completo"}
                    </span>
                    {emp.usuario && (
                      <span
                        className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 mt-1 font-medium bg-blue-50/60 dark:bg-blue-900/20 px-1.5 py-0.5 rounded border border-blue-100 dark:border-blue-900/40"
                        title={`Vinculado a usuario #${emp.usuario.idUsuario} (${emp.usuario.email})`}
                      >
                        <ShieldCheck className="w-3 h-3 text-blue-500 shrink-0" />
                        <span className="truncate max-w-[130px]">Usuario #{emp.usuario.idUsuario}</span>
                      </span>
                    )}
                  </td>

                  {/* Contacto */}
                  <td className="py-3.5 px-4">
                    {emp.telefono && (
                      <span className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                        {emp.telefono}
                      </span>
                    )}
                    {emp.correo && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5 truncate max-w-[180px]">
                        <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                        {emp.correo}
                      </span>
                    )}
                    {!emp.telefono && !emp.correo && (
                      <span className="text-xs text-gray-400 italic">Sin contacto registrado</span>
                    )}
                  </td>

                  {/* Salario */}
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatMoney(emp.salario)}
                    </span>
                    <span className="text-[11px] text-gray-400 block">COP Mensual</span>
                  </td>

                  {/* Estado */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        isActivo
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                          : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isActivo ? "bg-emerald-500" : "bg-red-500"
                        }`}
                      />
                      {isActivo ? "Activo" : "Inactivo"}
                    </span>
                  </td>

                  {/* Acciones */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {/* Ver Detalle */}
                      <button
                        onClick={() => onView && onView(emp)}
                        title="Ver detalle del empleado"
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Editar */}
                      {canEdit && (
                        <button
                          onClick={() => onEdit && onEdit(emp)}
                          title="Editar empleado"
                          className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 dark:hover:text-amber-400 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}

                      {/* Cambiar Estado */}
                      {canEdit && (
                        <button
                          onClick={() => onToggleStatus && onToggleStatus(emp)}
                          title={isActivo ? "Desactivar empleado" : "Activar empleado"}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isActivo
                              ? "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                              : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
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
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 dark:hover:text-red-400 rounded-lg transition-colors"
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

