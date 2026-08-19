import { useState, useEffect } from "react";
import { X, Plus, Edit, Trash2, Save, Image as ImageIcon } from "lucide-react";
import { adicionesService } from "../../servicios/adicionesService";
import { useToast } from "@/shared/context/ToastContext";
import { useConfirm } from "@/shared/context/ConfirmContext";

export function AdicionesModal({ isOpen, onClose, insumos }) {
  const toast = useToast();
  const { confirm } = useConfirm();
  const [adiciones, setAdiciones] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    id: null,
    nombre: "",
    idInsumo: "",
    precio: "",
    descripcion: "",
    imagen: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      loadAdiciones();
    }
  }, [isOpen]);

  const loadAdiciones = async () => {
    setLoading(true);
    try {
      const data = await adicionesService.getAdiciones();
      setAdiciones(data);
    } catch (err) {
      console.error(err);
      toast.error("Error", "No se pudieron cargar las adiciones");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setIsEditing(false);
    setFormData({
      id: null,
      nombre: "",
      idInsumo: insumos && insumos.length > 0 ? (insumos[0].id || insumos[0].idInsumo) : "",
      precio: "",
      descripcion: "",
      imagen: "",
    });
    setShowForm(true);
  };

  const handleEdit = (adicion) => {
    setIsEditing(true);
    setFormData({
      id: adicion.idAdicion,
      nombre: adicion.nombre,
      idInsumo: adicion.idInsumo,
      precio: adicion.precio,
      descripcion: adicion.descripcion || "",
      imagen: adicion.imagen || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const isConfirmed = await confirm({
      title: "¿Eliminar adición?",
      message: "¿Estás seguro de que deseas desactivar esta adición?",
      type: "danger",
      confirmText: "Eliminar",
      cancelText: "Cancelar"
    });
    if (isConfirmed) {
      try {
        await adicionesService.deleteAdicion(id);
        toast.success("Adición eliminada", "La adición fue eliminada correctamente");
        await loadAdiciones();
      } catch (err) {
        console.error(err);
        toast.error("Error", err.message || "Error al eliminar la adición");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim() || !formData.idInsumo || formData.precio === "") {
      toast.error("Campos requeridos", "Por favor completa el nombre, insumo base y precio");
      return;
    }
    try {
      const payload = {
        ...formData,
        idInsumo: Number(formData.idInsumo),
        precio: Number(formData.precio),
        estado: "Activo"
      };

      if (isEditing) {
        await adicionesService.updateAdicion(formData.id, payload);
        toast.success("Adición actualizada", "La adición se actualizó correctamente");
      } else {
        await adicionesService.createAdicion(payload);
        toast.success("Adición creada", "La adición se creó exitosamente");
      }
      
      setShowForm(false);
      await loadAdiciones();
    } catch (err) {
      console.error(err);
      toast.error("Error al guardar", err.message || "No se pudo guardar la adición");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Gestión de Adiciones
            </h2>
            <p className="text-sm text-gray-500">
              Administra las adiciones (ej: Queso extra) basadas en insumos
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {showForm ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre Adición *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500"
                    placeholder="Ej. Tocineta Extra"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Insumo Base *
                  </label>
                  <select
                    required
                    value={formData.idInsumo}
                    onChange={(e) => setFormData({ ...formData, idInsumo: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Selecciona un insumo...</option>
                    {insumos.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Precio ($) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    URL Imagen (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.imagen}
                    onChange={(e) => setFormData({ ...formData, imagen: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500"
                    placeholder="https://..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Descripción (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 rounded-xl font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl shadow-md transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={handleCreateNew}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl shadow-md transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Crear Adición</span>
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8 text-gray-500">Cargando...</div>
              ) : adiciones.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  No hay adiciones creadas
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {adiciones.map((adicion) => (
                    <div key={adicion.idAdicion} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm">
                      {adicion.imagen ? (
                        <img src={adicion.imagen} alt={adicion.nombre} className="w-12 h-12 rounded-xl object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{adicion.nombre}</p>
                        <p className="text-xs text-gray-500 font-medium">Insumo: {adicion.insumo?.nombre}</p>
                        <p className="text-sm font-bold text-purple-600 dark:text-purple-400">
                          ${Number(adicion.precio).toLocaleString('es-CO')}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleEdit(adicion)}
                          className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(adicion.idAdicion)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
