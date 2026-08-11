import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/features/autenticacion/hooks/useAuth";
import { useDarkMode } from "@/shared/hooks/useDarkMode";
import { useNotifications } from "@/shared/hooks/useNotifications";
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
  ChefHat
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
  const [darkMode, toggleDarkMode] = useDarkMode();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { confirmLogout, success } = useNotifications();

  const isActive = (path) => location.pathname === path;
  const isInSection = (prefix) => location.pathname.startsWith(prefix);

  const handleNavClick = () => {
    setSidebarOpen(false);
  };

  // ── Permission helper ──
  // Administrador always has all permissions; for other roles, check the permisos array
  const isAdmin = user?.rol?.toLowerCase() === "administrador";
  const userPermisos = user?.permisos || [];
  const hasPerm = (permName) => isAdmin || userPermisos.includes(permName);

  const handleLogout = async () => {
    setSidebarOpen(false);
    const confirmed = await confirmLogout();
    if (confirmed) {
      logout();
      success("Sesión cerrada", "Has salido del sistema correctamente");
    }
  };

  const closeAllSections = () => {
    setComprasExpanded(false);
    setProduccionExpanded(false);
    setVentasExpanded(false);
    setConfigExpanded(false);
  };

  const openSection = (section) => {
    setComprasExpanded(section === "compras");
    setProduccionExpanded(section === "produccion");
    setVentasExpanded(section === "ventas");
    setConfigExpanded(section === "config");
  };

  const handleSectionClick = (section, cur) => {
    if (!sidebarOpen) {
      setSidebarOpen(true);
      openSection(section);
    } else {
      if (cur) {
        closeAllSections();
      } else {
        openSection(section);
      }
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
    { to: "/ventas/fichas-tecnicas", label: "Fichas Técnicas", perm: "Fichas Técnicas" },
    { to: "/produccion/gestion", label: "Gestión de Producción", perm: "Gestión de Producción" }
  ];
  const produccionItems = allProduccionItems.filter(i => hasPerm(i.perm));
  const showProduccion = hasPerm("Producción") || produccionItems.length > 0;
  const produccionPaths = produccionItems.map((i) => i.to);

  const allVentasItems = [
    { to: "/ventas/clientes", label: "Clientes", perm: "Clientes" },
    { to: "/ventas/gestion-ventas", label: "Gestión de Ventas", perm: "Gestión de Ventas" }
  ];
  const ventasItems = allVentasItems.filter(i => hasPerm(i.perm));
  const showVentas = hasPerm("Ventas") || ventasItems.length > 0;
  const ventasPaths = ventasItems.map((i) => i.to);

  const allConfigItems = [
    { to: "/configuracion/roles", label: "Roles", perm: "Roles" },
    { to: "/configuracion/usuarios", label: "Usuarios", perm: "Usuarios" }
  ];
  const configItems = allConfigItems.filter(i => hasPerm(i.perm));
  const showConfig = hasPerm("Configuración") || configItems.length > 0;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* ── Overlay backdrop (both mobile drawer & desktop collapsed) ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/45 backdrop-blur-md transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ═══════════════════════════════════════════════════════════
         DESKTOP SIDEBAR  (lg+) — only visible when `sidebarOpen` is true
         ═══════════════════════════════════════════════════════════ */}
      {sidebarOpen && (
        <aside className="hidden flex-col w-64 bg-white dark:bg-gray-900 shadow-lg border-r border-gray-200 dark:border-gray-800 transition-all duration-300">
          {/* Brand */}
          <div className="bg-gradient-to-br from-[#30475E] to-[#1e3347] px-5 pt-5 pb-4 shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full overflow-hidden bg-white/20 shrink-0">
                  <img src={logoImg} alt="Chazin Food" className="w-full h-full object-cover" style={{ objectPosition: "50% 56%" }} />
                </div>
                <span className="font-bold text-white text-sm">Chazin Food</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors active:scale-95">
                <X className="w-5 h-5 text-white" />
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

          {/* Nav */}
          <nav className="flex-1 p-3 overflow-y-auto">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-5 mb-1.5 mt-1">Administración</p>
            <ul className="space-y-1">
              {/* Dashboard */}
              {hasPerm("Dashboard") && (
                <li>
                  <Link to="/" title="Dashboard" className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${isActive("/") ? "bg-red-600 text-white shadow-md" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
                    <Home className="w-5 h-5 shrink-0" />
                    {sidebarOpen && <span className="font-medium">Dashboard</span>}
                  </Link>
                </li>
              )}

              {/* Configuración */}
              {showConfig && (
                <li>
                  <button onClick={() => handleSectionClick("config", configExpanded)} title="Configuración" className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-all ${isInSection("/configuracion") ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
                    <div className="flex items-center gap-3"><Settings className="w-5 h-5 shrink-0" />{sidebarOpen && <span className="font-medium">Configuración</span>}</div>
                    {sidebarOpen && (configExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)}
                  </button>
                  {sidebarOpen && configExpanded && (
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
                    <div className="flex items-center gap-3"><ShoppingCart className="w-5 h-5 shrink-0" />{sidebarOpen && <span className="font-medium">Compras</span>}</div>
                    {sidebarOpen && (comprasExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)}
                  </button>
                  {sidebarOpen && comprasExpanded && (
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
                    <div className="flex items-center gap-3"><ChefHat className="w-5 h-5 shrink-0" />{sidebarOpen && <span className="font-medium">Producción</span>}</div>
                    {sidebarOpen && (produccionExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)}
                  </button>
                  {sidebarOpen && produccionExpanded && (
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
                    <div className="flex items-center gap-3"><TrendingUp className="w-5 h-5 shrink-0" />{sidebarOpen && <span className="font-medium">Ventas</span>}</div>
                    {sidebarOpen && (ventasExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)}
                  </button>
                  {sidebarOpen && ventasExpanded && (
                    <ul className="ml-8 mt-1 space-y-1">
                      {ventasItems.map(({ to, label }) => <li key={to}><Link to={to} className={`block px-4 py-2 rounded-lg text-sm transition-all ${isActive(to) ? "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-medium" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>{label}</Link></li>)}
                    </ul>
                  )}
                </li>
              )}
            </ul>

            {/* CUENTA */}
            <div className="mx-2 my-3 h-px bg-gray-100 dark:bg-gray-800" />
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-5 mb-1.5">Cuenta</p>
            <Link
              to="/configuracion/usuarios"
              onClick={handleNavClick}
              className="flex items-center gap-3 mx-2 px-5 py-3 rounded-xl transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-[0.98]"
            >
              <UserCircle className="w-5 h-5 shrink-0 text-blue-500" />
              <span className="font-medium">Perfil</span>
            </Link>
            <button
              onClick={() => toggleDarkMode()}
              className="flex items-center gap-3 mx-2 px-5 py-3 rounded-xl transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {darkMode ? <Sun className="w-5 h-5 shrink-0 text-yellow-400" /> : <Moon className="w-5 h-5 shrink-0 text-gray-500" />}
              <span className="font-medium flex-1 text-left">Modo Oscuro</span>
              <div className={`w-10 h-6 rounded-full relative transition-colors shrink-0 ${darkMode ? "bg-red-600" : "bg-gray-200 dark:bg-gray-700"}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${darkMode ? "translate-x-5" : "translate-x-1"}`} />
              </div>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 mx-2 px-5 py-3 rounded-xl transition-colors text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </nav>
        </aside>
      )}

      {/* ═══════════════════════════════════════════════════════════
         MOBILE LEFT DRAWER  (< lg)  — slides in from left
         ═══════════════════════════════════════════════════════════ */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-[75vw] max-w-[360px] min-w-[260px]
          bg-white dark:bg-gray-900
          shadow-2xl flex flex-col
          transition-transform duration-300 ease-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="bg-gradient-to-br from-[#30475E] to-[#1e3347] px-5 pt-5 pb-4 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full overflow-hidden bg-white/20 shrink-0">
                <img src={logoImg} alt="Chazin Food" className="w-full h-full object-cover" style={{ objectPosition: "50% 56%" }} />
              </div>
              <span className="font-bold text-white text-sm">Chazin Food</span>
            </div>
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

        <nav className="flex-1 overflow-y-auto py-3">
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-5 mb-1.5 mt-1">Administración</p>

          {hasPerm("Dashboard") && (
            <Link
              to="/"
              onClick={handleNavClick}
              className={`flex items-center gap-3 mx-2 px-3 py-3 rounded-xl transition-colors active:scale-[0.98] ${isActive("/") ? "bg-red-600 text-white shadow-sm" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
            >
              <LayoutDashboard className="w-5 h-5 shrink-0" />
              <span className="font-medium">Dashboard</span>
            </Link>
          )}

          {showConfig && (
            <div className="mx-2">
              <button
                onClick={() => handleMobileSectionClick("config", configExpanded)}
                className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-colors ${isInSection("/configuracion") ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
              >
                <div className="flex items-center gap-3"><Settings className="w-5 h-5 shrink-0" /><span className="font-medium">Configuración</span></div>
                {configExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              {configExpanded && (
                <ul className="ml-9 mb-1 space-y-0.5">
                  {configItems.map(({ to, label }) => {
                    const Icon = label === "Roles" ? Shield : Users;
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
            <div className="mx-2">
              <button
                onClick={() => handleMobileSectionClick("compras", comprasExpanded)}
                className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-colors ${isInSection("/compras") ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
              >
                <div className="flex items-center gap-3"><ShoppingCart className="w-5 h-5 shrink-0" /><span className="font-medium">Compras</span></div>
                {comprasExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              {comprasExpanded && (
                <ul className="ml-9 mb-1 space-y-0.5">
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
            <div className="mx-2">
              <button
                onClick={() => handleMobileSectionClick("produccion", produccionExpanded)}
                className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-colors ${isInSection("/produccion") || produccionPaths.some((p) => isActive(p)) ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
              >
                <div className="flex items-center gap-3"><ChefHat className="w-5 h-5 shrink-0" /><span className="font-medium">Producción</span></div>
                {produccionExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              {produccionExpanded && (
                <ul className="ml-9 mb-1 space-y-0.5">
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
            <div className="mx-2">
              <button
                onClick={() => handleMobileSectionClick("ventas", ventasExpanded)}
                className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-colors ${ventasPaths.includes(location.pathname) ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
              >
                <div className="flex items-center gap-3"><TrendingUp className="w-5 h-5 shrink-0" /><span className="font-medium">Ventas</span></div>
                {ventasExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              {ventasExpanded && (
                <ul className="ml-9 mb-1 space-y-0.5">
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

          <div className="mx-2 my-3 h-px bg-gray-100 dark:bg-gray-800" />
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-5 mb-1.5">Cuenta</p>

          <Link
            to="/configuracion/usuarios"
            onClick={handleNavClick}
            className="flex items-center gap-3 mx-2 px-5 py-3 rounded-xl transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-[0.98]"
          >
            <UserCircle className="w-5 h-5 shrink-0 text-blue-500" />
            <span className="font-medium">Perfil</span>
          </Link>

          <button
            onClick={() => toggleDarkMode()}
            className="flex items-center gap-3 mx-2 px-5 py-3 rounded-xl transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {darkMode ? <Sun className="w-5 h-5 shrink-0 text-yellow-400" /> : <Moon className="w-5 h-5 shrink-0 text-gray-500" />}
            <span className="font-medium flex-1 text-left">Modo Oscuro</span>
            <div className={`w-10 h-6 rounded-full relative transition-colors shrink-0 ${darkMode ? "bg-red-600" : "bg-gray-200 dark:bg-gray-700"}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${darkMode ? "translate-x-5" : "translate-x-1"}`} />
            </div>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 mx-2 px-5 py-3 rounded-xl transition-colors text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="font-medium">Cerrar Sesión</span>
          </button>

          <div className="h-4" />
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 pb-4">
        {/* Mobile top header */}
        <div className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 h-14 flex items-center justify-between shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-700 dark:text-gray-300 active:scale-95"
            aria-label="Abrir menú"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 bg-white ring-2 ring-gray-100 dark:ring-gray-700">
              <img src={logoImg} alt="Chazin Food" className="w-full h-full object-cover" style={{ objectPosition: "50% 56%" }} />
            </div>
            <span className="font-bold text-gray-800 dark:text-gray-100 tracking-tight">Chazin Food</span>
          </div>

          <button
            onClick={() => toggleDarkMode()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-600 dark:text-gray-400 active:scale-95"
            aria-label={darkMode ? "Activar modo claro" : "Activar modo oscuro"}
          >
            {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        <Outlet />
      </main>
    </div>
  );
}
