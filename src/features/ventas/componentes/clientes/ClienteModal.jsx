import { useState, useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";

export function ClienteModal({ isOpen, onClose, onSave, cliente = null }) {
  const isEditing = !!cliente;
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    tipo: "Nuevo",
    descuentoPorcentaje: 0,
    sinCuenta: false
  });

  useEffect(() => {
    if (cliente) {
      const fullNombre = `${cliente.nombre || ''} ${cliente.apellidos || ''}`.trim();
      const currentTipo = cliente.tipo || (cliente.esVip ? "VIP" : "Regular");
      const defaultDesc = currentTipo === "VIP" ? 15 : currentTipo === "Frecuente" ? 10 : currentTipo === "Regular" ? 5 : 0;
      setForm({
        nombre: fullNombre || "",
        email: cliente.email || "",
        telefono: cliente.telefono || "",
        direccion: cliente.direccion || "",
        tipo: currentTipo,
        descuentoPorcentaje: cliente.descuentoPorcentaje !== undefined ? cliente.descuentoPorcentaje : defaultDesc,
        sinCuenta: !cliente.idUsuario || cliente.tieneCuenta === false
      });
    } else {
      setForm({
        nombre: "",
        email: "",
        telefono: "",
        direccion: "",
        tipo: "Nuevo",
        descuentoPorcentaje: 0,
        sinCuenta: true // Default to true when admin manually creates a client
      });
    }
  }, [cliente, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) return;
    onSave(form);
  };

  const handleTipoChange = (newTipo) => {
    let desc = 0;
    if (newTipo === "VIP") desc = 15;
    else if (newTipo === "Frecuente") desc = 10;
    else if (newTipo === "Regular") desc = 5;
    setForm({ ...form, tipo: newTipo, descuentoPorcentaje: desc });
  };

  const firstChar = form.nombre ? form.nombre.charAt(0).toUpperCase() : "C";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-5 border border-gray-100 dark:border-gray-800">
        
        {/* Header with initial avatar & close icon */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-600 text-white font-bold text-base flex items-center justify-center shadow-xs">
              {firstChar}
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {isEditing ? "Editar Cliente" : "Nuevo Cliente"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Option: Client without account */}
          {!isEditing && (
            <div className="p-3 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-2xl space-y-2">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-900 dark:text-amber-300 text-xs">
                <input
                  type="checkbox"
                  checked={form.sinCuenta}
                  onChange={(e) => setForm({ ...form, sinCuenta: e.target.checked })}
                  className="w-4 h-4 text-red-500 rounded border-amber-300 focus:ring-red-400"
                />
                Crear cliente sin cuenta de acceso de usuario
              </label>

              {form.sinCuenta && (
                <div className="flex items-start gap-2 text-[11px] text-amber-800 dark:text-amber-300 leading-snug">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p>
                    Se está creando un cliente sin cuenta de usuario. Este cliente quedará <strong>INACTIVO</strong> y no podrá acceder al sistema ni realizar pedidos hasta que se cree y active su usuario. Actualmente no posee credenciales de acceso.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Nombre Completo */}
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Nombre Completo: *
            </label>
            <input
              type="text"
              required
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-red-500/50"
              placeholder="Ej: Juan Carlos Pérez"
            />
          </div>

          {/* Email & Telefono */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-red-500/50"
                placeholder="juan.perez@email.com"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Teléfono
              </label>
              <input
                type="text"
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-red-500/50"
                placeholder="319 123 4567"
              />
            </div>
          </div>

          {/* Dirección */}
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Dirección
            </label>
            <input
              type="text"
              value={form.direccion}
              onChange={(e) => setForm({ ...form, direccion: e.target.value })}
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-red-500/50"
              placeholder="Calle 50 #45-30, Belén, Medellín"
            />
          </div>

          {/* Nivel de Fidelidad & Descuento (%) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Nivel de Fidelidad
              </label>
              <select
                value={form.tipo}
                onChange={(e) => handleTipoChange(e.target.value)}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-red-500/50 cursor-pointer"
              >
                <option value="VIP">VIP</option>
                <option value="Frecuente">Frecuente</option>
                <option value="Regular">Regular</option>
                <option value="Nuevo">Nuevo</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Descuento (%)
              </label>
              <input
                type="number"
                value={form.descuentoPorcentaje}
                onChange={(e) => setForm({ ...form, descuentoPorcentaje: Number(e.target.value) })}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-red-500/50"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors shadow-md"
            >
              {isEditing ? "Guardar Cambios" : "Crear Cliente"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
