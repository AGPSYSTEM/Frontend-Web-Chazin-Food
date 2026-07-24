import { useEffect, useState } from "react";
import { AlertTriangle, Trash2, X, CheckCircle, Info } from "lucide-react";

export function ConfirmModal({
  isOpen,
  type = "danger",
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const config = {
    danger: {
      icon: Trash2,
      iconBg: "bg-red-100 dark:bg-red-900/30",
      iconColor: "text-red-600 dark:text-red-400",
      confirmBg: "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700",
      confirmText: "text-white"
    },
    warning: {
      icon: AlertTriangle,
      iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
      iconColor: "text-yellow-600 dark:text-yellow-400",
      confirmBg: "bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700",
      confirmText: "text-white"
    },
    info: {
      icon: Info,
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      confirmBg: "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700",
      confirmText: "text-white"
    },
    success: {
      icon: CheckCircle,
      iconBg: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-600 dark:text-green-400",
      confirmBg: "bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700",
      confirmText: "text-white"
    }
  };

  const currentConfig = config[type] || config.danger;
  const Icon = currentConfig.icon;

  return (
    <div
      className={`
        fixed inset-0 z-[9998] flex items-center justify-center p-4
        transition-all duration-300
        ${isVisible ? "opacity-100" : "opacity-0"}
      `}
      onClick={onCancel}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div
        className={`
          relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl
          max-w-md w-full
          transform transition-all duration-300
          ${isVisible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          <div className={`w-16 h-16 rounded-full ${currentConfig.iconBg} flex items-center justify-center mx-auto mb-4`}>
            <Icon className={`w-8 h-8 ${currentConfig.iconColor}`} />
          </div>

          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {message}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-3 ${currentConfig.confirmBg} ${currentConfig.confirmText} rounded-lg transition-colors font-medium shadow-lg`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
