/**
 * Chazin Food - Motor de Búsqueda Multicriterio Avanzado
 * Normalización de acentos, búsqueda multitoken por palabras clave,
 * e indexación profunda de campos anidados (productos, clientes, responsables,
 * métodos de pago, totales, fechas, horas y notas).
 */

/**
 * Normaliza un texto removiendo diacríticos/acentos, espacios extra y en minúsculas.
 * Ej: "Pérez" -> "perez", "Sándwich" -> "sandwich", "Canción" -> "cancion"
 */
export function normalizeSearchText(val) {
  if (val === null || val === undefined) return "";
  const str = typeof val === "string" ? val : String(val);
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export const SPANISH_DIGIT_WORDS = {
  0: "cero",
  1: "uno",
  2: "dos",
  3: "tres",
  4: "cuatro",
  5: "cinco",
  6: "seis",
  7: "siete",
  8: "ocho",
  9: "nueve",
  10: "diez",
  11: "once",
  12: "doce",
  13: "trece",
  14: "catorce",
  15: "quince",
  16: "dieciseis",
  17: "diecisiete",
  18: "dieciocho",
  19: "diecinueve",
  20: "veinte"
};

export const WORD_TO_DIGIT = {
  cero: "0",
  uno: "1",
  una: "1",
  un: "1",
  dos: "2",
  tres: "3",
  cuatro: "4",
  cinco: "5",
  seis: "6",
  seises: "6",
  siete: "7",
  ocho: "8",
  nueve: "9",
  diez: "10",
  once: "11",
  doce: "12",
  trece: "13",
  catorce: "14",
  quince: "15",
  dieciseis: "16",
  diecisiete: "17",
  dieciocho: "18",
  diecinueve: "19",
  veinte: "20"
};

/**
 * Divide la consulta del usuario en tokens (palabras clave individuales).
 * Ej: "Carlos Hamburguesa Mesa 2" -> ["carlos", "hamburguesa", "mesa", "2"]
 */
export function tokenizeSearchQuery(query = "") {
  const normalized = normalizeSearchText(query);
  if (!normalized) return [];
  return normalized
    .replace(/\bsin\s+descripci[oó]n\b/g, "sin_descripcion")
    .replace(/\bsin\s+categor[ií]a\b/g, "sin_categoria")
    .replace(/\bsin\s+proveedor\b/g, "sin_proveedor")
    .replace(/\bsin\s+tel[eé]fono\b/g, "sin_telefono")
    .replace(/\bsin\s+correo\b/g, "sin_correo")
    .replace(/\bsin\s+email\b/g, "sin_correo")
    .replace(/\bsin\s+stock\b/g, "sin_stock")
    .replace(/\bsin\s+lote[s]?\b/g, "sin_lote")
    .replace(/\bsin\s+usuario[s]?\b/g, "sin_usuarios")
    .replace(/\bsin\s+permiso[s]?\b/g, "sin_permisos")
    .replace(/\bsin\s+m[oó]dulo[s]?\b/g, "sin_modulos")
    .replace(/\bsin\s+contacto\b/g, "sin_contacto")
    .replace(/\bsin\s+direcci[oó]n\b/g, "sin_direccion")
    .replace(/\bsin\s+documento\b/g, "sin_documento")
    .replace(/\bsin\s+c[eé]dula\b/g, "sin_documento")
    .replace(/\bsin\s+registrar\b/g, "sin_registrar")
    .replace(/\bsin\s+ficha(\s+t[eé]cnica)?\b/g, "sin_ficha")
    .replace(/\bsin\s+receta\b/g, "sin_ficha")
    .replace(/\bsin\s+factura\b/g, "sin_factura")
    .replace(/\bsin\s+motivo\b/g, "sin_motivo")
    .replace(/\bsin\s+iva\b/g, "sin_iva")
    .replace(/\bcon\s+descripci[oó]n\b/g, "con_descripcion")
    .replace(/\bcon\s+categor[ií]a\b/g, "con_categoria")
    .replace(/\bcon\s+proveedor\b/g, "con_proveedor")
    .replace(/\bcon\s+tel[eé]fono\b/g, "con_telefono")
    .replace(/\bcon\s+correo\b/g, "con_correo")
    .replace(/\bcon\s+email\b/g, "con_correo")
    .replace(/\bcon\s+stock\b/g, "con_stock")
    .replace(/\bcon\s+lote[s]?\b/g, "con_lote")
    .replace(/\bcon\s+usuario[s]?\b/g, "con_usuarios")
    .replace(/\bcon\s+permiso[s]?\b/g, "con_permisos")
    .replace(/\bcon\s+m[oó]dulo[s]?\b/g, "con_modulos")
    .replace(/\bcon\s+ficha(\s+t[eé]cnica)?\b/g, "con_ficha")
    .replace(/\bcon\s+receta\b/g, "con_ficha")
    .replace(/\bcon\s+iva\b/g, "con_iva")
    .split(/\s+/)
    .filter(Boolean)
    .map((tok) => {
      // Normalizar variaciones o errores fonéticos/tipográficos comunes (ej: "vencito" -> "vencido")
      if (tok === "vencito" || tok === "vencitos") {
        return tok.replace(/cito/, "cido");
      }
      return tok;
    });
}

/**
 * Normaliza y expande cualquier representación de estado a tokens completos de búsqueda.
 * Soporta booleanos, números (1, 0), strings ('1', '0', 'ACTIVO', 'INACTIVO', 'Recibida', etc.).
 */
export function formatStatusTokens(estado) {
  if (estado === null || estado === undefined || estado === "") return "";
  
  const str = String(estado).trim();
  const lower = str.toLowerCase();

  // Activo / Inactivo
  if (
    estado === true ||
    estado === 1 ||
    str === "1" ||
    lower === "activo" ||
    lower === "activa" ||
    lower === "habilitado" ||
    lower === "habilitada" ||
    lower === "vigente"
  ) {
    return "Activo activo activa activos activas habilitado habilitada habilitados habilitadas vigente vigentes 1";
  }

  if (
    estado === false ||
    estado === 0 ||
    str === "0" ||
    lower === "inactivo" ||
    lower === "inactiva" ||
    lower === "deshabilitado" ||
    lower === "deshabilitada" ||
    lower === "inhabilitado" ||
    lower === "inhabilitada" ||
    lower === "suspendido" ||
    lower === "suspendida" ||
    lower === "no vigente"
  ) {
    return "Inactivo inactivo inactiva inactivos inactivas deshabilitado deshabilitada deshabilitados deshabilitadas suspendido suspendida no_vigente 0";
  }

  // Recibida / Completada / Confirmada
  if (lower.includes("recib") || lower.includes("comp") || lower.includes("confir")) {
    return `${str} recibida recibidas recibido recibidos completada completadas completado completados confirmada confirmadas confirmado confirmados`;
  }

  // Cancelada / Anulada
  if (lower.includes("canc") || lower.includes("anul")) {
    return `${str} cancelada canceladas cancelado cancelados anulada anuladas anulado anulados`;
  }

  // Pendiente / En cola / Espera
  if (lower.includes("pend") || lower.includes("cola") || lower.includes("espera")) {
    return `${str} pendiente pendientes en cola en espera`;
  }

  // Aprobada / aprobado (devoluciones)
  if (lower.includes("aprob")) {
    return `${str} aprobada aprobadas aprobado aprobados aprobacion`;
  }

  // Rechazada / rechazado (devoluciones)
  if (lower.includes("rechaz")) {
    return `${str} rechazada rechazadas rechazado rechazados rechazo`;
  }

  // En preparación / Preparando / Cocina
  if (lower.includes("prep") || lower.includes("cocin")) {
    return `${str} en preparacion preparando cocina cocinando`;
  }

  // Listo / Preparado
  if (lower.includes("list")) {
    return `${str} listo listos lista listas preparado preparada terminada terminado`;
  }

  // Entregado / Cerrada
  if (lower.includes("entreg") || lower.includes("cerr")) {
    return `${str} entregado entregados entregada entregadas cerrado cerrada`;
  }

  // Vencido / Caducado
  if (lower.includes("venc") || lower.includes("caduc") || lower.includes("expir")) {
    return `${str} vencido vencida vencidos vencidas caducado expirado`;
  }

  // Agotado / Sin stock
  if (lower.includes("agotad") || lower.includes("sin stock") || lower.includes("sin_stock")) {
    return `${str} agotado agotada agotados agotadas sin_stock`;
  }

  return str;
}

/**
 * Detecta si el texto de búsqueda contiene una intención explícita de estado
 * (ej: "inactivo", "activo", "vencido", "cancelada", etc.)
 */
export function hasStatusSearchIntent(query = "") {
  const norm = normalizeSearchText(query);
  if (!norm) return false;
  return (
    /\b(inactiv[oa]?s?|activ[oa]?s?|deshabilitad[oa]?s?|habilitad[oa]?s?|vencid[oa]?s?|vencit[oa]?s?|caducad[oa]?s?|expirad[oa]?s?|agotad[oa]?s?|cancelad[oa]?s?|anulad[oa]?s?|recibid[oa]?s?|completad[oa]?s?|pendient[es]?|preparand[oa]|cocina|list[oa]?s?|entregad[oa]?s?|aprobad[oa]?s?|rechazad[oa]?s?)\b/.test(norm)
  );
}

/**
 * Evalúa un token individual contra un corpus normalizado evitando falsos positivos
 * por prefijos negativos (ej: buscar "activo" NO coincide con "inactivo", "regular" NO con "irregular")
 * y soportando variaciones morfológicas (singular/plural) y numéricas.
 */
export function matchTokenInCorpus(corpus = "", token = "") {
  if (!token) return true;
  if (!corpus) return false;

  // Inactivo / inactivos / inactiva / inactivas / deshabilitado
  if (/^(inactiv[oa]?s?|deshabilitad[oa]?s?|inhabilitad[oa]?s?|suspendid[oa]?s?)$/.test(token)) {
    return (
      corpus.includes("inactiv") ||
      corpus.includes("deshabilitad") ||
      corpus.includes("inhabilitad") ||
      corpus.includes("suspendid")
    );
  }

  // Activo / activos / activa / activas (NO debe coincidir con "inactivo" ni "deshabilitado")
  if (/^activ[oa]?s?$/.test(token)) {
    return /(^|[^a-z0-9])activ/.test(corpus);
  }

  // Habilitado / habilitada
  if (/^habilitad[oa]?s?$/.test(token)) {
    return /(^|[^a-z0-9])habilitad/.test(corpus);
  }

  // Vigente / vigentes
  if (/^vigent[es]?$/.test(token)) {
    return /(^|[^a-z0-9])(vigente|vigentes)/.test(corpus) && !corpus.includes("no_vigente");
  }

  // Vencido / vencito / caducado / expirado (ESTRICTO: nunca debe coincidir con no vencido ni con agotado)
  if (/^(vencid[oa]?s?|vencit[oa]?s?|caducad[oa]?s?|expirad[oa]?s?)$/.test(token)) {
    const hasVencWord =
      /(^|[^a-z0-9])vencid/.test(corpus) ||
      /(^|[^a-z0-9])caducad/.test(corpus) ||
      /(^|[^a-z0-9])expirad/.test(corpus);
    const hasNegativePrefix = /(^|[^a-z0-9])(no|sin)\s+vencid/.test(corpus);
    return hasVencWord && !hasNegativePrefix;
  }

  // Agotado / agotada / agotados / agotadas / sin stock (ESTRICTO: no confundir con vencido)
  if (/^(agotad[oa]?s?|sin_stock)$/.test(token)) {
    return corpus.includes("agotad") || corpus.includes("sin_stock");
  }

  // Lote / lotes (NO debe coincidir con "sin_lote" ni "sinlote")
  if (/^lot[es]?$/.test(token)) {
    return (
      /(^|[^a-z0-9])lot[es]?(\s|#|\d|$)/.test(corpus) &&
      !/(^|[^a-z0-9])(sin|no)[_ ]?lot/.test(corpus)
    );
  }

  // Cancelado / anulado
  if (/^(cancelad[oa]?s?|anulad[oa]?s?)$/.test(token)) {
    return corpus.includes("cancelad") || corpus.includes("anulad");
  }

  // Recibido / completado / confirmado
  if (/^(recibid[oa]?s?|completad[oa]?s?|confirmad[oa]?s?)$/.test(token)) {
    return (
      corpus.includes("recibid") ||
      corpus.includes("completad") ||
      corpus.includes("confirmad")
    );
  }

  // Aprobado / aprobada (devoluciones)
  if (/^(aprobad[oa]?s?|aprobacion)$/.test(token)) {
    return corpus.includes("aprobad") || corpus.includes("aprobacion");
  }

  // Rechazado / rechazada (devoluciones)
  if (/^(rechazad[oa]?s?|rechazo)$/.test(token)) {
    return corpus.includes("rechazad") || corpus.includes("rechazo");
  }

  // Pendiente / en cola / espera
  if (/^(pendient[es]?|en cola|espera)$/.test(token)) {
    return (
      corpus.includes("pendient") ||
      corpus.includes("cola") ||
      corpus.includes("espera")
    );
  }

  // Preparando / preparacion / cocina
  if (/^(preparand[oa]|preparacion|cocina)$/.test(token)) {
    return corpus.includes("prepar") || corpus.includes("cocina");
  }

  // Listo / preparado / terminado
  if (/^(list[oa]?s?|terminad[oa]?s?)$/.test(token)) {
    return corpus.includes("list") || corpus.includes("terminad");
  }

  // Equivalencia bidireccional entre palabras numéricas en español y dígitos (ej: "nueve" <-> "9", "cinco" <-> "5")
  if (WORD_TO_DIGIT[token]) {
    const digit = WORD_TO_DIGIT[token];
    if (corpus.includes(token) || corpus.includes(digit)) {
      return true;
    }
  }
  if (SPANISH_DIGIT_WORDS[token]) {
    const word = SPANISH_DIGIT_WORDS[token];
    if (corpus.includes(token) || corpus.includes(word)) {
      return true;
    }
  }

  // Tokens compuestos negativos "sin ..."
  if (/^sin_(descripcion|categoria|proveedor|telefono|correo|lote|usuarios|permisos|modulos|iva|contacto|direccion|documento|registrar|ficha|factura|motivo)$/.test(token)) {
    return corpus.includes(token);
  }

  // Tokens compuestos positivos "con ..."
  if (/^con_(descripcion|categoria|proveedor|telefono|correo|lote|usuarios|permisos|modulos|iva|contacto|direccion|documento|ficha|factura)$/.test(token)) {
    return corpus.includes(token);
  }

  // Descripción / descripciones (NO debe coincidir si solo tiene "sin_descripcion" o "sin descripcion")
  if (/^descripci[oó]n(es)?$/.test(token)) {
    const hasDesc = /(^|[^a-z0-9])descripci/.test(corpus);
    const hasNegative = /(^|[^a-z0-9])(sin|no)[_ ]+descripci/.test(corpus);
    return hasDesc && !hasNegative;
  }

  // Proveedor / proveedores (NO debe coincidir si solo tiene "sin_proveedor")
  if (/^proveedor(es)?$/.test(token)) {
    const hasProv = /(^|[^a-z0-9])proveedor/.test(corpus);
    const hasNegative = /(^|[^a-z0-9])(sin|no)[_ ]+proveedor/.test(corpus);
    return hasProv && !hasNegative;
  }

  // Categoría / categorías (NO debe coincidir si solo tiene "sin_categoria")
  if (/^categor[ií]a(s)?$/.test(token)) {
    const hasCat = /(^|[^a-z0-9])categoria/.test(corpus);
    const hasNegative = /(^|[^a-z0-9])(sin|no)[_ ]+categoria/.test(corpus);
    return hasCat && !hasNegative;
  }

  // Teléfono / teléfonos (NO debe coincidir si solo tiene "sin_telefono")
  if (/^tel[eé]fono(s)?$/.test(token)) {
    const hasTel = /(^|[^a-z0-9])telefono/.test(corpus);
    const hasNegative = /(^|[^a-z0-9])(sin|no)[_ ]+telefono/.test(corpus);
    return hasTel && !hasNegative;
  }

  // Correo / email (NO debe coincidir si solo tiene "sin_correo")
  if (/^(correo|email)(s)?$/.test(token)) {
    const hasEmail = /(^|[^a-z0-9])(correo|email)/.test(corpus);
    const hasNegative = /(^|[^a-z0-9])(sin|no)[_ ]+(correo|email)/.test(corpus);
    return hasEmail && !hasNegative;
  }

  // Contacto / contactos (NO debe coincidir si solo tiene "sin_contacto")
  if (/^contacto(s)?$/.test(token)) {
    const hasContacto = /(^|[^a-z0-9])contacto/.test(corpus);
    const hasNegative = /(^|[^a-z0-9])(sin|no)[_ ]+contacto/.test(corpus);
    return hasContacto && !hasNegative;
  }

  // Dirección / direcciones (NO debe coincidir si solo tiene "sin_direccion")
  if (/^direcci[oó]n(es)?$/.test(token)) {
    const hasDir = /(^|[^a-z0-9])direccion/.test(corpus);
    const hasNegative = /(^|[^a-z0-9])(sin|no)[_ ]+direccion/.test(corpus);
    return hasDir && !hasNegative;
  }

  // Documento / documentos (NO debe coincidir si solo tiene "sin_documento")
  if (/^documento(s)?$/.test(token)) {
    const hasDoc = /(^|[^a-z0-9])documento/.test(corpus);
    const hasNegative = /(^|[^a-z0-9])(sin|no)[_ ]+documento/.test(corpus);
    return hasDoc && !hasNegative;
  }

  // Ficha / fichas (NO debe coincidir si solo tiene "sin_ficha")
  if (/^ficha(s)?$/.test(token)) {
    const hasFicha = /(^|[^a-z0-9])ficha/.test(corpus);
    const hasNegative = /(^|[^a-z0-9])(sin|no)[_ ]+ficha/.test(corpus);
    return hasFicha && !hasNegative;
  }

  // Factura / facturas (NO debe coincidir si solo tiene "sin_factura")
  if (/^factura(s)?$/.test(token)) {
    const hasFact = /(^|[^a-z0-9])factura/.test(corpus);
    const hasNegative = /(^|[^a-z0-9])(sin|no)[_ ]+factura/.test(corpus);
    return hasFact && !hasNegative;
  }

  // Coincidencia directa exacta de substring
  if (corpus.includes(token)) return true;

  // Si el token tiene símbolo de moneda ($1.300.000, $5000), verificar coincidencia sin el símbolo
  const tokenNoCurrency = token.replace(/^[$€£]/, "").trim();
  if (tokenNoCurrency && tokenNoCurrency !== token && corpus.includes(tokenNoCurrency)) {
    return true;
  }

  // Variación plural en español (ej: "hamburguesas" coincide con "hamburguesa", "proveedores" con "proveedor")
  if (token.endsWith("es") && token.length > 3) {
    const singular = token.slice(0, -2);
    if (corpus.includes(singular)) return true;
  }
  if (token.endsWith("s") && token.length > 2) {
    const singular = token.slice(0, -1);
    if (corpus.includes(singular)) return true;
  }

  // Coincidencia numérica con o sin símbolo de moneda ($) y separadores de miles/decimales (ej: "1.300.000", "$1.300.000", "5.000" -> "5000")
  const numericToken = tokenNoCurrency || token;
  if (/^\d[\d.,]*\d$/.test(numericToken) && /[.,]/.test(numericToken)) {
    const cleanDigits = numericToken.replace(/[.,]/g, "");
    const corpusWithoutDots = corpus.replace(/(?<=\d)[.,](?=\d)/g, "");
    if (cleanDigits && (corpusWithoutDots.includes(cleanDigits) || corpus.includes(cleanDigits))) {
      return true;
    }
  }

  return false;
}

/**
 * Buscador inteligente reutilizable para cualquier módulo (Usuarios, Roles, Insumos, Categorías, Proveedores, Productos, etc.)
 * @param {Array<any>} fields Lista de valores indexables del registro
 * @param {string} query Texto de búsqueda ingresado por el usuario
 */
export function matchesSmartSearch(fields = [], query = "") {
  const tokens = tokenizeSearchQuery(query);
  if (tokens.length === 0) return true;

  const expandedParts = [];

  const extractValues = (item) => {
    if (item === null || item === undefined || item === "") return;
    if (Array.isArray(item)) {
      item.forEach(extractValues);
      return;
    }
    if (typeof item === "object") {
      Object.values(item).forEach(extractValues);
      return;
    }

    const str = String(item).trim();
    if (!str) return;

    expandedParts.push(str);

    // Si es un número (stock, precio, cantidad, id, módulos) o string numérico, indexar como entero, palabra en español y con formato
    const numParsed = typeof item === "number" ? item : (!isNaN(Number(str)) && str !== "" ? Number(str) : null);
    if (numParsed !== null && !isNaN(numParsed)) {
      const intVal = Math.round(numParsed);
      expandedParts.push(String(intVal));
      if (SPANISH_DIGIT_WORDS[intVal]) {
        expandedParts.push(SPANISH_DIGIT_WORDS[intVal]);
      }
      if (numParsed >= 1000) {
        expandedParts.push(intVal.toLocaleString("es-CO"));
        expandedParts.push(`$ ${intVal.toLocaleString("es-CO")}`);
        expandedParts.push(`$${intVal.toLocaleString("es-CO")}`);
      }
    }

    // Si es un string con un número entero del 0 al 20, indexar también su palabra en español
    if (typeof item === "string" && /\d/.test(str)) {
      const matchNum = str.match(/\b([0-9]|1[0-9]|20)\b/);
      if (matchNum) {
        const n = Number(matchNum[1]);
        if (SPANISH_DIGIT_WORDS[n]) {
          expandedParts.push(SPANISH_DIGIT_WORDS[n]);
        }
      }
    }

    // Indexar también dígitos limpios cuando hay separadores (documentos, teléfonos, precios, códigos)
    if (/\d/.test(str) && /[.\-\s$,#]/.test(str)) {
      const digits = str.replace(/\D/g, "");
      if (digits.length >= 1) expandedParts.push(digits);
    }
  };

  fields.forEach(extractValues);

  const corpus = normalizeSearchText(expandedParts.join(" "));
  return tokens.every((token) => matchTokenInCorpus(corpus, token));
}

/**
 * Calcula un puntaje de relevancia para ordenar los resultados de búsqueda.
 * Permite que coincidencias exactas, prefijos, atributos clave (ej: "adición", "lote vencido")
 * aparezcan de primero en los resultados.
 */
export function scoreSearchRelevance(item, query, customScorer) {
  if (!query || !query.trim() || !item) return 0;
  const normalizedQuery = normalizeSearchText(query);
  const tokens = tokenizeSearchQuery(query);
  if (tokens.length === 0) return 0;

  let score = 0;

  if (typeof customScorer === "function") {
    score += Number(customScorer(item, normalizedQuery, tokens) || 0);
  }

  // Nombre / Identificador principal
  const nombre = normalizeSearchText(item.nombre || item.name || item.razonSocial || item.nombreCompleto || item.factura || item.numeroFactura || "");
  if (nombre) {
    if (nombre === normalizedQuery) {
      score += 1500;
    } else if (nombre.startsWith(normalizedQuery)) {
      score += 800;
    } else {
      const words = nombre.split(/\s+/);
      if (words.includes(normalizedQuery)) {
        score += 500;
      } else if (nombre.includes(normalizedQuery)) {
        score += 300;
      }
    }

    tokens.forEach((tok) => {
      if (nombre.startsWith(tok)) score += 200;
      else if (nombre.includes(tok)) score += 100;
    });
  }

  // ID exacto
  const idStr = String(item.id || item.idInsumo || item.idCompra || item.idProveedor || item.idCategoria || item.idCategoriaInsumo || item.idProducto || "");
  if (idStr && (idStr === normalizedQuery || `#${idStr}` === normalizedQuery)) {
    score += 1200;
  }

  return score;
}

/**
 * Ordena un conjunto de registros filtrados por su puntuación de relevancia
 * de modo que los resultados más afines a la búsqueda aparezcan en los primeros lugares.
 */
export function rankSearchResults(items = [], query = "", customScorer) {
  if (!query || !query.trim() || !Array.isArray(items) || items.length === 0) {
    return items;
  }

  const scored = items.map((item, originalIndex) => ({
    item,
    originalIndex,
    score: scoreSearchRelevance(item, query, customScorer)
  }));

  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.originalIndex - b.originalIndex;
  });

  return scored.map((s) => s.item);
}

/**
 * Meses en español para búsqueda por nombre de mes
 */
const MESES_ES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
];

const DIAS_ES = [
  "domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"
];

/**
 * Construye un corpus textual exhaustivo de un registro de Venta / Pedido.
 * Incluye todos los datos específicos del registro para permitir búsqueda profunda.
 */
export function buildVentaSearchCorpus(v = {}) {
  const parts = [];

  // 1. Identificadores
  const idStr = String(v.id || v.idVenta || "");
  if (idStr) {
    parts.push(idStr, `#${idStr}`);
    parts.push(`ped-${idStr.padStart(3, "0")}`, `ven-${idStr.padStart(4, "0")}`);
  }
  if (v.numeroVenta) parts.push(v.numeroVenta);
  if (v.codigoPedido) parts.push(v.codigoPedido);
  if (v.idTrans) parts.push(v.idTrans);

  // 2. Cliente
  const rawClient = typeof v.cliente === "string" ? v.cliente : (v.clienteNombre || v.cliente?.nombre || "");
  const clientApellidos = typeof v.cliente === "object" ? (v.cliente?.apellidos || "") : "";
  const clientFullName = `${rawClient} ${clientApellidos}`.trim();
  if (clientFullName) parts.push(clientFullName);
  if (rawClient) parts.push(rawClient);
  if (clientApellidos) parts.push(clientApellidos);

  // Teléfono del cliente
  const rawTel = String(v.clienteTelefono || v.telefono || v.cliente?.telefono || "");
  if (rawTel) {
    parts.push(rawTel);
    const cleanTel = rawTel.replace(/\D/g, "");
    if (cleanTel) parts.push(cleanTel);
  }

  // Documento del cliente
  const rawDoc = String(v.clienteDocumento || v.documento || v.cliente?.documento || "");
  if (rawDoc) {
    parts.push(rawDoc);
    const cleanDoc = rawDoc.replace(/\D/g, "");
    if (cleanDoc) parts.push(cleanDoc);
  }

  // Email del cliente
  const clientEmail = v.clienteEmail || v.email || v.cliente?.email || v.cliente?.usuario?.email || "";
  if (clientEmail) parts.push(clientEmail);

  // Fidelidad del cliente
  const fidelidadTipo = v.clienteFidelidad?.tipo || v.cliente?.tipo || (v.esVip ? "VIP" : "");
  if (fidelidadTipo) {
    parts.push(fidelidadTipo);
  }

  // Dirección y ubicación
  let obsMeta = {};
  if (typeof v.observaciones === "string" && v.observaciones.trim().startsWith("{")) {
    try { obsMeta = JSON.parse(v.observaciones); } catch (e) { }
  } else if (typeof v.observaciones === "object" && v.observaciones) {
    obsMeta = v.observaciones;
  }
  const direccion = String(v.direccion || v.direccionEntrega || obsMeta.direccion || v.cliente?.direccion || "");
  if (direccion) parts.push(direccion);

  // 3. PRODUCTOS, VARIANTES, ADICIONES Y OBSERVACIONES DE PRODUCTO
  const productosList = Array.isArray(v.productos) && v.productos.length > 0
    ? v.productos
    : (Array.isArray(v.detalles) && v.detalles.length > 0 ? v.detalles : []);

  productosList.forEach((p) => {
    const pName = p.nombre || p.nombreProducto || p.variante?.producto?.nombre || p.variante?.nombre || "";
    if (pName) {
      parts.push(pName);
      if (p.cantidad) {
        parts.push(`${p.cantidad}x ${pName}`, `${p.cantidad} ${pName}`);
      }
    }
    if (p.variante?.nombre) parts.push(p.variante.nombre);
    if (p.observaciones) parts.push(p.observaciones);
    if (p.nota) parts.push(p.nota);

    // Adiciones / Extras
    if (Array.isArray(p.adiciones)) {
      p.adiciones.forEach((a) => {
        const aName = typeof a === "object" ? (a.nombre || a.adicion?.nombre) : String(a);
        if (aName) parts.push(aName);
      });
    }
  });

  // 4. Responsable / Vendedor / Mesero
  if (v.responsable) {
    if (v.responsable.nombre) parts.push(v.responsable.nombre);
    if (v.responsable.rol) parts.push(v.responsable.rol);
    if (v.responsable.email) parts.push(v.responsable.email);
  }
  if (v.usuario) {
    const uNombre = `${v.usuario.nombre || ""} ${v.usuario.apellidos || ""}`.trim();
    if (uNombre) parts.push(uNombre);
    if (v.usuario.rolInfo?.nombre) parts.push(v.usuario.rolInfo.nombre);
  }

  // 5. Mesa / Ubicación en salón
  const mesaVal = v.mesa || obsMeta.mesa || obsMeta.numeroMesa;
  if (mesaVal) {
    parts.push(`mesa ${mesaVal}`, `mesa #${mesaVal}`, String(mesaVal));
  } else if (String(v.tipoEntrega || "").toLowerCase().includes("mesa")) {
    parts.push("en mesa", "mesa");
  }

  // 6. Canal y Tipo de Entrega
  const tipoEntrega = String(v.tipoEntrega || obsMeta.tipoEntrega || "");
  if (tipoEntrega) parts.push(tipoEntrega);
  const origen = String(v.origen || v.origenNombre || (tipoEntrega.toLowerCase().includes("domicilio") ? "ONLINE" : "PUNTO_FISICO"));
  parts.push(origen);
  if (origen.toUpperCase().includes("ONLINE")) {
    parts.push("venta online", "online", "web", "domicilio");
  }
  if (origen.toUpperCase().includes("PUNTO") || origen.toUpperCase().includes("FISICO")) {
    parts.push("punto fisico", "local", "mostrador", "en local");
  }
  if (tipoEntrega.toLowerCase().includes("recoger") || tipoEntrega.toLowerCase().includes("llevar")) {
    parts.push("para llevar", "llevar", "recoger");
  }

  // 7. Método de Pago y Estado de Pago
  const metodoPago = String(v.metodoPago || v.metodo_pago || v.medioPago || obsMeta.metodoPago || "");
  if (metodoPago) {
    parts.push(metodoPago);
    const mLower = metodoPago.toLowerCase();
    if (mLower.includes("transf") || mLower.includes("nequi") || mLower.includes("davi")) {
      parts.push("transferencia", "nequi", "daviplata", "bancolombia");
    }
    if (mLower.includes("tarjeta")) {
      parts.push("tarjeta", "debito", "credito", "pos");
    }
    if (mLower.includes("efectivo")) {
      parts.push("efectivo", "cash");
    }
  }
  if (v.estadoPago) parts.push(v.estadoPago);

  // 8. Estado del Pedido / Venta
  const estadoStr = String(v.estado || "");
  const estadoEntregaStr = String(v.estadoEntrega || "");
  if (v.estado !== undefined && v.estado !== null) {
    parts.push(formatStatusTokens(v.estado));
  }
  if (v.estadoEntrega) {
    parts.push(formatStatusTokens(v.estadoEntrega));
  }

  const eLower = `${estadoStr} ${estadoEntregaStr}`.toLowerCase();
  if (eLower.includes("pend")) parts.push("pendiente", "en espera");
  if (eLower.includes("prepar")) parts.push("preparando", "en preparacion", "cocina");
  if (eLower.includes("list")) parts.push("listo", "preparado");
  if (eLower.includes("entreg") || eLower.includes("complet")) parts.push("entregado", "completada", "cerrada");
  if (eLower.includes("cancel") || eLower.includes("anul")) parts.push("cancelado", "cancelada", "anulada", "anulado");

  // 9. Fechas, Horas y Períodos
  const rawFecha = v.fecha || v.fechaVenta;
  if (rawFecha) {
    try {
      const d = new Date(rawFecha);
      if (!isNaN(d.getTime())) {
        const isoDate = d.toISOString().split("T")[0]; // "2026-08-06"
        parts.push(isoDate);

        const year = d.getFullYear();
        const monthNum = d.getMonth();
        const dayNum = d.getDate();
        const dayOfWeek = d.getDay();

        parts.push(String(year));
        parts.push(MESES_ES[monthNum] || "");
        parts.push(DIAS_ES[dayOfWeek] || "");
        parts.push(`${dayNum}/${monthNum + 1}/${year}`);
        parts.push(`${String(dayNum).padStart(2, "0")}/${String(monthNum + 1).padStart(2, "0")}/${year}`);
        parts.push(`${dayNum} de ${MESES_ES[monthNum]}`);

        // Hora
        const hours24 = d.getHours();
        const minutes = d.getMinutes();
        const minStr = String(minutes).padStart(2, "0");
        const hours12 = hours24 % 12 || 12;
        const isPm = hours24 >= 12;
        const ampm = isPm ? "pm" : "am";

        parts.push(`${hours12}:${minStr}`, `${hours12}:${minStr} ${ampm}`, `${hours12}:${minStr}${ampm}`);
        parts.push(`${String(hours24).padStart(2, "0")}:${minStr}`);
        parts.push(`:${minStr}`, `${minStr} min`, `${minStr} minutos`);
        parts.push(ampm, isPm ? "tarde" : "manana");
        if (hours24 >= 18) parts.push("noche");
      }
    } catch (e) { }
  }
  if (v.horario) parts.push(String(v.horario));
  if (v.fechaFormatted) parts.push(String(v.fechaFormatted));
  if (v.tiempoEstimadoEntrega) parts.push(String(v.tiempoEstimadoEntrega));

  // 10. Valores Financieros y Descuentos
  const totalNum = Number(v.total || v.subtotal || 0);
  parts.push(String(totalNum));
  parts.push(`$${totalNum.toLocaleString("es-CO")}`);
  parts.push(totalNum.toLocaleString("es-CO"));
  parts.push(`${totalNum} cop`, `$${totalNum}`);

  if (v.subtotal) {
    const subNum = Number(v.subtotal);
    parts.push(String(subNum), `$${subNum.toLocaleString("es-CO")}`);
  }

  const descPct = Number(v.descuentoPorcentaje || 0);
  if (descPct > 0) {
    parts.push(`${descPct}%`, `${descPct} %`, `${descPct} porciento`, "descuento", "con descuento");
  }

  // 11. Observaciones generales
  if (typeof v.observaciones === "string") parts.push(v.observaciones);
  if (obsMeta.nota) parts.push(obsMeta.nota);

  // Retornar cadena normalizada única
  return normalizeSearchText(parts.join(" "));
}

/**
 * Construye un corpus textual exhaustivo de un registro de Cliente.
 */
export function buildClienteSearchCorpus(c = {}) {
  const parts = [];

  // ID
  const idStr = String(c.id || c.idCliente || "");
  if (idStr) parts.push(idStr, `#${idStr}`);

  // Nombre y apellidos
  const nombre = c.nombre || "";
  const apellidos = c.apellidos || "";
  const nombreCompleto = `${nombre} ${apellidos}`.trim();
  if (nombreCompleto) parts.push(nombreCompleto);
  if (nombre) parts.push(nombre);
  if (apellidos) parts.push(apellidos);

  // Email
  if (c.email) {
    parts.push(c.email);
  } else {
    parts.push("sin_correo sin correo sin_email sin email");
  }

  // Teléfono
  const rawTel = String(c.telefono || "");
  if (rawTel && rawTel !== "-") {
    parts.push(rawTel);
    const cleanTel = rawTel.replace(/\D/g, "");
    if (cleanTel) parts.push(cleanTel);
  } else {
    parts.push("sin_telefono sin telefono");
  }

  // Documento
  const rawDoc = String(c.documento || "");
  if (rawDoc) {
    parts.push(rawDoc);
    const cleanDoc = rawDoc.replace(/\D/g, "");
    if (cleanDoc) parts.push(cleanDoc);
  } else {
    parts.push("sin_documento sin documento sin_cedula sin cedula sin_registrar sin registrar");
  }

  // Dirección
  if (c.direccion && c.direccion !== "-") {
    parts.push(c.direccion);
  } else {
    parts.push("sin_direccion sin direccion");
  }

  // Fidelidad
  const clientTipo = c.tipo || (c.esVip ? "VIP" : "Nuevo");
  if (clientTipo) {
    parts.push(clientTipo);
  }

  // Estado
  parts.push(formatStatusTokens(c.estado !== undefined ? c.estado : (c.activo === false ? "Inactivo" : "Activo")));

  // Compras
  const comprasCount = Number(c.compras ?? 0);
  parts.push(String(comprasCount), `${comprasCount} compras`, `${comprasCount} compra`);

  // Total consumido
  const rawTotalStr = String(c.totalConsumido || c.totalGastado || "");
  if (rawTotalStr) parts.push(rawTotalStr);
  const totalNum = Number(c.totalConsumidoRaw || c.totalGastadoRaw) || Number(rawTotalStr.replace(/[^\d]/g, "")) || 0;
  if (totalNum > 0) {
    parts.push(String(totalNum), `$${totalNum.toLocaleString("es-CO")}`, totalNum.toLocaleString("es-CO"));
  }

  // Transacciones / Productos comprados previamente en historial
  if (Array.isArray(c.transacciones)) {
    c.transacciones.forEach((t) => {
      if (t.idTrans) parts.push(t.idTrans);
      if (t.producto) parts.push(t.producto);
      if (t.fecha) parts.push(t.fecha);
      if (t.total) parts.push(t.total);
    });
  }

  return normalizeSearchText(parts.join(" "));
}

/**
 * Evalúa si un registro de Venta cumple con los criterios multicriterio.
 */
export function matchVentaMultiCriteria(venta, criteria = {}) {
  const {
    searchTerm = "",
    filterEstado = "Todos",
    filterFecha = "",
    filterFechaInicio = "",
    filterFechaFin = "",
    filterMetodoPago = "Todos",
    filterOrigen = "Todos",
    filterTipoEntrega = "Todos",
    filterFidelidad = "Todos",
    montoMin = "",
    montoMax = ""
  } = criteria;

  // 1. Búsqueda por texto (Tokens múltiples)
  const tokens = tokenizeSearchQuery(searchTerm);
  if (tokens.length > 0) {
    const corpus = buildVentaSearchCorpus(venta);
    // Cada token debe coincidir respetando límites semánticos
    const allTokensMatch = tokens.every((token) => matchTokenInCorpus(corpus, token));
    if (!allTokensMatch) return false;
  }

  // 2. Filtro por Estado (con anulación inteligente si la búsqueda especifica un estado)
  if (filterEstado && filterEstado !== "Todos") {
    const hasStatusIntent = hasStatusSearchIntent(searchTerm);
    if (!hasStatusIntent) {
      const estadoStr = String(venta.estado || "").toLowerCase();
      const estadoEntrega = String(venta.estadoEntrega || "").toLowerCase();
      const target = filterEstado.toLowerCase();

      if (target === "pendiente") {
        if (!estadoStr.includes("pend") && !estadoEntrega.includes("pend")) return false;
      } else if (target === "en preparación" || target === "preparando" || target === "en preparacion") {
        if (!estadoStr.includes("prepar") && !estadoEntrega.includes("prepar")) return false;
      } else if (target === "listo") {
        if (!estadoStr.includes("list") && !estadoEntrega.includes("list")) return false;
      } else if (target === "completada" || target === "entregado") {
        if (!estadoStr.includes("complet") && !estadoStr.includes("entreg") && !estadoEntrega.includes("entreg") && !estadoEntrega.includes("list")) return false;
      } else if (target === "anulada" || target === "cancelada" || target === "cancelado") {
        if (!estadoStr.includes("anul") && !estadoStr.includes("cancel") && !estadoEntrega.includes("cancel")) return false;
      } else {
        if (!estadoStr.includes(target) && !estadoEntrega.includes(target)) return false;
      }
    }
  }

  // 3. Filtro por Fecha específica
  if (filterFecha) {
    const rawF = venta.fecha || venta.fechaVenta;
    if (!rawF) return false;
    try {
      const d = new Date(rawF);
      const vDateStr = isNaN(d.getTime()) ? String(rawF).slice(0, 10) : d.toISOString().split("T")[0];
      if (vDateStr !== filterFecha) return false;
    } catch {
      return false;
    }
  }

  // 4. Filtro por Rango de Fechas (Desde - Hasta)
  if (filterFechaInicio || filterFechaFin) {
    const rawF = venta.fecha || venta.fechaVenta;
    if (!rawF) return false;
    try {
      const d = new Date(rawF);
      if (isNaN(d.getTime())) return false;
      const vTime = d.getTime();

      if (filterFechaInicio) {
        const startD = new Date(filterFechaInicio);
        startD.setHours(0, 0, 0, 0);
        if (vTime < startD.getTime()) return false;
      }
      if (filterFechaFin) {
        const endD = new Date(filterFechaFin);
        endD.setHours(23, 59, 59, 999);
        if (vTime > endD.getTime()) return false;
      }
    } catch {
      return false;
    }
  }

  // 5. Filtro por Método de Pago
  if (filterMetodoPago && filterMetodoPago !== "Todos") {
    const vMetodo = String(venta.metodoPago || venta.metodo_pago || venta.medioPago || "").toLowerCase();
    const targetMetodo = filterMetodoPago.toLowerCase();
    if (!vMetodo.includes(targetMetodo)) return false;
  }

  // 6. Filtro por Origen / Canal
  if (filterOrigen && filterOrigen !== "Todos") {
    const vOrigen = String(
      venta.origen || (String(venta.tipoEntrega || "").toLowerCase().includes("domicilio") ? "ONLINE" : "PUNTO_FISICO")
    ).toUpperCase();

    if (filterOrigen === "ONLINE" && !vOrigen.includes("ONLINE")) return false;
    if (filterOrigen === "PUNTO_FISICO" && !vOrigen.includes("PUNTO") && !vOrigen.includes("FISICO")) return false;
  }

  // 7. Filtro por Tipo de Entrega
  if (filterTipoEntrega && filterTipoEntrega !== "Todos") {
    const vTipo = String(venta.tipoEntrega || "").toLowerCase();
    const targetTipo = filterTipoEntrega.toLowerCase();
    if (!vTipo.includes(targetTipo)) return false;
  }

  // 8. Filtro por Nivel de Fidelidad
  if (filterFidelidad && filterFidelidad !== "Todos") {
    const vFid = String(venta.clienteFidelidad?.tipo || venta.cliente?.tipo || (venta.esVip ? "VIP" : "")).toLowerCase();
    const targetFid = filterFidelidad.toLowerCase();
    if (!vFid.includes(targetFid)) return false;
  }

  // 9. Filtro por Monto Mínimo y Máximo
  const totalNum = Number(venta.total || venta.subtotal || 0);
  if (montoMin !== "" && !isNaN(Number(montoMin))) {
    if (totalNum < Number(montoMin)) return false;
  }
  if (montoMax !== "" && !isNaN(Number(montoMax))) {
    if (totalNum > Number(montoMax)) return false;
  }

  return true;
}

/**
 * Evalúa si un registro de Cliente cumple con los criterios multicriterio.
 */
export function matchClienteMultiCriteria(cliente, criteria = {}) {
  const {
    searchTerm = "",
    filterTipo = "Todos",
    filterEstado = "Todos",
    comprasMin = "",
    montoMin = "",
    montoMax = ""
  } = criteria;

  // 1. Tokens de búsqueda múltiple
  const tokens = tokenizeSearchQuery(searchTerm);
  if (tokens.length > 0) {
    const corpus = buildClienteSearchCorpus(cliente);
    const allTokensMatch = tokens.every((token) => matchTokenInCorpus(corpus, token));
    if (!allTokensMatch) return false;
  }

  // 2. Filtro por Tipo / Fidelidad
  const clientTipo = cliente.tipo || (cliente.esVip ? "VIP" : "Nuevo");
  if (filterTipo && filterTipo !== "Todos") {
    if (clientTipo.toLowerCase() !== filterTipo.toLowerCase()) return false;
  }

  // 3. Filtro por Estado (Activo / Inactivo con anulación inteligente por búsqueda)
  if (filterEstado && filterEstado !== "Todos") {
    const hasStatusIntent = hasStatusSearchIntent(searchTerm);
    if (!hasStatusIntent) {
      const isActivo =
        cliente.estado === "Activo" ||
        cliente.estado === 1 ||
        cliente.estado === "1" ||
        cliente.activo === true ||
        (cliente.activo === undefined &&
          cliente.estado !== "Inactivo" &&
          cliente.estado !== 0 &&
          cliente.estado !== "0");

      if (filterEstado.toLowerCase() === "activo" && !isActivo) return false;
      if (filterEstado.toLowerCase() === "inactivo" && isActivo) return false;
    }
  }

  // 4. Filtro por Compras Mínimas
  if (comprasMin !== "" && !isNaN(Number(comprasMin))) {
    const cCount = Number(cliente.compras ?? 0);
    if (cCount < Number(comprasMin)) return false;
  }

  // 5. Filtro por Total Consumido Mínimo / Máximo
  const rawTotalStr = String(cliente.totalConsumido || cliente.totalGastado || "");
  const totalNum = Number(cliente.totalConsumidoRaw || cliente.totalGastadoRaw) || Number(rawTotalStr.replace(/[^\d]/g, "")) || 0;

  if (montoMin !== "" && !isNaN(Number(montoMin))) {
    if (totalNum < Number(montoMin)) return false;
  }
  if (montoMax !== "" && !isNaN(Number(montoMax))) {
    if (totalNum > Number(montoMax)) return false;
  }

  return true;
}
