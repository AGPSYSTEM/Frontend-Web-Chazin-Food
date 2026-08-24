import { useState, useEffect } from "react";
import {
  X, User, Package, TrendingUp, Award, Flame, Crown, Clock,
  AlertTriangle, ChevronDown, ChevronUp, Sparkles, Check,
  Mail, Phone, MapPin, CreditCard, Save, AlertCircle, Edit2
} from "lucide-react";
import { FidelidadBadge } from "@/shared/components/ui/FidelidadBadge";
import { useAuth } from "@/features/autenticacion/hooks/useAuth";
import { DOCUMENTO_CONFIG, sanitizeDocumento, validateDocumento, sanitizeTelefono } from "@/shared/utils/validationUtils";
import Swal from "sweetalert2";

const TIPOS_DOCUMENTO = ["C.C.", "C.E.", "T.I.", "Pasaporte", "NIT"];

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {msg}
    </p>
  );
}

export function ClientePerfilModal({ isOpen, onClose, user, pedidos = [] }) {
  const { updateProfile } = useAuth();
  const [showBenefitsTable, setShowBenefitsTable] = useState(false);
  const [tab, setTab] = useState("fidelidad"); // "fidelidad" | "editar"
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    apellidos: "",
    email: "",
    telefono: "",
    direccion: "",
    tipoDocumento: "C.C.",
    numeroDocumento: "",
  });
  const [errors, setErrors] = useState({});

  // Inicializar formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen && user) {
      setForm({
        nombre: user.nombre || "",
        apellidos: user.apellidos || user.apellido || "",
        email: user.email || "",
        telefono: user.telefono || "",
        direccion: user.direccion || "",
        tipoDocumento: user.tipoDocumento || "C.C.",
        numeroDocumento: user.numeroDocumento || user.documento || "",
      });
      setErrors({});
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  // Dynamic real stats from client orders
  const totalPedidosCount = pedidos.length;
  const totalProductosCount = pedidos.reduce(
    (acc, p) => acc + (p.items || []).reduce((iAcc, item) => iAcc + (item.cantidad || 1), 0),
    0
  );
  const totalGastado = pedidos.reduce((acc, p) => acc + (parseFloat(p.total) || 0), 0);

  // Calculate favorite product dynamically from real order items
  const itemCounts = {};
  pedidos.forEach((p) => {
    (p.items || []).forEach((item) => {
      const name = item.nombre || "Producto";
      itemCounts[name] = (itemCounts[name] || 0) + (Number(item.cantidad) || 1);
    });
  });

  const sortedItems = Object.entries(itemCounts).sort((a, b) => b[1] - a[1]);
  const favoriteProduct = sortedItems.length > 0 ? sortedItems[0][0] : "Sin pedidos aún";
  const favoriteCount = sortedItems.length > 0 ? sortedItems[0][1] : 0;

  // Fidelity Data extraction
  const fidelidad = user?.fidelidad || {};
  const tipoFidelidad = fidelidad.tipo || user?.tipo || (totalPedidosCount >= 9 ? "VIP" : totalPedidosCount >= 6 ? "Frecuente" : totalPedidosCount >= 3 ? "Regular" : "Nuevo");
  const descuentoPorcentaje = fidelidad.descuentoPorcentaje !== undefined
    ? fidelidad.descuentoPorcentaje
    : (tipoFidelidad === "VIP" ? 15 : tipoFidelidad === "Frecuente" ? 10 : tipoFidelidad === "Regular" ? 5 : 0);

  const comprasCiclo = fidelidad.comprasCiclo !== undefined ? fidelidad.comprasCiclo : (totalPedidosCount % 3);
  const comprasFaltantes = fidelidad.comprasFaltantes !== undefined ? fidelidad.comprasFaltantes : (3 - comprasCiclo);
  const siguienteNivel = fidelidad.siguienteNivel || (tipoFidelidad === "Nuevo" ? "Regular" : tipoFidelidad === "Regular" ? "Frecuente" : "VIP");
  const enGracia = Boolean(fidelidad.enGracia);
  const diasRestantesRaw = fidelidad.diasRestantes !== undefined ? fidelidad.diasRestantes : (tipoFidelidad !== "Nuevo" ? 30 : null);
  const diasGraciaRestantesRaw = fidelidad.diasGraciaRestantes || 0;
  const fechaVencimientoObj = fidelidad.fechaVencimientoNivel || fidelidad.vence ? new Date(fidelidad.fechaVencimientoNivel || fidelidad.vence) : null;
  const fechaVenceFormatted = fechaVencimientoObj && !isNaN(fechaVencimientoObj.getTime())
    ? fechaVencimientoObj.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })
    : null;

  // Real-time client-side calculation of remaining days to ensure countdown is always 100% active
  const now = new Date();
  let diasRestantes = diasRestantesRaw;
  let enGraciaActivo = enGracia;
  let diasGraciaRestantes = diasGraciaRestantesRaw;

  if (tipoFidelidad !== "Nuevo" && fechaVencimientoObj && !isNaN(fechaVencimientoObj.getTime())) {
    const diffMs = fechaVencimientoObj.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      diasRestantes = diffDays;
      enGraciaActivo = false;
      diasGraciaRestantes = 0;
    } else {
      const diasExpirado = Math.abs(diffDays);
      const limiteGracia = tipoFidelidad === "VIP" ? 15 : (tipoFidelidad === "Frecuente" ? 10 : 0);
      if (limiteGracia > 0 && diasExpirado <= limiteGracia) {
        enGraciaActivo = true;
        diasGraciaRestantes = Math.max(1, limiteGracia - diasExpirado);
        diasRestantes = 0;
      } else {
        diasRestantes = 0;
      }
    }
  }

  // Format clean full name avoiding word duplication
  const formatFullName = (u) => {
    if (!u) return "Cliente";
    const nombre = (u.nombre || "").trim();
    const apellidos = (u.apellidos || u.apellido || "").trim();
    if (!apellidos) return nombre;
    if (!nombre) return apellidos;
    const nombreWords = nombre.split(/\s+/);
    const apellidosWords = apellidos.split(/\s+/);
    const uniqueApellidos = apellidosWords.filter(
      (w) => !nombreWords.some((nw) => nw.toLowerCase() === w.toLowerCase())
    ).join(" ");
    return uniqueApellidos ? `${nombre} ${uniqueApellidos}` : nombre;
  };

  const userName = formatFullName(user);
  const docConfig = DOCUMENTO_CONFIG[form.tipoDocumento] || DOCUMENTO_CONFIG["C.C."];

  // ── Edit form handlers ──
  const handleChange = (e) => {
    const { name, value } = e.target;
    let v = value;

    if (name === "numeroDocumento") {
      v = sanitizeDocumento(value, form.tipoDocumento);
    } else if (name === "telefono") {
      v = sanitizeTelefono(value);
    } else if (name === "tipoDocumento") {
      setForm((prev) => ({ ...prev, tipoDocumento: v, numeroDocumento: "" }));
      setErrors((prev) => ({ ...prev, tipoDocumento: "", numeroDocumento: "" }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: v }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.nombre.trim()) errs.nombre = "El nombre es obligatorio.";
    if (!form.apellidos.trim()) errs.apellidos = "Los apellidos son obligatorios.";
    if (!form.email.trim()) errs.email = "El correo es obligatorio.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Correo inválido.";
    if (form.numeroDocumento) {
      const docVal = validateDocumento(form.numeroDocumento, form.tipoDocumento);
      if (!docVal.isValid) errs.numeroDocumento = docVal.error;
    }
    if (form.telefono && form.telefono.length < 7) errs.telefono = "Mínimo 7 dígitos.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSaving(true);
    try {
      const result = await updateProfile({
        nombre: form.nombre.trim(),
        apellidos: form.apellidos.trim(),
        email: form.email.trim(),
        telefono: form.telefono || null,
        direccion: form.direccion.trim() || null,
        tipoDocumento: form.tipoDocumento,
        numeroDocumento: form.numeroDocumento || null,
      });

      if (result.success) {
        await Swal.fire({
          icon: "success",
          title: "¡Datos actualizados!",
          text: "Tu perfil fue guardado correctamente.",
          confirmButtonColor: "#f05454",
          timer: 2200,
          timerProgressBar: true,
        });
        setTab("fidelidad");
        onClose();
      } else {
        Swal.fire({
          icon: "error",
          title: "No se pudo actualizar",
          text: result.message || "Ocurrió un error al guardar.",
          confirmButtonColor: "#f05454",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#f05454] p-6 text-white relative flex items-center gap-4 shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white shrink-0 shadow-inner font-bold text-xl backdrop-blur-xs">
            <User className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div className="pr-8 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white truncate">Mi Perfil</h2>
              <FidelidadBadge tipo={tipoFidelidad} descuento={descuentoPorcentaje} enGracia={enGracia} size="sm" />
            </div>
            <p className="text-sm text-white/90 font-semibold capitalize truncate mt-0.5">{userName}</p>
          </div>
          <button
            onClick={onClose}
            title="Cerrar modal"
            className="absolute top-5 right-5 w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center text-white cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 dark:border-gray-800 shrink-0">

        {/* Body Content */}
        <div className="overflow-y-auto flex-1">

          {/* ══ TAB: FIDELIDAD ══ */}
          {tab === "fidelidad" && (
            <div className="p-5 sm:p-6 space-y-5 text-left">
              {/* ── Section 1: Tarjeta de Membresía y Racha de Fidelidad ── */}
              <div className={`rounded-3xl p-5 border text-left transition-all relative overflow-hidden ${
                tipoFidelidad === "VIP"
                  ? "bg-gradient-to-br from-amber-500/15 via-yellow-500/10 to-orange-500/20 border-amber-300 dark:border-amber-700/80 shadow-md"
                  : tipoFidelidad === "Frecuente"
                    ? "bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-pink-500/15 border-indigo-200 dark:border-indigo-800/80 shadow-md"
                    : tipoFidelidad === "Regular"
                      ? "bg-gradient-to-br from-orange-500/15 via-amber-500/10 to-red-500/15 border-orange-200 dark:border-orange-800/80 shadow-md"
                      : "bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-800/60 dark:to-gray-800/30 border-gray-200 dark:border-gray-700"
              }`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/30 dark:bg-white/5 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-start justify-between gap-3 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xs border shrink-0 ${
                      tipoFidelidad === "VIP"
                        ? "bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 border-amber-200"
                        : tipoFidelidad === "Frecuente"
                          ? "bg-gradient-to-tr from-indigo-500 to-purple-500 text-white border-indigo-300"
                          : tipoFidelidad === "Regular"
                            ? "bg-gradient-to-tr from-orange-500 to-amber-500 text-white border-orange-300"
                            : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200"
                    }`}>
                      {tipoFidelidad === "VIP" ? "🥇" : tipoFidelidad === "Frecuente" ? "🥈" : tipoFidelidad === "Regular" ? "🥉" : "🌱"}
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Nivel de Fidelidad
                      </span>
                      <h3 className="text-lg font-black text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                        <span>Cliente {tipoFidelidad}</span>
                      </h3>
                    </div>
                  </div>
                  {descuentoPorcentaje > 0 && (
                    <span className="px-3 py-1 bg-[#f05454] text-white text-xs font-black rounded-xl shadow-2xs">
                      {descuentoPorcentaje}% OFF
                    </span>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-200/60 dark:border-gray-700/60 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                    <span className="flex items-center gap-1">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span>Racha de Compras ({comprasCiclo} de 3)</span>
                    </span>
                    <span className="text-[11px] font-extrabold text-[#f05454]">
                      {comprasFaltantes === 0
                        ? "¡Meta alcanzada! 🎉"
                        : tipoFidelidad === "VIP"
                          ? `Faltan ${comprasFaltantes} ${comprasFaltantes === 1 ? 'compra' : 'compras'} para renovar`
                          : `Faltan ${comprasFaltantes} ${comprasFaltantes === 1 ? 'compra' : 'compras'} para subir a ${siguienteNivel}`}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((step) => {
                      const isCompleted = comprasCiclo >= step;
                      return (
                        <div
                          key={step}
                          className={`h-3 rounded-full flex items-center justify-center transition-all ${
                            isCompleted
                              ? "bg-gradient-to-r from-orange-500 to-[#f05454] shadow-xs"
                              : "bg-gray-200/80 dark:bg-gray-700"
                          }`}
                        />
                      );
                    })}
                  </div>

                  {tipoFidelidad !== "Nuevo" && (
                    <div className="pt-2 space-y-1.5 border-t border-gray-200/40 dark:border-gray-700/40">
                      {enGracia ? (
                        <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 animate-bounce" />
                          <div>
                            <p className="font-black text-amber-800 dark:text-amber-300">
                              ¡Periodo de Gracia {tipoFidelidad} Activo!
                            </p>
                            <p className="text-[11px] leading-relaxed mt-0.5">
                              Te quedan <span className="font-black text-amber-700 dark:text-amber-200">{diasGraciaRestantes} días de oportunidad</span> para reactivar tu nivel {tipoFidelidad} realizando una compra antes de descender a {tipoFidelidad === "VIP" ? "Frecuente" : "Regular"}.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
                          <span className="text-gray-700 dark:text-gray-300 font-bold flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#f05454]" />
                            <span>Vigencia: <span className="text-[#f05454] font-black">{diasRestantes !== null ? `${diasRestantes} días restantes` : "1 mes"}</span></span>
                          </span>
                          {fechaVenceFormatted && (
                            <span className="text-gray-500 dark:text-gray-400 text-[10.5px]">
                              Vence el {fechaVenceFormatted}
                            </span>
                          )}
                        </div>
                      )}
                      <p className="text-[10px] text-gray-400 dark:text-gray-400 italic">
                        * Al renovar con 3 compras o reactivar en periodo de gracia, se inicia un mes completo (30 días). El tiempo no se acumula.
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-gray-200/40 dark:border-gray-700/40">
                  <button
                    type="button"
                    onClick={() => setShowBenefitsTable(!showBenefitsTable)}
                    className="w-full flex items-center justify-between text-[11px] font-bold text-gray-600 dark:text-gray-300 hover:text-[#f05454] dark:hover:text-red-400 transition cursor-pointer"
                  >
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Ver tabla de niveles y beneficios</span>
                    </span>
                    {showBenefitsTable ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                  {showBenefitsTable && (
                    <div className="mt-3 space-y-2 text-[11px] bg-white/80 dark:bg-gray-800/90 p-3 rounded-2xl border border-gray-200 dark:border-gray-700 animate-in fade-in duration-150">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between p-1.5 rounded-xl bg-gray-50 dark:bg-gray-750">
                          <span className="font-bold">🌱 Nuevo (0%)</span>
                          <span className="text-gray-500">3 compras para subir</span>
                        </div>
                        <div className="flex items-center justify-between p-1.5 rounded-xl bg-orange-50/70 dark:bg-orange-950/30">
                          <span className="font-bold text-orange-700 dark:text-orange-300">🥉 Regular (5% OFF)</span>
                          <span className="text-gray-500">Dura 1 mes (sin gracia)</span>
                        </div>
                        <div className="flex items-center justify-between p-1.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30">
                          <span className="font-bold text-indigo-700 dark:text-indigo-300">🥈 Frecuente (10% OFF)</span>
                          <span className="text-gray-500">Dura 1 mes + 10 días de gracia</span>
                        </div>
                        <div className="flex items-center justify-between p-1.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30">
                          <span className="font-bold text-amber-700 dark:text-amber-300">🥇 VIP (15% OFF)</span>
                          <span className="text-gray-500">Dura 1 mes + 15 días de gracia</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Section 2: Estadísticas de Compras ── */}
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-3">
                  Resumen de Actividad
                </h3>
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="bg-orange-50/60 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 rounded-2xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-[#f05454] text-white flex items-center justify-center mb-2.5 shadow-xs">
                        <Package className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Productos Comprados</p>
                    </div>
                    <div className="mt-2">
                      <p className="text-2xl sm:text-3xl font-black text-[#f05454]">{totalProductosCount}</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">unidades en total</p>
                    </div>
                  </div>
                  <div className="bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center mb-2.5 shadow-xs">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Pedidos Realizados</p>
                    </div>
                    <div className="mt-2">
                      <p className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">{totalPedidosCount}</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">pedidos completados</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Section 3: Producto Favorito ── */}
              <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/30 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-900 dark:text-gray-100">Producto Favorito</p>
                    <h4 className="text-base sm:text-lg font-black text-amber-900 dark:text-amber-300 truncate mt-0.5">{favoriteProduct}</h4>
                    <p className="text-xs font-semibold text-amber-700/90 dark:text-amber-400 mt-0.5">
                      {favoriteCount > 0
                        ? `Lo has pedido ${favoriteCount} ${favoriteCount === 1 ? 'vez' : 'veces'}`
                        : "Realiza tu primera compra para ver tu producto preferido"}
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Section 4: Total Invertido ── */}
              <div className="bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-gray-900 dark:text-gray-100">Total Acumulado</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">en compras en Chazin Food</p>
                </div>
                <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  ${totalGastado.toLocaleString("es-CO")}
                </p>
              </div>
            </div>
          )}

          {/* ══ TAB: EDITAR DATOS ══ */}
          {tab === "editar" && (
            <form onSubmit={handleSubmit} className="p-5 space-y-4" noValidate>
              {/* Nombre y Apellidos */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    placeholder="Ej: Juan"
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm font-medium bg-gray-50 dark:bg-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-[#f05454]/40 transition ${errors.nombre ? "border-red-400" : "border-gray-200 dark:border-gray-700"}`}
                  />
                  <FieldError msg={errors.nombre} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">
                    Apellidos <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="apellidos"
                    value={form.apellidos}
                    onChange={handleChange}
                    placeholder="Ej: García"
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm font-medium bg-gray-50 dark:bg-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-[#f05454]/40 transition ${errors.apellidos ? "border-red-400" : "border-gray-200 dark:border-gray-700"}`}
                  />
                  <FieldError msg={errors.apellidos} />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">
                  Correo Electrónico <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="correo@ejemplo.com"
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm font-medium bg-gray-50 dark:bg-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-[#f05454]/40 transition ${errors.email ? "border-red-400" : "border-gray-200 dark:border-gray-700"}`}
                  />
                </div>
                <FieldError msg={errors.email} />
              </div>

              {/* Tipo + Número de Documento */}
              <div className="grid grid-cols-5 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">Tipo Doc.</label>
                  <select
                    name="tipoDocumento"
                    value={form.tipoDocumento}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium bg-gray-50 dark:bg-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-[#f05454]/40 transition cursor-pointer"
                  >
                    {TIPOS_DOCUMENTO.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-3">
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">
                    N.º Documento
                    <span className="ml-1 text-gray-400 font-normal">({docConfig.helper})</span>
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="numeroDocumento"
                      value={form.numeroDocumento}
                      onChange={handleChange}
                      inputMode={docConfig.numericOnly ? "numeric" : "text"}
                      placeholder={docConfig.helper}
                      className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm font-medium bg-gray-50 dark:bg-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-[#f05454]/40 transition ${errors.numeroDocumento ? "border-red-400" : "border-gray-200 dark:border-gray-700"}`}
                    />
                  </div>
                  <FieldError msg={errors.numeroDocumento} />
                </div>
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">Teléfono</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    inputMode="numeric"
                    placeholder="3001234567"
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm font-medium bg-gray-50 dark:bg-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-[#f05454]/40 transition ${errors.telefono ? "border-red-400" : "border-gray-200 dark:border-gray-700"}`}
                  />
                </div>
                <FieldError msg={errors.telefono} />
              </div>

              {/* Dirección */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">Dirección de Entrega</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <textarea
                    name="direccion"
                    value={form.direccion}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Ej: Calle 50 #30-20, Medellín"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium bg-gray-50 dark:bg-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-[#f05454]/40 transition resize-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-gradient-to-r from-[#f05454] to-[#c43d3d] hover:from-[#e04444] hover:to-[#b52d2d] text-white font-bold rounded-2xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {saving ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                    </svg>
                    Guardando...
                  </>
                ) : (
                  <><Save className="w-4 h-4" /> Guardar Cambios</>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer - solo visible en tab fidelidad */}
        {tab === "fidelidad" && (
          <div className="p-4 bg-gray-50/80 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shrink-0">
            <button
              onClick={onClose}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-2xl transition-colors text-sm cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ClientePerfilModal;
