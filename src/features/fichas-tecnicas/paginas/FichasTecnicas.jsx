import { useState } from "react";
import { FileText, Search, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { FichaTecnicaProducto } from "../componentes/FichaTecnicaProducto";
import { useNotifications } from "@/shared/hooks/useNotifications";

const productosCatalogo = [
  { idProducto: 1, nombre: "Hamburguesa Especial", categoriaNombre: "Hamburguesas", imagen: "🍔" },
  { idProducto: 2, nombre: "Salchipapa Grande", categoriaNombre: "Salchipapas", imagen: "🍟" },
  { idProducto: 3, nombre: "Perro Caliente Especial", categoriaNombre: "Perros Calientes", imagen: "🌭" },
  { idProducto: 4, nombre: "Pollo Broaster", categoriaNombre: "Pollo", imagen: "🍗" },
  { idProducto: 5, nombre: "Combo Familiar", categoriaNombre: "Combos", imagen: "🍱" },
  { idProducto: 6, nombre: "Papas Fritas Medianas", categoriaNombre: "Acompañamientos", imagen: "🍟" }
];

export function FichasTecnicas({ readOnly = false }) {
  const { success } = useNotifications();
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = productosCatalogo.filter(
    (p) => p.nombre.toLowerCase().includes(search.toLowerCase()) || p.categoriaNombre.toLowerCase().includes(search.toLowerCase())
  );

  if (selected) {
    return (
      <div className="p-4 lg:p-8 max-w-5xl mx-auto">
        <button
          onClick={() => setSelected(null)}
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Volver al catálogo
        </button>

        <div className="flex items-center gap-3 mb-6">
          <span className="text-4xl">{selected.imagen}</span>
          <div>
            <h1 className="font-bold text-gray-900 dark:text-gray-100">{selected.nombre}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{selected.categoriaNombre}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 lg:p-6">
          <FichaTecnicaProducto
            productId={selected.idProducto}
            productName={selected.nombre}
            initialData={null}
            onSave={(data) => {
              if (readOnly) return;
              success("Ficha técnica guardada", `Receta de ${selected.nombre} actualizada`);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      {readOnly && (
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Volver a Cocina
        </Link>
      )}

      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h1 className="font-bold text-gray-900 dark:text-gray-100">Fichas Técnicas de Productos</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {readOnly
              ? "Consulta los ingredientes y procedimientos de cada producto."
              : "Administra ingredientes, procedimientos y rendimiento de cada producto."}
          </p>
        </div>
      </div>

      <div className="relative max-w-md mt-6 mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar producto o categoría..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <button
            key={p.idProducto}
            onClick={() => setSelected(p)}
            className="text-left bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 hover:shadow-md hover:border-red-200 dark:hover:border-red-800 transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{p.imagen}</span>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{p.nombre}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{p.categoriaNombre}</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
              <FileText className="w-3.5 h-3.5" />
              {readOnly ? "Ver ficha técnica" : "Editar ficha técnica"}
            </span>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full text-center text-sm text-gray-500 dark:text-gray-400 py-12">
            No se encontraron productos.
          </p>
        )}
      </div>
    </div>
  );
}
