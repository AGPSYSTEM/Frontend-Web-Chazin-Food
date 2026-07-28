import { Edit, Trash2, User, Mail, Phone, MapPin } from "lucide-react";

export function ClientesTable({ clientes = [], onEdit, onDelete }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <th className="px-6 py-4">Cliente</th>
              <th className="px-6 py-4">Documento</th>
              <th className="px-6 py-4">Contacto</th>
              <th className="px-6 py-4">Dirección</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
            {clientes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No se encontraron clientes registrados
                </td>
              </tr>
            ) : (
              clientes.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">
                    {c.nombre} {c.apellidos || ""}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-mono text-xs">
                    {c.tipoDocumento || "C.C."} {c.documento || "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-gray-600 dark:text-gray-300 space-y-0.5">
                      {c.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-gray-400" /> {c.email}
                        </div>
                      )}
                      {c.telefono && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-gray-400" /> {c.telefono}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300 text-xs">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                      <span className="truncate max-w-xs">{c.direccion || "N/A"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        c.estado === "Activo"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                          : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                      }`}
                    >
                      {c.estado || "Activo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(c)}
                        title="Editar cliente"
                        className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(c.id, `${c.nombre} ${c.apellidos || ""}`)}
                        title="Eliminar cliente"
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
