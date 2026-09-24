import { useState, useEffect, useRef } from "react";
import {
  X,
  Package,
  FlaskConical,
  Sparkles,
  UploadCloud,
  Loader2,
  Check,
  Info
} from "lucide-react";
import { NumberInput } from "@/shared/components/ui/NumberInput";
import { FichaTecnicaInsumo } from "@/features/fichas-tecnicas/componentes/FichaTecnicaInsumo";
import { fichasTecnicasService } from "@/features/fichas-tecnicas/servicios/fichasTecnicasService";
import { FoodIcon, AVAILABLE_FOOD_SLUGS } from "@/shared/components/ui/FoodIcon";
import { uploadImageToCloudinary } from "@/shared/servicios/cloudinaryService";
import { useNotifications } from "@/shared/hooks/useNotifications";

const inputCls = "w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-[#F05454] focus:border-transparent transition-colors text-sm placeholder:text-gray-400";
const labelCls = "block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1";

// Paleta rápida de iconos gastronómicos comunes para adiciones
const QUICK_ADICION_ICONS = [
  { slug: "bacon", label: "Tocineta" },
  { slug: "cheese", label: "Queso" },
  { slug: "fries", label: "Papas" },
  { slug: "sauce", label: "Salsa" },
  { slug: "onion", label: "Cebolla" },
  { slug: "pepper", label: "Jalapeño" },
  { slug: "meat", label: "Carne" },
  { slug: "avocado", label: "Guacamole" },
  { slug: "tomato", label: "Tomate" },
  { slug: "egg", label: "Huevo" },
  { slug: "bread", label: "Pan" },
  { slug: "pickle", label: "Pepinillos" }
];

// Detección automática de salsas y aderezos para requerir/sugerir rol de adición
export const isSalsaItem = (nombre = "", categoria = "") => {
  const n = String(nombre || "").toLowerCase().trim();
  const c = String(categoria || "").toLowerCase().trim();
  const salsaKeywords = [
    "salsa",
    "mayonesa",
    "mostaza",
    "aderezo",
    "tartara",
    "tártara",
    "bbq",
    "barbacoa",
    "guacamole",
    "suero",
    "chimichurri",
    "vinagreta",
    "ketchup",
    "catsup"
  ];
  return salsaKeywords.some((k) => n.includes(k)) || c.includes("salsa") || c.includes("aderezo");
};

export function InsumoModal({
  isOpen,
  onClose,
  onSave,
  insumo = null,
  categorias = [],
  proveedores = [],
  insumosDisponibles = []
}) {
  const notify = useNotifications();
  const isEditing = !!insumo;

  // Switch de tipo: "Base" (Normal) | "Preparado"
  const [tipo, setTipo] = useState("Base");

  // Estado del formulario
  const [form, setForm] = useState({
    nombre: "",
    idCategoriaInsumo: "",
    categoria: "",
    unidadMedida: "Kg",
    precioUnitario: 0,
    stock: 0,
    stockMinimo: 5,
    fechaExpedicion: "",
    fechaVencimiento: "",
    descripcion: "",
    estado: "Activo",
    // Adición integrada
    esAdicion: false,
    precioAdicion: 0,
    imagen: ""
  });

  // Estado para Ficha Técnica (Insumo Preparado)
  const [initialFichaTecnica, setInitialFichaTecnica] = useState(null);
  const [fichaTecnica, setFichaTecnica] = useState(null);

  // Subida de imagen
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    if (insumo) {
      const isPrep = insumo.tipo === "Preparado" || !!insumo.insumosReceta || (!insumo.idCategoriaInsumo && !insumo.idProveedor && (insumo.costo !== undefined || insumo.rendimiento !== undefined));
      setTipo(isPrep ? "Preparado" : "Base");

      const catNom = insumo.categoria || insumo.categoriaNombre || (categorias[0]?.nombre || "");
      const esSalsa = isSalsaItem(insumo.nombre, catNom);
      const esAdicionVal = !!(insumo.esAdicion === 1 || insumo.esAdicion === true || insumo.esAdicion === "1") || esSalsa;
      const precioAdicionVal = Number(insumo.precioAdicion || 0) > 0 ? Number(insumo.precioAdicion) : (esSalsa ? 1500 : 0);
      const imagenVal = insumo.imagen || (esSalsa ? "sauce" : "");

      setForm({
        nombre: insumo.nombre || "",
        idCategoriaInsumo: insumo.idCategoriaInsumo || (categorias[0]?.id || ""),
        categoria: catNom,
        unidadMedida: insumo.unidadMedida || (isPrep ? "und — unidad" : "Kg"),
        precioUnitario: insumo.precioUnitario || insumo.costo || insumo.precio || 0,
        idProveedor: insumo.idProveedor || "",
        proveedor: insumo.proveedor || insumo.proveedorNombre || "",
        stock: Math.max(0, Number(insumo.stock || 0)),
        stockMinimo: Math.max(0, Number(insumo.stockMinimo !== undefined && insumo.stockMinimo !== null ? insumo.stockMinimo : 5)),
        fechaExpedicion: insumo.fechaExpedicion || "",
        fechaVencimiento: insumo.fechaVencimiento || "",
        descripcion: insumo.descripcion || "",
        estado: insumo.estado === 1 || insumo.estado === "Activo" || insumo.estado === "1" ? "Activo" : "Inactivo",
        esAdicion: esAdicionVal,
        precioAdicion: precioAdicionVal,
        imagen: imagenVal
      });

      if (isPrep) {
        if (insumo.fichaTecnica) {
          setInitialFichaTecnica(insumo.fichaTecnica);
          setFichaTecnica(insumo.fichaTecnica);
        } else if (insumo.id) {
          fichasTecnicasService.getFichaByInsumoPreparado(insumo.id)
            .then(f => {
              if (f) {
                setInitialFichaTecnica(f);
                setFichaTecnica(f);
              }
            })
            .catch(console.error);
        }
      } else {
        setInitialFichaTecnica(null);
        setFichaTecnica(null);
      }
    } else {
      setTipo("Base");
      const defaultCat = categorias[0]?.nombre || "";
      const esSalsaDefault = isSalsaItem("", defaultCat);
      setForm({
        nombre: "",
        idCategoriaInsumo: categorias[0]?.id || categorias[0]?.idCategoriaInsumo || "",
        categoria: defaultCat,
        unidadMedida: "Kg",
        precioUnitario: 0,
        stock: 0,
        stockMinimo: 5,
        fechaExpedicion: "",
        fechaVencimiento: "",
        descripcion: "",
        estado: "Activo",
        esAdicion: esSalsaDefault,
        precioAdicion: esSalsaDefault ? 1500 : 0,
        imagen: esSalsaDefault ? "sauce" : "bacon"
      });
      setInitialFichaTecnica(null);
      setFichaTecnica(null);
    }
  }, [insumo, isOpen, categorias, proveedores]);

  if (!isOpen) return null;

  const handleTipoChange = (nuevoTipo) => {
    setTipo(nuevoTipo);
    // Ajustar unidad de medida por defecto según el tipo si está vacío
    if (nuevoTipo === "Preparado" && form.unidadMedida === "Kg") {
      setForm(prev => ({ ...prev, unidadMedida: "und — unidad" }));
    } else if (nuevoTipo === "Base" && form.unidadMedida === "und — unidad") {
      setForm(prev => ({ ...prev, unidadMedida: "Kg" }));
    }
  };

  const getUnitShort = (u) => {
    if (!u) return "und";
    const s = String(u).toLowerCase();
    if (s.includes("kg") || s.includes("kilo")) return "Kg";
    if (s.includes("gr") || s.includes("gram")) return "Gr";
    if (s.includes("lt") || s.includes("litr")) return "Lt";
    if (s.includes("ml") || s.includes("mili") || s.includes("cc")) return "Ml";
    if (s.includes("paq")) return "Paq";
    if (s.includes("porc")) return "Porción";
    return "Ud";
  };

  const handleNumberInput = (field, val) => {
    if (val === "") {
      setForm((prev) => ({ ...prev, [field]: "" }));
      return;
    }
    if (String(val).includes("-")) {
      val = String(val).replace(/-/g, "");
    }
    const sanitized = val.length > 1 && val.startsWith("0") && !val.startsWith("0.") ? val.replace(/^0+/, "") : val;
    setForm((prev) => ({ ...prev, [field]: sanitized }));
  };

  const handleNombreChange = (nuevoNombre) => {
    setForm((prev) => {
      const esSalsa = isSalsaItem(nuevoNombre, prev.categoria);
      return {
        ...prev,
        nombre: nuevoNombre,
        esAdicion: esSalsa ? true : prev.esAdicion,
        precioAdicion: esSalsa && (!prev.precioAdicion || Number(prev.precioAdicion) <= 0) ? 1500 : prev.precioAdicion,
        imagen: esSalsa && (!prev.imagen || prev.imagen === "bacon") ? "sauce" : prev.imagen
      };
    });
  };

  const handleCategoriaChange = (catId, catNombre) => {
    setForm((prev) => {
      const esSalsa = isSalsaItem(prev.nombre, catNombre);
      return {
        ...prev,
        idCategoriaInsumo: catId,
        categoria: catNombre,
        esAdicion: esSalsa ? true : prev.esAdicion,
        precioAdicion: esSalsa && (!prev.precioAdicion || Number(prev.precioAdicion) <= 0) ? 1500 : prev.precioAdicion,
        imagen: esSalsa && (!prev.imagen || prev.imagen === "bacon") ? "sauce" : prev.imagen
      };
    });
  };

  // Subida de imagen a Cloudinary
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      notify.warning("Archivo Inválido", "Por favor selecciona un archivo de imagen válido.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      notify.warning("Archivo muy pesado", "La imagen no debe superar los 5MB.");
      return;
    }

    setUploading(true);
    try {
      const url = await uploadImageToCloudinary(file);
      setForm(prev => ({ ...prev, imagen: url }));
      notify.success("Imagen Subida", "La imagen se cargó correctamente.");
    } catch (err) {
      console.error(err);
      notify.error("Error al subir", "No se pudo subir la imagen a la nube.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!form.nombre.trim()) {
      notify.warning("Campo Requerido", "Por favor escribe el nombre del insumo.");
      return;
    }

    // Regla de negocio: Las salsas y aderezos deben ser adiciones para el menú
    const esSalsa = isSalsaItem(form.nombre, form.categoria);

    // Si el usuario habilitó manualmente el rol de adición (y no es salsa), exigir precio > 0
    if (form.esAdicion && !esSalsa) {
      const pAdic = Number(form.precioAdicion);
      if (isNaN(pAdic) || pAdic <= 0) {
        notify.warning(
          "Precio de Adición Requerido",
          "Al habilitar este insumo como adición, debes ingresar un precio de venta mayor a $0."
        );
        return;
      }
    }

    const esAdicionFinal = form.esAdicion || esSalsa;
    const precioAdicionFinal = esAdicionFinal
      ? (Number(form.precioAdicion) > 0 ? Number(form.precioAdicion) : (esSalsa ? 1500 : 0))
      : 0;
    const imagenFinal = esAdicionFinal
      ? (form.imagen || (esSalsa ? "sauce" : "bacon"))
      : "";

    if (tipo === "Preparado") {
      // Validaciones de Insumo Preparado y Ficha Técnica
      const pUnit = Number(form.precioUnitario);
      if (isNaN(pUnit) || pUnit < 0) {
        notify.warning("Costo Requerido", "Por favor ingresa un costo o precio válido para el preparado.");
        return;
      }

      const ft = fichaTecnica || {};
      const missingFields = [];
      const ingredientes = ft.detalles || ft.insumos || ft.ingredientes || [];

      if (!ingredientes || ingredientes.length === 0) {
        missingFields.push("Ingredientes / Insumos Base (mínimo 1)");
      }
      if (!ft.procedimiento || !ft.procedimiento.trim()) {
        missingFields.push("Procedimiento de Preparación");
      }
      if (!ft.tiempoPreparacion || Number(ft.tiempoPreparacion) < 1) {
        missingFields.push("Tiempo de Preparación (mínimo 1 min)");
      }
      if (!ft.rendimiento || !String(ft.rendimiento).trim()) {
        missingFields.push("Rendimiento / Porciones");
      }
      if (!ft.condicionesAlmacenamiento || !ft.condicionesAlmacenamiento.trim()) {
        missingFields.push("Condiciones de Almacenamiento");
      }
      if (!ft.vidaUtil || !ft.vidaUtil.trim()) {
        missingFields.push("Vida Útil");
      }
      if (!ft.especificaciones || !ft.especificaciones.trim()) {
        missingFields.push("Especificaciones Técnicas / Calidad");
      }
      if (!ft.caracteristicas || !ft.caracteristicas.trim()) {
        missingFields.push("Características Organolépticas");
      }
      if (!ft.informacionNutricional || !ft.informacionNutricional.trim()) {
        missingFields.push("Información Nutricional");
      }

      if (missingFields.length > 0) {
        notify.error(
          "Ficha Técnica Incompleta",
          "Primero debes completar y guardar la ficha técnica con todos sus campos obligatorios."
        );
        return;
      }

      onSave({
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        precio: Number(form.precioUnitario) || 0,
        precioUnitario: Number(form.precioUnitario) || 0,
        unidadMedida: form.unidadMedida,
        tipo: "Preparado",
        estado: form.estado,
        esAdicion: esAdicionFinal,
        precioAdicion: precioAdicionFinal,
        imagen: imagenFinal,
        fichaTecnica: {
          ...ft,
          procedimiento: ft.procedimiento.trim(),
          tiempoPreparacion: Number(ft.tiempoPreparacion) || 1,
          rendimiento: String(ft.rendimiento).trim(),
          especificaciones: ft.especificaciones.trim(),
          caracteristicas: ft.caracteristicas.trim(),
          informacionNutricional: ft.informacionNutricional.trim(),
          condicionesAlmacenamiento: ft.condicionesAlmacenamiento.trim(),
          vidaUtil: ft.vidaUtil.trim(),
          observaciones: (ft.observaciones || "").trim(),
          detalles: ingredientes
        },
        ingredientes
      });
    } else {
      // Guardado como Insumo Base / Directo
      const defaultCatId = form.idCategoriaInsumo || (categorias[0]?.id || categorias[0]?.idCategoriaInsumo || 1);
      const defaultProvId = form.idProveedor || (proveedores[0]?.id || proveedores[0]?.idProveedor || null);

      onSave({
        ...form,
        nombre: form.nombre.trim(),
        tipo: "Base",
        idCategoriaInsumo: defaultCatId,
        idProveedor: defaultProvId,
        precioUnitario: Math.max(0, form.precioUnitario === "" ? 0 : Number(form.precioUnitario)),
        stock: Math.max(0, form.stock === "" ? 0 : Number(form.stock)),
        stockMinimo: Math.max(0, form.stockMinimo === "" ? 0 : Number(form.stockMinimo)),
        esAdicion: esAdicionFinal,
        precioAdicion: precioAdicionFinal,
        imagen: imagenFinal
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden border border-gray-100 dark:border-gray-800">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F05454]/10 text-[#F05454] flex items-center justify-center font-bold">
              {tipo === "Preparado" ? (
                <FlaskConical className="w-5 h-5" />
              ) : (
                <Package className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {isEditing ? `Editar ${form.nombre || "Insumo"}` : "Nuevo Insumo"}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {tipo === "Preparado"
                  ? "Configura un insumo elaborado a partir de una receta o ficha técnica"
                  : "Registra un insumo base o materia prima para el inventario"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0" noValidate>
          {/* Scrollable Form Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-5">
            {/* ════ SWITCH / SELECTOR TIPO DE INSUMO (Estilo Proveedores) ════ */}
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Tipo de Insumo</label>
              <div className="grid grid-cols-2 gap-2 bg-gray-100 dark:bg-gray-800/80 p-1.5 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                <button
                  type="button"
                  onClick={() => handleTipoChange("Base")}
                  className={`flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    tipo === "Base"
                      ? "bg-white dark:bg-gray-900 text-[#F05454] shadow-sm ring-1 ring-black/5"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>Insumo Base / Materia Prima</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTipoChange("Preparado")}
                  className={`flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    tipo === "Preparado"
                      ? "bg-white dark:bg-gray-900 text-[#F05454] shadow-sm ring-1 ring-black/5"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  <FlaskConical className="w-4 h-4" />
                  <span>Insumo Preparado (Receta)</span>
                </button>
              </div>
            </div>

            {/* ════ INSUMO BASE / DIRECTO ════ */}
            {tipo === "Base" && (
              <div className="space-y-4">
                {/* Banner de Guía de Unidades y Stock */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-100 dark:border-blue-900/50 rounded-2xl p-3.5 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    <Info className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
                    <p className="font-semibold text-blue-950 dark:text-blue-100">Control de Inventario y Fórmulas:</p>
                    Si compras en <strong>Kilogramos (Kg)</strong> o <strong>Litros (Lt)</strong>, en las recetas y ventas puedes usar porciones en <strong>Gramos (Gr)</strong> o <strong>Mililitros (Ml)</strong> y el sistema convertirá las proporciones automáticamente al vender.
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Nombre del Insumo <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={form.nombre}
                      onChange={(e) => handleNombreChange(e.target.value)}
                      className={inputCls}
                      placeholder="Ej. Queso Cheddar en Lonchas o Pan Brioche"
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Categoría</label>
                    <select
                      value={String(form.idCategoriaInsumo || "")}
                      onChange={(e) => {
                        const val = e.target.value;
                        const selectedCat = categorias.find(c => String(c.id || c.idCategoriaInsumo) === String(val) || c.nombre === val);
                        const catId = selectedCat ? (selectedCat.id || selectedCat.idCategoriaInsumo) : (val ? Number(val) : "");
                        const catNom = selectedCat ? selectedCat.nombre : val;
                        handleCategoriaChange(catId, catNom);
                      }}
                      className={`${inputCls} cursor-pointer`}
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
                  </div>

                  {/* Proveedor eliminado: se asigna desde Gestión de Compras */}

                  <div>
                    <label className={labelCls}>Unidad de Medida / Presentación</label>
                    <select
                      value={form.unidadMedida}
                      onChange={(e) => setForm({ ...form, unidadMedida: e.target.value })}
                      className={`${inputCls} cursor-pointer`}
                    >
                      <option value="Kg">Kilogramos (Kg) — Peso / Masa</option>
                      <option value="Gr">Gramos (Gr) — Peso / Masa</option>
                      <option value="Lt">Litros (Lt) — Volumen / Líquidos</option>
                      <option value="Ml">Mililitros (Ml) — Volumen / Líquidos</option>
                      <option value="Unidad">Unidad (Ud) — Conteo individual</option>
                      <option value="Paquete">Paquete — Presentación cerrada</option>
                      <option value="Porción">Porción — Ración individual</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelCls}>
                      Precio de Compra (${form.unidadMedida ? ` / ${getUnitShort(form.unidadMedida)}` : ""})
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm pointer-events-none">$</span>
                      <NumberInput
                        min="0"
                        step="0.01"
                        value={form.precioUnitario}
                        onChange={(e) => handleNumberInput("precioUnitario", e.target.value)}
                        className={`${inputCls} pl-8 pr-20`}
                        placeholder="0.00"
                      />
                      <span className="absolute right-8 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase pointer-events-none">
                        / {getUnitShort(form.unidadMedida)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>
                      Stock Inicial / Actual ({getUnitShort(form.unidadMedida)})
                    </label>
                    <div className="relative">
                      <NumberInput
                        min="0"
                        step={form.unidadMedida === "Kg" || form.unidadMedida === "Lt" ? "0.01" : "1"}
                        value={form.stock}
                        onChange={(e) => handleNumberInput("stock", e.target.value)}
                        className={`${inputCls} pr-20 font-semibold`}
                        placeholder="0"
                      />
                      <span className="absolute right-8 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 pointer-events-none">
                        {getUnitShort(form.unidadMedida)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>
                      Stock Mínimo Alerta ({getUnitShort(form.unidadMedida)})
                    </label>
                    <div className="relative">
                      <NumberInput
                        min="0"
                        step={form.unidadMedida === "Kg" || form.unidadMedida === "Lt" ? "0.01" : "1"}
                        value={form.stockMinimo}
                        onChange={(e) => handleNumberInput("stockMinimo", e.target.value)}
                        className={`${inputCls} pr-20`}
                        placeholder="5"
                      />
                      <span className="absolute right-8 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800 pointer-events-none">
                        {getUnitShort(form.unidadMedida)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Fecha de Expedición</label>
                    <input
                      type="date"
                      value={form.fechaExpedicion}
                      onChange={(e) => setForm({ ...form, fechaExpedicion: e.target.value })}
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Fecha de Vencimiento</label>
                    <input
                      type="date"
                      value={form.fechaVencimiento}
                      onChange={(e) => setForm({ ...form, fechaVencimiento: e.target.value })}
                      className={inputCls}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelCls}>Descripción</label>
                    <textarea
                      rows={2}
                      value={form.descripcion}
                      onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                      className={inputCls}
                      placeholder="Descripción u observaciones sobre el insumo..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ════ INSUMO PREPARADO (RECETA / FICHA TÉCNICA) ════ */}
            {tipo === "Preparado" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className={labelCls}>
                      Nombre del Insumo Preparado <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.nombre}
                      onChange={(e) => handleNombreChange(e.target.value)}
                      className={inputCls}
                      placeholder="Ej. Salsa Chazin de la Casa, Carne Molida Sazonada, Cebolla Caramelizada..."
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelCls}>Descripción u Observaciones</label>
                    <textarea
                      rows={2}
                      value={form.descripcion}
                      onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                      className={`${inputCls} resize-none`}
                      placeholder="Descripción, características sensoriales o modo de uso del preparado..."
                    />
                  </div>

                  <div>
                    <label className={labelCls}>
                      Costo / Precio Estimado <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm pointer-events-none">$</span>
                      <NumberInput
                        min="0"
                        required
                        value={form.precioUnitario}
                        onChange={(e) => handleNumberInput("precioUnitario", e.target.value)}
                        className={`${inputCls} pl-8`}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Unidad de Medida</label>
                    <select
                      value={form.unidadMedida}
                      onChange={(e) => setForm({ ...form, unidadMedida: e.target.value })}
                      className={`${inputCls} cursor-pointer`}
                    >
                      <option value="und — unidad">und — unidad</option>
                      <option value="porción">porción</option>
                      <option value="Kg">Kg — Kilogramos</option>
                      <option value="Gr">Gr — Gramos</option>
                      <option value="Lt">Lt — Litros</option>
                      <option value="Ml">Ml — Mililitros</option>
                      <option value="paq">paq — Paquete</option>
                    </select>
                  </div>
                </div>

                {/* Sección Ficha Técnica del Preparado */}
                <div className="pt-2">
                  <FichaTecnicaInsumo
                    insumoId={insumo?.id}
                    insumoName={form.nombre}
                    initialData={initialFichaTecnica}
                    onChange={(data) => setFichaTecnica(data)}
                    onSave={(data) => setFichaTecnica(data)}
                  />
                </div>
              </div>
            )}

            {/* ════ ESTADO GENERAL DEL INSUMO ════ */}
            <div>
              <label className={labelCls}>Estado en el Sistema</label>
              <select
                value={form.estado}
                onChange={(e) => setForm({ ...form, estado: e.target.value })}
                className={`${inputCls} cursor-pointer font-medium`}
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>

            {/* ════ SELECCIONABLE PARA UTILIZAR COMO ADICIÓN ════ */}
            <div className={`p-4 rounded-3xl border transition-all ${
              form.esAdicion || isSalsaItem(form.nombre, form.categoria)
                ? "border-purple-300 dark:border-purple-800/80 bg-purple-50/40 dark:bg-purple-950/20 shadow-xs"
                : "border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40"
            }`}>
              {isSalsaItem(form.nombre, form.categoria) && (
                <div className="mb-3 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 flex items-center gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                  <span className="text-base leading-none">🥫</span>
                  <div className="leading-snug">
                    <strong>Salsa / Aderezo detectado:</strong> Las salsas se configuran automáticamente como adición para el menú ($1.500).
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-colors ${
                    form.esAdicion
                      ? "bg-purple-600 text-white shadow-xs"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  }`}>
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <span>¿Disponible como adición en el menú?</span>
                      {form.esAdicion && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                          Adición Activa
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Permite que clientes y cajeros seleccionen este insumo como un extra adicional de pago en productos
                    </p>
                  </div>
                </div>

                {/* Switch Toggle */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.esAdicion}
                  onClick={() => setForm(prev => ({ ...prev, esAdicion: !prev.esAdicion }))}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    form.esAdicion ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      form.esAdicion ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Subformulario dinámico de Adición */}
              {form.esAdicion && (
                <div className="mt-4 pt-4 border-t border-purple-100 dark:border-purple-900/40 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>
                        Precio de Venta de la Adición ($) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-600 dark:text-purple-400 font-bold text-sm pointer-events-none">$</span>
                        <NumberInput
                          min="0"
                          step="100"
                          required={form.esAdicion}
                          value={form.precioAdicion}
                          onChange={(e) => handleNumberInput("precioAdicion", e.target.value)}
                          className={`${inputCls} pl-8 font-bold text-purple-700 dark:text-purple-300`}
                          placeholder="Ej. 3500"
                        />
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">Valor extra que se cobrará al agregar esta adición.</p>
                    </div>

                    <div>
                      <label className={labelCls}>Ícono o Imagen de la Adición</label>
                      <div className="flex items-center gap-2">
                        {/* Preview */}
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-900 border-2 border-purple-300 dark:border-purple-700 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                          {form.imagen && (form.imagen.startsWith("http") || form.imagen.startsWith("/")) ? (
                            <img src={form.imagen} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <FoodIcon name={form.imagen || form.nombre} size={22} stroke={1.75} className="text-purple-600 dark:text-purple-400" />
                          )}
                        </div>

                        {/* Input slug / URL */}
                        <input
                          type="text"
                          value={form.imagen}
                          onChange={(e) => setForm({ ...form, imagen: e.target.value })}
                          className="flex-1 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs focus:ring-2 focus:ring-purple-500"
                          placeholder="Slug de ícono (ej. bacon) o URL..."
                        />

                        {/* Botón subir imagen */}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition shadow-xs cursor-pointer disabled:opacity-50 shrink-0"
                          title="Subir imagen"
                        >
                          {uploading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <UploadCloud className="w-3.5 h-3.5" />
                          )}
                          <span className="hidden sm:inline">{uploading ? "..." : "Subir"}</span>
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageFileChange}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Paleta rápida de íconos gastronómicos */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                      O elige rápidamente un ícono sugerido:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_ADICION_ICONS.map((ic) => {
                        const isSelected = form.imagen === ic.slug;
                        return (
                          <button
                            key={ic.slug}
                            type="button"
                            onClick={() => setForm({ ...form, imagen: ic.slug })}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs transition-all cursor-pointer ${
                              isSelected
                                ? "bg-purple-600 text-white font-bold shadow-xs scale-105"
                                : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-purple-50 hover:border-purple-300"
                            }`}
                          >
                            <FoodIcon name={ic.slug} size={14} stroke={1.75} />
                            <span>{ic.label}</span>
                            {isSelected && <Check className="w-3 h-3 ml-0.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Modal Sticky Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-gray-700/60 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-bold text-white bg-[#F05454] hover:bg-[#d84343] rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center gap-2"
            >
              {tipo === "Preparado" ? (
                <FlaskConical className="w-4 h-4" />
              ) : (
                <Package className="w-4 h-4" />
              )}
              <span>{isEditing ? "Guardar Cambios" : tipo === "Preparado" ? "Crear Insumo Preparado" : "Crear Insumo"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InsumoModal;
