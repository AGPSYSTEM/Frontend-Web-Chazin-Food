import React, { useState, useRef } from "react";
import { UploadCloud, Loader2, X, Image as ImageIcon } from "lucide-react";
import { uploadImageToCloudinary } from "@/shared/servicios/cloudinaryService";

export function ImageUpload({ value, onChange, label = "Imagen del Producto" }) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setErrorMsg("");
      const url = await uploadImageToCloudinary(file);
      onChange(url); // Devuelve la URL de Cloudinary al formulario padre
    } catch (err) {
      setErrorMsg(err.message || "Error al subir imagen");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div className="space-y-1.5 w-full">
      {label && <label className="text-xs font-bold text-gray-700 dark:text-gray-300">{label}</label>}

      <div
        onClick={() => !loading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
          value
            ? "border-emerald-300 bg-emerald-50/20 dark:bg-emerald-950/10"
            : "border-gray-300 dark:border-gray-700 hover:border-red-400 bg-gray-50/50 dark:bg-gray-800/40"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={loading}
        />

        {loading ? (
          <div className="py-6 flex flex-col items-center gap-2 text-red-500">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-xs font-bold">Subiendo a Cloudinary...</span>
          </div>
        ) : value ? (
          <div className="relative group w-full flex flex-col items-center">
            <img
              src={value}
              alt="Preview"
              className="w-32 h-32 object-cover rounded-xl shadow-md border border-gray-200 dark:border-gray-700"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition"
              title="Quitar imagen"
            >
              <X className="w-4 h-4" />
            </button>
            <span className="text-[11px] text-gray-500 mt-2">Haz clic para cambiar de foto</span>
          </div>
        ) : (
          <div className="py-4 flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400">
            <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-500">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                Haz clic para subir o arrastra una imagen
              </p>
              <p className="text-[10px] text-gray-400">PNG, JPG, WEBP hasta 5MB</p>
            </div>
          </div>
        )}
      </div>

      {errorMsg && (
        <p className="text-[11px] font-semibold text-red-500">{errorMsg}</p>
      )}
    </div>
  );
}
