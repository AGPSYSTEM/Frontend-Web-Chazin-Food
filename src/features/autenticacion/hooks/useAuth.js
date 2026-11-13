import { useContext } from "react";
import { AuthContext } from "@/shared/context/AuthContext";

/** Normalizes login failure responses into user-facing toast title and message. */
export function getLoginErrorToast(result) {
  const msg = String(result?.message || "");
  const lower = msg.toLowerCase();
  const isInvalidCreds =
    result?.status === 401 ||
    result?.status === 404 ||
    lower.includes("credenciales") ||
    lower.includes("no existe") ||
    lower.includes("incorrect");
  if (isInvalidCreds) {
    return ["Credenciales inválidas", "El correo o la contraseña son incorrectos."];
  }
  return ["Error de autenticación", msg || "Credenciales inválidas"];
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
