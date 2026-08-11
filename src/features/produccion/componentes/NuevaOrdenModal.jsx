import { useState, useEffect } from "react";
import { X, ChefHat, Plus } from "lucide-react";
import { productosService } from "../../ventas/servicios/productosService";

const EMOJI_MAP = {
  Hamburguesa: "🍔",
  Perro: "🌭",
  Gaseosa: "🥤",
  Bebida: "🥤",
  Pizza: "🍕",
  Combo: "🍱",
  Pollo: "🍗",
  Papas: "🍟"
};

const getEmojiForProduct = (nombre = "") => {
  const lower = nombre.toLowerCase();
  if (lower.includes("hamburguesa")) return "🍔";
  if (lower.includes("perro")) return "🌭";
  if (lower.includes("gaseosa") || lower.includes("bebida") || lower.includes("jugo")) return "🥤";
  if (lower.includes("pizza")) return "🍕";
  if (lower.includes("combo")) return "🍱";
  if (lower.includes("pollo")) return "🍗";
  if (lower.includes("salchipapa") || lower.includes("papas")) return "🍟";
  return "🍔";
};

export function NuevaOrdenModal({ isOpen, onClose, onCreate }) {
  const [productos, setProductos] = useState([]);
  const [selectedProductoId, setSelectedProductoId] = useState("");
  const [platilloNombre, setPlatilloNombre] = useState("");
  const [cantidad, setCantidad] = useState("1");
  const [responsable, setResponsable] = useState("Carlos R.");
  const [tiempo, setTiempo] = useState("15 min");
  const [prioridad, setPrioridad] = useState("Normal");
  const [imagen, setImagen] = useState("🍔");
  const [alerta, setAlerta] = useState(false);
  const [observaciones, setObservaciones] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      productosService
        .getProductos()
        .then((data) => {
          setProductos(data || []);
          if (data && data.length > 0) {
            const first = data[0];
            setSelectedProductoId(String(first.id || first.idProducto || ""));
            setPlatilloNombre(first.nombre);
            setImagen(getEmojiForProduct(first.nombre));
          }
        })
        .catch(() => setProductos([]));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectProduct = (idStr) => {
    setSelectedProductoId(idStr);
    const found = productos.find(
      (p) => String(p.id || p.idProducto) === idStr
    );
    if (found) {
      setPlatilloNombre(found.nombre);
      setImagen(getEmojiForProduct(found.nombre));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!platilloNombre.trim()) return;
    setSaving(true);

    const ok = await onCreate({
      idProducto: selectedProductoId ? Number(selectedProductoId) : null,
      platilloNombre: platilloNombre.trim(),
      cantidad: Number(cantidad) || 1,
      responsable,
      tiempo,
      prioridad,
      imagen,
      alerta,
      observaciones: observaciones.trim(),
      estado: "En Cola"
    });

    setSaving(false);
    if (ok) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-coral-500 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ChefHat className="w-7 h-7" />
            <div>
              <h3 className="text-lg font-bold">Nueva Orden de Producción</h3>
              <p className="text-xs text-red-100">
                Selecciona un producto registrado en el sistema
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Seleccionar Producto Registrado */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Producto Registrado en Base de Datos <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedProductoId}
              onChange={(e) => handleSelectProduct(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-[#F05454]"
            >
              {productos.length === 0 ? (
                <option value="">Cargando productos...</option>
              ) : (
                productos.map((p) => (
                  <option key={p.id || p.idProducto} value={p.id || p.idProducto}>
                    {p.nombre} — ${Number(p.precio || 0).toLocaleString("es-CO")}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Nombre / Personalización */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Nombre del Platillo / Variación
            </label>
            <div className="flex gap-2">
              <span className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xl flex items-center justify-center">
                {imagen}
              </span>
              <input
                type="text"
                required
                value={platilloNombre}
                onChange={(e) => setPlatilloNombre(e.target.value)}
                placeholder="Nombre del platillo..."
                className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-[#F05454]"
              />
            </div>
          </div>

          {/* Cantidad & Tiempo */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Cantidad
              </label>
              <input
                type="number"
                min="1"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-[#F05454]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Tiempo Estimado
              </label>
              <input
                type="text"
                value={tiempo}
                onChange={(e) => setTiempo(e.target.value)}
                placeholder="Ej: 15 min"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-[#F05454]"
              />
            </div>
          </div>

          {/* Responsable & Prioridad */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Responsable
              </label>
              <input
                type="text"
                value={responsable}
                onChange={(e) => setResponsable(e.target.value)}
                placeholder="Ej: Carlos R."
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-[#F05454]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Prioridad
              </label>
              <select
                value={prioridad}
                onChange={(e) => setPrioridad(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-[#F05454]"
              >
                <option value="Normal">Normal</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
              </select>
            </div>
          </div>

          {/* Alerta checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="alertaCheck"
              checked={alerta}
              onChange={(e) => setAlerta(e.target.checked)}
              className="w-4 h-4 rounded text-red-500 focus:ring-red-500 accent-red-500 cursor-pointer"
            />
            <label htmlFor="alertaCheck" className="text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
              Marcar como orden con Alerta (!)
            </label>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Observaciones / Modificaciones
            </label>
            <textarea
              rows={3}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Ej: Sin cebolla, extra salsa..."
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-[#F05454] resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !platilloNombre.trim()}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#F05454] hover:bg-[#d84343] text-white font-medium rounded-xl text-sm transition-colors shadow-md disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{saving ? "Guardando..." : "Crear Orden"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
