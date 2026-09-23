import React from 'react';
import { ChazinLoader } from './ChazinLoader';

/**
 * LoadingSpinner oficial de Chazin Food
 * Potenciado con ChazinLoader (animación física Slime de Minecraft, transparente y con soporte Dark/Light)
 */
const LoadingSpinner = ({ text = "CARGANDO DELICIAS", fullScreen = false, size = fullScreen ? "lg" : "md", className = "" }) => {
  return (
    <ChazinLoader
      fullScreen={fullScreen}
      text={text}
      size={size}
      className={className}
    />
  );
};

export { ChazinLoader };
export default LoadingSpinner;
