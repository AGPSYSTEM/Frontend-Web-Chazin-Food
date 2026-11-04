import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

export function Toast({
  id,
  type,
  title,
  message,
  duration = 4000,
  onClose,
  indexFromFront = 0,
  isHovered = false,
  expandedOffset = 0,
  totalToasts = 1,
  onBringToFront,
  onHeightChange
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const toastRef = useRef(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setIsMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Measure height of this card
  useEffect(() => {
    if (toastRef.current && onHeightChange) {
      onHeightChange(id, toastRef.current.offsetHeight);
    }
  }, [id, title, message, onHeightChange]);

  const handleClose = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  }, [id, onClose]);

  // Auto-close countdown timer
  useEffect(() => {
    if (duration <= 0 || isHovered || isLeaving) return;
    // When stacked, only the front card counts down so back cards don't vanish invisibly
    if (!isHovered && indexFromFront !== 0) return;

    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, isHovered, isLeaving, indexFromFront, handleClose]);

  const config = {
    success: {
      icon: CheckCircle,
      bgColor: "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
      borderColor: "border-green-400 dark:border-green-600",
      iconColor: "text-green-600 dark:text-green-400",
      titleColor: "text-green-900 dark:text-green-100",
      messageColor: "text-green-700 dark:text-green-300",
      glowColor: "shadow-green-500/10"
    },
    error: {
      icon: XCircle,
      bgColor: "bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20",
      borderColor: "border-red-400 dark:border-red-600",
      iconColor: "text-red-600 dark:text-red-400",
      titleColor: "text-red-900 dark:text-red-100",
      messageColor: "text-red-700 dark:text-red-300",
      glowColor: "shadow-red-500/10"
    },
    warning: {
      icon: AlertTriangle,
      bgColor: "bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20",
      borderColor: "border-yellow-400 dark:border-yellow-600",
      iconColor: "text-yellow-600 dark:text-yellow-400",
      titleColor: "text-yellow-900 dark:text-yellow-100",
      messageColor: "text-yellow-700 dark:text-yellow-300",
      glowColor: "shadow-yellow-500/10"
    },
    info: {
      icon: Info,
      bgColor: "bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
      borderColor: "border-blue-400 dark:border-blue-600",
      iconColor: "text-blue-600 dark:text-blue-400",
      titleColor: "text-blue-900 dark:text-blue-100",
      messageColor: "text-blue-700 dark:text-blue-300",
      glowColor: "shadow-blue-500/10"
    }
  };

  const currentConfig = config[type] || config.info;
  const Icon = currentConfig.icon;

  // Stack 3D layering & transform calculations
  let transform = "translate3d(0, 0, 0)";
  let opacity = 1;
  let zIndex = 50 - indexFromFront;
  let pointerEvents = "auto";
  let cursor = "default";

  if (isLeaving || !isMounted) {
    transform = "translateX(120%)";
    opacity = 0;
  } else if (isHovered) {
    // Modo expandido: se despliegan en lista vertical con separación clara
    transform = `translate3d(0, ${expandedOffset}px, 0) scale(1)`;
    opacity = 1;
    zIndex = 100 - indexFromFront;
  } else {
    // Modo baraja colapsada: sobrepuestas una detrás de la otra
    if (indexFromFront === 0) {
      transform = "translate3d(0, 0px, 0) scale(1)";
      opacity = 1;
      zIndex = 50;
    } else if (indexFromFront === 1) {
      transform = "translate3d(0, 14px, 0) scale(0.95)";
      opacity = 0.9;
      zIndex = 40;
      cursor = "pointer";
    } else if (indexFromFront === 2) {
      transform = "translate3d(0, 26px, 0) scale(0.90)";
      opacity = 0.65;
      zIndex = 30;
      cursor = "pointer";
    } else {
      transform = "translate3d(0, 38px, 0) scale(0.85)";
      opacity = 0;
      zIndex = 20;
      pointerEvents = "none";
    }
  }

  return (
    <div
      ref={toastRef}
      onClick={() => {
        if (indexFromFront > 0 && !isHovered) {
          onBringToFront?.(id);
        }
      }}
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: "100%",
        zIndex,
        transform,
        opacity,
        pointerEvents,
        cursor,
        transformOrigin: "top center",
        transition: "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1)"
      }}
      className={`
        bg-white dark:bg-gray-900 ${currentConfig.borderColor}
        border-l-4 border-y border-r border-gray-200/90 dark:border-gray-800 rounded-2xl shadow-xl ${currentConfig.glowColor}
        select-none
      `}
    >
      <div className="p-3.5 sm:p-4 flex items-start gap-3">
        <div className={`shrink-0 ${currentConfig.iconColor} mt-0.5`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className={`font-bold text-sm ${currentConfig.titleColor} truncate`}>
              {typeof title === "string" ? title : (title && typeof title === "object" ? (title.title || title.message || JSON.stringify(title)) : (title ? String(title) : ""))}
            </h4>
            {indexFromFront === 0 && totalToasts > 1 && !isHovered && (
              <span
                className="shrink-0 text-[10px] font-black px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 shadow-xs"
                title="Pasa el cursor para ver todas las notificaciones"
              >
                +{totalToasts - 1}
              </span>
            )}
          </div>
          {typeof message === "string" && message.trim().length > 0 && (
            <p className={`text-xs sm:text-sm ${currentConfig.messageColor} mt-0.5 leading-snug line-clamp-2`}>
              {message}
            </p>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          className={`shrink-0 ${currentConfig.iconColor} hover:opacity-70 p-0.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
          aria-label="Cerrar"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      <div className={`h-1 ${currentConfig.bgColor} overflow-hidden rounded-b-2xl`}>
        <div
          className={`h-full bg-gradient-to-r ${currentConfig.iconColor.replace("text-", "from-")} to-transparent`}
          style={{
            animation: `shrink ${duration}ms linear forwards`,
            animationPlayState: indexFromFront === 0 && !isHovered ? "running" : "paused"
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

export function ToastContainer({ toasts, onClose, onBringToFront }) {
  const [isHovered, setIsHovered] = useState(false);
  const [heights, setHeights] = useState({});

  const handleHeightChange = useCallback((id, height) => {
    setHeights((prev) => (prev[id] === height ? prev : { ...prev, [id]: height }));
  }, []);

  if (typeof document === "undefined" || !toasts || toasts.length === 0) return null;

  // Notificación más reciente al frente
  const frontToasts = [...toasts].reverse();
  const frontToastId = frontToasts[0]?.id;

  // Cálculo de desplazamiento acumulado para el modo expandido
  let accOffset = 0;
  const offsetMap = {};
  for (let i = 0; i < frontToasts.length; i++) {
    const t = frontToasts[i];
    offsetMap[t.id] = accOffset;
    const h = heights[t.id] || 76;
    accOffset += h + 10;
  }
  const totalExpandedHeight = accOffset;
  const frontHeight = heights[frontToastId] || 76;
  const collapsedHeight = frontHeight + Math.min(frontToasts.length - 1, 2) * 14;

  return createPortal(
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 999999999,
        width: "380px",
        maxWidth: "calc(100vw - 32px)",
        height: `${isHovered ? totalExpandedHeight : collapsedHeight}px`,
        transition: "height 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        pointerEvents: "auto"
      }}
      className="fixed top-5 right-5"
    >
      {frontToasts.map((toast, index) => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          duration={toast.duration}
          onClose={onClose}
          indexFromFront={index}
          isHovered={isHovered}
          expandedOffset={offsetMap[toast.id] || 0}
          totalToasts={toasts.length}
          onBringToFront={onBringToFront}
          onHeightChange={handleHeightChange}
        />
      ))}
    </div>,
    document.body
  );
}
