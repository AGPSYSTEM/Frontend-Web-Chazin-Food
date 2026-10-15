/**
 * Utilidades de optimización de imágenes para máximo rendimiento (Lighthouse 100/100)
 * Transforma URLs de Cloudinary y Unsplash en formatos modernos (WebP/AVIF),
 * con compresión inteligente al vuelo y resolución adaptada al contenedor.
 */
export const getOptimizedImageUrl = (url, width = 600, quality = 'auto') => {
  if (!url || typeof url !== 'string') return url;

  // Optimización de imágenes en Cloudinary
  if (url.includes('res.cloudinary.com') && url.includes('/image/upload/')) {
    // Si ya contiene parámetros de transformación, devolver tal cual
    if (url.includes('/image/upload/f_auto') || url.includes('/image/upload/w_') || url.includes('/image/upload/c_')) {
      return url;
    }
    const transform = `f_auto,q_${quality},w_${width},c_limit/`;
    return url.replace('/image/upload/', `/image/upload/${transform}`);
  }

  // Optimización de imágenes en Unsplash
  if (url.includes('images.unsplash.com')) {
    let cleanUrl = url;
    if (cleanUrl.includes('w=')) {
      cleanUrl = cleanUrl.replace(/w=\d+/, `w=${width}`);
    } else {
      cleanUrl += `${cleanUrl.includes('?') ? '&' : '?'}w=${width}`;
    }
    if (!cleanUrl.includes('auto=format')) {
      cleanUrl += '&auto=format';
    }
    if (cleanUrl.includes('q=')) {
      cleanUrl = cleanUrl.replace(/q=\d+/, 'q=75');
    } else {
      cleanUrl += '&q=75';
    }
    return cleanUrl;
  }

  return url;
};
