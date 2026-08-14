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
    <div className="min-h-screen bg-[#f4f4f4] px-4 py-5 lg:px-6 xl:px-8">
      <div className="mx-auto max-w-[1600px]">
        <header className="mb-6 flex items-center justify-between gap-3 rounded-[20px] bg-[#f4f4f4] px-1 py-2">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f05454] text-xl shadow-[0_8px_20px_rgba(240,84,84,0.35)] text-white">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#7a8394]">Ventas</p>
              <h1 className="text-[2.1rem] font-black leading-none text-[#1f2d3d]">Punto de Venta</h1>
            </div>
          </div>

          <div className="hidden items-center gap-3 rounded-2xl border border-[#dfe5ec] bg-white px-3 py-2 shadow-sm lg:flex">
            <Search className="h-4 w-4 text-[#75859a]" />
            <input
              aria-label="Buscar producto"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-56 border-0 bg-transparent text-sm text-[#25364a] outline-none placeholder:text-[#8aa0b4]"
              placeholder="Buscar producto..."
            />
          </div>
        </header>

        <div className="grid gap-5 xl:grid-cols-[240px_minmax(0,1fr)_370px]">
          <aside className="rounded-[28px] border border-[#e7eaee] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[1.8rem] font-black text-[#1f2d3d]">Categorías</h2>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fef2f2] text-[#f05454]">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => setCategoriaActiva(null)}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-base font-semibold transition-all ${
                  categoriaActiva === null
                    ? "bg-[#f05454] text-white shadow-[0_10px_20px_rgba(240,84,84,0.25)]"
                    : "bg-[#f5f6f8] text-[#2a3747] hover:bg-[#eef2f7]"
                }`}
              >
                <span className="text-xl">🍽️</span>
                <span>Todos</span>
              </button>

              {categorias.map((c) => {
                const active = categoriaActiva === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategoriaActiva(c.id)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-base font-semibold transition-all ${
                      active
                        ? "bg-[#f05454] text-white shadow-[0_10px_20px_rgba(240,84,84,0.25)]"
                        : "bg-[#f5f6f8] text-[#2a3747] hover:bg-[#eef2f7]"
                    }`}
                  >
                    <span className="text-xl">{getCategoryEmoji(c.nombre)}</span>
                    <span>{c.nombre}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          <main className="rounded-[28px] border border-[#e7eaee] bg-[#f8f8f8] p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-[2rem] font-black text-[#1f2d3d]">Productos</h2>
              <div className="rounded-full bg-[#edf2f7] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#5f7285]">
                {visibleProducts.length} items
              </div>
            </div>

            {visibleProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-[#dbe3ed] bg-white px-6 py-16 text-center text-[#75859a]">
                <p className="text-xl font-bold text-[#445366]">No se encontraron productos</p>
                <p className="mt-1 text-sm text-[#7a8698]">Intenta seleccionando otra categoría o cambiando la búsqueda.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
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

          <section className="rounded-[28px] border border-[#e7eaee] bg-[#f8f8f8] p-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
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
