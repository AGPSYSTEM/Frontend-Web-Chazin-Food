import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "@/shared/context/AuthContext";
import { Layout } from "@/shared/components/layout/Layout";
import { Dashboard } from "@/features/dashboard/pages/Dashboard";
import { CategoriaInsumos } from "@/features/compras/pages/CategoriaInsumos";
import { Insumos } from "@/features/compras/pages/Insumos";
import { Proveedores } from "@/features/compras/pages/Proveedores";
import { GestionCompras } from "@/features/compras/pages/GestionCompras";
import { CategoriaProductos } from "@/features/ventas/pages/CategoriaProductos";
import { Productos } from "@/features/ventas/pages/Productos";
import { Clientes } from "@/features/ventas/pages/Clientes";
import { GestionVentas } from "@/features/ventas/pages/GestionVentas";
import { Roles } from "@/features/configuracion/pages/Roles";
import { Usuarios } from "@/features/configuracion/pages/Usuarios";
import { Login } from "@/features/auth/pages/Login";
import { ForgotPassword } from "@/features/auth/pages/ForgotPassword";
import { ResetPassword } from "@/features/auth/pages/ResetPassword";
import { ClienteLanding } from "@/features/cliente/pages/ClienteLanding";
import { CocineroDashboard } from "@/features/cocinero/pages/CocineroDashboard";
import { FichasTecnicas } from "@/features/fichas-tecnicas/pages/FichasTecnicas";
import { GestionProduccion } from "@/features/produccion/pages/GestionProduccion";

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

  const userRol = user?.rol?.toLowerCase();

  // ── Cliente: landing page ──
  if (userRol === "cliente") {
    return (
      <Routes>
        <Route path="/" element={<ClienteLanding />} />
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

  // ── Administrador: full access to everything ──
  if (userRol === "administrador") {
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
          <Route path="ventas/fichas-tecnicas" element={<FichasTecnicas />} />
          <Route path="configuracion/roles" element={<Roles />} />
          <Route path="configuracion/usuarios" element={<Usuarios />} />
        </Route>
      </Routes>
    );
  }

  // ── Any other role (e.g. Vendedor): permission-based access ──
  const userPermisos = user?.permisos || [];
  const allowedRoutes = [];
  for (const perm of userPermisos) {
    const routeConfig = PERMISSION_ROUTE_MAP[perm];
    if (routeConfig) {
      allowedRoutes.push(routeConfig);
    }
  }

  const hasDashboard = userPermisos.includes("Dashboard");

  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/" element={<Layout />}>
        {hasDashboard && <Route index element={<Dashboard />} />}
        {!hasDashboard && allowedRoutes.length > 0 && (
          <Route index element={<Navigate to={`/${allowedRoutes[0].path}`} replace />} />
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
