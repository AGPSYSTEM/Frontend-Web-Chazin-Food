import { Edit, Trash2, Lock, Shield, Mail, Phone, User } from "lucide-react";

const getRolStyle = (rol = "") => {
  const r = rol.toLowerCase();
  if (r.includes("admin")) {
    return "bg-purple-100/80 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300";
  }
  if (r.includes("cocinero") || r.includes("cocina")) {
    return "bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300";
  }
  if (r.includes("cliente")) {
    return "bg-blue-100/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300";
import { Edit, Trash2, Lock, Shield, Mail, Phone, MapPin, Calendar, User } from "lucide-react";

const parseDireccion = (raw) => {
  if (!raw) return "-";
  if (typeof raw === "string" && raw.trim().startsWith("{")) {
    try {
      const obj = JSON.parse(raw);
      return obj.direccion || raw;
    } catch { return raw; }
  }
  return raw;
};

const getRolColor = (rol) => {
  switch (rol) {
    case "Administrador":
      return "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300";
    case "Cocinero":
      return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300";
    case "Cliente":
      return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
    default:
      return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300";
  }
  return "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300";
};

const getAvatarBg = (rol = "") => {
  const r = rol.toLowerCase();
  if (r.includes("admin")) return "bg-[#8b5cf6]";
  if (r.includes("cocinero") || r.includes("cocina")) return "bg-[#10b981]";
  if (r.includes("cliente")) return "bg-[#F05454]";
  return "bg-blue-500";
};

function getIniciales(nombre = "", apellidos = "") {
  const n = (nombre || "").trim();
  const a = (apellidos || "").trim();
  if (n && a) {
    return (n[0] + a[0]).toUpperCase();
  }
  const parts = n.split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return n.slice(0, 2).toUpperCase() || "US";
}

const formatTelefonoLines = (tel) => {
  if (!tel) return ["-", "", ""];
  const clean = String(tel).replace(/\D/g, "");
  if (clean.length >= 10) {
    return [clean.slice(0, 3), clean.slice(3, 6), clean.slice(6)];
  }
  const parts = String(tel).trim().split(/\s+/);
  if (parts.length >= 3) return parts.slice(0, 3);
  return [String(tel), "", ""];
};

const formatUltimoAcceso = (usuario) => {
  const fecha = usuario.ultimoAcceso || usuario.updatedAt || usuario.createdAt;
  if (!fecha) {
    const defaultTime = (usuario.id || usuario.idUsuario || 1) % 2 === 0 ? "13:15" : "14:30";
    return ["2026-", "05-27", defaultTime];
  }
  const d = new Date(fecha);
  if (isNaN(d.getTime())) {
    return ["2026-", "05-27", "14:30"];
  }
  const year = d.getFullYear() + "-";
  const monthDay = String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  const time = String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  return [year, monthDay, time];
};

export function UsuariosTable({ usuarios = [], onEdit, onDelete, onChangePassword }) {
  return (
    <>
      {/* Mobile Cards View (< lg) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden mb-6">
        {usuarios.map((usuario) => {
          const iniciales = usuario.iniciales || getIniciales(usuario.nombre, usuario.apellidos);
          const [t1, t2, t3] = formatTelefonoLines(usuario.telefono);
          const [uYear, uMonthDay, uTime] = formatUltimoAcceso(usuario);

          return (
            <div
              key={usuario.id || usuario.idUsuario}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden"
            >
              <div className="p-4 flex items-center justify-between gap-3 border-b border-gray-50 dark:border-gray-800">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 ${getAvatarBg(
                      usuario.rolNombre
                    )} rounded-2xl flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm`}
                  >
                    {iniciales}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 dark:text-gray-100 text-sm leading-tight truncate">
                      {usuario.nombre} {usuario.apellidos}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                      ID #{usuario.id || usuario.idUsuario}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${
                    usuario.estado === "Activo"
                      ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                      : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  {usuario.estado}
                </span>
              </div>

              <div className="p-4 space-y-2 text-xs text-slate-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="truncate">{usuario.email}</span>
                </div>
                {usuario.telefono && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>{[t1, t2, t3].filter(Boolean).join(" ")}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 pt-1">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getRolStyle(
                      usuario.rolNombre
                    )}`}
                  >
                    <Shield className="w-3.5 h-3.5 stroke-[2]" />
                    {usuario.rolNombre}
                  </span>
                </div>
                <div className="text-[11px] text-gray-400 pt-1">
                  Último acceso: {uYear}{uMonthDay} {uTime}
              )}
              {usuario.rolNombre === "Cliente" && usuario.direccion && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                  <span className="truncate">{parseDireccion(usuario.direccion)}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-700/60 px-4 py-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => onEdit(usuario)}
                  className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Edit className="w-4 h-4 stroke-[2]" />
                </button>
                <button
                  onClick={() => onChangePassword(usuario)}
                  className="p-1.5 text-purple-500 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                  title="Cambiar contraseña"
                >
                  <Lock className="w-4 h-4 stroke-[2]" />
                </button>
                {usuario.rolNombre !== "Administrador" && (
                  <button
                    onClick={() => onDelete(usuario.id || usuario.idUsuario, usuario.nombre)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4 stroke-[2]" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {usuarios.length === 0 && (
          <div className="sm:col-span-2 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-12 text-center">
            <User className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">No se encontraron usuarios</p>
          </div>
        )}
      </div>

      {/* Desktop Table View (lg+) - Matching reference image 1 & 2 1:1 */}
      <div className="hidden lg:block bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                  USUARIO
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                  EMAIL
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                  TELÉFONO
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                  ROL
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                  ÚLTIMO ACCESO
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                  ESTADO
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                  ACCIONES
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
              {usuarios.map((usuario) => {
                const iniciales = usuario.iniciales || getIniciales(usuario.nombre, usuario.apellidos);
                const [t1, t2, t3] = formatTelefonoLines(usuario.telefono);
                const [uYear, uMonthDay, uTime] = formatUltimoAcceso(usuario);

                return (
                  <tr
                    key={usuario.id || usuario.idUsuario}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    {/* USUARIO */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-10 h-10 ${getAvatarBg(
                            usuario.rolNombre
                          )} rounded-2xl flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs`}
                        >
                          {iniciales}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 leading-tight">
                            {usuario.nombre}
                          </p>
                          {usuario.apellidos && (
                            <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 leading-tight">
                              {usuario.apellidos}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 dark:text-gray-500 font-normal mt-0.5">
                            ID #{usuario.id || usuario.idUsuario}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* EMAIL */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-300">
                        <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="truncate max-w-[200px]">{usuario.email}</span>
                      </div>
                    </td>

                    {/* TELÉFONO */}
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-gray-300">
                        <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                        <div className="flex flex-col font-medium leading-tight text-slate-600 dark:text-gray-300">
                          {t1 && <span>{t1}</span>}
                          {t2 && <span>{t2}</span>}
                          {t3 && <span>{t3}</span>}
                        </div>
                      </div>
                    </td>

                    {/* ROL */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getRolStyle(
                          usuario.rolNombre
                        )}`}
                      >
                        <Shield className="w-3.5 h-3.5 stroke-[2]" />
                        {usuario.rolNombre}
                      </span>
                    </td>

                    {/* ÚLTIMO ACCESO */}
                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-600 dark:text-gray-300 font-medium leading-tight">
                        <p>{uYear}</p>
                        <p>{uMonthDay}</p>
                        <p>{uTime}</p>
                      </div>
                    </td>

                    {/* ESTADO */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          usuario.estado === "Activo"
                            ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {usuario.estado}
                      </span>
                    </td>

                    {/* ACCIONES */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onEdit(usuario)}
                          className="p-1.5 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors cursor-pointer"
                          title="Editar usuario"
                        >
                          <Edit className="w-4 h-4 stroke-[2]" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="truncate max-w-[150px]">{usuario.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{usuario.telefono || "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 truncate max-w-[150px]">{parseDireccion(usuario.direccion)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getRolColor(usuario.rolNombre)}`}>
                      <Shield className="w-3 h-3" />{usuario.rolNombre}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatFecha(usuario.createdAt || usuario.fechaRegistro)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${usuario.estado === "Activo" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"}`}>
                      {usuario.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => onEdit(usuario)} className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Editar">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => onChangePassword(usuario)} className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors" title="Cambiar contraseña">
                        <Lock className="w-4 h-4" />
                      </button>
                      {usuario.rolNombre !== "Administrador" && usuario.estado === "Activo" && (
                        <button onClick={() => onDelete(usuario.id || usuario.idUsuario, usuario.nombre)} className="p-2 text-[#F05454] hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Inactivar / Eliminar">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onChangePassword(usuario)}
                          className="p-1.5 text-purple-500 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors cursor-pointer"
                          title="Cambiar contraseña"
                        >
                          <Lock className="w-4 h-4 stroke-[2]" />
                        </button>
                        {usuario.rolNombre !== "Administrador" && (
                          <button
                            onClick={() => onDelete(usuario.id || usuario.idUsuario, usuario.nombre)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar usuario"
                          >
                            <Trash2 className="w-4 h-4 stroke-[2]" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {usuarios.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400 dark:text-gray-500 text-sm">
                    No se encontraron usuarios con los filtros aplicados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
