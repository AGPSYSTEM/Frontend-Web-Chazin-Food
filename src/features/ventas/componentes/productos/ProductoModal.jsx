import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { 
  X, Utensils, UploadCloud, Loader2, Plus, Trash2, Layers, Camera, 
  Sparkles, Lightbulb, AlertCircle, Calculator, Lock, FileText, 
  Search, Check, ChevronDown, ChevronRight, CheckCircle2, PackageCheck, 
  Info, Eye, ArrowRight, ArrowLeft, Copy, History, RotateCcw, ChefHat, ArrowRightLeft, SlidersHorizontal,
  Ban, AlertTriangle, DollarSign
} from "lucide-react";
import { NumberInput } from "@/shared/components/ui/NumberInput";
import { FichaTecnicaProducto, checkInsumoInvalido } from "@/features/fichas-tecnicas/componentes/FichaTecnicaProducto";
import { adicionesService } from "@/features/compras/servicios/adicionesService";
import { productosService } from "@/features/ventas/servicios/productosService";
import { insumosService } from "@/features/compras/servicios/insumosService";
import { getAdditionEmoji, isDummyOrBaseVariant } from "@/shared/utils/foodEmojiUtils";
import { FoodIcon, FoodIconBadge } from "@/shared/components/ui/FoodIcon";
import { uploadImageToCloudinary } from "@/shared/servicios/cloudinaryService";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { validateTexto, validateNumeroPositivo } from "@/shared/utils/validationUtils";
import { 
  calculateInsumoCost,
  calculateRecipeTotals, 
  resolveRecetaUnidadYCantidad, 
  getUnidadesCompatibles, 
  normalizeUnidadMedida, 
  convertirUnidadYCantidad 
} from "@/features/fichas-tecnicas/utils/costoUtils";
import { matchesSmartSearch } from "@/shared/utils/searchUtils";
import {
  isSizeVariantName,
  detectVariantSizeInfo,
  scaleQuantityByFactor,
  buildVariantDetallesFromBase,
  reconstructVariantDetallesFromDeltas,
  computeInsumosModificadosDeltas
} from "../../utils/variantFichaUtils";

export {
  isSizeVariantName,
  detectVariantSizeInfo,
  scaleQuantityByFactor,
  buildVariantDetallesFromBase,
  reconstructVariantDetallesFromDeltas,
  computeInsumosModificadosDeltas
};

export const getDefaultDrinkImageForSize = (sizeName = "", prodName = "") => {
  const sn = String(sizeName || "").toLowerCase();
  const pn = String(prodName || "").toLowerCase();
  if (sn.includes("1.5") || sn.includes("1,5")) {
    if (pn.includes("coca")) return "/images/drinks/coca_cola_1.5-LITROS-removebg-preview.png";
    if (pn.includes("pepsi")) return "/images/drinks/pepsi_1.5-removebg-preview.png";
    if (pn.includes("manzana")) return "/images/drinks/manzana_1.5_L-removebg-preview.png";
    if (pn.includes("naranja")) return "/images/drinks/naranga_1.5-removebg-preview.png";
    if (pn.includes("uva")) return "/images/drinks/bebida-uva-1500ml_00-600x600-removebg-preview.png";
    if (pn.includes("cuatro") || pn.includes("quatro")) return "/images/drinks/gaseosa-quatro-15-lt-removebg-preview.png";
    if (pn.includes("colombiana")) return "https://res.cloudinary.com/dckwtknmq/image/upload/v1789001495/qy8wy9igmgb0wppnjavw.png";
    return "/images/drinks/pepsi_1.5-removebg-preview.png";
  }
  if (sn.includes("2.5") || sn.includes("2,5") || sn.includes("mega")) {
    if (pn.includes("coca")) return "/images/drinks/mega_coca_cola-removebg-preview.png";
    if (pn.includes("pepsi")) return "/images/drinks/mega_pepsi-removebg-preview.png";
    if (pn.includes("manzana")) return "/images/drinks/Manzana-Super-Gigante-25-Litros-223182_a-removebg-preview.png";
    if (pn.includes("naranja")) return "/images/drinks/postob_n_naranja_2.5l_1_-removebg-preview.png";
    if (pn.includes("uva")) return "/images/drinks/Uva_mega-removebg-preview.png";
    if (pn.includes("cuatro") || pn.includes("quatro")) return "/images/drinks/quatro_mega-removebg-preview.png";
    if (pn.includes("colombiana")) return "https://res.cloudinary.com/dckwtknmq/image/upload/v1789001495/qy8wy9igmgb0wppnjavw.png";
    return "/images/drinks/mega_pepsi-removebg-preview.png";
  }
  return "";
};

export const getDefaultDrinkImageForFlavor = (flavorName = "", prodName = "") => {
  const fn = String(flavorName || "").toLowerCase();
  const pn = String(prodName || "").toLowerCase();
  if (fn.includes("sin azúcar") || fn.includes("sin azucar") || fn.includes("light") || fn.includes("zero") || fn.includes("black")) {
    if (pn.includes("coca")) return "https://res.cloudinary.com/dckwtknmq/image/upload/v1790136235/wrexzfrkodlfb3n4cp7w.png";
    if (pn.includes("pepsi")) return "https://res.cloudinary.com/dckwtknmq/image/upload/v1789872832/akjyapmemvunluyjl0vo.png";
    return "https://res.cloudinary.com/dckwtknmq/image/upload/v1790136235/wrexzfrkodlfb3n4cp7w.png";
  }
  if (fn.includes("uva")) return "/images/drinks/uva_postobon-removebg-preview.png";
  if (fn.includes("naranja")) return "/images/drinks/images__Gaseosa_naranja_-removebg-preview.png";
  if (fn.includes("manzana")) return "https://res.cloudinary.com/dckwtknmq/image/upload/v1788966650/qgto4wgmnjpfrns3zl8c.jpg";
  if (fn.includes("colombiana")) return "https://res.cloudinary.com/dckwtknmq/image/upload/v1789001495/qy8wy9igmgb0wppnjavw.png";
  return "";
};

const inputCls = "w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-[#F05454] focus:border-transparent transition-colors text-xs sm:text-sm";
const labelCls = "block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5";

export function ProductoModal({ isOpen, onClose, onSave, producto = null, categorias = [], isDuplicate = false }) {
  const notify = useNotifications();
  const isCloning = Boolean(isDuplicate || producto?.isDuplicate);
  const isEditing = Boolean(producto && !isCloning);
  const tieneVentasProtegido = Boolean(isEditing && (producto?.tieneVentas || Number(producto?.ventas || 0) > 0));

  // Requerimiento 1: Orden de Pasos Oficial:
  // Paso 1: Datos & Tipo -> Paso 2: Ficha Técnica (o Combo) -> Paso 3: Variantes -> Paso 4: Adiciones
  const [activeStep, setActiveStep] = useState(1);

  // Requerimiento 2: Diferenciar entre producto preparado vs producto base
  const [tipoElaboracion, setTipoElaboracion] = useState("preparado");

  // Requerimiento 5: Sincronización en vivo del precio sugerido de Ficha Técnica
  const [precioSugeridoLive, setPrecioSugeridoLive] = useState(0);

  // Requerimiento 7: Modal de Confirmación antes de guardar nueva versión
  const [showConfirmVersionModal, setShowConfirmVersionModal] = useState(false);

  // Requerimiento 9: Filtro de versionamiento superior
  const [selectedVersionFilter, setSelectedVersionFilter] = useState("actual");

  const [form, setForm] = useState({
    nombre: "",
    idCategoriaProducto: null,
    categoria: "",
    precio: "",
    descripcion: "",
    imagen: "",
    estado: "Activo",
    adiciones: []
  });

  const [variantes, setVariantes] = useState([]);
  const [todosInsumosCatalogo, setTodosInsumosCatalogo] = useState([]);
  const [expandedVariantKey, setExpandedVariantKey] = useState(null);
  const [newRuleTipo, setNewRuleTipo] = useState('AGREGAR');
  const [newRuleInsumoId, setNewRuleInsumoId] = useState('');
  const [newRuleReemplazadoId, setNewRuleReemplazadoId] = useState('');
  const [newRuleCantidad, setNewRuleCantidad] = useState('');
  const [newRuleUnidad, setNewRuleUnidad] = useState('');
  const [newRuleObservacion, setNewRuleObservacion] = useState('');
  const [searchInsumoVariante, setSearchInsumoVariante] = useState('');
  const [showInsumoDropdown, setShowInsumoDropdown] = useState(false);
  const [replacingDetail, setReplacingDetail] = useState(null);
  const [replaceInsumoId, setReplaceInsumoId] = useState('');
  const [replaceCantidad, setReplaceCantidad] = useState('');
  const [replaceUnidad, setReplaceUnidad] = useState('');
  const [replaceSearch, setReplaceSearch] = useState('');
  const insumoDropdownRef = useRef(null);
  const [showBaseDropdown, setShowBaseDropdown] = useState(false);
  const baseDropdownRef = useRef(null);
  const [todasAdiciones, setTodasAdiciones] = useState([]);
  const [todasBebidas, setTodasBebidas] = useState([]);
  const [todosProductosCatalogo, setTodosProductosCatalogo] = useState([]);
  const [configCombo, setConfigCombo] = useState({
    esCombo: false,
    cantidadBebidas: 1,
    bebidasPermitidas: [],
    productosAsociados: []
  });

  const [fichaTecnica, setFichaTecnica] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [modoVariantesManual, setModoVariantesManual] = useState(null);
  const [esBebidaPreparada, setEsBebidaPreparada] = useState(false);
  const fileInputRef = useRef(null);

  // Estados del Armador de Combo
  const [busquedaComboProd, setBusquedaComboProd] = useState("");
  const [filtroCatCombo, setFiltroCatCombo] = useState("todas");
  const [comboDropdownOpen, setComboDropdownOpen] = useState(false);
  const comboPickerRef = useRef(null);

  // Filtro de búsqueda rápida en Adiciones
  const [busquedaAdicion, setBusquedaAdicion] = useState("");

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (comboPickerRef.current && !comboPickerRef.current.contains(e.target)) {
        setComboDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validateField = (name, value) => {
    switch (name) {
      case "nombre": {
        const res = validateTexto(value, "El nombre del producto", 2, 100);
        return res.isValid ? null : res.error;
      }
      case "precio": {
        const res = validateNumeroPositivo(value, "El precio de venta", true);
        return res.isValid ? null : res.error;
      }
      case "descripcion": {
        if (value && value.length > 500) {
          return "La descripción no puede exceder los 500 caracteres.";
        }
        return null;
      }
      default:
        return null;
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, form[field]);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleChange = (field, val) => {
    const updated = { ...form, [field]: val };
    setForm(updated);
    if (field === "nombre") {
      const lower = String(val || "").toLowerCase();
      if (/batido|smoothie|malteada|jugo natural|frapp|limonada|shake|artesanal|preparad|coctel|cóctel|capuchino|café|cafe/i.test(lower)) {
        setEsBebidaPreparada(true);
      } else if (/gaseosa|agua\b|pepsi|coca|sprite|quatro|colombiana|postob|hit\b|cerveza/i.test(lower)) {
        setEsBebidaPreparada(false);
      }
    }
    setFichaTecnica((prev) =>
      prev?._isRestoredVersionCommit ? { ...prev, _isRestoredVersionCommit: false } : prev
    );
    if (touched[field] || submitted) {
      const err = validateField(field, val);
      setErrors((prev) => ({ ...prev, [field]: err }));
    }
  };

  const handleCancelOrClose = () => {
    setFileToUpload(null);
    setPreviewUrl("");
    setErrors({});
    setTouched({});
    setSubmitted(false);
    setActiveStep(1);
    setShowConfirmVersionModal(false);
    setSelectedVersionFilter("actual");
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        handleCancelOrClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    setActiveStep(1);
    setFileToUpload(null);
    setPreviewUrl(producto?.imagen || "");
    setModoVariantesManual(null);
    setBusquedaAdicion("");
    setShowConfirmVersionModal(false);
    setSelectedVersionFilter("actual");
    setPrecioSugeridoLive(0);

    // Cargar adiciones e insumos
    adicionesService.getAdiciones().then(setTodasAdiciones).catch(console.error);
    insumosService.getInsumos().then((data) => {
      setTodosInsumosCatalogo(Array.isArray(data) ? data : []);
    }).catch(console.error);

    // Cargar productos del catálogo para poder asociarlos a combos
    productosService.getProductos().then((prods) => {
      const all = prods || [];
      const currentId = producto?.id || producto?.idProducto;
      
      const regularProducts = all.filter(p => {
        const cat = String(p.categoria || p.categoriaNombre || "").toLowerCase();
        const nom = String(p.nombre || "").toLowerCase();
        const pId = p.id || p.idProducto;
        return !cat.includes("combo") && !nom.includes("combo") && (currentId ? pId !== currentId : true);
      });
      setTodosProductosCatalogo(regularProducts);

      const bebidas = all.filter((p) => {
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
    }).catch(console.error);

    if (producto) {
      const selectedCat = (categorias || []).find(c => c.nombre === producto.categoria || (c.id && c.id === producto.idCategoriaProducto) || (c.idCategoriaProducto && c.idCategoriaProducto === producto.idCategoriaProducto));
      setForm({
        nombre: producto.nombre || "",
        idCategoriaProducto: producto.idCategoriaProducto || producto.categoriaId || selectedCat?.id || selectedCat?.idCategoriaProducto || null,
        categoria: producto.categoria || (selectedCat?.nombre || (categorias[0]?.nombre || "")),
        precio: producto.precio !== undefined ? producto.precio : "",
        descripcion: producto.descripcion || "",
        imagen: producto.imagen || "",
        estado: producto.estado || "Activo",
        adiciones: producto.adiciones || []
      });
      setFichaTecnica(producto.fichaTecnica || null);

      const isSpecialName = /batido|smoothie|malteada|jugo natural|frapp|limonada|shake|artesanal|preparad|coctel|cóctel|capuchino|café|cafe/i.test(producto.nombre || "") ||
                            /batido|smoothie|malteada|preparad/i.test(producto.descripcion || "");
      const hasFicha = Boolean(producto.fichaTecnica && (producto.fichaTecnica.detalles?.length > 0 || producto.fichaTecnica.insumos?.length > 0));
      setEsBebidaPreparada(isSpecialName || hasFicha);

      // Requerimiento 2: Inicializar tipoElaboracion
      const catLower = String(producto.categoria || selectedCat?.nombre || "").toLowerCase();
      const isDrinkCategory = catLower.includes("bebida") || catLower.includes("gaseos") || catLower.includes("refresco");
      const isExplicitBase = producto.tipoElaboracion === "base" || (isDrinkCategory && !hasFicha && !isSpecialName);
      setTipoElaboracion(isExplicitBase ? "base" : "preparado");

      const pLower = String(producto.nombre || "").toLowerCase();
      const cLower = String(producto.categoria || selectedCat?.nombre || "").toLowerCase();
      const dLower = String(producto.descripcion || "").toLowerCase();
      const isAutoCombo =
        cLower.includes("combo") ||
        pLower.includes("combo") ||
        pLower.includes("+ bebida") ||
        pLower.includes("+bebida") ||
        pLower.includes("con bebida") ||
        pLower.includes("+ gaseosa") ||
        pLower.includes("+gaseosa") ||
        pLower.includes("con gaseosa") ||
        dLower.includes("+ gaseosa") ||
        dLower.includes("+ bebida");

      let defaultCant = 1;
      if (pLower.includes("familiar") || pLower.includes("4 personas")) defaultCant = 4;
      else if (pLower.includes("pareja") || pLower.includes("amigos") || pLower.includes("2 personas") || pLower.includes("duo")) defaultCant = 2;

      let parsedConfig = producto.configuracionCombo;
      if (typeof parsedConfig === "string") {
        try { parsedConfig = JSON.parse(parsedConfig); } catch (e) { parsedConfig = null; }
      }

      let itemsDeCombo = [];
      if (Array.isArray(producto.itemsCombo) && producto.itemsCombo.length > 0) {
        itemsDeCombo = producto.itemsCombo.map(it => ({
          idProducto: it.idProducto || it.producto?.idProducto || it.producto?.id,
          id: it.idProducto || it.producto?.idProducto || it.producto?.id,
          nombre: it.producto?.nombre || it.nombre || "Plato",
          precio: Number(it.producto?.precio || it.precio || 0),
          imagen: it.producto?.imagen || it.imagen || "",
          cantidad: Number(it.cantidad || 1)
        }));
      }

      const rawAsociados = (Array.isArray(parsedConfig?.productosAsociados) && parsedConfig.productosAsociados.length > 0)
        ? parsedConfig.productosAsociados
        : (Array.isArray(parsedConfig?.itemsCombo) && parsedConfig.itemsCombo.length > 0)
        ? parsedConfig.itemsCombo
        : itemsDeCombo;

      setConfigCombo({
        esCombo: parsedConfig?.esCombo !== undefined ? parsedConfig.esCombo : isAutoCombo,
        cantidadBebidas: parsedConfig?.cantidadBebidas !== undefined ? parsedConfig.cantidadBebidas : defaultCant,
        bebidasPermitidas: parsedConfig?.bebidasPermitidas || [],
        productosAsociados: rawAsociados
      });

      const rawVars = Array.isArray(producto.variantes) && producto.variantes.length > 0
        ? producto.variantes
        : [];
      
      const isProductCombo = Boolean(parsedConfig?.esCombo || isAutoCombo || (producto.categoria && producto.categoria.toLowerCase().includes("combo")));
      const filteredVars = (isProductCombo || (rawVars.length === 1 && isDummyOrBaseVariant(rawVars[0]?.nombre, producto.nombre)))
        ? []
        : rawVars.filter((v) => !isDummyOrBaseVariant(v.nombre, producto.nombre));
      
      const initialBaseRaw = producto.fichaTecnica?.detalles || producto.fichaTecnica?.insumos || [];
      const baseQtyMap = new Map(
        initialBaseRaw.map((b) => [Number(b.idInsumo || b.insumo?.idInsumo || b.id), Number(b.cantidad || 0)])
      );
      const baseMeta = producto.fichaTecnica || {};

      setVariantes(filteredVars.map((v, i) => {
        const sizeInfo = detectVariantSizeInfo(v.nombre);
        const existingVarFicha = v.fichaTecnica && Array.isArray(v.fichaTecnica.detalles) && v.fichaTecnica.detalles.length > 0
          ? v.fichaTecnica
          : null;
        const deltas = Array.isArray(v.insumosModificados) ? v.insumosModificados : [];

        let initDetalles = [];
        if (existingVarFicha) {
          initDetalles = existingVarFicha.detalles.map((d) => {
            const idIns = Number(d.idInsumo || d.insumo?.idInsumo || d.id);
            const isInBase = baseQtyMap.has(idIns);
            const baseQty = isInBase ? baseQtyMap.get(idIns) : null;
            const repDelta = deltas.find(
              (dl) =>
                String(dl.tipoAccion || "").toUpperCase() === "REEMPLAZAR" &&
                Number(dl.idInsumo) === idIns &&
                dl.idInsumoReemplazado
            );
            const repMatch = repDelta
              ? initialBaseRaw.find(
                  (b) => Number(b.idInsumo || b.insumo?.idInsumo || b.id) === Number(repDelta.idInsumoReemplazado)
                )
              : null;
            return {
              idInsumo: idIns,
              nombre: d.insumo?.nombre || d.nombreInsumo || d.nombre || `Insumo #${idIns}`,
              cantidad: Number(d.cantidad || 0),
              baseCantidad: baseQty,
              unidadMedida: normalizeUnidadMedida(d.unidadMedida || d.insumo?.unidadMedida || "und"),
              precioUnitario: Number(d.precioUnitario || d.insumo?.precioUnitario || 0),
              insumo: d.insumo || null,
              esBase: isInBase,
              esNuevo: !isInBase,
              reemplazaA: repDelta
                ? {
                    idInsumo: Number(repDelta.idInsumoReemplazado),
                    nombre:
                      repDelta.insumoReemplazado?.nombre ||
                      repMatch?.insumo?.nombre ||
                      repMatch?.nombreInsumo ||
                      repMatch?.nombre ||
                      `Insumo #${repDelta.idInsumoReemplazado}`
                  }
                : null,
              _manualEdit: true
            };
          });
        } else if (deltas.length > 0) {
          initDetalles = reconstructVariantDetallesFromDeltas(initialBaseRaw, deltas, []);
        } else {
          initDetalles = buildVariantDetallesFromBase(initialBaseRaw, 1, []);
        }

        // Inferir factor si coincide con escalado de base o proviene de un tamaño guardado
        let inferredFactor = 1;
        if (sizeInfo.isSize && sizeInfo.factor > 1 && initDetalles.length > 0 && initialBaseRaw.length > 0) {
          const sampleBase = initialBaseRaw.find((b) => Number(b.cantidad) > 0);
          const sampleDet = sampleBase && initDetalles.find((d) => Number(d.idInsumo) === Number(sampleBase.idInsumo || sampleBase.insumo?.idInsumo));
          if (sampleBase && sampleDet && Number(sampleDet.cantidad) > Number(sampleBase.cantidad)) {
            const ratio = Number((Number(sampleDet.cantidad) / Number(sampleBase.cantidad)).toFixed(2));
            if (ratio > 1) inferredFactor = ratio;
          }
        }

        const baseProdPrecio = Number(producto.precio || 0);
        const rawVarPrecio = v.precio !== undefined && v.precio !== null ? Number(v.precio) : 0;
        const customVarPrecio = rawVarPrecio > 0 && rawVarPrecio !== baseProdPrecio ? String(rawVarPrecio) : "";

        return {
          _key: v.idVariante ? `id-${v.idVariante}` : `var-${i}-${Date.now()}`,
          idVariante: v.idVariante || v.id || null,
          nombre: v.nombre || "",
          descripcion: v.descripcion || existingVarFicha?.descripcion || "",
          precio: customVarPrecio,
          imagen: v.imagen || "",
          tipo: sizeInfo.isSize ? "tamano" : "sabor",
          esTamano: sizeInfo.isSize,
          factorTamano: existingVarFicha || deltas.length > 0 ? inferredFactor : 1,
          hasCustomSizeFactor: Boolean(existingVarFicha || deltas.length > 0),
          fileToUpload: null,
          previewUrl: v.imagen || "",
          fichaTecnica: {
            idFichaTecnica: existingVarFicha?.idFichaTecnica || null,
            descripcion: existingVarFicha?.descripcion || v.descripcion || baseMeta?.descripcion || "",
            procedimiento: existingVarFicha?.procedimiento || baseMeta?.procedimiento || "",
            tiempoPreparacion: existingVarFicha?.tiempoPreparacion ?? baseMeta?.tiempoPreparacion ?? 0,
            rendimiento: existingVarFicha?.rendimiento || baseMeta?.rendimiento || "1 porción",
            condicionesAlmacenamiento: existingVarFicha?.condicionesAlmacenamiento || baseMeta?.condicionesAlmacenamiento || "",
            vidaUtil: existingVarFicha?.vidaUtil || baseMeta?.vidaUtil || "",
            observaciones: existingVarFicha?.observaciones || "",
            detalles: initDetalles
          },
          insumosModificados: deltas
        };
      }));
    } else {
      const firstCat = categorias[0]?.nombre || "";
      const isFirstCombo = firstCat.toLowerCase().includes("combo");
      setForm({
        nombre: "",
        idCategoriaProducto: categorias[0]?.id || categorias[0]?.idCategoriaProducto || null,
        categoria: firstCat,
        precio: "",
        descripcion: "",
        imagen: "",
        estado: "Activo",
        adiciones: []
      });
      setFichaTecnica(null);
      setEsBebidaPreparada(false);
      setTipoElaboracion(firstCat.toLowerCase().includes("bebida") ? "base" : "preparado");
      setConfigCombo({
        esCombo: isFirstCombo,
        cantidadBebidas: 1,
        bebidasPermitidas: [],
        productosAsociados: []
      });
      setVariantes([]);
    }
  }, [producto, isOpen, categorias]);

  const autoIsDrink = useMemo(() => {
    const catName = String(form.categoria || "").toLowerCase();
    const catId = Number(form.idCategoriaProducto || 0);
    const prodName = String(form.nombre || "").toLowerCase();
    const desc = String(form.descripcion || "").toLowerCase();
    return (
      catId === 4 ||
      catName.includes("bebida") ||
      catName.includes("gaseos") ||
      catName.includes("refresco") ||
      catName.includes("jugo") ||
      catName.includes("cerveza") ||
      prodName.includes("gaseosa") ||
      prodName.includes("bebida") ||
      prodName.includes("coca-cola") ||
      prodName.includes("pepsi") ||
      prodName.includes("postobón") ||
      prodName.includes("postobon") ||
      prodName.includes("colombiana") ||
      prodName.includes("agua") ||
      desc.includes("refrescante") ||
      variantes.some((v) => isSizeVariantName(v.nombre))
    );
  }, [form.categoria, form.idCategoriaProducto, form.nombre, form.descripcion, variantes]);

  const isDrink = configCombo.esCombo
    ? false
    : (modoVariantesManual !== null ? modoVariantesManual === "bebida" : autoIsDrink);

  const isCommercialDrink = isDrink && !esBebidaPreparada;

  // Requerimiento 3: Si se elige producto base, las adiciones deben limpiarse
  useEffect(() => {
    if (tipoElaboracion === "base" && form.adiciones?.length > 0) {
      setForm(prev => ({ ...prev, adiciones: [] }));
    }
  }, [tipoElaboracion]);

  // Si cambia a Bebida Comercial o Combo, asegurar que activeStep no quede en un paso oculto
  useEffect(() => {
    if (isCommercialDrink) {
      if (activeStep === 2) setActiveStep(1);
      if (activeStep === 4) setActiveStep(3);
    } else if (configCombo.esCombo && activeStep > 2) {
      setActiveStep(2);
    }
  }, [isCommercialDrink, configCombo.esCombo, activeStep]);

  // Requerimiento 9: Lista de versiones anteriores para el filtro superior
  const listaVersionesAnteriores = useMemo(() => {
    const raw = fichaTecnica?.versionesAnteriores || producto?.fichaTecnica?.versionesAnteriores || [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  }, [fichaTecnica?.versionesAnteriores, producto?.fichaTecnica?.versionesAnteriores]);

  const versionActualNum = Number(fichaTecnica?.versionActual || producto?.fichaTecnica?.versionActual || 1);

  const selectedHistoricalVersionObj = useMemo(() => {
    if (selectedVersionFilter === "actual") return null;
    return listaVersionesAnteriores.find(
      (v, idx) => String(v.version || idx + 1) === String(selectedVersionFilter)
    ) || null;
  }, [selectedVersionFilter, listaVersionesAnteriores]);

  const handleRestoreHistoricalVersion = () => {
    if (!selectedHistoricalVersionObj) return;
    if (selectedHistoricalVersionObj.datosEntidad) {
      handleRestoreEntityData(selectedHistoricalVersionObj.datosEntidad);
    }
    const detallesSnap = selectedHistoricalVersionObj.detalles || selectedHistoricalVersionObj.insumos || [];
    setFichaTecnica(prev => ({
      ...prev,
      rendimiento: selectedHistoricalVersionObj.rendimiento || prev?.rendimiento || 1,
      detalles: detallesSnap,
      insumos: detallesSnap,
      procedimiento: selectedHistoricalVersionObj.procedimiento || "",
      tiempoPreparacion: selectedHistoricalVersionObj.tiempoPreparacion || "",
      especificaciones: selectedHistoricalVersionObj.especificaciones || "",
      caracteristicas: selectedHistoricalVersionObj.caracteristicas || "",
      informacionNutricional: selectedHistoricalVersionObj.informacionNutricional || "",
      condicionesAlmacenamiento: selectedHistoricalVersionObj.condicionesAlmacenamiento || "",
      vidaUtil: selectedHistoricalVersionObj.vidaUtil || "",
      observaciones: selectedHistoricalVersionObj.observaciones || "",
      _isRestoredVersionCommit: true
    }));
    setSelectedVersionFilter("actual");
    notify.success(
      "Versión Restaurada",
      `Se cargaron en el borrador los datos de la versión histórica ${Number(selectedHistoricalVersionObj.version || 1).toFixed(1)}.`
    );
  };

  // Cálculo de Precio de Referencia gastronómico
  const totalsFicha = useMemo(() => {
    const list = fichaTecnica?.detalles || fichaTecnica?.insumos || [];
    return calculateRecipeTotals(list, fichaTecnica?.rendimiento || 1);
  }, [fichaTecnica]);

  const costoTotalInsumos = totalsFicha.costoPorPorcion;
  // Requerimiento 5: Priorizar precio sugerido en vivo si fue notificado por FichaTecnicaProducto
  const precioReferenciaSugerido = precioSugeridoLive > 0 ? precioSugeridoLive : totalsFicha.precioSugerido;

  const sizeVariantes = useMemo(() => {
    return variantes.filter((v) => {
      if (v.tipo === "tamano") return true;
      if (v.tipo === "sabor") return false;
      return isDrink && isSizeVariantName(v.nombre);
    });
  }, [variantes, isDrink]);

  const flavorVariantes = useMemo(() => {
    return variantes.filter((v) => {
      if (v.tipo === "sabor") return true;
      if (v.tipo === "tamano") return false;
      return isDrink && !isSizeVariantName(v.nombre);
    });
  }, [variantes, isDrink]);

  const toggleAdicion = (adicion) => {
    // Requerimiento 3: Producto base no admite adiciones
    if (tipoElaboracion === "base") {
      notify.info("Producto Base", "Los productos base (gaseosas, salsas comerciales) no admiten adiciones.");
      return;
    }
    const adId = adicion.idAdicion || adicion.id;
    const isSelected = form.adiciones.some((a) => (a.idAdicion || a.id || a) === adId);
    let nuevasAdiciones;
    if (isSelected) {
      nuevasAdiciones = form.adiciones.filter((a) => (a.idAdicion || a.id || a) !== adId);
    } else {
      nuevasAdiciones = [
        ...form.adiciones,
        {
          idAdicion: adId,
          nombre: adicion.nombre,
          precio: Number(adicion.precio || 0),
          imagen: adicion.imagen || ''
        }
      ];
    }
    setForm({ ...form, adiciones: nuevasAdiciones });
  };

  const adicionesFiltradas = useMemo(() => {
    if (!busquedaAdicion.trim()) return todasAdiciones;
    const q = busquedaAdicion.toLowerCase().trim();
    return todasAdiciones.filter(a => (a.nombre || "").toLowerCase().includes(q));
  }, [todasAdiciones, busquedaAdicion]);

  const categoriasProductosCatalogo = useMemo(() => {
    const cats = new Set();
    (todosProductosCatalogo || []).forEach(p => {
      const c = p.categoria || p.categoriaNombre;
      if (c) cats.add(c);
    });
    return ["todas", ...Array.from(cats)];
  }, [todosProductosCatalogo]);

  const productosComboFiltrados = useMemo(() => {
    let list = todosProductosCatalogo || [];
    const hasSearch = Boolean(busquedaComboProd && busquedaComboProd.trim());

    if (!hasSearch && filtroCatCombo && filtroCatCombo !== "todas") {
      list = list.filter(p => (p.categoria || p.categoriaNombre) === filtroCatCombo);
    }
    if (hasSearch) {
      list = list.filter(p => 
        matchesSmartSearch(
          [
            p.nombre,
            p.codigo,
            p.categoria,
            p.categoriaNombre,
            p.id,
            p.idProducto,
            `#${p.id || p.idProducto}`,
            p.precio,
            String(p.precio ?? "")
          ],
          busquedaComboProd
        )
      );
    }
    return list;
  }, [todosProductosCatalogo, filtroCatCombo, busquedaComboProd]);

  const subtotalProductosCombo = useMemo(() => {
    const items = Array.isArray(configCombo.productosAsociados) ? configCombo.productosAsociados : [];
    return items.reduce((acc, it) => acc + (Number(it.precio || 0) * Number(it.cantidad || 1)), 0);
  }, [configCombo.productosAsociados]);

  const totalUnidadesCombo = useMemo(() => {
    const items = Array.isArray(configCombo.productosAsociados) ? configCombo.productosAsociados : [];
    return items.reduce((acc, it) => acc + Number(it.cantidad || 1), 0);
  }, [configCombo.productosAsociados]);

  const agregarProductoACombo = (prod) => {
    if (!prod) return;
    const prodId = prod.id || prod.idProducto;
    const actuales = Array.isArray(configCombo.productosAsociados) ? configCombo.productosAsociados : [];
    const yaExiste = actuales.find(a => String(a.idProducto || a.id) === String(prodId));

    if (yaExiste) {
      setConfigCombo(prev => ({
        ...prev,
        productosAsociados: actuales.map(a => 
          String(a.idProducto || a.id) === String(prodId) 
            ? { ...a, cantidad: (a.cantidad || 1) + 1 } 
            : a
        )
      }));
    } else {
      setConfigCombo(prev => ({
        ...prev,
        productosAsociados: [
          ...actuales,
          {
            idProducto: prodId,
            nombre: prod.nombre,
            precio: Number(prod.precio || 0),
            cantidad: 1,
            imagen: prod.imagen || ""
          }
        ]
      }));
    }
  };

  const createInitializedVariant = (suggestedName = "", explicitTipo = "general", suggestedImg = "") => {
    const key = `${explicitTipo}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const sizeInfo = detectVariantSizeInfo(suggestedName, explicitTipo);
    const factor = sizeInfo.factor > 1 ? sizeInfo.factor : 1;
    const baseMeta = fichaTecnica || producto?.fichaTecnica || {};
    const initDetalles = buildVariantDetallesFromBase(baseIngredients, factor, todosInsumosCatalogo);
    const defaultRend = factor > 1
      ? `${factor} porciones (${suggestedName || "Tamaño"})`
      : (baseMeta?.rendimiento || "1 porción");

    return {
      _key: key,
      idVariante: null,
      nombre: suggestedName || "",
      descripcion: "",
      precio: "",
      imagen: suggestedImg || "",
      tipo: explicitTipo === "tamano" || sizeInfo.isSize ? "tamano" : explicitTipo,
      esTamano: sizeInfo.isSize,
      factorTamano: factor,
      hasCustomSizeFactor: false,
      fileToUpload: null,
      previewUrl: suggestedImg || "",
      fichaTecnica: {
        idFichaTecnica: null,
        descripcion: "",
        procedimiento: baseMeta?.procedimiento || "",
        tiempoPreparacion: baseMeta?.tiempoPreparacion ?? 0,
        rendimiento: defaultRend,
        condicionesAlmacenamiento: baseMeta?.condicionesAlmacenamiento || "",
        vidaUtil: baseMeta?.vidaUtil || "",
        observaciones: "",
        detalles: initDetalles
      },
      insumosModificados: computeInsumosModificadosDeltas(initDetalles, baseIngredients)
    };
  };

  const handleAddTamano = (suggestedName = "", suggestedImg = "") => {
    let defaultImg = suggestedImg;
    if (!defaultImg && suggestedName) {
      defaultImg = getDefaultDrinkImageForSize(suggestedName, form.nombre);
    }
    const newVar = createInitializedVariant(suggestedName, "tamano", defaultImg);
    setVariantes((prev) => [...prev, newVar]);
    setExpandedVariantKey(newVar._key);
  };

  const handleAddSabor = (suggestedName = "", suggestedImg = "") => {
    let defaultImg = suggestedImg;
    if (!defaultImg && suggestedName) {
      defaultImg = getDefaultDrinkImageForFlavor(suggestedName, form.nombre);
    }
    const newVar = createInitializedVariant(suggestedName, "sabor", defaultImg);
    setVariantes((prev) => [...prev, newVar]);
    setExpandedVariantKey(newVar._key);
  };

  const handleAddVariante = (suggestedName = "") => {
    const newVar = createInitializedVariant(suggestedName, "general", "");
    setVariantes((prev) => [...prev, newVar]);
    setExpandedVariantKey(newVar._key);
  };

  const handleUpdateVarianteByKey = (key, field, value) => {
    setVariantes((prev) =>
      prev.map((v) => {
        if (v._key !== key) return v;
        if (field !== "nombre") {
          return { ...v, [field]: value };
        }

        const nextSize = detectVariantSizeInfo(value, v.tipo === "sabor" ? "sabor" : "");
        const prevFactor = Number(v.factorTamano || 1);
        const currentDetalles = Array.isArray(v.fichaTecnica?.detalles) && v.fichaTecnica.detalles.length > 0
          ? v.fichaTecnica.detalles
          : buildVariantDetallesFromBase(baseIngredients, 1, todosInsumosCatalogo);

        if (!v.hasCustomSizeFactor && (nextSize.factor !== prevFactor || nextSize.isSize !== Boolean(v.esTamano))) {
          const nextFactor = nextSize.factor;
          const rescaledDetalles = currentDetalles.map((det) => {
            if (!det.esBase || det._manualEdit || det.baseCantidad === null || det.baseCantidad === undefined) {
              return det;
            }
            return {
              ...det,
              cantidad: scaleQuantityByFactor(det.baseCantidad, nextFactor)
            };
          });
          return {
            ...v,
            nombre: value,
            esTamano: nextSize.isSize,
            factorTamano: nextFactor,
            tipo: nextSize.isSize ? "tamano" : (v.tipo === "tamano" ? "general" : v.tipo),
            fichaTecnica: {
              ...(v.fichaTecnica || {}),
              detalles: rescaledDetalles
            }
          };
        }

        return { ...v, nombre: value };
      })
    );
  };

  const handleRemoveVarianteByKey = (key) => {
    setVariantes((prev) => prev.filter((v) => v._key !== key));
  };

  const handleVariantImageSelectedByKey = (key, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      notify.warning("Formato Inválido", "El archivo seleccionado debe ser una imagen (JPG, PNG, WEBP).");
      return;
    }

    const maxSizeInBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      notify.warning("Tamaño Excedido", "La imagen de la variante no debe superar los 5 MB.");
      return;
    }

    const localBlobUrl = URL.createObjectURL(file);
    setVariantes((prev) =>
      prev.map((v) =>
        v._key === key
          ? { ...v, fileToUpload: file, previewUrl: localBlobUrl }
          : v
      )
    );

    e.target.value = "";
  };

  const handleRemoveVariantImageByKey = (key) => {
    setVariantes((prev) =>
      prev.map((v) =>
        v._key === key
          ? { ...v, imagen: "", fileToUpload: null, previewUrl: "" }
          : v
      )
    );
  };

  const baseIngredients = useMemo(() => {
    const list = fichaTecnica?.detalles || fichaTecnica?.insumos || producto?.fichaTecnica?.detalles || producto?.fichaTecnica?.insumos || [];
    return list.map((det) => {
      const idIns = Number(det.idInsumo || det.insumo?.idInsumo || det.id);
      const cat = todosInsumosCatalogo.find((c) => Number(c.idInsumo || c.id) === idIns);
      return {
        idInsumo: idIns,
        nombre: det.insumo?.nombre || det.nombreInsumo || det.nombre || cat?.nombre || `Insumo #${idIns}`,
        cantidad: Number(det.cantidad || 0),
        unidadMedida: normalizeUnidadMedida(det.unidadMedida || det.insumo?.unidadMedida || cat?.unidadMedida || "und"),
        precioUnitario: Number(det.precioUnitario || det.insumo?.precioUnitario || cat?.precioUnitario || 0),
        insumo: det.insumo || cat || null
      };
    });
  }, [fichaTecnica, producto, todosInsumosCatalogo]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (insumoDropdownRef.current && !insumoDropdownRef.current.contains(event.target)) {
        setShowInsumoDropdown(false);
      }
      if (baseDropdownRef.current && !baseDropdownRef.current.contains(event.target)) {
        setShowBaseDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filterInsumosCatalog = useCallback(
    (query) => {
      if (!query || !query.trim()) {
        return todosInsumosCatalogo.slice(0, 15);
      }
      return todosInsumosCatalogo
        .filter((i) =>
          matchesSmartSearch(
            [
              i.nombre,
              i.categoria,
              i.categoriaNombre,
              i.unidadMedida,
              String(i.idInsumo || i.id),
              `#${i.idInsumo || i.id}`
            ],
            query
          )
        )
        .slice(0, 25);
    },
    [todosInsumosCatalogo]
  );

  const filteredInsumosCatalogo = useMemo(
    () => filterInsumosCatalog(searchInsumoVariante),
    [filterInsumosCatalog, searchInsumoVariante]
  );

  const filteredReplaceInsumosCatalogo = useMemo(
    () => filterInsumosCatalog(replaceSearch),
    [filterInsumosCatalog, replaceSearch]
  );

  const resolveDefaultInsumoPortion = (ins) => {
    const resolved = resolveRecetaUnidadYCantidad(ins);
    return {
      cantidad:
        Number(ins?.porcionMinimaCantidad) > 0
          ? Number(ins.porcionMinimaCantidad)
          : resolved.cantidad || 1,
      unidadMedida: normalizeUnidadMedida(
        ins?.porcionMinimaUnidad || resolved.unidadMedida || ins?.unidadMedida || "und"
      )
    };
  };

  const resetReplaceForm = () => {
    setReplacingDetail(null);
    setReplaceInsumoId("");
    setReplaceCantidad("");
    setReplaceUnidad("");
    setReplaceSearch("");
  };

  // Si se agregaron insumos base en el Paso 2 después de crear variantes vacías, cargarlos automáticamente
  useEffect(() => {
    if (!baseIngredients || baseIngredients.length === 0) return;
    setVariantes((prev) => {
      let changed = false;
      const next = prev.map((v) => {
        const curDetalles = v.fichaTecnica?.detalles || [];
        if (v._userCleared || curDetalles.length > 0) return v;
        changed = true;
        const factor = Number(v.factorTamano || 1);
        const initDetalles = buildVariantDetallesFromBase(baseIngredients, factor, todosInsumosCatalogo);
        return {
          ...v,
          fichaTecnica: {
            ...(v.fichaTecnica || {}),
            detalles: initDetalles
          },
          insumosModificados: computeInsumosModificadosDeltas(initDetalles, baseIngredients)
        };
      });
      return changed ? next : prev;
    });
  }, [baseIngredients, todosInsumosCatalogo]);

  const handleUpdateVariantFichaMeta = (variantKey, field, value) => {
    setVariantes((prev) =>
      prev.map((v) =>
        v._key === variantKey
          ? {
              ...v,
              fichaTecnica: {
                ...(v.fichaTecnica || {}),
                [field]: value
              }
            }
          : v
      )
    );
  };

  const handleApplyVariantScaleFactor = (variantKey, rawFactor) => {
    const nextFactor = Math.max(0.25, Math.min(20, Number(rawFactor) || 1));
    setVariantes((prev) =>
      prev.map((v) => {
        if (v._key !== variantKey) return v;
        const currentDetalles = Array.isArray(v.fichaTecnica?.detalles) && v.fichaTecnica.detalles.length > 0
          ? v.fichaTecnica.detalles
          : buildVariantDetallesFromBase(baseIngredients, 1, todosInsumosCatalogo);
        const baseMap = new Map(baseIngredients.map((b) => [Number(b.idInsumo), b]));
        const scaledDetalles = currentDetalles.map((det) => {
          const baseItem = baseMap.get(Number(det.idInsumo));
          const originQty = det.baseCantidad ?? baseItem?.cantidad;
          if (originQty === null || originQty === undefined || Number(originQty) <= 0) {
            return det;
          }
          return {
            ...det,
            baseCantidad: Number(originQty),
            cantidad: scaleQuantityByFactor(Number(originQty), nextFactor),
            _manualEdit: false
          };
        });
        return {
          ...v,
          esTamano: nextFactor > 1 || v.tipo === "tamano",
          factorTamano: nextFactor,
          hasCustomSizeFactor: true,
          tipo: nextFactor > 1 ? "tamano" : (v.tipo === "tamano" ? "general" : v.tipo),
          fichaTecnica: {
            ...(v.fichaTecnica || {}),
            rendimiento: nextFactor > 1
              ? `${nextFactor} porciones (${v.nombre || "Tamaño"})`
              : (fichaTecnica?.rendimiento || "1 porción"),
            detalles: scaledDetalles
          },
          insumosModificados: computeInsumosModificadosDeltas(scaledDetalles, baseIngredients)
        };
      })
    );
  };

  const handleToggleVariantIsSize = (variantKey) => {
    setVariantes((prev) =>
      prev.map((v) => {
        if (v._key !== variantKey) return v;
        const nextIsSize = !v.esTamano;
        const detected = detectVariantSizeInfo(v.nombre, nextIsSize ? "tamano" : "");
        const nextFactor = nextIsSize ? (Number(v.factorTamano) > 1 ? Number(v.factorTamano) : (detected.factor > 1 ? detected.factor : 1.5)) : 1;
        const currentDetalles = Array.isArray(v.fichaTecnica?.detalles) && v.fichaTecnica.detalles.length > 0
          ? v.fichaTecnica.detalles
          : buildVariantDetallesFromBase(baseIngredients, 1, todosInsumosCatalogo);
        const baseMap = new Map(baseIngredients.map((b) => [Number(b.idInsumo), b]));
        const rescaledDetalles = currentDetalles.map((det) => {
          const originQty = det.baseCantidad ?? baseMap.get(Number(det.idInsumo))?.cantidad;
          if (originQty === null || originQty === undefined || Number(originQty) <= 0) return det;
          return {
            ...det,
            baseCantidad: Number(originQty),
            cantidad: scaleQuantityByFactor(Number(originQty), nextFactor),
            _manualEdit: false
          };
        });
        return {
          ...v,
          esTamano: nextIsSize,
          factorTamano: nextFactor,
          hasCustomSizeFactor: true,
          tipo: nextIsSize ? "tamano" : "general",
          fichaTecnica: {
            ...(v.fichaTecnica || {}),
            rendimiento: nextIsSize
              ? `${nextFactor} porciones (${v.nombre || "Tamaño"})`
              : (fichaTecnica?.rendimiento || "1 porción"),
            detalles: rescaledDetalles
          },
          insumosModificados: computeInsumosModificadosDeltas(rescaledDetalles, baseIngredients)
        };
      })
    );
  };

  const handleSyncVariantFromBase = (variantKey) => {
    if (baseIngredients.length === 0) {
      notify.warning("Receta Base Vacía", "Primero agrega insumos en el Paso 2 (Ficha Técnica) del producto original.");
      return;
    }
    setVariantes((prev) =>
      prev.map((v) => {
        if (v._key !== variantKey) return v;
        const factor = Number(v.factorTamano || 1);
        const existingExtras = (v.fichaTecnica?.detalles || []).filter((d) => !d.esBase);
        const freshBase = buildVariantDetallesFromBase(baseIngredients, factor, todosInsumosCatalogo);
        const baseIds = new Set(freshBase.map((b) => Number(b.idInsumo)));
        const merged = [
          ...freshBase,
          ...existingExtras.filter((e) => !baseIds.has(Number(e.idInsumo)))
        ];
        return {
          ...v,
          _userCleared: false,
          fichaTecnica: {
            ...(v.fichaTecnica || {}),
            detalles: merged
          },
          insumosModificados: computeInsumosModificadosDeltas(merged, baseIngredients)
        };
      })
    );
    notify.success("Insumos Sincronizados", "Se cargaron los insumos base del producto original.");
  };

  const handleUpdateVariantDetail = (variantKey, detailIdx, updates) => {
    setVariantes((prev) =>
      prev.map((v) => {
        if (v._key !== variantKey) return v;
        const cur = Array.isArray(v.fichaTecnica?.detalles) ? [...v.fichaTecnica.detalles] : [];
        if (!cur[detailIdx]) return v;
        cur[detailIdx] = {
          ...cur[detailIdx],
          ...updates,
          _manualEdit: true
        };
        return {
          ...v,
          fichaTecnica: {
            ...(v.fichaTecnica || {}),
            detalles: cur
          },
          insumosModificados: computeInsumosModificadosDeltas(cur, baseIngredients)
        };
      })
    );
  };

  const buildVariantInsumoEntry = (insObj, fallbackId, qty, unit, overrides = {}) => ({
    idInsumo: Number(insObj?.idInsumo || insObj?.id || fallbackId),
    nombre: insObj?.nombre || `Insumo #${fallbackId}`,
    cantidad: Number(qty),
    baseCantidad: overrides.baseCantidad ?? null,
    unidadMedida: normalizeUnidadMedida(unit || insObj?.unidadMedida || "und"),
    precioUnitario: Number(insObj?.precioUnitario || 0),
    insumo: insObj
      ? {
          idInsumo: insObj.idInsumo || insObj.id,
          nombre: insObj.nombre,
          unidadMedida: insObj.unidadMedida,
          precioUnitario: Number(insObj.precioUnitario || 0),
          stock: insObj.stock,
          fechaVencimiento: insObj.fechaVencimiento
        }
      : null,
    esBase: Boolean(overrides.esBase),
    esNuevo: overrides.esNuevo !== undefined ? overrides.esNuevo : !overrides.esBase,
    reemplazaA: overrides.reemplazaA || null,
    _manualEdit: true
  });

  const handleRemoveVariantDetail = (variantKey, detailIdx) => {
    if (replacingDetail?.variantKey === variantKey) {
      resetReplaceForm();
    }
    setVariantes((prev) =>
      prev.map((v) => {
        if (v._key !== variantKey) return v;
        const cur = (v.fichaTecnica?.detalles || []).filter((_, idx) => idx !== detailIdx);
        return {
          ...v,
          _userCleared: cur.length === 0,
          fichaTecnica: {
            ...(v.fichaTecnica || {}),
            detalles: cur
          },
          insumosModificados: computeInsumosModificadosDeltas(cur, baseIngredients)
        };
      })
    );
  };

  const handleReplaceVariantDetail = (variantKey, detailIdx) => {
    if (!replaceInsumoId) {
      notify.warning("Insumo Requerido", "Busca y selecciona el insumo de reemplazo.");
      return;
    }
    if (!replaceCantidad || Number(replaceCantidad) <= 0) {
      notify.warning("Cantidad Inválida", "Por favor ingresa una cantidad mayor a cero para el reemplazo.");
      return;
    }

    const selectedInsumo = todosInsumosCatalogo.find(
      (i) => Number(i.idInsumo || i.id) === Number(replaceInsumoId)
    );
    if (selectedInsumo) {
      const { vencido } = checkInsumoInvalido(selectedInsumo);
      if (vencido) {
        notify.error(
          "Insumo Vencido",
          `No se puede usar "${selectedInsumo.nombre}" porque se encuentra VENCIDO (${selectedInsumo.fechaVencimiento ? String(selectedInsumo.fechaVencimiento).substring(0, 10) : "Caducado"}).`
        );
        return;
      }
    }

    const targetVar = variantes.find((v) => v._key === variantKey);
    const curList = Array.isArray(targetVar?.fichaTecnica?.detalles) ? targetVar.fichaTecnica.detalles : [];
    const oldItem = curList[detailIdx];
    if (!oldItem) return;

    const duplicateIdx = curList.findIndex(
      (d, idx) => idx !== detailIdx && Number(d.idInsumo) === Number(replaceInsumoId)
    );
    if (duplicateIdx >= 0) {
      notify.warning(
        "Insumo ya incluido",
        `"${selectedInsumo?.nombre || `Insumo #${replaceInsumoId}`}" ya está en la receta de esta variante. Edita su cantidad directamente o quita el insumo anterior.`
      );
      return;
    }

    const newIdNum = Number(replaceInsumoId);
    const oldIdNum = Number(oldItem.idInsumo);
    const resolvedUnit = normalizeUnidadMedida(replaceUnidad || selectedInsumo?.unidadMedida || "und");
    const newQty = Number(replaceCantidad);

    const oldInBase = baseIngredients.find((b) => Number(b.idInsumo || b.id) === oldIdNum);
    const trackedReemplazaA = oldItem.reemplazaA?.idInsumo
      ? oldItem.reemplazaA
      : oldInBase
        ? { idInsumo: oldIdNum, nombre: oldItem.nombre || oldInBase.nombre || `Insumo #${oldIdNum}` }
        : null;

    const newInBase = baseIngredients.find((b) => Number(b.idInsumo || b.id) === newIdNum);
    const finalReemplazaA = newInBase || Number(trackedReemplazaA?.idInsumo) === newIdNum ? null : trackedReemplazaA;

    const replacementEntry = buildVariantInsumoEntry(selectedInsumo, newIdNum, newQty, resolvedUnit, {
      esBase: Boolean(newInBase),
      esNuevo: !newInBase,
      baseCantidad: newInBase ? Number(newInBase.cantidad || 0) : null,
      reemplazaA: finalReemplazaA
    });

    setVariantes((prev) =>
      prev.map((v) => {
        if (v._key !== variantKey) return v;
        const nextDetalles = [...(v.fichaTecnica?.detalles || [])];
        nextDetalles[detailIdx] = replacementEntry;
        return {
          ...v,
          _userCleared: false,
          fichaTecnica: {
            ...(v.fichaTecnica || {}),
            detalles: nextDetalles
          },
          insumosModificados: computeInsumosModificadosDeltas(nextDetalles, baseIngredients)
        };
      })
    );

    resetReplaceForm();
    notify.success(
      "Insumo Reemplazado",
      `Se sustituyó "${oldItem.nombre || `Insumo #${oldIdNum}`}" por "${replacementEntry.nombre}".`
    );
  };

  const handleAddInsumoToVariant = (variantKey) => {
    if (!newRuleInsumoId) {
      notify.warning("Insumo Requerido", "Por favor busca y selecciona el insumo que deseas añadir a esta variante.");
      return;
    }
    if (!newRuleCantidad || Number(newRuleCantidad) <= 0) {
      notify.warning("Cantidad Inválida", "Por favor ingresa una cantidad mayor a cero.");
      return;
    }

    const selectedInsumo = todosInsumosCatalogo.find((i) => Number(i.idInsumo || i.id) === Number(newRuleInsumoId));
    if (selectedInsumo) {
      const { vencido } = checkInsumoInvalido(selectedInsumo);
      if (vencido) {
        notify.error(
          "Insumo Vencido",
          `No se puede registrar este insumo: "${selectedInsumo.nombre}" se encuentra VENCIDO (${selectedInsumo.fechaVencimiento ? String(selectedInsumo.fechaVencimiento).substring(0, 10) : "Caducado"}). Por normas de inocuidad alimentaria, no se permite su uso.`
        );
        return;
      }
    }

    const resolvedUnit = normalizeUnidadMedida(newRuleUnidad || selectedInsumo?.unidadMedida || "und");
    const addQty = Number(newRuleCantidad);

    setVariantes((prev) =>
      prev.map((v) => {
        if (v._key !== variantKey) return v;
        const cur = Array.isArray(v.fichaTecnica?.detalles) ? [...v.fichaTecnica.detalles] : [];
        const existingIdx = cur.findIndex((d) => Number(d.idInsumo) === Number(newRuleInsumoId));

        if (existingIdx >= 0) {
          const existing = cur[existingIdx];
          const existingUnit = normalizeUnidadMedida(existing.unidadMedida || resolvedUnit);
          const convertedAdd = existingUnit === resolvedUnit
            ? addQty
            : convertirUnidadYCantidad(addQty, resolvedUnit, existingUnit);
          cur[existingIdx] = {
            ...existing,
            cantidad: Number((Number(existing.cantidad || 0) + Number(convertedAdd || 0)).toFixed(2)),
            _manualEdit: true
          };
        } else {
          cur.push(buildVariantInsumoEntry(selectedInsumo, newRuleInsumoId, addQty, resolvedUnit));
        }

        return {
          ...v,
          _userCleared: false,
          fichaTecnica: {
            ...(v.fichaTecnica || {}),
            detalles: cur
          },
          insumosModificados: computeInsumosModificadosDeltas(cur, baseIngredients)
        };
      })
    );

    setNewRuleInsumoId("");
    setNewRuleReemplazadoId("");
    setNewRuleCantidad("");
    setNewRuleUnidad("");
    setNewRuleObservacion("");
    setSearchInsumoVariante("");
    setShowInsumoDropdown(false);
    setShowBaseDropdown(false);
    notify.success("Insumo Añadido", "El insumo se agregó correctamente a la ficha técnica de la variante.");
  };

  const handleMainPriceChange = (newPrice) => {
    setForm((f) => ({ ...f, precio: newPrice }));
    setFichaTecnica((prev) =>
      prev?._isRestoredVersionCommit ? { ...prev, _isRestoredVersionCommit: false } : prev
    );
    if (touched.precio || submitted) {
      const err = validateField("precio", newPrice);
      setErrors((prev) => ({ ...prev, precio: err }));
    }
  };

  // Fila de variante visualmente optimizada con su propia Ficha Técnica editable
  const renderVariantRow = (v, idx, type) => {
    const isTamano = type === "tamano" || Boolean(v.esTamano) || Number(v.factorTamano || 1) > 1;
    const isSabor = !isTamano && type === "sabor";
    const placeholderText = isTamano
      ? "Ej. Botella 1.5 Litros / Familiar / Grande"
      : isSabor
      ? "Ej. Pepsi Light / Black 400ml"
      : "Ej. Sabor BBQ / Picante / Clásica / Familiar / Grande";

    const badgeCls = isTamano
      ? "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200"
      : isSabor
      ? "bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200"
      : "bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200";

    const borderFocusCls = isTamano
      ? "focus:ring-amber-500 hover:border-amber-300"
      : isSabor
      ? "focus:ring-purple-500 hover:border-purple-300"
      : "focus:ring-[#F05454] hover:border-orange-300";

    const isExpanded = expandedVariantKey === v._key;
    const varNombreDisplay = v.nombre?.trim() || `Variante #${idx + 1}`;
    const varDetalles = Array.isArray(v.fichaTecnica?.detalles) ? v.fichaTecnica.detalles : [];
    const detCount = varDetalles.length;
    const factorActual = Number(v.factorTamano || 1);
    const varCostTotals = detCount > 0 ? calculateRecipeTotals(varDetalles, 1) : { costoPorPorcion: 0 };

    return (
      <div
        key={v._key}
        className={`rounded-xl border transition-all ${
          isExpanded
            ? "border-orange-300 dark:border-orange-800 bg-orange-50/20 dark:bg-orange-950/10 shadow-xs"
            : "border-gray-200 dark:border-gray-700/80 bg-white dark:bg-gray-800 shadow-2xs hover:shadow-xs"
        }`}
      >
        <div className="flex items-center gap-2.5 p-2.5 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center ${badgeCls}`}>
              {idx + 1}
            </span>
            {isTamano && (
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                Tamaño{factorActual > 1 ? ` ×${factorActual}` : ""}
              </span>
            )}
            {isSabor && (
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                Sabor
              </span>
            )}
          </div>

          <div className="shrink-0 flex items-center gap-1">
            <label
              htmlFor={`variant-img-${v._key}`}
              className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center overflow-hidden cursor-pointer relative group transition-all shrink-0 ${
                v.previewUrl || v.imagen
                  ? "border-amber-300 dark:border-amber-700 bg-white dark:bg-gray-850 shadow-2xs"
                  : "border-dashed border-gray-300 dark:border-gray-600 hover:border-[#F05454] bg-gray-50 dark:bg-gray-800/60"
              }`}
              title={v.previewUrl || v.imagen ? "Cambiar foto" : "Subir foto"}
            >
              {v.previewUrl || v.imagen ? (
                <>
                  <img
                    src={v.previewUrl || v.imagen}
                    alt={v.nombre || "Variante"}
                    className="w-full h-full object-contain p-0.5"
                  />
                  <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity">
                    <Camera className="w-3.5 h-3.5" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-[#F05454] transition-colors">
                  <Camera className="w-3.5 h-3.5" />
                </div>
              )}
              <input
                id={`variant-img-${v._key}`}
                type="file"
                accept="image/*"
                onChange={(e) => handleVariantImageSelectedByKey(v._key, e)}
                className="hidden"
              />
            </label>

            {(v.previewUrl || v.imagen) && (
              <button
                type="button"
                onClick={() => handleRemoveVariantImageByKey(v._key)}
                className="p-1 text-gray-400 hover:text-red-500 rounded-md transition cursor-pointer"
                title="Quitar foto"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex-1 min-w-[140px]">
            <input
              type="text"
              value={v.nombre}
              onChange={(e) => handleUpdateVarianteByKey(v._key, "nombre", e.target.value)}
              placeholder={placeholderText}
              className={`w-full px-3 py-1.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg text-xs focus:ring-2 focus:border-transparent transition-colors ${borderFocusCls}`}
            />
          </div>

          <div className="shrink-0 flex items-center gap-1.5">
            {v.precio !== undefined && v.precio !== "" && Number(v.precio) > 0 && Number(v.precio) !== Number(form.precio || 0) && (
              <span
                className="px-2 py-1 rounded-lg text-[11px] font-black bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 tabular-nums"
                title="Precio personalizado de esta variante"
              >
                ${Number(v.precio).toLocaleString("es-CO")}
              </span>
            )}

            <button
              type="button"
              onClick={() => {
                const nextExpand = isExpanded ? null : v._key;
                setExpandedVariantKey(nextExpand);
                setNewRuleInsumoId("");
                setNewRuleCantidad("");
                setNewRuleUnidad("");
                setSearchInsumoVariante("");
                setShowInsumoDropdown(false);
                resetReplaceForm();
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                detCount > 0
                  ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700 shadow-2xs"
                  : "bg-gray-100 dark:bg-gray-750 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
              }`}
              title="Ver y editar ficha técnica, precio e insumos de esta variante"
            >
              <ChefHat className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              <span className="hidden sm:inline">Ficha Técnica</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black border ${detCount > 0 ? "bg-amber-200 dark:bg-amber-900 border-amber-400 text-amber-900 dark:text-amber-100" : "bg-white dark:bg-gray-800 border-gray-300 text-gray-600 dark:text-gray-300"}`}>
                {detCount}
              </span>
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-gray-500" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />}
            </button>

            <button
              type="button"
              onClick={() => handleRemoveVarianteByKey(v._key)}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition cursor-pointer"
              title="Eliminar opción"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Panel Expandible: Ficha Técnica completa e insumos editables con el nombre de la variante */}
        {isExpanded && (
          <div className="px-3 pb-3.5 pt-2 border-t border-orange-100 dark:border-orange-900/30 space-y-3 animate-in fade-in duration-150">
            {/* Encabezado con nombre de la variante + Control de Tamaño */}
            <div className="bg-orange-100/70 dark:bg-orange-950/40 p-3 rounded-xl border border-orange-200/80 dark:border-orange-900/50 space-y-2.5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-black uppercase text-orange-900 dark:text-orange-200 flex items-center gap-1.5">
                    <ChefHat className="w-4 h-4 text-orange-600 shrink-0" />
                    <span>Ficha Técnica de Variante: {varNombreDisplay}</span>
                  </p>
                  <p className="text-[11px] text-gray-600 dark:text-gray-400">
                    Carga automáticamente los insumos base del producto original. Edita cantidades, reemplaza insumos, ajusta el precio o añade nuevos exclusivos para <strong>{varNombreDisplay}</strong>.
                  </p>
                </div>

                {baseIngredients.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleSyncVariantFromBase(v._key)}
                    className="px-2.5 py-1.5 bg-white dark:bg-gray-800 hover:bg-orange-50 text-orange-800 dark:text-orange-200 border border-orange-300 dark:border-orange-700 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 shadow-2xs"
                    title="Recargar insumos base del producto original"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Sincronizar Base ({baseIngredients.length})</span>
                  </button>
                )}
              </div>

              {/* Control de Tamaño & Escalado Automático */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-orange-200/70 dark:border-orange-900/40">
                <label className="inline-flex items-center gap-2 text-[11px] font-bold text-gray-800 dark:text-gray-200 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={Boolean(v.esTamano)}
                    onChange={() => handleToggleVariantIsSize(v._key)}
                    className="rounded border-orange-300 text-[#F05454] focus:ring-[#F05454] cursor-pointer"
                  />
                  <span>Esta variante es de tamaño (aumentar cantidad de insumos)</span>
                </label>

                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-[10px] font-bold uppercase text-gray-500 mr-1">Escala:</span>
                  {[1, 1.25, 1.5, 2, 2.5, 3].map((f) => {
                    const active = Math.abs(factorActual - f) < 0.01;
                    return (
                      <button
                        key={f}
                        type="button"
                        onClick={() => handleApplyVariantScaleFactor(v._key, f)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black transition cursor-pointer border ${
                          active
                            ? "bg-[#F05454] text-white border-[#F05454] shadow-2xs"
                            : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-orange-400"
                        }`}
                      >
                        ×{f}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Metadatos y Precio Opcional de la Variante */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="sm:col-span-5">
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                  Descripción de "{varNombreDisplay}" (opcional)
                </label>
                <input
                  type="text"
                  value={v.descripcion || ""}
                  onChange={(e) => {
                    handleUpdateVarianteByKey(v._key, "descripcion", e.target.value);
                    handleUpdateVariantFichaMeta(v._key, "descripcion", e.target.value);
                  }}
                  placeholder={`Ej. ${varNombreDisplay} preparada con porción especial y salsa de la casa`}
                  className="w-full px-2.5 py-1.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-850 dark:text-gray-100 rounded-lg text-xs focus:ring-1 focus:ring-orange-400 outline-none"
                />
              </div>

              <div className="sm:col-span-3">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-emerald-600" />
                    <span>Precio Variante</span>
                  </label>
                  {v.precio !== undefined && v.precio !== "" && (
                    <button
                      type="button"
                      onClick={() => handleUpdateVarianteByKey(v._key, "precio", "")}
                      className="text-[9.5px] font-bold text-orange-600 hover:underline cursor-pointer"
                      title="Volver a heredar el precio del producto base"
                    >
                      Usar base
                    </button>
                  )}
                </div>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={v.precio ?? ""}
                  onChange={(e) => handleUpdateVarianteByKey(v._key, "precio", e.target.value)}
                  placeholder={form.precio ? `Base: $${Number(form.precio).toLocaleString("es-CO")}` : "Igual al base"}
                  className="w-full px-2.5 py-1.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-850 dark:text-gray-100 rounded-lg text-xs font-bold focus:ring-1 focus:ring-emerald-500 outline-none"
                  aria-label={`Precio de variante ${varNombreDisplay}`}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                  Rendimiento
                </label>
                <input
                  type="text"
                  value={v.fichaTecnica?.rendimiento || ""}
                  onChange={(e) => handleUpdateVariantFichaMeta(v._key, "rendimiento", e.target.value)}
                  placeholder="Ej. 1 porción"
                  className="w-full px-2.5 py-1.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-850 dark:text-gray-100 rounded-lg text-xs focus:ring-1 focus:ring-orange-400 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                  Prep (min)
                </label>
                <input
                  type="number"
                  min="0"
                  value={v.fichaTecnica?.tiempoPreparacion ?? 0}
                  onChange={(e) => handleUpdateVariantFichaMeta(v._key, "tiempoPreparacion", e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-850 dark:text-gray-100 rounded-lg text-xs focus:ring-1 focus:ring-orange-400 outline-none"
                />
              </div>

              <div className="sm:col-span-12">
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                  Procedimiento de Preparación para "{varNombreDisplay}"
                </label>
                <textarea
                  rows={2}
                  value={v.fichaTecnica?.procedimiento || ""}
                  onChange={(e) => handleUpdateVariantFichaMeta(v._key, "procedimiento", e.target.value)}
                  placeholder="Pasos de preparación específicos para esta variante..."
                  className="w-full px-2.5 py-1.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-850 dark:text-gray-100 rounded-lg text-xs focus:ring-1 focus:ring-orange-400 outline-none resize-y"
                />
              </div>
            </div>

            {/* Tabla Editable de Insumos de la Variante */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wide text-gray-700 dark:text-gray-300">
                  Insumos de "{varNombreDisplay}" ({detCount}):
                </span>
                {detCount > 0 && (
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    Costo estimado: ${Math.round(varCostTotals.costoPorPorcion || 0).toLocaleString("es-CO")}
                  </span>
                )}
              </div>

              {detCount === 0 ? (
                <div className="p-3 rounded-xl border border-dashed border-orange-200 dark:border-orange-900/40 bg-white/80 dark:bg-gray-850 text-center space-y-1.5">
                  <p className="text-[11px] font-medium text-gray-600 dark:text-gray-400">
                    {baseIngredients.length > 0
                      ? `No hay insumos cargados en "${varNombreDisplay}". Haz clic en "Sincronizar Base" o añade insumos abajo.`
                      : `El producto base aún no tiene insumos en el Paso 2. Puedes agregar insumos a "${varNombreDisplay}" usando el buscador de abajo.`}
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                  {varDetalles.map((det, detIdx) => {
                    const catalogItem = todosInsumosCatalogo.find(
                      (c) => Number(c.idInsumo || c.id) === Number(det.idInsumo)
                    );
                    const { vencido } = catalogItem ? checkInsumoInvalido(catalogItem) : { vencido: false };
                    const detName = catalogItem?.nombre || det.nombre || det.insumo?.nombre || `Insumo #${det.idInsumo}`;
                    const baseUnitForCompat = catalogItem?.unidadMedida || det.unidadMedida || "und";
                    const unitsList = getUnidadesCompatibles(baseUnitForCompat);
                    const currentUnitNorm = normalizeUnidadMedida(det.unidadMedida || baseUnitForCompat);
                    const unitCostItem = {
                      ...det,
                      precioUnitario: Number(catalogItem?.precioUnitario || det.precioUnitario || det.insumo?.precioUnitario || 0),
                      insumo: catalogItem || det.insumo
                    };
                    const rowCost = Math.round(calculateInsumoCost(unitCostItem) || 0);
                    const isScaled = det.esBase && det.baseCantidad !== null && Number(det.cantidad) > Number(det.baseCantidad);
                    const isReplacingThisRow =
                      replacingDetail?.variantKey === v._key && replacingDetail?.detailIdx === detIdx;

                    return (
                      <div key={`${det.idInsumo}-${detIdx}`} className="space-y-1">
                        <div
                          className={`flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 p-2 rounded-xl border text-xs shadow-2xs ${
                            vencido
                              ? "bg-red-50/70 dark:bg-red-950/20 border-red-300 dark:border-red-800"
                              : isReplacingThisRow
                                ? "bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-700"
                                : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            {det.esBase ? (
                              <span
                                className={`px-1.5 py-0.5 rounded text-[9.5px] font-black uppercase border shrink-0 ${
                                  isScaled
                                    ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700"
                                    : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800"
                                }`}
                              >
                                {isScaled ? `Base ×${factorActual}` : "Base"}
                              </span>
                            ) : det.reemplazaA ? (
                              <span className="px-1.5 py-0.5 rounded text-[9.5px] font-black uppercase bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800 shrink-0">
                                Reemplazo
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[9.5px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 shrink-0">
                                Nuevo
                              </span>
                            )}

                            <div className="min-w-0 flex-1">
                              <p className={`font-bold truncate ${vencido ? "text-red-700 dark:text-red-400" : "text-gray-900 dark:text-gray-100"}`}>
                                {detName}
                              </p>
                              {vencido && (
                                <span className="text-[9.5px] font-black text-red-600 dark:text-red-400 block">
                                  ⛔ VENCIDO — Retirar o reemplazar antes de guardar
                                </span>
                              )}
                              {det.reemplazaA && (
                                <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 block truncate">
                                  Reemplaza a: {det.reemplazaA.nombre}
                                </span>
                              )}
                              {det.esBase && det.baseCantidad !== null && (
                                <span className="text-[10px] text-gray-400 block">
                                  Original: {det.baseCantidad} {det.unidadMedida}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <input
                              type="number"
                              step="any"
                              min="0.01"
                              value={det.cantidad}
                              onChange={(e) => {
                                const val = e.target.value;
                                handleUpdateVariantDetail(v._key, detIdx, {
                                  cantidad: val === "" ? "" : Number(val)
                                });
                              }}
                              className="w-20 px-2 py-1 border border-gray-200 dark:border-gray-700 dark:bg-gray-850 dark:text-gray-100 rounded-lg text-xs font-bold text-right focus:outline-none focus:ring-1 focus:ring-[#F05454]"
                              aria-label={`Cantidad de ${detName}`}
                            />

                            <select
                              value={currentUnitNorm}
                              onChange={(e) => {
                                const nextU = e.target.value;
                                const conv = convertirUnidadYCantidad(det.cantidad || 0, currentUnitNorm, nextU);
                                handleUpdateVariantDetail(v._key, detIdx, {
                                  cantidad: Number((conv || 0).toFixed(2)),
                                  unidadMedida: nextU
                                });
                              }}
                              className="w-20 px-1.5 py-1 border border-gray-200 dark:border-gray-700 dark:bg-gray-850 dark:text-gray-100 rounded-lg text-xs font-semibold cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#F05454]"
                              aria-label={`Unidad de ${detName}`}
                            >
                              {unitsList.map((u) => (
                                <option key={u.value} value={u.value}>
                                  {u.label || u.value}
                                </option>
                              ))}
                            </select>

                            <span className="w-16 text-right text-[10.5px] font-mono text-gray-500 dark:text-gray-400 hidden sm:inline">
                              ${rowCost.toLocaleString("es-CO")}
                            </span>

                            <button
                              type="button"
                              onClick={() => {
                                if (isReplacingThisRow) {
                                  resetReplaceForm();
                                } else {
                                  setReplacingDetail({
                                    variantKey: v._key,
                                    detailIdx: detIdx,
                                    oldInsumoId: det.idInsumo,
                                    oldNombre: detName
                                  });
                                  setReplaceInsumoId("");
                                  setReplaceCantidad("");
                                  setReplaceUnidad("");
                                  setReplaceSearch("");
                                }
                              }}
                              className={`px-2 py-1 rounded-lg text-[10.5px] font-bold flex items-center gap-1 transition cursor-pointer ${
                                isReplacingThisRow
                                  ? "bg-indigo-600 text-white"
                                  : "text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800"
                              }`}
                              title="Reemplazar este insumo por otro"
                            >
                              <ArrowRightLeft className="w-3 h-3" />
                              <span className="hidden md:inline">Reemplazar</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRemoveVariantDetail(v._key, detIdx)}
                              className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition cursor-pointer"
                              title="Quitar insumo de esta variante"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {isReplacingThisRow && (() => {
                          const replaceSelectedInsumo = todosInsumosCatalogo.find(
                            (i) => Number(i.idInsumo || i.id) === Number(replaceInsumoId)
                          );
                          const replaceUnitsList = getUnidadesCompatibles(
                            replaceSelectedInsumo?.unidadMedida || replaceUnidad || "und"
                          );

                          return (
                            <div className="p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 space-y-2 animate-in fade-in duration-100">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[11px] font-extrabold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                                  <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-600" />
                                  Reemplazar "{detName}" por:
                                </span>
                                <button
                                  type="button"
                                  onClick={resetReplaceForm}
                                  className="text-[10.5px] font-bold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 flex items-center gap-0.5 cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" /> Cancelar
                                </button>
                              </div>

                              {!replaceInsumoId ? (
                                <div className="space-y-1.5">
                                  <div className="relative">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                                    <input
                                      type="text"
                                      value={replaceSearch}
                                      onChange={(e) => setReplaceSearch(e.target.value)}
                                      placeholder="Buscar insumo sustituto por nombre o categoría..."
                                      className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-gray-850 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                      autoFocus
                                    />
                                  </div>
                                  <div className="bg-white dark:bg-gray-850 border border-indigo-100 dark:border-indigo-900 rounded-lg max-h-40 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                                    {filteredReplaceInsumosCatalogo.length === 0 ? (
                                      <p className="p-2.5 text-[11px] text-center text-gray-400">
                                        No se encontraron insumos con "{replaceSearch}"
                                      </p>
                                    ) : (
                                      filteredReplaceInsumosCatalogo.map((ins) => {
                                        const insId = Number(ins.idInsumo || ins.id);
                                        const { vencido: insVencido } = checkInsumoInvalido(ins);
                                        const isSame = insId === Number(det.idInsumo);
                                        return (
                                          <button
                                            key={insId}
                                            type="button"
                                            disabled={insVencido || isSame}
                                            onClick={() => {
                                              if (insVencido) return;
                                              const portion = resolveDefaultInsumoPortion(ins);
                                              setReplaceInsumoId(insId);
                                              setReplaceCantidad(portion.cantidad);
                                              setReplaceUnidad(portion.unidadMedida);
                                            }}
                                            className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs transition ${
                                              insVencido || isSame
                                                ? "opacity-50 bg-gray-50 dark:bg-gray-900/40 cursor-not-allowed"
                                                : "hover:bg-indigo-50 dark:hover:bg-indigo-950/50 cursor-pointer"
                                            }`}
                                          >
                                            <div className="flex items-center gap-2 min-w-0">
                                              <span className={`font-semibold truncate ${insVencido ? "line-through text-red-600" : "text-gray-800 dark:text-gray-200"}`}>
                                                {ins.nombre}
                                              </span>
                                              {insVencido && (
                                                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 shrink-0">
                                                  VENCIDO
                                                </span>
                                              )}
                                              {isSame && (
                                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-200 text-gray-600 shrink-0">
                                                  Actual
                                                </span>
                                              )}
                                            </div>
                                            <span className="text-[10.5px] text-gray-500 shrink-0 ml-2">
                                              {ins.stock} {ins.unidadMedida}
                                            </span>
                                          </button>
                                        );
                                      })
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
                                  <div className="sm:col-span-5">
                                    <div className="flex items-center justify-between px-2.5 py-1.5 bg-white dark:bg-gray-850 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs">
                                      <span className="font-bold text-gray-900 dark:text-gray-100 truncate">
                                        {replaceSelectedInsumo?.nombre || `Insumo #${replaceInsumoId}`}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => setReplaceInsumoId("")}
                                        className="text-[10.5px] font-bold text-indigo-600 hover:underline ml-2 shrink-0 cursor-pointer"
                                      >
                                        Cambiar
                                      </button>
                                    </div>
                                  </div>

                                  <div className="sm:col-span-3">
                                    <input
                                      type="number"
                                      step="any"
                                      min="0.01"
                                      value={replaceCantidad}
                                      onChange={(e) => setReplaceCantidad(e.target.value)}
                                      placeholder="Cantidad"
                                      className="w-full px-2.5 py-1.5 bg-white dark:bg-gray-850 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                  </div>

                                  <div className="sm:col-span-2">
                                    <select
                                      value={replaceUnidad}
                                      onChange={(e) => setReplaceUnidad(e.target.value)}
                                      className="w-full px-2 py-1.5 bg-white dark:bg-gray-850 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs font-semibold cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    >
                                      {replaceUnitsList.map((u) => (
                                        <option key={u.value} value={u.value}>
                                          {u.label || u.value}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  <div className="sm:col-span-2">
                                    <button
                                      type="button"
                                      onClick={() => handleReplaceVariantDetail(v._key, detIdx)}
                                      className="w-full py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition cursor-pointer shadow-xs"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Aplicar</span>
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Añadir un nuevo insumo a la variante */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-750 pb-2">
                <span className="text-xs font-black uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-[#F05454]" />
                  <span>Añadir Nuevo Insumo a "{varNombreDisplay}"</span>
                </span>
                <span className="text-[10px] text-gray-400">
                  Bloquea insumos vencidos automáticamente
                </span>
              </div>

              {(() => {
                const selectedInsumo = todosInsumosCatalogo.find(
                  (i) => Number(i.idInsumo || i.id) === Number(newRuleInsumoId)
                );
                const compatibleUnits = selectedInsumo
                  ? getUnidadesCompatibles(newRuleUnidad || selectedInsumo.unidadMedida || "und")
                  : getUnidadesCompatibles("und");

                let suggestedPortion = null;
                if (selectedInsumo) {
                  const resolved = resolveRecetaUnidadYCantidad(selectedInsumo);
                  const minCant =
                    Number(selectedInsumo.porcionMinimaCantidad) > 0
                      ? Number(selectedInsumo.porcionMinimaCantidad)
                      : resolved.cantidad || 1;
                  const minUnit = normalizeUnidadMedida(
                    selectedInsumo.porcionMinimaUnidad || resolved.unidadMedida || selectedInsumo.unidadMedida || "und"
                  );
                  suggestedPortion = { cant: minCant, unit: minUnit };
                }

                return (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-7 relative" ref={insumoDropdownRef}>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                          Insumo del catálogo para "{varNombreDisplay}"
                        </label>

                        {newRuleInsumoId ? (
                          <div className="flex items-center justify-between px-3 py-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <CheckCircle2 className="w-4 h-4 text-[#F05454] shrink-0" />
                              <span className="font-bold text-gray-900 dark:text-gray-100 truncate">
                                {selectedInsumo?.nombre || `Insumo #${newRuleInsumoId}`}
                              </span>
                              {selectedInsumo && (
                                <span className="text-[10px] text-gray-500 dark:text-gray-400 shrink-0">
                                  ({selectedInsumo.stock} {selectedInsumo.unidadMedida})
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setNewRuleInsumoId("");
                                setSearchInsumoVariante("");
                                setShowInsumoDropdown(true);
                              }}
                              className="ml-2 text-[11px] text-red-600 hover:text-red-700 dark:text-red-400 font-bold underline cursor-pointer shrink-0"
                            >
                              Cambiar
                            </button>
                          </div>
                        ) : (
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                            <input
                              type="text"
                              placeholder="Buscar insumo por nombre o categoría..."
                              value={searchInsumoVariante}
                              onFocus={() => setShowInsumoDropdown(true)}
                              onChange={(e) => {
                                setSearchInsumoVariante(e.target.value);
                                setShowInsumoDropdown(true);
                              }}
                              className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-850 dark:text-gray-100 rounded-xl text-xs placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#F05454]"
                            />

                            {showInsumoDropdown && (
                              <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-56 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700/60 animate-in fade-in duration-100">
                                {filteredInsumosCatalogo.length === 0 ? (
                                  <div className="p-3 text-center text-xs text-gray-400">
                                    No se encontraron insumos con "{searchInsumoVariante}"
                                  </div>
                                ) : (
                                  filteredInsumosCatalogo.map((ins) => {
                                    const insId = ins.idInsumo || ins.id;
                                    const { vencido } = checkInsumoInvalido(ins);
                                    return (
                                      <button
                                        key={insId}
                                        type="button"
                                        disabled={vencido}
                                        onClick={() => {
                                          if (vencido) {
                                            notify.error(
                                              "Insumo Vencido",
                                              `El insumo "${ins.nombre}" se encuentra VENCIDO (${ins.fechaVencimiento ? String(ins.fechaVencimiento).substring(0, 10) : "Caducado"}). No puede ser utilizado.`
                                            );
                                            return;
                                          }
                                          setNewRuleInsumoId(insId);
                                          const resolved = resolveRecetaUnidadYCantidad(ins);
                                          const minCant =
                                            Number(ins.porcionMinimaCantidad) > 0
                                              ? Number(ins.porcionMinimaCantidad)
                                              : resolved.cantidad || 1;
                                          const minUnit = normalizeUnidadMedida(
                                            ins.porcionMinimaUnidad || resolved.unidadMedida || ins.unidadMedida || "und"
                                          );
                                          setNewRuleCantidad(minCant);
                                          setNewRuleUnidad(minUnit);
                                          setSearchInsumoVariante("");
                                          setShowInsumoDropdown(false);
                                        }}
                                        className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between transition group ${
                                          vencido
                                            ? "opacity-60 bg-red-50/50 dark:bg-red-950/20 cursor-not-allowed"
                                            : "hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                                        }`}
                                      >
                                        <div className="flex items-center gap-2 min-w-0">
                                          <span className={`text-xs font-semibold truncate ${vencido ? "text-red-700 dark:text-red-400 line-through" : "text-gray-800 dark:text-gray-200 group-hover:text-[#F05454]"}`}>
                                            {ins.nombre}
                                          </span>
                                          {vencido ? (
                                            <span className="text-[9px] px-1.5 py-0.5 rounded font-black bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300 shrink-0">
                                              ⛔ VENCIDO ({ins.fechaVencimiento ? String(ins.fechaVencimiento).substring(0, 10) : "Caducado"})
                                            </span>
                                          ) : ins.categoriaNombre ? (
                                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 shrink-0">
                                              {ins.categoriaNombre}
                                            </span>
                                          ) : null}
                                        </div>
                                        <span className="text-[10px] text-gray-400 font-mono shrink-0 ml-2">
                                          {ins.stock} {ins.unidadMedida}
                                        </span>
                                      </button>
                                    );
                                  })
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="sm:col-span-5">
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[10px] font-bold text-gray-500 uppercase">Cantidad</label>
                              {suggestedPortion && (
                                <span className="text-[9px] text-orange-600 dark:text-orange-400 font-semibold truncate">
                                  Min: {suggestedPortion.cant} {suggestedPortion.unit}
                                </span>
                              )}
                            </div>
                            <input
                              type="number"
                              step="any"
                              min="0.001"
                              placeholder={suggestedPortion ? String(suggestedPortion.cant) : "Ej. 30"}
                              value={newRuleCantidad}
                              onChange={(e) => setNewRuleCantidad(e.target.value)}
                              className="w-full px-2.5 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-850 dark:text-gray-100 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#F05454]"
                            />
                          </div>

                          <div className="w-28">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Unidad</label>
                            <select
                              value={normalizeUnidadMedida(newRuleUnidad)}
                              onChange={(e) => {
                                const nextU = e.target.value;
                                const conv = convertirUnidadYCantidad(newRuleCantidad, newRuleUnidad, nextU);
                                setNewRuleCantidad(conv);
                                setNewRuleUnidad(nextU);
                              }}
                              className="w-full px-2 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-850 dark:text-gray-100 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#F05454] cursor-pointer"
                            >
                              {compatibleUnits.map((u) => (
                                <option key={u.value} value={u.value}>
                                  {u.label || u.value}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-gray-750">
                      <span className="text-[11px] text-gray-400">
                        ➕ Este insumo se guardará dentro de la ficha técnica de <strong>{varNombreDisplay}</strong>.
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAddInsumoToVariant(v._key)}
                        className="px-4 py-2 bg-[#F05454] hover:bg-[#d84343] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Añadir a "{varNombreDisplay}"</span>
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  const isStep1Valid = Boolean(form.nombre?.trim() && Number(form.precio) > 0 && !errors.nombre && !errors.precio);

  const entityDataActual = {
    nombre: form.nombre || "",
    categoria: form.categoria || "",
    idCategoriaProducto: form.idCategoriaProducto || null,
    precio: Number(form.precio) || 0,
    tipoElaboracion,
    descripcion: form.descripcion || "",
    imagen: form.imagen || "",
    estado: form.estado || "Activo",
    adiciones: tipoElaboracion === "base" ? [] : (Array.isArray(form.adiciones) ? form.adiciones : [])
  };

  const prevEntityDataInicial = producto
    ? {
        nombre: producto.nombre || "",
        categoria: producto.categoria || "",
        idCategoriaProducto: producto.idCategoriaProducto || null,
        precio: Number(producto.precio) || 0,
        descripcion: producto.descripcion || "",
        imagen: producto.imagen || "",
        estado: producto.estado || "Activo",
        adiciones: Array.isArray(producto.adiciones) ? producto.adiciones : []
      }
    : null;

  const handleRestoreEntityData = (restoredEnt) => {
    if (!restoredEnt || typeof restoredEnt !== "object") return;
    setForm((prev) => ({
      ...prev,
      nombre: tieneVentasProtegido ? prev.nombre : (restoredEnt.nombre ?? prev.nombre),
      categoria: tieneVentasProtegido ? prev.categoria : (restoredEnt.categoria ?? prev.categoria),
      idCategoriaProducto: tieneVentasProtegido
        ? prev.idCategoriaProducto
        : (restoredEnt.idCategoriaProducto ?? prev.idCategoriaProducto),
      precio: restoredEnt.precio !== undefined ? String(restoredEnt.precio) : prev.precio,
      descripcion: restoredEnt.descripcion !== undefined ? restoredEnt.descripcion : prev.descripcion,
      estado: restoredEnt.estado || prev.estado
    }));
  };

  // Requerimiento 7: Guardado efectivo tras confirmación o creación directa
  const executeActualSave = async () => {
    try {
      setUploading(true);
      let finalImageUrl = form.imagen;

      if (fileToUpload) {
        finalImageUrl = await uploadImageToCloudinary(fileToUpload);
      }

      const resolvedCat = (categorias || []).find(c => c.nombre === form.categoria);
      const basePrice = Number(form.precio) || 0;

      const processedVariants = await Promise.all(
        variantes.map(async (v) => {
          let varImg = v.imagen || "";
          if (v.fileToUpload) {
            try {
              varImg = await uploadImageToCloudinary(v.fileToUpload);
            } catch (err) {
              console.warn(`Error al subir imagen de variante "${v.nombre}":`, err);
            }
          }
          const varName = v.nombre.trim();
          const rawDetalles = Array.isArray(v.fichaTecnica?.detalles) ? v.fichaTecnica.detalles : [];
          const cleanDetalles = rawDetalles
            .filter((d) => d && d.idInsumo && Number(d.cantidad) > 0)
            .map((d) => ({
              idInsumo: Number(d.idInsumo),
              cantidad: Number(d.cantidad),
              unidadMedida: normalizeUnidadMedida(d.unidadMedida || "und")
            }));

          const computedDeltas =
            tipoElaboracion === "preparado" && cleanDetalles.length > 0
              ? computeInsumosModificadosDeltas(cleanDetalles, baseIngredients)
              : (Array.isArray(v.insumosModificados) ? v.insumosModificados : []);

          const varFicha =
            tipoElaboracion === "preparado"
              ? {
                  idFichaTecnica: isCloning ? null : (v.fichaTecnica?.idFichaTecnica || null),
                  idVariante: isCloning ? null : (v.idVariante || null),
                  tipo: "VARIANTE",
                  varianteNombre: varName,
                  descripcion:
                    (v.fichaTecnica?.descripcion || v.descripcion || "").trim() ||
                    `${form.nombre.trim() || "Producto"} — ${varName}`,
                  rendimiento:
                    (v.fichaTecnica?.rendimiento || "").trim() ||
                    (v.esTamano ? `1 porción (${varName})` : "1 porción"),
                  tiempoPreparacion: Math.max(0, Number(v.fichaTecnica?.tiempoPreparacion) || 0),
                  procedimiento: (v.fichaTecnica?.procedimiento || "").trim(),
                  detalles: cleanDetalles,
                  insumos: cleanDetalles
                }
              : null;

          const resolvedVarPrecio =
            v.precio !== undefined && v.precio !== null && String(v.precio).trim() !== "" && Number(v.precio) > 0
              ? Number(v.precio)
              : basePrice;

          return {
            idVariante: isCloning ? null : (v.idVariante || null),
            nombre: varName,
            descripcion: (v.descripcion || v.fichaTecnica?.descripcion || "").trim() || null,
            precio: resolvedVarPrecio,
            imagen: varImg || null,
            esTamano: Boolean(v.esTamano),
            factorTamano: Number(v.factorTamano) || 1,
            insumosModificados: computedDeltas,
            fichaTecnica: varFicha
          };
        })
      );

      // Requerimiento 2: Construir payload según tipo de elaboración
      await onSave({
        ...form,
        imagen: finalImageUrl,
        idCategoriaProducto: form.idCategoriaProducto || resolvedCat?.id || resolvedCat?.idCategoriaProducto || null,
        precio: basePrice,
        tipoElaboracion,
        variantes: processedVariants,
        adiciones: tipoElaboracion === "base" ? [] : form.adiciones,
        itemsCombo: configCombo.esCombo ? (configCombo.productosAsociados || []) : [],
        configuracionCombo: configCombo.esCombo
          ? {
              esCombo: true,
              cantidadBebidas: Math.max(0, Number(configCombo.cantidadBebidas) || 0),
              bebidasPermitidas: configCombo.bebidasPermitidas || [],
              productosAsociados: configCombo.productosAsociados || [],
              itemsCombo: configCombo.productosAsociados || []
            }
          : { esCombo: false, cantidadBebidas: 0, bebidasPermitidas: [], productosAsociados: [] },
        fichaTecnica: (configCombo.esCombo)
          ? null
          : tipoElaboracion === "base"
          ? {
              tipo: "PRODUCTO",
              tipoElaboracion: "base",
              descripcion: form.descripcion || "Producto Base Comercial / Terminado",
              rendimiento: 1,
              insumos: [],
              detalles: [],
              procedimiento: "Producto terminado para venta directa sin receta culinaria.",
              tiempoPreparacion: "0 min",
              especificaciones: form.descripcion || "Producto terminado de compra directa.",
              caracteristicas: "Producto comercial de reventa.",
              condicionesAlmacenamiento: fichaTecnica?.condicionesAlmacenamiento || "Almacenar según especificaciones del fabricante.",
              vidaUtil: fichaTecnica?.vidaUtil || "Según fecha de vencimiento del lote comercial",
              observaciones: "Producto base sin preparación culinaria interna.",
              datosEntidad: {
                ...entityDataActual,
                tipoElaboracion: "base",
                imagen: finalImageUrl,
                precio: basePrice,
                adiciones: []
              }
            }
          : fichaTecnica
          ? {
              ...fichaTecnica,
              tipoElaboracion: "preparado",
              idFichaTecnica: isCloning ? null : fichaTecnica.idFichaTecnica,
              idProducto: isCloning ? null : fichaTecnica.idProducto,
              datosEntidad: {
                ...entityDataActual,
                tipoElaboracion: "preparado",
                imagen: finalImageUrl,
                precio: basePrice
              },
              _prevDatosEntidad: isCloning ? null : prevEntityDataInicial
            }
          : null
      });

      setFileToUpload(null);
      setPreviewUrl("");
      setShowConfirmVersionModal(false);
    } catch (err) {
      console.error("Error al guardar producto:", err);
      notify.error("Error", err.message || "Error al subir imagen o guardar el producto");
    } finally {
      setUploading(false);
    }
  };

  // Interceptor de guardado: Valida y en modo edición abre modal de confirmación
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setSubmitted(true);
    if (uploading) return;

    const errNombre = validateField("nombre", form.nombre);
    const errPrecio = validateField("precio", form.precio);
    const errDesc = validateField("descripcion", form.descripcion);
    const errs = {};
    if (errNombre) errs.nombre = errNombre;
    if (errPrecio) errs.precio = errPrecio;
    if (errDesc) errs.descripcion = errDesc;
    setErrors(errs);
    setTouched({ nombre: true, precio: true, descripcion: true });

    if (Object.keys(errs).length > 0) {
      setActiveStep(1);
      notify.warning("Campo Requerido", Object.values(errs)[0]);
      return;
    }

    if (configCombo.esCombo) {
      if (!Array.isArray(configCombo.productosAsociados) || configCombo.productosAsociados.length === 0) {
        setActiveStep(2); // Paso 2 es Armador de Combo en el nuevo orden
        notify.warning("Combo Vacío", "Por favor agrega al menos un plato o bebida al combo en el Paso 2 (Armador de Combo).");
        return;
      }
    } else {
      // Requerimiento 10: Validar Ficha Técnica obligatoria e insumos vencidos/agotados para Producto Preparado
      if (tipoElaboracion === "preparado") {
        const ft = fichaTecnica || producto?.fichaTecnica || {};
        const ingredientes = ft.detalles || ft.insumos || ft.ingredientes || [];
        if (!ingredientes || ingredientes.length === 0) {
          setActiveStep(2); // Paso 2 es Ficha Técnica
          notify.warning(
            "Ficha Técnica Obligatoria",
            "Sin la ficha técnica no puede existir un producto preparado. Por favor agrega al menos un insumo en el Paso 2 (Ficha Técnica)."
          );
          return;
        }

        // Requerimiento 10: Rechazar insumos vencidos o agotados
        for (const item of ingredientes) {
          const { vencido, agotado } = checkInsumoInvalido(item);
          if (vencido) {
            setActiveStep(2);
            notify.error(
              "Insumo Vencido",
              `No se puede guardar: El insumo "${item.nombreInsumo || item.nombre}" se encuentra VENCIDO. Debes retirarlo o reemplazarlo en el Paso 2 (Ficha Técnica).`
            );
            return;
          }
          if (agotado) {
            setActiveStep(2);
            notify.error(
              "Insumo Agotado",
              `No se puede guardar: El insumo "${item.nombreInsumo || item.nombre}" está AGOTADO en inventario. Debes abastecer el stock o retirarlo en el Paso 2 (Ficha Técnica).`
            );
            return;
          }
        }
      }

      // Validar variantes si existen
      if (variantes.length > 0) {
        for (let i = 0; i < variantes.length; i++) {
          const v = variantes[i];
          if (!v.nombre || !v.nombre.trim()) {
            setActiveStep(3); // Paso 3 es Variantes
            const typeLabel = isDrink 
              ? (v.tipo === "tamano" ? "de tamaño / presentación" : "de sabor / variante")
              : "de variante";
            notify.warning("Campo Requerido", `Por favor escribe el nombre ${typeLabel} #${i + 1}`);
            return;
          }
          if (v.nombre.trim().toLowerCase() === form.nombre.trim().toLowerCase()) {
            setActiveStep(3);
            notify.warning(
              "Variante Inválida",
              `La variante #${i + 1} ("${v.nombre}") tiene el mismo nombre que el producto principal. Las variantes deben representar sabores o presentaciones distintas (ej. Sabor BBQ, Picante, Familiar, 1.5 Litros).`
            );
            return;
          }

          if (
            v.precio !== undefined &&
            v.precio !== null &&
            String(v.precio).trim() !== "" &&
            (Number.isNaN(Number(v.precio)) || Number(v.precio) <= 0)
          ) {
            setActiveStep(3);
            setExpandedVariantKey(v._key);
            notify.warning(
              "Precio Inválido en Variante",
              `El precio personalizado de "${v.nombre}" debe ser mayor a $0 (o déjalo vacío para usar el precio base).`
            );
            return;
          }

          if (tipoElaboracion === "preparado") {
            const varDetalles = Array.isArray(v.fichaTecnica?.detalles) ? v.fichaTecnica.detalles : [];
            if (varDetalles.length === 0) {
              setActiveStep(3);
              setExpandedVariantKey(v._key);
              notify.error(
                "Ficha Técnica Incompleta",
                `La variante "${v.nombre}" debe tener al menos un insumo asignado en su ficha técnica.`
              );
              return;
            }
            for (const det of varDetalles) {
              if (!det.idInsumo || Number(det.cantidad) <= 0) {
                setActiveStep(3);
                setExpandedVariantKey(v._key);
                notify.error(
                  "Cantidad Inválida en Variante",
                  `Todos los insumos de la variante "${v.nombre}" deben tener una cantidad mayor a 0.`
                );
                return;
              }
              const insMatch = todosInsumosCatalogo.find(
                (c) => Number(c.idInsumo || c.id) === Number(det.idInsumo)
              );
              if (insMatch) {
                const { vencido } = checkInsumoInvalido(insMatch);
                if (vencido) {
                  setActiveStep(3);
                  setExpandedVariantKey(v._key);
                  notify.error(
                    "Insumo Vencido en Variante",
                    `No se puede guardar: La variante "${v.nombre}" tiene asignado el insumo "${insMatch.nombre}" que se encuentra VENCIDO (${insMatch.fechaVencimiento ? String(insMatch.fechaVencimiento).substring(0, 10) : "Caducado"}). Debes retirarlo o reemplazarlo en el Paso 3.`
                  );
                  return;
                }
              }
            }
          }

          // REQUERIMIENTO 3: Bloquear guardado si alguna regla de variante usa insumos vencidos
          if (Array.isArray(v.insumosModificados)) {
            for (const rule of v.insumosModificados) {
              if (rule.tipoAccion !== "QUITAR" && rule.idInsumo) {
                const insMatch = todosInsumosCatalogo.find((c) => Number(c.idInsumo || c.id) === Number(rule.idInsumo));
                if (insMatch) {
                  const { vencido } = checkInsumoInvalido(insMatch);
                  if (vencido) {
                    setActiveStep(3);
                    setExpandedVariantKey(v._key);
                    notify.error(
                      "Insumo Vencido en Variante",
                      `No se puede guardar: La variante "${v.nombre}" tiene asignado el insumo "${insMatch.nombre}" que se encuentra VENCIDO (${insMatch.fechaVencimiento ? String(insMatch.fechaVencimiento).substring(0, 10) : "Caducado"}). Debes retirarlo o reemplazarlo en el Paso 3.`
                    );
                    return;
                  }
                }
              }
            }
          }
        }
      }
    }

    // Requerimiento 7: Si estamos editando un producto existente, pedir confirmación antes de archivar/crear nueva versión
    if (isEditing && !isCloning) {
      setShowConfirmVersionModal(true);
      return;
    }

    // Si es creación nueva o duplicación directa
    await executeActualSave();
  };

  const handleImageSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      notify.warning("Formato Inválido", "El archivo seleccionado debe ser una imagen (JPG, PNG, WEBP).");
      return;
    }

    const maxSizeInBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      notify.warning("Tamaño Excedido", "La imagen no debe superar los 5 MB de tamaño.");
      return;
    }

    setFileToUpload(file);
    const localBlobUrl = URL.createObjectURL(file);
    setPreviewUrl(localBlobUrl);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = () => {
    setFileToUpload(null);
    setPreviewUrl("");
    setForm((prev) => ({ ...prev, imagen: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-hidden">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Principal con Título y Estado */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/50 text-[#F05454] flex items-center justify-center shrink-0 shadow-xs border border-red-100 dark:border-red-900/40">
              <FoodIcon name={configCombo.esCombo ? "combo" : isDrink ? "drink" : "burger"} size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-2">
                  <span>{isCloning ? "Duplicar Producto" : isEditing ? "Editar Producto" : "Nuevo Producto"}</span>
                  {isCloning && (
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
                      Copia Nueva
                    </span>
                  )}
                </h2>
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  configCombo.esCombo
                    ? "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800"
                    : isDrink
                    ? "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800"
                    : "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800"
                }`}>
                  {configCombo.esCombo ? "Combo Especial" : isDrink ? "Bebida" : "Comida / Plato"}
                </span>
                {!configCombo.esCombo && (
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    isCommercialDrink || tipoElaboracion === "base"
                      ? "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300"
                      : "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300"
                  }`}>
                    {isDrink
                      ? (isCommercialDrink ? "Reventa Comercial" : "Bebida Preparada")
                      : (tipoElaboracion === "base" ? "Producto Base" : "Producto Preparado")}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {configCombo.esCombo
                  ? `Paso ${activeStep === 2 ? "2 de 2" : "1 de 2"} • ${activeStep === 1 ? "Información Principal & Precio" : "Armador de Combo Gastronómico"}`
                  : isCommercialDrink
                  ? `Paso ${activeStep === 3 ? "2 de 2" : "1 de 2"} • ${activeStep === 1 ? "Información & Categoría" : "Presentaciones & Sabores"}`
                  : `Paso ${activeStep} de 4 • ${
                      activeStep === 1
                        ? "Información Principal & Tipo"
                        : activeStep === 2
                        ? (tipoElaboracion === "base" ? "Ficha Técnica (Producto Base)" : "Ficha Técnica & Receta")
                        : activeStep === 3
                        ? (isDrink ? "Presentaciones & Sabores" : "Presentaciones & Variantes")
                        : "Adiciones Permitidas"
                    }`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCancelOrClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Requerimiento 9: FILTRO SUPERIOR DE VERSIONAMIENTO (Arriba del menú de pasos) */}
        <div className="px-5 py-2.5 bg-slate-50 dark:bg-gray-850/90 border-b border-gray-150 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-[#F05454] flex items-center justify-center shrink-0 border border-rose-100 dark:border-rose-900/30 shadow-2xs">
              <History className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-gray-800 dark:text-gray-200">
                Versión del Producto:
              </span>
              {listaVersionesAnteriores.length > 0 ? (
                <div className="flex items-center gap-2">
                  <select
                    value={selectedVersionFilter}
                    onChange={(e) => setSelectedVersionFilter(e.target.value)}
                    className="text-xs font-bold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1 text-gray-800 dark:text-gray-100 focus:ring-1 focus:ring-[#F05454] cursor-pointer shadow-2xs"
                  >
                    <option value="actual">
                      🟢 Versión Actual v{versionActualNum.toFixed(1)} (Vigente / En Edición)
                    </option>
                    {listaVersionesAnteriores.map((ver, idx) => (
                      <option key={idx} value={String(ver.version || idx + 1)}>
                        🕒 Versión v{Number(ver.version || idx + 1).toFixed(1)} — {ver.fechaFinVigencia ? new Date(ver.fechaFinVigencia).toLocaleDateString("es-CO") : "Archivada"} ({ver.detalles?.length || ver.insumos?.length || 0} insumos)
                      </option>
                    ))}
                  </select>

                  {selectedVersionFilter !== "actual" && (
                    <button
                      type="button"
                      onClick={handleRestoreHistoricalVersion}
                      className="px-2.5 py-1 text-[11px] font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-lg shadow-2xs transition flex items-center gap-1 cursor-pointer"
                      title="Restaurar datos de esta versión en el borrador"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Restaurar esta versión</span>
                    </button>
                  )}
                </div>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  v{versionActualNum.toFixed(1)} (Vigente)
                </span>
              )}
            </div>
          </div>

          <div className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            {selectedVersionFilter !== "actual" ? (
              <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                Visualizando versión histórica v{selectedVersionFilter}
              </span>
            ) : isEditing ? (
              <span className="text-gray-400">Las modificaciones confirmadas archivarán una nueva versión</span>
            ) : (
              <span className="text-gray-400">El producto se registrará con la versión inicial 1.0</span>
            )}
          </div>
        </div>

        {/* Alerta de Modo Consulta Histórica en Filtro Superior */}
        {selectedVersionFilter !== "actual" && selectedHistoricalVersionObj && (
          <div className="p-3 bg-amber-50/90 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800/60 px-6 flex items-center justify-between gap-3 text-xs shrink-0">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                Estás visualizando el snapshot de la <strong>Versión v{Number(selectedHistoricalVersionObj.version || 1).toFixed(1)}</strong> ({selectedHistoricalVersionObj.fechaFinVigencia ? `Archivada el ${new Date(selectedHistoricalVersionObj.fechaFinVigencia).toLocaleDateString("es-CO")}` : "Versión anterior"}).
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRestoreHistoricalVersion}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition cursor-pointer shadow-2xs flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restaurar Esta Versión</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedVersionFilter("actual")}
                className="px-2.5 py-1 text-gray-600 hover:text-gray-900 font-semibold text-xs cursor-pointer"
              >
                Volver a Versión Actual
              </button>
            </div>
          </div>
        )}

        {/* Requerimiento 1: STEPPER NAVEGADOR DE PASOS REORGANIZADO
            1. Datos & Tipo -> 2. Ficha Técnica / Combo -> 3. Variantes -> 4. Adiciones */}
        <div className={`grid ${
          configCombo.esCombo || isCommercialDrink ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4"
        } border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-850 shrink-0`}>
          
          {/* Paso 1: Datos & Tipo */}
          <button
            type="button"
            onClick={() => setActiveStep(1)}
            className={`p-3.5 flex items-center gap-2.5 transition text-left cursor-pointer border-r border-b md:border-b-0 border-gray-100 dark:border-gray-800 relative ${
              activeStep === 1
                ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-2xs"
                : "text-gray-500 hover:bg-gray-100/60 dark:hover:bg-gray-800/60"
            }`}
          >
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 transition-colors ${
              isStep1Valid
                ? "bg-emerald-500 text-white shadow-xs"
                : activeStep === 1
                ? "bg-[#F05454] text-white shadow-xs"
                : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
            }`}>
              {isStep1Valid ? <Check className="w-4 h-4 stroke-[3]" /> : "1"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black truncate leading-tight">1. Datos & Tipo</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate hidden sm:block">
                {isCommercialDrink ? "Bebida comercial de reventa" : "Nombre, precio y elaboración"}
              </p>
            </div>
            {activeStep === 1 && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F05454]" />
            )}
          </button>

          {/* Paso 2: Ficha Técnica (o Armador de Combo) - NO SE MUESTRA PARA BEBIDAS COMERCIALES DE REVENTA */}
          {!isCommercialDrink && (
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className={`p-3.5 flex items-center gap-2.5 transition text-left cursor-pointer border-r border-b md:border-b-0 border-gray-100 dark:border-gray-800 relative ${
                activeStep === 2
                  ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-2xs"
                  : "text-gray-500 hover:bg-gray-100/60 dark:hover:bg-gray-800/60"
              }`}
            >
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 transition-colors ${
                configCombo.esCombo
                  ? configCombo.productosAsociados?.length > 0
                    ? "bg-blue-600 text-white shadow-xs"
                    : activeStep === 2 ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700"
                  : tipoElaboracion === "base"
                  ? "bg-purple-600 text-white shadow-xs"
                  : (fichaTecnica?.detalles?.length || fichaTecnica?.insumos?.length) > 0
                  ? "bg-emerald-600 text-white shadow-xs"
                  : activeStep === 2 ? "bg-[#F05454] text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-600"
              }`}>
                {configCombo.esCombo 
                  ? (configCombo.productosAsociados?.length || "2") 
                  : tipoElaboracion === "base"
                  ? "✓"
                  : ((fichaTecnica?.detalles?.length || fichaTecnica?.insumos?.length) > 0 ? <Check className="w-4 h-4 stroke-[3]" /> : "2")}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black truncate leading-tight">
                  {configCombo.esCombo ? "2. Armador de Combo" : "2. Ficha Técnica"}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate hidden sm:block">
                  {configCombo.esCombo 
                    ? "Platos incluidos" 
                    : tipoElaboracion === "base" 
                    ? "Producto Base Terminado" 
                    : "Receta, insumos y proceso"}
                </p>
              </div>
              {activeStep === 2 && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F05454]" />
              )}
            </button>
          )}

          {/* Paso 3: Variantes / Presentaciones */}
          {!configCombo.esCombo && (
            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className={`p-3.5 flex items-center gap-2.5 transition text-left cursor-pointer border-r border-gray-100 dark:border-gray-800 relative ${
                activeStep === 3
                  ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-2xs"
                  : "text-gray-500 hover:bg-gray-100/60 dark:hover:bg-gray-800/60"
              }`}
            >
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 transition-colors ${
                variantes.length > 0
                  ? "bg-purple-600 text-white shadow-xs"
                  : activeStep === 3
                  ? "bg-[#F05454] text-white shadow-xs"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
              }`}>
                {variantes.length > 0 ? variantes.length : (isCommercialDrink ? "2" : "3")}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black truncate leading-tight">
                  {isCommercialDrink ? "2. Presentaciones & Sabores" : isDrink ? "3. Presentaciones" : "3. Variantes"}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate hidden sm:block">
                  {isDrink ? "Tamaños y sabores (Opcional)" : "Opciones o tamaños"}
                </p>
              </div>
              {activeStep === 3 && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F05454]" />
              )}
            </button>
          )}

          {/* Paso 4: Adiciones (NO SE MUESTRA PARA BEBIDA COMERCIAL DE REVENTA NI COMBOS) */}
          {!configCombo.esCombo && !isCommercialDrink && (
            <button
              type="button"
              onClick={() => {
                if (tipoElaboracion === "base") {
                  notify.info("Adiciones Desactivadas", "Los productos base (gaseosas, salsas comerciales) no admiten adiciones.");
                }
                setActiveStep(4);
              }}
              className={`p-3.5 flex items-center gap-2.5 transition text-left cursor-pointer relative ${
                tipoElaboracion === "base"
                  ? "opacity-60 bg-gray-50/50 dark:bg-gray-900/30 text-gray-400"
                  : activeStep === 4
                  ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-2xs"
                  : "text-gray-500 hover:bg-gray-100/60 dark:hover:bg-gray-800/60"
              }`}
            >
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 transition-colors ${
                tipoElaboracion === "base"
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-400"
                  : form.adiciones?.length > 0
                  ? "bg-emerald-600 text-white shadow-xs"
                  : activeStep === 4
                  ? "bg-[#F05454] text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-600"
              }`}>
                {tipoElaboracion === "base" ? <Lock className="w-3.5 h-3.5" /> : (form.adiciones?.length || "4")}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black truncate leading-tight">
                  {tipoElaboracion === "base" ? "4. Adiciones (N/A)" : "4. Adiciones"}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate hidden sm:block">
                  {tipoElaboracion === "base" ? "Bloqueado para Producto Base" : "Extras permitidos"}
                </p>
              </div>
              {activeStep === 4 && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F05454]" />
              )}
            </button>
          )}
        </div>

        {/* Form Body - Paneles por Paso */}
        <form onSubmit={handleSubmit} noValidate className="p-4 sm:p-6 overflow-y-auto flex-1">
          
          {/* PASO 1: INFORMACIÓN PRINCIPAL & TIPO DE PRODUCTO (Layout 2 Columnas Optimizado) */}
          {activeStep === 1 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              
              {/* Alerta de Modo Duplicación (Ítem 125) */}
              {isCloning && (
                <div className="p-3.5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-300/80 dark:border-amber-800/70 flex items-start gap-3 text-xs">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Copy className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-black text-amber-900 dark:text-amber-200 uppercase tracking-wider text-[11px]">
                      Modo Duplicación de Producto
                    </p>
                    <p className="text-amber-800 dark:text-amber-300 leading-relaxed">
                      Estás creando un nuevo producto a partir de <strong>"{producto?.originalNombre || producto?.nombre}"</strong>. Todos los campos, ficha técnica, ingredientes y variantes han sido precargados. Puedes editarlos como desees antes de guardar.
                    </p>
                  </div>
                </div>
              )}

              {/* Candado de ventas si aplica */}
              {tieneVentasProtegido && (
                <div className="p-3.5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-300/80 dark:border-amber-800/70 flex items-start gap-3 text-xs">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-black text-amber-900 dark:text-amber-200 uppercase tracking-wider text-[11px]">
                      Candado de Identidad Activo (Producto con Ventas Asociadas)
                    </p>
                    <p className="text-amber-800 dark:text-amber-300 leading-relaxed">
                      El <strong>Nombre</strong> y la <strong>Categoría</strong> están protegidos para mantener la consistencia contable de las ventas anteriores. Puedes modificar libremente el <strong>Precio</strong>, <strong>Descripción</strong>, <strong>Foto</strong> y <strong>Adiciones</strong>.
                    </p>
                  </div>
                </div>
              )}

              {/* Selector de Tipo de Producto Visual */}
              <div className="space-y-1.5">
                <label className={labelCls}>
                  ¿Qué tipo de producto deseas crear? <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-1.5 bg-gray-100 dark:bg-gray-800/80 rounded-2xl border border-gray-200/80 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setModoVariantesManual("comida");
                      setConfigCombo(prev => ({ ...prev, esCombo: false }));
                      setTipoElaboracion("preparado");
                      setEsBebidaPreparada(false);
                      const currentCatLower = String(form.categoria || "").toLowerCase();
                      if (currentCatLower.includes("combo") || currentCatLower.includes("bebida")) {
                        const comidaCat = (categorias || []).find(c => !c.nombre.toLowerCase().includes("combo") && !c.nombre.toLowerCase().includes("bebida"));
                        if (comidaCat) {
                          setForm(prev => ({
                            ...prev,
                            categoria: comidaCat.nombre,
                            idCategoriaProducto: comidaCat.id || comidaCat.idCategoriaProducto
                          }));
                        }
                      }
                    }}
                    className={`flex items-center gap-3 p-3 rounded-xl transition text-left cursor-pointer ${
                      !isDrink && !configCombo.esCombo
                        ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm border border-red-200 dark:border-red-900/50"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 hover:bg-white/50"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      !isDrink && !configCombo.esCombo ? "bg-red-50 text-[#F05454] dark:bg-red-950/50" : "bg-gray-200 dark:bg-gray-700"
                    }`}>
                      <FoodIcon name="burger" size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-black">Comida / Platillo</p>
                      <p className="text-[10px] text-gray-400">Hamburguesas, perros, papas...</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setModoVariantesManual("bebida");
                      setConfigCombo(prev => ({ ...prev, esCombo: false }));
                      setEsBebidaPreparada(false);
                      setTipoElaboracion("base");
                      setForm(prev => {
                        const drinkCat = (categorias || []).find(c => {
                          const n = String(c.nombre || "").toLowerCase();
                          return n.includes("bebida") || n.includes("gaseos") || n.includes("refresco");
                        });
                        return {
                          ...prev,
                          adiciones: [],
                          categoria: drinkCat ? drinkCat.nombre : prev.categoria,
                          idCategoriaProducto: drinkCat ? (drinkCat.id || drinkCat.idCategoriaProducto) : prev.idCategoriaProducto
                        };
                      });
                    }}
                    className={`flex items-center gap-3 p-3 rounded-xl transition text-left cursor-pointer ${
                      isDrink && !configCombo.esCombo
                        ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm border border-purple-200 dark:border-purple-900/50"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 hover:bg-white/50"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isDrink && !configCombo.esCombo ? "bg-purple-50 text-purple-600 dark:bg-purple-950/50" : "bg-gray-200 dark:bg-gray-700"
                    }`}>
                      <FoodIcon name="drink" size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-black">Bebida / Refresco</p>
                      <p className="text-[10px] text-gray-400">Gaseosas, jugos, agua...</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setConfigCombo(prev => ({ ...prev, esCombo: true }));
                      const comboCat = categorias.find(c => c.nombre.toLowerCase().includes("combo"));
                      if (comboCat) {
                        setForm(prev => ({
                          ...prev,
                          categoria: comboCat.nombre,
                          idCategoriaProducto: comboCat.id || comboCat.idCategoriaProducto
                        }));
                      }
                    }}
                    className={`flex items-center gap-3 p-3 rounded-xl transition text-left cursor-pointer ${
                      configCombo.esCombo
                        ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm border border-blue-200 dark:border-blue-900/50"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 hover:bg-white/50"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      configCombo.esCombo ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50" : "bg-gray-200 dark:bg-gray-700"
                    }`}>
                      <FoodIcon name="combo" size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-black">Combo Especial</p>
                      <p className="text-[10px] text-gray-400">Paquete de platos + bebidas</p>
                    </div>
                  </button>
                </div>

                {/* REQUERIMIENTO 2: Selector de Modalidad de Elaboración (Preparado vs Base) - Solo para comida/platillos */}
                {!configCombo.esCombo && !isDrink && (
                  <div className="pt-2">
                    <div className="p-3.5 bg-slate-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/80 dark:border-gray-700 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                          <Utensils className="w-3.5 h-3.5 text-[#F05454]" />
                          Modalidad de Elaboración:
                        </span>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black ${
                          tipoElaboracion === "preparado"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300"
                        }`}>
                          {tipoElaboracion === "preparado" ? "Cocina con Receta (Insumos)" : "Producto Terminado (Sin Receta)"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setTipoElaboracion("preparado")}
                          className={`p-3 rounded-xl text-left transition border cursor-pointer ${
                            tipoElaboracion === "preparado"
                              ? "bg-white dark:bg-gray-900 border-[#F05454] shadow-2xs ring-1 ring-[#F05454]/30"
                              : "bg-white/60 dark:bg-gray-850/60 border-gray-200 dark:border-gray-700 hover:bg-white"
                          }`}
                        >
                          <p className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                            <span>👨‍🍳 Producto Preparado</span>
                          </p>
                          <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                            Se cocina en el negocio con insumos del inventario (Hamburguesas, perros calientes, batidos preparados, papas locas). Requiere Ficha Técnica culinaria.
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setTipoElaboracion("base");
                            setForm(prev => ({ ...prev, adiciones: [] }));
                          }}
                          className={`p-3 rounded-xl text-left transition border cursor-pointer ${
                            tipoElaboracion === "base"
                              ? "bg-white dark:bg-gray-900 border-purple-500 shadow-2xs ring-1 ring-purple-500/30"
                              : "bg-white/60 dark:bg-gray-850/60 border-gray-200 dark:border-gray-700 hover:bg-white"
                          }`}
                        >
                          <p className="text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                            <span>📦 Producto Base (Terminado)</span>
                          </p>
                          <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                            Ya viene elaborado de fábrica o proveedor (Gaseosas embotelladas, salsas industriales compradas como salsa roja, rosada o BBQ, snacks). <strong>Sin adiciones</strong>.
                          </p>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Subtipo de Bebida: Comercial vs Especial/Preparada */}
                {isDrink && !configCombo.esCombo && (
                  <div className="p-3.5 bg-purple-50/70 dark:bg-purple-950/25 rounded-2xl border border-purple-200/80 dark:border-purple-900/50 space-y-2 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        Modalidad de la Bebida:
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                        esBebidaPreparada 
                          ? "bg-purple-200 dark:bg-purple-900/70 text-purple-800 dark:text-purple-200" 
                          : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`}>
                        {esBebidaPreparada ? "Ficha Técnica Activada (Receta)" : "Reventa Directa (Sin Ficha)"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEsBebidaPreparada(false);
                          setTipoElaboracion("base");
                          setForm(prev => ({ ...prev, adiciones: [] }));
                        }}
                        className={`p-2.5 rounded-xl text-left transition border cursor-pointer ${
                          !esBebidaPreparada
                            ? "bg-white dark:bg-gray-900 border-purple-400 dark:border-purple-500 shadow-2xs ring-1 ring-purple-400/30"
                            : "bg-purple-100/30 dark:bg-purple-900/10 border-transparent hover:bg-white/50"
                        }`}
                      >
                        <p className="text-xs font-bold text-gray-900 dark:text-gray-100">Bebida Comercial / Reventa</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">Agua, gaseosas, botellas, latas. No requiere ficha técnica culinaria.</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEsBebidaPreparada(true);
                          setTipoElaboracion("preparado");
                        }}
                        className={`p-2.5 rounded-xl text-left transition border cursor-pointer ${
                          esBebidaPreparada
                            ? "bg-white dark:bg-gray-900 border-purple-400 dark:border-purple-500 shadow-2xs ring-1 ring-purple-400/30"
                            : "bg-purple-100/30 dark:bg-purple-900/10 border-transparent hover:bg-white/50"
                        }`}
                      >
                        <p className="text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1">
                          <span>Bebida Especial / Preparada</span>
                        </p>
                        <p className="text-[10px] text-gray-500 mt-0.5">Batidos, malteadas, smoothies, jugos naturales. Sí lleva ficha técnica.</p>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Grid Principal Paso 1: Izquierda (Imagen & Preview) + Derecha (Campos de entrada) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Columna Izquierda: Foto y Vista Previa en Vivo (4 columnas) */}
                <div className="lg:col-span-5 space-y-3">
                  <label className={labelCls}>Fotografía y Vista en Menú</label>
                  
                  <div className="bg-gray-50/80 dark:bg-gray-800/40 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
                    <div 
                      onClick={() => !uploading && fileInputRef.current?.click()}
                      className="relative aspect-video rounded-2xl bg-white dark:bg-gray-900 overflow-hidden border-2 border-dashed border-gray-200 hover:border-[#F05454]/60 dark:border-gray-700 dark:hover:border-[#F05454]/60 flex items-center justify-center group shadow-2xs cursor-pointer transition-all"
                      title="Haz clic para seleccionar o cambiar imagen"
                    >
                      {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                          <FoodIcon name={configCombo.esCombo ? "combo" : isDrink ? "drink" : "burger"} size={42} />
                          <span className="text-xs font-bold mt-2 text-gray-700 dark:text-gray-200">Sin fotografía</span>
                          <span className="text-[11px] text-[#F05454] font-medium mt-0.5">Haz clic aquí para cargar imagen</span>
                        </div>
                      )}

                      {/* Botón flotante para cambiar foto al pasar cursor */}
                      <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="px-3.5 py-1.5 bg-white text-gray-900 rounded-xl text-xs font-bold shadow-md hover:bg-gray-100 transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5 text-[#F05454]" />
                          <span>{previewUrl ? "Cambiar Foto" : "Subir Foto"}</span>
                        </button>
                        {previewUrl && (
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="p-1.5 bg-red-600 text-white rounded-xl text-xs hover:bg-red-700 transition cursor-pointer"
                            title="Quitar foto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                      >
                        {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#F05454]" /> : <UploadCloud className="w-3.5 h-3.5 text-[#F05454]" />}
                        <span>{uploading ? "Subiendo..." : previewUrl ? "Cambiar Imagen" : "Cargar Imagen"}</span>
                      </button>
                      <span className="text-[10px] text-gray-400">JPG, PNG o WEBP (Máx. 5MB)</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleImageSelected}
                      />
                    </div>

                    {/* Simulación en vivo de cómo lo ve el cliente */}
                    <div className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-150 dark:border-gray-750 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                          {form.categoria || "Categoría"}
                        </span>
                        <span className="text-xs font-mono font-black text-[#F05454]">
                          {Number(form.precio) > 0 ? `$${Number(form.precio).toLocaleString("es-CO")} COP` : "$0 COP"}
                        </span>
                      </div>
                      <p className="font-extrabold text-sm text-gray-900 dark:text-gray-100 truncate">
                        {form.nombre || "Nombre de tu producto..."}
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2">
                        {form.descripcion || "Tu descripción apetitosa aparecerá aquí para los comensales."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Columna Derecha: Campos de Formulario (7 columnas) */}
                <div className="lg:col-span-7 space-y-4">
                  
                  {/* Nombre del Producto */}
                  <div>
                    <label className={`${labelCls} flex items-center justify-between`}>
                      <span>
                        Nombre del Producto <span className="text-red-500">*</span>
                      </span>
                      {tieneVentasProtegido && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 rounded-full">
                          <Lock className="w-2.5 h-2.5" /> Protegido por ventas
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      required
                      disabled={tieneVentasProtegido}
                      value={form.nombre}
                      onBlur={() => handleBlur("nombre")}
                      onChange={(e) => handleChange("nombre", e.target.value)}
                      className={`${inputCls} ${
                        tieneVentasProtegido
                          ? "bg-gray-100 dark:bg-gray-800/70 text-gray-500 cursor-not-allowed border-amber-200"
                          : (touched.nombre || submitted) && errors.nombre
                          ? "border-red-500 bg-red-50/50 text-red-900 focus:ring-red-400"
                          : ""
                      }`}
                      placeholder={configCombo.esCombo ? "Ej. Combo Pareja Salvaje" : isDrink ? "Ej. Gaseosa Coca-Cola 400ml" : "Ej. Hamburguesa Doble Queso"}
                    />
                    {(touched.nombre || submitted) && errors.nombre && (
                      <p className="flex items-center gap-1 text-[11px] text-red-500 mt-1 font-medium">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {errors.nombre}
                      </p>
                    )}
                  </div>

                  {/* Categoría y Estado en 2 columnas */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>
                        Categoría <span className="text-red-500">*</span>
                      </label>
                      <select
                        disabled={tieneVentasProtegido}
                        value={form.categoria}
                        onChange={(e) => {
                          const selectedName = e.target.value;
                          const catObj = (categorias || []).find(c => c.nombre === selectedName);
                          const isComboCat = selectedName.toLowerCase().includes("combo");
                          const isDrinkCat = selectedName.toLowerCase().includes("bebida") ||
                            selectedName.toLowerCase().includes("gaseos") ||
                            selectedName.toLowerCase().includes("refresco") ||
                            selectedName.toLowerCase().includes("jugo") ||
                            selectedName.toLowerCase().includes("cerveza") ||
                            catObj?.id === 4 || catObj?.idCategoriaProducto === 4;

                          setForm({
                            ...form,
                            categoria: selectedName,
                            idCategoriaProducto: catObj?.id || catObj?.idCategoriaProducto || null
                          });
                          if (isComboCat) {
                            setConfigCombo(prev => ({ ...prev, esCombo: true }));
                            setModoVariantesManual(null);
                          } else if (isDrinkCat) {
                            setModoVariantesManual("bebida");
                            setConfigCombo(prev => ({ ...prev, esCombo: false }));
                          } else {
                            setModoVariantesManual("comida");
                            setConfigCombo(prev => ({ ...prev, esCombo: false }));
                          }
                        }}
                        className={`${inputCls} ${
                          tieneVentasProtegido ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""
                        }`}
                      >
                        {categorias.map((c) => (
                          <option key={c.id || c.idCategoriaProducto || c.nombre} value={c.nombre}>
                            {c.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={labelCls}>Estado de Venta</label>
                      <select
                        value={form.estado}
                        onChange={(e) => setForm({ ...form, estado: e.target.value })}
                        className={inputCls}
                      >
                        <option value="Activo">🟢 Activo (Visible en Menú)</option>
                        <option value="Inactivo">🔴 Inactivo (Pausado)</option>
                      </select>
                    </div>
                  </div>

                  {/* Precio de Venta Base */}
                  <div>
                    <label className={labelCls}>
                      Precio de Venta Base ($ COP) <span className="text-red-500">*</span>
                    </label>
                    <NumberInput
                      required
                      min="0"
                      step={1000}
                      formatThousands={true}
                      value={form.precio}
                      onBlur={() => handleBlur("precio")}
                      onChange={(e) => handleMainPriceChange(e.target.value)}
                      className={`${inputCls} font-mono font-bold text-base ${
                        (touched.precio || submitted) && errors.precio
                          ? "border-red-500 bg-red-50/50 text-red-900 focus:ring-red-400"
                          : ""
                      }`}
                      placeholder="Ej. 18.000"
                    />
                    {(touched.precio || submitted) && errors.precio && (
                      <p className="flex items-center gap-1 text-[11px] text-red-500 mt-1 font-medium">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {errors.precio}
                      </p>
                    )}

                    {/* REQUERIMIENTO 5: Precio de venta sugerido cargado en la sección Datos & Tipo */}
                    {!configCombo.esCombo && (precioReferenciaSugerido > 0 || costoTotalInsumos > 0) && (
                      <div className="mt-2.5 p-3 bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/90 dark:border-amber-800/60 rounded-xl flex items-center justify-between gap-2 animate-in fade-in duration-150">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center text-amber-700 dark:text-amber-300 shrink-0">
                            <Calculator className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-amber-900 dark:text-amber-200 truncate">
                              Precio Sugerido según Ficha Técnica:
                            </p>
                            <p className="text-[11px] text-amber-700 dark:text-amber-400">
                              Costo insumos: <span className="font-semibold font-mono">${costoTotalInsumos.toLocaleString("es-CO")} COP</span> &bull; Sugerido: <span className="font-bold font-mono text-amber-900 dark:text-amber-100">${precioReferenciaSugerido.toLocaleString("es-CO")} COP</span>
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            handleMainPriceChange(String(precioReferenciaSugerido));
                            notify.success("Precio Aplicado", `Se cargó el precio sugerido de $${precioReferenciaSugerido.toLocaleString("es-CO")} COP.`);
                          }}
                          className="shrink-0 text-xs font-bold px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition cursor-pointer shadow-xs flex items-center gap-1"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Usar Sugerido</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Descripción */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className={labelCls}>Descripción del Platillo (Opcional)</label>
                      <span className={`text-[10px] ${form.descripcion?.length > 500 ? "text-red-500 font-bold" : "text-gray-400"}`}>
                        {form.descripcion?.length || 0}/500
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={form.descripcion}
                      onBlur={() => handleBlur("descripcion")}
                      onChange={(e) => handleChange("descripcion", e.target.value)}
                      className={`${inputCls} resize-none ${
                        (touched.descripcion || submitted) && errors.descripcion
                          ? "border-red-500 bg-red-50/50 text-red-900 focus:ring-red-400"
                          : ""
                      }`}
                      placeholder="Describe los ingredientes principales, preparación o por qué a los clientes les encanta..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PASO 2: FICHA TÉCNICA (O ARMADOR DE COMBO) - REQUERIMIENTO 1 & 2           */}
          {/* ========================================================================= */}
          {activeStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {configCombo.esCombo ? (
                /* CASO A: ARMADOR DE COMBO GASTRONÓMICO (Paso 2 para combos) */
                <div className="space-y-5">
                  <div className="p-4 bg-blue-50/70 dark:bg-blue-950/30 rounded-2xl border border-blue-200/80 dark:border-blue-900/50 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0 mt-0.5">
                      <FoodIcon name="combo" size={20} />
                    </div>
                    <div className="space-y-0.5 text-xs">
                      <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                        Armador de Combo Gastronómico
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        Selecciona los platillos existentes que componen este paquete. El cliente recibirá todo en una sola orden con precio promocional.
                      </p>
                    </div>
                  </div>

                  {/* 1. SELECCIÓN DE PRODUCTOS CON BUSCADOR INTUITIVO */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-extrabold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                        1. Platillos y Acompañamientos Incluidos:
                      </label>
                      <span className="text-[11px] font-black text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/60 px-2.5 py-0.5 rounded-full">
                        {totalUnidadesCombo} {totalUnidadesCombo === 1 ? "unidad" : "unidades"} en el combo
                      </span>
                    </div>

                    <div className="relative" ref={comboPickerRef}>
                      <div className="relative flex items-center">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                        <input
                          type="text"
                          value={busquedaComboProd}
                          onChange={(e) => {
                            setBusquedaComboProd(e.target.value);
                            setComboDropdownOpen(true);
                          }}
                          onFocus={() => setComboDropdownOpen(true)}
                          placeholder="Buscar producto para agregar al combo (ej. Hamburguesa, Perro, Papas)..."
                          className="w-full pl-10 pr-24 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition shadow-xs"
                        />
                        <div className="absolute right-2 flex items-center gap-1.5">
                          {busquedaComboProd && (
                            <button
                              type="button"
                              onClick={() => setBusquedaComboProd("")}
                              className="p-1 text-gray-400 hover:text-gray-600 text-xs rounded-full hover:bg-gray-100"
                              title="Limpiar"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setComboDropdownOpen(prev => !prev)}
                            className="px-2.5 py-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 rounded-xl flex items-center gap-1 cursor-pointer transition"
                          >
                            <span>{comboDropdownOpen ? "Cerrar" : "Catálogo"}</span>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${comboDropdownOpen ? "rotate-180" : ""}`} />
                          </button>
                        </div>
                      </div>

                      {/* Dropdown flotante */}
                      {comboDropdownOpen && (
                        <div className="absolute left-0 right-0 top-full mt-2 z-40 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in duration-150">
                          {categoriasProductosCatalogo.length > 2 && (
                            <div className="p-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
                              {categoriasProductosCatalogo.map(cat => (
                                <button
                                  key={cat}
                                  type="button"
                                  onClick={() => setFiltroCatCombo(cat)}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition shrink-0 cursor-pointer ${
                                    filtroCatCombo === cat
                                      ? "bg-blue-600 text-white shadow-xs"
                                      : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 border border-gray-200"
                                  }`}
                                >
                                  {cat === "todas" ? "Todos los productos" : cat}
                                </button>
                              ))}
                            </div>
                          )}

                          <div className="max-h-56 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800 p-1.5 space-y-1">
                            {productosComboFiltrados.length === 0 ? (
                              <div className="p-6 text-center text-gray-400 text-xs">
                                No se encontraron productos.
                              </div>
                            ) : (
                              productosComboFiltrados.map((prod) => {
                                const pId = prod.id || prod.idProducto;
                                const itemEnCombo = (configCombo.productosAsociados || []).find(
                                  (a) => String(a.idProducto || a.id) === String(pId)
                                );
                                return (
                                  <div
                                    key={pId}
                                    onClick={() => agregarProductoACombo(prod)}
                                    className={`flex items-center justify-between gap-3 p-2 rounded-xl cursor-pointer transition select-none ${
                                      itemEnCombo
                                        ? "bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200"
                                        : "hover:bg-gray-50 dark:hover:bg-gray-800"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 overflow-hidden">
                                        {prod.imagen && (prod.imagen.startsWith("http") || prod.imagen.startsWith("/")) ? (
                                          <img src={prod.imagen} alt={prod.nombre} className="w-full h-full object-cover" />
                                        ) : (
                                          <FoodIcon name={prod.categoria || prod.nombre} size={16} />
                                        )}
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
                                          {prod.nombre}
                                        </p>
                                        <span className="text-[10px] text-emerald-600 font-bold">
                                          ${Number(prod.precio || 0).toLocaleString("es-CO")} COP
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                      {itemEnCombo ? (
                                        <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-lg">
                                          {itemEnCombo.cantidad} en combo
                                        </span>
                                      ) : null}
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          agregarProductoACombo(prod);
                                        }}
                                        className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition cursor-pointer"
                                      >
                                        <Plus className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Lista de productos agregados al combo */}
                    {Array.isArray(configCombo.productosAsociados) && configCombo.productosAsociados.length > 0 ? (
                      <div className="space-y-2 pt-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {configCombo.productosAsociados.map((item, idx) => {
                            const itemSubtotal = (Number(item.precio || 0) * (item.cantidad || 1));
                            return (
                              <div
                                key={idx}
                                className="flex items-center justify-between gap-2.5 p-2.5 bg-white dark:bg-gray-900 rounded-2xl border border-blue-200 dark:border-blue-900/60 text-xs shadow-xs"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center shrink-0 overflow-hidden">
                                    {item.imagen && (item.imagen.startsWith("http") || item.imagen.startsWith("/")) ? (
                                      <img src={item.imagen} alt={item.nombre} className="w-full h-full object-cover" />
                                    ) : (
                                      <FoodIcon name={item.nombre} size={16} />
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <span className="font-bold text-gray-900 dark:text-gray-100 block truncate">
                                      {item.nombre}
                                    </span>
                                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                                      <span>${Number(item.precio || 0).toLocaleString("es-CO")} c/u</span>
                                      <span>=</span>
                                      <span className="font-bold text-blue-600 font-mono">
                                        ${itemSubtotal.toLocaleString("es-CO")}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-0.5 border border-gray-200 dark:border-gray-700">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const next = configCombo.productosAsociados.map((a, i) => i === idx ? { ...a, cantidad: Math.max(1, (a.cantidad || 1) - 1) } : a);
                                        setConfigCombo(prev => ({ ...prev, productosAsociados: next }));
                                      }}
                                      className="w-5 h-5 rounded-lg flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 font-bold cursor-pointer text-xs"
                                    >
                                      -
                                    </button>
                                    <span className="w-5 text-center font-bold text-xs text-gray-900 dark:text-gray-100">
                                      {item.cantidad || 1}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const next = configCombo.productosAsociados.map((a, i) => i === idx ? { ...a, cantidad: (a.cantidad || 1) + 1 } : a);
                                        setConfigCombo(prev => ({ ...prev, productosAsociados: next }));
                                      }}
                                      className="w-5 h-5 rounded-lg flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 font-bold cursor-pointer text-xs"
                                    >
                                      +
                                    </button>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const next = configCombo.productosAsociados.filter((_, i) => i !== idx);
                                      setConfigCombo(prev => ({ ...prev, productosAsociados: next }));
                                    }}
                                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg cursor-pointer"
                                    title="Quitar"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Comparación financiera y ahorro */}
                        <div className="p-3 bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-900/60 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs">
                          <div>
                            <p className="font-bold text-gray-900 dark:text-gray-100">
                              Suma por separado: <span className="font-mono text-blue-700 dark:text-blue-300 font-black">${subtotalProductosCombo.toLocaleString("es-CO")} COP</span>
                            </p>
                            <p className="text-[11px] text-gray-500">
                              {Number(form.precio) > 0 && Number(form.precio) < subtotalProductosCombo ? (
                                <span className="text-emerald-600 font-bold">
                                  ✓ El cliente ahorra ${(subtotalProductosCombo - Number(form.precio)).toLocaleString("es-CO")} COP ({Math.round(((subtotalProductosCombo - Number(form.precio)) / subtotalProductosCombo) * 100)}% de descuento).
                                </span>
                              ) : (
                                "Precio fijado del combo: $" + Number(form.precio || 0).toLocaleString("es-CO") + " COP"
                              )}
                            </p>
                          </div>
                          {subtotalProductosCombo > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setForm(prev => ({ ...prev, precio: subtotalProductosCombo }));
                                notify.success("Precio Aplicado", `Se fijó $${subtotalProductosCombo.toLocaleString("es-CO")} COP como precio del combo.`);
                              }}
                              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition cursor-pointer"
                            >
                              Usar suma como precio
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 rounded-2xl border border-dashed border-blue-200 dark:border-blue-900/60 bg-blue-50/30 text-center">
                        <Utensils className="w-6 h-6 mx-auto text-blue-400 mb-1" />
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                          Aún no has agregado productos al combo
                        </p>
                        <p className="text-[11px] text-gray-400">
                          Escribe en el buscador para añadir los platos que integran este combo especial.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 2. BEBIDAS INCLUIDAS EN EL COMBO */}
                  <div className="pt-3 border-t border-blue-150 dark:border-blue-900/40 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <label className="block text-xs font-extrabold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                          2. Bebidas a elección del cliente:
                        </label>
                        <p className="text-[11px] text-gray-500">
                          {configCombo.cantidadBebidas === 0
                            ? "✓ Este combo no incluye bebidas."
                            : `✓ El cliente elegirá ${configCombo.cantidadBebidas} bebida(s) incluida(s) en el precio ($0 COP).`}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {[0, 1, 2, 3].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setConfigCombo(prev => ({ ...prev, cantidadBebidas: num }))}
                            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                              (configCombo.cantidadBebidas ?? 1) === num
                                ? "bg-blue-600 text-white shadow-xs"
                                : "bg-white dark:bg-gray-800 text-gray-700 border border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            {num === 0 ? "0 (Sin bebida)" : num === 1 ? "1 Bebida" : `${num} Bebidas`}
                          </button>
                        ))}
                      </div>
                    </div>

                    {Number(configCombo.cantidadBebidas) > 0 && todasBebidas.length > 0 && (
                      <div className="bg-white dark:bg-gray-900 p-3 rounded-2xl border border-blue-150 space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-gray-700 dark:text-gray-300">
                            Bebidas permitidas ({todasBebidas.length} en catálogo):
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setConfigCombo(prev => ({ ...prev, bebidasPermitidas: [] }))}
                              className="font-bold text-blue-600 hover:underline cursor-pointer"
                            >
                              Permitir todas
                            </button>
                            <span className="text-gray-300">•</span>
                            <button
                              type="button"
                              onClick={() => {
                                const comunes = todasBebidas.filter(b => {
                                  const n = b.nombre.toLowerCase();
                                  return n.includes("coca") || n.includes("manzana") || n.includes("agua");
                                }).map(b => b.id || b.idProducto);
                                setConfigCombo(prev => ({ ...prev, bebidasPermitidas: comunes }));
                              }}
                              className="font-bold text-gray-500 hover:underline cursor-pointer"
                            >
                              Solo clásicas
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {todasBebidas.map((bebida) => {
                            const bId = bebida.id || bebida.idProducto;
                            const isAllowed = configCombo.bebidasPermitidas.length === 0 || configCombo.bebidasPermitidas.includes(bId);
                            return (
                              <button
                                key={bId}
                                type="button"
                                onClick={() => {
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
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition cursor-pointer select-none ${
                                  isAllowed
                                    ? "bg-blue-50 border-blue-400 text-blue-900 shadow-2xs"
                                    : "bg-gray-50 border-gray-200 text-gray-400 opacity-60"
                                }`}
                              >
                                <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-black ${
                                  isAllowed ? "bg-blue-600 text-white" : "border border-gray-300"
                                }`}>
                                  {isAllowed && "✓"}
                                </span>
                                <span>{bebida.nombre}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : tipoElaboracion === "base" ? (
                /* CASO B: FICHA TÉCNICA DE PRODUCTO BASE (REQUERIMIENTO 2) */
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-4 bg-purple-50/70 dark:bg-purple-950/20 rounded-2xl border border-purple-200/80 dark:border-purple-900/40 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <PackageCheck className="w-5 h-5" />
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-gray-900 dark:text-gray-100 text-sm">
                          Ficha Técnica de Producto Base / Terminado
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                          Reventa / Sin Preparación en Cocina
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        Este producto viene <strong>elaborado o envasado de fábrica por el proveedor</strong> (ej. gaseosas en botella o lata, agua envasada, salsas industriales compradas como BBQ, salsa roja o rosada en galón/pote, paquetes o snacks).
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3.5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-1.5 shadow-2xs">
                      <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                        Operación en Cocina
                      </span>
                      <p className="text-xs font-bold text-gray-900 dark:text-gray-100">
                        Sin receta culinaria
                      </p>
                      <p className="text-[11px] text-gray-500 leading-relaxed">
                        No consume ingredientes de receta ni requiere tiempo de preparación en cocina. Se despacha sellado.
                      </p>
                    </div>

                    <div className="p-3.5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-1.5 shadow-2xs">
                      <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                        Regla de Adiciones (Requerimiento 3)
                      </span>
                      <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                        Adiciones Desactivadas
                      </p>
                      <p className="text-[11px] text-gray-500 leading-relaxed">
                        Por ser un producto base cerrado o estándar, el sistema bloquea automáticamente la selección de adiciones.
                      </p>
                    </div>

                    <div className="p-3.5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-1.5 shadow-2xs">
                      <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                        Control de Inventario
                      </span>
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        Descuento 1 a 1 por Unidad
                      </p>
                      <p className="text-[11px] text-gray-500 leading-relaxed">
                        Cada venta descuenta directamente 1 unidad del producto o de la presentación comercial seleccionada.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-3">
                    <h5 className="text-xs font-black text-gray-800 dark:text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Info className="w-4 h-4 text-purple-600" />
                      Especificaciones de Almacenamiento & Manipulación Comercial
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                          Condiciones de Conservación / Almacén:
                        </label>
                        <input
                          type="text"
                          value={fichaTecnica?.condicionesAlmacenamiento || "Almacenar en lugar fresco, seco y protegido de la luz solar directa."}
                          onChange={(e) => setFichaTecnica(prev => ({ ...prev, condicionesAlmacenamiento: e.target.value }))}
                          className={inputCls}
                          placeholder="Ej. Mantener refrigerado entre 2°C y 6°C"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                          Vida Útil / Rotación Comercial:
                        </label>
                        <input
                          type="text"
                          value={fichaTecnica?.vidaUtil || "Según fecha de vencimiento impresa por el fabricante"}
                          onChange={(e) => setFichaTecnica(prev => ({ ...prev, vidaUtil: e.target.value }))}
                          className={inputCls}
                          placeholder="Ej. 6 meses a partir de la fecha de envasado"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* CASO C: PRODUCTO PREPARADO (EDITOR COMPLETO DE FICHA TÉCNICA) */
                <div className="space-y-4">
                  <div className="p-4 bg-orange-50/70 dark:bg-orange-950/20 rounded-2xl border border-orange-200/80 dark:border-orange-900/40 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-900/60 text-orange-600 dark:text-orange-300 flex items-center justify-center shrink-0 mt-0.5">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5 text-xs">
                      <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                        {isDrink ? "Ficha Técnica de Bebida Especial / Preparada (Paso 2 de 4)" : "Ficha Técnica Oficial del Producto (Paso 2 de 4)"}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {isDrink
                          ? "Configura la receta (leche, fruta, jarabes, hielo), fases de elaboración y costos reales de este batido o bebida especial."
                          : "Configura los ingredientes / insumos necesarios con sus cantidades, las fases de preparación, tiempo, porciones y costos reales."}
                      </p>
                    </div>
                  </div>

                  <FichaTecnicaProducto
                    productId={producto?.id || producto?.idProducto}
                    productName={form.nombre}
                    initialData={fichaTecnica || producto?.fichaTecnica || null}
                    entityData={entityDataActual}
                    prevEntityData={prevEntityDataInicial}
                    onRestoreEntityData={handleRestoreEntityData}
                    onPrecioSugeridoChange={(sug) => {
                      setPrecioSugeridoLive(sug);
                    }}
                    onChange={(data) => {
                      setFichaTecnica(data);
                      if (data?.precioSugerido) {
                        setPrecioSugeridoLive(data.precioSugerido);
                      }
                    }}
                    onSave={(data) => {
                      setFichaTecnica(data);
                      notify.success("Ficha Técnica Actualizada", "Los datos de la receta fueron sincronizados con el producto.");
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* PASO 3: PRESENTACIONES & VARIANTES (REQUERIMIENTO 1)                       */}
          {/* ========================================================================= */}
          {activeStep === 3 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              
              {/* Encabezado Explicativo */}
              <div className="p-4 bg-orange-50/70 dark:bg-orange-950/20 rounded-2xl border border-orange-200/80 dark:border-orange-900/40 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="space-y-0.5 text-xs">
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                    {isDrink ? "Configuración de Tamaños y Sabores de Bebida" : "Presentaciones y Variantes de la Comida"}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Las variantes representan opciones que el cliente puede elegir (como porciones, sabores o tamaños de botella). Usan por defecto el precio base del Paso 1, pero puedes editar un precio personalizado y configurar su propia receta/insumos al desplegar cada variante.
                  </p>
                </div>
              </div>

              {/* Si es Combo Especial: no lleva variantes ya que agrupa productos */}
              {configCombo.esCombo ? (
                <div className="p-8 text-center bg-blue-50/40 dark:bg-blue-950/20 rounded-3xl border border-blue-200/80 dark:border-blue-900/40 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 flex items-center justify-center mx-auto">
                    <FoodIcon name="combo" size={28} />
                  </div>
                  <div className="max-w-md mx-auto space-y-1">
                    <h4 className="font-extrabold text-sm text-gray-900 dark:text-gray-100">
                      Los Combos no requieren variantes manuales
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      Un combo es una combinación de productos individuales del catálogo. La configuración de qué platillos y bebidas incluye se realiza directamente en el <strong>Paso 2 (Armador de Combo)</strong>.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveStep(2)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                  >
                    <span>Ir al Armador de Combo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : isDrink ? (
                /* Modo Bebidas (2 Paneles: Tamaños y Sabores) */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Panel Tamaños */}
                  <div className="border border-amber-200/90 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/10 rounded-2xl p-4 space-y-3 shadow-2xs flex flex-col">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 text-xs font-black flex items-center justify-center">
                          {sizeVariantes.length}
                        </span>
                        <h4 className="font-bold text-xs text-gray-900 dark:text-gray-100">
                          Tamaños y Botellas
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddTamano()}
                        className="px-2.5 py-1 bg-white dark:bg-gray-800 hover:bg-amber-50 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Agregar Tamaño</span>
                      </button>
                    </div>

                    {/* Sugerencias Rápidas */}
                    <div className="flex flex-wrap gap-1 text-[10px]">
                      <span className="text-gray-400 font-semibold mr-1">Rápidos:</span>
                      {["Personal 400ml", "1.5 Litros", "Mega 2.5L"].map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => handleAddTamano(sug)}
                          className="px-2 py-0.5 rounded-md bg-white dark:bg-gray-800 border border-amber-200 hover:border-amber-400 text-amber-800 dark:text-amber-200 font-medium transition cursor-pointer"
                        >
                          +{sug}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-2 flex-1 overflow-y-auto max-h-[34rem] pr-1">
                      {sizeVariantes.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 border border-dashed border-amber-200 rounded-xl">
                          <p className="text-xs">No hay tamaños adicionales.</p>
                          <p className="text-[10px] text-gray-400">Se venderá en presentación estándar.</p>
                        </div>
                      ) : (
                        sizeVariantes.map((v, idx) => renderVariantRow(v, idx, "tamano"))
                      )}
                    </div>
                  </div>

                  {/* Panel Sabores */}
                  <div className="border border-purple-200/90 dark:border-purple-900/50 bg-purple-50/30 dark:bg-purple-950/10 rounded-2xl p-4 space-y-3 shadow-2xs flex flex-col">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-800 text-xs font-black flex items-center justify-center">
                          {flavorVariantes.length}
                        </span>
                        <h4 className="font-bold text-xs text-gray-900 dark:text-gray-100">
                          Sabores y Alternativas
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddSabor()}
                        className="px-2.5 py-1 bg-white dark:bg-gray-800 hover:bg-purple-50 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700 rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Agregar Sabor</span>
                      </button>
                    </div>

                    {/* Sugerencias Rápidas */}
                    <div className="flex flex-wrap gap-1 text-[10px]">
                      <span className="text-gray-400 font-semibold mr-1">Rápidos:</span>
                      {["Original", "Sin Azúcar / Zero", "Manzana", "Uva"].map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => handleAddSabor(sug)}
                          className="px-2 py-0.5 rounded-md bg-white dark:bg-gray-800 border border-purple-200 hover:border-purple-400 text-purple-800 dark:text-purple-200 font-medium transition cursor-pointer"
                        >
                          +{sug}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-2 flex-1 overflow-y-auto max-h-[34rem] pr-1">
                      {flavorVariantes.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 border border-dashed border-purple-200 rounded-xl">
                          <p className="text-xs">No hay sabores adicionales.</p>
                          <p className="text-[10px] text-gray-400">Se venderá en sabor clásico.</p>
                        </div>
                      ) : (
                        flavorVariantes.map((v, idx) => renderVariantRow(v, idx, "sabor"))
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Modo Comida (Presentaciones del Plato) */
                <div className="border border-orange-200/80 dark:border-orange-900/40 bg-orange-50/20 dark:bg-orange-950/10 rounded-2xl p-5 space-y-4 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                          Presentaciones Disponibles del Plato
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-orange-100 text-orange-700">
                          {variantes.length} {variantes.length === 1 ? "presentación" : "presentaciones"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Opciones que el comensal puede elegir al momento de ordenar.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleAddVariante()}
                        className="px-3 py-1.5 bg-[#F05454] hover:bg-[#d84343] text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Añadir Presentación</span>
                      </button>
                    </div>
                  </div>

                  {/* Sugerencias rápidas de comida */}
                  <div className="flex flex-wrap items-center gap-1.5 p-2 bg-white dark:bg-gray-800 rounded-xl border border-orange-150 text-xs">
                    <span className="text-[11px] font-bold text-gray-500 flex items-center gap-1">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Ejemplos frecuentes:
                    </span>
                    {["Original / Clásica", "BBQ Ahumada", "Picante / Jalapeño", "Grande", "Doble", "Familiar"].map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => handleAddVariante(sug)}
                        className="px-2.5 py-1 rounded-lg bg-orange-50 dark:bg-orange-950/60 hover:bg-orange-100 text-orange-800 dark:text-orange-200 text-[11px] font-semibold transition cursor-pointer"
                      >
                        +{sug}
                      </button>
                    ))}
                  </div>

                  {/* Lista de Variantes de Comida */}
                  <div className="space-y-2.5 max-h-[34rem] overflow-y-auto pr-1">
                    {variantes.length === 0 ? (
                      <div className="text-center py-10 px-4 rounded-2xl border border-dashed border-orange-200 dark:border-orange-900/60 bg-white/60 dark:bg-gray-850">
                        <FoodIcon name="burger" size={32} className="mx-auto mb-2 text-orange-400" />
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                          Sin variantes adicionales
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          El producto se ofrecerá con su presentación estándar y precio base. Si deseas ofrecer sabores o presentaciones distintas (como "BBQ Ahumada" o "Familiar"), haz clic en el botón superior.
                        </p>
                      </div>
                    ) : (
                      variantes.map((v, idx) => renderVariantRow(v, idx, "general"))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* PASO 4: ADICIONES PERMITIDAS (REQUERIMIENTO 1 & 3)                         */}
          {/* ========================================================================= */}
          {activeStep === 4 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {tipoElaboracion === "base" ? (
                /* REQUERIMIENTO 3: ADICIONES DESACTIVADAS PARA PRODUCTO BASE */
                <div className="p-8 text-center bg-gray-50 dark:bg-gray-800/40 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-xs">
                    <Lock className="w-7 h-7" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1.5">
                    <h4 className="font-extrabold text-base text-gray-900 dark:text-gray-100">
                      Adiciones Desactivadas para Producto Base
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      Al haber clasificado este ítem como <strong>Producto Base / Terminado</strong> (gaseosas embotelladas, salsas industriales, snacks empacados), el producto se comercializa tal como viene del fabricante y no admite adiciones ni extras en el pedido.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-100/80 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 text-xs font-bold">
                    <span>✓ Configuración conforme a normas gastronómicas</span>
                  </div>
                </div>
              ) : (
                /* PRODUCTO PREPARADO: ADICIONES PERMITIDAS */
                /* CASO B: ADICIONES DISPONIBLES PARA PRODUCTO REGULAR */
                <div className="space-y-4">
                  
                  {/* Encabezado con Contador y Acciones */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-red-50/50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/40">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-900/50 text-[#F05454] flex items-center justify-center font-bold text-xs">
                        {form.adiciones?.length || 0}
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                          Adiciones Permitidas al Comensal
                        </h4>
                        <p className="text-[11px] text-gray-500">
                          {form.adiciones?.length || 0} seleccionadas de {todasAdiciones.length} registradas en el restaurante.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {todasAdiciones.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const allSelected = todasAdiciones.every(ad =>
                              form.adiciones.some(a => (a.idAdicion || a.id || a) === (ad.idAdicion || ad.id))
                            );
                            if (allSelected) {
                              setForm({ ...form, adiciones: [] });
                            } else {
                              setForm({
                                ...form,
                                adiciones: todasAdiciones.map(a => ({
                                  idAdicion: a.idAdicion || a.id,
                                  nombre: a.nombre,
                                  precio: Number(a.precio || 0),
                                  imagen: a.imagen || ''
                                }))
                              });
                            }
                          }}
                          className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-[#F05454] rounded-xl hover:bg-gray-50 transition shadow-2xs cursor-pointer"
                        >
                          {todasAdiciones.every(ad => form.adiciones.some(a => (a.idAdicion || a.id || a) === (ad.idAdicion || ad.id)))
                            ? "Desmarcar todas"
                            : "Seleccionar todas"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Buscador de adiciones para no tener que hacer scroll infinito */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={busquedaAdicion}
                      onChange={(e) => setBusquedaAdicion(e.target.value)}
                      placeholder="Filtrar adiciones por nombre (ej. Queso, Tocineta, Salsas, Papas)..."
                      className="w-full pl-9 pr-8 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F05454]/40 transition"
                    />
                    {busquedaAdicion && (
                      <button
                        type="button"
                        onClick={() => setBusquedaAdicion("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Grid de Adiciones Compacto y Elegante */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
                    {adicionesFiltradas.length === 0 ? (
                      <div className="col-span-full py-8 text-center text-gray-400 text-xs">
                        No se encontraron adiciones con ese término.
                      </div>
                    ) : (
                      adicionesFiltradas.map((adicion) => {
                        const adId = adicion.idAdicion || adicion.id;
                        const isSelected = form.adiciones.some((a) => (a.idAdicion || a.id || a) === adId);
                        return (
                          <label
                            key={adId}
                            className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition select-none ${
                              isSelected 
                                ? "border-[#F05454] bg-red-50/70 dark:bg-red-950/30 shadow-2xs" 
                                : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/60"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleAdicion(adicion)}
                              className="rounded text-[#F05454] focus:ring-[#F05454] cursor-pointer"
                            />
                            <span className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm shrink-0 border border-gray-200/60 overflow-hidden">
                              {adicion.imagen && (adicion.imagen.startsWith("http") || adicion.imagen.startsWith("/")) ? (
                                <img src={adicion.imagen} alt={adicion.nombre} className="w-full h-full object-cover" />
                              ) : (
                                <FoodIcon name={adicion.nombre} size={16} />
                              )}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
                                {adicion.nombre}
                              </p>
                              <p className="text-[11px] text-[#F05454] font-semibold font-mono">
                                +${Number(adicion.precio).toLocaleString('es-CO')}
                              </p>
                            </div>
                          </label>
                        );
                      })
                    )}
                  </div>

                </div>
              )}
            </div>
          )}

          {/* Footer de Navegación y Guardado */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 mt-6 border-t border-gray-100 dark:border-gray-800 shrink-0">
            
            {/* Resumen rápido en vivo */}
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="font-extrabold text-gray-900 dark:text-gray-100 truncate max-w-[140px]">
                {form.nombre || "Sin nombre"}
              </span>
              <span>•</span>
              <span className="font-mono font-black text-[#F05454]">
                {Number(form.precio) > 0 ? `$${Number(form.precio).toLocaleString("es-CO")}` : "$0"}
              </span>
              <span>•</span>
              <span className="font-semibold text-gray-600 dark:text-gray-300">
                {configCombo.esCombo
                  ? `Combo (${configCombo.productosAsociados?.length || 0} platos)`
                  : tipoElaboracion === "base"
                  ? `Base (${variantes.length} opciones • Sin adic.)`
                  : `${variantes.length} var. • ${form.adiciones?.length || 0} adic. • ${fichaTecnica?.detalles?.length || fichaTecnica?.insumos?.length || 0} insumos`}
              </span>
            </div>

            {/* Controles de Acción */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleCancelOrClose}
                className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>

              {activeStep > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    if (isCommercialDrink && activeStep === 3) {
                      setActiveStep(1);
                    } else {
                      setActiveStep(prev => prev - 1);
                    }
                  }}
                  className="px-3.5 py-2 text-xs font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 rounded-xl transition cursor-pointer shadow-2xs flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Anterior</span>
                </button>
              )}

              {/* Botón Siguiente */}
              {((configCombo.esCombo && activeStep < 2) || (isCommercialDrink && activeStep === 1) || (!configCombo.esCombo && !isCommercialDrink && activeStep < 4)) && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeStep === 1) {
                      setTouched({ nombre: true, precio: true });
                      const nameErr = validateField("nombre", form.nombre);
                      const priceErr = validateField("precio", form.precio);
                      if (nameErr || priceErr) {
                        setErrors({ nombre: nameErr, precio: priceErr });
                        notify.warning("Datos Incompletos", "Por favor ingresa el nombre y precio del producto.");
                        return;
                      }
                      if (configCombo.esCombo) {
                        setActiveStep(2);
                        return;
                      }
                      if (isCommercialDrink) {
                        setActiveStep(3); // Salta directo al paso de sabores/presentaciones
                        return;
                      }
                      setActiveStep(2);
                      return;
                    }
                    if (activeStep === 2) {
                      if (configCombo.esCombo) return;
                      setActiveStep(3);
                      return;
                    }
                    if (activeStep === 3) {
                      if (isCommercialDrink) return;
                      setActiveStep(4);
                      return;
                    }
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#F05454] hover:bg-[#d84343] rounded-xl transition cursor-pointer shadow-xs flex items-center gap-1"
                >
                  <span>
                    {activeStep === 1
                      ? (configCombo.esCombo ? "Ir a Armador de Combo" : isCommercialDrink ? "Ir a Sabores & Tamaños (Opcional)" : "Ir a Ficha Técnica")
                      : activeStep === 2
                      ? "Ir a Variantes"
                      : "Ir a Adiciones"}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Botón Guardar / Crear: Destacado en el paso final */}
              <button
                type="submit"
                disabled={uploading}
                className={`px-5 py-2 text-xs font-bold text-white rounded-xl transition cursor-pointer shadow-xs flex items-center gap-1.5 disabled:opacity-50 ${
                  (configCombo.esCombo && activeStep === 2) || (isCommercialDrink) || (!configCombo.esCombo && activeStep === 4)
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : isStep1Valid
                    ? "bg-gray-900 hover:bg-black dark:bg-gray-100 dark:text-gray-900"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {uploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 stroke-[3]" />
                )}
                <span>{isCloning ? "Crear Copia del Producto" : isEditing ? "Guardar Cambios" : "Crear Producto"}</span>
              </button>
            </div>
          </div>
        </form>

        {/* ========================================================================= */}
        {/* REQUERIMIENTO 7: MODAL DE CONFIRMACIÓN ANTES DE GUARDAR NUEVA VERSIÓN       */}
        {/* ========================================================================= */}
        {showConfirmVersionModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-lg w-full border border-gray-100 dark:border-gray-800 p-6 space-y-5 animate-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
                  <AlertCircle className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900 dark:text-gray-100">
                    ¿Confirmas guardar esta nueva versión?
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Revisión de datos para evitar generar versiones erróneas
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-amber-50/80 dark:bg-amber-950/30 rounded-2xl border border-amber-200/80 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 leading-relaxed space-y-1.5">
                <p className="font-bold">
                  ⚠️ Al guardar los cambios, el sistema archivará la versión actual y generará una nueva versión histórica del producto.
                </p>
                <p className="text-amber-800 dark:text-amber-300">
                  Por favor verifica que el precio, descripción, variantes e insumos sean definitivos antes de confirmar. Si necesitas corregir algún dato, presiona <strong>"Revisar Información"</strong>.
                </p>
              </div>

              {/* Resumen de Datos Clave */}
              <div className="bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-4 border border-gray-200/80 dark:border-gray-700 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-gray-200/60 dark:border-gray-700/60">
                  <span className="text-gray-500">Producto:</span>
                  <span className="font-bold text-gray-900 dark:text-gray-100 truncate max-w-[200px]">{form.nombre}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-200/60 dark:border-gray-700/60">
                  <span className="text-gray-500">Precio de Venta:</span>
                  <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
                    ${Number(form.precio || 0).toLocaleString("es-CO")} COP
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-200/60 dark:border-gray-700/60">
                  <span className="text-gray-500">Modalidad:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {configCombo.esCombo ? "Combo Especial" : tipoElaboracion === "base" ? "Producto Base (Terminado)" : "Producto Preparado"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-200/60 dark:border-gray-700/60">
                  <span className="text-gray-500">Versión:</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">
                    v{versionActualNum.toFixed(1)} ➔ v{(versionActualNum + 0.1).toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">Variantes / Adiciones:</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {variantes.length} variantes • {tipoElaboracion === "base" ? "0 adiciones (Base)" : `${form.adiciones?.length || 0} adiciones`}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmVersionModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                >
                  Revisar Información (Cancelar)
                </button>
                <button
                  type="button"
                  onClick={executeActualSave}
                  disabled={uploading}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Confirmar y Guardar Versión</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default ProductoModal;
