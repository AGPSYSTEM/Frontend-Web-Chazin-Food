import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChefHat, ArrowLeft, Sparkles, Utensils, ShoppingBag } from "lucide-react";
import usePOS from "../hooks/usePOS";
import KioskWelcome from "../components/KioskWelcome";
import KioskPromoCarousel from "../components/KioskPromoCarousel";
import KioskCategoryRail from "../components/KioskCategoryRail";
import KioskProductCard from "../components/KioskProductCard";
import KioskProductModal from "../components/KioskProductModal";
import KioskBottomBar from "../components/KioskBottomBar";
import KioskOrderReviewModal from "../components/KioskOrderReviewModal";
import KioskCheckoutModal from "../components/KioskCheckoutModal";
import KioskConfirmation from "../components/KioskConfirmation";
import KioskInactivityModal from "../components/KioskInactivityModal";
import KioskCancelConfirmModal from "../components/KioskCancelConfirmModal";
import { adicionesService } from "@/features/compras/servicios/adicionesService";
import logoImg from "@/shared/assets/ChatGPT_Image_1_jun_2026__21_55_04.png";

export default function PosVendedor() {
  const navigate = useNavigate();

  const {
    categorias,
    productos,
    categoriaActiva,
    setCategoriaActiva,
    cart,
    addProduct,
    increment,
    decrement,
    removeItem,
    clearCart,
    subtotal,
    descuento,
    total,
    submitOrder,
    loading
  } = usePOS();

  // Kiosk State Machine: 'welcome' | 'catalog' | 'confirmation'
  const [kioskStep, setKioskStep] = useState("welcome");
  const [orderMode, setOrderMode] = useState("Comer aquí"); // "Comer aquí" | "Para llevar"

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [isInactivityOpen, setIsInactivityOpen] = useState(false);

  // Animations & Feedback
  const [isCartBouncing, setIsCartBouncing] = useState(false);
  const [allAdiciones, setAllAdiciones] = useState([]);

  // Result of completed order
  const [lastCreatedOrder, setLastCreatedOrder] = useState(null);
  const [lastOrderData, setLastOrderData] = useState(null);

  // Load additions once on mount
  useEffect(() => {
    adicionesService
      .getAdiciones()
      .then((res) => {
        if (Array.isArray(res)) {
          setAllAdiciones(
            res.filter(
              (a) => a.estado === 1 || a.estado === "Activo" || a.estado === undefined
            )
          );
        }
      })
      .catch((err) => console.warn("Error cargando adiciones en Kiosco:", err));
  }, []);

  // Total items in cart
  const totalCartItems = useMemo(() => {
    return cart.reduce((acc, it) => acc + (it.cantidad || 1), 0);
  }, [cart]);

  // Count active event products
  const eventProductsCount = useMemo(() => {
    const now = new Date();
    return (productos || []).filter((p) => {
      const evts = Array.isArray(p.eventos) ? p.eventos : [];
      return evts.some((e) => {
        if (e.estado !== 1 && e.estado !== "Activo" && e.estado !== undefined) return false;
        if (e.fechaFin && now > new Date(`${e.fechaFin}T23:59:59`)) return false;
        if (e.fechaInicio && now < new Date(`${e.fechaInicio}T00:00:00`)) return false;
        return true;
      });
    }).length;
  }, [productos]);

  // Filter products by selected category
  const visibleProducts = useMemo(() => {
    const list = (productos || []).filter((p) => {
      if (categoriaActiva === null) return true;

      if (categoriaActiva === "eventos") {
        const evts = Array.isArray(p.eventos) ? p.eventos : [];
        const now = new Date();
        return evts.some((e) => {
          if (e.estado !== 1 && e.estado !== "Activo" && e.estado !== undefined) return false;
          if (e.fechaFin && now > new Date(`${e.fechaFin}T23:59:59`)) return false;
          if (e.fechaInicio && now < new Date(`${e.fechaInicio}T00:00:00`)) return false;
          return true;
        });
      }

      const selectedCatObj = (categorias || []).find(
        (c) => (c.id || c.idCategoriaProducto) === categoriaActiva
      );
      const catName = (selectedCatObj?.nombre || "").toLowerCase().trim();
      const prodCatName = (p.categoria || p.categoriaNombre || "").toLowerCase().trim();
      const prodName = (p.nombre || "").toLowerCase().trim();

      const matchCatId =
        p.idCategoriaProducto === categoriaActiva ||
        p.categoriaId === categoriaActiva ||
        p.id === categoriaActiva;
      const matchCatName =
        catName &&
        (prodCatName === catName ||
          prodCatName.includes(catName) ||
          catName.includes(prodCatName));

      const singularCatName = catName.endsWith("es")
        ? catName.slice(0, -2)
        : catName.endsWith("s")
        ? catName.slice(0, -1)
        : catName;
      const matchSubcategory =
        singularCatName.length >= 3 &&
        (prodCatName.includes(singularCatName) || prodName.includes(singularCatName));

      return matchCatId || matchCatName || matchSubcategory;
    });

    const now = new Date();
    // Prioritize event products first
    return [...list].sort((a, b) => {
      const aEvts = Array.isArray(a.eventos) ? a.eventos : [];
      const bEvts = Array.isArray(b.eventos) ? b.eventos : [];
      const aHasEvent = aEvts.some(
        (e) =>
          (e.estado === 1 || e.estado === "Activo" || e.estado === undefined) &&
          (!e.fechaFin || now <= new Date(`${e.fechaFin}T23:59:59`))
      );
      const bHasEvent = bEvts.some(
        (e) =>
          (e.estado === 1 || e.estado === "Activo" || e.estado === undefined) &&
          (!e.fechaFin || now <= new Date(`${e.fechaFin}T23:59:59`))
      );
      if (aHasEvent && !bHasEvent) return -1;
      if (!aHasEvent && bHasEvent) return 1;
      return 0;
    });
  }, [productos, categoriaActiva, categorias]);

  // Inactivity timeout handler (60s without touch in catalog)
  useEffect(() => {
    if (kioskStep !== "catalog") return;

    let timeoutId;
    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsInactivityOpen(true);
      }, 60000); // 60s
    };

    const events = ["touchstart", "touchend", "mousedown", "keydown", "scroll"];
    events.forEach((evt) => window.addEventListener(evt, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach((evt) => window.removeEventListener(evt, resetTimer));
    };
  }, [kioskStep]);

  // Reset entire kiosk state
  const handleResetKiosk = useCallback(() => {
    clearCart();
    setOrderMode("Comer aquí");
    setKioskStep("welcome");
    setLastCreatedOrder(null);
    setLastOrderData(null);
    setIsProductModalOpen(false);
    setIsReviewOpen(false);
    setIsCheckoutOpen(false);
    setIsCancelConfirmOpen(false);
    setIsInactivityOpen(false);
  }, [clearCart]);

  // Start ordering from Welcome screen
  const handleSelectOrderMode = (mode) => {
    setOrderMode(mode);
    setKioskStep("catalog");
  };

  // Open product modal
  const handleOpenProduct = (producto) => {
    setSelectedProduct(producto);
    setIsProductModalOpen(true);
  };

  // Add product to cart with bounce feedback
  const handleConfirmAddProduct = ({
    producto,
    cantidad,
    adiciones,
    observacion,
    is2x1Promo
  }) => {
    addProduct({
      productoId: producto.idProducto || producto.id,
      varianteId: producto.idVariante || producto.id || producto.idProducto,
      nombre: producto.nombre,
      precio: producto.precio,
      adiciones: (adiciones || []).map((a) => ({
        idAdicion: a.idAdicion || a.id,
        id: a.idAdicion || a.id,
        nombre: a.nombre,
        precio: Number(a.precio || 0),
        cantidad: Number(a.cantidad || 1),
        imagen: a.imagen || ""
      })),
      observacion,
      cantidad: Number(cantidad) || 1,
      stock: producto.stock,
      is2x1Promo: Boolean(is2x1Promo),
      cantidadCocina: is2x1Promo ? (Number(cantidad) || 1) * 2 : Number(cantidad) || 1
    });

    // Trigger bounce animation on bottom bar
    setIsCartBouncing(true);
    setTimeout(() => setIsCartBouncing(false), 600);
  };

  // Complete checkout
  const handleConfirmCheckout = async (checkoutData) => {
    try {
      const res = await submitOrder(checkoutData);
      setLastCreatedOrder(res);
      setLastOrderData(checkoutData);
      setIsCheckoutOpen(false);
      setIsReviewOpen(false);
      setKioskStep("confirmation");
    } catch (err) {
      console.error("Error al registrar venta en kiosco:", err);
    }
  };

  // Staff discrete exit handler
  const handleStaffExit = () => {
    navigate("/ventas/gestion-ventas");
  };

  // Step 1: Welcome Screen
  if (kioskStep === "welcome") {
    return (
      <KioskWelcome
        onSelectOrderMode={handleSelectOrderMode}
        onExitStaff={handleStaffExit}
      />
    );
  }

  // Step 3: Confirmation Screen
  if (kioskStep === "confirmation") {
    const orderNumber =
      lastCreatedOrder?.idVenta ||
      lastCreatedOrder?.id ||
      lastCreatedOrder?.data?.idVenta ||
      "042";

    return (
      <KioskConfirmation
        orderId={orderNumber}
        orderData={lastOrderData}
        onReset={handleResetKiosk}
      />
    );
  }

  // Step 2: Catalog & Ordering Screen
  return (
    <div className="relative min-h-screen w-full bg-[#FAFAFA] flex flex-col justify-between select-none pb-28">
      {/* Top Header: Logo, Current Order Mode Pill & Discrete Staff Icon */}
      <header className="w-full bg-white border-b-2 border-gray-150 shadow-2xs sticky top-0 z-30 px-4 sm:px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-xs border border-amber-300">
            <img src={logoImg} alt="Chazin Food" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="text-[10px] font-black tracking-widest text-[#A91B2E] uppercase">
              Chazin Food
            </span>
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-gray-900">
                Punto de Venta
              </span>
              <span className="text-xs font-black bg-red-100 text-[#A91B2E] px-2.5 py-0.5 rounded-full border border-red-200">
                {orderMode}
              </span>
            </div>
          </div>
        </div>

        {/* Staff Discrete Exit Button */}
        <button
          type="button"
          onClick={handleStaffExit}
          aria-label="Volver a Gestión de Ventas"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 text-xs font-bold transition-all cursor-pointer opacity-75 hover:opacity-100"
          title="Gestión de Ventas (Personal)"
        >
          <ChefHat className="w-4 h-4 text-[#A91B2E]" />
          <span className="hidden sm:inline">Personal</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>
      </header>

      {/* Main Kiosk Area: Vertical Category Rail (Left) + Products Grid (Center) */}
      <main className="w-full max-w-7xl mx-auto flex-1 flex gap-3 sm:gap-4 p-3 sm:p-5 items-start">
        {/* Left Category Rail */}
        <KioskCategoryRail
          categorias={categorias}
          categoriaActiva={categoriaActiva}
          onSelectCategoria={setCategoriaActiva}
          eventCount={eventProductsCount}
        />

        {/* Right / Center Products Content Area */}
        <section className="flex-1 min-w-0 flex flex-col">
          {/* Top Promo Carousel */}
          <KioskPromoCarousel
            productos={productos}
            onSelectProduct={handleOpenProduct}
          />

          {/* Products Grid */}
          <div className="flex-1">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                {categoriaActiva === null
                  ? "Todos los Productos"
                  : categoriaActiva === "eventos"
                  ? "Promociones y Ofertas"
                  : (categorias.find((c) => (c.id || c.idCategoriaProducto) === categoriaActiva)?.nombre || "Menú")}
              </h2>
              <span className="text-xs font-black uppercase tracking-wider text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                {visibleProducts.length} {visibleProducts.length === 1 ? "producto" : "productos"}
              </span>
            </div>

            {visibleProducts.length === 0 ? (
              <div className="w-full py-16 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 bg-white text-center p-6">
                <Utensils className="w-12 h-12 text-gray-300 mb-2" />
                <p className="text-lg font-black text-gray-700">No hay productos en esta categoría</p>
                <p className="text-sm font-semibold text-gray-400 mt-1">Selecciona otra categoría a la izquierda</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {visibleProducts.map((p) => (
                  <KioskProductCard
                    key={p.id || p.idProducto}
                    producto={p}
                    onSelect={handleOpenProduct}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Fixed Bottom Bar: Cart item count, total, "Ver mi pedido" and "Cancelar pedido" */}
      <KioskBottomBar
        totalItems={totalCartItems}
        total={total}
        orderMode={orderMode}
        onOpenReview={() => setIsReviewOpen(true)}
        onCancelOrder={() => setIsCancelConfirmOpen(true)}
        isBouncing={isCartBouncing}
      />

      {/* Product Customization Modal (Radix Dialog) */}
      <KioskProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        producto={selectedProduct}
        allAdiciones={allAdiciones}
        onConfirmAdd={handleConfirmAddProduct}
      />

      {/* Order Review Modal "Mi Pedido" (Radix Dialog) */}
      <KioskOrderReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        cart={cart}
        orderMode={orderMode}
        onChangeOrderMode={setOrderMode}
        onIncrement={increment}
        onDecrement={decrement}
        onRemoveItem={removeItem}
        subtotal={subtotal}
        descuento={descuento}
        total={total}
        onProceedToCheckout={() => {
          setIsReviewOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout Modal (Radix Dialog) */}
      <KioskCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        orderMode={orderMode}
        subtotal={subtotal}
        descuento={descuento}
        total={total}
        onConfirmCheckout={handleConfirmCheckout}
        loading={loading}
      />

      {/* Cancel Confirmation Modal (Radix Dialog) */}
      <KioskCancelConfirmModal
        isOpen={isCancelConfirmOpen}
        onClose={() => setIsCancelConfirmOpen(false)}
        onConfirmCancel={() => {
          setIsCancelConfirmOpen(false);
          handleResetKiosk();
        }}
      />

      {/* 60s Inactivity Modal (Radix Dialog) */}
      <KioskInactivityModal
        isOpen={isInactivityOpen}
        onStayActive={() => setIsInactivityOpen(false)}
        onTimeout={() => {
          setIsInactivityOpen(false);
          handleResetKiosk();
        }}
      />
    </div>
  );
}
