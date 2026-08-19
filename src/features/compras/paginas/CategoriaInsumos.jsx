import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { useCategoriaInsumos } from "../hooks/useCategoriaInsumos";
import { CategoriaInsumosTable } from "../componentes/categorias/CategoriaInsumosTable";
import { CategoriaInsumoModal } from "../componentes/categorias/CategoriaInsumoModal";

export function CategoriaInsumos() {
  const {
    categorias,
    filteredCategorias,
    loading,
    searchTerm,
    setSearchTerm,
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
    <div className="p-4 sm:p-6 lg:p-8 w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1e293b] dark:text-gray-100">
          Categoría de Insumos
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Gestiona las categorías de insumos del negocio
        </p>
      </div>

      {/* Filter & Action Card: Button next to search input matching Vercel screenshot */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar categoría..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-[#F05454] focus:border-transparent transition-colors"
            />
          </div>
          <button
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#F05454] hover:bg-[#d84343] text-white font-medium rounded-xl shadow-md transition-colors shrink-0 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span>Nueva Categoría</span>
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">Cargando categorías...</div>
      ) : (
        <CategoriaInsumosTable
          categorias={filteredCategorias}
          onEdit={handleOpenEdit}
          onDelete={deleteCategoria}
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
