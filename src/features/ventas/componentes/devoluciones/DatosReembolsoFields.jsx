import { Landmark, Smartphone, AlertCircle, ShieldCheck } from "lucide-react";
import {
  BANCO_OPTIONS,
  INITIAL_DATOS_REEMBOLSO,
  requiresDatosReembolso,
  validateDatosReembolso
} from "../../utils/datosReembolsoUtils";

export { INITIAL_DATOS_REEMBOLSO, requiresDatosReembolso, validateDatosReembolso };

export function DatosReembolsoFields({
  value = INITIAL_DATOS_REEMBOLSO,
  onChange,
  errors = {},
  allowCash = false,
  disabled = false
}) {
  const bancos = allowCash ? [...BANCO_OPTIONS, "Efectivo en Caja"] : BANCO_OPTIONS;
  const bancoSeleccionado = value.banco || "Bancolombia";
  const bancoFinal = bancoSeleccionado === "Otro" ? value.bancoOtro || "" : bancoSeleccionado;
  const esEfectivo = allowCash && /efectivo|caja/i.test(bancoFinal);
  const esBilletera = /nequi|daviplata/i.test(bancoFinal);

  const handleField = (field, nextVal) => {
    const next = { ...value, [field]: nextVal };
    if (field === "banco") {
      if (/nequi|daviplata/i.test(nextVal)) {
        next.tipoCuenta = "Billetera Digital / Celular";
      } else if (/efectivo|caja/i.test(nextVal)) {
        next.tipoCuenta = "Caja / POS";
      } else if (!next.tipoCuenta || next.tipoCuenta === "Billetera Digital / Celular" || next.tipoCuenta === "Caja / POS") {
        next.tipoCuenta = "Ahorros";
      }
    }
    onChange(next);
  };

  return (
    <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/50 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
            {esBilletera ? <Smartphone className="w-4 h-4" /> : <Landmark className="w-4 h-4" />}
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-100 leading-tight">
              Datos para Reembolso de Dinero
            </h4>
            <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
              Ingresa la cuenta Bancolombia, Nequi u otro medio válido para validar y transferir tu reembolso.
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 shrink-0">
          <ShieldCheck className="w-3 h-3" /> Obligatorio
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
            Banco / Billetera <span className="text-red-500">*</span>
          </label>
          <select
            value={bancoSeleccionado}
            onChange={(e) => handleField("banco", e.target.value)}
            disabled={disabled}
            className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-emerald-500 font-medium"
          >
            {bancos.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        {bancoSeleccionado === "Otro" ? (
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
              Nombre del banco / entidad <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={value.bancoOtro || ""}
              onChange={(e) => handleField("bancoOtro", e.target.value)}
              disabled={disabled}
              placeholder="Ej: Banco de Occidente, Dale!..."
              className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-emerald-500"
            />
          </div>
        ) : !esEfectivo ? (
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
              Tipo de cuenta <span className="text-red-500">*</span>
            </label>
            {esBilletera ? (
              <div className="w-full text-xs px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-white/80 dark:bg-gray-800/80 text-emerald-800 dark:text-emerald-300 font-semibold">
                Billetera Digital / Celular
              </div>
            ) : (
              <select
                value={value.tipoCuenta || "Ahorros"}
                onChange={(e) => handleField("tipoCuenta", e.target.value)}
                disabled={disabled}
                className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-emerald-500 font-medium"
              >
                <option value="Ahorros">Cuenta de Ahorros</option>
                <option value="Corriente">Cuenta Corriente</option>
              </select>
            )}
          </div>
        ) : null}

        {errors.banco && (
          <p className="sm:col-span-2 text-[11px] text-red-500 font-medium flex items-center gap-1">
            <AlertCircle className="w-3 h-3 shrink-0" />
            <span>{errors.banco}</span>
          </p>
        )}

        {!esEfectivo && (
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
              {esBilletera ? `Número de celular (${bancoFinal})` : "Número de cuenta"} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={value.numeroCuenta || ""}
              onChange={(e) => handleField("numeroCuenta", e.target.value.replace(/[^\d\s-]/g, ""))}
              disabled={disabled}
              placeholder={esBilletera ? "Ej: 3001234567" : "Ej: 12345678901"}
              maxLength={esBilletera ? 12 : 24}
              className={`w-full text-xs px-3 py-2 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none ${
                errors.numeroCuenta ? "border-red-500" : "border-gray-200 dark:border-gray-700 focus:border-emerald-500"
              }`}
            />
            {errors.numeroCuenta && (
              <p className="text-[11px] text-red-500 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.numeroCuenta}</span>
              </p>
            )}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
            Titular de la cuenta <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={value.titularNombre || ""}
            onChange={(e) => handleField("titularNombre", e.target.value)}
            disabled={disabled}
            placeholder="Nombre completo del titular"
            className={`w-full text-xs px-3 py-2 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none ${
              errors.titularNombre ? "border-red-500" : "border-gray-200 dark:border-gray-700 focus:border-emerald-500"
            }`}
          />
          {errors.titularNombre && (
            <p className="text-[11px] text-red-500 font-medium flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{errors.titularNombre}</span>
            </p>
          )}
        </div>

        <div className="space-y-1 sm:col-span-2">
          <label className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
            Documento del titular <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            <select
              value={value.titularTipoDocumento || "CC"}
              onChange={(e) => handleField("titularTipoDocumento", e.target.value)}
              disabled={disabled}
              className="col-span-1 text-xs px-2.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-emerald-500 font-medium"
            >
              <option value="CC">CC</option>
              <option value="CE">CE</option>
              <option value="TI">TI</option>
              <option value="NIT">NIT</option>
              <option value="PASAPORTE">Pasaporte</option>
            </select>
            <input
              type="text"
              value={value.titularDocumento || ""}
              onChange={(e) => handleField("titularDocumento", e.target.value)}
              disabled={disabled}
              placeholder="Número de documento del titular"
              className={`col-span-2 text-xs px-3 py-2 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none ${
                errors.titularDocumento ? "border-red-500" : "border-gray-200 dark:border-gray-700 focus:border-emerald-500"
              }`}
            />
          </div>
          {errors.titularDocumento && (
            <p className="text-[11px] text-red-500 font-medium flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{errors.titularDocumento}</span>
            </p>
          )}
        </div>

        <div className="space-y-1 sm:col-span-2">
          <label className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 flex items-center justify-between">
            <span>Observaciones de la cuenta / llave Bre-B</span>
            <span className="text-[10px] text-gray-400">Opcional</span>
          </label>
          <input
            type="text"
            value={value.observacionesCuenta || ""}
            onChange={(e) => handleField("observacionesCuenta", e.target.value)}
            disabled={disabled}
            placeholder="Ej: A nombre de un familiar, llave o nota adicional..."
            className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-emerald-500"
          />
        </div>
      </div>
    </div>
  );
}
