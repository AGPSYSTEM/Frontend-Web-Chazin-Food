import { useState, useEffect } from "react";
import { X, Zap, PackagePlus, Tag, ArrowDownUp, Search, Trash2, CalendarClock } from "lucide-react";
import { eventosService } from "../../servicios/eventosService";

const TIPO_EVENTO_OPTIONS = [
  { value: "Añadir Insumos", icon: PackagePlus, label: "Añadir Insumos" },
  { value: "Promoción Precio", icon: Tag, label: "Promoción Precio" },
  { value: "Descuento", icon: ArrowDownUp, label: "Descuento" }
];

export function CrearEventoModal({ isOpen, onClose, producto, onCreated }) {
  const [tipoEvento, setTipoEvento] = useState("Añadir Insumos");
  const [isTemporal, setIsTemporal] = useState(false);
  const [nombreEvento, setNombreEvento] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  
  // States for Insumos
  const [accion, setAccion] = useState("Agregar");
  const [insumoSearch, setInsumoSearch] = useState("");
  const [insumosBD, setInsumosBD] = useState([]);
  const [filteredInsumos, setFilteredInsumos] = useState([]);
  const [showInsumoDropdown, setShowInsumoDropdown] = useState(false);
  const [insumosSeleccionados, setInsumosSeleccionados] = useState([]);

  // States for Promo/Desc
  const [nuevoPrecio, setNuevoPrecio] = useState("");
  const [descuento, setDescuento] = useState("");
  
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

      // Fetch insumos
      eventosService.getInsumos().then((data) => {
        setInsumosBD(data || []);
      }).catch(() => setInsumosBD([]));
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
    if (!nombreEvento.trim()) return;
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
      } else if (tipoEvento === "Descuento") {
        payload.descuento = Number(descuento);
      } else if (tipoEvento === "Promoción Precio") {
        payload.nuevoPrecio = Number(nuevoPrecio);
      }

      await eventosService.createEvento(payload);
      if (onCreated) onCreated();
      onClose();
    } catch (err) {
      console.error("Error al crear evento:", err);
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
              <h2 className="text-xl font-bold text-white">Crear Evento</h2>
              <p className="text-purple-200 text-sm">{producto?.nombre || "Producto"}</p>
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
          {(tipoEvento === "Descuento" || tipoEvento === "Promoción Precio") && (
            <div className="p-5 bg-gray-50 dark:bg-gray-800 rounded-2xl space-y-4 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                {tipoEvento === "Descuento" ? "Detalles del Descuento" : "Detalles de la Promoción"}
              </h3>
              
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
                    <label className="block text-xs font-medium text-gray-500 mb-1">Nuevo Precio Promocional</label>
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
            </div>
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
