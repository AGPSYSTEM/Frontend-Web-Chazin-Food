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
  AlertCircle,
  Percent,
  FileText,
  Hash,
  RefreshCw
} from "lucide-react";
import { comprasService } from "../../servicios/comprasService";
import { apiClient } from "@/shared/api/apiClient";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { isSalsaItem } from "../insumos/InsumoModal";
import { validateTexto, validateNumeroPositivo, validateRequerido } from "@/shared/utils/validationUtils";

const inputCls =
  "w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-[#F05454] focus:border-transparent transition-colors text-sm";
const labelCls =
  "block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1";

function hoy() {
  return new Date().toISOString().split("T")[0];
}

function generarCodigoLote(idx = 0) {
  const fechaStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `LOT-${fechaStr}-${String(idx + 1).padStart(2, "0")}-${randomStr}`;
}

/* ─── LoteEditor: sub-componente para gestionar lotes de un ítem (#79, #80, #82) ─── */
function LoteEditor({ lotes, onLotesChange, totalCantidad }) {
  const addLote = (modo = "auto") => {
    const nuevoCodigo = modo === "auto" ? generarCodigoLote(lotes.length) : "";
    const updated = [
      ...lotes,
      {
        numeroLote: nuevoCodigo,
        fechaVencimiento: "",
        cantidad: "",
        modoLote: modo, // 'auto' | 'manual' (#79)
      },
    ];
    onLotesChange(updated);
  };

  const updateLote = (idx, field, value) => {
    const updated = lotes.map((l, i) => (i === idx ? { ...l, [field]: value } : l));
    onLotesChange(updated);
  };

  const toggleModoLote = (idx) => {
    const lote = lotes[idx];
    const nuevoModo = lote.modoLote === "auto" ? "manual" : "auto";
    const nuevoNumero = nuevoModo === "auto" ? generarCodigoLote(idx) : "";
    updateLote(idx, "modoLote", nuevoModo);
    updateLote(idx, "numeroLote", nuevoNumero);
  };

  const removeLote = (idx) => {
    onLotesChange(lotes.filter((_, i) => i !== idx));
  };

  const cantidadUsada = lotes.reduce((sum, l) => sum + (parseFloat(l.cantidad) || 0), 0);
  const cantidadTotal = parseFloat(totalCantidad) || 0;
  const excede = cantidadTotal > 0 && cantidadUsada > cantidadTotal + 0.001;

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5" />
          Lotes con Vencimiento ({lotes.length})
        </p>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => addLote("auto")}
            className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 flex items-center gap-0.5"
            title="Asignar lote con código generado automáticamente por el sistema"
          >
            <Plus className="w-3 h-3" />
            + Lote Auto
          </button>
          <button
            type="button"
            onClick={() => addLote("manual")}
            className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 flex items-center gap-0.5"
            title="Asignar lote con código manual"
          >
            <Plus className="w-3 h-3" />
            + Lote Manual
          </button>
        </div>
      </div>

      {lotes.length === 0 ? (
        <p className="text-[10px] text-gray-400 italic">
          Sin lotes (opcional). Agrega lotes si los insumos vienen con fechas de vencimiento o códigos específicos.
        </p>
      ) : (
        /* Contenedor scrollable cuando hay 5 o más lotes (#80) */
        <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
          {lotes.map((l, idx) => {
            const esAuto = l.modoLote !== "manual";
            return (
              <div
                key={idx}
                className="flex items-center gap-2 bg-blue-50/70 dark:bg-blue-900/20 rounded-xl p-2.5 border border-blue-100 dark:border-blue-800/60"
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="Nº Lote (ej: L-001)"
                      value={l.numeroLote}
                      onChange={(e) => updateLote(idx, "numeroLote", e.target.value)}
                      className={`w-full px-2 py-1 text-[11px] border rounded-lg focus:ring-1 focus:ring-blue-400 dark:bg-gray-800 font-mono ${
                        esAuto
                          ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 text-emerald-800 dark:text-emerald-200"
                          : "border-gray-200 dark:border-gray-700 bg-white"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => toggleModoLote(idx)}
                      className={`px-1.5 py-1 text-[9px] font-bold rounded-md shrink-0 uppercase tracking-wider transition-colors ${
                        esAuto
                          ? "bg-emerald-600 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300"
                      }`}
                      title={esAuto ? "Cambiar a ingreso manual" : "Cambiar a código automático"}
                    >
                      {esAuto ? "Auto" : "Manual"}
                    </button>
                  </div>
                  <input
                    type="date"
                    value={l.fechaVencimiento}
                    onChange={(e) => updateLote(idx, "fechaVencimiento", e.target.value)}
                    className="w-full px-2 py-1 text-[11px] border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg focus:ring-1 focus:ring-blue-400"
                  />
                </div>
                <div className="w-20 shrink-0">
                  <label className="block text-[9px] font-bold text-gray-500 uppercase">Cantidad</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0"
                    value={l.cantidad}
                    onKeyDown={(e) => {
                      if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault(); // #78
                    }}
                    onChange={(e) => updateLote(idx, "cantidad", e.target.value)}
                    className="w-full px-2 py-1 text-[11px] border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg focus:ring-1 focus:ring-blue-400 font-bold"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeLote(idx)}
                  className="p-1.5 rounded-lg text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors shrink-0"
                  title="Eliminar lote"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {lotes.length > 0 && (
        <div
          className={`text-[10px] font-medium flex items-center justify-between px-1 ${
            excede ? "text-red-500" : "text-gray-500 dark:text-gray-400"
          }`}
        >
          <span className="flex items-center gap-1">
            {excede && <AlertCircle className="w-3 h-3" />}
            Suma de lotes: <strong>{cantidadUsada}</strong>
            {cantidadTotal > 0 && ` / ${cantidadTotal} ítem`}
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
            (Calculado en tiempo real)
          </span>
        </div>
      )}
    </div>
  );
}

/* ─── Main Component: NuevaCompraModal ─── */
export function NuevaCompraModal({ isOpen, onClose, onCreated, initialInsumo }) {
  const notify = useNotifications();

  const [proveedores, setProveedores] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Apartado lateral / Drawer para crear nuevo insumo (#77)
  const [panelNuevoInsumoOpen, setPanelNuevoInsumoOpen] = useState(false);
  const [savingNuevoInsumo, setSavingNuevoInsumo] = useState(false);
  const initialNuevoInsumoForm = {
    nombre: "",
    idCategoriaInsumo: "",
    categoria: "",
    unidadMedida: "Kg",
    precioUnitario: "",
    idProveedor: "",
    stock: "0",
    stockMinimo: "5",
    incluyeIva: false,
    esAdicion: false,
    precioAdicion: "",
    descripcion: "",
  };
  const [nuevoInsumoForm, setNuevoInsumoForm] = useState(initialNuevoInsumoForm);
  const [nuevoInsumoErrors, setNuevoInsumoErrors] = useState({});

  // Campos principales de la factura de compra (#74, #75, #76, #83)
  const [idProveedor, setIdProveedor] = useState("");
  const [numeroFactura, setNumeroFactura] = useState("");
  const [fechaFactura, setFechaFactura] = useState(hoy());
  const [incluyeIva, setIncluyeIva] = useState(false);

  // Errores de validación y campos tocados
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [nuevoInsumoTouched, setNuevoInsumoTouched] = useState({});

  // Validaciones en vivo para campos principales de compra
  const validateHeaderField = (name, value) => {
    switch (name) {
      case "numeroFactura":
        return validateTexto(value, "El número de factura", 2, 50);
      case "fechaFactura":
        return validateRequerido(value, "La fecha de la factura");
      default:
        return null;
    }
  };

  const handleHeaderBlur = (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    let val = "";
    if (name === "numeroFactura") val = numeroFactura;
    if (name === "fechaFactura") val = fechaFactura;
    const err = validateHeaderField(name, val);
    setFormErrors((prev) => ({ ...prev, [name]: err }));
  };

  const handleHeaderChange = (name, value) => {
    if (name === "numeroFactura") setNumeroFactura(value);
    if (name === "fechaFactura") setFechaFactura(value);
    if (touched[name] || submitted) {
      const err = validateHeaderField(name, value);
      setFormErrors((prev) => ({ ...prev, [name]: err }));
    }
  };

  // Validaciones en vivo para nuevo insumo en drawer lateral
  const validateNuevoInsumoField = (name, value, currentForm = nuevoInsumoForm) => {
    switch (name) {
      case "nombre":
        return validateTexto(value, "El nombre del insumo", 2, 80);
      case "idCategoriaInsumo":
        return value ? null : "Selecciona una categoría para el insumo.";
      case "precioUnitario":
        return validateNumeroPositivo(value, "El precio unitario", true);
      case "stock":
        return validateNumeroPositivo(value, "El stock inicial", true);
      case "stockMinimo":
        return validateNumeroPositivo(value, "El stock mínimo", true);
      case "precioAdicion":
        if (currentForm.esAdicion) {
          return validateNumeroPositivo(value, "El precio de venta de la adición", false);
        }
        return null;
      default:
        return null;
    }
  };

  const handleNuevoInsumoBlur = (name) => {
    setNuevoInsumoTouched((prev) => ({ ...prev, [name]: true }));
    const err = validateNuevoInsumoField(name, nuevoInsumoForm[name]);
    setNuevoInsumoErrors((prev) => ({ ...prev, [name]: err }));
  };

  const handleNuevoInsumoChange = (name, value) => {
    const updated = { ...nuevoInsumoForm, [name]: value };
    setNuevoInsumoForm(updated);
    if (nuevoInsumoTouched[name]) {
      const err = validateNuevoInsumoField(name, value, updated);
      setNuevoInsumoErrors((prev) => ({ ...prev, [name]: err }));
    }
  };

  // Ítems en la orden (panel derecho)
  const [ordenItems, setOrdenItems] = useState([]);

  // Panel izquierdo: insumo seleccionado en configuración
  const [search, setSearch] = useState("");
  const [configurando, setConfigurando] = useState(null); // { insumo, cantidad, precioUnitario, lotes }
  const [mobileTab, setMobileTab] = useState("catalogo"); // "catalogo" | "orden"

  const loadCatalogos = useCallback(async () => {
    try {
      setLoading(true);
      const [prov, ins, cats] = await Promise.all([
        apiClient.get("/proveedores"),
        apiClient.get("/insumos"),
        apiClient.get("/categorias-insumo"),
      ]);
      setProveedores(Array.isArray(prov) ? prov : prov?.data || []);
      setInsumos(Array.isArray(ins) ? ins : ins?.data || []);
      setCategorias(Array.isArray(cats) ? cats : cats?.data || []);
    } catch (err) {
      console.error("Error cargando catálogos:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadCatalogos();
      setSubmitted(false);
      setConfigurando(null);
      setSearch("");
      setMobileTab("catalogo");
      setIdProveedor("");
      setNumeroFactura("");
      setFechaFactura(hoy());
      setIncluyeIva(false);
      setOrdenItems([]);
      setFormErrors({});
      setTouched({});
      setPanelNuevoInsumoOpen(false);
      setNuevoInsumoForm(initialNuevoInsumoForm);
      setNuevoInsumoErrors({});
      setNuevoInsumoTouched({});
    }
  }, [isOpen, loadCatalogos]);

  /* ── Apertura y guardado de nuevo insumo desde el apartado lateral (#77) ── */
  const handleOpenNuevoInsumo = (suggestedName = "") => {
    const defaultCatId = categorias[0]?.id || categorias[0]?.idCategoriaInsumo || "";
    const defaultCatNom = categorias[0]?.nombre || "";
    const nameToUse = suggestedName || search || "";
    const esSalsa = isSalsaItem(nameToUse, defaultCatNom);

    setNuevoInsumoForm({
      ...initialNuevoInsumoForm,
      nombre: nameToUse,
      idProveedor: idProveedor || (proveedores[0]?.id || proveedores[0]?.idProveedor || ""),
      idCategoriaInsumo: String(defaultCatId),
      categoria: defaultCatNom,
      esAdicion: esSalsa,
      precioAdicion: esSalsa ? "1500" : "",
    });
    setNuevoInsumoErrors({});
    setNuevoInsumoTouched({});
    setPanelNuevoInsumoOpen(true);
  };

  const handleGuardarNuevoInsumo = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const errs = {};
    const errNombre = validateNuevoInsumoField("nombre", nuevoInsumoForm.nombre);
    if (errNombre) errs.nombre = errNombre;
    const errCat = validateNuevoInsumoField("idCategoriaInsumo", nuevoInsumoForm.idCategoriaInsumo);
    if (errCat) errs.idCategoriaInsumo = errCat;
    if (nuevoInsumoForm.esAdicion) {
      const errAdic = validateNuevoInsumoField("precioAdicion", nuevoInsumoForm.precioAdicion);
      if (errAdic) errs.precioAdicion = errAdic;
    }
    setNuevoInsumoTouched({
      nombre: true,
      idCategoriaInsumo: true,
      precioUnitario: true,
      stock: true,
      stockMinimo: true,
      precioAdicion: true,
    });
    setNuevoInsumoErrors(errs);
    if (Object.keys(errs).length > 0) {
      notify?.warning?.("Datos requeridos", Object.values(errs)[0]);
      return;
    }

    setSavingNuevoInsumo(true);
    try {
      const payload = {
        nombre: nuevoInsumoForm.nombre.trim(),
        idCategoriaInsumo: parseInt(nuevoInsumoForm.idCategoriaInsumo),
        unidadMedida: nuevoInsumoForm.unidadMedida || "Kg",
        precioUnitario: parseFloat(nuevoInsumoForm.precioUnitario) || 0,
        idProveedor: nuevoInsumoForm.idProveedor ? parseInt(nuevoInsumoForm.idProveedor) : (idProveedor ? parseInt(idProveedor) : null),
        stock: parseFloat(nuevoInsumoForm.stock) || 0,
        stockMinimo: parseFloat(nuevoInsumoForm.stockMinimo) || 5,
        descripcion: (nuevoInsumoForm.descripcion || "").trim(),
        incluyeIva: nuevoInsumoForm.incluyeIva ? 1 : 0,
        esAdicion: nuevoInsumoForm.esAdicion ? 1 : 0,
        precioAdicion: parseFloat(nuevoInsumoForm.precioAdicion) || 0,
        imagen: nuevoInsumoForm.esAdicion ? "sauce" : "",
        estado: 1,
      };

      const res = await apiClient.post("/insumos", payload);
      const nuevoItem = res?.data || res;

      const insumoCreado = {
        ...nuevoItem,
        idInsumo: nuevoItem.idInsumo || nuevoItem.id,
        id: nuevoItem.idInsumo || nuevoItem.id,
        nombre: nuevoItem.nombre || payload.nombre,
        unidadMedida: nuevoItem.unidadMedida || payload.unidadMedida,
        precioUnitario: nuevoItem.precioUnitario !== undefined ? nuevoItem.precioUnitario : payload.precioUnitario,
        stock: nuevoItem.stock !== undefined ? nuevoItem.stock : payload.stock,
        stockMinimo: nuevoItem.stockMinimo !== undefined ? nuevoItem.stockMinimo : payload.stockMinimo,
        idProveedor: nuevoItem.idProveedor || payload.idProveedor,
        incluyeIva: nuevoItem.incluyeIva !== undefined ? nuevoItem.incluyeIva : payload.incluyeIva,
      };

      // Agregar a la lista de insumos localmente para que esté disponible de inmediato
      setInsumos((prev) => [insumoCreado, ...prev]);

      // Si la compra aún no tenía proveedor asignado y este insumo tiene uno, asociarlo automáticamente
      if (!idProveedor && insumoCreado.idProveedor) {
        setIdProveedor(String(insumoCreado.idProveedor));
      }

      // Seleccionar de inmediato el nuevo insumo para configurarlo en la compra
      setConfigurando({
        insumo: insumoCreado,
        cantidad: "1",
        precioUnitario: String(insumoCreado.precioUnitario || 0),
        lotes: [],
      });

      // Asegurar que el catálogo muestre el nuevo insumo
      setSearch(insumoCreado.nombre);

      // Cerrar panel lateral
      setPanelNuevoInsumoOpen(false);

      notify?.success?.(
        "Insumo Creado",
        `"${insumoCreado.nombre}" se guardó en Gestión de Insumos y se seleccionó para esta compra.`
      );
    } catch (err) {
      console.error("Error al crear insumo desde compras:", err);
      notify?.error?.("Error al crear insumo", err.message || "No se pudo registrar el insumo.");
    } finally {
      setSavingNuevoInsumo(false);
    }
  };

  useEffect(() => {
    if (isOpen && initialInsumo && insumos.length > 0) {
      const targetId = initialInsumo.idInsumo || initialInsumo.id;
      const found = insumos.find((i) => (i.idInsumo || i.id) === targetId);
      if (found) {
        if (found.idProveedor) {
          setIdProveedor(String(found.idProveedor));
        }
        const cantSugerida = Math.max(
          1,
          Math.ceil(Number(found.stockMinimo || 0) * 2 - Number(found.stock || 0))
        );
        setConfigurando({
          insumo: found,
          cantidad: String(cantSugerida > 0 ? cantSugerida : 10),
          precioUnitario: String(found.precioUnitario || 0),
          lotes: [],
        });
      }
    }
  }, [isOpen, initialInsumo, insumos]);

  if (!isOpen) return null;

  /* ── Filtrado de insumos según proveedor seleccionado ── */
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
    return filterList(insumos);
  })();

  const idsEnOrden = new Set(ordenItems.map((it) => String(it.insumo?.idInsumo || it.insumo?.id)));

  /* ── Seleccionar insumo para configurar ── */
  const handleSelectInsumo = (insumo) => {
    const idStr = String(insumo.idInsumo || insumo.id);
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

  /* ── Actualización de lotes con suma en tiempo real (#82) ── */
  const handleLotesChange = (newLotes) => {
    const sumLotes = newLotes.reduce((sum, l) => sum + (parseFloat(l.cantidad) || 0), 0);
    setConfigurando((c) => ({
      ...c,
      lotes: newLotes,
      // Si hay lotes con cantidades, sumarlos automáticamente a la cantidad del ítem (#82)
      ...(sumLotes > 0 ? { cantidad: String(sumLotes) } : {}),
    }));
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
      lotes: (configurando.lotes || []).filter((l) => l.numeroLote && String(l.numeroLote).trim()),
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

  /* ── Cálculos financieros con switch de IVA (#83) ── */
  const subtotalGeneral = ordenItems.reduce((acc, it) => acc + (it.subtotal || 0), 0);
  const ivaCalculado = incluyeIva ? Math.round(subtotalGeneral * 0.19) : 0;
  const totalGeneral = subtotalGeneral + ivaCalculado;

  /* ── Validaciones de compra (#74) ── */
  const validateForm = () => {
    const errs = {};
    if (!idProveedor || String(idProveedor).trim() === "") {
      errs.idProveedor = "Debes seleccionar un proveedor obligatorio para registrar la compra.";
    }
    if (!numeroFactura.trim()) {
      errs.numeroFactura = "El número de factura es obligatorio.";
    }
    if (!fechaFactura) {
      errs.fechaFactura = "La fecha de la factura es obligatoria.";
    }
    if (ordenItems.length === 0) {
      errs.ordenItems = "Debes agregar al menos un insumo a la compra.";
    }
    return errs;
  };

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    const errs = validateForm();
    setFormErrors(errs);

    if (Object.keys(errs).length > 0) {
      if (errs.idProveedor) {
        notify?.warning?.("Proveedor requerido", errs.idProveedor);
      } else if (errs.numeroFactura) {
        notify?.warning?.("Número de factura requerido", errs.numeroFactura);
      } else if (errs.ordenItems) {
        notify?.warning?.("Orden vacía", errs.ordenItems);
      }
      return;
    }

    if (saving) return;
    setSaving(true);
    try {
      const payload = {
        idProveedor: idProveedor ? parseInt(idProveedor) : null,
        numeroFactura: numeroFactura.trim(),
        fechaFactura,
        fechaCompra: hoy(),
        estado: "RECIBIDA", // Siempre confirmada (#86)
        incluyeIva: incluyeIva ? 1 : 0,
        subtotal: subtotalGeneral,
        iva: ivaCalculado,
        total: totalGeneral,
        detalles: ordenItems.map((it) => {
          const lotesValidos = (it.lotes || [])
            .filter((l) => l.numeroLote && String(l.numeroLote).trim())
            .map((l) => ({
              numeroLote: String(l.numeroLote).trim(),
              cantidad: parseFloat(l.cantidad) || parseFloat(it.cantidad) || 0,
              fechaVencimiento:
                l.fechaVencimiento && String(l.fechaVencimiento).trim()
                  ? String(l.fechaVencimiento).trim()
                  : null,
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

      await comprasService.createCompra(payload);
      onCreated?.();
      onClose();
    } catch (err) {
      console.error("Error al registrar compra:", err);
      notify?.error?.("Error al guardar compra", err.message || "No se pudo registrar la compra.");
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
        className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[96vh] flex flex-col overflow-hidden border border-gray-100 dark:border-gray-800"
        style={{ animation: "fadeInScale 0.22s ease-out" }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0 bg-gradient-to-r from-white to-gray-50/80 dark:from-gray-900 dark:to-gray-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F05454]/10 flex items-center justify-center shadow-xs">
              <ShoppingCart className="w-5 h-5 text-[#F05454]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Nueva Compra de Insumos
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Ingresa los datos de la factura, proveedor e insumos — el inventario se actualiza automáticamente
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Barra superior: Proveedor, Factura, Fecha e IVA (#74, #75, #76, #83) ── */}
        <div className="px-6 py-3.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-850 shrink-0 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            {/* Proveedor Obligatorio (#74) */}
            <div className="sm:col-span-4">
              <label className={labelCls}>
                Proveedor <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={idProveedor}
                  onChange={(e) => {
                    setIdProveedor(e.target.value);
                    if (formErrors.idProveedor) setFormErrors((err) => ({ ...err, idProveedor: null }));
                  }}
                  className={`w-full pl-3 pr-8 py-2 border rounded-xl dark:bg-gray-800 dark:text-gray-100 text-xs font-semibold appearance-none transition-colors ${
                    (touched.idProveedor || submitted) && formErrors.idProveedor
                      ? "border-red-500 bg-red-50/40 text-red-900 focus:ring-red-400"
                      : "border-gray-200 dark:border-gray-700 bg-white"
                  }`}
                >
                  <option value="">-- Selecciona un proveedor obligatorio --</option>
                  {proveedores.map((p) => (
                    <option key={p.idProveedor || p.id} value={p.idProveedor || p.id}>
                      {p.nombre} {p.nit ? `(${p.nit})` : ""}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {(touched.idProveedor || submitted) && formErrors.idProveedor && (
                <p className="text-[11px] text-red-500 mt-1 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{formErrors.idProveedor}</span>
                </p>
              )}
            </div>

            {/* Número de Factura (#76) */}
            <div className="sm:col-span-3">
              <label className={labelCls}>
                Nº Factura <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FileText className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Ej. FAC-00124"
                  value={numeroFactura}
                  onBlur={() => handleHeaderBlur("numeroFactura")}
                  onChange={(e) => handleHeaderChange("numeroFactura", e.target.value)}
                  className={`w-full pl-8 pr-3 py-2 border rounded-xl dark:bg-gray-800 dark:text-gray-100 text-xs font-semibold uppercase transition-colors ${
                    (touched.numeroFactura || submitted) && formErrors.numeroFactura
                      ? "border-red-500 bg-red-50/50 dark:bg-red-950/20 text-red-900 focus:ring-red-400"
                      : "border-gray-200 dark:border-gray-700 bg-white"
                  }`}
                />
              </div>
              {(touched.numeroFactura || submitted) && formErrors.numeroFactura && (
                <p className="flex items-center gap-1 text-[11px] text-red-500 mt-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {formErrors.numeroFactura}
                </p>
              )}
            </div>

            {/* Fecha de la Factura (#75) */}
            <div className="sm:col-span-3">
              <label className={labelCls}>
                Fecha Factura <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <CalendarDays className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={fechaFactura}
                  onBlur={() => handleHeaderBlur("fechaFactura")}
                  onChange={(e) => handleHeaderChange("fechaFactura", e.target.value)}
                  className={`w-full pl-8 pr-3 py-2 border rounded-xl dark:bg-gray-800 dark:text-gray-100 text-xs font-medium transition-colors ${
                    (touched.fechaFactura || submitted) && formErrors.fechaFactura
                      ? "border-red-500 bg-red-50/50 text-red-900 focus:ring-red-400"
                      : "border-gray-200 dark:border-gray-700 bg-white"
                  }`}
                />
              </div>
              {(touched.fechaFactura || submitted) && formErrors.fechaFactura && (
                <p className="flex items-center gap-1 text-[11px] text-red-500 mt-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {formErrors.fechaFactura}
                </p>
              )}
            </div>

            {/* Switch Aplica IVA (19%) (#83) */}
            <div className="sm:col-span-2 flex items-center justify-start sm:justify-end pb-1">
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs">
                <Percent className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">IVA 19%</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={incluyeIva}
                  onClick={() => setIncluyeIva(!incluyeIva)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    incluyeIva ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                      incluyeIva ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {idProveedor && insumosAsociados.length > 0 && (
            <div className="flex items-center gap-1.5 text-[11px] text-blue-600 dark:text-blue-400 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{insumosAsociados.length} insumos de este proveedor destacados al inicio del catálogo</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm py-16">
            Cargando catálogos...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
            {/* ── Selector de Pestaña Móvil (< 640px) ── */}
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

            <div className="flex flex-1 overflow-hidden min-h-0">
              {/* ─────────────────────────────────────────────────
                  PANEL IZQUIERDO — Catálogo de Insumos
              ───────────────────────────────────────────────── */}
              <div
                className={`${
                  mobileTab === "catalogo" ? "flex" : "hidden"
                } sm:flex w-full sm:w-1/2 border-r border-gray-100 dark:border-gray-800 flex-col overflow-hidden`}
              >
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 shrink-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-[#F05454]" />
                      Catálogo de Insumos
                    </p>
                    <button
                      type="button"
                      onClick={() => handleOpenNuevoInsumo()}
                      className="px-2.5 py-1 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                      title="Crear un nuevo insumo y agregarlo a esta compra (#77)"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Nuevo Insumo</span>
                    </button>
                  </div>
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
                    <div className="py-10 text-center px-4 space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400 mx-auto flex items-center justify-center">
                        <Package className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                          {search ? `No encontramos "${search}"` : "No hay insumos disponibles"}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Puedes crearlo directamente ahora mismo sin salir de la compra (#77).
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenNuevoInsumo(search)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                      >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        <span>Crear {search ? `"${search}"` : "Nuevo Insumo"}</span>
                      </button>
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
                          className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 group cursor-pointer ${
                            esConfigurando
                              ? "bg-[#F05454]/10 border-[#F05454] shadow-xs"
                              : enOrden
                              ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
                              : ins._highlight
                              ? "bg-blue-50/60 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/40 hover:bg-blue-50"
                              : "bg-white dark:bg-gray-800/50 border-gray-100 dark:border-gray-700/60 hover:bg-gray-50"
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
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                              ${Number(ins.precioUnitario || 0).toLocaleString("es-CO")}
                            </span>
                            {enOrden && (
                              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 justify-end mt-0.5">
                                <Check className="w-3 h-3" /> En orden
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Panel de configuración del insumo seleccionado (#78, #80, #82) */}
                {configurando && (
                  <div className="border-t border-[#F05454]/30 bg-[#F05454]/5 dark:bg-[#F05454]/10 p-4 shrink-0 max-h-[52vh] overflow-y-auto">
                    <p className="text-xs font-bold text-[#F05454] mb-2 flex items-center gap-1.5">
                      <Pencil className="w-3.5 h-3.5" />
                      Configurando:{" "}
                      <span className="text-gray-900 dark:text-gray-100">
                        {configurando.insumo?.nombre}
                      </span>
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
                          onKeyDown={(e) => {
                            if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault(); // #78: Bloquear letra e
                          }}
                          onChange={(e) =>
                            setConfigurando((c) => ({ ...c, cantidad: e.target.value }))
                          }
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
                          onKeyDown={(e) => {
                            if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault(); // #78: Bloquear letra e
                          }}
                          onChange={(e) =>
                            setConfigurando((c) => ({ ...c, precioUnitario: e.target.value }))
                          }
                          className={inputCls + " text-xs"}
                        />
                      </div>
                    </div>

                    {configurandoSubtotal > 0 && (
                      <p className="text-[11px] text-gray-600 dark:text-gray-300 mb-2">
                        Subtotal ítem:{" "}
                        <strong className="text-[#F05454]">
                          ${configurandoSubtotal.toLocaleString("es-CO")}
                        </strong>
                      </p>
                    )}

                    {/* Lotes con scroll y suma automática (#79, #80, #82) */}
                    <LoteEditor
                      lotes={configurando.lotes || []}
                      onLotesChange={handleLotesChange}
                      totalCantidad={configurando.cantidad}
                    />

                    <div className="flex gap-2 mt-3 pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
                      <button
                        type="button"
                        onClick={() => setConfigurando(null)}
                        className="flex-1 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleAddToOrden}
                        disabled={
                          !configurando.cantidad ||
                          !configurando.precioUnitario ||
                          parseFloat(configurando.cantidad) <= 0 ||
                          parseFloat(configurando.precioUnitario) <= 0
                        }
                        className="flex-1 py-2 rounded-xl bg-[#F05454] hover:bg-[#d84343] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {idsEnOrden.has(configurandoId || "")
                          ? "Actualizar en Orden →"
                          : "Añadir a la Orden →"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ─────────────────────────────────────────────────
                  PANEL DERECHO — Orden de Compra
              ───────────────────────────────────────────────── */}
              <div
                className={`${
                  mobileTab === "orden" ? "flex" : "hidden"
                } sm:flex w-full sm:w-1/2 flex-col overflow-hidden bg-gray-50/40 dark:bg-gray-900`}
              >
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 shrink-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                      <ShoppingCart className="w-4 h-4 text-[#F05454]" />
                      Detalle de Compra
                    </p>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#F05454]/10 text-[#F05454] font-bold">
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
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Orden vacía
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Selecciona insumos del catálogo de la izquierda para agregarlos a la compra
                        </p>
                      </div>
                    </div>
                  ) : (
                    ordenItems.map((it) => {
                      const idStr = String(it.insumo?.idInsumo || it.insumo?.id);
                      return (
                        <div
                          key={idStr}
                          className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700/60 p-3.5 shadow-2xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
                                {it.insumo?.nombre}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500 dark:text-gray-400 flex-wrap">
                                <span>
                                  {it.cantidad} {it.insumo?.unidadMedida || "u"}
                                </span>
                                <span>×</span>
                                <span>${parseFloat(it.precioUnitario).toLocaleString("es-CO")}</span>
                                <span className="font-bold text-[#F05454]">
                                  = ${it.subtotal.toLocaleString("es-CO")}
                                </span>
                              </div>

                              {/* Lotes */}
                              {it.lotes && it.lotes.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {it.lotes.map((l, li) => (
                                    <span
                                      key={li}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-[10px] text-blue-700 dark:text-blue-300 font-medium"
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
                                className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer"
                                title="Editar ítem"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeFromOrden(idStr)}
                                className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                                title="Quitar ítem"
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

                {/* Resumen financiero con desglose de IVA (#83) */}
                <div className="px-5 py-3.5 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0 space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      ${subtotalGeneral.toLocaleString("es-CO")}
                    </span>
                  </div>

                  {incluyeIva && (
                    <div className="flex items-center justify-between text-xs text-blue-600 dark:text-blue-400">
                      <span className="flex items-center gap-1">
                        <Percent className="w-3 h-3" /> IVA (19%):
                      </span>
                      <span className="font-semibold">
                        +${ivaCalculado.toLocaleString("es-CO")}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-800">
                    <span className="font-bold text-sm text-gray-800 dark:text-gray-200">
                      Total a Pagar:
                    </span>
                    <span className="text-xl font-black text-[#F05454]">
                      ${totalGeneral.toLocaleString("es-CO")}
                    </span>
                  </div>
                </div>

                {/* Footer de acción */}
                <div className="px-4 py-3.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 text-xs font-semibold rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving || ordenItems.length === 0}
                    className="flex-[2] flex items-center justify-center gap-2 py-2.5 bg-[#F05454] hover:bg-[#d84343] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {saving ? "Confirmando compra..." : "Confirmar Compra y Reabastecer"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* ── Apartado Lateral / Drawer: Crear Nuevo Insumo (#77) ── */}
        {panelNuevoInsumoOpen && (
          <>
            {/* Backdrop semitransparente */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-[2px] z-40 transition-opacity"
              onClick={() => setPanelNuevoInsumoOpen(false)}
            />

            {/* Panel lateral deslizante */}
            <div className="absolute inset-y-0 right-0 z-50 w-full sm:w-[500px] bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
              {/* Header del apartado lateral */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0 bg-gray-50/70 dark:bg-gray-850">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#F05454]/10 text-[#F05454] flex items-center justify-center font-bold">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                      Crear Nuevo Insumo
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Se guardará en Gestión de Insumos y se seleccionará en esta orden (#77)
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPanelNuevoInsumoOpen(false)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  title="Cerrar panel lateral"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Formulario scrollable */}
              <form
                onSubmit={handleGuardarNuevoInsumo}
                className="flex flex-col flex-1 overflow-hidden min-h-0"
              >
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {/* Tarjeta de guía */}
                  <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-2xl border border-red-200/60 dark:border-red-900/40 flex items-center gap-2.5 text-xs text-red-800 dark:text-red-300">
                    <Sparkles className="w-4 h-4 text-[#F05454] shrink-0" />
                    <span>
                      Completa los datos del insumo. Al guardarlo quedará registrado de forma permanente en el inventario y se agregará listo para configurar en esta compra.
                    </span>
                  </div>

                  {/* Nombre */}
                  <div>
                    <label className={labelCls}>
                      Nombre del Insumo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Queso Mozzarella, Pan Brioche, Tomate..."
                      value={nuevoInsumoForm.nombre}
                      onBlur={() => handleNuevoInsumoBlur("nombre")}
                      onChange={(e) => {
                        const val = e.target.value;
                        const esSalsa = isSalsaItem(val, nuevoInsumoForm.categoria);
                        const updated = {
                          ...nuevoInsumoForm,
                          nombre: val,
                          esAdicion: esSalsa ? true : nuevoInsumoForm.esAdicion,
                          precioAdicion:
                            esSalsa && (!nuevoInsumoForm.precioAdicion || Number(nuevoInsumoForm.precioAdicion) <= 0)
                              ? "1500"
                              : nuevoInsumoForm.precioAdicion,
                        };
                        setNuevoInsumoForm(updated);
                        if (nuevoInsumoTouched.nombre) {
                          const err = validateNuevoInsumoField("nombre", val, updated);
                          setNuevoInsumoErrors((prev) => ({ ...prev, nombre: err }));
                        }
                      }}
                      className={`${inputCls} ${
                        (nuevoInsumoTouched.nombre) && nuevoInsumoErrors.nombre
                          ? "border-red-500 bg-red-50/50 dark:bg-red-950/20 text-red-900 focus:ring-red-400"
                          : ""
                      }`}
                    />
                    {(nuevoInsumoTouched.nombre) && nuevoInsumoErrors.nombre && (
                      <p className="flex items-center gap-1 text-[11px] text-red-500 mt-1 font-medium">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {nuevoInsumoErrors.nombre}
                      </p>
                    )}
                  </div>

                  {/* Categoría y Proveedor */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>
                        Categoría <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={String(nuevoInsumoForm.idCategoriaInsumo || "")}
                        onBlur={() => handleNuevoInsumoBlur("idCategoriaInsumo")}
                        onChange={(e) => {
                          const val = e.target.value;
                          const selectedCat = categorias.find(
                            (c) => String(c.id || c.idCategoriaInsumo) === String(val)
                          );
                          const catNom = selectedCat?.nombre || "";
                          const esSalsa = isSalsaItem(nuevoInsumoForm.nombre, catNom);
                          const updated = {
                            ...nuevoInsumoForm,
                            idCategoriaInsumo: val,
                            categoria: catNom,
                            esAdicion: esSalsa ? true : nuevoInsumoForm.esAdicion,
                            precioAdicion:
                              esSalsa && (!nuevoInsumoForm.precioAdicion || Number(nuevoInsumoForm.precioAdicion) <= 0)
                                ? "1500"
                                : nuevoInsumoForm.precioAdicion,
                          };
                          setNuevoInsumoForm(updated);
                          if (nuevoInsumoTouched.idCategoriaInsumo) {
                            const err = validateNuevoInsumoField("idCategoriaInsumo", val, updated);
                            setNuevoInsumoErrors((prev) => ({ ...prev, idCategoriaInsumo: err }));
                          }
                        }}
                        className={`${inputCls} cursor-pointer ${
                          (nuevoInsumoTouched.idCategoriaInsumo) && nuevoInsumoErrors.idCategoriaInsumo
                            ? "border-red-500 bg-red-50/50 dark:bg-red-950/20 text-red-900 focus:ring-red-400"
                            : ""
                        }`}
                      >
                        <option value="">Seleccionar categoría</option>
                        {categorias.map((c) => {
                          const catId = c.id || c.idCategoriaInsumo;
                          return (
                            <option key={catId || c.nombre} value={String(catId)}>
                              {c.nombre}
                            </option>
                          );
                        })}
                      </select>
                      {(nuevoInsumoTouched.idCategoriaInsumo) && nuevoInsumoErrors.idCategoriaInsumo && (
                        <p className="flex items-center gap-1 text-[11px] text-red-500 mt-1 font-medium">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          {nuevoInsumoErrors.idCategoriaInsumo}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className={labelCls}>Proveedor Asignado</label>
                      <select
                        value={String(nuevoInsumoForm.idProveedor || "")}
                        onChange={(e) =>
                          setNuevoInsumoForm((prev) => ({ ...prev, idProveedor: e.target.value }))
                        }
                        className={`${inputCls} cursor-pointer`}
                      >
                        <option value="">Sin proveedor asignado</option>
                        {proveedores.map((p) => {
                          const provId = p.id || p.idProveedor;
                          return (
                            <option key={provId} value={String(provId)}>
                              {p.nombre} {p.nit ? `(${p.nit})` : ""}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>

                  {/* Unidad de Medida y Precio de Compra */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Unidad de Medida</label>
                      <select
                        value={nuevoInsumoForm.unidadMedida}
                        onChange={(e) =>
                          setNuevoInsumoForm((prev) => ({ ...prev, unidadMedida: e.target.value }))
                        }
                        className={`${inputCls} cursor-pointer`}
                      >
                        <option value="Kg">Kilogramos (Kg)</option>
                        <option value="Gr">Gramos (Gr)</option>
                        <option value="Lt">Litros (Lt)</option>
                        <option value="Ml">Mililitros (Ml)</option>
                        <option value="Unidad">Unidad (Ud)</option>
                        <option value="Paquete">Paquete</option>
                        <option value="Porción">Porción</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelCls}>Precio Unitario / Costo</label>
                      <div className="relative">
                        <DollarSign className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0"
                          value={nuevoInsumoForm.precioUnitario}
                          onKeyDown={(e) => {
                            if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                          }}
                          onBlur={() => handleNuevoInsumoBlur("precioUnitario")}
                          onChange={(e) => handleNuevoInsumoChange("precioUnitario", e.target.value)}
                          className={`${inputCls} pl-8 ${
                            (nuevoInsumoTouched.precioUnitario) && nuevoInsumoErrors.precioUnitario
                              ? "border-red-500 bg-red-50/50 dark:bg-red-950/20 text-red-900 focus:ring-red-400"
                              : ""
                          }`}
                        />
                      </div>
                      {(nuevoInsumoTouched.precioUnitario) && nuevoInsumoErrors.precioUnitario && (
                        <p className="flex items-center gap-1 text-[11px] text-red-500 mt-1 font-medium">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          {nuevoInsumoErrors.precioUnitario}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Stock Inicial y Stock Mínimo */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Stock Inicial Inventario</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0"
                        value={nuevoInsumoForm.stock}
                        onKeyDown={(e) => {
                          if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                        }}
                        onBlur={() => handleNuevoInsumoBlur("stock")}
                        onChange={(e) => handleNuevoInsumoChange("stock", e.target.value)}
                        className={`${inputCls} ${
                          (nuevoInsumoTouched.stock) && nuevoInsumoErrors.stock
                            ? "border-red-500 bg-red-50/50 dark:bg-red-950/20 text-red-900 focus:ring-red-400"
                            : ""
                        }`}
                      />
                      {(nuevoInsumoTouched.stock) && nuevoInsumoErrors.stock && (
                        <p className="flex items-center gap-1 text-[11px] text-red-500 mt-1 font-medium">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          {nuevoInsumoErrors.stock}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className={labelCls}>Stock Mínimo (Alerta)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="5"
                        value={nuevoInsumoForm.stockMinimo}
                        onKeyDown={(e) => {
                          if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                        }}
                        onBlur={() => handleNuevoInsumoBlur("stockMinimo")}
                        onChange={(e) => handleNuevoInsumoChange("stockMinimo", e.target.value)}
                        className={`${inputCls} ${
                          (nuevoInsumoTouched.stockMinimo) && nuevoInsumoErrors.stockMinimo
                            ? "border-red-500 bg-red-50/50 dark:bg-red-950/20 text-red-900 focus:ring-red-400"
                            : ""
                        }`}
                      />
                      {(nuevoInsumoTouched.stockMinimo) && nuevoInsumoErrors.stockMinimo && (
                        <p className="flex items-center gap-1 text-[11px] text-red-500 mt-1 font-medium">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          {nuevoInsumoErrors.stockMinimo}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Switch Aplica IVA (19%) (#83) */}
                  <div className="p-3.5 rounded-2xl border border-blue-200/80 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                          nuevoInsumoForm.incluyeIva
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                        }`}
                      >
                        <Percent className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                          ¿Aplica IVA (19%)?
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                          Grava impuesto al valor agregado
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={nuevoInsumoForm.incluyeIva}
                      onClick={() =>
                        setNuevoInsumoForm((prev) => ({
                          ...prev,
                          incluyeIva: !prev.incluyeIva,
                        }))
                      }
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        nuevoInsumoForm.incluyeIva ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                          nuevoInsumoForm.incluyeIva ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Switch Adición para Menú */}
                  <div
                    className={`p-3.5 rounded-2xl border transition-all ${
                      nuevoInsumoForm.esAdicion
                        ? "border-purple-300 dark:border-purple-800/80 bg-purple-50/40 dark:bg-purple-950/20"
                        : "border-gray-200 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-800/30"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                            nuevoInsumoForm.esAdicion
                              ? "bg-purple-600 text-white"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                          }`}
                        >
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                            ¿Disponible como adición en menú?
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400">
                            Venta como extra en productos
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={nuevoInsumoForm.esAdicion}
                        onClick={() =>
                          setNuevoInsumoForm((prev) => ({
                            ...prev,
                            esAdicion: !prev.esAdicion,
                          }))
                        }
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          nuevoInsumoForm.esAdicion
                            ? "bg-purple-600"
                            : "bg-gray-300 dark:bg-gray-700"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                            nuevoInsumoForm.esAdicion ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {nuevoInsumoForm.esAdicion && (
                      <div className="mt-3 pt-3 border-t border-purple-200/60 dark:border-purple-900/40">
                        <label className={labelCls}>
                          Precio de Venta como Adición <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <DollarSign className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="number"
                            min="0"
                            step="100"
                            placeholder="1500"
                            value={nuevoInsumoForm.precioAdicion}
                            onKeyDown={(e) => {
                              if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                            }}
                            onBlur={() => handleNuevoInsumoBlur("precioAdicion")}
                            onChange={(e) => handleNuevoInsumoChange("precioAdicion", e.target.value)}
                            className={`${inputCls} pl-8 ${
                              (nuevoInsumoTouched.precioAdicion) && nuevoInsumoErrors.precioAdicion
                                ? "border-red-500 bg-red-50/50 dark:bg-red-950/20 text-red-900 focus:ring-red-400"
                                : ""
                            }`}
                          />
                        </div>
                        {(nuevoInsumoTouched.precioAdicion) && nuevoInsumoErrors.precioAdicion && (
                          <p className="flex items-center gap-1 text-[11px] text-red-500 mt-1 font-medium">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            {nuevoInsumoErrors.precioAdicion}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Descripción */}
                  <div>
                    <label className={labelCls}>Descripción (Opcional)</label>
                    <textarea
                      rows={2}
                      placeholder="Notas o descripción del insumo..."
                      value={nuevoInsumoForm.descripcion}
                      onChange={(e) =>
                        setNuevoInsumoForm((prev) => ({ ...prev, descripcion: e.target.value }))
                      }
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* Footer del drawer */}
                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-850 flex items-center justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setPanelNuevoInsumoOpen(false)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={savingNuevoInsumo}
                    className="px-5 py-2 bg-[#F05454] hover:bg-[#d84343] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    {savingNuevoInsumo ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Guardando insumo...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Guardar y Seleccionar</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </>
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

export default NuevaCompraModal;
