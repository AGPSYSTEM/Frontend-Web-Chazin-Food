import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "@/features/autenticacion/hooks/useAuth";

// ── ClienteLanding: lazy-loaded para reducir el bundle inicial (≈177KB menos) ──
const ClienteLanding = lazy(() => import("@/features/cliente/paginas/ClienteLanding").then(m => ({ default: m.ClienteLanding })));

// ── Code Splitting con React.lazy para ChazinLoader y rutas secundarias ──
const ChazinLoader = lazy(() => import("@/shared/components/ui/ChazinLoader").then(m => ({ default: m.ChazinLoader })));
const Layout = lazy(() => import("@/shared/components/layout/Layout").then(m => ({ default: m.Layout })));
const Dashboard = lazy(() => import("@/features/panel-principal/paginas/Dashboard").then(m => ({ default: m.Dashboard })));
const CategoriaInsumos = lazy(() => import("@/features/compras/paginas/CategoriaInsumos").then(m => ({ default: m.CategoriaInsumos })));
const Insumos = lazy(() => import("@/features/compras/paginas/Insumos").then(m => ({ default: m.Insumos })));
const Proveedores = lazy(() => import("@/features/compras/paginas/Proveedores").then(m => ({ default: m.Proveedores })));
const GestionCompras = lazy(() => import("@/features/compras/paginas/GestionCompras").then(m => ({ default: m.GestionCompras })));
const CategoriaProductos = lazy(() => import("@/features/ventas/paginas/CategoriaProductos").then(m => ({ default: m.CategoriaProductos })));
const Productos = lazy(() => import("@/features/ventas/paginas/Productos").then(m => ({ default: m.Productos })));
const Clientes = lazy(() => import("@/features/ventas/paginas/Clientes").then(m => ({ default: m.Clientes })));
const GestionVentas = lazy(() => import("@/features/ventas/paginas/GestionVentas").then(m => ({ default: m.GestionVentas })));
const Roles = lazy(() => import("@/features/configuracion/paginas/Roles").then(m => ({ default: m.Roles })));
const Usuarios = lazy(() => import("@/features/configuracion/paginas/Usuarios").then(m => ({ default: m.Usuarios })));
const Login = lazy(() => import("@/features/autenticacion/paginas/Login").then(m => ({ default: m.Login })));
const ForgotPassword = lazy(() => import("@/features/autenticacion/paginas/ForgotPassword").then(m => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import("@/features/autenticacion/paginas/ResetPassword").then(m => ({ default: m.ResetPassword })));
const ClientePerfil = lazy(() => import("@/features/cliente/paginas/ClientePerfil").then(m => ({ default: m.ClientePerfil })));
const CocineroDashboard = lazy(() => import("@/features/cocinero/paginas/CocineroDashboard").then(m => ({ default: m.CocineroDashboard })));
const FichasTecnicas = lazy(() => import("@/features/fichas-tecnicas/paginas/FichasTecnicas").then(m => ({ default: m.FichasTecnicas })));
const GestionProduccion = lazy(() => import("@/features/produccion/paginas/GestionProduccion").then(m => ({ default: m.GestionProduccion })));
const PosVendedor = lazy(() => import("@/features/pos/paginas/PosVendedor"));

/**
 * Maps permission names (as stored in the DB) to route paths.
 * A user with a given permission will have access to the corresponding route(s).
 */
const PERMISSION_ROUTE_MAP = {
  "Dashboard":             { path: "",                          element: <Dashboard /> },
  "Categoría Insumos":     { path: "compras/categoria-insumos", element: <CategoriaInsumos /> },
  "Insumos":               { path: "compras/insumos",           element: <Insumos /> },
  "Proveedores":           { path: "compras/proveedores",       element: <Proveedores /> },
  "Gestión de Compras":    { path: "compras/gestion",           element: <GestionCompras /> },
  "Categoría Productos":   { path: "ventas/categoria-productos",element: <CategoriaProductos /> },
  "Productos":             { path: "ventas/productos",          element: <Productos /> },
  "Fichas Técnicas":       { path: "ventas/fichas-tecnicas",    element: <FichasTecnicas /> },
  "Gestión de Producción": { path: "produccion/gestion",        element: <GestionProduccion /> },
  "Clientes":              { path: "ventas/clientes",           element: <Clientes /> },
  "Gestión de Ventas":     { path: "ventas/gestion-ventas",     element: <GestionVentas /> },
  "Punto de Venta":        { path: "ventas/pos",                element: <PosVendedor /> },
  "Vendedor":              { path: "ventas/pos",                element: <PosVendedor /> },
  "Roles":                 { path: "configuracion/roles",       element: <Roles /> },
  "Usuarios":              { path: "configuracion/usuarios",    element: <Usuarios /> },
};

export function AppRoutes() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<Suspense fallback={null}><ClienteLanding /></Suspense>} />
        <Route
          path="/login"
          element={
            <Suspense fallback={<ChazinLoader fullScreen size="lg" text="CARGANDO..." />}>
              <Login />
            </Suspense>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <Suspense fallback={<ChazinLoader fullScreen size="lg" text="CARGANDO..." />}>
              <ForgotPassword />
            </Suspense>
          }
        />
        <Route
          path="/reset-password"
          element={
            <Suspense fallback={<ChazinLoader fullScreen size="lg" text="CARGANDO..." />}>
              <ResetPassword />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const rawRol = typeof user?.rol === 'object' ? user?.rol?.nombre : user?.rol;
  const userRol = String(rawRol || "").toLowerCase().trim();
  const isCliente = userRol === "cliente" || user?.idRol === 4;

  // ── Cliente: landing page & perfil ──
  if (isCliente) {
    return (
      <Routes>
        <Route path="/" element={<Suspense fallback={null}><ClienteLanding /></Suspense>} />
        <Route
          path="/perfil"
          element={
            <Suspense fallback={<ChazinLoader fullScreen size="lg" text="CARGANDO..." />}>
              <ClientePerfil />
            </Suspense>
          }
        />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // ── Cocinero: limited view ──
  if (userRol === "cocinero") {
    return (
      <Suspense fallback={<ChazinLoader fullScreen size="lg" text="CARGANDO..." />}>
        <Routes>
          <Route path="/" element={<CocineroDashboard />} />
          <Route path="/fichas-tecnicas" element={<FichasTecnicas readOnly />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    );
  }

  // ── Administrador / Admin: full access to everything ──
  if (userRol === "administrador" || userRol === "admin") {
    return (
      <Suspense fallback={<ChazinLoader fullScreen size="lg" text="CARGANDO..." />}>
        <Routes>
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/tienda" element={<Suspense fallback={null}><ClienteLanding /></Suspense>} />
          <Route path="/cliente" element={<Suspense fallback={null}><ClienteLanding /></Suspense>} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="compras/categoria-insumos" element={<CategoriaInsumos />} />
            <Route path="compras/insumos" element={<Insumos />} />
            <Route path="compras/proveedores" element={<Proveedores />} />
            <Route path="compras/gestion" element={<GestionCompras />} />
            <Route path="produccion/gestion" element={<GestionProduccion />} />
            <Route path="ventas/categoria-productos" element={<CategoriaProductos />} />
            <Route path="ventas/productos" element={<Productos />} />
            <Route path="ventas/clientes" element={<Clientes />} />
            <Route path="ventas/gestion-ventas" element={<GestionVentas />} />
            <Route path="ventas/pos" element={<PosVendedor />} />
            <Route path="ventas/fichas-tecnicas" element={<FichasTecnicas />} />
            <Route path="configuracion/roles" element={<Roles />} />
            <Route path="configuracion/usuarios" element={<Usuarios />} />
          </Route>
        </Routes>
      </Suspense>
    );
  }

  // ── Any other role (e.g. Vendedor): permission-based access ──
  const userPermisos = user?.permisos || [];
  const allowedRoutesMap = new Map();
  for (const perm of userPermisos) {
    const routeConfig = PERMISSION_ROUTE_MAP[perm];
    if (routeConfig && !allowedRoutesMap.has(routeConfig.path)) {
      allowedRoutesMap.set(routeConfig.path, routeConfig);
    }
  }
  const allowedRoutes = Array.from(allowedRoutesMap.values());

  const hasDashboard = userPermisos.includes("Dashboard");
  const defaultPath = (userPermisos.includes("Punto de Venta") || userPermisos.includes("Vendedor"))
    ? "ventas/pos"
    : (allowedRoutes.length > 0 ? allowedRoutes[0].path : "");

  return (
    <Suspense fallback={<ChazinLoader fullScreen size="lg" text="CARGANDO..." />}>
      <Routes>
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/" element={<Layout />}>
          {hasDashboard ? (
            <Route index element={<Dashboard />} />
          ) : defaultPath ? (
            <Route index element={<Navigate to={`/${defaultPath}`} replace />} />
          ) : (
            <Route index element={<Dashboard />} />
          )}
          {allowedRoutes.map(
            (route) =>
              route.path !== "" && <Route key={route.path} path={route.path} element={route.element} />
          )}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}