import { useState, useEffect } from "react";
import { FileText, Search, ChevronLeft, Package, Utensils } from "lucide-react";
import { Link } from "react-router-dom";
import { FichaTecnicaProducto } from "../componentes/FichaTecnicaProducto";
import { FichaTecnicaInsumo } from "../componentes/FichaTecnicaInsumo";
import { productosService } from "@/features/ventas/servicios/productosService";
import { insumosService } from "@/features/compras/servicios/insumosService";

export function FichasTecnicas({ readOnly = false }) {
  const [activeTab, setActiveTab] = useState("productos"); // 'productos' | 'insumos'
  const [productos, setProductos] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [prodRes, insRes] = await Promise.allSettled([
          productosService.getProductos(),
          insumosService.getInsumos()
        ]);

        if (prodRes.status === "fulfilled") {
          const list = Array.isArray(prodRes.value) ? prodRes.value : prodRes.value?.data || [];
          setProductos(list);
        }

        if (insRes.status === "fulfilled") {
          const list = Array.isArray(insRes.value) ? insRes.value : insRes.value?.data || [];
          setInsumos(list);
        }
      } catch (err) {
        console.error("Error cargando catálogo para fichas técnicas:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const currentList = activeTab === "productos" ? productos : insumos;
  const filtered = currentList.filter((item) => {
    const term = search.toLowerCase().trim();
    if (!term) return true;
    const nombre = (item.nombre || "").toLowerCase();
    const cat = (item.categoria || item.categoriaNombre || item.categoria?.nombre || "").toLowerCase();
    return nombre.includes(term) || cat.includes(term);
  });

  if (selected) {
    const isProducto = activeTab === "productos";
    return (
      <div className="p-4 sm:p-6 lg:p-8 w-full space-y-6">
        <button
          onClick={() => setSelected(null)}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-[#F05454] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Volver al catálogo de {isProducto ? "productos" : "insumos"}
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-[#F05454] flex items-center justify-center font-bold text-xl shrink-0">
            {isProducto ? <Utensils className="w-6 h-6" /> : <Package className="w-6 h-6" />}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selected.nombre}</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {selected.categoria || selected.categoriaNombre || selected.categoria?.nombre || (isProducto ? "Producto" : "Insumo")}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 p-6">
          {isProducto ? (
            <FichaTecnicaProducto
              productId={selected.id || selected.idProducto}
              productName={selected.nombre}
              readOnly={readOnly}
            />
          ) : (
            <FichaTecnicaInsumo
              insumoId={selected.id || selected.idInsumo}
              insumoName={selected.nombre}
              readOnly={readOnly}
            />
          )}
        </div>
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
              ? "Consulta los ingredientes y procedimientos paso a paso."
              : "Administra especificaciones, ingredientes, rendimiento y conservación de productos e insumos."}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-px">
        <button
          onClick={() => {
            setActiveTab("productos");
            setSelected(null);
          }}
          className={`flex items-center gap-2 pb-3 text-sm font-semibold transition-colors relative ${
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
            setActiveTab("insumos");
            setSelected(null);
          }}
          className={`flex items-center gap-2 pb-3 text-sm font-semibold transition-colors relative ${
            activeTab === "insumos"
              ? "text-[#F05454] border-b-2 border-[#F05454]"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Fichas de Insumos ({insumos.length})</span>
        </button>
      </div>

      {/* Search input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Buscar ${activeTab === "productos" ? "producto" : "insumo"} o categoría...`}
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-[#F05454] focus:border-transparent transition-colors"
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
            const categoriaName = item.categoria || item.categoriaNombre || item.categoria?.nombre || (isProducto ? "Producto" : "Insumo");
            
            return (
              <button
                key={itemId}
                onClick={() => setSelected(item)}
                className="text-left bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs hover:shadow-md hover:border-rose-200 dark:hover:border-rose-900 transition-all active:scale-[0.99] flex flex-col justify-between space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-[#F05454] flex items-center justify-center shrink-0">
                    {isProducto ? <Utensils className="w-6 h-6" /> : <Package className="w-6 h-6" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-gray-900 dark:text-gray-100 truncate">{item.nombre}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{categoriaName}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800/60">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F05454]">
                    <FileText className="w-3.5 h-3.5" />
                    {readOnly ? "Ver ficha técnica" : "Editar ficha técnica"}
                  </span>
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16 text-sm text-gray-500 dark:text-gray-400 font-medium">
              No se encontraron {activeTab === "productos" ? "productos" : "insumos"} en la base de datos.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
