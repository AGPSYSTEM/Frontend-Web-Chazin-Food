import { useState, useEffect } from "react";
import {
  X,
  AlertTriangle,
  Package,
  Calendar,
  Clock,
  DollarSign,
  ArrowRightLeft,
  CheckCircle2,
  HelpCircle,
  Truck,
  RotateCcw,
  Layers,
  ChevronDown,
  ChevronUp,
  Tag,
  FileText,
  BadgeAlert,
  Wallet,
  Sparkles,
  RefreshCw,
  Info
} from "lucide-react";
import { insumosService } from "../../servicios/insumosService";

// Tipos de operaciones disponibles
const TIPOS_OPERACION = [
  {
    id: "CAMBIO_PRODUCTO",
    label: "Cambio de Producto",
    subtext: "Regreso unos productos y me entregan otros",
    icon: ArrowRightLeft,
    color: "from-blue-500 to-indigo-600",
    bgActive: "bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-700 dark:text-blue-300",
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
  },
  {
    id: "PRODUCTO_VENCIDO",
    label: "Producto Vencido / Averiado",
    subtext: "Devolución o baja por caducidad o mal estado",
    icon: BadgeAlert,
    color: "from-amber-500 to-orange-600",
    bgActive: "bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-800 dark:text-amber-300",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
  },
  {
    id: "REEMBOLSO_DINERO",
    label: "Reembolso de Dinero",
    subtext: "Devolución con restitución monetaria o saldo a favor",
    icon: Wallet,
    color: "from-emerald-500 to-teal-600",
    bgActive: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-300",
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
  },
  {
    id: "DEVOLUCION_PARCIAL",
    label: "Devolución Parcial",
    subtext: "Ajuste de ítems específicos o excedentes",
    icon: RotateCcw,
    color: "from-purple-500 to-pink-600",
    bgActive: "bg-purple-50 dark:bg-purple-950/40 border-purple-500 text-purple-800 dark:text-purple-300",
    badge: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300"
  },
  {
    id: "ANULACION_ADMINISTRATIVA",
    label: "Anulación Administrativa",
    subtext: "Orden duplicada, error en factura o digitación",
    icon: FileText,
    color: "from-red-500 to-rose-600",
    bgActive: "bg-red-50 dark:bg-red-950/40 border-red-500 text-red-800 dark:text-red-300",
    badge: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
  }
];

// Opciones rápidas de motivo individual por insumo
const MOTIVOS_INSUMO_OPCIONES = [
  "Producto vencido o próximo a caducar",
  "Empaque roto / averiado",
  "Cambio por otra referencia",
  "Cantidad o peso no conforme",
  "Mala calidad / no cumple estándar",
  "No solicitado / sobrante",
  "Otro motivo específico"
];

// Acciones individuales
const ACCIONES_INSUMO = [
  { id: "REEMBOLSO", label: "Devolución con reembolso $" },
  { id: "CAMBIO", label: "Cambio por otro producto" },
  { id: "BAJA", label: "Baja / Merma (desecho)" },
  { id: "DEVOLUCION_SIMPLE", label: "Devolución física al proveedor" }
];

export function CancelarCompraModal({ isOpen, onClose, compra, onConfirm }) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [catalogoInsumos, setCatalogoInsumos] = useState([]);

  // Estado general de la operación
  const [tipoOperacion, setTipoOperacion] = useState("PRODUCTO_VENCIDO");
  const [fechaDevolucion, setFechaDevolucion] = useState("");
  const [horaDevolucion, setHoraDevolucion] = useState("");
  const [estadoMercancia, setEstadoMercancia] = useState("RECIBIDO"); // RECIBIDO | EN_PROCESO | PENDIENTE
  const [estadoDinero, setEstadoDinero] = useState("REEMBOLSADO"); // REEMBOLSADO | ENTREGA_INMEDIATA | EN_PROCESO | SALDO_A_FAVOR | NO_APLICA
  const [montoReembolso, setMontoReembolso] = useState("");
  const [metodoReembolso, setMetodoReembolso] = useState("Efectivo");
  const [motivoGeneral, setMotivoGeneral] = useState("");
  const [observaciones, setObservaciones] = useState("");

  // Estado por cada ítem: { [idx]: { cantidad, motivo, accion, cambioInsumoId, cambioInsumoNombre, cambioCantidad, cambioUnidad, observacion } }
  const [itemsConfig, setItemsConfig] = useState({});
  const [expandedItems, setExpandedItems] = useState({});

  // Cargar catálogo de insumos para permitir seleccionar productos de cambio
  useEffect(() => {
    if (isOpen) {
      insumosService.getInsumos()
        .then((res) => {
          const list = Array.isArray(res) ? res : (res?.data || res?.insumos || []);
          setCatalogoInsumos(list);
        })
        .catch((err) => {
          console.warn("[CancelarCompraModal] No se pudo cargar catálogo de insumos:", err?.message);
        });
    }
  }, [isOpen]);

  // Inicializar o rellenar el formulario al abrir
  useEffect(() => {
    if (!isOpen || !compra) return;

    setErrorMsg("");
    const yaCancelada = String(compra.estado || "").toUpperCase() === "CANCELADA" || String(compra.estado || "").toUpperCase() === "ANULADA";

    // Intentar leer datos previos si ya existía una cancelación previa
    let prevData = null;
    if (compra.detallesCancelacion) {
      try {
        prevData = typeof compra.detallesCancelacion === "string"
          ? JSON.parse(compra.detallesCancelacion)
          : compra.detallesCancelacion;
      } catch (_) {
        prevData = null;
      }
    }

    const now = new Date();
    const hoyStr = now.toISOString().split("T")[0];
    const horaStr = now.toTimeString().slice(0, 5);

    // Si ya tiene datos previos estructurados
    if (prevData && typeof prevData === "object" && !Array.isArray(prevData)) {
      setTipoOperacion(prevData.tipoOperacion || "PRODUCTO_VENCIDO");
      setFechaDevolucion(prevData.fecha || hoyStr);
      setHoraDevolucion(prevData.hora || horaStr);
      setEstadoMercancia(prevData.estadoMercancia || "RECIBIDO");
      setEstadoDinero(prevData.estadoDinero || "REEMBOLSADO");
      setMontoReembolso(prevData.montoReembolsado !== undefined ? String(prevData.montoReembolsado) : "");
      setMetodoReembolso(prevData.metodoReembolso || "Efectivo");
      setMotivoGeneral(prevData.motivoGeneral || compra.motivoCancelacion || "");
      setObservaciones(prevData.observaciones || "");

      // Reconstruir configuración de ítems
      const initialItems = {};
      const itemsList = prevData.items || [];
      const detallesOriginales = compra.detalles || [];

      detallesOriginales.forEach((d, idx) => {
        const itemGuardado = itemsList.find(it => it.idInsumo === d.idInsumo) || itemsList[idx];
        const cantOrig = parseFloat(d.cantidad) || 0;
        if (itemGuardado) {
          initialItems[idx] = {
            cantidad: String(itemGuardado.cantidadCancelada !== undefined ? itemGuardado.cantidadCancelada : cantOrig),
            motivo: itemGuardado.motivoIndividual || "Producto vencido o próximo a caducar",
            accion: itemGuardado.tipoAccion || "REEMBOLSO",
            cambioInsumoId: itemGuardado.insumoReemplazoId || "",
            cambioInsumoNombre: itemGuardado.insumoReemplazoNombre || "",
            cambioCantidad: itemGuardado.cantidadReemplazo !== undefined ? String(itemGuardado.cantidadReemplazo) : "",
            cambioUnidad: itemGuardado.unidadReemplazo || d.insumo?.unidadMedida || "",
            observacion: itemGuardado.observacionIndividual || ""
          };
        } else {
          initialItems[idx] = {
            cantidad: String(cantOrig),
            motivo: "Producto vencido o próximo a caducar",
            accion: "REEMBOLSO",
            cambioInsumoId: "",
            cambioInsumoNombre: "",
            cambioCantidad: "",
            cambioUnidad: d.insumo?.unidadMedida || "",
            observacion: ""
          };
        }
      });
      setItemsConfig(initialItems);
    } else {
      // Nueva cancelación o datos antiguos en array plano
      const initialItems = {};
      const detallesOriginales = compra.detalles || [];
      const itemsArray = Array.isArray(prevData) ? prevData : [];

      let fechaInit = hoyStr;
      let horaInit = horaStr;
      if (compra.fechaCancelacion) {
        try {
          const fc = new Date(compra.fechaCancelacion);
          if (!isNaN(fc.getTime())) {
            fechaInit = fc.toISOString().split("T")[0];
            horaInit = fc.toTimeString().slice(0, 5);
          }
        } catch (_) {}
      }

      setTipoOperacion("PRODUCTO_VENCIDO");
      setFechaDevolucion(fechaInit);
      setHoraDevolucion(horaInit);
      setEstadoMercancia("RECIBIDO");
      setEstadoDinero("REEMBOLSADO");
      setMetodoReembolso("Efectivo");
      setMotivoGeneral(compra.motivoCancelacion || "");
      setObservaciones("");

      let sumaDev = 0;
      detallesOriginales.forEach((d, idx) => {
        const itemViejo = itemsArray.find(it => it.idInsumo === d.idInsumo) || itemsArray[idx];
        const cantOrig = parseFloat(d.cantidad) || 0;
        const cantCanc = itemViejo ? (parseFloat(itemViejo.cantidadCancelada) || 0) : cantOrig;
        sumaDev += cantCanc * (parseFloat(d.precioUnitario) || 0);

        initialItems[idx] = {
          cantidad: String(cantCanc),
          motivo: itemViejo?.motivoIndividual || "Producto vencido o próximo a caducar",
          accion: itemViejo?.tipoAccion || "REEMBOLSO",
          cambioInsumoId: itemViejo?.insumoReemplazoId || "",
          cambioInsumoNombre: itemViejo?.insumoReemplazoNombre || "",
          cambioCantidad: itemViejo?.cantidadReemplazo ? String(itemViejo.cantidadReemplazo) : "",
          cambioUnidad: itemViejo?.unidadReemplazo || d.insumo?.unidadMedida || "",
          observacion: itemViejo?.observacionIndividual || ""
        };
      });

      setMontoReembolso(String(sumaDev));
      setItemsConfig(initialItems);
    }
  }, [isOpen, compra]);

  if (!isOpen || !compra) return null;

  const esEdicion = String(compra.estado || "").toUpperCase() === "CANCELADA" || String(compra.estado || "").toUpperCase() === "ANULADA";
  const detalles = compra.detalles || [];

  // Calcular totales en tiempo real
  const totalOriginalCompra = parseFloat(compra.total || 0);

  const subtotalRevertirCalculado = detalles.reduce((sum, d, idx) => {
    const cfg = itemsConfig[idx];
    const cant = parseFloat(cfg?.cantidad) || 0;
    const precio = parseFloat(d.precioUnitario) || 0;
    return sum + cant * precio;
  }, 0);

  const totalItemsAfectados = detalles.filter((d, idx) => {
    const cant = parseFloat(itemsConfig[idx]?.cantidad) || 0;
    return cant > 0;
  }).length;

  const handleUpdateItem = (idx, field, value) => {
    setItemsConfig(prev => ({
      ...prev,
      [idx]: {
        ...prev[idx],
        [field]: value
      }
    }));
  };

  const handleToggleExpand = (idx) => {
    setExpandedItems(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Guardar / Confirmar la anulación o edición
  const handleConfirm = async () => {
    if (!motivoGeneral.trim()) {
      setErrorMsg("Por favor ingresa o selecciona el motivo general de la devolución / cancelación.");
      return;
    }

    if (totalItemsAfectados === 0 && !esEdicion) {
      setErrorMsg("Debes especificar al menos un insumo con cantidad mayor a 0 para devolver.");
      return;
    }

    setErrorMsg("");
    setLoading(true);

    try {
      // Construir snapshot detallado
      const itemsSnapshot = detalles.map((d, idx) => {
        const cfg = itemsConfig[idx] || {};
        const cantCanc = parseFloat(cfg.cantidad) || 0;
        const cantOrig = parseFloat(d.cantidad) || 0;
        const precioUnit = parseFloat(d.precioUnitario) || 0;

        return {
          idInsumo: d.idInsumo,
          nombre: d.insumo?.nombre || `Insumo #${d.idInsumo}`,
          unidadMedida: d.insumo?.unidadMedida || "",
          cantidadOriginal: cantOrig,
          cantidadCancelada: cantCanc,
          precioUnitario: precioUnit,
          subtotal: cantCanc * precioUnit,
          motivoIndividual: cfg.motivo || "Producto vencido o próximo a caducar",
          tipoAccion: cfg.accion || "REEMBOLSO",
          insumoReemplazoId: cfg.accion === "CAMBIO" ? (cfg.cambioInsumoId || null) : null,
          insumoReemplazoNombre: cfg.accion === "CAMBIO" ? (cfg.cambioInsumoNombre || "") : "",
          cantidadReemplazo: cfg.accion === "CAMBIO" ? (parseFloat(cfg.cambioCantidad) || 0) : null,
          unidadReemplazo: cfg.accion === "CAMBIO" ? (cfg.cambioUnidad || "") : "",
          observacionIndividual: cfg.observacion || "",
          lotes: d.lotes || []
        };
      });

      // Estructura maestra enriquecida
      const gestionCompleta = {
        tipoOperacion,
        fecha: fechaDevolucion,
        hora: horaDevolucion,
        motivoGeneral: motivoGeneral.trim(),
        estadoMercancia,
        estadoDinero,
        montoReembolsado: parseFloat(montoReembolso) || 0,
        metodoReembolso: estadoDinero !== "NO_APLICA" ? metodoReembolso : "No aplica",
        observaciones: observaciones.trim(),
        subtotalRevertido: subtotalRevertirCalculado,
        items: itemsSnapshot,
        actualizadoEn: new Date().toISOString()
      };

      // Combinar fecha y hora para la columna fechaCancelacion
      let fechaIso = new Date().toISOString();
      if (fechaDevolucion) {
        const horaPart = horaDevolucion || "12:00";
        const combined = new Date(`${fechaDevolucion}T${horaPart}:00`);
        if (!isNaN(combined.getTime())) {
          fechaIso = combined.toISOString();
        }
      }

      const payload = {
        motivo: motivoGeneral.trim(),
        detallesCancelacion: gestionCompleta,
        fechaCancelacion: fechaIso,
        // Cantidades para ajuste parcial de stock en caso de nueva cancelación
        cantidadesAjuste: itemsSnapshot.map(d => ({
          idInsumo: d.idInsumo,
          cantidadCancelada: d.cantidadCancelada
        }))
      };

      const ok = await onConfirm(compra.id || compra.idCompra, payload, esEdicion);
      if (ok) {
        onClose();
      }
    } catch (err) {
      console.error("[CancelarCompraModal] Error:", err);
      setErrorMsg(err.message || "Ocurrió un error al procesar la cancelación.");
    } finally {
      setLoading(false);
    }
  };

  const tipoActualInfo = TIPOS_OPERACION.find(t => t.id === tipoOperacion) || TIPOS_OPERACION[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800">
        
        {/* ── HEADER ── */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0 bg-gradient-to-r from-red-50/80 via-white to-orange-50/60 dark:from-gray-900 dark:via-gray-900 dark:to-gray-850">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F05454] to-red-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-red-500/20">
              <RotateCcw className="w-6 h-6 stroke-[2.3]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {esEdicion ? "Editar Gestión de Devolución / Cancelación" : "Gestión de Cancelación, Devolución y Reembolso"}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/50">
                  {compra.numeroFactura || `OC-${compra.id}`}
                </span>
                {esEdicion && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                    Modo Edición
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Proveedor: <strong className="text-gray-700 dark:text-gray-200">{compra.proveedorNombre || "Sin proveedor"}</strong> • Total compra original: <strong className="text-gray-700 dark:text-gray-200">${totalOriginalCompra.toLocaleString("es-CO")}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── CUERPO CON SCROLL ── */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* Banner de información contextual */}
          <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 flex items-start gap-3 text-xs text-blue-900 dark:text-blue-300">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Control Completo de Devoluciones:</strong> Configura el tipo de trámite (cambio 1x1, productos vencidos, reembolso económico o devolución parcial), registra los tiempos exactos, estados de entrega/dinero y especifica por cada insumo la acción tomada.
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              1. SELECTOR DEL TIPO DE OPERACIÓN
          ══════════════════════════════════════════════════════════════════ */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              1. Tipo de Gestión / Cancelación <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {TIPOS_OPERACION.map((op) => {
                const IconOp = op.icon;
                const isSelected = tipoOperacion === op.id;
                return (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => {
                      setTipoOperacion(op.id);
                      // Ajustes automáticos inteligentes según el tipo
                      if (op.id === "CAMBIO_PRODUCTO") {
                        setEstadoDinero("NO_APLICA");
                        setMotivoGeneral("Cambio de producto por otra referencia con el proveedor");
                      } else if (op.id === "PRODUCTO_VENCIDO") {
                        setMotivoGeneral("Devolución por producto vencido o en mal estado");
                      } else if (op.id === "REEMBOLSO_DINERO") {
                        setEstadoDinero("REEMBOLSADO");
                        setMotivoGeneral("Devolución con reembolso de dinero pactado");
                      }
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? `${op.bgActive} border-2 shadow-sm shadow-blue-500/10`
                        : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-850"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected ? "bg-white dark:bg-gray-800 shadow-xs" : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                    }`}>
                      <IconOp className={`w-4 h-4 ${isSelected ? "text-[#F05454]" : "text-gray-500"}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold leading-tight">{op.label}</div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                        {op.subtext}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              2. FECHAS, HORAS Y ESTADOS DE ENTREGA / REEMBOLSO
          ══════════════════════════════════════════════════════════════════ */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-850 border border-gray-100 dark:border-gray-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                2. Tiempos y Estados Operativos
              </span>
              <span className="text-[11px] text-gray-400">Totalmente editables en cualquier momento</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Fecha */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  Fecha de Devolución
                </label>
                <input
                  type="date"
                  value={fechaDevolucion}
                  onChange={(e) => setFechaDevolucion(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-[#F05454] focus:border-transparent font-medium"
                />
              </div>

              {/* Hora */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-gray-400" />
                  Hora del Movimiento
                </label>
                <input
                  type="time"
                  value={horaDevolucion}
                  onChange={(e) => setHoraDevolucion(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-[#F05454] focus:border-transparent font-medium"
                />
              </div>

              {/* Estado de Mercancía / Productos */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                  <Truck className="w-3 h-3 text-blue-500" />
                  Estado de los Productos
                </label>
                <select
                  value={estadoMercancia}
                  onChange={(e) => setEstadoMercancia(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-[#F05454] focus:border-transparent font-medium cursor-pointer"
                >
                  <option value="RECIBIDO">✅ Ya se recibieron / Entregados</option>
                  <option value="EN_PROCESO">⏳ En proceso de recibirlos</option>
                  <option value="PENDIENTE">📦 Pendiente de recolección</option>
                </select>
              </div>

              {/* Estado del Dinero / Reembolso */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                  <Wallet className="w-3 h-3 text-emerald-500" />
                  Estado del Dinero / Reembolso
                </label>
                <select
                  value={estadoDinero}
                  onChange={(e) => setEstadoDinero(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-[#F05454] focus:border-transparent font-medium cursor-pointer"
                >
                  <option value="REEMBOLSADO">💵 Dinero ya reembolsado</option>
                  <option value="ENTREGA_INMEDIATA">⚡ Reembolso inmediato acordado</option>
                  <option value="EN_PROCESO">⏳ En proceso de reembolso</option>
                  <option value="SALDO_A_FAVOR">🎟️ Saldo a favor (Nota de crédito)</option>
                  <option value="NO_APLICA">⛔ No aplica (solo cambio de insumos)</option>
                </select>
              </div>
            </div>

            {/* Datos específicos de reembolso de dinero */}
            {estadoDinero !== "NO_APLICA" && (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-800 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-emerald-500" />
                      Monto Reembolsado / a Devolver ($)
                    </label>
                    <button
                      type="button"
                      onClick={() => setMontoReembolso(String(subtotalRevertirCalculado))}
                      className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
                    >
                      Autocalcular (${subtotalRevertirCalculado.toLocaleString("es-CO")})
                    </button>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={montoReembolso}
                    onChange={(e) => setMontoReembolso(e.target.value)}
                    placeholder="Ej: 50000"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-700 dark:text-emerald-300"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Método de Pago / Reembolso
                  </label>
                  <select
                    value={metodoReembolso}
                    onChange={(e) => setMetodoReembolso(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-[#F05454] font-medium cursor-pointer"
                  >
                    <option value="Efectivo">Efectivo en caja</option>
                    <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                    <option value="Nequi / Daviplata">Nequi / Daviplata</option>
                    <option value="Nota de Crédito">Nota de Crédito con Proveedor</option>
                    <option value="Saldo a Favor">Saldo a Favor para próxima compra</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              3. ESPECIFICACIONES INDIVIDUALES POR CADA INSUMO
          ══════════════════════════════════════════════════════════════════ */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-[#F05454]" />
                3. Especificaciones y Acciones Individuales por Insumo ({detalles.length})
              </label>
              <div className="text-xs text-gray-500">
                Afectando <strong className="text-red-600">{totalItemsAfectados} de {detalles.length}</strong> insumo(s) • Subtotal: <strong className="text-red-600">${subtotalRevertirCalculado.toLocaleString("es-CO")}</strong>
              </div>
            </div>

            <div className="border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900 shadow-xs">
              {detalles.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-400">
                  No hay insumos registrados en esta compra.
                </div>
              ) : (
                detalles.map((d, idx) => {
                  const cfg = itemsConfig[idx] || {};
                  const insumoNombre = d.insumo?.nombre || `Insumo #${d.idInsumo}`;
                  const unidadMedida = d.insumo?.unidadMedida || "";
                  const cantOriginal = parseFloat(d.cantidad) || 0;
                  const cantCanc = parseFloat(cfg.cantidad) || 0;
                  const precioUnit = parseFloat(d.precioUnitario) || 0;
                  const subtotalCanc = cantCanc * precioUnit;
                  const isExpanded = !!expandedItems[idx];
                  const esCambio = cfg.accion === "CAMBIO" || tipoOperacion === "CAMBIO_PRODUCTO";

                  return (
                    <div key={idx} className="p-4 transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-850/50">
                      
                      {/* Fila principal del insumo */}
                      <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
                              {insumoNombre}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium text-[10px]">
                              Comprado: {cantOriginal} {unidadMedida} (${precioUnit.toLocaleString("es-CO")}/u)
                            </span>
                            {cantCanc > 0 && (
                              <span className="px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 font-bold text-[10px]">
                                Cancelando: {cantCanc} {unidadMedida}
                              </span>
                            )}
                          </div>

                          {/* Controles de Cantidad */}
                          <div className="flex items-center gap-2.5 mt-2 flex-wrap">
                            <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">
                              Cantidad a devolver:
                            </span>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="0"
                                max={cantOriginal}
                                step="0.01"
                                value={cfg.cantidad ?? cantOriginal}
                                onChange={(e) => {
                                  const val = Math.min(
                                    Math.max(0, parseFloat(e.target.value) || 0),
                                    cantOriginal
                                  );
                                  handleUpdateItem(idx, "cantidad", String(val));
                                }}
                                className="w-20 px-2 py-1 text-xs border border-red-300 dark:border-red-800 bg-white dark:bg-gray-800 dark:text-gray-100 rounded-lg text-center font-bold text-red-700 dark:text-red-300 focus:ring-2 focus:ring-red-400"
                              />
                              <span className="text-[10px] text-gray-400">{unidadMedida}</span>
                            </div>

                            {/* Botones de acción rápida */}
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleUpdateItem(idx, "cantidad", "0")}
                                className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 font-medium transition-colors"
                              >
                                0
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateItem(idx, "cantidad", String(cantOriginal / 2))}
                                className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 font-medium transition-colors"
                              >
                                Mitad
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateItem(idx, "cantidad", String(cantOriginal))}
                                className="px-1.5 py-0.5 rounded text-[10px] bg-red-100 dark:bg-red-900/40 hover:bg-red-200 text-red-700 dark:text-red-300 font-bold transition-colors"
                              >
                                Todo
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleToggleExpand(idx)}
                              className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 ml-2 font-medium"
                            >
                              {isExpanded ? "Ocultar detalles individuales" : "Configurar motivo, acción y reemplazo"}
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>

                        {/* Subtotal del ítem */}
                        <div className="text-right shrink-0">
                          <div className="text-xs font-bold text-red-600 dark:text-red-400">
                            -${subtotalCanc.toLocaleString("es-CO")}
                          </div>
                          <div className="text-[10px] text-gray-400">
                            Reverso de inventario
                          </div>
                        </div>
                      </div>

                      {/* Configuración detallada e individual expandida */}
                      {(isExpanded || cantCanc > 0) && (
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800/80 space-y-3 bg-gray-50/70 dark:bg-gray-850/40 p-3.5 rounded-xl">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Motivo Individual */}
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                                Motivo individual para este insumo
                              </label>
                              <select
                                value={cfg.motivo || MOTIVOS_INSUMO_OPCIONES[0]}
                                onChange={(e) => handleUpdateItem(idx, "motivo", e.target.value)}
                                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-[#F05454]"
                              >
                                {MOTIVOS_INSUMO_OPCIONES.map((m, mIdx) => (
                                  <option key={mIdx} value={m}>{m}</option>
                                ))}
                              </select>
                            </div>

                            {/* Acción Individual */}
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                                Acción / Solución para este insumo
                              </label>
                              <select
                                value={cfg.accion || "REEMBOLSO"}
                                onChange={(e) => handleUpdateItem(idx, "accion", e.target.value)}
                                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-[#F05454]"
                              >
                                {ACCIONES_INSUMO.map(ac => (
                                  <option key={ac.id} value={ac.id}>{ac.label}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* SECCIÓN ESPECIAL: SI ES CAMBIO POR OTRO PRODUCTO */}
                          {(cfg.accion === "CAMBIO" || tipoOperacion === "CAMBIO_PRODUCTO") && (
                            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 space-y-2">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 dark:text-blue-300">
                                <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                Producto que se entrega a cambio (Reemplazo / Canje)
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                {/* Selector del insumo que entregan a cambio */}
                                <div className="sm:col-span-2">
                                  <label className="block text-[10px] font-semibold text-blue-800 dark:text-blue-400 mb-0.5">
                                    ¿Por cuál producto lo cambian?
                                  </label>
                                  <select
                                    value={cfg.cambioInsumoId || ""}
                                    onChange={(e) => {
                                      const selectedId = e.target.value;
                                      const found = catalogoInsumos.find(ins => String(ins.id || ins.idInsumo) === selectedId);
                                      handleUpdateItem(idx, "cambioInsumoId", selectedId);
                                      if (found) {
                                        handleUpdateItem(idx, "cambioInsumoNombre", found.nombre);
                                        handleUpdateItem(idx, "cambioUnidad", found.unidadMedida || unidadMedida);
                                      }
                                    }}
                                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-800 dark:text-gray-100"
                                  >
                                    <option value="">-- Selecciona producto de reemplazo --</option>
                                    {catalogoInsumos.map((ins) => (
                                      <option key={ins.id || ins.idInsumo} value={ins.id || ins.idInsumo}>
                                        {ins.nombre} ({ins.unidadMedida || "Unidad"})
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* Cantidad que entregan a cambio */}
                                <div>
                                  <label className="block text-[10px] font-semibold text-blue-800 dark:text-blue-400 mb-0.5">
                                    Cantidad recibida
                                  </label>
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={cfg.cambioCantidad ?? cantCanc}
                                      onChange={(e) => handleUpdateItem(idx, "cambioCantidad", e.target.value)}
                                      placeholder={String(cantCanc)}
                                      className="w-full px-2 py-1 text-xs rounded-lg border border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-800 text-center font-bold text-blue-900 dark:text-blue-200"
                                    />
                                    <span className="text-[10px] text-blue-600 dark:text-blue-400 shrink-0 font-medium">
                                      {cfg.cambioUnidad || unidadMedida}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Observación individual */}
                          <div>
                            <input
                              type="text"
                              value={cfg.observacion || ""}
                              onChange={(e) => handleUpdateItem(idx, "observacion", e.target.value)}
                              placeholder="Observación o especificación adicional para este insumo (ej: lote vencido, caja rota...)"
                              className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 placeholder:text-gray-400"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              4. MOTIVO GENERAL Y OBSERVACIONES
          ══════════════════════════════════════════════════════════════════ */}
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5 flex items-center justify-between">
                <span>4. Motivo General de la Cancelación / Devolución <span className="text-red-500">*</span></span>
              </label>

              {/* Chips rápidos de motivos */}
              <div className="flex items-center gap-1.5 flex-wrap mb-2">
                {[
                  "Mercancía defectuosa / dañada",
                  "Producto vencido en recepción",
                  "Cambio de producto acordado",
                  "Error en cantidades o precios",
                  "Cancelación por parte del proveedor",
                  "Compra duplicada",
                  "Reembolso de dinero acordado"
                ].map((chip, cIdx) => (
                  <button
                    key={cIdx}
                    type="button"
                    onClick={() => {
                      setMotivoGeneral(chip);
                      setErrorMsg("");
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                      motivoGeneral === chip
                        ? "bg-[#F05454] text-white shadow-xs"
                        : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>

              <textarea
                rows={2}
                value={motivoGeneral}
                onChange={(e) => {
                  const val = e.target.value;
                  setMotivoGeneral(val);
                  if (val.trim()) setErrorMsg("");
                }}
                placeholder="Escribe el motivo general de la devolución..."
                className={`w-full px-3.5 py-2.5 text-xs rounded-xl border transition-all duration-150 placeholder:text-gray-400 resize-none font-medium outline-none ${
                  !motivoGeneral.trim() && errorMsg
                    ? "border-red-500 bg-red-50/30 text-red-900 focus:ring-2 focus:ring-red-400"
                    : "border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-[#F05454]"
                }`}
              />
              {!motivoGeneral.trim() && (
                <p className="text-[11px] text-gray-400 mt-1">El motivo debe tener al menos 5 caracteres descriptivos.</p>
              )}
            </div>

            {/* Observaciones generales adicionales */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                Observaciones Adicionales, Acuerdos o Notas de Entrega
              </label>
              <textarea
                rows={2}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Indica condiciones pactadas con el proveedor, persona que recibió o entregó, número de guía o soporte..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-[#F05454] focus:border-transparent transition-colors placeholder:text-gray-400 resize-none"
              />
            </div>
          </div>

          {/* Mensaje de error si falta algo */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-600 dark:text-red-400 font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

        </div>

        {/* ── FOOTER RESUMEN Y BOTONES ── */}
        <div className="p-4 px-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4 shrink-0 bg-gray-50/70 dark:bg-gray-900">
          <div className="flex items-center gap-4 text-xs flex-wrap">
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Total a Revertir:</span>
              <strong className="text-red-600 dark:text-red-400 text-sm">
                -${subtotalRevertirCalculado.toLocaleString("es-CO")}
              </strong>
            </div>
            {estadoDinero !== "NO_APLICA" && (
              <div className="border-l border-gray-200 dark:border-gray-800 pl-4">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Reembolso pactado:</span>
                <strong className="text-emerald-600 dark:text-emerald-400 text-sm">
                  ${(parseFloat(montoReembolso) || 0).toLocaleString("es-CO")}
                </strong>
              </div>
            )}
            <div className="border-l border-gray-200 dark:border-gray-800 pl-4 text-gray-500 dark:text-gray-400 hidden sm:block">
              <span className="text-[10px] uppercase font-bold block text-gray-400">Estado Devolución:</span>
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                {estadoMercancia === "RECIBIDO" ? "✅ Recibido" : estadoMercancia === "EN_PROCESO" ? "⏳ En proceso" : "📦 Pendiente"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#F05454] to-red-600 hover:from-[#d84343] hover:to-red-700 shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              {loading
                ? (esEdicion ? "Guardando..." : "Procesando...")
                : (esEdicion ? "Guardar Cambios de Devolución" : "Confirmar Anulación y Devolución")}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
