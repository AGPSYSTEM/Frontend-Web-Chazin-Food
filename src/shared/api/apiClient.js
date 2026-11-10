const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Helper function to retrieve auth headers with Bearer token
 */
export function getAuthHeaders() {
  const headers = {
    'Content-Type': 'application/json'
  };
  try {
    const savedUser = JSON.parse(localStorage.getItem('chazin_user') || '{}');
    if (savedUser && savedUser.token) {
      headers['Authorization'] = `Bearer ${savedUser.token}`;
    }
  } catch (err) {
    console.error('Error parsing chazin_user from localStorage:', err);
  }
  return headers;
}

/**
 * Generic fetch wrapper for API calls
 */
export async function apiFetch(endpoint, options = {}) {
  let url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  
  if (options.params && typeof options.params === 'object') {
    const searchParams = new URLSearchParams();
    Object.entries(options.params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, val);
      }
    });
    const qs = searchParams.toString();
    if (qs) {
      url += (url.includes('?') ? '&' : '?') + qs;
    }
  }

  const defaultHeaders = getAuthHeaders();
  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {})
    }
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const isLoginEndpoint = endpoint.includes('/login') || endpoint.includes('/activar-cuenta');
    if (response.status === 401 && !isLoginEndpoint && typeof window !== 'undefined') {
      try {
        localStorage.removeItem('chazin_user');
      } catch (_) {}
      setTimeout(() => {
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }, 1800);
    }
    let errorMessage = `HTTP error ${response.status}`;
    let parsedErrorData = null;
    try {
      const errorData = await response.json();
      parsedErrorData = errorData;
      if (errorData) {
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.mensaje) {
          errorMessage = errorData.mensaje;
        } else if (typeof errorData.error === 'string' && errorData.error.trim()) {
          errorMessage = errorData.error;
        } else if (Array.isArray(errorData.errores) && errorData.errores.length > 0) {
          errorMessage = errorData.errores.join(' ');
        }
      }
    } catch {
      // JSON parse error, use default message
    }

    // Mensaje coherente y amigable cuando la sesión se cerró o el token expiró
    if (response.status === 401 && !isLoginEndpoint) {
      if (!errorMessage || errorMessage.toLowerCase().includes('token') || errorMessage === `HTTP error ${response.status}`) {
        errorMessage = 'Tu sesión ha expirado o has cerrado sesión. Por favor ingresa nuevamente.';
      }
    }

    // Traducción de errores técnicos de base de datos a mensajes entendibles por el usuario (Ítem 13)
    const lower = String(errorMessage || '').toLowerCase();
    if (lower.includes('foreign key constraint') || lower.includes('cannot delete or update a parent row')) {
      if (lower.includes('categoriaproducto') || lower.includes('idcategoriaproducto')) {
        errorMessage = 'No se puede eliminar la categoría porque tiene productos asociados en el menú.';
      } else if (lower.includes('producto') || lower.includes('idproducto')) {
        errorMessage = 'No se puede eliminar este producto porque está vinculado a ventas o pedidos registrados.';
      } else if (lower.includes('insumo') || lower.includes('idinsumo')) {
        errorMessage = 'No se puede eliminar este insumo porque forma parte de recetas o compras activas.';
      } else {
        errorMessage = 'No se puede realizar esta acción porque el registro está asociado a otros datos del sistema.';
      }
    } else if (lower.includes('duplicate entry') || lower.includes('unique constraint')) {
      if (lower.includes('nombre') || lower.includes('name')) {
        errorMessage = 'Ya existe un registro con este nombre. Por favor ingresa uno diferente.';
      } else if (lower.includes('codigo') || lower.includes('code')) {
        errorMessage = 'Ya existe un elemento con este código registrado.';
      } else {
        errorMessage = 'Ya existe un registro con estos datos en el sistema. Por favor verifica la información.';
      }
    }

    const error = new Error(errorMessage);
    error.status = response.status;
    if (parsedErrorData) error.data = parsedErrorData;
    throw error;
  }

  // Check if response has content
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  
  return await response.text();
}

export const apiClient = {
  get: (endpoint, options) => apiFetch(endpoint, { method: 'GET', ...options }),
  post: (endpoint, body, options) => apiFetch(endpoint, { method: 'POST', body: body ? JSON.stringify(body) : undefined, ...options }),
  put: (endpoint, body, options) => apiFetch(endpoint, { method: 'PUT', body: body ? JSON.stringify(body) : undefined, ...options }),
  patch: (endpoint, body, options) => apiFetch(endpoint, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined, ...options }),
  delete: (endpoint, options) => apiFetch(endpoint, { method: 'DELETE', ...options })
};

export default API_BASE_URL;
