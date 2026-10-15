import { useState, useEffect } from "react";
import {
  X,
  Package,
  Calendar,
  Tag,
  ShieldCheck,
  DollarSign,
  Layers,
  Building2,
  AlignLeft,
  Sparkles,
  FlaskConical,
  Clock,
  Utensils,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChefHat,
  Thermometer,
  HeartPulse,
  Award
} from "lucide-react";
import { apiClient } from "@/shared/api/apiClient";

export function VerInsumoModal({ isOpen, onClose, insumo }) {
  const [activeTab, setActiveTab] = useState("general"); // "general" | "receta" | "lotes"
  const [lotes, setLotes] = useState([]);
  const [fichaTecnica, setFichaTecnica] = useState(null);
  const [loadingExtra, setLoadingExtra] = useState(false);

  const esPreparado = insumo?.tipo === "Preparado" || Boolean(insumo?.fichaTecnica) || (insumo?.ingredientes && insumo.ingredientes.length > 0);

  useEffect(() => {
    if (!isOpen || !insumo) return;

    setActiveTab("general");
    setLotes(Array.isArray(insumo.lotes) ? insumo.lotes : []);
    setFichaTecnica(insumo.fichaTecnica || null);

    // Cargar datos adicionales si faltan (lotes o ficha técnica)
    const cargarExtras = async () => {
      try {
        setLoadingExtra(true);
        const id = insumo.idInsumo || insumo.id;
        if (!id) return;

        // Si es preparado y no tiene ficha técnica o ingredientes completos, consultar ficha técnica
        if (esPreparado && !insumo.fichaTecnica) {
          try {
            const ft = await apiClient.get(`/fichas-tecnicas/insumo/${id}`);
            if (ft) setFichaTecnica(ft);
          } catch (_) {}
        }

        // Si no tiene lotes cargados en memoria, consultar si el insumo tiene lotes
        if (!insumo.lotes || insumo.lotes.length === 0) {
          try {
            const insumoFull = await apiClient.get(`/insumos/${id}`);
            if (insumoFull && Array.isArray(insumoFull.lotes) && insumoFull.lotes.length > 0) {
              setLotes(insumoFull.lotes);
            }
          } catch (_) {}
        }
      } finally {
        setLoadingExtra(false);
      }
    };

    cargarExtras();
  }, [isOpen, insumo, esPreparado]);

  if (!isOpen || !insumo) return null;

  const stockNum = parseFloat(insumo.stock ?? 0);
  const stockMin = parseFloat(insumo.stockMinimo ?? 0);
  const isAgotado = stockNum <= 0;
  const isBajo = !isAgotado && stockNum <= stockMin;

  const stockLabel = isAgotado ? "Agotado" : isBajo ? "Stock Bajo" : "Stock Normal";
  const stockBadgeClass = isAgotado
    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800"
    : isBajo
    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800"
    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";

  // Ingredientes del insumo preparado
  const ingredientes = insumo.ingredientes ||
    (fichaTecnica?.detalles || fichaTecnica?.insumos || []).map(d => ({
      id: d.idInsumo,
      nombre: d.insumo?.nombre || d.insumoNombre || `Insumo #${d.idInsumo}`,
      cantidad: parseFloat(d.cantidad || 0),
      unidadMedida: d.unidadMedida || d.insumo?.unidadMedida || "und",
      precioUnitario: parseFloat(d.precioUnitario || d.insumo?.precioUnitario || 0)
    }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden border border-gray-100 dark:border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              esPreparado
                ? "bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300"
                : "bg-red-100 dark:bg-red-900/40 text-[#F05454]"
            }`}>
              {esPreparado ? <FlaskConical className="w-6 h-6 stroke-[2.2]" /> : <Package className="w-6 h-6 stroke-[2.2]" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {insumo.nombre}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  esPreparado
                    ? "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                    : "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                }`}>
                  {esPreparado ? "🧪 Insumo Preparado" : "📦 Insumo Base"}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${stockBadgeClass}`}>
                  {stockLabel}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                ID #{insumo.id || insumo.idInsumo || "N/A"} · Unidad: <strong className="text-gray-700 dark:text-gray-300">{insumo.unidadMedida || "und"}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs de Navegación si es Preparado o tiene Lotes */}
        <div className="flex border-b border-gray-100 dark:border-gray-800 px-6 bg-gray-50/30 dark:bg-gray-800/20">
          <button
            onClick={() => setActiveTab("general")}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "general"
                ? "border-[#F05454] text-[#F05454]"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            Datos Principales
          </button>

          {esPreparado && (
            <button
              onClick={() => setActiveTab("receta")}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === "receta"
                  ? "border-[#F05454] text-[#F05454]"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              <ChefHat className="w-3.5 h-3.5" />
              Ficha Técnica e Insumos ({ingredientes.length})
            </button>
          )}

          <button
            onClick={() => setActiveTab("lotes")}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "lotes"
                ? "border-[#F05454] text-[#F05454]"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Lotes y Vencimientos ({lotes.length})
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-sm">
          {/* ═══════════════════════════════════════════════════════════════
              TAB 1: DATOS PRINCIPALES
          ═══════════════════════════════════════════════════════════════ */}
          {activeTab === "general" && (
            <div className="space-y-4">
              {/* Grid de KPIs principales */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Stock Actual
                  </span>
                  <p className="text-lg font-black text-[#F05454]">
                    {stockNum.toLocaleString("es-CO")} <span className="text-xs font-medium text-gray-500">{insumo.unidadMedida || "und"}</span>
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Stock Mínimo
                  </span>
                  <p className="text-lg font-bold text-gray-700 dark:text-gray-300">
                    {stockMin.toLocaleString("es-CO")} <span className="text-xs font-medium text-gray-500">{insumo.unidadMedida || "und"}</span>
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    {esPreparado ? "Costo Producción" : "Precio Compra"}
                  </span>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    ${Number(insumo.precioUnitario || insumo.costo || insumo.precio || 0).toLocaleString("es-CO")}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Estado
                  </span>
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-1">
                    {insumo.estado || "Activo"}
                  </p>
                </div>
              </div>

              {/* Grid 2 Columnas: Metadata detallada */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Categoría */}
                <div className="p-3.5 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Categoría</span>
                  </div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">
                    {insumo.categoria || insumo.categoriaNombre || "General / Sin categoría"}
                  </p>
                </div>

                {/* Proveedor */}
                <div className="p-3.5 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Proveedor Asignado</span>
                  </div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">
                    {insumo.proveedor || insumo.proveedorNombre || "Sin proveedor asignado (Genérico)"}
                  </p>
                </div>

                {/* Fechas */}
                <div className="p-3.5 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <span>Fecha Expedición</span>
                  </div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">
                    {insumo.fechaExpedicion || "No registrada"}
                  </p>
                </div>

                <div className="p-3.5 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    <span>Fecha Vencimiento</span>
                  </div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">
                    {insumo.fechaVencimiento || "No especificada"}
                  </p>
                </div>
              </div>

              {/* Adición si aplica */}
              {(insumo.esAdicion === 1 || insumo.esAdicion === true || insumo.esAdicion === "1") && (
                <div className="p-3.5 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                        Disponible como Adición en Menú
                      </span>
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        Precio de Venta Adición: ${Number(insumo.precioAdicion || 0).toLocaleString("es-CO")}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Descripción */}
              <div className="p-3.5 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                  <AlignLeft className="w-3.5 h-3.5" />
                  <span>Descripción / Observaciones</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed">
                  {insumo.descripcion || "Sin observaciones adicionales registradas para este insumo."}
                </p>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              TAB 2: FICHA TÉCNICA E INSUMOS QUE UTILIZA (SI ES PREPARADO)
          ═══════════════════════════════════════════════════════════════ */}
          {activeTab === "receta" && esPreparado && (
            <div className="space-y-4">
              {/* Tabla de Insumos / Ingredientes Base Utilizados */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-purple-600" />
                  Insumos y Cantidades Requeridas ({ingredientes.length})
                </h4>

                <div className="border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden bg-gray-50/40 dark:bg-gray-800/30">
                  {ingredientes.length === 0 ? (
                    <div className="p-6 text-center text-xs text-gray-400">
                      No se han vinculado insumos base a esta receta.
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-purple-50/50 dark:bg-purple-950/20 border-b border-gray-100 dark:border-gray-800 text-[10px] uppercase font-bold text-purple-900 dark:text-purple-300">
                          <th className="px-3.5 py-2.5">Insumo Base</th>
                          <th className="px-3.5 py-2.5 text-center">Porción Requerida</th>
                          <th className="px-3.5 py-2.5 text-right">Costo Estimado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {ingredientes.map((ing, idx) => (
                          <tr key={idx} className="hover:bg-white dark:hover:bg-gray-800/60 transition-colors">
                            <td className="px-3.5 py-2.5 font-semibold text-gray-900 dark:text-gray-100">
                              {ing.nombre}
                            </td>
                            <td className="px-3.5 py-2.5 text-center">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-bold text-xs">
                                {ing.cantidad} {ing.unidadMedida}
                              </span>
                            </td>
                            <td className="px-3.5 py-2.5 text-right text-gray-600 dark:text-gray-300">
                              ${((ing.cantidad || 0) * (ing.precioUnitario || 0)).toLocaleString("es-CO")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Datos de Ficha Técnica */}
              {fichaTecnica ? (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-purple-600" />
                    Detalles de Elaboración y Control de Calidad
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block mb-0.5">
                        Tiempo Preparación
                      </span>
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        {fichaTecnica.tiempoPreparacion || 1} minutos
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block mb-0.5">
                        Rendimiento / Porciones
                      </span>
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                        {fichaTecnica.rendimiento || "1 porción"}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block mb-0.5">
                        Vida Útil
                      </span>
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                        {fichaTecnica.vidaUtil || "3-5 días en frío"}
                      </p>
                    </div>
                  </div>

                  {fichaTecnica.procedimiento && (
                    <div className="p-3.5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block mb-1">
                        Procedimiento Paso a Paso
                      </span>
                      <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                        {fichaTecnica.procedimiento}
                      </p>
                    </div>
                  )}

                  {fichaTecnica.condicionesAlmacenamiento && (
                    <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/40 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-blue-900 dark:text-blue-200 mb-0.5">
                        <Thermometer className="w-3.5 h-3.5 text-blue-600" />
                        Condiciones de Almacenamiento
                      </div>
                      <p className="text-blue-800 dark:text-blue-300">
                        {fichaTecnica.condicionesAlmacenamiento}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 text-center text-xs text-gray-400">
                  Este insumo preparado aún no tiene ficha técnica detallada registrada.
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              TAB 3: LOTES ASOCIADOS AL STOCK
          ═══════════════════════════════════════════════════════════════ */}
          {activeTab === "lotes" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    Lotes Asociados a este Insumo
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Control de trazabilidad por lote y fecha de vencimiento
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {lotes.length} lote{lotes.length !== 1 ? "s" : ""}
                </span>
              </div>

              {lotes.length === 0 ? (
                <div className="p-8 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 text-center space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-gray-700/50 text-gray-400 flex items-center justify-center mx-auto">
                    <Layers className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Sin lotes registrados
                  </p>
                  <p className="text-[11px] text-gray-400 max-w-sm mx-auto">
                    El stock actual ({stockNum} {insumo.unidadMedida}) proviene del inventario base o fue ingresado sin asignación de lote específico. Al realizar compras con asignación de lotes, se listarán aquí automáticamente.
                  </p>
                </div>
              ) : (
                <div className="border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-gray-800/60 shadow-xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-50/80 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-800 text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400">
                        <th className="px-3.5 py-3">Número de Lote</th>
                        <th className="px-3.5 py-3 text-center">Disponible</th>
                        <th className="px-3.5 py-3 text-center">Vencimiento</th>
                        <th className="px-3.5 py-3 text-right">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {lotes.map((lot, idx) => {
                        const cantDisp = parseFloat(lot.cantidadDisponible ?? lot.cantidad ?? 0);
                        const fechaVenc = lot.fechaVencimiento;
                        let estaVencido = false;
                        if (fechaVenc) {
                          estaVencido = new Date(fechaVenc) < new Date();
                        }

                        return (
                          <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                            <td className="px-3.5 py-3">
                              <span className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                                <Layers className="w-3 h-3 text-blue-500" />
                                {lot.numeroLote}
                              </span>
                              {lot.idCompra && (
                                <span className="text-[10px] text-gray-400 block mt-0.5">
                                  Orden de Compra #{lot.idCompra}
                                </span>
                              )}
                            </td>
                            <td className="px-3.5 py-3 text-center">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                                {cantDisp} {insumo.unidadMedida || "und"}
                              </span>
                            </td>
                            <td className="px-3.5 py-3 text-center">
                              {fechaVenc ? (
                                <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                                  estaVencido
                                    ? "text-red-600 dark:text-red-400 font-bold"
                                    : "text-gray-700 dark:text-gray-300"
                                }`}>
                                  <Calendar className="w-3 h-3 text-amber-500" />
                                  {fechaVenc}
                                  {estaVencido && <span className="text-[10px] text-red-500 font-bold">(Vencido)</span>}
                                </span>
                              ) : (
                                <span className="text-gray-400 text-xs">Sin fecha</span>
                              )}
                            </td>
                            <td className="px-3.5 py-3 text-right">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                cantDisp > 0
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                  : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                              }`}>
                                {cantDisp > 0 ? (lot.estado || "ACTIVO") : "AGOTADO"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
