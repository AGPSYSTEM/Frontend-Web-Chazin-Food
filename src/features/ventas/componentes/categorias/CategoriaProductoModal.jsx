import { useState, useEffect, useRef } from "react";
import { X, UtensilsCrossed, UploadCloud, Loader2, AlertCircle, CheckCircle2, Sparkles, Image as ImageIcon } from "lucide-react";
import { uploadImageToCloudinary } from "@/shared/servicios/cloudinaryService";
import { FoodIcon } from "@/shared/components/ui/FoodIcon";
import { useNotifications } from "@/shared/hooks/useNotifications";

const inputCls = "w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-[#F05454] focus:border-transparent transition-colors text-sm outline-none";
const labelCls = "block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5";

// Opciones de íconos gastronómicos curadas y enfocadas al restaurante (12 categorías = 3 filas de 4 columnas)
const CATEGORY_ICONS = [
  { slug: "burger", label: "Hamburguesas" },
  { slug: "hotdog", label: "Perros Calientes" },
  { slug: "fries", label: "Papas y Salchipapas" },
  { slug: "drink", label: "Bebidas y Refrescos" },
  { slug: "combo", label: "Combos" },
  { slug: "pizza", label: "Pizzas" },
  { slug: "meat", label: "Carnes / Parrilla" },
  { slug: "sides", label: "Acompañamientos" },
  { slug: "salad", label: "Ensaladas" },
  { slug: "dessert", label: "Postres" },
  { slug: "chazin", label: "Especial Chazin" },
  { slug: "general", label: "Comida General" }
];

export function CategoriaProductoModal({ isOpen, onClose, onSave, categoria = null }) {
  const isEditing = !!categoria;
  const { warning, error: notifyError } = useNotifications();
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [icon, setIcon] = useState("burger");
  const [estado, setEstado] = useState("Activo");
  const [activeTab, setActiveTab] = useState("icons"); // "icons" | "image"
  const [userSelectedIcon, setUserSelectedIcon] = useState(false);

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [previewIcon, setPreviewIcon] = useState("burger");
  const fileInputRef = useRef(null);

  const validateField = (name, value) => {
    switch (name) {
      case "nombre": {
        const val = (value || "").trim();
        if (!val) {
          return "El nombre de la categoría es obligatorio.";
        }
        if (val.length < 2) {
          return "El nombre debe tener al menos 2 caracteres.";
        }
        if (val.length > 50) {
          return "El nombre no puede superar los 50 caracteres.";
        }
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(val)) {
          return "El nombre solo puede contener letras y espacios.";
        }
        return null;
      }
      case "descripcion": {
        const val = value || "";
        if (val.length > 200) {
          return "La descripción no puede superar los 200 caracteres.";
        }
        return null;
      }
      default:
        return null;
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const val = field === "nombre" ? nombre : descripcion;
    const err = validateField(field, val);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  // Autodetección inteligente de ícono según el texto escrito
  const detectIconFromName = (text) => {
    const t = String(text || "").toLowerCase();
    if (t.includes("hambur")) return "burger";
    if (t.includes("perro") || t.includes("hotdog") || t.includes("hot dog")) return "hotdog";
    if (t.includes("papa") || t.includes("salchipapa") || t.includes("frita")) return "fries";
    if (t.includes("bebida") || t.includes("gaseosa") || t.includes("jugo") || t.includes("refresco")) return "drink";
    if (t.includes("combo")) return "combo";
    if (t.includes("pizza")) return "pizza";
    if (t.includes("carne") || t.includes("parrilla") || t.includes("pollo") || t.includes("asado")) return "meat";
    if (t.includes("acompa") || t.includes("entrada")) return "sides";
    if (t.includes("ensalada") || t.includes("saludable")) return "salad";
    if (t.includes("postre") || t.includes("dulce") || t.includes("torta") || t.includes("helado")) return "dessert";
    return null;
  };

  const handleChange = (field, val) => {
    let cleanVal = val;
    if (field === "nombre") {
      cleanVal = val.replace(/[0-9]/g, "");
      setNombre(cleanVal);

      // Si el usuario no ha forzado un ícono manualmente y no tiene foto subida, sugerir ícono automático
      if (!userSelectedIcon && !fileToUpload && activeTab === "icons") {
        const detected = detectIconFromName(cleanVal);
        if (detected) {
          setIcon(detected);
          setPreviewIcon(detected);
        }
      }
    }
    if (field === "descripcion") setDescripcion(cleanVal);
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, cleanVal);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleCancelOrClose = () => {
    setFileToUpload(null);
    setPreviewIcon("burger");
    setErrors({});
    setTouched({});
    setSubmitted(false);
    setUserSelectedIcon(false);
    onClose();
  };

  useEffect(() => {
    setFileToUpload(null);
    setErrors({});
    setTouched({});
    setSubmitted(false);
    setUserSelectedIcon(false);

    if (categoria) {
      setNombre(categoria.nombre || "");
      setDescripcion(categoria.descripcion || "");
      const currentIcon = categoria.icon || "burger";
      setIcon(currentIcon);
      setPreviewIcon(currentIcon);
      setEstado(categoria.estado || "Activo");

      if (typeof currentIcon === "string" && (currentIcon.startsWith("http") || currentIcon.startsWith("/") || currentIcon.startsWith("blob:"))) {
        setActiveTab("image");
      } else {
        setActiveTab("icons");
      }
    } else {
      setNombre("");
      setDescripcion("");
      setIcon("burger");
      setPreviewIcon("burger");
      setEstado("Activo");
      setActiveTab("icons");
    }
  }, [categoria, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    const errNombre = validateField("nombre", nombre);
    const errDesc = validateField("descripcion", descripcion);
    const errs = {};
    if (errNombre) errs.nombre = errNombre;
    if (errDesc) errs.descripcion = errDesc;
    setErrors(errs);
    setTouched({ nombre: true, descripcion: true });

    if (Object.keys(errs).length > 0 || uploading) {
      return;
    }

    try {
      setUploading(true);
      let finalIcon = icon || "burger";

      // SUBIDA DIFERIDA: Solo sube a Cloudinary al momento de confirmar el formulario
      if (fileToUpload) {
        finalIcon = await uploadImageToCloudinary(fileToUpload);
      } else if (activeTab === "icons") {
        finalIcon = icon || "burger";
      }

      await onSave({ nombre: nombre.trim(), descripcion: descripcion.trim(), icon: finalIcon, estado });
      handleCancelOrClose();
    } catch (err) {
      console.error("Error al guardar categoría:", err);
      const rawMsg = err.response?.data?.message || err.message || "";
      const friendlyMsg = rawMsg.toLowerCase().includes("unique") || rawMsg.toLowerCase().includes("duplicad")
        ? "Ya existe una categoría registrada con este nombre."
        : rawMsg || "No se pudo procesar la solicitud en este momento.";
      notifyError("Atención", friendlyMsg);
    } finally {
      setUploading(false);
    }
  };

  const handleImageSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      warning("Formato no válido", "El archivo seleccionado debe ser una imagen (JPG, PNG, WEBP).");
      return;
    }

    const maxSizeInBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      warning("Tamaño excedido", "La imagen no debe superar los 5 MB de tamaño.");
      return;
    }

    setFileToUpload(file);
    const localUrl = URL.createObjectURL(file);
    setPreviewIcon(localUrl);
    setIcon(localUrl);
    setActiveTab("image");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = () => {
    setFileToUpload(null);
    setIcon("burger");
    setPreviewIcon("burger");
    setActiveTab("icons");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isCustomImage = Boolean(
    previewIcon &&
    typeof previewIcon === "string" &&
    (previewIcon.startsWith("http") || previewIcon.startsWith("/") || previewIcon.startsWith("blob:"))
  );

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) handleCancelOrClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm"
    >
      {/* Contenedor Modal: Amplio Horizontalmente, Altura Baja Cómoda y Esquinas Bien Redondeadas (rounded-[32px]) */}
      <div className="bg-white dark:bg-gray-900 rounded-[32px] shadow-2xl shadow-black/30 w-full max-w-4xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col transition-all">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between px-7 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0 bg-gray-50/50 dark:bg-gray-850/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/60 text-[#F05454] flex items-center justify-center border border-red-100 dark:border-red-900/40 shadow-xs">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-gray-100 leading-tight">
                {isEditing ? "Editar Categoría" : "Nueva Categoría de Menú"}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Configura la información y el estilo visual de tu categoría gastronómica
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCancelOrClose}
            aria-label="Cerrar modal"
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario en 2 Columnas Horizontales Equilibradas (CERO SCROLL) */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="p-7 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* COLUMNA IZQUIERDA (5 columnas): Datos de la Categoría y Vista Previa */}
            <div className="md:col-span-5 space-y-4">
              {/* Tarjeta de Vista Previa en Vivo */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-red-50/70 via-amber-50/40 to-gray-50 dark:from-red-950/20 dark:via-gray-800/60 dark:to-gray-800/40 border border-red-100/90 dark:border-gray-800 flex items-center gap-3.5 shadow-2xs">
                <div className="w-13 h-13 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200/80 dark:border-gray-700 flex items-center justify-center shrink-0 overflow-hidden">
                  {isCustomImage ? (
                    <img src={previewIcon} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <FoodIcon name={previewIcon || icon || "burger"} size={28} className="text-[#F05454]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-black text-gray-900 dark:text-gray-100 truncate">
                      {nombre.trim() || "Nombre de Categoría"}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      estado === "Activo"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                        : "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border border-gray-300 dark:border-gray-700"
                    }`}>
                      {estado}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    {descripcion.trim() || "Vista previa de la categoría en el menú"}
                  </p>
                </div>
              </div>

              {/* Campo Nombre */}
              <div>
                <label className={labelCls}>
                  Nombre de la Categoría <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nombre}
                  onBlur={() => handleBlur("nombre")}
                  onKeyDown={(e) => {
                    if (/^[0-9]$/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => handleChange("nombre", e.target.value)}
                  className={`${inputCls} ${
                    (touched.nombre || submitted || nombre.length > 0) && errors.nombre
                      ? "border-red-500 bg-red-50/50 dark:bg-red-950/20 text-red-900 focus:ring-red-400"
                      : (touched.nombre || submitted || nombre.length > 0) && !errors.nombre && nombre.trim().length >= 2
                      ? "border-emerald-500/80 bg-emerald-50/15 text-gray-900 dark:text-gray-100 focus:ring-emerald-400"
                      : ""
                  }`}
                  placeholder="Ej. Hamburguesas, Bebidas..."
                />
                {(touched.nombre || submitted || nombre.length > 0) && errors.nombre ? (
                  <p className="flex items-center gap-1 text-[11px] text-red-500 mt-1 font-medium animate-in fade-in duration-150">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.nombre}</span>
                  </p>
                ) : nombre.trim().length >= 2 && !errors.nombre ? (
                  <p className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium animate-in fade-in duration-150">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Nombre válido</span>
                  </p>
                ) : null}
              </div>

              {/* Campo Descripción */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className={labelCls}>Descripción (Opcional)</label>
                  <span className={`text-[10px] ${descripcion.length > 200 ? "text-red-500 font-bold" : "text-gray-400"}`}>
                    {descripcion.length}/200
                  </span>
                </div>
                <textarea
                  rows={2}
                  value={descripcion}
                  onBlur={() => handleBlur("descripcion")}
                  onChange={(e) => handleChange("descripcion", e.target.value)}
                  className={`${inputCls} resize-none ${
                    (touched.descripcion || submitted) && errors.descripcion
                      ? "border-red-500 bg-red-50/50 dark:bg-red-950/20 text-red-900 focus:ring-red-400"
                      : ""
                  }`}
                  placeholder="Breve detalle sobre los productos de esta sección..."
                />
              </div>

              {/* Campo Estado */}
              <div>
                <label className={labelCls}>
                  Estado en el Menú <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setEstado("Activo")}
                    className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                      estado === "Activo"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 ring-2 ring-emerald-400/30"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Activo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEstado("Inactivo")}
                    className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                      estado === "Inactivo"
                        ? "border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 ring-2 ring-rose-400/30"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>Inactivo</span>
                  </button>
                </div>
              </div>
            </div>

            {/* COLUMNA DERECHA (7 columnas): Selector Visual de Íconos / Foto */}
            <div className="md:col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <label className={labelCls}>Ícono o Foto de la Categoría</label>
                {isCustomImage && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="text-xs font-bold text-red-500 hover:text-red-600 cursor-pointer transition-colors"
                  >
                    Restablecer a ícono
                  </button>
                )}
              </div>

              {/* Selector de Pestañas: Ícono vs Imagen */}
              <div className="flex rounded-2xl bg-gray-100 dark:bg-gray-800 p-1 border border-gray-200/80 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("icons");
                    if (fileToUpload) setFileToUpload(null);
                    if (isCustomImage) {
                      setPreviewIcon(icon && !icon.includes("/") ? icon : "burger");
                    }
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === "icons"
                      ? "bg-white dark:bg-gray-700 text-[#F05454] shadow-xs"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Íconos Gastronómicos</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("image")}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === "image"
                      ? "bg-white dark:bg-gray-700 text-[#F05454] shadow-xs"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Subir Foto del Menú</span>
                </button>
              </div>

              {/* Pestaña 1: Cuadrícula Completa de 12 Íconos (3 filas x 4 columnas) con tamaño original y SIN SCROLL */}
              {activeTab === "icons" && (
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {CATEGORY_ICONS.map((opt) => {
                    const isSelected = !isCustomImage && icon === opt.slug;
                    return (
                      <button
                        key={opt.slug}
                        type="button"
                        onClick={() => {
                          setFileToUpload(null);
                          setIcon(opt.slug);
                          setPreviewIcon(opt.slug);
                          setUserSelectedIcon(true);
                        }}
                        className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${
                          isSelected
                            ? "border-[#F05454] bg-red-50/90 dark:bg-red-950/50 text-[#F05454] shadow-xs ring-2 ring-red-400/30"
                            : "border-gray-200/90 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50/80"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center">
                          <FoodIcon
                            name={opt.slug}
                            size={22}
                            className={isSelected ? "text-[#F05454]" : "text-gray-600 dark:text-gray-300"}
                          />
                        </div>
                        <span className="text-[11px] font-bold leading-tight truncate w-full text-center">
                          {opt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Pestaña 2: Subida de Foto */}
              {activeTab === "image" && (
                <div className="pt-1">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageSelected}
                  />
                  {isCustomImage ? (
                    <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0 bg-white shadow-xs">
                        <img src={previewIcon} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">
                          {fileToUpload ? fileToUpload.name : "Foto personalizada de categoría"}
                        </p>
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Lista para guardar
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                          >
                            Cambiar foto
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="text-xs font-bold text-red-500 hover:text-red-700 cursor-pointer"
                          >
                            Quitar foto
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-red-400 dark:hover:border-red-500 rounded-2xl p-8 text-center cursor-pointer transition-all bg-gray-50/50 dark:bg-gray-800/40 hover:bg-red-50/20 group"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/60 text-[#F05454] flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform shadow-xs">
                        {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <UploadCloud className="w-6 h-6" />}
                      </div>
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                        {uploading ? "Subiendo foto a Cloudinary..." : "Haz clic para subir una foto desde tu equipo"}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        Formatos permitidos: JPG, PNG, WEBP (Hasta 5MB)
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Footer Acciones con Bordes Redondeados */}
          <div className="flex justify-end gap-3 px-7 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-850/40 shrink-0">
            <button
              type="button"
              onClick={handleCancelOrClose}
              className="px-5 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-6 py-2.5 text-xs font-bold text-white bg-[#F05454] hover:bg-[#d84343] rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isEditing ? "Guardar Cambios" : "Crear Categoría"}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

export default CategoriaProductoModal;
