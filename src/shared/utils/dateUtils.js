/**
 * Utilidades Centralizadas de Fecha, Horas y Contadores de Tiempo
 * Garantiza formato de 12 Horas (AM/PM) y cálculo exacto de meses, días, horas, minutos y segundos.
 */

const MESES_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const MESES_CORTO_ES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
];

/**
 * Convierte cualquier hora o fecha a formato 12 Horas estándar (ej: "01:30 PM", "11:15 AM")
 * Admite cadenas como "14:30", "14:30:00", rangos como "13:05 – 13:22", o fechas completas ISO / Date.
 */
export function formatTime12h(timeOrDate, fallback = "12:00 PM") {
  if (!timeOrDate) return fallback;

  // Si es un objeto Date
  if (timeOrDate instanceof Date) {
    if (isNaN(timeOrDate.getTime())) return fallback;
    return timeOrDate.toLocaleTimeString("es-CO", {
      timeZone: "America/Bogota",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    }).toUpperCase();
  }

  const str = String(timeOrDate).trim();

  // Si es una cadena ISO o timestamp de fecha (ej: "2026-08-06T15:30:00Z" o "2026-08-06 15:30")
  if (str.includes("T") || (str.includes("-") && str.includes(":"))) {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString("es-CO", {
        timeZone: "America/Bogota",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      }).toUpperCase();
    }
  }

  // Si es un rango de horas (ej: "13:05 – 13:22" o "13:05 - 13:22")
  if (str.includes("–") || (str.includes("-") && !str.includes("T"))) {
    const parts = str.split(/[–-]/);
    if (parts.length === 2 && parts[0].includes(":") && parts[1].includes(":")) {
      return `${formatSingleTime12h(parts[0].trim())} – ${formatSingleTime12h(parts[1].trim())}`;
    }
  }

  return formatSingleTime12h(str, fallback);
}

/**
 * Formatea una hora individual (ej: "14:30" -> "02:30 PM")
 */
export function formatSingleTime12h(timeStr, fallback = "12:00 PM") {
  if (!timeStr) return fallback;
  const s = String(timeStr).trim();

  // Si ya tiene AM o PM (incluso formato a. m. / p. m.)
  if (/am|pm|a\.\s*m\.|p\.\s*m\./i.test(s)) {
    return s.replace(/a\.\s*m\./i, "AM").replace(/p\.\s*m\./i, "PM").toUpperCase();
  }

  // Regex para HH:mm o HH:mm:ss
  const match = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (match) {
    let h = parseInt(match[1], 10);
    const m = match[2];
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${String(h).padStart(2, "0")}:${m} ${ampm}`;
  }

  return s || fallback;
}

/**
 * Formatea una fecha segura (YYYY-MM-DD o formato local colombiano)
 */
export function formatDateSafe(dateVal, fallback = "Hoy") {
  if (!dateVal) return fallback;
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal).slice(0, 10) || fallback;
    return d.toLocaleDateString("es-CO", {
      timeZone: "America/Bogota",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });
  } catch (e) {
    return String(dateVal).slice(0, 10) || fallback;
  }
}

/**
 * Formatea una fecha extendida en español (ej: "25 de Octubre de 2026")
 */
export function formatDateLong(dateVal, fallback = "") {
  if (!dateVal) return fallback;
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return fallback;
    const dia = d.getDate();
    const mes = MESES_ES[d.getMonth()];
    const anio = d.getFullYear();
    return `${dia} de ${mes} de ${anio}`;
  } catch (e) {
    return fallback;
  }
}

/**
 * Formatea fecha y hora completa en 12 horas (ej: "25/10/2026 03:45 PM")
 */
export function formatDateTime12h(dateVal, fallback = "") {
  if (!dateVal) return fallback;
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return fallback;
    const fStr = d.toLocaleDateString("es-CO", {
      timeZone: "America/Bogota",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });
    const tStr = d.toLocaleTimeString("es-CO", {
      timeZone: "America/Bogota",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    }).toUpperCase();
    return `${fStr} ${tStr}`;
  } catch (e) {
    return fallback;
  }
}

/**
 * Cálculo exacto de cuenta regresiva en vivo hasta una fecha objetivo
 * Devuelve días, horas, minutos, segundos y bandera expirado
 */
export function calculateCountdown(targetDate, now = Date.now()) {
  if (!targetDate) {
    return { dias: 0, horas: 0, minutos: 0, segundos: 0, expirado: true, ms: 0 };
  }

  let targetTs = 0;
  if (targetDate instanceof Date) {
    targetTs = targetDate.getTime();
  } else if (typeof targetDate === "number") {
    targetTs = targetDate;
  } else {
    const str = String(targetDate).trim();
    // Si solo tiene fecha "YYYY-MM-DD", consideramos el final de ese día: 23:59:59
    const norm = str.includes("T") ? str : `${str}T23:59:59`;
    targetTs = new Date(norm).getTime();
  }

  if (isNaN(targetTs)) {
    return { dias: 0, horas: 0, minutos: 0, segundos: 0, expirado: true, ms: 0 };
  }

  const currentTs = typeof now === "number" ? now : new Date(now).getTime();
  const diff = targetTs - currentTs;

  if (diff <= 0) {
    return { dias: 0, horas: 0, minutos: 0, segundos: 0, expirado: true, ms: 0 };
  }

  const totalSec = Math.floor(diff / 1000);
  const dias = Math.floor(totalSec / 86400);
  const horas = Math.floor((totalSec % 86400) / 3600);
  const minutos = Math.floor((totalSec % 3600) / 60);
  const segundos = totalSec % 60;

  return {
    dias,
    horas,
    minutos,
    segundos,
    expirado: false,
    ms: diff
  };
}

/**
 * Formatea el tiempo transcurrido de forma humana (ej: "Hace un momento", "Hace 15 min", "Hace 2h")
 */
export function formatElapsed(dateVal, now = Date.now()) {
  if (!dateVal) return "Reciente";
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return "Reciente";

  const currentTs = typeof now === "number" ? now : new Date(now).getTime();
  const diffSec = Math.floor((currentTs - d.getTime()) / 1000);

  if (diffSec < 60) return "Hace un momento";
  const minutes = Math.floor(diffSec / 60);
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours}h ${minutes % 60 > 0 ? `${minutes % 60}m` : ""}`.trim();
  const days = Math.floor(hours / 24);
  if (days === 1) return "Ayer";
  if (days < 30) return `Hace ${days} días`;
  const months = Math.floor(days / 30);
  if (months < 12) return `Hace ${months} mes${months > 1 ? "es" : ""}`;
  const years = Math.floor(days / 365);
  return `Hace ${years} año${years > 1 ? "s" : ""}`;
}
