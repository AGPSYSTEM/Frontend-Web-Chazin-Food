import { apiClient } from "@/shared/api/apiClient";

export const authService = {
  login: async (email, password) => {
    return await apiClient.post("/auth/login", { email, password });
  },

  register: async (userData) => {
    return await apiClient.post("/auth/register", userData);
  },

  logout: async () => {
    return await apiClient.post("/auth/logout");
  },

  getProfile: async () => {
    return await apiClient.get("/auth/me");
  },

  recuperarContrasena: async (email) => {
    return await apiClient.post("/usuarios/recuperar-contrasena", { email });
  },

  restablecerContrasena: async (token, email, contrasena) => {
    return await apiClient.post("/usuarios/restablecer-contrasena", { token, email, contrasena });
  }
};

