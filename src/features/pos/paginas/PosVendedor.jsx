import React, { useMemo, useState } from "react";
import { Search, ShoppingCart, Sparkles, ShoppingBag, ChevronRight, X } from "lucide-react";
import usePOS from "../hooks/usePOS";
import ProductCard from "../components/ProductCard";
import Cart from "../components/Cart";
import PosCheckoutModal from "../components/PosCheckoutModal";
import { useToast } from "@/shared/context/ToastContext";

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
  if (normalized.includes("perro") || normalized.includes("hot dog")) return "🌭";
  if (normalized.includes("salchipapa") || normalized.includes("papa")) return "🍟";
  if (normalized.includes("combo")) return "🍱";
  if (normalized.includes("pizza")) return "🍕";
  if (normalized.includes("pollo") || normalized.includes("alitas")) return "🍗";
  if (normalized.includes("beb") || normalized.includes("gaseos") || normalized.includes("jugo")) return "🥤";
  if (normalized.includes("acompa") || normalized.includes("ensalada")) return "🥗";
  if (normalized.includes("post") || normalized.includes("torta")) return "🍰";
  if (normalized.includes("taco") || normalized.includes("entrada")) return "🌮";
  return categoryIcons.default;
};

export default function PosVendedor() {
  const toast = useToast();
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

  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const totalCartItems = cart.reduce((acc, it) => acc + (it.cantidad || 1), 0);

  const handleConfirmCheckout = async (checkoutData) => {
    try {
      await submitOrder(checkoutData);
      setIsCheckoutModalOpen(false);
      setIsMobileCartOpen(false);
      toast.success("¡Venta completada!", "El pedido fue registrado exitosamente.");
    } catch (err) {
      toast.error("Error al registrar venta", err.message || "No se pudo procesar la venta.");
    }
  };

  const visibleProducts = useMemo(() => {
    return (productos || []).filter((p) => {
      const matchSearch = !searchTerm || p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) || p.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchSearch) return false;
      if (categoriaActiva === null) return true;

      const selectedCatObj = (categorias || []).find(c => (c.id || c.idCategoriaProducto) === categoriaActiva);
      const catName = (selectedCatObj?.nombre || "").toLowerCase().trim();
      const prodCatName = (p.categoria || p.categoriaNombre || "").toLowerCase().trim();
      const prodName = (p.nombre || "").toLowerCase().trim();

      const matchCatId = (p.idCategoriaProducto === categoriaActiva) || (p.categoriaId === categoriaActiva) || (p.id === categoriaActiva);
      const matchCatName = catName && (prodCatName === catName || prodCatName.includes(catName) || catName.includes(prodCatName));

      const singularCatName = catName.endsWith("es") ? catName.slice(0, -2) : (catName.endsWith("s") ? catName.slice(0, -1) : catName);
      const matchSubcategory = singularCatName.length >= 3 && (
        prodCatName.includes(singularCatName) || prodName.includes(singularCatName)
      );

      return matchCatId || matchCatName || matchSubcategory;
    });
  }, [productos, categoriaActiva, searchTerm, categorias]);

  return (
    <div className="w-full min-h-screen bg-[#f4f4f4] dark:bg-gray-950 p-3 sm:p-4 lg:p-5 pb-24 lg:pb-5 transition-colors">
      <div className="w-full">
        {/* Header */}
        <header className="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-1 py-1">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f05454] text-xl shadow-[0_8px_20px_rgba(240,84,84,0.35)] text-white shrink-0">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#7a8394] dark:text-gray-400">Ventas</p>
                <h1 className="text-[1.6rem] sm:text-[1.9rem] font-black leading-none text-[#1f2d3d] dark:text-gray-100">Punto de Venta</h1>
              </div>
            </div>

            {/* Mobile quick cart badge */}
            <button
              type="button"
              onClick={() => setIsMobileCartOpen(true)}
              className="lg:hidden relative flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fef2f2] dark:bg-red-900/30 text-[#f05454] dark:text-red-400 border border-red-200 dark:border-red-800 shrink-0"
              aria-label="Ver carrito"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#f05454] text-[10px] font-black text-white">
                  {totalCartItems}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-[#dfe5ec] dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-2 shadow-sm flex-1 sm:flex-initial">
            <Search className="h-4 w-4 text-[#75859a] dark:text-gray-400 shrink-0" />
            <input
              aria-label="Buscar producto"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 border-0 bg-transparent text-sm text-[#25364a] dark:text-gray-100 outline-none placeholder:text-[#8aa0b4] dark:placeholder:text-gray-500"
              placeholder="Buscar producto..."
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </header>

        {/* Mobile Horizontal Categories (Visible only on < lg) */}
        <div className="lg:hidden mb-3.5 overflow-x-auto no-scrollbar pb-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCategoriaActiva(null)}
              className={`shrink-0 flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-xs font-bold transition-all ${
                categoriaActiva === null
                  ? "bg-[#f05454] text-white shadow-[0_4px_12px_rgba(240,84,84,0.3)]"
                  : "bg-white dark:bg-gray-900 text-[#2a3747] dark:text-gray-200 border border-gray-200 dark:border-gray-800"
              }`}
            >
              <span>🍽️</span>
              <span>Todos</span>
            </button>

            {categorias.map((c) => {
              const active = categoriaActiva === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoriaActiva(c.id)}
                  className={`shrink-0 flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-xs font-bold transition-all ${
                    active
                      ? "bg-[#f05454] text-white shadow-[0_4px_12px_rgba(240,84,84,0.3)]"
                      : "bg-white dark:bg-gray-900 text-[#2a3747] dark:text-gray-200 border border-gray-200 dark:border-gray-800"
                  }`}
                >
                  <span>{getCategoryEmoji(c.nombre)}</span>
                  <span>{c.nombre}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3 Column Flex Layout */}
        <div className="flex flex-col lg:flex-row gap-4 w-full items-start">
          {/* Categorías (Left Column - Desktop only) */}
          <aside className="hidden lg:block lg:w-[180px] shrink-0 rounded-[24px] border border-[#e7eaee] dark:border-gray-800 bg-white dark:bg-gray-900 p-3.5 shadow-sm sticky top-4 self-start">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-black text-[#1f2d3d] dark:text-gray-100">Categorías</h2>
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#fef2f2] dark:bg-red-900/30 text-[#f05454] dark:text-red-400">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
            </div>

            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => setCategoriaActiva(null)}
                className={`flex w-full items-center gap-2.5 rounded-2xl px-3 py-2 text-left text-xs font-bold transition-all ${
                  categoriaActiva === null
                    ? "bg-[#f05454] text-white shadow-[0_8px_16px_rgba(240,84,84,0.25)]"
                    : "bg-[#f5f6f8] dark:bg-gray-800 text-[#2a3747] dark:text-gray-200 hover:bg-[#eef2f7] dark:hover:bg-gray-700"
                }`}
              >
                <span className="text-base">🍽️</span>
                <span className="truncate">Todos</span>
              </button>

              {categorias.map((c) => {
                const active = categoriaActiva === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategoriaActiva(c.id)}
                    className={`flex w-full items-center gap-2.5 rounded-2xl px-3 py-2 text-left text-xs font-bold transition-all ${
                      active
                        ? "bg-[#f05454] text-white shadow-[0_8px_16px_rgba(240,84,84,0.25)]"
                        : "bg-[#f5f6f8] dark:bg-gray-800 text-[#2a3747] dark:text-gray-200 hover:bg-[#eef2f7] dark:hover:bg-gray-700"
                    }`}
                  >
                    <span className="text-base">{getCategoryEmoji(c.nombre)}</span>
                    <span className="truncate">{c.nombre}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Productos (Center Main Grid) */}
          <main className="flex-1 min-w-0 rounded-[24px] border border-[#e7eaee] dark:border-gray-800 bg-[#f8f8f8] dark:bg-gray-900/60 p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-xl font-black text-[#1f2d3d] dark:text-gray-100">Productos</h2>
              <div className="rounded-full bg-[#edf2f7] dark:bg-gray-800 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-[#5f7285] dark:text-gray-300">
                {visibleProducts.length} items
              </div>
            </div>

            {visibleProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-[20px] border-2 border-dashed border-[#dbe3ed] dark:border-gray-700 bg-white dark:bg-gray-900 px-6 py-14 text-center text-[#75859a] dark:text-gray-400">
                <p className="text-lg font-bold text-[#445366] dark:text-gray-200">No se encontraron productos</p>
                <p className="mt-1 text-xs text-[#7a8698] dark:text-gray-400">Intenta seleccionando otra categoría o cambiando la búsqueda.</p>
              </div>
            ) : (
              <div className="grid gap-3.5 sm:gap-4 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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

          {/* Carrito (Right Column Panel - Desktop only) */}
          <section className="hidden lg:block lg:w-[285px] shrink-0 sticky top-4 self-start">
            <Cart
              cart={cart}
              increment={increment}
              decrement={decrement}
              setItemObservacion={setItemObservacion}
              onOpenCheckout={() => setIsCheckoutModalOpen(true)}
              submitOrder={() => submitOrder()}
              loading={loading}
              subtotal={subtotal}
              descuento={descuento}
              total={total}
            />
          </section>
        </div>
      </div>

      {/* Mobile Floating Cart Action Bar (< lg) */}
      {totalCartItems > 0 && (
        <div className="lg:hidden fixed bottom-3 inset-x-3 z-40">
          <div className="bg-gray-900/95 dark:bg-gray-900/95 backdrop-blur-md text-white rounded-2xl p-3 shadow-2xl border border-gray-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#f05454] text-white shrink-0">
                <ShoppingBag className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#f05454] text-[10px] font-black">
                  {totalCartItems}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  Total
                </p>
                <p className="text-base font-black text-white truncate">
                  ${Number(total || 0).toLocaleString("es-CO")}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCheckoutModalOpen(true)}
              className="px-4 py-2.5 bg-[#f05454] hover:bg-[#e04545] text-white font-black text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
            >
              <span>Finalizar Pedido</span>
              <ChevronRight className="h-4 w-4 stroke-[3]" />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Slide-up Modal Drawer */}
      {isMobileCartOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
          <div
            className="fixed inset-0"
            onClick={() => setIsMobileCartOpen(false)}
            aria-hidden="true"
          />

          <div className="relative z-10 w-full sm:max-w-md max-h-[85vh] bg-[#f8f8f8] dark:bg-gray-900 rounded-t-[28px] sm:rounded-[28px] shadow-2xl overflow-hidden flex flex-col border border-gray-200 dark:border-gray-800">
            <Cart
              cart={cart}
              increment={increment}
              decrement={decrement}
              setItemObservacion={setItemObservacion}
              onOpenCheckout={() => {
                setIsMobileCartOpen(false);
                setIsCheckoutModalOpen(true);
              }}
              submitOrder={() => submitOrder()}
              loading={loading}
              subtotal={subtotal}
              descuento={descuento}
              total={total}
              onClose={() => setIsMobileCartOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Pos Checkout Modal */}
      <PosCheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        cart={cart}
        subtotal={subtotal}
        descuento={descuento}
        total={total}
        onConfirm={handleConfirmCheckout}
        loading={loading}
      />
    </div>
  );
}

