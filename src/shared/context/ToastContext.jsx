import { createContext, useContext, useState, useCallback } from "react";
import { ToastContainer } from "@/shared/components/common/Toast";

const ToastContext = createContext(undefined);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((type, title, message, duration = 4000) => {
    let finalTitle = title;
    let finalMessage = message;
    let finalDuration = duration;

    if (typeof title === "object" && title !== null) {
      finalTitle = title.title || title.message || "Notificación";
      finalMessage = title.title && title.message ? title.message : null;
      if (title.duration) finalDuration = Number(title.duration);
    } else if (typeof message === "object" && message !== null) {
      if (message.duration) finalDuration = Number(message.duration);
      finalMessage = typeof message.message === "string" ? message.message : null;
    }

    const safeTitle = typeof finalTitle === "string" ? finalTitle : (finalTitle ? String(finalTitle) : "");
    const safeMessage = typeof finalMessage === "string" ? finalMessage : (finalMessage ? String(finalMessage) : null);

    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast = { id, type, title: safeTitle, message: safeMessage, duration: finalDuration };
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

  if (typeof window !== "undefined") {
    window.__toast = { showToast, success, error, warning, info };
  }

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
