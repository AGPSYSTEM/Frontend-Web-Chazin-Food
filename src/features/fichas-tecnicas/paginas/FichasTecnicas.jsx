import { useState, useEffect } from "react";
import { FileText, Search, ChevronLeft, Package, Utensils, Eye, Edit2, Sparkles, CheckCircle2, FlaskConical } from "lucide-react";
import { Link } from "react-router-dom";
import { FichaTecnicaProducto } from "../componentes/FichaTecnicaProducto";
import { FichaTecnicaInsumo } from "../componentes/FichaTecnicaInsumo";
import { FichaTecnicaDetalleModal } from "../componentes/FichaTecnicaDetalleModal";
import { productosService } from "@/features/ventas/servicios/productosService";
import { insumosService } from "@/features/compras/servicios/insumosService";

export function FichasTecnicas({ readOnly = false }) {
  const [activeTab, setActiveTab] = useState("productos"); // 'productos' | 'preparados'
  const [productos, setProductos] = useState([]);
  const [preparados, setPreparados] = useState([]);
  const [loading, setLoading] = useState(true);

  // States for modals and full edit page
  const [selectedDetalle, setSelectedDetalle] = useState(null);
  const [selectedEdit, setSelectedEdit] = useState(null);
  const [search, setSearch] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, prepRes] = await Promise.allSettled([
        productosService.getProductos(),
        insumosService.getInsumosPreparados()
      ]);

      if (prodRes.status === "fulfilled") {
        const list = Array.isArray(prodRes.value) ? prodRes.value : prodRes.value?.data || [];
        setProductos(list);
      }

      if (prepRes.status === "fulfilled") {
        const list = Array.isArray(prepRes.value) ? prepRes.value : prepRes.value?.data || [];
        setPreparados(list);
      }
    } catch (err) {
      console.error("Error cargando catálogo para fichas técnicas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const currentList = activeTab === "productos" ? productos : preparados;
  const filtered = currentList.filter((item) => {
    const term = search.toLowerCase().trim();
    if (!term) return true;
    const nombre = (item.nombre || "").toLowerCase();
    const cat = (item.categoria || item.categoriaNombre || item.categoria?.nombre || (activeTab === "productos" ? "Producto" : "Insumo Preparado")).toLowerCase();
    return nombre.includes(term) || cat.includes(term);
  });

  // ── View for Editing Ficha Técnica ──
  if (selectedEdit) {
    const isProducto = activeTab === "productos";
    return (
      <div className="p-4 sm:p-6 lg:p-8 w-full space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <button
            onClick={() => {
              setSelectedEdit(null);
              loadData();
            }}
            className="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-[#F05454] transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> Volver al catálogo de {isProducto ? "productos" : "insumos preparados"}
          </button>

          <button
            onClick={() => setSelectedDetalle(selectedEdit)}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-[#F05454] rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>Ver Vista Previa / Detalle</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-[#F05454] flex items-center justify-center font-bold text-xl shrink-0">
            {isProducto ? <Utensils className="w-6 h-6" /> : <FlaskConical className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedEdit.nombre}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-black uppercase tracking-wider bg-rose-100 text-[#F05454] dark:bg-rose-950/60 dark:text-rose-300">
                Modo Edición
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {selectedEdit.categoria || selectedEdit.categoriaNombre || selectedEdit.categoria?.nombre || (isProducto ? "Producto" : "Insumo Preparado")}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 p-6">
          {isProducto ? (
            <FichaTecnicaProducto
              productId={selectedEdit.id || selectedEdit.idProducto}
              productName={selectedEdit.nombre}
              readOnly={false}
              onSave={() => loadData()}
            />
          ) : (
            <FichaTecnicaInsumo
              insumoId={selectedEdit.id || selectedEdit.idInsumo}
              insumoName={selectedEdit.nombre}
              readOnly={false}
              onSave={() => loadData()}
            />
          )}
        </div>

        {/* Modal de Detalle Preview */}
        <FichaTecnicaDetalleModal
          isOpen={Boolean(selectedDetalle)}
          onClose={() => setSelectedDetalle(null)}
          item={selectedDetalle}
          isProducto={activeTab === "productos"}
          readOnly={true}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full space-y-6">
      {readOnly && (
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-[#F05454] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Volver a Cocina
        </Link>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-[#F05454] flex items-center justify-center shrink-0">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Fichas Técnicas</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {readOnly
              ? "Consulta los ingredientes, porciones y procedimientos de preparación paso a paso."
              : "Administra especificaciones, ingredientes, rendimiento y conservación de productos e insumos preparados."}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-px">
        <button
          onClick={() => {
            setActiveTab("productos");
            setSelectedDetalle(null);
            setSelectedEdit(null);
          }}
          className={`flex items-center gap-2 pb-3 text-sm font-semibold transition-colors relative cursor-pointer ${
            activeTab === "productos"
              ? "text-[#F05454] border-b-2 border-[#F05454]"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>Fichas de Productos ({productos.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("preparados");
            setSelectedDetalle(null);
            setSelectedEdit(null);
          }}
          className={`flex items-center gap-2 pb-3 text-sm font-semibold transition-colors relative cursor-pointer ${
            activeTab === "preparados"
              ? "text-[#F05454] border-b-2 border-[#F05454]"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          <span>Fichas de Insumos Preparados ({preparados.length})</span>
        </button>
      </div>

      {/* Search input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Buscar ${activeTab === "productos" ? "producto" : "insumo preparado"} o categoría...`}
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-[#F05454] focus:border-transparent transition-colors outline-none"
        />
      </div>

      {/* Grid view */}
      {loading ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400 font-medium">
          Cargando catálogo para fichas técnicas...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const isProducto = activeTab === "productos";
            const itemId = item.id || item.idProducto || item.idInsumo;
            const categoriaName = item.categoria || item.categoriaNombre || item.categoria?.nombre || (isProducto ? "Producto" : "Insumo Preparado");
            
            return (
              <div
                key={itemId}
                onClick={() => setSelectedDetalle(item)}
                className="text-left bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs hover:shadow-md hover:border-rose-200 dark:hover:border-rose-900 transition-all flex flex-col justify-between space-y-4 group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-[#F05454] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    {isProducto ? <Utensils className="w-6 h-6" /> : <FlaskConical className="w-6 h-6" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-[#F05454] transition-colors">
                      {item.nombre}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{categoriaName}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800/80 gap-2">
                  {/* Botón Ver Detalle */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDetalle(item);
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer ${
                      readOnly
                        ? "bg-[#F05454] hover:bg-red-600 text-white"
                        : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5 text-[#F05454]" />
                    <span>{readOnly ? "Ver Receta / Detalle" : "Ver Detalle"}</span>
                  </button>

                  {/* Botón Editar Ficha (Solo Administrador) */}
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEdit(item);
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-[#F05454] rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Editar Ficha</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16 text-sm text-gray-500 dark:text-gray-400 font-medium">
              No se encontraron {activeTab === "productos" ? "productos" : "insumos preparados"} en la base de datos.
            </div>
          )}
        </div>
      )}

      {/* ── Modal de Detalle de Ficha Técnica ── */}
      <FichaTecnicaDetalleModal
        isOpen={Boolean(selectedDetalle)}
        onClose={() => setSelectedDetalle(null)}
        item={selectedDetalle}
        isProducto={activeTab === "productos"}
        readOnly={readOnly}
        onEdit={(itemToEdit) => {
          setSelectedDetalle(null);
          setSelectedEdit(itemToEdit);
        }}
      />
    </div>
  );
}

export default FichasTecnicas;
