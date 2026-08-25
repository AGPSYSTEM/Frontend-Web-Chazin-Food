import React, { useState, useEffect, useMemo } from "react";
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
  ShieldCheck
} from "lucide-react";
import { clientesService } from "@/features/ventas/servicios/clientesService";
import { FidelidadBadge } from "@/shared/components/ui/FidelidadBadge";
import { useAuth } from "@/features/autenticacion/hooks/useAuth";
import { useNotifications } from "@/shared/hooks/useNotifications";

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
  const [clienteNombre, setClienteNombre] = useState("Cliente Mostrador");
  const [isSearchingClient, setIsSearchingClient] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [clientFilter, setClientFilter] = useState("all"); // "all", "fidelity", "with_account"

  const responsableNombre = user
    ? `${user.nombre || ''} ${user.apellidos || ''}`.trim() || user.nombre || "Vendedor"
    : "Vendedor Mostrador";
  const responsableRol = user?.rol || user?.rolInfo?.nombre || (user?.idRol === 1 ? "Administrador" : "Vendedor");

  const [metodoPago, setMetodoPago] = useState("efectivo"); // "efectivo", "tarjeta", "transferencia"

  // Pago en Efectivo
  const [efectivoPaga, setEfectivoPaga] = useState("");

  // Pago con Tarjeta
  const [tarjetaNumero, setTarjetaNumero] = useState("");

  // Pago con Transferencia
  const [transferBanco, setTransferBanco] = useState("Nequi");
  const [transferReferencia, setTransferReferencia] = useState("");

  // Load clients on modal open
  useEffect(() => {
    if (isOpen) {
      clientesService.getClientes().then(res => {
        if (Array.isArray(res)) {
          // Filter out generic placeholder entries
          const validClients = res.filter(c => 
            c.idCliente !== 26 && 
            !c.nombre?.toLowerCase().includes("cliente mostrador")
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

  // Filtered clients list
  const filteredClientes = clientesList.filter(c => {
    const search = clientSearchTerm.toLowerCase().trim();
    const fullName = `${c.nombre || ''} ${c.apellidos || ''}`.toLowerCase();
    const phone = String(c.telefono || '').toLowerCase();
    const email = String(c.email || '').toLowerCase();

    const matchSearch = !search || fullName.includes(search) || phone.includes(search) || email.includes(search);
    if (!matchSearch) return false;

    if (clientFilter === "fidelity") {
      const hasFidelity = c.tipo && c.tipo !== "Nuevo" && c.descuentoPorcentaje > 0;
      return hasFidelity;
    }
    if (clientFilter === "with_account") {
      return Boolean(c.tieneCuenta || c.idUsuario);
    }
    return true;
  });

  const handleSelectClient = (c) => {
    setSelectedCliente(c);
    setClienteNombre(`${c.nombre} ${c.apellidos || ''}`.trim());
    setIsSearchingClient(false);
  };

  const handleClearSelectedClient = () => {
    setSelectedCliente(null);
    setClienteNombre("Cliente Mostrador");
  };

  const handleConfirm = (e) => {
    e.preventDefault();

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
          `Por políticas de arqueo y seguridad de caja, el cambio máximo permitido es de $${MAX_CAMBIO_PERMITIDO.toLocaleString("es-CO")}. El vuelto actual es de $${vuelto.toLocaleString("es-CO")}. Si el cliente paga con montos mayores, registra el cobro por Transferencia o Tarjeta.`
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
    } else if (metodoPago === "transferencia") {
      if (!transferReferencia.trim()) {
        warning(
          "Comprobante requerido",
          "Por favor ingresa el número de referencia del comprobante de transferencia."
        );
        return;
      }
    }

    const payload = {
      idUsuario: user?.idUsuario || user?.id || null,
      idCliente: selectedCliente ? (selectedCliente.id || selectedCliente.idCliente) : null,
      tipoEntrega: "Recoger",
      direccion: "Recoger en Local",
      clienteNombre: clienteNombre.trim() || "Cliente Mostrador",
      responsable: responsableNombre,
      subtotal: Number(subtotal || 0),
      descuentoAplicado: calculatedDescuento,
      descuentoPorcentaje: discountPercent,
      total: finalTotal,
      metodoPago:
        metodoPago === "tarjeta"
          ? "Tarjeta"
          : metodoPago === "transferencia"
          ? "Transferencia"
          : "Efectivo",
      datosPago: {
        efectivoConCuanto: efectivoPaga ? Number(efectivoPaga) : null,
        vueltoEfectivo: vueltoEfectivo > 0 ? vueltoEfectivo : null,
        tarjetaNumero: tarjetaNumero || null,
        transferBanco: metodoPago === "transferencia" ? transferBanco : null,
        transferReferencia: metodoPago === "transferencia" ? transferReferencia : null
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
            <h3 className="mt-8 text-xl font-black text-gray-900 dark:text-gray-100">
              ¡Cocinando tu pedido! <span className="animate-pulse">🔥</span>
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
          <div className="bg-[#f8fafc] dark:bg-gray-800/60 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Subtotal ({safeCart.reduce((a, b) => a + (Number(b.cantidad) || 1), 0)} items)</span>
              <span className="font-bold text-gray-800 dark:text-gray-200">
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
              <span className="text-2xl font-black text-[#f05454] dark:text-red-400">
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
                  <p className="font-bold text-xs text-[#f05454] truncate">Recoger en Local</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">Mostrador físico</p>
                </div>
              </div>
              <span className="w-5 h-5 rounded-full border-2 border-[#f05454] flex items-center justify-center text-[#f05454] text-xs font-black shrink-0">
                ✓
              </span>
            </div>
          </div>

          {/* 3. Panel Interactivo de Gestión y Asociación de Clientes */}
          <div className="space-y-3 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/40">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-[#f05454]" />
                <span>Cliente y Fidelidad</span>
              </h4>
              {selectedCliente && (
                <FidelidadBadge
                  tipo={selectedCliente.tipo || "Nuevo"}
                  descuento={selectedCliente.descuentoPorcentaje}
                  size="sm"
                />
              )}
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

                {/* Input de Búsqueda */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={clientSearchTerm}
                    onChange={(e) => setClientSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre, teléfono o email..."
                    className="w-full pl-9 pr-8 py-2 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-[#f05454]/30"
                    autoFocus
                  />
                  {clientSearchTerm && (
                    <button
                      type="button"
                      onClick={() => setClientSearchTerm("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filtros Rápidos */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setClientFilter("all")}
                    className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition cursor-pointer ${
                      clientFilter === "all"
                        ? "bg-[#f05454] text-white"
                        : "bg-gray-100 dark:bg-gray-750 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
                    }`}
                  >
                    Todos ({clientesList.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setClientFilter("fidelity")}
                    className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition cursor-pointer flex items-center gap-1 ${
                      clientFilter === "fidelity"
                        ? "bg-amber-500 text-white"
                        : "bg-gray-100 dark:bg-gray-750 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
                    }`}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Con Fidelidad</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setClientFilter("with_account")}
                    className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition cursor-pointer ${
                      clientFilter === "with_account"
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-100 dark:bg-gray-750 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
                    }`}
                  >
                    Con Cuenta Activa
                  </button>
                </div>

                {/* Lista de Resultados */}
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {filteredClientes.length === 0 ? (
                    <div className="p-4 text-center text-xs text-gray-500 dark:text-gray-400">
                      <p>No se encontraron clientes coincidentes.</p>
                    </div>
                  ) : (
                    filteredClientes.map((c) => {
                      const cId = c.id || c.idCliente;
                      const cNombre = `${c.nombre || ''} ${c.apellidos || ''}`.trim() || 'Cliente';
                      const cTipo = c.tipo || 'Nuevo';
                      const cDesc = c.descuentoPorcentaje ? `${c.descuentoPorcentaje}% OFF` : '';
                      const isCurrentlySelected = selectedCliente && (selectedCliente.id || selectedCliente.idCliente) === cId;

                      return (
                        <div
                          key={cId}
                          onClick={() => handleSelectClient(c)}
                          className={`p-2.5 rounded-xl border transition flex items-center justify-between gap-2.5 cursor-pointer group ${
                            isCurrentlySelected
                              ? "border-[#f05454] bg-[#FFF5F5] dark:bg-red-950/30"
                              : "border-gray-100 dark:border-gray-700/80 hover:border-[#f05454] bg-gray-50/60 hover:bg-[#FFF5F5] dark:bg-gray-750/50 dark:hover:bg-red-950/20"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center text-xs font-black shrink-0 group-hover:bg-[#f05454] group-hover:text-white transition">
                              {cTipo === "VIP" ? "🥇" : cTipo === "Frecuente" ? "🥈" : cTipo === "Regular" ? "🥉" : "👤"}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
                                {cNombre}
                              </p>
                              <p className="text-[10.5px] text-gray-500 dark:text-gray-400 truncate">
                                {c.telefono || c.email || "Cliente Registrado"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {cDesc ? (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-black rounded-lg">
                                {cDesc}
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 text-[10px] font-semibold rounded-md">
                                {cTipo}
                              </span>
                            )}
                            <span className="px-2.5 py-1 bg-white dark:bg-gray-800 text-[#f05454] group-hover:bg-[#f05454] group-hover:text-white border border-[#f05454] text-[11px] font-black rounded-xl transition shadow-2xs">
                              {isCurrentlySelected ? "Seleccionado ✓" : "Asociar"}
                            </span>
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
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-[#f05454] text-white flex items-center justify-center text-lg font-black shadow-xs shrink-0">
                      {selectedCliente.tipo === "VIP" ? "🥇" : selectedCliente.tipo === "Frecuente" ? "🥈" : selectedCliente.tipo === "Regular" ? "🥉" : "👤"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h5 className="text-sm font-black text-gray-900 dark:text-gray-100">
                          {selectedCliente.nombre} {selectedCliente.apellidos || ''}
                        </h5>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-black flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Cuenta Activa</span>
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-2 flex-wrap">
                        {selectedCliente.telefono && <span>📞 {selectedCliente.telefono}</span>}
                        {selectedCliente.email && <span>✉️ {selectedCliente.email}</span>}
                      </p>
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
                  <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                    Nombre del Cliente en Factura / Comanda:
                  </label>
                  <input
                    type="text"
                    value={clienteNombre}
                    onChange={(e) => setClienteNombre(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-800 dark:text-gray-200 outline-none focus:ring-2 focus:ring-[#f05454]/30"
                  />
                </div>
              </div>
            ) : (
              /* CASO D: Modo Mostrador / Venta Rápida (Cliente sin Cuenta) */
              <div className="space-y-2.5">
                <div className="p-3.5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🌱</span>
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
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                      Nombre del Cliente (Mostrador / Mesa / Comanda):
                    </label>
                    <input
                      type="text"
                      value={clienteNombre}
                      onChange={(e) => setClienteNombre(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-[#f05454]/30"
                      placeholder="Ej. Juan Pérez / Carlos / Mesa 3"
                    />
                    <p className="text-[10.5px] text-gray-400 mt-1">
                      Nombre que saldrá en la comanda de preparación y recibo.
                    </p>
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

            {/* Selector de Métodos (3 Columnas) */}
            <div className="grid grid-cols-3 gap-2.5">
              {/* Efectivo */}
              <button
                type="button"
                onClick={() => setMetodoPago("efectivo")}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                  metodoPago === "efectivo"
                    ? "border-[#f05454] bg-[#FFF5F5] dark:bg-red-950/20 text-[#f05454] shadow-xs"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50"
                }`}
              >
                <Banknote className="w-5 h-5 text-inherit" />
                <span className="text-xs font-bold text-inherit">Efectivo</span>
                {metodoPago === "efectivo" && (
                  <span className="w-4 h-4 rounded-full border border-[#f05454] flex items-center justify-center text-[#f05454] text-[10px] font-black">
                    ✓
                  </span>
                )}
              </button>

              {/* Tarjeta */}
              <button
                type="button"
                onClick={() => setMetodoPago("tarjeta")}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                  metodoPago === "tarjeta"
                    ? "border-[#f05454] bg-[#FFF5F5] dark:bg-red-950/20 text-[#f05454] shadow-xs"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50"
                }`}
              >
                <CreditCard className="w-5 h-5 text-inherit" />
                <span className="text-xs font-bold text-inherit">Tarjeta</span>
                {metodoPago === "tarjeta" && (
                  <span className="w-4 h-4 rounded-full border border-[#f05454] flex items-center justify-center text-[#f05454] text-[10px] font-black">
                    ✓
                  </span>
                )}
              </button>

              {/* Transferencia */}
              <button
                type="button"
                onClick={() => setMetodoPago("transferencia")}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                  metodoPago === "transferencia"
                    ? "border-[#f05454] bg-[#FFF5F5] dark:bg-red-950/20 text-[#f05454] shadow-xs"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50"
                }`}
              >
                <Smartphone className="w-5 h-5 text-inherit" />
                <span className="text-xs font-bold text-inherit">Transferencia</span>
                {metodoPago === "transferencia" && (
                  <span className="w-4 h-4 rounded-full border border-[#f05454] flex items-center justify-center text-[#f05454] text-[10px] font-black">
                    ✓
                  </span>
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

                <div className="relative flex items-center bg-white dark:bg-gray-800 border border-[#86EFAC] dark:border-emerald-700 rounded-xl px-3.5 py-2 shadow-2xs">
                  <Banknote className="w-4 h-4 text-[#16A34A] mr-2 shrink-0" />
                  <input
                    type="number"
                    min={finalTotal}
                    required
                    value={efectivoPaga}
                    onChange={(e) => setEfectivoPaga(e.target.value)}
                    placeholder={`Mínimo: $${finalTotal.toLocaleString("es-CO")}`}
                    className="w-full bg-transparent text-sm font-bold text-gray-900 dark:text-gray-100 outline-none"
                  />
                </div>

                {/* Botones de montos rápidos */}
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <button
                    type="button"
                    onClick={() => setEfectivoPaga(String(finalTotal))}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition shadow-2xs cursor-pointer"
                  >
                    Pago Exacto (${finalTotal.toLocaleString("es-CO")})
                  </button>
                  {[20000, 50000, 100000].filter(v => v > finalTotal).map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setEfectivoPaga(String(amt))}
                      className="px-2.5 py-1 bg-white dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 text-[11px] font-bold rounded-lg transition shadow-2xs cursor-pointer"
                    >
                      ${amt.toLocaleString("es-CO")}
                    </button>
                  ))}
                </div>

                {montoPagaNum >= finalTotal && (
                  <div className="flex items-center justify-between text-xs font-black text-[#16A34A] dark:text-emerald-400 bg-white/80 dark:bg-gray-800/80 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <span>💰 Cambio / Vueltos al cliente:</span>
                    <span>${vueltoEfectivo.toLocaleString("es-CO")}</span>
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
                  <div className="relative flex items-center bg-white dark:bg-gray-800 border border-[#C7D2FE] dark:border-blue-700 rounded-xl px-3.5 py-2 shadow-2xs">
                    <CreditCard className="w-4 h-4 text-[#3B82F6] mr-2 shrink-0" />
                    <input
                      type="text"
                      required
                      value={tarjetaNumero}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^\d]/g, "").slice(0, 16);
                        setTarjetaNumero(v.replace(/(\d{4})(?=\d)/g, "$1 "));
                      }}
                      placeholder="0000 0000 0000 0000"
                      className="w-full bg-transparent text-sm font-mono font-bold text-gray-900 dark:text-gray-100 outline-none tracking-widest"
                    />
                  </div>
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

            {/* Sub-formulario Transferencia */}
            {metodoPago === "transferencia" && (
              <div className="bg-[#F8FAFF] dark:bg-blue-950/20 border border-[#E0E7FF] dark:border-blue-900/40 rounded-2xl p-3.5 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#1E40AF] dark:text-blue-300 mb-1">
                    Entidad / Banco origen
                  </label>
                  <select
                    value={transferBanco}
                    onChange={(e) => setTransferBanco(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white dark:bg-gray-800 border border-[#C7D2FE] dark:border-blue-700 rounded-xl text-sm font-bold text-gray-900 dark:text-gray-100 outline-none cursor-pointer"
                  >
                    <optgroup label="Billeteras digitales">
                      <option value="Nequi">Nequi</option>
                      <option value="Daviplata">Daviplata</option>
                    </optgroup>
                    <optgroup label="Bancos">
                      <option value="Bancolombia">Bancolombia</option>
                      <option value="Davivienda">Davivienda</option>
                      <option value="BBVA">BBVA</option>
                      <option value="Banco de Bogotá">Banco de Bogotá</option>
                      <option value="Banco Caja Social">Banco Caja Social</option>
                      <option value="Scotiabank Colpatria">Scotiabank Colpatria</option>
                      <option value="Otro">Otro</option>
                    </optgroup>
                  </select>
                </div>

                <div className="bg-blue-100/70 dark:bg-blue-900/30 p-2.5 rounded-xl text-xs text-[#1E40AF] dark:text-blue-300 font-medium leading-relaxed">
                  Transfiere a <span className="font-bold">Bancolombia Ahorros 123-456789-00</span> o{" "}
                  <span className="font-bold">Nequi 312-345-6789</span> a nombre de{" "}
                  <span className="font-bold">Chazin Food</span>.
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E40AF] dark:text-blue-300 mb-1">
                    Número de referencia / Comprobante <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={transferReferencia}
                    onChange={(e) => setTransferReferencia(e.target.value)}
                    placeholder="Ej: 987654321"
                    className="w-full px-3.5 py-2 bg-white dark:bg-gray-800 border border-[#C7D2FE] dark:border-blue-700 rounded-xl text-sm font-mono font-bold text-gray-900 dark:text-gray-100 outline-none"
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

                return (
                  <div
                    key={`${item.productoId || idx}-${idx}`}
                    className="p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-[#fbfcfd] dark:bg-gray-800/40 text-xs flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between font-bold text-gray-900 dark:text-gray-100">
                      <span className="truncate">
                        {item.cantidad || 1}x {item.nombre || "Producto"}
                      </span>
                      <span className="shrink-0 text-gray-800 dark:text-gray-200 font-black">
                        ${itemLineTotal.toLocaleString("es-CO")}
                      </span>
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
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#e04545] hover:bg-[#d03535] text-white text-xs sm:text-sm font-black shadow-[0_8px_20px_rgba(224,69,69,0.35)] transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? "Procesando..." : "Confirmar Pedido"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PosCheckoutModal;
