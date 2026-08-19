/**
 * Reglas y utilidades de validación para Colombia:
 * - Teléfono: 10 dígitos
 * - Cédula (C.C.): 6 a 10 dígitos
 * - Tarjeta de Identidad (T.I.): 10 a 11 dígitos
 * - Cédula de Extranjería (C.E.): 6 a 20 caracteres
 * - Pasaporte / NIT: 6 a 20 caracteres
 */

export const DOCUMENTO_CONFIG = {
  "C.C.": { min: 6, max: 10, label: "Cédula de Ciudadanía", helper: "6 a 10 dígitos", numericOnly: true },
  "CC": { min: 6, max: 10, label: "Cédula de Ciudadanía", helper: "6 a 10 dígitos", numericOnly: true },
  "T.I.": { min: 10, max: 11, label: "Tarjeta de Identidad", helper: "10 u 11 dígitos", numericOnly: true },
  "TI": { min: 10, max: 11, label: "Tarjeta de Identidad", helper: "10 u 11 dígitos", numericOnly: true },
  "C.E.": { min: 6, max: 20, label: "Cédula de Extranjería", helper: "6 a 20 caracteres alfanuméricos", numericOnly: false },
  "CE": { min: 6, max: 20, label: "Cédula de Extranjería", helper: "6 a 20 caracteres alfanuméricos", numericOnly: false },
  "Pasaporte": { min: 6, max: 20, label: "Pasaporte", helper: "6 a 20 caracteres", numericOnly: false },
  "NIT": { min: 6, max: 20, label: "NIT", helper: "6 a 20 dígitos", numericOnly: true },
  "Otro": { min: 4, max: 20, label: "Documento", helper: "4 a 20 caracteres", numericOnly: false }
};

export function getDocConfig(tipoDoc = "C.C.") {
  const norm = String(tipoDoc || "C.C.").trim();
  return DOCUMENTO_CONFIG[norm] || DOCUMENTO_CONFIG["C.C."];
}

/**
 * Limpia y recorta el número de documento según su tipo
 */
export function sanitizeDocumento(value = "", tipoDoc = "C.C.") {
  const config = getDocConfig(tipoDoc);
  let val = String(value || "");
  if (config.numericOnly) {
    val = val.replace(/\D/g, "");
  } else {
    val = val.replace(/[^a-zA-Z0-9\-]/g, "");
  }
  return val.slice(0, config.max);
}

/**
 * Valida si el número de documento cumple con la longitud mínima y formato
 */
export function validateDocumento(value = "", tipoDoc = "C.C.") {
  const config = getDocConfig(tipoDoc);
  const clean = sanitizeDocumento(value, tipoDoc);
  if (!clean) {
    return { isValid: false, error: "El número de documento es obligatorio." };
  }
  if (clean.length < config.min) {
    return {
      isValid: false,
      error: `${config.label} debe tener mínimo ${config.min} ${config.numericOnly ? "dígitos" : "caracteres"}.`
    };
  }
  if (clean.length > config.max) {
    return {
      isValid: false,
      error: `${config.label} no puede superar los ${config.max} ${config.numericOnly ? "dígitos" : "caracteres"}.`
    };
  }
  return { isValid: true, error: "" };
}

/**
 * Teléfono Colombia: solo números, máximo 10 dígitos (ej: 3001234567)
 */
export function sanitizeTelefono(value = "") {
  return String(value || "").replace(/\D/g, "").slice(0, 10);
}

export function validateTelefono(value = "") {
  const clean = sanitizeTelefono(value);
  if (!clean) {
    return { isValid: false, error: "El número de teléfono es obligatorio." };
  }
  if (clean.length !== 10 && clean.length !== 7) {
    return { isValid: false, error: "El teléfono en Colombia debe tener 10 dígitos (móvil) o 7 (fijo)." };
  }
  return { isValid: true, error: "" };
}

/**
 * Formatea y deduplica de forma segura el nombre completo:
 * Evita repeticiones accidentales como "Carlos Pérez Pérez" o "García López García López".
 */
export function formatNombreCompleto(nombre = "", apellidos = "") {
  let n = (nombre || "").trim();
  let a = (apellidos || "").trim();

  if (!n && !a) return "";
  if (!a) return n;
  if (!n) return a;

  // Si 'nombre' ya termina exactamente con 'apellidos', eliminar el sufijo duplicado
  if (n.toLowerCase().endsWith(a.toLowerCase())) {
    n = n.slice(0, n.length - a.length).trim();
  }

  // Eliminar repetición interna en 'nombre' si ya contenía los apellidos
  const aWords = a.split(/\s+/).filter(Boolean);
  if (aWords.length > 0) {
    const lastWord = aWords[aWords.length - 1].toLowerCase();
    const nWords = n.split(/\s+/).filter(Boolean);
    if (nWords.length > 1 && nWords[nWords.length - 1].toLowerCase() === lastWord) {
      // Remover palabras duplicadas del final de nombre
      let matchCount = 0;
      for (let i = 0; i < aWords.length; i++) {
        if (nWords[nWords.length - 1 - i]?.toLowerCase() === aWords[aWords.length - 1 - i]?.toLowerCase()) {
          matchCount++;
        } else {
          break;
        }
      }
      if (matchCount > 0) {
        n = nWords.slice(0, nWords.length - matchCount).join(" ");
      }
    }
  }

  return n ? `${n} ${a}`.trim() : a;
}

/**
 * Desglosa un nombre completo si solo se dispone de un único campo
 */
export function splitNombreCompleto(fullName = "") {
  const parts = String(fullName || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { nombre: "", apellidos: "" };
  if (parts.length === 1) return { nombre: parts[0], apellidos: "" };
  if (parts.length === 2) return { nombre: parts[0], apellidos: parts[1] };
  if (parts.length === 3) return { nombre: parts[0], apellidos: `${parts[1]} ${parts[2]}` };
  return { nombre: `${parts[0]} ${parts[1]}`, apellidos: parts.slice(2).join(" ") };
}
