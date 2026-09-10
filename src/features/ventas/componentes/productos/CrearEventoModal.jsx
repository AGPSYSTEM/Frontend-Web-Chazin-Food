import { useState, useEffect } from "react";
import { X, Zap, PackagePlus, Tag, ArrowDownUp, Search, Trash2, CalendarClock, Sparkles, PlusCircle } from "lucide-react";
import { eventosService } from "../../servicios/eventosService";
import { categoriaProductosService } from "../../servicios/categoriaProductosService";
import { useNotifications } from "@/shared/hooks/useNotifications";

const TIPO_EVENTO_OPTIONS = [
  { value: "Añadir Insumos", icon: PackagePlus, label: "Añadir Insumos" },
  { value: "Promoción Precio", icon: Tag, label: "Promoción Precio" },
  { value: "Descuento", icon: ArrowDownUp, label: "Descuento" }
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
      setProdProcedimiento("");

      // Fetch insumos and productos
      eventosService.getInsumos().then((data) => {
        setInsumosBD(data || []);
      }).catch(() => setInsumosBD([]));

      categoriaProductosService.getCategorias().then((data) => {
        setCategoriasBD(data || []);
      }).catch(() => setCategoriasBD([]));

      if (!producto) {
        eventosService.getProductos().then((data) => {
          setProductosBD(data || []);
        }).catch(() => setProductosBD([]));
      }
    }
  }, [isOpen]);

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
      setSaving(true);
      try {
        const payload = {
          crearComoProducto: true,
          nombreEvento: nombreEvento.trim(),
          descripcion: (descripcion || prodDescripcion).trim(),
          tipoEvento: "EDICION_LIMITADA",
          isTemporal: true,
          fechaInicio: fechaInicio || new Date().toISOString().split("T")[0],
          fechaFin: fechaFin || new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          nuevoPrecio: Number(prodPrecioEvento),
          descuento: Math.round(((Number(prodPrecioRegular) - Number(prodPrecioEvento)) / Number(prodPrecioRegular)) * 100),
          estado: "Activo",
          productoNuevo: {
            nombre: prodNombre.trim(),
            descripcion: (prodDescripcion || descripcion).trim() || "Edición especial gastronómica de tiempo limitado.",
            precio: Number(prodPrecioRegular),
            idCategoriaProducto: Number(prodCategoria || 3),
            imagen: prodImagen.trim(),
            procedimiento: prodProcedimiento.trim() || 'Preparar con los más selectos ingredientes de temporada y empaque festivo.'
          }
        };

        await eventosService.createEvento(payload);
        success("¡Producto de Evento Creado!", `Se ha creado "${prodNombre.trim()}" con su variante, ficha técnica y evento activo en la tienda.`);
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
      <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh]">
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
            className="p-2 text-white/70 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
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
            <div className="space-y-5 animate-in fade-in duration-200">
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
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 font-medium"
                />
              </div>

              {/* Nombre del Producto a Vender */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Nombre del Producto en Menú *
                </label>
                <input
                  type="text"
                  placeholder="ej. Hamburguesa Burger Fest Trufada Chazin"
                  value={prodNombre}
                  onChange={(e) => setProdNombre(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Categoría del Menú *
                </label>
                <select
                  value={prodCategoria}
                  onChange={(e) => setProdCategoria(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 font-medium cursor-pointer"
                >
                  {categoriasBD.filter(c => c.idCategoriaProducto !== 0).map((cat) => (
                    <option key={cat.idCategoriaProducto || cat.id} value={cat.idCategoriaProducto || cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Precios: Regular vs Evento */}
              <div className="grid grid-cols-2 gap-4">
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
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 font-bold"
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
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              {/* URL de Imagen */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  URL de Imagen del Producto
                </label>
                <input
                  type="text"
                  placeholder="https://res.cloudinary.com/... o enlace web"
                  value={prodImagen}
                  onChange={(e) => setProdImagen(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 font-mono text-xs"
                />
              </div>

              {/* Procedimiento de Preparación (Ficha Técnica) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Procedimiento de Preparación (Ficha Técnica Oficial)
                </label>
                <textarea
                  rows={2}
                  placeholder="Sellar la carne a la plancha a término medio. Tostar pan brioche con mantequilla artesanal. Untar salsa festiva..."
                  value={prodProcedimiento}
                  onChange={(e) => setProdProcedimiento(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 resize-none text-xs"
                />
              </div>

              {/* Fechas del Evento */}
              <div className="grid grid-cols-2 gap-4 p-4 border border-purple-100 dark:border-purple-900/30 rounded-2xl bg-purple-50/50 dark:bg-purple-900/10">
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
