import { useState, useEffect, useCallback } from "react";
import {
  X,
  ShoppingCart,
  Plus,
  Trash2,
  ChevronDown,
  Package,
  User,
  CalendarDays,
  DollarSign,
  Sparkles,
  Pencil
} from "lucide-react";
import { comprasService } from "../../servicios/comprasService";
import { apiClient } from "@/shared/api/apiClient";

const inputCls =
  "w-full px-4 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-[#F05454] focus:border-transparent transition-colors text-sm";
const labelCls =
  "block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1";

const DEFAULT_ITEM = { idInsumo: "", cantidad: "", precioUnitario: "", subtotal: 0 };

function parseFecha(dateValue) {
  if (!dateValue) return new Date().toISOString().split("T")[0];
  try {
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return new Date().toISOString().split("T")[0];
    return d.toISOString().split("T")[0];
  } catch {
    return new Date().toISOString().split("T")[0];
  }
}

function esEstadoPendiente(estado) {
  const e = String(estado || "").toUpperCase();
  return e === "PENDIENTE";
}

function normalizarEstadoSelect(estado) {
  const e = String(estado || "").trim().toUpperCase();
  if (e === "RECIBIDA" || e === "COMPLETADA") return "RECIBIDA";
  if (e === "PENDIENTE") return "PENDIENTE";
  if (e === "CANCELADA" || e === "ANULADA") return "CANCELADA";
  return "PENDIENTE";
}

export function NuevaCompraModal({ isOpen, onClose, onCreated, onUpdated, editCompra }) {
  const esEdicion = Boolean(editCompra && editCompra.id);
  const idCompraEdit = esEdicion ? editCompra.id : null;

  const [proveedores, setProveedores] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    idProveedor: "",
    fechaCompra: new Date().toISOString().split("T")[0],
    estado: "PENDIENTE"
  });
  const [items, setItems] = useState([{ ...DEFAULT_ITEM }]);

  const loadCatalogos = useCallback(async () => {
    try {
      setLoading(true);
      const [prov, ins] = await Promise.all([
        apiClient.get("/proveedores"),
        apiClient.get("/insumos")
      ]);
      setProveedores(Array.isArray(prov) ? prov : prov?.data || []);
      setInsumos(Array.isArray(ins) ? ins : ins?.data || []);
    } catch (err) {
      console.error("Error cargando catálogos:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const poblarDatosEdicion = useCallback(async () => {
    if (!idCompraEdit) return;
    try {
      setLoading(true);
      const detalle = await comprasService.getCompraById(idCompraEdit);
      if (!esEstadoPendiente(detalle.estado)) {
        onClose?.();
        return;
      }
      const estadoNormalizado = normalizarEstadoSelect(detalle.estado);
      setForm({
        idProveedor: detalle.idProveedor ? String(detalle.idProveedor) : "",
        fechaCompra: parseFecha(detalle.fechaCompra),
        estado: estadoNormalizado
      });
      const det = detalle.detalles || [];
      setItems(det.length === 0
        ? [{ ...DEFAULT_ITEM }]
        : det.map((d) => ({
            idInsumo: String(d.idInsumo),
            cantidad: String(parseFloat(d.cantidad) || 0),
            precioUnitario: String(parseFloat(d.precioUnitario) || 0),
            subtotal: parseFloat(d.subtotal || (parseFloat(d.cantidad) * parseFloat(d.precioUnitario))) || 0
          }))
      );
    } catch (err) {
      console.error("Error cargando compra para edición:", err);
    } finally {
      setLoading(false);
    }
  }, [idCompraEdit, onClose]);

  useEffect(() => {
    if (isOpen) {
      loadCatalogos();
      setSubmitted(false);
      if (esEdicion) {
        if (editCompra && !esEstadoPendiente(editCompra.estado)) {
          onClose?.();
          return;
        }
        poblarDatosEdicion();
      } else {
        setForm({
          idProveedor: "",
          fechaCompra: new Date().toISOString().split("T")[0],
          estado: "PENDIENTE"
        });
        setItems([{ ...DEFAULT_ITEM }]);
      }
    }
  }, [isOpen, esEdicion, editCompra, loadCatalogos, poblarDatosEdicion, onClose]);

  if (!isOpen) return null;

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    let newPrice = updated[index].precioUnitario;

    if (field === "idInsumo") {
      const selectedIns = insumos.find(
        (i) => String(i.idInsumo || i.id) === String(value)
      );
      if (selectedIns && selectedIns.precioUnitario) {
        newPrice = selectedIns.precioUnitario;
      }
    }

    updated[index] = {
      ...updated[index],
      [field]: value,
      precioUnitario: field === "idInsumo" ? newPrice : field === "precioUnitario" ? value : updated[index].precioUnitario
    };

    const cant = parseFloat(updated[index].cantidad) || 0;
    const precio = parseFloat(updated[index].precioUnitario) || 0;
    updated[index].subtotal = cant * precio;
    setItems(updated);
  };

  const addItem = () => setItems((prev) => [...prev, { ...DEFAULT_ITEM }]);
  const removeItem = (index) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const totalGeneral = items.reduce((acc, it) => acc + (it.subtotal || 0), 0);

  const isValid = () => {
    if (!form.idProveedor) return false;
    for (const it of items) {
      if (!it.idInsumo || !it.cantidad || !it.precioUnitario) return false;
      if (parseFloat(it.cantidad) <= 0 || parseFloat(it.precioUnitario) <= 0) return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitted || saving) return;
    if (!isValid()) return;
    if (esEdicion && editCompra && !esEstadoPendiente(editCompra.estado)) return;
    setSubmitted(true);
    setSaving(true);
    try {
      const estadoNormalizadoPayload = normalizarEstadoSelect(form.estado);
      const payload = {
        idProveedor: parseInt(form.idProveedor),
        fechaCompra: form.fechaCompra,
        estado: estadoNormalizadoPayload,
        total: totalGeneral,
        detalles: items.map((it) => ({
          idInsumo: parseInt(it.idInsumo),
          cantidad: parseFloat(it.cantidad),
          precioUnitario: parseFloat(it.precioUnitario),
          subtotal: it.subtotal
        }))
      };
      if (esEdicion) {
        await comprasService.updateCompra(idCompraEdit, payload);
        onUpdated?.();
      } else {
        await comprasService.createCompra(payload);
        onCreated?.();
      }
      onClose();
    } catch (err) {
      console.error("Error al guardar compra:", err);
      setSubmitted(false);
    } finally {
      setSaving(false);
    }
  };

  const selectedProveedorId = form.idProveedor ? String(form.idProveedor) : null;
  const insumosAsociados = selectedProveedorId
    ? insumos.filter((i) => String(i.idProveedor) === selectedProveedorId)
    : [];
  const insumosOtros = selectedProveedorId
    ? insumos.filter((i) => String(i.idProveedor) !== selectedProveedorId)
    : insumos;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-100 dark:border-gray-800"
        style={{ animation: "fadeInScale 0.2s ease-out" }}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${esEdicion ? "bg-blue-50 dark:bg-blue-900/20" : "bg-[#F05454]/10"}`}>
              {esEdicion
                ? <Pencil className="w-5 h-5 text-blue-500" />
                : <ShoppingCart className="w-5 h-5 text-[#F05454]" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {esEdicion ? "Editar Compra" : "Nueva Compra"}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {esEdicion
                  ? `Modificando orden de compra #${idCompraEdit}`
                  : "Registrar orden de compra de insumos"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {loading ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                Cargando datos...
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>
                      <User className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />
                      Proveedor *
                    </label>
                    <div className="relative">
                      <select
                        required
                        value={form.idProveedor}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, idProveedor: e.target.value }))
                        }
                        className={inputCls + " appearance-none pr-10"}
                      >
                        <option value="">Selecciona proveedor</option>
                        {proveedores.map((p) => (
                          <option
                            key={p.idProveedor || p.id}
                            value={p.idProveedor || p.id}
                          >
                            {p.nombre}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>
                      <CalendarDays className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />
                      Fecha de Compra *
                    </label>
                    <input
                      type="date"
                      required
                      value={form.fechaCompra}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, fechaCompra: e.target.value }))
                      }
                      className={inputCls}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelCls}>
                      Estado
                      {esEdicion && (
                        <span className="ml-2 text-[10px] font-normal text-gray-400">
                          (Para cambiar el estado usa la acción dedicada "Marcar como Recibida" desde la tabla o el detalle)
                        </span>
                      )}
                    </label>
                    <div className="flex items-start gap-3 flex-col sm:flex-row">
                      <div className="relative flex-1 w-full">
                        <select
                          value={normalizarEstadoSelect(form.estado)}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, estado: e.target.value }))
                          }
                          disabled={true}
                          className={inputCls + " appearance-none pr-10 opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-700"}
                        >
                          {!esEdicion && <option value="PENDIENTE">Pendiente (por defecto)</option>}
                          {esEdicion && normalizarEstadoSelect(form.estado) === "RECIBIDA" && <option value="RECIBIDA">Recibida</option>}
                          {esEdicion && normalizarEstadoSelect(form.estado) === "CANCELADA" && <option value="CANCELADA">Cancelada</option>}
                          {esEdicion && <option value="PENDIENTE">Pendiente</option>}
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className={`shrink-0 inline-flex items-center px-3 py-2 rounded-xl text-xs font-bold border ${
                          normalizarEstadoSelect(form.estado) === "RECIBIDA"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
                            : normalizarEstadoSelect(form.estado) === "CANCELADA"
                            ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                            : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
                        }`}>
                          {normalizarEstadoSelect(form.estado) === "RECIBIDA"
                            ? "✅ Recibida"
                            : normalizarEstadoSelect(form.estado) === "CANCELADA"
                            ? "❌ Cancelada"
                            : "⏳ Pendiente"}
                        </span>
                      </div>
                    </div>
                    {!esEdicion && (
                      <div className="mt-2 text-[11px] text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-lg p-3">
                        <strong>ℹ️ Importante:</strong> Todas las compras se crean en estado <strong>Pendiente</strong>. El stock de los insumos <strong>NO</strong> se actualizará hasta que manualmente marques la compra como <strong>Recibida</strong> desde la tabla o el detalle, cuando realmente lleguen los insumos.
                      </div>
                    )}
                    {esEdicion && (
                      <div className="mt-2 text-[11px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-lg p-3">
                        <strong>Nota:</strong> No puedes cambiar el estado desde aquí. Usa los botones de acción:
                        <span className="inline-flex items-center mx-1 text-green-600 dark:text-green-400 font-semibold">✅ Marcar como Recibida</span>
                        o
                        <span className="inline-flex items-center mx-1 text-red-500 font-semibold">❌ Anular</span>
                        disponibles en cada fila de la tabla o dentro del detalle de la compra.
                      </div>
                    )}
                  </div>
                </div>

                {selectedProveedorId && (
                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
                    <Sparkles className="w-4 h-4 shrink-0 text-blue-500" />
                    <span>
                      {insumosAsociados.length > 0
                        ? `Mostrando ${insumosAsociados.length} insumos vinculados a este proveedor en la parte superior.`
                        : "Este proveedor aún no tiene insumos específicamente vinculados, pero puedes seleccionar cualquier insumo disponible."}
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      Insumos a comprar
                    </p>
                    <button
                      type="button"
                      onClick={addItem}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F05454]/10 hover:bg-[#F05454]/20 text-[#F05454] text-xs font-semibold rounded-lg transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Agregar ítem
                    </button>
                  </div>

                  <div className="space-y-3">
                    {items.map((item, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-12 gap-2 items-end bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-100 dark:border-gray-700"
                      >
                        <div className="col-span-12 sm:col-span-5">
                          <label className={labelCls}>
                            <Package className="inline w-3 h-3 mr-1" />
                            Insumo *
                          </label>
                          <div className="relative">
                            <select
                              required
                              value={item.idInsumo}
                              onChange={(e) =>
                                handleItemChange(index, "idInsumo", e.target.value)
                              }
                              className={inputCls + " appearance-none pr-8 text-xs font-medium"}
                            >
                              <option value="">Selecciona insumo</option>
                              {selectedProveedorId && insumosAsociados.length > 0 && (
                                <optgroup label="⭐ Insumos de este Proveedor">
                                  {insumosAsociados.map((ins) => (
                                    <option
                                      key={ins.idInsumo || ins.id}
                                      value={ins.idInsumo || ins.id}
                                    >
                                      {ins.nombre} {ins.unidadMedida ? `(${ins.unidadMedida})` : ""}
                                    </option>
                                  ))}
                                </optgroup>
                              )}
                              <optgroup label={selectedProveedorId && insumosAsociados.length > 0 ? "Otros Insumos Disponibles" : "Todos los Insumos"}>
                                {insumosOtros.map((ins) => (
                                  <option
                                    key={ins.idInsumo || ins.id}
                                    value={ins.idInsumo || ins.id}
                                  >
                                    {ins.nombre} {ins.unidadMedida ? `(${ins.unidadMedida})` : ""}
                                  </option>
                                ))}
                              </optgroup>
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>

                        <div className="col-span-4 sm:col-span-2">
                          <label className={labelCls}>Cantidad *</label>
                          <input
                            type="number"
                            required
                            min="0.01"
                            step="0.01"
                            placeholder="0"
                            value={item.cantidad}
                            onChange={(e) =>
                              handleItemChange(index, "cantidad", e.target.value)
                            }
                            className={inputCls + " text-xs"}
                          />
                        </div>

                        <div className="col-span-5 sm:col-span-3">
                          <label className={labelCls}>
                            <DollarSign className="inline w-3 h-3 mr-0.5" />
                            Precio Unit. *
                          </label>
                          <input
                            type="number"
                            required
                            min="0.01"
                            step="0.01"
                            placeholder="0"
                            value={item.precioUnitario}
                            onChange={(e) =>
                              handleItemChange(index, "precioUnitario", e.target.value)
                            }
                            className={inputCls + " text-xs"}
                          />
                        </div>

                        <div className="col-span-10 sm:col-span-2">
                          <label className={labelCls}>Subtotal</label>
                          <div className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200">
                            ${Number(item.subtotal || 0).toLocaleString("es-CO", { minimumFractionDigits: 0 })}
                          </div>
                        </div>

                        <div className="col-span-2 sm:col-span-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            disabled={items.length === 1}
                            className="p-2 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Eliminar ítem"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="bg-[#F05454]/10 rounded-xl px-5 py-3 flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Total de la Compra:
                    </span>
                    <span className="text-xl font-bold text-[#F05454]">
                      ${totalGeneral.toLocaleString("es-CO", { minimumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !isValid()}
              className={`flex items-center gap-2 px-5 py-2.5 ${esEdicion ? "bg-blue-500 hover:bg-blue-600" : "bg-[#F05454] hover:bg-[#d84343]"} disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl shadow-md transition-colors`}
            >
              {esEdicion
                ? <Pencil className="w-4 h-4" />
                : <ShoppingCart className="w-4 h-4" />}
              {saving
                ? "Guardando..."
                : esEdicion ? "Guardar Cambios" : "Registrar Compra"}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
