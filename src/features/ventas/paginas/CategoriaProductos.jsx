import { useState, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import { useCategoriaProductos } from "../hooks/useCategoriaProductos";
import { CategoriaProductosTable } from "../componentes/categorias/CategoriaProductosTable";
import { CategoriaProductoModal } from "../componentes/categorias/CategoriaProductoModal";

export function CategoriaProductos() {
  const {
    categorias,
    filteredCategorias,
    loading,
    searchTerm,
    setSearchTerm,
    createCategoria,
    updateCategoria,
    deleteCategoria
  } = useCategoriaProductos();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState(null);

  // Stats calculation
  const stats = useMemo(() => {
    const total = categorias.length;
    const activas = categorias.filter(
      (c) => c.estado === 1 || c.estado === true || c.estado === "Activo"
    ).length;
    const inactivas = total - activas;
    return { total, activas, inactivas };
  }, [categorias]);

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
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Categoría de Productos
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Gestiona las categorías de productos del menú
        </p>
      </div>

      {/* Separator */}
      <hr className="border-gray-200 dark:border-gray-700" />

      {/* Stat Cards - Centered numbers & text */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Categorías */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm text-center">
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">Total Categorías</p>
        </div>

        {/* Activas */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm text-center">
          <p className="text-3xl font-bold text-emerald-500">{stats.activas}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">Activas</p>
        </div>

        {/* Inactivas */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm text-center">
          <p className="text-3xl font-bold text-slate-600 dark:text-slate-400">{stats.inactivas}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">Inactivas</p>
        </div>
      </div>

      {/* Search + Action Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-5">
        {/* Full width search bar */}
        <div className="relative w-full">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar categoría..."
            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-[#F05454] focus:border-transparent transition-colors"
          />
        </div>

        {/* Centered Nueva Categoría Button */}
        <div className="flex justify-center">
          <button
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-[#F05454] hover:bg-[#d84343] text-white font-medium rounded-xl shadow-md transition-colors text-base"
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
        <CategoriaProductosTable
          categorias={filteredCategorias}
          onEdit={handleOpenEdit}
          onDelete={deleteCategoria}
        />
      )}

      {/* Modal */}
      <CategoriaProductoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        categoria={editingCategoria}
      />
    </div>
  );
}
