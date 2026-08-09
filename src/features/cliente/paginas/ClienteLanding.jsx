import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, LogIn, ShoppingCart, User, Search, Package, Clock, X, Plus, Minus, FileText, ChevronUp, ChevronDown, CheckCircle, MapPin, CreditCard, Banknote, Smartphone, RefreshCw, Sun, Moon } from "lucide-react";
import { useAuth } from "@/features/autenticacion/hooks/useAuth";
import { useDarkMode } from "@/shared/hooks/useDarkMode";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { useCart } from "@/shared/context/CartContext";
import logoImg from "@/shared/assets/ChatGPT_Image_1_jun_2026__21_55_04.png";
import { ClientePerfilModal } from "../componentes/ClientePerfilModal";
import { ventasService } from "@/features/ventas/servicios/ventasService";
import { categoriaProductosService } from "@/features/ventas/servicios/categoriaProductosService";
import { productosService } from "@/features/ventas/servicios/productosService";

const defaultCategoryIcons = {
  "hamburguesas": { icon: "🍔", color: "from-yellow-400 to-orange-500" },
  "salchipapas": { icon: "🍟", color: "from-yellow-500 to-amber-600" },
  "perros calientes": { icon: "🌭", color: "from-orange-400 to-red-500" },
  "perros": { icon: "🌭", color: "from-orange-400 to-red-500" },
  "pollo": { icon: "🍗", color: "from-amber-500 to-orange-600" },
  "bebidas": { icon: "🥤", color: "from-blue-400 to-blue-600" },
  "refrescos": { icon: "🥤", color: "from-blue-400 to-blue-600" },
  "acompañamientos": { icon: "🥗", color: "from-green-400 to-green-600" },
  "combos": { icon: "🍱", color: "from-purple-400 to-purple-600" },
  "postres": { icon: "🍰", color: "from-pink-400 to-rose-500" },
  "helados": { icon: "🍦", color: "from-indigo-400 to-purple-500" },
  "entradas": { icon: "🧆", color: "from-emerald-400 to-teal-500" },
  "pizzas": { icon: "🍕", color: "from-red-500 to-amber-500" }
};

const getCategoryMeta = (nombre) => {
  const key = String(nombre || "").toLowerCase().trim();
  return defaultCategoryIcons[key] || { icon: "🍽️", color: "from-red-400 to-red-600" };
};

const categoriasDefault = [
  { id: 1, nombre: "Hamburguesas", icon: "🍔", color: "from-yellow-400 to-orange-500" },
  { id: 2, nombre: "Salchipapas", icon: "🍟", color: "from-yellow-500 to-amber-600" },
  { id: 3, nombre: "Perros Calientes", icon: "🌭", color: "from-orange-400 to-red-500" },
  { id: 4, nombre: "Pollo", icon: "🍗", color: "from-amber-500 to-orange-600" },
  { id: 5, nombre: "Bebidas", icon: "🥤", color: "from-blue-400 to-blue-600" },
  { id: 6, nombre: "Acompañamientos", icon: "🥗", color: "from-green-400 to-green-600" },
  { id: 8, nombre: "Combos", icon: "🍱", color: "from-purple-400 to-purple-600" }
];

const productosDefault = [
  { id: 1, nombre: "Hamburguesa Especial", precio: 15000, categoria: 1, imagen: "🍔", descripcion: "Doble carne, queso, lechuga, tomate y salsas", stock: 25 },
  { id: 2, nombre: "Salchipapa Grande", precio: 12000, categoria: 2, imagen: "🍟", descripcion: "Papas fritas con salchicha y salsas", stock: 30 },
  { id: 3, nombre: "Perro Caliente Especial", precio: 10000, categoria: 3, imagen: "🌭", descripcion: "Hot dog con salsas y papa chip", stock: 20 },
  { id: 4, nombre: "Pollo Broaster", precio: 18000, categoria: 4, imagen: "🍗", descripcion: "Porción de pollo con papas", stock: 15 },
  { id: 5, nombre: "Coca Cola", precio: 3000, categoria: 5, imagen: "🥤", descripcion: "Gaseosa 350ml", stock: 60 },
  { id: 6, nombre: "Combo Familiar", precio: 45000, categoria: 8, imagen: "🍱", descripcion: "2 hamburguesas, salchipapa y bebidas", stock: 12 }
];

const adicionesDisponibles = [
  { idAdicion: 1, nombre: "Salsa BBQ", precio: 1000, stockActual: 50, tipo: "Salsa", imagen: "🥫" },
  { idAdicion: 2, nombre: "Salsa de Ajo", precio: 1000, stockActual: 45, tipo: "Salsa", imagen: "🧄" },
  { idAdicion: 3, nombre: "Salsa Picante", precio: 1000, stockActual: 40, tipo: "Salsa", imagen: "🌶️" },
  { idAdicion: 4, nombre: "Queso Extra", precio: 2000, stockActual: 30, tipo: "Ingrediente", imagen: "🧀" },
  { idAdicion: 5, nombre: "Tocineta", precio: 3000, stockActual: 25, tipo: "Ingrediente", imagen: "🥓" },
  { idAdicion: 6, nombre: "Papas Fritas", precio: 5000, stockActual: 35, tipo: "Acompañamiento", imagen: "🍟" },
  { idAdicion: 7, nombre: "Coca Cola", precio: 3000, stockActual: 60, tipo: "Bebida", imagen: "🥤" },
  { idAdicion: 8, nombre: "Sprite", precio: 3000, stockActual: 55, tipo: "Bebida", imagen: "🥤" }
];

const fichasTecnicas = {
  1: { ingredientes: ["Carne de res 150g", "Pan artesanal", "Lechuga", "Tomate", "Queso cheddar", "Salsas especiales"], peso: "350g", tamano: "Regular", calorias: "620 kcal" },
  2: { ingredientes: ["Papas crinkle 200g", "Salchicha premium 100g", "Queso gratinado", "Salsas de la casa"], peso: "400g", tamano: "Grande", calorias: "720 kcal" },
  3: { ingredientes: ["Salchicha premium", "Pan de perro", "Papa chip", "Queso", "Salsas especiales"], peso: "280g", tamano: "Regular", calorias: "540 kcal" },
  4: { ingredientes: ["Pechuga de pollo broaster 200g", "Papas crinkle", "Ensalada fresca"], peso: "450g", tamano: "Grande", calorias: "680 kcal" },
  5: { ingredientes: ["Gaseosa 350ml"], peso: "350ml", tamano: "Regular", calorias: "140 kcal" },
  6: { ingredientes: ["2 Hamburguesas Especiales", "Salchipapa Grande", "Papas Crinkle", "4 Bebidas 350ml"], peso: "1.8kg", tamano: "Familiar", calorias: "2800 kcal" }
};

function FichaTecnicaProductoCliente({ ficha }) {
  const [open, setOpen] = useState(false);
  if (!ficha) return null;
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden mt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <FileText className="w-4 h-4 text-red-500" />
          Ficha Técnica del Producto
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && (
        <div className="p-4 space-y-3 bg-white dark:bg-gray-900">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Peso</p>
              <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{ficha.peso}</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Tamaño</p>
              <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{ficha.tamano}</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Calorías</p>
              <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{ficha.calorias}</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Ingredientes:</p>
            <div className="flex flex-wrap gap-1.5">
              {ficha.ingredientes.map((ing, i) => (
                <span key={i} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full">
                  {ing}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ClienteLanding() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { cart, addToCart, updateQuantity, removeFromCart, clearCart, getTotalItems, getSubtotal } = useCart();
  const [darkMode, toggleDarkMode] = useDarkMode();
  const { success, error, confirmAction, confirmLogout } = useNotifications();

  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [showEmptyCartLoginModal, setShowEmptyCartLoginModal] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const [checkoutNombre, setCheckoutNombre] = useState("");
  const [checkoutDireccion, setCheckoutDireccion] = useState("");
  const [checkoutMetodoPago, setCheckoutMetodoPago] = useState("efectivo");
  const [checkoutEspecificaciones, setCheckoutEspecificaciones] = useState("");
  const [checkoutTipoEntrega, setCheckoutTipoEntrega] = useState("domicilio");
  const [checkoutEfectivoPaga, setCheckoutEfectivoPaga] = useState("");
  const [checkoutTransferReferencia, setCheckoutTransferReferencia] = useState("");
  const [checkoutTransferBanco, setCheckoutTransferBanco] = useState("Bancolombia");
  const [checkoutTarjetaNumero, setCheckoutTarjetaNumero] = useState("");

  const [showPedidos, setShowPedidos] = useState(false);
  const [showPerfil, setShowPerfil] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  const [pedidos, setPedidos] = useState([]);
  const [loadingPedidos, setLoadingPedidos] = useState(false);

  const [categoriasList, setCategoriasList] = useState([]);
  const [productosList, setProductosList] = useState([]);

  // Fetch catalog categories & products dynamically from API
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const [catsRes, prodsRes] = await Promise.allSettled([
          categoriaProductosService.getCategorias(),
          productosService.getProductos()
        ]);

        if (catsRes.status === "fulfilled" && Array.isArray(catsRes.value) && catsRes.value.length > 0) {
          const apiCats = catsRes.value
            .filter(c => c.estado === 'Activo' || c.estado === 1 || c.estado === undefined)
            .map(c => {
              const meta = getCategoryMeta(c.nombre);
              return {
                id: c.id || c.idCategoriaProducto,
                idCategoriaProducto: c.idCategoriaProducto || c.id,
                nombre: c.nombre,
                icon: c.icon || meta.icon,
                color: meta.color
              };
            });
          setCategoriasList(apiCats);
        } else {
          setCategoriasList(categoriasDefault);
        }

        if (prodsRes.status === "fulfilled" && Array.isArray(prodsRes.value) && prodsRes.value.length > 0) {
          const apiProds = prodsRes.value
            .filter(p => p.estado === 'Activo' || p.estado === 1 || p.estado === undefined)
            .map(p => ({
              id: p.id || p.idProducto,
              idProducto: p.idProducto || p.id,
              nombre: p.nombre,
              precio: parseFloat(p.precio || 0),
              categoria: p.idCategoriaProducto || p.categoria,
              categoriaNombre: p.categoria,
              imagen: p.imagen || "🍔",
              descripcion: p.descripcion || "",
              stock: p.stock || 0,
              adiciones: p.adiciones || []
            }));
          setProductosList(apiProds);
        } else {
          setProductosList(productosDefault);
        }
      } catch (e) {
        console.warn("Error cargando catálogo dinámico en ClienteLanding:", e);
        setCategoriasList(categoriasDefault);
        setProductosList(productosDefault);
      }
    };

    fetchCatalog();
  }, []);

  // Fetch client orders from backend
  const fetchMyOrders = async () => {
    if (!isAuthenticated) return;
    try {
      setLoadingPedidos(true);
      const data = await ventasService.getVentas();
      if (data && Array.isArray(data)) {
        // Filter orders for current user
        const userId = user?.idUsuario || user?.id || user?._id;
        const myOrders = data.filter(v => 
          v.idUsuario === userId || 
          v.idCliente === user?.idCliente ||
          v.clienteNombre === `${user?.nombre || ''} ${user?.apellidos || ''}`.trim()
        );
        
        setPedidos(myOrders.map(o => ({
          id: o.idVenta || o.id,
          numeroVenta: o.numeroVenta || `VEN-${String(o.idVenta || o.id).padStart(4, '0')}`,
          fecha: o.fechaVenta ? new Date(o.fechaVenta).toLocaleString('es-CO') : o.fecha || 'Hoy',
          items: o.detalles && o.detalles.length > 0 
            ? o.detalles.map(d => ({ nombre: d.observaciones || `Producto #${d.idVariante}`, cantidad: d.cantidad, precio: d.precioUnitario }))
            : [{ nombre: 'Pedido de comida', cantidad: 1, precio: o.total }],
          total: o.total,
          estado: o.estado || o.estadoEntrega || 'Pendiente'
        })));
      }
    } catch (err) {
      console.log("Error cargando pedidos:", err);
    } finally {
      setLoadingPedidos(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, [isAuthenticated, user]);

  const activeCategorias = categoriasList.length > 0 ? categoriasList : categoriasDefault;
  const activeProductos = productosList.length > 0 ? productosList : productosDefault;

  const productosFiltrados = activeProductos.filter((p) => {
    const matchCategoria = !selectedCategoria || 
      p.categoria === selectedCategoria || 
      p.idCategoriaProducto === selectedCategoria ||
      String(p.categoria) === String(selectedCategoria) ||
      (typeof selectedCategoria === 'string' && String(p.categoriaNombre || '').toLowerCase() === selectedCategoria.toLowerCase());
    const matchSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategoria && matchSearch;
  });

  const handleProductClick = (producto) => {
    if (!isAuthenticated) {
      setShowEmptyCartLoginModal(true);
      return;
    }
    setProductoSeleccionado({
      producto,
      cantidad: 1,
      adicionesSeleccionadas: []
    });
    setShowProductModal(true);
  };

  const handleAdicionToggle = (adicion) => {
    if (!productoSeleccionado) return;
    const exists = productoSeleccionado.adicionesSeleccionadas.find((a) => a.idAdicion === adicion.idAdicion);
    if (exists) {
      setProductoSeleccionado({
        ...productoSeleccionado,
        adicionesSeleccionadas: productoSeleccionado.adicionesSeleccionadas.filter((a) => a.idAdicion !== adicion.idAdicion)
      });
    } else {
      setProductoSeleccionado({
        ...productoSeleccionado,
        adicionesSeleccionadas: [
          ...productoSeleccionado.adicionesSeleccionadas,
          { idAdicion: adicion.idAdicion, nombre: adicion.nombre, precio: adicion.precio, cantidad: 1 }
        ]
      });
    }
  };

  const handleAdicionQuantityChange = (idAdicion, delta) => {
    if (!productoSeleccionado) return;
    setProductoSeleccionado({
      ...productoSeleccionado,
      adicionesSeleccionadas: productoSeleccionado.adicionesSeleccionadas.map((a) => {
        if (a.idAdicion === idAdicion) {
          const newQuantity = Math.max(1, a.cantidad + delta);
          return { ...a, cantidad: newQuantity };
        }
        return a;
      })
    });
  };

  const handleAddToCart = () => {
    if (!productoSeleccionado) return;
    addToCart({
      id: productoSeleccionado.producto.id,
      nombre: productoSeleccionado.producto.nombre,
      precio: productoSeleccionado.producto.precio,
      cantidad: productoSeleccionado.cantidad,
      imagen: productoSeleccionado.producto.imagen,
      adiciones: productoSeleccionado.adicionesSeleccionadas.map((a) => ({
        ...a,
        imagen: a.imagen || adicionesDisponibles.find((ad) => ad.idAdicion === a.idAdicion)?.imagen
      }))
    });
    setShowProductModal(false);
    setProductoSeleccionado(null);
    success("¡Producto agregado!", "El producto se agregó al carrito correctamente");
  };

  const handleAbrirCheckout = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (cart.length === 0) return;
    setCheckoutNombre(user?.nombre ? `${user.nombre} ${user.apellidos || ''}` : "");
    const rawDir = user?.direccion || "";
    let cleanDir = rawDir;
    if (typeof rawDir === 'string' && rawDir.trim().startsWith('{')) {
      try { const p = JSON.parse(rawDir); cleanDir = p.direccion || rawDir; } catch (e) { /* keep raw */ }
    }
    setCheckoutDireccion(cleanDir);
    setCheckoutEspecificaciones("");
    setCheckoutMetodoPago("efectivo");
    setCheckoutTipoEntrega("domicilio");
    setCheckoutEfectivoPaga("");
    setCheckoutTransferReferencia("");
    setCheckoutTransferBanco("Bancolombia");
    setCheckoutTarjetaNumero("");
    setShowCheckout(true);
  };

  const clientSubtotal = getSubtotal();
  const totalCheckout = clientSubtotal;
  const vueltoEfectivo = Math.max(0, Number(checkoutEfectivoPaga || 0) - totalCheckout);

  const handleConfirmarPedido = async () => {
    if (checkoutTipoEntrega === "domicilio" && !checkoutDireccion.trim()) {
      error("Dirección requerida", "Por favor ingresa la dirección de entrega");
      return;
    }
    if (checkoutMetodoPago === "efectivo" && checkoutEfectivoPaga) {
      if (Number(checkoutEfectivoPaga) < totalCheckout) {
        error("Monto insuficiente", "El efectivo entregado es menor al total a pagar");
        return;
      }
    }
    if (checkoutMetodoPago === "transferencia" && !checkoutTransferReferencia.trim()) {
      error("Referencia requerida", "Ingresa el número de referencia de la transferencia");
      return;
    }
    if (checkoutMetodoPago === "tarjeta" && !checkoutTarjetaNumero.trim()) {
      error("Tarjeta requerida", "Ingresa el número de tarjeta");
      return;
    }

    const confirmed = await confirmAction(
      "Confirmar Pedido",
      `Total a pagar: $${totalCheckout.toLocaleString('es-CO')}. ¿Deseas confirmar tu pedido?`,
      "Sí, confirmar"
    );

    if (confirmed) {
      try {
        const tipoEntregaNormalizado = checkoutTipoEntrega === "llevar" ? "Recoger" : "Domicilio";
        const metodoPagoNormalizado = checkoutMetodoPago === "tarjeta" ? "Tarjeta" : checkoutMetodoPago === "transferencia" ? "Transferencia" : "Efectivo";

        const ventaPayload = {
          idCliente: user?.idCliente || null,
          idUsuario: user?.idUsuario || user?.id || user?._id,
          subtotal: clientSubtotal,
          total: totalCheckout,
          tipoEntrega: tipoEntregaNormalizado,
          metodoPago: metodoPagoNormalizado,
          direccion: checkoutDireccion,
          estadoEntrega: "PENDIENTE",
          observaciones: JSON.stringify({
            tipoEntrega: tipoEntregaNormalizado,
            metodoPago: metodoPagoNormalizado,
            direccion: checkoutTipoEntrega === "domicilio" ? checkoutDireccion : "Recoger en Local",
            especificaciones: checkoutEspecificaciones || "",
            efectivoConCuanto: checkoutEfectivoPaga || "",
            vueltoEfectivo: vueltoEfectivo || 0,
            transferenciaReferencia: checkoutTransferReferencia || "",
            transferenciaBanco: checkoutTransferBanco || "",
            tarjetaNumero: checkoutTarjetaNumero ? `****${checkoutTarjetaNumero.replace(/\s/g, '').slice(-4)}` : "",
            codigoPedido: `VEN-${String(Date.now()).slice(-4)}`,
            clienteNombre: checkoutNombre || (user?.nombre ? `${user.nombre} ${user.apellidos || ''}`.trim() : "Cliente General"),
            productos: cart.map(item => ({
              id: item.id,
              nombre: item.nombre,
              cantidad: item.cantidad,
              precioUnitario: item.precio,
              total: item.precio * item.cantidad,
              adiciones: item.adiciones ? item.adiciones.map(a => a.nombre) : []
            }))
          }),
          detalles: cart.map(item => ({
            idVariante: item.id || 1,
            cantidad: item.cantidad,
            precioUnitario: item.precio,
            subtotal: item.precio * item.cantidad,
            observaciones: item.nombre + (item.adiciones && item.adiciones.length > 0 ? ` (+${item.adiciones.map(a => a.nombre).join(', ')})` : '')
          }))
        };

        await ventasService.createVenta(ventaPayload);
        success("¡Pedido realizado exitosamente!", "Tu pedido fue registrado y ha sido enviado a cocina.");
        clearCart();
        setShowCheckout(false);
        setShowCart(false);
        await fetchMyOrders();
        setShowPedidos(true);
      } catch (err) {
        console.error("Error confirmando pedido:", err);
        error("Error al procesar pedido", err.message || "No se pudo conectar con el servidor");
      }
    }
  };

  const handleLogout = async () => {
    const confirmed = await confirmLogout();
    if (confirmed) {
      logout();
      clearCart();
      setShowCart(false);
      setShowPedidos(false);
      setShowPerfil(false);
      setShowProductModal(false);
      success("Sesión cerrada", "Has salido del sistema correctamente");
      navigate("/");
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "En Preparación":
      case "PREPARANDO":
      case "En preparación":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "Completada":
      case "LISTO":
      case "ENTREGADO":
      case "Entregado":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "Anulada":
      case "CANCELADO":
        return "bg-rose-100 text-rose-800 border-rose-300";
      default:
        return "bg-blue-100 text-blue-800 border-blue-300";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 dark:border-b dark:border-gray-800 shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <div className="shrink-0 w-12 h-12 rounded-full overflow-hidden bg-white shadow-sm border border-gray-100">
                <img
                  src={logoImg}
                  alt="Chazin Food"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: "50% 56%" }}
                />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">Chazin Food</h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {isAuthenticated ? `¡Bienvenido, ${user?.nombre}!` : "Bienvenido a Chazin Food"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={toggleDarkMode}
                className="p-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                title="Cambiar Modo"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => setShowPerfil(true)}
                    className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-sm font-medium"
                  >
                    <User className="w-5 h-5 text-[#f05454]" />
                    <span className="hidden sm:inline">Mi Perfil</span>
                  </button>

                  <button
                    onClick={() => {
                      fetchMyOrders();
                      setShowPedidos(true);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-sm font-medium"
                  >
                    <Package className="w-5 h-5 text-red-500" />
                    <span className="hidden sm:inline">Mis Pedidos</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors font-medium text-sm"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Iniciar Sesión</span>
                </button>
              )}

              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    setShowEmptyCartLoginModal(true);
                    return;
                  }
                  setShowCart(true);
                }}
                className="relative flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors shadow-md font-semibold text-sm"
              >
                <ShoppingCart className="w-5 h-5" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-white text-red-600 font-extrabold text-xs w-6 h-6 rounded-full flex items-center justify-center shadow-md">
                    {getTotalItems()}
                  </span>
                )}
                <span className="hidden sm:inline">Carrito</span>
              </button>

              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="p-2.5 text-gray-500 dark:text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 rounded-xl transition-colors"
                  title="Cerrar Sesión"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-500 via-rose-500 to-red-600 text-white py-10 md:py-14 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">¡El sabor auténtico de Chazin Food!</h2>
          <p className="text-sm sm:text-lg text-red-100 font-medium">Haz tu pedido online y recíbelo fresco en tu puerta</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-3 border border-gray-100 dark:border-gray-800">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre de producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-0 bg-gray-50 dark:bg-gray-800 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-red-500 focus:bg-white dark:focus:bg-gray-800 transition-all text-sm outline-none"
            />
          </div>
        </div>
      </div>

      {/* Categorías */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-5">Categorías</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <button
            onClick={() => setSelectedCategoria(null)}
            className={`p-3.5 rounded-2xl transition-all flex flex-col items-center justify-center text-center gap-1.5 ${selectedCategoria === null ? "bg-red-500 text-white shadow-lg scale-105 font-bold" : "bg-white dark:bg-gray-900 dark:text-gray-200 border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
          >
            <div className="text-3xl">🍽️</div>
            <p className="text-xs font-semibold">Todos</p>
          </button>
          {activeCategorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoria(cat.id)}
              className={`p-3.5 rounded-2xl transition-all flex flex-col items-center justify-center text-center gap-1.5 ${selectedCategoria === cat.id ? "bg-red-500 text-white shadow-lg scale-105 font-bold" : "bg-white dark:bg-gray-900 dark:text-gray-200 border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
            >
              <div className="text-3xl">{cat.icon}</div>
              <p className="text-xs font-semibold leading-tight">{cat.nombre}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Productos */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
          {selectedCategoria ? activeCategorias.find((c) => c.id === selectedCategoria)?.nombre : "Menú Principal"}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productosFiltrados.map((producto) => (
            <div key={producto.id} className="bg-white dark:bg-gray-900 rounded-3xl shadow-md hover:shadow-xl transition-all border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col justify-between">
              <div className="bg-gradient-to-br from-red-400 to-red-600 h-44 flex items-center justify-center relative">
                <div className="text-7xl">{producto.imagen}</div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="font-bold text-lg text-gray-800 dark:text-gray-100">{producto.nombre}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{producto.descripcion}</p>
                </div>
                <div className="space-y-3 pt-2">
                  <p className="text-2xl font-black text-red-600 dark:text-red-400">${producto.precio.toLocaleString()}</p>
                  <button
                    onClick={() => handleProductClick(producto)}
                    className="w-full py-3 bg-red-500 hover:bg-red-600 active:scale-[0.98] text-white rounded-2xl transition-all font-bold text-sm flex items-center justify-center gap-2 shadow-md"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Agregar al carrito
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL DETALLE DE PRODUCTO */}
      {showProductModal && productoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 relative border border-gray-100 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowProductModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center pt-2">
              <div className="text-6xl mb-2">{productoSeleccionado.producto.imagen}</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{productoSeleccionado.producto.nombre}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{productoSeleccionado.producto.descripcion}</p>
              <p className="text-xl font-extrabold text-red-600 dark:text-red-400 mt-2">${productoSeleccionado.producto.precio.toLocaleString()}</p>
            </div>

            {/* Cantidad */}
            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-2xl">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Cantidad:</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setProductoSeleccionado({ ...productoSeleccionado, cantidad: Math.max(1, productoSeleccionado.cantidad - 1) })}
                  className="w-8 h-8 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-200"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-bold text-gray-900 dark:text-gray-100 w-6 text-center">{productoSeleccionado.cantidad}</span>
                <button
                  type="button"
                  onClick={() => setProductoSeleccionado({ ...productoSeleccionado, cantidad: productoSeleccionado.cantidad + 1 })}
                  className="w-8 h-8 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Adiciones */}
            <div>
              <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Adiciones disponibles:</p>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {adicionesDisponibles.map((ad) => {
                  const selected = productoSeleccionado.adicionesSeleccionadas.find((a) => a.idAdicion === ad.idAdicion);
                  return (
                    <div
                      key={ad.idAdicion}
                      onClick={() => handleAdicionToggle(ad)}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-colors ${selected ? "border-red-500 bg-red-50/50 dark:bg-red-950/30 font-semibold" : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{ad.imagen}</span>
                        <span className="text-gray-800 dark:text-gray-200">{ad.nombre}</span>
                      </div>
                      <span className="text-red-600 font-bold">+${ad.precio.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ficha técnica collapse */}
            <FichaTecnicaProductoCliente ficha={fichasTecnicas[productoSeleccionado.producto.id]} />

            <button
              onClick={handleAddToCart}
              className="w-full py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Agregar al carrito • ${(
                (productoSeleccionado.producto.precio +
                  productoSeleccionado.adicionesSeleccionadas.reduce((s, a) => s + a.precio * a.cantidad, 0)) *
                productoSeleccionado.cantidad
              ).toLocaleString()}
            </button>
          </div>
        </div>
      )}

      {/* MODAL CARRITO */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md h-full p-6 shadow-2xl flex flex-col justify-between border-l border-gray-100 dark:border-gray-800 animate-in slide-in-from-right duration-300">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-6 h-6 text-red-500" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Tu Carrito de Compras</h3>
                </div>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="w-16 h-16 bg-red-50 dark:bg-red-950/40 rounded-full flex items-center justify-center mx-auto text-red-500">
                    <ShoppingCart className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Tu carrito está vacío</p>
                  <p className="text-xs text-gray-400">Agrega deliciosos productos de nuestro menú</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                  {cart.map((item, index) => (
                    <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
                      <div className="text-3xl">{item.imagen}</div>
                      <div className="flex-1">
                        <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">{item.nombre}</h4>
                        {item.adiciones && item.adiciones.length > 0 && (
                          <p className="text-xs text-gray-400">
                            Adiciones: {item.adiciones.map(a => a.nombre).join(', ')}
                          </p>
                        )}
                        <p className="text-xs font-bold text-red-600 dark:text-red-400 mt-0.5">${item.precio.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-7 h-7 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center text-xs font-bold"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{item.cantidad}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-7 h-7 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center text-xs font-bold"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 text-gray-400 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-4">
                <div className="flex justify-between items-center text-base font-extrabold text-gray-900 dark:text-gray-100">
                  <span>Total Pedido:</span>
                  <span className="text-red-600 dark:text-red-400 text-xl">${clientSubtotal.toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={clearCart}
                    className="py-3 px-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-2xl text-xs hover:bg-gray-200"
                  >
                    Vaciar Carrito
                  </button>
                  <button
                    onClick={handleAbrirCheckout}
                    className="py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl text-xs shadow-md"
                  >
                    Proceder al Pago
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL CHECKOUT — Diseño Aprobado */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full shadow-2xl border border-gray-200 dark:border-gray-800 max-h-[92vh] overflow-hidden flex flex-col">

            {/* ═══ HEADER ROJO ═══ */}
            <div className="bg-[#E53935] px-5 py-4 flex items-center justify-between rounded-t-2xl shrink-0">
              <div>
                <h3 className="text-lg font-extrabold text-white tracking-tight">Finalizar Pedido</h3>
                <p className="text-[11px] text-white/70 mt-0.5">Completa los datos de entrega y pago</p>
              </div>
              <button onClick={() => setShowCheckout(false)} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* ═══ CUERPO SCROLLEABLE ═══ */}
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">

              {/* ── Resumen del pedido ── */}
              <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-4 space-y-2 border border-gray-100 dark:border-gray-700">
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">🛒 Resumen</h4>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                  <span>Subtotal ({getTotalItems()} prod.)</span>
                  <span className="font-semibold">${clientSubtotal.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-400 dark:text-gray-500">
                  <span>IVA (0%)</span>
                  <span>$0</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600 pt-2 flex justify-between items-center">
                  <span className="text-sm font-extrabold text-gray-900 dark:text-gray-100">Total</span>
                  <span className="text-lg font-black text-[#E53935]">${totalCheckout.toLocaleString('es-CO')}</span>
                </div>
              </div>

              {/* ── Tipo de Entrega ── */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">🚚 Tipo de Entrega</h4>
                <div className="grid grid-cols-2 gap-3">
                  {/* Card Domicilio */}
                  <button
                    type="button"
                    onClick={() => setCheckoutTipoEntrega("domicilio")}
                    className={`relative p-4 rounded-xl border-2 text-center transition-all ${
                      checkoutTipoEntrega === "domicilio"
                        ? "border-[#E53935] bg-red-50/60 dark:bg-red-950/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {checkoutTipoEntrega === "domicilio" && (
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#E53935] rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3.5 h-3.5 text-white" />
                      </span>
                    )}
                    <span className="text-2xl block mb-1">🛵</span>
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">Domicilio</span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">Llevamos tu pedido</span>
                  </button>
                  {/* Card Recoger */}
                  <button
                    type="button"
                    onClick={() => setCheckoutTipoEntrega("llevar")}
                    className={`relative p-4 rounded-xl border-2 text-center transition-all ${
                      checkoutTipoEntrega === "llevar"
                        ? "border-[#E53935] bg-red-50/60 dark:bg-red-950/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {checkoutTipoEntrega === "llevar" && (
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#E53935] rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3.5 h-3.5 text-white" />
                      </span>
                    )}
                    <span className="text-2xl block mb-1">🏪</span>
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">Recoger en Local</span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">Pasas a recogerlo</span>
                  </button>
                </div>
              </div>

              {/* ── Datos de Entrega / Contacto ── */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  📍 {checkoutTipoEntrega === "domicilio" ? "Datos de Entrega" : "Datos de Contacto"}
                </h4>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Nombre del destinatario</label>
                  <input
                    type="text"
                    value={checkoutNombre}
                    onChange={(e) => setCheckoutNombre(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-[#E53935] focus:ring-1 focus:ring-[#E53935]/30 transition-colors"
                    placeholder="Tu nombre completo"
                  />
                </div>

                {checkoutTipoEntrega === "domicilio" ? (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Dirección de entrega <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={checkoutDireccion}
                      onChange={(e) => setCheckoutDireccion(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-[#E53935] focus:ring-1 focus:ring-[#E53935]/30 transition-colors"
                      placeholder="Ej: Calle 45 #12-30, Apto 201"
                    />
                  </div>
                ) : (
                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-3 flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      <span className="font-bold">Recoger en:</span> Chazin Food — Cra. 12 #45-67. Te notificaremos cuando esté listo.
                    </p>
                  </div>
                )}
              </div>

              {/* ── Método de Pago ── */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">💳 Método de Pago</h4>
                <div className="grid grid-cols-3 gap-2">
                  {/* Efectivo */}
                  <button
                    type="button"
                    onClick={() => setCheckoutMetodoPago("efectivo")}
                    className={`relative p-3 rounded-xl border-2 text-center transition-all flex flex-col items-center gap-1 ${
                      checkoutMetodoPago === "efectivo"
                        ? "border-[#E53935] bg-red-50/60 dark:bg-red-950/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {checkoutMetodoPago === "efectivo" && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#E53935] rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </span>
                    )}
                    <span className="text-lg">💵</span>
                    <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">Efectivo</span>
                  </button>
                  {/* Tarjeta */}
                  <button
                    type="button"
                    onClick={() => setCheckoutMetodoPago("tarjeta")}
                    className={`relative p-3 rounded-xl border-2 text-center transition-all flex flex-col items-center gap-1 ${
                      checkoutMetodoPago === "tarjeta"
                        ? "border-[#E53935] bg-red-50/60 dark:bg-red-950/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {checkoutMetodoPago === "tarjeta" && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#E53935] rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </span>
                    )}
                    <span className="text-lg">💳</span>
                    <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">Tarjeta</span>
                  </button>
                  {/* Transferencia */}
                  <button
                    type="button"
                    onClick={() => setCheckoutMetodoPago("transferencia")}
                    className={`relative p-3 rounded-xl border-2 text-center transition-all flex flex-col items-center gap-1 ${
                      checkoutMetodoPago === "transferencia"
                        ? "border-[#E53935] bg-red-50/60 dark:bg-red-950/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {checkoutMetodoPago === "transferencia" && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#E53935] rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </span>
                    )}
                    <span className="text-lg">📱</span>
                    <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">Transferencia</span>
                  </button>
                </div>

                {/* Sub-sección Efectivo */}
                {checkoutMetodoPago === "efectivo" && (
                  <div className="bg-amber-50 dark:bg-amber-950/30 p-3.5 rounded-xl border border-amber-200 dark:border-amber-800 space-y-2">
                    <label className="block text-xs font-semibold text-amber-800 dark:text-amber-300">¿Con cuánto vas a pagar? (opcional)</label>
                    <input
                      type="number"
                      value={checkoutEfectivoPaga}
                      onChange={(e) => setCheckoutEfectivoPaga(e.target.value)}
                      placeholder="Ej: 50000"
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-800 border border-amber-300 dark:border-amber-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-amber-500 transition-colors"
                    />
                    {checkoutEfectivoPaga && Number(checkoutEfectivoPaga) >= totalCheckout && (
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        💰 Vueltos: ${vueltoEfectivo.toLocaleString('es-CO')}
                      </p>
                    )}
                  </div>
                )}

                {/* Sub-sección Tarjeta */}
                {checkoutMetodoPago === "tarjeta" && (
                  <div className="bg-blue-50 dark:bg-blue-950/30 p-3.5 rounded-xl border border-blue-200 dark:border-blue-800 space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1">Número de tarjeta <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                        <input
                          type="text"
                          value={checkoutTarjetaNumero}
                          onChange={(e) => {
                            const v = e.target.value.replace(/[^\d]/g, '').slice(0, 16);
                            setCheckoutTarjetaNumero(v.replace(/(\d{4})(?=\d)/g, '$1 '));
                          }}
                          placeholder="0000 0000 0000 0000"
                          className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500 transition-colors tracking-widest"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1">Monto a cargar</label>
                      <input
                        type="text"
                        readOnly
                        value={`$ ${totalCheckout.toLocaleString('es-CO')}`}
                        className="w-full px-3.5 py-2.5 bg-gray-100 dark:bg-gray-700 border border-blue-200 dark:border-blue-700 rounded-lg text-sm text-gray-500 dark:text-gray-400 outline-none cursor-not-allowed"
                      />
                    </div>
                  </div>
                )}

                {/* Sub-sección Transferencia */}
                {checkoutMetodoPago === "transferencia" && (
                  <div className="bg-blue-50 dark:bg-blue-950/30 p-3.5 rounded-xl border border-blue-200 dark:border-blue-800 space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1">Entidad / Banco origen</label>
                      <select
                        value={checkoutTransferBanco}
                        onChange={(e) => setCheckoutTransferBanco(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500 transition-colors"
                      >
                        <optgroup label="Billeteras digitales">
                          <option value="Nequi">Nequi</option>
                          <option value="Daviplata">Daviplata</option>
                        </optgroup>
                        <optgroup label="Bancos">
                          <option value="Bancolombia">Bancolombia</option>
                          <option value="Davivienda">Davivienda</option>
                          <option value="BBVA">BBVA</option>
                          <option value="Banco de Bogotá">Banco de Bogotá</option>
                          <option value="Banco Caja Social">Banco Caja Social</option>
                          <option value="Scotiabank Colpatria">Scotiabank Colpatria</option>
                          <option value="Otro">Otro</option>
                        </optgroup>
                      </select>
                    </div>
                    <div className="bg-blue-100/60 dark:bg-blue-900/30 rounded-lg p-2.5">
                      <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">Transfiere a <span className="font-bold">Bancolombia Ahorros 123-456789-00</span> a nombre de <span className="font-bold">Chazin Food</span>.</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1">Número de referencia <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={checkoutTransferReferencia}
                        onChange={(e) => setCheckoutTransferReferencia(e.target.value)}
                        placeholder="Ej: 987654321"
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* ── Especificaciones ── */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">📝 Especificaciones (opcional)</h4>
                <textarea
                  rows={2}
                  value={checkoutEspecificaciones}
                  onChange={(e) => setCheckoutEspecificaciones(e.target.value)}
                  placeholder="Ej: Sin cebolla, dejar en portería, tocar timbre..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-[#E53935] focus:ring-1 focus:ring-[#E53935]/30 transition-colors resize-none"
                />
              </div>
            </div>

            {/* ═══ FOOTER FIJO ═══ */}
            <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0 space-y-3 rounded-b-2xl">
              <div className="flex justify-between items-center">
                <span className="text-sm font-extrabold text-gray-900 dark:text-gray-100">Total a pagar:</span>
                <span className="text-xl font-black text-[#E53935]">${totalCheckout.toLocaleString('es-CO')}</span>
              </div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 text-right -mt-1">🏷️ Precio sin IVA aplicado</p>
              <button
                onClick={handleConfirmarPedido}
                className="w-full py-3.5 bg-[#E53935] hover:bg-[#D32F2F] text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <CheckCircle className="w-5 h-5" />
                Confirmar Pedido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL MIS PEDIDOS */}
      {showPedidos && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 relative border border-gray-100 dark:border-gray-800 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <Package className="w-6 h-6 text-red-500" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Mis Pedidos Realizados</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchMyOrders}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
                  title="Actualizar Pedidos"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingPedidos ? "animate-spin" : ""}`} />
                </button>
                <button
                  onClick={() => setShowPedidos(false)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {pedidos.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <Package className="w-12 h-12 text-gray-300 mx-auto" />
                <p className="text-sm font-semibold text-gray-500">Aún no has realizado pedidos</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pedidos.map((p) => (
                  <div key={p.id} className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-200/50 dark:border-gray-700 pb-2 text-xs">
                      <div>
                        <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">#{p.numeroVenta || p.id}</span>
                        <p className="text-gray-400">{p.fecha}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full font-bold border text-xs ${getEstadoColor(p.estado)}`}>
                        {p.estado}
                      </span>
                    </div>
                    <div className="space-y-1 text-xs">
                      {p.items && p.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-gray-700 dark:text-gray-300">
                          <span>{it.cantidad}x {it.nombre}</span>
                          <span className="font-semibold">${Number(it.precio || 0).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-gray-200/50 dark:border-gray-700 pt-2 flex justify-between items-center text-xs font-bold">
                      <span className="text-gray-500">Total:</span>
                      <span className="text-red-600 dark:text-red-400 text-sm">${Number(p.total || 0).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL ALERTA INICIAR SESIÓN */}
      {showEmptyCartLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4 border border-gray-100 dark:border-gray-800">
            <div className="w-14 h-14 bg-red-50 dark:bg-red-950/40 rounded-full flex items-center justify-center mx-auto text-red-500">
              <LogIn className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Inicia sesión para ordenar</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Para agregar productos a tu carrito y realizar pedidos necesitas una cuenta de cliente.</p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowEmptyCartLoginModal(false)}
                className="py-2.5 px-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl text-xs hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowEmptyCartLoginModal(false);
                  navigate("/login");
                }}
                className="py-2.5 px-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-xs shadow-md"
              >
                Iniciar Sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Mi Perfil */}
      <ClientePerfilModal
        isOpen={showPerfil}
        onClose={() => setShowPerfil(false)}
        user={user}
        pedidos={pedidos}
      />
    </div>
  );
}
