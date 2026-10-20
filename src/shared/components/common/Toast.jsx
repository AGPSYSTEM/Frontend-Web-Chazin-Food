import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

export function Toast({ id, type, title, message, duration = 4000, onClose }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const timerClose = setTimeout(() => {
      handleClose();
    }, duration);
    return () => {
      clearTimeout(timerClose);
    };
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const config = {
    success: {
      icon: CheckCircle,
      bgColor: "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
      borderColor: "border-green-400 dark:border-green-600",
      iconColor: "text-green-600 dark:text-green-400",
      titleColor: "text-green-900 dark:text-green-100",
      messageColor: "text-green-700 dark:text-green-300",
      glowColor: "shadow-green-500/20"
    },
    error: {
      icon: XCircle,
      bgColor: "bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20",
      borderColor: "border-red-400 dark:border-red-600",
      iconColor: "text-red-600 dark:text-red-400",
      titleColor: "text-red-900 dark:text-red-100",
      messageColor: "text-red-700 dark:text-red-300",
      glowColor: "shadow-red-500/20"
    },
    warning: {
      icon: AlertTriangle,
      bgColor: "bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20",
      borderColor: "border-yellow-400 dark:border-yellow-600",
      iconColor: "text-yellow-600 dark:text-yellow-400",
      titleColor: "text-yellow-900 dark:text-yellow-100",
      messageColor: "text-yellow-700 dark:text-yellow-300",
      glowColor: "shadow-yellow-500/20"
    },
    info: {
      icon: Info,
      bgColor: "bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
      borderColor: "border-blue-400 dark:border-blue-600",
      iconColor: "text-blue-600 dark:text-blue-400",
      titleColor: "text-blue-900 dark:text-blue-100",
      messageColor: "text-blue-700 dark:text-blue-300",
      glowColor: "shadow-blue-500/20"
    }
  };

  const currentConfig = config[type] || config.info;
  const Icon = currentConfig.icon;

  return (
    <div
      style={{
        zIndex: 999999999,
        transform: isVisible && !isLeaving ? "translateX(0)" : "translateX(120%)",
        opacity: isVisible && !isLeaving ? 1 : 0,
        transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease-out"
      }}
      className={`
        bg-white dark:bg-gray-900 ${currentConfig.borderColor}
        border-l-4 border-y border-r border-gray-200/80 dark:border-gray-800 rounded-2xl shadow-2xl ${currentConfig.glowColor}
        min-w-[320px] max-w-md
        pointer-events-auto
      `}
    >
      <div className="p-4 flex items-start gap-3">
        <div className={`shrink-0 ${currentConfig.iconColor}`}>
          <Icon className="w-6 h-6" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className={`font-bold text-sm ${currentConfig.titleColor} mb-1`}>
            {typeof title === "string" ? title : (title && typeof title === "object" ? (title.title || title.message || JSON.stringify(title)) : (title ? String(title) : ""))}
          </h4>
          {typeof message === "string" && message.trim().length > 0 && (
            <p className={`text-sm ${currentConfig.messageColor}`}>
              {message}
            </p>
          )}
        </div>

        <button
          onClick={handleClose}
          className={`shrink-0 ${currentConfig.iconColor} hover:opacity-70 transition-opacity`}
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className={`h-1 ${currentConfig.bgColor} overflow-hidden rounded-b-lg`}>
        <div
          className={`h-full bg-gradient-to-r ${currentConfig.iconColor.replace("text-", "from-")} to-transparent`}
          style={{
            animation: `shrink ${duration}ms linear forwards`
          }}
        />
      </div>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}

export function ToastContainer({ toasts, onClose }) {
  if (typeof document === "undefined" || !toasts || toasts.length === 0) return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 999999999,
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        pointerEvents: "none",
        maxWidth: "420px",
        width: "calc(100% - 40px)"
      }}
      className="fixed top-5 right-5 flex flex-col gap-3 pointer-events-none"
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          duration={toast.duration}
          onClose={onClose}
        />
      ))}
    </div>,
    document.body
  );
}
