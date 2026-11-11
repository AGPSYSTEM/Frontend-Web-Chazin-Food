import React, { useState, useEffect, useMemo } from "react";
import { matchesSmartSearch } from "@/shared/utils/searchUtils";
import {
  X,
  Store,
  MapPin,
  Banknote,
  CreditCard,
  Smartphone,
  CheckCircle2,
  ShoppingBag,
  Info,
  User,
  Search,
  Sparkles,
  UserCheck,
  RotateCcw,
  Check,
  Flame,
  Phone,
  Mail,
  ShieldCheck,
  Coins,
  AlertTriangle,
  AlertCircle,
  Lock
} from "lucide-react";
import { clientesService } from "@/features/ventas/servicios/clientesService";
import { FidelidadBadge } from "@/shared/components/ui/FidelidadBadge";
import { FoodIcon } from "@/shared/components/ui/FoodIcon";
import { useAuth } from "@/features/autenticacion/hooks/useAuth";
import { useNotifications } from "@/shared/hooks/useNotifications";
import NumberInput from "@/shared/components/ui/NumberInput";

export const isClientInactive = (c) => {
  if (!c) return false;
  return Boolean(
    c.estado === 'Inactivo' ||
    c.estado === 'INACTIVO' ||
    c.estado === 0 ||
    c.estado === false ||
    c.estadoCuenta === 'INACTIVO' ||
    c.cuentaActiva === false ||
    c.usuario?.estado === 'Inactivo' ||
    c.usuario?.estado === 'INACTIVO' ||
    c.usuario?.estado === 0 ||
    c.usuario?.estado === false
  );
};

export function PosCheckoutModal({
  isOpen,
  onClose,
  cart = [],
  subtotal = 0,
  descuento = 0,
  total = 0,
  onConfirm,
  loading = false
}) {
  const { user } = useAuth();
  const { warning, error, info } = useNotifications();
  const safeCart = Array.isArray(cart) ? cart : [];
  const [clientesList, setClientesList] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [clienteNombre, setClienteNombre] = useState("");
  const [isSearchingClient, setIsSearchingClient] = useState(false);
  const [tieneCuenta, setTieneCuenta] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState("");

  const responsableNombre = user
    ? `${user.nombre || ''} ${user.apellidos || ''}`.trim() || user.nombre || "Vendedor"
    : "Vendedor Mostrador";
  const responsableRol = user?.rol || user?.rolInfo?.nombre || (user?.idRol === 1 ? "Administrador" : "Vendedor");

  const [metodoPago, setMetodoPago] = useState("efectivo"); // "efectivo", "tarjeta"

  // Pago en Efectivo
  const [efectivoPaga, setEfectivoPaga] = useState("");

  // Pago con Tarjeta
  const [tarjetaNumero, setTarjetaNumero] = useState("");

  // Touch tracking para validación en tiempo real
  const [clienteTouched, setClienteTouched] = useState(false);
  const [pagoTouched, setPagoTouched] = useState(false);

  // Load clients on modal open
  useEffect(() => {
    if (isOpen) {
      clientesService.getClientes().then(res => {
        if (Array.isArray(res)) {
          // Filter out generic placeholder entries
                    const validClients = res.filter(c => 
            !c.esMostrador &&
            !c.nombre?.toLowerCase().includes("cliente mostrador") &&
            !c.apellidos?.toLowerCase().includes("mostrador")
          );
          setClientesList(validClients);
        }
      }).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Compute discount and total dynamically based on selected client's fidelity tier
  const discountPercent = selectedCliente 
    ? Number(selectedCliente.descuentoPorcentaje || (selectedCliente.tipo === 'VIP' ? 15 : selectedCliente.tipo === 'Frecuente' ? 10 : selectedCliente.tipo === 'Regular' ? 5 : 0)) 
    : 0;
  const calculatedDescuento = discountPercent > 0 ? Math.round(Number(subtotal || 0) * (discountPercent / 100)) : Number(descuento || 0);
  const finalTotal = Math.max(0, Number(subtotal || 0) - calculatedDescuento);

  const montoPagaNum = Number(efectivoPaga) || 0;
  const vueltoEfectivo = montoPagaNum >= finalTotal ? montoPagaNum - finalTotal : 0;

  // Cálculos de validación en vivo
  const cleanCardDigits = tarjetaNumero.replace(/\s+/g, "");
  const isCardComplete = cleanCardDigits.length === 16;
  const isEfectivoValid = montoPagaNum >= finalTotal && vueltoEfectivo <= 100000;
  const isPaymentValid = metodoPago === "efectivo" ? isEfectivoValid : isCardComplete;
  const isClientValid = Boolean(clienteNombre && clienteNombre.trim().length >= 2);
  const isFormValid = isClientValid && isPaymentValid;

  // Direct multicriteria search matching (cedula, telefono, nombre, email, id)
  const filteredClientes = clientSearchTerm.trim()
    ? clientesList.filter((c) => {
        return matchesSmartSearch(
          [
            c.nombre,
            c.apellidos,
            `${c.nombre || ""} ${c.apellidos || ""}`.trim(),
            c.telefono,
            c.email,
            c.documento,
            c.cedula,
            c.identificacion,
            c.id,
            c.idCliente,
            `#${c.id || c.idCliente}`
          ],
          clientSearchTerm
        );
      })
    : [];

  const handleSelectClient = (c) => {
    if (!c) return;
    if (isClientInactive(c)) {
      warning(
        "Cliente Inactivo",
        `El cliente "${(`${c.nombre || ''} ${c.apellidos || ''}`).trim()}" se encuentra inactivo y no tiene permitido realizar compras ni asociarse a pedidos.`
      );
      return;
    }
    setSelectedCliente(c);
    setTieneCuenta(true);
    setClienteNombre(`${c.nombre} ${c.apellidos || ''}`.trim());
    setIsSearchingClient(false);
  };

  const handleClearSelectedClient = () => {
    setSelectedCliente(null);
    setTieneCuenta(false);
    setClienteNombre("");
  };

  const handleConfirm = (e) => {
    e.preventDefault();

    // Validación de Cliente Obligatorio
    if (!clienteNombre.trim()) {
      warning(
        "Nombre de cliente obligatorio",
        "Por favor ingresa el nombre del cliente para registrar la orden."
      );
      return;
    }

    // Validación de Cliente Inactivo
    if (selectedCliente && isClientInactive(selectedCliente)) {
      warning(
        "Cliente Inactivo",
        `El cliente asociado "${selectedCliente.nombre || 'seleccionado'}" se encuentra inactivo y no tiene permitido realizar compras.`
      );
      return;
    }

    // Validaciones estrictas de Pago Obligatorio (primero el pago antes de entregar el producto)
    if (metodoPago === "efectivo") {
      if (!efectivoPaga || Number(efectivoPaga) <= 0) {
        warning(
          "Pago en efectivo obligatorio",
          `Debes ingresar el monto recibido por el cliente (mínimo $${finalTotal.toLocaleString("es-CO")}).`
        );
        return;
      }
      if (Number(efectivoPaga) < finalTotal) {
        warning(
          "Monto insuficiente",
          `El cliente debe pagar mínimo el total de la orden ($${finalTotal.toLocaleString("es-CO")}).`
        );
        return;
      }
      const vuelto = Number(efectivoPaga) - finalTotal;
      const MAX_CAMBIO_PERMITIDO = 100000;
      if (vuelto > MAX_CAMBIO_PERMITIDO) {
        warning(
          "Límite de cambio de caja",
          `Por políticas de arqueo y seguridad de caja, el cambio máximo permitido es de $${MAX_CAMBIO_PERMITIDO.toLocaleString("es-CO")}. Si el cliente paga con montos mayores, registra el cobro por Tarjeta.`
        );
        return;
      }
    } else if (metodoPago === "tarjeta") {
      const cleanCard = tarjetaNumero.replace(/\s+/g, "");
      if (!cleanCard || cleanCard.length < 15) {
        warning(
          "Tarjeta incompleta",
          "Por favor ingresa los 16 dígitos de la tarjeta para registrar el pago."
        );
        return;
      }
    }

    const payload = {
      idUsuario: user?.idUsuario || user?.id || null,
      idCliente: selectedCliente ? (selectedCliente.id || selectedCliente.idCliente) : null,
      tipoEntrega: "En Mesa",
      direccion: "Consumo en Mesa",
      clienteNombre: clienteNombre.trim(),
      responsable: responsableNombre,
      subtotal: Number(subtotal || 0),
      descuento: calculatedDescuento,
      descuentoAplicado: calculatedDescuento,
      descuentoPorcentaje: discountPercent,
      total: finalTotal,
      origen: "PUNTO_FISICO",
      tiempoEstimadoEntrega: "15-20 min",
      metodoPago: metodoPago === "tarjeta" ? "Tarjeta" : "Efectivo",
      datosPago: {
        efectivoConCuanto: efectivoPaga ? Number(efectivoPaga) : null,
        vueltoEfectivo: vueltoEfectivo > 0 ? vueltoEfectivo : null,
        tarjetaNumero: tarjetaNumero || null
      }
    };

    onConfirm(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-lg bg-white dark:bg-gray-900 rounded-[28px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-[#f05454]/30 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
              <div className="relative bg-white dark:bg-gray-800 p-5 rounded-full shadow-2xl border-2 border-[#f05454]/10">
                <Flame className="w-12 h-12 text-[#f05454] animate-bounce" />
              </div>
            </div>
            <h3 className="mt-8 text-xl font-black text-gray-900 dark:text-gray-100 flex items-center justify-center gap-2">
              ¡Cocinando tu pedido! <Flame className="w-5 h-5 text-amber-500 inline animate-pulse" />
            </h3>
            <p className="text-sm text-gray-500 font-medium mt-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" /> Enviando magia a la cocina...
            </p>
          </div>
        )}

        {/* Header con degradado Coral */}
        <div className="relative bg-gradient-to-r from-[#d84040] via-[#e05454] to-[#f05454] text-white p-5 sm:p-6 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">Finalizar Pedido</h2>
          <p className="text-xs text-red-100 mt-0.5 font-medium">
            Punto de Venta — Entrega en mostrador y fidelización
          </p>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* 1. Tarjeta Resumen Financiero */}
          <div className="bg-[#f8fafc] dark:bg-gray-800/60 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-xs space-y-2 font-mono">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Subtotal ({safeCart.reduce((a, b) => a + (Number(b.cantidad) || 1), 0)} items)</span>
              <span className="font-bold text-gray-800 dark:text-gray-200 tabular-nums">
                ${Number(subtotal || 0).toLocaleString("es-CO")}
              </span>
            </div>

            {calculatedDescuento > 0 && (
              <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded-xl border border-emerald-200 dark:border-emerald-800/50">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <span>Descuento Fidelidad {selectedCliente ? selectedCliente.tipo : ''} ({discountPercent}% OFF)</span>
                </span>
                <span className="font-bold text-sm">-${calculatedDescuento.toLocaleString("es-CO")}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="text-base font-black text-gray-900 dark:text-gray-100">Total a Pagar</span>
              <span className="text-2xl font-black text-[#f05454] dark:text-red-400 tabular-nums">
                ${finalTotal.toLocaleString("es-CO")}
              </span>
            </div>
          </div>

          {/* 2. Responsable (Vendedor) y Tipo de Entrega */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Responsable de la Venta (Usuario autenticado) */}
            <div className="p-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/50 shadow-xs flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-400 block">
                  Responsable
                </span>
                <p className="font-bold text-xs text-gray-900 dark:text-gray-100 truncate leading-tight">
                  {responsableNombre}
                </p>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[9.5px] font-bold rounded-md shrink-0">
                    {responsableRol}
                  </span>
                  <span className="text-[10px] text-gray-400 truncate">
                    • En turno
                  </span>
                </div>
              </div>
            </div>

            {/* Tipo de Entrega (Mostrador / Local) */}
            <div className="p-3.5 rounded-2xl border border-[#f05454]/40 bg-[#FFF5F5] dark:bg-red-950/20 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/40 text-[#f05454] shrink-0">
                  <Store className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#f05454]">
                    Entrega
                  </span>
                  <p className="font-bold text-xs text-[#f05454] truncate">Consumo en Mesa</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">Servicio en salón / mesa</p>
                </div>
              </div>
              <span className="w-5 h-5 rounded-full border-2 border-[#f05454] flex items-center justify-center text-[#f05454] text-xs font-black shrink-0"><Check className="w-3 h-3 stroke-[3]" /></span>
            </div>
          </div>

          {/* 3. Panel Interactivo de Gestión y Asociación de Clientes */}
          <div className="space-y-3 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/40">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-[#f05454]" />
                <span>Identificación del Cliente</span>
              </h4>
              {selectedCliente && (
                <FidelidadBadge
                  tipo={selectedCliente.tipo || "Nuevo"}
                  descuento={selectedCliente.descuentoPorcentaje}
                  size="sm"
                />
              )}
            </div>

            {/* Selector Inicial: Especificar al hacer la venta si tiene cuenta o no */}
            <div className="bg-white dark:bg-gray-800 p-2.5 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-2 shadow-2xs">
              <span className="text-[11px] font-black text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <span>¿El cliente tiene cuenta registrada en Chazin Food?</span>
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTieneCuenta(true);
                    setIsSearchingClient(true);
                  }}
                  className={`py-2 px-3 rounded-xl border-2 font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    tieneCuenta || selectedCliente
                      ? "border-[#f05454] bg-[#FFF5F5] dark:bg-red-950/40 text-[#f05454] shadow-2xs"
                      : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Sí, Con Cuenta</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTieneCuenta(false);
                    setIsSearchingClient(false);
                    handleClearSelectedClient();
                  }}
                  className={`py-2 px-3 rounded-xl border-2 font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    !tieneCuenta && !selectedCliente
                      ? "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 shadow-2xs"
                      : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>No, Sin Cuenta (Ocasional)</span>
                </button>
              </div>
            </div>

            {/* CASO B: Buscador Interactivo de Clientes (Se muestra al presionar Buscar o Cambiar) */}
            {isSearchingClient ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-3.5 border border-gray-200 dark:border-gray-700 shadow-sm space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-[#f05454]" />
                    <span>{selectedCliente ? "Cambiar Cliente Asociado" : "Buscar Cliente con Cuenta"}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchingClient(false);
                      setClientSearchTerm("");
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-bold cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>

                {/* Input de Búsqueda Directa */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={clientSearchTerm}
                    onChange={(e) => setClientSearchTerm(e.target.value)}
                    placeholder="Buscar por cédula / documento o nombre del cliente..."
                    className="w-full pl-9 pr-8 py-2.5 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-[#f05454]/40"
                    autoFocus
                  />
                  {clientSearchTerm && (
                    <button
                      type="button"
                      onClick={() => setClientSearchTerm("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Lista de Resultados Directos */}
                <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                  {!clientSearchTerm.trim() ? (
                    <div className="p-3.5 bg-gray-50 dark:bg-gray-750/50 rounded-xl text-center space-y-1 border border-dashed border-gray-200 dark:border-gray-700">
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center justify-center gap-1.5">
                        <Search className="w-3.5 h-3.5 text-gray-400" />
                        <span>Búsqueda rápida por documento (cédula) o nombre</span>
                      </p>
                      <p className="text-[11px] text-gray-400">
                        Escribe para verificar si el cliente tiene cuenta activa y aplicar su descuento de fidelidad.
                      </p>
                    </div>
                  ) : filteredClientes.length === 0 ? (
                    <div className="p-4 text-center text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-750/50 rounded-xl">
                      <p className="font-bold">No se encontraron clientes con esos datos.</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Verifica el número de teléfono, cédula o nombre ingresado.</p>
                    </div>
                  ) : (
                    filteredClientes.map((c) => {
                      const cId = c.id || c.idCliente;
                      const cNombre = `${c.nombre || ''} ${c.apellidos || ''}`.trim() || 'Cliente';
                      const cTipo = c.tipo || 'Nuevo';
                      const cDesc = c.descuentoPorcentaje ? `${c.descuentoPorcentaje}% OFF` : '';
                      const isCurrentlySelected = Boolean(selectedCliente && (selectedCliente.id || selectedCliente.idCliente) === cId);

                      const isInactive = isClientInactive(c);
                      const hasAccount = Boolean(c.idUsuario || c.usuario || c.tieneCuenta);
                      const hasActiveAccount = hasAccount && !isInactive;
                      const docVal = c.documento || c.cedula || c.numeroDocumento || c.identificacion;
                      const docTipo = c.tipoDocumento || "C.C.";

                      return (
                        <div
                          key={cId}
                          onClick={() => handleSelectClient(c)}
                          className={`p-2.5 rounded-xl border transition flex items-center justify-between gap-2.5 transition-all ${
                            isInactive
                              ? "bg-gray-100/70 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-70 cursor-not-allowed hover:border-red-300 dark:hover:border-red-800"
                              : isCurrentlySelected
                              ? "border-[#f05454] bg-[#FFF5F5] dark:bg-red-950/30 shadow-xs cursor-pointer"
                              : "border-gray-100 dark:border-gray-700/80 hover:border-[#f05454] bg-gray-50/60 hover:bg-[#FFF5F5] dark:bg-gray-750/50 dark:hover:bg-red-950/20 cursor-pointer group"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="shrink-0">
                              <FidelidadBadge tipo={cTipo} size="sm" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className={`text-xs font-bold truncate ${isInactive ? "text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-gray-100"}`}>
                                  {cNombre}
                                </p>
                                {docVal ? (
                                  <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/70 text-blue-900 dark:text-blue-200 text-[10.5px] font-black border border-blue-200 dark:border-blue-800 shrink-0">
                                    {docTipo} {docVal}
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[9.5px] font-semibold shrink-0">
                                    Sin registrar
                                  </span>
                                )}
                                {isInactive ? (
                                  <span className="px-1.5 py-0.5 rounded-md bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-[9.5px] font-black flex items-center gap-1 shrink-0">
                                    <Lock className="w-2.5 h-2.5" />
                                    <span>Inactivo (Bloqueado)</span>
                                  </span>
                                ) : hasActiveAccount ? (
                                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[9.5px] font-black flex items-center gap-0.5 shrink-0">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span>Cuenta Activa</span>
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-[9.5px] font-semibold shrink-0">
                                    Sin Cuenta Web
                                  </span>
                                )}
                              </div>
                              <div className="text-[10.5px] text-gray-500 dark:text-gray-400 truncate mt-0.5 flex items-center gap-2">
                                {c.telefono ? <span className="flex items-center gap-0.5"><Phone className="w-3 h-3 text-gray-400" /> {c.telefono}</span> : null}
                                {c.email ? <span className="flex items-center gap-0.5"><Mail className="w-3 h-3 text-gray-400" /> {c.email}</span> : null}
                                {!c.telefono && !c.email ? <span>Cliente Registrado</span> : null}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {cDesc && !isInactive ? (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-black rounded-lg">
                                {cDesc}
                              </span>
                            ) : null}
                            {isInactive ? (
                              <span className="px-2.5 py-1 bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900/40 text-[10.5px] font-bold rounded-xl flex items-center gap-1 shadow-2xs">
                                <Lock className="w-3 h-3" />
                                <span>No disponible</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 bg-white dark:bg-gray-800 text-[#f05454] group-hover:bg-[#f05454] group-hover:text-white border border-[#f05454] text-[11px] font-black rounded-xl transition shadow-2xs">
                                {isCurrentlySelected ? "Seleccionado" : "Asociar"}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : selectedCliente ? (
              /* CASO A: Cliente Asociado Seleccionado */
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-3.5 border-2 border-[#f05454]/40 shadow-xs space-y-3 animate-in fade-in duration-200">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="shrink-0">
                      <FidelidadBadge tipo={selectedCliente.tipo} size="md" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h5 className="text-sm font-black text-gray-900 dark:text-gray-100">
                          {selectedCliente.nombre} {selectedCliente.apellidos || ''}
                        </h5>
                        {(() => {
                          const selDocVal = selectedCliente.documento || selectedCliente.cedula || selectedCliente.numeroDocumento || selectedCliente.identificacion;
                          const selDocTipo = selectedCliente.tipoDocumento || "C.C.";
                          return selDocVal ? (
                            <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/70 text-blue-900 dark:text-blue-200 text-[11px] font-black border border-blue-200 dark:border-blue-800 shrink-0">
                              {selDocTipo} {selDocVal}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-[10px] font-bold border border-gray-200 dark:border-gray-600 shrink-0">
                              Sin registrar
                            </span>
                          );
                        })()}
                                                {(() => {
                          const isSelInactive = isClientInactive(selectedCliente);

                          const selHasAccount = Boolean(selectedCliente.idUsuario || selectedCliente.usuario || selectedCliente.tieneCuenta);
                          const selHasActive = selHasAccount && !isSelInactive;

                          if (selHasActive) {
                            return (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-black flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" />
                                <span>Cuenta Activa</span>
                              </span>
                            );
                          }
                          if (selHasAccount) {
                            return (
                              <span className="px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-[10px] font-black flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                <span>Cuenta Inactiva</span>
                              </span>
                            );
                          }
                          return (
                            <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-[10px] font-bold">
                              Sin Cuenta Web
                            </span>
                          );
                        })()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-2.5 flex-wrap">
                        {selectedCliente.telefono && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            <span>{selectedCliente.telefono}</span>
                          </span>
                        )}
                        {selectedCliente.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            <span>{selectedCliente.email}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleClearSelectedClient}
                    className="text-gray-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
                    title="Desvincular y volver a Mostrador"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs bg-[#FFF5F5] dark:bg-red-950/30 p-2.5 rounded-xl border border-red-100 dark:border-red-900/50 text-[#f05454] font-bold">
                  <span className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span>Beneficio: {discountPercent}% OFF y acumulará racha de compra</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchingClient(true);
                      setClientSearchTerm("");
                    }}
                    className="text-xs text-gray-600 dark:text-gray-300 hover:text-[#f05454] underline cursor-pointer font-bold ml-2"
                  >
                    Cambiar
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Nombre del Cliente en Factura / Comanda <span className="text-red-500 font-extrabold">* (Obligatorio)</span>:
                  </label>
                  <input
                    type="text"
                    required
                    value={clienteNombre}
                    onChange={(e) => {
                      setClienteTouched(true);
                      setClienteNombre(e.target.value);
                    }}
                    onBlur={() => setClienteTouched(true)}
                    placeholder="Ingresa el nombre del cliente (Obligatorio)"
                    className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-750 border rounded-xl text-xs font-semibold text-gray-800 dark:text-gray-200 outline-none transition ${
                      clienteTouched && !clienteNombre.trim()
                        ? "border-red-500 bg-red-50/50 dark:bg-red-950/20 text-red-900 focus:ring-2 focus:ring-red-400"
                        : "border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[#f05454]/30"
                    }`}
                  />
                  {clienteTouched && !clienteNombre.trim() && (
                    <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
                      <span>El nombre del cliente es obligatorio.</span>
                    </p>
                  )}
                </div>
              </div>
            ) : (
              /* CASO D: Modo Mostrador / Venta Rápida (Cliente sin Cuenta) */
              <div className="space-y-2.5">
                <div className="p-3.5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <FoodIcon name="sprout" size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <div>
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                          Cliente Mostrador (Venta Rápida / Sin Cuenta)
                        </span>
                        <span className="text-[10px] text-gray-400">
                          Para clientes presenciales sin registro de fidelidad
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsSearchingClient(true)}
                      className="px-3 py-1.5 bg-[#f05454] hover:bg-[#e04545] text-white text-xs font-bold rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Buscar Cliente con Cuenta</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Nombre del Cliente (Mostrador / Mesa / Comanda) <span className="text-red-500 font-extrabold">* (Obligatorio)</span>:
                    </label>
                    <input
                      type="text"
                      required
                      value={clienteNombre}
                      onChange={(e) => {
                        setClienteTouched(true);
                        setClienteNombre(e.target.value);
                      }}
                      onBlur={() => setClienteTouched(true)}
                      className={`w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-750 border rounded-xl text-xs font-semibold text-gray-900 dark:text-gray-100 outline-none transition ${
                        clienteTouched && !clienteNombre.trim()
                          ? "border-red-500 bg-red-50/50 dark:bg-red-950/20 text-red-900 focus:ring-2 focus:ring-red-400"
                          : clienteNombre.trim()
                          ? "border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
                          : "border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[#f05454]/30"
                      }`}
                      placeholder="Ingresa el nombre del cliente (Obligatorio)"
                    />
                    {clienteTouched && !clienteNombre.trim() ? (
                      <p className="text-[10.5px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
                        <span>El nombre del cliente es obligatorio para registrar la venta.</span>
                      </p>
                    ) : clienteNombre.trim() ? (
                      <p className="text-[10.5px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Nombre registrado correctamente para recibo y cocina.</span>
                      </p>
                    ) : (
                      <p className="text-[10.5px] text-gray-400 mt-1">
                        Nombre que saldrá en la comanda de preparación y recibo.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 rounded-xl p-2.5 flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-blue-800 dark:text-blue-200 leading-relaxed">
                <span className="font-bold">Entrega:</span> Chazin Food — Cra. 12 #45-67. Mostrador físico.
              </p>
            </div>
          </div>

          {/* 4. Método de Pago */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#f05454]" />
              <span>Método de Pago</span>
            </h4>

            {/* Selector de Métodos (2 Columnas: Solo Efectivo y Tarjeta) */}
            <div className="grid grid-cols-2 gap-3">
              {/* Efectivo */}
              <button
                type="button"
                onClick={() => setMetodoPago("efectivo")}
                className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                  metodoPago === "efectivo"
                    ? "border-[#f05454] bg-[#FFF5F5] dark:bg-red-950/20 text-[#f05454] shadow-xs"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50"
                }`}
              >
                <Banknote className="w-5 h-5 text-inherit" />
                <span className="text-xs font-bold text-inherit">Efectivo</span>
                {metodoPago === "efectivo" && (
                  <span className="w-4 h-4 rounded-full border border-[#f05454] flex items-center justify-center text-[#f05454] text-[10px] font-black"><Check className="w-3 h-3 stroke-[3]" /></span>
                )}
              </button>

              {/* Tarjeta */}
              <button
                type="button"
                onClick={() => setMetodoPago("tarjeta")}
                className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                  metodoPago === "tarjeta"
                    ? "border-[#f05454] bg-[#FFF5F5] dark:bg-red-950/20 text-[#f05454] shadow-xs"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50"
                }`}
              >
                <CreditCard className="w-5 h-5 text-inherit" />
                <span className="text-xs font-bold text-inherit">Tarjeta</span>
                {metodoPago === "tarjeta" && (
                  <span className="w-4 h-4 rounded-full border border-[#f05454] flex items-center justify-center text-[#f05454] text-[10px] font-black"><Check className="w-3 h-3 stroke-[3]" /></span>
                )}
              </button>
            </div>

            {/* Sub-formulario Efectivo */}
            {metodoPago === "efectivo" && (
              <div className="bg-[#F0FDF4] dark:bg-emerald-950/20 border border-[#DCFCE7] dark:border-emerald-900/40 rounded-2xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#166534] dark:text-emerald-300">
                    Monto en efectivo recibido por el cliente <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] font-black text-[#16A34A] dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded-md">
                    Pago requerido
                  </span>
                </div>

                <div className={`relative flex items-center bg-white dark:bg-gray-800 border rounded-xl px-3.5 py-2 shadow-2xs transition ${
                  pagoTouched && (!efectivoPaga || montoPagaNum < finalTotal || vueltoEfectivo > 100000)
                    ? "border-red-500 bg-red-50/40 dark:bg-red-950/20 text-red-900"
                    : montoPagaNum >= finalTotal
                    ? "border-emerald-500"
                    : "border-[#86EFAC] dark:border-emerald-700"
                }`}>
                  <Banknote className="w-4 h-4 text-[#16A34A] mr-2 shrink-0" />
                  <NumberInput
                    formatThousands={true}
                    showStepper={false}
                    min={0}
                    value={efectivoPaga}
                    onChange={(e) => {
                      setPagoTouched(true);
                      const raw = e?.target ? e.target.value : e;
                      setEfectivoPaga(raw);
                    }}
                    onBlur={() => setPagoTouched(true)}
                    placeholder={`Mínimo: $${finalTotal.toLocaleString("es-CO")}`}
                    className="w-full bg-transparent text-sm font-bold text-gray-900 dark:text-gray-100 outline-none"
                  />
                </div>

                {/* Live validation feedback for Cash */}
                {!efectivoPaga ? (
                  pagoTouched ? (
                    <p className="text-[11px] text-red-600 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
                      <span>Ingresa el valor entregado (mínimo ${finalTotal.toLocaleString("es-CO")}).</span>
                    </p>
                  ) : (
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Info className="w-3.5 h-3.5 text-gray-400" />
                      <span>Ingresa el valor entregado (mínimo ${finalTotal.toLocaleString("es-CO")}).</span>
                    </p>
                  )
                ) : montoPagaNum < finalTotal ? (
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-2 rounded-lg border border-red-200 dark:border-red-900/60">
                    <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span>Monto insuficiente: Faltan ${(finalTotal - montoPagaNum).toLocaleString("es-CO")} para cubrir el total.</span>
                  </div>
                ) : vueltoEfectivo > 100000 ? (
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 p-2 rounded-lg border border-red-200 dark:border-red-900/60">
                    <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    <span>El cambio (${vueltoEfectivo.toLocaleString("es-CO")}) excede el límite de caja ($100.000 COP). Cobrar por tarjeta.</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/60 p-2 rounded-lg border border-emerald-300 dark:border-emerald-800">
                    <span className="flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Cambio a devolver al cliente:</span>
                    </span>
                    <span className="text-sm font-black text-emerald-800 dark:text-emerald-200">
                      ${vueltoEfectivo.toLocaleString("es-CO")}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Sub-formulario Tarjeta */}
            {metodoPago === "tarjeta" && (
              <div className="bg-[#F8FAFF] dark:bg-blue-950/20 border border-[#E0E7FF] dark:border-blue-900/40 rounded-2xl p-3.5 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#1E40AF] dark:text-blue-300 mb-1">
                    Número de tarjeta <span className="text-red-500">*</span>
                  </label>
                  <div className={`relative flex items-center bg-white dark:bg-gray-800 border rounded-xl px-3.5 py-2 shadow-2xs transition ${
                    pagoTouched && !isCardComplete
                      ? "border-red-500 bg-red-50/40 dark:bg-red-950/20 text-red-900"
                      : isCardComplete
                      ? "border-emerald-500"
                      : "border-[#C7D2FE] dark:border-blue-700"
                  }`}>
                    <CreditCard className="w-4 h-4 text-[#3B82F6] mr-2 shrink-0" />
                    <input
                      type="text"
                      required
                      value={tarjetaNumero}
                      onChange={(e) => {
                        setPagoTouched(true);
                        const v = e.target.value.replace(/[^\d]/g, "").slice(0, 16);
                        setTarjetaNumero(v.replace(/(\d{4})(?=\d)/g, "$1 "));
                      }}
                      onBlur={() => setPagoTouched(true)}
                      placeholder="0000 0000 0000 0000"
                      className="w-full bg-transparent text-sm font-mono font-bold text-gray-900 dark:text-gray-100 outline-none tracking-widest"
                    />
                  </div>

                  {/* Live Card Feedback */}
                  {!cleanCardDigits ? (
                    pagoTouched ? (
                      <p className="text-[10.5px] text-red-600 font-medium mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
                        <span>Ingresa los 16 dígitos para registrar la venta en datáfono.</span>
                      </p>
                    ) : (
                      <p className="text-[10.5px] text-gray-400 mt-1 flex items-center gap-1">
                        <Info className="w-3 h-3 text-gray-400" />
                        <span>Ingresa los 16 dígitos para registrar la venta en datáfono.</span>
                      </p>
                    )
                  ) : !isCardComplete ? (
                    <p className="text-[10.5px] text-red-600 dark:text-red-400 font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
                      <span>Faltan {16 - cleanCardDigits.length} dígitos para completar la tarjeta (16 dígitos requeridos).</span>
                    </p>
                  ) : (
                    <p className="text-[10.5px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span>Tarjeta lista para cobro de ${finalTotal.toLocaleString("es-CO")}.</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E40AF] dark:text-blue-300 mb-1">
                    Monto a cargar (No editable)
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={`$ ${Number(total).toLocaleString("es-CO")}`}
                    className="w-full px-3.5 py-2 bg-gray-100 dark:bg-gray-800/80 border border-[#C7D2FE] dark:border-blue-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 outline-none cursor-not-allowed"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 5. Productos y Observaciones del Carrito */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#f05454]" />
              <span>Resumen de Productos ({safeCart.length})</span>
            </h4>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {safeCart.map((item, idx) => {
                const itemAdds = Array.isArray(item.adiciones) ? item.adiciones : [];
                const itemAddsTotal = itemAdds.reduce(
                  (s, a) => s + ((typeof a === "object" ? Number(a.precio || 0) : 0) * (typeof a === "object" ? (Number(a.cantidad) || 1) : 1)),
                  0
                );
                const itemLineTotal =
                  ((Number(item.precio) || 0) + itemAddsTotal) * (Number(item.cantidad) || 1);

                const unitPrice = (Number(item.precio) || 0) + itemAddsTotal;

                return (
                  <div
                    key={`${item.productoId || idx}-${idx}`}
                    className="p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-[#fbfcfd] dark:bg-gray-800/40 text-xs flex flex-col gap-1.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 font-bold text-gray-900 dark:text-gray-100">
                        <span className="truncate block text-sm">
                          {item.cantidad || 1}x {item.nombre || "Producto"}
                        </span>
                      </div>
                      <div className="flex flex-col items-end text-right font-mono tabular-nums shrink-0">
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                          Unit: ${unitPrice.toLocaleString("es-CO")}
                        </span>
                        {(item.cantidad || 1) > 1 && (
                          <span className="text-[9.5px] text-gray-400">
                            {item.cantidad} × ${unitPrice.toLocaleString("es-CO")}
                          </span>
                        )}
                        <span className="text-sm font-black text-gray-900 dark:text-gray-100 tracking-tight">
                          ${itemLineTotal.toLocaleString("es-CO")}
                        </span>
                      </div>
                    </div>

                    {itemAdds.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {itemAdds.map((adc, aIdx) => {
                          const adcName = typeof adc === "object" ? (adc.nombre || adc.nombreAdicion || "Adición") : String(adc);
                          const adcPrice = typeof adc === "object" ? (Number(adc.precio || 0) * (Number(adc.cantidad) || 1)) : 0;
                          const adcQty = typeof adc === "object" && Number(adc.cantidad) > 1 ? `${adc.cantidad}x ` : "";

                          return (
                            <span
                              key={aIdx}
                              className="bg-red-50 dark:bg-red-950/40 text-[#f05454] dark:text-red-300 border border-red-100 dark:border-red-900/50 px-2 py-0.5 rounded-md text-[10px] font-semibold"
                            >
                              +{adcQty}{adcName} {adcPrice > 0 ? `($${adcPrice.toLocaleString("es-CO")})` : ""}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {item.observacion && (
                      <div className="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 px-2.5 py-1 rounded-lg mt-1 font-medium">
                        <span className="font-bold">Observación:</span> {item.observacion}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
              Total a pagar:
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#f05454] dark:text-red-400">
              ${finalTotal.toLocaleString("es-CO")}
            </span>
          </div>

          <p className="text-[11px] text-gray-400 dark:text-gray-400 flex items-center justify-center gap-1">
            <Info className="w-3.5 h-3.5" />
            <span>Precio sin IVA aplicado</span>
          </p>

          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 px-4 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-bold transition cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading || !isFormValid}
              className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-white text-xs sm:text-sm font-black transition cursor-pointer active:scale-[0.98] ${
                !isFormValid || loading
                  ? "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed shadow-none"
                  : "bg-[#e04545] hover:bg-[#d03535] shadow-[0_8px_20px_rgba(224,69,69,0.35)]"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? "Procesando..." : !isClientValid ? "Ingresa Cliente para Confirmar" : !isPaymentValid ? "Completa Pago para Confirmar" : "Confirmar Pedido"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PosCheckoutModal;
