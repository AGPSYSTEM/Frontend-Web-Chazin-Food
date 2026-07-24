import { useState } from "react";
import { Plus, Search, Package } from "lucide-react";
import { useInsumos } from "../hooks/useInsumos";
import { InsumosStatsCards } from "../components/insumos/InsumosStatsCards";
import { InsumosTable } from "../components/insumos/InsumosTable";
import { InsumoModal } from "../components/insumos/InsumoModal";

export function Insumos() {
  const {
    insumos,
    filteredInsumos,
    categorias,
    loading,
    searchTerm,
    setSearchTerm,
    filterCategoria,
    setFilterCategoria,
    filterEstado,
    setFilterEstado,
    createInsumo,
    updateInsumo,
    deleteInsumo
  } = useInsumos();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingInsumo, setEditingInsumo] = useState(null);

  const handleOpenCreate = () => {
    setEditingInsumo(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingInsumo(item);
    setModalOpen(true);
  };

  const handleSave = async (form) => {
    let ok = false;
    if (editingInsumo) {
      ok = await updateInsumo(editingInsumo.id, form);
    } else {
      ok = await createInsumo(form);
    }
    if (ok) {
      setModalOpen(false);
      setEditingInsumo(null);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Package className="w-7 h-7 text-[#F05454]" />
            Inventario de Insumos
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Control de materias primas, unidades de medida y niveles de stock.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#F05454] hover:bg-[#d84343] text-white font-medium rounded-xl shadow-md transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Insumo</span>
        </button>
      </div>

      {/* Stats */}
      <InsumosStatsCards insumos={insumos} />

      {/* Filter bar */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código o insumo..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-[#F05454] focus:border-transparent transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Categoría:</span>
            <select
              value={filterCategoria}
              onChange={(e) => setFilterCategoria(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-[#F05454]"
            >
              <option value="Todas">Todas</option>
              {categorias.map((c) => (
                <option key={c.id || c.nombre} value={c.nombre}>
                  {c.nombre}
                </option>
              ))}
            </select>
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
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">Cargando insumos...</div>
      ) : (
        <InsumosTable
          insumos={filteredInsumos}
          onEdit={handleOpenEdit}
          onDelete={deleteInsumo}
        />
      )}

      {/* Modal */}
      <InsumoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        insumo={editingInsumo}
        categorias={categorias}
      />
    </div>
  );
}
