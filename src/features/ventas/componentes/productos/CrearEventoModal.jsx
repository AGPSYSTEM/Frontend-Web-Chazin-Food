import { useState, useEffect } from "react";
import { X, Zap, Clock, Globe, Tag, ArrowDownUp, Search } from "lucide-react";
import { eventosService } from "../../servicios/eventosService";

const TIPO_EVENTO_OPTIONS = [
  { value: "Insumo Temporal", icon: Clock, label: "Insumo Temporal" },
  { value: "Insumo Permanente", icon: Globe, label: "Insumo Permanente" },
  { value: "Promoción Precio", icon: Tag, label: "Promoción Precio" },
  { value: "Descuento", icon: ArrowDownUp, label: "Descuento" }
];

export function CrearEventoModal({ isOpen, onClose, producto, onCreated }) {
  const [tipoEvento, setTipoEvento] = useState("Insumo Temporal");
  const [nombreEvento, setNombreEvento] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [accion, setAccion] = useState("Agregar");
  const [insumoSearch, setInsumoSearch] = useState("");
  const [cantidad, setCantidad] = useState("1");
  const [unidad, setUnidad] = useState("und");
  const [insumos, setInsumos] = useState([]);
  const [filteredInsumos, setFilteredInsumos] = useState([]);
  const [selectedInsumo, setSelectedInsumo] = useState(null);
  const [showInsumoDropdown, setShowInsumoDropdown] = useState(false);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset form
      setTipoEvento("Insumo Temporal");
      setNombreEvento("");
      setDescripcion("");
      setAccion("Agregar");
      setInsumoSearch("");
      setCantidad("1");
      setUnidad("und");
      setSelectedInsumo(null);
      setShowInsumoDropdown(false);
      const today = new Date().toISOString().split("T")[0];
      setFechaInicio(today);
      setFechaFin(today);
      // Fetch insumos
      eventosService.getInsumos().then((data) => {
        setInsumos(data || []);
      }).catch(() => setInsumos([]));
    }
  }, [isOpen]);

  useEffect(() => {
    if (insumoSearch.trim() === "") {
      setFilteredInsumos([]);
      setShowInsumoDropdown(false);
    } else {
      const term = insumoSearch.toLowerCase();
      const results = insumos.filter(
        (i) =>
          i.nombre?.toLowerCase().includes(term) ||
          String(i.id || i.idInsumo || "").includes(term)
      );
      setFilteredInsumos(results.slice(0, 8));
      setShowInsumoDropdown(results.length > 0);
    }
  }, [insumoSearch, insumos]);

  const handleSelectInsumo = (insumo) => {
    setSelectedInsumo(insumo);
    setInsumoSearch(insumo.nombre);
    setUnidad(insumo.unidadMedida || "und");
    setShowInsumoDropdown(false);
  };

  const handleSubmit = async () => {
    if (!nombreEvento.trim()) return;
    setSaving(true);
    try {
      await eventosService.createEvento({
        nombreEvento: nombreEvento.trim(),
        descripcion: descripcion.trim(),
        fechaInicio,
        fechaFin,
        estado: "Activo"
      });
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
            <div className="text-4xl">🍟</div>
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
              Tipo de Evento
            </label>
            <div className="grid grid-cols-2 gap-3">
              {TIPO_EVENTO_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isActive = tipoEvento === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTipoEvento(opt.value)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      isActive
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
                        : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? "text-purple-500" : "text-gray-400"}`} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Título del Evento */}
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

          {/* Descripción */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Descripción
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe brevemente este evento..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none"
            />
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Fecha Inicio
              </label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Fecha Fin
              </label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>

          {/* Detalle del Insumo section */}
          {(tipoEvento === "Insumo Temporal" || tipoEvento === "Insumo Permanente") && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl space-y-4 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Detalle del Insumo</h3>

              {/* Acción radio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Acción</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="accion"
                      value="Agregar"
                      checked={accion === "Agregar"}
                      onChange={() => setAccion("Agregar")}
                      className="accent-purple-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Agregar</span>
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
                    <span className="text-sm text-gray-700 dark:text-gray-300">Eliminar</span>
                  </label>
                </div>
              </div>

              {/* Insumo search + Cantidad + Unidad */}
              <div className="grid grid-cols-3 gap-3">
                {/* Insumo name with autocomplete */}
                <div className="relative">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Nombre del Insumo</label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={insumoSearch}
                      onChange={(e) => {
                        setInsumoSearch(e.target.value);
                        setSelectedInsumo(null);
                      }}
                      onFocus={() => {
                        if (filteredInsumos.length > 0) setShowInsumoDropdown(true);
                      }}
                      placeholder="Ej: Carne extra"
                      className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  {/* Autocomplete dropdown */}
                  {showInsumoDropdown && (
                    <div className="absolute z-50 top-full mt-1 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                      {filteredInsumos.map((insumo) => (
                        <button
                          key={insumo.id || insumo.idInsumo}
                          type="button"
                          onClick={() => handleSelectInsumo(insumo)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-purple-50 dark:hover:bg-purple-900/20 text-gray-700 dark:text-gray-300 flex items-center gap-2 transition-colors"
                        >
                          <span className="font-medium">{insumo.nombre}</span>
                          <span className="text-xs text-gray-400 ml-auto">{insumo.unidadMedida}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Cantidad */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Cantidad</label>
                  <input
                    type="number"
                    min="1"
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Unidad */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Unidad</label>
                  <select
                    value={unidad}
                    onChange={(e) => setUnidad(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer"
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
