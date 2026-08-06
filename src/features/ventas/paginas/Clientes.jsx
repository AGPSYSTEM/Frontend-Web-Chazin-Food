import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { useClientes } from "../hooks/useClientes";
import { ClientesStatsCards } from "../componentes/clientes/ClientesStatsCards";
import { ClientesTable } from "../componentes/clientes/ClientesTable";
import { ClienteModal } from "../componentes/clientes/ClienteModal";

export function Clientes() {
  const {
    clientes,
    filteredClientes,
    loading,
    searchTerm,
    setSearchTerm,
    filterEstado,
    setFilterEstado,
    createCliente,
    updateCliente,
    deleteCliente
  } = useClientes();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);

  const handleOpenCreate = () => {
    setEditingCliente(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCliente(c);
    setModalOpen(true);
  };

  const handleSave = async (form) => {
    let ok = false;
    if (editingCliente) {
      ok = await updateCliente(editingCliente.id || editingCliente.idCliente, form);
    } else {
      ok = await createCliente(form);
    }
    if (ok) {
      setModalOpen(false);
      setEditingCliente(null);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1e293b] dark:text-gray-100">
          Gestión de Clientes
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Administra la base de datos de clientes
        </p>
      </div>

      {/* 4 Stat Cards Grid */}
      <ClientesStatsCards clientes={clientes} />

      {/* Filter and Action Bar Box */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-4 sm:p-5 border border-gray-100 dark:border-gray-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar cliente..."
            className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-[#F05454]/50 focus:border-transparent transition-colors placeholder:text-gray-400"
          />
        </div>

        {/* Filter Dropdown & Primary Action Button */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-[#F05454]/50 cursor-pointer w-full sm:w-auto"
          >
            <option value="Todos">Todos</option>
            <option value="VIP">VIP</option>
            <option value="Frecuentes">Frecuentes</option>
            <option value="Nuevos">Nuevos</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>

          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 bg-[#F05454] hover:bg-[#d84343] text-white font-medium text-sm rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2 w-full sm:w-auto shrink-0"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Cliente</span>
          </button>
        </div>
      </div>

      {/* Main Content Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">Cargando clientes...</div>
      ) : (
        <ClientesTable
          clientes={filteredClientes}
          onEdit={handleOpenEdit}
          onDelete={deleteCliente}
        />
      )}

      {/* Create / Edit Modal */}
      <ClienteModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingCliente(null);
        }}
        onSave={handleSave}
        cliente={editingCliente}
      />
    </div>
  );
}
