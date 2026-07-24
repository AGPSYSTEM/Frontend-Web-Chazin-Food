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
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  
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
    let errorMessage = `HTTP error ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData && errorData.message) {
        errorMessage = errorData.message;
      }
    } catch {
      // JSON parse error, use default message
    }
    const error = new Error(errorMessage);
    error.status = response.status;
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
  post: (endpoint, body, options) => apiFetch(endpoint, { method: 'POST', body: JSON.stringify(body), ...options }),
  put: (endpoint, body, options) => apiFetch(endpoint, { method: 'PUT', body: JSON.stringify(body), ...options }),
  delete: (endpoint, options) => apiFetch(endpoint, { method: 'DELETE', ...options })
};

export default API_BASE_URL;
