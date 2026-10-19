import { useState, useEffect } from "react";
import { X, AlertTriangle, Clock, Lightbulb, Mail, CheckCircle2 } from "lucide-react";
import {
  sanitizeTelefono,
  sanitizeDocumento,
  getDocConfig,
  validateTelefono,
  validateDocumento,
  formatNombreCompleto
} from "@/shared/utils/validationUtils";

export function ClienteModal({ isOpen, onClose, onSave, cliente = null, clientes = [], zIndex = "z-50" }) {
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
    descuentoPorcentaje: 0
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
        descuentoPorcentaje: defaultDesc
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
        descuentoPorcentaje: 0
      });
    }
    setErrorMsg("");
  }, [cliente, isOpen]);

  if (!isOpen) return null;

  const docConfig = getDocConfig(form.tipoDocumento);

  // Verificación en tiempo real de documento duplicado (Ítem 120)
  const cleanDocCurrent = sanitizeDocumento(form.documento, form.tipoDocumento);
  const existingClient = (clientes || []).find((c) => {
    if (isEditing && (c.id === cliente?.id || c.idCliente === cliente?.idCliente)) return false;
    if (!cleanDocCurrent || cleanDocCurrent.trim().length < 5) return false;
    const docClean = cleanDocCurrent.trim();
    const cDoc = sanitizeDocumento(c.documento || (c.idUsuario ? String(c.idUsuario) : ""), c.tipoDocumento || form.tipoDocumento);
    return docClean === cDoc;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");

    // 1. Verificación de documento duplicado
    if (existingClient) {
      setErrorMsg(`Ya existe un cliente registrado con el documento ${form.documento} (${formatNombreCompleto(existingClient.nombre, existingClient.apellidos)}). No se puede duplicar.`);
      return;
    }

    // 2. Validación de campos obligatorios
    if (!form.documento.trim()) {
      setErrorMsg("El número de documento es obligatorio.");
      return;
    }

    if (!form.nombre.trim()) {
      setErrorMsg("El nombre del cliente es obligatorio.");
      return;
    }

    if (!form.telefono.trim()) {
      setErrorMsg("El número de teléfono es obligatorio.");
      return;
    }

    if (!form.email.trim()) {
      setErrorMsg("El correo electrónico es obligatorio para el envío del correo de activación.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      setErrorMsg("Por favor ingresa un correo electrónico válido (ej: cliente@correo.com).");
      return;
    }

    // 3. Validación de formatos específicos
    const docVal = validateDocumento(form.documento, form.tipoDocumento);
    if (!docVal.isValid) {
      setErrorMsg(docVal.error);
      return;
    }

    const telVal = validateTelefono(form.telefono);
    if (!telVal.isValid) {
      setErrorMsg(telVal.error);
      return;
    }

    onSave({
      ...form,
      nombre: form.nombre.trim(),
      apellidos: form.apellidos.trim(),
      email: form.email.trim().toLowerCase(),
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
    <div className={`fixed inset-0 ${zIndex} flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs`}>
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg p-6 space-y-5 border border-gray-100 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
        
        {/* Header with initial avatar & close icon */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-600 text-white font-bold text-base flex items-center justify-center shadow-xs">
              {firstChar}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {isEditing ? "Editar Cliente" : "Nuevo Cliente"}
              </h2>
              <p className="text-xs text-gray-400">
                {isEditing ? "Modifica los datos del cliente" : "Registra un nuevo cliente con cuenta y activación"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div role="alert" className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold border border-rose-200 dark:border-rose-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">

          {/* ── ÍTEM 120: Número y Tipo de Documento en Primer Lugar ── */}
          <div className="bg-gray-50/70 dark:bg-gray-800/40 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                Identificación del Cliente
              </span>
              <span className="text-[11px] text-gray-400 font-medium">Paso 1: Verificación</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="cliente-tipo-doc" className="block font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Tipo de Documento <span className="text-red-500 font-bold">*</span>
                </label>
                <select
                  id="cliente-tipo-doc"
                  value={form.tipoDocumento}
                  aria-required="true"
                  onChange={(e) => {
                    const newTipo = e.target.value;
                    setForm({
                      ...form,
                      tipoDocumento: newTipo,
                      documento: sanitizeDocumento(form.documento, newTipo)
                    });
                  }}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-red-500/50 text-xs cursor-pointer font-medium"
                  required
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
                  <label htmlFor="cliente-documento" className="block font-semibold text-gray-700 dark:text-gray-300">
                    Número de Documento <span className="text-red-500 font-bold">*</span>
                  </label>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {docConfig.helper}
                  </span>
                </div>
                <input
                  id="cliente-documento"
                  type="text"
                  required
                  aria-required="true"
                  aria-invalid={!!existingClient}
                  value={form.documento}
                  maxLength={docConfig.max}
                  onChange={(e) => {
                    const clean = sanitizeDocumento(e.target.value, form.tipoDocumento);
                    setForm({ ...form, documento: clean });
                  }}
                  className={`w-full px-4 py-2.5 bg-white dark:bg-gray-800 border rounded-xl text-gray-900 dark:text-gray-100 outline-none text-xs transition-colors ${
                    existingClient
                      ? "border-amber-400 dark:border-amber-500 focus:ring-2 focus:ring-amber-400 bg-amber-50/20"
                      : "border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-red-500/50"
                  }`}
                  placeholder={docConfig.helper}
                />
              </div>
            </div>

            {/* Alerta de Documento Duplicado Inmediata (Ítem 120) */}
            {existingClient && (
              <div
                role="alert"
                className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2 animate-fadeIn"
              >
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-800 dark:text-amber-300">Cliente ya registrado</p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                    Ya existe un cliente con este documento: <strong>{formatNombreCompleto(existingClient.nombre, existingClient.apellidos)}</strong>. No es posible crear registros duplicados.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ── Nombres y Apellidos ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="cliente-nombre" className="block font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Nombres <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                id="cliente-nombre"
                type="text"
                required
                aria-required="true"
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
              <label htmlFor="cliente-apellidos" className="block font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Apellidos
              </label>
              <input
                id="cliente-apellidos"
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

          {/* ── Email & Teléfono ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="cliente-email" className="block font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Email <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                id="cliente-email"
                type="email"
                required
                aria-required="true"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-red-500/50 text-xs"
                placeholder="juan.perez@email.com"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="cliente-telefono" className="block font-semibold text-gray-700 dark:text-gray-300">
                  Teléfono <span className="text-red-500 font-bold">*</span>
                </label>
                <span className="text-[10px] text-gray-400 font-medium">
                  10 dígitos ({form.telefono.length}/10)
                </span>
              </div>
              <input
                id="cliente-telefono"
                type="text"
                required
                aria-required="true"
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

          {/* ── Dirección ── */}
          <div>
            <label htmlFor="cliente-direccion" className="block font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Dirección
            </label>
            <input
              id="cliente-direccion"
              type="text"
              value={form.direccion}
              onChange={(e) => setForm({ ...form, direccion: e.target.value })}
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-red-500/50 text-xs"
              placeholder="Calle 50 #45-30, Belén, Medellín"
            />
          </div>

          {/* ── ÍTEM 121: Banner Informativo de Activación por Correo ── */}
          {!isEditing && (
            <div className="p-3.5 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/50 rounded-2xl flex items-start gap-2.5 text-xs text-blue-900 dark:text-blue-200">
              <Mail className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                  <span>Activación de Cuenta por Correo</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                </p>
                <p className="text-[11px] text-blue-700 dark:text-blue-300/90 mt-0.5 leading-relaxed">
                  Se creará automáticamente la cuenta de usuario del cliente y se le enviará un correo de bienvenida con sus credenciales y enlace para que configure su contraseña y active su acceso.
                </p>
              </div>
            </div>
          )}

          {/* ── Nivel de Fidelidad & Descuento (%) ── */}
          <div className="bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                <span>⭐ Nivel de Fidelidad (Automatizado)</span>
              </span>
              <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded-md">
                3 compras / ciclo
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="cliente-tipo-fidelidad" className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Nivel Asignado
                </label>
                <select
                  id="cliente-tipo-fidelidad"
                  value={form.tipo}
                  onChange={(e) => handleTipoChange(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-red-500/50 text-xs cursor-pointer font-bold"
                >
                  <option value="VIP">VIP (15% OFF)</option>
                  <option value="Frecuente">Frecuente (10% OFF)</option>
                  <option value="Regular">Regular (5% OFF)</option>
                  <option value="Nuevo">Nuevo (0%)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Descuento Automático
                </label>
                <input
                  type="text"
                  readOnly
                  aria-label="Descuento automático asignado"
                  value={`${form.descuentoPorcentaje}% de descuento`}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 font-bold cursor-not-allowed outline-none select-none text-xs"
                />
              </div>
            </div>

            {cliente && cliente.fidelidad && form.tipo !== "Nuevo" && (
              <div className="mt-2 p-2.5 bg-white/70 dark:bg-gray-800/70 rounded-xl border border-amber-200/50 dark:border-amber-800/40 text-[11px] space-y-1">
                <div className="flex items-center justify-between text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">Vigencia de Nivel:</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">
                    {cliente.fidelidad.enGracia ? (
                      <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="w-3 h-3" />
                        <span>En Gracia: {cliente.fidelidad.diasGraciaRestantes || 0} días restantes</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>{cliente.fidelidad.diasRestantes !== null && cliente.fidelidad.diasRestantes !== undefined ? cliente.fidelidad.diasRestantes : 30} días restantes</span>
                      </span>
                    )}
                  </span>
                </div>
                {cliente.fidelidad.fechaVencimientoNivel && (
                  <div className="flex items-center justify-between text-[10px] text-gray-400">
                    <span>Fecha de Renovación / Vencimiento:</span>
                    <span className="font-bold">{new Date(cliente.fidelidad.fechaVencimientoNivel).toLocaleDateString('es-CO')}</span>
                  </div>
                )}
              </div>
            )}

            <p className="text-[10.5px] text-gray-500 dark:text-gray-400 flex items-start gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <span>Fidelización: cada 3 compras acumuladas desbloquean beneficios y descuentos para la siguiente compra.</span>
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
              disabled={!!existingClient}
              title={existingClient ? "No es posible crear cliente con documento duplicado" : ""}
              className={`px-6 py-2.5 text-xs font-bold text-white rounded-xl transition-all shadow-md ${
                existingClient
                  ? "bg-gray-400 dark:bg-gray-700 cursor-not-allowed opacity-60"
                  : "bg-red-500 hover:bg-red-600 cursor-pointer"
              }`}
            >
              {isEditing ? "Guardar Cambios" : "Crear Cliente"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
