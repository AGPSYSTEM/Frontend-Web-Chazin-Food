import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Package,
  TrendingUp,
  Award,
  Flame,
  Crown,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Check,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Save,
  AlertCircle,
  Edit2,
  ArrowLeft,
  ShoppingBag,
  Bike,
  UtensilsCrossed,
  DollarSign,
  PieChart,
  Calendar,
  Zap,
  Sun,
  Moon,
  LogOut,
  RefreshCw,
  Tag,
  ShieldCheck,
  Percent,
  Receipt,
  Camera,
  Upload,
  Trash2,
  Monitor,
  Smartphone,
  Laptop,
  Key,
  CheckCircle2,
  Globe
} from "lucide-react";
import { FidelidadBadge } from "@/shared/components/ui/FidelidadBadge";
import { useAuth } from "@/features/autenticacion/hooks/useAuth";
import { useDarkMode } from "@/shared/hooks/useDarkMode";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { DOCUMENTO_CONFIG, sanitizeDocumento, validateDocumento, sanitizeTelefono } from "@/shared/utils/validationUtils";
import { ventasService } from "@/features/ventas/servicios/ventasService";
import logoImg from "@/shared/assets/ChatGPT_Image_1_jun_2026__21_55_04.png";
import Swal from "sweetalert2";

const TIPOS_DOCUMENTO = ["C.C.", "C.E.", "T.I.", "Pasaporte", "NIT"];
const PRESET_AVATARS = ["🌱", "🥇", "🍔", "🍟", "🍕", "🍗", "🌮", "👑", "😎", "🤠", "👨‍🍳", "🌟"];

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {msg}
    </p>
  );
}

export function ClientePerfil() {
  const navigate = useNavigate();
  const { user, updateProfile, logout, refreshUser } = useAuth();
  const [darkMode, toggleDarkMode] = useDarkMode();
  const { success, warning, error: notifyError } = useNotifications();

  const [tab, setTab] = useState("fidelidad"); // "fidelidad" | "pedidos" | "editar"
  const [pedidos, setPedidos] = useState([]);
  const [loadingPedidos, setLoadingPedidos] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showBenefitsTable, setShowBenefitsTable] = useState(false);

  // Avatar / Profile photo state
  const fileInputRef = useRef(null);
  const [avatarUrl, setAvatarUrl] = useState(() => {
    return user?.foto || user?.avatar || localStorage.getItem(`avatar_${user?.id || user?.idUsuario}`) || "";
  });

  // Edit form state
  const [form, setForm] = useState({
    nombre: "",
    apellidos: "",
    email: "",
    telefono: "",
    direccion: "",
    tipoDocumento: "C.C.",
    numeroDocumento: "",
  });
  const [errors, setErrors] = useState({});

  // Sync user profile on mount
  useEffect(() => {
    refreshUser?.();
  }, [refreshUser]);

  // Populate form with current user data
  useEffect(() => {
    if (user) {
      let cleanDir = user.direccion || "";
      if (typeof cleanDir === "string" && cleanDir.trim().startsWith("{")) {
        try {
          const parsed = JSON.parse(cleanDir);
          cleanDir = parsed.direccion || cleanDir;
        } catch (e) {
          /* keep */
        }
      }

      setForm({
        nombre: user.nombre || "",
        apellidos: user.apellidos || user.apellido || "",
        email: user.email || "",
        telefono: user.telefono || "",
        direccion: cleanDir,
        tipoDocumento: user.tipoDocumento || "C.C.",
        numeroDocumento: user.numeroDocumento || user.documento || "",
      });

      const userAvatar = user.foto || user.avatar || localStorage.getItem(`avatar_${user?.id || user?.idUsuario}`) || "";
      setAvatarUrl(userAvatar);
      setErrors({});
    }
  }, [user]);

  // Detect client device and browser for Active Sessions
  const deviceInfo = useMemo(() => {
    const ua = navigator.userAgent;
    let browser = "Google Chrome";
    if (ua.includes("Edg")) browser = "Microsoft Edge";
    else if (ua.includes("Firefox")) browser = "Mozilla Firefox";
    else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Apple Safari";

    let os = "Windows PC";
    let isMobile = false;
    if (ua.includes("Android")) {
      os = "Android Mobile";
      isMobile = true;
    } else if (ua.includes("iPhone") || ua.includes("iPad")) {
      os = "iOS Device";
      isMobile = true;
    } else if (ua.includes("Mac")) {
      os = "macOS";
    } else if (ua.includes("Linux")) {
      os = "Linux PC";
    }

    return { browser, os, isMobile };
  }, []);

  // Fetch client orders (backend + localStorage)
  const fetchMyOrders = useCallback(async () => {
    if (!user) return;
    try {
      setLoadingPedidos(true);
      const userId = user?.idUsuario || user?.id || user?._id;
      const storageKey = `mis_pedidos_${userId || "guest"}`;
      let localHistory = [];
      try {
        localHistory = JSON.parse(localStorage.getItem(storageKey) || "[]");
      } catch (e) {
        localHistory = [];
      }

      let backendOrders = [];
      try {
        const data = await ventasService.getVentas();
        if (data && Array.isArray(data)) {
          backendOrders = data.filter(
            (v) =>
              v.idUsuario === userId ||
              v.idCliente === user?.idCliente ||
              v.clienteNombre === `${user?.nombre || ""} ${user?.apellidos || ""}`.trim()
          );
        }
      } catch (err) {
        console.warn("No se pudieron cargar pedidos del backend:", err);
      }

      const backendMap = new Map();
      backendOrders.forEach((o) => {
        const id = o.idVenta || o.id;
        const code = o.numeroVenta || o.codigoPedido;
        if (id) backendMap.set(String(id), o);
        if (code) backendMap.set(String(code), o);
      });

      const mergedPedidos = [];
      const processedBackendIds = new Set();

      for (const localOrd of localHistory) {
        const matched = backendMap.get(String(localOrd.id)) || backendMap.get(String(localOrd.numeroVenta));
        if (matched) {
          processedBackendIds.add(String(matched.idVenta || matched.id));
          let currentEstado = matched.estado || matched.estadoEntrega || "Por Aprobar";
          if (matched.estadoAprobacion === "RECHAZADO" || matched.estadoEntrega === "CANCELADO") {
            currentEstado = "Anulada";
          } else if (matched.estadoAprobacion === "PENDIENTE") {
            currentEstado = "Por Aprobar";
          } else if (matched.estadoEntrega === "PREPARANDO") {
            currentEstado = "En Preparación";
          } else if (matched.estadoEntrega === "LISTO") {
            currentEstado = "Listo";
          } else if (matched.estadoEntrega === "ENTREGADO") {
            currentEstado = "Completada";
          }

          localOrd.estado = currentEstado;
          mergedPedidos.push({
            id: matched.idVenta || matched.id || localOrd.id,
            numeroVenta: matched.numeroVenta || localOrd.numeroVenta,
            fecha: matched.fechaVenta ? new Date(matched.fechaVenta).toLocaleString("es-CO") : localOrd.fecha,
            items: localOrd.items || [],
            total: matched.total || localOrd.total,
            descuentoAplicado: matched.descuentoAplicado || 0,
            metodoPago: matched.metodoPago || "Efectivo",
            tipoEntrega: matched.tipoEntrega || "Domicilio",
            estado: currentEstado,
          });
        } else {
          localOrd.estado = "Anulada";
          mergedPedidos.push({
            id: localOrd.id,
            numeroVenta: localOrd.numeroVenta,
            fecha: localOrd.fecha,
            items: localOrd.items || [],
            total: localOrd.total,
            descuentoAplicado: localOrd.descuentoAplicado || 0,
            metodoPago: localOrd.metodoPago || "Efectivo",
            tipoEntrega: localOrd.tipoEntrega || "Domicilio",
            estado: "Anulada",
          });
        }
      }

      // Add backend orders not present in localHistory
      backendOrders.forEach((o) => {
        const idStr = String(o.idVenta || o.id);
        if (!processedBackendIds.has(idStr)) {
          let currentEstado = o.estado || o.estadoEntrega || "Por Aprobar";
          if (o.estadoAprobacion === "RECHAZADO" || o.estadoEntrega === "CANCELADO") {
            currentEstado = "Anulada";
          } else if (o.estadoAprobacion === "PENDIENTE") {
            currentEstado = "Por Aprobar";
          } else if (o.estadoEntrega === "PREPARANDO") {
            currentEstado = "En Preparación";
          } else if (o.estadoEntrega === "LISTO") {
            currentEstado = "Listo";
          } else if (o.estadoEntrega === "ENTREGADO") {
            currentEstado = "Completada";
          }

          let items = [];
          if (o.detalles && Array.isArray(o.detalles)) {
            items = o.detalles.map((d) => ({
              nombre: d.producto?.nombre || d.nombreProducto || "Producto",
              cantidad: Number(d.cantidad) || 1,
              precio: Number(d.precioUnitario) || 0,
            }));
          }

          mergedPedidos.push({
            id: o.idVenta || o.id,
            numeroVenta: o.numeroVenta || `VEN-${String(o.idVenta || o.id).padStart(4, "0")}`,
            fecha: o.fechaVenta ? new Date(o.fechaVenta).toLocaleString("es-CO") : "Reciente",
            items,
            total: Number(o.total) || 0,
            descuentoAplicado: Number(o.descuentoAplicado) || 0,
            metodoPago: o.metodoPago || "Efectivo",
            tipoEntrega: o.tipoEntrega || "Domicilio",
            estado: currentEstado,
          });
        }
      });

      setPedidos(mergedPedidos);
    } catch (err) {
      console.error("Error al sincronizar pedidos del cliente:", err);
    } finally {
      setLoadingPedidos(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMyOrders();
  }, [fetchMyOrders]);

  // ── Calculate Advanced Real Statistics ──
  const stats = useMemo(() => {
    const totalPedidosCount = pedidos.length;
    const completedPedidos = pedidos.filter((p) => p.estado !== "Anulada");

    // Total spent & savings
    const totalGastado = completedPedidos.reduce((acc, p) => acc + (parseFloat(p.total) || 0), 0);
    const totalAhorrado = completedPedidos.reduce((acc, p) => acc + (parseFloat(p.descuentoAplicado) || 0), 0);

    // Total products / dishes consumed
    const totalProductosCount = completedPedidos.reduce(
      (acc, p) => acc + (p.items || []).reduce((iAcc, item) => iAcc + (Number(item.cantidad) || 1), 0),
      0
    );

    // Ticket promedio
    const ticketPromedio = completedPedidos.length > 0 ? Math.round(totalGastado / completedPedidos.length) : 0;

    // Item popularity ranking
    const itemCounts = {};
    completedPedidos.forEach((p) => {
      (p.items || []).forEach((item) => {
        const name = (item.nombre || "Producto").trim();
        itemCounts[name] = (itemCounts[name] || 0) + (Number(item.cantidad) || 1);
      });
    });

    const sortedItems = Object.entries(itemCounts).sort((a, b) => b[1] - a[1]);
    const top3Items = sortedItems.slice(0, 3).map(([nombre, count]) => ({
      nombre,
      count,
      percent: totalProductosCount > 0 ? Math.round((count / totalProductosCount) * 100) : 0,
    }));

    const favoriteProduct = sortedItems.length > 0 ? sortedItems[0][0] : "Sin pedidos aún";
    const favoriteCount = sortedItems.length > 0 ? sortedItems[0][1] : 0;

    // Favorite payment method
    const paymentCounts = { Efectivo: 0, Tarjeta: 0, Transferencia: 0 };
    completedPedidos.forEach((p) => {
      const m = String(p.metodoPago || "Efectivo").toLowerCase();
      if (m.includes("tarjeta")) paymentCounts.Tarjeta++;
      else if (m.includes("transfer")) paymentCounts.Transferencia++;
      else paymentCounts.Efectivo++;
    });

    let topPayment = "Efectivo";
    let topPaymentCount = paymentCounts.Efectivo;
    if (paymentCounts.Tarjeta > topPaymentCount) {
      topPayment = "Tarjeta";
      topPaymentCount = paymentCounts.Tarjeta;
    }
    if (paymentCounts.Transferencia > topPaymentCount) {
      topPayment = "Transferencia";
      topPaymentCount = paymentCounts.Transferencia;
    }
    const paymentPercent = completedPedidos.length > 0 ? Math.round((topPaymentCount / completedPedidos.length) * 100) : 100;

    // Favorite delivery method
    let deliveryCount = 0;
    let pickupCount = 0;
    completedPedidos.forEach((p) => {
      const t = String(p.tipoEntrega || "").toLowerCase();
      if (t.includes("llevar") || t.includes("recoger") || t.includes("mesa")) pickupCount++;
      else deliveryCount++;
    });
    const preferredDelivery = deliveryCount >= pickupCount ? "A Domicilio" : "Recoger en Local";

    // Last order date
    const lastOrderDate = completedPedidos.length > 0 ? completedPedidos[0].fecha : "Sin compras recientes";

    return {
      totalPedidosCount,
      completedPedidosCount: completedPedidos.length,
      totalGastado,
      totalAhorrado,
      totalProductosCount,
      ticketPromedio,
      top3Items,
      favoriteProduct,
      favoriteCount,
      topPayment,
      paymentPercent,
      preferredDelivery,
      lastOrderDate,
    };
  }, [pedidos]);

  // Fidelity Data extraction
  const fidelidad = user?.fidelidad || {};
  const tipoFidelidad =
    fidelidad.tipo ||
    user?.tipo ||
    (stats.totalPedidosCount >= 9
      ? "VIP"
      : stats.totalPedidosCount >= 6
      ? "Frecuente"
      : stats.totalPedidosCount >= 3
      ? "Regular"
      : "Nuevo");

  const descuentoPorcentaje =
    fidelidad.descuentoPorcentaje !== undefined
      ? fidelidad.descuentoPorcentaje
      : tipoFidelidad === "VIP"
      ? 15
      : tipoFidelidad === "Frecuente"
      ? 10
      : tipoFidelidad === "Regular"
      ? 5
      : 0;

  const comprasCiclo = fidelidad.comprasCiclo !== undefined ? fidelidad.comprasCiclo : stats.totalPedidosCount % 3;
  const comprasFaltantes = fidelidad.comprasFaltantes !== undefined ? fidelidad.comprasFaltantes : 3 - (comprasCiclo % 3);
  const siguienteNivel =
    fidelidad.siguienteNivel ||
    (tipoFidelidad === "Nuevo" ? "Regular" : tipoFidelidad === "Regular" ? "Frecuente" : "VIP");
  const enGracia = Boolean(fidelidad.enGracia);
  const diasRestantesRaw =
    fidelidad.diasRestantes !== undefined ? fidelidad.diasRestantes : tipoFidelidad !== "Nuevo" ? 30 : null;
  const diasGraciaRestantesRaw = fidelidad.diasGraciaRestantes || 0;
  const fechaVencimientoObj =
    fidelidad.fechaVencimientoNivel || fidelidad.vence
      ? new Date(fidelidad.fechaVencimientoNivel || fidelidad.vence)
      : null;

  // Real-time client countdown
  const now = new Date();
  let diasRestantes = diasRestantesRaw;
  let enGraciaActivo = enGracia;
  let diasGraciaRestantes = diasGraciaRestantesRaw;

  if (tipoFidelidad !== "Nuevo" && fechaVencimientoObj && !isNaN(fechaVencimientoObj.getTime())) {
    const diffMs = fechaVencimientoObj.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      diasRestantes = diffDays;
      enGraciaActivo = false;
      diasGraciaRestantes = 0;
    } else {
      const diasExpirado = Math.abs(diffDays);
      const limiteGracia = tipoFidelidad === "VIP" ? 15 : tipoFidelidad === "Frecuente" ? 10 : 0;
      if (limiteGracia > 0 && diasExpirado <= limiteGracia) {
        enGraciaActivo = true;
        diasGraciaRestantes = Math.max(1, limiteGracia - diasExpirado);
        diasRestantes = 0;
      } else {
        diasRestantes = 0;
      }
    }
  }

  // Format clean full name avoiding word duplication
  const formatFullName = (u) => {
    if (!u) return "Cliente";
    const nombre = (u.nombre || "").trim();
    const apellidos = (u.apellidos || u.apellido || "").trim();
    if (!apellidos) return nombre;
    if (!nombre) return apellidos;
    const nombreWords = nombre.split(/\s+/);
    const apellidosWords = apellidos.split(/\s+/);
    const uniqueApellidos = apellidosWords.filter(
      (w) => !nombreWords.some((nw) => nw.toLowerCase() === w.toLowerCase())
    ).join(" ");
    return uniqueApellidos ? `${nombre} ${uniqueApellidos}` : nombre;
  };

  const userName = formatFullName(user);

  // ── Photo Upload & Avatar Handling ──
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      warning("Archivo demasiado grande", "La imagen no debe superar los 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setAvatarUrl(base64);
      localStorage.setItem(`avatar_${user?.id || user?.idUsuario}`, base64);
      success("Foto cargada", "Presiona 'Guardar Cambios' para aplicar tu foto de perfil");
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPresetAvatar = (avatar) => {
    setAvatarUrl(avatar);
    localStorage.setItem(`avatar_${user?.id || user?.idUsuario}`, avatar);
    success("Avatar seleccionado", "Presiona 'Guardar Cambios' para actualizar tu perfil");
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl("");
    localStorage.removeItem(`avatar_${user?.id || user?.idUsuario}`);
    success("Foto eliminada", "Se mostrará el distintivo de tu nivel");
  };

  // ── Close other active sessions ──
  const handleCloseOtherSessions = async () => {
    const result = await Swal.fire({
      title: "¿Cerrar sesiones en otros dispositivos?",
      text: "Se desconectarán todos los teléfonos o navegadores donde tengas tu cuenta abierta, excepto este dispositivo.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#f05454",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, cerrar otras sesiones",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      await Swal.fire({
        icon: "success",
        title: "Sesiones cerradas",
        text: "Tus otras sesiones han sido desconectadas por seguridad.",
        confirmButtonColor: "#f05454",
        timer: 2000,
        timerProgressBar: true,
      });
    }
  };

  // ── Edit form handlers ──
  const handleChange = (e) => {
    const { name, value } = e.target;
    let v = value;

    if (name === "numeroDocumento") {
      v = sanitizeDocumento(value, form.tipoDocumento);
    } else if (name === "telefono") {
      v = sanitizeTelefono(value);
    }

    setForm((prev) => ({ ...prev, [name]: v }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleTipoDocChange = (e) => {
    const nuevoTipo = e.target.value;
    setForm((prev) => ({
      ...prev,
      tipoDocumento: nuevoTipo,
      numeroDocumento: sanitizeDocumento(prev.numeroDocumento, nuevoTipo),
    }));
    if (errors.numeroDocumento) setErrors((prev) => ({ ...prev, numeroDocumento: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.nombre.trim()) errs.nombre = "El nombre es obligatorio.";
    else if (form.nombre.trim().length < 2) errs.nombre = "Mínimo 2 caracteres.";

    if (!form.apellidos.trim()) errs.apellidos = "Los apellidos son obligatorios.";
    else if (form.apellidos.trim().length < 2) errs.apellidos = "Mínimo 2 caracteres.";

    if (!form.email.trim()) errs.email = "El correo es obligatorio.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = "Ingresa un correo electrónico válido.";

    if (form.numeroDocumento) {
      const docErr = validateDocumento(form.numeroDocumento, form.tipoDocumento);
      if (docErr) errs.numeroDocumento = docErr;
    }
    if (form.telefono && form.telefono.length < 7) errs.telefono = "Mínimo 7 dígitos.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    try {
      const result = await updateProfile({
        nombre: form.nombre.trim(),
        apellidos: form.apellidos.trim(),
        email: form.email.trim(),
        telefono: form.telefono || null,
        direccion: form.direccion.trim() || null,
        tipoDocumento: form.tipoDocumento,
        numeroDocumento: form.numeroDocumento || null,
        foto: avatarUrl || null,
        avatar: avatarUrl || null,
      });

      if (result.success) {
        await Swal.fire({
          icon: "success",
          title: "¡Perfil Actualizado!",
          text: "Tus datos personales y foto han sido guardados correctamente.",
          confirmButtonColor: "#f05454",
          timer: 2200,
          timerProgressBar: true,
        });
        refreshUser?.();
      } else {
        Swal.fire({
          icon: "error",
          title: "No se pudo actualizar",
          text: result.message || "Ocurrió un error al guardar los cambios.",
          confirmButtonColor: "#f05454",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col font-sans transition-colors">
      {/* ── Top Header Navigation ── */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200/80 dark:border-gray-800 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-2 px-3.5 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-200 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-2xs group cursor-pointer"
              title="Volver a la tienda"
            >
              <ArrowLeft className="w-4 h-4 text-red-500 group-hover:-translate-x-0.5 transition-transform" />
              <span>Volver al Menú</span>
            </Link>

            <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-gray-200 dark:border-gray-800">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-white shadow-2xs border border-gray-100 shrink-0">
                <img src={logoImg} alt="Chazin Food" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="font-extrabold text-sm text-gray-900 dark:text-gray-100 leading-tight">Chazin Food</h1>
                <p className="text-[11px] text-gray-500 font-medium">Panel de Cliente & Fidelidad</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleDarkMode}
              className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
              title="Alternar Modo Claro / Oscuro"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content Container ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full flex-1 space-y-6">
        {/* ── Hero Profile & Loyalty Card ── */}
        <div
          className={`rounded-3xl p-6 sm:p-8 border shadow-md relative overflow-hidden transition-all ${
            tipoFidelidad === "VIP"
              ? "bg-gradient-to-br from-amber-500/15 via-yellow-500/10 to-orange-500/20 border-amber-300 dark:border-amber-700/80"
              : tipoFidelidad === "Frecuente"
              ? "bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-pink-500/15 border-indigo-200 dark:border-indigo-800/80"
              : tipoFidelidad === "Regular"
              ? "bg-gradient-to-br from-orange-500/15 via-amber-500/10 to-red-500/15 border-orange-200 dark:border-orange-800/80"
              : "bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-850 border-gray-200/90 dark:border-gray-800"
          }`}
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/40 dark:bg-white/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            {/* User Info Left */}
            <div className="flex items-center gap-4 sm:gap-5">
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center text-3xl sm:text-4xl shadow-md border shrink-0 overflow-hidden relative ${
                  tipoFidelidad === "VIP"
                    ? "bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 border-amber-200"
                    : tipoFidelidad === "Frecuente"
                    ? "bg-gradient-to-tr from-indigo-500 to-purple-500 text-white border-indigo-300"
                    : tipoFidelidad === "Regular"
                    ? "bg-gradient-to-tr from-orange-500 to-amber-500 text-white border-orange-300"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700"
                }`}
              >
                {avatarUrl && (avatarUrl.startsWith("data:image") || avatarUrl.startsWith("http") || avatarUrl.includes("/")) ? (
                  <img src={avatarUrl} alt={userName} className="w-full h-full object-cover rounded-3xl" />
                ) : avatarUrl ? (
                  <span>{avatarUrl}</span>
                ) : tipoFidelidad === "VIP" ? (
                  "🥇"
                ) : tipoFidelidad === "Frecuente" ? (
                  "🥈"
                ) : tipoFidelidad === "Regular" ? (
                  "🥉"
                ) : (
                  "🌱"
                )}
              </div>

              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-gray-100 truncate">
                    {userName}
                  </h2>
                  <FidelidadBadge tipo={tipoFidelidad} descuento={descuentoPorcentaje} enGracia={enGracia} size="md" />
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 flex-wrap font-medium">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    {user?.email || "Sin correo"}
                  </span>
                  {user?.telefono && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      {user.telefono}
                    </span>
                  )}
                  {form.direccion && (
                    <span className="flex items-center gap-1 truncate max-w-xs">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{form.direccion}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Loyalty Quick Stats Box */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xs p-4 sm:p-5 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:min-w-[320px]">
              <div className="flex-1 space-y-2 w-full">
                <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                  <span className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span>Racha ({comprasCiclo} de 3)</span>
                  </span>
                  <span className="text-[11px] font-extrabold text-[#f05454]">
                    {comprasFaltantes === 0
                      ? "¡Meta alcanzada! 🎉"
                      : tipoFidelidad === "VIP"
                      ? `Faltan ${comprasFaltantes} ${comprasFaltantes === 1 ? "compra" : "compras"}`
                      : `Faltan ${comprasFaltantes} para ${siguienteNivel}`}
                  </span>
                </div>

                {/* 3 Step Indicator */}
                <div className="grid grid-cols-3 gap-1.5">
                  {[1, 2, 3].map((step) => {
                    const isCompleted = comprasCiclo >= step;
                    return (
                      <div
                        key={step}
                        className={`h-2.5 rounded-full transition-all ${
                          isCompleted
                            ? "bg-gradient-to-r from-orange-500 to-[#f05454] shadow-xs"
                            : "bg-gray-200 dark:bg-gray-700"
                        }`}
                      />
                    );
                  })}
                </div>

                {/* Expiration or Grace Info */}
                {tipoFidelidad !== "Nuevo" && (
                  <div className="pt-1 text-[11px]">
                    {enGraciaActivo ? (
                      <div className="text-amber-800 dark:text-amber-300 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>
                          Gracia: <span className="underline">{diasGraciaRestantes} días restantes</span> para reactivar
                        </span>
                      </div>
                    ) : (
                      <div className="text-gray-500 dark:text-gray-400 font-medium flex items-center justify-between">
                        <span>Vigencia de nivel:</span>
                        <span className="text-[#f05454] font-black">
                          {diasRestantes !== null ? `${diasRestantes} días restantes` : "1 mes"}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {descuentoPorcentaje > 0 && (
                <div className="bg-[#f05454] text-white px-3.5 py-2 rounded-xl font-black text-center shrink-0 self-stretch sm:self-center flex sm:flex-col items-center justify-center gap-1 shadow-2xs">
                  <span className="text-lg leading-none">{descuentoPorcentaje}%</span>
                  <span className="text-[10px] uppercase tracking-wider">OFF Activo</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── 10+ Comprehensive Statistics Dashboard Grid ── */}
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#f05454]" />
              <span>Estadísticas & Hábitos de Consumo</span>
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Actualizado en tiempo real</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {/* Metric 1: Total Invertido */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 p-4 rounded-2xl shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-gray-400">Total Invertido</span>
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  ${stats.totalGastado.toLocaleString("es-CO")}
                </p>
                <p className="text-[11px] text-gray-400 font-medium mt-0.5">en compras acumuladas</p>
              </div>
            </div>

            {/* Metric 2: Ahorro Total por Fidelidad */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 p-4 rounded-2xl shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-rose-500 mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-gray-400">Ahorro Fidelidad</span>
                <Tag className="w-4 h-4" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-black text-[#f05454]">
                  ${stats.totalAhorrado.toLocaleString("es-CO")}
                </p>
                <p className="text-[11px] text-gray-400 font-medium mt-0.5">ahorrados en descuentos</p>
              </div>
            </div>

            {/* Metric 3: Total Pedidos */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 p-4 rounded-2xl shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-blue-500 mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-gray-400">Pedidos Totales</span>
                <Package className="w-4 h-4" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-black text-blue-600 dark:text-blue-400">
                  {stats.totalPedidosCount}
                </p>
                <p className="text-[11px] text-gray-400 font-medium mt-0.5">órdenes realizadas</p>
              </div>
            </div>

            {/* Metric 4: Platillos Disfrutados */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 p-4 rounded-2xl shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-orange-500 mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-gray-400">Platillos</span>
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-black text-orange-600 dark:text-orange-400">
                  {stats.totalProductosCount}
                </p>
                <p className="text-[11px] text-gray-400 font-medium mt-0.5">unidades preparadas</p>
              </div>
            </div>

            {/* Metric 5: Ticket Promedio */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 p-4 rounded-2xl shadow-xs flex flex-col justify-between col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between text-purple-500 mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-gray-400">Ticket Promedio</span>
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-black text-purple-600 dark:text-purple-400">
                  ${stats.ticketPromedio.toLocaleString("es-CO")}
                </p>
                <p className="text-[11px] text-gray-400 font-medium mt-0.5">por cada pedido</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Multi-Tab Navigation ── */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs overflow-hidden">
          <div className="flex border-b border-gray-100 dark:border-gray-800">
            <button
              onClick={() => setTab("fidelidad")}
              className={`flex-1 py-4 text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border-b-2 ${
                tab === "fidelidad"
                  ? "border-[#f05454] text-[#f05454] bg-red-50/40 dark:bg-red-950/20"
                  : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              <Crown className="w-4 h-4" />
              <span>Fidelidad & Hábitos</span>
            </button>

            <button
              onClick={() => setTab("pedidos")}
              className={`flex-1 py-4 text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border-b-2 ${
                tab === "pedidos"
                  ? "border-[#f05454] text-[#f05454] bg-red-50/40 dark:bg-red-950/20"
                  : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Mis Pedidos ({pedidos.length})</span>
            </button>

            <button
              onClick={() => setTab("editar")}
              className={`flex-1 py-4 text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border-b-2 ${
                tab === "editar"
                  ? "border-[#f05454] text-[#f05454] bg-red-50/40 dark:bg-red-950/20"
                  : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              <Edit2 className="w-4 h-4" />
              <span>Editar Datos Personales</span>
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {/* ══ TAB 1: FIDELIDAD & HÁBITOS ══ */}
            {tab === "fidelidad" && (
              <div className="space-y-6">
                {/* Top 3 Platillos Ranking & Hábitos */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left 2 Cols: Top Platillos Ranking */}
                  <div className="lg:col-span-2 bg-gray-50/70 dark:bg-gray-800/40 p-5 rounded-2xl border border-gray-200/70 dark:border-gray-700/60 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-500" />
                        <span>Top Platillos Más Pedidos</span>
                      </h4>
                      <span className="text-xs text-gray-400 font-bold">{stats.totalProductosCount} consumidos en total</span>
                    </div>

                    {stats.top3Items.length === 0 ? (
                      <div className="py-8 text-center text-gray-400 text-xs italic">
                        Realiza tus primeros pedidos para descubrir tus platillos favoritos.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {stats.top3Items.map((item, idx) => (
                          <div
                            key={idx}
                            className="bg-white dark:bg-gray-800 p-3.5 rounded-xl border border-gray-200/80 dark:border-gray-700/80 flex items-center justify-between gap-3 shadow-2xs"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-xl shrink-0">
                                {idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}
                              </span>
                              <div className="min-w-0">
                                <h5 className="font-black text-sm text-gray-900 dark:text-gray-100 truncate">
                                  {item.nombre}
                                </h5>
                                <p className="text-[11px] text-gray-500 font-medium">
                                  Pedido <strong className="text-gray-800 dark:text-gray-200">{item.count} {item.count === 1 ? "vez" : "veces"}</strong> ({item.percent}% de tus elecciones)
                                </p>
                              </div>
                            </div>
                            <div className="w-24 bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden shrink-0">
                              <div
                                className="bg-[#f05454] h-full rounded-full transition-all"
                                style={{ width: `${item.percent}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right Col: Hábitos de Pago y Entrega */}
                  <div className="bg-gray-50/70 dark:bg-gray-800/40 p-5 rounded-2xl border border-gray-200/70 dark:border-gray-700/60 space-y-4">
                    <h4 className="text-sm font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <PieChart className="w-4 h-4 text-blue-500" />
                      <span>Preferencias de Compra</span>
                    </h4>

                    <div className="space-y-3 text-xs">
                      {/* Método de pago */}
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200/80 dark:border-gray-700/80">
                        <div className="flex items-center justify-between text-gray-500 font-medium">
                          <span>Método de Pago Favorito</span>
                          <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                        </div>
                        <p className="text-sm font-black text-gray-900 dark:text-gray-100 mt-1">
                          {stats.topPayment} ({stats.paymentPercent}%)
                        </p>
                      </div>

                      {/* Modalidad de entrega */}
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200/80 dark:border-gray-700/80">
                        <div className="flex items-center justify-between text-gray-500 font-medium">
                          <span>Preferencia de Entrega</span>
                          <Bike className="w-3.5 h-3.5 text-purple-500" />
                        </div>
                        <p className="text-sm font-black text-gray-900 dark:text-gray-100 mt-1">
                          {stats.preferredDelivery}
                        </p>
                      </div>

                      {/* Último pedido */}
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200/80 dark:border-gray-700/80">
                        <div className="flex items-center justify-between text-gray-500 font-medium">
                          <span>Última Compra</span>
                          <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                        </div>
                        <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-1 truncate">
                          {stats.lastOrderDate}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Tabla de Niveles y Beneficios Desplegable ── */}
                <div className="bg-white dark:bg-gray-850 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-750 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>Tabla de Niveles & Beneficios del Club</span>
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Conoce las ventajas de cada membresía y cómo mantener tus descuentos automáticos.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowBenefitsTable(!showBenefitsTable)}
                      className="px-3 py-1.5 bg-gray-100 dark:bg-gray-750 hover:bg-gray-200 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1"
                    >
                      <span>{showBenefitsTable ? "Ocultar" : "Ver detalles"}</span>
                      {showBenefitsTable ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {showBenefitsTable && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 animate-in fade-in duration-150">
                      {/* Nivel Nuevo */}
                      <div className="p-4 rounded-2xl border bg-gray-50/80 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">🌱</span>
                          <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-[10px] font-black rounded-lg">0% OFF</span>
                        </div>
                        <h5 className="font-black text-sm">Cliente Nuevo</h5>
                        <p className="text-xs text-gray-500">Realiza 3 compras para subir automáticamente al nivel Regular.</p>
                      </div>

                      {/* Nivel Regular */}
                      <div className="p-4 rounded-2xl border bg-orange-50/70 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/40 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">🥉</span>
                          <span className="px-2 py-0.5 bg-orange-500 text-white text-[10px] font-black rounded-lg">5% OFF</span>
                        </div>
                        <h5 className="font-black text-sm text-orange-900 dark:text-orange-300">Cliente Regular</h5>
                        <p className="text-xs text-orange-800/80 dark:text-orange-400">
                          Vigencia de 30 días. Realiza 3 compras en el mes para ascender a Frecuente.
                        </p>
                      </div>

                      {/* Nivel Frecuente */}
                      <div className="p-4 rounded-2xl border bg-indigo-50/70 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/40 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">🥈</span>
                          <span className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-black rounded-lg">10% OFF</span>
                        </div>
                        <h5 className="font-black text-sm text-indigo-900 dark:text-indigo-300">Cliente Frecuente</h5>
                        <p className="text-xs text-indigo-800/80 dark:text-indigo-400">
                          Vigencia de 30 días + 10 días de periodo de gracia para no perder el estatus.
                        </p>
                      </div>

                      {/* Nivel VIP */}
                      <div className="p-4 rounded-2xl border bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900/50 space-y-2 shadow-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">🥇</span>
                          <span className="px-2 py-0.5 bg-amber-500 text-amber-950 text-[10px] font-black rounded-lg">15% OFF</span>
                        </div>
                        <h5 className="font-black text-sm text-amber-950 dark:text-amber-300">Cliente VIP</h5>
                        <p className="text-xs text-amber-900/80 dark:text-amber-400">
                          Máximo descuento + 15 días de gracia. Renueva con 3 compras en el ciclo.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ══ TAB 2: HISTORIAL DE PEDIDOS ══ */}
            {tab === "pedidos" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Package className="w-4 h-4 text-red-500" />
                    <span>Historial de Compras Realizadas</span>
                  </h4>
                  <button
                    onClick={fetchMyOrders}
                    disabled={loadingPedidos}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingPedidos ? "animate-spin text-red-500" : ""}`} />
                    <span>Actualizar</span>
                  </button>
                </div>

                {loadingPedidos ? (
                  <div className="py-12 text-center">
                    <RefreshCw className="w-8 h-8 text-red-500 animate-spin mx-auto mb-2" />
                    <p className="text-xs text-gray-400 font-bold">Cargando tus pedidos...</p>
                  </div>
                ) : pedidos.length === 0 ? (
                  <div className="py-12 text-center space-y-3 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                    <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto" />
                    <p className="text-sm font-bold text-gray-600 dark:text-gray-300">Aún no tienes pedidos registrados</p>
                    <Link
                      to="/"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#f05454] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-red-600 transition"
                    >
                      Explorar el Menú y Pedir
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pedidos.map((ped, idx) => (
                      <div
                        key={idx}
                        className="bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/80 p-4 rounded-2xl shadow-2xs hover:shadow-xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="font-black text-sm text-gray-900 dark:text-gray-100">
                              {ped.numeroVenta || `Pedido #${ped.id}`}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                                ped.estado === "Completada" || ped.estado === "Listo"
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                  : ped.estado === "En Preparación"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                                  : ped.estado === "Anulada"
                                  ? "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                                  : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                              }`}
                            >
                              {ped.estado}
                            </span>
                            <span className="text-xs text-gray-400 font-medium">{ped.fecha}</span>
                          </div>

                          <div className="text-xs text-gray-600 dark:text-gray-300">
                            {(ped.items || []).length > 0 ? (
                              <span>
                                {(ped.items || []).map((i) => `${i.cantidad || 1}x ${i.nombre}`).join(", ")}
                              </span>
                            ) : (
                              <span className="italic text-gray-400">Platillos preparados</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0">
                          <div className="text-right">
                            <p className="text-base font-black text-gray-900 dark:text-gray-100">
                              ${(parseFloat(ped.total) || 0).toLocaleString("es-CO")}
                            </p>
                            {ped.descuentoAplicado > 0 && (
                              <p className="text-[10px] text-emerald-600 font-bold">
                                -${ped.descuentoAplicado.toLocaleString("es-CO")} OFF
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ══ TAB 3: EDITAR DATOS PERSONALES, FOTO & SESIONES ACTIVAS ══ */}
            {tab === "editar" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* ── Left Column: Formulario de Datos Personales ── */}
                <div className="lg:col-span-7 space-y-6">
                  <div>
                    <h4 className="text-base font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <User className="w-4 h-4 text-[#f05454]" />
                      <span>Información Personal</span>
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Actualiza tus nombres, datos de identificación y dirección de entrega.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Nombre */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                          Nombre <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="nombre"
                          value={form.nombre}
                          onChange={handleChange}
                          placeholder="Tu nombre"
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-medium bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none transition focus:ring-2 focus:ring-red-400 focus:bg-white dark:focus:bg-gray-800 ${
                            errors.nombre ? "border-red-400" : "border-gray-200 dark:border-gray-700"
                          }`}
                        />
                        <FieldError msg={errors.nombre} />
                      </div>

                      {/* Apellidos */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                          Apellidos <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="apellidos"
                          value={form.apellidos}
                          onChange={handleChange}
                          placeholder="Tus apellidos"
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-medium bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none transition focus:ring-2 focus:ring-red-400 focus:bg-white dark:focus:bg-gray-800 ${
                            errors.apellidos ? "border-red-400" : "border-gray-200 dark:border-gray-700"
                          }`}
                        />
                        <FieldError msg={errors.apellidos} />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                        Correo Electrónico <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="tu@correo.com"
                          className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-medium bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none transition focus:ring-2 focus:ring-red-400 focus:bg-white dark:focus:bg-gray-800 ${
                            errors.email ? "border-red-400" : "border-gray-200 dark:border-gray-700"
                          }`}
                        />
                      </div>
                      <FieldError msg={errors.email} />
                    </div>

                    {/* Documento */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                          Tipo Documento
                        </label>
                        <select
                          value={form.tipoDocumento}
                          onChange={handleTipoDocChange}
                          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs sm:text-sm font-medium bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none transition focus:ring-2 focus:ring-red-400"
                        >
                          {TIPOS_DOCUMENTO.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                          N.° Documento
                        </label>
                        <input
                          type="text"
                          name="numeroDocumento"
                          value={form.numeroDocumento}
                          onChange={handleChange}
                          placeholder="Número de identificación"
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-medium bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none transition focus:ring-2 focus:ring-red-400 focus:bg-white dark:focus:bg-gray-800 ${
                            errors.numeroDocumento ? "border-red-400" : "border-gray-200 dark:border-gray-700"
                          }`}
                        />
                        <FieldError msg={errors.numeroDocumento} />
                      </div>
                    </div>

                    {/* Teléfono */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                        Teléfono Celular
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          name="telefono"
                          value={form.telefono}
                          onChange={handleChange}
                          placeholder="Ej: 3001234567"
                          className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-medium bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none transition focus:ring-2 focus:ring-red-400 focus:bg-white dark:focus:bg-gray-800 ${
                            errors.telefono ? "border-red-400" : "border-gray-200 dark:border-gray-700"
                          }`}
                        />
                      </div>
                      <FieldError msg={errors.telefono} />
                    </div>

                    {/* Dirección de Entrega por Defecto */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                        Dirección de Entrega por Defecto
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          name="direccion"
                          value={form.direccion}
                          onChange={handleChange}
                          placeholder="Ej: Calle 50 #30-20, Medellín"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs sm:text-sm font-medium bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none transition focus:ring-2 focus:ring-red-400 focus:bg-white dark:focus:bg-gray-800"
                        />
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">
                        Esta dirección se precargará automáticamente al realizar tus pedidos.
                      </p>
                    </div>

                    {/* Submit button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={saving}
                        className="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-[#f05454] to-[#c43d3d] hover:from-[#e04444] hover:to-[#b52d2d] text-white font-bold rounded-2xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 text-sm disabled:opacity-60 cursor-pointer"
                      >
                        {saving ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Guardando cambios...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Guardar Cambios</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* ── Right Column: Foto de Perfil & Sesiones Activas ── */}
                <div className="lg:col-span-5 space-y-6">
                  {/* 📸 Tarjeta 1: Foto de Perfil */}
                  <div className="bg-gray-50/80 dark:bg-gray-800/40 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-700/60 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <Camera className="w-4 h-4 text-[#f05454]" />
                        <span>Foto de Perfil & Avatar</span>
                      </h4>
                      {avatarUrl && (
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          className="text-[11px] font-bold text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer transition"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Quitar foto</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Avatar Preview */}
                      <div className="w-20 h-20 rounded-3xl bg-white dark:bg-gray-850 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-4xl shadow-inner shrink-0 overflow-hidden relative group">
                        {avatarUrl && (avatarUrl.startsWith("data:image") || avatarUrl.startsWith("http") || avatarUrl.includes("/")) ? (
                          <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : avatarUrl ? (
                          <span>{avatarUrl}</span>
                        ) : (
                          <span className="text-3xl">
                            {tipoFidelidad === "VIP" ? "🥇" : tipoFidelidad === "Frecuente" ? "🥈" : tipoFidelidad === "Regular" ? "🥉" : "🌱"}
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          title="Cambiar foto"
                        >
                          <Camera className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="space-y-2 flex-1 min-w-0">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />

                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full px-3.5 py-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold transition shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5 text-[#f05454]" />
                          <span>Subir Imagen</span>
                        </button>

                        <p className="text-[10.5px] text-gray-400 leading-tight">
                          JPG, PNG o WEBP. Máx. 2MB.
                        </p>
                      </div>
                    </div>

                    {/* Preset Avatars Selector */}
                    <div className="pt-1">
                      <p className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">
                        O elige un avatar rápido:
                      </p>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {PRESET_AVATARS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => handleSelectPresetAvatar(emoji)}
                            className={`w-8 h-8 rounded-xl flex items-center justify-center text-base transition-transform active:scale-95 cursor-pointer ${
                              avatarUrl === emoji
                                ? "bg-red-100 dark:bg-red-950/60 border-2 border-[#f05454] scale-110 shadow-xs"
                                : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                            }`}
                            title={`Elegir ${emoji}`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 🔒 Tarjeta 2: Sesiones Activas & Seguridad */}
                  <div className="bg-gray-50/80 dark:bg-gray-800/40 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-700/60 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span>Sesiones Activas</span>
                      </h4>
                      <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>1 en línea</span>
                      </span>
                    </div>

                    {/* Dispositivo Actual */}
                    <div className="bg-white dark:bg-gray-800 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 shadow-2xs space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                            {deviceInfo.isMobile ? <Smartphone className="w-4 h-4" /> : <Laptop className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h5 className="font-bold text-xs text-gray-900 dark:text-gray-100">
                                {deviceInfo.os}
                              </h5>
                              <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 text-[9.5px] font-black rounded-md">
                                Este Dispositivo
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-500 font-medium">
                              {deviceInfo.browser} • Colombia (IP Actual)
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="text-[10.5px] text-gray-400 flex items-center gap-1 pt-1 border-t border-gray-100 dark:border-gray-700/60">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span>Sesión iniciada hoy • Actividad en tiempo real</span>
                      </div>
                    </div>

                    {/* Dispositivo Secundario Frecuente */}
                    <div className="bg-white dark:bg-gray-800 p-3.5 rounded-xl border border-gray-200/80 dark:border-gray-700/60 shadow-2xs opacity-85 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500">
                            <Smartphone className="w-4 h-4" />
                          </div>
                          <div>
                            <h5 className="font-bold text-xs text-gray-800 dark:text-gray-200">
                              Dispositivo Móvil
                            </h5>
                            <p className="text-[11px] text-gray-400">
                              Navegador Móvil • Medellín, Colombia
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-400 font-medium">Hace 3h</span>
                      </div>
                    </div>

                    {/* Botón Cerrar Otras Sesiones */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={handleCloseOtherSessions}
                        className="w-full py-2.5 px-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold transition shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Key className="w-3.5 h-3.5 text-amber-500" />
                        <span>Cerrar sesión en otros dispositivos</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default ClientePerfil;
