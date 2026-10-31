import { useState } from "react";
import {
  History,
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Package,
  FileText,
  CheckCircle2,
  RotateCcw,
  Eye,
  Sparkles,
  Scale,
  ShieldAlert,
  Info,
  Flame,
  AlertCircle
} from "lucide-react";
import {
  formatFechaHoraFicha,
  formatPeriodoVigenciaFicha,
  extractFichaVersionMeta
} from "../utils/fichaVersionUtils";

export function FichaVersionesHistorial({
  versionActual = 1,
  fechaInicioVigencia = null,
  versionesAnteriores = [],
  selectedVersion = null,
  onSelectVersion = null,
  onRestoreVersion = null,
  datosEntidadActual = null,
  compact = false
}) {
  const formatMoneda = (val) => {
    const num = Number(val);
    if (!Number.isFinite(num)) return null;
    return `$${num.toLocaleString("es-CO")} COP`;
  };
  const [expandedVersions, setExpandedVersions] = useState({});
  const [sectionOpen, setSectionOpen] = useState(true);
  const [selectedTabVersion, setSelectedTabVersion] = useState(null);

  const toggleExpand = (versionNum) => {
    setExpandedVersions((prev) => ({
      ...prev,
      [versionNum]: !prev[versionNum]
    }));
  };

  const listaVersiones = Array.isArray(versionesAnteriores) ? versionesAnteriores : [];
  const defaultVerNum =
    listaVersiones.length > 0
      ? Number(listaVersiones[0].version || listaVersiones.length)
      : null;
  const activeVerNum =
    selectedTabVersion !== null &&
    listaVersiones.some(
      (v, idx) => Number(v.version || listaVersiones.length - idx) === Number(selectedTabVersion)
    )
      ? Number(selectedTabVersion)
      : defaultVerNum;
  const activeIdx = listaVersiones.findIndex(
    (v, idx) => Number(v.version || listaVersiones.length - idx) === Number(activeVerNum)
  );
  const versionesFiltradas =
    activeIdx >= 0 ? [listaVersiones[activeIdx]] : listaVersiones.slice(0, 1);
  const fechaInicioActualStr = formatFechaHoraFicha(fechaInicioVigencia, "Fecha inicial del registro");

  return (
    <div className="bg-slate-50/90 dark:bg-gray-800/50 rounded-2xl border border-slate-200/80 dark:border-gray-700/80 overflow-hidden transition-all">
      {/* Cabecera colapsable del Historial de Versionamiento */}
      <div
        onClick={() => setSectionOpen(!sectionOpen)}
        className="flex items-center justify-between gap-3 p-4 sm:px-5 bg-gradient-to-r from-slate-100/90 via-rose-50/40 to-white dark:from-gray-800 dark:via-rose-950/20 dark:to-gray-850 border-b border-slate-200/70 dark:border-gray-700/70 cursor-pointer select-none"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-[#F05454] flex items-center justify-center shrink-0 shadow-2xs">
            <History className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs sm:text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                Control de Versionamiento y Versiones Anteriores
              </h4>
              <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                Versión Actual: v{versionActual}
              </span>
              {listaVersiones.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60">
                  {listaVersiones.length} {listaVersiones.length === 1 ? "versión anterior" : "versiones anteriores"}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
              Trazabilidad histórica de fechas y horas de creación y finalización de uso de la ficha técnica
            </p>
          </div>
        </div>

        <button
          type="button"
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/60 dark:hover:bg-gray-700/50 transition"
        >
          {sectionOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {sectionOpen && (
        <div className="p-4 sm:p-5 space-y-4">
          {/* 1. Tarjeta de la Versión Actual (En uso) */}
          <div
            className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
              selectedVersion === null
                ? "bg-emerald-50/70 dark:bg-emerald-950/25 border-emerald-300 dark:border-emerald-800/80 shadow-2xs"
                : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-600 text-white">
                    <CheckCircle2 className="w-3 h-3" />
                    Versión {versionActual} (Vigente / En Uso)
                  </span>
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    Ficha Técnica Activa
                  </span>
                  {datosEntidadActual && (datosEntidadActual.precio !== undefined || datosEntidadActual.precioUnitario !== undefined) && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-700">
                      {datosEntidadActual.precio !== undefined
                        ? `Precio vigente: ${formatMoneda(datosEntidadActual.precio)}`
                        : `Costo unitario vigente: ${formatMoneda(datosEntidadActual.precioUnitario)}`}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                  <strong className="text-gray-900 dark:text-gray-100">Vigencia:</strong>{" "}
                  Desde el <span className="font-bold text-emerald-700 dark:text-emerald-300">{fechaInicioActualStr}</span> hasta la actualidad (En uso)
                </p>
              </div>

              {onSelectVersion && selectedVersion !== null && (
                <button
                  type="button"
                  onClick={() => onSelectVersion(null)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-2xs cursor-pointer shrink-0 self-start sm:self-center"
                >
                  Ver Versión Actual (v{versionActual})
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3 pt-2.5 border-t border-emerald-200/60 dark:border-emerald-800/40 text-xs">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>
                  <strong>Fecha y hora de creación:</strong> {fechaInicioActualStr}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>
                  <strong>Finalización de uso:</strong>{" "}
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">Vigente (En uso actual)</span>
                </span>
              </div>
            </div>
          </div>

          {/* 2. Lista de Versiones Anteriores */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h5 className="text-xs font-black uppercase tracking-wider text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-[#F05454]" />
                <span>Versiones Anteriores Guardadas ({listaVersiones.length})</span>
              </h5>

              {listaVersiones.length > 1 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-gray-400 mr-0.5">Seleccionar versión:</span>
                  <button
                    type="button"
                    disabled={activeIdx <= 0}
                    onClick={() => {
                      if (activeIdx > 0) {
                        const prevV = listaVersiones[activeIdx - 1];
                        setSelectedTabVersion(prevV.version || listaVersiones.length - (activeIdx - 1));
                      }
                    }}
                    className="p-1 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-35 disabled:cursor-not-allowed transition cursor-pointer"
                    title="Versión más reciente"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  {listaVersiones.map((v, idx) => {
                    const vNum = v.version || listaVersiones.length - idx;
                    const isSelectedPill = Number(activeVerNum) === Number(vNum);
                    return (
                      <button
                        key={`pill-v-${vNum}-${idx}`}
                        type="button"
                        onClick={() => setSelectedTabVersion(vNum)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                          isSelectedPill
                            ? "bg-[#F05454] text-white shadow-2xs"
                            : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        }`}
                      >
                        Versión {vNum}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    disabled={activeIdx < 0 || activeIdx >= listaVersiones.length - 1}
                    onClick={() => {
                      if (activeIdx >= 0 && activeIdx < listaVersiones.length - 1) {
                        const nextV = listaVersiones[activeIdx + 1];
                        setSelectedTabVersion(nextV.version || listaVersiones.length - (activeIdx + 1));
                      }
                    }}
                    className="p-1 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-35 disabled:cursor-not-allowed transition cursor-pointer"
                    title="Versión anterior"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {listaVersiones.length === 0 ? (
              <div className="p-4 rounded-2xl bg-white dark:bg-gray-800/80 border border-dashed border-gray-200 dark:border-gray-700 text-center space-y-1">
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Aún no hay versiones anteriores registradas
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 max-w-xl mx-auto leading-relaxed">
                  Esta ficha técnica se encuentra en su <strong>Versión {versionActual}</strong> (creada el <strong>{fechaInicioActualStr}</strong>). Cuando edites y guardes cambios en esta ficha técnica, lo que había anteriormente quedará guardado aquí automáticamente con su fecha y hora de creación y su fecha y hora de finalización de uso.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {versionesFiltradas.map((ver, idx) => {
                  const verNum = ver.version || listaVersiones.length - idx;
                  const inicioStr = formatFechaHoraFicha(ver.fechaInicio || ver.fechaCreacion, "Registro inicial");
                  const finStr = formatFechaHoraFicha(ver.fechaFin || ver.fechaFinalizacion, "Actualización");
                  const periodoStr = formatPeriodoVigenciaFicha(
                    ver.fechaInicio || ver.fechaCreacion,
                    ver.fechaFin || ver.fechaFinalizacion
                  );
                  const isExpanded = Boolean(expandedVersions[verNum]);
                  const isSelectedInModal = selectedVersion && Number(selectedVersion.version) === Number(verNum);
                  const verDetalles = ver.detalles || ver.insumos || [];
                  const verPasos = String(ver.procedimiento || "")
                    .split("\n")
                    .map((p) => p.trim())
                    .filter(Boolean);
                  const cleanObs = extractFichaVersionMeta(ver.observaciones || "").cleanObservaciones;

                  return (
                    <div
                      key={`ver-${verNum}-${idx}`}
                      className={`rounded-2xl border transition-all overflow-hidden ${
                        isSelectedInModal
                          ? "bg-amber-50/70 dark:bg-amber-950/30 border-amber-400 dark:border-amber-700 shadow-sm"
                          : "bg-white dark:bg-gray-800/90 border-gray-200/90 dark:border-gray-700/80 hover:border-rose-200 dark:hover:border-rose-900/60"
                      }`}
                    >
                      {/* Encabezado de la versión anterior */}
                      <div className="p-3.5 sm:p-4 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-100 text-[#F05454] dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
                                Versión {verNum}
                              </span>
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                Versión Anterior Finalizada
                              </span>
                              <span className="text-[11px] text-gray-400 font-semibold">
                                • {verDetalles.length} insumo{verDetalles.length === 1 ? "" : "s"}
                                {ver.tiempoPreparacion ? ` • ${ver.tiempoPreparacion} min` : ""}
                              </span>
                              {ver.datosEntidad && (ver.datosEntidad.precio !== undefined || ver.datosEntidad.precioUnitario !== undefined) && (
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                                  {ver.datosEntidad.precio !== undefined
                                    ? `Precio en v${verNum}: ${formatMoneda(ver.datosEntidad.precio)}`
                                    : `Costo unitario en v${verNum}: ${formatMoneda(ver.datosEntidad.precioUnitario)}`}
                                </span>
                              )}
                            </div>

                            {/* Rango explícito pedido por el usuario: desde Fecha/Hora Creación hasta Fecha/Hora Finalización */}
                            <p className="text-xs text-gray-800 dark:text-gray-200 font-semibold leading-relaxed">
                              Vigencia de la ficha técnica:{" "}
                              <span className="text-[#F05454] dark:text-rose-400 font-bold">
                                {periodoStr}
                              </span>
                            </p>
                          </div>

                          {/* Botones de acción de la versión */}
                          <div className="flex items-center gap-2 flex-wrap shrink-0">
                            {onSelectVersion && (
                              <button
                                type="button"
                                onClick={() => onSelectVersion(isSelectedInModal ? null : ver)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                                  isSelectedInModal
                                    ? "bg-amber-600 text-white hover:bg-amber-700"
                                    : "bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                                }`}
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>{isSelectedInModal ? "Viendo arriba" : "Previsualizar arriba"}</span>
                              </button>
                            )}

                            {onRestoreVersion && (
                              <button
                                type="button"
                                onClick={() => onRestoreVersion(ver)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 text-[#F05454] border border-rose-200 dark:border-rose-800/60 transition cursor-pointer"
                                title="Cargar los ingredientes y procedimiento de esta versión en el formulario"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Cargar esta versión</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => toggleExpand(verNum)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition cursor-pointer"
                            >
                              <span>{isExpanded ? "Ocultar contenido" : "Ver lo que tenía"}</span>
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        {/* Cajas de Fecha/Hora de Creación y Fecha/Hora de Finalización */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-gray-100 dark:border-gray-700/70 text-xs">
                          <div className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 flex items-start gap-2">
                            <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                                Fecha y hora de creación (Inicio de uso)
                              </span>
                              <span className="font-bold text-gray-900 dark:text-gray-100">
                                {inicioStr}
                              </span>
                            </div>
                          </div>

                          <div className="p-2.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 flex items-start gap-2">
                            <Clock className="w-4 h-4 text-[#F05454] shrink-0 mt-0.5" />
                            <div>
                              <span className="text-[10px] font-black uppercase tracking-wider text-[#F05454] block">
                                Fecha y hora de finalización de uso
                              </span>
                              <span className="font-bold text-gray-900 dark:text-gray-100">
                                {finStr}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Contenido completo desplegable de lo que había en esa versión anterior */}
                      {isExpanded && (
                        <div className="p-4 bg-gray-50/80 dark:bg-gray-900/60 border-t border-gray-200/80 dark:border-gray-700 space-y-4 text-xs">
                          {/* Datos Generales del Producto / Insumo Preparado en esa versión */}
                          {ver.datosEntidad && (
                            <div className="p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/70 dark:border-indigo-800/50 space-y-2.5">
                              <p className="font-black text-indigo-800 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                <span>
                                  {ver.datosEntidad.precio !== undefined
                                    ? `Datos del Producto en la Versión ${verNum}`
                                    : `Datos del Insumo Preparado en la Versión ${verNum}`}
                                </span>
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                {ver.datosEntidad.nombre && (
                                  <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-indigo-100 dark:border-indigo-900/40">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Nombre</span>
                                    <span className="font-black text-gray-800 dark:text-gray-100">
                                      {ver.datosEntidad.nombre}
                                    </span>
                                  </div>
                                )}
                                {ver.datosEntidad.precio !== undefined && (
                                  <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-indigo-100 dark:border-indigo-900/40">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Precio de Venta</span>
                                    <span className="font-black text-indigo-700 dark:text-indigo-300">
                                      {formatMoneda(ver.datosEntidad.precio)}
                                    </span>
                                  </div>
                                )}
                                {ver.datosEntidad.precioUnitario !== undefined && (
                                  <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-indigo-100 dark:border-indigo-900/40">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Costo Unitario</span>
                                    <span className="font-black text-indigo-700 dark:text-indigo-300">
                                      {formatMoneda(ver.datosEntidad.precioUnitario)}
                                    </span>
                                  </div>
                                )}
                                {(ver.datosEntidad.categoria || ver.datosEntidad.unidadMedida) && (
                                  <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-indigo-100 dark:border-indigo-900/40">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase block">
                                      {ver.datosEntidad.categoria ? "Categoría" : "Unidad de Medida"}
                                    </span>
                                    <span className="font-black text-gray-800 dark:text-gray-100">
                                      {ver.datosEntidad.categoria || ver.datosEntidad.unidadMedida}
                                    </span>
                                  </div>
                                )}
                              </div>
                              {ver.datosEntidad.descripcion && (
                                <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-indigo-100 dark:border-indigo-900/40">
                                  <span className="text-[10px] font-bold text-gray-400 uppercase block">Descripción</span>
                                  <span className="text-gray-700 dark:text-gray-300">
                                    {ver.datosEntidad.descripcion}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Parámetros rápidos */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200/70 dark:border-gray-700">
                              <span className="text-[10px] font-bold text-gray-400 uppercase block">Tiempo Prep.</span>
                              <span className="font-black text-gray-800 dark:text-gray-100">
                                {ver.tiempoPreparacion ? `${ver.tiempoPreparacion} min` : "Sin registrar"}
                              </span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200/70 dark:border-gray-700">
                              <span className="text-[10px] font-bold text-gray-400 uppercase block">Rendimiento</span>
                              <span className="font-black text-gray-800 dark:text-gray-100">
                                {ver.rendimiento || "1 unidad"}
                              </span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200/70 dark:border-gray-700">
                              <span className="text-[10px] font-bold text-gray-400 uppercase block">Vida Útil</span>
                              <span className="font-black text-gray-800 dark:text-gray-100">
                                {ver.vidaUtil || "Sin registrar"}
                              </span>
                            </div>
                          </div>

                          {/* Ingredientes que tenía */}
                          <div className="space-y-2">
                            <p className="font-black text-gray-700 dark:text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
                              <Package className="w-3.5 h-3.5 text-[#F05454]" />
                              <span>Ingredientes / Insumos en la Versión {verNum} ({verDetalles.length})</span>
                            </p>
                            {verDetalles.length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {verDetalles.map((d, dIdx) => (
                                  <div
                                    key={dIdx}
                                    className="px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 flex items-center justify-between gap-2"
                                  >
                                    <span className="font-bold text-gray-800 dark:text-gray-200 truncate">
                                      {d.nombreInsumo || d.insumo?.nombre || d.nombre || `Insumo #${d.idInsumo}`}
                                    </span>
                                    <span className="font-black text-[#F05454] bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-md shrink-0">
                                      {d.cantidad} {d.unidadMedida || "und"}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-400 italic">Sin insumos registrados en esta versión.</p>
                            )}
                          </div>

                          {/* Procedimiento que tenía */}
                          {verPasos.length > 0 && (
                            <div className="space-y-2">
                              <p className="font-black text-gray-700 dark:text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5 text-[#F05454]" />
                                <span>Procedimiento en la Versión {verNum}</span>
                              </p>
                              <div className="space-y-1.5">
                                {verPasos.map((paso, pIdx) => {
                                  const cleanPaso = paso.replace(/^\d+[\.\-\)]\s*/, "");
                                  return (
                                    <div
                                      key={pIdx}
                                      className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200/70 dark:border-gray-700 flex items-start gap-2.5"
                                    >
                                      <span className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-[#F05454] font-black flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                                        {pIdx + 1}
                                      </span>
                                      <span className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {cleanPaso}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Especificaciones, Características, Nutrición, Almacenamiento y Observaciones */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {ver.especificaciones && (
                              <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200/70 dark:border-gray-700">
                                <span className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1 mb-0.5">
                                  <Info className="w-3 h-3 text-blue-500" /> Especificaciones Técnicas
                                </span>
                                <p className="text-gray-700 dark:text-gray-300">{ver.especificaciones}</p>
                              </div>
                            )}
                            {ver.caracteristicas && (
                              <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200/70 dark:border-gray-700">
                                <span className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1 mb-0.5">
                                  <Sparkles className="w-3 h-3 text-amber-500" /> Características Organolépticas
                                </span>
                                <p className="text-gray-700 dark:text-gray-300">{ver.caracteristicas}</p>
                              </div>
                            )}
                            {ver.informacionNutricional && (
                              <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200/70 dark:border-gray-700">
                                <span className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1 mb-0.5">
                                  <Flame className="w-3 h-3 text-orange-500" /> Información Nutricional
                                </span>
                                <p className="text-gray-700 dark:text-gray-300">{ver.informacionNutricional}</p>
                              </div>
                            )}
                            {ver.condicionesAlmacenamiento && (
                              <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200/70 dark:border-gray-700">
                                <span className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1 mb-0.5">
                                  <ShieldAlert className="w-3 h-3 text-emerald-500" /> Almacenamiento
                                </span>
                                <p className="text-gray-700 dark:text-gray-300">{ver.condicionesAlmacenamiento}</p>
                              </div>
                            )}
                            {cleanObs && (
                              <div className="col-span-full p-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/50">
                                <span className="text-[10px] font-black text-amber-700 dark:text-amber-300 uppercase flex items-center gap-1 mb-0.5">
                                  <AlertCircle className="w-3 h-3" /> Observaciones
                                </span>
                                <p className="text-amber-900 dark:text-amber-200">{cleanObs}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default FichaVersionesHistorial;

