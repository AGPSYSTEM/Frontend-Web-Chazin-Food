import { useState, useEffect } from "react";
import {
  X,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  ShoppingCart,
  Package,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Edit,
  ExternalLink,
  Hash,
  Tag,
  ShieldCheck,
  Building
} from "lucide-react";
import { proveedoresService } from "../../servicios/proveedoresService";

export function VerProveedorModal({ isOpen, onClose, proveedor, onEdit }) {
  const [activeTab, setActiveTab] = useState("general"); // "general" | "compras"
  const [detalles, setDetalles] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !proveedor) return;

    setActiveTab("general");
    setDetalles(proveedor);

    const id = proveedor.idProveedor || proveedor.id;
    if (!id) return;

    const fetchDetalles = async () => {
      try {
        setLoading(true);
        // Si el servicio tiene getProveedorById o hacemos get
        const res = await proveedoresService.getProveedores();
        const lista = Array.isArray(res) ? res : res?.data || [];
        const encontrado = lista.find((p) => (p.idProveedor || p.id) === id);
        if (encontrado) {
          setDetalles((prev) => ({ ...prev, ...encontrado }));
        }
      } catch (err) {
        console.error("Error al obtener detalles del proveedor:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetalles();
  }, [isOpen, proveedor]);

  if (!isOpen || !proveedor) return null;

  const data = detalles || proveedor;
  const isJuridica = data.tipoPersona === "Jurídica" || data.idTipoDocumento === 3 || data.tipoDocumento === "NIT";
  const docTipo = isJuridica ? "NIT" : (data.tipoDocumento || "CC");
  const docNumero = data.nit || data.numeroDocumento || "Sin registrar";
  const isActivo = data.estado === "Activo" || data.estado === 1;

  const clasificaciones = Array.isArray(data.tiposProveedor)
    ? data.tiposProveedor
    : (data.tipoProveedor ? [data.tipoProveedor] : ["Mayorista"]);

  const comprasCount = data.comprasCount ?? (data.ultimasCompras?.length || 0);
  const insumosCount = data.insumosCount ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col max-h-[92vh] overflow-hidden"
        style={{ animation: "fadeInScale 0.2s ease-out" }}
      >
        {/* Header Modal */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4 bg-gradient-to-r from-gray-50/80 via-white to-gray-50/50 dark:from-gray-850 dark:via-gray-900 dark:to-gray-850">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/40 flex items-center justify-center shrink-0 shadow-xs">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
                  {data.nombre}
                </h2>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    isActivo
                      ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                      : "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                  }`}
                >
                  {isActivo ? "Activo" : "Inactivo"}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-0.5">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {docTipo}: {docNumero}
                </span>
                <span>•</span>
                <span>Persona {isJuridica ? "Jurídica" : "Natural"}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer shrink-0"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas de navegación */}
        <div className="px-6 pt-2 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2 bg-white dark:bg-gray-900 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "general"
                ? "border-[#F05454] text-[#F05454]"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Datos Principales</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("compras")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "compras"
                ? "border-[#F05454] text-[#F05454]"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Compras & Operaciones</span>
            {comprasCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                {comprasCount}
              </span>
            )}
          </button>
        </div>

        {/* Body scrollable */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {activeTab === "general" ? (
            <div className="space-y-4">
              {/* Tarjetas de Datos Clave */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Documento y Persona */}
                <div className="p-4 rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-850/40 space-y-1.5">
                  <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-blue-500" />
                    Identificación Fiscal
                  </span>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {docTipo}: {docNumero}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Tipo de persona: <strong className="text-gray-700 dark:text-gray-300">{isJuridica ? "Jurídica (Empresa)" : "Natural"}</strong>
                  </p>
                </div>

                {/* Clasificación Comercial */}
                <div className="p-4 rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-850/40 space-y-1.5">
                  <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-purple-500" />
                    Tipo de Proveedor
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {clasificaciones.map((c) => (
                      <span
                        key={c}
                        className="px-2.5 py-1 rounded-xl text-xs font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/40"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Clasificación comercial asignada en el catálogo
                  </p>
                </div>
              </div>

              {/* Información de Contacto */}
              <div className="p-4 rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-850 space-y-3">
                <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Contacto & Ubicación
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Persona de Contacto */}
                  <div className="p-3 rounded-xl bg-gray-50/80 dark:bg-gray-800/50">
                    <span className="text-gray-400 dark:text-gray-500 block mb-0.5">Persona de Contacto:</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {data.contacto || data.nombreContacto || "No registrado"}
                    </span>
                  </div>

                  {/* Teléfono */}
                  <div className="p-3 rounded-xl bg-gray-50/80 dark:bg-gray-800/50">
                    <span className="text-gray-400 dark:text-gray-500 block mb-0.5 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Teléfono / Celular:
                    </span>
                    {data.telefono ? (
                      <a
                        href={`tel:${data.telefono}`}
                        className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {data.telefono}
                      </a>
                    ) : (
                      <span className="font-semibold text-gray-400">No registrado</span>
                    )}
                  </div>

                  {/* Correo Electrónico */}
                  <div className="p-3 rounded-xl bg-gray-50/80 dark:bg-gray-800/50">
                    <span className="text-gray-400 dark:text-gray-500 block mb-0.5 flex items-center gap-1">
                      <Mail className="w-3 h-3" /> Correo Electrónico:
                    </span>
                    {data.email || data.correo ? (
                      <a
                        href={`mailto:${data.email || data.correo}`}
                        className="font-semibold text-blue-600 dark:text-blue-400 hover:underline break-all"
                      >
                        {data.email || data.correo}
                      </a>
                    ) : (
                      <span className="font-semibold text-gray-400">No registrado</span>
                    )}
                  </div>

                  {/* Dirección */}
                  <div className="p-3 rounded-xl bg-gray-50/80 dark:bg-gray-800/50">
                    <span className="text-gray-400 dark:text-gray-500 block mb-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Dirección Comercial:
                    </span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {data.direccion || "No registrada"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Indicador de integridad y trazabilidad */}
              <div className="p-3.5 rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300">
                    {comprasCount > 0 ? (
                      <>
                        Este proveedor cuenta con <strong>{comprasCount} compra(s) registrada(s)</strong>. Por integridad contable y tributaria, no se permite su eliminación.
                      </>
                    ) : (
                      <>
                        Proveedor sin compras registradas actualmente en el sistema.
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* KPIs de compras */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40">
                  <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                    <ShoppingCart className="w-4 h-4" />
                    Compras Registradas
                  </span>
                  <p className="text-2xl font-black text-blue-900 dark:text-blue-100 mt-1">
                    {comprasCount}
                  </p>
                  <p className="text-[11px] text-blue-600/80 dark:text-blue-400 mt-0.5">
                    Facturas procesadas con este proveedor
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/40">
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                    <Package className="w-4 h-4" />
                    Insumos Asociados
                  </span>
                  <p className="text-2xl font-black text-emerald-900 dark:text-emerald-100 mt-1">
                    {insumosCount}
                  </p>
                  <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400 mt-0.5">
                    Insumos en catálogo suministrados
                  </p>
                </div>
              </div>

              {/* Lista de últimas compras si existen */}
              {Array.isArray(data.ultimasCompras) && data.ultimasCompras.length > 0 ? (
                <div className="border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-800/60 px-4 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-300">
                    Últimas Compras Realizadas
                  </div>
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {data.ultimasCompras.map((c) => (
                      <div key={c.idCompra} className="p-3 text-xs flex items-center justify-between">
                        <div>
                          <p className="font-bold text-gray-800 dark:text-gray-200">
                            Factura: {c.numeroFactura || `#${c.idCompra}`}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            Fecha: {c.fechaFactura ? String(c.fechaFactura).slice(0, 10) : "N/A"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-extrabold text-gray-900 dark:text-gray-100">
                            ${Number(c.total || 0).toLocaleString("es-CO")}
                          </p>
                          <span className="inline-block px-2 py-0.2 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                            {c.estado || "Completada"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                  <ShoppingCart className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {comprasCount > 0
                      ? `Este proveedor tiene ${comprasCount} compra(s) registrada(s) en el historial general.`
                      : "No hay compras registradas para este proveedor."}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-850 flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-gray-400 font-medium">
            ID de Registro: #{data.idProveedor || data.id}
          </span>
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(data);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Editar Proveedor</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-bold transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerProveedorModal;
