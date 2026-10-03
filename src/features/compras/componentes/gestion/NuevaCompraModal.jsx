import { useState, useEffect, useCallback } from "react";
import {
  X,
  ShoppingCart,
  Search,
  Check,
  Trash2,
  ChevronDown,
  Package,
  User,
  CalendarDays,
  DollarSign,
  Sparkles,
  Pencil,
  CheckCircle2,
  Plus,
  Layers,
  ArrowRight,
  Tag,
  AlertCircle
} from "lucide-react";
import { comprasService } from "../../servicios/comprasService";
import { apiClient } from "@/shared/api/apiClient";
import { useNotifications } from "@/shared/hooks/useNotifications";

const inputCls =
  "w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-[#F05454] focus:border-transparent transition-colors text-sm";
const labelCls =
  "block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1";

function hoy() {
  return new Date().toISOString().split("T")[0];
}

function formatFechaHoy() {
  return new Date().toLocaleDateString("es-CO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function parseFecha(dateValue) {
  if (!dateValue) return hoy();
  try {
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return hoy();
    return d.toISOString().split("T")[0];
  } catch {
    return hoy();
  }
}

function esEstadoPendiente(estado) {
  const e = String(estado || "").toUpperCase();
  return e === "PENDIENTE";
}

function normalizarEstadoSelect(estado) {
  const e = String(estado || "").trim().toUpperCase();
  if (e === "RECIBIDA" || e === "COMPLETADA") return "RECIBIDA";
  if (e === "PENDIENTE") return "PENDIENTE";
  if (e === "CANCELADA" || e === "ANULADA") return "CANCELADA";
  return "RECIBIDA";
}

/* ─── LoteEditor: sub-componente para gestionar lotes de un ítem ─── */
function LoteEditor({ lotes, onLotesChange, totalCantidad }) {
  const addLote = () => {
    onLotesChange([...lotes, { numeroLote: "", fechaVencimiento: "", cantidad: "" }]);
  };

  const updateLote = (idx, field, value) => {
    const updated = lotes.map((l, i) => (i === idx ? { ...l, [field]: value } : l));
    onLotesChange(updated);
  };

  const removeLote = (idx) => {
    onLotesChange(lotes.filter((_, i) => i !== idx));
  };

  const cantidadUsada = lotes.reduce((sum, l) => sum + (parseFloat(l.cantidad) || 0), 0);
  const cantidadTotal = parseFloat(totalCantidad) || 0;
  const excede = cantidadUsada > cantidadTotal + 0.001;

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5" />
          Lotes con Fecha de Vencimiento
        </p>
        <button
          type="button"
          onClick={addLote}
          className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
        >
          <Plus className="w-3 h-3" />
          Añadir lote
        </button>
      </div>

      {lotes.length === 0 ? (
        <p className="text-[10px] text-gray-400 italic">
          Sin lotes (opcional). Agrega lotes si los insumos vienen con fechas de vencimiento distintas.
        </p>
      ) : (
        lotes.map((l, idx) => (
          <div key={idx} className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 border border-blue-100 dark:border-blue-800">
            <div className="flex-1 min-w-0">
              <input
                type="text"
                placeholder="Nº Lote (ej: L-001)"
                value={l.numeroLote}
                onChange={(e) => updateLote(idx, "numeroLote", e.target.value)}
                className="w-full px-2 py-1 text-[11px] border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg focus:ring-1 focus:ring-blue-400 mb-1"
              />
              <input
                type="date"
                value={l.fechaVencimiento}
                onChange={(e) => updateLote(idx, "fechaVencimiento", e.target.value)}
                className="w-full px-2 py-1 text-[11px] border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div className="w-20">
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Cant."
                value={l.cantidad}
                onChange={(e) => updateLote(idx, "cantidad", e.target.value)}
                className="w-full px-2 py-1 text-[11px] border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <button
              type="button"
              onClick={() => removeLote(idx)}
              className="p-1 rounded-lg text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))
      )}

      {lotes.length > 0 && cantidadTotal > 0 && (
        <div className={`text-[10px] font-medium flex items-center gap-1 ${excede ? "text-red-500" : "text-gray-500 dark:text-gray-400"}`}>
          {excede && <AlertCircle className="w-3 h-3" />}
          Distribuido: {cantidadUsada} / {cantidadTotal}
          {excede && " — Excede la cantidad del ítem"}
        </div>
      )}
    </div>
  );
}

/* ─── Main Component ─── */
export function NuevaCompraModal({ isOpen, onClose, onCreated, onUpdated, editCompra, initialInsumo }) {
  const notify = useNotifications();
  const esEdicion = Boolean(editCompra && editCompra.id);
  const idCompraEdit = esEdicion ? editCompra.id : null;

  const [proveedores, setProveedores] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Proveedor seleccionado
  const [idProveedor, setIdProveedor] = useState("");

  // Ítems en la orden (panel derecho)
  const [ordenItems, setOrdenItems] = useState([]);

  // Panel izquierdo: insumo seleccionado en configuración
  const [search, setSearch] = useState("");
  const [configurando, setConfigurando] = useState(null); // { insumo, cantidad, precioUnitario, lotes }

  // Para modo edición
  const [fechaCompraEdit, setFechaCompraEdit] = useState(hoy());
  const [mobileTab, setMobileTab] = useState("catalogo"); // "catalogo" | "orden" para responsive móvil

  const loadCatalogos = useCallback(async () => {
    try {
      setLoading(true);
      const [prov, ins] = await Promise.all([
        apiClient.get("/proveedores"),
        apiClient.get("/insumos"),
      ]);
      setProveedores(Array.isArray(prov) ? prov : prov?.data || []);
      setInsumos(Array.isArray(ins) ? ins : ins?.data || []);
    } catch (err) {
      console.error("Error cargando catálogos:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const poblarDatosEdicion = useCallback(async () => {
    if (!idCompraEdit) return;
    try {
      setLoading(true);
      const detalle = await comprasService.getCompraById(idCompraEdit);
      if (!esEstadoPendiente(detalle.estado)) {
        onClose?.();
        return;
      }
      setIdProveedor(detalle.idProveedor ? String(detalle.idProveedor) : "");
      setFechaCompraEdit(parseFecha(detalle.fechaCompra));
      const det = detalle.detalles || [];
      setOrdenItems(
        det.map((d) => ({
          insumo: d.insumo || { idInsumo: d.idInsumo, nombre: `Insumo #${d.idInsumo}`, unidadMedida: "" },
          cantidad: String(parseFloat(d.cantidad) || 0),
          precioUnitario: String(parseFloat(d.precioUnitario) || 0),
          subtotal: parseFloat(d.subtotal) || parseFloat(d.cantidad) * parseFloat(d.precioUnitario) || 0,
          lotes: Array.isArray(d.lotes) ? d.lotes : [],
        }))
      );
    } catch (err) {
      console.error("Error cargando compra para edición:", err);
    } finally {
      setLoading(false);
    }
  }, [idCompraEdit, onClose]);

  useEffect(() => {
    if (isOpen) {
      loadCatalogos();
      setSubmitted(false);
      setConfigurando(null);
      setSearch("");
      setMobileTab("catalogo");
      if (esEdicion) {
        if (editCompra && !esEstadoPendiente(editCompra.estado)) {
          onClose?.();
          return;
        }
        poblarDatosEdicion();
      } else {
        setIdProveedor("");
        setOrdenItems([]);
        setFechaCompraEdit(hoy());
      }
    }
  }, [isOpen, esEdicion, editCompra, loadCatalogos, poblarDatosEdicion, onClose]);

  useEffect(() => {
    if (isOpen && initialInsumo && insumos.length > 0 && !esEdicion) {
      const targetId = initialInsumo.idInsumo || initialInsumo.id;
      const found = insumos.find((i) => (i.idInsumo || i.id) === targetId);
      if (found) {
        if (found.idProveedor) {
          setIdProveedor(String(found.idProveedor));
        }
        const cantSugerida = Math.max(
          1,
          Math.ceil((Number(found.stockMinimo || 0) * 2) - Number(found.stock || 0))
        );
        setConfigurando({
          insumo: found,
          cantidad: String(cantSugerida > 0 ? cantSugerida : 10),
          precioUnitario: String(found.precioUnitario || 0),
          lotes: []
        });
      }
    }
  }, [isOpen, initialInsumo, insumos, esEdicion]);

  if (!isOpen) return null;

  /* ── Filtrado de insumos ── */
  const selectedProveedorId = idProveedor ? String(idProveedor) : null;
  const insumosAsociados = selectedProveedorId
    ? insumos.filter((i) => String(i.idProveedor) === selectedProveedorId)
    : [];
  const insumosOtros = selectedProveedorId
    ? insumos.filter((i) => String(i.idProveedor) !== selectedProveedorId)
    : insumos;

  const filteredInsumos = (() => {
    const q = search.toLowerCase().trim();
    const filterList = (list) => (q ? list.filter((i) => i.nombre?.toLowerCase().includes(q)) : list);
    if (insumosAsociados.length > 0 && selectedProveedorId) {
      return [
        ...filterList(insumosAsociados).map((i) => ({ ...i, _highlight: true })),
        ...filterList(insumosOtros),
      ];
    }
    // Sin proveedor: mostrar todos los insumos normalmente
    return filterList(insumos);
  })();

  /* ── Ítems ya en la orden ── */
  const idsEnOrden = new Set(ordenItems.map((it) => String(it.insumo?.idInsumo || it.insumo?.id)));

  /* ── Seleccionar insumo para configurar ── */
  const handleSelectInsumo = (insumo) => {
    const idStr = String(insumo.idInsumo || insumo.id);
    // Si ya está en la orden, lo ponemos en edición
    const existing = ordenItems.find((it) => String(it.insumo?.idInsumo || it.insumo?.id) === idStr);
    if (existing) {
      setConfigurando({ ...existing });
    } else {
      setConfigurando({
        insumo,
        cantidad: "",
        precioUnitario: insumo.precioUnitario ? String(insumo.precioUnitario) : "",
        lotes: [],
      });
    }
  };

  /* ── Añadir/actualizar ítem en orden ── */
  const handleAddToOrden = () => {
    if (!configurando) return;
    const cant = parseFloat(configurando.cantidad);
    const precio = parseFloat(configurando.precioUnitario);
    if (!cant || !precio || cant <= 0 || precio <= 0) return;
    const idStr = String(configurando.insumo?.idInsumo || configurando.insumo?.id);
    const subtotal = cant * precio;
    const newItem = {
      insumo: configurando.insumo,
      cantidad: String(cant),
      precioUnitario: String(precio),
      subtotal,
      lotes: (configurando.lotes || []).filter((l) => l.numeroLote),
    };
    setOrdenItems((prev) => {
      const idx = prev.findIndex((it) => String(it.insumo?.idInsumo || it.insumo?.id) === idStr);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = newItem;
        return updated;
      }
      return [...prev, newItem];
    });
    setConfigurando(null);
    setMobileTab("orden");
  };

  const removeFromOrden = (idStr) => {
    setOrdenItems((prev) => prev.filter((it) => String(it.insumo?.idInsumo || it.insumo?.id) !== idStr));
    if (configurando && String(configurando.insumo?.idInsumo || configurando.insumo?.id) === idStr) {
      setConfigurando(null);
    }
  };

  const totalGeneral = ordenItems.reduce((acc, it) => acc + (it.subtotal || 0), 0);

  const isValid = () => {
    if (ordenItems.length === 0) return false;
    return true;
  };

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitted || saving) return;
    if (!isValid()) {
      if (ordenItems.length === 0) {
        notify?.warning?.("Orden vacía", "Debes agregar al menos un insumo a la orden de compra antes de confirmar.");
      }
      return;
    }
    if (esEdicion && editCompra && !esEstadoPendiente(editCompra.estado)) return;
    setSubmitted(true);
    setSaving(true);
    try {
      const payload = {
        idProveedor: idProveedor ? parseInt(idProveedor) : null, // null = compra genérica
        fechaCompra: esEdicion ? fechaCompraEdit : hoy(),
        estado: "RECIBIDA",
        total: totalGeneral,
        detalles: ordenItems.map((it) => {
          const lotesValidos = (it.lotes || [])
            .filter((l) => l.numeroLote && String(l.numeroLote).trim())
            .map((l) => ({
              numeroLote: String(l.numeroLote).trim(),
              cantidad: parseFloat(l.cantidad) || parseFloat(it.cantidad) || 0,
              fechaVencimiento: l.fechaVencimiento && String(l.fechaVencimiento).trim() ? String(l.fechaVencimiento).trim() : null
            }));

          const primerLote = lotesValidos[0];
          const numLote = primerLote ? primerLote.numeroLote : null;
          const fVenc = primerLote ? primerLote.fechaVencimiento : null;

          return {
            idInsumo: parseInt(it.insumo?.idInsumo || it.insumo?.id),
            cantidad: parseFloat(it.cantidad),
            precioUnitario: parseFloat(it.precioUnitario),
            subtotal: it.subtotal,
            lotes: lotesValidos,
            ...(numLote ? { numeroLote: numLote } : {}),
            ...(fVenc ? { fechaVencimiento: fVenc } : {}),
          };
        }),
      };
      if (esEdicion) {
        await comprasService.updateCompra(idCompraEdit, payload);
        onUpdated?.();
      } else {
        await comprasService.createCompra(payload);
        onCreated?.();
      }
      onClose();
    } catch (err) {
      console.error("Error al guardar compra:", err);
      notify?.error?.("Error al guardar compra", err.message || "No se pudo registrar la compra.");
      setSubmitted(false);
    } finally {
      setSaving(false);
    }
  };

  const configurandoId = configurando ? String(configurando.insumo?.idInsumo || configurando.insumo?.id) : null;
  const configurandoSubtotal =
    (parseFloat(configurando?.cantidad) || 0) * (parseFloat(configurando?.precioUnitario) || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[96vh] flex flex-col overflow-hidden border border-gray-100 dark:border-gray-800"
        style={{ animation: "fadeInScale 0.22s ease-out" }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0 bg-gradient-to-r from-white to-gray-50/80 dark:from-gray-900 dark:to-gray-900">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${esEdicion ? "bg-blue-50 dark:bg-blue-900/20" : "bg-[#F05454]/10"}`}>
              {esEdicion ? <Pencil className="w-5 h-5 text-blue-500" /> : <ShoppingCart className="w-5 h-5 text-[#F05454]" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {esEdicion ? "Editar Compra" : "Nueva Compra de Insumos"}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {esEdicion
                  ? `Modificando orden #${idCompraEdit}`
                  : "Selecciona insumos, cantidades y lotes — el stock se reabastece al confirmar"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Proveedor y fecha (barra superior) ── */}
        <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/30 shrink-0">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            {/* Proveedor */}
            <div className="flex-1 flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400 shrink-0" />
              <div className="flex-1 relative">
                <select
                  value={idProveedor}
                  onChange={(e) => setIdProveedor(e.target.value)}
                  className={`w-full pl-3 pr-8 py-2 border ${!idProveedor ? "border-blue-200 dark:border-blue-700 bg-blue-50/30 dark:bg-blue-900/10" : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"} dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-[#F05454] focus:border-transparent transition-colors text-sm appearance-none font-medium`}
                >
                  <option value="">🏷️ Compra Genérica (sin proveedor)</option>
                  {proveedores.map((p) => (
                    <option key={p.idProveedor || p.id} value={p.idProveedor || p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Fecha fija */}
            <div className="flex items-center gap-2 shrink-0">
              <CalendarDays className="w-4 h-4 text-gray-400" />
              <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <span className="uppercase tracking-wide text-[10px] font-bold text-emerald-500 mr-1">HOY</span>
                {formatFechaHoy()}
                <span className="ml-1 text-[10px] text-emerald-400 font-normal">(fija)</span>
              </div>
            </div>
          </div>

          {idProveedor && insumosAsociados.length > 0 && (
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-blue-600 dark:text-blue-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{insumosAsociados.length} insumos de este proveedor destacados arriba</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm py-16">
            Cargando catálogos...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            {/* ── Selector de Pestaña Móvil (visible solo en pantallas pequeñas < 640px) ── */}
            <div className="flex sm:hidden border-b border-gray-200 dark:border-gray-800 bg-gray-50/90 dark:bg-gray-850 p-1.5 shrink-0 gap-1.5">
              <button
                type="button"
                onClick={() => setMobileTab("catalogo")}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  mobileTab === "catalogo"
                    ? "bg-white dark:bg-gray-800 text-[#F05454] shadow-xs border border-gray-200/60 dark:border-gray-700/60"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>1. Catálogo</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileTab("orden")}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  mobileTab === "orden"
                    ? "bg-white dark:bg-gray-800 text-[#F05454] shadow-xs border border-gray-200/60 dark:border-gray-700/60"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                }`}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>2. Orden ({ordenItems.length})</span>
                {totalGeneral > 0 && (
                  <span className="text-[10px] font-extrabold text-[#F05454] ml-1">
                    ${totalGeneral.toLocaleString("es-CO")}
                  </span>
                )}
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* ─────────────────────────────────────────────────
                  PANEL IZQUIERDO — Catálogo de Insumos
              ───────────────────────────────────────────────── */}
              <div className={`${mobileTab === "catalogo" ? "flex" : "hidden"} sm:flex w-full sm:w-1/2 border-r border-gray-100 dark:border-gray-800 flex-col overflow-hidden`}>
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 shrink-0">
                <p className="text-xs font-bold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-[#F05454]" />
                  Catálogo de Insumos
                </p>
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por nombre..."
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-[#F05454] focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              {/* Lista de insumos */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {filteredInsumos.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-400">
                    No se encontraron insumos{search ? ` con "${search}"` : ""}
                  </div>
                ) : (
                  filteredInsumos.map((ins) => {
                    const idStr = String(ins.idInsumo || ins.id);
                    const enOrden = idsEnOrden.has(idStr);
                    const esConfigurando = configurandoId === idStr;

                    return (
                      <button
                        key={idStr}
                        type="button"
                        onClick={() => handleSelectInsumo(ins)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 group
                          ${esConfigurando
                            ? "bg-[#F05454]/10 border-[#F05454] shadow-sm"
                            : enOrden
                            ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
                            : ins._highlight
                            ? "bg-blue-50/60 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/40 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            : "bg-white dark:bg-gray-800/50 border-gray-100 dark:border-gray-700/60 hover:bg-gray-50 dark:hover:bg-gray-700/40"
                          }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            {ins._highlight && (
                              <Tag className="w-3 h-3 text-blue-500 shrink-0" />
                            )}
                            <span className="font-semibold text-xs text-gray-900 dark:text-gray-100 truncate">
                              {ins.nombre}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-gray-500 dark:text-gray-400">
                              {ins.unidadMedida || "unidad"}
                            </span>
                            {ins.stock !== undefined && (
                              <span className="text-[10px] text-gray-400">
                                Stock: <strong>{parseFloat(ins.stock) || 0}</strong>
                              </span>
                            )}
                            {ins.precioUnitario && (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                                ${parseFloat(ins.precioUnitario).toLocaleString("es-CO")}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="shrink-0">
                          {enOrden ? (
                            <span className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 text-white" />
                            </span>
                          ) : (
                            <span className="w-6 h-6 rounded-full border-2 border-gray-200 dark:border-gray-600 group-hover:border-[#F05454] transition-colors flex items-center justify-center">
                              <ArrowRight className="w-3 h-3 text-gray-300 group-hover:text-[#F05454] transition-colors" />
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Panel de configuración del insumo seleccionado */}
              {configurando && (
                <div className="border-t border-[#F05454]/30 bg-[#F05454]/5 dark:bg-[#F05454]/10 p-4 shrink-0">
                  <p className="text-xs font-bold text-[#F05454] mb-2 flex items-center gap-1.5">
                    <Pencil className="w-3.5 h-3.5" />
                    Configurando: <span className="text-gray-900 dark:text-gray-100">{configurando.insumo?.nombre}</span>
                  </p>

                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <label className={labelCls}>Cantidad *</label>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="0"
                        value={configurando.cantidad}
                        onChange={(e) => setConfigurando((c) => ({ ...c, cantidad: e.target.value }))}
                        className={inputCls + " text-xs"}
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className={labelCls}>
                        <DollarSign className="inline w-3 h-3" /> Precio Unit. *
                      </label>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="0"
                        value={configurando.precioUnitario}
                        onChange={(e) => setConfigurando((c) => ({ ...c, precioUnitario: e.target.value }))}
                        className={inputCls + " text-xs"}
                      />
                    </div>
                  </div>

                  {configurandoSubtotal > 0 && (
                    <p className="text-[11px] text-gray-600 dark:text-gray-300 mb-2">
                      Subtotal: <strong className="text-[#F05454]">${configurandoSubtotal.toLocaleString("es-CO")}</strong>
                    </p>
                  )}

                  {/* Lotes */}
                  <LoteEditor
                    lotes={configurando.lotes || []}
                    onLotesChange={(lts) => setConfigurando((c) => ({ ...c, lotes: lts }))}
                    totalCantidad={configurando.cantidad}
                  />

                  <div className="flex gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => setConfigurando(null)}
                      className="flex-1 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleAddToOrden}
                      disabled={!configurando.cantidad || !configurando.precioUnitario || parseFloat(configurando.cantidad) <= 0 || parseFloat(configurando.precioUnitario) <= 0}
                      className="flex-1 py-2 rounded-xl bg-[#F05454] hover:bg-[#d84343] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {idsEnOrden.has(configurandoId || "") ? "Actualizar en Orden →" : "Añadir a la Orden →"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ─────────────────────────────────────────────────
                PANEL DERECHO — Orden de Compra
            ───────────────────────────────────────────────── */}
            <div className={`${mobileTab === "orden" ? "flex" : "hidden"} sm:flex w-full sm:w-1/2 flex-col overflow-hidden bg-gray-50/40 dark:bg-gray-900`}>
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 shrink-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                    <ShoppingCart className="w-4 h-4 text-[#F05454]" />
                    Orden de Compra
                  </p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F05454]/10 text-[#F05454] font-bold">
                    {ordenItems.length} insumo{ordenItems.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Lista de ítems de la orden */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {ordenItems.length === 0 ? (
                  <div className="py-12 text-center flex flex-col items-center gap-3 text-gray-400">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <ShoppingCart className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Orden vacía</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Selecciona insumos del catálogo de la izquierda
                      </p>
                    </div>
                  </div>
                ) : (
                  ordenItems.map((it) => {
                    const idStr = String(it.insumo?.idInsumo || it.insumo?.id);
                    return (
                      <div
                        key={idStr}
                        className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-700/60 p-3 shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
                              {it.insumo?.nombre}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500 dark:text-gray-400 flex-wrap">
                              <span>{it.cantidad} {it.insumo?.unidadMedida || "u"}</span>
                              <span>×</span>
                              <span>${parseFloat(it.precioUnitario).toLocaleString("es-CO")}</span>
                              <span className="font-bold text-[#F05454]">
                                = ${it.subtotal.toLocaleString("es-CO")}
                              </span>
                            </div>

                            {/* Lotes */}
                            {it.lotes && it.lotes.length > 0 && (
                              <div className="mt-1.5 flex flex-wrap gap-1">
                                {it.lotes.map((l, li) => (
                                  <span
                                    key={li}
                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-[10px] text-blue-700 dark:text-blue-300 font-medium"
                                  >
                                    <Layers className="w-2.5 h-2.5" />
                                    {l.numeroLote}
                                    {l.cantidad && <span>({l.cantidad})</span>}
                                    {l.fechaVencimiento && (
                                      <span className="text-amber-600 dark:text-amber-400">
                                        · Vence: {l.fechaVencimiento}
                                      </span>
                                    )}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                handleSelectInsumo(it.insumo);
                                setMobileTab("catalogo");
                              }}
                              className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                              title="Editar"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeFromOrden(idStr)}
                              className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              title="Quitar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Resumen financiero */}
              {ordenItems.length > 0 && (
                <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-gray-600 dark:text-gray-300">
                      {idProveedor ? "Total del Proveedor" : "Total de la Orden (Genérica)"}
                    </span>
                    <span className="text-xl font-bold text-[#F05454]">
                      ${totalGeneral.toLocaleString("es-CO", { minimumFractionDigits: 0 })}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {ordenItems.length} insumo{ordenItems.length !== 1 ? "s" : ""} · Fecha: HOY (fija)
                  </p>
                </div>
              )}

              {/* Footer de acción */}
              <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex gap-3 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || !isValid()}
                  className={`flex-[2] flex items-center justify-center gap-2 py-2.5 ${
                    esEdicion ? "bg-blue-500 hover:bg-blue-600" : "bg-[#F05454] hover:bg-[#d84343]"
                  } disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl shadow-md transition-colors`}
                >
                  {esEdicion ? (
                    <Pencil className="w-4 h-4" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  {saving
                    ? "Guardando..."
                    : esEdicion
                    ? "Guardar Cambios"
                    : "Confirmar Compra y Reabastecer Insumos"}
                </button>
              </div>
            </div>
            </div>
          </form>
        )}
      </div>

      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.97); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
