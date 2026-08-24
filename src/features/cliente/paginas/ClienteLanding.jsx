import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, LogIn, ShoppingCart, User, Search, Package, Clock, X, Plus, Minus, FileText, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, CheckCircle, Check, MapPin, CreditCard, Banknote, Smartphone, RefreshCw, Sun, Moon, Zap, Truck, Store, Info, Flame, Sparkles, AlertTriangle } from "lucide-react";
import { useAuth } from "@/features/autenticacion/hooks/useAuth";
import { useDarkMode } from "@/shared/hooks/useDarkMode";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { useCart } from "@/shared/context/CartContext";
import logoImg from "@/shared/assets/ChatGPT_Image_1_jun_2026__21_55_04.png";
import { ClientePerfilModal } from "../componentes/ClientePerfilModal";
import { ProductoResenasModal } from "../componentes/ProductoResenasModal";
import { FidelidadBadge } from "@/shared/components/ui/FidelidadBadge";
import { StarRating } from "@/shared/components/ui/StarRating";
import { apiClient } from "@/shared/api/apiClient";
import { ventasService } from "@/features/ventas/servicios/ventasService";
import { categoriaProductosService } from "@/features/ventas/servicios/categoriaProductosService";
import { productosService } from "@/features/ventas/servicios/productosService";
import { fichasTecnicasService } from "@/features/fichas-tecnicas/servicios/fichasTecnicasService";
import { adicionesService } from "@/features/compras/servicios/adicionesService";

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
  "entradas": { icon: "🌮", color: "from-emerald-400 to-teal-500" },
  "pizzas": { icon: "🍕", color: "from-red-500 to-amber-500" }
};

const getCategoryMeta = (nombre) => {
  const key = String(nombre || "").toLowerCase().trim();
  if (key.includes("hambur")) return { icon: "🍔", color: "from-yellow-400 to-orange-500" };
  if (key.includes("perro") || key.includes("hot dog")) return { icon: "🌭", color: "from-orange-400 to-red-500" };
  if (key.includes("salchipapa")) return { icon: "🍟", color: "from-yellow-500 to-amber-600" };
  if (key.includes("papa")) return { icon: "🍟", color: "from-yellow-500 to-amber-600" };
  if (key.includes("pollo") || key.includes("alitas") || key.includes("nugget")) return { icon: "🍗", color: "from-amber-500 to-orange-600" };
  if (key.includes("pizza")) return { icon: "🍕", color: "from-red-500 to-amber-500" };
  if (key.includes("combo")) return { icon: "🍱", color: "from-purple-400 to-purple-600" };
  if (key.includes("bebida") || key.includes("gaseosa") || key.includes("jugo") || key.includes("refresco")) return { icon: "🥤", color: "from-blue-400 to-blue-600" };
  if (key.includes("postre") || key.includes("torta") || key.includes("pastel")) return { icon: "🍰", color: "from-pink-400 to-rose-500" };
  if (key.includes("helado")) return { icon: "🍦", color: "from-indigo-400 to-purple-500" };
  if (key.includes("acompa") || key.includes("ensalada")) return { icon: "🥗", color: "from-green-400 to-green-600" };
  if (key.includes("entrada") || key.includes("snack") || key.includes("taco")) return { icon: "🌮", color: "from-emerald-400 to-teal-500" };
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

const fichasTecnicasDefault = {
  1: { ingredientes: ["Carne de res 150g", "Pan artesanal", "Lechuga", "Tomate", "Queso cheddar", "Salsas especiales"], peso: "350g", tamano: "Regular", calorias: "620 kcal", tiempoPreparacion: 15, rendimiento: "1 porción" },
  2: { ingredientes: ["Papas crinkle 200g", "Salchicha premium 100g", "Queso gratinado", "Salsas de la casa"], peso: "400g", tamano: "Grande", calorias: "720 kcal", tiempoPreparacion: 12, rendimiento: "1 porción" },
  3: { ingredientes: ["Salchicha premium", "Pan de perro", "Papa chip", "Queso", "Salsas especiales"], peso: "280g", tamano: "Regular", calorias: "540 kcal", tiempoPreparacion: 10, rendimiento: "1 porción" },
  4: { ingredientes: ["Pechuga de pollo broaster 200g", "Papas crinkle", "Ensalada fresca"], peso: "450g", tamano: "Grande", calorias: "680 kcal", tiempoPreparacion: 20, rendimiento: "1 porción" },
  5: { ingredientes: ["Gaseosa 350ml"], peso: "350ml", tamano: "Regular", calorias: "140 kcal", tiempoPreparacion: 2, rendimiento: "1 porción" },
  6: { ingredientes: ["2 Hamburguesas Especiales", "Salchipapa Grande", "Papas Crinkle", "4 Bebidas 350ml"], peso: "1.8kg", tamano: "Familiar", calorias: "2800 kcal", tiempoPreparacion: 25, rendimiento: "Familiar" }
};

function FichaTecnicaProductoCliente({ ficha, producto }) {
  const [open, setOpen] = useState(true);
  if (!ficha && !producto) return null;

  // Extract ingredients list from API format or default object
  let listaIngredientes = [];
  if (ficha?.detalles && Array.isArray(ficha.detalles) && ficha.detalles.length > 0) {
    listaIngredientes = ficha.detalles.map(d => {
      const nombre = d.insumo?.nombre || d.nombreInsumo || `Insumo #${d.idInsumo}`;
      const cant = d.cantidad ? ` (${d.cantidad} ${d.unidadMedida || d.insumo?.unidadMedida || 'und'})` : '';
      return `${nombre}${cant}`;
    });
  } else if (ficha?.ingredientes && Array.isArray(ficha.ingredientes)) {
    listaIngredientes = ficha.ingredientes;
  } else if (producto?.descripcion) {
    listaIngredientes = producto.descripcion.split(',').map(s => s.trim()).filter(Boolean);
  }

  const tiempoPrep = ficha?.tiempoPreparacion || 15;
  const rendimientoText = ficha?.rendimiento || ficha?.tamano || "1 porción";

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden mt-3 bg-gray-50/50 dark:bg-gray-800/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <FileText className="w-4 h-4 text-red-500" />
          Ingredientes y Preparación
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {open && (
        <div className="p-4 space-y-3 bg-white dark:bg-gray-900">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-red-50/80 dark:bg-red-950/30 rounded-xl p-2.5 text-center border border-red-100 dark:border-red-900/40">
              <p className="text-[10px] uppercase font-bold text-red-600 dark:text-red-400 flex items-center justify-center gap-1">
                <Clock className="w-3 h-3" /> Tiempo Estimado
              </p>
              <p className="text-sm font-black text-gray-900 dark:text-gray-100 mt-0.5">{tiempoPrep} minutos</p>
            </div>
            <div className="bg-amber-50/80 dark:bg-amber-950/30 rounded-xl p-2.5 text-center border border-amber-100 dark:border-amber-900/40">
              <p className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">Rendimiento</p>
              <p className="text-sm font-black text-gray-900 dark:text-gray-100 mt-0.5">{rendimientoText}</p>
            </div>
          </div>

          {/* Ingredientes / Insumos */}
          <div>
            <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-red-500" />
              Insumos e Ingredientes ({listaIngredientes.length}):
            </p>
            {listaIngredientes.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {listaIngredientes.map((ing, i) => (
                  <span
                    key={i}
                    className="text-xs font-medium bg-red-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-red-100 dark:border-gray-700 px-2.5 py-1 rounded-xl shadow-2xs"
                  >
                    🥗 {ing}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">Ingredientes frescos preparados al momento.</p>
            )}
          </div>

          {/* Procedimiento o especificaciones si existen */}
          {ficha?.procedimiento && ficha.procedimiento !== "n/A" && (
            <div className="pt-1">
              <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">Preparación:</p>
              <p className="text-xs text-gray-600 dark:text-gray-300 italic line-clamp-2">{ficha.procedimiento}</p>
            </div>
          )}
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
  const categoryCarouselRef = useRef(null);

  const scrollCategories = (direction) => {
    if (categoryCarouselRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280;
      categoryCarouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };
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
  const [showResenasModal, setShowResenasModal] = useState(false);
  const [productoParaResenas, setProductoParaResenas] = useState(null);
  const [ratingsMap, setRatingsMap] = useState({});

  const [pedidos, setPedidos] = useState([]);
  const [loadingPedidos, setLoadingPedidos] = useState(false);

  const [categoriasList, setCategoriasList] = useState([]);
  const [productosList, setProductosList] = useState([]);
  const [fichasMap, setFichasMap] = useState(fichasTecnicasDefault);
  const [adicionesList, setAdicionesList] = useState(adicionesDisponibles);

  // Fetch catalog categories & products dynamically from API
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const [catsRes, prodsRes, fichasRes, adicRes] = await Promise.allSettled([
          categoriaProductosService.getCategorias(),
          productosService.getProductos(),
          fichasTecnicasService.getFichas(),
          adicionesService.getAdiciones()
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
              precio: Number(p.precio) || 0,
              categoria: p.categoria || (p.categoriaProducto ? p.categoriaProducto.nombre : ''),
              idCategoriaProducto: p.idCategoriaProducto,
              descripcion: p.descripcion,
              imagen: p.imagen,
              variantes: p.variantes || [],
              eventos: p.eventos || []
            }));
          setProductosList(apiProds);

          // Fetch ratings
          const pIds = apiProds.map(p => p.id || p.idProducto).join(',');
          apiClient.get(`/resenas/ratings?ids=${pIds}`)
            .then(res => { if (res) setRatingsMap(res); })
            .catch(() => {});
        } else {
          setProductosList(productosDefault);
        }

        if (fichasRes.status === "fulfilled" && Array.isArray(fichasRes.value)) {
          const fMap = { ...fichasTecnicasDefault };
          fichasRes.value.forEach(f => {
            if (f.idProducto) {
              fMap[f.idProducto] = f;
            }
          });
          setFichasMap(fMap);
        }

        if (adicRes.status === "fulfilled" && Array.isArray(adicRes.value) && adicRes.value.length > 0) {
          const apiAdics = adicRes.value.map(a => ({
            idAdicion: a.idAdicion || a.id,
            nombre: a.nombre,
            precio: parseFloat(a.precio || 0),
            stockActual: a.stockActual || 50,
            tipo: a.tipo || "Adición",
            imagen: a.imagen || "🥫"
          }));
          setAdicionesList(apiAdics);
        }
      } catch (e) {
        console.warn("Error cargando catálogo dinámico en ClienteLanding:", e);
        setCategoriasList(categoriasDefault);
        setProductosList(productosDefault);
      }
    };

    fetchCatalog();
  }, []);

  // Fetch client orders from backend + local history synchronization
  const fetchMyOrders = async () => {
    if (!isAuthenticated) return;
    try {
      setLoadingPedidos(true);
      const userId = user?.idUsuario || user?.id || user?._id;
      const storageKey = `mis_pedidos_${userId || 'guest'}`;
      let localHistory = [];
      try {
        localHistory = JSON.parse(localStorage.getItem(storageKey) || '[]');
      } catch (e) {
        localHistory = [];
      }

      let backendOrders = [];
      try {
        const data = await ventasService.getVentas();
        if (data && Array.isArray(data)) {
          backendOrders = data.filter(v => 
            v.idUsuario === userId || 
            v.idCliente === user?.idCliente ||
            v.clienteNombre === `${user?.nombre || ''} ${user?.apellidos || ''}`.trim()
          );
        }
      } catch (err) {
        console.log("No se pudieron cargar pedidos del backend:", err);
      }

      // Map backend orders by id and code
      const backendMap = new Map();
      backendOrders.forEach(o => {
        const id = o.idVenta || o.id;
        const code = o.numeroVenta || o.codigoPedido;
        if (id) backendMap.set(String(id), o);
        if (code) backendMap.set(String(code), o);
      });

      const mergedPedidos = [];
      const processedBackendIds = new Set();

      // Check all orders the client previously placed
      for (const localOrd of localHistory) {
        const matched = backendMap.get(String(localOrd.id)) || backendMap.get(String(localOrd.numeroVenta));
        if (matched) {
          processedBackendIds.add(String(matched.idVenta || matched.id));
          let currentEstado = matched.estado || matched.estadoEntrega || 'Por Aprobar';
          if (matched.estadoAprobacion === 'RECHAZADO' || matched.estadoEntrega === 'CANCELADO') {
            currentEstado = 'Anulada';
          } else if (matched.estadoAprobacion === 'PENDIENTE') {
            currentEstado = 'Por Aprobar';
          } else if (matched.estadoEntrega === 'PREPARANDO') {
            currentEstado = 'En Preparación';
          } else if (matched.estadoEntrega === 'LISTO') {
            currentEstado = 'Listo';
          } else if (matched.estadoEntrega === 'ENTREGADO') {
            currentEstado = 'Completada';
          }

          localOrd.estado = currentEstado;
          mergedPedidos.push({
            id: matched.idVenta || matched.id || localOrd.id,
            numeroVenta: matched.numeroVenta || localOrd.numeroVenta,
            fecha: matched.fechaVenta ? new Date(matched.fechaVenta).toLocaleString('es-CO') : localOrd.fecha,
            items: localOrd.items || [],
            total: matched.total || localOrd.total,
            estado: currentEstado
          });
        } else {
          localOrd.estado = 'Anulada';
          mergedPedidos.push({
            ...localOrd,
            estado: 'Anulada'
          });
        }
      }

      // Add any orders from backend that were not in localHistory
      for (const o of backendOrders) {
        const idStr = String(o.idVenta || o.id);
        if (!processedBackendIds.has(idStr)) {
          let currentEstado = o.estado || o.estadoEntrega || 'Por Aprobar';
          if (o.estadoAprobacion === 'RECHAZADO' || o.estadoEntrega === 'CANCELADO') {
            currentEstado = 'Anulada';
          } else if (o.estadoAprobacion === 'PENDIENTE') {
            currentEstado = 'Por Aprobar';
          } else if (o.estadoEntrega === 'PREPARANDO') {
            currentEstado = 'En Preparación';
          } else if (o.estadoEntrega === 'LISTO') {
            currentEstado = 'Listo';
          } else if (o.estadoEntrega === 'ENTREGADO') {
            currentEstado = 'Completada';
          }

          let itemsList = [{ nombre: 'Pedido de comida', cantidad: 1, precio: o.total }];
          if (o.detalles && o.detalles.length > 0) {
            itemsList = o.detalles.map(d => ({
              nombre: d.observaciones || `Producto #${d.idVariante}`,
              cantidad: d.cantidad,
              precio: d.precioUnitario
            }));
          }

          const newEntry = {
            id: o.idVenta || o.id,
            numeroVenta: o.numeroVenta || `VEN-${String(o.idVenta || o.id).padStart(4, '0')}`,
            fecha: o.fechaVenta ? new Date(o.fechaVenta).toLocaleString('es-CO') : 'Hoy',
            items: itemsList,
            total: o.total,
            estado: currentEstado
          };

          localHistory.unshift(newEntry);
          mergedPedidos.push(newEntry);
        }
      }

      localStorage.setItem(storageKey, JSON.stringify(localHistory.slice(0, 50)));
      setPedidos(mergedPedidos);
    } catch (err) {
      console.log("Error cargando pedidos:", err);
    } finally {
      setLoadingPedidos(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, [isAuthenticated, user]);

  const handleCancelarPedido = async (pedidoId) => {
    const isConfirmed = await confirmAction(
      "¿Cancelar este pedido?",
      "Esta acción cambiará el estado del pedido a Cancelado. ¿Deseas continuar?"
    );
    if (!isConfirmed) return;

    try {
      await ventasService.cancelarVenta(pedidoId);
      success("Pedido cancelado", "Tu pedido fue cancelado exitosamente.");
      await fetchMyOrders();
    } catch (err) {
      console.warn("Error cancelando pedido:", err);
      try {
        await ventasService.updateEstadoVenta(pedidoId, "CANCELADO");
        success("Pedido cancelado", "Tu pedido fue cancelado exitosamente.");
        await fetchMyOrders();
      } catch (err2) {
        error("Error al cancelar pedido", err2.message || "No se pudo cancelar el pedido.");
      }
    }
  };

  const activeCategorias = categoriasList.length > 0 ? categoriasList : categoriasDefault;
  const activeProductos = productosList.length > 0 ? productosList : productosDefault;
  const activeAdiciones = adicionesList.length > 0 ? adicionesList : adicionesDisponibles;

  const productosFiltrados = activeProductos.filter((p) => {
    const prodName = (p.nombre || "").toLowerCase();
    const prodDesc = (p.descripcion || "").toLowerCase();
    const matchSearch = !searchTerm || prodName.includes(searchTerm.toLowerCase()) || prodDesc.includes(searchTerm.toLowerCase());
    if (!matchSearch) return false;

    if (!selectedCategoria) return true;

    const selectedCatObj = activeCategorias.find(c => (c.id === selectedCategoria) || (c.idCategoriaProducto === selectedCategoria));
    const catName = (selectedCatObj?.nombre || "").toLowerCase().trim();
    const prodCatName = (p.categoriaNombre || p.categoria || "").toLowerCase().trim();

    const matchCatId = (p.categoria === selectedCategoria) || (p.idCategoriaProducto === selectedCategoria) || (String(p.categoria) === String(selectedCategoria));
    const matchCatName = catName && (prodCatName === catName || prodCatName.includes(catName) || catName.includes(prodCatName));

    const singularCatName = catName.endsWith("es") ? catName.slice(0, -2) : (catName.endsWith("s") ? catName.slice(0, -1) : catName);
    const matchSubcategory = singularCatName.length >= 3 && (
      prodCatName.includes(singularCatName) || prodName.includes(singularCatName)
    );

    return matchCatId || matchCatName || matchSubcategory;
  });

  const handleProductClick = async (producto) => {
    const prodId = producto.id || producto.idProducto;
    let ficha = fichasMap[prodId] || fichasTecnicasDefault[prodId];
    if (!ficha) {
      try {
        const fetchedFicha = await fichasTecnicasService.getFichaByProducto(prodId);
        if (fetchedFicha) {
          ficha = fetchedFicha;
          setFichasMap(prev => ({ ...prev, [prodId]: fetchedFicha }));
        }
      } catch (e) {
        console.warn("Ficha no encontrada para producto", prodId);
      }
    }

    setProductoSeleccionado({
      producto,
      cantidad: 1,
      adicionesSeleccionadas: [],
      ficha: ficha || fichasTecnicasDefault[prodId] || null
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

  const handleAdicionQuantityChange = (idAdicion, delta, e) => {
    if (e) e.stopPropagation();
    if (!productoSeleccionado) return;
    const existing = productoSeleccionado.adicionesSeleccionadas.find((a) => a.idAdicion === idAdicion);
    if (!existing) return;

    if (existing.cantidad + delta <= 0) {
      setProductoSeleccionado({
        ...productoSeleccionado,
        adicionesSeleccionadas: productoSeleccionado.adicionesSeleccionadas.filter((a) => a.idAdicion !== idAdicion)
      });
    } else {
      setProductoSeleccionado({
        ...productoSeleccionado,
        adicionesSeleccionadas: productoSeleccionado.adicionesSeleccionadas.map((a) => {
          if (a.idAdicion === idAdicion) {
            return { ...a, cantidad: a.cantidad + delta };
          }
          return a;
        })
      });
    }
  };

  const handleAddToCart = () => {
    if (!productoSeleccionado) return;
    const prod = productoSeleccionado.producto;
    let basePrice = Number(prod.precio || 0);
    const evtPrecio = prod.eventos?.find(e => e.tipoEvento === "Promoción Precio");
    const evtDesc = prod.eventos?.find(e => e.tipoEvento === "Descuento");
    if (evtPrecio) {
      basePrice = Number(evtPrecio.nuevoPrecio);
    } else if (evtDesc) {
      basePrice = basePrice * (1 - Number(evtDesc.descuento) / 100);
    }

    addToCart({
      id: prod.id || prod.idProducto,
      nombre: prod.nombre,
      precio: basePrice,
      cantidad: productoSeleccionado.cantidad || 1,
      imagen: prod.imagen,
      adiciones: (productoSeleccionado.adicionesSeleccionadas || []).map((a) => ({
        idAdicion: a.idAdicion,
        nombre: a.nombre,
        precio: Number(a.precio) || 0,
        cantidad: Number(a.cantidad) || 1,
        imagen: a.imagen || "🥫"
      }))
    });
    setShowProductModal(false);
    setProductoSeleccionado(null);
    success("¡Producto agregado!", `${prod.nombre} se agregó a tu carrito`);
  };

  const handleAbrirCheckout = () => {
    if (cart.length === 0) return;
    if (!isAuthenticated) {
      setShowEmptyCartLoginModal(true);
      return;
    }
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
  const fidelidadCliente = user?.fidelidad || {};
  const pedidosCount = pedidos.length;
  const tipoFidelidad = fidelidadCliente.tipo || user?.tipo || (pedidosCount >= 9 ? "VIP" : pedidosCount >= 6 ? "Frecuente" : pedidosCount >= 3 ? "Regular" : "Nuevo");
  const discountPercent = Number(fidelidadCliente.descuentoPorcentaje !== undefined ? fidelidadCliente.descuentoPorcentaje : (tipoFidelidad === "VIP" ? 15 : tipoFidelidad === "Frecuente" ? 10 : tipoFidelidad === "Regular" ? 5 : 0));
  const comprasCiclo = fidelidadCliente.comprasCiclo !== undefined ? fidelidadCliente.comprasCiclo : (pedidosCount % 3);
  const comprasFaltantes = fidelidadCliente.comprasFaltantes !== undefined ? fidelidadCliente.comprasFaltantes : (3 - (comprasCiclo % 3));
  const siguienteNivel = fidelidadCliente.siguienteNivel || (tipoFidelidad === "Nuevo" ? "Regular" : tipoFidelidad === "Regular" ? "Frecuente" : "VIP");
  const clientDiscountMonto = discountPercent > 0 ? Math.round(clientSubtotal * (discountPercent / 100)) : 0;
  const totalCheckout = Math.max(0, clientSubtotal - clientDiscountMonto);
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
          descuentoAplicado: clientDiscountMonto,
          total: totalCheckout,
          tipoVenta: checkoutTipoEntrega === "domicilio" ? "DOMICILIO" : "PUNTO_DE_VENTA",
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
            productos: cart.map(item => {
              const itemAdds = (item.adiciones || []).reduce((s, a) => s + ((Number(a.precio) || 0) * Number(a.cantidad || 1)), 0);
              const lineTotal = ((Number(item.precio) || 0) + itemAdds) * (item.cantidad || 1);
              return {
                id: item.id,
                idVariante: item.id,
                nombre: item.nombre,
                cantidad: item.cantidad,
                precioUnitario: Number(item.precio) || 0,
                total: lineTotal,
                observaciones: item.observacion || item.observaciones || item.especificaciones || "",
                adiciones: (item.adiciones || []).map(a => ({
                  idAdicion: a.idAdicion || a.id,
                  nombre: a.nombre,
                  precio: Number(a.precio) || 0,
                  cantidad: Number(a.cantidad || 1)
                }))
              };
            })
          }),
          detalles: cart.map(item => {
            const itemAdds = (item.adiciones || []).reduce((s, a) => s + ((Number(a.precio) || 0) * Number(a.cantidad || 1)), 0);
            const lineTotal = ((Number(item.precio) || 0) + itemAdds) * (item.cantidad || 1);
            return {
              idVariante: item.id || 1,
              cantidad: item.cantidad,
              precioUnitario: Number(item.precio) || 0,
              subtotal: lineTotal,
              idAdiciones: (item.adiciones || []).map(a => a.idAdicion || a.id),
              adiciones: item.adiciones || [],
              observacion: item.observacion || item.observaciones || "",
              observaciones: item.nombre + (item.adiciones && item.adiciones.length > 0 ? ` (+${item.adiciones.map(a => a.nombre).join(', ')})` : '')
            };
          })
        };

        const nuevaVentaRes = await ventasService.createVenta(ventaPayload);
        
        // Save to client's local orders history so it is preserved even if deleted from DB
        try {
          const userId = user?.idUsuario || user?.id || user?._id;
          const storageKey = `mis_pedidos_${userId || 'guest'}`;
          const localHistory = JSON.parse(localStorage.getItem(storageKey) || '[]');
          const orderId = nuevaVentaRes?.idVenta || nuevaVentaRes?.id || Date.now();
          const orderCode = nuevaVentaRes?.numeroVenta || `VEN-${String(orderId).padStart(4, '0')}`;
          
          localHistory.unshift({
            id: orderId,
            numeroVenta: orderCode,
            fecha: new Date().toLocaleString('es-CO'),
            items: cart.map(it => ({
              nombre: it.nombre + (it.adiciones && it.adiciones.length > 0 ? ` (+${it.adiciones.map(a => a.nombre).join(', ')})` : ''),
              cantidad: it.cantidad,
              precio: it.precio
            })),
            total: totalFinal,
            estado: 'Por Aprobar'
          });
          localStorage.setItem(storageKey, JSON.stringify(localHistory.slice(0, 50)));
        } catch (storageErr) {
          console.warn("No se pudo guardar pedido en historial local:", storageErr);
        }

        success("¡Pedido realizado exitosamente!", "Tu pedido fue registrado y está pendiente de aprobación.");
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
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800";
      case "Listo":
      case "LISTO":
      case "Completada":
      case "ENTREGADO":
      case "Entregado":
        return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800";
      case "Anulada":
      case "CANCELADO":
      case "Rechazado":
      case "RECHAZADO":
        return "bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800";
      case "Por Aprobar":
      case "PENDIENTE":
      case "Pendiente":
      default:
        return "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 dark:border-b dark:border-gray-800 shadow-md sticky top-0 z-40">
        <div className="w-full px-4 sm:px-6 lg:px-8">
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
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">Chazin Food</h1>
                  {isAuthenticated && (
                    <FidelidadBadge
                      tipo={tipoFidelidad}
                      descuento={discountPercent}
                      enGracia={fidelidadCliente.enGracia}
                      size="sm"
                    />
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {isAuthenticated ? `¡Bienvenido, ${user?.nombre}!` : "Bienvenido a Chazin Food"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={toggleDarkMode}
                className="p-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
                title="Cambiar Modo"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => setShowPerfil(true)}
                    className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-sm font-medium cursor-pointer"
                  >
                    <User className="w-5 h-5 text-[#f05454]" />
                    <span className="hidden sm:inline">Mi Perfil</span>
                  </button>

                  <button
                    onClick={() => {
                      fetchMyOrders();
                      setShowPedidos(true);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-sm font-medium cursor-pointer"
                  >
                    <Package className="w-5 h-5 text-red-500" />
                    <span className="hidden sm:inline">Mis Pedidos</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors font-medium text-sm cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Iniciar Sesión</span>
                </button>
              )}

              <button
                onClick={() => setShowCart(true)}
                className="relative flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors shadow-md font-semibold text-sm cursor-pointer"
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
                  className="p-2.5 text-gray-500 dark:text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer"
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
        <div className="w-full px-4 sm:px-6 lg:px-8 text-center space-y-2">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">¡El sabor auténtico de Chazin Food!</h2>
          <p className="text-sm sm:text-lg text-red-100 font-medium">Haz tu pedido online y recíbelo fresco en tu puerta</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="w-full px-4 sm:px-6 lg:px-8 -mt-6">
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

      {/* Banner de Fidelidad del Cliente */}
      {isAuthenticated && (
        <div className="w-full px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-red-950/20 border border-amber-200 dark:border-amber-900/40 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center text-2xl shadow-xs shrink-0">
                {tipoFidelidad === "VIP" ? "🥇" : tipoFidelidad === "Frecuente" ? "🥈" : tipoFidelidad === "Regular" ? "🥉" : "🌱"}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black uppercase tracking-wider text-orange-900 dark:text-orange-300">
                    Membresía {tipoFidelidad}
                  </span>
                  {discountPercent > 0 && (
                    <span className="px-2 py-0.5 bg-[#f05454] text-white text-[10px] font-black rounded-lg">
                      {discountPercent}% OFF activo
                    </span>
                  )}
                  {fidelidadCliente.enGracia && (
                    <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] font-black rounded-lg flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Periodo de Gracia: {fidelidadCliente.diasGraciaRestantes || 0}d</span>
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-0.5 flex items-center gap-1.5 flex-wrap">
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                  <span>
                    Racha: <strong>{comprasCiclo} de 3</strong>
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-[#f05454] font-bold">
                    {comprasFaltantes === 0 
                      ? "¡Meta alcanzada! 🎉" 
                      : tipoFidelidad === "VIP"
                        ? `Faltan ${comprasFaltantes} ${comprasFaltantes === 1 ? 'compra' : 'compras'} para renovar`
                        : `Faltan ${comprasFaltantes} ${comprasFaltantes === 1 ? 'compra' : 'compras'} para subir a ${siguienteNivel}`}
                  </span>
                  {tipoFidelidad !== "Nuevo" && fidelidadCliente.diasRestantes !== undefined && !fidelidadCliente.enGracia && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span>Vigencia: {fidelidadCliente.diasRestantes}d restantes</span>
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPerfil(true)}
              className="w-full sm:w-auto px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold transition-all shadow-2xs hover:shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Ver Beneficios y Racha</span>
            </button>
          </div>
        </div>
      )}

      {/* Categorías Carousel */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">Categorías</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Explora nuestro menú</p>
        </div>

        {/* Carousel Wrapper with Left & Right Buttons */}
        <div className="relative flex items-center gap-2 sm:gap-3 w-full">
          {/* Left Button */}
          <button
            type="button"
            onClick={() => scrollCategories("left")}
            aria-label="Anterior categoría"
            className="shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center cursor-pointer z-10"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Horizontal Carousel Container */}
          <div
            ref={categoryCarouselRef}
            className="flex-1 flex items-stretch gap-3 overflow-x-auto no-scrollbar scroll-smooth py-2 px-1"
            style={{
              scrollSnapType: "x mandatory",
              scrollbarWidth: "none",
              msOverflowStyle: "none"
            }}
          >
            <button
              type="button"
              onClick={() => setSelectedCategoria(null)}
              style={{ scrollSnapAlign: "start" }}
              className={`shrink-0 w-28 sm:w-32 p-3.5 rounded-2xl transition-all flex flex-col items-center justify-center text-center gap-2 cursor-pointer ${
                selectedCategoria === null
                  ? "bg-red-500 text-white shadow-lg shadow-red-500/25 scale-105 font-bold"
                  : "bg-white dark:bg-gray-900 dark:text-gray-200 border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-xs"
              }`}
            >
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-white/20 dark:bg-gray-800/60 shadow-xs">
                <div className="text-3xl">🍽️</div>
              </div>
              <p className="text-xs font-semibold truncate w-full">Todos</p>
            </button>

            {activeCategorias.map((cat) => {
              const isSelected = selectedCategoria === cat.id || selectedCategoria === cat.idCategoriaProducto;
              return (
                <button
                  key={cat.id || cat.idCategoriaProducto || cat.nombre}
                  type="button"
                  onClick={() => setSelectedCategoria(cat.id || cat.idCategoriaProducto)}
                  style={{ scrollSnapAlign: "start" }}
                  className={`shrink-0 w-28 sm:w-32 p-3.5 rounded-2xl transition-all flex flex-col items-center justify-center text-center gap-2 cursor-pointer ${
                    isSelected
                      ? "bg-red-500 text-white shadow-lg shadow-red-500/25 scale-105 font-bold"
                      : "bg-white dark:bg-gray-900 dark:text-gray-200 border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-xs"
                  }`}
                >
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl overflow-hidden bg-white/30 dark:bg-gray-800/60 shadow-xs border border-gray-100 dark:border-gray-700">
                    {cat.icon?.includes("/") || cat.icon?.includes(".") ? (
                      <img src={cat.icon} alt={cat.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-3xl">{cat.icon || getCategoryMeta(cat.nombre).icon}</div>
                    )}
                  </div>
                  <p className="text-xs font-semibold leading-tight line-clamp-2 text-center w-full" title={cat.nombre}>
                    {cat.nombre}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Right Button */}
          <button
            type="button"
            onClick={() => scrollCategories("right")}
            aria-label="Siguiente categoría"
            className="shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center cursor-pointer z-10"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>

      {/* Productos */}
      <div className="w-full px-4 sm:px-6 lg:px-8 pb-16">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
          {selectedCategoria ? activeCategorias.find((c) => (c.id === selectedCategoria || c.idCategoriaProducto === selectedCategoria))?.nombre : "Menú Principal"}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productosFiltrados.map((producto) => (
            <div
              key={producto.id || producto.idProducto}
              onClick={() => handleProductClick(producto)}
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-md hover:shadow-xl transition-all border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col justify-between cursor-pointer group hover:-translate-y-1"
            >
              <div className="bg-gradient-to-br from-red-400 to-red-600 h-44 flex items-center justify-center relative overflow-hidden">
                {producto.imagen?.includes('/') || producto.imagen?.includes('.') ? (
                  <img src={producto.imagen} alt={producto.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="text-7xl group-hover:scale-110 transition-transform duration-300">{producto.imagen || "🍔"}</div>
                )}
                {/* Badge Ver detalles */}
                <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 opacity-90 group-hover:opacity-100">
                  <FileText className="w-3 h-3" />
                  <span>Ver detalles</span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="font-bold text-lg text-gray-800 dark:text-gray-100 group-hover:text-red-500 transition-colors">{producto.nombre}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{producto.descripcion || "Platillo preparado con ingredientes frescos y de calidad."}</p>
                  
                  {/* Rating Stars Summary */}
                  <div className="mt-2 flex items-center justify-between">
                    {(() => {
                      const pId = producto.id || producto.idProducto;
                      const rInfo = ratingsMap[pId];
                      if (rInfo && rInfo.total > 0) {
                        return (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setProductoParaResenas(producto);
                              setShowResenasModal(true);
                            }}
                            className="flex items-center gap-1.5 hover:opacity-80 transition cursor-pointer"
                            title="Ver reseñas"
                          >
                            <StarRating value={rInfo.promedio} readonly size="xs" />
                            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{rInfo.promedio.toFixed(1)}</span>
                            <span className="text-[10.5px] text-gray-400">({rInfo.total})</span>
                          </div>
                        );
                      }
                      return (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProductoParaResenas(producto);
                            setShowResenasModal(true);
                          }}
                          className="text-[11px] text-gray-400 hover:text-amber-500 flex items-center gap-1 transition cursor-pointer"
                        >
                          <Star className="w-3 h-3" />
                          <span>Sin reseñas</span>
                        </button>
                      );
                    })()}
                  </div>
                </div>
                <div className="space-y-3 pt-2">
                  <div className="flex flex-col">
                    {producto.eventos && producto.eventos.length > 0 && producto.eventos.find(e => e.tipoEvento === "Promoción Precio" || e.tipoEvento === "Descuento") ? (
                      <>
                        <span className="text-xs text-gray-400 line-through">${producto.precio.toLocaleString()}</span>
                        <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <Zap className="w-4 h-4" />
                          ${(() => {
                            const evtPrecio = producto.eventos.find(e => e.tipoEvento === "Promoción Precio");
                            if (evtPrecio) return Number(evtPrecio.nuevoPrecio).toLocaleString();
                            const evtDesc = producto.eventos.find(e => e.tipoEvento === "Descuento");
                            if (evtDesc) return (producto.precio * (1 - Number(evtDesc.descuento)/100)).toLocaleString();
                            return producto.precio.toLocaleString();
                          })()}
                        </span>
                      </>
                    ) : (
                      <p className="text-2xl font-black text-red-600 dark:text-red-400">${producto.precio.toLocaleString()}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProductClick(producto);
                    }}
                    className="w-full py-3 bg-red-500 hover:bg-red-600 active:scale-[0.98] text-white rounded-2xl transition-all font-bold text-sm flex items-center justify-center gap-2 shadow-md"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Inspeccionar y Agregar
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
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 z-10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center pt-2">
              <div className="flex justify-center mb-4 mt-2">
                {productoSeleccionado.producto.imagen?.includes('/') || productoSeleccionado.producto.imagen?.includes('.') ? (
                  <img src={productoSeleccionado.producto.imagen} alt={productoSeleccionado.producto.nombre} className="w-48 h-48 object-cover rounded-2xl shadow-md" />
                ) : (
                  <div className="text-6xl">{productoSeleccionado.producto.imagen || "🍔"}</div>
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{productoSeleccionado.producto.nombre}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{productoSeleccionado.producto.descripcion || "Preparación fresca y artesanal."}</p>

              {/* Reseñas Button in Modal */}
              <div className="mt-2.5 flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setProductoParaResenas(productoSeleccionado.producto);
                    setShowResenasModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 rounded-full text-xs font-bold transition shadow-2xs cursor-pointer"
                >
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>
                    {(() => {
                      const pId = productoSeleccionado.producto.id || productoSeleccionado.producto.idProducto;
                      const rInfo = ratingsMap[pId];
                      return rInfo && rInfo.total > 0
                        ? `${rInfo.promedio.toFixed(1)} ★ (${rInfo.total} reseñas)`
                        : "Ver / Dejar Reseña";
                    })()}
                  </span>
                </button>
              </div>

              <div className="mt-2 flex flex-col items-center">
                {productoSeleccionado.producto.eventos && productoSeleccionado.producto.eventos.length > 0 && productoSeleccionado.producto.eventos.find(e => e.tipoEvento === "Promoción Precio" || e.tipoEvento === "Descuento") ? (
                  <>
                    <span className="text-sm text-gray-400 line-through">${productoSeleccionado.producto.precio.toLocaleString()}</span>
                    <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Zap className="w-5 h-5" />
                      ${(() => {
                        const evtPrecio = productoSeleccionado.producto.eventos.find(e => e.tipoEvento === "Promoción Precio");
                        if (evtPrecio) return Number(evtPrecio.nuevoPrecio).toLocaleString();
                        const evtDesc = productoSeleccionado.producto.eventos.find(e => e.tipoEvento === "Descuento");
                        if (evtDesc) return (productoSeleccionado.producto.precio * (1 - Number(evtDesc.descuento)/100)).toLocaleString();
                        return productoSeleccionado.producto.precio.toLocaleString();
                      })()}
                    </span>
                  </>
                ) : (
                  <p className="text-xl font-extrabold text-red-600 dark:text-red-400">${productoSeleccionado.producto.precio.toLocaleString()}</p>
                )}
              </div>
            </div>

            {/* Eventos si existen */}
            {productoSeleccionado.producto.eventos && productoSeleccionado.producto.eventos.length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/10 rounded-2xl p-3 border border-yellow-100 dark:border-yellow-900/30">
                <p className="text-xs font-bold text-yellow-600 dark:text-yellow-500 mb-2 uppercase tracking-wider flex items-center gap-1"><Zap className="w-4 h-4"/> Eventos Activos</p>
                <div className="space-y-2">
                  {productoSeleccionado.producto.eventos.map((evt, i) => (
                    <div key={i} className="text-xs flex flex-col gap-0.5">
                      <span className="font-bold text-gray-800 dark:text-gray-200">{evt.nombreEvento || evt.nombre}</span>
                      {evt.tipoEvento === "Descuento" && (
                        <span className="text-emerald-600 font-semibold">-{Number(evt.descuento)}% de descuento</span>
                      )}
                      {evt.tipoEvento === "Promoción Precio" && (
                        <span className="text-purple-600 font-semibold">Precio promocional: ${Number(evt.nuevoPrecio).toLocaleString()}</span>
                      )}
                      {evt.tipoEvento === "Añadir Insumos" && (
                        <span className="text-blue-600 font-semibold">
                          {evt.accionInsumo === "Quitar" ? "Insumos removidos" : "Insumos extra incluidos"}
                        </span>
                      )}
                      <p className="text-gray-500 dark:text-gray-400">{evt.descripcion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ficha técnica del producto (Ingredientes, tiempo, etc.) */}
            <FichaTecnicaProductoCliente
              ficha={productoSeleccionado.ficha || fichasMap[productoSeleccionado.producto.id] || fichasMap[productoSeleccionado.producto.idProducto] || fichasTecnicasDefault[productoSeleccionado.producto.id]}
              producto={productoSeleccionado.producto}
            />

            {/* Cantidad */}
            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-2xl">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Cantidad:</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setProductoSeleccionado({ ...productoSeleccionado, cantidad: Math.max(1, productoSeleccionado.cantidad - 1) })}
                  className="w-8 h-8 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-200 cursor-pointer active:scale-95"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-bold text-gray-900 dark:text-gray-100 w-6 text-center">{productoSeleccionado.cantidad}</span>
                <button
                  type="button"
                  onClick={() => setProductoSeleccionado({ ...productoSeleccionado, cantidad: productoSeleccionado.cantidad + 1 })}
                  className="w-8 h-8 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-200 cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Adiciones */}
            {activeAdiciones.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Adiciones disponibles:</p>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {activeAdiciones.map((ad) => {
                    const selected = productoSeleccionado.adicionesSeleccionadas.find((a) => a.idAdicion === ad.idAdicion);
                    return (
                      <div
                        key={ad.idAdicion}
                        className={`p-2.5 rounded-2xl border text-xs flex items-center justify-between transition-all ${
                          selected
                            ? "border-[#F05454] bg-red-50/60 dark:bg-red-950/30 shadow-xs"
                            : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                      >
                        <div
                          onClick={() => handleAdicionToggle(ad)}
                          className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer select-none"
                        >
                          <span className="text-lg shrink-0">{ad.imagen || "🥫"}</span>
                          <div className="min-w-0">
                            <p className="text-gray-900 dark:text-gray-100 font-bold truncate">{ad.nombre}</p>
                            <p className="text-[#F05454] dark:text-red-400 font-extrabold text-[11px]">
                              +${Number(ad.precio).toLocaleString("es-CO")}
                            </p>
                          </div>
                        </div>

                        {/* Stepper Sumar / Restar cuando está seleccionada */}
                        {selected ? (
                          <div className="flex items-center gap-1.5 bg-white dark:bg-gray-800 px-2 py-1 rounded-xl border border-red-200 dark:border-red-900/60 shadow-xs">
                            <button
                              type="button"
                              onClick={(e) => handleAdicionQuantityChange(ad.idAdicion, -1, e)}
                              className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900/40 text-gray-700 dark:text-gray-200 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
                              title="Restar cantidad"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="font-black text-gray-900 dark:text-gray-100 min-w-5 text-center text-xs">
                              {selected.cantidad}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleAdicionQuantityChange(ad.idAdicion, 1, e)}
                              className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900/40 text-gray-700 dark:text-gray-200 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
                              title="Sumar cantidad"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAdicionToggle(ad)}
                            className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-[#F05454] hover:text-white text-gray-700 dark:text-gray-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Agregar</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              onClick={handleAddToCart}
              className="w-full py-3.5 bg-red-500 hover:bg-red-600 active:scale-[0.98] text-white rounded-2xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              Agregar al carrito • ${(
                ((() => {
                  let basePrice = Number(productoSeleccionado.producto.precio || 0);
                  const evtPrecio = productoSeleccionado.producto.eventos?.find(e => e.tipoEvento === "Promoción Precio");
                  const evtDesc = productoSeleccionado.producto.eventos?.find(e => e.tipoEvento === "Descuento");
                  if (evtPrecio) {
                    basePrice = Number(evtPrecio.nuevoPrecio);
                  } else if (evtDesc) {
                    basePrice = basePrice * (1 - Number(evtDesc.descuento)/100);
                  }
                  return basePrice;
                })() +
                  productoSeleccionado.adicionesSeleccionadas.reduce((s, a) => s + (Number(a.precio) || 0) * (Number(a.cantidad) || 1), 0)) *
                (productoSeleccionado.cantidad || 1)
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

      {/* MODAL CHECKOUT — Diseño Exacto Aprobado */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[94vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">

            {/* ═══ HEADER ROJO GRADIENT CON BORDES REDONDEADOS ═══ */}
            <div className="bg-gradient-to-r from-[#D9383A] to-[#E03E3E] px-6 py-5 flex items-center justify-between rounded-t-3xl shrink-0">
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">Finalizar Pedido</h3>
                <p className="text-xs text-white/90 font-medium mt-0.5">Completa los datos de entrega y pago</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCheckout(false)}
                className="w-9 h-9 rounded-2xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ═══ CUERPO SCROLLEABLE ═══ */}
            <div className="overflow-y-auto flex-1 p-6 space-y-6 scrollbar-thin">

              {/* ── 1. Resumen de compra (Tarjeta Superior) ── */}
              <div className="bg-white dark:bg-gray-800/60 rounded-2xl p-4 space-y-2 border border-gray-100 dark:border-gray-700/60 shadow-2xs">
                <div className="flex justify-between items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                  <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400 font-semibold">
                    <ShoppingCart className="w-4 h-4 text-[#E03E3E]" /> Subtotal ({getTotalItems()} prod.)
                  </span>
                  <span className="font-bold text-gray-900 dark:text-gray-100">${clientSubtotal.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium text-gray-600 dark:text-gray-400">
                  <span>IVA (0%)</span>
                  <span>$0</span>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-700/80 pt-2 flex justify-between items-center">
                  <span className="text-base font-black text-gray-900 dark:text-gray-100">Total</span>
                  <span className="text-xl font-black text-[#D9383A]">${totalCheckout.toLocaleString('es-CO')}</span>
                </div>
              </div>

              {/* ── 2. Tipo de Entrega ── */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-[#7F1D1D] dark:text-red-300 uppercase tracking-wider flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#B91C1C]" />
                  <span>Tipo de Entrega</span>
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {/* Card Domicilio */}
                  <button
                    type="button"
                    onClick={() => setCheckoutTipoEntrega("domicilio")}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                      checkoutTipoEntrega === "domicilio"
                        ? "border-[#E03E3E] bg-[#FFF5F5] dark:bg-red-950/20 shadow-xs"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/80"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <div className="flex items-center gap-2">
                        <Truck className={`w-4 h-4 ${checkoutTipoEntrega === "domicilio" ? "text-[#E03E3E]" : "text-gray-600 dark:text-gray-400"}`} />
                        <span className={`font-bold text-sm ${checkoutTipoEntrega === "domicilio" ? "text-[#E03E3E]" : "text-gray-800 dark:text-gray-200"}`}>
                          Domicilio
                        </span>
                      </div>
                      {checkoutTipoEntrega === "domicilio" && (
                        <span className="w-4 h-4 rounded-full border border-[#E03E3E] flex items-center justify-center text-[#E03E3E] text-[10px] font-black">
                          ✓
                        </span>
                      )}
                    </div>
                    <span className={`text-xs font-medium ${checkoutTipoEntrega === "domicilio" ? "text-[#E03E3E]/80" : "text-gray-500 dark:text-gray-400"}`}>
                      Llevamos tu pedido
                    </span>
                  </button>

                  {/* Card Recoger */}
                  <button
                    type="button"
                    onClick={() => setCheckoutTipoEntrega("llevar")}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                      checkoutTipoEntrega === "llevar"
                        ? "border-[#E03E3E] bg-[#FFF5F5] dark:bg-red-950/20 shadow-xs"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/80"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <div className="flex items-center gap-2">
                        <Store className={`w-4 h-4 ${checkoutTipoEntrega === "llevar" ? "text-[#E03E3E]" : "text-gray-600 dark:text-gray-400"}`} />
                        <span className={`font-bold text-sm ${checkoutTipoEntrega === "llevar" ? "text-[#E03E3E]" : "text-gray-800 dark:text-gray-200"}`}>
                          Recoger en Local
                        </span>
                      </div>
                      {checkoutTipoEntrega === "llevar" && (
                        <span className="w-4 h-4 rounded-full border border-[#E03E3E] flex items-center justify-center text-[#E03E3E] text-[10px] font-black">
                          ✓
                        </span>
                      )}
                    </div>
                    <span className={`text-xs font-medium ${checkoutTipoEntrega === "llevar" ? "text-[#E03E3E]/80" : "text-gray-500 dark:text-gray-400"}`}>
                      Pasas a recogerlo
                    </span>
                  </button>
                </div>
              </div>

              {/* ── 3. Datos de Entrega ── */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-[#7F1D1D] dark:text-red-300 uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#B91C1C]" />
                  <span>Datos de Entrega</span>
                </h4>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Nombre del destinatario
                  </label>
                  <input
                    type="text"
                    value={checkoutNombre}
                    onChange={(e) => setCheckoutNombre(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-medium text-gray-900 dark:text-gray-100 outline-none focus:border-[#E03E3E] transition"
                    placeholder="María García"
                  />
                </div>

                {checkoutTipoEntrega === "domicilio" ? (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                      Dirección de entrega <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={checkoutDireccion}
                      onChange={(e) => setCheckoutDireccion(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-medium text-gray-900 dark:text-gray-100 outline-none focus:border-[#E03E3E] transition"
                      placeholder="Ej: Calle 45 #12-30, Apto 201"
                    />
                  </div>
                ) : (
                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl p-3 flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      <span className="font-bold">Recoger en:</span> Chazin Food — Cra. 12 #45-67. Te notificaremos cuando esté listo.
                    </p>
                  </div>
                )}
              </div>

              {/* ── 4. Método de Pago ── */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-[#7F1D1D] dark:text-red-300 uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#B91C1C]" />
                  <span>Método de Pago</span>
                </h4>
                <div className="grid grid-cols-3 gap-2.5">
                  {/* Efectivo */}
                  <button
                    type="button"
                    onClick={() => setCheckoutMetodoPago("efectivo")}
                    className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                      checkoutMetodoPago === "efectivo"
                        ? "border-[#E03E3E] bg-[#FFF5F5] dark:bg-red-950/20 text-[#E03E3E] shadow-xs"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <Banknote className="w-5 h-5 text-inherit" />
                    <span className="text-xs font-bold text-inherit">Efectivo</span>
                    {checkoutMetodoPago === "efectivo" ? (
                      <span className="w-4 h-4 rounded-full border border-[#E03E3E] flex items-center justify-center text-[#E03E3E] text-[10px] font-black">
                        ✓
                      </span>
                    ) : (
                      <span className="h-4" />
                    )}
                  </button>

                  {/* Tarjeta */}
                  <button
                    type="button"
                    onClick={() => setCheckoutMetodoPago("tarjeta")}
                    className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                      checkoutMetodoPago === "tarjeta"
                        ? "border-[#E03E3E] bg-[#FFF5F5] dark:bg-red-950/20 text-[#E03E3E] shadow-xs"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-inherit" />
                    <span className="text-xs font-bold text-inherit">Tarjeta</span>
                    {checkoutMetodoPago === "tarjeta" ? (
                      <span className="w-4 h-4 rounded-full border border-[#E03E3E] flex items-center justify-center text-[#E03E3E] text-[10px] font-black">
                        ✓
                      </span>
                    ) : (
                      <span className="h-4" />
                    )}
                  </button>

                  {/* Transferencia */}
                  <button
                    type="button"
                    onClick={() => setCheckoutMetodoPago("transferencia")}
                    className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                      checkoutMetodoPago === "transferencia"
                        ? "border-[#E03E3E] bg-[#FFF5F5] dark:bg-red-950/20 text-[#E03E3E] shadow-xs"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-inherit" />
                    <span className="text-xs font-bold text-inherit">Transferencia</span>
                    {checkoutMetodoPago === "transferencia" ? (
                      <span className="w-4 h-4 rounded-full border border-[#E03E3E] flex items-center justify-center text-[#E03E3E] text-[10px] font-black">
                        ✓
                      </span>
                    ) : (
                      <span className="h-4" />
                    )}
                  </button>
                </div>

                {/* Sub-formulario Efectivo */}
                {checkoutMetodoPago === "efectivo" && (
                  <div className="bg-[#F0FDF4] dark:bg-emerald-950/20 border border-[#DCFCE7] dark:border-emerald-900/40 rounded-2xl p-4 space-y-2">
                    <label className="block text-xs font-bold text-[#166534] dark:text-emerald-300">
                      ¿Con cuánto vas a pagar? <span className="font-normal text-gray-500 dark:text-gray-400">(opcional)</span>
                    </label>
                    <div className="relative flex items-center bg-white dark:bg-gray-800 border border-[#86EFAC] dark:border-emerald-700 rounded-2xl px-4 py-2.5 shadow-2xs">
                      <Banknote className="w-4 h-4 text-[#16A34A] mr-2 shrink-0" />
                      <input
                        type="number"
                        value={checkoutEfectivoPaga}
                        onChange={(e) => setCheckoutEfectivoPaga(e.target.value)}
                        placeholder="Ej: 50000"
                        className="w-full bg-transparent text-sm font-bold text-gray-900 dark:text-gray-100 outline-none"
                      />
                    </div>
                    {checkoutEfectivoPaga && Number(checkoutEfectivoPaga) >= totalCheckout && (
                      <p className="text-xs font-black text-[#16A34A] dark:text-emerald-400 mt-1">
                        💰 Vueltos: ${vueltoEfectivo.toLocaleString('es-CO')}
                      </p>
                    )}
                  </div>
                )}

                {/* Sub-formulario Tarjeta */}
                {checkoutMetodoPago === "tarjeta" && (
                  <div className="bg-[#F8FAFF] dark:bg-blue-950/20 border border-[#E0E7FF] dark:border-blue-900/40 rounded-2xl p-4 space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-[#1E40AF] dark:text-blue-300 mb-1.5">
                        Número de tarjeta <span className="text-red-500">*</span>
                      </label>
                      <div className="relative flex items-center bg-white dark:bg-gray-800 border border-[#C7D2FE] dark:border-blue-700 rounded-2xl px-4 py-2.5 shadow-2xs">
                        <CreditCard className="w-4 h-4 text-[#3B82F6] mr-2 shrink-0" />
                        <input
                          type="text"
                          value={checkoutTarjetaNumero}
                          onChange={(e) => {
                            const v = e.target.value.replace(/[^\d]/g, '').slice(0, 16);
                            setCheckoutTarjetaNumero(v.replace(/(\d{4})(?=\d)/g, '$1 '));
                          }}
                          placeholder="0000 0000 0000 0000"
                          className="w-full bg-transparent text-sm font-mono font-bold text-gray-900 dark:text-gray-100 outline-none tracking-widest"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#1E40AF] dark:text-blue-300 mb-1.5">
                        Monto a cargar
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={`$ ${totalCheckout.toLocaleString('es-CO')}`}
                        className="w-full px-4 py-2.5 bg-white/70 dark:bg-gray-800/80 border border-[#C7D2FE] dark:border-blue-700 rounded-2xl text-sm font-bold text-gray-700 dark:text-gray-200 outline-none cursor-not-allowed"
                      />
                    </div>
                  </div>
                )}

                {/* Sub-formulario Transferencia */}
                {checkoutMetodoPago === "transferencia" && (
                  <div className="bg-[#F8FAFF] dark:bg-blue-950/20 border border-[#E0E7FF] dark:border-blue-900/40 rounded-2xl p-4 space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-[#1E40AF] dark:text-blue-300 mb-1.5">
                        Entidad / Banco origen
                      </label>
                      <select
                        value={checkoutTransferBanco}
                        onChange={(e) => setCheckoutTransferBanco(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-[#C7D2FE] dark:border-blue-700 rounded-2xl text-sm font-bold text-gray-900 dark:text-gray-100 outline-none"
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
                    <div className="bg-blue-100/70 dark:bg-blue-900/30 p-2.5 rounded-xl text-xs text-[#1E40AF] dark:text-blue-300 font-medium">
                      Transfiere a <span className="font-bold">Bancolombia Ahorros 123-456789-00</span> a nombre de <span className="font-bold">Chazin Food</span>.
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#1E40AF] dark:text-blue-300 mb-1.5">
                        Número de referencia <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={checkoutTransferReferencia}
                        onChange={(e) => setCheckoutTransferReferencia(e.target.value)}
                        placeholder="Ej: 987654321"
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-[#C7D2FE] dark:border-blue-700 rounded-2xl text-sm font-mono font-bold text-gray-900 dark:text-gray-100 outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* ── 5. Especificaciones ── */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-[#7F1D1D] dark:text-red-300 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#B91C1C]" />
                  <span>Especificaciones</span>
                  <span className="font-normal text-gray-400 text-[11px] lowercase">(opcional)</span>
                </h4>
                <textarea
                  rows={3}
                  value={checkoutEspecificaciones}
                  onChange={(e) => setCheckoutEspecificaciones(e.target.value)}
                  placeholder="Ej: Sin cebolla, dejar en portería, tocar timbre..."
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-[#E03E3E] transition resize-none"
                />
              </div>
            </div>

            {/* ═══ FOOTER FIJO CON PRECIO Y BOTÓN CONFIRMAR ═══ */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0 space-y-2.5 rounded-b-3xl">
              <div className="space-y-1.5">
                {clientDiscountMonto > 0 && (
                  <>
                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                      <span>Subtotal:</span>
                      <span className="font-semibold">${clientSubtotal.toLocaleString('es-CO')}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-xl">
                      <span>Descuento Fidelidad ({discountPercent}% OFF):</span>
                      <span>-${clientDiscountMonto.toLocaleString('es-CO')}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between items-center pt-1 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-base font-bold text-gray-900 dark:text-gray-100">Total a pagar:</span>
                  <span className="text-2xl font-black text-[#D9383A]">${totalCheckout.toLocaleString('es-CO')}</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium">
                <Info className="w-3.5 h-3.5" />
                <span>Precio sin IVA aplicado</span>
              </div>
              <button
                type="button"
                onClick={handleConfirmarPedido}
                className="w-full py-4 bg-[#E03E3E] hover:bg-[#C92A2A] active:scale-98 text-white font-extrabold rounded-2xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Confirmar Pedido</span>
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

                    {(String(p.estado).toUpperCase() === 'PENDIENTE' || String(p.estado).toLowerCase() === 'en cola') && (
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => handleCancelarPedido(p.id)}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          Cancelar Pedido
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL INICIAR SESIÓN / REGISTRO PARA PAGAR */}
      {showEmptyCartLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl text-center space-y-4 border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-950/40 rounded-3xl flex items-center justify-center mx-auto text-red-500 shadow-inner">
              <LogIn className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-gray-100">Inicia sesión para pagar</h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                Tus productos están seguros en el carrito. Para ingresar tu dirección de entrega y confirmar tu pedido, inicia sesión o crea una cuenta.
              </p>
            </div>

            {/* Carrito preview simple */}
            {cart.length > 0 && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
                <span className="flex items-center gap-1.5">
                  <ShoppingCart className="w-4 h-4 text-red-500" /> {getTotalItems()} productos en tu carrito
                </span>
                <span className="font-black text-red-600 dark:text-red-400">${clientSubtotal.toLocaleString('es-CO')}</span>
              </div>
            )}

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowEmptyCartLoginModal(false);
                  navigate("/login");
                }}
                className="w-full py-3.5 px-4 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-2xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <LogIn className="w-4 h-4" />
                <span>Iniciar Sesión</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowEmptyCartLoginModal(false);
                  navigate("/login?tab=register");
                }}
                className="w-full py-3.5 px-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold rounded-2xl text-sm transition-all cursor-pointer"
              >
                Crear Cuenta Nueva
              </button>

              <button
                type="button"
                onClick={() => setShowEmptyCartLoginModal(false)}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors py-1 cursor-pointer"
              >
                Seguir viendo el menú
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

      {/* Modal Reseñas de Producto */}
      <ProductoResenasModal
        isOpen={showResenasModal}
        onClose={() => {
          setShowResenasModal(false);
          // Refresh ratings
          if (productosList.length > 0) {
            const pIds = productosList.map(p => p.id || p.idProducto).join(',');
            apiClient.get(`/resenas/ratings?ids=${pIds}`)
              .then(res => { if (res) setRatingsMap(res); })
              .catch(() => {});
          }
        }}
        producto={productoParaResenas}
      />
    </div>
  );
}
