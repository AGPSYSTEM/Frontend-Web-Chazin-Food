import React from "react";
import emblemWebp from "@/shared/assets/chazin_emblem.webp";

/**
 * Emblema oficial Chazin Food (Iconografía y marca registrada)
 * Renderiza el isotipo vectorial cuadrado redondeado con el script y gafas burger.
 */
export function ChazinEmblem({
  size = 24,
  className = "",
  alt = "Chazin Food",
  loading = "lazy",
  decoding = "async",
  style = {},
  ...props
}) {
  return (
    <img
      src={emblemWebp}
      alt={alt}
      width={size}
      height={size}
      loading={loading}
      decoding={decoding}
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
