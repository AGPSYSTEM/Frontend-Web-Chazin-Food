import { useState } from "react";
import { Plus, Search, Filter, X } from "lucide-react";
import { useCategoriaInsumos } from "../hooks/useCategoriaInsumos";
import { useAuth } from "@/features/autenticacion/hooks/useAuth";
import { hasPrivilege } from "@/features/configuracion/utils/privilegiosUtils";
import { CategoriaInsumosTable } from "../componentes/categorias/CategoriaInsumosTable";
import { CategoriaInsumoModal } from "../componentes/categorias/CategoriaInsumoModal";
import { ChazinLoader } from "@/shared/components/ui/ChazinLoader";

export function CategoriaInsumos() {
  const { user } = useAuth();
  const canCreate = hasPrivilege(user, "Categoría Insumos", "crear");
  const canEdit = hasPrivilege(user, "Categoría Insumos", "editar");
  const canDelete = hasPrivilege(user, "Categoría Insumos", "eliminar");

  const {
    categorias,
    filteredCategorias,
    loading,
    searchTerm,
    setSearchTerm,
    filterEstado,
    setFilterEstado,
    createCategoria,
    updateCategoria,
    deleteCategoria
  } = useCategoriaInsumos();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState(null);

  const handleOpenCreate = () => {
    setEditingCategoria(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategoria(cat);
    setModalOpen(true);
  };

  const handleSave = async (form) => {
    let ok = false;
    if (editingCategoria) {
      ok = await updateCategoria(editingCategoria.id, form);
    } else {
      ok = await createCategoria(form);
    }
    if (ok) {
      setModalOpen(false);
      setEditingCategoria(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-full overflow-x-hidden space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1e293b] dark:text-gray-100">
          Categoría de Insumos
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Gestiona las categorías de insumos del negocio
        </p>
      </div>

      {/* Filter and Action Bar Box - Estandarizado en todo el módulo de compras */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-4 sm:p-5 border border-gray-100 dark:border-gray-800 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar categoría por nombre, descripción, estado o insumos..."
            className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs sm:text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-colors placeholder:text-gray-400 outline-none"
          />
        </div>

        {/* Filter Dropdown & Primary Action Button */}
        <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap sm:flex-nowrap">
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs sm:text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-red-500/50 cursor-pointer w-full sm:w-auto outline-none font-medium"
          >
            <option value="Todos">Todos los estados</option>
            <option value="Activo">Activas</option>
            <option value="Inactivo">Inactivas</option>
          </select>

          {canCreate && (
            <button
              onClick={handleOpenCreate}
              className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2 w-full sm:w-auto shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Nueva Categoría</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Badges */}
      {(filterEstado !== "Todos" || searchTerm.trim() !== "") && (
        <div className="flex items-center gap-2 flex-wrap text-xs px-2 py-1">
          <span className="text-gray-500 dark:text-gray-400 font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Filtros activos:
          </span>
          {filterEstado !== "Todos" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/40 text-[#F05454] border border-red-200 dark:border-red-900/60 font-medium">
              <span>Estado: {filterEstado}</span>
              <button
                type="button"
                onClick={() => setFilterEstado("Todos")}
                className="hover:text-red-700 cursor-pointer font-bold ml-0.5"
                title="Quitar filtro"
              >
                ×
              </button>
            </span>
          )}
          {searchTerm.trim() !== "" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 font-medium">
              <span>Búsqueda: &quot;{searchTerm}&quot;</span>
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="hover:text-gray-900 cursor-pointer font-bold ml-0.5"
                title="Quitar filtro"
              >
                ×
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              setFilterEstado("Todos");
              setSearchTerm("");
            }}
            className="text-xs text-gray-500 hover:text-red-500 underline ml-2 cursor-pointer font-medium"
          >
            Limpiar todos
          </button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <ChazinLoader text="CARGANDO CATEGORÍAS" size="md" />
      ) : (
        <CategoriaInsumosTable
          categorias={filteredCategorias}
          onEdit={handleOpenEdit}
          onDelete={deleteCategoria}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      )}

      {/* Modal */}
      <CategoriaInsumoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        categoria={editingCategoria}
      />
    </div>
  );
}
