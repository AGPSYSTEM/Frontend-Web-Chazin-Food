import { useState } from "react";
import { Plus, Search, Building } from "lucide-react";
import { useProveedores } from "../hooks/useProveedores";
import { ProveedoresTable } from "../componentes/proveedores/ProveedoresTable";
import { ProveedorModal } from "../componentes/proveedores/ProveedorModal";

export function Proveedores() {
  const {
    proveedores,
    filteredProveedores,
    loading,
    searchTerm,
    setSearchTerm,
    filterEstado,
    setFilterEstado,
    createProveedor,
    updateProveedor,
    deleteProveedor
  } = useProveedores();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProveedor, setEditingProveedor] = useState(null);

  const handleOpenCreate = () => {
    setEditingProveedor(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProveedor(p);
    setModalOpen(true);
  };

  const handleSave = async (form) => {
    let ok = false;
    if (editingProveedor) {
      ok = await updateProveedor(editingProveedor.id, form);
    } else {
      ok = await createProveedor(form);
    }
    if (ok) {
      setModalOpen(false);
      setEditingProveedor(null);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Building className="w-7 h-7 text-[#F05454]" />
            Gestión de Proveedores
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Administra la información de proveedores y contactos de suministro.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#F05454] hover:bg-[#d84343] text-white font-medium rounded-xl shadow-md transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Proveedor</span>
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, NIT o contacto..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-[#F05454] focus:border-transparent transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Estado:</span>
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-[#F05454]"
          >
            <option value="Todos">Todos</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">Cargando proveedores...</div>
      ) : (
        <ProveedoresTable
          proveedores={filteredProveedores}
          onEdit={handleOpenEdit}
          onDelete={deleteProveedor}
        />
      )}

      {/* Modal */}
      <ProveedorModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        proveedor={editingProveedor}
      />
    </div>
  );
}
