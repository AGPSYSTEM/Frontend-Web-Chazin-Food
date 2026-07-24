import { createContext, useContext, useState, useCallback } from "react";
import { ToastContainer } from "@/shared/components/common/Toast";

const ToastContext = createContext(undefined);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((type, title, message, duration = 4000) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast = { id, type, title, message, duration };
    setToasts((prev) => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((title, message, duration) => {
    showToast("success", title, message, duration);
  }, [showToast]);

  const error = useCallback((title, message, duration) => {
    showToast("error", title, message, duration);
  }, [showToast]);

  const warning = useCallback((title, message, duration) => {
    showToast("warning", title, message, duration);
  }, [showToast]);

  const info = useCallback((title, message, duration) => {
    showToast("info", title, message, duration);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
