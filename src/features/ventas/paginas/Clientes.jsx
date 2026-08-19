import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { useClientes } from "../hooks/useClientes";
import { ClientesStatsCards } from "../componentes/clientes/ClientesStatsCards";
import { ClientesTable } from "../componentes/clientes/ClientesTable";
import { ClienteModal } from "../componentes/clientes/ClienteModal";
import { ClienteDetalleModal } from "../componentes/clientes/ClienteDetalleModal";
import { useNotifications } from "@/shared/hooks/useNotifications";

export function Clientes() {
  const { info } = useNotifications();
  const {
    clientes,
    filteredClientes,
    stats,
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
  
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedClienteDetail, setSelectedClienteDetail] = useState(null);

  const handleOpenCreate = () => {
    setEditingCliente(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCliente(c);
    setModalOpen(true);
  };

  const handleViewDetail = (c) => {
    setSelectedClienteDetail(c);
    setDetailModalOpen(true);
  };

  const handleSave = async (form) => {
    let ok = false;
    if (editingCliente) {
      ok = await updateCliente(editingCliente.id || editingCliente.idCliente, form);
    } else {
      ok = await createCliente(form);
      if (ok && form.sinCuenta) {
        info(
          "Cliente inactivo registrado",
          "Cliente creado correctamente, pero quedó inactivo porque no tiene una cuenta de usuario ni credenciales de acceso."
        );
      }
    }
    if (ok) {
      setModalOpen(false);
      setEditingCliente(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Gestión de Clientes
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Administra la base de datos de clientes
        </p>
      </div>

      {/* 4 Stat Cards Grid */}
      <ClientesStatsCards clientes={clientes} stats={stats} />

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
            className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs sm:text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-colors placeholder:text-gray-400 outline-none"
          />
        </div>

        {/* Filter Dropdown & Primary Action Button */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs sm:text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-red-500/50 cursor-pointer w-full sm:w-auto outline-none font-medium"
          >
            <option value="Todos">Todos</option>
            <option value="VIP">VIP</option>
            <option value="Frecuente">Frecuente</option>
            <option value="Regular">Regular</option>
            <option value="Nuevo">Nuevo</option>
          </select>

          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2 w-full sm:w-auto shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nuevo Cliente</span>
          </button>
        </div>
      </div>

      {/* Main Content Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm">Cargando clientes...</div>
      ) : (
        <ClientesTable
          clientes={filteredClientes}
          onViewDetail={handleViewDetail}
          onEdit={handleOpenEdit}
          onDelete={deleteCliente}
        />
      )}

      {/* Modal Ver Detalle */}
      <ClienteDetalleModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedClienteDetail(null);
        }}
        cliente={selectedClienteDetail}
      />

      {/* Modal Crear / Editar */}
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
