const CLOUD_NAME =
import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET =
import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const uploadImageToCloudinary = async (file) => {
  if (!file) throw new Error("No se ha seleccionado ningún archivo");

  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error("Falta configurar VITE_CLOUDINARY_CLOUD_NAME o VITE_CLOUDINARY_UPLOAD_PRESET en tu archivo .env");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("El archivo seleccionado debe ser una imagen (JPG, PNG, WEBP).");
  }

const maxSizeInBytes = 5 * 1024 * 1024;
if (file.size > maxSizeInBytes) {
    throw new Error("La imagen no debe superar los 5 MB de tamaño.");
}

const formData = new FormData();
formData.append("file", file);
formData.append("upload_preset", UPLOAD_PRESET);

 try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || "Error al subir la imagen a Cloudinary");
    }
    const data = await response.json();
    // data.secure_url es la URL https permanente y optimizada
    return data.secure_url;
  } catch (error) {
    console.error("Error en uploadImageToCloudinary:", error);
    throw error;
  }
};