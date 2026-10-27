import { useState, useEffect, useRef } from "react";
import { X, UtensilsCrossed, UploadCloud, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { uploadImageToCloudinary, deleteImageFromCloudinary } from "@/shared/servicios/cloudinaryService";
import { FoodIcon, AVAILABLE_FOOD_SLUGS } from "@/shared/components/ui/FoodIcon";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { validateTexto } from "@/shared/utils/validationUtils";

const inputCls = "w-full px-4 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-[#F05454] focus:border-transparent transition-colors text-sm";
const labelCls = "block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1";

export function CategoriaProductoModal({ isOpen, onClose, onSave, categoria = null }) {
  const isEditing = !!categoria;
  const { warning, error: notifyError } = useNotifications();
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [icon, setIcon] = useState("");
  const [estado, setEstado] = useState("Activo");

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [previewIcon, setPreviewIcon] = useState("");
  const fileInputRef = useRef(null);

  const validateField = (name, value) => {
    switch (name) {
      case "nombre": {
        const res = validateTexto(value, "nombre de la categoría", { min: 2, max: 50, required: true, permitirNumeros: false });
        return res.isValid ? null : res.error;
      }
      case "descripcion":
        if (value && value.length > 200) {
          return "La descripción no puede superar los 200 caracteres.";
        }
        return null;
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

  const handleChange = (field, val) => {
    let cleanVal = val;
    if (field === "nombre") {
      // Requisito 92: Bloquear ingreso de números en el nombre de la categoría
      cleanVal = val.replace(/[0-9]/g, "");
      setNombre(cleanVal);
    }
    if (field === "descripcion") setDescripcion(cleanVal);
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, cleanVal);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleCancelOrClose = () => {
    setFileToUpload(null);
    setPreviewIcon("");
    setErrors({});
    setTouched({});
    setSubmitted(false);
    onClose();
  };

  useEffect(() => {
    setFileToUpload(null);
    setErrors({});
    setTouched({});
    setSubmitted(false);
    if (categoria) {
      setNombre(categoria.nombre || "");
      setDescripcion(categoria.descripcion || "");
      setIcon(categoria.icon || "");
      setPreviewIcon(categoria.icon || "");
      setEstado(categoria.estado || "Activo");
    } else {
      setNombre("");
      setDescripcion("");
      setIcon("");
      setPreviewIcon("");
      setEstado("Activo");
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
      warning("Datos requeridos", Object.values(errs)[0]);
      return;
    }

    try {
      setUploading(true);
      let finalIcon = icon;

      // SUBIDA DIFERIDA: Solo sube a Cloudinary al momento de confirmar el formulario
      if (fileToUpload) {
        finalIcon = await uploadImageToCloudinary(fileToUpload);
      }

      await onSave({ nombre: nombre.trim(), descripcion: descripcion.trim(), icon: finalIcon, estado });
      setFileToUpload(null);
      setPreviewIcon("");
    } catch (err) {
      console.error("Error al guardar categoría:", err);
      notifyError("Error al guardar", err.message || "Error al subir imagen o guardar categoría");
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

    // Previsualización local inmediata sin subir a la nube
    setFileToUpload(file);
    const localUrl = URL.createObjectURL(file);
    setPreviewIcon(localUrl);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveIcon = () => {
    setFileToUpload(null);
    setPreviewIcon("");
    setIcon("");
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
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-[#F05454]" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {isEditing ? "Editar Categoría" : "Nueva Categoría de Productos"}
            </h2>
          </div>
          <button
            onClick={handleCancelOrClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
          <div>
            <label className={labelCls}>
              Nombre de la Categoría <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nombre}
              onBlur={() => handleBlur("nombre")}
              onKeyDown={(e) => {
                // Requisito 92: Bloquear dígitos en teclado
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
              placeholder="Ej. Comidas Rápidas, Bebidas"
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

          <div>
            <label className={labelCls}>Imagen / Ícono de la Categoría</label>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 shrink-0 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-800">
                {previewIcon ? (
                  previewIcon.includes('/') || previewIcon.includes('.') || previewIcon.startsWith('blob:') ? (
                    <img src={previewIcon} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <FoodIcon name={previewIcon || nombre} category={nombre} size={30} stroke={1.75} className="text-amber-500" />
                  )
                ) : (
                  <UtensilsCrossed className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4 text-[#F05454]" />}
                      {uploading ? "Subiendo..." : previewIcon ? "Cambiar Imagen" : "Subir Imagen"}
                    </button>
                    {previewIcon && (
                      <button
                        type="button"
                        onClick={handleRemoveIcon}
                        className="text-xs text-red-500 hover:text-red-700 font-medium cursor-pointer"
                      >
                        Quitar
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
                  <input
                    type="text"
                    value={previewIcon.startsWith('blob:') ? '' : icon}
                    onChange={(e) => {
                      setFileToUpload(null);
                      setIcon(e.target.value);
                      setPreviewIcon(e.target.value);
                    }}
                    className={inputCls}
                    placeholder="O escribe un slug (ej. burger, pizza, fries) o URL"
                  />

                  {/* Catálogo de Íconos Vectoriales Disponibles */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] font-bold text-gray-400 mr-1">Rápidos:</span>
                    {AVAILABLE_FOOD_SLUGS.map((item) => (
                      <button
                        key={item.slug}
                        type="button"
                        onClick={() => {
                          setFileToUpload(null);
                          setIcon(item.slug);
                          setPreviewIcon(item.slug);
                        }}
                        className={`w-7 h-7 rounded-lg border flex items-center justify-center transition cursor-pointer ${
                          icon === item.slug
                            ? "border-[#F05454] bg-red-50 dark:bg-red-950/40 text-[#F05454] ring-2 ring-red-400/40"
                            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-750"
                        }`}
                        title={item.label}
                      >
                        <item.icon size={16} stroke={1.75} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className={labelCls}>Descripción (Opcional)</label>
              <span className={`text-[10px] ${descripcion.length > 200 ? "text-red-500 font-bold" : "text-gray-400"}`}>
                {descripcion.length}/200
              </span>
            </div>
            <textarea
              rows={3}
              value={descripcion}
              onBlur={() => handleBlur("descripcion")}
              onChange={(e) => handleChange("descripcion", e.target.value)}
              className={`${inputCls} ${
                (touched.descripcion || submitted) && errors.descripcion
                  ? "border-red-500 bg-red-50/50 dark:bg-red-950/20 text-red-900 focus:ring-red-400"
                  : ""
              }`}
              placeholder="Descripción breve de la categoría..."
            />
            {(touched.descripcion || submitted) && errors.descripcion && (
              <p className="flex items-center gap-1 text-[11px] text-red-500 mt-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.descripcion}
              </p>
            )}
          </div>

          <div>
            <label className={labelCls}>
              Estado <span className="text-red-500">*</span>
            </label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className={inputCls}
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
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
              {isEditing ? "Guardar Cambios" : "Crear Categoría"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
