import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/autenticacion/hooks/useAuth";
import { hasPrivilege } from "@/features/configuracion/utils/privilegiosUtils";
import { useDarkMode } from "@/shared/hooks/useDarkMode";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { MiPerfilModal } from "@/shared/components/profile/MiPerfilModal";
import logoImg from "@/shared/assets/ChatGPT_Image_1_jun_2026__21_55_04.png";
import {
  Menu,
  Home,
  ShoppingCart,
  TrendingUp,
  Settings,
  ChevronDown,
  ChevronRight,
  LogOut,
  Sun,
  Moon,
  X,
  Users,
  Shield,
  UserCircle,
  LayoutDashboard,
  ChefHat,
  Store,
  UtensilsCrossed,
  ArrowLeft,
  Layers
} from "lucide-react";
import {
  NavIconInicio,
  NavIconCompras,
  NavIconProduccion,
  NavIconVentas,
  NavIconConfig
} from "@/shared/components/icons/BottomNavIcons";

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [comprasExpanded, setComprasExpanded] = useState(false);
  const [produccionExpanded, setProduccionExpanded] = useState(false);
  const [ventasExpanded, setVentasExpanded] = useState(false);
  const [configExpanded, setConfigExpanded] = useState(false);
  const [usuariosExpanded, setUsuariosExpanded] = useState(false);
  const [perfilOpen, setPerfilOpen] = useState(false);
  const [darkMode, toggleDarkMode] = useDarkMode();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { confirmLogout, success } = useNotifications();

  const isActive = (path) => location.pathname === path;
  const isInSection = (prefix) => location.pathname.startsWith(prefix);

  const rawRol = typeof user?.rol === "object" ? user?.rol?.nombre : user?.rol;
  const userRol = String(rawRol || "").toLowerCase().trim();
  const isAdmin = userRol === "administrador" || userRol === "admin" || user?.idRol === 1;
  const isVendedor = userRol === "vendedor" || userRol.includes("vendedor") || user?.idRol === 2;

  const handleNavClick = () => {
    setSidebarOpen(false);
  };

  // ── Permission helper ──
  // Administrador always has all permissions; for other roles, check granular Ver privilege
  const hasPerm = (permName) => {
    return hasPrivilege(user, permName, "ver");
  };

  const handleLogout = async () => {
    setSidebarOpen(false);
    const confirmed = await confirmLogout();
    if (confirmed) {
      logout();
      success("Sesión cerrada", "Has salido del sistema correctamente");
      navigate("/login", { replace: true });
    }
  };

  const closeAllSections = () => {
    setComprasExpanded(false);
    setProduccionExpanded(false);
    setVentasExpanded(false);
    setConfigExpanded(false);
    setUsuariosExpanded(false);
  };

  const openSection = (section) => {
    setComprasExpanded(section === "compras");
    setProduccionExpanded(section === "produccion");
    setVentasExpanded(section === "ventas");
    setConfigExpanded(section === "config");
    setUsuariosExpanded(section === "usuarios");
  };

  const handleSectionClick = (section, cur) => {
    if (cur) {
      closeAllSections();
    } else {
      openSection(section);
    }
  };

  const handleMobileSectionClick = (section, cur) => {
    if (cur) {
      closeAllSections();
    } else {
      openSection(section);
    }
  };

  // Filter nav items based on permissions
  const allComprasItems = [
    { to: "/compras/categoria-insumos", label: "Categoría Insumos", perm: "Categoría Insumos" },
    { to: "/compras/insumos", label: "Insumos", perm: "Insumos" },
    { to: "/compras/proveedores", label: "Proveedores", perm: "Proveedores" },
    { to: "/compras/gestion", label: "Gestión de Compras", perm: "Gestión de Compras" }
  ];
  const comprasItems = allComprasItems.filter(i => hasPerm(i.perm));
  const showCompras = hasPerm("Compras") || comprasItems.length > 0;

  const allProduccionItems = [
    { to: "/ventas/categoria-productos", label: "Categoría Productos", perm: "Categoría Productos" },
    { to: "/ventas/productos", label: "Productos", perm: "Productos" },
    { to: "/produccion/gestion", label: "Gestión de Producción", perm: "Gestión de Producción" }
  ];
  const produccionItems = isVendedor
    ? allProduccionItems
    : allProduccionItems.filter(i => hasPerm(i.perm));
  const showProduccion = isVendedor || hasPerm("Producción") || produccionItems.length > 0;
  const produccionPaths = produccionItems.map((i) => i.to);

  const allVentasItems = [
    { to: "/ventas/gestion-ventas", label: "Gestión de Ventas", perm: "Gestión de Ventas" },
    { to: "/ventas/clientes", label: "Clientes", perm: "Clientes" }
  ];
  const ventasItems = isVendedor
    ? allVentasItems
    : allVentasItems.filter(i => hasPerm(i.perm));
  const showVentas = isVendedor || hasPerm("Ventas") || ventasItems.length > 0;
  const ventasPaths = [...ventasItems.map((i) => i.to), "/ventas/pos"];

  const allConfigItems = [
    { to: "/configuracion/roles", label: "Roles", perm: "Roles" }
  ];
  const configItems = allConfigItems.filter(i => hasPerm(i.perm));
  const showConfig = hasPerm("Configuración") || configItems.length > 0;

  const allUsuariosItems = [
    { to: "/configuracion/usuarios", label: "Gestión de Usuarios", perm: "Usuarios" }
  ];
  const usuariosItems = allUsuariosItems.filter(i => hasPerm(i.perm));
  const showUsuarios = hasPerm("Usuarios") || usuariosItems.length > 0;

  const getPageTitle = (path) => {
    if (path === "/ventas/pos") return "Punto de Venta";
    if (path.startsWith("/ventas/gestion-ventas") || path.startsWith("/ventas/detalle")) return "Gestión de Ventas";
    if (path.startsWith("/ventas/clientes")) return "Clientes";
    if (path.startsWith("/produccion/gestion")) return "Gestión de Producción";
    if (path.startsWith("/ventas/categoria-productos")) return "Categoría Productos";
    if (path.startsWith("/ventas/productos")) return "Productos";
    if (path.startsWith("/compras/categoria-insumos")) return "Categoría Insumos";
    if (path.startsWith("/compras/insumos")) return "Insumos";
    if (path.startsWith("/compras/proveedores")) return "Proveedores";
    if (path.startsWith("/compras/gestion")) return "Gestión de Compras";
    if (path.startsWith("/configuracion/roles")) return "Roles";
    if (path.startsWith("/configuracion/usuarios")) return "Usuarios";
    if (path === "/") return "Dashboard";
    return "Chazin Food";
  };

  const modulePills = [
    {
      to: "/ventas/pos",
      label: "Punto de Venta",
      icon: Store,
      isActive: (p) => p === "/ventas/pos"
    },
    {
      to: "/ventas/gestion-ventas",
      label: "Ventas",
      icon: TrendingUp,
      iconColor: "text-[#A91B2E]",
      isActive: (p) => p.startsWith("/ventas/gestion-ventas") || p.startsWith("/ventas/detalle")
    },
    {
      to: "/ventas/clientes",
      label: "Clientes",
      icon: Users,
      iconColor: "text-blue-500",
      isActive: (p) => p.startsWith("/ventas/clientes")
    },
    {
      isDivider: true
    },
    {
      to: "/ventas/categoria-productos",
      label: "Categoría Productos",
      icon: Layers,
      iconColor: "text-purple-500",
      isActive: (p) => p.startsWith("/ventas/categoria-productos")
    },
    {
      to: "/ventas/productos",
      label: "Productos",
      icon: UtensilsCrossed,
      iconColor: "text-emerald-500",
      isActive: (p) => p === "/ventas/productos"
    },
    {
      to: "/produccion/gestion",
      label: "Gestión de Producción",
      icon: ChefHat,
      iconColor: "text-amber-500",
      isActive: (p) => p.startsWith("/produccion")
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {!isVendedor && (
        <>
          {/* ── Overlay backdrop (solo para drawer móvil < lg) ── */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/45 backdrop-blur-md transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ═══════════════════════════════════════════════════════════
         DESKTOP SIDEBAR  (lg+) — totalmente fijo y visible en PC
         ═══════════════════════════════════════════════════════════ */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white dark:bg-gray-900 shadow-md border-r border-gray-200 dark:border-gray-800 h-screen transition-all duration-300 overflow-x-hidden">
        {/* Brand */}
        <div className="bg-gradient-to-br from-[#30475E] to-[#1e3347] px-5 pt-5 pb-4 shrink-0">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-4 hover:opacity-90 transition-opacity" title="Ir al inicio">
            <div className="w-7 h-7 rounded-full overflow-hidden bg-white/20 shrink-0">
              <img src={logoImg} alt="Chazin Food" className="w-full h-full object-cover" style={{ objectPosition: "50% 56%" }} />
            </div>
            <span className="font-bold text-white text-sm">Chazin Food</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0 ring-2 ring-white/30">
              {user?.nombre?.charAt(0).toUpperCase() ?? "A"}
            </div>
            <div>
              <p className="font-semibold text-white leading-tight">{user?.nombre ?? "Administrador"}</p>
              <p className="text-xs text-blue-200 capitalize mt-0.5">{user?.rol ?? "administrador"}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 overflow-y-auto overflow-x-hidden sidebar-scroll-container" style={{ overflowX: "hidden" }}>
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-3 mb-1.5 mt-1">Administración</p>
          <ul className="space-y-1">
            {/* Dashboard */}
            {hasPerm("Dashboard") && (
              <li>
                <Link to="/" title="Dashboard" className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${isActive("/") ? "bg-red-600 text-white shadow-md" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
                  <Home className="w-5 h-5 shrink-0" />
                  <span className="font-medium">Dashboard</span>
                </Link>
              </li>
            )}

            {/* Usuarios */}
            {showUsuarios && (
              <li>
                <button onClick={() => handleSectionClick("usuarios", usuariosExpanded)} title="Usuarios" className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-all ${isInSection("/configuracion/usuarios") ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
                  <div className="flex items-center gap-3"><Users className="w-5 h-5 shrink-0" /><span className="font-medium">Usuarios</span></div>
                  {usuariosExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                {usuariosExpanded && (
                  <ul className="ml-8 mt-1 space-y-1">
                    {usuariosItems.map(({ to, label }) => <li key={to}><Link to={to} className={`block px-4 py-2 rounded-lg text-sm transition-all ${isActive(to) ? "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-medium" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>{label}</Link></li>)}
                  </ul>
                )}
              </li>
            )}

            {/* Configuración */}
            {showConfig && (
              <li>
                <button onClick={() => handleSectionClick("config", configExpanded)} title="Configuración" className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-all ${isInSection("/configuracion") && !isInSection("/configuracion/usuarios") ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
                  <div className="flex items-center gap-3"><Settings className="w-5 h-5 shrink-0" /><span className="font-medium">Configuración</span></div>
                  {configExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                {configExpanded && (
                  <ul className="ml-8 mt-1 space-y-1">
                    {configItems.map(({ to, label }) => <li key={to}><Link to={to} className={`block px-4 py-2 rounded-lg text-sm transition-all ${isActive(to) ? "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-medium" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>{label}</Link></li>)}
                  </ul>
                )}
              </li>
            )}

            {/* Compras */}
            {showCompras && (
              <li>
                <button onClick={() => handleSectionClick("compras", comprasExpanded)} title="Compras" className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-all ${isInSection("/compras") ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
                  <div className="flex items-center gap-3"><ShoppingCart className="w-5 h-5 shrink-0" /><span className="font-medium">Compras</span></div>
                  {comprasExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                {comprasExpanded && (
                  <ul className="ml-8 mt-1 space-y-1">
                    {comprasItems.map(({ to, label }) => <li key={to}><Link to={to} className={`block px-4 py-2 rounded-lg text-sm transition-all ${isActive(to) ? "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-medium" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>{label}</Link></li>)}
                  </ul>
                )}
              </li>
            )}

            {/* Producción */}
            {showProduccion && (
              <li>
                <button onClick={() => handleSectionClick("produccion", produccionExpanded)} title="Producción" className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-all ${isInSection("/produccion") || produccionPaths.includes(location.pathname) ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
                  <div className="flex items-center gap-3"><ChefHat className="w-5 h-5 shrink-0" /><span className="font-medium">Producción</span></div>
                  {produccionExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                {produccionExpanded && (
                  <ul className="ml-8 mt-1 space-y-1">
                    {produccionItems.map(({ to, label }) => <li key={to}><Link to={to} className={`block px-4 py-2 rounded-lg text-sm transition-all ${isActive(to) ? "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-medium" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>{label}</Link></li>)}
                  </ul>
                )}
              </li>
            )}

            {/* Ventas */}
            {showVentas && (
              <li>
                <button onClick={() => handleSectionClick("ventas", ventasExpanded)} title="Ventas" className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-all ${ventasPaths.includes(location.pathname) ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
                  <div className="flex items-center gap-3"><TrendingUp className="w-5 h-5 shrink-0" /><span className="font-medium">Ventas</span></div>
                  {ventasExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                {ventasExpanded && (
                  <ul className="ml-8 mt-1 space-y-1">
                    {ventasItems.map(({ to, label }) => <li key={to}><Link to={to} className={`block px-4 py-2 rounded-lg text-sm transition-all ${isActive(to) ? "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-medium" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>{label}</Link></li>)}
                  </ul>
                )}
              </li>
            )}
          </ul>

          {/* CUENTA */}
          <div className="my-3 h-px bg-gray-100 dark:bg-gray-800" />
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-3 mb-1.5">Cuenta</p>
          <div className="space-y-1">
            <button
              onClick={() => { setPerfilOpen(true); }}
              className="flex items-center gap-3 w-full px-3 py-3 rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-[0.98] text-left cursor-pointer"
            >
              <UserCircle className="w-5 h-5 shrink-0 text-blue-500" />
              <span className="font-medium">Perfil</span>
            </button>
            <button
              onClick={() => toggleDarkMode()}
              className="flex items-center gap-3 w-full px-3 py-3 rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            >
              {darkMode ? <Sun className="w-5 h-5 shrink-0 text-yellow-400" /> : <Moon className="w-5 h-5 shrink-0 text-gray-500" />}
              <span className="font-medium flex-1 text-left">Modo Oscuro</span>
              <div className={`w-10 h-6 rounded-full relative transition-colors shrink-0 ${darkMode ? "bg-red-600" : "bg-gray-200 dark:bg-gray-700"}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${darkMode ? "translate-x-5" : "translate-x-1"}`} />
              </div>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-3 rounded-lg transition-colors text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* ═══════════════════════════════════════════════════════════
         MOBILE LEFT DRAWER  (< lg)  — slides in from left
         ═══════════════════════════════════════════════════════════ */}
      <aside
        className={`
          lg:hidden fixed inset-y-0 left-0 z-50 w-[75vw] max-w-[360px] min-w-[260px]
          bg-white dark:bg-gray-900
          shadow-2xl flex flex-col overflow-x-hidden
          transition-transform duration-300 ease-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="bg-gradient-to-br from-[#30475E] to-[#1e3347] px-5 pt-5 pb-4 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <Link to="/" onClick={handleNavClick} className="flex items-center gap-2.5 hover:opacity-90 transition-opacity" title="Ir al inicio">
              <div className="w-7 h-7 rounded-full overflow-hidden bg-white/20 shrink-0">
                <img src={logoImg} alt="Chazin Food" className="w-full h-full object-cover" style={{ objectPosition: "50% 56%" }} />
              </div>
              <span className="font-bold text-white text-sm">Chazin Food</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors active:scale-95">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0 ring-2 ring-white/30">
              {user?.nombre?.charAt(0).toUpperCase() ?? "A"}
            </div>
            <div>
              <p className="font-semibold text-white leading-tight">{user?.nombre ?? "Administrador"}</p>
              <p className="text-xs text-blue-200 capitalize mt-0.5">{user?.rol ?? "administrador"}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-3 overflow-y-auto overflow-x-hidden sidebar-scroll-container space-y-1" style={{ overflowX: "hidden" }}>
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-3 mb-1.5 mt-1">Administración</p>

          {hasPerm("Dashboard") && (
            <Link
              to="/"
              onClick={handleNavClick}
              className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl transition-colors active:scale-[0.98] ${isActive("/") ? "bg-red-600 text-white shadow-sm" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
            >
              <LayoutDashboard className="w-5 h-5 shrink-0" />
              <span className="font-medium">Dashboard</span>
            </Link>
          )}

          {showUsuarios && (
            <div className="w-full">
              <button
                onClick={() => handleMobileSectionClick("usuarios", usuariosExpanded)}
                className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-colors ${isInSection("/configuracion/usuarios") ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
              >
                <div className="flex items-center gap-3"><Users className="w-5 h-5 shrink-0" /><span className="font-medium">Usuarios</span></div>
                {usuariosExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              {usuariosExpanded && (
                <ul className="ml-8 mt-1 space-y-0.5">
                  {usuariosItems.map(({ to, label }) => (
                    <li key={to}>
                      <Link
                        to={to}
                        onClick={handleNavClick}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive(to) ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 font-medium" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                      >
                        <Users className="w-4 h-4 shrink-0" />
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {showConfig && (
            <div className="w-full">
              <button
                onClick={() => handleMobileSectionClick("config", configExpanded)}
                className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-colors ${isInSection("/configuracion") && !isInSection("/configuracion/usuarios") ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
              >
                <div className="flex items-center gap-3"><Settings className="w-5 h-5 shrink-0" /><span className="font-medium">Configuración</span></div>
                {configExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              {configExpanded && (
                <ul className="ml-8 mt-1 space-y-0.5">
                  {configItems.map(({ to, label }) => {
                    const Icon = Shield;
                    return (
                      <li key={to}>
                        <Link
                          to={to}
                          onClick={handleNavClick}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive(to) ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 font-medium" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          {label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

          {showCompras && (
            <div className="w-full">
              <button
                onClick={() => handleMobileSectionClick("compras", comprasExpanded)}
                className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-colors ${isInSection("/compras") ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
              >
                <div className="flex items-center gap-3"><ShoppingCart className="w-5 h-5 shrink-0" /><span className="font-medium">Compras</span></div>
                {comprasExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              {comprasExpanded && (
                <ul className="ml-8 mt-1 space-y-0.5">
                  {comprasItems.map(({ to, label }) => (
                    <li key={to}>
                      <Link
                        to={to}
                        onClick={handleNavClick}
                        className={`block px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive(to) ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 font-medium" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {showProduccion && (
            <div className="w-full">
              <button
                onClick={() => handleMobileSectionClick("produccion", produccionExpanded)}
                className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-colors ${isInSection("/produccion") || produccionPaths.some((p) => isActive(p)) ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
              >
                <div className="flex items-center gap-3"><ChefHat className="w-5 h-5 shrink-0" /><span className="font-medium">Producción</span></div>
                {produccionExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              {produccionExpanded && (
                <ul className="ml-8 mt-1 space-y-0.5">
                  {produccionItems.map(({ to, label }) => (
                    <li key={to}>
                      <Link
                        to={to}
                        onClick={handleNavClick}
                        className={`block px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive(to) ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 font-medium" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {showVentas && (
            <div className="w-full">
              <button
                onClick={() => handleMobileSectionClick("ventas", ventasExpanded)}
                className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-colors ${ventasPaths.includes(location.pathname) ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
              >
                <div className="flex items-center gap-3"><TrendingUp className="w-5 h-5 shrink-0" /><span className="font-medium">Ventas</span></div>
                {ventasExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              {ventasExpanded && (
                <ul className="ml-8 mt-1 space-y-0.5">
                  {ventasItems.map(({ to, label }) => (
                    <li key={to}>
                      <Link
                        to={to}
                        onClick={handleNavClick}
                        className={`block px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive(to) ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 font-medium" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="my-3 h-px bg-gray-100 dark:bg-gray-800" />
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-3 mb-1.5">Cuenta</p>

          <div className="space-y-1">
            <button
              onClick={() => { setSidebarOpen(false); setPerfilOpen(true); }}
              className="flex items-center gap-3 w-full px-3 py-3 rounded-xl transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-[0.98] text-left cursor-pointer"
            >
              <UserCircle className="w-5 h-5 shrink-0 text-blue-500" />
              <span className="font-medium">Perfil</span>
            </button>

            <button
              onClick={() => toggleDarkMode()}
              className="flex items-center gap-3 w-full px-3 py-3 rounded-xl transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            >
              {darkMode ? <Sun className="w-5 h-5 shrink-0 text-yellow-400" /> : <Moon className="w-5 h-5 shrink-0 text-gray-500" />}
              <span className="font-medium flex-1 text-left">Modo Oscuro</span>
              <div className={`w-10 h-6 rounded-full relative transition-colors shrink-0 ${darkMode ? "bg-red-600" : "bg-gray-200 dark:bg-gray-700"}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${darkMode ? "translate-x-5" : "translate-x-1"}`} />
              </div>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-3 rounded-xl transition-colors text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>

          <div className="h-4" />
        </nav>
      </aside>
        </>
      )}

      {/* Main column: Persistent Top Header + Scrollable Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Top Navigation Header (Persistent across all modules & pages) */}
        <header className="shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-30 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 sm:gap-4 shadow-xs select-none">
          {/* Left: Mobile menu toggle (< lg) + Logo + Dynamic Title */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {!isVendedor && (
              <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-700 dark:text-gray-300 active:scale-95 cursor-pointer"
              aria-label="Abrir menú lateral"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            )}

            <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity" title="Ir al inicio">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden shrink-0 border border-amber-300 bg-white">
                <img src={logoImg} alt="Chazin Food" className="w-full h-full object-contain" />
              </div>
              <div className="hidden sm:block">
                <span className="text-[10px] font-black tracking-widest text-[#A91B2E] uppercase block leading-tight">
                  Chazin Food
                </span>
                <h1 className="text-sm sm:text-base font-black text-gray-900 dark:text-gray-100 leading-tight">
                  {getPageTitle(location.pathname)}
                </h1>
              </div>
            </Link>
          </div>

          {/* Center: En vista de Admin solo botón de volver a Gestión de Ventas; en Vendedor barra de módulos */}
          {isAdmin ? (
            location.pathname === "/ventas/pos" ? (
              <Link
                to="/ventas/gestion-ventas"
                className="flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-black bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 text-[#A91B2E] dark:text-red-400 border border-red-200 dark:border-red-900/60 shadow-xs transition-all active:scale-95 cursor-pointer"
                title="Volver a Gestión de Ventas"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver a Gestión de Ventas</span>
              </Link>
            ) : null
          ) : (
            <nav aria-label="Módulos accesibles" className="flex items-center gap-1 sm:gap-1.5 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xs overflow-x-auto no-scrollbar max-w-[50vw] sm:max-w-none">
              {modulePills.map((item, idx) => {
                if (item.isDivider) {
                  return (
                    <div key={idx} className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-0.5 shrink-0" />
                  );
                }
                const Icon = item.icon;
                const active = item.isActive(location.pathname);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm transition-all shrink-0 cursor-pointer ${
                      active
                        ? "bg-[#A91B2E] text-white shadow-xs font-black"
                        : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-700 font-bold"
                    }`}
                    title={item.label}
                  >
                    <Icon className={`w-3.5 h-3.5 ${active ? "text-white" : item.iconColor || ""}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right: User Role Badge + Mi Perfil + Modo Oscuro + Cerrar Sesión */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* User role badge */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/80 text-xs font-bold text-gray-700 dark:text-gray-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="truncate max-w-[120px]">{user?.nombre || "Usuario"}</span>
              <span className="text-[10px] bg-red-100 dark:bg-red-950/60 text-[#A91B2E] dark:text-red-400 px-2 py-0.5 rounded-md font-black capitalize">
                {userRol || "Vendedor"}
              </span>
            </div>

            {/* Icono de Mi Perfil (modal en 3ra captura) */}
            <button
              type="button"
              onClick={() => setPerfilOpen(true)}
              title="Mi Perfil"
              aria-label="Abrir mi perfil"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center transition-all cursor-pointer active:scale-95 border border-gray-200 dark:border-gray-700"
            >
              <UserCircle className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-blue-500" />
            </button>

            {/* Icono de Sol / Luna para modo claro / oscuro */}
            <button
              type="button"
              onClick={() => toggleDarkMode()}
              title={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              aria-label={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center transition-all cursor-pointer active:scale-95 border border-gray-200 dark:border-gray-700"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-gray-600 dark:text-gray-300" />
              )}
            </button>

            {/* Icono de Salir hacia el login (Cerrar Sesión) */}
            <button
              type="button"
              onClick={handleLogout}
              title="Cerrar Sesión"
              aria-label="Cerrar Sesión"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center transition-all cursor-pointer active:scale-95 border border-red-200 dark:border-red-900/50"
            >
              <LogOut className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
            </button>
          </div>
        </header>

        {/* Main scrollable body */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950">
          <Outlet />
        </main>
      </div>

      {/* Modal de perfil staff */}
      <MiPerfilModal isOpen={perfilOpen} onClose={() => setPerfilOpen(false)} />
    </div>
  );
}
