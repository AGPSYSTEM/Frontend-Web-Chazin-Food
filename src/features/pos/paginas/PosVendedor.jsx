import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ChefHat,
  ArrowLeft,
  Sparkles,
  Utensils,
  ShoppingBag,
  Store,
  TrendingUp,
  Users,
  UtensilsCrossed,
  Layers
} from "lucide-react";
import usePOS from "../hooks/usePOS";
import KioskPromoCarousel from "../components/KioskPromoCarousel";
import KioskCategoryRail from "../components/KioskCategoryRail";
import KioskProductCard from "../components/KioskProductCard";
import KioskBottomBar from "../components/KioskBottomBar";
import KioskOrderReviewModal from "../components/KioskOrderReviewModal";
import PosCheckoutModal from "../components/PosCheckoutModal";
import KioskConfirmation from "../components/KioskConfirmation";
import KioskCancelConfirmModal from "../components/KioskCancelConfirmModal";
import FastFoodProductModal from "@/shared/components/ui/FastFoodProductModal";
import { adicionesService } from "@/features/compras/servicios/adicionesService";
import { fichasTecnicasService } from "@/features/fichas-tecnicas/servicios/fichasTecnicasService";
import { useAuth } from "@/features/autenticacion/hooks/useAuth";
import logoImg from "@/shared/assets/ChatGPT_Image_1_jun_2026__21_55_04.png";

export default function PosVendedor() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const rawRol = typeof user?.rol === "object" ? user?.rol?.nombre : user?.rol;
  const userRol = String(rawRol || "").toLowerCase().trim();
  const isAdmin = userRol === "administrador" || userRol === "admin" || user?.idRol === 1;

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

  // Kiosk State: Inicia directamente en "catalog" (sección de crear venta)
  const [kioskStep, setKioskStep] = useState("catalog");
  const [orderMode, setOrderMode] = useState("Comer aquí"); // "Comer aquí" | "Para llevar"

  // Product Customization Modal (FastFoodProductModal anterior con mise en place, adiciones, gaseosas y reseñas)
  const [customizingProduct, setCustomizingProduct] = useState(null);
  const [customizingFicha, setCustomizingFicha] = useState(null);
  const [allAdiciones, setAllAdiciones] = useState([]);
  const [fichasCache, setFichasCache] = useState({});

  // Review & Checkout Modals
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);

  // Animation bounce feedback
  const [isCartBouncing, setIsCartBouncing] = useState(false);

  // Result of completed order
  const [lastCreatedOrder, setLastCreatedOrder] = useState(null);
  const [lastOrderData, setLastOrderData] = useState(null);

  // Load additions
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
      .catch((err) => console.warn("Error cargando adiciones en POS:", err));
  }, []);

  // Bebidas para combos y acompañantes
  const allBebidas = useMemo(() => {
    return (productos || []).filter((p) => {
      const cat = String(p.categoria || p.categoriaNombre || "").toLowerCase();
      const name = String(p.nombre || "").toLowerCase();
      return (
        cat.includes("bebida") ||
        cat.includes("gaseos") ||
        cat.includes("refresco") ||
        name.includes("gaseosa") ||
        name.includes("agua")
      );
    });
  }, [productos]);

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
    // Priorizar productos con eventos de primero
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

  // Open FastFoodProductModal (el modal anterior completo)
  const handleOpenCustomize = async (producto) => {
    setCustomizingProduct(producto);
    const prodId = producto.id || producto.idProducto;
    if (fichasCache[prodId]) {
      setCustomizingFicha(fichasCache[prodId]);
      return;
    }

    try {
      const f = await fichasTecnicasService.getFichaByProducto(prodId);
      if (f) {
        setFichasCache((prev) => ({ ...prev, [prodId]: f }));
        setCustomizingFicha(f);
      } else {
        setCustomizingFicha(null);
      }
    } catch (e) {
      console.warn("No se pudo cargar ficha técnica para producto:", prodId);
      setCustomizingFicha(null);
    }
  };

  // Confirm product customization from FastFoodProductModal
  const handleModalConfirm = ({
    producto,
    cantidad,
    adiciones,
    bebidas,
    observacion
  }) => {
    const displayName = producto.nombrePersonalizado || producto.nombre;
    addProduct({
      productoId: producto.idProducto || producto.id,
      varianteId: producto.idVariante || producto.id || producto.idProducto,
      nombre: displayName,
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
      is2x1Promo: Boolean(producto.is2x1Promo),
      cantidadCocina: producto.cantidadCocina || (producto.is2x1Promo ? (Number(cantidad) || 1) * 2 : (Number(cantidad) || 1))
    });

    let comboCfg = producto.configuracionCombo;
    if (typeof comboCfg === "string") {
      try { comboCfg = JSON.parse(comboCfg); } catch (e) { comboCfg = null; }
    }
    const isComboProd = Boolean(comboCfg?.esCombo);
    const requiredDrinks = isComboProd ? (Number(comboCfg.cantidadBebidas) || 1) : 0;
    let includedQuotaRemaining = requiredDrinks;

    if (Array.isArray(bebidas) && bebidas.length > 0) {
      for (const b of bebidas) {
        const qty = Number(b.cantidad || 1);
        const covered = isComboProd ? Math.min(includedQuotaRemaining, qty) : 0;
        const extraQty = qty - covered;
        if (isComboProd) includedQuotaRemaining -= covered;

        if (!isComboProd || extraQty > 0) {
          addProduct({
            productoId: b.id || b.idProducto,
            varianteId: b.id || b.idProducto,
            nombre: isComboProd ? `${b.nombre} (Bebida Extra)` : b.nombre,
            precio: Number(b.precio || 0),
            adiciones: [],
            observacion: isComboProd ? `Bebida extra de ${displayName}` : `Acompañante de ${displayName}`,
            cantidad: isComboProd ? extraQty : qty,
            stock: b.stock
          });
        }
      }
    }

    setCustomizingProduct(null);
    setCustomizingFicha(null);

    // Bouncing animation on cart
    setIsCartBouncing(true);
    setTimeout(() => setIsCartBouncing(false), 600);
  };

  // Complete checkout via PosCheckoutModal (modal de pago anterior)
  const handleConfirmCheckout = async (checkoutData) => {
    try {
      const res = await submitOrder({
        ...checkoutData,
        tipoEntrega: orderMode === "Comer aquí" ? "En Mesa" : "Recoger",
        empaqueParaLlevar: orderMode === "Para llevar"
      });
      setLastCreatedOrder(res);
      setLastOrderData(checkoutData);
      setIsCheckoutOpen(false);
      setIsReviewOpen(false);
      setKioskStep("confirmation");
    } catch (err) {
      console.error("Error al registrar venta en POS:", err);
    }
  };

  // Reset after order completion
  const handleResetKiosk = useCallback(() => {
    clearCart();
    setOrderMode("Comer aquí");
    setKioskStep("catalog");
    setLastCreatedOrder(null);
    setLastOrderData(null);
    setIsReviewOpen(false);
    setIsCheckoutOpen(false);
    setIsCancelConfirmOpen(false);
  }, [clearCart]);

  // Staff discrete exit handler (volver a gestión de ventas)
  const handleStaffExit = () => {
    navigate("/ventas/gestion-ventas");
  };

  // Step 2: Confirmation Screen
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

  // Step 1: Catalog & Ordering Screen (Entra de una vez a crear venta)
  return (
    <div className="relative min-h-screen w-full bg-[#FAFAFA] flex flex-col justify-between select-none pb-28">
      {/* Top Header: Logo, Accesos directos a los módulos del Vendedor & Estado de Usuario */}
      <header className="w-full bg-white dark:bg-gray-900 border-b-2 border-gray-150 dark:border-gray-800 shadow-2xs sticky top-0 z-30 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Brand & Título */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-xs border border-amber-300">
            <img src={logoImg} alt="Chazin Food" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="text-[10px] font-black tracking-widest text-[#A91B2E] uppercase">
              Chazin Food
            </span>
            <h1 className="text-sm sm:text-lg font-black text-gray-900 dark:text-gray-100 leading-none">
              Punto de Venta
            </h1>
          </div>
        </div>

        {/* ═══ MÓDULOS CON ACCESO DEL VENDEDOR (Arriba en lugar de Comer aquí / Para llevar) ═══ */}
        <nav aria-label="Módulos accesibles" className="flex items-center gap-1 sm:gap-1.5 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xs overflow-x-auto no-scrollbar">
          {/* Punto de Venta (Activo) */}
          <Link
            to="/ventas/pos"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black bg-[#A91B2E] text-white shadow-xs transition-all shrink-0"
            title="Punto de Venta (Crear Venta)"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Punto de Venta</span>
          </Link>

          {/* Gestión de Ventas */}
          <Link
            to="/ventas/gestion-ventas"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-gray-900 hover:bg-white dark:hover:bg-gray-700 transition-all shrink-0"
            title="Gestión de Ventas"
          >
            <TrendingUp className="w-3.5 h-3.5 text-[#A91B2E]" />
            <span>Ventas</span>
          </Link>

          {/* Clientes */}
          <Link
            to="/ventas/clientes"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-gray-900 hover:bg-white dark:hover:bg-gray-700 transition-all shrink-0"
            title="Clientes"
          >
            <Users className="w-3.5 h-3.5 text-blue-500" />
            <span>Clientes</span>
          </Link>

          {/* Separador visual */}
          <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-0.5 shrink-0" />

          {/* Gestión de Producción */}
          <Link
            to="/produccion/gestion"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-gray-900 hover:bg-white dark:hover:bg-gray-700 transition-all shrink-0"
            title="Gestión de Producción"
          >
            <ChefHat className="w-3.5 h-3.5 text-amber-500" />
            <span>Producción</span>
          </Link>

          {/* Productos */}
          <Link
            to="/ventas/productos"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-gray-900 hover:bg-white dark:hover:bg-gray-700 transition-all shrink-0"
            title="Productos"
          >
            <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-500" />
            <span>Productos</span>
          </Link>

          {/* Fichas Técnicas */}
          <Link
            to="/ventas/fichas-tecnicas"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-gray-900 hover:bg-white dark:hover:bg-gray-700 transition-all shrink-0"
            title="Fichas Técnicas"
          >
            <Layers className="w-3.5 h-3.5 text-purple-500" />
            <span>Fichas</span>
          </Link>
        </nav>

        {/* User Role Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden sm:inline">{user?.nombre || "Usuario"}</span>
            <span className="text-[10px] bg-red-100 dark:bg-red-950/50 text-[#A91B2E] dark:text-red-400 px-2 py-0.5 rounded-md font-black capitalize">
              {userRol || "Vendedor"}
            </span>
          </div>
        </div>
      </header>

      {/* Main Kiosk Area: Vertical Category Rail (Left) + Products Grid (Center) */}
      <main className="w-full flex-1 flex gap-3 sm:gap-4 p-3 sm:p-5 items-start">
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
            onSelectProduct={handleOpenCustomize}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {visibleProducts.map((p) => (
                  <KioskProductCard
                    key={p.id || p.idProducto}
                    producto={p}
                    onSelect={handleOpenCustomize}
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

      {/* Modal anterior completo: FastFoodProductModal (mise en place, adiciones, gaseosas y reseñas) */}
      <FastFoodProductModal
        isOpen={Boolean(customizingProduct)}
        onClose={() => {
          setCustomizingProduct(null);
          setCustomizingFicha(null);
        }}
        producto={customizingProduct}
        ficha={customizingFicha}
        allAdiciones={allAdiciones}
        allBebidas={allBebidas}
        onConfirm={handleModalConfirm}
        mode="pos"
      />

      {/* Order Review Modal "Mi Pedido" */}
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

      {/* Modal de Pago Anterior: PosCheckoutModal (clientes, fidelidad, cálculo de vuelto, 16 dígitos de tarjeta) */}
      <PosCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        subtotal={subtotal}
        descuento={descuento}
        total={total}
        onConfirm={handleConfirmCheckout}
        loading={loading}
      />

      {/* Cancel Confirmation Modal */}
      <KioskCancelConfirmModal
        isOpen={isCancelConfirmOpen}
        onClose={() => setIsCancelConfirmOpen(false)}
        onConfirmCancel={() => {
          setIsCancelConfirmOpen(false);
          handleResetKiosk();
        }}
      />
    </div>
  );
}
