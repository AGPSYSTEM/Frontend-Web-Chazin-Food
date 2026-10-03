import React from "react";
import emblemSvg from "@/shared/assets/chazin_emblem.svg";

/**
 * Emblema oficial Chazin Food (Iconografía y marca registrada)
 * Renderiza el isotipo vectorial cuadrado redondeado con el script y gafas burger.
 */
export function ChazinEmblem({
  size = 24,
  className = "",
  alt = "Chazin Food",
  style = {},
  ...props
}) {
  return (
    <img
      src={emblemSvg}
      alt={alt}
      width={size}
      height={size}
      className={`inline-block shrink-0 object-contain select-none ${className}`}
      style={{
        width: typeof size === "number" ? `${size}px` : size,
        height: typeof size === "number" ? `${size}px` : size,
        ...style
      }}
      {...props}
    />
  );
}

export default ChazinEmblem;
