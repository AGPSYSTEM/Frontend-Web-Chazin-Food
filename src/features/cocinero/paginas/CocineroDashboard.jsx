import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import {
  LogOut,
  ChefHat,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  Package,
  User,
  Sun,
  Moon,
  BookOpen,
  X,
  ChevronDown,
  FileText,
  Search,
  RefreshCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Flame,
  UtensilsCrossed,
  Timer,
  ShoppingBag,
  Bike,
  Sparkles,
  RotateCcw,
  CheckCheck,
  Calendar
} from "lucide-react";
import { useAuth } from "@/features/autenticacion/hooks/useAuth";
import { useDarkMode } from "@/shared/hooks/useDarkMode";
import { useNotifications } from "@/shared/hooks/useNotifications";
import logoImg from "@/shared/assets/ChatGPT_Image_1_jun_2026__21_55_04.png";
import { produccionService } from "@/features/produccion/servicios/produccionService";
import { fichasTecnicasService } from "@/features/fichas-tecnicas/servicios/fichasTecnicasService";
import { getAdditionEmoji } from "@/shared/utils/foodEmojiUtils";

/**
 * Clean human notes from JSON artifacts, redundant additions summaries, or duplicate product names
 */
function cleanNote(text, productName = "") {
  if (!text || typeof text !== "string") return "";
  const trimmed = text.trim();

  // If it's a JSON payload or has JSON-like keys
  if (
    trimmed.startsWith("{") ||
    trimmed.startsWith("[") ||
    trimmed.includes('"horario"') ||
    trimmed.includes('"codigoPedido"') ||
    trimmed.includes('"tipoEntrega"')
  ) {
    try {
      const parsed = JSON.parse(trimmed);
      const sub = parsed.especificaciones || parsed.nota || parsed.observaciones || "";
      return cleanNote(sub, productName);
    } catch (e) {
      return "";
    }
  }

  const normNote = trimmed.toLowerCase();
  const normProd = (productName || "").toLowerCase().trim();

  // Redundant notes that repeat product name
  if (normProd && (normNote === normProd || normNote.startsWith(normProd))) {
    return "";
  }

  // Redundant notes that just list additions in parentheses e.g. "(+ Sprite, Papas)"
  if (normNote.includes("(+") || normNote.includes("( +") || normNote.startsWith("(+") || normNote.startsWith("+")) {
    return "";
  }

  // If it's just repeating common generic placeholder strings
  if (
    normNote === "sin observaciones" ||
    normNote === "ninguna" ||
    normNote === "ninguno" ||
    normNote === "n/a" ||
    normNote === "null" ||
    normNote === "mesa" ||
    normNote === "en local"
  ) {
    return "";
  }

  return trimmed;
}

/**
 * Format client name cleanly avoiding duplicate consecutive names/surnames
 */
function formatCleanClientName(name) {
  if (!name || typeof name !== "string") return "Cliente Mostrador";
  const words = name.trim().split(/\s+/);
  const seen = new Set();
  const cleanWords = [];
  for (const w of words) {
    const lower = w.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      cleanWords.push(w);
    }
  }
  return cleanWords.join(" ") || name;
}

/**
 * Robustly parses an addition item (object or string) and extracts clean name and quantity
 */
function parseAddition(ad) {
  if (typeof ad === "object" && ad !== null) {
    let name = ad.nombre || ad.nombreAdicion || "Adición";
    let qty = Number(ad.cantidad) || 1;

    // Check if name string itself has embedded quantity e.g. "5x Sprite" or "Sprite (x5)"
    const match =
      name.match(/^(\d+)\s*x\s*(.*)$/i) ||
      name.match(/^(.*?)\s*\(x?(\d+)\)$/i) ||
      name.match(/^(.*?)\s*x\s*(\d+)$/i) ||
      name.match(/^\+\s*(\d+)\s*x?\s*(.*)$/i);

    if (match) {
      if (name.match(/^(\d+)\s*x\s*(.*)$/i)) {
        qty = parseInt(match[1], 10);
        name = match[2].trim();
      } else if (name.match(/^\+\s*(\d+)\s*x?\s*(.*)$/i)) {
        qty = parseInt(match[1], 10);
        name = match[2].trim();
      } else {
        name = match[1].trim();
        qty = parseInt(match[2], 10);
      }
    }
    return { name, qty: qty > 0 ? qty : 1 };
  }

  const str = String(ad || "").trim();
  const match =
    str.match(/^(\d+)\s*x\s*(.*)$/i) ||
    str.match(/^(.*?)\s*\(x?(\d+)\)$/i) ||
    str.match(/^(.*?)\s*x\s*(\d+)$/i) ||
    str.match(/^\+\s*(\d+)\s*x?\s*(.*)$/i);

  if (match) {
    if (str.match(/^(\d+)\s*x\s*(.*)$/i)) {
      return { qty: parseInt(match[1], 10), name: match[2].trim() };
    }
    if (str.match(/^\+\s*(\d+)\s*x?\s*(.*)$/i)) {
      return { qty: parseInt(match[1], 10), name: match[2].trim() };
    }
    return { name: match[1].trim(), qty: parseInt(match[2], 10) };
  }

  return { name: str.replace(/^\+\s*/, ""), qty: 1 };
}

/**
 * Calculate accurate order time and elapsed duration without absurd minute values for past dates
 */
function getOrderTimeDisplay(order, isListo = false) {
  let orderDate = null;

  if (order.fechaVenta) {
    orderDate = new Date(order.fechaVenta);
  } else if (order.fecha) {
    if (order.horaInicio) {
      const parsed = new Date(`${order.fecha} ${order.horaInicio}`);
      orderDate = !isNaN(parsed.getTime()) ? parsed : new Date(order.fecha);
    } else {
      orderDate = new Date(order.fecha);
    }
  }

  // Format 12-hour time string (e.g. "07:04 AM")
  let formattedTime = order.horaInicio || "";
  let datePrefix = "";

  if (orderDate && !isNaN(orderDate.getTime())) {
    let h = orderDate.getHours();
    const m = String(orderDate.getMinutes()).padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    formattedTime = `${String(h).padStart(2, "0")}:${m} ${ampm}`;

    const now = new Date();
    const isSameDay =
      orderDate.getDate() === now.getDate() &&
      orderDate.getMonth() === now.getMonth() &&
      orderDate.getFullYear() === now.getFullYear();

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday =
      orderDate.getDate() === yesterday.getDate() &&
      orderDate.getMonth() === yesterday.getMonth() &&
      orderDate.getFullYear() === yesterday.getFullYear();

    if (!isSameDay) {
      if (isYesterday) {
        datePrefix = "Ayer";
      } else {
        const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        datePrefix = `${orderDate.getDate()} ${meses[orderDate.getMonth()]}`;
      }
    }
  }

  // 1. If comanda is LISTO: show its registration/completed time rather than active cooking timer
  if (isListo) {
    const displayText = datePrefix ? `${datePrefix} • ${formattedTime}` : formattedTime || "Listo";
    return {
      text: displayText,
      exactTime: formattedTime,
      level: "completed",
      isCompleted: true
    };
  }

  // 2. If no valid date found: fallback to time string
  if (!orderDate || isNaN(orderDate.getTime())) {
    return {
      text: formattedTime || "Reciente",
      exactTime: formattedTime,
      level: "normal",
      isCompleted: false
    };
  }

  // 3. For active orders in queue or in preparation: calculate elapsed minutes
  const diffMs = Date.now() - orderDate.getTime();
  const minutes = Math.max(0, Math.floor(diffMs / 60000));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  // If order is from days ago (e.g. test orders from previous dates)
  if (days > 0 || datePrefix) {
    return {
      text: `${datePrefix || `${days}d`} • ${formattedTime}`,
      exactTime: formattedTime,
      level: "warning",
      isCompleted: false
    };
  }

  // If order was created earlier today (> 1 hour)
  if (hours > 0) {
    const remMin = minutes % 60;
    return {
      text: `Hace ${hours}h ${remMin > 0 ? `${remMin}m` : ""}`,
      exactTime: formattedTime,
      level: "critical",
      isCompleted: false
    };
  }

  // Orders created in the last 60 minutes
  if (minutes < 1) {
    return { text: "Hace un momento", exactTime: formattedTime, level: "fresh", isCompleted: false };
  }
  if (minutes === 1) {
    return { text: "Hace 1 min", exactTime: formattedTime, level: "fresh", isCompleted: false };
  }
  if (minutes < 12) {
    return { text: `Hace ${minutes} min`, exactTime: formattedTime, level: "normal", isCompleted: false };
  }
  if (minutes < 25) {
    return { text: `Hace ${minutes} min`, exactTime: formattedTime, level: "warning", isCompleted: false };
  }

  return { text: `Hace ${minutes} min`, exactTime: formattedTime, level: "critical", isCompleted: false };
}

/**
 * Play a pleasant kitchen chime via Web Audio API
 */
function playKitchenChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Tone 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    gain1.gain.setValueAtTime(0.2, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.5);

    // Tone 2
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
    gain2.gain.setValueAtTime(0.25, ctx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 0.7);
  } catch (e) {
    // AudioContext blocked by browser policy until user interaction
  }
}

export function CocineroDashboard() {
  const { logout } = useAuth();
  const [darkMode, toggleDarkMode] = useDarkMode();
  const { success, error: notifyError, confirmAction, confirmLogout } = useNotifications();

  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Interactive Checklist of prepared dishes per order { "orderId-itemIdx": boolean }
  const [checkedItems, setCheckedItems] = useState({});
  // Collapsible tickets state (defaults to collapsed)
  const [expandedTickets, setExpandedTickets] = useState({});

  // Receta / Ficha Técnica Modal
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [modalRecetaData, setModalRecetaData] = useState(null);
  const [loadingReceta, setLoadingReceta] = useState(false);

  const prevOrderCountRef = useRef(0);

  // Live Digital Clock (HH:MM:SS 12h format with AM/PM)
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch orders from API
  const fetchPedidos = useCallback(
    async (isSilent = false) => {
      try {
        if (!isSilent) setLoading(true);
        else setRefreshing(true);

        const data = await produccionService.getOrdenes();
        const list = Array.isArray(data) ? data : data?.data || [];

        // Check if there are new pending orders to ring bell
        const pendingCount = list.filter(
          (p) =>
            p.estadoAprobacion === "APROBADO" &&
            (p.estado === "En Cola" || p.estado === "Pendiente" || p.estadoEntrega === "PENDIENTE")
        ).length;

        if (isSilent && soundEnabled && pendingCount > prevOrderCountRef.current && prevOrderCountRef.current > 0) {
          playKitchenChime();
        }
        prevOrderCountRef.current = pendingCount;
        setPedidos(list);
      } catch (err) {
        if (!isSilent) {
          console.error("Error al cargar pedidos en CocineroDashboard:", err);
          notifyError("Error", "No se pudieron sincronizar los pedidos con el servidor");
        } else {
          console.warn("Sincronización en segundo plano diferida:", err.message);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [notifyError, soundEnabled]
  );

  useEffect(() => {
    fetchPedidos();
    const interval = setInterval(() => {
      fetchPedidos(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchPedidos]);

  // Fullscreen handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // Change order state
  const cambiarEstado = async (id, nuevoEstado, options = {}) => {
    const pedObj = pedidos.find((p) => String(p.id) === String(id) || String(p.idVenta) === String(id));
    const itemsCount = pedObj?.productos?.length || 0;

    if (!options.silentConfirm) {
      const confirmed = await confirmAction(
        "¿Actualizar comanda?",
        `¿Deseas marcar la comanda #${id} como "${nuevoEstado}"?`
      );
      if (!confirmed) return;
    }

    try {
      await produccionService.updateEstadoOrden(id, nuevoEstado);
      setPedidos((prev) =>
        prev.map((p) =>
          String(p.id) === String(id) || String(p.idVenta) === String(id)
            ? { ...p, estado: nuevoEstado, estadoEntrega: nuevoEstado.toUpperCase() }
            : p
        )
      );

      // Auto-check all items when moving to Listo
      if (nuevoEstado === "Listo" && itemsCount > 0) {
        setCheckedItems((prev) => {
          const next = { ...prev };
          for (let i = 0; i < itemsCount; i++) {
            next[`${id}-${i}`] = true;
          }
          return next;
        });
      }

      success("Estado actualizado", `Comanda #${id} marcada como "${nuevoEstado}"`);
      fetchPedidos(true);
    } catch (err) {
      notifyError("Error", err.message || "No se pudo actualizar el estado");
    }
  };

  // Toggle item check in kitchen checklist
  const toggleItemCheck = (orderId, itemIdx, currentOrderState) => {
    // If comanda is already Listo, it's locked for delivery
    if (currentOrderState === "Listo" || currentOrderState === "LISTO") {
      return;
    }

    const key = `${orderId}-${itemIdx}`;
    const willBeChecked = !checkedItems[key];

    setCheckedItems((prev) => ({
      ...prev,
      [key]: willBeChecked
    }));

    // If order was in queue (En Cola) and cook starts checking items, move to En Preparación automatically
    if (willBeChecked && (currentOrderState === "En Cola" || currentOrderState === "Pendiente" || currentOrderState === "PENDIENTE")) {
      cambiarEstado(orderId, "En Preparación", { silentConfirm: true });
    }
  };

  // Open recipe modal
  const verReceta = async (pedido, producto) => {
    setProductoSeleccionado(producto);
    setLoadingReceta(true);

    if (producto.receta) {
      setModalRecetaData(producto.receta);
      setLoadingReceta(false);
      return;
    }

    try {
      const prodId = producto.idProducto || producto.idVariante || producto.id;
      if (prodId) {
        const ft = await fichasTecnicasService.getFichaByProducto(prodId);
        if (ft && (ft.detalles || ft.procedimiento || ft.idFichaTecnica)) {
          const rawPasos = ft.procedimiento || ft.descripcion || "";
          const pasos = rawPasos
            ? rawPasos.split("\n").map((p) => p.trim()).filter(Boolean)
            : ["Preparar los ingredientes según porciones", "Cocinar y servir caliente"];

          setModalRecetaData({
            idFichaTecnica: ft.idFichaTecnica,
            idProducto: ft.idProducto,
            tiempoPreparacion: ft.tiempoPreparacion ? `${ft.tiempoPreparacion} min` : "12 min",
            rendimiento: ft.rendimiento || "1 porción",
            especificaciones: ft.especificaciones || "",
            caracteristicas: ft.caracteristicas || "",
            informacionNutricional: ft.informacionNutricional || "",
            condicionesAlmacenamiento: ft.condicionesAlmacenamiento || "",
            vidaUtil: ft.vidaUtil || "",
            ingredientes: (ft.detalles || []).map((d) => ({
              idInsumo: d.idInsumo,
              nombre: d.insumo?.nombre || d.nombreInsumo || `Insumo #${d.idInsumo}`,
              cantidad: `${d.cantidad || 1} ${d.unidadMedida || d.insumo?.unidadMedida || "und"}`
            })),
            pasos
          });
          return;
        }
      }

      // Fallback
      setModalRecetaData({
        tiempoPreparacion: "10-15 min",
        rendimiento: "1 unidad",
        especificaciones: "Preparación estándar de la casa",
        ingredientes: [{ nombre: "Ingredientes del platillo", cantidad: "1 porción estándar" }],
        pasos: ["Revisar ingredientes y adiciones", "Preparar en cocina según comanda", "Emplatar caliente y servir"]
      });
    } catch (err) {
      console.warn("No se pudo cargar ficha técnica del producto:", err);
      setModalRecetaData({
        tiempoPreparacion: "10-15 min",
        rendimiento: "1 unidad",
        ingredientes: [{ nombre: "Ingredientes estándar", cantidad: "1 porción" }],
        pasos: ["Preparar en cocina según orden de comanda"]
      });
    } finally {
      setLoadingReceta(false);
    }
  };

  const handleLogout = async () => {
    const confirmed = await confirmLogout();
    if (confirmed) {
      logout();
      success("Sesión cerrada", "Has salido del sistema de cocina");
    }
  };

  // Filter approved active orders
  const pedidosAprobados = useMemo(() => {
    return pedidos.filter((p) => {
      const isApproved = p.estadoAprobacion === "APROBADO";
      const isPendingApproval = p.estado === "Por Aprobar" || p.estadoAprobacion === "PENDIENTE";
      const isRejected =
        p.estado === "Rechazado" ||
        p.estadoAprobacion === "RECHAZADO" ||
        p.estado === "Anulada" ||
        p.estadoEntrega === "CANCELADO";

      if (isRejected || isPendingApproval || !isApproved) {
        return false;
      }
      return true;
    });
  }, [pedidos]);

  // Apply tab & search filters
  const pedidosFiltrados = useMemo(() => {
    return pedidosAprobados.filter((p) => {
      // Tab filter
      const isListo = p.estado === "Listo" || p.estadoEntrega === "LISTO";
      const isPreparando = p.estado === "En Preparación" || p.estadoEntrega === "PREPARANDO";
      const isPendiente = !isListo && !isPreparando;

      if (filtroEstado === "Pendiente" && !isPendiente) return false;
      if (filtroEstado === "En Preparación" && !isPreparando) return false;
      if (filtroEstado === "Listo" && !isListo) return false;

      // Search query filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const codeMatch = (p.codigo || `VEN-${p.id || p.idVenta}`).toLowerCase().includes(q);
        const clientMatch = (p.cliente || "").toLowerCase().includes(q);
        const prodMatch = (p.productos || []).some((pr) => (pr.nombre || "").toLowerCase().includes(q));
        if (!codeMatch && !clientMatch && !prodMatch) return false;
      }

      return true;
    });
  }, [pedidosAprobados, filtroEstado, searchTerm]);

  // Calculate counts for badges
  const countPendientes = useMemo(() => {
    return pedidosAprobados.filter(
      (p) => p.estado === "En Cola" || p.estado === "Pendiente" || p.estadoEntrega === "PENDIENTE"
    ).length;
  }, [pedidosAprobados]);

  const countPreparando = useMemo(() => {
    return pedidosAprobados.filter(
      (p) => p.estado === "En Preparación" || p.estadoEntrega === "PREPARANDO"
    ).length;
  }, [pedidosAprobados]);

  const countListos = useMemo(() => {
    return pedidosAprobados.filter((p) => p.estado === "Listo" || p.estadoEntrega === "LISTO").length;
  }, [pedidosAprobados]);

  const countTotalPlatillos = useMemo(() => {
    return pedidosAprobados.reduce(
      (acc, p) => acc + (p.cantidad || (p.productos || []).reduce((s, i) => s + (i.cantidad || 1), 0)),
      0
    );
  }, [pedidosAprobados]);

  // Format live header clock in 12h format (e.g. 06:20:33 PM)
  const formattedHeaderClock = useMemo(() => {
    let h = currentTime.getHours();
    const m = String(currentTime.getMinutes()).padStart(2, "0");
    const s = String(currentTime.getSeconds()).padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${String(h).padStart(2, "0")}:${m}:${s} ${ampm}`;
  }, [currentTime]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col font-sans transition-colors">
      {/* ── Top Kitchen KDS Header ── */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200/80 dark:border-gray-800 px-4 sm:px-6 py-3.5 sticky top-0 z-30 shadow-xs">
        <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Brand & Live Digital Clock */}
          <div className="flex items-center justify-between md:justify-start gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl overflow-hidden bg-red-50 dark:bg-red-950/40 shrink-0 border border-red-100 dark:border-red-900/50 shadow-xs flex items-center justify-center p-1.5">
                <img src={logoImg} alt="Chazin Food" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-black text-gray-900 dark:text-gray-100 text-base sm:text-lg tracking-tight flex items-center gap-1.5">
                    <ChefHat className="w-5 h-5 text-[#F05454]" />
                    Cocina Chazin Food
                  </h1>
                  <span className="hidden sm:inline-flex px-2 py-0.5 rounded-md bg-red-100/80 dark:bg-red-950/50 text-[#F05454] dark:text-red-400 font-extrabold text-[10px] tracking-wider uppercase">
                    KDS
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Comandas y Preparación en Tiempo Real
                </p>
              </div>
            </div>

            {/* Live Clock Badge (12-hour AM/PM format) */}
            <div
              className="md:ml-4 px-3 py-1.5 bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 rounded-xl flex items-center gap-2 text-xs font-mono font-bold text-gray-700 dark:text-gray-200 shadow-2xs"
              title="Hora actual del sistema en formato 12 horas"
            >
              <Timer className="w-3.5 h-3.5 text-[#F05454]" />
              <span>{formattedHeaderClock}</span>
            </div>
          </div>

          {/* Quick Search & Utility Actions */}
          <div className="flex items-center justify-between md:justify-end gap-2 sm:gap-3">
            {/* Search Input */}
            <div className="relative flex-1 md:w-56">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar comanda..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-[#F05454] focus:bg-white dark:focus:bg-gray-900 rounded-xl text-xs font-medium text-gray-800 dark:text-gray-200 placeholder-gray-400 outline-hidden transition"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sound Chime Toggle */}
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) playKitchenChime();
              }}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                soundEnabled
                  ? "border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                  : "border-gray-200 dark:border-gray-700 text-gray-400 bg-gray-50 dark:bg-gray-800"
              }`}
              title={soundEnabled ? "Timbre de cocina activado" : "Timbre silenciado"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Sync Refresh Button */}
            <button
              onClick={() => fetchPedidos(false)}
              disabled={loading || refreshing}
              className={`p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer ${
                refreshing ? "animate-spin text-[#F05454]" : ""
              }`}
              title="Actualizar comandas"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer hidden sm:flex"
              title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa para cocina"}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>

            {/* Recetas / Fichas Técnicas link */}
            <Link
              to="/fichas-tecnicas"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-[#F05454] rounded-xl text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/60 transition cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Recetario</span>
            </Link>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => toggleDarkMode()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-600 dark:text-gray-400 transition cursor-pointer"
              title={darkMode ? "Modo Claro" : "Modo Oscuro"}
            >
              {darkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 rounded-xl transition cursor-pointer"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Main KDS Body ── */}
      <main className="p-4 sm:p-6 w-full max-w-[1920px] mx-auto space-y-5 flex-1 flex flex-col">
        {/* Filters & Metrics Strip */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white dark:bg-gray-900 p-3.5 sm:p-4 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
            {[
              { id: "Todos", label: "Todas las Comandas", count: pedidosAprobados.length },
              { id: "Pendiente", label: "En Cola", count: countPendientes },
              { id: "En Preparación", label: "En Preparación", count: countPreparando },
              { id: "Listo", label: "Listos para Entrega", count: countListos }
            ].map((tab) => {
              const active = filtroEstado === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFiltroEstado(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all shrink-0 flex items-center gap-2.5 whitespace-nowrap cursor-pointer select-none ${
                    active
                      ? "bg-[#F05454] text-white shadow-xs"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-750"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-black min-w-[20px] text-center ${
                      active
                        ? "bg-white/25 text-white"
                        : tab.count > 0 && tab.id === "Pendiente"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300"
                        : tab.count > 0 && tab.id === "En Preparación"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300"
                        : tab.count > 0 && tab.id === "Listo"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-300"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center justify-between lg:justify-end gap-4 text-xs font-bold text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <UtensilsCrossed className="w-3.5 h-3.5 text-[#F05454]" />
              <span>
                Total Platillos: <strong className="text-gray-900 dark:text-gray-100">{countTotalPlatillos}</strong>
              </span>
            </div>
            <div className="h-3.5 w-px bg-gray-200 dark:bg-gray-800" />
            <div className="flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-blue-500" />
              <span>
                Comandas Activas: <strong className="text-gray-900 dark:text-gray-100">{pedidosFiltrados.length}</strong>
              </span>
            </div>
            {refreshing && (
              <span className="text-[#F05454] text-[11px] font-black animate-pulse flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Sincronizando...
              </span>
            )}
          </div>
        </div>

        {/* ── KDS Grid of Orders ── */}
        {loading ? (
          <div className="p-16 text-center bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs flex-1 flex flex-col items-center justify-center">
            <RefreshCw className="w-10 h-10 text-[#F05454] animate-spin mb-3" />
            <h3 className="font-black text-gray-800 dark:text-gray-100 text-base">Cargando comandas de cocina...</h3>
            <p className="text-xs text-gray-400 mt-1 font-medium">Sincronizando pedidos del punto de venta y tienda web</p>
          </div>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="p-16 text-center bg-white dark:bg-gray-900 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800 shadow-xs flex-1 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/30 text-[#F05454] flex items-center justify-center mx-auto mb-4">
              <ChefHat className="w-8 h-8" />
            </div>
            <h3 className="font-black text-lg text-gray-800 dark:text-gray-100">
              {searchTerm ? "No se encontraron comandas con esa búsqueda" : "No hay comandas pendientes en esta sección"}
            </h3>
            <p className="text-xs text-gray-400 mt-1.5 max-w-md font-medium">
              {searchTerm
                ? "Prueba buscando por otro código de comanda, nombre de cliente o platillo."
                : "¡Todo al día en la cocina! Las nuevas comandas aprobadas aparecerán aquí automáticamente."}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-4 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5 items-start">
            {pedidosFiltrados.map((ped) => {
              const orderId = ped.id || ped.idVenta;
              const isListo = ped.estado === "Listo" || ped.estadoEntrega === "LISTO";
              const isPreparando = ped.estado === "En Preparación" || ped.estadoEntrega === "PREPARANDO";
              const isPendiente = !isListo && !isPreparando;

              const timeInfo = getOrderTimeDisplay(ped, isListo);
              const items = ped.productos || [];

              // Calculate how many items are checked (when order is Listo, all are 100% checked)
              const totalItemsInOrder = items.length;
              const checkedCount = isListo
                ? totalItemsInOrder
                : items.filter((_, idx) => checkedItems[`${orderId}-${idx}`]).length;
              const isAllChecked = totalItemsInOrder > 0 && checkedCount === totalItemsInOrder;

              // Correct Delivery Type & Table derivation
              const rawTipo = String(ped.tipo || ped.tipoEntrega || "").toLowerCase();
              const rawMesa = String(ped.mesa || "").toLowerCase();
              const rawVenta = String(ped.tipoVenta || "").toLowerCase();

              const isDelivery =
                rawTipo.includes("domicilio") || rawVenta.includes("domicilio") || rawMesa.includes("domicilio");
              const isTakeaway =
                rawTipo.includes("llevar") || rawTipo.includes("recoger") || rawMesa.includes("llevar") || rawMesa.includes("recoger");

              let badgeLabel = "En Mesa";
              if (isDelivery) {
                badgeLabel = "Domicilio";
              } else if (isTakeaway) {
                badgeLabel = "Para Llevar";
              } else if (ped.mesa && !["en local", "mesa", "en mesa", ""].includes(rawMesa)) {
                badgeLabel = rawMesa.startsWith("mesa") ? ped.mesa : `Mesa ${ped.mesa}`;
              } else {
                badgeLabel = "En Mesa";
              }

              // By default, tickets are expanded so items are clearly readable in kitchen
              const isExpanded = expandedTickets[orderId] !== false;
              const toggleCollapse = () => setExpandedTickets(prev => ({...prev, [orderId]: isExpanded ? false : true}));

              return (
                <div
                  key={orderId}
                  className={`flex flex-col rounded-3xl bg-white dark:bg-gray-900 border shadow-xs hover:shadow-md transition-all relative overflow-hidden h-auto ${
                    isListo
                      ? "border-green-200 dark:border-green-900/60"
                      : isPreparando
                      ? "border-blue-300 dark:border-blue-800/80 shadow-blue-500/5 ring-1 ring-blue-400/20"
                      : "border-amber-200 dark:border-amber-900/60 ring-1 ring-amber-400/20"
                  }`}
                >
                  {/* Top Status Accent Bar */}
                  <div
                    className={`h-1.5 w-full ${
                      isListo
                        ? "bg-green-500"
                        : isPreparando
                        ? "bg-blue-500 animate-pulse"
                        : "bg-amber-500"
                    }`}
                  />

                  {/* ── Card Header ── */}
                  <div 
                    onClick={toggleCollapse}
                    className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40 shrink-0 space-y-2 cursor-pointer hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-colors"
                    title={isExpanded ? "Clic para colapsar comanda" : "Clic para expandir comanda"}
                  >
                    {/* Row 1: Code, Type Badge & Status */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xl shrink-0">{ped.imagen || "🍽️"}</span>
                        <h3 className="font-black text-gray-900 dark:text-gray-100 text-base tracking-tight truncate">
                          {ped.codigo || `VEN-${String(orderId).padStart(4, "0")}`}
                        </h3>

                        {/* Delivery Type Badge (Properly resolved Domicilio / Para Llevar / Mesa) */}
                        <span
                          className={`px-2 py-0.5 rounded-lg text-[11px] font-black flex items-center gap-1 shrink-0 ${
                            isDelivery
                              ? "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                              : isTakeaway
                              ? "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 border border-orange-200 dark:border-orange-800"
                              : "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                          }`}
                        >
                          {isDelivery ? (
                            <Bike className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                          ) : isTakeaway ? (
                            <ShoppingBag className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                          ) : (
                            <UtensilsCrossed className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          )}
                          <span>{badgeLabel}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* State Badge */}
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-black tracking-wide shrink-0 ${
                            isListo
                              ? "bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                              : isPreparando
                              ? "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 animate-pulse"
                              : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                          }`}
                        >
                          {isListo ? "Listo" : isPreparando ? "En Preparación" : "En Cola"}
                        </span>

                        {/* Toggle Icon */}
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : "rotate-0"}`} />
                      </div>
                    </div>

                    {/* Row 2: Client name & Accurate 12h Time Display */}
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-medium">
                      <div className="flex items-center gap-1.5 truncate max-w-[55%]">
                        <User className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                        <span className="truncate font-bold text-gray-700 dark:text-gray-300">
                          {formatCleanClientName(ped.cliente || ped.responsable)}
                        </span>
                      </div>

                      {/* Accurate Time Pill */}
                      <div
                        className={`px-2 py-0.5 rounded-md text-[11px] font-black flex items-center gap-1 border shrink-0 ${
                          timeInfo.isCompleted
                            ? "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300 border-green-200 dark:border-green-800/60"
                            : timeInfo.level === "critical"
                            ? "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 border-red-200 dark:border-red-800 animate-pulse"
                            : timeInfo.level === "warning"
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                        }`}
                        title={`Hora comanda: ${timeInfo.exactTime || ped.horaInicio || "Reciente"}`}
                      >
                        <Clock className="w-3 h-3" />
                        <span>{timeInfo.text}</span>
                      </div>
                    </div>

                    {/* Preparation Checklist Progress Bar */}
                    {totalItemsInOrder > 0 && (
                      <div className="pt-0.5">
                        <div className="flex items-center justify-between text-[10px] font-black text-gray-400 mb-1">
                          <span>
                            {isListo
                              ? "✅ Comanda completada al 100%"
                              : isAllChecked
                              ? "🎉 ¡Todos los platillos cocinados!"
                              : "Progreso de preparación"}
                          </span>
                          <span
                            className={
                              isListo || isAllChecked
                                ? "text-green-600 dark:text-green-400 font-extrabold"
                                : "text-gray-600 dark:text-gray-300"
                            }
                          >
                            {checkedCount} de {totalItemsInOrder} ({Math.round((checkedCount / totalItemsInOrder) * 100)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              isListo || isAllChecked ? "bg-green-500" : "bg-[#F05454]"
                            }`}
                            style={{ width: `${(checkedCount / totalItemsInOrder) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ── Card Body (Scrollable Items List) ── */}
                  {isExpanded && (
                  <div className="p-4 space-y-2.5 max-h-72 overflow-y-auto flex-1">
                    {items.length === 0 ? (
                      <p className="text-xs text-gray-400 italic text-center py-6">Sin platillos desglosados en orden</p>
                    ) : (
                      items.map((prod, idx) => {
                        // When order is Listo, all items are displayed as completed
                        const isChecked = isListo ? true : Boolean(checkedItems[`${orderId}-${idx}`]);
                        const noteText = cleanNote(
                          prod.observaciones || prod.observacion || prod.nota || prod.especificaciones,
                          prod.nombre
                        );

                        return (
                          <div
                            key={idx}
                            className={`p-3 rounded-2xl border transition-all text-xs ${
                              isChecked
                                ? "bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-900/40 opacity-80"
                                : "bg-gray-50/80 dark:bg-gray-800/50 border-gray-200/80 dark:border-gray-800/80 hover:border-gray-300 dark:hover:border-gray-700"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              {/* Left: Checkbox & Name */}
                              <div
                                onClick={() => toggleItemCheck(orderId, idx, ped.estado)}
                                className={`flex items-start gap-2 flex-1 select-none ${
                                  isListo ? "cursor-default" : "cursor-pointer"
                                }`}
                                title={
                                  isListo
                                    ? "Comanda ya lista para entrega"
                                    : isChecked
                                    ? "Clic para desmarcar platillo"
                                    : "Clic para marcar platillo como preparado"
                                }
                              >
                                <button
                                  type="button"
                                  disabled={isListo}
                                  className={`mt-0.5 shrink-0 transition-colors ${
                                    isChecked
                                      ? "text-green-600 dark:text-green-400"
                                      : "text-gray-300 dark:text-gray-600 hover:text-gray-400"
                                  }`}
                                >
                                  {isChecked ? (
                                    <CheckCircle2 className="w-4 h-4 fill-green-100 dark:fill-green-950" />
                                  ) : (
                                    <Circle className="w-4 h-4" />
                                  )}
                                </button>

                                <div>
                                  <p
                                    className={`font-black text-sm text-gray-900 dark:text-gray-100 leading-snug ${
                                      isChecked ? "line-through text-gray-500 dark:text-gray-400" : ""
                                    }`}
                                  >
                                    <span className="inline-block px-1.5 py-0.5 rounded-md bg-[#F05454]/10 text-[#F05454] text-xs font-black mr-1.5">
                                      {prod.cantidad}x
                                    </span>
                                    {prod.nombre}
                                  </p>
                                </div>
                              </div>

                              {/* Right: Receta Button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  verReceta(ped, prod);
                                }}
                                className="px-2 py-1 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-[#F05454] rounded-lg text-[11px] font-black transition shrink-0 flex items-center gap-1 cursor-pointer border border-red-100 dark:border-red-900/40 shadow-2xs"
                                title="Ver receta y proporciones"
                              >
                                <BookOpen className="w-3 h-3" />
                                <span>Receta</span>
                              </button>
                            </div>

                            {/* Extra Additions Pills */}
                            {Array.isArray(prod.adiciones) && prod.adiciones.length > 0 && (
                              <div className="mt-2 pl-6 space-y-1">
                                <span className="text-[10px] font-black text-red-500 uppercase tracking-wider">
                                  Adiciones Extra:
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {prod.adiciones.map((rawAd, i) => {
                                    const ad = parseAddition(rawAd);
                                    const isMulti = ad.qty > 1;

                                    return (
                                      <span
                                        key={i}
                                        className={`px-2 py-0.5 border text-xs font-black rounded-lg flex items-center gap-1 shadow-2xs transition-all ${
                                          isMulti
                                            ? "bg-red-500 text-white border-red-600 dark:bg-red-600 dark:border-red-700 ring-2 ring-red-300/60 dark:ring-red-900/60"
                                            : "bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-900/60 text-[#F05454] dark:text-red-300"
                                        }`}
                                      >
                                        {isMulti ? (
                                          <span className="bg-white text-red-700 dark:bg-gray-900 dark:text-red-300 px-1.5 py-0.2 rounded-md text-[10.5px] font-black tracking-tight shadow-2xs">
                                            {ad.qty}x
                                          </span>
                                        ) : (
                                          <span className="opacity-70 font-black text-[11px]">+</span>
                                        )}
                                        <span className="text-xs">{getAdditionEmoji(ad.name, rawAd?.imagen)}</span>
                                        <span className={isMulti ? "font-black" : "font-extrabold"}>{ad.name}</span>
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Clean Customer Note */}
                            {noteText && (
                              <div className="mt-2 ml-6 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 p-2 rounded-xl text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-1.5">
                                <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-black text-amber-700 dark:text-amber-400">Nota: </span>
                                  <span className="font-medium italic">"{noteText}"</span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}

                    {/* General Order Observation if present */}
                    {cleanNote(ped.observaciones) && (
                      <div className="p-2.5 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/50 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-1.5">
                        <FileText className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-black text-amber-800 dark:text-amber-300">Observación General: </span>
                          <span className="font-semibold">{cleanNote(ped.observaciones)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  )}

                  {/* ── Card Footer (Pinned & Actionable) ── */}
                  <div className="p-3.5 bg-gray-50/80 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 shrink-0">
                    {isPendiente && (
                      <button
                        type="button"
                        onClick={() => cambiarEstado(orderId, "En Preparación")}
                        className="w-full py-3 bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-white rounded-2xl text-xs font-black transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Clock className="w-4 h-4" />
                        <span>Iniciar Preparación</span>
                      </button>
                    )}

                    {isPreparando && (
                      <button
                        type="button"
                        onClick={() => cambiarEstado(orderId, "Listo")}
                        className={`w-full py-3 text-white rounded-2xl text-xs font-black transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
                          isAllChecked
                            ? "bg-green-600 hover:bg-green-700 ring-2 ring-green-400/50 animate-pulse"
                            : "bg-green-600 hover:bg-green-700 active:scale-[0.99]"
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isAllChecked ? "¡Todo Listo! Marcar Comanda" : "Marcar como Listo"}</span>
                      </button>
                    )}

                    {isListo && (
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 py-2.5 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900/40 rounded-xl text-center text-xs font-black text-green-700 dark:text-green-300 flex items-center justify-center gap-1.5">
                          <CheckCheck className="w-4 h-4 text-green-600" />
                          <span>¡Listo para entregar!</span>
                        </div>

                        {/* Reopen button */}
                        <button
                          type="button"
                          onClick={() => cambiarEstado(orderId, "En Preparación")}
                          className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1"
                          title="Volver a poner en preparación si se necesita ajustar"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span className="text-[11px]">Reabrir</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ── Receta / Ficha Técnica Modal ── */}
      {productoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-gray-800 animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/50 text-[#F05454] flex items-center justify-center font-bold text-lg shrink-0 border border-red-100 dark:border-red-900/40">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 dark:text-gray-100 text-base">
                    {productoSeleccionado.nombre}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    ⏱️ Tiempo estimado: {modalRecetaData?.tiempoPreparacion || "12 min"} • Rendimiento:{" "}
                    {modalRecetaData?.rendimiento || "1 porción"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setProductoSeleccionado(null);
                  setModalRecetaData(null);
                }}
                className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {loadingReceta ? (
                <div className="py-8 text-center">
                  <RefreshCw className="w-6 h-6 text-[#F05454] animate-spin mx-auto mb-2" />
                  <p className="text-xs text-gray-500 font-bold">Cargando ficha técnica...</p>
                </div>
              ) : (
                <>
                  {/* Ingredients List */}
                  <div>
                    <h4 className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5">
                      🥘 Ingredientes & Porciones Requeridas:
                    </h4>
                    {modalRecetaData?.ingredientes && modalRecetaData.ingredientes.length > 0 ? (
                      <div className="space-y-1.5">
                        {modalRecetaData.ingredientes.map((ing, i) => (
                          <div
                            key={i}
                            className="text-xs sm:text-sm flex justify-between items-center p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700/50"
                          >
                            <span className="font-semibold">{ing.nombre}</span>
                            <span className="font-black text-[#F05454] dark:text-red-400 bg-white dark:bg-gray-900 px-2 py-0.5 rounded-lg text-xs shadow-2xs border border-gray-100 dark:border-gray-800">
                              {ing.cantidad}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">No hay ingredientes desglosados en esta ficha técnica.</p>
                    )}
                  </div>

                  {/* Step-by-step preparation */}
                  <div>
                    <h4 className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5">
                      👨‍🍳 Procedimiento de Preparación:
                    </h4>
                    {modalRecetaData?.pasos && modalRecetaData.pasos.length > 0 ? (
                      <ol className="space-y-2 list-decimal list-inside text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                        {modalRecetaData.pasos.map((paso, i) => (
                          <li key={i} className="leading-relaxed pl-1 py-0.5">
                            <span className="font-medium">{paso}</span>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="text-xs text-gray-400 italic">Preparar según estándar de cocina de la casa.</p>
                    )}
                  </div>

                  {/* Specifications or storage if present */}
                  {modalRecetaData?.especificaciones && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 rounded-xl text-xs text-blue-900 dark:text-blue-300">
                      <span className="font-bold">Especificaciones:</span> {modalRecetaData.especificaciones}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setProductoSeleccionado(null);
                  setModalRecetaData(null);
                }}
                className="px-5 py-2 bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-white dark:text-gray-900 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
