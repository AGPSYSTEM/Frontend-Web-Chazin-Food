import { useState } from "react";

/**
 * StarRating – Componente de estrellas reutilizable.
 *
 * Props:
 *   value: número (1-5) o 0 si no hay rating
 *   onChange: función(n) — si se pasa, es interactivo
 *   size: "sm" | "md" | "lg" — tamaño de las estrellas
 *   showCount: boolean — si muestra el valor numérico junto a las estrellas
 *   count: número total de reseñas (para mostrar junto al promedio)
 *   readonly: boolean — modo solo lectura
 */
export function StarRating({
  value = 0,
  onChange,
  size = "md",
  showCount = false,
  count,
  readonly = false,
  className = ""
}) {
  const [hover, setHover] = useState(0);

  const isInteractive = !!onChange && !readonly;

  const sizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-7 h-7",
  };
  const starSize = sizes[size] || sizes.md;

  const textSizes = {
    xs: "text-[10px]",
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const active = isInteractive ? (hover || value) : value;

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= active;
        const halfFilled = !filled && star - 0.5 <= active;
        return (
          <button
            key={star}
            type="button"
            disabled={!isInteractive}
            onClick={() => isInteractive && onChange(star)}
            onMouseEnter={() => isInteractive && setHover(star)}
            onMouseLeave={() => isInteractive && setHover(0)}
            className={`transition-transform ${isInteractive ? "hover:scale-110 cursor-pointer" : "cursor-default"} focus:outline-none`}
            aria-label={`${star} estrella${star !== 1 ? "s" : ""}`}
          >
            <svg
              className={`${starSize} transition-colors duration-100`}
              viewBox="0 0 24 24"
              fill={filled ? "#f59e0b" : halfFilled ? "url(#half)" : "none"}
              stroke={filled || halfFilled ? "#f59e0b" : "#d1d5db"}
              strokeWidth="1.5"
              xmlns="http://www.w3.org/2000/svg"
            >
              {halfFilled && (
                <defs>
                  <linearGradient id="half" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="50%" stopColor="transparent" />
                  </linearGradient>
                </defs>
              )}
              <polygon
                points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
          </button>
        );
      })}

      {showCount && value > 0 && (
        <span className={`ml-1 font-bold text-amber-600 dark:text-amber-400 ${textSizes[size]}`}>
          {typeof value === "number" ? value.toFixed(1) : value}
          {count !== undefined && (
            <span className="font-normal text-gray-500 dark:text-gray-400 ml-0.5">
              ({count})
            </span>
          )}
        </span>
      )}
      {showCount && value === 0 && count !== undefined && count > 0 && (
        <span className={`ml-1 text-gray-400 ${textSizes[size]}`}>{count} reseñas</span>
      )}
    </div>
  );
}

export default StarRating;
