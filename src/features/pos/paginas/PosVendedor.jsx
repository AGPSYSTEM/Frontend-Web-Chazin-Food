import React, { useMemo } from "react";
import { Search, ShoppingCart, Sparkles } from "lucide-react";
import usePOS from "../hooks/usePOS";
import ProductCard from "../components/ProductCard";
import Cart from "../components/Cart";

const categoryIcons = {
  default: "🍽️",
  burgers: "🍔",
  bebidas: "🥤",
  pollo: "🍗",
  papas: "🍟",
  acompañamientos: "🍟",
  postres: "🍰",
};

const getCategoryEmoji = (nombre = "") => {
  const normalized = nombre.toLowerCase();
  if (normalized.includes("hambur")) return "🍔";
  if (normalized.includes("perro")) return "🌭";
  if (normalized.includes("combo")) return "🍱";
  if (normalized.includes("pizza")) return "🍕";
  if (normalized.includes("pollo")) return "🍗";
  if (normalized.includes("pap")) return "🍟";
  if (normalized.includes("beb") || normalized.includes("gaseos")) return "🥤";
  if (normalized.includes("acompa")) return "🥗";
  if (normalized.includes("post")) return "🍰";
  return categoryIcons.default;
};

export default function PosVendedor() {
  const {
    categorias,
    productos,
    categoriaActiva,
    setCategoriaActiva,
    searchTerm,
    setSearchTerm,
    cart,
    addProduct,
    increment,
    decrement,
    setItemObservacion,
    subtotal,
    descuento,
    total,
    submitOrder,
    loading
  } = usePOS();

  const visibleProducts = useMemo(() => {
    return (productos || []).filter((p) => {
      const matchCat = categoriaActiva === null || p.idCategoriaProducto === categoriaActiva || p.categoriaId === categoriaActiva;
      const matchSearch = !searchTerm || p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) || p.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [productos, categoriaActiva, searchTerm]);

  return (
    <div className="w-full min-h-screen bg-[#f4f4f4] p-3 sm:p-4 lg:p-5">
      <div className="w-full">
        {/* Header */}
        <header className="mb-4 flex items-center justify-between gap-3 rounded-[20px] bg-[#f4f4f4] px-1 py-1">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f05454] text-xl shadow-[0_8px_20px_rgba(240,84,84,0.35)] text-white">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#7a8394]">Ventas</p>
              <h1 className="text-[1.9rem] font-black leading-none text-[#1f2d3d]">Punto de Venta</h1>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-[#dfe5ec] bg-white px-3.5 py-2 shadow-sm">
            <Search className="h-4 w-4 text-[#75859a]" />
            <input
              aria-label="Buscar producto"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-48 sm:w-64 border-0 bg-transparent text-sm text-[#25364a] outline-none placeholder:text-[#8aa0b4]"
              placeholder="Buscar producto..."
            />
          </div>
        </header>

        {/* 3 Column Flex Layout matching exact reference image proportions */}
        <div className="flex flex-col lg:flex-row gap-4 w-full items-start">
          {/* Categorías (Left Column) */}
          <aside className="w-full lg:w-[210px] shrink-0 rounded-[24px] border border-[#e7eaee] bg-white p-3.5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[1.5rem] font-black text-[#1f2d3d]">Categorías</h2>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#fef2f2] text-[#f05454]">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setCategoriaActiva(null)}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-semibold transition-all ${
                  categoriaActiva === null
                    ? "bg-[#f05454] text-white shadow-[0_8px_16px_rgba(240,84,84,0.25)]"
                    : "bg-[#f5f6f8] text-[#2a3747] hover:bg-[#eef2f7]"
                }`}
              >
                <span className="text-lg">🍽️</span>
                <span className="truncate">Todos</span>
              </button>

              {categorias.map((c) => {
                const active = categoriaActiva === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategoriaActiva(c.id)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-semibold transition-all ${
                      active
                        ? "bg-[#f05454] text-white shadow-[0_8px_16px_rgba(240,84,84,0.25)]"
                        : "bg-[#f5f6f8] text-[#2a3747] hover:bg-[#eef2f7]"
                    }`}
                  >
                    <span className="text-lg">{getCategoryEmoji(c.nombre)}</span>
                    <span className="truncate">{c.nombre}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Productos (Center Main Grid) */}
          <main className="flex-1 w-full min-w-0 rounded-[24px] border border-[#e7eaee] bg-[#f8f8f8] p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-[1.75rem] font-black text-[#1f2d3d]">Productos</h2>
              <div className="rounded-full bg-[#edf2f7] px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-[#5f7285]">
                {visibleProducts.length} items
              </div>
            </div>

            {visibleProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-[20px] border-2 border-dashed border-[#dbe3ed] bg-white px-6 py-14 text-center text-[#75859a]">
                <p className="text-lg font-bold text-[#445366]">No se encontraron productos</p>
                <p className="mt-1 text-xs text-[#7a8698]">Intenta seleccionando otra categoría o cambiando la búsqueda.</p>
              </div>
            ) : (
              <div className="grid gap-3.5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3">
                {visibleProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    producto={p}
                    onAdd={({ productoId, varianteId, nombre, precio, adiciones }) =>
                      addProduct({ productoId, varianteId, nombre, precio, adiciones })
                    }
                  />
                ))}
              </div>
            )}
          </main>

          {/* Carrito (Right Column Panel) */}
          <section className="w-full lg:w-[320px] xl:w-[340px] shrink-0 rounded-[24px] border border-[#e7eaee] bg-[#f8f8f8] p-3.5 shadow-sm">
            <Cart
              cart={cart}
              increment={increment}
              decrement={decrement}
              setItemObservacion={setItemObservacion}
              submitOrder={() => submitOrder()}
              loading={loading}
              subtotal={subtotal}
              descuento={descuento}
              total={total}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
