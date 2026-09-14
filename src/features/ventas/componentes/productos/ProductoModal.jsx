import { useState, useEffect, useRef } from "react";
import { X, Utensils, UploadCloud, Loader2, Plus, Trash2, Layers } from "lucide-react";
import { NumberInput } from "@/shared/components/ui/NumberInput";
import { FichaTecnicaProducto } from "@/features/fichas-tecnicas/componentes/FichaTecnicaProducto";
import { adicionesService } from "@/features/compras/servicios/adicionesService";
import { productosService } from "@/features/ventas/servicios/productosService";
import { getAdditionEmoji } from "@/shared/utils/foodEmojiUtils";
import { uploadImageToCloudinary, deleteImageFromCloudinary } from "@/shared/servicios/cloudinaryService";
import { useNotifications } from "@/shared/hooks/useNotifications";

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

      // Inicializar variantes existentes o crear una por defecto basada en el producto
      const rawVars = Array.isArray(producto.variantes) && producto.variantes.length > 0
        ? producto.variantes
        : [];
      
      if (rawVars.length > 0) {
        setVariantes(rawVars.map((v) => ({
          idVariante: v.idVariante || v.id || null,
          nombre: v.nombre || "",
          precio: v.precio !== undefined ? v.precio : (producto.precio || "")
        })));
      } else {
        setVariantes([
          {
            idVariante: null,
            nombre: producto.nombre ? `${producto.nombre} - Estándar` : "Estándar",
            precio: producto.precio !== undefined ? producto.precio : ""
          }
        ]);
      }
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
      setVariantes([
        {
          idVariante: null,
          nombre: "Estándar",
          precio: ""
        }
      ]);
    }
  }, [producto, isOpen, categorias]);

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

  // Administrador de variantes y presentaciones
  const handleAddVariante = () => {
    setVariantes((prev) => [
      ...prev,
      {
        idVariante: null,
        nombre: "",
        precio: form.precio !== "" ? form.precio : ""
      }
    ]);
  };

  const handleUpdateVariante = (index, field, value) => {
    setVariantes((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      // Mantener sincronizado el precio base del formulario con la primera variante
      if (field === "precio" && index === 0) {
        setForm((f) => ({ ...f, precio: value }));
      }
      return updated;
    });
  };

  const handleRemoveVariante = (index) => {
    if (variantes.length <= 1) return;
    setVariantes((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (index === 0 && updated.length > 0) {
        setForm((f) => ({ ...f, precio: updated[0].precio }));
      }
      return updated;
    });
  };

  const handleMainPriceChange = (newPrice) => {
    setForm((f) => ({ ...f, precio: newPrice }));
    setVariantes((prev) => {
      if (prev.length === 0) {
        return [{ idVariante: null, nombre: "Estándar", precio: newPrice }];
      }
      const updated = [...prev];
      updated[0] = { ...updated[0], precio: newPrice };
      return updated;
    });
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
    if (variantes.length === 0) {
      notify.warning("Variantes Requeridas", "El producto debe tener al menos una variante o presentación registrada");
      return;
    }

    for (let i = 0; i < variantes.length; i++) {
      const v = variantes[i];
      if (!v.nombre || !v.nombre.trim()) {
        notify.warning("Campo Requerido", `Por favor escribe el nombre de la variante o presentación #${i + 1} (ej. "Original 400ml" o "Estándar")`);
        return;
      }
      if (v.precio === "" || v.precio === null || isNaN(Number(v.precio)) || Number(v.precio) < 0) {
        notify.warning("Campo Requerido", `Por favor ingresa un precio válido para la variante "${v.nombre}"`);
        return;
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
      const basePrice = Number(variantes[0]?.precio !== undefined && variantes[0]?.precio !== "" ? variantes[0].precio : form.precio) || 0;

      await onSave({
        ...form,
        imagen: finalImageUrl,
        idCategoriaProducto: form.idCategoriaProducto || resolvedCat?.id || resolvedCat?.idCategoriaProducto || null,
        precio: basePrice,
        variantes: variantes.map((v) => ({
          idVariante: v.idVariante || null,
          nombre: v.nombre.trim(),
          precio: Number(v.precio) >= 0 ? Number(v.precio) : basePrice
        })),
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

            {/* Sección de Variantes y Presentaciones */}
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
                      Personaliza sabores (ej. Original, Sin Azúcar) o tamaños (ej. 400ml, 1.5L, Personal) y sus precios.
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

              <div className="space-y-2.5 pt-1">
                {variantes.map((v, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-700/80 shadow-2xs"
                  >
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      {idx === 0 && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          Base
                        </span>
                      )}
                    </div>

                    <div className="flex-1">
                      <input
                        type="text"
                        value={v.nombre}
                        onChange={(e) => handleUpdateVariante(idx, "nombre", e.target.value)}
                        placeholder={idx === 0 ? "Nombre presentación base (ej. Sabor Original 400ml)" : "Ej. Sin Azúcar / Light 400ml"}
                        className="w-full px-3 py-1.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg text-xs focus:ring-2 focus:ring-[#F05454] focus:border-transparent transition-colors"
                      />
                    </div>

                    <div className="w-full sm:w-36 shrink-0">
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">$</span>
                        <NumberInput
                          min="0"
                          value={v.precio}
                          onChange={(e) => handleUpdateVariante(idx, "precio", e.target.value)}
                          placeholder="Precio"
                          className="w-full pl-6 pr-2 py-1.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#F05454] focus:border-transparent transition-colors"
                        />
                      </div>
                    </div>

                    <div className="shrink-0 flex justify-end">
                      {variantes.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => handleRemoveVariante(idx)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar variante"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="w-7 h-7 flex items-center justify-center text-gray-300 dark:text-gray-600 text-xs" title="Debe existir al menos 1 presentación">
                          —
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400 bg-white/60 dark:bg-gray-800/40 p-2 rounded-lg border border-orange-100 dark:border-orange-950">
                <span className="text-orange-500">💡</span>
                <span>
                  {variantes.length > 1
                    ? "Tus clientes verán automáticamente estas opciones para elegir su sabor o tamaño favorito al ordenar en la carta."
                    : "Si tu producto tiene diferentes sabores (ej. Coca-Cola Original y Sin Azúcar) o tamaños, haz clic en \"Agregar Variante\"."}
                </span>
              </div>
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

            {/* Configuración de Combo y Bebidas Incluidas */}
            <div className="sm:col-span-2 border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl shrink-0">🥤</span>
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
