import React, { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { CheckCircle, XCircle, AlertTriangle, Info, X, Layers } from "lucide-react";

export function Toast({
  id,
  type,
  title,
  message,
  duration = 4000,
  onClose,
  indexFromFront = 0,
  isHovered = false,
  totalToasts = 1,
  onBringToFront,
  onNextToast,
  onHeightChange
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const toastRef = useRef(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setIsMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Medir altura de la tarjeta para el contenedor
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

  // Temporizador de auto-cierre: corre únicamente cuando la tarjeta está al frente y sin hover
  useEffect(() => {
    if (duration <= 0 || isHovered || isLeaving) return;
    if (indexFromFront !== 0) return;

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

  // Cálculo de transformación 3D: SIEMPRE sobrepuestas una detrás de otra (baraja)
  let transform = "translate3d(0, 0, 0)";
  let opacity = 1;
  let zIndex = 50 - indexFromFront;
  let pointerEvents = "auto";
  let cursor = "default";
  let filter = "none";
  let shadow = "shadow-xl";

  if (isLeaving || !isMounted) {
    transform = "translateX(120%)";
    opacity = 0;
  } else {
    // Modo baraja: superpuestas una detrás de la otra
    if (indexFromFront === 0) {
      transform = "translate3d(0, 0px, 0) scale(1)";
      opacity = 1;
      zIndex = 50;
      shadow = "shadow-2xl";
    } else if (indexFromFront === 1) {
      const yOffset = isHovered ? 16 : 10;
      transform = `translate3d(0, ${yOffset}px, 0) scale(0.96)`;
      opacity = 0.92;
      zIndex = 40;
      cursor = "pointer";
      filter = "brightness(0.96)";
      shadow = "shadow-lg";
    } else if (indexFromFront === 2) {
      const yOffset = isHovered ? 30 : 20;
      transform = `translate3d(0, ${yOffset}px, 0) scale(0.92)`;
      opacity = 0.78;
      zIndex = 30;
      cursor = "pointer";
      filter = "brightness(0.92)";
      shadow = "shadow-md";
    } else {
      transform = "translate3d(0, 28px, 0) scale(0.88)";
      opacity = 0;
      zIndex = 20;
      pointerEvents = "none";
    }
  }

  return (
    <div
      ref={toastRef}
      onClick={() => {
        if (indexFromFront > 0) {
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
        filter,
        transformOrigin: "top center",
        transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), filter 0.3s ease"
      }}
      className={`
        bg-white dark:bg-gray-900 ${currentConfig.borderColor}
        border-l-4 border-y border-r border-gray-200/90 dark:border-gray-800 rounded-2xl ${shadow} ${currentConfig.glowColor}
        select-none overflow-hidden
      `}
    >
      <div className="p-3.5 sm:p-4 flex items-start gap-3">
        <div className={`shrink-0 ${currentConfig.iconColor} mt-0.5`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className={`font-bold text-sm ${currentConfig.titleColor} truncate`}>
              {typeof title === "string" ? title : (title && typeof title === "object" ? (title.title || title.message || JSON.stringify(title)) : (title ? String(title) : ""))}
            </h4>
            
            {/* Indicador de baraja cuando hay múltiples notificaciones */}
            {indexFromFront === 0 && totalToasts > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNextToast?.();
                }}
                className="shrink-0 text-[10px] font-black px-2 py-0.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 shadow-xs flex items-center gap-1 transition cursor-pointer"
                title="Haz clic para ver la siguiente notificación detrás"
              >
                <Layers className="w-3 h-3 text-[#A91B2E] dark:text-red-400" />
                <span>1 de {totalToasts}</span>
              </button>
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
          className={`shrink-0 ${currentConfig.iconColor} hover:opacity-70 p-0.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer`}
          aria-label="Cerrar notificación"
          title="Cerrar"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Barra de progreso de tiempo de vida */}
      <div className={`h-1.5 ${currentConfig.bgColor} overflow-hidden rounded-b-2xl`}>
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
  const frontHeight = heights[frontToastId] || 76;
  const stackOffset = Math.min(frontToasts.length - 1, 2) * (isHovered ? 16 : 10);
  const containerHeight = frontHeight + stackOffset + 8;

  const handleNextToast = () => {
    if (frontToasts.length > 1) {
      // Mover la frontal al final de toasts (lo que la manda al fondo de la baraja)
      onBringToFront?.(frontToasts[1].id);
    }
  };

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
        height: `${containerHeight}px`,
        transition: "height 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        pointerEvents: "none"
      }}
      className="fixed top-5 right-5 pointer-events-none"
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
          totalToasts={toasts.length}
          onBringToFront={onBringToFront}
          onNextToast={handleNextToast}
          onHeightChange={handleHeightChange}
        />
      ))}
    </div>,
    document.body
  );
}
