import { X, Package, Calendar, Tag, ShieldCheck, DollarSign, Layers, Building2, AlignLeft } from "lucide-react";

export function VerInsumoModal({ isOpen, onClose, insumo }) {
  if (!isOpen || !insumo) return null;

  const isBajo = (insumo.stock || 0) <= (insumo.stockMinimo || 0) && (insumo.stock || 0) > 0;
  const isAgotado = (insumo.stock || 0) === 0;

  const stockLabel = isAgotado ? "Agotado" : isBajo ? "Stock Bajo" : "Stock Normal";
  const stockBadgeClass = isAgotado
    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
    : isBajo
    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-[#F05454] flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {insumo.nombre}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Detalles del Insumo #{insumo.id || insumo.idInsumo || "N/A"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-sm overflow-y-auto max-h-[70vh]">
          {/* Main Badge Status Row */}
          <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Estado de Inventario</span>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${stockBadgeClass}`}>
              {stockLabel}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Categoría */}
            <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                <Tag className="w-3.5 h-3.5" />
                <span>Categoría</span>
              </div>
              <p className="font-semibold text-gray-800 dark:text-gray-200">
                {insumo.categoria || insumo.categoriaNombre || "Sin categoría"}
              </p>
            </div>

            {/* Proveedor */}
            <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                <Building2 className="w-3.5 h-3.5" />
                <span>Proveedor</span>
              </div>
              <p className="font-semibold text-gray-800 dark:text-gray-200">
                {insumo.proveedor || insumo.proveedorNombre || "Sin proveedor"}
              </p>
            </div>

            {/* Stock Actual */}
            <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                <Layers className="w-3.5 h-3.5" />
                <span>Stock Actual</span>
              </div>
              <p className="font-bold text-[#F05454]">
                {insumo.stock ?? 0} {insumo.unidadMedida || "und"}
              </p>
            </div>

            {/* Stock Mínimo */}
            <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                <Layers className="w-3.5 h-3.5" />
                <span>Stock Mínimo</span>
              </div>
              <p className="font-semibold text-gray-800 dark:text-gray-200">
                {insumo.stockMinimo ?? 0} {insumo.unidadMedida || "und"}
              </p>
            </div>

            {/* Precio Unitario */}
            <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800 sm:col-span-2">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                <span>Precio Unitario / Costo por Unidad</span>
              </div>
              <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                ${Number(insumo.precioUnitario || insumo.costo || 0).toLocaleString("es-CO")} / {insumo.unidadMedida || "und"}
              </p>
            </div>

            {/* Fecha Expedición */}
            <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                <span>Fecha Expedición</span>
              </div>
              <p className="font-medium text-gray-700 dark:text-gray-300">
                {insumo.fechaExpedicion || "No especificada"}
              </p>
            </div>

            {/* Fecha Vencimiento */}
            <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                <span>Fecha Vencimiento</span>
              </div>
              <p className="font-medium text-gray-700 dark:text-gray-300">
                {insumo.fechaVencimiento || "No especificada"}
              </p>
            </div>
          </div>

          {/* Descripción */}
          <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
              <AlignLeft className="w-3.5 h-3.5" />
              <span>Descripción / Observaciones</span>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed">
              {insumo.descripcion || "Sin descripción adicional."}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
