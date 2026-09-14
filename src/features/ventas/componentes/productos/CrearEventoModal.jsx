import { useState, useEffect, useRef } from "react";
import {
  X, Zap, PackagePlus, Tag, ArrowDownUp, Search, Trash2,
  CalendarClock, Sparkles, PlusCircle, UploadCloud, Loader2,
  Layers, Utensils, Plus, Minus, Check, Flame, ChevronDown, ChevronUp, Image as ImageIcon,
  Clock, Gift, Star, ShieldCheck, CheckCircle2, Award
} from "lucide-react";
import { eventosService } from "../../servicios/eventosService";
import { categoriaProductosService } from "../../servicios/categoriaProductosService";
import { adicionesService } from "@/features/compras/servicios/adicionesService";
import { productosService } from "@/features/ventas/servicios/productosService";
import { uploadImageToCloudinary } from "@/shared/servicios/cloudinaryService";
import { getAdditionEmoji } from "@/shared/utils/foodEmojiUtils";
import { useNotifications } from "@/shared/hooks/useNotifications";

const TIPO_EVENTO_OPTIONS = [
  { value: "Añadir Insumos", icon: PackagePlus, label: "Añadir Insumos" },
  { value: "Promoción Precio", icon: Tag, label: "Promoción Precio" },
  { value: "Descuento", icon: ArrowDownUp, label: "Descuento" }
];

const PROD_EVENT_TYPES = [
  { value: "EDICION_LIMITADA", label: "Edición Limitada", icon: Flame, desc: "Plato festivo único y conmemorativo", activeCls: "border-amber-500 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 ring-2 ring-amber-400/40" },
  { value: "COMBO_ESPECIAL", label: "Combo Festivo", icon: Gift, desc: "Platillo + acompañamiento + bebida", activeCls: "border-purple-500 bg-purple-50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-200 ring-2 ring-purple-400/40" },
  { value: "PROMOCION_2X1", label: "Promoción 2x1", icon: Zap, desc: "Lleva 2 por el precio de 1", activeCls: "border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 ring-2 ring-rose-400/40" },
  { value: "DESCUENTO", label: "Precio Rebajado", icon: Tag, desc: "Descuento directo sobre precio regular", activeCls: "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-400/40" }
];

const BADGES_GASTRONOMICOS = [
  "🔥 Edición Festival",
  "⭐ Recomendado del Chef",
  "🌶️ Picante Gourmet",
  "🏆 Plato Estrella",
  "🌱 Opción Veggie",
  "🧀 Extra Queso"
];

export function CrearEventoModal({ isOpen, onClose, producto, onCreated }) {
  const { success, error: notifyError } = useNotifications();
  const [tipoEvento, setTipoEvento] = useState("Añadir Insumos");
  const [isTemporal, setIsTemporal] = useState(false);
  const [nombreEvento, setNombreEvento] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  
  // Bidireccionalidad: Crear Evento como Producto Nuevo desde Cero
  const [modoCrearProducto, setModoCrearProducto] = useState(false);
  const [prodNombre, setProdNombre] = useState("");
  const [prodCategoria, setProdCategoria] = useState(3);
  const [prodPrecioRegular, setProdPrecioRegular] = useState("");
  const [prodPrecioEvento, setProdPrecioEvento] = useState("");
  const [prodDescripcion, setProdDescripcion] = useState("");
  const [prodImagen, setProdImagen] = useState("");
  const [prodProcedimiento, setProdProcedimiento] = useState("");
  const [categoriasBD, setCategoriasBD] = useState([]);

  // Estados avanzados del producto nuevo de evento
  const [prodTipoEvento, setProdTipoEvento] = useState("EDICION_LIMITADA");
  const [prodEstadoInicial, setProdEstadoInicial] = useState("Activo");
  const [prodRendimiento, setProdRendimiento] = useState("1 porción");
  const [prodVigenciaTipo, setProdVigenciaTipo] = useState("temporal"); // 'temporal' | 'permanente'
  const [prodEtiquetas, setProdEtiquetas] = useState(["🔥 Edición Festival"]);
  const [prodDestacadoWeb, setProdDestacadoWeb] = useState(true);

  // Insumos de la Receta (Ficha Técnica Oficial para inventario y cocina)
  const [prodInsumosReceta, setProdInsumosReceta] = useState([]);
  const [searchRecetaInsumo, setSearchRecetaInsumo] = useState("");
  const [showRecetaDropdown, setShowRecetaDropdown] = useState(false);

  // Topping o Insumo de Cortesía del Evento
  const [tieneCortesia, setTieneCortesia] = useState(false);
  const [toppingCortesia, setToppingCortesia] = useState({ idInsumo: "", nombre: "", cantidad: 1, unidadMedida: "und" });

  // Cloudinary image upload states
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const fileInputRef = useRef(null);
  const [showManualUrl, setShowManualUrl] = useState(false);

  // Adiciones states
  const [todasAdiciones, setTodasAdiciones] = useState([]);
  const [adicionesSeleccionadas, setAdicionesSeleccionadas] = useState([]);
  const [adicionesSearch, setAdicionesSearch] = useState("");

  // Combo states
  const [todasBebidas, setTodasBebidas] = useState([]);
  const [configCombo, setConfigCombo] = useState({
    esCombo: false,
    cantidadBebidas: 1,
    bebidasPermitidas: []
  });

  // Variantes states
  const [prodVariantes, setProdVariantes] = useState([]);
  const [tiempoPreparacion, setTiempoPreparacion] = useState(12);

  // States for Insumos
  const [accion, setAccion] = useState("Agregar");
  const [insumoSearch, setInsumoSearch] = useState("");
  const [insumosBD, setInsumosBD] = useState([]);
  const [filteredInsumos, setFilteredInsumos] = useState([]);
  const [showInsumoDropdown, setShowInsumoDropdown] = useState(false);
  const [insumosSeleccionados, setInsumosSeleccionados] = useState([]);

  // States for Promo/Desc (Single product)
  const [nuevoPrecio, setNuevoPrecio] = useState("");
  const [descuento, setDescuento] = useState("");
  
  // States for Global Events (Multiple products)
  const [productoSearch, setProductoSearch] = useState("");
  const [productosBD, setProductosBD] = useState([]);
  const [filteredProductos, setFilteredProductos] = useState([]);
  const [showProductoDropdown, setShowProductoDropdown] = useState(false);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTipoEvento("Añadir Insumos");
      setIsTemporal(false);
      setNombreEvento("");
      setDescripcion("");
      setAccion("Agregar");
      setInsumoSearch("");
      setInsumosSeleccionados([]);
      setShowInsumoDropdown(false);
      
      const today = new Date().toISOString().split("T")[0];
      setFechaInicio(today);
      setFechaFin(today);
      
      setNuevoPrecio("");
      setDescuento("");

      // Reset campos de producto nuevo
      setModoCrearProducto(false);
      setProdNombre("");
      setProdCategoria(3);
      setProdPrecioRegular("");
      setProdPrecioEvento("");
      setProdDescripcion("");
      setProdImagen("");
      setImagePreviewUrl("");
      setUploadingImage(false);
      setShowManualUrl(false);
      setProdProcedimiento("");
      setAdicionesSeleccionadas([]);
      setAdicionesSearch("");
      setConfigCombo({
        esCombo: false,
        cantidadBebidas: 1,
        bebidasPermitidas: []
      });
      setProdVariantes([]);
      setTiempoPreparacion(12);
      setProdTipoEvento("EDICION_LIMITADA");
      setProdEstadoInicial("Activo");
      setProdRendimiento("1 porción");
      setProdVigenciaTipo("temporal");
      setProdEtiquetas(["🔥 Edición Festival"]);
      setProdDestacadoWeb(true);
      setProdInsumosReceta([]);
      setSearchRecetaInsumo("");
      setShowRecetaDropdown(false);
      setTieneCortesia(false);
      setToppingCortesia({ idInsumo: "", nombre: "", cantidad: 1, unidadMedida: "und" });

      // Fetch insumos and productos
      eventosService.getInsumos().then((data) => {
        setInsumosBD(data || []);
      }).catch(() => setInsumosBD([]));

      categoriaProductosService.getCategorias().then((data) => {
        setCategoriasBD(data || []);
      }).catch(() => setCategoriasBD([]));

      // Fetch adiciones para el formulario de producto
      adicionesService.getAdiciones().then((data) => {
        setTodasAdiciones(Array.isArray(data) ? data.filter(a => a.estado === 1 || a.estado === "Activo" || a.estado === undefined) : []);
      }).catch(() => setTodasAdiciones([]));

      // Fetch catálogo de bebidas para combo
      productosService.getProductos().then((prods) => {
        const bebidas = (prods || []).filter((p) => {
          const cat = String(p.categoria || p.categoriaNombre || "").toLowerCase();
          const nom = String(p.nombre || "").toLowerCase();
          return (
            cat.includes("bebida") ||
            cat.includes("gaseos") ||
            cat.includes("refresco") ||
            nom.includes("gaseosa") ||
            nom.includes("agua")
          );
        });
        setTodasBebidas(bebidas);
      }).catch(() => setTodasBebidas([]));

      if (!producto) {
        eventosService.getProductos().then((data) => {
          setProductosBD(data || []);
        }).catch(() => setProductosBD([]));
      }
    }
  }, [isOpen]);

  // Manejo de selección de imagen desde PC a Cloudinary
  const handleImageSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      notifyError("Archivo Inválido", "Solo se admiten archivos de imagen (JPG, PNG, WEBP).");
      return;
    }

    const localBlob = URL.createObjectURL(file);
    setImagePreviewUrl(localBlob);

    try {
      setUploadingImage(true);
      const secureUrl = await uploadImageToCloudinary(file);
      setProdImagen(secureUrl);
      setImagePreviewUrl(secureUrl);
      success("Imagen Subida", "La imagen se cargó exitosamente en Cloudinary.");
    } catch (err) {
      console.error("Error al subir a Cloudinary:", err);
      notifyError("Error al subir imagen", err.message || "No se pudo subir la imagen a Cloudinary.");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = () => {
    setProdImagen("");
    setImagePreviewUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Toggle adición seleccionada
  const toggleAdicion = (adicion) => {
    const adId = adicion.idAdicion || adicion.id;
    setAdicionesSeleccionadas((prev) => {
      const exists = prev.some((a) => (a.idAdicion || a.id) === adId);
      if (exists) {
        return prev.filter((a) => (a.idAdicion || a.id) !== adId);
      } else {
        return [
          ...prev,
          {
            idAdicion: adId,
            id: adId,
            nombre: adicion.nombre,
            precio: Number(adicion.precio || 0),
            imagen: adicion.imagen || ""
          }
        ];
      }
    });
  };

  const toggleSelectAllAdiciones = () => {
    if (adicionesSeleccionadas.length === todasAdiciones.length) {
      setAdicionesSeleccionadas([]);
    } else {
      setAdicionesSeleccionadas(
        todasAdiciones.map((a) => ({
          idAdicion: a.idAdicion || a.id,
          id: a.idAdicion || a.id,
          nombre: a.nombre,
          precio: Number(a.precio || 0),
          imagen: a.imagen || ""
        }))
      );
    }
  };

  // Manejo de cambio de categoría con auto-detección de combos
  const handleCategoriaChange = (catId) => {
    setProdCategoria(catId);
    const catObj = categoriasBD.find(c => (c.idCategoriaProducto || c.id) === catId);
    const isCombo = (catObj?.nombre || "").toLowerCase().includes("combo");
    if (isCombo) {
      setConfigCombo(prev => ({ ...prev, esCombo: true }));
    }
  };

  // Manejo de Variantes
  const handleAddVariante = () => {
    setProdVariantes(prev => [
      ...prev,
      {
        idVariante: null,
        nombre: "",
        precio: prodPrecioEvento || prodPrecioRegular || ""
      }
    ]);
  };

  const handleUpdateVariante = (idx, field, val) => {
    setProdVariantes(prev => prev.map((v, i) => i === idx ? { ...v, [field]: val } : v));
  };

  const handleRemoveVariante = (idx) => {
    setProdVariantes(prev => prev.filter((_, i) => i !== idx));
  };

  // Manejo de Insumos de Receta (Ficha Técnica de Cocina e Inventario)
  const handleAddInsumoReceta = (ins) => {
    const id = ins.idInsumo || ins.id;
    if (prodInsumosReceta.some(i => (i.idInsumo || i.id) === id)) return;
    setProdInsumosReceta(prev => [
      ...prev,
      {
        idInsumo: id,
        id: id,
        nombre: ins.nombre,
        unidadMedida: ins.unidadMedida || "und",
        cantidad: 1,
        stock: ins.stock || 0
      }
    ]);
    setSearchRecetaInsumo("");
    setShowRecetaDropdown(false);
  };

  const handleUpdateInsumoRecetaCantidad = (idx, delta) => {
    setProdInsumosReceta(prev =>
      prev.map((item, i) => {
        if (i === idx) {
          const current = Number(item.cantidad) || 0;
          const isDecimalUnit = item.unidadMedida === 'kg' || item.unidadMedida === 'lt';
          const step = isDecimalUnit ? 0.05 : 1;
          const nuevaCant = Math.max(isDecimalUnit ? 0.01 : 1, Math.round((current + delta * step) * 100) / 100);
          return { ...item, cantidad: nuevaCant };
        }
        return item;
      })
    );
  };

  const handleUpdateInsumoRecetaUnidad = (idx, unidadMedida) => {
    setProdInsumosReceta(prev => prev.map((item, i) => i === idx ? { ...item, unidadMedida } : item));
  };

  const handleRemoveInsumoReceta = (idx) => {
    setProdInsumosReceta(prev => prev.filter((_, i) => i !== idx));
  };

  const toggleEtiqueta = (tag) => {
    setProdEtiquetas(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const insumosSugeridosReceta = (insumosBD || []).filter((ins) => {
    const t = searchRecetaInsumo.trim().toLowerCase();
    const nombre = ins.nombre || "";
    const yaAgregado = prodInsumosReceta.some((i) => String(i.idInsumo || i.id) === String(ins.id || ins.idInsumo));
    return t.length > 0 && nombre.toLowerCase().includes(t) && !yaAgregado;
  }).slice(0, 8);

  const diasVigenciaCampaña = (() => {
    if (!fechaInicio || !fechaFin) return null;
    const ini = new Date(`${fechaInicio}T00:00:00`);
    const fin = new Date(`${fechaFin}T23:59:59`);
    const diffMs = fin.getTime() - ini.getTime();
    if (diffMs < 0) return 0;
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  })();

  useEffect(() => {
    if (insumoSearch.trim() === "") {
      setFilteredInsumos([]);
      setShowInsumoDropdown(false);
    } else {
      const term = insumoSearch.toLowerCase();
      const results = insumosBD.filter(
        (i) => {
          const isMatch = i.nombre?.toLowerCase().includes(term) || String(i.id || i.idInsumo || "").includes(term);
          const isNotAdded = !insumosSeleccionados.some(sel => String(sel.id) === String(i.id || i.idInsumo));
          return isMatch && isNotAdded;
        }
      );
      setFilteredInsumos(results.slice(0, 6));
      setShowInsumoDropdown(results.length > 0);
    }
  }, [insumoSearch, insumosBD, insumosSeleccionados]);

  useEffect(() => {
    if (!producto) {
      if (productoSearch.trim() === "") {
        setFilteredProductos([]);
        setShowProductoDropdown(false);
      } else {
        const term = productoSearch.toLowerCase();
        const results = productosBD.filter(
          (p) => {
            const isMatch = p.nombre?.toLowerCase().includes(term);
            const isNotAdded = !productosSeleccionados.some(sel => String(sel.id) === String(p.id || p.idProducto));
            return isMatch && isNotAdded;
          }
        );
        setFilteredProductos(results.slice(0, 6));
        setShowProductoDropdown(results.length > 0);
      }
    }
  }, [productoSearch, productosBD, productosSeleccionados, producto]);

  const handleSelectProducto = (prod) => {
    setProductosSeleccionados(prev => [
      ...prev,
      {
        id: prod.id || prod.idProducto,
        nombre: prod.nombre,
        precioBase: prod.precio,
        nuevoPrecio: "",
        descuento: ""
      }
    ]);
    setProductoSearch("");
    setShowProductoDropdown(false);
  };

  const quitarProducto = (idx) => {
    setProductosSeleccionados(prev => prev.filter((_, i) => i !== idx));
  };

  const updateProducto = (idx, field, value) => {
    setProductosSeleccionados(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const handleSelectInsumo = (insumo) => {
    setInsumosSeleccionados(prev => [
      ...prev,
      {
        id: insumo.id || insumo.idInsumo,
        nombre: insumo.nombre,
        cantidad: 1,
        unidad: insumo.unidadMedida || "und"
      }
    ]);
    setInsumoSearch("");
    setShowInsumoDropdown(false);
  };

  const quitarInsumo = (idx) => {
    setInsumosSeleccionados(prev => prev.filter((_, i) => i !== idx));
  };

  const updateInsumo = (idx, field, value) => {
    setInsumosSeleccionados(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const handleSubmit = async () => {
    // ── MODO CREAR PRODUCTO DE EVENTO DESDE CERO ──
    if (modoCrearProducto) {
      if (!nombreEvento.trim()) {
        notifyError("Validación Fallida", "El Título del Evento / Campaña es obligatorio.");
        return;
      }
      if (!prodNombre.trim()) {
        notifyError("Validación Fallida", "El Nombre del Producto en Menú es obligatorio.");
        return;
      }
      if (!prodPrecioRegular || Number(prodPrecioRegular) <= 0) {
        notifyError("Validación Fallida", "El Precio Normal de Carta debe ser mayor a cero.");
        return;
      }
      if (!prodPrecioEvento || Number(prodPrecioEvento) <= 0) {
        notifyError("Validación Fallida", "El Precio Especial de Evento debe ser mayor a cero.");
        return;
      }
      if (uploadingImage) {
        notifyError("Subiendo Imagen", "Por favor espera a que la imagen termine de subirse a Cloudinary.");
        return;
      }
      if (prodVigenciaTipo === "temporal" && fechaFin && fechaInicio && new Date(fechaFin) < new Date(fechaInicio)) {
        notifyError("Validación de Fechas", "La fecha fin de la campaña no puede ser anterior a la fecha de inicio.");
        return;
      }
      setSaving(true);
      try {
        const descParts = [prodDescripcion.trim()];
        if (prodEtiquetas.length > 0) descParts.push(`[${prodEtiquetas.join(", ")}]`);
        if (prodDestacadoWeb) descParts.push("[DESTACADO_WEB]");
        const finalDescripcion = descParts.filter(Boolean).join(" ");

        const payload = {
          crearComoProducto: true,
          nombreEvento: nombreEvento.trim(),
          descripcion: finalDescripcion || "Edición especial gastronómica de tiempo limitado.",
          tipoEvento: prodTipoEvento || "EDICION_LIMITADA",
          isTemporal: prodVigenciaTipo === "temporal",
          fechaInicio: prodVigenciaTipo === "temporal" ? (fechaInicio || new Date().toISOString().split("T")[0]) : null,
          fechaFin: prodVigenciaTipo === "temporal" ? (fechaFin || new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]) : null,
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
            procedimiento: prodProcedimiento.trim() || 'Preparar con los más selectos ingredientes de temporada y empaque festivo.',
            tiempoPreparacion: Number(tiempoPreparacion) || 12,
            rendimiento: prodRendimiento || '1 porción',
            estado: prodEstadoInicial === "Activo" ? 1 : 0,
            adiciones: adicionesSeleccionadas,
            configuracionCombo: configCombo.esCombo ? configCombo : null,
            variantes: prodVariantes.filter(v => v.nombre?.trim()).map(v => ({
              nombre: v.nombre.trim(),
              precio: Number(v.precio || prodPrecioEvento)
            })),
            insumosFicha: prodInsumosReceta.map(item => ({
              idInsumo: item.idInsumo || item.id,
              cantidad: Number(item.cantidad || 1),
              unidadMedida: item.unidadMedida || 'und'
            }))
          }
        };

        await eventosService.createEvento(payload);
        success("¡Producto de Evento Creado!", `Se ha creado "${prodNombre.trim()}" con sus insumos de receta, adiciones, combo, imagen y evento activo en la tienda.`);
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

    // ── MODO VINCULAR A PRODUCTO(S) EXISTENTE(S) ──
    if (!nombreEvento.trim()) {
      notifyError("Validación Fallida", "El Título del Evento es obligatorio.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        productoId: producto?.id || producto?.idProducto,
        tipoEvento,
        isTemporal,
        nombreEvento: nombreEvento.trim(),
        descripcion: descripcion.trim(),
        estado: "Activo",
      };

      if (isTemporal) {
        payload.fechaInicio = fechaInicio;
        payload.fechaFin = fechaFin;
      }

      if (tipoEvento === "Añadir Insumos") {
        payload.accion = accion;
        payload.insumos = insumosSeleccionados;
        if (nuevoPrecio) {
          payload.nuevoPrecio = Number(nuevoPrecio);
        }
      } else if (!producto) {
        // Global event: mapped to array of products
        payload.productos = productosSeleccionados.map(p => ({
          idProducto: p.id,
          nuevoPrecio: tipoEvento === "Promoción Precio" ? Number(p.nuevoPrecio) : null,
          descuento: tipoEvento === "Descuento" ? Number(p.descuento) : null
        }));
      } else if (tipoEvento === "Descuento") {
        payload.descuento = Number(descuento);
      } else if (tipoEvento === "Promoción Precio") {
        payload.nuevoPrecio = Number(nuevoPrecio);
      }

      await eventosService.createEvento(payload);
      success("¡Evento Creado!", "El evento se ha registrado correctamente.");
      if (onCreated) onCreated();
      onClose();
    } catch (err) {
      console.error("Error al crear evento:", err);
      notifyError("Error al crear evento", err.response?.data?.message || err.message || "Ocurrió un error inesperado.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh]">
        {/* Purple Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-500 p-6 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="text-4xl">🎉</div>
            <div>
              <h2 className="text-xl font-bold text-white">{producto ? "Crear Evento" : "Crear Evento Global"}</h2>
              <p className="text-purple-200 text-sm">{producto?.nombre || "Múltiples productos"}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Segmented Control: Modo Vincular Existente vs Crear Producto Nuevo */}
          {!producto && (
            <div className="flex items-center p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl">
              <button
                type="button"
                onClick={() => setModoCrearProducto(false)}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  !modoCrearProducto
                    ? "bg-white dark:bg-gray-900 text-purple-700 dark:text-purple-300 shadow-sm"
                    : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                }`}
              >
                <span>🔗 Vincular a Producto Existente</span>
              </button>
              <button
                type="button"
                onClick={() => setModoCrearProducto(true)}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  modoCrearProducto
                    ? "bg-gradient-to-r from-purple-600 to-rose-600 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>✨ Crear Producto de Evento Nuevo</span>
              </button>
            </div>
          )}

          {modoCrearProducto ? (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Sección 1: Datos Básicos del Evento y Producto */}
              <div className="bg-gray-50/70 dark:bg-gray-800/40 p-4 sm:p-5 rounded-2xl border border-gray-200/80 dark:border-gray-700/60 space-y-4">
                <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 font-bold text-xs uppercase tracking-wider">
                  <Flame className="w-4 h-4" />
                  <span>Información Principal y Formato de Campaña</span>
                </div>

                {/* Formato / Dinámica del Evento */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                    Formato / Dinámica del Evento *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {PROD_EVENT_TYPES.map((t) => {
                      const Icon = t.icon;
                      const isSelected = prodTipoEvento === t.value;
                      return (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => setProdTipoEvento(t.value)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between select-none ${
                            isSelected
                              ? t.activeCls
                              : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs flex items-center gap-1.5">
                              <Icon className="w-3.5 h-3.5 shrink-0" />
                              <span>{t.label}</span>
                            </span>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />}
                          </div>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-2">
                            {t.desc}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Título del Evento / Campaña */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Nombre del Evento / Campaña *
                  </label>
                  <input
                    type="text"
                    placeholder="ej. 🔥 Chazin Burger Fest 2026 - Edición Limitada"
                    value={nombreEvento}
                    onChange={(e) => setNombreEvento(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nombre del Producto a Vender */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                      Nombre del Producto en Menú *
                    </label>
                    <input
                      type="text"
                      placeholder="ej. Hamburguesa Burger Fest Trufada"
                      value={prodNombre}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProdNombre(val);
                        const vLow = val.toLowerCase();
                        if (vLow.includes("combo") || vLow.includes("+ bebida") || vLow.includes("+ gaseosa")) {
                          if (!configCombo.esCombo) setConfigCombo(prev => ({ ...prev, esCombo: true }));
                        }
                      }}
                      className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 font-medium"
                    />
                  </div>

                  {/* Categoría */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                      Categoría del Menú *
                    </label>
                    <select
                      value={prodCategoria}
                      onChange={(e) => handleCategoriaChange(Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 font-medium cursor-pointer"
                    >
                      {categoriasBD.filter(c => c.idCategoriaProducto !== 0).map((cat) => (
                        <option key={cat.idCategoriaProducto || cat.id} value={cat.idCategoriaProducto || cat.id}>
                          {cat.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Rendimiento / Porciones */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                      Rendimiento / Porciones
                    </label>
                    <select
                      value={prodRendimiento}
                      onChange={(e) => setProdRendimiento(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 font-medium cursor-pointer"
                    >
                      <option value="1 porción">1 Persona (Personal)</option>
                      <option value="2 personas">2 Personas (Pareja / Dúo)</option>
                      <option value="4 personas">4 Personas (Familiar / Amigos)</option>
                      <option value="Para compartir">Para Compartir (Picada)</option>
                    </select>
                  </div>

                  {/* Estado Inicial */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                      Estado Inicial del Producto
                    </label>
                    <select
                      value={prodEstadoInicial}
                      onChange={(e) => setProdEstadoInicial(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 font-medium cursor-pointer"
                    >
                      <option value="Activo">✓ Activo (Publicado de inmediato en Menú)</option>
                      <option value="Inactivo">⏸ Inactivo / Borrador (Oculto)</option>
                    </select>
                  </div>
                </div>

                {/* Badges y Etiquetas del Menú */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Etiquetas Destacadas para el Menú
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {BADGES_GASTRONOMICOS.map((tag) => {
                      const hasTag = prodEtiquetas.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleEtiqueta(tag)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
                            hasTag
                              ? "bg-purple-600 text-white shadow-xs"
                              : "bg-gray-150 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Precios: Regular vs Evento */}
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                      Precio Normal de Carta ($) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="ej. 28000"
                      value={prodPrecioRegular}
                      onChange={(e) => setProdPrecioRegular(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider mb-1.5">
                      Precio Especial de Evento ($) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="ej. 24000"
                      value={prodPrecioEvento}
                      onChange={(e) => setProdPrecioEvento(e.target.value)}
                      className="w-full px-4 py-2.5 bg-purple-50 dark:bg-purple-950/30 border-2 border-purple-400 dark:border-purple-600 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 font-black text-purple-700 dark:text-purple-300"
                    />
                  </div>
                </div>

                {/* Dynamic Savings Breakdown */}
                {Number(prodPrecioRegular) > 0 && Number(prodPrecioEvento) > 0 && Number(prodPrecioRegular) > Number(prodPrecioEvento) && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    <span>🎉 Ahorro directo para el cliente:</span>
                    <span className="bg-emerald-200 dark:bg-emerald-900/60 px-2.5 py-0.5 rounded-full font-black">
                      ${(Number(prodPrecioRegular) - Number(prodPrecioEvento)).toLocaleString()} ({Math.round(((Number(prodPrecioRegular) - Number(prodPrecioEvento)) / Number(prodPrecioRegular)) * 100)}% OFF)
                    </span>
                  </div>
                )}
              </div>

              {/* Sección 2: Subida de Imagen a Cloudinary desde el PC */}
              <div className="border border-purple-200/80 dark:border-purple-900/40 bg-purple-50/30 dark:bg-purple-950/20 rounded-2xl p-4 sm:p-5 space-y-3.5">
                <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-bold text-xs uppercase tracking-wider">
                  <UploadCloud className="w-4 h-4" />
                  <span>Imagen del Producto (Subir a Cloudinary o URL)</span>
                </div>

                <div className="flex flex-col sm:flex-row items-start gap-4">
                  {/* Preview Box */}
                  <div className="w-28 h-28 shrink-0 rounded-2xl border-2 border-dashed border-purple-300 dark:border-purple-700 flex items-center justify-center overflow-hidden bg-white dark:bg-gray-900 shadow-2xs relative group">
                    {imagePreviewUrl || prodImagen ? (
                      <>
                        <img
                          src={imagePreviewUrl || prodImagen}
                          alt="Preview Producto"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                          title="Eliminar imagen"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-purple-300 dark:text-purple-600 p-2 text-center">
                        <Utensils className="w-8 h-8 mb-1 opacity-50" />
                        <span className="text-[10px] font-bold">Sin imagen</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex-1 space-y-2.5 w-full">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50 active:scale-95"
                      >
                        {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                        <span>{uploadingImage ? "Subiendo a Cloudinary..." : imagePreviewUrl || prodImagen ? "Cambiar Imagen desde PC" : "Subir Imagen desde PC"}</span>
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

                      <button
                        type="button"
                        onClick={() => setShowManualUrl(prev => !prev)}
                        className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-semibold ml-auto cursor-pointer"
                      >
                        {showManualUrl ? "Ocultar URL manual" : "O ingresar URL web..."}
                      </button>
                    </div>

                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleImageSelected}
                    />

                    {showManualUrl && (
                      <div className="mt-2 animate-in fade-in duration-150">
                        <input
                          type="text"
                          placeholder="https://res.cloudinary.com/... o enlace de imagen"
                          value={prodImagen}
                          onChange={(e) => {
                            setProdImagen(e.target.value);
                            setImagePreviewUrl(e.target.value);
                          }}
                          className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-purple-200 dark:border-purple-800 rounded-xl text-xs font-mono text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    )}

                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Sube la foto desde tu computadora. Se guardará permanentemente y optimizada en Cloudinary (JPG, PNG o WEBP).
                    </p>
                  </div>
                </div>
              </div>

              {/* Sección 3: Configuración de Combo y Bebidas Incluidas */}
              <div className="border border-blue-200 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl shrink-0">🥤</span>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-200">
                        Configuración de Combo: Bebidas Incluidas
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        Permite que el cliente elija bebidas incluidas sin costo extra al ordenar este producto.
                      </p>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      {configCombo.esCombo ? "Es Combo" : "No es Combo"}
                    </span>
                    <input
                      type="checkbox"
                      checked={configCombo.esCombo}
                      onChange={(e) => setConfigCombo({ ...configCombo, esCombo: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </label>
                </div>

                {configCombo.esCombo && (
                  <div className="space-y-3 pt-3 border-t border-blue-150 dark:border-blue-900/40 animate-in fade-in duration-150">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                        Cantidad de Bebidas Incluidas en el Combo:
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-1 shadow-2xs">
                          <button
                            type="button"
                            onClick={() => setConfigCombo(prev => ({ ...prev, cantidadBebidas: Math.max(1, (prev.cantidadBebidas || 1) - 1) }))}
                            className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 font-bold text-gray-700 dark:text-gray-200 flex items-center justify-center transition cursor-pointer active:scale-95 text-xs"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-black text-xs text-gray-900 dark:text-gray-100">
                            {configCombo.cantidadBebidas || 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => setConfigCombo(prev => ({ ...prev, cantidadBebidas: Math.min(10, (prev.cantidadBebidas || 1) + 1) }))}
                            className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 font-bold text-gray-700 dark:text-gray-200 flex items-center justify-center transition cursor-pointer active:scale-95 text-xs"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-xs text-blue-700 dark:text-blue-300 font-semibold">
                          {configCombo.cantidadBebidas === 1
                            ? "✓ El cliente podrá elegir 1 bebida incluida en el precio ($0 COP)."
                            : `✓ El cliente podrá elegir ${configCombo.cantidadBebidas} bebidas incluidas en el precio ($0 COP).`}
                        </span>
                      </div>
                    </div>

                    {todasBebidas.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                            Bebidas disponibles para elegir ({todasBebidas.length} en catálogo):
                          </label>
                          <button
                            type="button"
                            onClick={() => setConfigCombo(prev => ({ ...prev, bebidasPermitidas: [] }))}
                            className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                          >
                            Habilitar todas
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1">
                          {todasBebidas.map((bebida) => {
                            const bId = bebida.id || bebida.idProducto;
                            const isAllowed = configCombo.bebidasPermitidas.length === 0 || configCombo.bebidasPermitidas.includes(bId);
                            return (
                              <label
                                key={bId}
                                className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition select-none ${
                                  isAllowed
                                    ? "bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-900/60 text-gray-900 dark:text-gray-100 shadow-2xs"
                                    : "bg-gray-50/70 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700 text-gray-400 opacity-60"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isAllowed}
                                  onChange={() => {
                                    const current = configCombo.bebidasPermitidas.length === 0
                                      ? todasBebidas.map(b => b.id || b.idProducto)
                                      : [...configCombo.bebidasPermitidas];
                                    let updated;
                                    if (current.includes(bId)) {
                                      updated = current.filter(id => id !== bId);
                                    } else {
                                      updated = [...current, bId];
                                    }
                                    setConfigCombo(prev => ({
                                      ...prev,
                                      bebidasPermitidas: updated.length === todasBebidas.length ? [] : updated
                                    }));
                                  }}
                                  className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                                />
                                <span className="truncate font-medium flex-1">{bebida.nombre}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Sección 4: Adiciones Disponibles para este Producto */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Adiciones Disponibles
                  </label>
                  {todasAdiciones.length > 0 && (
                    <button
                      type="button"
                      onClick={toggleSelectAllAdiciones}
                      className="text-xs font-semibold text-[#F05454] hover:underline cursor-pointer"
                    >
                      {adicionesSeleccionadas.length === todasAdiciones.length ? "Desmarcar todas" : "Seleccionar todas"}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {todasAdiciones.map((adicion) => {
                    const adId = adicion.idAdicion || adicion.id;
                    const isSelected = adicionesSeleccionadas.some((a) => (a.idAdicion || a.id) === adId);
                    return (
                      <label
                        key={adId}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                          isSelected 
                            ? 'border-[#F05454] bg-red-50 dark:bg-red-900/10' 
                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleAdicion(adicion)}
                          className="rounded text-[#F05454] focus:ring-[#F05454] cursor-pointer"
                        />
                        <span className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-base shrink-0 border border-gray-200/60 dark:border-gray-700 overflow-hidden shadow-2xs">
                          {adicion.imagen && (adicion.imagen.startsWith("http") || adicion.imagen.startsWith("/")) ? (
                            <img src={adicion.imagen} alt={adicion.nombre} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            getAdditionEmoji(adicion.nombre, adicion.imagen)
                          )}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {adicion.nombre}
                          </p>
                          <p className="text-xs text-[#F05454] font-medium">
                            +${Number(adicion.precio || 0).toLocaleString('es-CO')}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                  {todasAdiciones.length === 0 && (
                    <p className="text-sm text-gray-500 col-span-full">No hay adiciones registradas en el sistema.</p>
                  )}
                </div>
              </div>

              {/* Sección 5: Variantes y Presentaciones (Opcional) */}
              <div className="border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200">
                        Variantes o Presentaciones (Opcional)
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        ¿Tiene diferentes tamaños (ej. 400ml, 1.5L) o sabores (ej. Original, Sin Azúcar)?
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddVariante}
                    className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 text-xs font-bold rounded-xl flex items-center gap-1 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Variante</span>
                  </button>
                </div>

                {prodVariantes.length > 0 && (
                  <div className="space-y-2 pt-2">
                    {prodVariantes.map((v, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-white dark:bg-gray-900 p-2 rounded-xl border border-gray-200 dark:border-gray-700">
                        <span className="text-xs font-bold text-gray-400 w-6 text-center">#{idx + 1}</span>
                        <input
                          type="text"
                          placeholder="Nombre variante (ej. Doble Carne, 1.5L)"
                          value={v.nombre}
                          onChange={(e) => handleUpdateVariante(idx, "nombre", e.target.value)}
                          className="flex-1 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs"
                        />
                        <input
                          type="number"
                          placeholder="Precio ($)"
                          value={v.precio}
                          onChange={(e) => handleUpdateVariante(idx, "precio", e.target.value)}
                          className="w-28 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveVariante(idx)}
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg cursor-pointer"
                          title="Eliminar variante"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sección 6: Insumos de la Receta / Ficha Técnica Oficial (Inventario y Cocina) */}
              <div className="border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/20 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <Utensils className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-950 dark:text-emerald-200">
                          Insumos de la Receta (Ficha Técnica Oficial)
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-200 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200">
                          {prodInsumosReceta.length} ingredientes
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        Define los insumos de inventario que componen este platillo para que la cocina consulte la receta y se descuente stock al venderlo.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Buscador de Insumos */}
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar insumo para agregar a la receta (ej. Pan Brioche, Carne Angus, Queso Cheddar)..."
                      value={searchRecetaInsumo}
                      onChange={(e) => {
                        setSearchRecetaInsumo(e.target.value);
                        setShowRecetaDropdown(true);
                      }}
                      onFocus={() => setShowRecetaDropdown(true)}
                      className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-900 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {showRecetaDropdown && insumosSugeridosReceta.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl z-30 max-h-56 overflow-y-auto p-1 divide-y divide-gray-100 dark:divide-gray-800">
                      {insumosSugeridosReceta.map((ins) => (
                        <button
                          key={ins.idInsumo || ins.id}
                          type="button"
                          onClick={() => handleAddInsumoReceta(ins)}
                          className="w-full px-3 py-2 text-left hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl flex items-center justify-between transition cursor-pointer text-xs group"
                        >
                          <span className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-emerald-600">
                            {ins.nombre}
                          </span>
                          <span className="text-[11px] text-gray-500 dark:text-gray-400">
                            Stock: {ins.stock || 0} {ins.unidadMedida || 'und'}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Lista de Insumos Añadidos */}
                {prodInsumosReceta.length > 0 ? (
                  <div className="space-y-2 pt-1">
                    {prodInsumosReceta.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 p-2.5 bg-white dark:bg-gray-900 border border-emerald-100 dark:border-emerald-900/40 rounded-xl shadow-2xs"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
                            {item.nombre}
                          </p>
                          <span className="text-[10px] text-gray-400">
                            En bodega: {item.stock} {item.unidadMedida}
                          </span>
                        </div>

                        {/* Cantidad y Unidad */}
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
                            <button
                              type="button"
                              onClick={() => handleUpdateInsumoRecetaCantidad(idx, -1)}
                              className="w-6 h-6 rounded-md bg-white dark:bg-gray-700 hover:bg-gray-200 font-bold text-gray-700 dark:text-gray-200 flex items-center justify-center text-xs transition cursor-pointer"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              step="any"
                              min="0.01"
                              value={item.cantidad}
                              onChange={(e) => handleUpdateInsumoReceta(idx, "cantidad", Math.max(0.01, parseFloat(e.target.value) || 0))}
                              className="w-14 text-center font-bold text-xs bg-transparent border-0 outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleUpdateInsumoRecetaCantidad(idx, 1)}
                              className="w-6 h-6 rounded-md bg-white dark:bg-gray-700 hover:bg-gray-200 font-bold text-gray-700 dark:text-gray-200 flex items-center justify-center text-xs transition cursor-pointer"
                            >
                              +
                            </button>
                          </div>

                          <select
                            value={item.unidadMedida}
                            onChange={(e) => handleUpdateInsumoRecetaUnidad(idx, e.target.value)}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-semibold cursor-pointer"
                          >
                            <option value="und">und</option>
                            <option value="gr">gr</option>
                            <option value="kg">kg</option>
                            <option value="ml">ml</option>
                            <option value="lt">lt</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => handleRemoveInsumoReceta(idx)}
                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition cursor-pointer"
                            title="Quitar insumo de la receta"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic py-1">
                    No has agregado insumos a la receta. Puedes buscar arriba ingredientes como Pan Brioche, Carne Angus 180g, Queso Gouda, Salsas, etc.
                  </p>
                )}
              </div>

              {/* Sección 7: Ingrediente Extra o Topping de Cortesía (Opcional) */}
              <div className="border border-amber-200 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/20 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
                      <Gift className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-950 dark:text-amber-200">
                        Topping de Cortesía Incluido por la Campaña (Opcional)
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        ¿Este festival incluye un topping o ingrediente de regalo sin costo adicional para el comensal?
                      </p>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      {tieneCortesia ? "Con Cortesía" : "Sin Cortesía"}
                    </span>
                    <input
                      type="checkbox"
                      checked={tieneCortesia}
                      onChange={(e) => setTieneCortesia(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                  </label>
                </div>

                {tieneCortesia && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-amber-200/60 dark:border-amber-900/40 animate-in fade-in duration-150">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Insumo o Topping de Regalo:
                      </label>
                      <select
                        value={toppingCortesia.idInsumo || ""}
                        onChange={(e) => {
                          const selected = insumosBD.find(ins => String(ins.idInsumo || ins.id) === String(e.target.value));
                          setToppingCortesia({
                            idInsumo: e.target.value,
                            nombre: selected?.nombre || "",
                            cantidad: 1,
                            unidadMedida: selected?.unidadMedida || "und"
                          });
                        }}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-amber-200 dark:border-amber-800 rounded-xl text-xs font-semibold cursor-pointer"
                      >
                        <option value="">Selecciona el ingrediente de cortesía...</option>
                        {insumosBD.map((ins) => (
                          <option key={ins.idInsumo || ins.id} value={ins.idInsumo || ins.id}>
                            {ins.nombre} ({ins.unidadMedida || 'und'})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Porción de Regalo:
                      </label>
                      <div className="flex items-center gap-1.5 bg-white dark:bg-gray-900 border border-amber-200 dark:border-amber-800 rounded-xl p-1">
                        <input
                          type="number"
                          min="1"
                          value={toppingCortesia.cantidad || 1}
                          onChange={(e) => setToppingCortesia(prev => ({ ...prev, cantidad: Math.max(1, parseFloat(e.target.value) || 1) }))}
                          className="w-full text-center font-bold text-xs bg-transparent border-0 outline-none"
                        />
                        <span className="text-xs font-bold text-amber-700 dark:text-amber-300 pr-2">
                          {toppingCortesia.unidadMedida || 'und'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sección 8: Descripción Gourmet & Ficha Técnica */}
              <div className="bg-gray-50/70 dark:bg-gray-800/40 p-4 sm:p-5 rounded-2xl border border-gray-200/80 dark:border-gray-700/60 space-y-4">
                <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 font-bold text-xs uppercase tracking-wider">
                  <Utensils className="w-4 h-4" />
                  <span>Detalles de Cocina y Preparación</span>
                </div>

                {/* Descripción Gourmet */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Descripción Gourmet / Atributos del Plato
                  </label>
                  <textarea
                    rows={2}
                    placeholder="180g de carne angus madurada, queso gouda ahumado fundido, cebolla caramelizada al vino tinto y salsa trufada en pan brioche artesanal..."
                    value={prodDescripcion}
                    onChange={(e) => setProdDescripcion(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    {/* Procedimiento de Preparación (Ficha Técnica) */}
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                      Procedimiento de Preparación Oficial
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Sellar la carne a la plancha a término medio. Tostar pan brioche con mantequilla artesanal. Untar salsa festiva..."
                      value={prodProcedimiento}
                      onChange={(e) => setProdProcedimiento(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 resize-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                      Tiempo Preparación (min)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={tiempoPreparacion}
                      onChange={(e) => setTiempoPreparacion(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 9: Vigencia del Evento y Visibilidad Web */}
              <div className="border border-purple-100 dark:border-purple-900/40 rounded-2xl bg-purple-50/50 dark:bg-purple-900/10 p-4 sm:p-5 space-y-4">
                <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 font-bold text-xs uppercase tracking-wider">
                  <CalendarClock className="w-4 h-4" />
                  <span>Vigencia de la Campaña y Publicación Web</span>
                </div>

                {/* Selector de Vigencia: Temporal vs Permanente */}
                <div className="flex items-center gap-2 p-1 bg-white dark:bg-gray-900 rounded-xl border border-purple-200 dark:border-purple-800/60">
                  <button
                    type="button"
                    onClick={() => setProdVigenciaTipo("temporal")}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      prodVigenciaTipo === "temporal"
                        ? "bg-purple-600 text-white shadow-xs"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                  >
                    ⏱️ Campaña Temporal (con fecha límite)
                  </button>
                  <button
                    type="button"
                    onClick={() => setProdVigenciaTipo("permanente")}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      prodVigenciaTipo === "permanente"
                        ? "bg-purple-600 text-white shadow-xs"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                  >
                    ♾️ Vigencia Permanente / Indefinida
                  </button>
                </div>

                {prodVigenciaTipo === "temporal" ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Fecha Inicio de Campaña
                        </label>
                        <input
                          type="date"
                          value={fechaInicio}
                          onChange={(e) => setFechaInicio(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Fecha Fin de Campaña
                        </label>
                        <input
                          type="date"
                          value={fechaFin}
                          onChange={(e) => setFechaFin(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                    {diasVigenciaCampaña !== null && (
                      <p className="text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Duración de la campaña: {diasVigenciaCampaña} {diasVigenciaCampaña === 1 ? "día" : "días"} (del {fechaInicio} al {fechaFin}).</span>
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-purple-200 dark:border-purple-800/60 text-xs text-purple-800 dark:text-purple-300 font-medium">
                    ✓ Este platillo de evento permanecerá activo permanentemente en el catálogo online y POS hasta que el administrador decida pausarlo.
                  </div>
                )}

                {/* Destacar en portada web */}
                <div className="pt-2 border-t border-purple-200/60 dark:border-purple-800/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                    <div>
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                        Destacar en Portada Web & Menú Principal
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        Aparecerá en el carrusel superior y en la sección especial de eventos de la tienda web.
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={prodDestacadoWeb}
                    onChange={(e) => setProdDestacadoWeb(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Tipo de Evento */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Tipo de Modificación
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {TIPO_EVENTO_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const isActive = tipoEvento === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setTipoEvento(opt.value)}
                        className={`flex flex-col items-center justify-center gap-2 px-2 py-4 rounded-xl border-2 text-sm font-medium transition-all ${
                          isActive
                            ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
                            : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                        }`}
                      >
                        <Icon className={`w-6 h-6 ${isActive ? "text-purple-500" : "text-gray-400"}`} />
                        <span className="text-center text-xs">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Temporalidad Toggle */}
              <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-750 select-none">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isTemporal ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30' : 'bg-gray-200 text-gray-500 dark:bg-gray-700'}`}>
                    <CalendarClock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Evento Temporal</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Activo solo en un rango de fechas</p>
                  </div>
                </div>
                <div className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${isTemporal ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isTemporal ? 'translate-x-6' : 'translate-x-1'}`} />
                </div>
                {/* Hidden checkbox to trigger onChange */}
                <input type="checkbox" className="hidden" checked={isTemporal} onChange={() => setIsTemporal(!isTemporal)} />
              </label>

              {/* Fechas (Condicionales) */}
              {isTemporal && (
                <div className="grid grid-cols-2 gap-4 p-4 border border-purple-100 dark:border-purple-900/30 rounded-2xl bg-purple-50/50 dark:bg-purple-900/10">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Fecha Inicio
                    </label>
                    <input
                      type="date"
                      value={fechaInicio}
                      onChange={(e) => setFechaInicio(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Fecha Fin
                    </label>
                    <input
                      type="date"
                      value={fechaFin}
                      onChange={(e) => setFechaFin(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Título y Descripción */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Título del Evento <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={nombreEvento}
                    onChange={(e) => setNombreEvento(e.target.value)}
                    placeholder="Ej: Temporada de verano — carne extra incluida"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Describe brevemente este evento..."
                    rows={2}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Detalle Insumos */}
              {tipoEvento === "Añadir Insumos" && (
                <div className="p-5 bg-gray-50 dark:bg-gray-800 rounded-2xl space-y-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Gestión de Insumos</h3>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="accion"
                          value="Agregar"
                          checked={accion === "Agregar"}
                          onChange={() => setAccion("Agregar")}
                          className="accent-purple-600"
                        />
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Sumar al plato</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="accion"
                          value="Eliminar"
                          checked={accion === "Eliminar"}
                          onChange={() => setAccion("Eliminar")}
                          className="accent-gray-600"
                        />
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Restar del plato</span>
                      </label>
                    </div>
                  </div>

                  {/* Buscador de insumos */}
                  <div className="relative z-10">
                    <div className="relative">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={insumoSearch}
                        onChange={(e) => setInsumoSearch(e.target.value)}
                        onFocus={() => {
                          if (filteredInsumos.length > 0) setShowInsumoDropdown(true);
                        }}
                        placeholder="Buscar insumos para agregar..."
                        className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    {showInsumoDropdown && (
                      <div className="absolute top-full mt-1 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                        {filteredInsumos.map((ins) => (
                          <button
                            key={ins.id || ins.idInsumo}
                            type="button"
                            onClick={() => handleSelectInsumo(ins)}
                            className="w-full px-4 py-2.5 text-left text-sm hover:bg-purple-50 dark:hover:bg-purple-900/20 text-gray-700 dark:text-gray-300 flex items-center justify-between transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0"
                          >
                            <span className="font-medium">{ins.nombre}</span>
                            <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">{ins.unidadMedida || 'und'}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Lista de insumos seleccionados */}
                  {insumosSeleccionados.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <label className="block text-xs font-medium text-gray-500 mb-2">Insumos Seleccionados:</label>
                      {insumosSeleccionados.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-white dark:bg-gray-900 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{item.nombre}</p>
                          </div>
                          <div className="w-24">
                            <input
                              type="number"
                              min="0.1"
                              step="0.1"
                              value={item.cantidad}
                              onChange={(e) => updateInsumo(idx, "cantidad", e.target.value)}
                              className="w-full px-2 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-center focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                          <div className="w-20">
                            <select
                              value={item.unidad}
                              onChange={(e) => updateInsumo(idx, "unidad", e.target.value)}
                              className="w-full px-2 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500"
                            >
                              <option value="und">und</option>
                              <option value="gr">gr</option>
                              <option value="kg">kg</option>
                              <option value="ml">ml</option>
                              <option value="lt">lt</option>
                              <option value="oz">oz</option>
                              <option value="lb">lb</option>
                            </select>
                          </div>
                          <button
                            type="button"
                            onClick={() => quitarInsumo(idx)}
                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {insumosSeleccionados.length === 0 && (
                    <div className="text-center py-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                      <p className="text-xs text-gray-400">Busca y selecciona insumos para modificar el plato.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Sección de Precio / Descuento */}
              {(tipoEvento === "Descuento" || tipoEvento === "Promoción Precio" || tipoEvento === "Añadir Insumos") && (
                <div className="p-5 bg-gray-50 dark:bg-gray-800 rounded-2xl space-y-4 border border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                    {tipoEvento === "Descuento" ? "Detalles del Descuento" : tipoEvento === "Añadir Insumos" ? "Precio de Venta" : "Detalles de la Promoción"}
                  </h3>
                  
                  {producto ? (
                    // Single product event
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Precio Actual del Producto</label>
                        <div className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 font-medium flex items-center h-[42px] opacity-70">
                          ${producto?.precio?.toLocaleString() || "0"}
                        </div>
                      </div>
                      
                      {tipoEvento === "Descuento" ? (
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Descuento ($ o %)</label>
                          <input
                            type="number"
                            min="0"
                            value={descuento}
                            onChange={(e) => setDescuento(e.target.value)}
                            placeholder="Ej: 10 (%) o 5000 ($)"
                            className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent h-[42px]"
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            {tipoEvento === "Añadir Insumos" ? "Precio Final con Adiciones" : "Nuevo Precio Promocional"}
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={nuevoPrecio}
                            onChange={(e) => setNuevoPrecio(e.target.value)}
                            placeholder="Ej: 15000"
                            className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent h-[42px]"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    // Multiple product event
                    <div className="space-y-4">
                      <div className="relative z-10">
                        <div className="relative">
                          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={productoSearch}
                            onChange={(e) => setProductoSearch(e.target.value)}
                            onFocus={() => {
                              if (filteredProductos.length > 0) setShowProductoDropdown(true);
                            }}
                            placeholder="Buscar productos para agregar al evento..."
                            className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                        {showProductoDropdown && (
                          <div className="absolute top-full mt-1 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                            {filteredProductos.map((prod) => (
                              <button
                                key={prod.id || prod.idProducto}
                                type="button"
                                onClick={() => handleSelectProducto(prod)}
                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-purple-50 dark:hover:bg-purple-900/20 text-gray-700 dark:text-gray-300 flex items-center justify-between transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0"
                              >
                                <span className="font-medium">{prod.nombre}</span>
                                <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">${prod.precio}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {productosSeleccionados.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {productosSeleccionados.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 bg-white dark:bg-gray-900 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{item.nombre}</p>
                                <p className="text-xs text-gray-400">Precio base: ${item.precioBase}</p>
                              </div>
                              <div className="w-32">
                                <input
                                  type="number"
                                  min="0"
                                  placeholder={tipoEvento === "Descuento" ? "Desc" : "Precio"}
                                  value={tipoEvento === "Descuento" ? item.descuento : item.nuevoPrecio}
                                  onChange={(e) => updateProducto(idx, tipoEvento === "Descuento" ? "descuento" : "nuevoPrecio", e.target.value)}
                                  className="w-full px-2 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => quitarProducto(idx)}
                                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 bg-gray-50/50 dark:bg-gray-900/50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-2xl text-sm transition-colors border border-gray-200 dark:border-gray-700"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !nombreEvento.trim()}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-medium rounded-2xl text-sm transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Zap className="w-4 h-4" />
            <span>{saving ? "Creando..." : "Crear Evento"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
