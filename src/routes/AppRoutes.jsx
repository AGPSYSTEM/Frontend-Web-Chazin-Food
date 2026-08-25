import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "@/features/autenticacion/hooks/useAuth";
import { Layout } from "@/shared/components/layout/Layout";
import { Dashboard } from "@/features/panel-principal/paginas/Dashboard";
import { CategoriaInsumos } from "@/features/compras/paginas/CategoriaInsumos";
import { Insumos } from "@/features/compras/paginas/Insumos";
import { Proveedores } from "@/features/compras/paginas/Proveedores";
import { GestionCompras } from "@/features/compras/paginas/GestionCompras";
import { CategoriaProductos } from "@/features/ventas/paginas/CategoriaProductos";
import { Productos } from "@/features/ventas/paginas/Productos";
import { Clientes } from "@/features/ventas/paginas/Clientes";
import { GestionVentas } from "@/features/ventas/paginas/GestionVentas";
import { Roles } from "@/features/configuracion/paginas/Roles";
import { Usuarios } from "@/features/configuracion/paginas/Usuarios";
import { Login } from "@/features/autenticacion/paginas/Login";
import { ForgotPassword } from "@/features/autenticacion/paginas/ForgotPassword";
import { ResetPassword } from "@/features/autenticacion/paginas/ResetPassword";
import { ClienteLanding } from "@/features/cliente/paginas/ClienteLanding";
import { ClientePerfil } from "@/features/cliente/paginas/ClientePerfil";
import { CocineroDashboard } from "@/features/cocinero/paginas/CocineroDashboard";
import { FichasTecnicas } from "@/features/fichas-tecnicas/paginas/FichasTecnicas";
import { GestionProduccion } from "@/features/produccion/paginas/GestionProduccion";
import PosVendedor from "@/features/pos/paginas/PosVendedor";

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
        <Route path="/" element={<ClienteLanding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
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
        <Route path="/" element={<ClienteLanding />} />
        <Route path="/perfil" element={<ClientePerfil />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // ── Cocinero: limited view ──
  if (userRol === "cocinero") {
    return (
      <Routes>
        <Route path="/" element={<CocineroDashboard />} />
        <Route path="/fichas-tecnicas" element={<FichasTecnicas readOnly />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // ── Administrador / Admin: full access to everything ──
  if (userRol === "administrador" || userRol === "admin") {
    return (
      <Routes>
        <Route path="/login" element={<Navigate to="/" replace />} />
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
  );
}