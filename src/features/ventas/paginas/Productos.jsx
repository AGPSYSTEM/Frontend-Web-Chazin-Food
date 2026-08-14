import { useState, useMemo, useEffect, useCallback } from "react";
import { Plus, Search, Package, Star, TrendingUp, AlertCircle, Sparkles } from "lucide-react";
import { useProductos } from "../hooks/useProductos";
import { ProductosTable } from "../componentes/productos/ProductosTable";
import { ProductoModal } from "../componentes/productos/ProductoModal";
import { VerProductoModal } from "../componentes/productos/VerProductoModal";
import { EventosModal } from "../componentes/productos/EventosModal";
import { CrearEventoModal } from "../componentes/productos/CrearEventoModal";
import { eventosService } from "../servicios/eventosService";

export function Productos() {
  const {
    productos,
    filteredProductos,
    categorias,
    loading,
    searchTerm,
    setSearchTerm,
    filterCategoria,
    setFilterCategoria,
    filterEstado,
    setFilterEstado,
    createProducto,
    updateProducto,
    deleteProducto,
    refetch
  } = useProductos();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProducto, setEditingProducto] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [eventosModalOpen, setEventosModalOpen] = useState(false);
  const [crearEventoModalOpen, setCrearEventoModalOpen] = useState(false);
  const [productoParaEvento, setProductoParaEvento] = useState(null);
  const [eventos, setEventos] = useState([]);

  const fetchEventos = useCallback(async () => {
    try {
      const data = await eventosService.getEventos();
      setEventos(data || []);
    } catch (err) {
      console.error("Error al cargar eventos:", err);
      setEventos([]);
    }
  }, []);

  useEffect(() => {
    fetchEventos();
  }, [fetchEventos]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = productos.length;
    const sorted = [...productos].sort((a, b) => (b.ventas || 0) - (a.ventas || 0));
    const masVendido = sorted[0] || { nombre: "—", ventas: 0 };
    const totalVendidos = productos.reduce((acc, p) => acc + (p.ventas || 0), 0);
    const eventosActivos = productos.reduce((acc, p) => acc + (p.eventos && p.eventos.length > 0 ? 1 : 0), 0);

    return {
      total,
      masVendidoNombre: masVendido.nombre || "—",
      masVendidoVentas: masVendido.ventas || 0,
      totalVendidos,
      eventosActivos
    };
  }, [productos]);

  const handleOpenCreate = () => {
    setEditingProducto(null);
    setIsViewMode(false);
    setModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProducto(p);
    setIsViewMode(false);
    setModalOpen(true);
  };

  const handleOpenView = (p) => {
    setEditingProducto(p);
    setIsViewMode(true);
    setModalOpen(true);
  };

  const handleSave = async (form) => {
    let ok = false;
    if (editingProducto) {
      ok = await updateProducto(editingProducto.id, form);
    } else {
      ok = await createProducto(form);
    }
    if (ok) {
      setModalOpen(false);
      setEditingProducto(null);
    }
  };

  const handleCreateEvento = (producto) => {
    setProductoParaEvento(producto);
    setCrearEventoModalOpen(true);
  };

  const handleEventoCreated = () => {
    fetchEventos();
    refetch();
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Gestión de Productos
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Administra el menú y productos del negocio
        </p>
      </div>

      {/* Separator */}
      <hr className="border-gray-200 dark:border-gray-700" />

      {/* Stat Cards - 2x2 Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card 1: Total Productos */}
        <div className="flex items-center gap-4 bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
            <Package className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">Total Productos</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
            <p className="text-xs text-green-500 font-medium">en catálogo</p>
          </div>
        </div>

        {/* Card 2: Más Vendido */}
        <div className="flex items-center gap-4 bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center shrink-0">
            <Star className="w-6 h-6 text-yellow-500" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">Más Vendido</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100 line-clamp-1">{stats.masVendidoNombre}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">{stats.masVendidoVentas} ventas</p>
          </div>
        </div>

        {/* Card 3: Total Vendidos */}
        <div className="flex items-center gap-4 bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">Total Vendidos</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalVendidos}</p>
            <p className="text-xs text-green-500 font-medium">unidades</p>
          </div>
        </div>

        {/* Card 4: Eventos Activos */}
        <div className="flex items-center gap-4 bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">Productos con Evento</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.eventosActivos}</p>
            <p className="text-xs text-purple-400 font-medium">promociones</p>
          </div>
        </div>
      </div>

      {/* Search + Filter + Actions Bar */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar producto..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-[#F05454] focus:border-transparent transition-colors"
            />
          </div>

          {/* Category Filter Select */}
          <select
            value={filterCategoria}
            onChange={(e) => setFilterCategoria(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-[#F05454] focus:border-transparent transition-colors shrink-0 cursor-pointer"
          >
            <option value="Todas">Todas las categorías</option>
            {categorias.map((c) => (
              <option key={c.id || c.nombre} value={c.nombre}>
                {c.nombre}
              </option>
            ))}
          </select>

          {/* Eventos Button */}
          <button
            onClick={() => setEventosModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-medium rounded-xl shadow-md transition-colors shrink-0"
          >
            <Sparkles className="w-5 h-5" />
            <span>Eventos</span>
          </button>

          {/* Nuevo Producto Button */}
          <button
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#F05454] hover:bg-[#d84343] text-white font-medium rounded-xl shadow-md transition-colors shrink-0"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">Cargando productos...</div>
      ) : (
        <ProductosTable
          productos={filteredProductos}
          onEdit={handleOpenEdit}
          onDelete={deleteProducto}
          onView={handleOpenView}
          onCreateEvento={handleCreateEvento}
        />
      )}

      {/* Producto Modal (Create/Edit) */}
      {!isViewMode && (
        <ProductoModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          producto={editingProducto}
          categorias={categorias}
        />
      )}

      {/* Ver Producto Modal (Read Only) */}
      {isViewMode && (
        <VerProductoModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          producto={editingProducto}
        />
      )}

      {/* Eventos Modal (Versionamiento de Fichas Técnicas) */}
      <EventosModal
        isOpen={eventosModalOpen}
        onClose={() => setEventosModalOpen(false)}
        eventos={eventos}
      />

      {/* Crear Evento Modal */}
      <CrearEventoModal
        isOpen={crearEventoModalOpen}
        onClose={() => setCrearEventoModalOpen(false)}
        producto={productoParaEvento}
        onCreated={handleEventoCreated}
      />
    </div>
  );
}
