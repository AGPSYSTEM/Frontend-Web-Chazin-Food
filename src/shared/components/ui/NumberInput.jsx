import { useRef, useState } from "react";
import { formatMilesCOP, parseMilesCOP } from "@/shared/utils/validationUtils";

/**
 * Clean NumberInput component that renders solid triangle arrows (▲ ▼) matching reference design.
 * - Blocks scientific notation / sign keys ('e', 'E', '+', '-') on keydown & sanitizes paste (Ítem #78).
 * - Supports optional `formatThousands` for Colombian COP thousand separators e.g. 15.000 (Ítem #111).
 */
export function NumberInput({
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  className = "",
  placeholder = "",
  required = false,
  formatThousands = false,
  allowDecimals = false,
  onKeyDown,
  onPaste,
  ...props
}) {
  const inputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const allowNegative = Number(min) < 0;

  const emitChange = (nextVal) => {
    if (onChange) {
      onChange({
        target: {
          value: nextVal,
          name: props.name || ""
        }
      });
    }
  };

  const handleStep = (direction) => {
    if (props.disabled || props.readOnly) return;

    if (formatThousands) {
      const current = value === "" || value === null || value === undefined ? 0 : Number(value);
      const safeCurrent = Number.isFinite(current) ? current : 0;
      const stepNum = Number(step) > 0 ? Number(step) : 1;
      let next = direction === "up" ? safeCurrent + stepNum : safeCurrent - stepNum;
      if (min !== undefined && min !== "" && next < Number(min)) next = Number(min);
      if (max !== undefined && max !== "" && next > Number(max)) next = Number(max);
      next = allowDecimals ? Number(next.toFixed(2)) : Math.round(next);
      emitChange(String(next));
      return;
    }

    if (inputRef.current) {
      if (direction === "up") {
        inputRef.current.stepUp();
      } else {
        inputRef.current.stepDown();
      }
      emitChange(inputRef.current.value);
    }
  };

  const handleKeyDownInternal = (e) => {
    const blockedKeys = allowNegative ? ["e", "E", "+"] : ["e", "E", "+", "-"];
    if (blockedKeys.includes(e.key)) {
      e.preventDefault();
      return;
    }
    if (formatThousands && e.key === "ArrowUp") {
      e.preventDefault();
      handleStep("up");
      return;
    }
    if (formatThousands && e.key === "ArrowDown") {
      e.preventDefault();
      handleStep("down");
      return;
    }
    if (onKeyDown) onKeyDown(e);
  };

  const handlePasteInternal = (e) => {
    const pasted = e.clipboardData?.getData("text") ?? "";
    if (formatThousands) {
      e.preventDefault();
      const cleaned = parseMilesCOP(pasted, allowDecimals);
      if (max !== undefined && max !== "" && cleaned !== "" && Number(cleaned) > Number(max)) {
        emitChange(String(max));
      } else {
        emitChange(cleaned);
      }
      return;
    }

    if (/[eE+]/.test(pasted) || (!allowNegative && /-/.test(pasted))) {
      e.preventDefault();
      const regex = allowNegative ? /[^0-9.-]/g : /[^0-9.]/g;
      const sanitized = pasted.replace(/,/g, ".").replace(regex, "");
      const parts = sanitized.split(".");
      const normalized = parts.length > 1 ? `${parts[0]}.${parts.slice(1).join("")}` : parts[0];
      emitChange(normalized);
      return;
    }
    if (onPaste) onPaste(e);
  };

  const handleFormattedChange = (e) => {
    const cleaned = parseMilesCOP(e.target.value, allowDecimals);
    if (max !== undefined && max !== "" && cleaned !== "" && Number(cleaned) > Number(max)) {
      emitChange(String(max));
      return;
    }
    emitChange(cleaned);
  };

  const displayValue = formatThousands
    ? formatMilesCOP(value, allowDecimals)
    : (value ?? "");

  return (
    <div
      className="relative flex items-center w-full"
      onFocus={() => setIsFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setIsFocused(false);
        }
      }}
    >
      <input
        ref={inputRef}
        type={formatThousands ? "text" : "number"}
        inputMode={formatThousands ? (allowDecimals ? "decimal" : "numeric") : undefined}
        min={formatThousands ? undefined : min}
        max={formatThousands ? undefined : max}
        step={formatThousands ? undefined : step}
        value={displayValue}
        onChange={formatThousands ? handleFormattedChange : onChange}
        onKeyDown={handleKeyDownInternal}
        onPaste={handlePasteInternal}
        placeholder={placeholder}
        required={required}
        className={`${className} pr-7`}
        {...props}
      />
      {isFocused && !props.disabled && !props.readOnly && (
        <div className="absolute right-2 flex flex-col items-center justify-center select-none z-10 gap-[2px]">
          <button
            type="button"
            tabIndex="-1"
            onMouseDown={(e) => { e.preventDefault(); handleStep("up"); }}
            className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100 p-0.5 leading-none transition-colors"
            title="Incrementar"
          >
            <svg width="9" height="5" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 0L10 6H0L5 0Z" fill="currentColor" />
            </svg>
          </button>
          <button
            type="button"
            tabIndex="-1"
            onMouseDown={(e) => { e.preventDefault(); handleStep("down"); }}
            className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100 p-0.5 leading-none transition-colors"
            title="Decrementar"
          >
            <svg width="9" height="5" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 6L0 0H10L5 6Z" fill="currentColor" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

export default NumberInput;
