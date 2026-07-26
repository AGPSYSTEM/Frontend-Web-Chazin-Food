import { Edit, Trash2, Lock, Shield, Mail, Phone, MapPin, Calendar, User } from "lucide-react";

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
};

const getAvatarGradient = (rol) => {
  switch (rol) {
    case "Administrador":
      return "from-purple-500 to-purple-700";
    case "Cocinero":
      return "from-green-500 to-green-700";
    case "Cliente":
      return "from-[#F05454] to-[#c0392b]";
    default:
      return "from-gray-500 to-gray-700";
  }
};

const formatFecha = (fecha) => {
  if (!fecha) return "-";
  return new Date(fecha).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
};

export function UsuariosTable({ usuarios = [], onEdit, onDelete, onChangePassword }) {
  return (
    <>
      {/* Mobile Cards View (< lg) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden mb-6">
        {usuarios.map((usuario) => (
          <div key={usuario.id || usuario.idUsuario} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden">
            <div className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 bg-gradient-to-br ${getAvatarGradient(usuario.rolNombre)} rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm`}>
                  {usuario.iniciales}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">{usuario.nombre} {usuario.apellidos}</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold">{usuario.tipoDocumento || "C.C."}: {usuario.documento || usuario.idUsuario}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${usuario.estado === "Activo" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"}`}>
                {usuario.estado}
              </span>
            </div>
            <div className="px-4 pb-3 space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                <span className="truncate">{usuario.email}</span>
              </div>
              {usuario.telefono && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                  <span>{usuario.telefono}</span>
                </div>
              )}
              {usuario.rolNombre === "Cliente" && usuario.direccion && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                  <span className="truncate">{usuario.direccion}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${getRolColor(usuario.rolNombre)}`}>{usuario.rolNombre}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                <span>Reg: {formatFecha(usuario.createdAt || usuario.fechaRegistro)}</span>
              </div>
            </div>
            <div className="border-t border-gray-100 dark:border-gray-700/60 px-4 py-2 flex items-center gap-1">
              <button onClick={() => onEdit(usuario)} className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                <Edit className="w-3.5 h-3.5" /><span>Editar</span>
              </button>
              <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" />
              <button onClick={() => onChangePassword(usuario)} className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors">
                <Lock className="w-3.5 h-3.5" /><span>Clave</span>
              </button>
              {usuario.rolNombre !== "Administrador" && usuario.estado === "Activo" && (
                <>
                  <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" />
                  <button onClick={() => onDelete(usuario.id || usuario.idUsuario, usuario.nombre)} className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-[#F05454] hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                    <Trash2 className="w-3.5 h-3.5" /><span>Inactivar</span>
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        {usuarios.length === 0 && (
          <div className="sm:col-span-2 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-12 text-center">
            <User className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">No se encontraron usuarios</p>
          </div>
        )}
      </div>

      {/* Desktop Table View (lg+) */}
      <div className="hidden lg:block bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700/60 bg-gray-50/50 dark:bg-gray-800/40">
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">USUARIO (DOC ID)</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">EMAIL</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">TELÉFONO</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">DIRECCIÓN</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ROL</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">REGISTRO</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ESTADO</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/40">
              {usuarios.map((usuario) => (
                <tr key={usuario.id || usuario.idUsuario} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 bg-gradient-to-br ${getAvatarGradient(usuario.rolNombre)} rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm`}>
                        {usuario.iniciales}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{usuario.nombre} {usuario.apellidos}</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold">{usuario.tipoDocumento || "C.C."}: {usuario.documento || usuario.idUsuario}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="truncate max-w-[150px]">{usuario.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{usuario.telefono || "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 truncate max-w-[150px]">{usuario.direccion || "-"}</td>
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
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {usuarios.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400 dark:text-gray-500 text-sm">
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
