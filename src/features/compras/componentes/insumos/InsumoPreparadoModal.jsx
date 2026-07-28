import { useState, useEffect, useRef } from "react";
import { X, FlaskConical, Search, Plus, Trash2 } from "lucide-react";

const inputCls = "w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-[#2b3e50]/40 focus:border-transparent transition-colors text-sm placeholder:text-gray-400";
const labelCls = "block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1";

// Fallback base insumos if list is empty
const DEFAULT_BASE_INSUMOS = [
  { id: "b1", nombre: "Carne Molida de Res", unidadMedida: "Kg" },
  { id: "b2", nombre: "Pechuga de Pollo", unidadMedida: "Kg" },
  { id: "b3", nombre: "Queso Cheddar", unidadMedida: "Kg" },
  { id: "b4", nombre: "Jalapeños", unidadMedida: "Gr" },
  { id: "b5", nombre: "Mayonesa Artesanal", unidadMedida: "Lt" },
  { id: "b6", nombre: "Tomate Chonto", unidadMedida: "Kg" },
  { id: "b7", nombre: "Cebolla Cabezona", unidadMedida: "Kg" },
  { id: "b8", nombre: "Salsa BBQ Base", unidadMedida: "Lt" }
];

export function InsumoPreparadoModal({
  isOpen,
  onClose,
  onSave,
  insumoPreparado = null,
  insumosDisponibles = []
}) {
  const isEditing = !!insumoPreparado;

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState(0);
  const [unidadMedida, setUnidadMedida] = useState("und — unidad");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [ingredientesSeleccionados, setIngredientesSeleccionados] = useState([]);

  const containerRef = useRef(null);

  // Combine prop insumosDisponibles with fallback if needed
  const availablePool = insumosDisponibles.length > 0 ? insumosDisponibles : DEFAULT_BASE_INSUMOS;

  useEffect(() => {
    if (insumoPreparado) {
      setNombre(insumoPreparado.nombre || "");
      setDescripcion(insumoPreparado.descripcion || "");
      setPrecio(insumoPreparado.precio || insumoPreparado.costo || 0);
      setUnidadMedida(insumoPreparado.unidadMedida || "und — unidad");
      setIngredientesSeleccionados(insumoPreparado.ingredientes || []);
    } else {
      setNombre("");
      setDescripcion("");
      setPrecio(0);
      setUnidadMedida("und — unidad");
      setIngredientesSeleccionados([]);
    }
    setSearchTerm("");
    setIsDropdownOpen(false);
  }, [insumoPreparado, isOpen]);

  // Click outside listener for dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const filteredInsumos = availablePool.filter((item) => {
    const matchSearch =
      !searchTerm.trim() ||
      item.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const alreadyAdded = ingredientesSeleccionados.some((ing) => String(ing.id) === String(item.id));
    return matchSearch && !alreadyAdded;
  });

  const handleAddIngrediente = (insumo) => {
    setIngredientesSeleccionados((prev) => [
      ...prev,
      {
        id: insumo.id,
        nombre: insumo.nombre,
        unidadMedida: insumo.unidadMedida || "und",
        cantidad: 1
      }
    ]);
    setSearchTerm("");
    setIsDropdownOpen(false);
  };

  const handleRemoveIngrediente = (id) => {
    setIngredientesSeleccionados((prev) => prev.filter((ing) => ing.id !== id));
  };

  const handleUpdateCantidad = (id, cantidad) => {
    setIngredientesSeleccionados((prev) =>
      prev.map((ing) => (ing.id === id ? { ...ing, cantidad: Number(cantidad) || 1 } : ing))
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    onSave({
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      precio: Number(precio) || 0,
      unidadMedida,
      tipo: "Preparado",
      estado: "Activo",
      ingredientes: ingredientesSeleccionados
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300 flex items-center justify-center shrink-0">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1e293b] dark:text-gray-100">
                {isEditing ? "Editar Insumo Preparado" : "Nuevo Insumo Preparado"}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Combina insumos existentes para crear una receta
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
          <div>
            <label className={labelCls}>
              Nombre del insumo preparado <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className={inputCls}
              placeholder="Ej: Salsa de la Casa, Carne Especial, Aderezo BBQ..."
            />
          </div>

          <div>
            <label className={labelCls}>Descripción (opcional)</label>
            <textarea
              rows={2}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className={`${inputCls} resize-none`}
              placeholder="Receta, uso o modo de preparación..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                Precio del insumo preparado <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <input
                  type="number"
                  min="0"
                  required
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  className={`${inputCls} pl-8`}
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Unidad de medida</label>
              <select
                value={unidadMedida}
                onChange={(e) => setUnidadMedida(e.target.value)}
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

          {/* Section: Agregar insumos */}
          <div className="pt-2" ref={containerRef}>
            <label className={labelCls}>
              Agregar insumos <span className="text-red-500">*</span> — busca y selecciona los insumos que componen este preparado
            </label>

            <div className="relative mb-3">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onFocus={() => setIsDropdownOpen(true)}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsDropdownOpen(true);
                }}
                className={`${inputCls} pl-10`}
                placeholder="Buscar insumo por nombre..."
              />

              {/* Autocomplete Dropdown */}
              {isDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl z-30 max-h-52 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700/60">
                  {filteredInsumos.length === 0 ? (
                    <div className="px-4 py-3 text-xs text-gray-400 text-center">
                      No hay insumos disponibles para seleccionar
                    </div>
                  ) : (
                    filteredInsumos.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleAddIngrediente(item)}
                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-gray-700/50 flex items-center justify-between text-sm transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 dark:text-gray-100">{item.nombre}</span>
                          <span className="text-xs text-gray-400">({item.unidadMedida || "und"})</span>
                        </div>
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 flex items-center gap-1">
                          <Plus className="w-3.5 h-3.5" /> Agregar
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Selected Insumos List or Empty Dropzone */}
            {ingredientesSeleccionados.length === 0 ? (
              <div className="border-2 border-dashed border-gray-200 dark:border-gray-700/80 rounded-2xl p-8 text-center flex flex-col items-center justify-center text-gray-400">
                <FlaskConical className="w-10 h-10 stroke-1 text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Busca y agrega insumos para componer esta receta
                </p>
              </div>
            ) : (
              <div className="space-y-2 border border-gray-100 dark:border-gray-800 rounded-2xl p-3 bg-gray-50/50 dark:bg-gray-800/40 max-h-52 overflow-y-auto">
                {ingredientesSeleccionados.map((ing) => (
                  <div
                    key={ing.id}
                    className="flex items-center justify-between gap-3 p-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/60 shadow-2xs"
                  >
                    <span className="font-semibold text-sm text-gray-900 dark:text-gray-100 flex-1 truncate">
                      {ing.nombre}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        type="number"
                        min="1"
                        value={ing.cantidad}
                        onChange={(e) => handleUpdateCantidad(ing.id, e.target.value)}
                        className="w-16 px-2 py-1 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-center dark:bg-gray-900 dark:text-white font-medium"
                      />
                      <span className="text-xs text-gray-400 w-12">{ing.unidadMedida}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveIngrediente(ing.id)}
                        className="p-1 text-red-500 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800 shrink-0 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-700 dark:text-gray-200 hover:bg-gray-50 text-sm font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-[#718096] hover:bg-[#4a5568] text-white text-sm font-medium transition-colors shadow-2xs flex items-center gap-2"
            >
              <FlaskConical className="w-4 h-4" />
              <span>Guardar Insumo Preparado</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
