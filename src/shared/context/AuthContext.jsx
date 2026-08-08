import { createContext, useContext, useState } from "react";
import { apiClient } from "@/shared/api/apiClient";

export const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("chazin_user");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const login = async (correo, contraseña) => {
    try {
      const userData = await apiClient.post("/usuarios/login", { email: correo, contrasena: contraseña });
      if (userData) {
        setUser(userData);
        localStorage.setItem("chazin_user", JSON.stringify(userData));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error en login:", err);
      return false;
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
