import { useState, useEffect, useCallback } from "react";
import {
  X, Star, MessageSquare, User as UserIcon, Pencil, Trash2,
  CheckCircle2, AlertCircle, Send, ShieldAlert
} from "lucide-react";
import { StarRating } from "@/shared/components/ui/StarRating";
import { useAuth } from "@/features/autenticacion/hooks/useAuth";
import { apiClient } from "@/shared/api/apiClient";
import Swal from "sweetalert2";

function formatFecha(dateStr) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("es-CO", {
      year: "numeric", month: "long", day: "numeric"
    });
  } catch {
    return dateStr;
  }
}

function Iniciales({ nombre }) {
  const parts = (nombre || "U").trim().split(/\s+/);
  const initials = parts.length >= 2
    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();
  return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#f05454] to-[#c43d3d] text-white flex items-center justify-center text-xs font-black shrink-0 shadow-sm">
      {initials}
    </div>
  );
}

function StarsDisplay({ valor }) {
  const estrellasLlenas = Math.round(valor);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <svg key={s} className="w-3.5 h-3.5" viewBox="0 0 24 24" fill={s <= estrellasLlenas ? "#f59e0b" : "none"} stroke="#f59e0b" strokeWidth="1.5">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" strokeLinejoin="round" />
        </svg>
      ))}
    </div>
  );
}

export function ProductoResenasModal({ isOpen, onClose, producto }) {
  const { user } = useAuth();
  const [data, setData] = useState({ promedio: 0, total: 0, resenas: [] });
  const [loading, setLoading] = useState(false);
  const [miResena, setMiResena] = useState(null); // null | { id, puntuacion, comentario }
  const [compro, setCompro] = useState(false);
  const [comprandoCheck, setComprandoCheck] = useState(false);
  const [modoEditar, setModoEditar] = useState(false);
  const [form, setForm] = useState({ puntuacion: 0, comentario: "" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const idProducto = producto?.idProducto || producto?.id;

  const fetchResenas = useCallback(async () => {
    if (!idProducto) return;
    setLoading(true);
    try {
      const result = await apiClient.get(`/resenas/producto/${idProducto}`);
      setData(result);
    } catch (err) {
      console.error("Error cargando reseñas:", err);
    } finally {
      setLoading(false);
    }
  }, [idProducto]);

  const checkUsuarioCompro = useCallback(async () => {
    if (!user || !idProducto) return;
    setComprandoCheck(true);
    try {
      // Verificamos si hay reseña propia
      const res = await apiClient.get(`/resenas/mia/${idProducto}`);
      if (res) {
        setMiResena(res);
        setForm({ puntuacion: res.puntuacion, comentario: res.comentario || "" });
      } else {
        setMiResena(null);
      }
    } catch (err) {
      // 404 = no hay reseña
      setMiResena(null);
    } finally {
      setComprandoCheck(false);
    }
    // Check si compró (se infiere si puede acceder a endpoint /mia sin error 403, 
    // pero mejor usamos el intento de crear y el backend valida)
    setCompro(true); // El backend rechazará si no compró al enviar
  }, [user, idProducto]);

  useEffect(() => {
    if (isOpen && idProducto) {
      fetchResenas();
      if (user) checkUsuarioCompro();
      setModoEditar(false);
      setFormError("");
    }
  }, [isOpen, idProducto, user, fetchResenas, checkUsuarioCompro]);

  if (!isOpen || !producto) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!form.puntuacion || form.puntuacion < 1) {
      setFormError("Selecciona una puntuación de 1 a 5 estrellas.");
      return;
    }

    setSaving(true);
    try {
      if (miResena) {
        // Editar
        await apiClient.put(`/resenas/${miResena.id}`, {
          puntuacion: form.puntuacion,
          comentario: form.comentario
        });
        await Swal.fire({
          icon: "success", title: "¡Reseña actualizada!", timer: 1800, timerProgressBar: true,
          showConfirmButton: false, confirmButtonColor: "#f05454"
        });
      } else {
        // Crear
        await apiClient.post("/resenas", {
          idProducto,
          puntuacion: form.puntuacion,
          comentario: form.comentario
        });
        await Swal.fire({
          icon: "success", title: "¡Gracias por tu reseña!", timer: 1800, timerProgressBar: true,
          showConfirmButton: false, confirmButtonColor: "#f05454"
        });
      }
      setModoEditar(false);
      await fetchResenas();
      await checkUsuarioCompro();
    } catch (err) {
      const msg = err.message || "Error al guardar la reseña.";
      if (msg.includes("comprado") || err.status === 403) {
        setFormError("Solo puedes reseñar productos que hayas comprado.");
      } else if (msg.includes("Ya has dejado") || err.status === 409) {
        setFormError("Ya tienes una reseña para este producto.");
      } else {
        setFormError(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEliminar = async () => {
    if (!miResena) return;
    const confirm = await Swal.fire({
      title: "¿Eliminar reseña?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f05454",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });
    if (!confirm.isConfirmed) return;
    try {
      await apiClient.delete(`/resenas/${miResena.id}`);
      setMiResena(null);
      setForm({ puntuacion: 0, comentario: "" });
      await fetchResenas();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.message, confirmButtonColor: "#f05454" });
    }
  };

  const promedio = data.promedio || 0;
  const totalResenas = data.total || 0;
  const nombreProducto = producto?.nombre || "Producto";
  const imagenProducto = producto?.imagen;

  // Distribución de ratings
  const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  data.resenas.forEach(r => { if (dist[r.puntuacion] !== undefined) dist[r.puntuacion]++; });

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 w-full max-w-xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] my-auto overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-5 text-white relative flex items-center gap-4 shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden shrink-0">
            {imagenProducto ? (
              <img src={imagenProducto.startsWith("http") ? imagenProducto : `http://localhost:5000${imagenProducto}`} alt={nombreProducto} className="w-full h-full object-cover" />
            ) : (
              <Star className="w-7 h-7 text-white" />
            )}
          </div>
          <div className="min-w-0 pr-10">
            <p className="text-xs font-bold text-white/70 uppercase tracking-wider">Reseñas del producto</p>
            <h2 className="text-lg font-black truncate">{nombreProducto}</h2>
            {totalResenas > 0 ? (
              <div className="flex items-center gap-1.5 mt-0.5">
                <StarRating value={promedio} readonly size="sm" />
                <span className="text-sm font-bold text-white/90">{promedio.toFixed(1)}</span>
                <span className="text-xs text-white/70">({totalResenas} {totalResenas === 1 ? "reseña" : "reseñas"})</span>
              </div>
            ) : (
              <p className="text-xs text-white/70 mt-0.5">Sin reseñas aún</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {/* ── Resumen de ratings ── */}
          {totalResenas > 0 && (
            <div className="p-5 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-4">
                <div className="text-center shrink-0">
                  <p className="text-4xl font-black text-gray-900 dark:text-gray-100">{promedio.toFixed(1)}</p>
                  <StarRating value={promedio} readonly size="sm" className="justify-center mt-0.5" />
                  <p className="text-xs text-gray-500 mt-0.5">{totalResenas} {totalResenas === 1 ? "reseña" : "reseñas"}</p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[5, 4, 3, 2, 1].map(star => {
                    const count = dist[star] || 0;
                    const pct = totalResenas > 0 ? (count / totalResenas) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-2 text-xs">
                        <span className="text-gray-500 dark:text-gray-400 w-4 text-right">{star}</span>
                        <svg className="w-3 h-3 text-amber-400 shrink-0" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1.5">
                          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" strokeLinejoin="round" />
                        </svg>
                        <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-gray-500 w-5 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── Zona de formulario para el usuario ── */}
          {user && (
            <div className="p-5 border-b border-gray-100 dark:border-gray-800">
              {miResena && !modoEditar ? (
                /* Ya tiene reseña - muestra un resumen + botones editar/eliminar */
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Tu reseña
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setModoEditar(true); setFormError(""); }}
                        className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-800/50 text-amber-700 dark:text-amber-300 transition cursor-pointer"
                        title="Editar reseña"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={handleEliminar}
                        className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-800/50 text-red-600 dark:text-red-400 transition cursor-pointer"
                        title="Eliminar reseña"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <StarsDisplay valor={miResena.puntuacion} />
                  {miResena.comentario && (
                    <p className="mt-1.5 text-sm text-gray-700 dark:text-gray-300 italic">"{miResena.comentario}"</p>
                  )}
                </div>
              ) : !miResena && !modoEditar ? (
                /* No tiene reseña - invitar a escribir */
                <div>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-amber-500" />
                    Comparte tu opinión
                  </p>
                  <div className="flex items-center gap-3 mb-3">
                    <p className="text-xs text-gray-500">Puntuación:</p>
                    <StarRating
                      value={form.puntuacion}
                      onChange={v => { setForm(prev => ({ ...prev, puntuacion: v })); setFormError(""); }}
                      size="lg"
                    />
                  </div>
                  <form onSubmit={handleSubmit} noValidate>
                    <textarea
                      value={form.comentario}
                      onChange={e => setForm(prev => ({ ...prev, comentario: e.target.value }))}
                      placeholder="Escribe un comentario (opcional)..."
                      rows={3}
                      maxLength={500}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-amber-400/40 resize-none transition"
                    />
                    {formError && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {formError}
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={saving || !form.puntuacion}
                      className="mt-3 w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl transition-all shadow-sm hover:shadow-md active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {saving ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                        </svg>
                      ) : <Send className="w-4 h-4" />}
                      {saving ? "Enviando..." : "Publicar Reseña"}
                    </button>
                  </form>
                </div>
              ) : modoEditar ? (
                /* Modo editar reseña */
                <div>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Pencil className="w-4 h-4 text-amber-500" />
                    Editar tu reseña
                  </p>
                  <div className="flex items-center gap-3 mb-3">
                    <p className="text-xs text-gray-500">Puntuación:</p>
                    <StarRating
                      value={form.puntuacion}
                      onChange={v => { setForm(prev => ({ ...prev, puntuacion: v })); setFormError(""); }}
                      size="lg"
                    />
                  </div>
                  <form onSubmit={handleSubmit} noValidate>
                    <textarea
                      value={form.comentario}
                      onChange={e => setForm(prev => ({ ...prev, comentario: e.target.value }))}
                      placeholder="Edita tu comentario..."
                      rows={3}
                      maxLength={500}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-amber-400/40 resize-none transition"
                    />
                    {formError && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {formError}
                      </p>
                    )}
                    <div className="flex gap-2 mt-3">
                      <button
                        type="button"
                        onClick={() => { setModoEditar(false); setFormError(""); if(miResena) setForm({ puntuacion: miResena.puntuacion, comentario: miResena.comentario || "" }); }}
                        className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl transition cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                      >
                        {saving ? "Guardando..." : "Guardar"}
                      </button>
                    </div>
                  </form>
                </div>
              ) : null}
            </div>
          )}

          {!user && (
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-gray-400" />
                Inicia sesión para dejar tu reseña.
              </div>
            </div>
          )}

          {/* ── Lista de reseñas ── */}
          <div className="p-5 space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <svg className="w-8 h-8 animate-spin text-amber-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                </svg>
              </div>
            ) : data.resenas.length === 0 ? (
              <div className="text-center py-8 text-gray-400 dark:text-gray-600">
                <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">No hay reseñas aún</p>
                <p className="text-xs">¡Sé el primero en opinar sobre este producto!</p>
              </div>
            ) : (
              data.resenas.map(r => (
                <div key={r.id} className="flex gap-3">
                  <Iniciales nombre={r.nombre} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{r.nombre}</p>
                      <p className="text-[10px] text-gray-400">{formatFecha(r.fecha)}</p>
                    </div>
                    <StarsDisplay valor={r.puntuacion} />
                    {r.comentario && (
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{r.comentario}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductoResenasModal;
