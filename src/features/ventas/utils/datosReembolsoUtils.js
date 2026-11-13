export const BANCO_OPTIONS = [
  "Bancolombia",
  "Nequi",
  "Daviplata",
  "Banco de Bogotá",
  "Davivienda",
  "BBVA",
  "Nubank / Nu",
  "Otro"
];

export const INITIAL_DATOS_REEMBOLSO = {
  banco: "Bancolombia",
  bancoOtro: "",
  tipoCuenta: "Ahorros",
  numeroCuenta: "",
  titularNombre: "",
  titularTipoDocumento: "CC",
  titularDocumento: "",
  observacionesCuenta: ""
};

export function requiresDatosReembolso(tipoResolucion) {
  return String(tipoResolucion || "").toLowerCase().includes("dinero");
}

/**
 * Valida y normaliza los datos bancarios / billetera para solicitudes de reembolso,
 * alineado con devolucionService.validateAndNormalizeDatosReembolso en backend.
 */
export function validateDatosReembolso(raw = {}, { allowCash = false } = {}) {
  const errors = {};
  const banco = String(raw.banco || "").trim();
  const bancoOtro = String(raw.bancoOtro || "").trim();
  const bancoFinal = banco.toLowerCase() === "otro" ? bancoOtro : banco;
  const esEfectivoPos = allowCash && /efectivo|caja/i.test(bancoFinal);
  const esBilletera = /nequi|daviplata/i.test(bancoFinal);
  const numeroClean = String(raw.numeroCuenta || "").replace(/[\s-]+/g, "").trim();
  const titularNombre = String(raw.titularNombre || "").trim();
  const titularDoc = String(raw.titularDocumento || "").replace(/[\s.]+/g, "").trim();

  if (!bancoFinal) {
    errors.banco = "Selecciona el banco o medio para recibir tu reembolso.";
  }

  if (!esEfectivoPos) {
    if (!numeroClean) {
      errors.numeroCuenta = esBilletera
        ? `Ingresa el número celular de ${bancoFinal}.`
        : "Ingresa el número de cuenta para el reembolso.";
    } else if (esBilletera && !/^3\d{9}$/.test(numeroClean)) {
      errors.numeroCuenta = `Para ${bancoFinal}, el celular debe tener 10 dígitos e iniciar en 3.`;
    } else if (!esBilletera && !/^\d{6,20}$/.test(numeroClean)) {
      errors.numeroCuenta = "El número de cuenta debe contener solo dígitos (6 a 20 caracteres).";
    }
  }

  if (titularNombre.length < 3) {
    errors.titularNombre = "Ingresa el nombre completo del titular de la cuenta.";
  }

  if (titularDoc.length < 5) {
    errors.titularDocumento = "Ingresa el número de documento del titular (mín. 5 caracteres).";
  }

  const tipoCuenta = esEfectivoPos
    ? "Caja / POS"
    : esBilletera
      ? "Billetera Digital / Celular"
      : String(raw.tipoCuenta || "Ahorros").trim();

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    normalized: {
      banco: bancoFinal,
      bancoOtro,
      tipoCuenta,
      numeroCuenta: esEfectivoPos ? "Efectivo en Caja" : numeroClean,
      titularNombre,
      titularTipoDocumento: String(raw.titularTipoDocumento || "CC").trim().toUpperCase(),
      titularDocumento: titularDoc,
      observacionesCuenta: String(raw.observacionesCuenta || "").trim()
    }
  };
}

