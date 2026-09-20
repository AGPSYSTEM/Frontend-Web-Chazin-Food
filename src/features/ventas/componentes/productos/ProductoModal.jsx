import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { X, Utensils, UploadCloud, Loader2, Plus, Trash2, Layers, Camera, Sparkles, Lightbulb } from "lucide-react";
import { NumberInput } from "@/shared/components/ui/NumberInput";
import { FichaTecnicaProducto } from "@/features/fichas-tecnicas/componentes/FichaTecnicaProducto";
import { adicionesService } from "@/features/compras/servicios/adicionesService";
import { productosService } from "@/features/ventas/servicios/productosService";
import { getAdditionEmoji } from "@/shared/utils/foodEmojiUtils";
import { FoodIcon, FoodIconBadge } from "@/shared/components/ui/FoodIcon";
import { uploadImageToCloudinary, deleteImageFromCloudinary } from "@/shared/servicios/cloudinaryService";
import { useNotifications } from "@/shared/hooks/useNotifications";

export const isSizeVariantName = (name = "") => {
  const vn = String(name || "").toLowerCase();
  return (
    (vn.includes("1.5") || vn.includes("1,5") || vn.includes("2.5") || vn.includes("2,5") || vn.includes("mega") || vn.includes("botella 1.") || vn.includes("botella 2.") || vn.includes("familiar") || vn.includes("litro") || vn.includes("personal") || vn.includes("grande") || vn.includes("mediana") || vn.includes("pequeña")) &&
    !vn.includes("sin azúcar") && !vn.includes("sin azucar") && !vn.includes("light") && !vn.includes("zero") && !vn.includes("black")
  );
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
    if (pn.includes("coca")) return "https://res.cloudinary.com/dckwtknmq/image/upload/v1789342941/rcxdoursw1roe9f8bmpw.png";
    if (pn.includes("pepsi")) return "https://res.cloudinary.com/dckwtknmq/image/upload/v1789872832/akjyapmemvunluyjl0vo.png";
    return "https://res.cloudinary.com/dckwtknmq/image/upload/v1789342941/rcxdoursw1roe9f8bmpw.png";
  }
  if (fn.includes("uva")) return "/images/drinks/uva_postobon-removebg-preview.png";
  if (fn.includes("naranja")) return "/images/drinks/images__Gaseosa_naranja_-removebg-preview.png";
  if (fn.includes("manzana")) return "https://res.cloudinary.com/dckwtknmq/image/upload/v1788966650/qgto4wgmnjpfrns3zl8c.jpg";
  if (fn.includes("colombiana")) return "https://res.cloudinary.com/dckwtknmq/image/upload/v1789001495/qy8wy9igmgb0wppnjavw.png";
  return "";
};

const inputCls = "w-full px-4 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-[#F05454] focus:border-transparent transition-colors text-sm";
const labelCls = "block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1";

export function ProductoModal({ isOpen, onClose, onSave, producto = null, categorias = [] }) {
  const notify = useNotifications();
  const isEditing = !!producto;
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
  const [todasAdiciones, setTodasAdiciones] = useState([]);
  const [todasBebidas, setTodasBebidas] = useState([]);
  const [configCombo, setConfigCombo] = useState({
    esCombo: false,
    cantidadBebidas: 1,
    bebidasPermitidas: []
  });
  const [fichaTecnica, setFichaTecnica] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [modoVariantesManual, setModoVariantesManual] = useState(null); // null = automático, "bebida", "comida"
  const fileInputRef = useRef(null);

  const handleCancelOrClose = () => {
    // Limpiar archivo seleccionado y previsualización local sin haber subido nada a Cloudinary
    setFileToUpload(null);
    setPreviewUrl("");
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
    setFileToUpload(null);
    setPreviewUrl(producto?.imagen || "");
    setModoVariantesManual(null);

    // Cargar adiciones
    adicionesService.getAdiciones().then(setTodasAdiciones).catch(console.error);

    // Cargar catálogo de bebidas para asociar al combo
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
        dLower.includes("+ bebida") ||
        dLower.includes("bebida a elección") ||
        dLower.includes("gaseosa a elección");

      let defaultCant = 1;
      if (pLower.includes("familiar") || pLower.includes("4 personas")) defaultCant = 4;
      else if (pLower.includes("pareja") || pLower.includes("amigos") || pLower.includes("2 personas") || pLower.includes("duo")) defaultCant = 2;

      let parsedConfig = producto.configuracionCombo;
      if (typeof parsedConfig === "string") {
        try { parsedConfig = JSON.parse(parsedConfig); } catch (e) { parsedConfig = null; }
      }

      setConfigCombo(parsedConfig || {
        esCombo: isAutoCombo,
        cantidadBebidas: defaultCant,
        bebidasPermitidas: []
      });

      // Inicializar variantes existentes si tiene registradas
      const rawVars = Array.isArray(producto.variantes) && producto.variantes.length > 0
        ? producto.variantes
        : [];
      
      setVariantes(rawVars.map((v, i) => {
        const isSize = isSizeVariantName(v.nombre);
        return {
          _key: v.idVariante ? `id-${v.idVariante}` : `var-${i}-${Date.now()}`,
          idVariante: v.idVariante || v.id || null,
          nombre: v.nombre || "",
          precio: v.precio !== undefined ? v.precio : "",
          imagen: v.imagen || "",
          tipo: isSize ? "tamano" : "sabor",
          fileToUpload: null,
          previewUrl: v.imagen || ""
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
      setConfigCombo({
        esCombo: isFirstCombo,
        cantidadBebidas: 1,
        bebidasPermitidas: []
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
      catName.includes("líquido") ||
      catName.includes("liquido") ||
      catName.includes("cerveza") ||
      catName.includes("licor") ||
      catName.includes("coctel") ||
      catName.includes("cóctel") ||
      catName.includes("bar") ||
      prodName.includes("gaseosa") ||
      prodName.includes("bebida") ||
      prodName.includes("coca-cola") ||
      prodName.includes("coca cola") ||
      prodName.includes("pepsi") ||
      prodName.includes("postobón") ||
      prodName.includes("postobon") ||
      prodName.includes("colombiana") ||
      prodName.includes("manzana postobon") ||
      prodName.includes("sprite") ||
      prodName.includes("cuatro") ||
      prodName.includes("quatro") ||
      prodName.includes("agua") ||
      prodName.includes("jugo") ||
      prodName.includes("cerveza") ||
      prodName.includes("limonada") ||
      prodName.includes("malteada") ||
      prodName.includes("smoothie") ||
      prodName.includes("mr tea") ||
      prodName.includes("h2oh") ||
      desc.includes("refrescante") ||
      desc.includes("bebida fría") ||
      variantes.some((v) => isSizeVariantName(v.nombre))
    );
  }, [form.categoria, form.idCategoriaProducto, form.nombre, form.descripcion, variantes]);

  const isDrink = modoVariantesManual !== null ? modoVariantesManual === "bebida" : autoIsDrink;

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

  // Administradores de variantes
  const handleAddTamano = (suggestedName = "", suggestedPrice = "", suggestedImg = "") => {
    const isCoca = String(form.nombre || "").toLowerCase().includes("coca");
    let defaultPrice = suggestedPrice;
    let defaultImg = suggestedImg;

    if (!defaultPrice) {
      if (suggestedName.includes("1.5")) {
        defaultPrice = isCoca ? 9500 : 8500;
      } else if (suggestedName.includes("2.5")) {
        defaultPrice = isCoca ? 13500 : 12000;
      } else {
        defaultPrice = "";
      }
    }

    if (!defaultImg && suggestedName) {
      defaultImg = getDefaultDrinkImageForSize(suggestedName, form.nombre);
    }

    setVariantes((prev) => [
      ...prev,
      {
        _key: `tamano-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        idVariante: null,
        nombre: suggestedName || "",
        precio: defaultPrice,
        imagen: defaultImg || "",
        tipo: "tamano",
        fileToUpload: null,
        previewUrl: defaultImg || ""
      }
    ]);
  };

  const handleAddSabor = (suggestedName = "", suggestedPrice = "", suggestedImg = "") => {
    let defaultPrice = suggestedPrice !== "" ? suggestedPrice : (form.precio || "");
    let defaultImg = suggestedImg;

    if (!defaultImg && suggestedName) {
      defaultImg = getDefaultDrinkImageForFlavor(suggestedName, form.nombre);
    }

    setVariantes((prev) => [
      ...prev,
      {
        _key: `sabor-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        idVariante: null,
        nombre: suggestedName || "",
        precio: defaultPrice,
        imagen: defaultImg || "",
        tipo: "sabor",
        fileToUpload: null,
        previewUrl: defaultImg || ""
      }
    ]);
  };

  const handleAddVariante = () => {
    setVariantes((prev) => [
      ...prev,
      {
        _key: `generic-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        idVariante: null,
        nombre: "",
        precio: form.precio !== "" ? form.precio : "",
        imagen: "",
        tipo: "general",
        fileToUpload: null,
        previewUrl: ""
      }
    ]);
  };

  const handleUpdateVarianteByKey = (key, field, value) => {
    setVariantes((prev) =>
      prev.map((v) => (v._key === key ? { ...v, [field]: value } : v))
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

  const handleMainPriceChange = (newPrice) => {
    setForm((f) => ({ ...f, precio: newPrice }));
  };

  const renderVariantRow = (v, idx, type) => {
    const isTamano = type === "tamano";
    const isSabor = type === "sabor";
    const placeholderText = isTamano
      ? "Ej. Botella 1.5 Litros / Familiar"
      : isSabor
      ? "Ej. Pepsi Light / Black 400ml"
      : "Ej. Doble Carne / Con Queso Extra";

    const badgeCls = isTamano
      ? "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200"
      : isSabor
      ? "bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200"
      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300";

    const borderFocusCls = isTamano
      ? "focus:ring-amber-500 hover:border-amber-300"
      : isSabor
      ? "focus:ring-purple-500 hover:border-purple-300"
      : "focus:ring-[#F05454] hover:border-orange-200";

    return (
      <div
        key={v._key}
        className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-700/80 shadow-2xs hover:shadow-xs transition-all"
      >
        {/* Index & Type Tag */}
        <div className="flex items-center gap-2 shrink-0">
          <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center ${badgeCls}`}>
            {idx + 1}
          </span>
          {isTamano && (
            <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              Tamaño
            </span>
          )}
          {isSabor && (
            <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              Sabor
            </span>
          )}
        </div>

        {/* Variant Image Selector / Preview */}
        <div className="shrink-0 flex items-center gap-1.5">
          <label
            htmlFor={`variant-img-${v._key}`}
            className={`w-11 h-11 rounded-xl border-2 flex items-center justify-center overflow-hidden cursor-pointer relative group transition-all shrink-0 ${
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
                  <Camera className="w-4 h-4" />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-[#F05454] transition-colors">
                <Camera className="w-4 h-4" />
                <span className="text-[8px] font-bold mt-0.5 leading-none">Foto</span>
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
              className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors cursor-pointer"
              title="Quitar foto"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Name input */}
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={v.nombre}
            onChange={(e) => handleUpdateVarianteByKey(v._key, "nombre", e.target.value)}
            placeholder={placeholderText}
            className={`w-full px-3 py-1.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg text-xs focus:ring-2 focus:border-transparent transition-colors ${borderFocusCls}`}
          />
        </div>

        {/* Price input */}
        <div className="w-full sm:w-36 shrink-0">
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">$</span>
            <NumberInput
              min="0"
              value={v.precio}
              onChange={(e) => handleUpdateVarianteByKey(v._key, "precio", e.target.value)}
              placeholder="Precio"
              className={`w-full pl-6 pr-2 py-1.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg text-xs font-semibold focus:ring-2 focus:border-transparent transition-colors ${borderFocusCls}`}
            />
          </div>
        </div>

        {/* Delete row button */}
        <div className="shrink-0 flex justify-end">
          <button
            type="button"
            onClick={() => handleRemoveVarianteByKey(v._key)}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
            title="Eliminar opción"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploading) return;
    if (!form.nombre || !form.nombre.trim()) {
      notify.warning("Campo Requerido", "Por favor ingresa el nombre del producto");
      return;
    }
    if (form.precio === "" || form.precio === null || isNaN(Number(form.precio)) || Number(form.precio) < 0) {
      notify.warning("Campo Requerido", "Por favor ingresa un precio de venta válido");
      return;
    }

    // Validar variantes
    if (variantes.length > 0) {
      for (let i = 0; i < variantes.length; i++) {
        const v = variantes[i];
        if (!v.nombre || !v.nombre.trim()) {
          const typeLabel = isDrink 
            ? (v.tipo === "tamano" ? "de tamaño / presentación" : "de sabor / fórmula")
            : "de variante";
          notify.warning("Campo Requerido", `Por favor escribe el nombre ${typeLabel} #${i + 1}`);
          return;
        }
        if (v.precio === "" || v.precio === null || isNaN(Number(v.precio)) || Number(v.precio) < 0) {
          notify.warning("Campo Requerido", `Por favor ingresa un precio válido para "${v.nombre}"`);
          return;
        }
      }
    }

    // Validar ficha técnica obligatoria (todos los campos menos observaciones)
    const ft = fichaTecnica || {};
    const missingFichaFields = [];

    const ingredientes = ft.detalles || ft.insumos || ft.ingredientes || [];
    if (!ingredientes || ingredientes.length === 0) {
      missingFichaFields.push("Ingredientes / Insumos necesarios (mínimo 1)");
    }

    if (!ft.procedimiento || !String(ft.procedimiento).trim()) {
      missingFichaFields.push("Procedimiento de Preparación");
    }

    if (!ft.tiempoPreparacion || Number(ft.tiempoPreparacion) < 1) {
      missingFichaFields.push("Tiempo de Preparación (mínimo 1 min)");
    }

    if (!ft.rendimiento || !String(ft.rendimiento).trim()) {
      missingFichaFields.push("Rendimiento / Porciones");
    }

    if (!ft.condicionesAlmacenamiento || !String(ft.condicionesAlmacenamiento).trim()) {
      missingFichaFields.push("Condiciones de Almacenamiento");
    }

    if (!ft.vidaUtil || !String(ft.vidaUtil).trim()) {
      missingFichaFields.push("Vida Útil");
    }

    if (!ft.especificaciones || !String(ft.especificaciones).trim()) {
      missingFichaFields.push("Especificaciones Técnicas / Calidad");
    }

    if (!ft.caracteristicas || !String(ft.caracteristicas).trim()) {
      missingFichaFields.push("Características Organolépticas");
    }

    if (!ft.informacionNutricional || !String(ft.informacionNutricional).trim()) {
      missingFichaFields.push("Información Nutricional");
    }

    if (missingFichaFields.length > 0) {
      notify.error(
        "Ficha Técnica Incompleta",
        "Primero debes completar y guardar la ficha técnica"
      );
      return;
    }

    try {
      setUploading(true);
      let finalImageUrl = form.imagen;

      // SUBIDA DIFERIDA: Se sube a Cloudinary ÚNICAMENTE si el usuario confirma y guarda el formulario
      if (fileToUpload) {
        finalImageUrl = await uploadImageToCloudinary(fileToUpload);
      }

      const resolvedCat = (categorias || []).find(c => c.nombre === form.categoria);
      const basePrice = Number(form.precio) || 0;

      // SUBIDA DIFERIDA DE IMÁGENES DE VARIANTES (Si se seleccionaron archivos locales)
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
          return {
            idVariante: v.idVariante || null,
            nombre: v.nombre.trim(),
            precio: Number(v.precio) >= 0 ? Number(v.precio) : basePrice,
            imagen: varImg || null
          };
        })
      );

      await onSave({
        ...form,
        imagen: finalImageUrl,
        idCategoriaProducto: form.idCategoriaProducto || resolvedCat?.id || resolvedCat?.idCategoriaProducto || null,
        precio: basePrice,
        variantes: processedVariants,
        configuracionCombo: configCombo.esCombo
          ? {
              esCombo: true,
              cantidadBebidas: Math.max(1, Number(configCombo.cantidadBebidas) || 1),
              bebidasPermitidas: configCombo.bebidasPermitidas || []
            }
          : { esCombo: false, cantidadBebidas: 0, bebidasPermitidas: [] },
        fichaTecnica
      });

      setFileToUpload(null);
      setPreviewUrl("");
    } catch (err) {
      console.error("Error al guardar producto:", err);
      notify.error("Error", err.message || "Error al subir imagen o guardar el producto");
    } finally {
      setUploading(false);
    }
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

    // No se sube a Cloudinary todavía; se genera vista previa local instantánea
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
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) handleCancelOrClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-[#F05454]" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {isEditing ? "Editar Producto" : "Nuevo Producto"}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleCancelOrClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} noValidate className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Nombre del Producto</label>
              <input
                type="text"
                required
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className={inputCls}
                placeholder="Ej. Hamburguesa Especial"
              />
            </div>

            <div>
              <label className={labelCls}>Categoría</label>
              <select
                value={form.categoria}
                onChange={(e) => {
                  const selectedName = e.target.value;
                  const catObj = (categorias || []).find(c => c.nombre === selectedName);
                  const isComboCat = selectedName.toLowerCase().includes("combo");
                  setForm({
                    ...form,
                    categoria: selectedName,
                    idCategoriaProducto: catObj?.id || catObj?.idCategoriaProducto || null
                  });
                  if (isComboCat) {
                    setConfigCombo(prev => ({ ...prev, esCombo: true }));
                  }
                }}
                className={inputCls}
              >
                {categorias.map((c) => (
                  <option key={c.id || c.idCategoriaProducto || c.nombre} value={c.nombre}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Precio de Venta Base ($ COP)</label>
              <NumberInput
                required
                min="0"
                value={form.precio}
                onChange={(e) => handleMainPriceChange(e.target.value)}
                className={inputCls}
                placeholder="Ej. 25000"
              />
            </div>

            <div>
              <label className={labelCls}>Estado</label>
              <select
                value={form.estado}
                onChange={(e) => setForm({ ...form, estado: e.target.value })}
                className={inputCls}
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>

            {/* ═══ CONTROL DE ESTRUCTURA DE VARIANTES (MODO MANUAL O AUTOMÁTICO) ═══ */}
            <div className="sm:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 bg-gray-50/90 dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/80">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    Estructura de Variantes:
                  </span>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border inline-flex items-center gap-1.5 ${
                    isDrink
                      ? "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800"
                      : "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800"
                  }`}>
                    <FoodIcon name={isDrink ? "drink" : "burger"} size={13} className="shrink-0" />
                    <span>{isDrink ? "Modo Bebidas (Tamaños y Sabores separados)" : "Modo Comidas (Presentaciones unificadas)"}</span>
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                  {isDrink
                    ? "Organiza botellas/tamaños (1.5L, 2.5L) y fórmulas/sabores (Light, Zero, Frutales) por separado."
                    : "Organiza presentaciones generales (ej. Doble Carne, Tamaño Grande, Porción Extra)."}
                </p>
              </div>

              {/* Botones de conmutación manual para máxima flexibilidad */}
              <div className="inline-flex p-1 bg-white dark:bg-gray-850 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold shrink-0 shadow-2xs self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setModoVariantesManual("comida")}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    !isDrink
                      ? "bg-[#F05454] text-white shadow-xs"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  title="Activar vista de variantes estándar para comidas"
                >
                  <FoodIcon name="burger" size={14} />
                  <span>Comida</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModoVariantesManual("bebida")}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    isDrink
                      ? "bg-purple-600 text-white shadow-xs"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  title="Activar vista separada de Tamaños y Sabores para bebidas"
                >
                  <FoodIcon name="drink" size={14} />
                  <span>Bebida</span>
                </button>
              </div>
            </div>

            {/* ═══ SECCIÓN DE VARIANTES: SEPARADA PARA BEBIDAS O GENERAL PARA COMIDAS ═══ */}
            {isDrink ? (
              <>
                {/* ── 1. TAMAÑOS & PRESENTACIONES DE BEBIDA (1.5L, 2.5L, etc.) ── */}
                <div className="sm:col-span-2 border border-amber-200/90 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/15 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-700 dark:text-amber-300 shrink-0 shadow-2xs">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                            Tamaños y Presentaciones de Bebida
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800">
                            {sizeVariantes.length} {sizeVariantes.length === 1 ? "presentación" : "presentaciones"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Configura las botellas y tamaños adicionales (ej. Botella 1.5 Litros, Mega 2.5 Litros) con sus precios y fotos individuales.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddTamano()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 hover:bg-amber-50 dark:hover:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 rounded-xl text-xs font-bold transition-all shadow-2xs self-start sm:self-auto cursor-pointer active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Agregar Tamaño
                    </button>
                  </div>

                  {/* Sugerencias Rápidas de Tamaños */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mr-1">
                      Sugerencias de tamaño:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddTamano("Botella 1.5 Litros")}
                      className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-800/80 text-amber-800 dark:text-amber-200 hover:bg-amber-100/60 dark:hover:bg-amber-900/40 transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3 text-amber-600" />
                      Botella 1.5 Litros
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddTamano("Mega Botella 2.5 Litros")}
                      className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-800/80 text-amber-800 dark:text-amber-200 hover:bg-amber-100/60 dark:hover:bg-amber-900/40 transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3 text-amber-600" />
                      Mega Botella 2.5 Litros
                    </button>
                  </div>

                  {sizeVariantes.length === 0 ? (
                    <div className="text-center py-4 px-4 rounded-xl border border-dashed border-amber-200/90 dark:border-amber-900/40 bg-white/50 dark:bg-gray-800/30">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        No hay tamaños adicionales registrados. La bebida se venderá únicamente en su tamaño personal estándar (400 ml).
                      </p>
                      <button
                        type="button"
                        onClick={() => handleAddTamano("Botella 1.5 Litros")}
                        className="mt-2 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer inline-flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Añadir Botella 1.5 Litros
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5 pt-1">
                      {sizeVariantes.map((v, idx) => renderVariantRow(v, idx, "tamano"))}
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400 bg-white/60 dark:bg-gray-800/40 p-2 rounded-lg border border-amber-100 dark:border-amber-950">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>
                      Estos tamaños aparecerán en el selector de <strong>"TAMAÑO & PRESENTACIÓN"</strong> del modal del comensal.
                    </span>
                  </div>
                </div>

                {/* ── 2. SABORES & FÓRMULAS DE BEBIDA (Sin Azúcar, Light, Zero, Frutales) ── */}
                <div className="sm:col-span-2 border border-purple-200/90 dark:border-purple-900/50 bg-purple-50/40 dark:bg-purple-950/15 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-700 dark:text-purple-300 shrink-0 shadow-2xs">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                            Sabores o Fórmulas de la Bebida
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-800">
                            {flavorVariantes.length} {flavorVariantes.length === 1 ? "fórmula" : "fórmulas"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Agrega fórmulas alternativas (ej. Sin Azúcar / Light, Zero, Sabor Uva, Naranja, etc.) que el cliente puede conmutar.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddSabor()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700 rounded-xl text-xs font-bold transition-all shadow-2xs self-start sm:self-auto cursor-pointer active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Agregar Sabor / Fórmula
                    </button>
                  </div>

                  {/* Sugerencias Rápidas de Sabores / Fórmulas */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mr-1">
                      Sugerencias de sabor:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddSabor("Sin Azúcar / Light 400ml")}
                      className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-800/80 text-purple-800 dark:text-purple-200 hover:bg-purple-100/60 dark:hover:bg-purple-900/40 transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3 text-purple-600" />
                      Sin Azúcar / Light
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddSabor("Zero Calorías 400ml")}
                      className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-800/80 text-purple-800 dark:text-purple-200 hover:bg-purple-100/60 dark:hover:bg-purple-900/40 transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3 text-purple-600" />
                      Zero Calorías
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddSabor("Sabor Uva 400ml")}
                      className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-800/80 text-purple-800 dark:text-purple-200 hover:bg-purple-100/60 dark:hover:bg-purple-900/40 transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3 text-purple-600" />
                      Sabor Uva
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddSabor("Sabor Naranja 400ml")}
                      className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-800/80 text-purple-800 dark:text-purple-200 hover:bg-purple-100/60 dark:hover:bg-purple-900/40 transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3 text-purple-600" />
                      Sabor Naranja
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddSabor("Sabor Manzana 400ml")}
                      className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-800/80 text-purple-800 dark:text-purple-200 hover:bg-purple-100/60 dark:hover:bg-purple-900/40 transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3 text-purple-600" />
                      Sabor Manzana
                    </button>
                  </div>

                  {flavorVariantes.length === 0 ? (
                    <div className="text-center py-4 px-4 rounded-xl border border-dashed border-purple-200/90 dark:border-purple-900/40 bg-white/50 dark:bg-gray-800/30">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        No hay fórmulas alternativas registradas. La bebida se venderá en su sabor tradicional original.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleAddSabor("Sin Azúcar / Light 400ml")}
                        className="mt-2 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer inline-flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Añadir opción Sin Azúcar / Light
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5 pt-1">
                      {flavorVariantes.map((v, idx) => renderVariantRow(v, idx, "sabor"))}
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400 bg-white/60 dark:bg-gray-800/40 p-2 rounded-lg border border-purple-100 dark:border-purple-950">
                    <Lightbulb className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <span>
                      Estos sabores aparecerán en la sección <strong>"VARIANTE O FÓRMULA"</strong> del modal del comensal.
                    </span>
                  </div>
                </div>
              </>
            ) : (
              /* ── SECCIÓN GENERAL PARA COMIDAS (Hamburguesas, Perros, Salchipapas, etc.) ── */
              <div className="sm:col-span-2 border border-orange-200/80 dark:border-orange-900/40 bg-orange-50/30 dark:bg-orange-950/10 rounded-2xl p-4 sm:p-5 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0 shadow-2xs">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                          Variantes y Presentaciones del Producto
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                          {variantes.length} {variantes.length === 1 ? "presentación" : "presentaciones"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Personaliza opciones de presentación (ej. Doble Carne, Tamaño Grande, Porción Extra) y sus precios.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddVariante}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-[#F05454] border border-[#F05454]/30 rounded-xl text-xs font-bold transition-all shadow-2xs self-start sm:self-auto cursor-pointer active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Agregar Variante
                  </button>
                </div>

                {variantes.length === 0 ? (
                  <div className="text-center py-5 px-4 rounded-xl border border-dashed border-orange-200/90 dark:border-orange-900/40 bg-white/50 dark:bg-gray-800/30">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      No hay variantes adicionales registradas. El producto se venderá con su presentación estándar y precio base.
                    </p>
                    <button
                      type="button"
                      onClick={handleAddVariante}
                      className="mt-2 text-xs font-bold text-[#F05454] hover:underline cursor-pointer inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Añadir variante
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5 pt-1">
                    {variantes.map((v, idx) => renderVariantRow(v, idx, "general"))}
                  </div>
                )}

                <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400 bg-white/60 dark:bg-gray-800/40 p-2 rounded-lg border border-orange-100 dark:border-orange-950">
                  <Lightbulb className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  <span>
                    Tus clientes podrán seleccionar estas opciones con sus propios precios y fotos al ordenar.
                  </span>
                </div>
              </div>
            )}

            <div className="sm:col-span-2">
              <label className={labelCls}>Imagen del Producto</label>
              
              <div className="flex items-start gap-4">
                {/* Preview Thumbnail */}
                <div className="w-24 h-24 shrink-0 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-800">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Utensils className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                  )}
                </div>
                
                {/* Upload Action */}
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4 text-[#F05454]" />}
                      {uploading ? "Subiendo a Cloudinary..." : previewUrl ? "Cambiar Imagen" : "Seleccionar Imagen"}
                    </button>
                    {previewUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="text-xs text-red-500 hover:text-red-700 font-medium cursor-pointer"
                      >
                        Quitar imagen
                      </button>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageSelected}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Formatos soportados: JPG, PNG, WEBP. Tamaño ideal 1000x1000px.
                  </p>
                </div>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className={labelCls}>Descripción</label>
              <textarea
                rows={2}
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                className={inputCls}
                placeholder="Descripción del platillo e ingredientes principales..."
              />
            </div>

            {/* Configuración de Combo y Bebidas Incluidas */}
            <div className="sm:col-span-2 border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FoodIconBadge name="drink" size="sm" />
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      Configuración de Combo: Bebidas Incluidas
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
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
                <div className="space-y-3 pt-3 border-t border-blue-150 dark:border-blue-900/40">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                      Cantidad de Bebidas Incluidas en el Combo:
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-1 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => setConfigCombo(prev => ({ ...prev, cantidadBebidas: Math.max(1, (prev.cantidadBebidas || 1) - 1) }))}
                          className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 font-bold text-gray-700 dark:text-gray-200 flex items-center justify-center transition cursor-pointer active:scale-95"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-black text-sm text-gray-900 dark:text-gray-100">
                          {configCombo.cantidadBebidas || 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => setConfigCombo(prev => ({ ...prev, cantidadBebidas: Math.min(10, (prev.cantidadBebidas || 1) + 1) }))}
                          className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 font-bold text-gray-700 dark:text-gray-200 flex items-center justify-center transition cursor-pointer active:scale-95"
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-1">
                        {todasBebidas.map((bebida) => {
                          const bId = bebida.id || bebida.idProducto;
                          const isAllowed = configCombo.bebidasPermitidas.length === 0 || configCombo.bebidasPermitidas.includes(bId);
                          return (
                            <label
                              key={bId}
                              className={`flex items-center gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition select-none ${
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

            <div className="sm:col-span-2 mt-4">
              <div className="flex items-center justify-between mb-2">
                <label className={labelCls}>
                  Adiciones Disponibles ({form.adiciones?.length || 0} seleccionadas)
                </label>
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
                    className="text-xs text-[#F05454] hover:underline font-bold cursor-pointer transition-colors"
                  >
                    {todasAdiciones.every(ad => form.adiciones.some(a => (a.idAdicion || a.id || a) === (ad.idAdicion || ad.id)))
                      ? "Desmarcar todas"
                      : "Seleccionar todas"}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {todasAdiciones.map((adicion) => {
                  const adId = adicion.idAdicion || adicion.id;
                  const isSelected = form.adiciones.some((a) => (a.idAdicion || a.id || a) === adId);
                  return (
                    <label
                      key={adicion.idAdicion}
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
                            <FoodIcon name={adicion.nombre} size={18} stroke={1.75} />
                          )}
                        </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {adicion.nombre}
                        </p>
                        <p className="text-xs text-[#F05454] font-medium">
                          +${Number(adicion.precio).toLocaleString('es-CO')}
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
          </div>

          {/* Section: Ficha Técnica */}
          <FichaTecnicaProducto
            productId={producto?.id || producto?.idProducto}
            productName={form.nombre}
            initialData={producto?.fichaTecnica || null}
            onChange={(data) => setFichaTecnica(data)}
            onSave={(data) => setFichaTecnica(data)}
          />

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
            <button
              type="button"
              onClick={handleCancelOrClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium text-white bg-[#F05454] hover:bg-[#d84343] rounded-xl transition-colors shadow-md"
            >
              {isEditing ? "Guardar Cambios" : "Crear Producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
