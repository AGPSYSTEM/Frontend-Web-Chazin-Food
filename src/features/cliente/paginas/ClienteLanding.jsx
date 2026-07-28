import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, LogIn, ShoppingCart, User, Search, Package, Clock, X, Plus, Minus, Award, TrendingUp, Sun, Moon, Menu, MapPin, CreditCard, Banknote, Smartphone, FileText, ChevronRight, ChevronUp, ChevronDown, CheckCircle, Truck, Store, Flame, Gift } from "lucide-react";
import { useAuth } from "@/features/autenticacion/hooks/useAuth";
import { useDarkMode } from "@/shared/hooks/useDarkMode";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { useCart } from "@/shared/context/CartContext";
import logoImg from "@/shared/assets/ChatGPT_Image_1_jun_2026__21_55_04.png";
import { ClientePerfilModal } from "../componentes/ClientePerfilModal";


const categorias = [
  { id: 1, nombre: "Hamburguesas", icon: "🍔", color: "from-yellow-400 to-orange-500" },
  { id: 2, nombre: "Salchipapas", icon: "🍟", color: "from-yellow-500 to-amber-600" },
  { id: 3, nombre: "Perros Calientes", icon: "🌭", color: "from-orange-400 to-red-500" },
  { id: 4, nombre: "Pollo", icon: "🍗", color: "from-amber-500 to-orange-600" },
  { id: 5, nombre: "Bebidas", icon: "🥤", color: "from-blue-400 to-blue-600" },
  { id: 6, nombre: "Acompañamientos", icon: "🥗", color: "from-green-400 to-green-600" },
  { id: 8, nombre: "Combos", icon: "🍱", color: "from-purple-400 to-purple-600" }
];

const productos = [
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
  { idAdicion: 8, nombre: "Sprite", precio: 3000, stockActual: 55, tipo: "Bebida", imagen: "🥤" },
  { idAdicion: 9, nombre: "Jugo de Naranja", precio: 4000, stockActual: 20, tipo: "Bebida", imagen: "🧃" }
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
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
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
  const [checkoutTarjetaNumero, setCheckoutTarjetaNumero] = useState("");
  const [checkoutTarjetaMonto, setCheckoutTarjetaMonto] = useState("");
  const [checkoutEspecificaciones, setCheckoutEspecificaciones] = useState("");
  const [checkoutTipoEntrega, setCheckoutTipoEntrega] = useState("domicilio");
  const [checkoutEfectivoPaga, setCheckoutEfectivoPaga] = useState("");
  const [checkoutTransferReferencia, setCheckoutTransferReferencia] = useState("");
  const [checkoutTransferBanco, setCheckoutTransferBanco] = useState("Bancolombia");
  const [showPedidos, setShowPedidos] = useState(false);
  const [showPerfil, setShowPerfil] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [pedidos, setPedidos] = useState(() => {
    const saved = localStorage.getItem("chazin_client_pedidos");
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        fecha: "2026-06-02 14:30",
        items: [
          { nombre: "Hamburguesa Especial", cantidad: 2, precio: 15000 },
          { nombre: "Coca Cola", cantidad: 2, precio: 3000 }
        ],
        total: 36000,
        estado: "En preparación"
      }
    ];
  });

  const productosFiltrados = productos.filter((p) => {
    const matchCategoria = !selectedCategoria || p.categoria === selectedCategoria;
    const matchSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategoria && matchSearch;
  });

  const handleProductClick = (producto) => {
    if (!isAuthenticated) {
      navigate("/login");
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
    setCheckoutNombre(user?.nombre || "");
    setCheckoutDireccion("");
    setCheckoutEspecificaciones("");
    setCheckoutMetodoPago("efectivo");
    setCheckoutTipoEntrega("domicilio");
    setCheckoutEfectivoPaga("");
    setCheckoutTransferReferencia("");
    setCheckoutTransferBanco("Bancolombia");
    setCheckoutTarjetaNumero("");
    setCheckoutTarjetaMonto("");
    setShowCheckout(true);
  };

  const CLIENT_IVA_RATE = 0;
  const clientSubtotal = getSubtotal();
  const clientIVA = Math.round(clientSubtotal * CLIENT_IVA_RATE);
  const clientTotal = clientSubtotal + clientIVA;
  const totalCheckout = clientTotal;
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
    const confirmed = await confirmAction(
      "Confirmar Pedido",
      "¿Deseas confirmar tu pedido?",
      "Sí, confirmar"
    );
    if (confirmed) {
      const newClientOrderId = pedidos.length + 1;
      const newClientOrder = {
        id: newClientOrderId,
        fecha: new Date().toISOString().slice(0, 16).replace("T", " "),
        items: cart.map(item => ({ nombre: item.nombre, cantidad: item.cantidad, precio: item.precio })),
        total: totalCheckout,
        estado: "En preparación"
      };
      const updatedClientPedidos = [newClientOrder, ...pedidos];
      setPedidos(updatedClientPedidos);
      localStorage.setItem("chazin_client_pedidos", JSON.stringify(updatedClientPedidos));

      success("¡Pedido realizado!", "Tu pedido ha sido enviado a cocina. Recibirás una notificación cuando esté listo.");
      clearCart();
      setShowCheckout(false);
      setShowCart(false);
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
      case "En preparación":
        return "bg-yellow-100 text-yellow-700";
      case "Listo":
        return "bg-blue-100 text-blue-700";
      case "Entregado":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 dark:border-b dark:border-gray-800 shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <div className="shrink-0 w-14 h-14 rounded-full overflow-hidden bg-white">
                <img
                  src={logoImg}
                  alt="Chazin Food"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: "50% 56%" }}
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Chazin Food</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isAuthenticated ? `¡Bienvenido, ${user?.nombre}!` : "Bienvenido a Chazin Food"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 md:gap-4">
              <button
                onClick={toggleDarkMode}
                className="hidden md:inline-flex p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => setShowPerfil(true)}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-sm font-medium"
                  >
                    <User className="w-5 h-5 text-[#f05454]" />
                    <span className="hidden sm:inline">Mi Perfil</span>
                  </button>


                  <button
                    onClick={() => setShowPedidos(!showPedidos)}
                    className="hidden md:inline-flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <Package className="w-5 h-5" />
                    <span>Mis Pedidos</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  className="hidden md:inline-flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span>Iniciar Sesión</span>
                </button>
              )}

              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    setShowEmptyCartLoginModal(true);
                    return;
                  }
                  setShowCart(!showCart);
                }}
                className="relative flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-white text-red-600 font-bold text-xs w-6 h-6 rounded-full flex items-center justify-center shadow">
                    {getTotalItems()}
                  </span>
                )}
                <span className="hidden sm:inline">Carrito</span>
              </button>

              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="hidden md:inline-flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Salir</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">¡Las mejores hamburguesas de la ciudad!</h2>
          <p className="text-base sm:text-lg md:text-xl text-red-100">Ordena ahora y recibe en la puerta de tu casa</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Categorías */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Categorías</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <button
            onClick={() => setSelectedCategoria(null)}
            className={`p-4 rounded-xl transition-all ${selectedCategoria === null ? "bg-red-500 text-white shadow-lg" : "bg-white dark:bg-gray-900 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
          >
            <div className="text-4xl mb-2">🍽️</div>
            <p className="font-medium text-sm">Todos</p>
          </button>
          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoria(cat.id)}
              className={`p-4 rounded-xl transition-all ${selectedCategoria === cat.id ? "bg-red-500 text-white shadow-lg" : "bg-white dark:bg-gray-900 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
            >
              <div className="text-4xl mb-2">{cat.icon}</div>
              <p className="font-medium text-sm">{cat.nombre}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Productos */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
          {selectedCategoria ? categorias.find((c) => c.id === selectedCategoria)?.nombre : "Todos los productos"}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productosFiltrados.map((producto) => (
            <div key={producto.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden">
              <div className="bg-gradient-to-br from-red-400 to-red-600 h-48 flex items-center justify-center">
                <div className="text-8xl">{producto.imagen}</div>
              </div>
              <div className="p-6">
                <h4 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-2">{producto.nombre}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{producto.descripcion}</p>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">${producto.precio.toLocaleString()}</p>
                </div>
                <button
                  onClick={() => handleProductClick(producto)}
                  className="w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-bold flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Agregar al carrito
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

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

