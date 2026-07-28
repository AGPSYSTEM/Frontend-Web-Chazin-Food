import { Edit, Trash2, Building, Mail, Phone, MapPin } from "lucide-react";

export function ProveedoresTable({ proveedores = [], onEdit, onDelete }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <th className="px-6 py-4">Proveedor / NIT</th>
              <th className="px-6 py-4">Contacto</th>
              <th className="px-6 py-4">Correo / Teléfono</th>
              <th className="px-6 py-4">Dirección</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
            {proveedores.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No se encontraron proveedores
                </td>
              </tr>
            ) : (
              proveedores.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <Building className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">{p.nombre}</div>
                        <div className="text-xs text-gray-400 font-mono">NIT: {p.nit || "N/A"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">
                    {p.contacto || "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-gray-600 dark:text-gray-300 space-y-0.5">
                      {p.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-gray-400" /> {p.email}
                        </div>
                      )}
                      {p.telefono && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-gray-400" /> {p.telefono}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300 text-xs">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                      <span className="truncate max-w-xs">{p.direccion || "N/A"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        p.estado === "Activo"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                          : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                      }`}
                    >
                      {p.estado || "Activo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(p)}
                        title="Editar proveedor"
                        className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(p.id, p.nombre)}
                        title="Eliminar proveedor"
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
