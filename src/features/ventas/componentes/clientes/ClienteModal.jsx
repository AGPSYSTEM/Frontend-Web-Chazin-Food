import { useState, useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";
import {
  sanitizeTelefono,
  sanitizeDocumento,
  getDocConfig,
  validateTelefono,
  validateDocumento
} from "@/shared/utils/validationUtils";

export function ClienteModal({ isOpen, onClose, onSave, cliente = null }) {
  const isEditing = !!cliente;
  const [form, setForm] = useState({
    nombre: "",
    apellidos: "",
    tipoDocumento: "C.C.",
    documento: "",
    email: "",
    telefono: "",
    direccion: "",
    tipo: "Nuevo",
    descuentoPorcentaje: 0,
    sinCuenta: false
  });
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (cliente) {
      const currentTipo = cliente.tipo || (cliente.esVip ? "VIP" : "Nuevo");
      const defaultDesc = currentTipo === "VIP" ? 15 : currentTipo === "Frecuente" ? 10 : currentTipo === "Regular" ? 5 : 0;
      setForm({
        nombre: cliente.nombre || "",
        apellidos: cliente.apellidos || "",
        tipoDocumento: cliente.tipoDocumento || "C.C.",
        documento: cliente.documento || (cliente.idUsuario ? String(cliente.idUsuario) : ""),
        email: cliente.email || "",
        telefono: sanitizeTelefono(cliente.telefono || ""),
        direccion: cliente.direccion || "",
        tipo: currentTipo,
        descuentoPorcentaje: defaultDesc,
        sinCuenta: !cliente.idUsuario || cliente.tieneCuenta === false
      });
    } else {
      setForm({
        nombre: "",
        apellidos: "",
        tipoDocumento: "C.C.",
        documento: "",
        email: "",
        telefono: "",
        direccion: "",
        tipo: "Nuevo",
        descuentoPorcentaje: 0,
        sinCuenta: true // Default to true when admin manually creates a client
      });
    }
    setErrorMsg("");
  }, [cliente, isOpen]);

  if (!isOpen) return null;

  const docConfig = getDocConfig(form.tipoDocumento);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!form.nombre.trim()) {
      setErrorMsg("El nombre del cliente es obligatorio.");
      return;
    }

    if (form.telefono) {
      const telVal = validateTelefono(form.telefono);
      if (!telVal.isValid) {
        setErrorMsg(telVal.error);
        return;
      }
    }

    if (form.documento) {
      const docVal = validateDocumento(form.documento, form.tipoDocumento);
      if (!docVal.isValid) {
        setErrorMsg(docVal.error);
        return;
      }
    }

    onSave({
      ...form,
      nombre: form.nombre.trim(),
      apellidos: form.apellidos.trim(),
      telefono: sanitizeTelefono(form.telefono),
      documento: sanitizeDocumento(form.documento, form.tipoDocumento)
    });
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
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg p-6 space-y-5 border border-gray-100 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
        
        {/* Header with initial avatar & close icon */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-600 text-white font-bold text-base flex items-center justify-center shadow-xs">
              {firstChar}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {isEditing ? "Editar Cliente" : "Nuevo Cliente"}
              </h2>
              <p className="text-xs text-gray-400">
                {isEditing ? "Modifica los datos del cliente" : "Registra un nuevo cliente"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold border border-rose-200 dark:border-rose-800">
            {errorMsg}
          </div>
        )}

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
                    Se está creando un cliente sin cuenta de usuario. Este cliente quedará <strong>INACTIVO</strong> y no podrá acceder al sistema ni realizar pedidos hasta que se cree y active su usuario.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Nombres y Apellidos Separados */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Nombres: *
              </label>
              <input
                type="text"
                required
                value={form.nombre}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s-]*$/.test(val)) {
                    setForm({ ...form, nombre: val });
                  }
                }}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-red-500/50 text-xs"
                placeholder="Ej: Juan Carlos"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Apellidos:
              </label>
              <input
                type="text"
                value={form.apellidos}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s-]*$/.test(val)) {
                    setForm({ ...form, apellidos: val });
                  }
                }}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-red-500/50 text-xs"
                placeholder="Ej: Pérez Gómez"
              />
            </div>
          </div>

          {/* Tipo de Documento y Número de Documento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Tipo de Documento
              </label>
              <select
                value={form.tipoDocumento}
                onChange={(e) => {
                  const newTipo = e.target.value;
                  setForm({
                    ...form,
                    tipoDocumento: newTipo,
                    documento: sanitizeDocumento(form.documento, newTipo)
                  });
                }}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-red-500/50 text-xs cursor-pointer"
              >
                <option value="C.C.">Cédula de Ciudadanía (C.C.)</option>
                <option value="T.I.">Tarjeta de Identidad (T.I.)</option>
                <option value="C.E.">Cédula de Extranjería (C.E.)</option>
                <option value="Pasaporte">Pasaporte</option>
                <option value="NIT">NIT</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-semibold text-gray-700 dark:text-gray-300">
                  Número de Documento
                </label>
                <span className="text-[10px] text-gray-400 font-medium">
                  {docConfig.helper}
                </span>
              </div>
              <input
                type="text"
                value={form.documento}
                maxLength={docConfig.max}
                onChange={(e) => {
                  const clean = sanitizeDocumento(e.target.value, form.tipoDocumento);
                  setForm({ ...form, documento: clean });
                }}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-red-500/50 text-xs"
                placeholder={docConfig.helper}
              />
            </div>
          </div>

          {/* Email & Telefono */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-red-500/50 text-xs"
                placeholder="juan.perez@email.com"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-semibold text-gray-700 dark:text-gray-300">
                  Teléfono
                </label>
                <span className="text-[10px] text-gray-400 font-medium">
                  Máx. 10 dígitos ({form.telefono.length}/10)
                </span>
              </div>
              <input
                type="text"
                value={form.telefono}
                maxLength={10}
                onChange={(e) => {
                  const clean = sanitizeTelefono(e.target.value);
                  setForm({ ...form, telefono: clean });
                }}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-red-500/50 text-xs"
                placeholder="3191234567"
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
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-red-500/50 text-xs"
              placeholder="Calle 50 #45-30, Belén, Medellín"
            />
          </div>

          {/* Nivel de Fidelidad & Descuento (%) */}
          <div className="bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                <span>⭐ Nivel de Fidelidad (Automatizado)</span>
              </span>
              <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded-md">
                3 compras / nivel
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Nivel Asignado
                </label>
                <select
                  value={form.tipo}
                  onChange={(e) => handleTipoChange(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-red-500/50 text-xs cursor-pointer font-bold"
                >
                  <option value="VIP">🥇 VIP (15% OFF)</option>
                  <option value="Frecuente">🥈 Frecuente (10% OFF)</option>
                  <option value="Regular">🥉 Regular (5% OFF)</option>
                  <option value="Nuevo">🌱 Nuevo (0%)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Descuento Automático
                </label>
                <input
                  type="text"
                  readOnly
                  value={`${form.descuentoPorcentaje}% de descuento`}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 font-bold cursor-not-allowed outline-none select-none text-xs"
                />
              </div>
            </div>

            <p className="text-[10.5px] text-gray-500 dark:text-gray-400">
              💡 El sistema actualiza el nivel automáticamente con las compras del cliente: Regular (3 compras, 1 mes), Frecuente (1 mes + 10d gracia), VIP (1 mes + 15d gracia).
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors shadow-md cursor-pointer"
            >
              {isEditing ? "Guardar Cambios" : "Crear Cliente"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
