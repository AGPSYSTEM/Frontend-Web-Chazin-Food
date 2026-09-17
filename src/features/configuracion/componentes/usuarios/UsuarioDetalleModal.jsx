import { useState, useEffect } from "react";
import {
  X, Mail, Phone, Calendar, Shield, Star,
  MessageSquare, Package, AlertCircle, Clock
} from "lucide-react";
import { usuariosService } from "../../servicios/usuariosService";
import { formatNombreCompleto } from "@/shared/utils/validationUtils";

function formatFecha(dateStr) {
  if (!dateStr) return "Sin fecha";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  } catch {
    return dateStr;
  }
}

function StarsRating({ valor = 5 }) {
  const estrellas = Math.round(Number(valor) || 0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-4 h-4 ${
            s <= estrellas
              ? "text-amber-400 fill-amber-400"
              : "text-gray-200 dark:text-gray-700"
          }`}
        />
      ))}
      <span className="text-xs font-bold text-amber-500 ml-1">
        {Number(valor || 0).toFixed(1)}
      </span>
    </div>
  );
}

export function UsuarioDetalleModal({ isOpen, onClose, usuario }) {
  const [resenas, setResenas] = useState([]);
  const [loadingResenas, setLoadingResenas] = useState(false);
  const [errorResenas, setErrorResenas] = useState(null);

  const userId = usuario?.id || usuario?.idUsuario;

  useEffect(() => {
    if (isOpen && userId) {
      setLoadingResenas(true);
      setErrorResenas(null);
      usuariosService
        .getResenasUsuario(userId)
        .then((data) => {
          setResenas(Array.isArray(data) ? data : []);
        })
        .catch((err) => {
          console.error("Error al cargar reseñas del usuario:", err);
          setErrorResenas("No se pudieron cargar las reseñas de este usuario.");
          setResenas([]);
        })
        .finally(() => {
          setLoadingResenas(false);
        });
    } else {
      setResenas([]);
      setErrorResenas(null);
    }
  }, [isOpen, userId]);

  if (!isOpen || !usuario) return null;

  const nombreCompleto =
    formatNombreCompleto(usuario.nombre, usuario.apellidos) || "Usuario";
  const iniciales = (
    (usuario.nombre?.[0] || "U") + (usuario.apellidos?.[0] || "")
  ).toUpperCase();
  const rol = usuario.rolNombre || usuario.rol?.nombre || usuario.rol || "Usuario";
  const estado = usuario.estado || "Activo";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Header con Perfil */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50/80 via-white to-gray-50/50 dark:from-gray-800/40 dark:via-gray-900 dark:to-gray-800/30 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F05454] to-[#c0392b] text-white font-black text-lg flex items-center justify-center shrink-0 shadow-md shadow-red-500/20">
              {iniciales}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
                  {nombreCompleto}
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    estado === "Activo" || estado === "ACTIVO" || estado === "1"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  {estado}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">
                ID #{userId} • {usuario.tipoDocumento || "C.C."}: {usuario.documento || usuario.numeroDocumento || "-"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Rápida del Usuario */}
        <div className="px-6 py-3.5 bg-gray-50/60 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="truncate" title={usuario.email}>
              {usuario.email || "-"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="truncate">{usuario.telefono || "-"}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Shield className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="font-semibold text-gray-800 dark:text-gray-200 truncate">
              {rol}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="truncate">
              Reg: {formatFecha(usuario.fechaRegistro)}
            </span>
          </div>
        </div>

        {/* Sección de Reseñas */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#F05454]" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                Reseñas y Opiniones del Usuario
              </h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 bg-rose-50 dark:bg-rose-950/40 text-[#F05454] rounded-full">
              {resenas.length} {resenas.length === 1 ? "reseña" : "reseñas"}
            </span>
          </div>

          {loadingResenas ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-gray-400">
              <div className="w-7 h-7 border-2 border-[#F05454] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-medium animate-pulse">Cargando reseñas del usuario...</p>
            </div>
          ) : errorResenas ? (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorResenas}</span>
            </div>
          ) : resenas.length === 0 ? (
            <div className="py-12 text-center text-gray-400 dark:text-gray-500 flex flex-col items-center justify-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                <MessageSquare className="w-6 h-6 stroke-[1.5]" />
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Este usuario no ha dejado ninguna reseña aún.
              </p>
              <p className="text-xs text-gray-400">
                Las opiniones que registre en los productos comprados aparecerán aquí.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {resenas.map((r) => (
                <div
                  key={r.id || r.idResena}
                  className="p-4 rounded-2xl bg-white dark:bg-gray-850 border border-gray-100 dark:border-gray-800/80 shadow-xs hover:border-gray-200 dark:hover:border-gray-700 transition-all space-y-2.5"
                >
                  {/* Encabezado de la reseña: Producto + Calificación + Fecha */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                        <Package className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                          {r.productoNombre}
                        </p>
                        {r.productoCategoria && (
                          <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">
                            {r.productoCategoria}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
                      <StarsRating valor={r.puntuacion} />
                      <div className="flex items-center gap-1 text-[11px] text-gray-400 font-medium whitespace-nowrap">
                        <Clock className="w-3 h-3" />
                        <span>{formatFecha(r.fecha || r.fechaResena)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Descripción / Comentario */}
                  <div className="pl-10">
                    <div className="p-3 rounded-xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-normal">
                      {r.comentario ? (
                        <span>"{r.comentario}"</span>
                      ) : (
                        <span className="text-gray-400 italic">
                          Sin descripción escrita (sólo calificación).
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-850 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
