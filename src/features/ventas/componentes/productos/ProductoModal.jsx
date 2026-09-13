import { useState, useEffect, useRef } from "react";
import { X, Utensils, UploadCloud, Loader2 } from "lucide-react";
import { NumberInput } from "@/shared/components/ui/NumberInput";
import { FichaTecnicaProducto } from "@/features/fichas-tecnicas/componentes/FichaTecnicaProducto";
import { adicionesService } from "@/features/compras/servicios/adicionesService";
import { getAdditionEmoji } from "@/shared/utils/foodEmojiUtils";
import { uploadImageToCloudinary, deleteImageFromCloudinary } from "@/shared/servicios/cloudinaryService";

const inputCls = "w-full px-4 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-[#F05454] focus:border-transparent transition-colors text-sm";
const labelCls = "block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1";

export function ProductoModal({ isOpen, onClose, onSave, producto = null, categorias = [] }) {
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
  const [todasAdiciones, setTodasAdiciones] = useState([]);
  const [fichaTecnica, setFichaTecnica] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
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

    // Cargar adiciones
    adicionesService.getAdiciones().then(setTodasAdiciones).catch(console.error);

    if (producto) {
      const selectedCat = (categorias || []).find(c => c.nombre === producto.categoria || (c.id && c.id === producto.idCategoriaProducto) || (c.idCategoriaProducto && c.idCategoriaProducto === producto.idCategoriaProducto));
      setForm({
        nombre: producto.nombre || "",
        idCategoriaProducto: producto.idCategoriaProducto || producto.categoriaId || selectedCat?.id || selectedCat?.idCategoriaProducto || null,
        categoria: producto.categoria || (selectedCat?.nombre || (categorias[0]?.nombre || "")),
        precio: producto.precio || "",
        descripcion: producto.descripcion || "",
        imagen: producto.imagen || "",
        estado: producto.estado || "Activo",
        adiciones: producto.adiciones || []
      });
      setFichaTecnica(producto.fichaTecnica || null);
    } else {
      setForm({
        nombre: "",
        idCategoriaProducto: categorias[0]?.id || categorias[0]?.idCategoriaProducto || null,
        categoria: categorias[0]?.nombre || "",
        precio: "",
        descripcion: "",
        imagen: "",
        estado: "Activo",
        adiciones: []
      });
      setFichaTecnica(null);
    }
  }, [producto, isOpen, categorias]);

  const toggleAdicion = (adicion) => {
    const isSelected = form.adiciones.some((a) => a.idAdicion === adicion.idAdicion);
    let nuevasAdiciones;
    if (isSelected) {
      nuevasAdiciones = form.adiciones.filter((a) => a.idAdicion !== adicion.idAdicion);
    } else {
      nuevasAdiciones = [...form.adiciones, adicion];
    }
    setForm({ ...form, adiciones: nuevasAdiciones });
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploading) return;
    if (!form.nombre || !form.nombre.trim()) {
      alert("Por favor ingresa el nombre del producto");
      return;
    }
    if (form.precio === "" || form.precio === null || isNaN(Number(form.precio)) || Number(form.precio) < 0) {
      alert("Por favor ingresa un precio de venta válido");
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
      await onSave({
        ...form,
        imagen: finalImageUrl,
        idCategoriaProducto: form.idCategoriaProducto || resolvedCat?.id || resolvedCat?.idCategoriaProducto || null,
        precio: Number(form.precio) || 0,
        fichaTecnica
      });

      setFileToUpload(null);
      setPreviewUrl("");
    } catch (err) {
      console.error("Error al guardar producto:", err);
      alert(err.message || "Error al subir imagen o guardar el producto");
    } finally {
      setUploading(false);
    }
  };

  const handleImageSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("El archivo seleccionado debe ser una imagen (JPG, PNG, WEBP).");
      return;
    }

    const maxSizeInBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      alert("La imagen no debe superar los 5 MB de tamaño.");
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
                  setForm({
                    ...form,
                    categoria: selectedName,
                    idCategoriaProducto: catObj?.id || catObj?.idCategoriaProducto || null
                  });
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
              <label className={labelCls}>Precio de Venta ($ COP)</label>
              <NumberInput
                required
                min="0"
                value={form.precio}
                onChange={(e) => setForm({ ...form, precio: e.target.value })}
                className={inputCls}
                placeholder="Ej. 25000"
              />
            </div>

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

            <div className="sm:col-span-2">
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

            <div className="sm:col-span-2 mt-4">
              <label className={labelCls}>Adiciones Disponibles</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {todasAdiciones.map((adicion) => {
                  const isSelected = form.adiciones.some((a) => a.idAdicion === adicion.idAdicion);
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
                          getAdditionEmoji(adicion.nombre, adicion.imagen)
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
            initialData={fichaTecnica}
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
