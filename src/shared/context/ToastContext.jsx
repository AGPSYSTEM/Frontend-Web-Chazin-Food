import { createContext, useContext, useState, useCallback } from "react";
import { ToastContainer } from "@/shared/components/common/Toast";

const ToastContext = createContext(undefined);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((type, title, message, durationOrOptions = 4000, maybeAction = null) => {
    let finalTitle = title;
    let finalMessage = message;
    let finalDuration = 4000;
    let finalAction = maybeAction;

    if (typeof durationOrOptions === "number") {
      finalDuration = durationOrOptions;
    } else if (typeof durationOrOptions === "object" && durationOrOptions !== null) {
      if (durationOrOptions.duration) finalDuration = Number(durationOrOptions.duration);
      if (durationOrOptions.action) finalAction = durationOrOptions.action;
    }

    if (typeof title === "object" && title !== null) {
      finalTitle = title.title || title.message || "Notificación";
      finalMessage = title.title && title.message ? title.message : null;
      if (title.duration) finalDuration = Number(title.duration);
      if (title.action) finalAction = title.action;
    } else if (typeof message === "object" && message !== null) {
      if (message.duration) finalDuration = Number(message.duration);
      if (message.action) finalAction = message.action;
      finalMessage = typeof message.message === "string" ? message.message : null;
    }

    const safeTitle = typeof finalTitle === "string" ? finalTitle : (finalTitle ? String(finalTitle) : "");
    const safeMessage = typeof finalMessage === "string" ? finalMessage : (finalMessage ? String(finalMessage) : null);

    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast = { id, type, title: safeTitle, message: safeMessage, duration: finalDuration, action: finalAction };
    setToasts((prev) => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const bringToFront = useCallback((id) => {
    setToasts((prev) => {
      const target = prev.find((toast) => toast.id === id);
      if (!target) return prev;
      return [...prev.filter((toast) => toast.id !== id), target];
    });
  }, []);

  const success = useCallback((title, message, durationOrOptions) => {
    showToast("success", title, message, durationOrOptions);
  }, [showToast]);

  const error = useCallback((title, message, durationOrOptions) => {
    showToast("error", title, message, durationOrOptions);
  }, [showToast]);

  const warning = useCallback((title, message, durationOrOptions) => {
    showToast("warning", title, message, durationOrOptions);
  }, [showToast]);

  const info = useCallback((title, message, durationOrOptions) => {
    showToast("info", title, message, durationOrOptions);
  }, [showToast]);

  if (typeof window !== "undefined") {
    window.__toast = { showToast, success, error, warning, info };
  }

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} onBringToFront={bringToFront} />
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
