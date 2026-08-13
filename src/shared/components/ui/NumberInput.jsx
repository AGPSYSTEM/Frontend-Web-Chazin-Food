import { useRef } from "react";

/**
 * Clean NumberInput component that renders solid triangle arrows (▲ ▼) matching reference design.
 * Provides custom stepUp/stepDown triggers that work 100% reliably across all browsers/OS
 * without gray boxes, circles, or platform GTK issues.
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
  ...props
}) {
  const inputRef = useRef(null);

  const handleStep = (direction) => {
    if (inputRef.current) {
      if (direction === "up") {
        inputRef.current.stepUp();
      } else {
        inputRef.current.stepDown();
      }
      if (onChange) {
        onChange({
          target: {
            value: inputRef.current.value,
            name: props.name || ""
          }
        });
      }
    }
  };

  return (
    <div className="relative flex items-center w-full">
      <input
        ref={inputRef}
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`${className} pr-7`}
        {...props}
      />
      <div className="absolute right-2 flex flex-col items-center justify-center select-none z-10 gap-[2px]">
        <button
          type="button"
          tabIndex="-1"
          onClick={() => handleStep("up")}
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
          onClick={() => handleStep("down")}
          className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100 p-0.5 leading-none transition-colors"
          title="Decrementar"
        >
          <svg width="9" height="5" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 6L0 0H10L5 6Z" fill="currentColor" />
          </svg>
        </button>
      </div>
    </div>
  );
}
