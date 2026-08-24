import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiClient } from "@/shared/api/apiClient";

export const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("chazin_user");
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      // Sanitize stale JSON-encoded direccion from old sessions
      if (parsed && parsed.direccion && typeof parsed.direccion === 'string' && parsed.direccion.trim().startsWith('{')) {
        try { const d = JSON.parse(parsed.direccion); parsed.direccion = d.direccion || parsed.direccion; } catch (e) { /* keep */ }
      }
      return parsed;
    } catch (e) {
      return null;
    }
  });

  const refreshUser = useCallback(async () => {
    try {
      const saved = localStorage.getItem("chazin_user");
      const token = saved ? JSON.parse(saved).token : null;
      if (!token) return null;

      const profileData = await apiClient.get("/usuarios/perfil");
      if (profileData) {
        setUser((prev) => {
          const merged = { ...prev, ...profileData, token: prev?.token || token };
          localStorage.setItem("chazin_user", JSON.stringify(merged));
          return merged;
        });
        return profileData;
      }
    } catch (err) {
      // Silently fail if unauthenticated or network error
    }
    return null;
  }, []);

  useEffect(() => {
    if (user?.token || localStorage.getItem("chazin_user")) {
      refreshUser();
    }
  }, [refreshUser]);

  const login = async (correo, contraseña) => {
    try {
      const userData = await apiClient.post("/usuarios/login", { email: correo, contrasena: contraseña });
      if (userData) {
        setUser(userData);
        localStorage.setItem("chazin_user", JSON.stringify(userData));
        return { success: true };
      }
      return { success: false, message: "Error al iniciar sesión" };
    } catch (err) {
      console.error("Error en login:", err);
      return { success: false, message: err.message || "Correo o contraseña incorrectos" };
    }
  };

  const register = async (userData) => {
    try {
      const data = await apiClient.post("/usuarios/registro", userData);
      if (data) {
        setUser(data);
        localStorage.setItem("chazin_user", JSON.stringify(data));
        return { success: true, message: "¡Cuenta creada exitosamente!" };
      }
      return { success: false, message: "Error al crear la cuenta" };
    } catch (err) {
      console.error("Error en register:", err);
      return { success: false, message: err.message || "Fallo de conexión al registrar cuenta" };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const updated = await apiClient.put("/autenticacion/perfil", profileData);
      if (updated) {
        // Sanitize direccion if needed
        if (updated.direccion && typeof updated.direccion === "string" && updated.direccion.trim().startsWith("{")) {
          try { const d = JSON.parse(updated.direccion); updated.direccion = d.direccion || updated.direccion; } catch (e) { /* keep */ }
        }
        setUser(updated);
        localStorage.setItem("chazin_user", JSON.stringify(updated));
        return { success: true, user: updated };
      }
      return { success: false, message: "No se pudo actualizar el perfil" };
    } catch (err) {
      console.error("Error en updateProfile:", err);
      return { success: false, message: err.message || "Error al actualizar el perfil" };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("chazin_user");
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      updateProfile,
      refreshUser,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
