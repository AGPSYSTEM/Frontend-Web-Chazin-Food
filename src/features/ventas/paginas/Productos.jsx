import { useState, useMemo, useEffect, useCallback } from "react";
import { Plus, Search, Package, Star, TrendingUp, AlertCircle, Sparkles, FileText, X } from "lucide-react";
import { useAuth } from "@/features/autenticacion/hooks/useAuth";
import { hasPrivilege } from "@/shared/utils/privilegiosUtils";
import { useProductos } from "../hooks/useProductos";
import { ProductosTable } from "../componentes/productos/ProductosTable";
import { ProductoModal } from "../componentes/productos/ProductoModal";
import { VerProductoModal } from "../componentes/productos/VerProductoModal";
import { EventosModal } from "../componentes/productos/EventosModal";
import { CrearEventoModal } from "../componentes/productos/CrearEventoModal";
import { eventosService } from "../servicios/eventosService";
import { ChazinLoader } from "@/shared/components/ui/ChazinLoader";
import { FichaTecnicaProducto } from "@/features/fichas-tecnicas/componentes/FichaTecnicaProducto";

export function Productos() {
  const { user } = useAuth();
  const canCreate = hasPrivilege(user, "Productos", "crear");
  const canEdit = hasPrivilege(user, "Productos", "editar");
  const canDelete = hasPrivilege(user, "Productos", "eliminar");

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
  const [isDuplicateMode, setIsDuplicateMode] = useState(false);
  const [editingFichaProducto, setEditingFichaProducto] = useState(null);
  const [eventosModalOpen, setEventosModalOpen] = useState(false);
  const [crearEventoModalOpen, setCrearEventoModalOpen] = useState(false);
  const [productoParaEvento, setProductoParaEvento] = useState(null);
  const [eventoParaEditar, setEventoParaEditar] = useState(null);
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

    const masVendidoMonto = (masVendido.ventas || 0) * (Number(masVendido.precio) || 0);

    return {
      total,
      masVendidoNombre: masVendido.nombre || "—",
      masVendidoVentas: masVendido.ventas || 0,
      masVendidoMonto,
      totalVendidos,
      eventosActivos
    };
  }, [productos]);

  const handleOpenCreate = () => {
    setEditingProducto(null);
    setIsViewMode(false);
    setIsDuplicateMode(false);
    setModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProducto(p);
    setIsViewMode(false);
    setIsDuplicateMode(false);
    setModalOpen(true);
  };

  const handleOpenView = (p) => {
    setEditingProducto(p);
    setIsViewMode(true);
    setIsDuplicateMode(false);
    setModalOpen(true);
  };

  const handleOpenDuplicate = (p) => {
    // Generar nombre sugerido sin colisiones de nombre único
    const cleanBase = (p.nombre || "").replace(/\s*\(Copia(\s*\d+)?\)$/i, "").trim();
    const existingNames = new Set((productos || []).map((prod) => (prod.nombre || "").trim().toLowerCase()));

    let candidateName = `${cleanBase} (Copia)`;
    let counter = 2;
    while (existingNames.has(candidateName.toLowerCase())) {
      candidateName = `${cleanBase} (Copia ${counter})`;
      counter++;
    }

    const cloned = {
      ...p,
      id: null,
      idProducto: null,
      nombre: candidateName,
      originalNombre: p.nombre,
      isDuplicate: true,
      tieneVentas: false,
      ventas: 0,
      variantes: (p.variantes || []).map((v) => ({
        ...v,
        idVariante: null,
        idProducto: null
      })),
      fichaTecnica: p.fichaTecnica
        ? {
            ...p.fichaTecnica,
            idFichaTecnica: null,
            idProducto: null
          }
        : null
    };

    setEditingProducto(cloned);
    setIsDuplicateMode(true);
    setIsViewMode(false);
    setModalOpen(true);
  };

  const handleSave = async (form) => {
    let ok = false;
    if (editingProducto && !isDuplicateMode) {
      ok = await updateProducto(editingProducto.id, form);
    } else {
      ok = await createProducto(form);
    }
    if (ok) {
      setModalOpen(false);
      setEditingProducto(null);
      setIsDuplicateMode(false);
    }
  };

  const handleCreateEvento = (producto, existingEvento = null) => {
    setProductoParaEvento(producto);
    setEventoParaEditar(existingEvento);
    setCrearEventoModalOpen(true);
  };

  const handleEventoCreated = () => {
    fetchEventos();
    refetch();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full space-y-6">
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

      {/* Stat Cards - Grid Balanceado de 4 Columnas (Ítem 113) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <p className="text-xs text-gray-400 dark:text-gray-500">{stats.masVendidoVentas} unidades {stats.masVendidoMonto > 0 ? `• ${stats.masVendidoMonto.toLocaleString("es-CO")} COP` : ""}</p>
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
        <div className="flex items-center gap-4 bg-white dark:bg-gray-900 rounded-2xl p-5 border border-orange-200/80 dark:border-orange-900/40 shadow-sm shadow-orange-500/5">
          <div className="w-12 h-12 rounded-full bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-orange-500 dark:text-orange-400" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">Productos con Evento</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.eventosActivos}</p>
            <p className="text-xs text-orange-600 dark:text-orange-400 font-bold">promociones activas</p>
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

          {/* Eventos Button (Coordinado con el contorno de productos con evento) */}
          <button
            onClick={() => setEventosModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:via-amber-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-md shadow-orange-500/25 ring-2 ring-orange-400/30 transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Sparkles className="w-5 h-5 text-amber-100" />
            <span>Eventos</span>
          </button>

          {/* Nuevo Producto Button */}
          {canCreate && (
            <button
              onClick={handleOpenCreate}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#F05454] hover:bg-[#d84343] text-white font-medium rounded-xl shadow-md transition-colors shrink-0"
            >
              <Plus className="w-5 h-5" />
              <span>Nuevo Producto</span>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <ChazinLoader text="CARGANDO PRODUCTOS" size="md" />
      ) : (
        <ProductosTable
          productos={filteredProductos}
          onEdit={handleOpenEdit}
          onDelete={deleteProducto}
          onView={handleOpenView}
          onDuplicate={handleOpenDuplicate}
          onCreateEvento={handleCreateEvento}
          onEditFicha={(p) => setEditingFichaProducto(p)}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      )}

      {/* Producto Modal (Create/Edit/Duplicate) */}
      {!isViewMode && (
        <ProductoModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setIsDuplicateMode(false);
          }}
          onSave={handleSave}
          producto={editingProducto}
          categorias={categorias}
          isDuplicate={isDuplicateMode}
        />
      )}

      {/* Ver Producto Modal (Read Only) */}
      {isViewMode && (
        <VerProductoModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setIsDuplicateMode(false);
          }}
          producto={editingProducto}
          onEdit={canEdit ? (prod) => handleOpenEdit(prod) : undefined}
          onDuplicate={canEdit ? handleOpenDuplicate : undefined}
        />
      )}

      {/* Eventos Modal */}
      <EventosModal
        isOpen={eventosModalOpen}
        onClose={() => setEventosModalOpen(false)}
        eventos={eventos}
        onOpenCrearEvento={() => {
          setEventosModalOpen(false);
          setProductoParaEvento(null);
          setEventoParaEditar(null);
          setCrearEventoModalOpen(true);
        }}
        onEditEvento={(evt) => {
          setEventosModalOpen(false);
          const relatedProd = productos.find(p => p.id === (evt.idProducto || evt.producto?.id)) || evt.producto || null;
          setProductoParaEvento(relatedProd);
          setEventoParaEditar(evt);
          setCrearEventoModalOpen(true);
        }}
        onRefresh={() => {
          fetchEventos();
          refetch();
        }}
      />

      {/* Crear / Editar Evento Modal */}
      <CrearEventoModal
        isOpen={crearEventoModalOpen}
        onClose={() => {
          setCrearEventoModalOpen(false);
          setProductoParaEvento(null);
          setEventoParaEditar(null);
        }}
        producto={productoParaEvento}
        eventoToEdit={eventoParaEditar}
        onCreated={handleEventoCreated}
      />
      {/* Modal Dedicado: Solo Editar Ficha Técnica */}
      {editingFichaProducto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0 bg-gray-50/50 dark:bg-gray-800/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">
                    Ficha Técnica: {editingFichaProducto.nombre}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Edita únicamente la receta, proporciones, costos y pasos de preparación de este producto.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingFichaProducto(null)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 scrollbar-thin">
              <FichaTecnicaProducto
                productId={editingFichaProducto.id || editingFichaProducto.idProducto}
                productName={editingFichaProducto.nombre}
                initialData={editingFichaProducto.fichaTecnica || null}
                onSave={() => {
                  refetch();
                  setEditingFichaProducto(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
