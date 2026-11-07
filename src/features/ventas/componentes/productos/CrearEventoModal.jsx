import { useState, useEffect, useRef, useMemo } from "react";
import {
  X, Zap, Tag, Search, Trash2, CalendarClock, Sparkles, UploadCloud, Loader2,
  Utensils, Plus, Minus, Check, Flame, Crown, ChevronRight, ChevronLeft,
  Image as ImageIcon, Clock, Gift, CheckCircle2, Percent, Rocket, Link,
  AlertCircle, Calendar, ArrowRight, ExternalLink, Eye, HelpCircle, Layers,
  ChevronDown, Info, ShieldCheck
} from "lucide-react";
import { eventosService } from "../../servicios/eventosService";
import { categoriaProductosService } from "../../servicios/categoriaProductosService";
import { FichaTecnicaProducto } from "@/features/fichas-tecnicas/componentes/FichaTecnicaProducto";
import { fichasTecnicasService } from "@/features/fichas-tecnicas/servicios/fichasTecnicasService";
import { adicionesService } from "@/features/compras/servicios/adicionesService";
import { productosService } from "@/features/ventas/servicios/productosService";
import { uploadImageToCloudinary } from "@/shared/servicios/cloudinaryService";
import { getAdditionEmoji, stripEmojis, isDummyOrBaseVariant } from "@/shared/utils/foodEmojiUtils";
import { validateTexto, validateNumeroPositivo, validateRequerido, validatePorcentaje } from "@/shared/utils/validationUtils";
import { matchesSmartSearch } from "@/shared/utils/searchUtils";
import {
  FoodIcon,
  AVAILABLE_FOOD_SLUGS,
  StreamlineFlame,
  StreamlineBolt,
  StreamlineDiscountTicket,
  StreamlineDoubleBurger,
  StreamlineGiftBox,
  StreamlineCrown,
  StreamlineCalendarCheck,
  StreamlinePartyPopper,
  StreamlineRocket,
  StreamlineTag,
  IconLightningBolt,
  IconBaconStrip
} from "@/shared/components/ui/FoodIcon";
import { useNotifications } from "@/shared/hooks/useNotifications";

const TIPO_EVENTO_OPTIONS = [
  { value: "2x1 / Combo Especial", icon: StreamlineDoubleBurger, defaultIcon: "2x1", label: "Promoción 2x1", badge: "2X1", desc: "Lleva 2 unidades al precio de 1", color: "from-rose-500 to-red-600" },
  { value: "Descuento", icon: StreamlineDiscountTicket, defaultIcon: "discount", label: "Descuento %", badge: "% OFF", desc: "Rebaja porcentual sobre el precio de carta", color: "from-emerald-500 to-teal-600" },
  { value: "Promoción Precio", icon: StreamlineTag, defaultIcon: "tag", label: "Precio Especial", badge: "OFERTA", desc: "Precio promocional fijo y rebajado", color: "from-amber-500 to-orange-600" },
  { value: "Añadir Insumos", icon: IconBaconStrip, defaultIcon: "bacon", label: "Topping Extra", badge: "GRATIS", desc: "Topping o ingrediente de cortesía sin costo", color: "from-purple-500 to-indigo-600" },
  { value: "Edición Especial", icon: StreamlineCrown, defaultIcon: "crown", label: "Edición Especial", badge: "FESTIVAL", desc: "Campaña gastronómica o temporada exclusiva", color: "from-orange-500 to-amber-600" },
  { value: "Hora Feliz / Oferta Relámpago", icon: IconLightningBolt, defaultIcon: "flash", label: "Oferta Relámpago", badge: "FLASH", desc: "Promoción express por tiempo limitado", color: "from-yellow-500 to-amber-600" }
];

const PROD_EVENT_TYPES = [
  { value: "EDICION_LIMITADA", label: "Edición Limitada", icon: StreamlineFlame, defaultIcon: "fire", desc: "Platillo festivalero exclusivo y conmemorativo", activeCls: "border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 ring-2 ring-amber-400/40" },
  { value: "COMBO_ESPECIAL", label: "Combo Festivo", icon: StreamlineGiftBox, defaultIcon: "gift", desc: "Platillo principal + acompañamiento + bebida", activeCls: "border-orange-500 bg-orange-50 dark:bg-orange-950/40 text-orange-900 dark:text-orange-200 ring-2 ring-orange-400/40" },
  { value: "PROMOCION_2X1", label: "Promoción 2x1", icon: StreamlineDoubleBurger, defaultIcon: "2x1", desc: "Lleva 2 unidades pagando el precio de 1", activeCls: "border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 ring-2 ring-rose-400/40" },
  { value: "DESCUENTO", label: "Precio Rebajado", icon: StreamlineDiscountTicket, defaultIcon: "discount", desc: "Descuento directo sobre su precio de carta", activeCls: "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-400/40" }
];

const BADGES_GASTRONOMICOS = [
  "Edición Festival",
  "Recomendado del Chef",
  "Picante Gourmet",
  "Plato Estrella",
  "Opción Veggie",
  "Extra Queso"
];

const QUICK_DISCOUNTS = [10, 15, 20, 25, 30, 50];

const normalizeTipoEvento = (raw) => {
  if (!raw) return "2x1 / Combo Especial";
  const low = String(raw).toLowerCase().trim();
  if (low.includes("2x1") || low.includes("dos por uno")) return "2x1 / Combo Especial";
  if (low.includes("combo")) return "2x1 / Combo Especial";
  if (low.includes("descuento") || low.includes("discount") || low.includes("%")) return "Descuento";
  if (low.includes("precio") || low.includes("flash") || low.includes("relampago") || low.includes("relámpago")) return "Promoción Precio";
  if (low.includes("insumo") || low.includes("topping") || low.includes("cortesia") || low.includes("cortesía")) return "Añadir Insumos";
  if (low.includes("edicion") || low.includes("edición") || low.includes("festival") || low.includes("limitada")) return "Edición Especial";
  return "2x1 / Combo Especial";
};

export function CrearEventoModal({ isOpen, onClose, producto, onCreated, eventoToEdit = null }) {
  const { success, warning: notifyWarning, error: notifyError } = useNotifications();
  const isEditing = Boolean(eventoToEdit);
  const currentProducto = producto || eventoToEdit?.producto || null;

  // Modo Principal: Vincular existentes (false) vs Crear platillo nuevo (true)
  const [modoCrearProducto, setModoCrearProducto] = useState(false);

  // Stepper activo (1, 2 o 3)
  const [activeStep, setActiveStep] = useState(1);

  // Estados Campaña / Evento
  const [tipoEvento, setTipoEvento] = useState("2x1 / Combo Especial");
  const [icono, setIcono] = useState("fire");
  const [isTemporal, setIsTemporal] = useState(false);
  const [nombreEvento, setNombreEvento] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [eventoImagen, setEventoImagen] = useState("");

  // Estados para Beneficio / Descuento / Precio Especial
  const [descuento, setDescuento] = useState("");
  const [nuevoPrecio, setNuevoPrecio] = useState("");
  const [accion, setAccion] = useState("Agregar");
  const [insumoSearch, setInsumoSearch] = useState("");
  const [insumosBD, setInsumosBD] = useState([]);
  const [filteredInsumos, setFilteredInsumos] = useState([]);
  const [showInsumoDropdown, setShowInsumoDropdown] = useState(false);
  const [insumosSeleccionados, setInsumosSeleccionados] = useState([]);

  // Estados para Eventos Globales (Múltiples Productos)
  const [productoSearch, setProductoSearch] = useState("");
  const [productosBD, setProductosBD] = useState([]);
  const [filteredProductos, setFilteredProductos] = useState([]);
  const [showProductoDropdown, setShowProductoDropdown] = useState(false);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [selectedCategoriaFilter, setSelectedCategoriaFilter] = useState("TODAS");

  // Estados para Crear Producto Nuevo de Evento
  const [prodNombre, setProdNombre] = useState("");
  const [prodCategoria, setProdCategoria] = useState(3);
  const [prodPrecioRegular, setProdPrecioRegular] = useState("");
  const [prodPrecioEvento, setProdPrecioEvento] = useState("");
  const [prodDescripcion, setProdDescripcion] = useState("");
  const [prodImagen, setProdImagen] = useState("");
  const [categoriasBD, setCategoriasBD] = useState([]);
  const [prodTipoEvento, setProdTipoEvento] = useState("EDICION_LIMITADA");
  const [prodEstadoInicial, setProdEstadoInicial] = useState("Activo");
  const [prodRendimiento, setProdRendimiento] = useState("1 porción");
  const [prodVigenciaTipo, setProdVigenciaTipo] = useState("temporal");
  const [prodEtiquetas, setProdEtiquetas] = useState(["Edición Festival"]);
  const [prodDestacadoWeb, setProdDestacadoWeb] = useState(true);
  const [prodFichaTecnica, setProdFichaTecnica] = useState(null);
  const [prodVariantes, setProdVariantes] = useState([]);
  const [todasAdiciones, setTodasAdiciones] = useState([]);
  const [adicionSearch, setAdicionSearch] = useState("");
  const [comboModoBebidas, setComboModoBebidas] = useState("todas"); // 'todas' | 'especificas'
  const [adicionesSeleccionadas, setAdicionesSeleccionadas] = useState([]);
  const [adicionesSearch, setAdicionesSearch] = useState("");
  const [todasBebidas, setTodasBebidas] = useState([]);
  const [configCombo, setConfigCombo] = useState({ esCombo: false, cantidadBebidas: 1, bebidasPermitidas: [] });
  const [tieneCortesia, setTieneCortesia] = useState(false);
  const [toppingCortesia, setToppingCortesia] = useState({ idInsumo: "", nombre: "", cantidad: 1, unidadMedida: "und" });

  // Subida de Imagen
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const fileInputRef = useRef(null);
  const [showManualUrl, setShowManualUrl] = useState(false);

  // Estados de Proceso y Validación
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // Inicialización y Carga de Datos
  useEffect(() => {
    if (!isOpen) return;

    setActiveStep(1);
    setFormErrors({});
    setTouched({});
    setSubmitted(false);

    const now = new Date();
    const localToday = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const future = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
    const localFuture = `${future.getFullYear()}-${String(future.getMonth() + 1).padStart(2, "0")}-${String(future.getDate()).padStart(2, "0")}`;

    if (eventoToEdit) {
      setModoCrearProducto(false);
      setTipoEvento(normalizeTipoEvento(eventoToEdit.tipoEvento));
      setIcono(eventoToEdit.icono || "fire");
      setIsTemporal(Boolean(eventoToEdit.fechaFin));
      setNombreEvento(stripEmojis(eventoToEdit.nombreEvento || eventoToEdit.nombre || ""));
      setDescripcion(stripEmojis(eventoToEdit.descripcion || ""));
      setFechaInicio(eventoToEdit.fechaInicio ? String(eventoToEdit.fechaInicio).split("T")[0] : localToday);
      setFechaFin(eventoToEdit.fechaFin ? String(eventoToEdit.fechaFin).split("T")[0] : localFuture);
      setNuevoPrecio(eventoToEdit.nuevoPrecio != null ? String(eventoToEdit.nuevoPrecio) : "");
      setDescuento(eventoToEdit.descuento != null ? String(eventoToEdit.descuento) : "");

      let parsedInsumos = [];
      try {
        parsedInsumos = typeof eventoToEdit.insumosAsociados === "string" ? JSON.parse(eventoToEdit.insumosAsociados) : (eventoToEdit.insumos || []);
      } catch (e) {
        parsedInsumos = [];
      }
      setInsumosSeleccionados(Array.isArray(parsedInsumos) ? parsedInsumos : []);

      let parsedProds = [];
      try {
        parsedProds = typeof eventoToEdit.productosAsociados === "string" ? JSON.parse(eventoToEdit.productosAsociados) : (eventoToEdit.productos || []);
      } catch (e) {
        parsedProds = [];
      }
      if (Array.isArray(parsedProds) && parsedProds.length === 0 && (eventoToEdit.idProducto || eventoToEdit.producto)) {
        const pObj = eventoToEdit.producto;
        parsedProds = [{
          id: eventoToEdit.idProducto || pObj?.id || pObj?.idProducto,
          nombre: pObj?.nombre || 'Producto Principal',
          precioBase: pObj?.precio || 0,
          nuevoPrecio: eventoToEdit.nuevoPrecio != null ? String(eventoToEdit.nuevoPrecio) : '',
          descuento: eventoToEdit.descuento != null ? String(eventoToEdit.descuento) : ''
        }];
      }
      setProductosSeleccionados(Array.isArray(parsedProds) ? parsedProds : []);

      const existingImg = eventoToEdit.imagen || eventoToEdit.producto?.imagen || "";
      setEventoImagen(existingImg);
      setImagePreviewUrl(existingImg);
    } else {
      setModoCrearProducto(false);
      setTipoEvento("2x1 / Combo Especial");
      setIcono("fire");
      setIsTemporal(false);
      setNombreEvento(currentProducto ? `Especial: ${currentProducto.nombre}` : "");
      setDescripcion(currentProducto ? `¡Aprovecha esta promoción exclusiva por tiempo limitado en ${currentProducto.nombre}!` : "");
      setFechaInicio(localToday);
      setFechaFin(localFuture);
      setNuevoPrecio("");
      setDescuento("15");
      setInsumosSeleccionados([]);
      setEventoImagen(currentProducto?.imagen || "");
      setImagePreviewUrl(currentProducto?.imagen || "");

      // Si viene un producto específico, preseleccionarlo
      if (currentProducto) {
        setProductosSeleccionados([{
          id: currentProducto.id || currentProducto.idProducto,
          nombre: currentProducto.nombre,
          precioBase: currentProducto.precio,
          nuevoPrecio: "",
          descuento: "15"
        }]);
      } else {
        setProductosSeleccionados([]);
      }

      // Reset producto nuevo
      setProdNombre("");
      setProdCategoria(3);
      setProdPrecioRegular("");
      setProdPrecioEvento("");
      setProdDescripcion("");
      setProdImagen("");
      setProdFichaTecnica(null);
      setProdVariantes([]);
      setAdicionesSeleccionadas([]);
    }

    // Cargar catálogos auxiliares
    eventosService.getInsumos().then(d => setInsumosBD(d || [])).catch(() => setInsumosBD([]));
    categoriaProductosService.getCategorias().then(d => setCategoriasBD(d || [])).catch(() => setCategoriasBD([]));
    adicionesService.getAdiciones().then(d => setTodasAdiciones(Array.isArray(d) ? d.filter(a => a.estado === 1 || a.estado === "Activo" || a.estado === undefined) : [])).catch(() => setTodasAdiciones([]));
    productosService.getProductos().then(prods => {
      setProductosBD(prods || []);
      const bebidas = (prods || []).filter(p => {
        const cat = String(p.categoria || "").toLowerCase();
        return cat.includes("bebida") || cat.includes("gaseos") || cat.includes("agua");
      });
      setTodasBebidas(bebidas);
    }).catch(() => {
      setProductosBD([]);
      setTodasBebidas([]);
    });
  }, [isOpen, eventoToEdit, currentProducto]);

  // Manejo de Subida de Imagen
  const handleImageSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      notifyWarning("Archivo Inválido", "Solo se admiten archivos de imagen (JPG, PNG, WEBP).");
      return;
    }

    const localBlob = URL.createObjectURL(file);
    setImagePreviewUrl(localBlob);

    try {
      setUploadingImage(true);
      const secureUrl = await uploadImageToCloudinary(file);
      setEventoImagen(secureUrl);
      setProdImagen(secureUrl);
      setImagePreviewUrl(secureUrl);
      success("Imagen Subida", "La imagen se cargó exitosamente en Cloudinary.");
    } catch (err) {
      console.error("Error al subir a Cloudinary:", err);
      notifyError("Error al subir imagen", err.message || "No se pudo subir la imagen.");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = () => {
    setEventoImagen("");
    setProdImagen("");
    setImagePreviewUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Filtrado de Insumos para Topping Extra
  useEffect(() => {
    if (!insumoSearch.trim()) {
      setFilteredInsumos([]);
      setShowInsumoDropdown(false);
    } else {
      const term = insumoSearch.toLowerCase();
      const results = (insumosBD || []).filter(i => {
        const match = (i.nombre || "").toLowerCase().includes(term);
        const already = insumosSeleccionados.some(s => String(s.id) === String(i.id || i.idInsumo));
        return match && !already;
      });
      setFilteredInsumos(results.slice(0, 6));
      setShowInsumoDropdown(results.length > 0);
    }
  }, [insumoSearch, insumosBD, insumosSeleccionados]);

  // Filtrado de Productos para Asignación
  useEffect(() => {
    if (producto) return;
    if (!productoSearch.trim()) {
      setFilteredProductos([]);
      setShowProductoDropdown(false);
    } else {
      const term = productoSearch.toLowerCase();
      const results = (productosBD || []).filter(p => {
        const match = (p.nombre || "").toLowerCase().includes(term) || (p.categoria || "").toLowerCase().includes(term);
        const already = productosSeleccionados.some(s => String(s.id) === String(p.id || p.idProducto));
        return match && !already;
      });
      setFilteredProductos(results.slice(0, 8));
      setShowProductoDropdown(results.length > 0);
    }
  }, [productoSearch, productosBD, productosSeleccionados, producto]);

  const handleSelectProducto = (prod) => {
    setProductosSeleccionados(prev => [
      ...prev,
      {
        id: prod.id || prod.idProducto,
        nombre: prod.nombre,
        categoria: prod.categoria || "Platillo",
        precioBase: prod.precio,
        imagen: prod.imagen || "",
        nuevoPrecio: "",
        descuento: descuento || "15"
      }
    ]);
    setProductoSearch("");
    setShowProductoDropdown(false);
  };

  const handleRemoveProducto = (idx) => {
    setProductosSeleccionados(prev => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateProductoBenefit = (idx, field, value) => {
    setProductosSeleccionados(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const handleSelectAllInCategoria = (catNombre) => {
    const prodsInCat = (productosBD || []).filter(p => {
      const matchCat = catNombre === "TODAS" || (p.categoria || "").toLowerCase() === catNombre.toLowerCase();
      const already = productosSeleccionados.some(s => String(s.id) === String(p.id || p.idProducto));
      return matchCat && !already;
    });

    if (prodsInCat.length === 0) {
      notifyWarning("Sin productos", `No hay productos adicionales disponibles en "${catNombre}".`);
      return;
    }

    setProductosSeleccionados(prev => [
      ...prev,
      ...prodsInCat.map(p => ({
        id: p.id || p.idProducto,
        nombre: p.nombre,
        categoria: p.categoria || "Platillo",
        precioBase: p.precio,
        imagen: p.imagen || "",
        nuevoPrecio: "",
        descuento: descuento || "15"
      }))
    ]);
    success("Productos Agregados", `Se añadieron ${prodsInCat.length} productos a la campaña.`);
  };

  // Cálculo de duración
  const diasVigenciaCampaña = useMemo(() => {
    if (!fechaInicio || !fechaFin) return null;
    const ini = new Date(`${fechaInicio}T00:00:00`);
    const fin = new Date(`${fechaFin}T23:59:59`);
    const diffMs = fin.getTime() - ini.getTime();
    if (diffMs < 0) return 0;
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }, [fechaInicio, fechaFin]);

  // Validaciones por paso antes de avanzar
  const handleNextStep = () => {
    if (modoCrearProducto) {
      // Modo B: Crear Producto de Evento
      if (activeStep === 1) {
        if (!nombreEvento.trim()) {
          notifyWarning("Título Requerido", "Por favor ingresa el título de la campaña o festival.");
          return;
        }
        if (!prodNombre.trim()) {
          notifyWarning("Nombre de Platillo Requerido", "Por favor ingresa el nombre del nuevo producto.");
          return;
        }
        if (!prodPrecioRegular || Number(prodPrecioRegular) <= 0) {
          notifyWarning("Precio Requerido", "Por favor ingresa el precio regular del platillo.");
          return;
        }
        if (!prodPrecioEvento || Number(prodPrecioEvento) <= 0) {
          notifyWarning("Precio de Evento Requerido", "Por favor ingresa el precio especial de evento.");
          return;
        }
        setActiveStep(2);
      } else if (activeStep === 2) {
        const ft = prodFichaTecnica || {};
        const ingredientes = ft.detalles || ft.insumos || ft.ingredientes || [];
        if (!ingredientes || ingredientes.length === 0) {
          notifyWarning("Ficha Técnica Obligatoria", "Por favor agrega al menos un ingrediente o insumo a la Ficha Técnica del platillo.");
          return;
        }
        setActiveStep(3);
      }
    } else {
      // Modo A: Vincular a Producto(s) Existente(s)
      if (activeStep === 1) {
        if (!tipoEvento) {
          notifyWarning("Selecciona Dinámica", "Por favor elige el tipo de beneficio de la promoción.");
          return;
        }
        if (!nombreEvento.trim()) {
          notifyWarning("Título Requerido", "Por favor ingresa el título de la campaña.");
          return;
        }
        if (tipoEvento === "Descuento" && (!descuento || Number(descuento) <= 0 || Number(descuento) > 100)) {
          notifyWarning("Descuento Inválido", "Por favor especifica un porcentaje de descuento válido (entre 1% y 100%).");
          return;
        }
        if (tipoEvento === "Promoción Precio" && currentProducto && (!nuevoPrecio || Number(nuevoPrecio) <= 0)) {
          notifyWarning("Precio Promocional Inválido", "Por favor ingresa un precio promocional válido.");
          return;
        }
        if (tipoEvento === "Añadir Insumos" && insumosSeleccionados.length === 0) {
          notifyWarning("Topping Requerido", "Por favor selecciona el insumo o topping de cortesía.");
          return;
        }
        setActiveStep(2);
      } else if (activeStep === 2) {
        if (productosSeleccionados.length === 0) {
          notifyWarning("Selecciona Productos", "Debes incluir al menos un producto en la campaña.");
          return;
        }
        setActiveStep(3);
      }
    }
  };

  // Envío del Formulario
  const handleSubmit = async () => {
    setSubmitted(true);

    if (modoCrearProducto) {
      // Validaciones finales Modo B
      if (uploadingImage) {
        notifyWarning("Subiendo Imagen", "Por favor espera a que la imagen culmine de subirse.");
        return;
      }
      if (prodVigenciaTipo === "temporal" && fechaFin && fechaInicio && new Date(fechaFin) < new Date(fechaInicio)) {
        notifyWarning("Fechas Inválidas", "La fecha fin no puede ser anterior a la fecha de inicio.");
        return;
      }

      const ft = prodFichaTecnica || {};
      const ingredientes = ft.detalles || ft.insumos || ft.ingredientes || [];
      if (!ingredientes || ingredientes.length === 0) {
        setActiveStep(2);
        notifyWarning("Ficha Técnica Incompleta", "No se puede registrar un platillo sin su Ficha Técnica.");
        return;
      }

      setSaving(true);
      try {
        const descParts = [prodDescripcion.trim()];
        if (prodEtiquetas.length > 0) descParts.push(`[${prodEtiquetas.join(", ")}]`);
        if (prodDestacadoWeb) descParts.push("[DESTACADO_WEB]");

        const payload = {
          crearComoProducto: true,
          nombreEvento: nombreEvento.trim(),
          descripcion: descParts.filter(Boolean).join(" ") || "Edición especial gastronómica de tiempo limitado.",
          tipoEvento: prodTipoEvento || "EDICION_LIMITADA",
          icono: icono || "fire",
          imagen: (eventoImagen || prodImagen || "").trim() || null,
          isTemporal: prodVigenciaTipo === "temporal",
          fechaInicio: prodVigenciaTipo === "temporal" ? fechaInicio : null,
          fechaFin: prodVigenciaTipo === "temporal" ? fechaFin : null,
          nuevoPrecio: Number(prodPrecioEvento),
          descuento: Math.round(((Number(prodPrecioRegular) - Number(prodPrecioEvento)) / Number(prodPrecioRegular)) * 100),
          estado: prodEstadoInicial === "Activo" ? "Activo" : "Inactivo",
          accion: tieneCortesia && toppingCortesia.idInsumo ? "Añadir" : null,
          insumos: tieneCortesia && toppingCortesia.idInsumo ? [{
            idInsumo: Number(toppingCortesia.idInsumo),
            nombre: toppingCortesia.nombre,
            cantidad: Number(toppingCortesia.cantidad || 1),
            unidadMedida: toppingCortesia.unidadMedida || "und"
          }] : null,
          productoNuevo: {
            nombre: prodNombre.trim(),
            descripcion: prodDescripcion.trim() || "Edición especial gastronómica de tiempo limitado.",
            precio: Number(prodPrecioRegular),
            idCategoriaProducto: Number(prodCategoria || 3),
            imagen: prodImagen.trim(),
            procedimiento: prodFichaTecnica?.procedimiento || 'Preparar con los más selectos ingredientes de temporada.',
            tiempoPreparacion: Number(prodFichaTecnica?.tiempoPreparacion) || 12,
            rendimiento: prodFichaTecnica?.rendimiento || prodRendimiento || '1 porción',
            especificaciones: prodFichaTecnica?.especificaciones || '',
            caracteristicas: prodFichaTecnica?.caracteristicas || '',
            informacionNutricional: prodFichaTecnica?.informacionNutricional || '',
            condicionesAlmacenamiento: prodFichaTecnica?.condicionesAlmacenamiento || '',
            vidaUtil: prodFichaTecnica?.vidaUtil || '',
            observaciones: prodFichaTecnica?.observaciones || '',
            estado: prodEstadoInicial === "Activo" ? 1 : 0,
            adiciones: adicionesSeleccionadas,
            configuracionCombo: configCombo.esCombo ? configCombo : null,
            variantes: prodVariantes
              .filter(v => v.nombre?.trim() && !isDummyOrBaseVariant(v.nombre, prodNombre))
              .map(v => ({ nombre: v.nombre.trim(), precio: Number(v.precio || prodPrecioEvento) })),
            fichaTecnica: prodFichaTecnica || null,
            insumosFicha: ft.detalles || ft.insumos || []
          }
        };

        const res = await eventosService.createEvento(payload);
        const createdProdId = res?.idProducto || res?.producto?.idProducto || res?.producto?.id;
        if (createdProdId && prodFichaTecnica && !configCombo.esCombo) {
          try {
            await fichasTecnicasService.saveFichaProducto(createdProdId, prodFichaTecnica);
          } catch (e) {
            console.warn("Ficha técnica sincronizada por createEvento:", e);
          }
        }
        success("¡Producto de Evento Creado!", `Se creó "${prodNombre.trim()}" con su ficha técnica, adiciones y evento activo.`);
        if (onCreated) onCreated();
        onClose();
      } catch (err) {
        console.error("Error al crear producto de evento:", err);
        notifyError("Error al crear evento", err.response?.data?.message || err.message || "Ocurrió un error inesperado.");
      } finally {
        setSaving(false);
      }
      return;
    }

    // Modo A: Vincular a Producto(s) Existente(s)
    if (!nombreEvento.trim()) {
      setActiveStep(1);
      notifyWarning("Título Requerido", "El título de la campaña es obligatorio.");
      return;
    }
    if (productosSeleccionados.length === 0) {
      setActiveStep(2);
      notifyWarning("Sin Productos", "Debes seleccionar al menos un producto para aplicar la promoción.");
      return;
    }
    if (isTemporal && fechaFin && fechaInicio && new Date(fechaFin) < new Date(fechaInicio)) {
      setActiveStep(3);
      notifyWarning("Fechas Inválidas", "La fecha fin no puede ser anterior a la fecha de inicio.");
      return;
    }

    setSaving(true);
    try {
      const primaryProdId = producto?.id || producto?.idProducto || (productosSeleccionados.length > 0 ? (productosSeleccionados[0].id || productosSeleccionados[0].idProducto) : null) || eventoToEdit?.idProducto || null;

      const payload = {
        productoId: primaryProdId,
        idProducto: primaryProdId,
        tipoEvento,
        icono: icono || "fire",
        imagen: (eventoImagen || "").trim() || null,
        isTemporal,
        nombreEvento: stripEmojis(nombreEvento.trim()),
        descripcion: stripEmojis(descripcion.trim()),
        estado: "Activo"
      };

      if (isTemporal) {
        payload.fechaInicio = fechaInicio;
        payload.fechaFin = fechaFin;
      } else {
        payload.fechaInicio = null;
        payload.fechaFin = null;
      }

      if (tipoEvento === "Añadir Insumos") {
        payload.accion = accion || "Añadir";
        payload.insumos = insumosSeleccionados;
        if (nuevoPrecio) payload.nuevoPrecio = Number(nuevoPrecio);
      }

      if (tipoEvento === "Descuento") {
        payload.descuento = Number(descuento);
      } else if (tipoEvento === "Promoción Precio") {
        payload.nuevoPrecio = Number(nuevoPrecio);
      } else if (tipoEvento === "2x1 / Combo Especial") {
        payload.descuento = 50;
        if (nuevoPrecio) payload.nuevoPrecio = Number(nuevoPrecio);
      }

      if (productosSeleccionados.length > 0) {
        payload.productos = productosSeleccionados.map(p => ({
          idProducto: p.id || p.idProducto,
          nombre: p.nombre,
          precioBase: p.precioBase || p.precio,
          nuevoPrecio: tipoEvento === "Promoción Precio" ? Number(p.nuevoPrecio || nuevoPrecio) : null,
          descuento: tipoEvento === "Descuento" ? Number(p.descuento || descuento) : (tipoEvento === "2x1 / Combo Especial" ? 50 : null)
        }));
      }

      if (isEditing) {
        const eventId = eventoToEdit.id || eventoToEdit.idEvento;
        await eventosService.updateEvento(eventId, payload);
        success("¡Evento Actualizado!", "Los parámetros de la campaña se han actualizado correctamente.");
      } else {
        await eventosService.createEvento(payload);
        success("¡Evento Creado!", "La campaña y sus productos asociados se han publicado con éxito.");
      }

      if (onCreated) onCreated();
      onClose();
    } catch (err) {
      console.error("Error al procesar evento:", err);
      notifyError("Error al procesar evento", err.response?.data?.message || err.message || "Ocurrió un error inesperado.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-5xl w-full shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col max-h-[92vh] transition-all">

        {/* ═══ 1. HEADER DE IMPACTO VISUAL ═══ */}
        <div className="bg-linear-to-r from-orange-600 via-amber-600 to-red-600 p-4 sm:p-5 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/25 shadow-inner">
              <Sparkles className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight leading-none text-white">
                  {isEditing
                    ? "Editar Campaña / Evento"
                    : modoCrearProducto
                    ? "Lanzar Nuevo Platillo de Evento"
                    : currentProducto
                    ? `Crear Campaña para ${currentProducto.nombre}`
                    : "Crear Campaña o Promoción"}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white border border-white/30">
                  {modoCrearProducto ? "Producto Nuevo" : "Productos Existentes"}
                </span>
              </div>
              <p className="text-xs text-amber-100 font-medium mt-1">
                {modoCrearProducto
                  ? "Crea un producto exclusivo con su receta culinaria para festivales o ediciones especiales."
                  : "Aplica descuentos, 2x1 o beneficios a platillos ya existentes en tu menú."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/15 transition-colors cursor-pointer"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ═══ 2. SELECTOR DE MODALIDAD (SOLO AL CREAR DESDE CERO) ═══ */}
        {!currentProducto && !isEditing && (
          <div className="px-5 pt-4 pb-1 shrink-0 bg-gray-50/80 dark:bg-gray-850 border-b border-gray-100 dark:border-gray-800">
            <div className="grid grid-cols-2 gap-3 max-w-2xl mx-auto">
              <button
                type="button"
                onClick={() => { setModoCrearProducto(false); setActiveStep(1); }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                  !modoCrearProducto
                    ? "border-orange-500 bg-white dark:bg-gray-900 shadow-md ring-2 ring-orange-400/30 text-orange-950 dark:text-orange-200"
                    : "border-gray-200 dark:border-gray-800 bg-gray-100/60 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800"
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${!modoCrearProducto ? "bg-orange-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500"}`}>
                  <Tag className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-wide">Promoción para Menú Existente</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">2x1, % OFF o Toppings en platillos actuales</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => { setModoCrearProducto(true); setActiveStep(1); }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                  modoCrearProducto
                    ? "border-amber-500 bg-white dark:bg-gray-900 shadow-md ring-2 ring-amber-400/30 text-amber-950 dark:text-amber-200"
                    : "border-gray-200 dark:border-gray-800 bg-gray-100/60 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800"
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${modoCrearProducto ? "bg-amber-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500"}`}>
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-wide">Nuevo Platillo de Festival</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">Crear producto con Ficha Técnica desde cero</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ═══ 3. STEPPER VISUAL CON BREADCRUMBS ═══ */}
        <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
          <div className="flex items-center justify-center gap-2 sm:gap-6 max-w-3xl mx-auto">
            {(!modoCrearProducto
              ? [
                  { num: 1, label: "1. Dinámica & Beneficio", desc: "Tipo de oferta y título" },
                  { num: 2, label: `2. Productos (${productosSeleccionados.length})`, desc: "Platillos participantes" },
                  { num: 3, label: "3. Banner & Vigencia", desc: "Fechas y vista previa" }
                ]
              : [
                  { num: 1, label: "1. Platillo & Oferta", desc: "Nombre, categoría y precios" },
                  { num: 2, label: "2. Ficha Técnica", desc: "Receta e ingredientes" },
                  { num: 3, label: "3. Variantes & Publicación", desc: "Presentaciones y vigencia" }
                ]
            ).map((st, idx) => {
              const isCurrent = activeStep === st.num;
              const isPast = activeStep > st.num;
              return (
                <div key={st.num} className="flex items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveStep(st.num)}
                    className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer text-xs font-black ${
                      isCurrent
                        ? "bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 ring-1 ring-orange-500/40"
                        : isPast
                        ? "text-emerald-700 dark:text-emerald-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                        : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
                      isCurrent
                        ? "bg-orange-600 text-white shadow-xs"
                        : isPast
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                    }`}>
                      {isPast ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : st.num}
                    </span>
                    <div className="text-left hidden sm:block">
                      <p className="leading-tight">{st.label}</p>
                      <p className="text-[10px] font-normal text-gray-500 dark:text-gray-400">{st.desc}</p>
                    </div>
                  </button>
                  {idx < 2 && <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-700 shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══ 4. CUERPO DEL MODAL (ESPACIO OPTIMIZADO) ═══ */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50/50 dark:bg-gray-900/50 space-y-6">

          {/* ═══════════════════════════════════════════════════════════════════════
              MODALIDAD A: VINCULAR PRODUCTOS EXISTENTES A EVENTO / PROMOCIÓN
          ═══════════════════════════════════════════════════════════════════════════ */}
          {!modoCrearProducto && (
            <>
              {/* ── PASO 1: DINÁMICA & BENEFICIO ── */}
              {activeStep === 1 && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
                  {/* Columna Izquierda: Formulario de Dinámica (7 columnas) */}
                  <div className="lg:col-span-7 space-y-5">
                    {/* Tarjetas de Dinámica */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-gray-800 dark:text-gray-200 mb-2">
                        ¿Qué beneficio o dinámica ofrecerá la campaña? *
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {TIPO_EVENTO_OPTIONS.map((opt) => {
                          const isSel = tipoEvento === opt.value;
                          const Icon = opt.icon;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                setTipoEvento(opt.value);
                                if (opt.defaultIcon) setIcono(opt.defaultIcon);
                              }}
                              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between select-none ${
                                isSel
                                  ? "border-orange-500 bg-white dark:bg-gray-800 shadow-md ring-2 ring-orange-400/40 text-orange-950 dark:text-orange-200"
                                  : "border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 hover:border-gray-300 hover:bg-white text-gray-700 dark:text-gray-300"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-white bg-linear-to-br ${opt.color} shadow-xs`}>
                                  <Icon size={16} stroke={2} />
                                </span>
                                {isSel && <CheckCircle2 className="w-4 h-4 text-orange-600 dark:text-orange-400" />}
                              </div>
                              <span className="text-xs font-black truncate">{opt.label}</span>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">{opt.desc}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Parámetros Específicos del Beneficio */}
                    <div className="bg-white dark:bg-gray-850 p-4 sm:p-5 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 space-y-4 shadow-xs">
                      {tipoEvento === "Descuento" && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-black uppercase tracking-wider text-gray-800 dark:text-gray-200">
                              Porcentaje de Descuento General *
                            </label>
                            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                              {descuento ? `${descuento}% OFF` : "Define un porcentaje"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mb-2.5">
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={descuento}
                              onChange={(e) => setDescuento(e.target.value)}
                              placeholder="Ej. 15"
                              className="w-28 px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-black focus:ring-2 focus:ring-orange-500"
                            />
                            <span className="text-sm font-black text-gray-500">% de descuento</span>
                          </div>
                          {/* Badges Rápidos de Descuento */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-bold text-gray-400 uppercase mr-1">Rápidos:</span>
                            {QUICK_DISCOUNTS.map((d) => (
                              <button
                                key={d}
                                type="button"
                                onClick={() => setDescuento(String(d))}
                                className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                                  Number(descuento) === d
                                    ? "bg-emerald-600 text-white shadow-xs"
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-emerald-50"
                                }`}
                              >
                                {d}% OFF
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {tipoEvento === "Promoción Precio" && (
                        <div>
                          <label className="block text-xs font-black uppercase tracking-wider text-gray-800 dark:text-gray-200 mb-1.5">
                            Precio Especial Rebajado ($ COP) *
                          </label>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2">
                            {currentProducto
                              ? `Precio actual en carta: $${Number(currentProducto.precio || 0).toLocaleString("es-CO")}. Define el nuevo precio de oferta.`
                              : "Define el precio promocional que se aplicará a los productos asignados."}
                          </p>
                          <div className="relative max-w-xs">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                            <input
                              type="number"
                              value={nuevoPrecio}
                              onChange={(e) => setNuevoPrecio(e.target.value)}
                              placeholder="Ej. 18000"
                              className="w-full pl-8 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-black focus:ring-2 focus:ring-orange-500"
                            />
                          </div>
                        </div>
                      )}

                      {tipoEvento === "Añadir Insumos" && (
                        <div>
                          <label className="block text-xs font-black uppercase tracking-wider text-gray-800 dark:text-gray-200 mb-1.5">
                            Topping o Insumo de Cortesía *
                          </label>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2.5">
                            El comensal recibirá este ingrediente adicional de forma gratuita con el platillo.
                          </p>
                          <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              value={insumoSearch}
                              onChange={(e) => setInsumoSearch(e.target.value)}
                              placeholder="Buscar insumo (ej. Tocineta, Queso Mozzarella)..."
                              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-orange-500"
                            />
                            {showInsumoDropdown && (
                              <div className="absolute z-20 left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                                {filteredInsumos.map((ins) => (
                                  <button
                                    key={ins.id || ins.idInsumo}
                                    type="button"
                                    onClick={() => {
                                      setInsumosSeleccionados([{ id: ins.id || ins.idInsumo, nombre: ins.nombre, cantidad: 1, unidad: ins.unidadMedida || "und" }]);
                                      setInsumoSearch("");
                                      setShowInsumoDropdown(false);
                                    }}
                                    className="w-full px-4 py-2 text-left text-xs hover:bg-orange-50 dark:hover:bg-gray-700 flex items-center justify-between cursor-pointer"
                                  >
                                    <span className="font-bold text-gray-800 dark:text-gray-200">{ins.nombre}</span>
                                    <span className="text-[10px] text-gray-400">Stock: {ins.stock || 0} {ins.unidadMedida}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {insumosSeleccionados.length > 0 && (
                            <div className="mt-3 p-3.5 bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 flex items-center justify-center shrink-0">
                                  <Gift className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-black text-purple-950 dark:text-purple-200 truncate">
                                    {insumosSeleccionados[0].nombre}
                                  </p>
                                  <p className="text-[10.5px] text-purple-700 dark:text-purple-300 font-medium">
                                    Topping adicional incluido sin costo con el platillo
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                                <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Cantidad:</span>
                                <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-xl border border-purple-300 dark:border-purple-700 p-0.5 shadow-2xs">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setInsumosSeleccionados(prev => [{
                                        ...prev[0],
                                        cantidad: Math.max(1, (Number(prev[0].cantidad) || 1) - 1)
                                      }]);
                                    }}
                                    className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-black cursor-pointer transition"
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    min="1"
                                    max="50"
                                    value={insumosSeleccionados[0].cantidad || 1}
                                    onChange={(e) => {
                                      const val = Math.max(1, Number(e.target.value) || 1);
                                      setInsumosSeleccionados(prev => [{
                                        ...prev[0],
                                        cantidad: val
                                      }]);
                                    }}
                                    className="w-9 text-center text-xs font-black bg-transparent border-0 p-0 text-purple-950 dark:text-purple-200 focus:ring-0"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setInsumosSeleccionados(prev => [{
                                        ...prev[0],
                                        cantidad: (Number(prev[0].cantidad) || 1) + 1
                                      }]);
                                    }}
                                    className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-black cursor-pointer transition"
                                  >
                                    +
                                  </button>
                                </div>
                                <span className="text-xs font-bold text-purple-800 dark:text-purple-300">
                                  {insumosSeleccionados[0].unidad || "porción"}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setInsumosSeleccionados([])}
                                  className="ml-2 text-xs text-red-500 hover:text-red-700 font-bold underline cursor-pointer"
                                >
                                  Cambiar
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {tipoEvento === "2x1 / Combo Especial" && (
                        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 flex items-center gap-3">
                          <StreamlineDoubleBurger size={24} stroke={2} className="text-rose-600 shrink-0" />
                          <div>
                            <p className="text-xs font-black text-rose-950 dark:text-rose-200">Dinámica 2x1 Activada</p>
                            <p className="text-[11px] text-rose-800 dark:text-rose-300 leading-tight">
                              El sistema calculará automáticamente 2 unidades al precio de 1 tanto en el Punto de Venta (POS) como en el Menú Web del Comensal.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Campos Dinámicos para Edición Especial en Menú Existente */}
                      {tipoEvento === "Edición Especial" && (
                        <div className="space-y-3">
                          <div className="p-3 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/60 flex items-start gap-2.5">
                            <Crown className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-black text-orange-900 dark:text-orange-200">Campaña de Festival / Edición Especial</p>
                              <p className="text-[11px] text-orange-800/80 dark:text-orange-300/80 leading-relaxed">
                                Asigna este platillo existente a una campaña oficial (ej. Burger Fest) con precio conmemorativo o descuento exclusivo.
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div>
                              <label className="block text-xs font-black uppercase tracking-wider text-gray-800 dark:text-gray-200 mb-1">
                                Precio Especial de Festival ($ COP)
                              </label>
                              <input
                                type="number"
                                value={nuevoPrecio}
                                onChange={(e) => setNuevoPrecio(e.target.value)}
                                placeholder="Ej. 24000"
                                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-black text-amber-600 focus:ring-2 focus:ring-orange-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-black uppercase tracking-wider text-gray-800 dark:text-gray-200 mb-1">
                                O Descuento de Campaña (%)
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="100"
                                value={descuento}
                                onChange={(e) => setDescuento(e.target.value)}
                                placeholder="Ej. 15"
                                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-black focus:ring-2 focus:ring-orange-500"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Campos Dinámicos para Oferta Relámpago en Menú Existente */}
                      {tipoEvento === "Hora Feliz / Oferta Relámpago" && (
                        <div className="space-y-3">
                          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2.5">
                            <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-black text-amber-900 dark:text-amber-200">Oferta Relámpago / Venta Flash</p>
                              <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
                                Define un precio relámpago con descuento agresivo por tiempo muy limitado para acelerar ventas.
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div>
                              <label className="block text-xs font-black uppercase tracking-wider text-gray-800 dark:text-gray-200 mb-1">
                                Precio Flash Relámpago ($ COP)
                              </label>
                              <input
                                type="number"
                                value={nuevoPrecio}
                                onChange={(e) => setNuevoPrecio(e.target.value)}
                                placeholder="Ej. 17500"
                                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-black text-red-600 focus:ring-2 focus:ring-orange-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-black uppercase tracking-wider text-gray-800 dark:text-gray-200 mb-1">
                                O Descuento Flash (%)
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="100"
                                value={descuento}
                                onChange={(e) => setDescuento(e.target.value)}
                                placeholder="Ej. 25"
                                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-black focus:ring-2 focus:ring-orange-500"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">Descuentos Flash:</span>
                            {[20, 25, 30, 40, 50].map((pct) => (
                              <button
                                key={pct}
                                type="button"
                                onClick={() => setDescuento(String(pct))}
                                className="px-2.5 py-1 rounded-lg text-xs font-black bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:hover:bg-amber-900/80 text-amber-800 dark:text-amber-300 transition cursor-pointer"
                              >
                                -{pct}% FLASH
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Título y Descripción de la Campaña */}
                    <div className="bg-white dark:bg-gray-850 p-4 sm:p-5 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 space-y-3.5 shadow-xs">
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-gray-800 dark:text-gray-200 mb-1">
                          Título de la Campaña / Promoción *
                        </label>
                        <input
                          type="text"
                          value={nombreEvento}
                          onChange={(e) => setNombreEvento(e.target.value)}
                          placeholder="Ej. Jueves 2x1 de Burger Artesanal, Super Fin de Semana..."
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-gray-800 dark:text-gray-200 mb-1">
                          Descripción o Gancho Promocional (Opcional)
                        </label>
                        <textarea
                          rows={2}
                          value={descripcion}
                          onChange={(e) => setDescripcion(e.target.value)}
                          placeholder="Describe brevemente la oferta para cautivar a tus comensales..."
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Columna Derecha: Live Preview de la Tarjeta Promocional (5 columnas) */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="bg-slate-50 dark:bg-linear-to-br dark:from-gray-900 dark:to-gray-950 p-5 rounded-3xl text-gray-900 dark:text-white shadow-xl border border-gray-200 dark:border-gray-800 sticky top-2">
                      <div className="flex items-center justify-between mb-3.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5" />
                          <span>Vista Previa en Vivo (Menú & POS)</span>
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-orange-600 text-white shadow-xs">
                          Campaña Activa
                        </span>
                      </div>

                      {/* Tarjeta Visual de Promoción */}
                      <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-md text-gray-900 dark:text-gray-100">
                        {/* Banner o Foto */}
                        <div className="relative h-32 bg-gray-200 dark:bg-gray-800 overflow-hidden">
                          {imagePreviewUrl || eventoImagen || currentProducto?.imagen ? (
                            <img
                              src={imagePreviewUrl || eventoImagen || currentProducto?.imagen}
                              alt="Vista previa"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                              <Utensils className="w-8 h-8 opacity-40 mb-1" />
                              <span className="text-[10px] font-bold">Sin banner de campaña</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                          <div className="absolute top-2.5 left-2.5">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600 text-white shadow-md border border-white/25 flex items-center gap-1">
                              <Flame className="w-3 h-3" />
                              <span>{tipoEvento === "Descuento" ? `${descuento || 15}% OFF` : tipoEvento === "2x1 / Combo Especial" ? "2X1" : "OFERTA"}</span>
                            </span>
                          </div>
                        </div>

                        {/* Contenido de la Tarjeta */}
                        <div className="p-4 space-y-2">
                          <p className="text-xs font-black text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                            {nombreEvento || "Título de la Campaña"}
                          </p>
                          <p className="text-sm font-bold truncate">
                            {currentProducto ? currentProducto.nombre : productosSeleccionados[0]?.nombre || "Platillos seleccionados"}
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2">
                            {descripcion || "Aprovecha esta promoción especial válida por tiempo limitado en Chazin Food."}
                          </p>

                          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            <div>
                              <p className="text-[10px] text-gray-400 uppercase font-bold">Precio Promoción</p>
                              <div className="flex items-center gap-1.5">
                                {currentProducto && (
                                  <span className="text-xs text-gray-400 line-through">
                                    ${Number(currentProducto.precio || 0).toLocaleString("es-CO")}
                                  </span>
                                )}
                                <span className="text-sm font-black text-red-600 dark:text-red-400">
                                  {tipoEvento === "Promoción Precio" && nuevoPrecio
                                    ? `$${Number(nuevoPrecio).toLocaleString("es-CO")}`
                                    : tipoEvento === "Descuento" && currentProducto
                                    ? `$${Math.round(Number(currentProducto.precio || 0) * (1 - Number(descuento || 0) / 100)).toLocaleString("es-CO")}`
                                    : "Beneficio Activo"}
                                </span>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-gray-500">
                              {productosSeleccionados.length} {productosSeleccionados.length === 1 ? "platillo" : "platillos"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-amber-50/80 dark:bg-white/5 rounded-xl border border-amber-200/70 dark:border-white/10 flex items-center gap-2.5 text-xs text-amber-950 dark:text-gray-300">
                        <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span>En el siguiente paso podrás revisar y asignar los platillos participantes.</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── PASO 2: PRODUCTOS PARTICIPANTES ── */}
              {activeStep === 2 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-gray-850 p-4 rounded-2xl border border-gray-200/80 dark:border-gray-700/80">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <Utensils className="w-4 h-4 text-orange-600" />
                        <span>Platillos que participan en la Campaña</span>
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Agrega o retira platillos del catálogo que tendrán esta promoción activa.
                      </p>
                    </div>

                    {!producto && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-black uppercase text-gray-400 mr-1">Añadir Categoría:</span>
                        {["Hamburguesas", "Perros Calientes", "Salchipapas Gourmet", "Combos", "Bebidas"].map(cat => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => handleSelectAllInCategoria(cat)}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 hover:bg-orange-100 transition-colors cursor-pointer"
                          >
                            + {cat}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Buscador de Productos */}
                  {!producto && (
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={productoSearch}
                        onChange={(e) => setProductoSearch(e.target.value)}
                        placeholder="Buscar producto por nombre o categoría para agregarlo..."
                        className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-orange-500 shadow-xs"
                      />
                      {showProductoDropdown && (
                        <div className="absolute z-20 left-0 right-0 mt-1.5 bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                          {filteredProductos.map((p) => (
                            <button
                              key={p.id || p.idProducto}
                              type="button"
                              onClick={() => handleSelectProducto(p)}
                              className="w-full px-4 py-2.5 text-left text-xs hover:bg-orange-50 dark:hover:bg-gray-750 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 last:border-0 cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                {p.imagen ? (
                                  <img src={p.imagen} alt="" className="w-8 h-8 rounded-lg object-cover" />
                                ) : (
                                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                                    <Utensils className="w-4 h-4" />
                                  </div>
                                )}
                                <div>
                                  <p className="font-bold text-gray-900 dark:text-gray-100">{p.nombre}</p>
                                  <span className="text-[10px] text-gray-400">{p.categoria || "Platillo"}</span>
                                </div>
                              </div>
                              <span className="font-black text-gray-900 dark:text-gray-100">
                                ${Number(p.precio || 0).toLocaleString("es-CO")}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Lista de Productos Seleccionados */}
                  {productosSeleccionados.length === 0 ? (
                    <div className="p-8 text-center bg-white dark:bg-gray-850 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                      <Utensils className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                      <p className="text-sm font-black text-gray-700 dark:text-gray-300">No hay productos seleccionados todavía</p>
                      <p className="text-xs text-gray-400 max-w-md mx-auto mt-1">
                        Utiliza el buscador superior o los botones rápidos de categorías para añadir los platillos que tendrán este beneficio.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {productosSeleccionados.map((item, idx) => {
                        const calculatedPromoPrice = tipoEvento === "Descuento"
                          ? Math.round(Number(item.precioBase || 0) * (1 - Number(item.descuento || descuento || 0) / 100))
                          : tipoEvento === "Promoción Precio"
                          ? Number(item.nuevoPrecio || nuevoPrecio || item.precioBase)
                          : item.precioBase;

                        return (
                          <div
                            key={item.id || idx}
                            className="p-3.5 bg-white dark:bg-gray-850 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 flex items-center justify-between gap-3 shadow-xs hover:border-orange-300 transition-all"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {item.imagen ? (
                                <img src={item.imagen} alt="" className="w-11 h-11 rounded-xl object-cover shrink-0 shadow-xs" />
                              ) : (
                                <div className="w-11 h-11 rounded-xl bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center text-orange-600 shrink-0">
                                  <Utensils className="w-5 h-5" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="text-xs font-black text-gray-900 dark:text-gray-100 truncate">{item.nombre}</p>
                                <span className="text-[10px] font-bold text-gray-400 uppercase">{item.categoria || "Platillo"}</span>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs text-gray-400 line-through">
                                    ${Number(item.precioBase || 0).toLocaleString("es-CO")}
                                  </span>
                                  <span className="text-xs font-black text-red-600 dark:text-red-400">
                                    ${Number(calculatedPromoPrice).toLocaleString("es-CO")}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {/* Ajuste individual si aplica */}
                              {tipoEvento === "Descuento" && (
                                <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded-xl border border-gray-200 dark:border-gray-700">
                                  <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={item.descuento || descuento}
                                    onChange={(e) => handleUpdateProductoBenefit(idx, "descuento", e.target.value)}
                                    className="w-10 bg-transparent text-xs font-black text-center focus:outline-none"
                                  />
                                  <span className="text-[10px] font-bold text-gray-400">%</span>
                                </div>
                              )}

                              {!producto && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveProducto(idx)}
                                  className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg cursor-pointer"
                                  title="Remover producto"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ── PASO 3: BANNER & VIGENCIA ── */}
              {activeStep === 3 && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
                  {/* Columna Izquierda: Banner & Fechas (7 columnas) */}
                  <div className="lg:col-span-7 space-y-5">
                    {/* Subida de Banner Promocional */}
                    <div className="bg-white dark:bg-gray-850 p-4 sm:p-5 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 space-y-3.5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-orange-600" />
                          <span>Banner Promocional de la Campaña</span>
                        </label>
                        <span className="text-[10px] text-gray-400 font-bold">Panorámico (carrusel & catálogo)</span>
                      </div>

                      {/* Vista previa y botón subir */}
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="w-full sm:w-44 h-24 rounded-2xl bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden flex items-center justify-center shrink-0">
                          {imagePreviewUrl || eventoImagen ? (
                            <img src={imagePreviewUrl || eventoImagen} alt="Banner" className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-center text-gray-400 p-2">
                              <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-50" />
                              <span className="text-[10px] font-bold">Sin banner</span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 space-y-2 w-full">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={uploadingImage}
                              className="px-4 py-2 bg-linear-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                            >
                              {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                              <span>{uploadingImage ? "Subiendo a Cloudinary..." : imagePreviewUrl || eventoImagen ? "Cambiar Imagen desde PC" : "Subir Banner desde PC"}</span>
                            </button>
                            {(imagePreviewUrl || eventoImagen) && (
                              <button
                                type="button"
                                onClick={handleRemoveImage}
                                className="px-3 py-2 text-xs text-red-500 hover:text-red-700 font-bold cursor-pointer"
                              >
                                Quitar
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setShowManualUrl(p => !p)}
                              className="text-xs text-orange-600 hover:underline font-semibold ml-auto cursor-pointer"
                            >
                              {showManualUrl ? "Ocultar URL manual" : "O ingresar URL..."}
                            </button>
                          </div>
                          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelected} className="hidden" />
                          {showManualUrl && (
                            <input
                              type="text"
                              value={eventoImagen}
                              onChange={(e) => { setEventoImagen(e.target.value); setImagePreviewUrl(e.target.value); }}
                              placeholder="https://images.unsplash.com/..."
                              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium"
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Vigencia & Fechas */}
                    <div className="bg-white dark:bg-gray-850 p-4 sm:p-5 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 space-y-4 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2 rounded-xl ${isTemporal ? "bg-orange-100 dark:bg-orange-950/40 text-orange-600" : "bg-gray-100 dark:bg-gray-800 text-gray-500"}`}>
                            <CalendarClock className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-gray-100">
                              {isTemporal ? "Campaña con Vigencia Temporal" : "Campaña Permanente"}
                            </p>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400">
                              {isTemporal ? "Estará activa únicamente entre las fechas programadas" : "Permanecerá activa de forma continua hasta que la desactives"}
                            </p>
                          </div>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isTemporal}
                            onChange={(e) => setIsTemporal(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                        </label>
                      </div>

                      {/* Selectores de Fechas */}
                      {isTemporal && (
                        <div className="pt-3 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-3.5">
                          <div>
                            <label className="block text-[11px] font-black uppercase text-gray-700 dark:text-gray-300 mb-1">
                              Fecha de Inicio *
                            </label>
                            <input
                              type="date"
                              value={fechaInicio}
                              onChange={(e) => setFechaInicio(e.target.value)}
                              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-orange-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-black uppercase text-gray-700 dark:text-gray-300 mb-1">
                              Fecha de Finalización *
                            </label>
                            <input
                              type="date"
                              value={fechaFin}
                              onChange={(e) => setFechaFin(e.target.value)}
                              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-orange-500"
                            />
                          </div>

                          {diasVigenciaCampaña !== null && (
                            <div className="col-span-2 p-2.5 bg-orange-50 dark:bg-orange-950/30 rounded-xl border border-orange-200 dark:border-orange-800 text-xs font-bold text-orange-900 dark:text-orange-200 flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-orange-600" />
                              <span>Duración calculada: <strong>{diasVigenciaCampaña} días</strong> (del {fechaInicio} al {fechaFin}).</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Columna Derecha: Resumen Final y Banner Hero (5 columnas) - Adaptable Modo Claro/Oscuro */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="bg-white dark:bg-linear-to-br dark:from-gray-900 dark:to-gray-950 p-5 rounded-3xl text-gray-900 dark:text-white shadow-xl border border-gray-200 dark:border-gray-800 sticky top-2">
                      <div className="flex items-center justify-between mb-3.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Resumen Final de Publicación</span>
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-xs">
                          Listo para Crear
                        </span>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200/80 dark:border-white/10 space-y-1">
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-black">Campaña</p>
                          <p className="text-sm font-black text-amber-600 dark:text-amber-300">{nombreEvento || "Sin título"}</p>
                          <p className="text-gray-600 dark:text-gray-300 text-[11px] line-clamp-2">{descripcion || "Sin descripción"}</p>
                        </div>

                        <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200/80 dark:border-white/10 flex items-center justify-between">
                          <div>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-black">Dinámica</p>
                            <p className="font-bold text-gray-900 dark:text-white">{tipoEvento}</p>
                          </div>
                          <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-red-600 text-white shadow-xs">
                            {tipoEvento === "Descuento" ? `${descuento || 15}% OFF` : tipoEvento === "2x1 / Combo Especial" ? "2X1" : "OFERTA"}
                          </span>
                        </div>

                        <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200/80 dark:border-white/10 flex items-center justify-between">
                          <div>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-black">Productos Participantes</p>
                            <p className="font-bold text-gray-900 dark:text-white">{productosSeleccionados.length} platillos asignados</p>
                          </div>
                          <Utensils className="w-4 h-4 text-orange-500" />
                        </div>

                        <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200/80 dark:border-white/10 flex items-center justify-between">
                          <div>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-black">Vigencia</p>
                            <p className="font-bold text-gray-900 dark:text-white">
                              {isTemporal ? `${diasVigenciaCampaña || 0} días (${fechaInicio} a ${fechaFin})` : "Permanente"}
                            </p>
                          </div>
                          <CalendarClock className="w-4 h-4 text-amber-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════
              MODALIDAD B: CREAR UN NUEVO PRODUCTO ESPECIAL DE EVENTO
          ═══════════════════════════════════════════════════════════════════════════ */}
          {modoCrearProducto && (
            <>
              {/* ── PASO 1: DATOS DEL PLATILLO & OFERTA ── */}
              {activeStep === 1 && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
                  <div className="lg:col-span-7 space-y-4">
                    {/* Formato del Festival */}
                    <div className="bg-white dark:bg-gray-850 p-4 sm:p-5 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 space-y-3 shadow-xs">
                      <label className="block text-xs font-black uppercase tracking-wider text-gray-800 dark:text-gray-200">
                        Formato / Dinámica del Platillo Especial *
                      </label>
                      <div className="grid grid-cols-2 gap-2.5">
                        {PROD_EVENT_TYPES.map(t => {
                          const isSel = prodTipoEvento === t.value;
                          const Icon = t.icon;
                          return (
                            <button
                              key={t.value}
                              type="button"
                              onClick={() => {
                                setProdTipoEvento(t.value);
                                if (t.value === "COMBO_ESPECIAL") {
                                  setConfigCombo(prev => ({ ...prev, esCombo: true }));
                                  setProdCategoria(2); // Auto-asignar a Combos
                                  if (!nombreEvento) setNombreEvento("Combo Festivo Especial");
                                } else {
                                  setConfigCombo(prev => ({ ...prev, esCombo: false }));
                                  if (t.value === "2X1" && prodPrecioRegular && !prodPrecioEvento) {
                                    setProdPrecioEvento(prodPrecioRegular);
                                  } else if (t.value === "DESCUENTO" && prodPrecioRegular && !prodPrecioEvento) {
                                    setProdPrecioEvento(String(Math.round(Number(prodPrecioRegular) * 0.85)));
                                  } else if (t.value === "EDICION_LIMITADA" && prodCategoria === 2) {
                                    setProdCategoria(3); // Reset a Hamburguesas
                                  }
                                }
                              }}
                              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                                isSel
                                  ? t.activeCls
                                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-black text-xs flex items-center gap-1.5">
                                  <Icon size={14} stroke={2} />
                                  <span>{t.label}</span>
                                </span>
                                {isSel && <CheckCircle2 className="w-4 h-4 text-orange-600" />}
                              </div>
                              <p className="text-[10px] text-gray-500 line-clamp-2">{t.desc}</p>
                            </button>
                          );
                        })}
                      </div>

                      {/* Banner Explicativo Dinámico según Formato */}
                      {prodTipoEvento === "COMBO_ESPECIAL" && (
                        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2.5">
                          <StreamlineDoubleBurger className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-black text-amber-900 dark:text-amber-200">Formato Combo Festivo Activo</p>
                            <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
                              Este platillo se registrará en la categoría <strong>Combos</strong>. Abajo podrás seleccionar las bebidas acompañantes y armar el paquete gastronómico completo.
                            </p>
                          </div>
                        </div>
                      )}

                      {prodTipoEvento === "2X1" && (
                        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-start gap-2.5">
                          <Tag className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-black text-rose-900 dark:text-rose-200">Dinámica 2x1 Culinaria Activa</p>
                            <p className="text-[11px] text-rose-800/80 dark:text-rose-300/80 leading-relaxed">
                              El comensal lleva <strong>2 unidades</strong> por el precio fijado. El sistema calculará el valor equivalente por porción y aplicará la insignia 2X1.
                            </p>
                          </div>
                        </div>
                      )}

                      {prodTipoEvento === "DESCUENTO" && (
                        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-2.5">
                          <Percent className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-black text-emerald-900 dark:text-emerald-200">Descuento Directo sobre Carta</p>
                            <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed">
                              Define el precio regular de carta y el precio rebajado exclusivo para este festival. Puedes usar los botones de descuento rápido abajo.
                            </p>
                          </div>
                        </div>
                      )}

                      {prodTipoEvento === "EDICION_LIMITADA" && (
                        <div className="p-3.5 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/60 flex items-start gap-2.5">
                          <Crown className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-black text-orange-900 dark:text-orange-200">Platillo Conmemorativo de Festival</p>
                            <p className="text-[11px] text-orange-800/80 dark:text-orange-300/80 leading-relaxed">
                              Receta de autor creada para el festival conmemorativo (Burger Fest, Salchipapa Fest, etc.). Se publicará con su sello de Edición Especial.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Datos Principales */}
                    <div className="bg-white dark:bg-gray-850 p-4 sm:p-5 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 space-y-3.5 shadow-xs">
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-gray-800 dark:text-gray-200 mb-1">
                          Título del Evento / Festival *
                        </label>
                        <input
                          type="text"
                          value={nombreEvento}
                          onChange={(e) => setNombreEvento(e.target.value)}
                          placeholder="Ej. Burger Fest 2026, Festival de Temporada..."
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-orange-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-xs font-black uppercase tracking-wider text-gray-800 dark:text-gray-200 mb-1">
                            Nombre del Platillo en Menú *
                          </label>
                          <input
                            type="text"
                            value={prodNombre}
                            onChange={(e) => setProdNombre(e.target.value)}
                            placeholder="Ej. Hamburguesa Fest Trufada..."
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-orange-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-black uppercase tracking-wider text-gray-800 dark:text-gray-200 mb-1">
                            Categoría *
                          </label>
                          <select
                            value={prodCategoria}
                            onChange={(e) => setProdCategoria(Number(e.target.value))}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-orange-500"
                          >
                            {categoriasBD.filter(c => c.idCategoriaProducto !== 0).map(cat => (
                              <option key={cat.idCategoriaProducto || cat.id} value={cat.idCategoriaProducto || cat.id}>
                                {cat.nombre}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Precios (Regular vs Promocional con cálculo dinámico según formato) */}
                      <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                        <div className="grid grid-cols-2 gap-3.5">
                          <div>
                            <label className="block text-[11px] font-black uppercase text-gray-700 dark:text-gray-300 mb-1">
                              {prodTipoEvento === "COMBO_ESPECIAL" ? "Precio Combo Regular ($ COP) *" : "Precio Carta Regular ($ COP) *"}
                            </label>
                            <input
                              type="number"
                              value={prodPrecioRegular}
                              onChange={(e) => {
                                const val = e.target.value;
                                setProdPrecioRegular(val);
                                if (prodTipoEvento === "2X1" && !prodPrecioEvento) {
                                  setProdPrecioEvento(val);
                                }
                              }}
                              placeholder={prodTipoEvento === "COMBO_ESPECIAL" ? "Ej. 38000" : "Ej. 28000"}
                              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-black focus:ring-2 focus:ring-orange-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-black uppercase text-gray-700 dark:text-gray-300 mb-1">
                              {prodTipoEvento === "COMBO_ESPECIAL"
                                ? "Precio Combo Festivo ($ COP) *"
                                : prodTipoEvento === "2X1"
                                ? "Precio Promoción 2x1 ($ COP) *"
                                : "Precio Especial Evento ($ COP) *"}
                            </label>
                            <input
                              type="number"
                              value={prodPrecioEvento}
                              onChange={(e) => setProdPrecioEvento(e.target.value)}
                              placeholder={prodTipoEvento === "COMBO_ESPECIAL" ? "Ej. 34000" : prodTipoEvento === "2X1" ? "Ej. 20000" : "Ej. 22000"}
                              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-black text-red-600 focus:ring-2 focus:ring-orange-500"
                            />
                          </div>
                        </div>

                        {/* Botones de descuento rápido si es formato Descuento */}
                        {prodTipoEvento === "DESCUENTO" && (
                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">Descuento rápido:</span>
                            {[10, 15, 20, 25, 30].map(pct => (
                              <button
                                key={pct}
                                type="button"
                                onClick={() => {
                                  const reg = Number(prodPrecioRegular) || 0;
                                  if (reg > 0) {
                                    setProdPrecioEvento(String(Math.round(reg * (1 - pct / 100))));
                                  }
                                }}
                                className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 text-emerald-800 dark:text-emerald-300 transition cursor-pointer"
                              >
                                -{pct}%
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Cálculo dinámico en tiempo real */}
                        {prodPrecioRegular && prodPrecioEvento && (
                          <div className="p-2.5 rounded-xl bg-orange-50/70 dark:bg-gray-800 border border-orange-200/80 dark:border-gray-700 flex items-center justify-between text-xs">
                            {prodTipoEvento === "2X1" ? (
                              <span className="font-bold text-orange-950 dark:text-orange-200">
                                🔥 <strong>Lleva 2 por ${Number(prodPrecioEvento).toLocaleString("es-CO")} COP</strong> (Valor equiv. por unidad: ${Math.round(Number(prodPrecioEvento) / 2).toLocaleString("es-CO")} COP)
                              </span>
                            ) : (
                              <>
                                <span className="text-gray-600 dark:text-gray-300">
                                  Ahorro para el comensal:
                                  <strong className="text-emerald-600 dark:text-emerald-400 ml-1">
                                    ${Math.max(0, Number(prodPrecioRegular) - Number(prodPrecioEvento)).toLocaleString("es-CO")} COP
                                  </strong>
                                </span>
                                <span className="font-black text-rose-600 dark:text-rose-400">
                                  {Math.round(((Number(prodPrecioRegular) - Number(prodPrecioEvento)) / Number(prodPrecioRegular)) * 100)}% OFF
                                </span>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Configuración Dinámica y Elegible de Bebidas si es COMBO_ESPECIAL */}
                      {prodTipoEvento === "COMBO_ESPECIAL" && (
                        <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/90 dark:border-amber-800/60 space-y-3.5 shadow-2xs">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 dark:border-amber-800/40 pb-2.5">
                            <span className="text-xs font-black text-amber-950 dark:text-amber-200 flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-amber-600" />
                              <span>Bebidas Incluidas en el Combo Festivo</span>
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300">¿Cuántas bebidas incluye?</span>
                              <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-xl border border-amber-300 dark:border-amber-700 p-0.5 shadow-2xs">
                                <button
                                  type="button"
                                  onClick={() => setConfigCombo(c => ({ ...c, cantidadBebidas: Math.max(1, (c.cantidadBebidas || 1) - 1) }))}
                                  className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-200 font-black cursor-pointer"
                                >
                                  -
                                </button>
                                <span className="px-2 text-xs font-black text-amber-950 dark:text-amber-100">{configCombo.cantidadBebidas || 1}</span>
                                <button
                                  type="button"
                                  onClick={() => setConfigCombo(c => ({ ...c, cantidadBebidas: (c.cantidadBebidas || 1) + 1 }))}
                                  className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-200 font-black cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                              <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
                                {configCombo.cantidadBebidas === 1 ? "bebida" : "bebidas"}
                              </span>
                            </div>
                          </div>

                          {/* Modo de Selección de Bebidas */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                              Opciones elegibles para el comensal:
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setComboModoBebidas("todas");
                                  setConfigCombo(c => ({ ...c, bebidasPermitidas: [] }));
                                }}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                                  comboModoBebidas === "todas"
                                    ? "bg-amber-600 text-white shadow-2xs"
                                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                                }`}
                              >
                                Todas las Bebidas ({todasBebidas.length})
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setComboModoBebidas("especificas");
                                  if (!configCombo.bebidasPermitidas || configCombo.bebidasPermitidas.length === 0) {
                                    setConfigCombo(c => ({ ...c, bebidasPermitidas: todasBebidas.slice(0, 4).map(b => b.id || b.idProducto) }));
                                  }
                                }}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                                  comboModoBebidas === "especificas"
                                    ? "bg-amber-600 text-white shadow-2xs"
                                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                                }`}
                              >
                                Personalizar Lista
                              </button>
                            </div>
                          </div>

                          {/* Cuadrícula interactiva de bebidas */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto p-1 scrollbar-thin">
                            {todasBebidas.map(b => {
                              const bId = b.id || b.idProducto;
                              const isPermitida = comboModoBebidas === "todas" || (configCombo.bebidasPermitidas || []).includes(bId);
                              return (
                                <button
                                  key={bId}
                                  type="button"
                                  onClick={() => {
                                    if (comboModoBebidas === "todas") {
                                      setComboModoBebidas("especificas");
                                      setConfigCombo(c => ({
                                        ...c,
                                        bebidasPermitidas: todasBebidas.filter(x => (x.id || x.idProducto) !== bId).map(x => x.id || x.idProducto)
                                      }));
                                    } else {
                                      const currentList = configCombo.bebidasPermitidas || [];
                                      const newList = currentList.includes(bId)
                                        ? currentList.filter(id => id !== bId)
                                        : [...currentList, bId];
                                      setConfigCombo(c => ({ ...c, bebidasPermitidas: newList }));
                                    }
                                  }}
                                  className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between gap-1.5 ${
                                    isPermitida
                                      ? "bg-white dark:bg-gray-800 border-amber-500 shadow-2xs ring-1 ring-amber-400/40 text-gray-900 dark:text-gray-100"
                                      : "bg-gray-100/60 dark:bg-gray-900/60 border-gray-200 dark:border-gray-800 opacity-55 text-gray-500"
                                  }`}
                                >
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <span className="w-5 h-5 rounded-md bg-amber-100 dark:bg-amber-900/50 text-amber-700 flex items-center justify-center text-[10px] shrink-0">🥤</span>
                                    <span className="text-[11px] font-bold truncate leading-tight">{b.nombre}</span>
                                  </div>
                                  {isPermitida && <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-gray-800 dark:text-gray-200 mb-1">
                          Descripción Culinaria para Comensales
                        </label>
                        <textarea
                          rows={2}
                          value={prodDescripcion}
                          onChange={(e) => setProdDescripcion(e.target.value)}
                          placeholder="Describe la experiencia de sabor, ingredientes exclusivos y presentación..."
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Columna Derecha: Foto del Platillo y Vista Previa (5 columnas) */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="bg-white dark:bg-gray-850 p-4 sm:p-5 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 space-y-3.5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-orange-600" />
                          <span>Fotografía del Platillo</span>
                        </label>
                        <span className="text-[10px] text-gray-400 font-bold">1:1 o 16:9</span>
                      </div>

                      <div className="h-44 rounded-2xl bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden flex items-center justify-center relative shadow-inner">
                        {imagePreviewUrl || prodImagen ? (
                          <img src={imagePreviewUrl || prodImagen} alt="Foto producto" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center text-gray-400 p-4">
                            <Utensils className="w-8 h-8 mx-auto mb-1 opacity-50" />
                            <span className="text-xs font-bold">Sin fotografía del platillo</span>
                          </div>
                        )}
                        {uploadingImage && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-bold gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Subiendo a Cloudinary...</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingImage}
                          className="flex-1 py-2.5 bg-linear-to-r from-orange-600 to-amber-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                        >
                          <UploadCloud className="w-4 h-4" />
                          <span>{imagePreviewUrl || prodImagen ? "Cambiar Foto desde PC" : "Subir Foto desde PC"}</span>
                        </button>
                        {(imagePreviewUrl || prodImagen) && (
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="px-3 py-2 text-xs text-red-500 hover:text-red-700 font-bold cursor-pointer"
                          >
                            Quitar
                          </button>
                        )}
                      </div>
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelected} className="hidden" />
                    </div>

                    {/* Resumen de Ahorro para el Comensal */}
                    {prodPrecioRegular && prodPrecioEvento && Number(prodPrecioRegular) > Number(prodPrecioEvento) && (
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] uppercase font-black text-emerald-800 dark:text-emerald-300">Ahorro para el Comensal</p>
                          <p className="text-sm font-black text-emerald-900 dark:text-emerald-100">
                            -${(Number(prodPrecioRegular) - Number(prodPrecioEvento)).toLocaleString("es-CO")} COP
                          </p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-600 text-white shadow-xs">
                          {Math.round(((Number(prodPrecioRegular) - Number(prodPrecioEvento)) / Number(prodPrecioRegular)) * 100)}% OFF
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── PASO 2: FICHA TÉCNICA DEL PRODUCTO ── */}
              {activeStep === 2 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-200 dark:border-amber-900/40 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-amber-950 dark:text-amber-200">
                        Ficha Técnica & Receta Obligatoria
                      </h4>
                      <p className="text-xs text-amber-900/80 dark:text-amber-300/80 leading-relaxed mt-0.5">
                        Al tratarse de un platillo gastronómico nuevo para el evento, es requisito registrar su receta con ingredientes, cantidades y pasos de preparación para el control automático de stock en inventario y comandas en cocina.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-850 p-2 sm:p-4 rounded-3xl border border-gray-200/80 dark:border-gray-700/80 shadow-xs">
                    <FichaTecnicaProducto
                      productId={null}
                      productName={prodNombre || "Nuevo Platillo de Festival"}
                      initialData={prodFichaTecnica || null}
                      entityData={{
                        nombre: prodNombre || "Nuevo Platillo de Festival",
                        precio: Number(prodPrecioRegular) || 0,
                        descripcion: prodDescripcion || ""
                      }}
                      onChange={(data) => setProdFichaTecnica(data)}
                      onSave={(data) => setProdFichaTecnica(data)}
                    />
                  </div>
                </div>
              )}

              {/* ── PASO 3: PRESENTACIONES, ADICIONES & PUBLICACIÓN ── */}
              {activeStep === 3 && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
                  <div className="lg:col-span-7 space-y-5">
                    {/* Variantes Opcionales */}
                    <div className="bg-white dark:bg-gray-850 p-4 sm:p-5 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 space-y-3.5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-xs font-black uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                            <Tag className="w-4 h-4 text-orange-600" />
                            <span>Variantes o Presentaciones (Opcional)</span>
                          </label>
                          <p className="text-[11px] text-gray-500">Opciones alternativas (ej. Doble Carne, Tamaño Familiar)</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setProdVariantes(p => [...p, { nombre: "", precio: prodPrecioEvento || prodPrecioRegular || "" }])}
                          className="px-3 py-1.5 bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 rounded-xl text-xs font-black hover:bg-orange-100 cursor-pointer"
                        >
                          + Agregar Variante
                        </button>
                      </div>

                      {prodVariantes.length === 0 ? (
                        <p className="text-xs text-gray-400 italic bg-gray-50 dark:bg-gray-900 p-3 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                          Sin variantes adicionales. El platillo se venderá en su presentación estándar.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {prodVariantes.map((v, idx) => (
                            <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                              <input
                                type="text"
                                value={v.nombre}
                                onChange={(e) => setProdVariantes(prev => prev.map((item, i) => i === idx ? { ...item, nombre: e.target.value } : item))}
                                placeholder="Nombre variante (ej. Doble Carne, 300g)"
                                className="flex-1 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-bold"
                              />
                              <button
                                type="button"
                                onClick={() => setProdVariantes(prev => prev.filter((_, i) => i !== idx))}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Adiciones Disponibles (Con buscador, tarjetas gastronómicas, precios e iconos) */}
                    <div className="bg-white dark:bg-gray-850 p-4 sm:p-5 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 space-y-3.5 shadow-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <label className="text-xs font-black uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                              <Layers className="w-4 h-4 text-orange-600" />
                              <span>Adiciones Disponibles para el Platillo</span>
                            </label>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300">
                              {adicionesSeleccionadas.length} de {todasAdiciones.length}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                            Toppings, salsas y extras que el comensal puede añadir al ordenar
                          </p>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => {
                              if (adicionesSeleccionadas.length === todasAdiciones.length) {
                                setAdicionesSeleccionadas([]);
                              } else {
                                setAdicionesSeleccionadas(todasAdiciones.map(a => ({ idAdicion: a.idAdicion || a.id, nombre: a.nombre, precio: Number(a.precio || 0) })));
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 transition cursor-pointer border border-orange-200 dark:border-orange-800"
                          >
                            {adicionesSeleccionadas.length === todasAdiciones.length ? "Limpiar todas" : "Seleccionar todas"}
                          </button>
                        </div>
                      </div>

                      {/* Buscador de adiciones */}
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={adicionSearch}
                          onChange={(e) => setAdicionSearch(e.target.value)}
                          placeholder="Buscar adición (ej. tocineta, cheddar, papas, salsa)..."
                          className="w-full pl-8 pr-3 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs focus:ring-2 focus:ring-orange-500"
                        />
                      </div>

                      {/* Cuadrícula de tarjetas de adiciones */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 scrollbar-thin">
                        {todasAdiciones
                          .filter(a => !adicionSearch.trim() || a.nombre.toLowerCase().includes(adicionSearch.toLowerCase().trim()))
                          .map(ad => {
                            const adId = ad.idAdicion || ad.id;
                            const isSel = adicionesSeleccionadas.some(s => (s.idAdicion || s.id) === adId);
                            const emoji = getAdditionEmoji(ad.nombre);
                            return (
                              <button
                                key={adId}
                                type="button"
                                onClick={() => {
                                  setAdicionesSeleccionadas(prev =>
                                    isSel
                                      ? prev.filter(s => (s.idAdicion || s.id) !== adId)
                                      : [...prev, { idAdicion: adId, nombre: ad.nombre, precio: Number(ad.precio || 0) }]
                                  );
                                }}
                                className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                                  isSel
                                    ? "bg-orange-50/80 dark:bg-orange-950/40 border-orange-500 shadow-2xs ring-1 ring-orange-400/50 text-orange-950 dark:text-orange-100"
                                    : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-gray-300 text-gray-700 dark:text-gray-300"
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="w-6 h-6 rounded-lg bg-orange-100/70 dark:bg-orange-900/40 text-xs flex items-center justify-center shrink-0">
                                    {emoji}
                                  </span>
                                  <span className="text-xs font-bold truncate">{ad.nombre}</span>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400">
                                    +${Number(ad.precio || 0).toLocaleString("es-CO")}
                                  </span>
                                  {isSel ? (
                                    <div className="w-4 h-4 rounded-full bg-orange-600 text-white flex items-center justify-center">
                                      <Check className="w-3 h-3 stroke-[3]" />
                                    </div>
                                  ) : (
                                    <div className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600" />
                                  )}
                                </div>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  </div>

                  {/* Columna Derecha: Vigencia y Resumen Final (5 columnas) */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="bg-white dark:bg-gray-850 p-4 sm:p-5 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 space-y-4 shadow-xs">
                      <p className="text-xs font-black uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                        <CalendarClock className="w-4 h-4 text-orange-600" />
                        <span>Fechas de la Edición Especial</span>
                      </p>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-black uppercase text-gray-600 dark:text-gray-400 mb-1">Inicio</label>
                          <input
                            type="date"
                            value={fechaInicio}
                            onChange={(e) => setFechaInicio(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase text-gray-600 dark:text-gray-400 mb-1">Fin</label>
                          <input
                            type="date"
                            value={fechaFin}
                            onChange={(e) => setFechaFin(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold"
                          />
                        </div>
                      </div>

                      {/* Switch Destacado en Menú */}
                      <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Crown className="w-4 h-4 text-amber-500" />
                          <div>
                            <p className="text-xs font-bold">Destacado en Menú</p>
                            <p className="text-[10px] text-gray-400">Mostrar badge de festival</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={prodDestacadoWeb}
                          onChange={(e) => setProdDestacadoWeb(e.target.checked)}
                          className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500 cursor-pointer"
                        />
                      </label>
                    </div>

                    {/* Resumen del Platillo (Adaptativo a Modo Claro y Modo Oscuro) */}
                    <div className="bg-white dark:bg-linear-to-br dark:from-gray-900 dark:to-gray-950 p-4 sm:p-5 rounded-3xl text-gray-900 dark:text-white shadow-xl border border-gray-200 dark:border-gray-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">Resumen del Platillo</p>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-800/50">
                          {prodTipoEvento === "COMBO_ESPECIAL" ? "Combo" : prodTipoEvento === "2X1" ? "2x1" : prodTipoEvento === "DESCUENTO" ? "Rebajado" : "Especial"}
                        </span>
                      </div>
                      <p className="text-base font-black text-gray-900 dark:text-white truncate">{prodNombre || "Nombre del platillo"}</p>
                      <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100 dark:border-white/10">
                        <span className="text-gray-500 dark:text-gray-400">Precio Festival:</span>
                        <span className="text-base font-black text-amber-600 dark:text-amber-300">
                          ${prodPrecioEvento ? Number(prodPrecioEvento).toLocaleString("es-CO") : "0"} COP
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Insumos en Receta:</span>
                        <span className="font-bold text-gray-800 dark:text-white">
                          {prodFichaTecnica?.detalles?.length || prodFichaTecnica?.insumos?.length || 0} ingredientes
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </div>

        {/* ═══ 5. FOOTER FIJO ERGONÓMICO ═══ */}
        <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between shrink-0 shadow-lg">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <div className="flex items-center gap-2.5">
            {activeStep > 1 && (
              <button
                type="button"
                onClick={() => setActiveStep(prev => prev - 1)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>
            )}

            {activeStep < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-5 py-2.5 rounded-xl text-xs font-black bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-orange-600/20 active:scale-98"
              >
                <span>Siguiente Paso</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving || uploadingImage}
                className="px-6 py-2.5 rounded-xl text-xs font-black bg-linear-to-r from-orange-600 via-amber-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-orange-600/25 disabled:opacity-50 active:scale-98"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>
                  {saving
                    ? (isEditing ? "Guardando..." : "Creando...")
                    : isEditing
                    ? "Guardar Cambios"
                    : modoCrearProducto
                    ? "Lanzar Platillo de Evento"
                    : "Crear y Publicar Campaña"}
                </span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
