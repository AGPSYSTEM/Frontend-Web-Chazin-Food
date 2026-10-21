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
  "PPT": { min: 6, max: 20, label: "Permiso por Protección Temporal (PPT)", helper: "6 a 20 caracteres", numericOnly: false },
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
 * Valida nombre/apellido:
 * - No puede contener números ni el símbolo '@'
 * - Mínimo 2 caracteres
 */
export function validateNombre(val = "", campo = "nombre") {
  const str = String(val || "").trim();
  if (!str) return { isValid: false, error: `El ${campo} es obligatorio.` };
  if (str.includes("@")) return { isValid: false, error: `El ${campo} no puede contener el símbolo '@'.` };
  if (/\d/.test(str)) return { isValid: false, error: `El ${campo} no puede contener números.` };
  if (str.length < 2) return { isValid: false, error: `El ${campo} debe tener al menos 2 caracteres.` };
  return { isValid: true, error: "" };
}

/**
 * Valida correo electrónico en tiempo real:
 * - Debe incluir '@'
 * - Debe tener texto antes y después del '@'
 * - Debe tener un dominio válido con punto (ej: usuario@gmail.com)
 */
export function validateEmail(val = "") {
  const str = String(val || "").trim();
  if (!str) return { isValid: false, error: "El correo electrónico es obligatorio." };
  if (!str.includes("@")) return { isValid: false, error: "El correo debe incluir el símbolo '@'." };
  const parts = str.split("@");
  if (!parts[0]) return { isValid: false, error: "Falta el nombre de usuario antes del '@'." };
  if (!parts[1]) return { isValid: false, error: "Falta el dominio después del '@' (ejemplo: gmail.com)." };
  if (!parts[1].includes(".") || parts[1].endsWith(".")) return { isValid: false, error: "El dominio debe incluir una extensión válida (ejemplo: .com)." };
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(str)) return { isValid: false, error: "Formato de correo inválido (ej: usuario@gmail.com)." };
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

/**
 * Limpia y normaliza la dirección de un cliente, evitando que se muestren strings JSON o metadatos crudos
 */
export function formatDireccion(dir = "") {
  if (!dir) return "Medellín, Colombia";
  const str = String(dir).trim();
  if (str.startsWith("{")) {
    try {
      const parsed = JSON.parse(str);
      if (parsed && typeof parsed === "object") {
        return parsed.direccion || parsed.d || "Medellín, Colombia";
      }
    } catch {
      const match = str.match(/"direccion"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/i) || str.match(/"d"\s*:\s*"([^"]+)"/i);
      if (match && match[1]) {
        return match[1];
      }
    }
    return "Medellín, Colombia";
  }
  return str;
}

/**
 * Valida contraseñas:
 * - Requerida
 * - Longitud mínima (por defecto 6 o configurable)
 */
export function validateContrasena(val = "", minLength = 6, campo = "contraseña") {
  const str = String(val || "");
  if (!str) return { isValid: false, error: `La ${campo} es obligatoria.` };
  if (str.length < minLength) {
    return { isValid: false, error: `La ${campo} debe tener al menos ${minLength} caracteres.` };
  }
  return { isValid: true, error: "" };
}

/**
 * Valida confirmación de contraseña en vivo
 */
export function validateConfirmarContrasena(pass = "", confirmPass = "", campo = "contraseña") {
  const c = String(confirmPass || "");
  if (!c) return { isValid: false, error: `Debe confirmar la ${campo}.` };
  if (pass !== c) {
    return { isValid: false, error: "Las contraseñas no coinciden." };
  }
  return { isValid: true, error: "" };
}

/**
 * Valida si un valor es requerido (para selects, campos de texto genéricos, etc.)
 */
export function validateRequerido(val, campo = "Este campo") {
  if (val === null || val === undefined) {
    return { isValid: false, error: `${campo} es obligatorio.` };
  }
  const str = String(val).trim();
  if (!str) {
    return { isValid: false, error: `${campo} es obligatorio.` };
  }
  return { isValid: true, error: "" };
}

/**
 * Valida texto genérico con longitud mínima y máxima
 */
export function validateTexto(val = "", campo = "campo", options = {}) {
  const { min = 2, max = 255, required = true, permitirNumeros = true } = options;
  const str = String(val || "").trim();
  if (!str) {
    if (required) return { isValid: false, error: `El campo ${campo} es obligatorio.` };
    return { isValid: true, error: "" };
  }
  if (!permitirNumeros && /\d/.test(str)) {
    return { isValid: false, error: `El campo ${campo} no puede contener números.` };
  }
  if (str.length < min) {
    return { isValid: false, error: `El campo ${campo} debe tener al menos ${min} caracteres.` };
  }
  if (str.length > max) {
    return { isValid: false, error: `El campo ${campo} no puede superar ${max} caracteres.` };
  }
  return { isValid: true, error: "" };
}

/**
 * Valida números positivos / cantidades / stocks
 */
export function validateNumeroPositivo(val, campo = "valor", options = {}) {
  const { min = 0.01, max = Infinity, integer = false, allowZero = false } = options;
  if (val === null || val === undefined || String(val).trim() === "") {
    return { isValid: false, error: `El ${campo} es obligatorio.` };
  }
  const num = Number(val);
  if (isNaN(num)) {
    return { isValid: false, error: `El ${campo} debe ser un número válido.` };
  }
  if (allowZero && num === 0) {
    return { isValid: true, error: "" };
  }
  if (num < (allowZero ? 0 : min)) {
    return { isValid: false, error: `El ${campo} debe ser mayor a ${allowZero ? "o igual a 0" : (min > 0.01 ? min - 1 : 0)}.` };
  }
  if (num > max) {
    return { isValid: false, error: `El ${campo} no puede exceder ${max}.` };
  }
  if (integer && !Number.isInteger(num)) {
    return { isValid: false, error: `El ${campo} debe ser un número entero sin decimales.` };
  }
  return { isValid: true, error: "" };
}

/**
 * Valida precio o moneda
 */
export function validateMoneda(val, campo = "precio", options = {}) {
  const { allowZero = false, max = 100000000 } = options;
  return validateNumeroPositivo(val, campo, { min: allowZero ? 0 : 50, max, integer: false, allowZero });
}

/**
 * Valida porcentaje entre 0 y 100
 */
export function validatePorcentaje(val, campo = "porcentaje") {
  return validateNumeroPositivo(val, campo, { min: 0, max: 100, allowZero: true });
}


