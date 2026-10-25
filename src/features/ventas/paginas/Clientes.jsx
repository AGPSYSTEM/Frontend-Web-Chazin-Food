import { useState } from "react";
import { Plus, Search, UserX } from "lucide-react";
import { useAuth } from "@/features/autenticacion/hooks/useAuth";
import { hasPrivilege } from "@/shared/utils/privilegiosUtils";
import { useClientes } from "../hooks/useClientes";
import { ClientesStatsCards } from "../componentes/clientes/ClientesStatsCards";
import { ClientesTable } from "../componentes/clientes/ClientesTable";
import { ClienteModal } from "../componentes/clientes/ClienteModal";
import { ClienteDetalleModal } from "../componentes/clientes/ClienteDetalleModal";
import { ClientesBuscadorMulticriterio } from "../componentes/clientes/ClientesBuscadorMulticriterio";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { ChazinLoader } from "@/shared/components/ui/ChazinLoader";

export function Clientes() {
  const { user } = useAuth();
  const canCreate = hasPrivilege(user, "Clientes", "crear");
  const canEdit = hasPrivilege(user, "Clientes", "editar");
  const canDelete = hasPrivilege(user, "Clientes", "eliminar");

  const { success } = useNotifications();
  const {
    clientes,
    filteredClientes,
    stats,
    loading,
    searchTerm,
    setSearchTerm,
    filterTipo,
    setFilterTipo,
    filterEstado,
    setFilterEstado,
    comprasMin,
    setComprasMin,
    montoMin,
    setMontoMin,
    montoMax,
    setMontoMax,
    clearAllFilters,
    hasActiveFilters,
    activeFiltersCount,
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
      if (ok) {
        success("¡Cliente actualizado!", "Los datos del cliente se modificaron correctamente.");
      }
    } else {
      ok = await createCliente(form);
      if (ok) {
        success(
          "¡Cliente registrado con éxito!",
          `Se ha enviado un correo electrónico de activación a ${form.email || 'su dirección'} para que configure su contraseña y active su cuenta.`
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Gestión de Clientes
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Directorio, historial de compras, fidelización y estados
          </p>
        </div>

        {canCreate && (
          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nuevo Cliente</span>
          </button>
        )}
      </div>

      {/* 4 Stat Cards Grid */}
      <ClientesStatsCards clientes={clientes} stats={stats} />

      {/* Box con Buscador Multicriterio */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
        <ClientesBuscadorMulticriterio
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterTipo={filterTipo}
          setFilterTipo={setFilterTipo}
          filterEstado={filterEstado}
          setFilterEstado={setFilterEstado}
          comprasMin={comprasMin}
          setComprasMin={setComprasMin}
          montoMin={montoMin}
          setMontoMin={setMontoMin}
          montoMax={montoMax}
          setMontoMax={setMontoMax}
          clearAllFilters={clearAllFilters}
          hasActiveFilters={hasActiveFilters}
          activeFiltersCount={activeFiltersCount}
          totalRecords={clientes.length}
          filteredRecords={filteredClientes.length}
        />
      </div>

      {/* Main Content Table or Empty State */}
      {loading ? (
        <ChazinLoader text="CARGANDO CLIENTES" size="md" />
      ) : filteredClientes.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 border border-gray-100 dark:border-gray-800 shadow-xs text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-950/40 text-red-500 flex items-center justify-center mb-1">
            <UserX className="w-7 h-7 stroke-[1.5]" />
          </div>
          <p className="text-base font-bold text-gray-800 dark:text-gray-100">
            No se encontraron clientes para los criterios seleccionados
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md">
            {searchTerm ? `No hay resultados para "${searchTerm}". ` : ""}
            Intenta ajustar los criterios de búsqueda o restablecer los filtros.
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="mt-2 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Restablecer filtros y ver todos los clientes
            </button>
          )}
        </div>
      ) : (
        <ClientesTable
          clientes={filteredClientes}
          onViewDetail={handleViewDetail}
          onEdit={handleOpenEdit}
          onDelete={deleteCliente}
          canEdit={canEdit}
          canDelete={canDelete}
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
        clientes={clientes}
      />
    </div>
  );
}
